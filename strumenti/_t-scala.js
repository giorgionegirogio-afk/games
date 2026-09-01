/* =====================================================================
   _t-scala.js — LE DIVISIONI DEL QUARTIERE
   (Contenuto 1 dell'onda, 1 settembre 2026; progetto
   _analisi/PROGETTO-ONDA-CONTENUTI-1.md §2, asciugato dalla miniera
   MINIERA-FCM.md §1: tre fasce da tre, premi a formula, pavimento di
   fascia, niente riga di fondale in GIOCA, niente azzeramento mai).

   LA LOGICA: nove gradini che restano fra le partite e non scadono mai.
   Si sale vincendo, si scende perdendo, e il gradino dice CONTRO CHI
   vale la pena vincere: nella fascia di mezzo niente stelle dal FACILE,
   in quella alta solo il DURO conta. Il premio di promozione si paga
   UNA volta per gradino, con etichetta, dentro la lavagnetta.

   CONTANO: tutte le 1-giocatore contro CPU (amichevole, torneo,
   stagione — passano tutte da applyMatchRewards). NON contano: il 2
   giocatori (il secondo pollice non e' un avversario che misura), il QA
   cpu-contro-cpu (gia' escluso), le sfide e i loro replay (G.sfida), la
   SFIDA in rete (ha gia' la sua classifica Elo).

   SORTEGGI: zero chiamate a dado() — aritmetica pura sugli esiti, nel
   territorio del dopo-partita. Nei banchi CPU-contro-CPU il blocco non
   viene mai raggiunto (uscita su G.cpu[0]).

   uso:  node strumenti/_t-scala.js --out fuori/scala.html
         node strumenti/_t-scala.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/scala.html'));

const ANCORE = [

/* 1 — le costanti della scala, accanto a quelle del torneo */
{
  nome: '1/13 le costanti della scala',
  cerca:
`/* difficolta' CPU crescente: quarti facile, semifinale normale, finale dura */
const TOUR_DIFF=[0,1,2];`,
  metti:
`/* difficolta' CPU crescente: quarti facile, semifinale normale, finale dura */
const TOUR_DIFF=[0,1,2];
/* =====================================================================
   LE DIVISIONI DEL QUARTIERE (Contenuto 1, 1 settembre 2026).
   Nove gradini in TRE FASCE da tre, sul modello a due livelli del
   concorrente (MINIERA-FCM.md §1: gruppi + mini-divisioni; nove e non
   ventisette perche' il nostro spazio avversario sono tre gradi di CPU,
   non una popolazione). Il gradino dice contro chi vale la pena vincere
   (stellaValida); il premio e' GENERATO da tre manopole, non scritto a
   mano — base 12, passo 1,25 a gradino, salto 1,4 a fascia:
   12, 15, 26, 33, 41, 72, 90, 112 = 401 monete una tantum, da rivedere
   DOPO la misura del tasso monete/partita (progetto §6.8). Il pavimento
   e' di FASCIA: sotto il primo gradino della fascia raggiunta non si
   retrocede mai — la fascia conquistata e' per sempre, il gradino si
   difende. Nessun orologio, nessun azzeramento: la scala non scade.
   Zero dado(): aritmetica pura sugli esiti.
   ===================================================================== */
const DIV_NOMI=['CORTILE','VICOLO','VIA','PIAZZA','RIONE','BORGO','QUARTIERE','CITTÀ','LEGGENDA DEL CAMPETTO'];
const DIV_SOGLIA=[3,3,3,3,3,4,4,4,5];
const DIV_PREMIO=[0].concat([1,2,3,4,5,6,7,8].map(g=>Math.round(12*Math.pow(1.25,g-1)*Math.pow(1.4,Math.floor(g/3)))));
/* la stella vale se l'avversario e' all'altezza del gradino: fascia
   bassa sempre, fascia di mezzo da NORMALE in su, fascia alta solo DURO */
function stellaValida(diff, g){ return g<3 || (g<6 ? diff>=1 : diff===2); }`,
},

/* 2 — la chiave div nel salvataggio di fabbrica */
{
  nome: '2/13 la chiave div in defaultSave',
  cerca:
`    stats:{ partite:0, vittorie:0, golF:0, golS:0, perfetti:0, rubate:0, tornei:0, stagioni:0, maxCoins:0 },
    albo:[],                      // tornei vinti: {data, campo, nome}`,
  metti:
`    stats:{ partite:0, vittorie:0, golF:0, golS:0, perfetti:0, rubate:0, tornei:0, stagioni:0, maxCoins:0 },
    /* la scala del quartiere: gradino, stelle nel gradino, e i premi di
       promozione gia' pagati (bandiere 0/1 per gradino: il saliscendi
       non e' una zecca) — Contenuto 1, 1 settembre 2026 */
    div:{ g:0, stelle:0, premi:[] },
    albo:[],                      // tornei vinti: {data, campo, nome}`,
},

/* 3 — la rilettura con i tetti in loadSave */
{
  nome: '3/13 la rilettura di div con i tetti',
  cerca:
`    if(j.stats&&typeof j.stats==='object') for(const k in s.stats){ if(typeof j.stats[k]==='number'&&isFinite(j.stats[k])) s.stats[k]=Math.max(0,j.stats[k]|0); }`,
  metti:
`    if(j.stats&&typeof j.stats==='object') for(const k in s.stats){ if(typeof j.stats[k]==='number'&&isFinite(j.stats[k])) s.stats[k]=Math.max(0,j.stats[k]|0); }
    /* LA SCALA (Contenuto 1): chiavi note, tetti duri, premi come
       bandiere 0/1 — un salvataggio manomesso (div.g=99) non diventa
       un fuori-scala ne' una zecca. I salvataggi nati prima prendono
       il default: chiave additiva, versione ferma a v4. */
    if(j.div&&typeof j.div==='object'){
      s.div.g = clamp(j.div.g|0, 0, 8);
      s.div.stelle = clamp(j.div.stelle|0, 0, Math.max(0, DIV_SOGLIA[s.div.g]-1));
      if(Array.isArray(j.div.premi)) for(let i=0;i<=8;i++) s.div.premi[i] = j.div.premi[i] ? 1 : 0;
    }`,
},

/* 4 — il cuore: la scala dentro applyMatchRewards */
{
  nome: '4/13 la scala in applyMatchRewards',
  cerca:
`  let gain=0; for(const b of br) gain+=b[1];
  addCoinsInternal(gain);`,
  metti:
`  /* LE DIVISIONI DEL QUARTIERE (Contenuto 1, 1 settembre 2026): il
     verbale intero sta sulle costanti DIV_*. Qui il blocco eredita
     GRATIS le guardie di questa funzione (G.cpu[0] esce in testa, i
     replay non arrivano per G.matchRewarded) e aggiunge le sue: il 2
     giocatori non e' un avversario che misura, la sfida ha la sua
     classifica. Il premio passa da addCoinsInternal CON etichetta:
     entra in G._brExtra e la lavagnetta torna al bit. */
  if(G.mode===1 && !G.sfida){
    const gPrima=SAVE.div.g;
    let dStella=0;
    if(won && stellaValida(G.diff, SAVE.div.g)) dStella=+1;
    else if(!won && !pari) dStella=-1;
    if(dStella!==0){
      SAVE.div.stelle += dStella;
      if(SAVE.div.stelle >= DIV_SOGLIA[SAVE.div.g] && SAVE.div.g < 8){
        SAVE.div.g++; SAVE.div.stelle=0;
        if(!SAVE.div.premi[SAVE.div.g]){
          SAVE.div.premi[SAVE.div.g]=1;
          addCoinsInternal(DIV_PREMIO[SAVE.div.g], 'Promozione: '+DIV_NOMI[SAVE.div.g]);
        }
      } else if(SAVE.div.stelle < 0){
        /* il pavimento di FASCIA: si scende solo dentro la fascia */
        if(SAVE.div.g>2 && SAVE.div.g%3!==0){ SAVE.div.g--; SAVE.div.stelle=DIV_SOGLIA[SAVE.div.g]-1; }
        else SAVE.div.stelle=0;
      }
    }
    G._divEsito = { d:dStella, g:SAVE.div.g, stelle:SAVE.div.stelle, prima:gPrima };
  }
  let gain=0; for(const b of br) gain+=b[1];
  addCoinsInternal(gain);`,
},

/* 5 — l'esito della scala non sopravvive fra le partite (rischio 6) */
{
  nome: '5/13 azzeramento in startMatch',
  cerca:
`  G.possOwner=-1; G.possT=0; G.pulse=0; G.crowdSndT=0;`,
  metti:
`  G.possOwner=-1; G.possT=0; G.pulse=0; G.crowdSndT=0;
  /* e con loro l'esito della scala (Contenuto 1, rischio 6 del
     progetto): stato di fine partita, mai letto dalla simulazione */
  G._divEsito=null;`,
},

/* 6 — la riga della scala sotto il riquadro monete (markup) */
{
  nome: '6/13 il markup della riga della scala',
  cerca:
`      <div class="csaldo">SALDO: <b id="coinSaldo">0</b> <i class="coin"></i></div>
    </div>`,
  metti:
`      <div class="csaldo">SALDO: <b id="coinSaldo">0</b> <i class="coin"></i></div>
      <div id="endScala" class="hidden" style="margin-top:6px;text-align:center;font-size:13px;letter-spacing:.4px"></div>
    </div>`,
},

/* 7 — la riga si scrive con le monete, e la promozione fa festa */
{
  nome: '7/13 la riga della scala in showEndCoins',
  cerca:
`function showEndCoins(rew){
  if(!rew){ hide(ui.endCoins); return; }
  show(ui.endCoins);
  ui.coinBreak.innerHTML = rew.br.map(b=>
    '<div class="crow"><span>'+b[0]+'</span><b>+'+b[1]+'</b></div>').join('');`,
  metti:
`function showEndCoins(rew){
  if(!rew){ hide(ui.endCoins); return; }
  show(ui.endCoins);
  ui.coinBreak.innerHTML = rew.br.map(b=>
    '<div class="crow"><span>'+b[0]+'</span><b>+'+b[1]+'</b></div>').join('');
  /* LA SCALA NON E' MAI MUTA QUANDO SI MUOVE (Contenuto 1): una riga
     sotto il saldo — stella, promozione o retrocessione — e il cambio
     di FASCIA (gradini 3, 6) e la vetta fanno la festa grande col
     cartello, in riuso da showBanner. */
  { const es=document.getElementById('endScala'), e=G._divEsito;
    if(es){
      if(e && (e.d!==0 || e.g!==e.prima)){
        const su=e.g>e.prima, giu=e.g<e.prima;
        es.classList.remove('hidden');
        es.innerHTML = su ? 'PROMOSSO: <b>'+DIV_NOMI[e.g]+'</b>'
          : giu ? 'RETROCESSO: <b>'+DIV_NOMI[e.g]+'</b>'
          : (e.d>0 ? 'STELLA GUADAGNATA' : 'STELLA PERSA')
            +' &middot; '+DIV_NOMI[e.g]+' '+e.stelle+'/'+DIV_SOGLIA[e.g];
        if(su) showBanner(DIV_NOMI[e.g], TEAMCOL[0], (e.g%3===0||e.g===8)?2.2:1.3);
      } else { es.classList.add('hidden'); es.innerHTML=''; }
    } }`,
},

/* 8 — la terza voce in bacheca */
{
  nome: '8/13 la voce DIVISIONI in bacheca',
  cerca:
`      <button class="voce" id="btnTrofei">TROFEI <small>obiettivi e albo d'oro</small></button>
      <button class="voce" id="btnStatsScr">STATISTICHE <small>la tua carriera</small></button>`,
  metti:
`      <button class="voce" id="btnTrofei">TROFEI <small>obiettivi e albo d'oro</small></button>
      <button class="voce" id="btnDivisioni">DIVISIONI <small>la scala del quartiere</small></button>
      <button class="voce" id="btnStatsScr">STATISTICHE <small>la tua carriera</small></button>`,
},

/* 9 — la schermata, gemella di TROFEI */
{
  nome: '9/13 la schermata delle divisioni',
  cerca:
`    <div class="azioni"><button class="btnA sec" id="btnBackTrofei">TORNA ALLA BACHECA</button></div>
  </div>
</div>`,
  metti:
`    <div class="azioni"><button class="btnA sec" id="btnBackTrofei">TORNA ALLA BACHECA</button></div>
  </div>
</div>

<!-- ============ DIVISIONI (la scala del quartiere) ============
     Gemella di TROFEI nelle classi e nel passo: i nove gradini in
     colonna dall'alto, l'attuale evidenziato, le stelle come pallini,
     la regola della fascia scritta in chiaro accanto al suo nome, il
     premio della prossima promozione col glifo moneta. Nessun orologio,
     nessuna scadenza: la scala non si azzera mai. -->
<div id="divisioni" class="ov hidden">
  <div class="box">
    <h1 class="sotto-titolo">DIVISIONI</h1>
    <div class="eti" style="margin:0 0 4px">La scala del quartiere</div>
    <div class="achlist" id="divList"></div>
    <div class="eti" style="margin-top:14px;opacity:.8"><small>La fascia conquistata &egrave; per sempre: non si retrocede mai sotto il suo primo gradino. La scala non scade e non si azzera.</small></div>
    <div style="height:14px"></div>
    <div class="azioni"><button class="btnA sec" id="btnBackDiv">TORNA ALLA BACHECA</button></div>
  </div>
</div>`,
},

/* 10 — il registro delle schermate */
{
  nome: '10/13 ui.divisioni nel registro',
  cerca:
`  trofei:$('trofei'), statistiche:$('statistiche'), impostazioni:$('impostazioni'),`,
  metti:
`  trofei:$('trofei'), statistiche:$('statistiche'), impostazioni:$('impostazioni'),
  divisioni:$('divisioni'),`,
},

/* 11 — la navigazione la eredita gratis */
{
  nome: '11/13 divisioni dentro SCREENS',
  cerca:
`               $('sfida'),$('classifica')].filter(Boolean);`,
  metti:
`               $('sfida'),$('classifica'),$('divisioni')].filter(Boolean);`,
},

/* 12 — la schermata si costruisce accanto alle sorelle */
{
  nome: '12/13 buildDivisioniUI accanto a buildStatsUI',
  cerca:
`/* statistiche carriera: due tessere grandi, l'arco delle vittorie, poi le
   piccole. Con tutti zeri deve comunque sembrare un cruscotto, non un vuoto. */
function buildStatsUI(){`,
  metti:
`/* la scala del quartiere: nove gradini dall'alto, tre fasce con la
   regola scritta accanto, l'attuale acceso e gli altri in penombra
   (riuso delle classi dei trofei: achrow/lock/apremio/afatto). Il
   premio col glifo moneta sta sui gradini non ancora pagati: quello
   della prossima promozione si legge senza cercarlo. */
function buildDivisioniUI(){
  const g=SAVE.div.g, st=SAVE.div.stelle;
  const FASCE=['LA STRADA','IL CUORE DEL QUARTIERE','LA CITTÀ ALTA'];
  const REGOLE=['ogni vittoria contro la CPU vale una stella',
                'le stelle si vincono solo contro NORMALE e DURO',
                'le stelle si vincono solo contro il DURO'];
  let h='';
  for(let i=8;i>=0;i--){
    if(i===8||i===5||i===2){
      const f=Math.floor(i/3);
      h+='<div class="eti" style="margin:10px 0 4px">'+FASCE[f]
        +' <small style="opacity:.75">&middot; '+REGOLE[f]+'</small></div>';
    }
    const qui=(i===g);
    const pieni = qui ? st : (i<g ? DIV_SOGLIA[i] : 0);
    let stelle=''; for(let k=0;k<DIV_SOGLIA[i];k++) stelle += (k<pieni?'&#9679;':'&#9675;');
    const premio = i===0 ? ''
      : (SAVE.div.premi[i] ? '<span class="afatto">FATTO</span>'
                           : '<span class="apremio">+'+DIV_PREMIO[i]+' <i class="coin"></i></span>');
    h+='<div class="achrow'+(qui?'':' lock')+'">'
      +'<div class="atxt"><b>'+(i+1)+'. '+DIV_NOMI[i]+(qui?' &mdash; SEI QUI':'')+'</b>'
      +'<small>'+stelle+'</small></div>'+premio+'</div>';
  }
  const el=document.getElementById('divList'); if(el) el.innerHTML=h;
}

/* statistiche carriera: due tessere grandi, l'arco delle vittorie, poi le
   piccole. Con tutti zeri deve comunque sembrare un cruscotto, non un vuoto. */
function buildStatsUI(){`,
},

/* 13 — i gestori, accanto ai fratelli */
{
  nome: '13/13 i gestori della voce e del ritorno',
  cerca:
`$('btnTrofei').addEventListener('click', ()=>{ Audio5.unlock(); goScreen(ui.trofei); buildTrofeiUI(); });
$('btnStatsScr').addEventListener('click', ()=>{ Audio5.unlock(); goScreen(ui.statistiche); buildStatsUI(); });`,
  metti:
`$('btnTrofei').addEventListener('click', ()=>{ Audio5.unlock(); goScreen(ui.trofei); buildTrofeiUI(); });
$('btnDivisioni').addEventListener('click', ()=>{ Audio5.unlock(); goScreen(ui.divisioni); buildDivisioniUI(); });
$('btnStatsScr').addEventListener('click', ()=>{ Audio5.unlock(); goScreen(ui.statistiche); buildStatsUI(); });`,
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
  ['DIV_NOMI', 7],          // costante, promozione, 4 in showEndCoins, schermata
  ['DIV_SOGLIA', 7],        // costante, loadSave, 2 nella scala, riga, 2 in schermata
  ['DIV_PREMIO', 3],        // costante, promozione, schermata
  ['stellaValida', 3],      // definizione, richiamo nel verbale, uso
  ['G._divEsito', 3],       // scrittura, azzeramento, lettura
  ["div:{ g:0, stelle:0, premi:[] }", 1],
  ['btnDivisioni', 2],      // markup e gestore
  ['buildDivisioniUI', 2],  // definizione e gestore
  ['id="divisioni"', 1],
  ['id="endScala"', 1],
  ["$('divisioni')", 2],    // registro ui + SCREENS
  ['pavimento di FASCIA', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
