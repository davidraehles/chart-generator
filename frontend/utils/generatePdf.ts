import { ChartRequest, ChartResponse } from "@/types/chart";
import {
  getTypeMetadata,
  getProfileLabel,
  getAuthorityLabel,
  getAuthorityBusinessText,
  getCenterTexts,
} from "@/utils/hdTypeMapping";

const ACCENT = "#5F7680";
const WARM   = "#B8956A";

function isDef(type: string) { return type === "defined" || type === "unconscious"; }

export function generateAndDownloadPdf(
  data: ChartResponse,
  inputData: ChartRequest | null
) {
  const typeMeta        = getTypeMetadata(data.type.code);
  const profileLabel    = getProfileLabel(data.profile.code);
  const profileValue    = profileLabel ? `${data.profile.code} – ${profileLabel}` : data.profile.code;
  const authorityLabel  = getAuthorityLabel(data.authority.code);
  const authorityBiz    = getAuthorityBusinessText(data.authority.code) ?? "";

  // ── Zentren HTML ──────────────────────────────────────────────────────────
  const centersHtml = data.centers.map((center) => {
    const defType = center.definitionType ?? (center.defined ? "defined" : "open");
    const defined = isDef(defType);
    const ct      = getCenterTexts(center.code);
    const desc    = ct ? (defined ? ct.defined : ct.open) : "";

    return `
      <div class="center-card ${defined ? "defined" : "open"}">
        <div class="center-header">
          <span class="center-title">${ct?.businessTitle ?? center.name}</span>
          <span class="center-sub">${center.name}, bei dir <em>${defined ? "definiert" : "offen"}</em></span>
        </div>
        ${ct ? `<div class="center-themen">${ct.themen}</div>` : ""}
        ${desc ? `<div class="center-desc">${desc}</div>` : ""}
      </div>`;
  }).join("");

  // ── Persönliche Daten ─────────────────────────────────────────────────────
  const birthLine = inputData
    ? [inputData.birthDate, inputData.birthTime ? `${inputData.birthTime} Uhr` : "", inputData.birthPlace]
        .filter(Boolean).join(" · ")
    : "";

  // ── Vollständiges HTML ────────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Human Design Business-Energie – ${data.firstName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page {
      size: A4;
      margin: 16mm 18mm 16mm 18mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      font-size: 10pt;
      color: #1A2126;
      background: #fff;
      line-height: 1.5;
    }

    /* ── Header ── */
    .header { margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1.5px solid ${ACCENT}; }
    .header-label { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.12em; color: ${ACCENT}; margin-bottom: 4px; }
    .header-title { font-size: 17pt; font-weight: 700; color: #1A2126; margin-bottom: 4px; letter-spacing: -0.02em; }
    .header-sub { font-size: 9pt; color: #374151; margin-bottom: 10px; }
    .person-name { font-size: 12pt; font-weight: 600; color: #1A2126; }
    .person-birth { font-size: 8.5pt; color: #6B7280; margin-top: 2px; }

    /* ── Section ── */
    .section { margin-bottom: 18px; }
    .section-label { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.12em; color: #6B7280; font-weight: 600; margin-bottom: 8px; }
    .section-title { font-size: 11pt; font-weight: 600; color: #1A2126; margin-bottom: 4px; }
    .section-intro { font-size: 9pt; color: #374151; margin-bottom: 10px; line-height: 1.55; }

    /* ── Business Basis ── */
    .basis-card { border: 0.5px solid #E8E3DC; page-break-inside: avoid; }
    .basis-intro { background: #F9F7F4; padding: 8px 12px; border-bottom: 0.5px solid #EFEFEF; font-size: 8.5pt; color: #374151; }
    .basis-row { display: flex; gap: 10px; padding: 9px 12px; border-bottom: 0.5px solid #EFEFEF; border-left: 3px solid ${ACCENT}; }
    .basis-row:last-child { border-bottom: none; }
    .basis-label-wrap { min-width: 0; }
    .basis-label { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280; font-weight: 600; }
    .basis-sublabel { font-size: 7.5pt; color: #6B7280; font-style: italic; margin-bottom: 3px; }
    .basis-value { font-size: 9.5pt; font-weight: 600; color: #1A2126; }
    .basis-value-text { font-size: 9pt; color: #1A2126; }
    .merkmal { display: inline-block; font-size: 7.5pt; font-weight: 600; color: ${ACCENT}; background: rgba(95,118,128,0.12); padding: 1px 7px; margin-left: 6px; }
    .auth-text { font-size: 8.5pt; color: #374151; margin-top: 3px; line-height: 1.5; }

    /* ── Kompass ── */
    .kompass-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 0.5px solid #E8E3DC; }
    .kompass-cell { padding: 10px 12px; background: #F9F7F4; }
    .kompass-cell:first-child { border-right: 0.5px solid #E8E3DC; }
    .kompass-cell-label { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280; font-weight: 600; margin-bottom: 4px; }
    .kompass-value { font-size: 11pt; font-weight: 700; margin-bottom: 3px; }
    .kompass-desc { font-size: 8pt; color: #374151; }
    .color-accent { color: ${ACCENT}; }
    .color-warm   { color: ${WARM}; }

    /* ── Zentren ── */
    .zentren-legend { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
    .legend-cell { padding: 8px 10px; border: 0.5px solid #E8E3DC; font-size: 8pt; }
    .legend-cell.def { background: rgba(95,118,128,0.09); }
    .legend-label { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 3px; }
    .legend-note { font-size: 7.5pt; color: #374151; font-style: italic; margin-bottom: 8px; }

    .center-card { padding: 9px 12px; border: 0.5px solid #E8E3DC; border-left: 3px solid #D4CFC8; margin-bottom: 5px; page-break-inside: avoid; }
    .center-card.defined { background: rgba(95,118,128,0.09); border-left-color: ${ACCENT}; border-color: rgba(95,118,128,0.25); }
    .center-header { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-bottom: 2px; }
    .center-title { font-size: 9.5pt; font-weight: 600; color: #1A2126; }
    .center-card:not(.defined) .center-title { color: #4A5568; }
    .center-sub { font-size: 8pt; color: #6B7280; }
    .center-themen { font-size: 7.5pt; color: #6B7280; margin-bottom: 4px; }
    .center-desc { font-size: 8.5pt; color: #374151; line-height: 1.5; }

    /* ── CTA Box ── */
    .cta-box { background: #1A2126; color: #F9F7F4; padding: 14px 16px; margin-top: 18px; text-align: center; page-break-inside: avoid; }
    .cta-title { font-size: 11pt; font-weight: 600; margin-bottom: 5px; }
    .cta-text { font-size: 8.5pt; color: #A8B4B6; margin-bottom: 8px; line-height: 1.5; }
    .cta-url { font-size: 8pt; color: ${ACCENT}; }

    /* ── Footer ── */
    .footer { margin-top: 16px; padding-top: 8px; border-top: 0.5px solid #E8E3DC; display: flex; justify-content: space-between; }
    .footer-text { font-size: 7.5pt; color: #C4BEB8; }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="header-label">Human Design · Business-Auswertung</div>
    <div class="header-title">Deine Human Design Business-Energie</div>
    <div class="header-sub">Wie du arbeitest, entscheidest und im Business wirkst.</div>
    <div class="person-name">${data.firstName}${inputData?.lastName ? ` ${inputData.lastName}` : ""}</div>
    ${birthLine ? `<div class="person-birth">${birthLine}</div>` : ""}
  </div>

  <!-- Business-Basis -->
  <div class="section">
    <div class="section-label">Deine Business-Basis</div>
    <div class="basis-card">
      <div class="basis-intro">Die Basis ist deine energetische Bauweise.</div>

      <div class="basis-row">
        <div class="basis-label-wrap">
          <div class="basis-label">Energietyp</div>
          <div class="basis-sublabel">Deine Grundenergie, deine Bedienungsanleitung</div>
          <div class="basis-value">
            ${data.type.label}
            ${typeMeta ? `<span class="merkmal">${typeMeta.merkmal}</span>` : ""}
          </div>
        </div>
      </div>

      <div class="basis-row">
        <div class="basis-label-wrap">
          <div class="basis-label">Strategie</div>
          <div class="basis-sublabel">Dein Leitfaden</div>
          <div class="basis-value-text">${typeMeta?.strategie ?? ""}</div>
        </div>
      </div>

      <div class="basis-row">
        <div class="basis-label-wrap">
          <div class="basis-label">Profil</div>
          <div class="basis-sublabel">Deine Wesenszüge</div>
          <div class="basis-value-text">${profileValue}</div>
        </div>
      </div>

      <div class="basis-row">
        <div class="basis-label-wrap">
          <div class="basis-label">Entscheidungs-Autorität</div>
          <div class="basis-sublabel">Wie du Entscheidungen triffst, wenn du deinen Kopf ausschaltest</div>
          <div class="basis-value">${authorityLabel}</div>
          ${authorityBiz ? `<div class="auth-text">${authorityBiz}</div>` : ""}
        </div>
      </div>
    </div>
  </div>

  <!-- Energie-Kompass -->
  ${typeMeta ? `
  <div class="section">
    <div class="section-label">Energie-Kompass</div>
    <div class="section-intro">Dein Energie-Kompass zeigt dir, woran du erkennst, ob du gerade im Einklang mit deiner natürlichen Energie handelst.</div>
    <div class="kompass-grid">
      <div class="kompass-cell">
        <div class="kompass-cell-label">In deiner Energie</div>
        <div class="kompass-value color-accent">${typeMeta.higherSelf}</div>
        <div class="kompass-desc">Dein inneres Zeichen, dass du auf dem richtigen Weg bist.</div>
      </div>
      <div class="kompass-cell">
        <div class="kompass-cell-label">Dein Warnsignal</div>
        <div class="kompass-value color-warm">${typeMeta.notSelf}</div>
        <div class="kompass-desc">Dein Hinweis, wann du dich von deiner natürlichen Energie entfernst.</div>
      </div>
    </div>
  </div>
  ` : ""}

  <!-- Energiezentren -->
  <div class="section">
    <div class="section-label">Deine Energie im Business</div>
    <div class="section-title">Deine 9 Energiezentren</div>
    <div class="section-intro">Jeder Mensch hat im Human Design dieselben neun Energiezentren, jedes steht für ein anderes Thema. Je nach persönlichem Design sind sie definiert oder offen. Im Business zeigen sie, wie du arbeitest, Führungsverantwortung übernimmst, kommunizierst und auf andere wirkst.</div>

    <div class="zentren-legend">
      <div class="legend-cell def">
        <div class="legend-label" style="color:${ACCENT}">Definiert</div>
        Konstante Energie, die du dauerhaft trägst und nach außen ausstrahlst.
      </div>
      <div class="legend-cell">
        <div class="legend-label" style="color:#6B7280">Offen</div>
        Flexible Zone, in der du die Energie anderer stark aufnimmst und spiegelst.
      </div>
    </div>
    <div class="legend-note">Es gibt kein besser oder schlechter, nur anders. Beide Zustände haben ihre eigene Stärke.</div>

    ${centersHtml}
  </div>

  <!-- CTA -->
  <div class="cta-box">
    <div class="cta-title">Du bist mehr als dein Energietyp.</div>
    <div class="cta-text">Deine Zentren zeigen einzelne Facetten. Spannend wird es, wenn wir anschauen, wie deine Energie, deine Entscheidungen, deine Kommunikation und deine Wirkung zusammenspielen.</div>
    <div class="cta-url">Human Design Business Reading: stupperich.de</div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span class="footer-text">stupperich.de</span>
    <span class="footer-text">${data.calculationSource ?? "Swiss Ephemeris"}</span>
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Bitte erlaube Pop-ups für diese Seite, um das PDF zu erstellen.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
}
