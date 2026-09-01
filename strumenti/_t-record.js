/* =====================================================================
   _t-record.js — I RECORD PERSONALI E LA SECONDA MENSOLA
   (Contenuto 3 dell'onda, 1 settembre 2026; progetto §4).

   LA DIAGNOSI: la partita misura quindici cose e la carriera ne teneva
   otto — parate, falli, pareggi, serie morivano al fischio. La mappa lo
   dice due volte: «il catalogo e' finito per sempre», «nessun ramo e'
   condizionato al completamento».

   LA CURA: sei contatori di carriera in piu' (pareggi, cleanSheets,
   parate, falli, serieV, serieVMax — la rilettura e' GRATIS: il blocco
   di loadSave itera le chiavi del default); QUATTRO record personali
   {v, data} scritti solo se migliori (gol in una partita, scarto
   massimo, tiri perfetti in gara, vittorie di fila); NOVE trofei nuovi
   (da 15 a 24) su contatori veri e sulla scala, ciascuno col SUO glifo
   gia' in casa (cilindro, stadio, tamburo, bacheca, guanto, cartellone,
   laurea, sfida, maglia: nessuna coppia, come impone il verbale dei
   glifi); la sezione RECORD in STATISTICHE, col trattino a zero — un
   cruscotto, non un vuoto.

   SORTEGGI: zero chiamate nuove a dado(); dataOggi vive fuori dal
   ciclo di partita come le occorrenze esistenti.

   uso:  node strumenti/_t-record.js --out fuori/record.html
         node strumenti/_t-record.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/record.html'));

const ANCORE = [

/* 1 — la carriera profonda e i record nel salvataggio di fabbrica */
{
  nome: '1/8 stats profonde e chiave record in defaultSave',
  cerca:
`    stats:{ partite:0, vittorie:0, golF:0, golS:0, perfetti:0, rubate:0, tornei:0, stagioni:0, maxCoins:0 },`,
  metti:
`    stats:{ partite:0, vittorie:0, golF:0, golS:0, perfetti:0, rubate:0, tornei:0, stagioni:0, maxCoins:0,
            /* la carriera profonda (Contenuto 3, 1 settembre 2026):
               numeri che la partita gia' misurava e morivano al fischio.
               serieV e' la serie CORRENTE di vittorie, serieVMax la
               migliore di sempre. */
            pareggi:0, cleanSheets:0, parate:0, falli:0, serieV:0, serieVMax:0 },
    /* i record personali: il migliore di sempre, con la data. Quattro
       voci fisse; si scrivono solo quando il numero e' migliore
       (aggiornaRecord), mai d'ufficio. */
    record:{ golPartita:{v:0,data:''}, scartoMax:{v:0,data:''}, perfettiPartita:{v:0,data:''}, serieV:{v:0,data:''} },`,
},

/* 2 — la rilettura dei record coi tetti */
{
  nome: '2/8 la rilettura di record in loadSave',
  cerca:
`    if(j.div&&typeof j.div==='object'){
      s.div.g = clamp(j.div.g|0, 0, 8);
      s.div.stelle = clamp(j.div.stelle|0, 0, Math.max(0, DIV_SOGLIA[s.div.g]-1));
      if(Array.isArray(j.div.premi)) for(let i=0;i<=8;i++) s.div.premi[i] = j.div.premi[i] ? 1 : 0;
    }`,
  metti:
`    if(j.div&&typeof j.div==='object'){
      s.div.g = clamp(j.div.g|0, 0, 8);
      s.div.stelle = clamp(j.div.stelle|0, 0, Math.max(0, DIV_SOGLIA[s.div.g]-1));
      if(Array.isArray(j.div.premi)) for(let i=0;i<=8;i++) s.div.premi[i] = j.div.premi[i] ? 1 : 0;
    }
    /* I RECORD (Contenuto 3): chiavi fisse, numeri finiti non negativi,
       data come stringa corta — un migliore-di-sempre manomesso non
       supera la rilettura */
    if(j.record&&typeof j.record==='object') for(const k in s.record){
      const r=j.record[k];
      if(r&&typeof r==='object'&&typeof r.v==='number'&&isFinite(r.v)&&r.v>0)
        s.record[k]={ v:Math.max(0,r.v|0), data:String(r.data||'').slice(0,20) };
    }`,
},

/* 3 — aggiornaRecord nasce accanto alle ricompense */
{
  nome: '3/8 aggiornaRecord prima di applyMatchRewards',
  cerca:
`/* ---------- ricompense di fine partita ---------- */
function applyMatchRewards(){`,
  metti:
`/* il migliore di sempre, con la data: si scrive SOLO se v e' migliore
   (Contenuto 3, 1 settembre 2026). Nessun sorteggio e nessuna festa
   qui: la festa e' dei trofei, che leggono i contatori. */
function aggiornaRecord(k, v){
  const r = SAVE.record && SAVE.record[k];
  if(!r) return;
  if((v|0) > (r.v|0)){ r.v = v|0; r.data = dataOggi(); }
}
/* ---------- ricompense di fine partita ---------- */
function applyMatchRewards(){`,
},

/* 4 — i contatori nuovi e i record, con le righe carriera esistenti */
{
  nome: '4/8 la carriera profonda in applyMatchRewards',
  cerca:
`  CS.partite++; if(won) CS.vittorie++;
  CS.golF+=G.score[0]; CS.golS+=G.score[1];
  CS.perfetti+=S.perfetti[0]; CS.rubate+=S.rubate[0];`,
  metti:
`  CS.partite++; if(won) CS.vittorie++;
  CS.golF+=G.score[0]; CS.golS+=G.score[1];
  CS.perfetti+=S.perfetti[0]; CS.rubate+=S.rubate[0];
  /* la carriera profonda e i record (Contenuto 3): il verbale sta su
     aggiornaRecord e sulle chiavi del salvataggio */
  if(G.score[0]===G.score[1]) CS.pareggi++;
  if(won && G.score[1]===0) CS.cleanSheets++;
  CS.parate += (S.parate&&S.parate[0])|0;
  CS.falli  += (S.falli&&S.falli[0])|0;
  CS.serieV = won ? (CS.serieV|0)+1 : 0;
  if(CS.serieV > (CS.serieVMax|0)) CS.serieVMax = CS.serieV;
  aggiornaRecord('golPartita', G.score[0]);
  aggiornaRecord('scartoMax',  G.score[0]-G.score[1]);
  aggiornaRecord('perfettiPartita', (S.perfetti&&S.perfetti[0])|0);
  aggiornaRecord('serieV', CS.serieV);`,
},

/* 5 — la seconda mensola: nove voci in ACH */
{
  nome: '5/8 i nove trofei nuovi',
  cerca:
`  { id:'disciplina',    ico:'fischietto', nome:'MAI UN FALLO',          desc:'Vinci una partita senza commettere falli', premio:60,  liv:'argento' },`,
  metti:
`  { id:'disciplina',    ico:'fischietto', nome:'MAI UN FALLO',          desc:'Vinci una partita senza commettere falli', premio:60,  liv:'argento' },
  /* LA SECONDA MENSOLA (Contenuto 3, 1 settembre 2026): da 15 a 24,
     tutte su contatori veri o sulla scala — la barra di avanzamento le
     serve da sola. Ogni glifo e' SUO (verbale dei glifi): cilindro,
     stadio, tamburo, bacheca, guanto, cartellone, laurea, sfida,
     maglia — tutti gia' in casa, nessuna coppia. Premi modesti (360 in
     tutto, media 40): la festa e' il toast, non la zecca. */
  { id:'vecchiaguardia',ico:'cilindro',   nome:'VECCHIA GUARDIA',       desc:'Gioca 50 partite',                         premio:30,  liv:'bronzo',  obiettivo:50,   conta:s=>s.partite },
  { id:'centoreti',     ico:'stadio',     nome:'CENTO RETI',            desc:'Segna 100 gol in carriera',                premio:50,  liv:'argento', obiettivo:100,  conta:s=>s.golF },
  { id:'cinquedifila',  ico:'tamburo',    nome:'CINQUE DI FILA',        desc:'Vinci 5 partite di fila',                  premio:40,  liv:'argento', obiettivo:5,    conta:s=>s.serieVMax },
  { id:'muraglia',      ico:'bacheca',    nome:'MURAGLIA',              desc:'10 vittorie senza subire gol',             premio:40,  liv:'argento', obiettivo:10,   conta:s=>s.cleanSheets },
  { id:'goleada',       ico:'cartellone', nome:'GOLEADA',               desc:'Segna 5 gol in una sola partita',          premio:30,  liv:'bronzo' },
  { id:'guantone',      ico:'guanto',     nome:'GUANTONE',              desc:'50 parate dei tuoi portieri',              premio:30,  liv:'bronzo',  obiettivo:50,   conta:s=>s.parate },
  { id:'scalatore',     ico:'laurea',     nome:'SCALATORE',             desc:'Prima promozione nelle divisioni',         premio:20,  liv:'bronzo',  obiettivo:1,    conta:()=>SAVE.div.g },
  { id:'recitta',       ico:'sfida',      nome:'RE DELLA CITTÀ',   desc:'Raggiungi la divisione CITTÀ',        premio:50,  liv:'oro',     obiettivo:7,    conta:()=>SAVE.div.g },
  { id:'leggenda',      ico:'maglia',     nome:'LEGGENDA DEL CAMPETTO', desc:'La vetta della scala. L&rsquo;ultimo trofeo del gioco', premio:70, liv:'oro', obiettivo:8, conta:()=>SAVE.div.g },`,
},

/* 6 — le condizioni della mensola, coi trofei esistenti */
{
  nome: '6/8 le nove condizioni in applyMatchRewards',
  cerca:
`  if(won && S.falli[0]===0) unlockAch('disciplina');`,
  metti:
`  if(won && S.falli[0]===0) unlockAch('disciplina');
  /* la seconda mensola (Contenuto 3): GOLEADA e' della partita, il
     resto e' carriera e scala. unlockAch paga con etichetta dentro la
     raccolta: la lavagnetta resta contabile. */
  if(CS.partite>=50)     unlockAch('vecchiaguardia');
  if(CS.golF>=100)       unlockAch('centoreti');
  if(CS.serieVMax>=5)    unlockAch('cinquedifila');
  if(CS.cleanSheets>=10) unlockAch('muraglia');
  if(G.score[0]>=5)      unlockAch('goleada');
  if(CS.parate>=50)      unlockAch('guantone');
  if(SAVE.div.g>=1)      unlockAch('scalatore');
  if(SAVE.div.g>=7)      unlockAch('recitta');
  if(SAVE.div.g>=8)      unlockAch('leggenda');`,
},

/* 7 — il posto dei record nella schermata */
{
  nome: '7/8 il contenitore dei record in STATISTICHE',
  cerca:
`        <div class="trofbar" id="statTrofei"></div>`,
  metti:
`        <div class="trofbar" id="statTrofei"></div>
        <div class="eti" style="margin:10px 0 2px">Record personali</div>
        <div class="statmini" id="statRecord"></div>`,
},

/* 8 — le quattro tessere dei record */
{
  nome: '8/8 le tessere dei record in buildStatsUI',
  cerca:
`      '<div class="tl" style="margin:6px 0 0"><span>Stagioni vinte</span><b>'+(s.stagioni|0)+'</b></div>';
  }
}`,
  metti:
`      '<div class="tl" style="margin:6px 0 0"><span>Stagioni vinte</span><b>'+(s.stagioni|0)+'</b></div>';
  }
  /* I RECORD PERSONALI (Contenuto 3): quattro tessere col migliore di
     sempre e la data piccola sotto; a zero, il trattino — un cruscotto,
     non un vuoto, come le tessere qui sopra. */
  const rc=$('statRecord');
  if(rc){
    const R=SAVE.record||{};
    const tR=(k,lab)=>{ const r=R[k]||{v:0,data:''};
      return '<div class="stile"><div class="sv">'+(r.v>0?r.v:'&mdash;')+'</div>'+
        '<div class="sl">'+lab+(r.v>0&&r.data?'<br><span style="opacity:.7;font-size:10px">'+r.data+'</span>':'')+'</div></div>'; };
    rc.innerHTML=
      tR('golPartita','Gol in una partita')+
      tR('scartoMax','Scarto massimo')+
      tR('perfettiPartita','Tiri perfetti in gara')+
      tR('serieV','Vittorie di fila');
  }
}`,
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
  ['aggiornaRecord', 7],           // definizione, 4 chiamate, 2 richiami nei verbali
  ['serieVMax', 6],
  ['cleanSheets', 4],
  ["unlockAch('goleada')", 1],
  ["unlockAch('leggenda')", 1],
  ["id:'vecchiaguardia'", 1],
  ['id="statRecord"', 1],
  ['record:{ golPartita', 1],
  ["ico:'cilindro'", 1],
  /* maglia/tamburo/cartellone sono anche glifi del NEGOZIO: la legge
     dell'unicita' vale FRA trofei, il conteggio dice solo che la voce
     nuova c'e' (1 del negozio + 1 della mensola) */
  ["ico:'maglia'", 2],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
