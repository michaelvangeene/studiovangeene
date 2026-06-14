'use client';

import { useCallback, useState } from 'react';
import { useHDZ } from '@/context/HDZContext';
import type { LayerKey } from '@/types/hdz';

const t = {
  en: { export: 'Export PDF', generating: 'Generating…', success: 'PDF ready!' },
  nl: { export: 'PDF Exporteren', generating: 'Bezig…', success: 'PDF klaar!' },
};

const LAYER_LABELS: Record<LayerKey, { en: string; nl: string }> = {
  basicNeeds: { en: 'Basic Needs', nl: 'Basisbehoeften' },
  spatialFit: { en: 'Spatial Fit', nl: 'Ruimtelijke Inpassing' },
  impact: { en: 'Impact', nl: 'Omgevingsimpact' },
  governance: { en: 'Governance', nl: 'Beheer & Bestuur' },
  policyFit: { en: 'Policy Fit', nl: 'Beleidsafstemming' },
};

export default function ExportButton() {
  const { state } = useHDZ();
  const lang = state.language;
  const tx = t[lang];
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleExport = useCallback(async () => {
    if (!state.score || !state.location) return;
    setStatus('loading');

    try {
      const { default: jsPDF } = await import('jspdf');
      const score = state.score;
      const loc = state.location;
      const prog = state.program;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210;

      // Header
      pdf.setFillColor(10, 14, 26);
      pdf.rect(0, 0, W, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('HDZ Assessment Report', 14, 18);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text('Human Dignity Zone Assessment Dashboard', 14, 26);
      pdf.text(`Generated: ${new Date().toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-GB')}`, 14, 32);

      // Score banner
      const catColor = score.category === 'strong' ? [16, 185, 129] :
        score.category === 'moderate' ? [245, 158, 11] :
        score.category === 'weak' ? [249, 115, 22] : [239, 68, 68];
      pdf.setFillColor(catColor[0], catColor[1], catColor[2]);
      pdf.rect(0, 40, W, 22, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${score.total}/100`, 14, 57);
      pdf.setFontSize(10);
      pdf.text(lang === 'nl' ? (
        score.category === 'strong' ? 'STERK' :
        score.category === 'moderate' ? 'MATIG' :
        score.category === 'weak' ? 'ZWAK' : 'KRITIEK'
      ) : score.category.toUpperCase(), 60, 57);
      pdf.setFontSize(8);
      pdf.text(
        lang === 'nl'
          ? score.legallyDefensible ? '✓ Juridisch Verdedigbaar' : '✗ Niet Juridisch Verdedigbaar'
          : score.legallyDefensible ? '✓ Legally Defensible' : '✗ Not Legally Defensible',
        120, 57
      );

      let y = 72;

      // Location section
      pdf.setTextColor(10, 14, 26);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(lang === 'nl' ? 'Locatie' : 'Location', 14, y);
      y += 6;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      const addrLines = pdf.splitTextToSize(loc.address, W - 28);
      pdf.text(addrLines, 14, y);
      y += addrLines.length * 4 + 2;
      if (loc.neighborhood) { pdf.text(`${lang === 'nl' ? 'Buurt' : 'Neighbourhood'}: ${loc.neighborhood}`, 14, y); y += 4; }
      if (loc.municipality) { pdf.text(`${lang === 'nl' ? 'Gemeente' : 'Municipality'}: ${loc.municipality}`, 14, y); y += 4; }
      if (loc.postcode) { pdf.text(`${lang === 'nl' ? 'Postcode' : 'Postcode'}: ${loc.postcode}`, 14, y); y += 4; }
      y += 4;

      // Program section
      pdf.setTextColor(10, 14, 26);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(lang === 'nl' ? 'Programma' : 'Program', 14, y);
      y += 6;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.text(`${lang === 'nl' ? 'Type' : 'Type'}: ${prog.housingType.replace(/_/g, ' ')}`, 14, y); y += 4;
      pdf.text(`${lang === 'nl' ? 'Bewoners' : 'Residents'}: ${prog.residents}`, 14, y); y += 4;
      pdf.text(`${lang === 'nl' ? 'Verblijf' : 'Duration'}: ${prog.duration}`, 14, y); y += 4;
      pdf.text(`${lang === 'nl' ? 'Beheer' : 'Management'}: ${prog.management.replace('_', ' ')}`, 14, y); y += 8;

      // Layer scores
      pdf.setTextColor(10, 14, 26);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(lang === 'nl' ? 'Scoreoverzicht' : 'Score Overview', 14, y);
      y += 7;

      (Object.keys(score.layers) as LayerKey[]).forEach((key) => {
        const layer = score.layers[key];
        const pct = Math.round((layer.score / layer.max) * 100);
        const lbl = LAYER_LABELS[key][lang];
        const barW = 100;
        const fillW = (barW * pct) / 100;

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        pdf.text(lbl, 14, y);
        pdf.text(`${layer.score}/${layer.max} (${pct}%)`, barW + 20, y);

        pdf.setFillColor(30, 41, 59);
        pdf.rect(14, y + 1.5, barW, 3, 'F');
        const fc = pct >= 70 ? [16, 185, 129] : pct >= 45 ? [245, 158, 11] : [239, 68, 68];
        pdf.setFillColor(fc[0], fc[1], fc[2]);
        pdf.rect(14, y + 1.5, fillW, 3, 'F');
        y += 9;
      });

      y += 4;

      // Red flags
      if (score.redFlags.length > 0) {
        pdf.setTextColor(10, 14, 26);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(lang === 'nl' ? 'Rode Vlaggen' : 'Red Flags', 14, y);
        y += 6;
        score.redFlags.forEach((flag) => {
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          const color = flag.severity === 'error' ? [239, 68, 68] : [245, 158, 11];
          pdf.setTextColor(color[0], color[1], color[2]);
          const msg = lang === 'nl' ? flag.messageNl : flag.messageEn;
          const lines = pdf.splitTextToSize(`• ${msg}`, W - 28);
          if (y + lines.length * 4 > 280) { pdf.addPage(); y = 14; }
          pdf.text(lines, 14, y);
          y += lines.length * 4 + 2;
        });
        y += 4;
      }

      // Recommendations
      if (score.recommendations.length > 0) {
        pdf.setTextColor(10, 14, 26);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        if (y + 20 > 280) { pdf.addPage(); y = 14; }
        pdf.text(lang === 'nl' ? 'Aanbevelingen' : 'Recommendations', 14, y);
        y += 6;
        score.recommendations.forEach((rec) => {
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(71, 85, 105);
          const msg = lang === 'nl' ? rec.messageNl : rec.messageEn;
          const lines = pdf.splitTextToSize(`• ${msg}`, W - 28);
          if (y + lines.length * 4 > 280) { pdf.addPage(); y = 14; }
          pdf.text(lines, 14, y);
          y += lines.length * 4 + 2;
        });
      }

      // Footer
      const pageCount = (pdf as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(100, 116, 139);
        pdf.text('HDZ Assessment Dashboard — Indicative tool. Not a substitute for legal advice.', 14, 292);
        pdf.text(`${i}/${pageCount}`, W - 14, 292, { align: 'right' });
      }

      pdf.save(`HDZ-Report-${Date.now()}.pdf`);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      console.error('PDF export error', err);
      setStatus('idle');
    }
  }, [state, lang]);

  const disabled = !state.score || !state.location || status === 'loading';

  return (
    <button
      id="export-pdf-btn"
      onClick={handleExport}
      disabled={disabled}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
        disabled
          ? 'bg-[#1e293b] border-[#334155] text-[#475569] cursor-not-allowed'
          : status === 'done'
          ? 'bg-[#10b981]/15 border-[#10b981]/40 text-[#10b981]'
          : 'bg-[#3b82f6]/10 border-[#3b82f6]/40 text-[#3b82f6] hover:bg-[#3b82f6]/20'
      }`}
    >
      {status === 'loading' ? (
        <>
          <div className="w-3 h-3 border border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
          {tx.generating}
        </>
      ) : status === 'done' ? (
        <>{tx.success}</>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {tx.export}
        </>
      )}
    </button>
  );
}
