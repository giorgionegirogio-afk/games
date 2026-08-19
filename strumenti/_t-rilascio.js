/* =====================================================================
   _t-rilascio.js — LA TOPPA DEL RILASCIO, cerca/sostituisci.

   NON SCRIVE MAI DENTRO IL GIOCO se non glielo si chiede: legge
   CALCETTO-il-gioco.html (o il file dato con --da), applica le sue
   sostituzioni e scrive la copia altrove (--a). Se anche UN SOLO
   ancoraggio non compare ESATTAMENTE UNA VOLTA si ferma con codice 1,
   dice quale, e non scrive niente. Il file di gioco puo' cambiare sotto
   i piedi, e una toppa applicata a meta' e' peggio di una toppa non
   applicata.

   uso:
     node strumenti/_t-rilascio.js --a fuori/dopo.html
     node strumenti/_t-rilascio.js --da altro.html --a fuori/dopo.html
     node strumenti/_t-rilascio.js --dentro          (scrive nel gioco)
     node strumenti/_t-rilascio.js --elenco          (dice cosa cambia)

   =====================================================================
   IL DIFETTO, MISURATO PRIMA DI TOCCARE UNA RIGA.

   Su cinquanta rilasci della levetta, TRENTAQUATTRO battevano un
   passaggio che nessuno aveva chiesto: il 68%. E quattro touchcancel su
   quattro calciavano allo stesso modo, perche' il gioco registrava
   `touchcancel` sullo stesso gestore di `touchend`:

       cv.addEventListener('touchcancel', e=>{
         for(const t of e.changedTouches) Touch5.end(t.identifier);
       });

   touchcancel non vuol dire «ho finito», vuol dire «il sistema si e'
   preso il tuo dito»: il gesto indietro di Android, una notifica che
   scende, una chiamata in arrivo. Su un telefono vero e' un evento
   frequente, e ogni volta partiva un pallone.

   LA CAUSA E' UNA SOLA, ed e' architetturale: quattro verbi del gioco
   erano appesi all'unico atto che un dito compie anche quando non vuole
   dire niente — staccarsi dal vetro. Touch5.release leggeva la
   velocita' degli ultimi 90 ms e ne ricavava tiro (flick verso la
   porta), scivolata (flick sull'avversario), cross (flick trasversale)
   e, sotto i 650 px/s, passaggio. Il ramo «sotto i 650» non e' un
   gesto: e' la NEGAZIONE di un gesto, cioe' tutto cio' che resta —
   compreso il dito che si alza perche' il pollice era stanco.

   E la deroga scritta dentro release per il telefono lento («UN SOLO
   CAMPIONE NELLA FINESTRA NON E' UN DITO FERMO») e' la prova che il
   problema era gia' noto dall'altro lato: quando il browser fonde i
   touchmove, la stessa misura di velocita' scambia un tiro per un
   passaggio. Una soglia che sbaglia in tutt'e due i versi non e' una
   soglia, e' un dado.

   =====================================================================
   COSA FA QUESTA TOPPA — tre regole separate apposta.

     end     ESEGUE.  Il dito ha finito il gesto: il pulsante grande
                      chiude la carica e tira.
     cancel  ANNULLA. Il sistema si e' preso il dito: non esce niente,
                      e la carica del tiro aperta si chiude SENZA
                      calciare.
     release INERTE.  Staccare la levetta non produce mai un calcio,
                      mai un fallo, mai niente. La funzione resta al suo
                      posto — e torna false — proprio perche' si possa
                      MISURARE che e' inerte invece di crederci.

   E la terza cosa, che e' quella che si sente in mano: A ZERO DITA LO
   STATO E' NEUTRO. Non basta non calciare. Se l'app va in secondo
   piano, o la finestra perde il fuoco, nessun touchend arriva mai: la
   levetta resterebbe attiva con l'ultimo dx,dy addosso e al ritorno il
   giocatore partirebbe da solo. E una carica di tiro orfana non e'
   innocua due volte: il tetto SHOT_HARDCAP la fa partire da sola dopo
   1,25 secondi (un tiro che nessuno ha chiesto) e nel frattempo il
   fattore `slow` tiene il giocatore al 45% della velocita', che e' il
   congelamento. Touch5.azzera() alza tutte le dita come se fossero
   state annullate, ed e' agganciata a blur, a visibilitychange e alla
   pausa.

   IL PASSAGGIO NON SPARISCE, TRASLOCA. E' il punto delicato: oggi il
   passaggio si batte proprio rilasciando la levetta, e toglierlo e
   basta lascerebbe il gioco senza passaggio. Va sul PULSANTE PICCOLO
   COL POSSESSO, che esisteva gia' e che da oggi si chiama PASSAGGIO.
   Quel pulsante chiamava doFiltrante, che pretende un compagno con
   dot>0,5 nella direzione chiesta e altrimenti torna a mani vuote: da
   solo non basta, perche' un pulsante-passaggio che ogni tanto non
   passa e' un pulsante rotto. Quindi eseguiFiltrante, quando nel cono
   non trova nessuno, RIPIEGA su eseguiPassUmano — il passaggio al piu'
   smarcato di sempre. Con la levetta puntata resta la filtrante; senza
   mira e' il passaggio normale; con lo scatto tenuto dalla meta' campo
   offensiva resta il cross. Nessun verbo perso.

   DOVE SONO FINITI I QUATTRO VERBI DEL FLICK:
     tiro       -> pulsante grande col possesso (TIRA), con la carica a
                   finestra dolce, che era gia' la via principale;
     scivolata  -> pulsante grande senza possesso (CONTRASTA);
     cross      -> pulsante piccolo con lo scatto tenuto, dalla meta'
                   campo offensiva (invariato);
     passaggio  -> pulsante piccolo col possesso (PASSAGGIO).

   E DI CONSEGUENZA SI TOGLIE ANCHE L'ANELLO DEL FLICK, il settore ambra
   con la lancetta che girava attorno al portatore per dire quando
   lasciare il dito. Era la mira di un gesto che non esiste piu': un
   comando disegnato che non risponde e' peggio di un comando assente.
   (Non compare nelle fotografie di scatta.js: lo disegna solo con
   Touch5.used acceso, cioe' dopo un tocco vero, e le foto sono partite
   CPU contro CPU. Quindi istantanea.js non se ne accorge.)

   E LE PAROLE SEGUONO I FATTI. La scheda dei gesti diceva «Passaggio —
   rilascia il dito», il tutorial diceva «Rilascia il dito senza flick:
   passaggio», la riga della pausa diceva «FILTRANTE/CAMBIO». Lasciare
   quei testi mentre si cambia il comando sarebbe la versione a parole
   dell'attrezzo che attesta invece di misurare: il gioco insegnerebbe
   un gesto che ha appena smesso di ascoltare. Cambiano tutti.

   COSA QUESTA TOPPA NON FA, dichiarato: non tocca il DUELLO dal
   dischetto, perche' li' la distinzione c'era gia' ed e' giusta —
   `pointerup` tira, `pointercancel` azzera mira e dito senza tirare
   (righe 12302-12303 del gioco). E non tocca la tastiera: C passa, X
   tira, E filtrante, Z scivola, come prima.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const DENTRO = process.argv.includes('--dentro');
const DA = path.resolve(arg('da', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const A = DENTRO ? DA : arg('a', '');

/* =====================================================================
   LE SOSTITUZIONI. Due specie:
     esatta     — testo vecchio -> testo nuovo, deve comparire 1 volta
     intervallo — dall'ancora APRE all'ancora CHIUDE (comprese), con
                  un'IMPRONTA che deve stare dentro il pezzo trovato:
                  cosi' non si sostituisce un blocco che qualcun altro
                  ha gia' cambiato, e non si applica due volte.
   ===================================================================== */
const EDIT = [];
const esatta = (nome, vecchio, nuovo) => EDIT.push({ nome, tipo: 'esatta', vecchio, nuovo });
const intervallo = (nome, apre, chiude, impronta, nuovo, min, max) =>
  EDIT.push({ nome, tipo: 'intervallo', apre, chiude, impronta, nuovo, min, max });

/* ------------------------------------------------------------------ 1
   IL PULSANTE PICCOLO COL POSSESSO SI CHIAMA PASSAGGIO.
   L'atto resta 'through' — la filtrante e' un passaggio mirato, non un
   verbo diverso — ma l'etichetta dice quello che il dito fara' SEMPRE,
   e da oggi quel dito passa la palla anche quando nel cono non c'e'
   nessuno. Nove lettere come FILTRANTE: il corpo del carattere si
   misura da solo sul disco (vedi drawTouchButtons) e non cambia
   gradino. */
esatta('etichetta del pulsante piccolo',
  `    poss ? { act:'through', label:'FILTRANTE', x:bx+s*158, y:VH-72, r:30 }`,
  `    poss ? { act:'through', label:'PASSAGGIO', x:bx+s*158, y:VH-72, r:30 }`);

/* ------------------------------------------------------------------ 2
   IL CUORE: end / cancel / azzera / release inerte. */
intervallo('Touch5.end + Touch5.release',
  `  end(id){\n    const bt=this.btnTouch[id];\n`,
  `    /* rilascio semplice = passaggio */\n    if(carrying) doPass(t);\n  }\n};`,
  `if(fspeed>650){`,
  `  /* =====================================================================
     ALZARE UN DITO NON E' UN COMANDO — e la misura che lo impone.
     Banco strumenti/_p-rilascio.js, 200 prove per braccio, seme 20260818,
     corsa del 19 agosto 2026: su duecento rilasci della levetta
     CENTONOVANTANOVE battevano un passaggio che nessuno aveva chiesto, e
     su duecento annullamenti di sistema CENTONOVANTASETTE calciavano allo
     stesso modo, perche' touchcancel era registrato sullo stesso gestore
     di touchend. Il braccio di controllo — duecento gesti identici in cui
     il dito NON si alza — da' zero calci: e' quello che rende la misura
     una misura invece di un conteggio.
     (Una corsa precedente dello stesso banco dava 199 e 199, e una misura
     piu' vecchia e piu' piccola diceva 34 su 50 e 4 su 4. La differenza
     fra 199 e 197 e' dispersione fra corse, non un disaccordo; il 34 su 50
     invece e' stato superato, e in questa casa un numero superato da una
     misura migliore non si spedisce.)
     Da qui in poi i tre atti sono tre funzioni diverse, e la differenza
     e' il punto:
       end     ESEGUE   — il dito ha finito il gesto;
       cancel  ANNULLA  — il sistema si e' preso il dito;
       release INERTE   — staccare la levetta non produce mai niente.
     ===================================================================== */
  end(id){ this.chiudi(id,false); },
  cancel(id){ this.chiudi(id,true); },
  chiudi(id,annulla){
    const bt=this.btnTouch[id];
    if(bt){
      delete this.btnTouch[id];
      /* il pulsante grande e' l'UNICO comando che vive sul rilascio, ed
         e' giusto che ci viva: la carica del tiro e' un gesto che il
         dito tiene aperto apposta. Ma se il dito gliel'hanno tolto, la
         carica si chiude senza calciare. */
      if(bt.act==='shot'){
        if(annulla) this.annullaCarica(bt.t);
        else if(!G.paused) releaseCharge(bt.t);
      }
      return;
    }
    for(let t=0;t<2;t++){
      const s=this.stick[t];
      if(s.active && s.id===id){
        s.active=false; s.id=-1;
        this.release(t,s);
        s.dx=0; s.dy=0; s.hist=[];
      }
    }
  },
  /* chiude la carica del tiro tenuta aperta dal dito SENZA calciare.
     Serve perche' una carica orfana non e' innocua: il tetto
     SHOT_HARDCAP la fa partire da sola dopo 1,25 s — un tiro che
     nessuno ha chiesto — e nel frattempo il fattore "slow" di
     updatePlayer tiene il giocatore al 45% della velocita', cioe' il
     congelamento. Gli anticipi che maturano da soli (chargeGo) non si
     toccano: quelli il dito li ha gia' chiesti e sono in volo. */
  annullaCarica(t){
    const p=ctrlPlayer(t);
    if(p && p.charge>=0 && !p.chargeGo && p.chargeKind==='tiro') chiudiAnticipo(p);
  },
  /* ZERO DITA, STATO NEUTRO. Quando lo schermo smette di parlare — app
     in secondo piano, finestra senza fuoco, pausa — nessun touchend
     arriva: la levetta resterebbe attiva con l'ultimo dx,dy addosso e
     al ritorno il giocatore PARTIREBBE DA SOLO nella direzione di
     prima. Qui si alzano tutte le dita come se fossero state annullate:
     niente calci, niente cariche orfane, niente levetta fantasma. */
  azzera(){
    for(const k in this.btnTouch){
      const bt=this.btnTouch[k];
      delete this.btnTouch[k];
      if(bt.act==='shot') this.annullaCarica(bt.t);
    }
    for(let t=0;t<2;t++){
      const s=this.stick[t];
      s.active=false; s.id=-1; s.dx=0; s.dy=0; s.hist=[];
    }
  },
  /* IL RILASCIO DELLA LEVETTA E' INERTE, E LA FUNZIONE RESTA QUI PERCHE'
     SI POSSA MISURARE CHE LO E'.
     Prima da qui uscivano quattro gesti: flick verso la porta = tiro,
     flick sull'avversario = scivolata, flick trasversale = cross,
     rilascio sotto i 650 px/s = passaggio. Tutti e quattro nascevano
     dallo stesso evento — il dito che si stacca — cioe' dall'unica cosa
     che un dito fa anche quando non vuole dire niente, e che il sistema
     operativo fa AL POSTO SUO quando arriva una notifica. L'ultimo ramo
     poi non era nemmeno un gesto: era la negazione di un gesto, tutto
     cio' che restava sotto la soglia.
     I quattro verbi non sono spariti: TIRA e CONTRASTA stanno sul
     pulsante grande, PASSAGGIO (e la filtrante, che e' la sua forma
     mirata) sul piccolo, il cross e' il piccolo con lo scatto tenuto
     dalla meta' campo offensiva. Nessun verbo perso, un incidente in
     meno.
     Torna sempre false: chi la chiama sa che non ha fatto niente. */
  release(t,s){ return false; }
};`, 3000, 5200);

/* ------------------------------------------------------------------ 3
   TOUCHCANCEL NON E' TOUCHEND, e le dita si alzano quando lo schermo
   smette di parlare. */
esatta('gestore touchcancel',
  `cv.addEventListener('touchcancel', e=>{\n  for(const t of e.changedTouches) Touch5.end(t.identifier);\n});`,
  `/* TOUCHCANCEL NON E' TOUCHEND. Il primo dice «il sistema si e' preso il
   tuo dito»: il gesto indietro di Android, una notifica che scende, una
   chiamata. Il secondo dice «ho finito». Trattarli uguale voleva dire
   calciare quattro volte su quattro a ogni interruzione. */
cv.addEventListener('touchcancel', e=>{
  for(const t of e.changedTouches) Touch5.cancel(t.identifier);
});
/* e quando lo schermo smette di parlare del tutto — scheda nascosta,
   finestra senza fuoco — le dita si alzano tutte, neutre. Nessun
   touchend arriverebbe mai, e la levetta resterebbe premuta per sempre:
   al ritorno il giocatore ripartirebbe da solo. */
addEventListener('blur', ()=>Touch5.azzera());
document.addEventListener('visibilitychange', ()=>{ if(document.hidden) Touch5.azzera(); });`);

/* ------------------------------------------------------------------ 4
   IL PULSANTE PICCOLO NON MANCA MAI IL PASSAGGIO. */
esatta('ripiego della filtrante sul passaggio',
  `  if(!best) return;\n  p.chargeClip='filtrante';               // la clip del gesto per kickBall`,
  `  /* NESSUNO NELLA DIREZIONE CHIESTA: SI RIPIEGA SUL PASSAGGIO NORMALE.
     Da quando il rilascio della levetta e' inerte questo pulsante e'
     l'UNICO modo di passare la palla col dito: se tornasse a mani vuote
     perche' nel cono non c'era nessuno, il gioco resterebbe senza
     passaggio — che e' esattamente il modo in cui una riparazione
     diventa un danno. Con la mira c'e' la filtrante, senza mira c'e' il
     passaggio al piu' smarcato: il dito ottiene sempre un pallone
     giocato. */
  if(!best){ eseguiPassUmano(p); return; }
  p.chargeClip='filtrante';               // la clip del gesto per kickBall`);

esatta('il tutorial conta anche la filtrante come passaggio',
  `    G.stats.filtranti[t]=(G.stats.filtranti[t]||0)+1;\n    Audio5.kick(0.5);`,
  `    G.stats.filtranti[t]=(G.stats.filtranti[t]||0)+1;
    Audio5.kick(0.5);
    /* il tutorial insegna «passa» e adesso lo si impara da questo
       pulsante: la filtrante E' un passaggio, e per questa via il suo
       passo non si e' mai chiuso */
    if(t===0 && !G.cpu[0]) Tut.notify('pass');`);

/* ------------------------------------------------------------------ 5
   LA PAUSA ALZA LE DITA (e dice il nome giusto del pulsante). */
esatta('la pausa azzera le dita',
  `  if(v && !inMatch) return;\n  G.paused=v;`,
  `  if(v && !inMatch) return;
  G.paused=v;
  /* in pausa si alzano le dita: se no si riprende con la levetta ancora
     premuta dov'era e il giocatore riparte da solo */
  if(v) Touch5.azzera();`);

esatta('riga dei comandi nella pausa',
  `        ? 'Stick a sinistra · TIRA/CONTRASTA e FILTRANTE/CAMBIO cambiano col possesso'`,
  `        ? 'Stick a sinistra · TIRA/CONTRASTA e PASSAGGIO/CAMBIO cambiano col possesso'`);

/* ------------------------------------------------------------------ 6
   IL TUTORIAL INSEGNA I COMANDI CHE ESISTONO. */
esatta('tutorial: il passo del passaggio',
  `tc:'<b>Rilascia il dito</b> senza flick: passaggio' },`,
  `tc:'Premi <b>PASSAGGIO</b>: palla al compagno pi&ugrave; smarcato' },`);

esatta('tutorial: il passo del tiro',
  String.raw`tc:'Tieni <b>TIRA</b> e lascia sull\'ambra &mdash; o flicka verso la porta' },`,
  String.raw`tc:'Tieni <b>TIRA</b> e lascia sull\'ambra' },`);

esatta('tutorial: il passo della scivolata',
  `tc:'Senza palla: <b>CONTRASTA</b>, o flick sul portatore' },`,
  `tc:'Senza palla: premi <b>CONTRASTA</b>' },`);

/* ------------------------------------------------------------------ 7
   LA SCHEDA DEI GESTI. */
esatta('scheda: Passaggio',
  `            <b class="gn">Passaggio</b><span class="gt">rilascia il dito<span class="soloKb"> &middot; <kbd>C</kbd></span> &mdash; palla al pi&ugrave; smarcato</span></div>`,
  `            <b class="gn">Passaggio</b><span class="gt">pulsante piccolo<span class="soloKb"> &middot; <kbd>C</kbd></span> &mdash; palla al pi&ugrave; smarcato</span></div>`);

esatta('scheda: Tiro col timing',
  `            <b class="gn">Tiro col timing</b><span class="gt">tieni e rilascia sull'anello che pulsa &middot; flick verso la porta<span class="soloKb"> &middot; <kbd>X</kbd></span></span></div>`,
  `            <b class="gn">Tiro col timing</b><span class="gt">tieni <b>TIRA</b> e rilascia sull'anello che pulsa<span class="soloKb"> &middot; <kbd>X</kbd></span></span></div>`);

esatta('scheda: Scivolata',
  `            <b class="gn">Scivolata</b><span class="gt">flick sull'avversario<span class="soloKb"> &middot; <kbd>Z</kbd></span> &mdash; di fronte &egrave; rubata, da dietro &egrave; fallo</span></div>`,
  `            <b class="gn">Scivolata</b><span class="gt">pulsante grande senza palla (<b>CONTRASTA</b>)<span class="soloKb"> &middot; <kbd>Z</kbd></span> &mdash; di fronte &egrave; rubata, da dietro &egrave; fallo</span></div>`);

esatta('scheda: Filtrante',
  `            <b class="gn">Filtrante</b><span class="gt">pulsante piccolo<span class="soloKb"> &middot; <kbd>E</kbd></span> &mdash; tesa sulla corsa dello smarcato, mira con la levetta</span></div>`,
  `            <b class="gn">Filtrante</b><span class="gt">pulsante piccolo con la levetta puntata<span class="soloKb"> &middot; <kbd>E</kbd></span> &mdash; tesa sulla corsa dello smarcato</span></div>`);

esatta('scheda: Cross',
  `            <b class="gn">Cross</b><span class="gt">flick trasversale dalla met&agrave; campo offensiva &mdash; palla alta sul secondo palo</span></div>`,
  `            <b class="gn">Cross</b><span class="gt">pulsante piccolo con lo <b>scatto</b> tenuto, dalla met&agrave; campo offensiva &mdash; palla alta sul secondo palo</span></div>`);

esatta('scheda: la riga del telefono',
  `        <p>Su telefono trascini per correre (stick virtuale). <b>Stick a sinistra; a destra TIRA/CONTRASTA e FILTRANTE/CAMBIO cambiano col possesso</b>, coi flick sempre attivi. In 2 giocatori lo schermo &egrave; diviso a met&agrave;.</p>`,
  `        <p>Su telefono trascini per correre (stick virtuale). <b>Stick a sinistra; a destra TIRA/CONTRASTA e PASSAGGIO/CAMBIO cambiano col possesso</b>. Alzare il dito dalla levetta non fa mai partire niente: i gesti si battono coi due pulsanti. In 2 giocatori lo schermo &egrave; diviso a met&agrave;.</p>`);

/* ------------------------------------------------------------------ 8
   VIA L'ANELLO DEL FLICK: era la mira di un gesto che non esiste piu'. */
intervallo('anello del flick attorno al portatore',
  `  /* ANELLO DEL TIRO TOUCH del portatore controllato`,
  `    ctx.stroke();\n    if(inWin){\n      const pl=1+Math.sin(G.pulse*28)*0.08;\n      ctx.strokeStyle='rgba(255,176,32,.8)'; ctx.lineWidth=1.5;\n      ctx.beginPath(); ctx.arc(p.x,p.y,R*pl+4,0,6.2832); ctx.stroke();\n    }\n  }\n`,
  `const inWin=phase>FLICK_WIN0&&phase<FLICK_WIN1;`,
  `  /* L'ANELLO DEL FLICK NON C'E' PIU', e non e' una potatura estetica.
     Era un settore ambra con una lancetta che girava attorno al
     portatore per dire QUANDO staccare il dito dalla levetta: la mira
     del tiro-col-flick. Da quando il rilascio e' inerte quel gesto non
     esiste, e un comando disegnato che non risponde e' peggio di un
     comando assente — insegna un'abitudine che il gioco poi punisce.
     La mira del tiro resta dov'era e dove funziona: l'anello di carica
     del pulsante grande, qui sopra, che si accende sotto il dito che
     tiene premuto e si spegne quando lo lascia.
     (Non compariva nelle fotografie di scatta.js: lo disegnava solo con
     Touch5.used acceso, cioe' dopo un tocco vero, e le foto sono
     partite CPU contro CPU.) */
`, 800, 1800);

/* ===================================================================== */
if (process.argv.includes('--elenco')) {
  console.log('_t-rilascio.js — ' + EDIT.length + ' sostituzioni:');
  EDIT.forEach((e, i) => console.log('  ' + String(i + 1).padStart(2) + '. [' + e.tipo + '] ' + e.nome));
  process.exit(0);
}
if (!A) { console.error('FALLITO: manca --a <destinazione> (o --dentro).'); process.exit(1); }
if (!fs.existsSync(DA)) { console.error('FALLITO: sorgente inesistente: ' + DA); process.exit(1); }

let src = fs.readFileSync(DA, 'utf8');
const L0 = src.length;
const fermati = (nome, perche) => {
  console.error('FALLITO su «' + nome + '»: ' + perche);
  console.error('Non ho scritto niente. Il gioco puo\' essere cambiato sotto i piedi:');
  console.error('rileggere l\'ancoraggio nel sorgente e rifare la toppa, non forzarla.');
  process.exit(1);
};

const fatte = [];
for (const e of EDIT) {
  if (e.tipo === 'esatta') {
    const n = src.split(e.vecchio).length - 1;
    if (n !== 1) fermati(e.nome, 'l\'ancoraggio compare ' + n + ' volte, non 1.\n  ancora: ' + e.vecchio.split('\n')[0].slice(0, 110));
    src = src.replace(e.vecchio, () => e.nuovo);
    fatte.push([e.nome, e.nuovo.length - e.vecchio.length]);
    continue;
  }
  /* intervallo */
  const nA = src.split(e.apre).length - 1;
  if (nA !== 1) fermati(e.nome, 'l\'ancora d\'APERTURA compare ' + nA + ' volte, non 1.\n  ancora: ' + e.apre.split('\n')[0].slice(0, 110));
  const i0 = src.indexOf(e.apre);
  const nC = src.split(e.chiude).length - 1;
  if (nC !== 1) fermati(e.nome, 'l\'ancora di CHIUSURA compare ' + nC + ' volte, non 1.\n  ancora: ' + e.chiude.split('\n')[0].slice(0, 110));
  const iC = src.indexOf(e.chiude, i0);
  if (iC < 0) fermati(e.nome, 'l\'ancora di chiusura non segue quella d\'apertura.');
  const i1 = iC + e.chiude.length;
  const vecchio = src.slice(i0, i1);
  /* CONTROLLO DI IDENTITA': il pezzo che sto sostituendo deve essere
     QUELLO misurato. L'impronta e' una riga che esiste solo nella
     versione vecchia, cosi' su un file gia' toppato ci si ferma invece
     di applicare due volte. */
  if (vecchio.split(e.impronta).length - 1 !== 1)
    fermati(e.nome, 'nel pezzo trovato manca l\'impronta (o c\'e\' piu\' volte):\n  ' + e.impronta +
      '\n  o e\' gia\' toppato, o l\'ha cambiato qualcun altro.');
  if (vecchio.length < e.min || vecchio.length > e.max)
    fermati(e.nome, 'il pezzo trovato e\' lungo ' + vecchio.length + ' byte, fuori dall\'intervallo atteso ' + e.min + '-' + e.max + '.');
  src = src.slice(0, i0) + e.nuovo + src.slice(i1);
  fatte.push([e.nome, e.nuovo.length - vecchio.length]);
}

/* ULTIMO CONTROLLO, e non e' pignoleria: dopo la toppa nel gioco non
   deve restare NESSUNA via che trasformi un rilascio in un'azione. Se
   una di queste stringhe sopravvive, la toppa ha applicato ma non ha
   riparato — ed e' esattamente il caso in cui uno strumento verde
   mente. */
const RESIDUI = [
  ['il ramo del passaggio sul rilascio', `if(carrying) doPass(t);`],
  ['touchcancel appeso a Touch5.end', `'touchcancel', e=>{\n  for(const t of e.changedTouches) Touch5.end`],
  ['la soglia del flick', `if(fspeed>650){`],
];
for (const [nome, s] of RESIDUI) {
  if (src.includes(s)) fermati('controllo finale: ' + nome, 'la stringa e\' ancora nel file dopo la toppa.');
}
if (!src.includes('cancel(id){ this.chiudi(id,true); }')) fermati('controllo finale', 'Touch5.cancel non risulta scritto.');
if (!src.includes('release(t,s){ return false; }')) fermati('controllo finale', 'Touch5.release non risulta inerte.');

const dest = path.resolve(A);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, src);
console.log('toppa del rilascio applicata — ' + fatte.length + ' sostituzioni, tutte con ancoraggio unico:');
for (const [nome, d] of fatte) console.log('  ' + (d >= 0 ? '+' : '') + String(d).padStart(6) + ' byte   ' + nome);
console.log('  da:   ' + DA);
console.log('  a:    ' + dest);
console.log('  delta di file: ' + (src.length - L0) + ' byte (' + L0 + ' -> ' + src.length + ')');
