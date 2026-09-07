/**
 * Human Design Mappings — Quelle: content/Bezeichnungen-Texte.xlsx
 * Letzte Aktualisierung: 19.08.26
 */

export interface TypeMetadata {
  merkmal: string;
  strategie: string;           // HD-Begriff (sekundär, klein)
  strategieLabel: string;      // Business-Kurzform (prominent)
  strategieBusinessText: string;
  typeBusinessText: string;    // "Du bist stark, wenn…"
  higherSelf: string;
  notSelf: string;
}

// Werte aus Sheet "Typ, Strateg, Higher, Not Self"
const HD_TYPE_MAPPING: Record<string, TypeMetadata> = {
  "1": {
    merkmal: "Macher & Umsetzer",
    strategie: "Auf das Leben reagieren",
    strategieLabel: "Reagieren statt erzwingen",
    strategieBusinessText:
      "Du musst nicht alles selbst anstoßen. Deine stärkste Energie entsteht, wenn du auf konkrete Chancen, Anforderungen oder Impulse reagierst, die etwas in dir auslösen. Genau dort lohnt es sich, deine Energie und Priorität einzusetzen.",
    typeBusinessText:
      "Du bist stark, wenn du dich auf Arbeit einlässt, die dich wirklich antreibt, und mit konstanter Energie anderen zeigst, was echte Ausdauer bedeutet.",
    higherSelf: "Befriedigung/Freude",
    notSelf: "Frustration",
  },
  "2": {
    merkmal: "Multitalentierter Macher",
    strategie: "Auf das Leben reagieren und den Moment der Wahrheit spüren",
    strategieLabel: "Reagieren und eigenen Weg finden",
    strategieBusinessText:
      "Du musst nicht alles selbst anstoßen. Deine stärksten Schritte entstehen, wenn etwas im Außen eine klare Reaktion in dir auslöst, und du dabei deinen eigenen, oft direkteren Weg findest.",
    typeBusinessText:
      "Du bist stark, wenn du mehrere Themen verbinden, Dinge voranbringen und deinen eigenen effizienten Weg finden kannst.",
    higherSelf: "Befriedigung/Freude",
    notSelf: "Frustration",
  },
  "3": {
    merkmal: "Leader",
    strategie: "Einladung und Anerkennung spüren",
    strategieLabel: "Eingeladen werden, nicht drängen",
    strategieBusinessText:
      "Deine Wirkung entfaltet sich, wenn andere deinen Blick aktiv anfragen. Dränge dich nicht auf, warte auf den Moment, in dem du erkannt und eingeladen wirst.",
    typeBusinessText:
      "Du bist stark, wenn du erkannt und eingeladen wirst, deinen Blick auf Systeme und Menschen einzubringen. Deine Beobachtungsgabe ist dein schärfstes Werkzeug.",
    higherSelf: "Erfolg",
    notSelf: "Bitterkeit",
  },
  "4": {
    merkmal: "Visionär",
    strategie: "Informieren",
    strategieLabel: "Informieren, dann handeln",
    strategieBusinessText:
      "Du kannst Dinge in Bewegung setzen, bevor andere auch nur daran denken. Informiere dein Umfeld, bevor du handelst – das schafft Vertrauen statt Widerstand.",
    typeBusinessText:
      "Du bist stark, wenn du Impulse frei initiieren und dein Umfeld frühzeitig in deine Pläne einbeziehen kannst.",
    higherSelf: "Innerer Frieden",
    notSelf: "Wut",
  },
  "5": {
    merkmal: "Seismograf",
    strategie: "Den Mondzyklus (28 Tage) respektieren",
    strategieLabel: "Zeit nehmen statt erzwingen",
    strategieBusinessText:
      "Du brauchst Zeit und Abstand, um klare Impulse zu spüren. Warte möglichst einen Mondzyklus ab, bevor du große Entscheidungen triffst.",
    typeBusinessText:
      "Du bist stark, wenn du Systeme, Teams und Situationen aus der Außenperspektive beobachtest und benennen kannst, was andere schlicht nicht sehen.",
    higherSelf: "Überraschung",
    notSelf: "Enttäuschung",
  },
};

export function getTypeMetadata(typeCode: string): TypeMetadata | null {
  return HD_TYPE_MAPPING[typeCode] ?? null;
}

// Werte aus Sheet "Profile"
export interface ProfileMetadata {
  label: string;
  businessText: string; // "Wie du Einfluss nimmst"
}

const HD_PROFILE_MAPPING: Record<string, ProfileMetadata> = {
  "1/3": {
    label: "Forschender Veränderer",
    businessText:
      "Dein Einfluss entsteht durch fundiertes Wissen und eigene Erfahrung. Du weißt, wovon du sprichst, weil du es selbst erprobt hast.",
  },
  "1/4": {
    label: "Mutiger Netzwerker",
    businessText:
      "Dein Einfluss entsteht durch Expertise und Netzwerk. Du verbindest fundiertes Wissen mit persönlichen Beziehungen.",
  },
  "2/4": {
    label: "Selektiver Netzwerker",
    businessText:
      "Dein Einfluss entsteht durch dein natürliches Talent und selektive Beziehungen. Andere sehen Stärken in dir, die du selbst manchmal noch unterschätzt.",
  },
  "2/5": {
    label: "Selektiver Problemlöser",
    businessText:
      "Dein Einfluss entsteht, weil andere in dir eine Lösung sehen. Du wirst für Probleme gerufen, die andere nicht lösen können.",
  },
  "3/5": {
    label: "Erfahrener Problemlöser (Troubleshooter)",
    businessText:
      "Dein Einfluss entsteht durch praktische Erfahrung und pragmatische Lösungen. Was bei dir funktioniert, hat den Praxistest bestanden.",
  },
  "3/6": {
    label: "Erfahrenes Vorbild",
    businessText:
      "Dein Einfluss entsteht durch deinen Erfahrungsweg und deine Vorbildwirkung. Dein Weg ist deine Glaubwürdigkeit.",
  },
  "4/6": {
    label: "Einflussreiches Vorbild",
    businessText:
      "Dein Einfluss entsteht über Beziehungen und deine Vorbildwirkung. Menschen schauen auf dich, weil du selbst einen klaren Weg gegangen bist.",
  },
  "4/1": {
    label: "Einflussreiche Autorität",
    businessText:
      "Dein Einfluss entsteht über Beziehungen und fundiertes Wissen. Menschen vertrauen dir, wenn du weißt, wovon du sprichst, und persönlich verbunden bist.",
  },
  "5/1": {
    label: "Weiser Impulsgeber",
    businessText:
      "Dein Einfluss entsteht als Problemlöser mit Substanz. Dein Wissen ist dein Fundament, andere projizieren hohe Erwartungen auf dich.",
  },
  "5/2": {
    label: "Weises Talent",
    businessText:
      "Dein Einfluss entsteht durch dein Talent und deine Ausstrahlung. Andere sehen in dir eine Orientierung, auch wenn du selbst noch im Entdecken bist.",
  },
  "6/2": {
    label: "Vorbildhaftes Talent",
    businessText:
      "Dein Einfluss entsteht durch dein Vorbild und dein natürliches Talent. In der zweiten Lebenshälfte wirst du zur Orientierungsfigur.",
  },
  "6/3": {
    label: "Vorbildhafter Veränderer",
    businessText:
      "Dein Einfluss entsteht durch gelebte Erfahrung und die Bereitschaft zum Wandel. Dein Leben ist dein stärkstes Argument.",
  },
};

export function getProfileLabel(profileCode: string): string | null {
  return HD_PROFILE_MAPPING[profileCode]?.label ?? null;
}

export function getProfileMetadata(profileCode: string): ProfileMetadata | null {
  return HD_PROFILE_MAPPING[profileCode] ?? null;
}

// Werte aus Sheet "Autoritäten"
const HD_AUTHORITY_LABELS: Record<string, string> = {
  emotional:      "Emotionale Autorität",
  sacral:         "Sakrale Autorität",
  spleen:         "Milz Autorität",
  ego_manifested: "Ego Autorität",
  ego_projected:  "Ego Autorität",
  self_projected: "Selbst Autorität",
  mental:         "Mentale Autorität",
  lunar:          "Mond Autorität",
};

export function getAuthorityLabel(authorityCode: string): string {
  return HD_AUTHORITY_LABELS[authorityCode] ?? authorityCode;
}

// Werte aus Sheet "Autoritäten" — Business-Text
const HD_AUTHORITY_BUSINESS_TEXTS: Record<string, string> = {
  emotional:
    "Die häufigste und am wenigsten verstandenen Entscheidungs-Architektur im Business. Du triffst Entscheidungen am besten mit etwas Zeit, wenn emotionale Klarheit entstanden ist.",
  sacral:
    "Dein Körper antwortet vor dem Kopf und er irrt sich dabei selten. Du triffst Entscheidungen aus deiner unmittelbaren Körperreaktion heraus.",
  spleen:
    "Deine verlässlichste Entscheidung kommt in einer Sekunde. Ignorierst du deinen ersten Impuls, der dir subtil deinen Weg weist, könnte das teuer werden.",
  ego_manifested:
    "Du triffst Entscheidungen danach, was du wirklich willst und wofür du deine Willenskraft einsetzen möchtest. Nicht nach dem, was von dir erwartet wird.",
  ego_projected:
    "Du triffst Entscheidungen danach, was du wirklich willst und wofür du deine Willenskraft einsetzen möchtest. Nicht nach dem, was von dir erwartet wird.",
  self_projected:
    "Du brauchst keine externe Meinung. Wenn eine Entscheidung zu deinen Werten und Zielen passt, spürst du es als öffnendes Gefühl in der Brust. Das ist dein Go.",
  mental:
    "Du triffst Entscheidungen, indem du sie in einem passenden Umfeld mit vertrauten Menschen reflektierst, was dich bewegt, und dabei deine Richtung hörst.",
  lunar:
    "Die seltenste und kniffligste Entscheidungsarchitektur im Business, denn du benötigst für wichtige Entscheidungen einen ganzen Zyklus, möglicherweise 28 Tage Zeit.",
};

export function getAuthorityBusinessText(authorityCode: string): string | null {
  return HD_AUTHORITY_BUSINESS_TEXTS[authorityCode] ?? null;
}

// Werte aus Sheet "Zentren"
export interface CenterTexts {
  businessTitle: string;
  themen: string;
  defined: string;
  open: string;
}

const HD_CENTER_TEXTS: Record<string, CenterTexts> = {
  head: {
    businessTitle: "Inspiration & Klarheit",
    themen: "Inspiration, Hinterfragen, Einsicht",
    defined:
      "Du hast eine konstante innere Quelle von Fragen und Ideen. Inspiration kommt von innen. Du denkst weiter, auch wenn andere längst zufrieden sind.",
    open:
      "Du inspirierst dich leicht an anderen und deiner Umgebung. Manche Gedanken sind wirklich deine und manche hast du einfach aufgegangen. Das zu unterscheiden lohnt sich.",
  },
  ajna: {
    businessTitle: "Denken & Analyse",
    themen: "Wissen, Logik, mentale Sicherheit",
    defined:
      "Du analysierst verlässlich und kommst zu klaren Einschätzungen. Dein Kopf arbeitet strukturiert. Du musst nicht lange grübeln, um zu einem Urteil zu kommen.",
    open:
      "Du kannst sehr verschieden denken: Je nach Mensch und Situation. Das macht dich flexibel. Der Haken: Du landest schnell im Kopf anderer. Schau, welche Gedanken wirklich deine sind.",
  },
  throat: {
    businessTitle: "Ausdruck & Wirkung",
    themen: "Ausdruck, Gestik, Mimik, Handlung",
    defined:
      "Du findest deine eigenen Worte und zwar jederzeit. Kommunizieren liegt dir. Du bringst Dinge in die Welt und weißt, wie du Menschen erreichst.",
    open:
      "Du redest, wenn der Moment passt und schweigst, wenn es nicht tut. Das ist kein Fehler, sondern Stärke. Du findest spielend die passenden Worte für den aktuellen Empfänger. Warte auf den richtigen Moment, reagiere nicht auf Druck.",
  },
  g: {
    businessTitle: "Identität & Richtung",
    themen: "Identität, Richtung, Werte",
    defined:
      "Du weißt, wer du bist, wohin du willst und du kennst deine Werte sehr genau. Diese Klarheit ist im Business wie im Leben ein echter Anker für dich. Nicht nur für dich, sondern auch für die Menschen um dich herum.",
    open:
      "Du passt dich spielend verschiedenen Umgebungen und Situationen gut an und im Wandel siehst du eher Chancen als Probleme. Wichtig: Nicht jede Richtung, die du spürst, ist deine eigene. Regelmäßig innehalten lohnt sich.",
  },
  heart: {
    businessTitle: "Wille & Selbstwert",
    themen: "Willenskraft, Selbstwert",
    defined:
      "Du hast eine konstante Willenskraft. Was du sagst, meinst du und hältst es durch. Versprechen sind bei dir keine leeren Worte. Du kennst deinen Wert sehr genau und das ist gut so.",
    open:
      "Deine Energie für Durchsetzen und Versprechen ist variabel. Du brauchst echte Überzeugung, um langfristig dranzubleiben. Du darfst darauf achten, dass die Prioritäten, Ziele und Erwartungen anderer nicht automatisch zu deinen eigenen werden. Schätz dich genauso wert und gib dir selbst Platz.",
  },
  sacral: {
    businessTitle: "Lebenskraft & Umsetzung",
    themen: "Lebenskraft, Schaffenskraft",
    defined:
      "Du hast eine stabile Lebensenergie, die sich durch Tun regeneriert. Arbeit, die dir liegt, macht dich nicht müde, sie lädt dich auf. Du darfst aufpassen, dass du die Energie nicht dauerhaft in Aufgaben steckst, die dich mehr auslaugen als erfüllen.",
    open:
      "Deine Energie ist situativ. Sie hängt davon ab, womit und mit wem du arbeitest. Das ist kein Mangel sondern ein Hinweis, was wirklich zu dir passt. Du darfst aufpassen, dass du nicht das Arbeitstempo anderer übernimmst und über deine eigenen Grenzen gehst.",
  },
  spleen: {
    businessTitle: "Intuition & Sicherheit",
    themen: "Intuition, Gesundheit, Überleben",
    defined:
      "Dein Bauchgefühl ist zuverlässig. Du erkennst im ersten Moment, ob etwas stimmt oder nicht und liegst damit häufiger richtig, als du denkst. Lerne, deinem ersten Impuls zu vertrauen und prüfe dann mit deiner Autorität.",
    open:
      "Du spürst die Energie und den Zustand anderer sehr stark. Das macht dich empathisch, aber du brauchst klare Grenzen, damit du nicht alles mit nach Hause nimmst.",
  },
  solar: {
    businessTitle: "Emotionen & Beziehungen",
    themen: "Gefühle, Bauchgefühl, Empathie, Bedürfnisse",
    defined:
      "Du lebst emotionale Wellen und bringst spürbar Emotion in deine Arbeit, Kommunikation und Beziehungen. Genau das kann dich authentisch, lebendig und nahbar machen. Du darfst aufpassen, deine Tiefs nicht sofort als Zeichen zu sehen, dass im Business etwas falsch läuft.",
    open:
      "Du nimmst Emotionen und Stimmungen anderer besonders stark wahr und hast ein feines Gespür für Menschen, Teams und Kunden. Das ist eine große Stärke in Kommunikation und Zusammenarbeit. Du darfst aufpassen, Konflikten nicht auszuweichen oder Harmonie über deine eigenen Bedürfnisse zu stellen.",
  },
  root: {
    businessTitle: "Antrieb & Stabilität",
    themen: "Antrieb, Erdung, Sicherheit",
    defined:
      "Du hast einen starken inneren Antrieb, nutzt Druck für die Umsetzung und hast damit einen starken Antrieb, Dinge zu erledigen und abzuhaken. In stressigen Situationen vermittelst du anderen Stabilität und Sicherheit. Du darfst aufpassen, aus deinem Antrieb keinen permanenten Leistungsdruck zu machen.",
    open:
      "Du bist flexibel, kannst dich schnell auf neue Situationen einstellen und spürst, wann Handeln sinnvoll ist. Gleichzeitig nimmst du Druck und Hektik anderer stark auf. Das kann antreiben, kann aber auch stressen. Rhythmus und echte Pausen sind für dich kein Luxus, sondern notwendig. Du darfst aufpassen, nicht vorschnell zu handeln, nur um diesen Druck loszuwerden.",
  },
};

export function getCenterTexts(centerCode: string): CenterTexts | null {
  return HD_CENTER_TEXTS[centerCode] ?? null;
}
