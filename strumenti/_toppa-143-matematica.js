/* =====================================================================
   _toppa-143-matematica.js — LE TRASCENDENTI PASSANO DA CASA
   (voce #143, compito 3)

   Innesta nel gioco la libreria di `strumenti/_143-matematica.js` e
   dirotta su di lei OGNI chiamata eseguibile a Math.sin, Math.cos,
   Math.tan, Math.exp, Math.log, Math.atan2 e Math.hypot.

   ------------------------------------------------------------------
   PERCHE' LA SOSTITUZIONE E' TOTALE E NON MIRATA
   ------------------------------------------------------------------
   Il compito 1 ha MISURATO il perimetro (strumenti/_q-perimetro.js, 23
   settembre 2026): dei 452 siti eseguibili, 53 si accendono dentro la
   finestra della simulazione, 100 solo nel disegno, e 225 NON SI
   ACCENDONO MAI in novanta secondi di partita a taglia 5.

   Sono quei 225 a decidere. Un sito che non si e' acceso non e' «fuori
   dal perimetro»: e' NON MISURATO. Ci sono dentro il rigore, la
   rimessa, il portiere che esce, la taglia 11, le tre difficolta', i
   verbi che in CPU contro CPU non escono mai (strappo, scudo, contrasto
   in piedi, cross umano). Innestare solo i 53 misurati sarebbe l'elenco
   troncato che questo repo ha gia' pagato dodici volte: il cancello
   diventerebbe verde e la prima partita con un rigore dal dischetto
   ricomincerebbe a divergere fra due telefoni, senza che nessuno sappia
   perche'.

   E IL PREZZO E' STATO MISURATO PRIMA DI PAGARLO, non temuto: 269
   chiamate per passo di simulazione e 1084 per fotogramma disegnato
   (stesso strumento). Il confronto di prestazione sta nel verbale del
   compito 4.

   COSA RESTA NATIVO, E PERCHE' E' UNA MISURA E NON UNA FIDUCIA:
     · `Math.sqrt` — IEEE-754 la obbliga a essere correttamente
       arrotondata. MISURATO 0/2213 differenze fra i tre motori sugli
       argomenti veri del gioco (_q-casa.js, prova N).
     · `Math.pow` — nessuna norma la obbliga, ma MISURATO 0/3000
       differenze sugli argomenti veri. Sta dentro il perimetro
       (110.786 chiamate in 90 s), quindi non e' un dettaglio: e' un
       fatto delle implementazioni di oggi, e `_q-casa.js` ha una riga
       che diventa ROSSA il giorno in cui smettesse di esserlo.
     · `Math.abs`, `Math.min`, `Math.max`, `Math.floor`, `Math.round`,
       `Math.imul` — esatte per specifica.

   ------------------------------------------------------------------
   L'UNICO POSTO CHE DEVE RESTARE NATIVO PER FORZA
   ------------------------------------------------------------------
   `improntaMotore()` (voce #142) dichiara QUALE MOTORE JAVASCRIPT ha
   calcolato un nastro, e lo fa proprio chiamando le sette trascendenti
   native e leggendone i bit. Se passasse dalla casa, darebbe lo stesso
   numero su tutti i motori: direbbe sempre «stesso motore», cioe'
   attesterebbe invece di misurare — e' il falso `_crit-motore-piatto`,
   nato al #142 da questa identica trappola. Il suo blocco e' protetto
   qui sotto, esplicitamente, e un banco lo verifica
   (`_q-motore-nastro.js`, `_q-motore-falsi.js`).

   E l'impronta del motore SERVE ANCORA, anche dopo questo cantiere: la
   casa rende identica la SIMULAZIONE, non il disegno, e un nastro
   registrato prima del #143 (MOTORE_V 2) resta calcolato con le native.
   La dottrina del #142 — ci si astiene, non si accusa — non decade: si
   applica a meno nastri.

   ------------------------------------------------------------------
   COME SI EVITA DI RISCRIVERE I COMMENTI
   ------------------------------------------------------------------
   Il file e' fatto per meta' di verbali in italiano che PARLANO di
   Math.hypot. Una sostituzione testuale riscriverebbe la
   documentazione e conterebbe siti che non esistono. Qui i siti li
   trova `_143-siti.js`, che salta commenti, stringhe, template ed
   espressioni regolari; e la toppa CONTA quel che sostituisce e si
   ferma se il numero non e' quello atteso. Dopo l'innesto, zero
   chiamate eseguibili alle sette native devono restare fuori dal
   blocco protetto: e' la verifica finale, e senza di lei una toppa
   «quasi completa» passerebbe in silenzio.

   uso: node strumenti/_toppa-143-matematica.js ingresso.html uscita.html
   ===================================================================== */
'use strict';
const fs = require('fs');
const { trovaSiti } = require('./_143-siti.js');
const { SORGENTE } = require('./_143-matematica.js');

/* le sette che passano da casa. pow e sqrt NON sono qui: vedi sopra. */
const DIROTTATE = { sin: 'Msin', cos: 'Mcos', tan: 'Mtan', exp: 'Mexp', log: 'Mlog', atan2: 'Matan2', hypot: 'Mhypot' };

/* il blocco di improntaMotore che deve restare nativo, parola per parola */
const PROTETTO = `  for(let i = 1; i <= 64; i++){
    const v = i * 0.7310127 + 0.13;
    m(Math.hypot(v, v * 1.7));
    m(Math.sin(v));
    m(Math.cos(v));
    m(Math.tan(v));
    m(Math.exp(-v * 0.1));
    m(Math.atan2(v, v * 0.37 - 1.1));
    m(Math.log(v + 1));
  }`;
const SEGNAPOSTO = '/*__143_IMPRONTA_MOTORE_NATIVA__*/';

/* dove va la libreria: in cima allo script principale, prima di
   qualunque uso. Il primo Math.sin eseguibile del gioco sta a riga
   4935; la libreria entra a riga 4029. */
const ANCORA = `<script>
"use strict";
/* =====================================================================
   CALCETTO — prototipo F0`;

/* =====================================================================
   L'INNESTO, COME FUNZIONE. Sta qui e non in ogni chiamante perche' i
   MUTANTI del compito 4 (_crit-casa-*.js) devono nascere dallo STESSO
   innesto che fa il gioco vero, storto in un punto solo. Un falso
   costruito con un secondo innesto scritto a parte proverebbe che il
   cancello vede quel secondo innesto, non il nostro.

     opz.solo         se dato, dirotta SOLO quei nomi (il falso che cura
                      il solo hypot, cioe' la cura parziale del #141)
     opz.impronta     false lascia improntaMotore alla casa (il falso che
                      spegne l'impronta del #142)
     opz.sorgente     un testo di libreria diverso (il falso storto)

   Torna { testo, conto, siti } oppure lancia un errore con dentro il
   motivo: gli ancoraggi non si forzano mai.
   ===================================================================== */
function innesta(t, opz){
  opz = opz || {};
  const quali = {};
  for(const n in DIROTTATE) if(!opz.solo || opz.solo.indexOf(n) >= 0) quali[n] = DIROTTATE[n];
  const proteggi = opz.impronta !== false;
  const sorgente = opz.sorgente || SORGENTE;
  const guai = [];
  if (t.split(ANCORA).length - 1 !== 1) guai.push('ancora della libreria trovata ' + (t.split(ANCORA).length - 1) + ' volte (ne serve 1)');
  if (t.split(PROTETTO).length - 1 !== 1) guai.push('blocco di improntaMotore trovato ' + (t.split(PROTETTO).length - 1) + ' volte (ne serve 1)');
  if (t.indexOf('LA MATEMATICA IN CASA (voce #143)') >= 0) guai.push("la libreria e' gia' innestata in questo file");
  if (guai.length) throw new Error(guai.join('; '));

  /* il blocco protetto esce di scena prima della scansione e rientra dopo:
     cosi' i suoi sette Math. nativi non sono nemmeno candidati */
  if (proteggi) t = t.replace(PROTETTO, SEGNAPOSTO);

  /* la sostituzione, sito per sito, dal fondo verso l'inizio perche' gli
     indici restino validi */
  const siti = trovaSiti(t).filter(s => quali[s.nome]);
  const conto = {};
  for (let i = siti.length - 1; i >= 0; i--) {
    const s = siti[i];
    conto[s.nome] = (conto[s.nome] || 0) + 1;
    t = t.slice(0, s.indice) + quali[s.nome] + '(' + t.slice(s.fine);
  }

  /* la libreria in cima */
  t = t.replace(ANCORA, `<script>
"use strict";
${sorgente}
/* =====================================================================
   CALCETTO — prototipo F0`);

  if (proteggi) {
    if (t.split(SEGNAPOSTO).length - 1 !== 1) throw new Error("il segnaposto e' sparito");
    t = t.replace(SEGNAPOSTO, PROTETTO);
  }

  /* LA VERIFICA CHE NON SI PUO' SALTARE: fuori dal blocco protetto non
     deve restare NEMMENO UNA chiamata eseguibile alle native dirottate.
     Una sola basterebbe a rimettere l'ultimo bit nelle mani del
     telefono, e _q-motori potrebbe restare verde lo stesso se quel sito
     non si accende sui semi provati. Per i mutanti la verifica si
     salta apposta: un mutante e' una bugia, e deve poter nascere. */
  if (!opz.solo && !opz.lascia) {
    const senza = proteggi ? t.replace(PROTETTO, SEGNAPOSTO) : t;
    const dopo = trovaSiti(senza).filter(s => quali[s.nome]);
    if (dopo.length) {
      throw new Error('restano ' + dopo.length + ' chiamate native fuori dal blocco protetto: ' +
                      dopo.slice(0, 5).map(s => s.nome + '@' + s.indice).join(', '));
    }
  }
  return { testo: t, conto, siti: siti.length };
}

/* =====================================================================
   SGUAINA — l'innesto al contrario.

   PERCHE' ESISTE. I mutanti del compito 4 devono nascere dal gioco
   SENZA la cura, e il gioco senza la cura non e' un file che sta da
   qualche parte: sta in un commit, e un banco che dipendesse da un
   commit smetterebbe di funzionare al primo rebase. Qui il gioco di
   prima si RICOSTRUISCE da quello di adesso, togliendo la libreria e
   rimettendo i nomi nativi.

   E DICE ANCHE UNA COSA CHE NESSUN ALTRO DICE: se sguaina(innesta(x))
   e' x parola per parola, allora la cura e' ESATTAMENTE una libreria
   piu' un cambio di nome, e non ha toccato niente altro nel file. E'
   un controllo che vale piu' di una rilettura, e _q-casa-falsi lo fa
   a ogni corsa.

   La sostituzione qui e' testuale e va bene che lo sia: MISURATO sul
   gioco curato, ognuno dei sette nomi compare SOLO come chiamata
   (160 Msin, 104 Mcos, 2 Mtan, 44 Mexp, 1 Mlog, 26 Matan2, 33 Mhypot,
   zero occorrenze senza parentesi). La funzione conta quel che
   sostituisce e si lamenta se il totale non e' quello.
   ===================================================================== */
function sguaina(t, sorgente){
  sorgente = sorgente || SORGENTE;
  if (t.split(sorgente).length - 1 !== 1) throw new Error("la libreria non c'e' (o c'e' piu' di una volta) in questo file");
  t = t.replace(sorgente + String.fromCharCode(10), '');
  let tot = 0;
  for (const n in DIROTTATE) {
    const m = DIROTTATE[n];
    const q = t.split(m + '(').length - 1;
    const s = t.split(m).length - 1;
    if (q !== s) throw new Error(m + ' compare ' + s + " volte ma solo " + q + " come chiamata: la sostituzione testuale non e' sicura");
    tot += q;
    t = t.split(m + '(').join('Math.' + n + '(');
  }
  return { testo: t, tolte: tot };
}

module.exports = { innesta, sguaina, DIROTTATE, PROTETTO, ANCORA, SEGNAPOSTO };

/* ------------------------------------------------------------------
   L'ATTREZZO DA RIGA DI COMANDO
   ------------------------------------------------------------------ */
if (require.main === module) {
  const [, , ing, usc] = process.argv;
  if (!ing || !usc) { console.error('uso: node strumenti/_toppa-143-matematica.js ingresso.html uscita.html'); process.exit(2); }
  if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
  let r;
  try { r = innesta(fs.readFileSync(ing, 'utf8'), {}); }
  catch (e) { console.error('TOPPA NON APPLICATA: ' + e.message); process.exit(1); }
  fs.writeFileSync(usc, r.testo);
  const righe = Object.keys(DIROTTATE).map(n => n + ' ' + (r.conto[n] || 0)).join(', ');
  console.log('toppa applicata: libreria innestata + ' + r.siti + ' chiamate dirottate (' + righe + '), ' + ing + ' -> ' + usc);
}
