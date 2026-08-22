# Aufbau der Seite und des Body Graph SVG – codesoflife.com

## Technologie-Stack

Die Seite basiert auf **Next.js** (App Router) mit **React** als UI-Framework und **Tailwind CSS** für das Styling. Die Farbklassen wie `fill-col_design`, `fill-col_personality` etc. sind Tailwind-Custom-Properties.

---

## Seitenstruktur (HTML-Layout)

```
<region> (Hauptcontainer)
  ├── <region> (Chart-Header: Name, Geburtsdaten, Navigation)
  ├── #chart_container_svg  ← der SVG-Wrapper-Div
  │     └── <svg viewBox="0 0 520 758.4">
  ├── Liste mit Gate-Links (Design-Seite, 19 Planeten)
  ├── Liste mit Gate-Links (Personality-Seite, 19 Planeten)
  ├── Navigationsleiste (Typ, Autorität, Profil, Zentren, Kanäle, Planeten)
  └── Inhaltsbereich (Typ-Text, Kanäle, Beschreibungen, BTL-Infos)
```

---

## SVG-Struktur des Body Graphs

Das SVG hat **viewBox="0 0 520 758.4"** und ist in React als JSX gebaut. Die Gesamtstruktur:

```
<svg viewBox="0 0 520 758.4">
  <g>
    <g id="Lines">
      <g id="Group" transform="translate(3, 16)">
        ├── [Kanal-Gruppen]        ← die Verbindungslinien
        ├── <g id="Centers">       ← die 9 Zentren
        ├── <g id="Awareness">     ← Variable-Dreieck rechts oben
        ├── <g id="Perspective">   ← Variable-Dreieck rechts unten
        ├── <g id="Digestion">     ← Variable-Dreieck links oben
        └── <g id="Environment">   ← Variable-Dreieck links unten
```

---

## Die Kanal-Gruppen (Verbindungslinien)

Jeder mögliche Kanal ist eine **`<g id="[gate1]-[gate2]">`** mit `transform="translate(x,y)"`. Darin sind **4 `<rect>`-Elemente** (je 5px breit, unterschiedlich hoch):

```svg
<g id="3-60" class="cursor-pointer" transform="translate(176, 56)">
  <rect id="personality-60" class="fill-col_design"      x="76.6" y="551.7" width="5" height="20"/>
  <rect id="design-60"      class="fill-col_design"      x="81.6" y="551.7" width="5" height="20"/>
  <rect id="personality-3"  class="fill-col_personality" x="76.6" y="533.4" width="5" height="18.3"/>
  <rect id="design-3"       class="fill-col_personality" x="81.6" y="533.5" width="5" height="18.3"/>
</g>
```

- **Linke 2 Rects** = Personality-Seite (schwarz)
- **Rechte 2 Rects** = Design-Seite (lila)
- Aktiver Kanal → `class="cursor-pointer"`, Farbe ändert sich über CSS-Klasse

Komplexere Kanäle (z.B. `57-20-34-10` mit mehreren Toren) bestehen aus **`<path>`-Elementen** statt Rects, die als gebogene Linien zwischen den Zentren verlaufen:

```svg
<g id="57-20-34-10" transform="translate(36, 289)">
  <g><path class="fill-secondary" d="M66.1,152.2..."/>         <!-- inaktive Segmente -->
  <g><path id="personality-34" class="fill-secondary" d="..."/>
  <g><path id="design-34"      class="fill-secondary" d="..."/>
  <g><path id="personality-57" class="fill-col_personality" d="..."/>  <!-- aktiv! -->
  ...
</g>
```

---

## Die Zentren (`<g id="Centers">`)

9 Zentren, jedes eine `<g>` mit eigenem `transform`:

| Zentrum-ID           | Zentrum       | Position (translate)   |
|----------------------|---------------|------------------------|
| InspirationCenter    | Kopfzentrum   | translate(156, 0)      |
| AjnaCenter           | Ajna          | translate(156, 111)    |
| ThroatCenter         | Hals          | translate(158, 236)    |
| SelfCenter           | G/Selbst      | translate(140, 333)    |
| EgoCenter            | Ego/Herz      | translate(253, 414)    |
| SacralCenter         | Sakral        | translate(158, 499)    |
| EmotionsCenter       | Emotionen     | translate(313, 487)    |
| SplenicCenter        | Milz          | translate(0, 487)      |
| RootCenter           | Wurzel        | translate(158, 610)    |

Jedes Zentrum enthält:
1. **`<path id="[name]-center">`** — die geometrische Form des Zentrums (Viereck, Dreieck, Raute...)
2. Pro Gate: ein **`<circle>`** (r=7) + **`<text>`** mit der Gate-Nummer

### Farbcodierung der Zentren (CSS-Klassen)

| CSS-Klasse        | Farbe                    | Bedeutung               |
|-------------------|--------------------------|-------------------------|
| fill-col_design   | lila/violett #d8cefd     | Design definiert        |
| fill-secondary    | hellgrau #f1f1f1         | undefiniert             |
| fill-col_personality / fill-primary | schwarz #000 | Personality definiert |

### Farbcodierung der Gate-Kreise

| CSS-Klasse                              | Bedeutung                     |
|-----------------------------------------|-------------------------------|
| fill-white + font-semibold              | aktiv (Personality-Seite)     |
| fill-col_design                         | aktiv (Design-Seite)          |
| fill-none stroke stroke-col_cta         | aktiv (beide / col), Umriss orange-rot #ff706e |
| fill-none (kein stroke)                 | inaktiv                       |

---

## Die Variablen-Dreiecke

```svg
<g id="Awareness" transform="matrix(1 0 0 1 370 68)">
  <polygon class="fill-col_personality arrowleft" points="50,40 0,80 0,0"/>
  <text id="PersonalitySunTone">2</text>    <!-- Ton (klein) -->
  <text id="PersonalitySunColor">5</text>   <!-- Farbe (groß) -->
</g>
```

4 Dreiecke zeigen die **Variable** (Tone + Color von Personality Sun/NN und Design Sun/NN).
Die Pfeil-Richtung (`arrowleft`/`arrowright`) kommt aus dem `variableCode` (z.B. `"LRRR"` = Links-Rechts-Rechts-Rechts).

| Gruppen-ID   | Inhalt                      | Position            |
|--------------|-----------------------------|---------------------|
| Awareness    | Personality Sun (Ton+Farbe) | matrix(1 0 0 1 370 68)  |
| Perspective  | Personality NN  (Ton+Farbe) | matrix(1 0 0 1 370 160) |
| Digestion    | Design Sun      (Ton+Farbe) | matrix(1 0 0 1 95 68)   |
| Environment  | Design NN       (Ton+Farbe) | matrix(1 0 0 1 95 160)  |

---

## Daten-Fluss (React)

Die Rohdaten kommen als **`chart`-Prop** in die React-Komponente:

```json
{
  "personality": [
    { "name":"sun", "gate":50, "line":1, "color":5, "tone":2, "base":1,
      "zodiac":"libra", "house":1, "isRetrogade":false, ... },
    ...
  ],
  "design": [
    { "name":"sun", "gate":56, "line":3, "color":5, "tone":6, "base":5,
      "zodiac":"cancer", "house":9, ... },
    ...
  ],
  "gates": {
    "personality": [50, 3, 39, 38, 9, 57, 44, 14, 21, 13, 40, 1, 64],
    "design":      [56, 60, 53, 54, 4, 33, 53, 6, 51, 49, 59, 44, 40],
    "col":         [37, 43, 18, 17, 58, 52, 63, 44, 43, 23, 55, 59]
  },
  "channel":          ["13-33", "3-60", "6-59"],
  "definedCenters":   { "design": ["self","throat","sacral","root","emotions"], "personality": [] },
  "undefinedCenters": ["splenic","ego","ajna","inspiration"],
  "variableCode":     "LRRR",
  "properties": {
    "type":          "generator",
    "profile":       "1/3",
    "innerAuthority":"emotional",
    "definition":    "split"
  }
}
```

### Render-Logik (Zusammenfassung)

Das SVG ist **statisch vorgebaut** — alle 64 Gates, alle Kanäle, alle Zentren sind immer im DOM vorhanden. Die **Personalisierung erfolgt rein über CSS-Klassen**, die je nach Daten zugewiesen werden:

- **Zentren**: `fill-col_design` / `fill-secondary` je nach `definedCenters`
- **Gate-Kreise**: `fill-white` / `fill-none` / `stroke-col_cta` je nach `gates.personality` / `gates.design` / `gates.col`
- **Kanal-Rects/-Paths**: aktive Farbe wenn Gate in aktivem Kanal (`channel`-Array)
- **Variable-Dreiecke**: `arrowleft` / `arrowright` je nach `variableCode`-Buchstabe (L/R)

---

## CSS Custom Properties (Farben)

| Variable / Klasse       | Wert              | Bedeutung           |
|-------------------------|-------------------|---------------------|
| --color-col_composite   | #8c52ff           | Composite/Lila      |
| --color-col_cta         | #ff706e           | CTA / Col-Gates     |
| --color-col_gray        | #f1f1f1           | Grau (undefiniert)  |
| fill-col_design         | rgb(216, 206, 253)| Design-Lila         |
| fill-col_personality    | rgb(0, 0, 0)      | Personality-Schwarz |
| fill-secondary          | rgb(241, 241, 241)| Inaktiv-Grau        |
| stroke-col_cta          | rgb(255, 112, 110)| Col-Gate-Orange/Rot |

---

*Analysiert am 23.06.2026 auf codesoflife.com*
