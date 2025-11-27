# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - heading "Human Design Chart Generator" [level=1] [ref=e4]
      - generic [ref=e5]:
        - generic [ref=e6]:
          - generic [ref=e7]: Vorname
          - textbox "Vorname" [ref=e8]:
            - /placeholder: Marie
            - text: Max
        - generic [ref=e9]:
          - generic [ref=e10]: Geburtsdatum
          - textbox "Geburtsdatum" [ref=e11]:
            - /placeholder: 23.11.1992
            - text: invalid-date
          - paragraph [ref=e12]: Ungültiges Datumsformat. Bitte verwenden Sie TT.MM.JJJJ.
          - paragraph [ref=e13]: "Format: TT.MM.JJJJ"
        - generic [ref=e14]:
          - generic [ref=e15]: Geburtszeit
          - textbox "Geburtszeit" [ref=e16]:
            - /placeholder: 14:30
            - text: 14:30
          - paragraph [ref=e17]: "Format: HH:MM"
          - generic [ref=e19]:
            - checkbox "Geburtszeit ungefähr / unbekannt" [ref=e20]
            - generic [ref=e21]: Geburtszeit ungefähr / unbekannt
        - generic [ref=e22]:
          - generic [ref=e23]: Geburtsort
          - textbox "Geburtsort" [ref=e24]:
            - /placeholder: Berlin, Germany
            - text: Berlin, Germany
        - button "Chart Generieren" [active] [ref=e25] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e31] [cursor=pointer]:
    - img [ref=e32]
  - alert [ref=e35]
```