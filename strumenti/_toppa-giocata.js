/* =====================================================================
   _toppa-giocata.js — IL CANCELLO SMETTE DI ATTESTARE UNA POSIZIONE E
   COMINCIA A MISURARLA.

   PERCHE' ESISTE. giocata.js preme i due comandi virtuali a coordinate
   SCRITTE A MANO — (vw-66, vh-140) e (vw-70, vh-232) — ripetute in
   quattro prove su otto e in tre commenti. Finche' i pulsanti sono
   rimasti fermi ha funzionato; il giorno in cui si spostano, il cancello
   dichiara rotto un gioco che funziona, e lo dichiara con la sicurezza
   di chi ha misurato. E' la trappola di casa numero quattro — «uno
   strumento che ATTESTA invece di misurare e' peggio di nessuno
   strumento» — nella sua forma piu' educata: una costante corretta che
   invecchia in silenzio.

   COSA CAMBIA: la quiete chiede al gioco dove sono i comandi
   (__test.pulsanti, che restituisce lo stesso array di touchBtnLayout,
   centro e raggio) e le quattro prove premono LI'. Se il gioco non
   esporta la funzione — versioni vecchie — si ricade sulle coordinate
   di sempre, cosi' il cancello continua a girare su un file d'archivio.
   Da qui in poi spostare un pulsante non fa cadere il cancello: lo fa
   MISURARE nel posto nuovo, che e' esattamente quello che deve fare per
   dire se e' stato spostato bene.

     uso: node strumenti/_toppa-giocata.js strumenti/giocata.js uscita.js
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

cambio('1. la quiete riporta anche DOVE sono i comandi',
`  return {
    pi,
    palla: { x: sx(b.x), y: sy(b.y) },
    comandato: { x: sx(p.x), y: sy(p.y) },
    vw: innerWidth, vh: innerHeight,
  };`,
`  /* DOVE SONO I COMANDI, chiesto al gioco invece che ricordato a
     memoria. __test.pulsanti(0) restituisce lo stesso array che il
     gioco usa per disegnarli e per risolvere il tocco: centro, raggio,
     atto. Il ripiego sulle coordinate storiche serve solo ai file
     d'archivio che non esportano la funzione. */
  let bottoni = null;
  try { bottoni = window.__test.pulsanti ? window.__test.pulsanti(0) : null; } catch (e) { bottoni = null; }
  if (!bottoni || !bottoni.length) {
    bottoni = [ { act: 'shot', x: innerWidth - 66, y: innerHeight - 140, r: 40 },
                { act: 'through', x: innerWidth - 70, y: innerHeight - 232, r: 30 } ];
  }
  return {
    pi,
    palla: { x: sx(b.x), y: sy(b.y) },
    comandato: { x: sx(p.x), y: sy(p.y) },
    vw: innerWidth, vh: innerHeight,
    grande: { x: Math.round(bottoni[0].x), y: Math.round(bottoni[0].y), r: bottoni[0].r },
    piccolo: { x: Math.round(bottoni[1].x), y: Math.round(bottoni[1].y), r: bottoni[1].r },
  };`);

cambio('2. carica: preme il grande dove il grande sta',
`      /* lo schema touch oggi e' unico e il bottone grande vive SEMPRE a
         (vw-66, vh-140): col possesso e' TIRA. setTouchButtons e' uno
         shim senza effetto; la chiamata resta per compatibilita' con le
         versioni vecchie del gioco. 600 ms cadono dentro la finestra
         dolce 500-800 ms. */
      await pag.evaluate(() => window.__test.setTouchButtons(true));
      const x = info.vw - 66, y = info.vh - 140;     // bottone grande (TIRA), squadra 0`,
`      /* lo schema touch e' unico e il bottone GRANDE col possesso e'
         TIRA. Dove stia lo dice il gioco (info.grande), non questa riga:
         vedi il cappello di _toppa-giocata.js. setTouchButtons e' uno
         shim senza effetto; la chiamata resta per compatibilita' con le
         versioni vecchie del gioco. 600 ms cadono dentro la finestra
         dolce 500-800 ms. */
      await pag.evaluate(() => window.__test.setTouchButtons(true));
      const x = info.grande.x, y = info.grande.y;    // bottone grande (TIRA), squadra 0`);

cambio('3. filtrante: preme il piccolo dove il piccolo sta',
`      /* il pulsante piccolo vive a (vw-70, vh-232), raggio 24: si preme
         il centro. L'azione parte al TOCCO, non al rilascio: comanda
         l'appoggio, con i 50 ms dell'anticipo umano davanti. La mira
         viene dal corpo (nessuna levetta attiva): la quiete ha gia'
         girato la faccia del comandato verso un compagno, perche' la
         filtrante pretende un bersaglio con dot > 0,5. */
      await dito.giu(cdp, info.vw - 70, info.vh - 232);`,
`      /* il pulsante PICCOLO: il centro lo dice il gioco (info.piccolo).
         L'azione parte al TOCCO, non al rilascio: comanda l'appoggio,
         con i 50 ms dell'anticipo umano davanti. La mira viene dal corpo
         (nessuna levetta attiva): la quiete ha gia' girato la faccia del
         comandato verso un compagno, perche' la filtrante pretende un
         bersaglio con dot > 0,5. */
      await dito.giu(cdp, info.piccolo.x, info.piccolo.y);`);

cambio('4. cambio: stesso pulsante, contesto opposto',
`      /* stesso pulsante della filtrante, contesto opposto: senza
         possesso di squadra l'atto risolto al touchstart e' 'swap'.
         Il bersaglio qui non e' una velocita': e' l'INDICE del
         comandato, che deve cambiare. La quiete tiene i compagni ad
         almeno 170 unita' dalla palla perche' il cambio AUTOMATICO non
         possa rubare la misura al cambio chiesto col dito. */
      await dito.giu(cdp, info.vw - 70, info.vh - 232);`,
`      /* stesso pulsante della filtrante, contesto opposto: senza
         possesso di squadra l'atto risolto al touchstart e' 'swap'.
         Il bersaglio qui non e' una velocita': e' l'INDICE del
         comandato, che deve cambiare. La quiete tiene i compagni ad
         almeno 170 unita' dalla palla perche' il cambio AUTOMATICO non
         possa rubare la misura al cambio chiesto col dito. */
      await dito.giu(cdp, info.piccolo.x, info.piccolo.y);`);

cambio('5. contrasto: stesso pulsante grande, contesto opposto',
`      /* stesso pulsante della carica, contesto opposto: senza possesso
         l'atto e' 'slide'. La quiete ha messo il PORTATORE avversario a
         84 unita' dal comandato: la scivolata si abbassa (0,06 s di
         anticipo umano) e poi parte, rimirata sul pallone di adesso. */
      await dito.giu(cdp, info.vw - 66, info.vh - 140);`,
`      /* stesso pulsante della carica, contesto opposto: senza possesso
         l'atto e' 'slide'. La quiete ha messo il PORTATORE avversario a
         84 unita' dal comandato: la scivolata si abbassa (0,06 s di
         anticipo umano) e poi parte, rimirata sul pallone di adesso. */
      await dito.giu(cdp, info.grande.x, info.grande.y);`);

cambio('6. il cappello del file dice la regola nuova',
`   contestuali sempre vivi a destra: il grande a (vw-66, vh-140) — TIRA`,
`   contestuali sempre vivi nell'angolo basso a destra. DOVE stiano
   ESATTAMENTE non e' scritto qui: lo chiede il banco al gioco, con
   __test.pulsanti, e lo preme li' (vedi _toppa-giocata.js). Le
   coordinate qui sotto sono quelle storiche e restano come ripiego per
   i file d'archivio: il grande a (vw-66, vh-140) — TIRA`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-giocata.js ingresso.js uscita.js'); process.exit(2); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: trovato ${n} volte (ne serve 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
fs.writeFileSync(usc, t);
console.log(`toppa applicata: ${CAMBI.length} cambi, ${ing} -> ${usc}`);
