/* =====================================================================
   _toppa-giudice-schermo.js — IL SESTO CANALE, CHIUSO PER QUANTO SI PUO'
   (voce #133, compito 3).

   IL DIFETTO, trovato misurando (vedi la lettera di testa di
   strumenti/_t-giudice-schermo.js per tutti i numeri): il nastro
   registra i tocchi in COORDINATE DI SCHERMO, e dove finisce un tocco lo
   decidono touchBtnLayout e SCALE/OX/OY, che derivano tutti da
   innerWidth/innerHeight. Lo stesso nastro rigiocato su uno schermo
   diverso e' un'altra partita — misurato, 800x360 contro 915x412: 0-3
   dove il tabellone dice 3-4. E c'e' gia' in produzione: il replay fra
   due telefoni di schermo diverso diverge e il gioco scrive «La squadra
   di chi ti ha attaccato e' cambiata da allora». L'innocente accusato,
   la stessa frase che il cantiere #132 ha tolto di mezzo cinque volte.

   LA CURA, in cinque ancore, e NON e' la cura definitiva:
     1. serializza — la riga di tipo 10 viaggia;
     2. deserializza — e si rilegge;
     3. Sfida.gioca — la scrive, accanto alle due rose;
     4. giudica — su uno schermo diverso si RIFIUTA (INCOMPLETO, causa
        `schermo-diverso`) e dichiara quale schermo serve;
     5. chiudiSfida — il replay di produzione continua a mostrare il film
        ma, quando il punteggio non torna, da' la CAUSA VERA.

   PERCHE' IL REPLAY NON SI RIFIUTA COME FA IL GIUDICE: rifiutarlo
   vorrebbe dire spegnere la funzione per quasi tutti, perche' in
   produzione due telefoni con lo STESSO schermo sono l'eccezione. Il
   giudice invece puo' permetterselo: chi lo chiama legge dal nastro la
   misura che serve, apre il browser di quella misura, e giudica davvero.

   LA CURA DEFINITIVA — registrare i tocchi in coordinate che non
   dipendono dallo schermo — e' un cantiere suo, ed e' dichiarata
   seguito.

   uso:  node strumenti/_toppa-giudice-schermo.js --out fuori/x.html
         node strumenti/_toppa-giudice-schermo.js --dentro
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
const outFile = dentro ? inFile : path.resolve(RADICE, arg('out', 'fuori/gioco-giudice-schermo.html'));

/* ---------------------------------------------------- ancora 1 */
const A1 = `      } else if(tipo === 7){`;
const B1 = `      } else if(tipo === 10){
        /* LO SCHERMO DI CHI HA REGISTRATO (voce #133, compito 3). Due
           numeri, una volta sola, scritti accanto alle due rose. Il
           nastro porta i tocchi in coordinate di SCHERMO e dove finisce
           un tocco lo decidono touchBtnLayout e SCALE/OX/OY, che vengono
           da innerWidth/innerHeight: senza questa riga chi rilegge non
           ha modo di sapere che sta guardando un'altra partita. In
           rilettura non fa niente (esegui non ha un ramo per il 10). */
        pezzi.push(dT + ',10,' + dMs + ',' + (r[3]|0) + ',' + (r[4]|0));
      } else if(tipo === 7){`;

/* ---------------------------------------------------- ancora 2 */
const A2 = `      else if(tipo === 9)   this.righe.push([tick, 9, ms]);`;
const B2 = A2 + `
      else if(tipo === 10)  this.righe.push([tick, 10, ms, v[3], v[4]]);`;

/* ---------------------------------------------------- ancora 3 */
const A3 = `    Reg.scrivi(7, [mentMia, mentSua].concat(impaccaRosa(SAVE.rosa), impaccaRosa(a.rosa), [iCarSua]));`;
const B3 = A3 + `
    /* =====================================================================
       E LO SCHERMO SU CUI SI STA PER GIOCARE (voce #133, compito 3).

       Il nastro registra i tocchi in coordinate di SCHERMO. Dove finisce
       un tocco lo decidono touchBtnLayout (i pulsanti virtuali) e
       SCALE/OX/OY (la conversione schermo -> campo), e tutti e tre
       derivano da innerWidth/innerHeight (grep «function resize»). Lo
       stesso tocco a (841, 342) preme il disco grande su uno schermo
       915x412 e non preme NIENTE su uno 800x360, dove quel punto e'
       fuori dalla finestra.

       MISURATO (strumenti/_t-giudice-schermo.js, e le due sonde citate
       nella sua lettera di testa): stesso nastro, partita dichiarata
       3-4; a 915x413, 916x412, 930x412 e 915x430 torna 3-4, a 844x390 e
       a 800x360 finisce 0-3, a 1024x460 finisce 1-3. Non e' una lama:
       quindici pixel non spostano niente, settanta spostano tutto.

       Una riga in piu' di due numeri, e chi rilegge puo' dire la causa
       vera invece di dare la colpa alla rosa cresciuta di un altro.
       ===================================================================== */
    Reg.scrivi(10, [innerWidth|0, innerHeight|0]);`;

/* ---------------------------------------------------- ancora 4 */
const A4 = `  const carDif = dati[p2.fine];`;
const B4 = A4 + `
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
     giudica davvero. Un nastro senza la riga di tipo 10 e' di prima di
     questa cura: non si puo' sapere, quindi non si controlla, e vale
     quello che valeva ieri. */
  const sc = schermoDelNastro();
  if(sc && (sc[0] !== (innerWidth|0) || sc[1] !== (innerHeight|0)))
    return fermo('INCOMPLETO','schermo-diverso', { schermo:sc });`;

/* ---------------------------------------------------- ancora 5 */
const A5 = `const TETTI_GIUDIZIO = { 5: 18000, 7: 21000, 11: 27000 };`;
const B5 = `/* LO SCHERMO SCRITTO NEL NASTRO APPENA LETTO (voce #133, compito 3), o
   null se quel nastro e' di prima della cura. Lo leggono in due: il
   giudice, che su uno schermo diverso si rifiuta, e chiudiSfida, che
   sullo stesso scarto sceglie quale causa dire. Una funzione sola
   perche' i due capi devono guardare la stessa cosa. */
function schermoDelNastro(){
  try{
    for(const r of Reg.righe) if(r[1] === 10) return [r[3]|0, r[4]|0];
  }catch(e){}
  return null;
}
` + A5;

/* ---------------------------------------------------- ancora 6 */
const A6 = `    if(S.atteso && (S.atteso[0] !== ga || S.atteso[1] !== gd)){
      toast('fischietto','NON ERA QUESTA LA PARTITA',
            'Rigiocata finisce ' + ga + '-' + gd + ', ma quella vera era ' + S.atteso[0] + '-' + S.atteso[1] + '.');
      try{
        Sfida.stato('Il replay non ha ricostruito la partita: è finito ' + ga + '-' + gd +
                    ' e quella vera era ' + S.atteso[0] + '-' + S.atteso[1] + '. La squadra di chi ti ha ' +
                    'attaccato è cambiata da allora, e il server ne tiene una copia sola, quella di oggi.', true);
      }catch(e){}
    }`;
const B6 = `    if(S.atteso && (S.atteso[0] !== ga || S.atteso[1] !== gd)){
      /* =====================================================================
         DUE CAUSE, E SI DICE QUELLA VERA (voce #133, compito 3).

         Fino a oggi qui c'era una causa sola — «la squadra di chi ti ha
         attaccato e' cambiata da allora» — e veniva detta SEMPRE. Ma il
         nastro porta i tocchi in coordinate di SCHERMO (grep «E LO
         SCHERMO SU CUI SI STA PER GIOCARE»), e su uno schermo diverso
         quegli stessi numeri premono altro: misurato, 800x360 contro
         915x412 da' 0-3 dove il tabellone dice 3-4, e la rosa non
         c'entra niente.
         In produzione due telefoni con lo stesso schermo sono
         l'ECCEZIONE, quindi la causa detta finora era quasi sempre
         quella sbagliata. E' la stessa colpa attribuita alla cosa
         sbagliata che il cantiere #132 ha tolto di mezzo cinque volte.

         IL FILM SI MOSTRA LO STESSO, a differenza dei quattro rifiuti di
         Sfida.guarda: rifiutare ogni replay fra schermi diversi
         vorrebbe dire spegnere la funzione per quasi tutti. Il GIUDICE
         invece si rifiuta, e puo' permetterselo perche' chi lo chiama
         puo' riaprire il browser della misura giusta.
         ===================================================================== */
      const scN = schermoDelNastro();
      const altroSchermo = !!(scN && (scN[0] !== (innerWidth|0) || scN[1] !== (innerHeight|0)));
      toast('fischietto','NON ERA QUESTA LA PARTITA',
            'Rigiocata finisce ' + ga + '-' + gd + ', ma quella vera era ' + S.atteso[0] + '-' + S.atteso[1] + '.');
      try{
        Sfida.stato(altroSchermo
          ? ('Il replay non ha ricostruito la partita: è finito ' + ga + '-' + gd +
             ' e quella vera era ' + S.atteso[0] + '-' + S.atteso[1] + '. È stata giocata su uno schermo di ' +
             scN[0] + 'x' + scN[1] + ' e il tuo è di ' + (innerWidth|0) + 'x' + (innerHeight|0) +
             ': i comandi sono gli stessi, ma su uno schermo diverso finiscono in un altro punto del campo.')
          : ('Il replay non ha ricostruito la partita: è finito ' + ga + '-' + gd +
             ' e quella vera era ' + S.atteso[0] + '-' + S.atteso[1] + '. La squadra di chi ti ha ' +
             'attaccato è cambiata da allora, e il server ne tiene una copia sola, quella di oggi.'), true);
      }catch(e){}
    }`;

/* ------------------------------------------------------------------ */
const src = fs.readFileSync(inFile, 'utf8');
const ancore = [[A1, B1, 'Reg.serializza'], [A2, B2, 'Reg.deserializza'],
                [A3, B3, 'Sfida.gioca'], [A4, B4, 'giudica'],
                [A5, B5, 'schermoDelNastro'], [A6, B6, 'chiudiSfida']];
let out = src;
for (const [a, b, nome] of ancore) {
  const n = out.split(a).length - 1;
  if (n !== 1) { console.error('FALLITO: l\'ancora «' + nome + '» non si trova esattamente una volta (trovata ' + n + ').'); process.exit(1); }
  out = out.replace(a, b);
}
const attesi = [
  ["pezzi.push(dT + ',10,' + dMs + ',' + (r[3]|0) + ',' + (r[4]|0));", 1],
  ['else if(tipo === 10)  this.righe.push([tick, 10, ms, v[3], v[4]]);', 1],
  ['Reg.scrivi(10, [innerWidth|0, innerHeight|0]);', 1],
  ["return fermo('INCOMPLETO','schermo-diverso', { schermo:sc });", 1],
  ['function schermoDelNastro(){', 1],
  ['const scN = schermoDelNastro();', 1],
  /* quel che NON deve essere cambiato */
  ['const MOTORE_V = 2;', 1],
  ["Reg.scrivi(7, [mentMia, mentSua]", 1],
  ['attaccato è cambiata da allora, e il server ne tiene una copia sola, quella di oggi.', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il sesto canale e\' chiuso: sei ancore, +' + (out.length - src.length) + ' byte');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_t-giudice-schermo.js' + (dentro ? '' : ' --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/')));
