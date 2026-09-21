/* =====================================================================
   _toppa-giudice.js — IL GIUDICE ENTRA NEL FILE
   (voce #133, compito 2).

   LA CURA. `Sfida.guarda` gia' oggi fa il lavoro del giudice: prende un
   nastro, lo rigioca sul motore vero, e a fine partita confronta il
   punteggio uscito con quello dichiarato. Quello che le manca non e' la
   capacita': e' che la capacita' sta dentro a una schermata — chiede la
   rete, dipinge una lista, cambia scena, scrive cartelli. Questa toppa
   rende quella stessa capacita' chiamabile SENZA SCHERMO, con quattro
   ancore:

     1. chiudiSfida — il giudice non impara l'indole. Un giudizio non e'
        una partita giocata da nessuno: se la insegnasse al profilo,
        verificare la sfida di un altro cambierebbe la propria squadra.
     2. startFreeKick — il ripiego del dischetto (voce #131) alza una
        bandiera invece di chiamare fermaReplayAlDischetto, che e' tutta
        schermo (goScreen, playWipe, Sfida.stato).
     3. la funzione giudica(), la tavola dei tetti e l'oggetto Giudizio,
        dopo abbandonaSfida.
     4. window.__test.giudica, la porta per il banco e per il
        verificatore differito che vivra' sul server.

   uso:  node strumenti/_toppa-giudice.js --out fuori/gioco-giudice.html
         node strumenti/_toppa-giudice.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const dentro = process.argv.includes('--dentro');
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = dentro ? inFile : path.resolve(RADICE, arg('out', 'fuori/gioco-giudice.html'));

/* ---------------------------------------------------- ancora 1 */
const A1 = `function chiudiSfida(){
  try{ Rete.imparaIndole(); }catch(e){}`;
const B1 = `function chiudiSfida(){
  /* =====================================================================
     IL GIUDICE NON IMPARA NIENTE (voce #133, compito 2).

     imparaIndole scrive i sei numeri che dicono come giochi, e viaggiano
     col profilo quando qualcuno ti attacca. Un GIUDIZIO non e' una
     partita giocata da nessuno: e' il nastro di un altro rigiocato per
     controllarlo. Se il giudice imparasse da li', verificare le sfide
     degli altri cambierebbe la propria squadra — e chi ne verifica mille
     al giorno diventerebbe la media di mille sconosciuti.
     E' il quarto punto del contratto del giudice: non muove niente di
     suo. Tutto il resto di questa funzione va gia' bene per lui, ed e'
     voluto: il ramo del replay non manda niente in rete, non paga
     monete, non fa crescere la rosa, e senza S.atteso non scrive
     nessun cartello. Il confronto col punteggio dichiarato il giudice lo
     fa da se'.
     ===================================================================== */
  if(!Giudizio.attivo){ try{ Rete.imparaIndole(); }catch(e){} }`;

/* ---------------------------------------------------- ancora 2 */
const A2 = `  if(Reg.modo===2 && G.sfida && G.sfida.replay &&
     (Duel.shooterHuman || Duel.keeperHuman) && !Reg.righeDuello(Duel.nDuello))
    setTimeout(fermaReplayAlDischetto, 0);`;
const B2 = `  if(Reg.modo===2 && G.sfida && G.sfida.replay &&
     (Duel.shooterHuman || Duel.keeperHuman) && !Reg.righeDuello(Duel.nDuello)){
    /* IL GIUDICE NON HA UNO SCHERMO DOVE FERMARSI (voce #133, compito 2).
       fermaReplayAlDischetto e' tutta schermo — goScreen, playWipe,
       Sfida.stato — e un giudizio gira senza schermata della sfida. La
       causa pero' e' la STESSA (il nastro non ha i comandi di questo
       duello, cioe' la rigiocata ha preso un'altra strada), quindi si
       alza una bandiera e il giudice la legge come INCOMPLETO. Nessun
       punto si muove: e' un «non lo so», non un «hai barato». */
    if(Giudizio.attivo) Giudizio.divagata = true;
    else setTimeout(fermaReplayAlDischetto, 0);
  }`;

/* ---------------------------------------------------- ancora 3 */
const A3 = `  if(!S.replay) toast('fischietto','SFIDA ABBANDONATA','Non è stata mandata: non conta né in bene né in male.');
}`;
const B3 = A3 + `

/* =====================================================================
   IL GIUDICE (voce #133, compito 2). Il mandato S10.5 chiede il
   VERIFICATORE DIFFERITO delle sfide: la riga «la classifica si
   ripulisce da sola» sta in rete/LEGGIMI.md da mesi, e finora era una
   promessa architetturale invece di un fatto misurato.

   PERCHE' STA QUI E NON SUL SERVER. Un verificatore che rigioca la
   partita con un SECONDO motore scritto in Node e' la peggiore idea
   possibile per questo problema: due implementazioni della stessa fisica
   divergono per costruzione, e ogni divergenza toglierebbe punti a un
   innocente invece di trovare un baro. Il motore vero e' uno solo ed e'
   questo file. Un verificatore e' allora un browser senza finestra che
   apre il file, chiama questa funzione e legge una stringa.

   I CINQUE VERDETTI, e uno solo puo' muovere punti:
     TORNA         il punteggio rigiocato coincide con quello dichiarato
     NON TORNA     coincide male — l'unico su cui sia lecito agire
     INCOMPLETO    il nastro non basta a decidere (e la causa lo dice)
     ALTRO MOTORE  MOTORE_V diverso: causa vera, nessun accusato
     NON FINISCE   la rigiocata non arriva alla fine entro il tetto

   IL CONTRATTO, in quattro punti, e ognuno e' una misura di un cantiere
   precedente:
     1. FORZA sponde:'gabbia' e miraGuidata:'pieno', come Sfida.gioca e
        Sfida.guarda (grep i commenti gemelli). Sono due impostazioni del
        TELEFONO: un giudice che seguisse le sue rigiocherebbe il nastro
        su un motore diverso da quello con cui la partita fu giocata, e
        direbbe NON TORNA per colpa del motore invece che della rosa.
     2. LEGGE LE ROSE DAL NASTRO, mai dal profilo vivo. La rosa di
        carriera cresce a ogni partita per disegno: leggere quella viva
        significa giudicare un'altra partita. E qui il giudice e' PIU'
        STRETTO di Sfida.guarda: dove quella, se la testa di tipo 7
        manca, ripiega sul profilo di oggi (meglio un film approssimato
        che nessun film), il giudice si rifiuta e dice INCOMPLETO. Un
        film approssimato costa niente; un verdetto approssimato costa
        punti a qualcuno.
     3. NON MUOVE MAI UN PUNTO su un verdetto diverso da NON TORNA.
        INCOMPLETO, ALTRO MOTORE e NON FINISCE sono «non lo so». E' il
        principio della voce #132 (nessun innocente accusato) portato
        dentro al giudice.
     4. E' DETERMINISTICO E RIPETIBILE: due chiamate sullo stesso nastro
        danno lo stesso verdetto, gli stessi gol e gli stessi passi.

   IL TETTO E' QUELLO DELLA TAGLIA, non un numero fisso: la voce #130 ha
   misurato che una partita a undici chiede piu' fotogrammi di una a
   cinque (18.000 / 21.000 / 27.000 — la stessa tavola di
   strumenti/_q-invarianti.js, e il cancello _q-giudice.js confronta le
   due perche' due tavole che divergono in silenzio sono peggio di una
   sola). Un tetto tarato su taglia 5 boccerebbe con NON FINISCE ogni
   sfida legittima a taglia 11.
   ===================================================================== */
const TETTI_GIUDIZIO = { 5: 18000, 7: 21000, 11: 27000 };
function tettoGiudizio(taglia){
  return TETTI_GIUDIZIO[(taglia===7 || taglia===11) ? taglia : 5];
}
/* LA BANDIERA DEL GIUDIZIO, fuori da G.sfida perche' deve sopravvivere a
   chiudiSfida (che azzera G.sfida come ultima cosa della partita). */
const Giudizio = { attivo:false, divagata:false };

function giudica(nastro, atteso, opz){
  opz = opz || {};
  /* SI ACCETTA ANCHE LA RIGA DEL SERVER INTERA, che e' la forma in cui
     il dato esiste davvero: {replay, seme, taglia, gol_a, gol_d}. Chi
     passa i tre pezzi separati non se ne accorge. */
  if(nastro && typeof nastro === 'object'){
    const riga = nastro;
    if(atteso === undefined || atteso === null) atteso = [riga.gol_a, riga.gol_d];
    opz = { seme: opz.seme !== undefined ? opz.seme : riga.seme,
            taglia: opz.taglia !== undefined ? opz.taglia : riga.taglia,
            tetto: opz.tetto };
    nastro = (riga.nastro !== undefined) ? riga.nastro : riga.replay;
  }
  /* IL SEME E LA TAGLIA NON STANNO NEL NASTRO: li assegna il server
     (/api/avversario) e li rilegge con la sfida. Senza, il giudice non
     puo' decidere — e non decidere e' un verdetto, non un errore. */
  const taglia = [5,7,11].indexOf(opz.taglia|0) >= 0 ? (opz.taglia|0) : 0;
  /* IL TETTO SI PUO' SOLO STRINGERE, mai allargare: chi chiama puo'
     chiedere al giudice di arrendersi prima (ed e' come il banco fa
     uscire NON FINISCE da un gioco sano), ma nessuno puo' alzarlo sopra
     quello della taglia. E NON FINISCE non muove punti, quindi un tetto
     stretto per sbaglio non puo' far danno a nessuno. */
  const pieno = tettoGiudizio(taglia || 5);
  const tetto = (opz.tetto !== undefined && opz.tetto !== null && +opz.tetto > 0)
                ? Math.min(pieno, Math.floor(+opz.tetto)) : pieno;
  const A = Array.isArray(atteso) ? atteso : (atteso ? [atteso.gol_a, atteso.gol_d] : []);
  const gA = Math.round(+A[0]), gD = Math.round(+A[1]);
  const dico = (verdetto, causa, extra) => Object.assign({
    verdetto: verdetto, causa: causa || '', gol: null, atteso: [gA, gD],
    passi: 0, tetto: tetto, taglia: taglia, motoreV: 0, righe: 0,
    seme: String(opz.seme === undefined || opz.seme === null ? '' : opz.seme),
  }, extra || {});

  if(!taglia) return dico('INCOMPLETO','taglia-assente');
  if(opz.seme === undefined || opz.seme === null || !/[0-9]/.test(String(opz.seme)))
    return dico('INCOMPLETO','seme-assente');
  if(!Number.isFinite(gA) || !Number.isFinite(gD)) return dico('INCOMPLETO','atteso-assente');
  if(typeof nastro !== 'string' || !nastro) return dico('INCOMPLETO','nastro-assente');

  /* DA QUI IN POI IL REGISTRO E' IN MANO AL GIUDICE, e ogni uscita lo
     rispegne: una pagina lasciata in rilettura ignorerebbe le dita vere. */
  let righe = -1;
  try{ righe = Reg.deserializza(nastro); }catch(e){ righe = -1; }
  if(righe < 0){ Reg.spegni(); return dico('INCOMPLETO','nastro-illeggibile'); }
  const motoreV = Reg.motoreV|0;
  const fermo = (verdetto, causa, extra) => {
    Reg.spegni();
    return dico(verdetto, causa, Object.assign({ motoreV:motoreV, righe:righe }, extra || {}));
  };
  /* L'ORDINE E' QUELLO DI Sfida.guarda, e non per abitudine: il rifiuto
     piu' SPECIFICO vince, cosi' la causa che esce e' quella vera. */
  if(motoreV !== MOTORE_V) return fermo('ALTRO MOTORE','motore-diverso');
  if(righe === 0) return fermo('INCOMPLETO','nastro-vuoto');
  if(Reg.troncato) return fermo('INCOMPLETO','nastro-troncato');
  let marchio = false, dati = null;
  for(const r of Reg.righe){
    if(r[1] === 5) marchio = true;
    else if(r[1] === 7 && !dati) dati = r;
  }
  /* il marchio di tipo 5 e' il segno dei nastri scritti PRIMA della voce
     #131: quelli il duello non ce l'hanno davvero */
  if(marchio) return fermo('INCOMPLETO','duello-marchiato');
  if(!(dati && dati.length > 6)) return fermo('INCOMPLETO','rose-assenti');
  const mentAtt = mentValida(dati[3]), mentDif = mentValida(dati[4]);
  /* I NOMI NON SI PASSANO (il terzo argomento resta null): nel nastro non
     ci sono, e spaccaRosa li sa fare da se'. Un nome non muove una
     partita — lo dice il commento accanto a spaccaRosa, e lo rimisura il
     compito 3 di questa voce. */
  const p1 = spaccaRosa(dati, 5, null);
  const p2 = spaccaRosa(dati, p1.fine, null);
  if(!(p1.rosa.length >= 4 && p2.rosa.length >= 4)) return fermo('INCOMPLETO','rose-assenti');
  /* L'INDICE DI CARATTERE, IN CODA (voce #132, compito 2). Se non c'e',
     il nastro e' di prima di quella cura e startMatch ricadrebbe sul
     NOME dell'avversario — che nel nastro non c'e' e che chi difende puo'
     cambiare quando vuole. Sfida.guarda accetta quel ripiego perche'
     mostra un film; il giudice no, perche' toglie punti. */
  if(dati.length <= p2.fine) return fermo('INCOMPLETO','carattere-assente');
  const carDif = dati[p2.fine];

  /* ------------------------------------------------ si rigioca */
  const nomePrima = G.teamName;
  const colA = coloriBuoni(null), colD = { maglia:'#cf3e6b', calzoncini:'#123a80' };
  /* =====================================================================
     IL SALVATAGGIO SI FOTOGRAFA E SI RIMETTE COM'ERA.

     Una partita che finisce scrive nel salvataggio anche quando non paga
     niente: MISURATO (fuori/_sonda-133-fermo.js, un giudizio su un nastro
     vero) due chiavi si muovono — SAVE.lastRes, cioe' il punteggio sulla
     lavagna della home, e SAVE.inviti, la memoria dei suggerimenti
     (Inviti.usato scrive SEMPRE, anche a inviti zittiti: e' il ricordo
     che impedisce all'invito di tornare, e sta scritto accanto).

     Un verificatore ne fa mille al giorno. Senza questa fotografia, chi
     verifica le sfide degli altri si ritroverebbe sulla lavagna di casa
     il risultato di una partita che non ha giocato e i suggerimenti
     consumati da pollici di sconosciuti.

     SI FOTOGRAFA TUTTO e non le due chiavi misurate, e non e' pigrizia:
     l'elenco dei posti in cui una partita puo' scrivere non e' una cosa
     che si possa dichiarare chiusa guardandola una volta (trofei,
     record, primati arrivano su esiti che un giudizio potrebbe produrre
     domani). Il punto 3 del contratto dice «non muove niente di suo», e
     questo e' il modo di dirlo che non dipende da un elenco.
     ===================================================================== */
  let fotoSave = '';
  try{ fotoSave = JSON.stringify(SAVE); }catch(e){ fotoSave = ''; }
  Giudizio.attivo = true; Giudizio.divagata = false;
  let passi = 0, finita = false, scoppio = '';
  try{
    SEME.accendi(semeDaTesto(opz.seme));
    /* replay:true e' quello che spegne i premi e la spedizione in
       chiudiSfida; atteso NON si passa, perche' il confronto lo fa il
       giudice e un cartello a schermo qui non lo vedrebbe nessuno */
    G.sfida = { seme:String(opz.seme), taglia:taglia, chi:'GIUDIZIO',
                vero:true, replay:true, nomePrima:nomePrima };
    startMatch(1, SFIDA_DIFF, {
      size: taglia,
      sponde: 'gabbia',          /* punto 1 del contratto */
      miraGuidata: 'pieno',      /* punto 1 del contratto */
      /* NOMI E TINTE FISSI: non stanno nel nastro e non muovono la
         partita, ma fissarli rende il giudizio identico su qualunque
         telefono invece che dipendente da chi lo sta dando. */
      mia: { n:'GIUDIZIO A', c1:colA.maglia, c2:colA.calzoncini, pat:0,
             ment:mentAtt, rosa:p1.rosa },
      opp: { n:'GIUDIZIO D', c1:colD.maglia, c2:colD.calzoncini, pat:1,
             ment:mentDif, car:carDif, rosa:p2.rosa },
    });
    /* IL CICLO E' QUELLO DI __test.simulate, senza i due cronometri
       dell'effetto scossa: qui non si disegna niente. */
    while(passi < tetto){
      if(G.scene === 'end'){ finita = true; break; }
      if(Giudizio.divagata) break;
      if(G.scene === 'freekick') Duel.update(DT);
      else step();
      passi++;
    }
    if(G.scene === 'end') finita = true;
  }catch(e){ scoppio = String(e && e.message || e); }
  const gol = [G.score[0]|0, G.score[1]|0];
  const divagata = Giudizio.divagata;
  Giudizio.attivo = false; Giudizio.divagata = false;
  /* LA PULIZIA, sempre e comunque: una partita non finita resta appesa
     con il seme acceso e il registro in rilettura, e la prossima
     amichevole di quel telefono sarebbe la stessa partita per sempre. */
  if(!finita){ try{ abbandonaSfida(); }catch(e){} }
  Reg.spegni(); SEME.spegni();
  G.sfidaFine = 0;
  if(G.teamName !== nomePrima){ G.teamName = nomePrima; try{ applyKit(); refreshTeamRGB(); }catch(e){} }
  /* il salvataggio torna quello di prima, chiave per chiave, e si
     riscrive sul disco: se no la fotografia resterebbe solo in memoria e
     la prossima persistSave di un'altra parte del gioco rimetterebbe
     fuori quello che il giudizio aveva sporcato */
  if(fotoSave){
    try{
      const v = JSON.parse(fotoSave);
      for(const k of Object.keys(SAVE)) if(!(k in v)) delete SAVE[k];
      for(const k of Object.keys(v)) SAVE[k] = v[k];
      persistSave();
    }catch(e){}
  }

  const piu = { motoreV:motoreV, righe:righe, passi:passi, gol:gol };
  if(scoppio) return dico('INCOMPLETO','rigiocata-esplosa', Object.assign({ errore:scoppio }, piu));
  if(divagata) return dico('INCOMPLETO','duello-senza-righe', piu);
  if(!finita) return dico('NON FINISCE','tetto-raggiunto', piu);
  return dico((gol[0] === gA && gol[1] === gD) ? 'TORNA' : 'NON TORNA', '', piu);
}`;

/* ---------------------------------------------------- ancora 4 */
const A4 = `  nastro(){ return Reg.serializza(); },
  rigioca(testo){ return Reg.deserializza(testo); },`;
const B4 = A4 + `
  /* IL GIUDICE (voce #133). La porta del verificatore differito: gli si
     passa il nastro CRUDO, il punteggio dichiarato e {seme, taglia}, e
     torna uno dei cinque verdetti. Chi chiama dal server allarga il
     nastro prima (il server lo conserva stretto, deflate-raw +
     base64url): giudica e' sincrona e pura, allargare e' asincrono. */
  giudica(nastro, atteso, opz){ return giudica(nastro, atteso, opz); },`;

/* ------------------------------------------------------------------ */
const src = fs.readFileSync(inFile, 'utf8');
const ancore = [[A1, B1, 'chiudiSfida'], [A2, B2, 'startFreeKick'],
                [A3, B3, 'la funzione giudica'], [A4, B4, 'window.__test']];
let out = src;
for (const [a, b, nome] of ancore) {
  const n = out.split(a).length - 1;
  if (n !== 1) { console.error('FALLITO: l\'ancora «' + nome + '» non si trova esattamente una volta (trovata ' + n + ').'); process.exit(1); }
  out = out.replace(a, b);
}
const attesi = [
  ['function giudica(nastro, atteso, opz){', 1],
  ['const TETTI_GIUDIZIO = { 5: 18000, 7: 21000, 11: 27000 };', 1],
  ['const Giudizio = { attivo:false, divagata:false };', 1],
  ['if(!Giudizio.attivo){ try{ Rete.imparaIndole(); }catch(e){} }', 1],
  ['if(Giudizio.attivo) Giudizio.divagata = true;', 1],
  ['giudica(nastro, atteso, opz){ return giudica(nastro, atteso, opz); },', 1],
  /* le due righe del contratto, una per capo: Sfida.gioca, Sfida.guarda,
     e adesso il giudice */
  ["      sponde: 'gabbia',", 3],
  ["      miraGuidata: 'pieno',", 3],
  /* quel che NON deve essere cambiato */
  ['function fermaReplayAlDischetto(){', 1],
  ['setTimeout(fermaReplayAlDischetto, 0);', 1],
  ['const MOTORE_V = 2;', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il giudice e\' nel file: quattro ancore, +' + (out.length - src.length) + ' byte');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_q-giudice.js' + (dentro ? '' : ' --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/')));
