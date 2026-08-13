import { NextResponse } from 'next/server';

const HTML = `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>7-Tage-Entscheidungsprotokoll · Drop the Mask</title>
  <style>
    :root {
      --sage:       #5D7682;
      --sage-dark:  #3D5560;
      --stone:      #2F3437;
      --cloud:      #F7F8F9;
      --gold:       #B8A97C;
      --gold-light: #F0EAD8;
      --white:      #FFFFFF;
      --border:     #D4DADC;
      --muted:      #7A8B90;
      --green-bg:   #EBF3EB;
      --green-fg:   #2D5040;
      --red-bg:     #F3EBEB;
      --red-fg:     #5C2D2D;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--cloud);
      color: var(--stone);
      font-family: 'Century Gothic', 'Gill Sans MT', 'Trebuchet MS', sans-serif;
      line-height: 1.55;
      font-size: 15px;
    }
    .site-header { background: var(--sage); color: #fff; padding: 28px 24px 24px; }
    .site-header .inner { max-width: 820px; margin: 0 auto; }
    .brand-tag { font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,.55); margin-bottom: 8px; }
    .site-header h1 { font-size: clamp(22px, 5vw, 34px); font-weight: 700; line-height: 1.15; margin-bottom: 8px; }
    .site-header .subtitle { font-size: 14px; color: rgba(255,255,255,.75); max-width: 560px; }
    .day-bar { background: var(--white); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }
    .day-bar .inner { max-width: 820px; margin: 0 auto; display: flex; }
    .day-tab { flex: 1; padding: 13px 6px; border: none; border-bottom: 3px solid transparent; background: none; font: inherit; font-size: 13px; font-weight: 700; color: var(--muted); cursor: pointer; transition: color .12s, border-color .12s; text-align: center; position: relative; }
    .day-tab:hover { color: var(--sage); }
    .day-tab.active { color: var(--sage); border-bottom-color: var(--sage); }
    .day-tab.has-data::after { content: ''; display: block; width: 5px; height: 5px; border-radius: 50%; background: var(--gold); margin: 3px auto 0; }
    .main { max-width: 820px; margin: 0 auto; padding: 28px 16px 80px; }
    .setup-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 22px; margin-bottom: 24px; }
    .card-label { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--sage); margin-bottom: 10px; }
    .q-input { width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--cloud); font: inherit; font-size: 15px; color: var(--stone); resize: vertical; min-height: 72px; }
    .q-input:focus { outline: none; border-color: var(--sage); background: #fff; }
    .day-entry { display: none; }
    .day-entry.active { display: block; }
    .day-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
    .day-heading { font-size: 20px; font-weight: 700; }
    .slot-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
    .slot-head { background: var(--sage); color: #fff; padding: 14px 20px; display: flex; align-items: center; gap: 10px; }
    .slot-icon { font-size: 20px; line-height: 1; }
    .slot-title { font-size: 16px; font-weight: 700; }
    .slot-sub { font-size: 12px; color: rgba(255,255,255,.65); margin-left: auto; }
    .slot-body { padding: 20px; }
    .f-group { margin-bottom: 18px; }
    .f-group:last-child { margin-bottom: 0; }
    .f-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 9px; }
    .f-rule { height: 1px; background: var(--border); margin: 18px -20px; }
    .emo-row { display: flex; gap: 7px; }
    .emo-btn { flex: 1; padding: 10px 4px; border: 1px solid var(--border); border-radius: 8px; background: var(--cloud); font: inherit; font-size: 14px; font-weight: 700; color: var(--muted); cursor: pointer; text-align: center; transition: all .1s; }
    .emo-btn:hover { border-color: var(--sage); color: var(--sage); }
    .emo-btn.sel { background: var(--sage); border-color: var(--sage); color: #fff; }
    .dir-row { display: flex; gap: 8px; }
    .dir-btn { flex: 1; padding: 12px 6px; border: 1px solid var(--border); border-radius: 8px; background: var(--cloud); font: inherit; font-size: 14px; font-weight: 700; color: var(--muted); cursor: pointer; text-align: center; transition: all .1s; }
    .dir-btn:hover { border-color: var(--sage); }
    .dir-btn.sel.ja    { background: var(--green-bg); border-color: #4A7C5E; color: var(--green-fg); }
    .dir-btn.sel.nein  { background: var(--red-bg);   border-color: #8B4A4A; color: var(--red-fg); }
    .dir-btn.sel.noch  { background: var(--gold-light); border-color: var(--gold); color: #5C4020; }
    .pressure-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .p-lim { font-size: 12px; color: var(--muted); min-width: 14px; text-align: center; }
    input[type=range] { flex: 1; accent-color: var(--sage); cursor: pointer; }
    .p-val { font-size: 20px; font-weight: 700; color: var(--sage); min-width: 28px; text-align: center; }
    .t-input { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--cloud); font: inherit; font-size: 14px; color: var(--stone); resize: vertical; min-height: 58px; }
    .t-input:focus { outline: none; border-color: var(--sage); background: #fff; }
    .action-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 26px; }
    .btn-sage { padding: 12px 26px; background: var(--sage); color: #fff; border: none; border-radius: 8px; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; }
    .btn-sage:hover { background: var(--sage-dark); }
    .btn-outline { padding: 11px 20px; background: #fff; color: var(--stone); border: 1px solid var(--border); border-radius: 8px; font: inherit; font-size: 14px; cursor: pointer; }
    .btn-outline:hover { border-color: var(--sage); color: var(--sage); }
    .save-msg { font-size: 14px; font-weight: 700; color: #3A6B4A; }
    .share-box { margin-top: 22px; background: var(--gold-light); border: 1px solid var(--gold); border-radius: 10px; padding: 18px 20px; }
    .share-title { font-size: 13px; font-weight: 700; color: #5C4020; margin-bottom: 4px; }
    .share-desc { font-size: 12px; color: #8A6840; margin-bottom: 10px; }
    .share-row { display: flex; gap: 8px; }
    .share-input { flex: 1; padding: 9px 12px; border: 1px solid var(--gold); border-radius: 6px; background: #fff; font: inherit; font-size: 12px; color: var(--stone); }
    .btn-copy { padding: 9px 18px; background: var(--gold); color: #2D1800; border: none; border-radius: 6px; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; }
    .btn-mail { padding: 9px 14px; background: #fff; color: #5C4020; border: 1px solid var(--gold); border-radius: 6px; font: inherit; font-size: 13px; cursor: pointer; white-space: nowrap; }
    @media (max-width: 580px) {
      .emo-row { gap: 4px; } .emo-btn { font-size: 13px; padding: 9px 2px; }
      .dir-row { gap: 5px; } .day-tab { font-size: 11px; padding: 10px 2px; }
    }
    @media print {
      .day-bar, .action-row, .share-box, .day-nav button { display: none !important; }
      .day-entry { display: block !important; page-break-before: always; }
      .day-entry:first-of-type { page-break-before: auto; }
      body { background: #fff; font-size: 11pt; }
      .site-header, .slot-head { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
<header class="site-header">
  <div class="inner">
    <div class="brand-tag">Drop the Mask · stupperich.de</div>
    <h1>Dein 7-Tage-Entscheidungsprotokoll</h1>
    <p class="subtitle">Morgens und abends je fünf Felder. Kein schöner Bericht — ehrliches Beobachtungsmaterial.</p>
  </div>
</header>
<nav class="day-bar"><div class="inner" id="day-tabs"></div></nav>
<main class="main">
  <div class="setup-card">
    <div class="card-label">Deine Ausgangsfrage</div>
    <textarea class="q-input" id="q-input" placeholder="Welche Entscheidung beobachtest du in diesen 7 Tagen?"></textarea>
  </div>
  <div id="entries"></div>
  <div class="action-row">
    <button class="btn-sage" id="btn-save">Speichern</button>
    <button class="btn-outline" id="btn-print">Drucken / PDF</button>
    <span class="save-msg" id="save-msg"></span>
  </div>
  <div class="share-box">
    <div class="share-title">Dein persönlicher Link</div>
    <div class="share-desc">Dieser Link enthält alle deine Einträge. Speichere ihn als Lesezeichen oder schick ihn dir per Mail — dann öffnest du dein Protokoll auf jedem Gerät.</div>
    <div class="share-row">
      <input class="share-input" id="share-url" type="text" readonly>
      <button class="btn-copy" id="btn-copy">Kopieren</button>
      <button class="btn-mail" id="btn-mail">Per Mail</button>
    </div>
  </div>
</main>
<script>
(() => {
  'use strict';
  const STORE = 'dtm-ep-v2';
  let state = { q: '', days: {} };
  let saveTimer;
  const EMOTIONS = [{v:'-2',l:'−2'},{v:'-1',l:'−1'},{v:'0',l:'0'},{v:'+1',l:'+1'},{v:'+2',l:'+2'}];
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function buildTabs() {
    const c = document.getElementById('day-tabs');
    for (let d = 1; d <= 7; d++) { const b = el('button','day-tab','Tag '+d); b.dataset.d=d; b.addEventListener('click',()=>goDay(d)); c.appendChild(b); }
  }
  function buildEntries() {
    const w = document.getElementById('entries');
    for (let d = 1; d <= 7; d++) { const div = el('div','day-entry'); div.id='day-'+d; div.appendChild(buildDayNav(d)); div.appendChild(buildSlot(d,'morning','🌤','Morgens','Vor dem ersten Meeting')); div.appendChild(buildSlot(d,'evening','🌙','Abends','Am Ende des Arbeitstages')); w.appendChild(div); }
  }
  function buildDayNav(d) {
    const nav = el('div','day-nav'); nav.appendChild(el('div','day-heading','Tag '+d));
    const r = el('div'); r.style.cssText='display:flex;gap:8px';
    if (d>1) { const b=el('button','btn-outline','← Tag '+(d-1)); b.addEventListener('click',()=>goDay(d-1)); r.appendChild(b); }
    if (d<7) { const b=el('button','btn-outline','Tag '+(d+1)+' →'); b.addEventListener('click',()=>goDay(d+1)); r.appendChild(b); }
    nav.appendChild(r); return nav;
  }
  function buildSlot(d, slot, icon, title, sub) {
    const card = el('div','slot-card');
    const head = el('div','slot-head'); head.innerHTML='<span class="slot-icon">'+icon+'</span><span class="slot-title">'+title+'</span><span class="slot-sub">'+sub+'</span>';
    card.appendChild(head);
    const body = el('div','slot-body');
    body.appendChild(buildEmoField(d,slot)); body.appendChild(el('div','f-rule'));
    body.appendChild(buildDirField(d,slot)); body.appendChild(el('div','f-rule'));
    body.appendChild(buildPressureField(d,slot)); body.appendChild(el('div','f-rule'));
    body.appendChild(buildTF(d,slot,'body_sense','4 · Körperliche Wahrnehmung','Schultern, Atem, Bauch… (ein paar Worte)')); body.appendChild(el('div','f-rule'));
    body.appendChild(buildTF(d,slot,'new_info','5 · Neue Information, Folge oder Bedingung','Was ist heute neu aufgetaucht?'));
    card.appendChild(body); return card;
  }
  function buildEmoField(d,slot) {
    const g=el('div','f-group'); g.appendChild(el('label','f-label','1 · Emotionaler Zustand (−2 bis +2)'));
    const row=el('div','emo-row');
    EMOTIONS.forEach(em=>{ const b=el('button','emo-btn',em.l); b.type='button'; b.dataset.d=d; b.dataset.slot=slot; b.dataset.field='emotion'; b.dataset.val=em.v; b.addEventListener('click',()=>handleChoice(b)); row.appendChild(b); });
    g.appendChild(row); return g;
  }
  function buildDirField(d,slot) {
    const g=el('div','f-group'); g.appendChild(el('label','f-label','2 · Meine Richtung'));
    const row=el('div','dir-row');
    [['Ja','ja'],['Nein','nein'],['Noch nicht','noch']].forEach(([lbl,cls])=>{ const b=el('button','dir-btn '+cls,lbl); b.type='button'; b.dataset.d=d; b.dataset.slot=slot; b.dataset.field='direction'; b.dataset.val=lbl; b.addEventListener('click',()=>handleChoice(b)); row.appendChild(b); });
    g.appendChild(row); return g;
  }
  function buildPressureField(d,slot) {
    const g=el('div','f-group'); g.appendChild(el('label','f-label','3 · Entscheidungsdruck (0–10)'));
    const pw=el('div','pressure-wrap'); pw.innerHTML='<span class="p-lim">0</span>';
    const sl=document.createElement('input'); sl.type='range'; sl.min=0; sl.max=10; sl.step=1; sl.value=0; sl.dataset.d=d; sl.dataset.slot=slot; sl.dataset.field='pressure';
    const disp=el('span','p-val','0');
    sl.addEventListener('input',()=>{ disp.textContent=sl.value; debouncedSave(); });
    pw.appendChild(sl); pw.appendChild(disp); pw.appendChild(el('span','p-lim','10'));
    g.appendChild(pw); g.appendChild(buildTA(d,slot,'pressure_src','Woher kommt der Druck? (ein Satz genügt)')); return g;
  }
  function buildTF(d,slot,field,lbl,ph) { const g=el('div','f-group'); g.appendChild(el('label','f-label',lbl)); g.appendChild(buildTA(d,slot,field,ph)); return g; }
  function buildTA(d,slot,field,ph) { const ta=document.createElement('textarea'); ta.className='t-input'; ta.placeholder=ph; ta.rows=2; ta.dataset.d=d; ta.dataset.slot=slot; ta.dataset.field=field; ta.addEventListener('input',debouncedSave); return ta; }
  function getSlot(d,slot) { if(!state.days[d])state.days[d]={}; if(!state.days[d][slot])state.days[d][slot]={}; return state.days[d][slot]; }
  function collectAll() {
    state.q=document.getElementById('q-input').value;
    document.querySelectorAll('[data-d][data-slot][data-field]').forEach(el=>{ const {d,slot,field}=el.dataset; const s=getSlot(d,slot); if(el.tagName==='TEXTAREA')s[field]=el.value; else if(el.type==='range')s[field]=el.value; });
    document.querySelectorAll('.emo-btn.sel,.dir-btn.sel').forEach(b=>{ const {d,slot,field,val}=b.dataset; getSlot(d,slot)[field]=val; });
  }
  function applyAll() {
    document.getElementById('q-input').value=state.q||'';
    document.querySelectorAll('[data-d][data-slot][data-field]').forEach(el=>{ const {d,slot,field}=el.dataset; const s=getSlot(d,slot); const v=s[field]; if(v===undefined)return; if(el.tagName==='TEXTAREA')el.value=v; else if(el.type==='range'){ el.value=v; const disp=el.nextElementSibling; if(disp&&disp.classList.contains('p-val'))disp.textContent=v; } });
    document.querySelectorAll('.emo-btn').forEach(b=>{ const {d,slot}=b.dataset; b.classList.toggle('sel',b.dataset.val===getSlot(d,slot)['emotion']); });
    document.querySelectorAll('.dir-btn').forEach(b=>{ const {d,slot}=b.dataset; b.classList.toggle('sel',b.dataset.val===getSlot(d,slot)['direction']); });
    updateTabs();
  }
  function encode(o){return btoa(encodeURIComponent(JSON.stringify(o)));}
  function decode(s){return JSON.parse(decodeURIComponent(atob(s)));}
  function save(msg) {
    collectAll();
    const enc=encode(state);
    try{localStorage.setItem(STORE,enc);}catch(e){}
    const url=window.location.pathname+window.location.search+'#data='+enc;
    history.replaceState(null,'',url);
    document.getElementById('share-url').value=window.location.href;
    updateTabs();
    if(msg){const m=document.getElementById('save-msg');m.textContent='Gespeichert ✓';setTimeout(()=>{m.textContent='';},2500);}
  }
  function load() {
    let enc=null;
    const hash=window.location.hash;
    if(hash.startsWith('#data='))enc=hash.slice(6);
    if(!enc){try{enc=localStorage.getItem(STORE);}catch(e){}}
    if(enc){try{state=decode(enc);}catch(e){}}
    applyAll();
    document.getElementById('share-url').value=window.location.href;
  }
  function debouncedSave(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>save(false),700);}
  function goDay(d) {
    document.querySelectorAll('.day-entry').forEach(e=>e.classList.toggle('active',e.id==='day-'+d));
    document.querySelectorAll('.day-tab').forEach(t=>t.classList.toggle('active',t.dataset.d==d));
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function updateTabs() {
    for(let d=1;d<=7;d++){ const tab=document.querySelector('.day-tab[data-d="'+d+'"]'); if(!tab)continue; const dd=state.days[d]||{}; const has=['morning','evening'].some(sl=>{const s=dd[sl]||{};return s.emotion||s.direction||s.body_sense||s.new_info;}); tab.classList.toggle('has-data',has); }
  }
  function handleChoice(btn) {
    const isEmo=btn.classList.contains('emo-btn');
    btn.parentElement.querySelectorAll(isEmo?'.emo-btn':'.dir-btn').forEach(b=>b.classList.remove('sel'));
    btn.classList.add('sel'); debouncedSave();
  }
  buildTabs(); buildEntries(); load(); goDay(1);
  document.getElementById('btn-save').addEventListener('click',()=>save(true));
  document.getElementById('btn-print').addEventListener('click',()=>{save(false);window.print();});
  document.getElementById('q-input').addEventListener('input',debouncedSave);
  document.getElementById('btn-copy').addEventListener('click',()=>{ save(false); navigator.clipboard.writeText(document.getElementById('share-url').value).then(()=>{const b=document.getElementById('btn-copy');b.textContent='Kopiert ✓';setTimeout(()=>{b.textContent='Kopieren';},2000);}); });
  document.getElementById('btn-mail').addEventListener('click',()=>{ save(false); const url=encodeURIComponent(document.getElementById('share-url').value); window.location.href='mailto:?subject=Mein%207-Tage-Entscheidungsprotokoll&body=Mein%20pers%C3%B6nlicher%20Link%3A%0A%0A'+url; });
})();
</script>
</body>
</html>`;

export async function GET() {
  return new NextResponse(HTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
