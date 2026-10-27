/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WelcomeBanner } from './components/WelcomeBanner';
import { MetricsRow } from './components/MetricsRow';
import { InputSection } from './components/InputSection';
import { IpCard } from './components/IpCard';
import { EmailCard } from './components/EmailCard';
import { SensitiveFilesCard } from './components/SensitiveFilesCard';
import { DomainsCard } from './components/DomainsCard';
import { Toast } from './components/Toast';
import { PRIMARY_SAMPLE_DUMP } from './data/sampleDumps';
import {
  analyzeReconDump,
  generateReconCsv,
  ReconAnalysisResult,
} from './utils/parser';

export default function App() {
  const [inputText, setInputText] = useState<string>('');
  const [analysis, setAnalysis] = useState<ReconAnalysisResult>(() =>
    analyzeReconDump('')
  );
  const [hasExtracted, setHasExtracted] = useState<boolean>(false);
  const [bannerVisible, setBannerVisible] = useState<boolean>(() => {
    try {
      return localStorage.getItem('osint_welcome_dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  const [toastInfo, setToastInfo] = useState<{ message: string; sub?: string } | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Trigger toast with auto-hide
  const showToast = (message: string, sub?: string) => {
    setToastInfo({ message, sub });
    setTimeout(() => {
      setToastInfo((current) => (current?.message === message ? null : current));
    }, 2800);
  };

  // Run extraction on current input text
  const handleExtract = () => {
    const result = analyzeReconDump(inputText);
    setAnalysis(result);
    setHasExtracted(true);
    showToast('Reconnaissance Analysis Complete', `${result.metrics.totalIps} IPs, ${result.metrics.uniqueEmails} Emails, ${result.metrics.sensitiveFilesCount} Files, ${result.metrics.uniqueDomainsCount} Domains`);
  };

  // Load sample dump and analyze immediately
  const handleLoadSample = (sampleContent: string = PRIMARY_SAMPLE_DUMP) => {
    setInputText(sampleContent);
    const result = analyzeReconDump(sampleContent);
    setAnalysis(result);
    setHasExtracted(true);
    showToast('Sample Recon Dump Ingested', 'Extracted mixed IPs, corporate emails, sensitive files, and domains.');
  };

  // Clear input and reset artifacts
  const handleClear = () => {
    setInputText('');
    setAnalysis(analyzeReconDump(''));
    setHasExtracted(false);
    showToast('Buffer Cleared', 'Workspace reset to clean state.');
  };

  // Dismiss welcome banner
  const handleDismissBanner = () => {
    setBannerVisible(false);
    try {
      localStorage.setItem('osint_welcome_dismissed', 'true');
    } catch {
      // Ignore storage errors in private browsing
    }
  };

  // Copy specific item list
  const handleCopyList = (items: string[], label: string) => {
    if (items.length === 0) return;
    const textToCopy = items.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast(`Copied ${label} to clipboard`, `${items.length} ${items.length === 1 ? 'item' : 'items'} formatted as list.`);
    }).catch(() => {
      // Fallback
      showToast(`Copied ${label}`);
    });
  };

  // Copy all artifacts
  const handleCopyAll = () => {
    const sections: string[] = [];
    sections.push(`=== OSINT RECONNAISSANCE INTELLIGENCE REPORT ===`);
    sections.push(`Generated: ${new Date().toISOString()}`);
    sections.push(`\n--- 1. IP ADDRESSES (${analysis.ips.length}) ---`);
    for (const ip of analysis.ips) {
      sections.push(`${ip.ip} [${ip.type.toUpperCase()}] (${ip.classification}) - ${ip.occurrences}x`);
    }

    sections.push(`\n--- 2. CORPORATE EMAILS & PATTERNS (${analysis.allEmails.length}) ---`);
    for (const group of analysis.emailGroups) {
      sections.push(`Domain @${group.domain} (Pattern: ${group.inferredPattern}):`);
      for (const email of group.emails) {
        sections.push(`  * ${email.email} (${email.occurrences}x)`);
      }
    }

    sections.push(`\n--- 3. TARGET SENSITIVE FILES & DORKS (${analysis.sensitiveFiles.length}) ---`);
    for (const file of analysis.sensitiveFiles) {
      sections.push(`[${file.extension}] ${file.name} - ${file.fullMatch}`);
    }

    sections.push(`\n--- 4. DOMAINS & HOSTNAMES (${analysis.domains.length}) ---`);
    for (const d of analysis.domains) {
      sections.push(`${d.domain} (${d.isSubdomain ? 'Subdomain' : 'Root'})`);
    }

    navigator.clipboard.writeText(sections.join('\n')).then(() => {
      setCopiedAll(true);
      showToast('All Categorized Artifacts Copied', 'Full formatted intelligence brief placed on clipboard.');
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  // Download CSV report
  const handleDownloadCsv = () => {
    const csvContent = generateReconCsv(analysis);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.setAttribute('href', url);
    link.setAttribute('download', `osint_recon_report_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('CSV Report Downloaded', `Saved as osint_recon_report_${timestamp}.csv`);
  };

  const hasArtifacts =
    analysis.ips.length > 0 ||
    analysis.allEmails.length > 0 ||
    analysis.sensitiveFiles.length > 0 ||
    analysis.domains.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Application Header */}
      <Header
        onDownloadCsv={handleDownloadCsv}
        onCopyAll={handleCopyAll}
        onReset={handleClear}
        hasArtifacts={hasArtifacts}
        copiedAll={copiedAll}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Onboarding Welcome Banner (Dismissible) */}
        {bannerVisible && (
          <WelcomeBanner
            onDismiss={handleDismissBanner}
            onLoadSample={() => handleLoadSample(PRIMARY_SAMPLE_DUMP)}
          />
        )}

        {/* Top Summary Metrics Row (4 KPI Cards) */}
        <section aria-label="Reconnaissance Key Metrics">
          <MetricsRow metrics={analysis.metrics} />
        </section>

        {/* Unstructured Raw Ingestion Textarea & Action Controls */}
        <section aria-label="Raw Data Ingestion">
          <InputSection
            inputText={inputText}
            setInputText={setInputText}
            onExtract={handleExtract}
            onClear={handleClear}
            onLoadSample={handleLoadSample}
            hasExtracted={hasExtracted}
          />
        </section>

        {/* Categorized Reconnaissance Dashboard (2x2 Grid) */}
        <section aria-label="Categorized Reconnaissance Artifacts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-white">
                Reconnaissance Dashboard
              </h2>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-400 border border-slate-700">
                Structured Findings
              </span>
            </div>

            {hasArtifacts && (
              <span className="text-xs text-slate-400 font-mono">
                {analysis.ips.length + analysis.allEmails.length + analysis.sensitiveFiles.length + analysis.domains.length} total artifacts extracted
              </span>
            )}
          </div>

          {/* 2x2 Responsive Artifacts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 1. IP Addresses Card */}
            <IpCard ips={analysis.ips} onCopyList={handleCopyList} />

            {/* 2. Emails & Inferred Patterns Card */}
            <EmailCard
              emailGroups={analysis.emailGroups}
              allEmails={analysis.allEmails}
              onCopyList={handleCopyList}
            />

            {/* 3. Sensitive Files / Dork Targets Card */}
            <SensitiveFilesCard
              files={analysis.sensitiveFiles}
              onCopyList={handleCopyList}
            />

            {/* 4. Domains & Hostnames Card */}
            <DomainsCard
              domains={analysis.domains}
              onCopyList={handleCopyList}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs text-slate-600">
        <p>
          OSINT Recon &amp; Metadata Analyzer &bull; Engineered for Cybersecurity Students, SOC Analysts, and Threat Intelligence Researchers
        </p>
      </footer>

      {/* Floating Feedback Toast */}
      {toastInfo && (
        <Toast message={toastInfo.message} subMessage={toastInfo.sub} />
      )}
    </div>
  );
}
