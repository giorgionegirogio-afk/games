/* =====================================================================
   _toppa-meta-taglia.js — LA TOPPA (consegnata, NON applicata): torneo e
   stagione accettano la taglia scelta dal giocatore (5, 7 o 11).

   COSA CURA. Il censimento del 20 agosto (§3.5.1) e la misura di
   _q-meta.js dicono la stessa cosa: con SAVE.taglia=11 dichiarato,
   torneo e stagione giocano comunque a 5 contro 5 — sono INCHIODATI
   (`size:5` alle righe di startSeasonMatch e startTourMatch). Il
   committente ha chiesto le tre taglie per nome, e oggi chi gioca a 7 o
   a 11 non puo' vincere niente.

   =====================================================================
   PERCHE' NON E' STATA APPLICATA, ed e' una scelta, non una dimenticanza.
   1. Gli ancoraggi del 20 agosto vivono sull'md5 30279089de83 del gioco:
      sei specialisti hanno toppe in volo su quel file, e applicarne una
      fuori fila le brucia tutte (e' gia' successo una volta oggi).
   2. PRIMA la fisica, POI la porta d'ingresso: misurato oggi (30+24
      partite a seme di serie, _eventi.js e _q-meta.js concordi al bit),
      l'11 contro 11 finisce 0-0 nei 90 s nel 63% e nel 38% dei casi a
      seconda della serie (52% sul mucchio) e va ai rigori il 39-43%
      delle volte. Aprire OGGI la progressione all'11 significherebbe
      mettere un torneo intero dentro una modalita' che non produce
      partite. Questa toppa va applicata DOPO l'onda della fisica
      (COSA-MANCA §6, Onda B, voce 7: «la taglia scala i corpi e la
      durata, e torneo e stagione accettano 7 e 11»), quando
      `node strumenti/_q-meta.js --tre-taglie` esce verde.
   =====================================================================

   COME SI USA (quando sara' il momento):
     node strumenti/_toppa-meta-taglia.js            scrive la copia di
                                                     prova fuori/con-toppa-meta-taglia.html
     node strumenti/_toppa-meta-taglia.js --dentro   applica al gioco VERO
                                                     (solo dopo l'onda della fisica)
   Regola delle toppe di casa: ogni ancora deve trovarsi ESATTAMENTE UNA
   VOLTA, altrimenti ci si ferma senza scrivere un byte.

   VERIFICA DELLA COPIA (gia' fatta il 20 agosto sulla copia di prova):
     GIOCO_PROVA=fuori/con-toppa-meta-taglia.html node strumenti/_q-meta.js
   si aspetta che il FATTO stampato cambi da «INCHIODATI» a «il chiodo
   del 5v5 e' saltato», con tutti i controlli strutturali ancora verdi.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const GIOCO = path.join(RADICE, 'CALCETTO-il-gioco.html');
const FUORI = path.join(RADICE, 'fuori');

const TOPPE = [
  /* 1 — la stagione legge la taglia scelta. La guardia (7||11) esiste
       perche' setTaglia accetta solo 5/7/11 e qualunque altro valore
       aprirebbe il 5 in silenzio: meglio dirlo qui che scoprirlo la'. */
  [`  /* stagione INCHIODATA al 5v5: e' bilanciata sulla forza-squadre attuale */
  startMatch(1, diff, { tour:true, season:true, opp, size:5 });`,
   `  /* LA TAGLIA DELLA STAGIONE E' QUELLA SCELTA DAL GIOCATORE (5, 7, 11).
     Era inchiodata al 5 fino all'onda della fisica: il committente
     chiede le tre taglie anche in progressione (censimento §3.5.1), e
     l'inchiodo faceva si' che chi gioca a 7 o a 11 non potesse vincere
     niente. La guardia (7||11) c'e' perche' setTaglia accetta solo
     5/7/11 e ogni altro valore aprirebbe il 5 in silenzio. */
  startMatch(1, diff, { tour:true, season:true, opp, size:(SAVE.taglia===7||SAVE.taglia===11)?SAVE.taglia:5 });`],

  /* 2 — il torneo, stessa cura e stessa guardia */
  [`  /* torneo INCHIODATO al 5v5: e' bilanciato sulla forza-squadre attuale */
  startMatch(1, TOUR_DIFF[T.round], { tour:true, opp:T.teams[oi], size:5 });`,
   `  /* LA TAGLIA DEL TORNEO E' QUELLA SCELTA DAL GIOCATORE (5, 7, 11):
     vedi il verbale gemello in startSeasonMatch. */
  startMatch(1, TOUR_DIFF[T.round], { tour:true, opp:T.teams[oi], size:(SAVE.taglia===7||SAVE.taglia===11)?SAVE.taglia:5 });`],

  /* 3 — il commento della schermata GIOCA smette di promettere il
       contrario di quel che il codice fa: un verbale invecchiato e' il
       modo in cui questa casa si e' gia' mentita (regola 6) */
  [`        <!-- LE TRE TAGLIE. Il 5 e' la base e il default; la scelta persiste
             nel salvataggio (SAVE.taglia) e vale per l'amichevole. Torneo e
             stagione restano sul 5: sono bilanciati su quella forza. -->`,
   `        <!-- LE TRE TAGLIE. Il 5 e' la base e il default; la scelta persiste
             nel salvataggio (SAVE.taglia) e vale per amichevole, TORNEO e
             STAGIONE: le tre taglie contano anche in progressione. -->`],
];

const dentro = process.argv.includes('--dentro');
const src = fs.readFileSync(GIOCO, 'utf8');
let out = src, n = 0;
for (const [a, b] of TOPPE) {
  const c = out.split(a).length - 1;
  if (c !== 1) {
    console.error('TROVATO ' + c + ' volte invece di 1, mi fermo senza scrivere:\n' + a.slice(0, 90));
    process.exit(1);
  }
  out = out.replace(a, b);
  n++;
}

if (dentro) {
  /* il freno a mano: applicare questa toppa PRIMA dell'onda della fisica
     mette un torneo dentro una modalita' che non produce partite. Chi la
     applica deve averlo misurato: se --tre-taglie e' ancora rosso, no. */
  console.log('ATTENZIONE: stai applicando la toppa al gioco VERO.');
  console.log('Va fatto SOLO dopo l\'onda della fisica, quando');
  console.log('`node strumenti/_q-meta.js --tre-taglie` esce verde (oggi: rosso, 63%/38% di 0-0 a 11).');
  fs.writeFileSync(GIOCO, out);
  console.log('applicate ' + n + ' toppe a CALCETTO-il-gioco.html');
} else {
  if (!fs.existsSync(FUORI)) fs.mkdirSync(FUORI);
  const copia = path.join(FUORI, 'con-toppa-meta-taglia.html');
  fs.writeFileSync(copia, out);
  console.log('scritte ' + n + ' toppe nella COPIA fuori/con-toppa-meta-taglia.html — il gioco vero NON e\' stato toccato');
  console.log('verifica: GIOCO_PROVA=fuori/con-toppa-meta-taglia.html node strumenti/_q-meta.js');
}
