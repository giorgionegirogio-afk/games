/* =====================================================================
   _confronto-pagina.js — la pagina consultabile delle differenze.

   Millecinquecento righe non si leggono in un file di testo: si
   filtrano. Questo strumento prende
   _analisi/confronto-fcmobile/differenze.json e ne fa una pagina sola,
   senza rete e senza librerie (come il gioco che descrive), con i filtri
   per area, verso, peso e grado di verifica, e la ricerca sul testo.

   uso:  node strumenti/_confronto-pagina.js
         (scrive fuori/confronto/differenze.html)
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const dati = JSON.parse(fs.readFileSync(path.join(RADICE, '_analisi', 'confronto-fcmobile', 'differenze.json'), 'utf8'));

const AREE = {
  A: 'Modalita e struttura della partita',
  B: 'Regole del calcio',
  C: 'Comandi e ingresso',
  D: 'Simulazione, fisica e intelligenza',
  E: 'Grafica e presentazione',
  F: 'Audio',
  G: 'Animazione e corpo',
  H: 'Contenuti e licenze',
  I: 'Progressione, rosa e carte',
  J: 'Economia e monetizzazione',
  K: 'Rete, conto e servizi',
  L: 'Interfaccia e apprendimento',
  M: 'Piattaforma, peso, privacy',
  N: 'Longevita e contorno',
};

/* si tiene solo cio' che la pagina mostra, e le prove si accorciano:
   il crudo intero resta nel JSON accanto */
const righe = dati.map(d => ({
  a: AREE[d.area] ? d.area : 'Z',
  t: String(d.aspetto || '').slice(0, 200),
  f: String(d.fcmobile || '').slice(0, 700),
  c: String(d.calcetto || '').slice(0, 700),
  v: d.favore || '',
  p: d.peso || '',
  g: d.verifica || '',
  b: String(d.prova || '').slice(0, 260),
  x: d.fattibile || '',
}));

const conta = (k, v) => righe.filter(r => r[k] === v).length;
const TOT = righe.length;

const CSS = `
*,*::before,*::after{box-sizing:border-box}
:root{
  /* il tabellone di uno stadio, di notte: fondo verde-nero, cifre ad
     ambra a lampadine. I due giochi hanno una voce ciascuno. */
  --fondo:#0E1411; --carta:#141C18; --carta2:#19231E;
  --riga:#233029; --inchiostro:#E7EDE8; --tenue:#8B978F; --fioco:#5E6A63;
  --calcetto:#E8A33D; --fcmobile:#54A9DA; --pari:#7F8F85;
  --alto:#E06A4E; --medio:#C9A227; --basso:#5E6A63;
  --ombra:0 1px 0 #0a0f0d;
}
@media (prefers-color-scheme: light){
  :root{
    --fondo:#F6F8F5; --carta:#FFFFFF; --carta2:#F0F3EF;
    --riga:#DDE4DE; --inchiostro:#141D18; --tenue:#5B6862; --fioco:#8C9891;
    --calcetto:#A96A0C; --fcmobile:#1F6E9C; --pari:#5B6862;
    --alto:#B2401F; --medio:#8A6A00; --basso:#8C9891;
    --ombra:0 1px 0 rgba(20,29,24,.06);
  }
}
:root[data-theme="light"]{
  --fondo:#F6F8F5; --carta:#FFFFFF; --carta2:#F0F3EF;
  --riga:#DDE4DE; --inchiostro:#141D18; --tenue:#5B6862; --fioco:#8C9891;
  --calcetto:#A96A0C; --fcmobile:#1F6E9C; --pari:#5B6862;
  --alto:#B2401F; --medio:#8A6A00; --basso:#8C9891;
  --ombra:0 1px 0 rgba(20,29,24,.06);
}
:root[data-theme="dark"]{
  --fondo:#0E1411; --carta:#141C18; --carta2:#19231E;
  --riga:#233029; --inchiostro:#E7EDE8; --tenue:#8B978F; --fioco:#5E6A63;
  --calcetto:#E8A33D; --fcmobile:#54A9DA; --pari:#7F8F85;
  --alto:#E06A4E; --medio:#C9A227; --basso:#5E6A63;
  --ombra:0 1px 0 #0a0f0d;
}
body{
  margin:0; background:var(--fondo); color:var(--inchiostro);
  font:15px/1.55 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  -webkit-text-size-adjust:100%;
}
.dato{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums}
.involucro{max-width:1180px;margin:0 auto;padding:0 20px 80px}

/* il tabellone */
header{border-bottom:1px solid var(--riga);margin-bottom:22px;padding:34px 0 22px}
h1{margin:0 0 6px;font-size:26px;font-weight:650;letter-spacing:-.015em;text-wrap:balance}
.sotto{margin:0;color:var(--tenue);max-width:66ch}
.tabellone{display:flex;flex-wrap:wrap;gap:26px;margin-top:22px}
.cifra{display:flex;flex-direction:column;gap:2px}
.cifra b{font-size:27px;font-weight:640;line-height:1}
.cifra span{font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:var(--tenue)}
.cifra.fcm b{color:var(--fcmobile)} .cifra.cal b{color:var(--calcetto)} .cifra.par b{color:var(--pari)}

/* la barra dei filtri */
.filtri{position:sticky;top:0;z-index:5;background:var(--fondo);
  border-bottom:1px solid var(--riga);padding:12px 0;margin-bottom:4px}
.fila{display:flex;flex-wrap:wrap;gap:7px;align-items:center}
.fila+.fila{margin-top:9px}
.eti{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--fioco);
  min-width:62px;padding-top:2px}
button.f{font:inherit;font-size:12.5px;color:var(--tenue);background:var(--carta);
  border:1px solid var(--riga);padding:4px 10px;cursor:pointer;border-radius:2px;
  transition:color .12s,border-color .12s,background .12s}
button.f:hover{color:var(--inchiostro);border-color:var(--fioco)}
button.f[aria-pressed="true"]{background:var(--inchiostro);color:var(--fondo);border-color:var(--inchiostro)}
button.f:focus-visible{outline:2px solid var(--calcetto);outline-offset:2px}
input[type=search]{font:inherit;font-size:13px;color:var(--inchiostro);background:var(--carta);
  border:1px solid var(--riga);padding:5px 10px;border-radius:2px;min-width:230px;flex:1}
input[type=search]:focus-visible{outline:2px solid var(--calcetto);outline-offset:1px}
.esito{color:var(--tenue);font-size:12.5px;padding-left:2px}

/* le righe */
.gruppo{margin-top:30px}
.gruppo>h2{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--tenue);
  margin:0 0 10px;padding-bottom:7px;border-bottom:1px solid var(--riga);
  display:flex;justify-content:space-between;gap:12px}
.gruppo>h2 em{font-style:normal;color:var(--fioco)}
article{border-bottom:1px solid var(--riga);padding:13px 0 14px}
.capo{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:baseline;margin-bottom:7px}
.capo h3{margin:0;font-size:15px;font-weight:600;flex:1;min-width:min(100%,320px);text-wrap:balance}
.tag{font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;color:var(--tenue);
  border:1px solid var(--riga);padding:1px 6px;border-radius:2px;white-space:nowrap}
.tag.peso-alto{color:var(--alto);border-color:color-mix(in oklab,var(--alto) 45%,var(--riga))}
.tag.peso-medio{color:var(--medio);border-color:color-mix(in oklab,var(--medio) 40%,var(--riga))}
.tag.verso-fcmobile{color:var(--fcmobile);border-color:color-mix(in oklab,var(--fcmobile) 45%,var(--riga))}
.tag.verso-calcetto{color:var(--calcetto);border-color:color-mix(in oklab,var(--calcetto) 45%,var(--riga))}
.coppia{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--riga);border:1px solid var(--riga)}
.lato{background:var(--carta);padding:9px 11px;font-size:13.5px;line-height:1.5}
.lato b{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.1em;
  margin-bottom:4px;font-weight:600}
.lato.fcm b{color:var(--fcmobile)} .lato.cal b{color:var(--calcetto)}
.prova{margin:7px 0 0;font-size:11.5px;color:var(--fioco);word-break:break-word}
@media (max-width:720px){
  .coppia{grid-template-columns:1fr}
  .eti{min-width:100%;padding-top:0}
  .cifra b{font-size:23px}
}
footer{margin-top:44px;padding-top:18px;border-top:1px solid var(--riga);
  color:var(--fioco);font-size:12.5px;max-width:72ch}
footer p{margin:0 0 8px}
`;

const JS = `
const D=DATI, A=AREE;
const stato={area:'',verso:'',peso:'',verifica:'',cerca:''};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const NOMI={fcmobile:'meglio FC Mobile',calcetto:'meglio CALCETTO',pari:'pari','non-confrontabile':'non confrontabile'};

function filtra(){
  const q=stato.cerca.toLowerCase();
  return D.filter(r=>
    (!stato.area||r.a===stato.area) &&
    (!stato.verso||r.v===stato.verso) &&
    (!stato.peso||r.p===stato.peso) &&
    (!stato.verifica||r.g===stato.verifica) &&
    (!q||(r.t+' '+r.f+' '+r.c+' '+r.b).toLowerCase().includes(q)));
}
const ORD={alto:0,medio:1,basso:2};
function disegna(){
  const v=filtra();
  $('#esito').textContent=v.length===D.length?D.length+' differenze':v.length+' di '+D.length;
  const per={};
  for(const r of v){(per[r.a]=per[r.a]||[]).push(r);}
  let h='';
  for(const k of Object.keys(A)){
    const g=per[k]; if(!g) continue;
    g.sort((x,y)=>(ORD[x.p]??3)-(ORD[y.p]??3));
    h+='<section class="gruppo"><h2><span>'+k+' &middot; '+esc(A[k])+'</span><em class="dato">'+g.length+'</em></h2>';
    for(const r of g){
      h+='<article><div class="capo"><h3>'+esc(r.t)+'</h3>'+
         '<span class="tag peso-'+r.p+'">'+r.p+'</span>'+
         '<span class="tag verso-'+r.v+'">'+(NOMI[r.v]||r.v)+'</span>'+
         '<span class="tag">'+esc(r.g)+'</span>'+
         (r.x?'<span class="tag">'+esc(r.x)+'</span>':'')+'</div>'+
         '<div class="coppia"><div class="lato fcm"><b>FC Mobile</b>'+esc(r.f)+'</div>'+
         '<div class="lato cal"><b>CALCETTO</b>'+esc(r.c)+'</div></div>'+
         (r.b?'<p class="prova dato">'+esc(r.b)+'</p>':'')+'</article>';
    }
    h+='</section>';
  }
  $('#elenco').innerHTML=h||'<p class="esito" style="padding:30px 0">Nessuna differenza con questi filtri.</p>';
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button.f'); if(!b) return;
  const c=b.dataset.campo, v=b.dataset.valore;
  stato[c]=stato[c]===v?'':v;
  for(const o of document.querySelectorAll('button.f[data-campo="'+c+'"]'))
    o.setAttribute('aria-pressed', String(o.dataset.valore===stato[c]));
  disegna();
});
$('#cerca').addEventListener('input',e=>{stato.cerca=e.target.value;disegna();});
disegna();
`;

const bottoni = (campo, valori, etichette) => valori.map(v =>
  '<button class="f" data-campo="' + campo + '" data-valore="' + v + '" aria-pressed="false">' +
  (etichette && etichette[v] ? etichette[v] : v) + '</button>').join('');

const html = `<title>CALCETTO contro EA SPORTS FC Mobile — tutte le differenze</title>
<style>${CSS}</style>
<div class="involucro">
<header>
  <h1>CALCETTO contro EA SPORTS FC&nbsp;Mobile</h1>
  <p class="sotto">Un file HTML da 1,94&nbsp;MB contro un pacchetto da 949&nbsp;MB. Ogni riga dice
  <strong>chi dei due sta meglio</strong> e da dove viene il fatto. Aggiornato al 27 agosto 2026,
  su <span class="dato">com.ea.gp.fifamobile 27.0.04</span>.</p>
  <div class="tabellone">
    <div class="cifra"><b class="dato">${TOT}</b><span>differenze</span></div>
    <div class="cifra fcm"><b class="dato">${conta('v', 'fcmobile')}</b><span>meglio FC Mobile</span></div>
    <div class="cifra cal"><b class="dato">${conta('v', 'calcetto')}</b><span>meglio CALCETTO</span></div>
    <div class="cifra par"><b class="dato">${conta('v', 'pari')}</b><span>pari</span></div>
    <div class="cifra"><b class="dato">${conta('p', 'alto')}</b><span>di peso alto</span></div>
  </div>
</header>

<div class="filtri">
  <div class="fila"><span class="eti">Area</span>${bottoni('area', Object.keys(AREE), Object.fromEntries(Object.entries(AREE).map(([k, v]) => [k, k + ' ' + v.split(',')[0].split(' e ')[0]])))}</div>
  <div class="fila"><span class="eti">Chi vince</span>${bottoni('verso', ['fcmobile', 'calcetto', 'pari', 'non-confrontabile'], { fcmobile: 'FC Mobile', calcetto: 'CALCETTO', pari: 'pari', 'non-confrontabile': 'non confrontabile' })}</div>
  <div class="fila"><span class="eti">Peso</span>${bottoni('peso', ['alto', 'medio', 'basso'])}
    <span class="eti" style="min-width:76px">Verifica</span>${bottoni('verifica', ['osservato', 'dal-pacchetto', 'dal-codice', 'da-fonte-web', 'dedotto'])}</div>
  <div class="fila"><span class="eti">Cerca</span>
    <input type="search" id="cerca" placeholder="portiere, fuorigioco, valuta, permessi&hellip;" aria-label="Cerca nel testo delle differenze">
    <span class="esito dato" id="esito"></span></div>
</div>

<main id="elenco"></main>

<footer>
  <p><strong>Come e stato fatto.</strong> Tre fonti, in ordine di forza: il gioco installato e
  aperto sul telefono; il pacchetto smontato (146.695 stringhe leggibili del motore nativo, il
  manifest, 3.216 file); il nostro codice letto riga per riga. Tre passate: una di raccolta, una
  sul pacchetto, una di correzione — quest'ultima ha raddrizzato circa duecento righe e fuso
  centottanta doppioni.</p>
  <p><strong>Il limite.</strong> Il pacchetto altrui e stato letto per sapere dove siamo, non per
  prendere: nessun materiale di EA e stato copiato, e l'APK resta fuori dal repository.</p>
  <p><strong>Che cosa non e stato visto:</strong> il negozio, una partita vera e il multigiocatore
  di FC Mobile restano dietro il lucchetto dell'onboarding. Le righe senza prova diretta sono
  marcate <span class="dato">dedotto</span> e si riconoscono.</p>
</footer>
</div>
<script>const DATI=${JSON.stringify(righe)};const AREE=${JSON.stringify(AREE)};${JS}</script>`;

const out = path.join(RADICE, 'fuori', 'confronto', 'differenze.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('scritta ' + out + '  (' + Math.round(html.length / 1024) + ' kB, ' + TOT + ' differenze)');
