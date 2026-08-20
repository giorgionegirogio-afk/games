/* =====================================================================
   _toppa-salvataggio.js — QUANDO L'APP SPARISCE, IL SALVATAGGIO VA SUL
   DISCO. Toppa ANCORATA e NON APPLICATA: scrive su un file di uscita,
   non tocca mai il gioco del repo.

     uso: node strumenti/_toppa-salvataggio.js CALCETTO-il-gioco.html uscita.html

   Ancorata su md5 30279089de83249e44e66d2247294f5f (20 agosto 2026).
   VA APPLICATA DOPO L'ONDA DEI VERBI, non adesso: in questo momento sei
   specialisti tengono ancoraggi su quel medesimo file.

   ---------------------------------------------------------------------
   IL DIFETTO, MISURATO E NON SUPPOSTO.
   Il gioco ha gia' un ascoltatore su 'visibilitychange' (riga 30655) e fa
   una cosa sola: mette in pausa. Non scrive niente. Misurato oggi con
   strumenti/salvataggio.js, caso 11, mettendo in SAVE una sentinella
   (424242) e poi nascondendo la pagina:

     byte sul disco prima del nascondimento   1127
     byte sul disco dopo                      1127, contenuto IDENTICO
     sentinella arrivata sul disco            NO

   Su Android questo conta piu' che altrove, e il quaderno di casa lo dice
   gia' con parole sue: «localStorage sopravvive alla morte del processo
   solo se l'app e' passata prima in sottofondo; Chromium scrive su disco
   in differita». Il guscio Java fa la sua parte (Gioco.java:321 chiama
   vista.onPause(), che e' cio' che manda in scrittura la coda di
   Chromium), ma puo' mandare in scrittura solo cio' che il gioco gli ha
   dato. Tutto quello che a quel momento sta ancora in SAVE e non e'
   ancora passato per persistSave() e' perso, e l'utente non lo sapra'
   mai: lo ritrovera' come progresso scomparso.

   Oggi la finestra di esposizione e' stretta — il gioco persiste a fine
   partita, a ogni trofeo, a ogni impostazione, a ogni acquisto: trenta
   chiamate a persistSave() — e va detto invece di gonfiare il difetto.
   Ma e' stretta per come il codice e' scritto ADESSO: e' una proprieta'
   che nessuno sorveglia, e la prima riga che cambia SAVE senza persistere
   la allarga senza che nessuno se ne accorga. La toppa la chiude alla
   radice: nel momento in cui l'app sparisce, cio' che c'e' in memoria e'
   sul disco, comunque ci si sia arrivati.

   IL COSTO, misurato (strumenti/_sonda-costo-salvataggio.js, 200 scritture
   di un salvataggio vero da 1123 byte, banco a 915x412). Due misure, la
   seconda con il banco a 1,02 volte il suo minimo storico — cioe' libero,
   dichiarato perche' e' una misura di tempo:
     mediana 0,100 ms · p90 0,200 ms · massimo 4,900 ms
     mediana 0,100 ms · p90 0,200 ms · massimo 4,300 ms
   La mediana e' esattamente un passo dell'orologio del browser
   (performance.now e' arrotondato a 0,1 ms per difesa): il valore vero sta
   SOTTO quella soglia e questa misura non sa dire quanto. Al nascondimento
   se ne paga UNA sola. E' un numero misurato, non un aggettivo.

   PERCHE' TUTTI E TRE GLI EVENTI E NON UNO SOLO.
   In una WebView Android l'app che va in sottofondo NON scarica la
   pagina: 'pagehide' spesso non arriva mai, e l'unico evento certo e'
   'visibilitychange' con document.hidden vero. 'pagehide' serve al caso
   diverso e altrettanto vero della pagina che viene davvero smontata
   (il browser, l'aggiornamento del guscio). 'freeze' e' il congelamento
   della scheda di Chromium: e' l'ultimo istante in cui gira del codice.
   Costano un ascoltatore ciascuno e coprono tre morti diverse.

   PERCHE' NON BASTAVA CHIAMARE persistSave DENTRO setPaused.
   Perche' setPaused(true) esce subito se non si e' in partita (riga
   30616: «if(v && !inMatch) return;»). Il caso che si vuole coprire e'
   proprio l'altro: l'utente che compra un campo, chiude l'app dal menu e
   il sistema la uccide. Il salvataggio va forzato dal nascondimento, non
   dalla pausa.

   COSA NON FA. Non tocca la pausa, non aggiunge stato, non cambia lo
   schema del salvataggio, non salva la partita in corso (quella non e'
   mai stata salvata: e' una scelta di progetto, non un difetto). Un solo
   ancoraggio, tre righe di comportamento nuovo.

   COME SI VEDE CHE HA FUNZIONATO:
     node strumenti/_toppa-salvataggio.js CALCETTO-il-gioco.html /fuori/con-toppa.html
     node strumenti/salvataggio.js --gioco /fuori/con-toppa.html
   Il caso 11 passa da APERTO a OK, e da quel momento il cancello lo
   pretende sempre (e' un cricchetto: vedi la sua intestazione).
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

cambio('1. nascondere l\'app scrive il salvataggio sul disco',
`/* se la scheda va in background durante la partita, metti in pausa */
if(typeof document.addEventListener==='function'){
  document.addEventListener('visibilitychange', ()=>{ if(document.hidden) setPaused(true); });
}`,
`/* se la scheda va in background durante la partita, metti in pausa —
   E SI SCRIVE IL SALVATAGGIO, perche' su Android un'app in sottofondo
   puo' essere uccisa in qualunque momento e senza preavviso. Fino al 20
   agosto 2026 qui si metteva soltanto in pausa: misurato con una
   sentinella in SAVE, nascondere l'app lasciava il disco IDENTICO
   (strumenti/salvataggio.js, caso 11). Tutto cio' che stava in memoria e
   non era ancora passato per persistSave() spariva, e il giocatore lo
   scopriva soltanto come progresso perso.
   Tre eventi per tre morti diverse: 'visibilitychange' e' l'unico che una
   WebView Android consegna con certezza quando l'app va in sottofondo
   (la pagina non viene scaricata, quindi 'pagehide' spesso non arriva);
   'pagehide' copre la pagina davvero smontata; 'freeze' e' l'ultimo
   istante in cui gira codice in una scheda congelata da Chromium.
   Costo misurato di una scrittura (1123 byte): mediana 0,100 ms su 200
   ripetizioni, che e' il passo minimo dell'orologio del browser — il
   vero valore sta sotto. Se ne paga UNA, e solo quando si sparisce.
   NON si passa da setPaused: quello esce subito fuori dalla partita
   (riga sopra: «if(v && !inMatch) return;»), e il caso da coprire e'
   proprio l'utente che chiude l'app stando nel menu dopo un acquisto. */
function salvaPerSparizione(){
  try{ persistSave(); }catch(e){}   // mai un'eccezione mentre l'app se ne va
}
if(typeof document.addEventListener==='function'){
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden){ setPaused(true); salvaPerSparizione(); }
  });
  document.addEventListener('freeze', salvaPerSparizione);
  window.addEventListener('pagehide', salvaPerSparizione);
}`);

/* ------------------------------------------------------------------
   IL CANCELLO DELLA TOPPA: o l'ancoraggio e' unico, o non si scrive
   niente. Un ancoraggio trovato zero volte vuol dire che il file e'
   cambiato sotto; trovato due volte vuol dire che si sta per toccare
   anche un posto che non si e' letto.
   ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-salvataggio.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
if (require('path').resolve(ing) === require('path').resolve(usc)) {
  console.error('TOPPA NON APPLICATA: uscita uguale all\'ingresso. Questa toppa non si applica sul posto: il gioco del repo non si tocca.');
  process.exit(1);
}
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(c.nome + ': ancoraggio trovato ' + n + ' volte (ne serve esattamente 1)'); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
fs.writeFileSync(usc, t);
console.log('toppa applicata: ' + CAMBI.length + ' cambio, ' + ing + ' -> ' + usc);
