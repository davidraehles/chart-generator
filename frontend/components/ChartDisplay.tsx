"use client";

import { ChartRequest, ChartResponse, Center } from "@/types/chart";
import { LABELS } from "@/utils/constants";
import {
  getTypeMetadata,
  getProfileMetadata,
  getAuthorityLabel,
  getAuthorityBusinessText,
  getCenterTexts,
} from "@/utils/hdTypeMapping";
import { generateAndDownloadPdf } from "@/utils/generatePdf";
import EmailCaptureSection from "@/components/EmailCaptureSection";

// ── Konfigurierbare CTA-URLs ──────────────────────────────────────────────────
const CTA_AUTORITAET_URL = "https://stupperich.de"; // TODO: Autoritäts-Check URL
const CTA_READING_URL    = "https://stupperich.de"; // TODO: Business-Reading URL

// ── Design-Tokens ─────────────────────────────────────────────────────────────
const ACCENT   = "#5F7680";
const ACCENT_BG = "rgba(95, 118, 128, 0.09)"; // sehr helles Teal für definierte Zentren
const CARD     = "#F9F7F4";
const BORDER   = "#E8E3DC";
const DIVIDER  = "#EFEFEF";
const DARK     = "#1A2126";
const BODY     = "#2D3748"; // Anthrazit statt Braun
const MUTED    = "#6B7280";
const WARM     = "#B8956A";

// ── SVG Icons ─────────────────────────────────────────────────────────────────
function Icon({ name, size = 15, color = ACCENT }: { name: string; size?: number; color?: string }) {
  const paths: Record<string, React.ReactNode> = {
    bolt:         <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
    target:       <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    key:          <><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></>,
    layers:       <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>,
    trendingUp:   <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
    trendingDown: <><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></>,
    lightbulb:    <><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 006 8c0 1.3.5 2.6 1.5 3.5.7.7 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></>,
    eye:          <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    mic:          <><path d="M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></>,
    radio:        <><rect x="2" y="8" width="20" height="13" rx="2"/><path d="M9 8V5l7-3"/><circle cx="7.5" cy="14.5" r="2"/><line x1="13" y1="11" x2="20" y2="11"/><line x1="13" y1="15" x2="20" y2="15"/></>,
    compass:      <><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></>,
    heart:        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>,
    zap:          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
    shield:       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    activity:     <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    anchor:       <><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0020 0h-3"/></>,
    bubble:       <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,
    download:     <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    mail:         <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    arrowRight:   <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ flexShrink: 0 }}>
      {paths[name]}
    </svg>
  );
}

const CENTER_ICONS: Record<string, string> = {
  head: "lightbulb", ajna: "eye", throat: "bubble", g: "compass",
  heart: "heart", sacral: "zap", spleen: "shield", solar: "activity", root: "anchor",
};

// Deutsche HD-Zentren-Namen (für den kleinen Untertitel)
const HD_CENTER_NAMES: Record<string, string> = {
  head:   "Inspirations-Zentrum",
  ajna:   "Verstandes-Zentrum",
  throat: "Kehl-Zentrum",
  g:      "Selbst-Zentrum",
  heart:  "Herz/Ego-Zentrum",
  sacral: "Sakral-Zentrum",
  spleen: "Milz-Zentrum",
  solar:  "Emotions-Zentrum",
  root:   "Wurzel-Zentrum",
};

function isDefined(type: string) { return type === "defined" || type === "unconscious"; }

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 px-2.5 py-1"
      style={{ color: "#FFFFFF", background: "#3D465A", borderRadius: "3px" }}>
      {children}
    </p>
  );
}

// Zeile in Business-Basis
function BasisRow({
  icon, label, businessTitle, valueContent, businessText, last = false, containerClassName = "",
}: {
  icon: string; label: string; businessTitle?: string;
  valueContent: React.ReactNode; businessText?: string; last?: boolean; containerClassName?: string;
}) {
  return (
    <div className={`px-5 py-4 ${containerClassName}`}
      style={{ borderBottom: last ? "none" : `0.5px solid ${DIVIDER}`, borderLeft: `3px solid ${ACCENT}` }}>
      <div className="inline-flex items-center gap-1.5 mb-2 px-2 py-0.5" style={{ background: `${ACCENT}18`, borderRadius: "3px" }}>
        <Icon name={icon} size={11} color={ACCENT} />
        <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: ACCENT }}>{label}</p>
      </div>
      {businessTitle && (
        <p className="text-xs font-semibold mb-2" style={{ color: ACCENT }}>{businessTitle}</p>
      )}
      <div className="mb-1">{valueContent}</div>
      {businessText && (
        <p className="text-xs leading-relaxed mt-2" style={{ color: BODY }}>{businessText}</p>
      )}
    </div>
  );
}

// ── Hauptkomponente ───────────────────────────────────────────────────────────
export default function ChartDisplay({
  data, inputData, onReset,
}: {
  data: ChartResponse; inputData: ChartRequest | null; onReset: () => void;
}) {
  const typeMeta         = getTypeMetadata(data.type.code);
  const profileMeta      = getProfileMetadata(data.profile.code);
  const profileValue     = profileMeta ? `${data.profile.code} – ${profileMeta.label}` : data.profile.code;
  const authorityLabel   = getAuthorityLabel(data.authority.code);
  const authorityBizText = getAuthorityBusinessText(data.authority.code);

  function handlePdfDownload() {
    generateAndDownloadPdf(data, inputData);
  }

  return (
    <div className="space-y-8 pb-12" style={{ background: "#FFFFFF" }}>

      {/* ── 1. HEADER ── */}
      <div>
        <div className="flex justify-end mb-5">
          <button onClick={onReset}
            className="text-xs px-3 py-1.5 hover:bg-gray-50 transition-colors"
            style={{ border: `0.5px solid ${BORDER}`, color: ACCENT }}>
            {LABELS.newChart}
          </button>
        </div>
        <div style={{ borderLeft: `3px solid ${ACCENT}`, paddingLeft: "16px", marginBottom: "20px" }}>
          <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: ACCENT }}>
            Human Design · Business Energy Calculator
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ color: DARK }}>
            Deine Business-Energie Auswertung
          </h1>
          <p className="text-sm mt-1" style={{ color: BODY }}>
            Wie du arbeitest, entscheidest und im Business wirkst.
          </p>
        </div>
        <div className="px-5 py-4" style={{ background: CARD, border: `0.5px solid ${BORDER}` }}>
          <p className="font-semibold text-base" style={{ color: DARK }}>
            {data.firstName}{inputData?.lastName ? ` ${inputData.lastName}` : ""}
          </p>
          {inputData && (
            <p className="text-sm mt-0.5" style={{ color: MUTED }}>
              {inputData.birthDate}
              {inputData.birthTime && ` · ${inputData.birthTime} Uhr`}
              {inputData.birthPlace && ` · ${inputData.birthPlace}`}
            </p>
          )}
        </div>
      </div>

      {/* ── 2. BUSINESS-BASIS ── */}
      <div>
        <SectionLabel>Deine Business-Basis</SectionLabel>
        <div className="-mx-4 md:-mx-8 px-4 md:px-8 py-6" style={{ background: "rgba(95,118,128,0.06)" }}>
        <div style={{ border: `0.5px solid ${BORDER}` }}>
          {/* Intro */}
          <div className="px-5 py-3" style={{ borderBottom: `0.5px solid ${DIVIDER}`, background: CARD }}>
            <p className="text-sm" style={{ color: BODY }}>
              Vier Aspekte deines Human Designs, die zeigen, wie du arbeitest, Chancen aufgreifst, Einfluss nimmst und Entscheidungen triffst.
            </p>
          </div>

          {/* 2×2 Raster auf Desktop, untereinander auf Mobile */}
          <div className="basis-grid">
            <BasisRow
              icon="bolt" label="Arbeitsenergie"
              businessTitle="Wie du am effektivsten arbeitest"
              containerClassName="basis-cell-tl"
              valueContent={
                <span className="text-sm font-semibold" style={{ color: DARK }}>
                  {data.type.label}{typeMeta?.merkmal ? ` = ${typeMeta.merkmal}` : ""}
                </span>
              }
              businessText={typeMeta?.typeBusinessText}
            />

            <BasisRow
              icon="target" label="Strategie"
              businessTitle="Wie du Chancen & Aufgaben angehst"
              containerClassName="basis-cell-tr"
              valueContent={
                <span className="text-sm font-semibold" style={{ color: DARK }}>
                  {typeMeta?.strategieLabel ?? typeMeta?.strategie ?? "–"}
                </span>
              }
              businessText={typeMeta?.strategieBusinessText}
            />

            <BasisRow
              icon="layers" label="Profil"
              businessTitle="Wie du Einfluss nimmst"
              containerClassName="basis-cell-bl"
              valueContent={
                <span className="text-sm font-semibold" style={{ color: DARK }}>{profileValue}</span>
              }
              businessText={profileMeta?.businessText}
            />

            <BasisRow
              icon="key" label="Entscheidungs-Architektur"
              businessTitle="Wie du wichtige Entscheidungen triffst"
              containerClassName="basis-cell-br"
              valueContent={
                <span className="text-sm font-semibold" style={{ color: DARK }}>{authorityLabel}</span>
              }
              businessText={authorityBizText ?? undefined}
              last
            />
          </div>
        </div>
        </div>
      </div>

      {/* ── 3. ENTSCHEIDUNGS-ARCHITEKTUR CTA ── */}
      <div className="px-5 py-6" style={{ background: CARD, border: `0.5px solid ${BORDER}` }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
          Deine Entscheidungs-Architektur vertiefen
        </p>
        <p className="text-sm mb-5 leading-relaxed" style={{ color: BODY }}>
          Du kennst jetzt deine Entscheidungs-Architektur. Erfahre, wie du sie im Führungsalltag aktiv nutzt, auch unter Zeitdruck und Erwartungen von außen.
        </p>
        <a href={CTA_AUTORITAET_URL} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 transition-opacity hover:opacity-80"
          style={{ background: ACCENT, color: "#fff" }}>
          Meine Entscheidungs-Architektur vertiefen
          <Icon name="arrowRight" size={14} color="#fff" />
        </a>
      </div>

      {/* ── 4. ENERGIE-KOMPASS ── */}
      {typeMeta && (
        <div>
          <SectionLabel>Energie-Kompass</SectionLabel>
          <p className="text-sm mb-4" style={{ color: BODY }}>
            Dein Energie-Kompass zeigt dir zwei typische Signale, an denen du erkennst, ob deine Arbeitsweise gerade wirklich zu dir passt.
          </p>
          <div className="grid grid-cols-2"
            style={{ border: `0.5px solid ${BORDER}` }}>
            <div className="px-5 py-4" style={{ background: CARD }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon name="trendingUp" size={13} />
                <p className="text-xs uppercase tracking-wider font-medium" style={{ color: MUTED }}>
                  In deiner Energie
                </p>
              </div>
              <p className="text-base font-semibold mb-2" style={{ color: ACCENT }}>{typeMeta.higherSelf}</p>
              <p className="text-xs leading-relaxed" style={{ color: BODY }}>
                Dein inneres Zeichen, dass du auf dem richtigen Weg bist.
              </p>
            </div>
            <div className="px-5 py-4" style={{ background: CARD }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon name="trendingDown" size={13} color={WARM} />
                <p className="text-xs uppercase tracking-wider font-medium" style={{ color: MUTED }}>
                  Dein Warnsignal
                </p>
              </div>
              <p className="text-base font-semibold mb-2" style={{ color: WARM }}>{typeMeta.notSelf}</p>
              <p className="text-xs leading-relaxed" style={{ color: BODY }}>
                Dein Hinweis, wann du dich von deiner natürlichen Energie entfernst.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. ENERGIEZENTREN ── */}
      <div>
        <SectionLabel>Deine Energie im Business</SectionLabel>
        <h2 className="text-base font-semibold mb-1" style={{ color: DARK }}>Deine 9 Energiezentren</h2>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: BODY }}>
          Jeder Mensch hat im Human Design dieselben neun Energiezentren, jedes steht für ein anderes Thema. Je nach persönlichem Design sind sie definiert oder offen. Im Business zeigen sie, wie du arbeitest, Führungsverantwortung übernimmst, kommunizierst und auf andere wirkst.
        </p>

        {/* Legende VOR den Zentren */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-4 rounded-xl" style={{ background: ACCENT_BG, border: `1.5px solid rgba(95,118,128,0.3)` }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>Definiert</p>
              <Icon name="mic" size={12} color={ACCENT} />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: BODY }}>
              Konstante Energie, die dir verlässlich zur Verfügung steht und die du nach außen ausstrahlst. Stell es dir wie ein Mikrofon vor: Du sendest diese Energie in dein Umfeld.
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: "#FFFFFF", border: `1.5px solid ${BORDER}` }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFFFFF", border: `1.5px solid ${BORDER}`, flexShrink: 0 }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Offen</p>
              <Icon name="radio" size={12} color={MUTED} />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: BODY }}>
              Ein Bereich, in dem du besonders empfänglich für die Energie anderer bist. Das funktioniert wie ein Radio: Du empfängst, was in deinem Umfeld sendet, und verstärkst es häufig.
            </p>
          </div>
        </div>
        <p className="text-xs mb-5 italic" style={{ color: MUTED }}>
          Es gibt kein besser oder schlechter, nur anders. Beide Zustände haben ihre eigene Stärke.
        </p>

        {/* Zentren-Liste */}
        <div className="space-y-2">
          {data.centers.map((center: Center) => {
            const defType    = center.definitionType ?? (center.defined ? "defined" : "open");
            const defined    = isDefined(defType);
            const ct         = getCenterTexts(center.code);
            const desc       = ct ? (defined ? ct.defined : ct.open) : null;
            const iconName   = CENTER_ICONS[center.code] ?? "target";

            return (
              <div key={center.code} className="rounded-xl overflow-hidden"
                style={{
                  border: defined ? `0.5px solid rgba(95,118,128,0.25)` : `1.5px solid ${BORDER}`,
                  borderLeft: `3px solid ${defined ? ACCENT : "#D4CFC8"}`,
                  background: defined ? ACCENT_BG : "#FFFFFF",
                }}>
                <div className="px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Icon name={iconName} size={15} color={defined ? ACCENT : "#C4BEB8"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-base font-semibold leading-tight block mb-0.5"
                        style={{ color: defined ? DARK : "#5A6370" }}>
                        {ct?.businessTitle ?? center.name}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs" style={{ color: MUTED }}>
                          {HD_CENTER_NAMES[center.code] ?? center.name}, bei dir{" "}
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: defined ? ACCENT : "#FFFFFF", border: defined ? "none" : `1.5px solid ${BORDER}`, display: "inline-block", flexShrink: 0 }} />
                          <em>{defined ? "definiert" : "offen"}</em>
                          <Icon name={defined ? "mic" : "radio"} size={10} color={defined ? ACCENT : MUTED} />
                        </span>
                        {ct && (
                          <span className="text-xs" style={{ color: MUTED }}>· {ct.themen}</span>
                        )}
                      </div>
                      {desc && (
                        <p className="text-xs leading-relaxed mt-2" style={{ color: BODY }}>{desc}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 6. PDF HERUNTERLADEN ── */}
      <div className="px-5 py-5" style={{ background: CARD, border: `0.5px solid ${BORDER}` }}>
        <p className="text-sm font-semibold mb-1" style={{ color: DARK }}>
          Speichere deine Business-Energie
        </p>
        <p className="text-xs mb-4" style={{ color: MUTED }}>
          Nimm deine Auswertung mit - als Erinnerung für deinen Alltag.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handlePdfDownload}
            className="flex items-center justify-center gap-2 text-sm px-4 py-2.5 transition-opacity hover:opacity-80"
            style={{ border: `0.5px solid ${BORDER}`, color: BODY }}>
            <Icon name="download" size={14} color={BODY} />
            PDF herunterladen
          </button>
          {/* E-Mail-Versand vorübergehend ausgeblendet — wird später aktiviert
          <button disabled className="flex items-center justify-center gap-2 text-sm px-4 py-2.5 opacity-40 cursor-not-allowed"
            style={{ border: `0.5px solid ${BORDER}`, color: BODY }}>
            <Icon name="mail" size={14} color={BODY} />
            Ergebnis per E-Mail erhalten
          </button>
          */}
        </div>
      </div>

      {/* ── 7. TRIGGER-LETTERS ── */}
      <EmailCaptureSection
        hdType={data.type.code}
        firstName={data.firstName}
      />

      {/* ── 8. HUMAN DESIGN BUSINESS READING ── */}
      <div className="px-6 py-8 text-center" style={{ background: DARK }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
          Human Design Business Reading
        </p>
        <p className="text-lg font-semibold mb-3 leading-snug" style={{ color: "#F9F7F4" }}>
          Jetzt kennst du die einzelnen Facetten. Im Reading schauen wir auf das Zusammenspiel.
        </p>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: "#A8B4B6" }}>
          Wie wirken deine Energie, deine Entscheidungen, deine Kommunikation und deine Führung zusammen?
        </p>
        <a href={CTA_READING_URL} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 transition-opacity hover:opacity-90"
          style={{ background: ACCENT, color: "#fff" }}>
          Mein Human Design Business Reading entdecken
          <Icon name="arrowRight" size={14} color="#fff" />
        </a>
      </div>

      <p className="text-right text-xs" style={{ color: "#C4BEB8" }}>
        {data.calculationSource || "Swiss Ephemeris"}
      </p>
    </div>
  );
}
