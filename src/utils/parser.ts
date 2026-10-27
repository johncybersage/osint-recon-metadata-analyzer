/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExtractedIP {
  ip: string;
  type: 'internal' | 'external';
  classification: string;
  occurrences: number;
}

export interface ExtractedEmail {
  email: string;
  localPart: string;
  domain: string;
  occurrences: number;
}

export interface DomainEmailGroup {
  domain: string;
  emails: ExtractedEmail[];
  inferredPattern: string;
  patternExample: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface SensitiveFile {
  name: string;
  extension: string;
  category: 'Database & Backups' | 'Configuration & Secrets' | 'Documents' | 'Spreadsheets & Data';
  fullMatch: string;
  isUrl: boolean;
  occurrences: number;
}

export interface ExtractedDomain {
  domain: string;
  rootDomain: string;
  isSubdomain: boolean;
  occurrences: number;
}

export interface ReconMetrics {
  totalIps: number;
  internalIps: number;
  externalIps: number;
  uniqueEmails: number;
  domainGroupsCount: number;
  sensitiveFilesCount: number;
  uniqueDomainsCount: number;
  rootDomainsCount: number;
}

export interface ReconAnalysisResult {
  ips: ExtractedIP[];
  emailGroups: DomainEmailGroup[];
  allEmails: ExtractedEmail[];
  sensitiveFiles: SensitiveFile[];
  domains: ExtractedDomain[];
  metrics: ReconMetrics;
  rawTextLength: number;
  processedAt: string;
}

/**
 * Validates whether 4 octets form a legitimate IPv4 address (0-255 each)
 */
export function isValidIPv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return false;
    const num = Number(part);
    if (num < 0 || num > 255) return false;
    // Disallow leading zeros for multi-digit octets like 012 or 001
    if (part.length > 1 && part.startsWith('0')) return false;
  }
  return true;
}

/**
 * Checks if an IP is an internal/private address (RFC 1918 + loopback + link-local)
 */
export function classifyIP(ip: string): { type: 'internal' | 'external'; label: string } {
  const parts = ip.split('.').map(Number);
  const [a, b] = parts;

  // 10.0.0.0 - 10.255.255.255 (RFC 1918)
  if (a === 10) {
    return { type: 'internal', label: 'Internal Network (10.0.0.0/8)' };
  }

  // 172.16.0.0 - 172.31.255.255 (RFC 1918)
  if (a === 172 && b >= 16 && b <= 31) {
    return { type: 'internal', label: 'Internal Network (172.16.0.0/12)' };
  }

  // 192.168.0.0 - 192.168.255.255 (RFC 1918)
  if (a === 192 && b === 168) {
    return { type: 'internal', label: 'Internal Network (192.168.0.0/16)' };
  }

  // 127.0.0.0/8 (Loopback)
  if (a === 127) {
    return { type: 'internal', label: 'Internal Loopback (127.0.0.0/8)' };
  }

  // 169.254.0.0/16 (Link-Local)
  if (a === 169 && b === 254) {
    return { type: 'internal', label: 'Internal Link-Local (169.254.0.0/16)' };
  }

  return { type: 'external', label: 'External Public IP' };
}

/**
 * Extracts valid IPv4 addresses and discards version numbers like v1.2.3.400
 */
export function extractIPs(text: string): ExtractedIP[] {
  // Matches 4-part numeric sequences
  // Avoid preceding characters like 'v', letters, or extra dots (e.g., v1.2.3.4, 10.1.2.3.4)
  // Avoid trailing dots followed by digits (e.g. 1.2.3.4.5)
  const regex = /(?<![a-zA-Z0-9.])(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?!\.\d|[a-zA-Z0-9])/g;
  const ipCounts = new Map<string, number>();

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const candidate = match[1];
    if (isValidIPv4(candidate)) {
      ipCounts.set(candidate, (ipCounts.get(candidate) || 0) + 1);
    }
  }

  const results: ExtractedIP[] = [];
  for (const [ip, occurrences] of ipCounts.entries()) {
    const { type, label } = classifyIP(ip);
    results.push({
      ip,
      type,
      classification: label,
      occurrences,
    });
  }

  // Sort internal first, then by IP
  return results.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'internal' ? -1 : 1;
    }
    return a.ip.localeCompare(b.ip, undefined, { numeric: true });
  });
}

/**
 * Extracts and deduplicates email addresses (case-insensitive deduplication)
 */
export function extractEmails(text: string): ExtractedEmail[] {
  const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailCounts = new Map<string, { original: string; occurrences: number; localPart: string; domain: string }>();

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    const lower = raw.toLowerCase();
    const [localPart, domain] = lower.split('@');

    if (!localPart || !domain) continue;

    const existing = emailCounts.get(lower);
    if (existing) {
      existing.occurrences += 1;
    } else {
      emailCounts.set(lower, {
        original: lower,
        occurrences: 1,
        localPart,
        domain,
      });
    }
  }

  return Array.from(emailCounts.values()).map(item => ({
    email: item.original,
    localPart: item.localPart,
    domain: item.domain,
    occurrences: item.occurrences,
  }));
}

/**
 * Infers an organization's email naming pattern from a list of localParts
 */
export function inferEmailNamingPattern(localParts: string[], domain: string): { pattern: string; example: string; confidence: 'High' | 'Medium' | 'Low' } {
  if (localParts.length === 0) {
    return { pattern: 'Unknown', example: `user@${domain}`, confidence: 'Low' };
  }

  let dotCount = 0;
  let underscoreCount = 0;
  let hyphenCount = 0;
  let firstInitialLastCount = 0;
  let singleWordCount = 0;

  for (const lp of localParts) {
    if (lp.includes('.')) {
      dotCount++;
    } else if (lp.includes('_')) {
      underscoreCount++;
    } else if (lp.includes('-')) {
      hyphenCount++;
    } else if (/^[a-z][a-z]{3,}$/.test(lp)) {
      // Single letter followed by 3+ letters (e.g. jdoe, asmith, tconnor)
      firstInitialLastCount++;
    } else {
      singleWordCount++;
    }
  }

  const total = localParts.length;

  if (dotCount / total >= 0.5) {
    // Check if it's f.last or first.last
    const isSingleCharBeforeDot = localParts.some(lp => {
      const parts = lp.split('.');
      return parts.length > 0 && parts[0].length === 1;
    });

    if (isSingleCharBeforeDot) {
      return {
        pattern: 'f.lastname@' + domain,
        example: `j.doe@${domain}`,
        confidence: total > 2 ? 'High' : 'Medium',
      };
    }
    return {
      pattern: 'firstname.lastname@' + domain,
      example: `john.doe@${domain}`,
      confidence: total > 2 ? 'High' : 'Medium',
    };
  }

  if (firstInitialLastCount / total >= 0.5) {
    return {
      pattern: 'flastname@' + domain,
      example: `jdoe@${domain}`,
      confidence: total > 2 ? 'High' : 'Medium',
    };
  }

  if (underscoreCount / total >= 0.5) {
    return {
      pattern: 'firstname_lastname@' + domain,
      example: `john_doe@${domain}`,
      confidence: total > 2 ? 'High' : 'Medium',
    };
  }

  if (hyphenCount / total >= 0.5) {
    return {
      pattern: 'firstname-lastname@' + domain,
      example: `john-doe@${domain}`,
      confidence: total > 2 ? 'High' : 'Medium',
    };
  }

  if (singleWordCount / total >= 0.5) {
    return {
      pattern: 'firstname@' + domain,
      example: `john@${domain}`,
      confidence: 'Medium',
    };
  }

  return {
    pattern: 'mixed / customized',
    example: `user@${domain}`,
    confidence: 'Low',
  };
}

/**
 * Groups emails by domain and applies pattern inference
 */
export function groupEmailsByDomain(emails: ExtractedEmail[]): DomainEmailGroup[] {
  const groups = new Map<string, ExtractedEmail[]>();

  for (const email of emails) {
    const list = groups.get(email.domain) || [];
    list.push(email);
    groups.set(email.domain, list);
  }

  const result: DomainEmailGroup[] = [];

  for (const [domain, domainEmails] of groups.entries()) {
    const localParts = domainEmails.map(e => e.localPart);
    const { pattern, example, confidence } = inferEmailNamingPattern(localParts, domain);

    result.push({
      domain,
      emails: domainEmails.sort((a, b) => a.email.localeCompare(b.email)),
      inferredPattern: pattern,
      patternExample: example,
      confidence,
    });
  }

  return result.sort((a, b) => b.emails.length - a.emails.length);
}

/**
 * Extracts sensitive files and dork targets (.pdf, .doc, .docx, .xls, .xlsx, .csv, .txt, .sql, .bak, .env, .config)
 */
export function extractSensitiveFiles(text: string): SensitiveFile[] {
  // Target extensions from requirements:
  // .pdf, .doc, .docx, .xls, .xlsx, .csv, .txt, .sql, .bak, .env, .config
  // Also common high-value secrets: .conf, .key, .pem
  const fileRegex = /(?:https?:\/\/[^\s"'<>)\]]+|(?:[a-zA-Z0-9_\-./\\]+)?(?:\.env|\b[a-zA-Z0-9_\-.]+\.(?:pdf|docx?|xlsx?|csv|txt|sql|bak|config|conf|key|pem)))(?=[^a-zA-Z0-9_]|$)/gi;

  const matchesMap = new Map<string, { raw: string; count: number; name: string; ext: string; isUrl: boolean }>();

  let match: RegExpExecArray | null;
  while ((match = fileRegex.exec(text)) !== null) {
    let full = match[0].trim();
    // Clean trailing punctuation if matched carelessly
    full = full.replace(/[.,;:'"<>()[\]]+$/, '');
    if (!full) continue;

    const isUrl = /^https?:\/\//i.test(full);

    // Extract filename and extension
    let filename = full;
    if (isUrl) {
      try {
        const urlObj = new URL(full);
        const pathname = urlObj.pathname;
        const lastSlash = pathname.lastIndexOf('/');
        filename = lastSlash !== -1 ? pathname.substring(lastSlash + 1) : full;
      } catch {
        const lastSlash = full.lastIndexOf('/');
        filename = lastSlash !== -1 ? full.substring(lastSlash + 1) : full;
      }
    } else {
      const lastSlash = Math.max(full.lastIndexOf('/'), full.lastIndexOf('\\'));
      if (lastSlash !== -1) {
        filename = full.substring(lastSlash + 1);
      }
    }

    if (!filename) continue;

    // Determine extension
    let ext = '';
    if (filename.toLowerCase().endsWith('.env') || filename.toLowerCase() === '.env') {
      ext = 'env';
    } else {
      const dotIndex = filename.lastIndexOf('.');
      if (dotIndex !== -1) {
        ext = filename.substring(dotIndex + 1).toLowerCase();
      }
    }

    const validExtensions = new Set([
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'sql', 'bak', 'env', 'config', 'conf', 'key', 'pem'
    ]);

    if (!validExtensions.has(ext)) {
      continue;
    }

    // Key on full string normalized
    const key = full.toLowerCase();
    const existing = matchesMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      matchesMap.set(key, {
        raw: full,
        count: 1,
        name: filename,
        ext,
        isUrl,
      });
    }
  }

  const results: SensitiveFile[] = [];

  for (const item of matchesMap.values()) {
    let category: SensitiveFile['category'] = 'Documents';
    if (['sql', 'bak'].includes(item.ext)) {
      category = 'Database & Backups';
    } else if (['env', 'config', 'conf', 'key', 'pem'].includes(item.ext)) {
      category = 'Configuration & Secrets';
    } else if (['xls', 'xlsx', 'csv'].includes(item.ext)) {
      category = 'Spreadsheets & Data';
    } else {
      category = 'Documents';
    }

    results.push({
      name: item.name,
      extension: `.${item.ext}`,
      category,
      fullMatch: item.raw,
      isUrl: item.isUrl,
      occurrences: item.count,
    });
  }

  return results.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Extracts and deduplicates domains and subdomains
 */
export function extractDomains(text: string, existingEmails: ExtractedEmail[]): ExtractedDomain[] {
  // Regex to match potential domain strings
  // Must NOT be preceded by @ or be part of email username (not followed by @)
  const domainRegex = /(?<![a-zA-Z0-9@_.-])(?<!@)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,24}(?![@a-zA-Z0-9])/g;
  const domainCounts = new Map<string, number>();

  // Exclude known file/script extensions and email usernames that look like domains
  const ignoredExtensionsAndScripts = new Set([
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'sql', 'bak', 'env', 'config', 'conf',
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico',
    'zip', 'tar', 'gz', '7z', 'rar',
    'exe', 'bin', 'sh', 'py', 'js', 'ts', 'css', 'html', 'htm', 'json', 'xml', 'yaml', 'yml',
    'aspx', 'asp', 'php', 'jsp', 'cgi', 'do', 'action',
  ]);

  // Valid common TLDs list for strict validation when matching uncontextualized strings
  const commonTlds = new Set([
    'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'io', 'co', 'ai', 'me', 'app', 'dev',
    'cloud', 'tech', 'info', 'biz', 'online', 'site', 'store', 'agency', 'global', 'xyz',
    'security', 'defense', 'cyber', 'systems', 'network', 'internal', 'local', 'corp', 'lan',
    'us', 'uk', 'ca', 'de', 'fr', 'jp', 'au', 'nl', 'se', 'ch', 'eu', 'in', 'ru', 'cn', 'br'
  ]);

  // Collect set of email local parts (e.g. 'alice.morgan', 'david.kim') to strictly reject them
  const emailUserParts = new Set<string>();
  for (const e of existingEmails) {
    if (e.localPart) {
      emailUserParts.add(e.localPart.toLowerCase());
    }
  }

  let match: RegExpExecArray | null;
  while ((match = domainRegex.exec(text)) !== null) {
    const raw = match[0].toLowerCase();

    // Reject if it matches an email local part (like 'alice.morgan' or 'marcus.vance')
    if (emailUserParts.has(raw)) continue;

    // Check if directly followed by @ in original text
    const nextCharIndex = match.index + match[0].length;
    if (nextCharIndex < text.length && text[nextCharIndex] === '@') continue;

    const parts = raw.split('.');
    if (parts.length < 2) continue;

    const tld = parts[parts.length - 1];

    if (ignoredExtensionsAndScripts.has(tld)) continue;
    // Don't treat purely numeric as domains
    if (parts.every(p => /^\d+$/.test(p))) continue;

    // Must have a recognized TLD
    if (!commonTlds.has(tld)) continue;

    domainCounts.set(raw, (domainCounts.get(raw) || 0) + 1);
  }

  // Also include domains from extracted emails
  for (const email of existingEmails) {
    const d = email.domain.toLowerCase();
    domainCounts.set(d, (domainCounts.get(d) || 0) + email.occurrences);
  }

  const results: ExtractedDomain[] = [];

  for (const [domain, count] of domainCounts.entries()) {
    const parts = domain.split('.');
    const isSub = parts.length > 2;
    const root = parts.length >= 2 ? parts.slice(-2).join('.') : domain;

    results.push({
      domain,
      rootDomain: root,
      isSubdomain: isSub,
      occurrences: count,
    });
  }

  return results.sort((a, b) => {
    if (a.rootDomain !== b.rootDomain) {
      return a.rootDomain.localeCompare(b.rootDomain);
    }
    return a.domain.localeCompare(b.domain);
  });
}

/**
 * Main OSINT Recon Analysis function combining all extractions and calculating metrics
 */
export function analyzeReconDump(rawText: string): ReconAnalysisResult {
  const ips = extractIPs(rawText);
  const allEmails = extractEmails(rawText);
  const emailGroups = groupEmailsByDomain(allEmails);
  const sensitiveFiles = extractSensitiveFiles(rawText);
  const domains = extractDomains(rawText, allEmails);

  const internalIps = ips.filter(ip => ip.type === 'internal').length;
  const externalIps = ips.filter(ip => ip.type === 'external').length;
  const uniqueRootDomains = new Set(domains.map(d => d.rootDomain)).size;

  const metrics: ReconMetrics = {
    totalIps: ips.length,
    internalIps,
    externalIps,
    uniqueEmails: allEmails.length,
    domainGroupsCount: emailGroups.length,
    sensitiveFilesCount: sensitiveFiles.length,
    uniqueDomainsCount: domains.length,
    rootDomainsCount: uniqueRootDomains,
  };

  return {
    ips,
    emailGroups,
    allEmails,
    sensitiveFiles,
    domains,
    metrics,
    rawTextLength: rawText.length,
    processedAt: new Date().toISOString(),
  };
}

/**
 * Converts the analyzed reconnaissance artifacts into a clean CSV report
 */
export function generateReconCsv(analysis: ReconAnalysisResult): string {
  const rows: string[][] = [
    ['Category', 'Artifact Value', 'Classification / Scope', 'Details / Origin', 'Occurrences']
  ];

  // IPs
  for (const ip of analysis.ips) {
    rows.push([
      'IP Address',
      ip.ip,
      ip.type === 'internal' ? 'Internal Network' : 'External Public',
      ip.classification,
      ip.occurrences.toString(),
    ]);
  }

  // Emails
  for (const group of analysis.emailGroups) {
    for (const email of group.emails) {
      rows.push([
        'Corporate Email',
        email.email,
        `Domain: ${group.domain}`,
        `Inferred Domain Pattern: ${group.inferredPattern} (Confidence: ${group.confidence})`,
        email.occurrences.toString(),
      ]);
    }
  }

  // Sensitive Files
  for (const file of analysis.sensitiveFiles) {
    rows.push([
      'Target File / Dork Asset',
      file.name,
      file.category,
      file.fullMatch,
      file.occurrences.toString(),
    ]);
  }

  // Domains
  for (const domain of analysis.domains) {
    rows.push([
      'Domain / Hostname',
      domain.domain,
      domain.isSubdomain ? 'Subdomain' : 'Root Domain',
      `Root: ${domain.rootDomain}`,
      domain.occurrences.toString(),
    ]);
  }

  return rows
    .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
}
