/* =====================================================================
   _t-registro-fatti.js -- IL REGISTRO DEI FATTI (voce #117, compito 1,
   MIND v1, P0). Costruisce G.fatti: un buffer PASSIVO che trascrive gli
   eventi che il gioco ha GIA' deciso nei rami veri -- zero dado() nuovo,
   zero rami nuovi, nessun return spostato. E' un testimone, non un
   giudice: se un giorno un fatto spostasse un sorteggio, sarebbe un
   difetto (il due-versioni lo coglie, atteso 0/60).

   MODELLO: strumenti/_t-sfumato-crossto.js (l'ANCORE con cerca/metti, il
   guardiano che rifiuta se `cerca' non compare ESATTAMENTE una volta, i
   conteggi a delta dopo la sostituzione).

   COSA FA, sito per sito (18 ancore: init + tetto/helper + azzeramento +
   14 siti di emissione -- uno di questi, il cambio, ne usa due, cattura
   e poi emette -- per 15 ancore di emissione in tutto):
     1. G.fatti:[] nella lettera iniziale di G (accanto a rec/recT/moviola).
     2. FATTI_MAX=200 + emettiFatto(che,chi,dove,esito) accanto a
        REC_MAX/REC_HZ (modello G.rec: push+shift sul tetto). `t' e' lo
        stesso orologio di G.golLog (durataPartita()-G.timeLeft).
     3. G.fatti.length=0 in startMatch, accanto a G.rec.length=0.
     4. addGoal: che:'gol'|'autorete' (G.goalAuto lo dice gia').
     5. esitoRigore: che:'rigore', esito {segnato, team}. chi=-1 --
        DICHIARATO: il duello dei rigori vive a livello di SQUADRA
        (R.turno), il gioco di oggi non tiene un indice del rigorista.
     6-7. infliggiCartellino: che:'giallo' (ramo non espulso) e
        che:'espulsione' (ramo espulso).
     8. checkSlideContact, rubata pulita (:18466): che:'rubata',
        esito {pulita:true, vittima:<indice del carrier>}.
     9. checkSlideContact, fallo (:18484): che:'fallo',
        esito {cattivo, vittima:<indice del carrier>}.
     10-13. tentaPresa, i QUATTRO rami VERI (grep di poseParata/posePresa/
        poseRespinta/poseSfugge ha portato solo ad animazioni, non a
        decisioni: le decisioni vere sono qui, in tentaPresa): PRESA,
        PUGNI (evento in piu' dello stesso rango, dichiarato), SFUGGE,
        RESPINTA. che:'presa'|'pugni'|'sfugge'|'respinta'.
     14. Il duello (tiro di punizione/rigore in cutscene): che:'parata'
        quando s.outcome==='parata' -- il gol del duello lo emette gia'
        addGoal (chiamato piu' sotto nello stesso ramo), niente doppio
        conto. s.keeper e' una SQUADRA: si cerca il portiere vero.
     15. hitPosts: che:'legno' (palo/traversa), chi:b.lastTouch.
     16. prendiAcciacco: il segnaposto "FATTO DA EMETTERE" diventa la
        chiamata vera (schema gia' abbozzato li' in commento).
     17-18. faiCambio: cattura esce/cond/motivo PRIMA che le righe sotto
        li sovrascrivano coi valori di chi entra, poi il segnaposto
        diventa la chiamata vera.

   `che:'parata'` NON corrisponde a un ramo dentro tentaPresa (li' i
   quattro rami veri sono presa/pugni/sfugge/respinta): vive nel duello,
   un sottosistema diverso (tiri di punizione/rigore in cutscene), ed e'
   stato incluso perche' e' comunque un ramo GIA' preso e il vocabolario
   fisso del progetto lo nomina.

   uso:  node strumenti/_t-registro-fatti.js --in fuori/x.html --out fuori/y.html
         node strumenti/_t-registro-fatti.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/registro-fatti.html'));

const ANCORE = [

{
  nome: '1. G.fatti nasce nella lettera iniziale di G',
  cerca:
`  rec:[], recT:0, moviola:null,`,
  metti:
`  fatti:[],                              // registro dei fatti (voce #117, compito 1): vedi emettiFatto
  rec:[], recT:0, moviola:null,`,
},

{
  nome: '2. FATTI_MAX + emettiFatto(), accanto al modello REC_MAX/G.rec',
  cerca:
`const REC_HZ = 20, REC_SEC = 9;
const REC_MAX = REC_HZ*REC_SEC;`,
  metti:
`const REC_HZ = 20, REC_SEC = 9;
const REC_MAX = REC_HZ*REC_SEC;

/* =====================================================================
   IL REGISTRO DEI FATTI (voce #117, compito 1 -- MIND v1, P0). G.fatti e'
   un buffer PASSIVO: trascrive eventi che il gioco ha GIA' deciso nei
   rami veri (addGoal, infliggiCartellino, checkSlideContact, tentaPresa,
   hitPosts, esitoRigore, prendiAcciacco, faiCambio...), zero dado() qui
   dentro e zero rami nuovi -- e' un testimone, non un giudice. Tetto
   FATTI_MAX con push+shift, lo stesso modello di G.rec (qui sopra).
   'chi' e' SEMPRE un indice intero (G.players.indexOf(p)), mai l'oggetto
   giocatore: il replay deterministico confronta indici, non riferimenti.
   't' e' lo stesso orologio che G.golLog gia' usa per il minuto del gol
   (durataPartita()-G.timeLeft), non un cronometro nuovo. */
const FATTI_MAX = 200;
function emettiFatto(che, chi, dove, esito){
  G.fatti.push({ che, chi, dove, esito, t: durataPartita()-G.timeLeft });
  if(G.fatti.length > FATTI_MAX) G.fatti.shift();
}`,
},

{
  nome: '3. G.fatti si azzera in startMatch, accanto a G.rec/G.recT',
  cerca:
`  G.rec.length=0; G.recT=0;`,
  metti:
`  G.fatti.length=0;
  G.rec.length=0; G.recT=0;`,
},

{
  nome: '4. addGoal: che gol|autorete',
  cerca:
`    G.golLog.push({ team, min:G.goalMin, chi:G.goalChi, num:G.goalNum,
                    auto:G.goalAuto, idx:G.goalIdx, s0:G.score[0], s1:G.score[1] });
  }`,
  metti:
`    G.golLog.push({ team, min:G.goalMin, chi:G.goalChi, num:G.goalNum,
                    auto:G.goalAuto, idx:G.goalIdx, s0:G.score[0], s1:G.score[1] });
    /* REGISTRO DEI FATTI (voce #117, compito 1): G.goalIdx e G.goalAuto
       sono gia' calcolati qui sopra da attribuisciRete -- si trascrive,
       non si decide di nuovo. */
    emettiFatto(G.goalAuto?'autorete':'gol', G.goalIdx, [G.goalSpot.x, G.goalSpot.y], {team});
  }`,
},

{
  nome: '5. esitoRigore: che rigore',
  cerca:
`function esitoRigore(segnato){
  const R=G.rigori;
  if(!R) return false;
  R.tiri[R.turno]++;
  if(segnato) R.seg[R.turno]++;
  showBanner('RIGORI  '+R.seg[0]+' - '+R.seg[1], '#ffb020', 1.2);
  R.turno = 1-R.turno;
  programmaRigore();
  return true;
}`,
  metti:
`function esitoRigore(segnato){
  const R=G.rigori;
  if(!R) return false;
  R.tiri[R.turno]++;
  if(segnato) R.seg[R.turno]++;
  showBanner('RIGORI  '+R.seg[0]+' - '+R.seg[1], '#ffb020', 1.2);
  /* REGISTRO DEI FATTI (voce #117, compito 1): chi=-1 DICHIARATO -- il
     duello dei rigori vive a livello di SQUADRA (R.turno), il gioco di
     oggi non tiene un indice del rigorista. */
  emettiFatto('rigore', -1, [G.ball.x, G.ball.y], {segnato:!!segnato, team:R.turno});
  R.turno = 1-R.turno;
  programmaRigore();
  return true;
}`,
},

{
  nome: '6. infliggiCartellino: che giallo (ramo non espulso)',
  cerca:
`  if(!daEspellere){
    showBanner('CARTELLINO GIALLO', '#ffb020', 1.4);
    return;
  }`,
  metti:
`  if(!daEspellere){
    emettiFatto('giallo', G.players.indexOf(p), [p.x,p.y], {gialliTot:p.gialli});
    showBanner('CARTELLINO GIALLO', '#ffb020', 1.4);
    return;
  }`,
},

{
  nome: '7. infliggiCartellino: che espulsione (ramo espulso)',
  cerca:
`  /* il numero lo dice ESPULSIONE_SEC, non la mano: se la costante
     cambia, il cartello resta vero (31 agosto 2026) */
  showBanner('FUORI '+ESPULSIONE_SEC+' SECONDI!', '#ff4d4d', 1.8);`,
  metti:
`  /* il numero lo dice ESPULSIONE_SEC, non la mano: se la costante
     cambia, il cartello resta vero (31 agosto 2026) */
  emettiFatto('espulsione', G.players.indexOf(p), [p.x,p.y], {gialliTot:p.gialli, secondi:ESPULSIONE_SEC});
  showBanner('FUORI '+ESPULSIONE_SEC+' SECONDI!', '#ff4d4d', 1.8);`,
},

{
  nome: '8. checkSlideContact: che rubata (presa pulita, :18466)',
  cerca:
`        G.stats.rubate[p.team]++;`,
  metti:
`        G.stats.rubate[p.team]++;
        emettiFatto('rubata', G.players.indexOf(p), [p.x,p.y], {pulita:true, vittima:G.players.indexOf(carrier)});`,
},

{
  nome: '9. checkSlideContact: che fallo (:18484)',
  cerca:
`        G.stats.falli[p.team]++;`,
  metti:
`        G.stats.falli[p.team]++;
        emettiFatto('fallo', G.players.indexOf(p), [p.x,p.y], {cattivo, vittima:G.players.indexOf(carrier)});`,
},

{
  nome: '10. tentaPresa: che presa',
  cerca:
`    showBanner('PRESA!','#39d3e6',0.9);`,
  metti:
`    showBanner('PRESA!','#39d3e6',0.9);
    emettiFatto('presa', ki, [p.x,p.y], {});`,
},

{
  nome: "11. tentaPresa: che pugni (evento in piu' dello stesso rango)",
  cerca:
`    showBanner('PUGNI!','#39d3e6',0.85);`,
  metti:
`    showBanner('PUGNI!','#39d3e6',0.85);
    emettiFatto('pugni', ki, [p.x,p.y], {});`,
},

{
  nome: '12. tentaPresa: che sfugge',
  cerca:
`    showBanner('SFUGGE!','#ffb020',0.85);`,
  metti:
`    showBanner('SFUGGE!','#ffb020',0.85);
    emettiFatto('sfugge', ki, [p.x,p.y], {});`,
},

{
  nome: '13. tentaPresa: che respinta',
  cerca:
`    showBanner('RESPINTA!','#39d3e6',0.85);`,
  metti:
`    showBanner('RESPINTA!','#39d3e6',0.85);
    emettiFatto('respinta', ki, [p.x,p.y], {});`,
},

{
  nome: '14. il duello: che parata (s.outcome===\'parata\')',
  cerca:
`        if(!s.contato){
          s.contato=true;
          if(s.outcome!=='fuori') G.stats.inPorta[s.shooter]=(G.stats.inPorta[s.shooter]||0)+1;
          if(s.outcome==='parata') G.stats.parate[s.keeper]++;
        }`,
  metti:
`        if(!s.contato){
          s.contato=true;
          if(s.outcome!=='fuori') G.stats.inPorta[s.shooter]=(G.stats.inPorta[s.shooter]||0)+1;
          if(s.outcome==='parata'){
            G.stats.parate[s.keeper]++;
            /* REGISTRO DEI FATTI (voce #117, compito 1): s.keeper e' la
               SQUADRA, non l'uomo -- si cerca il portiere vero, la stessa
               lettura che il gioco fa gia' altrove (mai un dado()). */
            const gk = G.players.find(q=>q.team===s.keeper && q.role==='gk');
            emettiFatto('parata', gk?G.players.indexOf(gk):-1, [G.ball.x,G.ball.y], {});
          }
        }`,
},

{
  nome: '15. hitPosts: che legno (palo/traversa, :19985)',
  cerca:
`      showBanner('PALO!','#39d3e6',1.0);
      Audio5.post(); buzz(25);`,
  metti:
`      showBanner('PALO!','#39d3e6',1.0);
      emettiFatto('legno', b.lastTouch, [cx,cy], {sp:Math.round(sp)});
      Audio5.post(); buzz(25);`,
},

{
  nome: '16. prendiAcciacco: il segnaposto diventa la chiamata vera',
  cerca:
`  if(G.stats.acciacchi) G.stats.acciacchi[p.team]++;
  /* FATTO DA EMETTERE (registro dei fatti, in arrivo):
     {che:'acciacco', chi:G.players.indexOf(p), dove:[p.x,p.y],
      esito:{cond:p.cond, fiato:p.fiato}} */
  showBanner('ACCIACCO · '+cognomeBreve(p.nome), '#ff4d4d', 1.4);`,
  metti:
`  if(G.stats.acciacchi) G.stats.acciacchi[p.team]++;
  /* IL FATTO E' EMESSO (registro dei fatti, voce #117, compito 1): lo
     schema era gia' abbozzato qui in commento, ora e' una vera chiamata. */
  emettiFatto('acciacco', G.players.indexOf(p), [p.x,p.y], {cond:p.cond, fiato:p.fiato});
  showBanner('ACCIACCO · '+cognomeBreve(p.nome), '#ff4d4d', 1.4);`,
},

{
  nome: '17. faiCambio: cattura esce/cond/motivo PRIMA che si sovrascrivano',
  cerca:
`function faiCambio(p, r){
  p.nome=r.nome;`,
  metti:
`function faiCambio(p, r){
  /* REGISTRO DEI FATTI (voce #117, compito 1): il nome, la condizione e
     il motivo di CHI ESCE si leggono ORA -- due righe piu' sotto le
     stesse variabili del giocatore diventano quelle di CHI ENTRA, e il
     fatto deve testimoniare l'uscita. Solo lettura, zero dado(). */
  const _fEsce=p.nome, _fCondEsce=p.cond, _fMotivo=(p.acciacco?'acciacco':'riserva');
  p.nome=r.nome;`,
},

{
  nome: '18. faiCambio: il segnaposto diventa la chiamata vera',
  cerca:
`  p.mesto=0; p.celeb=0; p.fintaT=0; p.frenaT=0;
  /* FATTO DA EMETTERE (registro dei fatti, in arrivo):
     {che:'cambio', chi:G.players.indexOf(p), dove:[p.x,p.y],
      esito:{esce, entra:p.nome, cond, motivo:'acciacco'|'riserva'}} */
  showBanner('CAMBIO · '+cognomeBreve(p.nome), TEAMCOL[p.team], 1.4);`,
  metti:
`  p.mesto=0; p.celeb=0; p.fintaT=0; p.frenaT=0;
  /* IL FATTO E' EMESSO (registro dei fatti, voce #117, compito 1): esce,
     cond e motivo sono quelli catturati in testa alla funzione, PRIMA che
     queste stesse righe li sovrascrivessero con quelli di chi entra. */
  emettiFatto('cambio', G.players.indexOf(p), [p.x,p.y],
              {esce:_fEsce, entra:p.nome, cond:_fCondEsce, motivo:_fMotivo});
  showBanner('CAMBIO · '+cognomeBreve(p.nome), TEAMCOL[p.team], 1.4);`,
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

/* CONTEGGI A DELTA. emettiFatto( deve comparire 14 volte come CHIAMATA
   (i 14 siti di emissione) + 1 come DEFINIZIONE della funzione = 15. */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
if (conta(out, 'function emettiFatto(che, chi, dove, esito){') !== 1) {
  rotti.push('la definizione di emettiFatto non e\' presente esattamente una volta');
}
if (conta(out, 'emettiFatto(') !== 15) {
  rotti.push('emettiFatto( compare ' + conta(out, 'emettiFatto(') + ' volte invece di 15 (1 definizione + 14 chiamate)');
}
if (conta(out, 'const FATTI_MAX = 200;') !== 1) {
  rotti.push('FATTI_MAX non e\' presente esattamente una volta');
}
if (conta(out, 'G.fatti.length=0;') !== 1) {
  rotti.push('l\'azzeramento di G.fatti non e\' presente esattamente una volta');
}
if (conta(out, 'FATTO DA EMETTERE') !== 0) {
  rotti.push('un segnaposto "FATTO DA EMETTERE" e\' sopravvissuto');
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
