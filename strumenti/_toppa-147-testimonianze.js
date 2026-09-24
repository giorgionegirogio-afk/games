/* =====================================================================
   _toppa-147-testimonianze.js — LE TESTIMONIANZE VIAGGIANO, E IL GIUDICE
   LE PRETENDE (voce #147, compito 4)

   IL BUCO, COME L'AVEVA DICHIARATO IL #146:

     «vagliaNastro non pretende le righe di tipo 14. La verifica
     dell'impegno vive in diretta; in differita, un nastro a cui le 14
     fossero tolte passerebbe come partita normale. Il punteggio
     rigiocherebbe giusto — nessun innocente accusato — ma la prova di
     lealta' non verrebbe rifatta.»

   E IL BUCO, COME L'HA TROVATO LA MISURA (strumenti/_sonda-147-
   quattordici.js, 24 settembre 2026, merge-base 999fbf8, serie vera fra
   due telefoni, tre tiri):

     righe in memoria 17 · righe rilette 11 · nastro 173 caratteri
     per tipo nel testo: {3: 2, 6: 9}      <- ZERO righe di tipo 14
     verdetto del giudice: INCOMPLETO / rose-assenti

   Le 14 NON ARRIVANO NEMMENO NEL NASTRO. `Reg.serializza` non ha un ramo
   per il tipo 14 e `Reg.deserializza` neppure: `Dischetto.testimonia`
   scrive la riga in memoria, e la prima serializzazione la butta. Il
   #146 aveva letto il codice del giudice e aveva ragione su quello; la
   riga a monte non l'aveva guardata nessuno. Quindi la cura e' DOPPIA, e
   la seconda meta' non sarebbe mai stata trovata ragionando.

   LE QUATTRO ANCORE:

   1. `serializza` impara i tipi 14 e 15. Le quattro parole dell'impegno
      e le quattro del nonce sono interi senza segno: `>>> 0`, non `|0`,
      perche' un hash sta sopra 2^31 una volta su due e dal `|0`
      tornerebbe negativo — e' la stessa riga che il #142 ha gia' dovuto
      scrivere per l'impronta del motore.
   2. `deserializza` le rilegge, simmetriche.
   3. `Dischetto.avvia` scrive la riga di tipo 15: LA CARTA D'IDENTITA'
      della partita. Non e' un comando, e in rilettura non fa niente
      (come la 7, la 10 e la 11): dice soltanto «questa partita e' una
      serie dal dischetto, versione DISCHETTO_V».
   4. `vagliaNastro` pretende le testimonianze, e SI ASTIENE se mancano.

   PERCHE' SERVE LA 15, E NON BASTA GUARDARE LE 14. Chiedere «se ci sono
   righe di tipo 14, controllale» e' circolare: chi le toglie tutte non
   lascia niente da controllare. La 15 e' il segno che dice che quelle
   righe DOVEVANO esserci. E il riconoscimento e' nei due versi — 15
   OPPURE almeno una 14 — cosi' chiude anche l'attacco piu' fine, quello
   di chi ne toglie ALCUNE.

   DOVE STA IL CONTROLLO, E PERCHE' LI'. Subito dopo `duello-marchiato` e
   PRIMA di `rose-assenti`, e la ragione e' una misura: oggi un nastro di
   una serie dal dischetto e' gia' `INCOMPLETO / rose-assenti` (la sonda
   qui sopra). Mettendo il controllo in coda non sarebbe mai stato
   raggiunto su un nastro vero, e la cura sarebbe stata verificabile solo
   su un nastro costruito dal banco — cioe' non verificata. E la
   collocazione e' anche giusta nel merito: `duello-marchiato` e
   `testimonianze-assenti` dicono tutte e due una proprieta' DEL NASTRO,
   mentre `rose-assenti` dice che cosa manca per RIGIOCARLO.

   SI ASTIENE, NON ACCUSA. `INCOMPLETO` non muove punti, la riga resta a
   `verificata = 0` e torna giudicabile il giorno in cui arriva completa.
   E' il principio di tutta l'onda D (#134, «nessun innocente»): un
   nastro a cui manca la prova non e' il nastro di un baro, e' un nastro
   che non si sa giudicare.

   IL RESIDUO, DICHIARATO QUI E NON IN FONDO. Chi toglie TUTTE le 14 E la
   15 ottiene un nastro indistinguibile da una partita normale: il
   punteggio rigioca giusto, nessun innocente viene accusato, e la prova
   di lealta' non viene rifatta. Questa cura RESTRINGE il buco, non lo
   chiude, e la ragione e' strutturale: chiuderlo vorrebbe dire FIRMARE
   la riga 15, una firma vuole una chiave, e in questo gioco non c'e'
   nessuna chiave — per statuto (rete/LEGGIMI.md:181-183), non per
   dimenticanza. Chi legge questa riga domani: non e' una svista.

   MOTORE_V. Una riga che non e' un comando non dovrebbe cambiare nessun
   esito, ma «non dovrebbe» non e' un numero: si misura nei due versi in
   strumenti/_t-147-motorev.js, come hanno fatto il #144 e il #146.

   uso:  node strumenti/_toppa-147-testimonianze.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

/* ------------------------------------------------------ 1. SERIALIZZA */
const A1 = `      } else if(tipo === 7){
        /* LE DUE SQUADRE. Interi e virgole, lunghezza variabile, scritti`;
const B1 = `      } else if(tipo === 14){
        /* LA TESTIMONIANZA DEL DISCHETTO (voce #146, messa nel nastro
           dalla voce #147). Dieci o quattordici numeri: il tiro, il
           lato, le quattro parole dell'impegno, le quattro del nonce e
           la mossa. Non e' un comando — i comandi sono le righe di tipo
           6, che le tre porte scrivono da se' — ed e' la prova che la
           mossa dell'altro non me la sono inventata io.
           >>> 0 E NON |0, e non e' un vezzo: una parola di SHA-256 sta
           sopra 2^31 una volta su due, e dal |0 tornerebbe negativa.
           E' la stessa riga che il #142 ha gia' dovuto scrivere per
           l'impronta del motore, e per la stessa ragione.
           FINO A OGGI QUESTO RAMO NON C'ERA: Dischetto.testimonia
           scriveva la riga in memoria e la prima serializzazione la
           buttava (misurato, strumenti/_sonda-147-quattordici.js: nastro
           di una serie vera, per tipo {3,6} e zero 14). */
        pezzi.push(dT + ',14,' + dMs + ',' + r.slice(3).map(x => (x|0) >>> 0).join(','));
      } else if(tipo === 15){
        /* LA CARTA D'IDENTITA' DELLA PARTITA (voce #147). Un numero
           solo, una volta sola: la versione del protocollo del
           dischetto. In rilettura non fa niente. Serve a chi GIUDICA per
           sapere che quel nastro DEVE portare le sue testimonianze —
           senza, chi le togliesse tutte non lascerebbe niente da
           controllare, e il controllo sarebbe circolare. */
        pezzi.push(dT + ',15,' + dMs + ',' + (r[3]|0));
      } else if(tipo === 7){
        /* LE DUE SQUADRE. Interi e virgole, lunghezza variabile, scritti`;

/* ---------------------------------------------------- 2. DESERIALIZZA */
const A2 = `      else if(tipo === 7)   this.righe.push([tick, 7, ms].concat(v.slice(3)));`;
const B2 = `      else if(tipo === 14)  this.righe.push([tick, 14, ms].concat(v.slice(3).map(x => (x|0) >>> 0)));
      else if(tipo === 15)  this.righe.push([tick, 15, ms, v[3]|0]);
      else if(tipo === 7)   this.righe.push([tick, 7, ms].concat(v.slice(3)));`;

/* ----------------------------------------- 3. LA CARTA D'IDENTITA' */
const A3 = `    /* chi tira per primo l'ha deciso il seme, non una persona */
    G.kickTeam = (S.primo === 'a') ? 0 : 1;`;
const B3 = `    /* LA CARTA D'IDENTITA' DEL NASTRO (voce #147). Si scrive DOPO
       startMatch, che e' il posto in cui il registro nasce, e prima del
       primo tiro. Da questa riga il giudice sa che il nastro deve
       portare le sue testimonianze: senza, chi le togliesse tutte
       renderebbe la serie indistinguibile da una partita qualunque. */
    try{ Reg.scrivi(15, [DISCHETTO_V]); }catch(e){}
    /* chi tira per primo l'ha deciso il seme, non una persona */
    G.kickTeam = (S.primo === 'a') ? 0 : 1;`;

/* --------------------------------------------------- 4. IL GIUDICE */
const A4 = `  let marchio = false, dati = null;
  for(const r of Reg.righe){
    if(r[1] === 5) marchio = true;
    else if(r[1] === 7 && !dati) dati = r;
  }
  /* il marchio di tipo 5 e' il segno dei nastri scritti PRIMA della voce
     #131: quelli il duello non ce l'hanno davvero */
  if(marchio) return no('INCOMPLETO','duello-marchiato');`;
const B4 = `  let marchio = false, dati = null;
  /* LE TESTIMONIANZE DEL DISCHETTO, RACCOLTE NELLO STESSO GIRO (voce
     #147): quali tiri hanno la loro prova, e da quale lato. */
  let disco = false;
  const testi = new Map();
  for(const r of Reg.righe){
    if(r[1] === 5) marchio = true;
    else if(r[1] === 7 && !dati) dati = r;
    else if(r[1] === 15) disco = true;
    else if(r[1] === 14){
      const nt = r[3]|0;
      if(!testi.has(nt)) testi.set(nt, 0);
      testi.set(nt, testi.get(nt) | (1 << ((r[4]|0) ? 1 : 0)));
    }
  }
  /* il marchio di tipo 5 e' il segno dei nastri scritti PRIMA della voce
     #131: quelli il duello non ce l'hanno davvero */
  if(marchio) return no('INCOMPLETO','duello-marchiato');
  /* =====================================================================
     E UN NASTRO DEL DISCHETTO DEVE PORTARE LE SUE TESTIMONIANZE
     (voce #147, la cura del buco che il #146 ha dichiarato da se').

     La verifica dell'impegno vive in DIRETTA: nessuno rivela finche' non
     ha l'impegno dell'altro, e chi rivela una mossa che non aveva
     impegnato viene fermato sul posto. In DIFFERITA quella prova va
     RIFATTA, e per rifarla ci vogliono le righe di tipo 14. Un nastro a
     cui fossero tolte rigiocherebbe un punteggio giusto — nessun
     innocente accusato — ma la prova di lealta' non verrebbe rifatta.

     IL RICONOSCIMENTO E' NEI DUE VERSI, e non per abbondanza: la 15
     dice «qui si e' giocato dal dischetto» ed e' cio' che rende il
     controllo non circolare; la presenza di una 14 qualunque prende chi
     ne togliesse solo ALCUNE. Servono tutti e due.

     SI STA QUI, prima di rose-assenti, e la collocazione e' una misura:
     un nastro di una serie vera oggi e' gia' INCOMPLETO/rose-assenti
     (strumenti/_sonda-147-quattordici.js), quindi un controllo in coda
     non sarebbe mai stato raggiunto su un nastro vero — sarebbe stato
     verificabile solo su un nastro costruito dal banco, cioe' non
     verificato. E nel merito e' il posto giusto: duello-marchiato e
     questa dicono una proprieta' DEL NASTRO, rose-assenti dice che cosa
     manca per RIGIOCARLO.

     SI ASTIENE, NON ACCUSA. INCOMPLETO non muove punti, la riga resta a
     verificata = 0 e torna giudicabile il giorno in cui arriva
     completa. E' il principio di tutta l'onda D.

     IL RESIDUO, SCRITTO QUI. Chi toglie TUTTE le 14 E la 15 ottiene un
     nastro indistinguibile da una partita normale. Questa riga
     RESTRINGE il buco, non lo chiude: chiuderlo vorrebbe dire FIRMARE
     la 15, una firma vuole una chiave, e in questo gioco non c'e'
     nessuna chiave per statuto. Non e' una svista.
     ===================================================================== */
  if(disco || testi.size){
    let buone = testi.size > 0;
    for(let i = 0; i < testi.size && buone; i++){
      /* TUTTE E DUE LE TESTIMONIANZE, E I TIRI SENZA BUCHI: ogni tiro da
         0 a N-1 deve avere la propria e quella dell'altro. */
      if(testi.get(i) !== 3) buone = false;
    }
    if(!buone) return no('INCOMPLETO','testimonianze-assenti');
  }`;

/* ===================================================================== */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-147-testimonianze.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');

for (const [cerca, metti, nome] of [[A1, B1, 'serializza'], [A2, B2, 'deserializza'],
                                    [A3, B3, 'carta-identita'], [A4, B4, 'giudice']]) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('TOPPA NON APPLICATA: ancora «' + nome + '» trovata ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}
for (const [k, q] of [["',14,'", 1], ["',15,'", 1], ['Reg.scrivi(15,', 1],
                      ["'testimonianze-assenti'", 1], ['tipo === 14', 2], ['tipo === 15', 2]]) {
  const n = t.split(k).length - 1;
  if (n !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare ' + n + ' volte (ne servono ' + q + ')'); process.exit(1); }
}
fs.writeFileSync(usc, t);
console.log('toppa applicata: le testimonianze nel nastro e nel giudizio, ' + ing + ' -> ' + usc);
