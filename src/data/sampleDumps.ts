/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SampleDumpPreset {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const PRIMARY_SAMPLE_DUMP = `[+] OSINT Harvest & Reconnaissance Session: Target Apex Global Systems
[*] Ingestion Source: Multi-source feed (FOCA metadata, Apache edge logs, SearchDiggity Google Dorks)
[*] Timestamp: 2026-10-26T21:42:00Z
[*] Target Root Domains: apex-defense.io, sentinel-cyber.com, global-ops.net

--- SECTION 1: INGRESS LOGS & INTERNAL GATEWAYS ---
10.0.4.15 - - [26/Oct/2026:20:11:04 +0000] "GET /api/v2/telemetry HTTP/1.1" 200 4823 "https://vpn.apex-defense.io" "Mozilla/5.0 (X11; Linux x86_64)"
192.168.1.105 - - [26/Oct/2026:20:11:05 +0000] "POST /auth/ldap HTTP/1.1" 401 532 "https://auth.apex-defense.io" "Python-requests/2.31.0"
172.24.18.2 - - [26/Oct/2026:20:11:09 +0000] "GET /internal/cluster-status HTTP/1.1" 200 1204
127.0.0.1 - - [26/Oct/2026:20:11:10 +0000] "HEAD /healthz HTTP/1.1" 200 0
203.0.113.195 - - [26/Oct/2026:20:12:44 +0000] "GET /portal/login.aspx HTTP/1.1" 200 15201 "https://portal.apex-defense.io"
198.51.100.42 - - [26/Oct/2026:20:13:02 +0000] "CONNECT staging-gateway.sentinel-cyber.com:443 HTTP/1.1" 200 8943
10.250.0.88 - - [26/Oct/2026:20:14:15 +0000] "POST /api/v1/sync HTTP/1.1" 202 312
172.16.8.99 - - [26/Oct/2026:20:15:30 +0000] "GET /metrics HTTP/1.1" 200 9821
# Cluster Node Health Check: Node daemon running v1.4.2.500 (ignore non-IP version strings)
# Secondary Gateway Build v2.1.0.800 deployed by engineering team

--- SECTION 2: FOCA EXTRACTED METADATA & SENSITIVE ASSETS ---
Document Author: Marcus Vance (marcus.vance@apex-defense.io)
Software: Microsoft Office Word 2021
File Path: https://apex-defense.io/downloads/public/Whitepaper_ZeroTrust_Architecture.pdf

Document Author: Elena Rostova (elena.rostova@apex-defense.io)
Software: LibreOffice 7.4
Found URL: https://s3.amazonaws.com/apex-corp-staging/prod_backup_2026_q3.sql
Found URL: https://vpn.apex-defense.io/portal/vpn_client_setup_guide.docx

Metadata Leak from file: Q3_Executive_Compensation.xlsx
Author: David Kim (david.kim@apex-defense.io)
Comments: Draft spreadsheet with audited contractor pay scales.

Exposed Secrets & Dorks via SearchDiggity:
target site:dev-api.sentinel-cyber.com
URL: https://dev-api.sentinel-cyber.com/config/.env
URL: https://dev-api.sentinel-cyber.com/backup/database_dump.bak
URL: https://cloud-storage.global-ops.net/exports/employee_payroll_2026.csv
Config: /etc/nginx/sites-available/production_cluster.config
Notes: https://apex-defense.io/compliance/audit_report_2026.txt

--- SECTION 3: CORPORATE PERSONNEL & EMAIL HARVESTING ---
Executive Contact Records (Sentinel Cyber Labs):
  * Chief Architect: Johnathan Smith (jsmith@sentinel-cyber.com)
  * Security Researcher: Tara Connor (tconnor@sentinel-cyber.com)
  * SOC Director: Michael Reese (mreese@sentinel-cyber.com)
  * Ingestion repeated notice: Contact JSMITH@SENTINEL-CYBER.COM for escalation

Global Ops Logistics (Third-Party Contractor):
  * Operation Lead: Alice Morgan (alice.morgan@global-ops.net)
  * Logistics Dispatcher: Brian Miller (brian.miller@global-ops.net)
  * Compliance Officer: Clara Oswald (clara.oswald@global-ops.net)

Duplicate Email Verification:
  * marcus.vance@apex-defense.io (Engineering Lead)
  * MARCUS.VANCE@apex-defense.io (Listed in directory footer)

--- SECTION 4: DISCOVERED HOSTNAMES & INFRASTRUCTURE ---
- DNS NS: ns1.apex-defense.io, ns2.apex-defense.io
- Mail Server: mail.sentinel-cyber.com (Port 25/587)
- Dev Subdomain: dev-api.sentinel-cyber.com
- Identity Portal: auth.apex-defense.io
- S3 Bucket: s3.amazonaws.com
- Partner FTP: ftp.global-ops.net
- Staging Router: staging-gateway.sentinel-cyber.com
`;

export const PRESET_SAMPLES: SampleDumpPreset[] = [
  {
    id: 'primary',
    name: 'Full Recon Dump (Recommended)',
    description: 'Comprehensive mix of internal/external IPs, corporate emails, sensitive documents, and subdomains.',
    content: PRIMARY_SAMPLE_DUMP,
  },
  {
    id: 'server-logs',
    name: 'Apache & SSH Access Logs',
    description: 'Ingress and firewall logs with private 10.x/192.168.x/172.x subnets, public IPs, and service paths.',
    content: `Aug 14 09:22:15 edge-gw01 sshd[4012]: Failed password for invalid user admin from 198.51.100.14 port 54122 ssh2
Aug 14 09:22:18 edge-gw01 sshd[4014]: Accepted publickey for secops from 10.12.4.99 port 41200 ssh2
Aug 14 09:25:01 web-node-03 nginx: 192.168.10.45 - - [14/Aug/2026:09:25:01 +0000] "GET /admin/db_export.sql HTTP/1.1" 403 162
Aug 14 09:25:04 web-node-03 nginx: 172.18.0.5 - - [14/Aug/2026:09:25:04 +0000] "GET /metrics/health HTTP/1.1" 200 52
Aug 14 09:25:40 web-node-03 nginx: 203.0.113.88 - - [14/Aug/2026:09:25:40 +0000] "POST /api/v1/auth HTTP/1.1" 200 412
Server software version string: kernel-v5.15.0.900 (should not be treated as an IP)
Contact sysadmin: devops.lead@infosec-hub.org, alex.turner@infosec-hub.org`,
  },
  {
    id: 'google-dorks',
    name: 'Google Dorking & FOCA Export',
    description: 'Leaked configurations (.env), database exports (.sql, .bak), and confidential spreadsheets.',
    content: `Search Query: filetype:env site:target-group.com
Result 1: https://backend.target-group.com/staging/.env
Result 2: https://static.target-group.com/assets/database_backup_may.sql
Result 3: https://portal.target-group.com/docs/employee_directory.xlsx
Result 4: https://cdn.target-group.com/files/system_restore_point.bak
Result 5: https://internal.target-group.com/configs/proxy_rules.config
Result 6: https://target-group.com/downloads/annual_governance.pdf

Discovered contacts from document author metadata:
- hr@target-group.com
- finance@target-group.com
- security@target-group.com
- audit.lead@target-group.com`,
  },
];
