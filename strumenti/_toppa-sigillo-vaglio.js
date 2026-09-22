/* =====================================================================
   _toppa-sigillo-vaglio.js — UNA PORTA SOLA PER I NOVE CONTROLLI
   (voce #134, compito 2a).

   IL DIFETTO, ed e' di struttura e non di comportamento: i nove
   controlli che decidono se un nastro basta a rifare una partita stanno
   scritti DUE VOLTE — dentro `giudica` (voce #133) e dentro
   `Sfida.guarda` (dove sono nati, fra la voce #107 e la #133). Finche'
   l'unica cosa che ne usciva era un film, la doppia scrittura costava
   solo manutenzione. Da oggi ne esce anche un VERDETTO SCRITTO IN
   LISTA, e allora costa molto di piu': i due elenchi NON sono identici
   — `Sfida.guarda` ripiega sul profilo di oggi dove `giudica` si
   rifiuta, e dello schermo non sa niente — quindi la riga della lista
   direbbe «non torna» esattamente dove il lavoratore differito direbbe
   «incompleto». Il gioco si contraddirebbe da solo, e non in teoria: lo
   schermo diverso in produzione e' la regola, non l'eccezione.

   LA CURA: i controlli escono da `giudica` e diventano `vagliaNastro()`.
   Le due funzioni la chiamano tutte e due; che cosa se ne fanno resta
   diverso, ed e' giusto che lo resti:

     causa              giudica          Sfida.guarda
     motore-diverso     si ferma         non mostra il film
     nastro-vuoto       si ferma         non mostra il film
     nastro-troncato    si ferma         non mostra il film
     duello-marchiato   si ferma         non mostra il film
     rose-assenti       si ferma         MOSTRA il film (profilo di oggi)
     carattere-assente  si ferma         MOSTRA il film
     schermo-ignoto     si ferma         MOSTRA il film
     schermo-diverso    si ferma         MOSTRA il film

   «Un film approssimato costa niente; un verdetto approssimato costa
   punti a qualcuno» — e' il commento del giudice, e questa toppa lo
   rende una regola sola invece di due elenchi che si somigliano.

   QUESTA TOPPA NON CAMBIA UN COMPORTAMENTO. Stessi rifiuti, stessi
   messaggi, stessi film, stesse rose: la rete che lo prova e'
   `_q-giudice.js` 21 su 21, che i nove esiti li verifica uno per uno, e
   `_q-sfida.js` 54 su 54, che il film lo guarda davvero.

   uso:  node strumenti/_toppa-sigillo-vaglio.js --out fuori/x.html
         node strumenti/_toppa-sigillo-vaglio.js --dentro
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
const outFile = dentro ? inFile : path.resolve(RADICE, arg('out', 'fuori/gioco-sigillo-vaglio.html'));

/* =============================================== 1) il vaglio nasce */
const A1 = `const Giudizio = { attivo:false, divagata:false };

function giudica(nastro, atteso, opz){`;
const B1 = `const Giudizio = { attivo:false, divagata:false };

/* =====================================================================
   IL VAGLIO — I NOVE CONTROLLI SUL NASTRO, IN UN POSTO SOLO
   (voce #134, compito 2).

   Si chiama col registro GIA' deserializzato (\`righe\` e' quel che
   \`Reg.deserializza\` ha restituito) e non tocca niente: non spegne il
   registro, non avvia partite, non scrive da nessuna parte. Legge e
   riferisce.

   CHI LA CHIAMA E' DUE, e sono due capi diversi dello stesso problema:
   \`giudica\` la usa per decidere se puo' dare un verdetto, \`Sfida.guarda\`
   per decidere se puo' mostrare un film. Le due risposte non coincidono
   — un film approssimato costa niente, un verdetto approssimato costa
   punti a qualcuno — ma LA DOMANDA DEVE ESSERE LA STESSA, se no la riga
   della lista dice «non torna» dove il verificatore direbbe «non lo so».

   L'ORDINE DEI RIFIUTI NON E' UN GUSTO: il piu' SPECIFICO vince, cosi'
   la causa che esce e' quella vera. E l'oggetto che torna porta SEMPRE
   quel che e' riuscito a leggere (le rose, le posture, il carattere),
   anche quando si rifiuta: \`Sfida.guarda\` mostra il film con le rose del
   nastro perfino sugli schermi diversi, ed e' l'unico modo di non
   spegnere il replay per quasi tutti.
   ===================================================================== */
function vagliaNastro(righe){
  const motoreV = Reg.motoreV|0;
  const out = { verdetto:'', causa:'', motoreV:motoreV, righe:righe,
                dati:null, mentAtt:undefined, mentDif:undefined,
                rosaAtt:null, rosaDif:null, carDif:undefined, schermo:null };
  const no = (verdetto, causa) => { out.verdetto = verdetto; out.causa = causa; return out; };
  if(motoreV !== MOTORE_V) return no('ALTRO MOTORE','motore-diverso');
  if(righe === 0) return no('INCOMPLETO','nastro-vuoto');
  if(Reg.troncato) return no('INCOMPLETO','nastro-troncato');
  let marchio = false, dati = null;
  for(const r of Reg.righe){
    if(r[1] === 5) marchio = true;
    else if(r[1] === 7 && !dati) dati = r;
  }
  /* il marchio di tipo 5 e' il segno dei nastri scritti PRIMA della voce
     #131: quelli il duello non ce l'hanno davvero */
  if(marchio) return no('INCOMPLETO','duello-marchiato');
  if(!(dati && dati.length > 6)) return no('INCOMPLETO','rose-assenti');
  /* I NOMI NON SI PASSANO (il terzo argomento resta null): nel nastro non
     ci sono, e spaccaRosa li sa fare da se'. Un nome non muove una
     partita — lo dice il commento accanto a spaccaRosa. Chi vuole i nomi
     sulle maglie (Sfida.guarda, che mostra un film) rifa' le due rose
     col profilo di oggi: e' cosmetica, e la partita non la sposta. */
  const p1 = spaccaRosa(dati, 5, null);
  const p2 = spaccaRosa(dati, p1.fine, null);
  out.dati = dati;
  out.mentAtt = mentValida(dati[3]); out.mentDif = mentValida(dati[4]);
  out.rosaAtt = p1.rosa; out.rosaDif = p2.rosa;
  if(!(p1.rosa.length >= 4 && p2.rosa.length >= 4)) return no('INCOMPLETO','rose-assenti');
  /* L'INDICE DI CARATTERE, IN CODA (voce #132, compito 2). Se non c'e',
     il nastro e' di prima di quella cura e startMatch ricadrebbe sul
     NOME dell'avversario — che nel nastro non c'e' e che chi difende puo'
     cambiare quando vuole. Sfida.guarda accetta quel ripiego perche'
     mostra un film; il giudice no, perche' toglie punti. */
  if(dati.length <= p2.fine) return no('INCOMPLETO','carattere-assente');
  out.carDif = dati[p2.fine];
  /* =====================================================================
     E LO SCHERMO DEVE ESSERE QUELLO (voce #133, compito 3).

     E' il SESTO canale, e non passa dai sorteggi (quello lo ha chiuso la
     voce #129 spostando la cosmetica su DECO): passa dai PIXEL. Il
     nastro porta i tocchi in coordinate di schermo, e su uno schermo
     diverso gli stessi numeri premono altro — o non premono niente.

     IL GIUDICE SI RIFIUTA, e non e' una resa: e' l'unico modo di non
     accusare un innocente per colpa di una finestra. E si rifiuta
     DICENDO QUALE SCHERMO SERVE, cosi' chi lo chiama — il verificatore
     differito, che apre il browser da se' — lo riapre di quella misura e
     giudica davvero.

     SE LO SCHERMO E' IGNOTO, NON SI PROCEDE (correzione di revisione,
     voce #133, IMPORTANTE-1). Un nastro senza riga di tipo 10 e' di
     prima di quella cura, o costruito apposta senza: in ogni caso non
     si puo' sapere se le stesse coordinate premono lo stesso punto del
     campo, e procedere «alla cieca» produce accuse false in una sola
     direzione (misurato: NON TORNA su schermi diversi, mai su quello
     giusto). Astenersi non costa niente ai nastri veri, che la riga 10
     ce l'hanno sempre. */
  const sc = schermoDelNastro();
  if(!sc) return no('INCOMPLETO','schermo-ignoto');
  out.schermo = sc;
  if(sc[0] !== (innerWidth|0) || sc[1] !== (innerHeight|0)) return no('INCOMPLETO','schermo-diverso');
  return out;
}

function giudica(nastro, atteso, opz){`;

/* ============================================ 2) giudica lo adopera */
const A2 = `  const motoreV = Reg.motoreV|0;
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
  const carDif = dati[p2.fine];`;
const B2 = `  /* IL VAGLIO, CHE E' QUELLO DI Sfida.guarda: una porta sola (voce
     #134, compito 2). Il giudice si ferma su TUTTI e nove i rifiuti,
     perche' un verdetto approssimato costa punti a qualcuno. */
  const vag = vagliaNastro(righe);
  const motoreV = vag.motoreV;
  if(vag.verdetto){
    Reg.spegni();
    return dico(vag.verdetto, vag.causa, Object.assign({ motoreV:motoreV, righe:righe },
                vag.causa === 'schermo-diverso' ? { schermo:vag.schermo } : {}));
  }
  const mentAtt = vag.mentAtt, mentDif = vag.mentDif, carDif = vag.carDif;
  const rosaAtt = vag.rosaAtt, rosaDif = vag.rosaDif;`;

/* fra il blocco di sopra e startMatch c'era ancora il pezzo dello
   schermo: se ne va tutto, perche' adesso sta nel vaglio */
const A3 = `  /* =====================================================================
     E LO SCHERMO DEVE ESSERE QUELLO (voce #133, compito 3).

     E' il SESTO canale, e non passa dai sorteggi (quello lo ha chiuso la
     voce #129 spostando la cosmetica su DECO): passa dai PIXEL. Il
     nastro porta i tocchi in coordinate di schermo, e su uno schermo
     diverso gli stessi numeri premono altro — o non premono niente.

     IL GIUDICE SI RIFIUTA, e non e' una resa: e' l'unico modo di non
     accusare un innocente per colpa di una finestra. E si rifiuta
     DICENDO QUALE SCHERMO SERVE, cosi' chi lo chiama — il verificatore
     differito, che apre il browser da se' — lo riapre di quella misura e
     giudica davvero. Un nastro senza la riga di tipo 10 e' di prima di
     questa cura: non si puo' sapere, quindi non si controlla, e vale
     quello che valeva ieri. */
  const sc = schermoDelNastro();
  /* SE LO SCHERMO E' IGNOTO, NON SI PROCEDE (correzione di revisione,
     voce #133, IMPORTANTE-1). Un nastro senza riga di tipo 10 e' di
     prima di questa cura, o costruito apposta senza: in ogni caso non
     si puo' sapere se le stesse coordinate premono lo stesso punto del
     campo, e procedere «alla cieca» produce accuse false in una sola
     direzione (misurato: NON TORNA su schermi diversi, mai su quello
     giusto). Astenersi non costa niente ai nastri veri, che la riga 10
     ce l'hanno sempre. */
  if(!sc) return fermo('INCOMPLETO','schermo-ignoto');
  if(sc[0] !== (innerWidth|0) || sc[1] !== (innerHeight|0))
    return fermo('INCOMPLETO','schermo-diverso', { schermo:sc });

  /* ------------------------------------------------ si rigioca */`;
const B3 = `  /* ------------------------------------------------ si rigioca */`;

const A4 = `             ment:mentAtt, rosa:p1.rosa },`;
const B4 = `             ment:mentAtt, rosa:rosaAtt },`;
const A5 = `             ment:mentDif, car:carDif, rosa:p2.rosa },`;
const B5 = `             ment:mentDif, car:carDif, rosa:rosaDif },`;

/* ======================================== 3) Sfida.guarda lo adopera */
const A6 = `    if(righe < 0){
      Reg.spegni();
      this.stato('Il nastro di questa partita non si riesce ad aprire: è di una forma che questo gioco non sa leggere.', true);
      return;
    }`;
const B6 = `    if(righe < 0){
      Reg.spegni();
      this.stato('Il nastro di questa partita non si riesce ad aprire: è di una forma che questo gioco non sa leggere.', true);
      return;
    }
    /* IL VAGLIO, LO STESSO DEL GIUDICE (voce #134, compito 2). I quattro
       rifiuti qui sotto sono quelli di sempre, con le parole di sempre:
       cambia soltanto che adesso la domanda la fa una funzione sola, e
       che la causa ha un nome che il verificatore differito conosce. */
    const vag = vagliaNastro(righe);`;

const A7 = `    if(Reg.motoreV !== MOTORE_V){`;
const B7 = `    if(vag.causa === 'motore-diverso'){`;
const A8 = `    if(Reg.righe.length === 0){`;
const B8 = `    if(vag.causa === 'nastro-vuoto'){`;
const A9 = `    if(Reg.troncato){`;
const B9 = `    if(vag.causa === 'nastro-troncato'){`;
const A10 = `    let incompleto = false, dati = null;
    for(const r of Reg.righe){
      if(r[1] === 5) incompleto = true;
      else if(r[1] === 7 && !dati) dati = r;
    }
    if(incompleto){`;
const B10 = `    if(vag.causa === 'duello-marchiato'){`;

const A11 = `    let mentAtt, mentDif, rosaAtt, rosaDif, carDif;
    if(dati && dati.length > 6){
      mentAtt = mentValida(dati[3]); mentDif = mentValida(dati[4]);
      const p1 = spaccaRosa(dati, 5, att.rosa);
      const p2 = spaccaRosa(dati, p1.fine, nomiDif);
      rosaAtt = p1.rosa; rosaDif = p2.rosa;
      /* L'INDICE DI CARATTERE, SE IL NASTRO LO PORTA (voce #132,
         compito 2). Un nastro scritto prima di oggi finisce esattamente
         a p2.fine e qui resta undefined: startMatch ricade sul nome, che
         e' quello che ha sempre fatto. */
      if(dati.length > p2.fine) carDif = dati[p2.fine];
    }`;
const B11 = `    let mentAtt, mentDif, rosaAtt, rosaDif, carDif;
    if(vag.dati){
      mentAtt = vag.mentAtt; mentDif = vag.mentDif;
      /* LE DUE ROSE SI RIFANNO QUI COI NOMI. Il vaglio le legge senza —
         un nome non muove una partita — ma questo e' un FILM, e un film
         con le maglie senza nome e' un film mezzo spento. Gli attributi
         sono gli stessi, vengono dallo stesso nastro. */
      const p1 = spaccaRosa(vag.dati, 5, att.rosa);
      const p2 = spaccaRosa(vag.dati, p1.fine, nomiDif);
      rosaAtt = p1.rosa; rosaDif = p2.rosa;
      /* L'INDICE DI CARATTERE, SE IL NASTRO LO PORTA (voce #132,
         compito 2). Un nastro scritto prima di oggi finisce esattamente
         a p2.fine e il vaglio lo lascia undefined: startMatch ricade sul
         nome, che e' quello che ha sempre fatto. */
      carDif = vag.carDif;
    }`;

/* ------------------------------------------------------------------ */
const src = fs.readFileSync(inFile, 'utf8');
const coppie = [[A1, B1], [A2, B2], [A3, B3], [A4, B4], [A5, B5],
                [A6, B6], [A7, B7], [A8, B8], [A9, B9], [A10, B10], [A11, B11]];
const guai = [];
coppie.forEach(([a], i) => {
  const n = src.split(a).length - 1;
  if (n !== 1) guai.push('ancora ' + (i + 1) + ': trovata ' + n + ' volte invece di 1');
});
if (guai.length) { console.error('FALLITO:\n  ' + guai.join('\n  ')); process.exit(1); }

let out = src;
for (const [a, b] of coppie) out = out.replace(a, b);

const attesi = [
  ['function vagliaNastro(righe){', 1],
  ['const vag = vagliaNastro(righe);', 2],          /* giudica e Sfida.guarda */
  ["if(vag.causa === 'motore-diverso'){", 1],
  ["if(vag.causa === 'nastro-vuoto'){", 1],
  ["if(vag.causa === 'nastro-troncato'){", 1],
  ["if(vag.causa === 'duello-marchiato'){", 1],
  ['fermo(', 0],                                    /* il vecchio aiutante se n\'e\' andato */
  ["no('INCOMPLETO','schermo-ignoto')", 1],
  ["no('INCOMPLETO','schermo-diverso')", 1],
  ['const MOTORE_V = 2;', 1],                       /* quel che NON deve cambiare */
  ['function schermoDelNastro(){', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  i nove controlli hanno una porta sola: undici ancore, ' +
            (out.length - src.length >= 0 ? '+' : '') + (out.length - src.length) + ' byte');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_q-giudice.js' + (dentro ? '' : ' --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/')));
