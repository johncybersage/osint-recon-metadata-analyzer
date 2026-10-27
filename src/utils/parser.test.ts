/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidIPv4,
  classifyIP,
  extractIPs,
  extractEmails,
  inferEmailNamingPattern,
  extractSensitiveFiles,
  extractDomains,
  analyzeReconDump,
  generateReconCsv,
} from './parser';

test('Rule 2 (IP Validation): rejects invalid IPv4 addresses and versions', () => {
  // Invalid octets
  assert.equal(isValidIPv4('1.2.3.400'), false);
  assert.equal(isValidIPv4('256.0.0.1'), false);
  assert.equal(isValidIPv4('192.168.1.999'), false);
  assert.equal(isValidIPv4('1.2.3'), false);
  assert.equal(isValidIPv4('1.2.3.4.5'), false);

  // Valid octets
  assert.equal(isValidIPv4('10.0.0.1'), true);
  assert.equal(isValidIPv4('192.168.1.254'), true);
  assert.equal(isValidIPv4('172.16.50.4'), true);
  assert.equal(isValidIPv4('8.8.8.8'), true);
});

test('Rule 2 (IP Classification): properly tags internal vs external IPs', () => {
  assert.equal(classifyIP('10.10.5.1').type, 'internal');
  assert.equal(classifyIP('192.168.0.1').type, 'internal');
  assert.equal(classifyIP('172.16.0.5').type, 'internal');
  assert.equal(classifyIP('172.31.255.254').type, 'internal');
  assert.equal(classifyIP('127.0.0.1').type, 'internal');

  // External
  assert.equal(classifyIP('172.32.0.1').type, 'external');
  assert.equal(classifyIP('1.1.1.1').type, 'external');
  assert.equal(classifyIP('198.51.100.22').type, 'external');
});

test('Rule 2 (IP Extraction): ignores version numbers like v1.2.3.400 in text dumps', () => {
  const text = `
    Server upgraded to version v1.2.3.400 in cluster.
    Host connecting from 192.168.1.50 and gateway 10.0.0.1.
    External webhook received from 203.0.113.15.
    False positive check: v2.4.1.99 and 999.888.777.666.
  `;
  const extracted = extractIPs(text);
  const ips = extracted.map(i => i.ip);

  assert.ok(ips.includes('192.168.1.50'), 'Must include 192.168.1.50');
  assert.ok(ips.includes('10.0.0.1'), 'Must include 10.0.0.1');
  assert.ok(ips.includes('203.0.113.15'), 'Must include 203.0.113.15');
  assert.ok(!ips.includes('1.2.3.400'), 'Must reject 1.2.3.400');
  assert.ok(!ips.includes('999.888.777.666'), 'Must reject 999.888.777.666');
});

test('Rule 1 & Rule 4 (Email Deduplication & Pattern Inference)', () => {
  const text = `
    Emails list:
    john.doe@corp.example.com
    JOHN.DOE@corp.example.com
    sarah.connor@corp.example.com
    marcus.vance@corp.example.com
    
    Secondary team:
    asmith@defense.org
    bwayne@defense.org
    ckent@defense.org
  `;

  const emails = extractEmails(text);
  // Case-insensitive deduplication
  const corpEmails = emails.filter(e => e.domain === 'corp.example.com');
  assert.equal(corpEmails.length, 3, 'john.doe should be deduplicated once');
  const john = corpEmails.find(e => e.email === 'john.doe@corp.example.com');
  assert.equal(john?.occurrences, 2);

  // Pattern inference
  const corpPattern = inferEmailNamingPattern(corpEmails.map(e => e.localPart), 'corp.example.com');
  assert.equal(corpPattern.pattern, 'firstname.lastname@corp.example.com');

  const defenseEmails = emails.filter(e => e.domain === 'defense.org');
  const defensePattern = inferEmailNamingPattern(defenseEmails.map(e => e.localPart), 'defense.org');
  assert.equal(defensePattern.pattern, 'flastname@defense.org');
});

test('Rule 3 (Sensitive Files & Dorks): identifies target extensions and categories', () => {
  const text = `
    Found leaked docs:
    https://target.com/docs/q4_report.pdf
    https://files.target.com/confidential/payroll.xlsx
    /var/www/html/.env
    backup database: db_dump_2026.sql
    legacy archive: system_backup.bak
    config file: nginx.config
    notes: passwords.txt
  `;

  const files = extractSensitiveFiles(text);
  const extensions = files.map(f => f.extension);

  assert.ok(extensions.includes('.pdf'));
  assert.ok(extensions.includes('.xlsx'));
  assert.ok(extensions.includes('.env'));
  assert.ok(extensions.includes('.sql'));
  assert.ok(extensions.includes('.bak'));
  assert.ok(extensions.includes('.config'));
  assert.ok(extensions.includes('.txt'));

  const sqlFile = files.find(f => f.extension === '.sql');
  assert.equal(sqlFile?.category, 'Database & Backups');

  const envFile = files.find(f => f.extension === '.env');
  assert.equal(envFile?.category, 'Configuration & Secrets');
});

test('Rule 1 & Domain Extraction: rejects email localparts and non-domain web extensions', () => {
  const text = `
    Executive: alice.morgan@global-ops.net
    Target web: https://vpn.apex-defense.io/portal/login.aspx
    Infrastructure: dev-api.sentinel-cyber.com, ns1.apex-defense.io
    File leak: payroll.xlsx
  `;
  const emails = extractEmails(text);
  const domains = extractDomains(text, emails);
  const domainNames = domains.map(d => d.domain);

  assert.ok(domainNames.includes('global-ops.net'), 'Must include global-ops.net');
  assert.ok(domainNames.includes('vpn.apex-defense.io'), 'Must include vpn.apex-defense.io');
  assert.ok(domainNames.includes('dev-api.sentinel-cyber.com'), 'Must include dev-api.sentinel-cyber.com');
  assert.ok(!domainNames.includes('alice.morgan'), 'Must reject email localpart alice.morgan');
  assert.ok(!domainNames.includes('login.aspx'), 'Must reject web script login.aspx');
  assert.ok(!domainNames.includes('payroll.xlsx'), 'Must reject document extension payroll.xlsx');
});

test('Rule 5 (Empty states) & Full Analysis workflow', () => {
  const emptyAnalysis = analyzeReconDump('No reconnaissance tokens here!');
  assert.equal(emptyAnalysis.ips.length, 0);
  assert.equal(emptyAnalysis.allEmails.length, 0);
  assert.equal(emptyAnalysis.sensitiveFiles.length, 0);
  assert.equal(emptyAnalysis.metrics.totalIps, 0);

  const csv = generateReconCsv(emptyAnalysis);
  assert.ok(csv.includes('"Category","Artifact Value"'));
});
