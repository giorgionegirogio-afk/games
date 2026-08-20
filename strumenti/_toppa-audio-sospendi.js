/* =====================================================================
   _toppa-audio-sospendi.js — LA TOPPA CHE ZITTISCE IL GIOCO IN TASCA.

   **QUESTA TOPPA NON E' STATA APPLICATA, ED E' UNA SCELTA.** Il 20
   agosto sei specialisti stanno costruendo ancoraggi contro
   CALCETTO-il-gioco.html all'md5 `30279089de83249e44e66d2247294f5f`: chi
   tocca quel file adesso li invalida tutti. Va applicata DOPO l'onda dei
   verbi, e chi la applica deve poi togliere `--nota-aperta nascosto`
   dalla riga di `audio` in `strumenti/tutti.js`, perche' da quel momento
   la parte 5 del cancello dell'audio deve CONTARE.

   NON SCRIVE MAI DENTRO IL GIOCO se non glielo si chiede: legge
   CALCETTO-il-gioco.html (o il file di --da), sostituisce UNA cosa sola,
   e scrive la copia dove dice --a. Se l'ancoraggio non compare
   ESATTAMENTE UNA VOLTA si ferma con codice 1 e non scrive niente.

   uso:
     node strumenti/_toppa-audio-sospendi.js --a fuori/dopo.html
     node strumenti/_toppa-audio-sospendi.js --da altro.html --a dopo.html
     node strumenti/_toppa-audio-sospendi.js --dentro     (scrive nel gioco)

   ---------------------------------------------------------------------
   IL DIFETTO, MISURATO IL 20 AGOSTO CON strumenti/audio.js

   Il gioco reagisce a `visibilitychange`: due ascoltatori, uno che alza
   le dita (riga 9776) e uno che mette in pausa (riga 30655). Nessuno dei
   due tocca l'audio, e in tutte le 32.323 righe del file **non c'e' una
   sola chiamata a `AudioContext.suspend()`** (verificato con un grep, 0
   occorrenze). Il contesto audio resta `running` a schermo spento.

   Misurato dal cancello, tre corse di fila sullo stesso file:
     · IN PARTITA, pagina nascosta: uscita NON silenziosa, picco
       1,15e-2 / 1,19e-2 / 1,18e-2 all'analizzatore piazzato dopo il
       master. E' la folla: `setPaused(true)` la abbassa a 0,15 invece
       che a zero (`Audio5.crowdLevel(0.15)`, riga 30630), quindi il
       telefono in tasca continua a fare il rumore dello stadio.
     · AL MENU, pagina nascosta: **6-8 nodi audio nuovi in 1,6 secondi**
       e picco 3,4e-2. Sono le note della melodia: `setPaused` esce
       subito quando non si e' in partita («if(v && !inMatch) return»,
       riga 30616), quindi al menu nascondere la pagina non ferma
       assolutamente niente e il `setInterval` di riga 7567 continua a
       costruire un oscillatore ogni 460 ms, per sempre.
   Questo e' il caso peggiore e non l'aveva guardato nessuno: chi lascia
   il gioco aperto al menu e mette il telefono in tasca si porta dietro
   una melodia che non finisce mai.

   PERCHE' LA CURA E' `suspend()` E NON «abbassare il volume»
     · un master a zero lascia il grafo VIVO: gli oscillatori continuano
       a essere calcolati, la CPU continua a lavorare e la batteria a
       scendere. Sospendere ferma il filo audio.
     · il `setInterval` della melodia gia' si guarda dal suonare quando il
       contesto non e' `running` (riga 7567: `Audio5.ctx.state==='running'`).
       Sospendere lo zittisce senza toccare quella riga: il codice era
       gia' pronto ad ascoltare, mancava solo chi glielo dicesse.
     · `suspend()` ferma anche l'orologio audio, quindi un suono lungo
       (il boato dura 2,4 s) riprende da dove stava invece di essere
       stato consumato nel buio.
     · su Android una scheda puo' essere congelata senza passare da
       `visibilitychange`: `pagehide` e' l'ultimo istante garantito, e
       costa una riga.

   COSA NON FA QUESTA TOPPA, e va detto:
     · non aggiunge un cursore di volume ne' la separazione
       musica/effetti (il gioco ha un solo master e un interruttore
       acceso/spento: input[type=range] presenti nel file, 0);
     · non tocca il salvataggio non forzato su nascondimento, che il
       censimento mette accanto a questo difetto (§4 caso 16). E' un
       altro incarico e un'altra toppa: `persistSave()` su `pagehide`.

   COME SI VERIFICA CHE HA FUNZIONATO — misurato, non promesso:
     node strumenti/_toppa-audio-sospendi.js --a fuori/con-toppa.html
     node strumenti/audio.js --gioco fuori/con-toppa.html
   Prima (20 agosto, gioco md5 30279089de83): **25 controlli su 28**, e i
   tre rossi sono tutti e soli quelli della parte 5.
   Dopo (stessa ora, su fuori/con-toppa-audio.html, 2320 byte in piu'):
   **28 su 28, VERDE**, senza nessuna deroga. Nient'altro si muove: le
   17 firme delle voci restano identiche a quelle registrate.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const DA = path.resolve(arg('da', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const DENTRO = process.argv.includes('--dentro');
const A = DENTRO ? DA : (arg('a', '') ? path.resolve(arg('a')) : '');

/* L'ANCORAGGIO. Due righe che nel file compaiono una volta sola: la
   riga di commento della melodia e il suo setInterval. Si sceglie
   QUESTO punto e non l'ascoltatore di riga 30655 perche' qui siamo
   dentro il modulo audio, subito dopo che Audio5 e' stato definito e
   configurato — la cura sta accanto alla cosa che cura, che e' l'unico
   posto dove chi legge il file fra un mese la trovera'. */
const CERCA = `/* jingle menu: parte dopo lo sblocco audio */
setInterval(()=>{ if(Audio5.ctx && Audio5.ctx.state==='running') Audio5.jingleTick(); }, 460);`;

const METTI = `/* jingle menu: parte dopo lo sblocco audio */
setInterval(()=>{ if(Audio5.ctx && Audio5.ctx.state==='running') Audio5.jingleTick(); }, 460);

/* =====================================================================
   IL GIOCO IN TASCA NON DEVE CANTARE.

   Il gioco reagiva gia' al nascondimento — alza le dita, mette in pausa
   — ma l'audio non lo toccava nessuno: in tutto il file non c'era una
   chiamata a suspend(), e il contesto restava 'running' a schermo
   spento. Misurato il 20 agosto con strumenti/audio.js, che ascolta
   l'uscita vera con un analizzatore piazzato dopo il master:
     · in partita, nascosto: picco 1,15e-2 su tre corse — e' la folla,
       che setPaused abbassa a 0,15 invece che a zero;
     · AL MENU, nascosto: sei-otto oscillatori nuovi ogni 1,6 s e picco
       3,4e-2, perche' setPaused esce subito fuori dalla partita e la
       melodia del menu non la ferma nessuno. Per sempre.

   Sospendere il contesto e' meglio che azzerare il master per tre
   ragioni: ferma il CALCOLO (un master a zero lascia gli oscillatori
   vivi e la batteria scende lo stesso), ferma l'OROLOGIO audio (un
   boato da 2,4 s riprende da dove stava invece di essere consumato nel
   buio), e la melodia del menu si zittisce da sola perche' il suo
   setInterval qui sopra gia' guarda ctx.state.

   pagehide oltre a visibilitychange: su Android la scheda puo' essere
   congelata senza passare da visibilitychange, e pagehide e' l'ultimo
   istante garantito. Tutto in try: nessuna di queste due righe deve
   poter rompere il gioco se un browser non le conosce.
   ===================================================================== */
function audioInTasca(nascosto){
  if(!Audio5.ctx) return;                  // audio mai sbloccato: non c'e' niente da fermare
  if(nascosto){
    /* la coda della folla si chiude PRIMA di sospendere: se no al ritorno
       riparte da dove stava, cioe' con lo stadio gia' acceso su un gioco
       che e' ancora in pausa */
    Audio5.crowdLevel(0);
    try{ Audio5.ctx.suspend(); }catch(e){}
  }else{
    try{ Audio5.ctx.resume(); }catch(e){}
    /* il livello della folla NON si rialza qui: ci pensa setPaused(false)
       quando il giocatore riprende davvero, e al menu deve restare zero */
  }
}
document.addEventListener('visibilitychange', ()=>audioInTasca(document.hidden));
addEventListener('pagehide', ()=>audioInTasca(true));
addEventListener('pageshow', ()=>audioInTasca(false));`;

const testo = fs.readFileSync(DA, 'utf8');
const quante = testo.split(CERCA).length - 1;
if (quante !== 1) {
  console.error('TOPPA NON APPLICATA: l\'ancoraggio compare ' + quante + ' volte invece di 1 in ' + DA);
  console.error('  cercavo:\n' + CERCA.split('\n').map(r => '    ' + r).join('\n'));
  process.exit(1);
}
if (testo.includes('function audioInTasca(')) {
  console.error('TOPPA GIA\' DENTRO: ' + DA + ' contiene gia\' audioInTasca. Non faccio niente.');
  process.exit(1);
}
if (!A) {
  console.log('L\'ancoraggio c\'e\', una volta sola. Manca --a <file> (o --dentro): non scrivo niente.');
  console.log('Righe aggiunte se applicata: ' + (METTI.split('\n').length - CERCA.split('\n').length));
  process.exit(0);
}
fs.mkdirSync(path.dirname(A), { recursive: true });
fs.writeFileSync(A, testo.replace(CERCA, METTI));
console.log('scritto ' + A + '  (' + fs.statSync(A).size + ' byte, ' +
  (fs.statSync(A).size - Buffer.byteLength(testo)) + ' byte in piu\')');
console.log('verifica con:  node strumenti/audio.js --gioco ' + path.relative(RADICE, A).replace(/\\/g, '/'));
