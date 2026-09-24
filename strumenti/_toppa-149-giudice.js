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
     4  il residuo (15 e 14 tolte) si vede lo stesso: il nastro porta
        comandi di duello che la rigiocata non raccoglie mai.

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
COPPIE.push([
`  const divagata = Giudizio.divagata;
  Giudizio.attivo = false; Giudizio.divagata = false;`,
`  const divagata = Giudizio.divagata;
  /* =====================================================================
     E I COMANDI DI DUELLO RIMASTI NEL NASTRO (voce #149).

     E' LA META' GEMELLA DI duello-senza-righe, e mancava. Quella si alza
     quando si APRE UN DUELLO e il nastro non ha righe per lui; questa
     quando il nastro HA RIGHE e non si apre mai il duello che le
     consumi. Le due dicono la stessa cosa da due lati: la partita
     rigiocata ha preso una strada che quella registrata non aveva.

     PERCHE' SERVE, e non e' un di piu' del dischetto. Il #147 dichiaro'
     un residuo: chi toglie la riga 15 E tutte le 14 «ottiene un nastro
     indistinguibile da una partita normale», e concluse che chiuderlo
     vorrebbe dire FIRMARE la 15. LA DICHIARAZIONE ERA VERA PER
     IDENTIFICARE LA SERIE E FALSA PER ASTENERSI: quel nastro porta
     trenta comandi di duello che novanta secondi di calcio non
     raccolgono, e quello si vede senza nessuna chiave e senza nessuna
     firma. MISURATO: NON TORNA, rigiocato [0,1] in 5984 passi; con questa
     riga, INCOMPLETO/duelli-mai-letti.

     E NON E' UNA GUARDIA DEL DISCHETTO: non nomina ne' la riga 15 ne' le
     14, e vale per qualunque nastro. E' la ragione per cui e' la forma
     giusta — prende il residuo senza sapere che esiste un dischetto.

     SI LEGGE QUI, prima di Reg.spegni(), che azzera i due contatori. */
  const duelliTot = (Reg.duelli && Reg.duelli.length) | 0;
  const avanzati = Math.max(0, duelliTot - (Reg.iDuello | 0));
  /* =====================================================================
     E LA SOGLIA E' «NEMMENO UNO», NON «QUALCUNO» — ED E' UNA MISURA.

     La prima stesura di questa riga diceva «se ne avanza anche uno solo,
     astieniti». Faceva il suo mestiere sul residuo, e ne prendeva un
     altro che non le spettava: il nastro di una sfida vera giudicato col
     SEME SBAGLIATO, che il #133 ha deciso di trattare come NON TORNA e
     che _q-staffetta B1 sorveglia. MISURATO (strumenti/_sonda-149-duelli.js):

       sfida congelata, seme sbagliato   4 comandi avanzati su 6
       serie dal dischetto, il residuo   12 comandi avanzati su 12
       nastri onesti (sfida e serie)     0 su 6 e 0 su 12
       punteggio gonfiato di uno         0 su 6, e resta NON TORNA

     I DUE CASI SONO DIVERSI IN NATURA, non di grado. Con QUALCHE comando
     letto la rigiocata era entrata nel nastro e poi ne e' uscita: e' una
     DIVERGENZA, e il giudice ha gia' due risposte per quella (NON TORNA
     dal #133, duello-senza-righe dal #131). Con NESSUN comando letto la
     rigiocata non e' mai entrata: non e' la stessa partita andata male,
     e' un'altra partita, e su un'altra partita non si sa niente.

     LA FORMA LARGA AVREBBE ROVESCIATO UNA DECISIONE DEL #133 senza una
     misura che la giustificasse, e questo cantiere non ne ha una. Resta
     aperta la domanda — «un nastro che diverge a meta' merita un'accusa
     o un'astensione?» — e resta aperta CON IL NUMERO ACCANTO, che e'
     l'unico modo onesto di lasciarla aperta.

     SI LEGGE QUI, prima di Reg.spegni(), che azzera i due contatori. */
  const maiLetti = duelliTot > 0 && avanzati === duelliTot;
  Giudizio.attivo = false; Giudizio.divagata = false;`]);

/* e il referto dice SEMPRE quanti comandi di duello sono avanzati e quanti
   ce n'erano: un numero che si leggesse solo quando il verdetto lo nomina
   non si potrebbe misurare. */
COPPIE.push([
`  const piu = { motoreV:motoreV, righe:righe, passi:passi, gol:gol };`,
`  /* \`avanzati\` STA SEMPRE NEL REFERTO (voce #149), non solo sulla causa
     che lo nomina: e' il numero con cui si misura QUANTO la rigiocata si e'
     scostata dal nastro, e una sonda che potesse leggerlo solo quando il
     verdetto e' gia' quello non misurerebbe niente. */
  const piu = { motoreV:motoreV, righe:righe, passi:passi, gol:gol,
                avanzati:avanzati, duelli:duelliTot };`]);

COPPIE.push([
`  if(divagata) return dico('INCOMPLETO','duello-senza-righe', piu);
  if(!finita) return dico('NON FINISCE','tetto-raggiunto', piu);`,
`  if(divagata) return dico('INCOMPLETO','duello-senza-righe', piu);
  if(!finita) return dico('NON FINISCE','tetto-raggiunto', piu);
  /* DOPO «non finisce», E LA COLLOCAZIONE E' UNA MISURA (voce #149): chi
     chiama puo' stringere il tetto (e il banco lo fa apposta per far
     uscire NON FINISCE da un gioco sano), e una rigiocata interrotta
     lascia indietro i duelli che le mancavano. Chiamarli «non letti»
     li' vorrebbe dire dare la colpa al nastro del tetto di chi giudica.
     Qui la partita e' FINITA: se il nastro ha ancora comandi di duello in
     canna, e' la rigiocata che ha preso un'altra strada. */
  if(maiLetti) return dico('INCOMPLETO','duelli-mai-letti', piu);`]);

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
       assente e duelli-mai-letti) l'esito di quel fallimento non e' piu'
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
  ["const maiLetti = duelliTot > 0 && avanzati === duelliTot;", 1],
  ["'duelli-mai-letti'", 1],
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
