/* =====================================================================
   _toppa-149-giudice.js — LA CURA DEL CRITICO DELLA REVISIONE D'INSIEME
   (voce #149, compito 2)

   Applica al gioco le quattro riparazioni del giudice differito. Ogni
   ancoraggio si pretende UNA VOLTA SOLA: un ancoraggio trovato zero o due
   volte ferma la toppa invece di lasciarla scrivere nel posto sbagliato.

   CHE COSA CURA, in una riga per pezzo:

     1  la guardia delle testimonianze e' a SENSO UNICO: pretende «la 15
        vuole le 14» e mai «le 14 vogliono la 15». Tolta la sola 15 il
        giudice rigioca novanta secondi di calcio e accusa due onesti.
     2  DISCHETTO_V e' scritto nel nastro e MAI LETTO in differita: un
        nastro di un protocollo ignoto prende TORNA.
     3  il bit «chi ha tirato per primo» capovolto fa aprire un'ALTRA
        serie, e il verdetto e' un'accusa.
     4  il residuo (15 e 14 tolte) si vede lo stesso, e senza nessuna
        firma: quel nastro porta comandi di duello e NESSUN ATTO DI
        GIOCO, cioe' non e' il nastro di una partita giocata.

   uso:  node strumenti/_toppa-149-giudice.js [file.html]
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const FILE = process.argv[2] ? path.resolve(RADICE, process.argv[2])
                             : path.join(RADICE, 'CALCETTO-il-gioco.html');
if (!fs.existsSync(FILE)) { console.error('TOPPA NON APPLICATA: ' + FILE + ' non esiste'); process.exit(1); }
let t = fs.readFileSync(FILE, 'utf8');

const COPPIE = [];

/* ------------------------------------------------------------------ 1+2
   LE DUE GUARDIE DEL VAGLIO, nei due versi e sulla versione. */
COPPIE.push([
`    if(!buone) return no('INCOMPLETO','testimonianze-assenti');
  }
  if(!(dati && dati.length > 6)) return no('INCOMPLETO','rose-assenti');`,
`    if(!buone) return no('INCOMPLETO','testimonianze-assenti');
  }
  /* =====================================================================
     E IL RICONOSCIMENTO NEI DUE VERSI, DAVVERO (voce #149).

     LA RIGA SOPRA ERA A SENSO UNICO. Diceva «la 15 vuole le 14» e non
     diceva mai «le 14 vogliono la 15»: tolta la sola riga 15, disco resta
     null, giudica non apre la serie, rigioca novanta secondi di calcio e
     confronta G.score (che dopo una serie vale 1-0) col punteggio dei
     rigori. MISURATO dalla revisione d'insieme dell'onda E su una serie
     onesta 2-1: NON TORNA, rigiocato [1,3] in 7839 passi. Rimisurato dal
     banco di questo cantiere su un'altra serie onesta 2-1: NON TORNA,
     rigiocato [0,1] in 5984 passi.

     LO STANDARD E' GIA' SCRITTO DUE VOLTE IN QUESTA CASA: schermo-ignoto
     (#133) e motore-js-ignoto (#142) dicono che un nastro senza la riga
     che serve NON SI PUO' SAPERE, e che procedere alla cieca produce
     accuse false in una sola direzione. Per la riga 15 si procedeva alla
     cieca. Adesso no.

     E LA VERSIONE DEL PROTOCOLLO SI LEGGE (voce #149). DISCHETTO_V
     esisteva, si scriveva nel nastro e si controllava SOLO DAL VIVO
     (chiudiAppuntamento): in differita nessuno la guardava, e un nastro
     che dichiara un dischetto che non conosciamo prendeva TORNA
     (misurato: riga 15 con v = 2, verdetto TORNA). E' la stessa cosa che
     il #107 dice del motore e il #142 della sua impronta — con la
     differenza che qui il motore e' lo stesso, quindi il verdetto giusto
     non e' ALTRO MOTORE ma un'astensione.

     TUTTE E DUE SI ASTENGONO, NON ACCUSANO: INCOMPLETO non muove punti e
     la riga torna giudicabile il giorno in cui arriva intera.
     ===================================================================== */
  if(testi.size && !disco) return no('INCOMPLETO','dischetto-assente');
  if(disco && disco.v !== DISCHETTO_V) return no('INCOMPLETO','dischetto-versione');
  /* =====================================================================
     E IL RESIDUO, CHE IL #147 DICHIARAVA INCHIUDIBILE SENZA UNA FIRMA
     (voce #149).

     IL CASO. Chi toglie la riga 15 E tutte le 14 ottiene un nastro che
     non dichiara piu' di essere una serie: disco e' null, testi e' vuota,
     le due guardie qui sopra non hanno niente da vedere. Il #147 concluse
     «indistinguibile da una partita normale», e chiuderlo «vorrebbe dire
     FIRMARE la 15, una firma vuole una chiave, e in questo gioco non c'e'
     nessuna chiave per statuto». MISURATO il prezzo di quella
     conclusione: NON TORNA a due persone oneste, rigiocato [1,3] in 7839
     passi dalla revisione d'insieme, [0,1] in 5984 e [1,3] in 7675 dal
     banco di questo cantiere.

     E NON SERVIVA NESSUNA FIRMA: bastava guardare di che cosa e' fatto il
     nastro. Un nastro di una serie dal dischetto porta COMANDI DI DUELLO
     (tipo 6) e NESSUN ATTO DI GIOCO. Gli atti sono SEI tipi e si contano
     tutti, non i piu' comodi: 12 e 13 (il dito che si posa e che si
     muove, voce #144), 0 e 1 (i pixel dei nastri di prima del #144), 2
     (il dito che si stacca) e 4 (IL TASTO — e questo e' il tipo che la
     prima stesura di questa riga aveva dimenticato: chi gioca una sfida
     da tastiera non scrive nessun 12 e nessun 13, e un suo nastro onesto
     sarebbe finito in astensione). Chi ha registrato un nastro senza
     nessuno di quei sei non ha mai toccato il campo: ha solo scelto dove
     tirare. Un nastro cosi' NON E' il nastro di una partita giocata, e
     rigiocarlo come novanta secondi di calcio vuol dire rigiocare
     un'altra cosa e poi confrontarne il punteggio.

     IL BORDO, DICHIARATO: un tasto premuto per sbaglio DURANTE una serie
     scrive un tipo 4, e quel nastro — se anche gli togliessero la 15 e
     le 14 — tornerebbe a rigiocarsi come una partita. E' il residuo del
     residuo, vale su un telefono zero (non c'e' tastiera) e si preferisce
     a un'astensione su ogni sfida giocata da tastiera.

     SOLO SE IL NASTRO NON DICHIARA LA SERIE (disco e' null): una serie che si
     dichiara si apre con avviaRigori e questa riga non la riguarda.

     PERCHE' NON SI GUARDANO INVECE I COMANDI RIMASTI IN CANNA. E' la
     prima forma che questa cura ha avuto, e si e' rotta due volte. Larga
     («se ne avanza anche uno solo») prendeva un caso che non le spettava:
     il nastro di una sfida vera giudicato col SEME SBAGLIATO, che il #133
     ha deciso di trattare come NON TORNA e che _q-staffetta B1 sorveglia
     (4 comandi avanzati su 6, misurato). Stretta («nemmeno uno letto»)
     NON E' DETERMINISTICA: novanta secondi di calcio a volte aprono un
     calcio piazzato e consumano un comando, e allora la guardia non
     scatta — misurato su una serie su cinque, ed e' esattamente il genere
     di cancello che cambia colore da solo. QUESTA si legge nel NASTRO,
     prima di rigiocare: stesso nastro, stesso verdetto, sempre.

     E SI ASTIENE, NON ACCUSA: INCOMPLETO non muove un punto.
     ===================================================================== */
  if(!disco){
    let duelli = 0, atti = 0;
    for(const r of Reg.righe){
      const tp = r[1];
      if(tp === 6) duelli++;
      else if(tp === 0 || tp === 1 || tp === 2 || tp === 4 || tp === 12 || tp === 13) atti++;
    }
    if(duelli > 0 && atti === 0) return no('INCOMPLETO','duelli-senza-atti');
  }
  if(!(dati && dati.length > 6)) return no('INCOMPLETO','rose-assenti');`]);

/* -------------------------------------------------------------------- 3
   LA PORTA SOLA DEL PRIMO TIRATORE, e il riscontro che si astiene. */
COPPIE.push([
`/* il seme a due mani: quando scegli il tuo nonce non conosci quello
   dell'altro, quindi nessuno dei due puo' cercarsi una partita comoda */
function dsMescola(na, nb){
  return (parseInt(dsSha256('D1|' + na + '|' + nb).slice(0,8), 16) >>> 0) || 1;
}`,
`/* il seme a due mani: quando scegli il tuo nonce non conosci quello
   dell'altro, quindi nessuno dei due puo' cercarsi una partita comoda */
function dsMescola(na, nb){
  return (parseInt(dsSha256('D1|' + na + '|' + nb).slice(0,8), 16) >>> 0) || 1;
}

/* =====================================================================
   CHI TIRA PER PRIMO, IN UN POSTO SOLO (voce #149).

   E' LA REGOLA DEL SORTEGGIO, e prima di oggi stava scritta in una riga
   sola dentro chiudiAppuntamento. Il #148 rifiuto' — con ragione — di
   COPIARLA dentro giudica: «sarebbe una SECONDA COPIA della regola del
   sorteggio, e il giorno in cui il dischetto la cambiasse i nastri vecchi
   verrebbero rigiocati storti in silenzio». Il prezzo accettato pero'
   era un'ACCUSA: col bit della riga 15 capovolto il giudice apriva
   un'altra serie e diceva NON TORNA (misurato dalla revisione d'insieme:
   rigiocato [1,2] in 646 passi; rimisurato qui: lo stesso).

   LA FORMA CHE ASTIENE SENZA DUPLICARE E' UNA PORTA SOLA, ed e' il modo
   di casa: vagliaNastro, improntaDelNastro, schermiDelNastro, Reg.carta.
   La regola vive QUI e la chiamano tutti e due i capi — chi gioca
   (chiudiAppuntamento) e chi giudica. Il giorno in cui cambiasse,
   cambierebbe per tutti e due nello stesso istante, che e' esattamente
   quel che il #148 voleva proteggere.

   E IL GIUDICE NON LA USA PER DECIDERE CHI TIRA: continua a leggere la
   riga 15, come il #148 ha stabilito. La usa per un RISCONTRO, e quando
   i due non combaciano NON SI SA QUALE DEI DUE MENTA — il nastro o il
   seme che il server ha assegnato. Percio' si astiene.

   IL TIPO DI RITORNO E' LA SQUADRA (0 o 1), che e' quel che la riga 15
   porta e quel che G.kickTeam vuole; le due lettere 'a'/'b' restano
   affar suo di chi gioca. */
function dsPrimoDalSeme(seme){
  return ((seme >>> 0) & 1) ? 1 : 0;
}`]);

COPPIE.push([
`    S.seme = dsMescola(na, nb);
    S.primo = (S.seme & 1) ? 'b' : 'a';`,
`    S.seme = dsMescola(na, nb);
    /* LA REGOLA STA IN dsPrimoDalSeme, E QUI SI CHIAMA (voce #149): una
       porta sola per chi gioca e per chi giudica. */
    S.primo = dsPrimoDalSeme(S.seme) ? 'b' : 'a';`]);

COPPIE.push([
`  const disco = vag.disco;
  /* ------------------------------------------------ si rigioca */`,
`  const disco = vag.disco;
  /* =====================================================================
     IL RISCONTRO DEL PRIMO TIRATORE (voce #149), prima di rigiocare.

     Il nastro dice chi ha tirato per primo (riga 15, secondo numero) e il
     seme lo sa anche lui: sono due testimoni dello stesso fatto. Quando
     si contraddicono non c'e' modo di sapere quale dei due mente — un
     nastro manomesso o un seme sbagliato dal server — e un giudice che
     scegliesse aprirebbe una serie inventata. Si astiene.

     PRIMA DI RIGIOCARE, e non dopo: rigiocare una serie che si sa gia'
     sbagliata costerebbe seicento passi per buttarli.

     E Reg.spegni() COME OGNI ALTRA USCITA: da qui in poi il registro e'
     in mano al giudice, e una pagina lasciata in rilettura ignorerebbe
     le dita vere. */
  if(disco && disco.primo !== dsPrimoDalSeme(semeDaTesto(opz.seme))){
    Reg.spegni();
    return dico('INCOMPLETO','dischetto-primo-incoerente', { motoreV:motoreV, righe:righe });
  }
  /* ------------------------------------------------ si rigioca */`]);

/* -------------------------------------------------------------------- 4
   I COMANDI DI DUELLO CHE LA RIGIOCATA NON HA MAI RACCOLTO. */
/* -------------------------------------------------------------------- 4bis
   IL CONTEGGIO DEI COMANDI DI DUELLO, NEL REFERTO E BASTA.

   NON e' piu' una guardia (vedi il commento della guardia nuova: la forma
   larga rovesciava una decisione del #133, quella stretta non era
   deterministica). Resta un NUMERO nel referto, perche' e' con quello che
   si misura quanto la rigiocata si e' scostata dal nastro, e una sonda che
   non potesse leggerlo non misurerebbe niente. */
COPPIE.push([
`  const divagata = Giudizio.divagata;
  Giudizio.attivo = false; Giudizio.divagata = false;`,
`  const divagata = Giudizio.divagata;
  /* QUANTI COMANDI DI DUELLO SONO RIMASTI IN CANNA (voce #149). Si legge
     qui, prima di Reg.spegni(), che azzera i due contatori. Non decide
     niente: va nel referto, e chi indaga lo legge. */
  const duelliTot = (Reg.duelli && Reg.duelli.length) | 0;
  const avanzati = Math.max(0, duelliTot - (Reg.iDuello | 0));
  Giudizio.attivo = false; Giudizio.divagata = false;`]);

COPPIE.push([
`  const piu = { motoreV:motoreV, righe:righe, passi:passi, gol:gol };`,
`  const piu = { motoreV:motoreV, righe:righe, passi:passi, gol:gol,
                avanzati:avanzati, duelli:duelliTot };`]);

/* -------------------------------------------------------------------- 5
   IL catch MUTO, DICHIARATO (non curato: vedi il commento). */
COPPIE.push([
`    try{ Reg.scrivi(15, [DISCHETTO_V, G.kickTeam]); }catch(e){}
    avviaRigori();`,
`    /* IL catch E' MUTO, ED E' UN DIFETTO DICHIARATO (voce #149).

       Se questa scrittura fallisse, il telefono produrrebbe da se' un
       nastro senza la riga 15 — cioe' il nastro del caso che la revisione
       d'insieme ha chiamato «il residuo». NON SI RIPARA QUI, e la ragione
       e' una misura: con le due guardie del #149 in piedi (dischetto-
       assente e duelli-senza-atti) l'esito di quel fallimento non e' piu'
       un'accusa ma un'ASTENSIONE, cioe' esattamente il verdetto giusto
       per un nastro che non si puo' sapere. Far esplodere la serie qui
       costerebbe una partita vera a due persone per salvare un nastro.

       QUEL CHE RESTA APERTO, scritto perche' si legga: il fallimento non
       lascia traccia da nessuna parte, quindi chi lo subisse vedrebbe la
       propria serie «non giudicabile» senza mai sapere perche'. */
    try{ Reg.scrivi(15, [DISCHETTO_V, G.kickTeam]); }catch(e){}
    avviaRigori();`]);

for (const [cerca, metti] of COPPIE) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) {
    console.error('TOPPA NON APPLICATA: un ancoraggio e\' stato trovato ' + n + ' volte (ne serve 1).');
    console.error('  ' + cerca.split('\n')[0].trim().slice(0, 90));
    process.exit(1);
  }
  t = t.replace(cerca, metti);
}

/* le sette prove di applicazione: ogni pezzo una volta sola */
const PROVE = [
  ["if(testi.size && !disco) return no('INCOMPLETO','dischetto-assente');", 1],
  ["if(disco && disco.v !== DISCHETTO_V) return no('INCOMPLETO','dischetto-versione');", 1],
  ['function dsPrimoDalSeme(seme){', 1],
  ["S.primo = dsPrimoDalSeme(S.seme) ? 'b' : 'a';", 1],
  ["'dischetto-primo-incoerente'", 1],
  ["'duelli-senza-atti'", 1],
  ["const avanzati = Math.max(0, duelliTot - (Reg.iDuello | 0));", 1],
  ["'duelli-mai-letti'", 0],
  ["S.primo = (S.seme & 1) ? 'b' : 'a';", 0],
];
for (const [ago, quante] of PROVE) {
  const n = t.split(ago).length - 1;
  if (n !== quante) {
    console.error('TOPPA NON APPLICATA: «' + ago.slice(0, 60) + '» compare ' + n + ' volte, ne servono ' + quante);
    process.exit(1);
  }
}

fs.writeFileSync(FILE, t);
console.log('toppa 149-giudice applicata a ' + path.relative(RADICE, FILE) + ' (' + COPPIE.length + ' ancoraggi)');
