import { ChartRequest, ChartResponse } from "@/types/chart";
import {
  getTypeMetadata,
  getProfileMetadata,
  getAuthorityLabel,
  getAuthorityBusinessText,
  getCenterTexts,
} from "@/utils/hdTypeMapping";

function isDef(type: string) { return type === "defined" || type === "unconscious"; }

// Inline SVG icons (same as ChartDisplay)
const ICONS: Record<string, string> = {
  bolt:       `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5F7680" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  target:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5F7680" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  layers:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5F7680" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  key:        `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5F7680" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></svg>`,
  up:         `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5F7680" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  down:       `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8956A" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>`,
  mic:        `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#5F7680" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
  radio:      `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="13" rx="2"/><path d="M9 8V5l7-3"/><circle cx="7.5" cy="14.5" r="2"/><line x1="13" y1="11" x2="20" y2="11"/><line x1="13" y1="15" x2="20" y2="15"/></svg>`,
  lightbulb:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 006 8c0 1.3.5 2.6 1.5 3.5.7.7 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
  eye:        `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  bubble:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  compass:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  heart:      `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  zap:        `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  shield:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  activity:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  anchor:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0020 0h-3"/></svg>`,
};

const CENTER_ICONS: Record<string, string> = {
  head: "lightbulb", ajna: "eye", throat: "bubble", g: "compass",
  heart: "heart", sacral: "zap", spleen: "shield", solar: "activity", root: "anchor",
};

const HD_CENTER_NAMES: Record<string, string> = {
  head: "Inspirations-Zentrum", ajna: "Verstandes-Zentrum", throat: "Kehl-Zentrum",
  g: "Selbst-Zentrum", heart: "Herz/Ego-Zentrum", sacral: "Sakral-Zentrum",
  spleen: "Milz-Zentrum", solar: "Emotions-Zentrum", root: "Wurzel-Zentrum",
};

export async function generateAndDownloadPdf(
  data: ChartResponse,
  inputData: ChartRequest | null
) {
  const typeMeta       = getTypeMetadata(data.type.code);
  const profileMeta    = getProfileMetadata(data.profile.code);
  const profileValue   = profileMeta ? `${data.profile.code} – ${profileMeta.label}` : data.profile.code;
  const authorityLabel = getAuthorityLabel(data.authority.code);
  const authorityBiz   = getAuthorityBusinessText(data.authority.code) ?? "";

  const birthLine = inputData
    ? [inputData.birthDate, inputData.birthTime ? `${inputData.birthTime} Uhr` : "", inputData.birthPlace]
        .filter(Boolean).join(" · ")
    : "";

  // ── Zentren ────────────────────────────────────────────────────────────────
  const centersHtml = data.centers.map((center) => {
    const defType = center.definitionType ?? (center.defined ? "defined" : "open");
    const defined = isDef(defType);
    const ct      = getCenterTexts(center.code);
    const desc    = ct ? (defined ? ct.defined : ct.open) : "";
    const iconKey = CENTER_ICONS[center.code] ?? "target";
    const icon    = (ICONS[iconKey] ?? "").replace("currentColor", defined ? "#5F7680" : "#9CA3AF");

    return `
      <div class="center-row ${defined ? "defined" : "open"}">
        <div class="center-icon">${icon}</div>
        <div class="center-body">
          <div class="center-top">
            <span class="center-title">${ct?.businessTitle ?? center.name}</span>
            <span class="center-badge ${defined ? "badge-def" : "badge-open"}">${defined ? "definiert" : "offen"} ${defined ? ICONS.mic : ICONS.radio}</span>
          </div>
          <div class="center-meta">${HD_CENTER_NAMES[center.code] ?? center.name}${ct ? ` · ${ct.themen}` : ""}</div>
          ${desc ? `<div class="center-desc">${desc}</div>` : ""}
        </div>
      </div>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Human Design Business-Energie – ${data.firstName}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page { size: A4; margin: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      font-size: 9.5pt;
      color: #1A2126;
      background: #fff;
      line-height: 1.55;
    }

    /* ── COVER ──────────────────────────────────────────────────────────────── */
    .cover {
      background: #EEF2F3;
      padding: 24mm 18mm 20mm;
      position: relative;
      border-bottom: 2px solid #5F7680;
    }
    .cover-accent-bar {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: #5F7680;
    }
    .cover-eyebrow {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: #5F7680;
      font-weight: 700;
      margin-bottom: 14px;
    }
    .cover-name {
      font-size: 30pt;
      font-weight: 700;
      color: #1A2126;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-bottom: 10px;
    }
    .cover-sub {
      font-size: 10pt;
      color: #5F7680;
      line-height: 1.5;
      margin-bottom: 22px;
      max-width: 360px;
    }
    .cover-divider {
      width: 40px;
      height: 2px;
      background: #5F7680;
      margin-bottom: 14px;
    }
    .cover-birth {
      font-size: 8pt;
      color: #374151;
    }

    /* ── BODY ───────────────────────────────────────────────────────────────── */
    .body { padding: 12mm 18mm 12mm; }

    /* ── SECTION ────────────────────────────────────────────────────────────── */
    .section { margin-bottom: 20px; }
    .kompass-grid, .legend-row { page-break-inside: avoid; }
    .basis-row { page-break-inside: avoid; }
    .section-head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      border-bottom: 1px solid #EFEFEF;
      padding-bottom: 6px;
      page-break-after: avoid;
    }
    .section-chip {
      font-size: 6.5pt;
      text-transform: uppercase;
      letter-spacing: 0.13em;
      font-weight: 700;
      color: #5F7680;
      border: 0.5px solid #5F7680;
      padding: 2px 7px;
      flex-shrink: 0;
    }
    .section-title {
      font-size: 10pt;
      font-weight: 600;
      color: #374151;
    }

    /* ── BASIS ROWS ─────────────────────────────────────────────────────────── */
    .basis-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 11px 0 11px 14px;
      border-left: 2px solid #5F7680;
      border-bottom: 0.5px solid #F3F4F6;
    }
    .basis-row:last-child { border-bottom: none; }
    .basis-icon { margin-top: 1px; flex-shrink: 0; }
    .basis-content { flex: 1; min-width: 0; }
    .basis-label {
      font-size: 6.5pt;
      text-transform: uppercase;
      letter-spacing: 0.13em;
      font-weight: 700;
      color: #5F7680;
      margin-bottom: 1px;
    }
    .basis-sub {
      font-size: 7.5pt;
      color: #9CA3AF;
      margin-bottom: 4px;
    }
    .basis-value {
      font-size: 10.5pt;
      font-weight: 700;
      color: #1A2126;
      margin-bottom: 5px;
      line-height: 1.3;
    }
    .basis-text {
      font-size: 8.5pt;
      color: #374151;
      line-height: 1.6;
    }

    /* ── KOMPASS ────────────────────────────────────────────────────────────── */
    .kompass-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .kompass-cell {
      padding: 12px 14px;
      border: 0.5px solid #E8E3DC;
    }
    .kompass-top {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
    }
    .kompass-label {
      font-size: 6.5pt;
      text-transform: uppercase;
      letter-spacing: 0.13em;
      font-weight: 700;
      color: #6B7280;
    }
    .kompass-value {
      font-size: 14pt;
      font-weight: 700;
      margin-bottom: 4px;
      line-height: 1.2;
    }
    .kompass-desc { font-size: 8pt; color: #374151; line-height: 1.5; }
    .color-accent { color: #5F7680; }
    .color-warm   { color: #B8956A; }

    /* ── ZENTREN ────────────────────────────────────────────────────────────── */
    .legend-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    .legend-cell {
      font-size: 8pt;
      color: #374151;
      padding: 7px 10px;
      border: 0.5px solid #E8E3DC;
      border-left: 2px solid #D4CFC8;
    }
    .legend-cell.def { border-left-color: #5F7680; }
    .legend-label {
      font-size: 6.5pt;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 3px;
    }
    .legend-note {
      font-size: 7.5pt;
      color: #9CA3AF;
      font-style: italic;
      margin-bottom: 10px;
    }

    .center-row {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 9px 0 9px 12px;
      border-left: 2px solid #D4CFC8;
      border-bottom: 0.5px solid #F3F4F6;
      margin-bottom: 2px;
      page-break-inside: avoid;
    }
    .center-row.defined { border-left-color: #5F7680; }
    .center-row:last-child { border-bottom: none; }
    .center-icon { flex-shrink: 0; margin-top: 2px; width: 18px; text-align: center; }
    .center-body { flex: 1; min-width: 0; }
    .center-top {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-bottom: 2px;
      flex-wrap: wrap;
    }
    .center-title {
      font-size: 9.5pt;
      font-weight: 600;
      color: #1A2126;
    }
    .center-row.open .center-title { color: #4A5568; }
    .center-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 6.5pt;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
      color: #6B7280;
    }
    .badge-def { color: #5F7680; }
    .center-meta { font-size: 7.5pt; color: #9CA3AF; margin-bottom: 3px; }
    .center-desc { font-size: 8.5pt; color: #374151; line-height: 1.55; }

    /* ── CTA ────────────────────────────────────────────────────────────────── */
    .cta-box {
      margin-top: 18px;
      padding: 15px 16px;
      border: 0.5px solid #E8E3DC;
      border-left: 3px solid #5F7680;
      page-break-inside: avoid;
    }
    .cta-eyebrow {
      font-size: 6.5pt;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-weight: 700;
      color: #5F7680;
      margin-bottom: 4px;
    }
    .cta-title {
      font-size: 10pt;
      font-weight: 700;
      color: #1A2126;
      margin-bottom: 4px;
      line-height: 1.35;
    }
    .cta-text {
      font-size: 8.5pt;
      color: #374151;
      line-height: 1.55;
      margin-bottom: 6px;
    }
    .cta-url { font-size: 8pt; color: #5F7680; font-weight: 600; }

    /* ── FOOTER ─────────────────────────────────────────────────────────────── */
    .footer {
      margin-top: 14px;
      padding-top: 7px;
      border-top: 0.5px solid #EFEFEF;
      display: flex;
      justify-content: space-between;
    }
    .footer-text { font-size: 7pt; color: #C4BEB8; }

    @media print {
      body, .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- COVER -->
  <div class="cover">
    <div class="cover-accent-bar"></div>
    <div class="cover-eyebrow">Human Design · Business Energy Calculator</div>
    <div class="cover-name">${data.firstName}${inputData?.lastName ? `<br>${inputData.lastName}` : ""}</div>
    <div class="cover-sub">Deine Business-Energie, Entscheidungs-Architektur und Wirkung auf einen Blick.</div>
    <div class="cover-divider"></div>
    ${birthLine ? `<div class="cover-birth">${birthLine}</div>` : ""}
  </div>

  <div class="body">

    <!-- Business-Basis -->
    <div class="section">
      <div class="section-head">
        <span class="section-chip">Business-Basis</span>
        <span class="section-title">Deine energetische Grundstruktur</span>
      </div>

      <div class="basis-row">
        <div class="basis-icon">${ICONS.bolt}</div>
        <div class="basis-content">
          <div class="basis-label">Arbeitsenergie</div>
          <div class="basis-sub">Wie du am effektivsten arbeitest</div>
          <div class="basis-value">${data.type.label}${typeMeta ? ` — ${typeMeta.merkmal}` : ""}</div>
          ${typeMeta?.typeBusinessText ? `<div class="basis-text">${typeMeta.typeBusinessText}</div>` : ""}
        </div>
      </div>

      <div class="basis-row">
        <div class="basis-icon">${ICONS.target}</div>
        <div class="basis-content">
          <div class="basis-label">Strategie</div>
          <div class="basis-sub">Wie du Chancen &amp; Aufgaben angehst</div>
          <div class="basis-value">${typeMeta?.strategieLabel ?? typeMeta?.strategie ?? ""}</div>
          ${typeMeta?.strategieBusinessText ? `<div class="basis-text">${typeMeta.strategieBusinessText}</div>` : ""}
        </div>
      </div>

      <div class="basis-row">
        <div class="basis-icon">${ICONS.layers}</div>
        <div class="basis-content">
          <div class="basis-label">Profil</div>
          <div class="basis-sub">Wie du Einfluss nimmst</div>
          <div class="basis-value">${profileValue}</div>
          ${profileMeta?.businessText ? `<div class="basis-text">${profileMeta.businessText}</div>` : ""}
        </div>
      </div>

      <div class="basis-row">
        <div class="basis-icon">${ICONS.key}</div>
        <div class="basis-content">
          <div class="basis-label">Entscheidungs-Architektur</div>
          <div class="basis-sub">Wie du wichtige Entscheidungen triffst</div>
          <div class="basis-value">${authorityLabel}</div>
          ${authorityBiz ? `<div class="basis-text">${authorityBiz}</div>` : ""}
        </div>
      </div>
    </div>

    <!-- Energie-Kompass -->
    ${typeMeta ? `
    <div class="section" style="page-break-before: always">
      <div class="section-head">
        <span class="section-chip">Energie-Kompass</span>
        <span class="section-title">Deine zwei Signale</span>
      </div>
      <div class="kompass-grid">
        <div class="kompass-cell">
          <div class="kompass-top">
            ${ICONS.up}
            <span class="kompass-label">In deiner Energie</span>
          </div>
          <div class="kompass-value color-accent">${typeMeta.higherSelf}</div>
          <div class="kompass-desc">Dein inneres Zeichen, dass du auf dem richtigen Weg bist.</div>
        </div>
        <div class="kompass-cell">
          <div class="kompass-top">
            ${ICONS.down}
            <span class="kompass-label">Dein Warnsignal</span>
          </div>
          <div class="kompass-value color-warm">${typeMeta.notSelf}</div>
          <div class="kompass-desc">Dein Hinweis, wann du dich von deiner natürlichen Energie entfernst.</div>
        </div>
      </div>
    </div>
    ` : ""}

    <!-- Zentren -->
    <div class="section">
      <div class="section-head">
        <span class="section-chip">Deine Energie im Business</span>
        <span class="section-title">Deine 9 Energiezentren</span>
      </div>
      <div class="section-intro">
        Jeder Mensch hat im Human Design dieselben neun Energiezentren, jedes steht für ein anderes Thema. Je nach persönlichem Design sind sie definiert oder offen. Im Business zeigen sie, wie du arbeitest, Führungsverantwortung übernimmst, kommunizierst und auf andere wirkst.
      </div>

      <div class="legend-row">
        <div class="legend-cell def">
          <div>
            <span class="legend-label" style="color:#5F7680">${ICONS.mic} Definiert</span>
            Konstante Energie, die dir verlässlich zur Verfügung steht und die du nach außen ausstrahlst. Stell es dir wie ein Mikrofon vor: Du sendest diese Energie in dein Umfeld.
          </div>
        </div>
        <div class="legend-cell">
          <div>
            <span class="legend-label" style="color:#6B7280">${ICONS.radio} Offen</span>
            Ein Bereich, in dem du besonders empfänglich für die Energie anderer bist. Das funktioniert wie ein Radio: Du empfängst, was in deinem Umfeld sendet, und verstärkst es häufig.
          </div>
        </div>
      </div>
      <div class="legend-note">Es gibt kein besser oder schlechter, nur anders. Beide Zustände haben ihre eigene Stärke.</div>

      ${centersHtml}
    </div>

    <!-- CTA -->
    <div class="cta-box">
      <div class="cta-eyebrow">Business Energy Reading</div>
      <div class="cta-title">Jetzt kennst du die einzelnen Facetten. Im Reading schauen wir auf das Zusammenspiel.</div>
      <div class="cta-text">Wie wirken deine Energie, deine Entscheidungen, deine Kommunikation und deine Führung wirklich zusammen?</div>
      <div class="cta-url">stupperich.de</div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <span class="footer-text">stupperich.de · Human Design Business Energy Calculator</span>
      <span class="footer-text">${data.calculationSource ?? "Swiss Ephemeris"}</span>
    </div>

  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  try {
    const response = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    });

    if (!response.ok) {
      throw new Error(`PDF-Generierung fehlgeschlagen: ${response.status}`);
    }

    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `business-energie-${data.firstName.toLowerCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error("PDF error:", err);
    // Fallback: Browser-Druck
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  }
}
