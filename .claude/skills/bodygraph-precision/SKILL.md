---
name: bodygraph-precision
description: >
  Präzisions-Protokoll für Bodygraph-Änderungen. Verwende diesen Skill bei JEDER
  Änderung am Bodygraph (Bodygraph.tsx, globals.css SVG-Klassen, ChartDisplay gates/props).
  Erzwingt ein striktes Minimal-Change-Prinzip: nur genau das ändern, was explizit
  angefordert wurde — nichts mehr, nichts weniger.
  Trigger: bodygraph ändern, gate position, kanal farbe, zentrum farbe, variable dreieck,
  SVG klasse, channel stripe, gate circle, bodygraph fix, bodygraph anpassen.
---

# Bodygraph Precision Protocol

Dieser Skill gilt für JEDE Änderung an:
- `frontend/components/Bodygraph.tsx`
- `frontend/styles/globals.css` (SVG-Farbklassen)
- `frontend/components/ChartDisplay.tsx` (nur Bodygraph-Props)

---

## Pflichtschritte VOR jeder Änderung

### 1. Lies die aktuelle Datei komplett
Bevor auch nur eine Zeile geändert wird: die Zieldatei vollständig lesen.
```
Read: frontend/components/Bodygraph.tsx  (vollständig, alle Zeilen)
```

### 2. Identifiziere exakt die betroffenen Zeilen
Benenne die **genauen Zeilennummern**, die geändert werden:
- „Zeile 42: `const GP: ...`" — nur diese Zeile
- „Zeilen 88–95: `renderCh()`-Funktion" — nur dieser Block

### 3. Formuliere die Änderung als Diff
Zeige gedanklich:
```
- alte Zeile(n)
+ neue Zeile(n)
```
Wenn die Diff-Prüfung zeigt, dass mehr als das Angeforderte geändert wird → STOPP, Scope reduzieren.

---

## Goldene Regeln

| Regel | Bedeutung |
|-------|-----------|
| **Nur angeforderte Elemente** | Gate-Position geändert → nur GATE_POS-Eintrag, nicht renderGate() |
| **Keine Refactorings** | Funktionsnamen, Variablennamen, Struktur bleiben unberührt |
| **Keine Formatierung** | Einrückung/Whitespace nur wenn explizit verlangt |
| **Keine Abhängigkeiten anfassen** | Wenn Gate-Kreis-Radius geändert wird → nicht gleichzeitig Stroke-Width anpassen |
| **Keine Kommentare hinzufügen** | Außer explizit gefordert |
| **Keine CSS-Klassen umbennen** | Auch wenn ein anderer Name besser klingt |

---

## Kontrollcheckliste nach der Änderung

Vor dem Abschließen verifizieren:

- [ ] Wurde **genau und nur** das geändert, was angefordert wurde?
- [ ] Wurden **keine anderen Zeilen** verändert (auch keine Leerzeilen, Einrückungen)?
- [ ] Ist der `git diff` minimal — keine Überraschungen?
- [ ] Funktioniert der Bodygraph noch (`preview_screenshot` oder `npm run build`)?

---

## Typische Präzisions-Änderungen am Bodygraph

### Gate-Position anpassen
```typescript
// NUR diesen einen Eintrag in GP ändern:
17: [243, 184],  // vorher
17: [240, 180],  // nachher — nur x,y angepasst
```
→ Nichts anderes in GP, nichts in renderGate(), nichts in CG.

### CSS-Farbe anpassen
```css
/* NUR diese eine Zeile in globals.css: */
.fill-col_design { fill: #d8cefd; }  /* vorher */
.fill-col_design { fill: #c8baff; }  /* nachher */
```
→ Keine anderen CSS-Regeln anfassen.

### Kanal-Offset ändern
```typescript
// NUR den d-Parameter in perp():
const [nx, ny] = perp(ax, ay, bx, by, 2.5);  /* vorher */
const [nx, ny] = perp(ax, ay, bx, by, 3.0);  /* nachher */
```
→ Nicht strokeWidth ändern, nicht renderCh() umschreiben.

### Gate-Kreis-Radius ändern
```typescript
<circle cx={x} cy={y} r="7"   /* vorher */
<circle cx={x} cy={y} r="8"   /* nachher */
```
→ Nur `r`-Attribut, nichts am `text`-Element, nichts an Farben.

---

## Was dieser Skill NICHT erlaubt

- ❌ „Während ich Gate 17 verschiebe, verbessere ich auch die perp()-Funktion"
- ❌ „Ich refactore gleichzeitig die Kanal-Renderfunktion für Klarheit"
- ❌ „Ich passe noch schnell die Schriftgröße der Gate-Nummern an"
- ❌ „Ich entferne die veralteten Kommentare während der Änderung"
- ❌ „Ich optimiere die useMemo-Dependencies nebenbei"

Jeder dieser Sätze = separater Commit, separate Anfrage.

---

## Kommunikation mit dem User

Nach der Änderung:
1. **Exakt nennen** was geändert wurde: Datei + Zeile(n)
2. **Nicht mehr** als das Ergebnis der Anfrage beschreiben
3. Screenshot/Verifikation nur wenn sinnvoll (sichtbare Änderung)
