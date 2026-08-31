/* =====================================================================
   _t-negozio-e-bacheca.js — SETTE CONTI CHE NEGOZIO E BACHECA
   NON SI DICEVANO (31 agosto 2026, dal registro del censimento:
   qui si curano interfaccia e contabilita' di interfaccia — la
   simulazione non si tocca di una virgola).

   1. Comprati i 4 pezzi separati, la carta IL CAMPETTO COMPLETO si
      mostrava posseduta ma SAVE.shop.completo restava 0: lo stato
      mostrato e lo stato salvato non coincidevano. Quando tuttiIPezzi
      diventa vero si scrive anche SAVE.shop.completo=1, con
      persistSave, e i salvataggi gia' completi si sanano da soli alla
      prima apertura della bacheca.
   2. I 7 campi singoli costano 15.350 monete contro le 1.330 del
      PACCHETTO CAMPI e nessuno lo segnalava: nella schermata CAMPI,
      sotto il cartello, una riga onesta dice che al negozio i sette
      campi si sbloccano insieme e a quanto — il numero lo scrive
      buildCampiUI leggendo la costante NEGOZIO, mai a mano. Compare
      solo se il pacchetto non e' posseduto e resta qualcosa da
      sbloccare.
   3. La barra del trofeo SALVADANAIO leggeva il saldo corrente e
      REGREDIVA spendendo: adesso legge il massimo storico —
      SAVE.stats.maxCoins, aggiornato in addCoinsInternal
      (contabilita' di interfaccia, non simulazione), validato in
      loadSave dal filtro delle chiavi conosciute e mai sotto il
      saldo appena riletto.
   4. SAVE.albo cresceva senza tetto in scrittura e si troncava a 200
      solo alla rilettura: adesso il tetto sta anche nei due punti del
      push (titolo di stagione e torneo vinto), lo stesso della
      rilettura.
   5. La schermata STATISTICHE non mostrava le stagioni vinte, che
      pure stanno nel salvataggio (stats.stagioni): riga «Stagioni
      vinte» accanto a «Tornei vinti».
   6. «SBLOCCATO — PER SEMPRE» e «IN USO» erano button inerti ma
      focusabili — la tastiera ci inciampava a vuoto: diventano span
      con la stessa classe, stesso vestito (le regole .fbtn sono di
      classe, e dentro #campi/#negozio il display e' flex per tutti).
   7. Nella pagina STATISTICHE la tessera Monete era l'unico numero
      che cala in mezzo ai cumulativi: l'etichetta adesso dice
      «Monete in tasca», cioe' un saldo, non un totale raccolto.

   uso:  node strumenti/_t-negozio-e-bacheca.js --out fuori/negozio-e-bacheca.html
         node strumenti/_t-negozio-e-bacheca.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/negozio-e-bacheca.html'));

const ANCORE = [

/* 1 — la carta COMPLETO e lo stato salvato coincidono */
{
  nome: '1/7 il completo comprato a pezzi si scrive nel salvataggio',
  cerca:
`  const pezzi=NEGOZIO.filter(o=>o.id!=='completo');
  const tuttiIPezzi=pezzi.every(o=>shopHa(o.id));`,
  metti:
`  const pezzi=NEGOZIO.filter(o=>o.id!=='completo');
  const tuttiIPezzi=pezzi.every(o=>shopHa(o.id));
  /* comprati i quattro pezzi separati, la carta COMPLETO si mostrava
     posseduta ma il salvataggio diceva 0: lo stato mostrato e lo stato
     salvato adesso coincidono (31 agosto 2026) */
  if(tuttiIPezzi && !SAVE.shop.completo){ SAVE.shop.completo=1; persistSave(); }`,
},

/* 2a — la riga onesta del pacchetto: il vestito */
{
  nome: '2a/7 la riga onesta del pacchetto — CSS',
  /* ANCORA SPOSTATA (31 agosto, sera): la prima stesura si appoggiava a
     .campi-resta, che la toppa dei ganci morti ha rimosso nel frattempo
     — due cure giuste che si sono incontrate. Ora ci si appoggia alla
     vicina viva, .campi-desc b. */
  cerca:
`.campi-desc b{font-family:var(--cond);font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:var(--gesso)}`,
  metti:
`.campi-desc b{font-family:var(--cond);font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:var(--gesso)}
/* la riga onesta del pacchetto: sotto il cartello, dice quanto costano
   i sette campi INSIEME al negozio — il numero lo scrive buildCampiUI
   leggendo la costante NEGOZIO, mai a mano (31 agosto 2026) */
.campi-nego{font-family:var(--cond);font-weight:600;font-size:12.5px;line-height:1.3;
  color:var(--grigio);max-width:640px;margin:0 auto 10px}
.campi-nego b{font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gesso)}`,
},

/* 2b — la riga onesta del pacchetto: il posto nella pagina */
{
  nome: '2b/7 la riga onesta del pacchetto — HTML',
  cerca: `    <div class="cards" id="fieldCards"></div>`,
  metti:
`    <!-- la riga onesta del pacchetto (31 agosto 2026): compare solo se
         il PACCHETTO CAMPI non e' posseduto e resta qualcosa da
         sbloccare; il testo lo scrive buildCampiUI -->
    <div class="campi-nego hidden" id="campiNego"></div>
    <div class="cards" id="fieldCards"></div>`,
},

/* 2c — la riga onesta del pacchetto: il numero letto da NEGOZIO */
{
  nome: '2c/7 la riga onesta del pacchetto — buildCampiUI',
  cerca:
`    const de=document.getElementById('campiDesc');
    if(de) de.textContent=f.desc;
    montaEroi();`,
  metti:
`    const de=document.getElementById('campiDesc');
    if(de) de.textContent=f.desc;
    /* la riga onesta del pacchetto: se il PACCHETTO CAMPI non e'
       posseduto e c'e' ancora qualcosa da sbloccare, si dice QUI che al
       negozio i sette campi si sbloccano insieme, e a quanto — N letto
       dalla costante NEGOZIO, mai scritto a mano (31 agosto 2026) */
    const ng=document.getElementById('campiNego');
    if(ng){
      const pk=NEGOZIO.find(o=>o.id==='campi');
      /* il conto e' SUO, non preso in prestito: la variabile resta
         del vecchio contatore invisibile e' stata rimossa dai ganci
         morti, e il fumo l'ha detto subito (ReferenceError, 31 ago) */
      const mostra=!!pk && !shopHa('campi') && SAVE.fields.some(v=>!v);
      ng.classList.toggle('hidden', !mostra);
      if(mostra) ng.innerHTML='Al negozio il <b>PACCHETTO CAMPI</b> sblocca i sette campi tutti insieme: <b>'+(pk.monete|0)+' monete</b>';
    }
    montaEroi();`,
},

/* 3a — il campo maxCoins nasce nel salvataggio di serie */
{
  nome: '3a/7 maxCoins nel salvataggio di serie',
  cerca: `    stats:{ partite:0, vittorie:0, golF:0, golS:0, perfetti:0, rubate:0, tornei:0, stagioni:0 },`,
  metti:
`    /* maxCoins: il massimo storico delle monete — contabilita' di
       interfaccia per la barra del SALVADANAIO, che spendendo non deve
       regredire (31 agosto 2026) */
    stats:{ partite:0, vittorie:0, golF:0, golS:0, perfetti:0, rubate:0, tornei:0, stagioni:0, maxCoins:0 },`,
},

/* 3b — loadSave lo valida e non lo lascia sotto il saldo */
{
  nome: '3b/7 loadSave valida maxCoins',
  cerca: `    if(j.stats&&typeof j.stats==='object') for(const k in s.stats){ if(typeof j.stats[k]==='number'&&isFinite(j.stats[k])) s.stats[k]=Math.max(0,j.stats[k]|0); }`,
  metti:
`    if(j.stats&&typeof j.stats==='object') for(const k in s.stats){ if(typeof j.stats[k]==='number'&&isFinite(j.stats[k])) s.stats[k]=Math.max(0,j.stats[k]|0); }
    /* maxCoins passa dal filtro qui sopra (chiave conosciuta, numero
       finito, non negativo) e non puo' stare sotto il saldo appena
       riletto: i salvataggi nati prima partono dal saldo di oggi */
    if((s.stats.maxCoins|0)<(s.coins|0)) s.stats.maxCoins=s.coins|0;`,
},

/* 3c — addCoinsInternal aggiorna il massimo storico */
{
  nome: '3c/7 addCoinsInternal aggiorna il massimo storico',
  cerca:
`  SAVE.coins=Math.max(0,(SAVE.coins|0)+(n|0));
  if(SAVE.coins>=1000) unlockAch('ricco');`,
  metti:
`  SAVE.coins=Math.max(0,(SAVE.coins|0)+(n|0));
  /* il massimo storico per la barra del SALVADANAIO: contabilita' di
     interfaccia, non tocca la simulazione (31 agosto 2026) */
  if(SAVE.coins>(SAVE.stats.maxCoins|0)) SAVE.stats.maxCoins=SAVE.coins;
  if(SAVE.coins>=1000) unlockAch('ricco');`,
},

/* 3d — la conta del trofeo legge il massimo storico */
{
  nome: '3d/7 la conta del SALVADANAIO legge il massimo storico',
  cerca: `  { id:'ricco',         ico:'monete',     nome:'SALVADANAIO',           desc:'Arriva a 1000 monete',                     premio:100, liv:'oro',     obiettivo:1000, conta:()=>SAVE.coins },`,
  metti:
`  /* la barra legge il MASSIMO STORICO (stats.maxCoins), non il saldo:
     spendere non fa regredire il trofeo (31 agosto 2026) */
  { id:'ricco',         ico:'monete',     nome:'SALVADANAIO',           desc:'Arriva a 1000 monete',                     premio:100, liv:'oro',     obiettivo:1000, conta:s=>Math.max(SAVE.coins|0, s.maxCoins|0) },`,
},

/* 4 — l'albo si tronca anche in scrittura, nei due punti del push */
{
  nome: '4a/7 tetto dell\'albo al titolo di stagione',
  cerca: `      SAVE.albo.push({data:dataOggi(), nome:SAVE.teamName+' — CAMPIONE', campo:'STAGIONE'});`,
  metti:
`      SAVE.albo.push({data:dataOggi(), nome:SAVE.teamName+' — CAMPIONE', campo:'STAGIONE'});
      /* stesso tetto della rilettura (loadSave taglia a 200): troncare
         solo al load lasciava crescere il salvataggio senza limite
         (31 agosto 2026) */
      if(SAVE.albo.length>200) SAVE.albo.length=200;`,
},
{
  nome: '4b/7 tetto dell\'albo al torneo vinto',
  cerca:
`  SAVE.albo.push({
    data:String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(),
    nome:SAVE.teamName,
    campo:FIELDS[clamp(G.fieldIdx|0,0,FIELDS.length-1)].nome,
  });`,
  metti:
`  SAVE.albo.push({
    data:String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear(),
    nome:SAVE.teamName,
    campo:FIELDS[clamp(G.fieldIdx|0,0,FIELDS.length-1)].nome,
  });
  /* stesso tetto della rilettura (200), come per il titolo di stagione
     (31 agosto 2026) */
  if(SAVE.albo.length>200) SAVE.albo.length=200;`,
},

/* 5 — le stagioni vinte nelle STATISTICHE */
{
  nome: '5/7 le stagioni vinte accanto ai tornei vinti',
  cerca:
`    tb.innerHTML='<div class="tl"><span>Trofei sbloccati</span><b>'+n+' / '+tot+'</b></div>'+
      '<div class="tb"><i style="width:'+Math.round(n/tot*100)+'%"></i></div>'+
      '<div class="tl" style="margin:6px 0 0"><span>Tornei vinti</span><b>'+(s.tornei|0)+'</b></div>';`,
  metti:
`    tb.innerHTML='<div class="tl"><span>Trofei sbloccati</span><b>'+n+' / '+tot+'</b></div>'+
      '<div class="tb"><i style="width:'+Math.round(n/tot*100)+'%"></i></div>'+
      '<div class="tl" style="margin:6px 0 0"><span>Tornei vinti</span><b>'+(s.tornei|0)+'</b></div>'+
      /* le stagioni vinte esistevano nel salvataggio (stats.stagioni)
         ma nessuna schermata le mostrava (31 agosto 2026) */
      '<div class="tl" style="margin:6px 0 0"><span>Stagioni vinte</span><b>'+(s.stagioni|0)+'</b></div>';`,
},

/* 6 — le targhe smettono di essere bottoni */
{
  nome: '6a/7 SBLOCCATO — PER SEMPRE e\' una targa, non un bottone',
  cerca:
`      }else{
        const b=document.createElement('button');
        b.className='fbtn use'; b.textContent='SBLOCCATO — PER SEMPRE';
        riga.appendChild(b);
      }`,
  metti:
`      }else{
        /* targa, non comando: da button era inerte ma focusabile, e la
           tastiera ci inciampava a vuoto (31 agosto 2026). Stessa
           classe, stesso vestito: dentro #negozio .fbtn e' flex per
           tutti gli elementi, cambia solo il tag. */
        const b=document.createElement('span');
        b.className='fbtn use'; b.textContent='SBLOCCATO — PER SEMPRE';
        riga.appendChild(b);
      }`,
},
{
  nome: '6b/7 IN USO e\' una targa, non un bottone',
  cerca:
`    const b=document.createElement('button'); b.className='fbtn';
    if(sb){
      if(SAVE.fieldSel===i){ b.classList.add('inuse'); b.textContent='IN USO'; }`,
  metti:
`    /* IN USO e' una targa, non un comando: da button era inerte ma
       focusabile (31 agosto 2026). Stessa classe, stesso vestito:
       dentro #campi .fbtn e' flex per tutti gli elementi. */
    const b=document.createElement(sb&&SAVE.fieldSel===i ? 'span' : 'button'); b.className='fbtn';
    if(sb){
      if(SAVE.fieldSel===i){ b.classList.add('inuse'); b.textContent='IN USO'; }`,
},

/* 7 — la tessera Monete dice che e' un saldo */
{
  nome: '7/7 Monete in tasca',
  cerca: `      tile(SAVE.coins|0,'Monete','','monete');`,
  metti:
`      /* in mezzo ai cumulativi era l'unico numero che poteva calare:
         l'etichetta adesso dice che e' un saldo (31 agosto 2026) */
      tile(SAVE.coins|0,'Monete in tasca','','monete');`,
},

];

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}
const attesi = [
  /* maxCoins, contato voce per voce: 2 nel verbale+conta del trofeo,
     2 nel salvataggio di serie (commento+campo), 3 in loadSave
     (commento + due volte nella riga del pavimento), 2 in
     addCoinsInternal (confronto+scrittura) — 9 in tutto */
  ['maxCoins', 9],
  ['maxCoins:0', 1],
  ['SAVE.stats.maxCoins', 2],
  ['s.stats.maxCoins', 2],
  ['conta:s=>Math.max(SAVE.coins|0, s.maxCoins|0)', 1],
  ['conta:()=>SAVE.coins', 0],
  /* il completo comprato a pezzi: prima 2 occorrenze di
     SAVE.shop.completo (shopHa e la carta), la cura ne aggiunge 2 */
  ['SAVE.shop.completo', 4],
  ['tuttiIPezzi && !SAVE.shop.completo', 1],
  /* la riga onesta: 3 volte la classe (due regole CSS + l'HTML),
     2 volte l'id (HTML + getElementById) */
  ['campi-nego', 3],
  ['campiNego', 2],
  ['Al negozio il <b>PACCHETTO CAMPI</b> sblocca i sette campi tutti insieme: <b>', 1],
  /* l'albo: 1 lettura che c'era gia' (buildTrofeiUI) + 2 confronti
     + 2 troncamenti = 5 */
  ['SAVE.albo.length', 5],
  ['SAVE.albo.length>200', 2],
  ['SAVE.albo.length=200', 2],
  ['Stagioni vinte', 1],
  ['Tornei vinti', 1],
  ['Monete in tasca', 1],
  ["tile(SAVE.coins|0,'Monete','','monete')", 0],
  /* le targhe: il testo resta uno, i tag cambiano */
  ['SBLOCCATO — PER SEMPRE', 1],
  ["const b=document.createElement('span');", 1],
  ["document.createElement(sb&&SAVE.fieldSel===i ? 'span' : 'button')", 1],
  /* IN USO: 3 nei commenti che c'erano gia' + 1 nel codice + 1 nel
     verbale nuovo */
  ['IN USO', 5],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
