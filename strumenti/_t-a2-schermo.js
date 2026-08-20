/* =====================================================================
   _t-a2-schermo.js — LA PAUSA DEVE MOLLARE ANCHE IL BLOCCO SCHERMO
   DELLA PAGINA (voce A2.3, la meta' che il guscio non puo' fare).

   NON APPLICATA, DI PROPOSITO. In questo momento sei specialisti stanno
   costruendo toppe ancorate contro CALCETTO-il-gioco.html; chi tocca
   quel file fa saltare gli ancoraggi di tutti. Questa toppa va applicata
   DOPO l'onda dei verbi, e non da questo strumento: qui si scrive una
   COPIA e non esiste nessuna opzione per scrivere sull'originale.

   uso:
     node strumenti/_t-a2-schermo.js --out fuori/A2-schermo-dopo.html
     node strumenti/_t-a2-schermo.js --in altro.html --out dopo.html

   BASE: CALCETTO-il-gioco.html md5 30279089de83249e44e66d2247294f5f,
   1.794.676 byte, 32.323 righe, fine-riga LF. Se l'ancoraggio non
   compare ESATTAMENTE UNA VOLTA questo file si ferma con codice 3
   (prova nulla) e non scrive niente: non indovina.

   ---------------------------------------------------------------------
   IL DIFETTO, MISURATO SUL TELEFONO E NON DEDOTTO.
   OnePlus 6 (ONEPLUS A6003), Android 11, seriale 01c8eb5a, 20 agosto
   2026, APK versionCode 1385214 (il guscio gia' riparato).

   Il gioco ha gia' il suo blocco schermo, ed e' fatto bene: alla riga
   32313 c'e' `window.tieniAccesoLoSchermo(attivo)`, che prende e molla
   un `navigator.wakeLock.request('screen')`. Misurato: in questa WebView
   `'wakeLock' in navigator` e' `true`, quindi il blocco e' vero e non un
   ramo morto.

   Ma quel blocco lo comanda UN SOLO chiamante: `setScene` (riga 7964),
   con `inMatch = play|kickoff|golden|goal|freekick`. E LA PAUSA NON E'
   UNA SCENA. `setPaused(true)` mette il gioco in pausa e lascia la scena
   dov'era ('play'), quindi il blocco schermo resta preso: una partita
   lasciata in pausa tiene lo schermo acceso finche' la batteria finisce.

   La prova, in quest'ordine, tutta letta dal telefono:

     1. partita avviata, poi tasto INDIETRO vero (`input keyevent 4`):
        __test.paused = true, __test.state = 'play'
     2. il guscio se ne accorge e molla la SUA meta' (logcat GiocoJS:
        «schermo tenuto acceso: false», 00:59:35)
     3. e nonostante questo, nove letture a due secondi l'una dall'altra
        danno tutte
          Wake Locks: size=1  SCREEN_BRIGHT_WAKE_LOCK 'WindowManager'
          ACQ=-11s -13s -15s -17s -20s -22s -24s -26s -29s
        cioe' lo STESSO blocco, mai rilasciato, che cresce; e
          dumpsys window: fl=KEEP_SCREEN_ON ...
        (il flag che si vede li' e' l'OR fra quello della finestra e
        quelli delle viste: la pagina passa di li')
     4. chiamata a mano, a partita ancora in pausa,
        `window.tieniAccesoLoSchermo(false)`:
          dumpsys window: fl=LAYOUT_IN_SCREEN FULLSCREEN ...  (sparito)
          dumpsys power:  Wake Locks: size=0
        In tre secondi. E' esattamente cio' che fa la riga qui sotto.

   PERCHE' NON SI PUO' RIPARARE DAL GUSCIO. Il guscio Java puo' solo
   togliere il PROPRIO FLAG_KEEP_SCREEN_ON (e da questa mattina lo fa: lo
   toglie nel menu, in pausa e a fine partita). Il blocco della pagina e'
   di Chromium e nessuna API di Activity lo revoca: l'unico che puo'
   mollarlo e' chi l'ha preso, cioe' la pagina. Percio' questa mezza
   riparazione sta qui e non in android/Gioco.java.

   PERCHE' DENTRO setPaused E NON ALTROVE. Perche' li' `inMatch` e' gia'
   calcolato dieci righe sopra (con la stessa lista di scene di
   setScene), perche' setPaused e' l'UNICO passaggio obbligato — ci
   arrivano il bottone di pausa, il tasto INDIETRO di Android via
   `window.__indietro`, il tasto Esc, e `__test.setPaused` — e perche'
   mettendola dopo `G.paused=v` non puo' partire per una pausa rifiutata
   (le due guardie sopra escono prima).

   COSA QUESTA TOPPA NON FA: non tocca `setScene`, che continua a
   comandare il blocco sui cambi di scena; e a fine partita ('end') non
   cambia niente, perche' li' e' gia' setScene a mollare.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const RADICE = path.resolve(__dirname, '..');
const DENTRO = path.resolve(arg('in', arg('da', path.join(RADICE, 'CALCETTO-il-gioco.html'))));
const FUORI = arg('out', arg('a', ''));

if (!FUORI) { console.error('serve --out: questa toppa non scrive mai sull\'originale'); process.exit(3); }

const src = fs.readFileSync(DENTRO, 'utf8');

/* L'ANCORAGGIO E' LARGO DI PROPOSITO: prende anche la guardia
   «if(v && !inMatch) return;» che sta sopra. Se domani qualcuno cambia
   quella guardia, `inMatch` puo' non voler piu' dire cio' che vuol dire
   oggi, e questa toppa deve FERMARSI invece di applicarsi su un blocco
   che ha cambiato significato. */
const PRIMA = `  if(v && !inMatch) return;
  G.paused=v;`;

const DOPO = `  if(v && !inMatch) return;
  G.paused=v;
  /* IL BLOCCO SCHERMO SEGUE ANCHE LA PAUSA, NON SOLO LA SCENA.
     Chi lo prende e lo molla e' window.tieniAccesoLoSchermo (in fondo al
     file), e fino a qui lo comandava solo setScene: ma la pausa non e'
     un cambio di scena, quindi una partita lasciata in pausa teneva lo
     schermo acceso per sempre. Misurato su OnePlus 6 / Android 11: in
     pausa, nove letture di dumpsys power a due secondi l'una dall'altra
     davano tutte lo stesso SCREEN_BRIGHT_WAKE_LOCK mai rilasciato; con
     questa riga sparisce (Wake Locks: size=0) e il telefono torna a
     spegnersi da solo. Alla ripresa lo riprende, ma solo se si sta
     davvero in partita: fuori dalla partita comanda setScene. */
  try{ if(window.tieniAccesoLoSchermo) window.tieniAccesoLoSchermo(!v && inMatch); }catch(e){}`;

/* GIA' APPLICATA? Ci si ferma. L'ancoraggio sopravvive alla propria
   toppa (la riga nuova si infila DOPO di esso), quindi senza questo
   controllo una seconda passata metterebbe la stessa riga due volte. */
if (src.indexOf('tieniAccesoLoSchermo(!v && inMatch)') >= 0) {
  console.error('PROVA NULLA — questa toppa risulta gia\' applicata al file di base.');
  process.exit(3);
}

const quante = src.split(PRIMA).length - 1;
if (quante !== 1) {
  console.error('PROVA NULLA — l\'ancoraggio compare ' + quante + ' volte invece di 1.');
  console.error('Il file di base e\' cambiato: questa toppa non indovina, si ferma.');
  console.error('Base attesa: md5 30279089de83249e44e66d2247294f5f, 1.794.676 byte.');
  process.exit(3);
}

const uscita = src.replace(PRIMA, DOPO);
fs.mkdirSync(path.dirname(path.resolve(FUORI)), { recursive: true });
fs.writeFileSync(path.resolve(FUORI), uscita, 'utf8');

const crypto = require('crypto');
const md5 = b => crypto.createHash('md5').update(b).digest('hex');
console.log('base   ' + DENTRO);
console.log('       md5 ' + md5(Buffer.from(src, 'utf8')) + '   ' + Buffer.byteLength(src) + ' byte');
console.log('scritto ' + path.resolve(FUORI));
console.log('       md5 ' + md5(Buffer.from(uscita, 'utf8')) + '   ' + Buffer.byteLength(uscita) + ' byte');
console.log('differenza: +' + (Buffer.byteLength(uscita) - Buffer.byteLength(src)) + ' byte, un solo tratto sostituito');
console.log('\nNON APPLICATA all\'originale: va applicata dopo l\'onda dei verbi.');
