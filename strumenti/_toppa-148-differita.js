/* =====================================================================
   _toppa-148-differita.js — UNA SERIE DAL DISCHETTO SI CONFERMA
   (voce #148, compito 2)

   IL BUCO, COME L'AVEVA DICHIARATO IL #147:

     «Un nastro del dischetto non e' ancora giudicabile in differita, e
     non per le testimonianze: gli mancano la riga delle rose (7), dello
     schermo (10) e dell'impronta (11) — Reg.scrivi(7, …) vive dentro
     Sfida.gioca e Dischetto.avvia non ci passa. Seguito piccolo: tre
     righe in avvia.»

   E IL BUCO, COME L'HA TROVATO LA MISURA (strumenti/_sonda-148-
   differita.js, 24 settembre 2026, merge-base 01265bc, serie vera e
   ONESTA giocata FINO IN FONDO fra due telefoni):

     senza niente          INCOMPLETO / rose-assenti      (come dichiarato)
     con le tre righe      NON TORNA · atteso [4,3] · rigiocato [3,2]
                           · 8462 passi

   OTTOMILAQUATTROCENTOSESSANTADUE PASSI SONO NOVANTA SECONDI DI CALCIO.
   `giudica` rigioca il nastro come una partita qualunque e non apre mai
   la serie di rigori: i comandi del duello (tipo 6) non hanno un duello
   in cui cadere, e il punteggio dichiarato e' quello della SERIE mentre
   `G.score` dopo una serie vale 1-0 (la rete che decide, programmaRigore).

   Percio' le tre righe DA SOLE non confermano una serie onesta: la fanno
   ACCUSARE. NON TORNA e' l'unico dei cinque verdetti che muove punti —
   li toglie a DUE persone, alza un sospetto che non decade mai e chiude
   la riga per sempre. Meglio l'astensione di ieri che l'accusa di
   domani: la cura e' piu' grossa di come era stata stimata, e questo
   file lo dichiara invece di nasconderlo.

   LE SEI ANCORE:

   1. `Reg.carta(mentA, mentD, pacA, pacD, iCar)` — LA PORTA UNICA che
      scrive le tre righe nell'ordine di sempre. Non e' codice nuovo: e'
      il blocco che stava dentro `Sfida.gioca`, MOSSO. Due copie della
      stessa cosa divergono, ed e' la lezione che il #134 ha gia' pagato
      costruendo `vagliaNastro` come porta unica.
   2. `Sfida.gioca` chiama la porta. Il nastro di una sfida non cambia di
      un byte — si misura, non si dichiara (_t-148-motorev.js).
   3. `Dischetto.avvia` chiama la stessa porta, con `1, 1`, le due rose
      PER LATO e l'indice di carattere di 'FUORI' (cioe' -1).
   4. La riga 15 porta anche CHI TIRA PER PRIMO, e `serializza`/
      `deserializza` imparano il secondo numero.
   5. `vagliaNastro` mette il fatto nel referto (`out.disco`).
   6. `giudica` apre la serie con lo stesso primo tiratore e confronta i
      RIGORI SEGNATI invece di `G.score`.

   PERCHE' IL PRIMO TIRATORE SI SCRIVE INVECE DI DEDURLO. Il dato esiste
   gia' (`S.primo = (S.seme & 1) ? 'b' : 'a'`) e il giudice il seme ce
   l'ha, quindi una riga sola dentro `giudica` basterebbe. Non si fa, ed
   e' la stessa ragione della porta unica: sarebbe una SECONDA COPIA
   della regola del sorteggio, e il giorno in cui il dischetto la
   cambiasse i nastri vecchi verrebbero rigiocati storti IN SILENZIO. Il
   fatto sta nel nastro — e' la scelta del #133 per lo schermo e del #142
   per il motore.

   MOTORE_V. Un telefono rimasto indietro (e il service worker ignora la
   query string) legge un nastro del dischetto nuovo, trova tutto a
   posto, e poi lo rigioca come una partita qualunque: NON TORNA a un
   onesto. E' parola per parola il caso del #144. Si misura nei due versi
   in strumenti/_t-148-motorev.js e il numero si muove con la prova in
   mano.

   uso:  node strumenti/_toppa-148-differita.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-148-differita.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');

const unaVolta = (s, nome) => {
  const n = t.split(s).length - 1;
  if (n !== 1) { console.error('TOPPA NON APPLICATA: ancora «' + nome + '» trovata ' + n + ' volte (ne serve 1)'); process.exit(1); }
};
const metti = (cerca, nuovo, nome) => { unaVolta(cerca, nome); t = t.replace(cerca, nuovo); };

/* =====================================================================
   1+2. LA PORTA UNICA, E IL BLOCCO CHE CI SI TRASFERISCE DENTRO.

   Il blocco delle tre righe non si RISCRIVE qui: si PRENDE dal file e si
   SPOSTA. Cosi' i commenti del #132, del #133, del #139 e del #142 —
   quattro cantieri di misure, il «perche'» di ognuna delle tre righe —
   arrivano nella porta parola per parola, invece di essere riassunti da
   chi passava. Le due ancore delimitano il blocco e sono uniche tutte e
   due; dentro cambiano tre parole, da `Reg.` a `this.`, perche' il
   blocco diventa il corpo di un metodo di Reg.

   L'INDENTAZIONE TORNA DA SE': il blocco stava nel corpo di `gioca(r){`,
   che e' un metodo a due spazi come `carta(){`, quindi il corpo e' a
   quattro spazi tutti e due.
   ===================================================================== */
const INIZIO = `    /* LE DUE SQUADRE, prima riga del nastro. Da qui in poi questa partita`;
const FINE = `    Reg.motore();\n`;
unaVolta(INIZIO, 'inizio-blocco-tre-righe');
unaVolta(FINE, 'fine-blocco-tre-righe');
const iA = t.indexOf(INIZIO);
const iB = t.indexOf(FINE, iA);
if (iB < 0) { console.error('TOPPA NON APPLICATA: la fine del blocco non viene dopo il suo inizio'); process.exit(1); }
const BLOCCO = t.slice(iA, iB + FINE.length);

/* la riga del tipo 7 cambia sorgente: non piu' le due rose di questa
   sfida, ma i due argomenti della porta */
const RIGA7 = `    Reg.scrivi(7, [mentMia, mentSua].concat(impaccaRosa(SAVE.rosa), impaccaRosa(a.rosa), [iCarSua]));`;
if (BLOCCO.split(RIGA7).length - 1 !== 1) { console.error('TOPPA NON APPLICATA: la riga di tipo 7 non e\' nel blocco'); process.exit(1); }
const CORPO = BLOCCO
  .replace(RIGA7, `    this.scrivi(7, [mentA, mentD].concat(pacA, pacD, [iCar]));`)
  .replace(`    Reg.schermo(innerWidth|0, innerHeight|0);`, `    this.schermo(innerWidth|0, innerHeight|0);`)
  .replace(`    Reg.motore();\n`, `    this.motore();\n`);

const PORTA = `  /* =====================================================================
     LA CARTA D'IDENTITA' DELLA PARTITA, IN UNA PORTA SOLA (voce #148).

     Tre righe, sempre in quest'ordine: le due ROSE (7), lo SCHERMO (10),
     l'IMPRONTA DEL MOTORE JAVASCRIPT (11). Le scrive chiunque apra un
     nastro che qualcun altro dovra' rigiocare — oggi Sfida.gioca e
     Dischetto.avvia — e le scrive DA QUI, non ognuno per conto suo.

     PERCHE' UNA PORTA E NON DUE COPIE. E' la lezione che il #134 ha gia'
     pagato costruendo vagliaNastro come porta unica fra Sfida.guarda e
     giudica: due copie della stessa cosa divergono, e quando divergono
     il nastro dice una cosa e chi lo rigioca ne fa un'altra — cioe' un
     NON TORNA a un onesto, che e' l'unico verdetto che toglie punti.
     MISURATO al contrario: finche' la porta non c'era, Dischetto.avvia
     non scriveva NESSUNA delle tre e il nastro di una serie vera era
     INCOMPLETO/rose-assenti (strumenti/_sonda-148-differita.js).

     L'ORDINE NON E' UN GUSTO. Rose, schermo, impronta e' l'ordine su cui
     poggia ogni nastro gia' scritto: la lettura delle due rose e'
     POSIZIONALE (spaccaRosa torna «fine»), quindi spostare una riga
     slitterebbe gli indici di un nastro di ieri.

     I QUATTRO COMMENTI QUI SOTTO NON SONO NUOVI: sono quelli del #132
     (le rose e l'indice di carattere), del #133 e del #139 (lo schermo),
     del #142 (il motore), scritti dentro Sfida.gioca quando il chiamante
     era uno solo e spostati qui quando sono diventati due.
     ===================================================================== */
  carta(mentA, mentD, pacA, pacD, iCar){
${CORPO}  },

`;

/* il blocco si toglie dal chiamante e ci resta un puntatore */
const RICHIAMO = `    /* LA CARTA D'IDENTITA' DEL NASTRO, DA UNA PORTA SOLA (voce #148): le
       due rose, lo schermo e l'impronta del motore, in quest'ordine. Il
       perche' di ognuna delle tre sta sopra Reg.carta, dove il testo si e'
       spostato il giorno in cui il chiamante ha smesso di essere uno solo:
       Dischetto.avvia chiama la stessa porta con le sue due rose. */
    Reg.carta(mentMia, mentSua, impaccaRosa(SAVE.rosa), impaccaRosa(a.rosa), iCarSua);
`;
t = t.slice(0, iA) + RICHIAMO + t.slice(iB + FINE.length);

/* e la porta si infila in Reg, subito dopo motore(): le tre righe che
   scrive stanno tutte e tre li' intorno */
const A_PORTA = `  /* IL PASSO. Si chiama all'inizio di ogni step(): fa avanzare l'orologio`;
metti(A_PORTA, PORTA + A_PORTA, 'posto-della-porta');

/* =====================================================================
   3. DISCHETTO.AVVIA CHIAMA LA STESSA PORTA
   ===================================================================== */
const A3 = `    SEME.accendi(S.seme >>> 0);
    try{ Reg.accendi(); }catch(e){}
    startMatch(1, SFIDA_DIFF, {`;
const B3 = `    SEME.accendi(S.seme >>> 0);
    try{ Reg.accendi(); }catch(e){}
    /* =====================================================================
       E LA CARTA D'IDENTITA' DEL NASTRO, DALLA PORTA DI Sfida.gioca
       (voce #148).

       Fino a ieri queste tre righe non c'erano, e il nastro di una serie
       vera non si poteva confermare: INCOMPLETO/rose-assenti, misurato
       su una serie onesta giocata fino in fondo fra due telefoni
       (strumenti/_sonda-148-differita.js).

       LE DUE POSTURE SONO 1 E 1 perche' 1 e 1 e' quel che si passa a
       startMatch qui sotto; le due rose sono rA e rB, cioe' quelle
       assegnate PER LATO e non per possesso. E' la ragione per cui la
       riga di tipo 7 scritta dai DUE telefoni e' identica carattere per
       carattere (misurato): il lato 'a' e' la squadra 0 anche sul
       telefono di 'b', come dice il commento qui sopra.

       E L'INDICE DI CARATTERE E' QUELLO DI 'FUORI', cioe' -1: 'FUORI'
       non compare in CARATTERE, quindi caratterePer('FUORI') — quel che
       startMatch fa qui sotto, dove nessun car e' passato — e
       carPerIndice(-1) — quel che fara' il giudice leggendo il nastro —
       danno tutti e due CAR_NEUTRO. Scriverlo invece di ometterlo non e'
       pedanteria: senza l'indice in coda il giudice si astiene con
       carattere-assente.

       PRIMA di startMatch, come in Sfida.gioca, e per lo stesso motivo:
       il registro e' gia' acceso e la partita non e' ancora nata. Il
       conto delle 448 trascendenti dell'impronta non tocca il dado
       seminato (voce #142). */
    try{ Reg.carta(1, 1, rA, rB, indiceCarattere('FUORI')); }catch(e){}
    startMatch(1, SFIDA_DIFF, {`;
metti(A3, B3, 'dischetto-carta');

/* =====================================================================
   4. LA RIGA 15 PORTA ANCHE CHI TIRA PER PRIMO
   ===================================================================== */
const A4 = `    /* LA CARTA D'IDENTITA' DEL NASTRO (voce #147). Si scrive DOPO
       startMatch, che e' il posto in cui il registro nasce, e prima del
       primo tiro. Da questa riga il giudice sa che il nastro deve
       portare le sue testimonianze: senza, chi le togliesse tutte
       renderebbe la serie indistinguibile da una partita qualunque. */
    try{ Reg.scrivi(15, [DISCHETTO_V]); }catch(e){}
    /* chi tira per primo l'ha deciso il seme, non una persona */
    G.kickTeam = (S.primo === 'a') ? 0 : 1;`;
const B4 = `    /* chi tira per primo l'ha deciso il seme, non una persona */
    G.kickTeam = (S.primo === 'a') ? 0 : 1;
    /* LA CARTA D'IDENTITA' DEL NASTRO (voce #147). Si scrive DOPO
       startMatch, che e' il posto in cui il registro nasce, e prima del
       primo tiro. Da questa riga il giudice sa che il nastro deve
       portare le sue testimonianze: senza, chi le togliesse tutte
       renderebbe la serie indistinguibile da una partita qualunque.

       RETTIFICA A EDIZIONI (24 settembre 2026, voce #148). La riga porta
       adesso DUE numeri, e il secondo e' CHI TIRA PER PRIMO. Senza, il
       giudice non sa aprire la serie: la deve aprire con lo stesso primo
       tiratore, se no e' un'altra serie e il verdetto e' NON TORNA a un
       onesto.

       SI SCRIVE INVECE DI FARLO RI-DEDURRE, e il dato sarebbe deducibile
       (S.primo viene dal seme, e il seme il giudice ce l'ha). Sarebbe una
       SECONDA COPIA della regola del sorteggio, e il giorno in cui il
       dischetto la cambiasse i nastri vecchi verrebbero rigiocati storti
       in silenzio. Il fatto sta nel nastro: e' la scelta del #133 per lo
       schermo e del #142 per il motore.

       E PERCIO' QUESTA RIGA STA DOPO G.kickTeam e non prima: scrive quel
       che il gioco HA DECISO, non una seconda deduzione dello stesso
       dato. */
    try{ Reg.scrivi(15, [DISCHETTO_V, G.kickTeam]); }catch(e){}`;
metti(A4, B4, 'quindici-col-primo');

const A4s = `        pezzi.push(dT + ',15,' + dMs + ',' + (r[3]|0));`;
const B4s = `        pezzi.push(dT + ',15,' + dMs + ',' + (r[3]|0) + ',' + (r[4]|0));`;
metti(A4s, B4s, 'serializza-quindici');

const A4d = `      else if(tipo === 15)  this.righe.push([tick, 15, ms, v[3]|0]);`;
const B4d = `      else if(tipo === 15)  this.righe.push([tick, 15, ms, v[3]|0, v[4]|0]);`;
metti(A4d, B4d, 'deserializza-quindici');

/* =====================================================================
   5. IL VAGLIO METTE IL FATTO NEL REFERTO
   ===================================================================== */
const A5a = `  let disco = false;
  const testi = new Map();`;
const B5a = `  /* DAL #148 NON E' PIU' UNA BANDIERA MA IL FATTO INTERO: la versione
     del protocollo e CHI HA TIRATO PER PRIMO, che e' quel che serve a
     giudica per aprire la serie con lo stesso tiratore. */
  let disco = null;
  const testi = new Map();`;
metti(A5a, B5a, 'vaglio-disco-dichiarato');

const A5b = `    else if(r[1] === 15) disco = true;`;
const B5b = `    else if(r[1] === 15 && !disco) disco = { v: r[3]|0, primo: (r[4]|0) ? 1 : 0 };`;
metti(A5b, B5b, 'vaglio-disco-letto');

const A5c = `  /* il marchio di tipo 5 e' il segno dei nastri scritti PRIMA della voce
     #131: quelli il duello non ce l'hanno davvero */
  if(marchio) return no('INCOMPLETO','duello-marchiato');`;
const B5c = `  /* E IL FATTO ESCE NEL REFERTO (voce #148), prima di qualunque rifiuto:
     chi chiama deve poterlo leggere anche quando il vaglio si ferma. */
  out.disco = disco;
  /* il marchio di tipo 5 e' il segno dei nastri scritti PRIMA della voce
     #131: quelli il duello non ce l'hanno davvero */
  if(marchio) return no('INCOMPLETO','duello-marchiato');`;
metti(A5c, B5c, 'vaglio-disco-nel-referto');

const A5d = `                rosaAtt:null, rosaDif:null, carDif:undefined, schermo:null,
                schermi:null, impronta:0 };`;
const B5d = `                rosaAtt:null, rosaDif:null, carDif:undefined, schermo:null,
                schermi:null, impronta:0, disco:null };`;
metti(A5d, B5d, 'vaglio-referto-disco');

/* =====================================================================
   6. IL GIUDICE APRE LA SERIE E CONTA I RIGORI
   ===================================================================== */
const A6a = `  const mentAtt = vag.mentAtt, mentDif = vag.mentDif, carDif = vag.carDif;
  const rosaAtt = vag.rosaAtt, rosaDif = vag.rosaDif;`;
const B6a = `  const mentAtt = vag.mentAtt, mentDif = vag.mentDif, carDif = vag.carDif;
  const rosaAtt = vag.rosaAtt, rosaDif = vag.rosaDif;
  /* LA SERIE DAL DISCHETTO, SE IL NASTRO NE E' UNA (voce #148): null per
     ogni altro nastro, e allora tutto quel che segue e' identico a ieri. */
  const disco = vag.disco;`;
metti(A6a, B6a, 'giudice-legge-disco');

const A6b = `    });
    /* IL CICLO E' QUELLO DI __test.simulate, senza i due cronometri
       dell'effetto scossa: qui non si disegna niente. */`;
const B6b = `    });
    /* =====================================================================
       E SE IL NASTRO E' DI UNA SERIE DAL DISCHETTO, SI APRE LA SERIE
       (voce #148).

       PERCHE' SERVE. Il nastro di una serie non porta nessun atto di
       gioco aperto: porta i COMANDI DEL DUELLO (tipo 6), e senza una
       serie aperta quei comandi non hanno un duello in cui cadere. Un
       giudice che rigiocasse il nastro come una partita qualunque
       macinerebbe novanta secondi di calcio e poi direbbe NON TORNA a
       due persone oneste. MISURATO prima di scrivere questa riga
       (strumenti/_sonda-148-differita.js, serie vera 4-3): NON TORNA,
       rigiocato 3-2, 8462 passi.

       LE DUE RIGHE SONO LE STESSE DI Dischetto.avvia, nello stesso
       ordine: chi ha registrato e chi rigioca devono attraversare la
       stessa porta, se no la serie non e' quella. Il primo tiratore
       viene DAL NASTRO (riga 15) e non da una seconda deduzione del
       seme.

       E QUI, non prima di startMatch: startMatch scrive G.kickTeam da se'
       col dado seminato, e avviaRigori legge quello. Metterle prima
       vorrebbe dire scrivere un numero che startMatch cancella. */
    if(disco){
      G.kickTeam = disco.primo;
      avviaRigori();
    }
    /* IL CICLO E' QUELLO DI __test.simulate, senza i due cronometri
       dell'effetto scossa: qui non si disegna niente. */`;
metti(A6b, B6b, 'giudice-apre-la-serie');

const A6c = `  const gol = [G.score[0]|0, G.score[1]|0];`;
const B6c = `  /* =====================================================================
     IL PUNTEGGIO DI UNA SERIE E' LA SERIE (voce #148).

     Dopo una serie di rigori G.score vale 1-0 o 0-1: e' la rete che
     decide, aggiunta da programmaRigore per chiudere la partita. Il
     punteggio che le due persone hanno visto sul tabellone — e che il
     pannello del #147 mostra, e che una riga di database dichiarerebbe —
     e' invece quello dei RIGORI SEGNATI. Confrontare il primo col
     secondo darebbe NON TORNA a ogni serie onesta.

     Per ogni altro nastro non cambia niente: G.rigori e' null e disco
     anche. ===================================================================== */
  const gol = (disco && G.rigori) ? [G.rigori.seg[0]|0, G.rigori.seg[1]|0]
                                  : [G.score[0]|0, G.score[1]|0];`;
metti(A6c, B6c, 'giudice-conta-i-rigori');

/* -------------------------------------------------- le contro-verifiche */
for (const [k, q] of [
  ['Reg.carta(', 2],                 /* i due chiamanti, e nessun altro */
  ['  carta(mentA, mentD, pacA, pacD, iCar){', 1],
  ['this.scrivi(7, [mentA, mentD]', 1],
  ['Reg.scrivi(7,', 0],              /* la vecchia riga non esiste piu' */
  ['this.schermo(innerWidth|0, innerHeight|0);', 1],
  ['Reg.schermo(innerWidth|0, innerHeight|0);', 0],
  ['Reg.scrivi(15, [DISCHETTO_V, G.kickTeam])', 1],
  ['Reg.scrivi(15, [DISCHETTO_V])', 0],
  ['out.disco = disco;', 1],
  ['avviaRigori();', 4],             /* i tre di prima (golden goal, Dischetto.avvia, __test.rigori) piu' il giudice */
  ['G.rigori.seg[0]|0', 1],
]) {
  const n = t.split(k).length - 1;
  if (n !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare ' + n + ' volte (ne servono ' + q + ')'); process.exit(1); }
}
fs.writeFileSync(usc, t);
console.log('toppa applicata: la serie dal dischetto si giudica in differita, ' + ing + ' -> ' + usc);
