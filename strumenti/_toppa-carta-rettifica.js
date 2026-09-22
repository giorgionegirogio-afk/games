/* =====================================================================
   _toppa-carta-rettifica.js — LA MISURA CONTRADDICE IL COMMENTO
   (voce #135, compito 3).

   IL DIFETTO NON E' NEL CODICE, E' IN QUEL CHE IL CODICE DICE DI SE'.
   Il compito 2 ha scritto, accanto a `CARTA_TAGLIE`, la ragione per cui
   la sfida di carta si gioca solo a cinque: «a sette setupPlayers
   completa la squadra di casa coi rincalzi di quartiere, che sono
   uomini piatti sparsi da formaSquadre sul loro NOME, e quei nomi
   escono da rosaAvversaria che legge SAVE.rosa: due telefoni con rose
   diverse schiererebbero due squadre diverse».

   MISURATO al compito 3 (`_q-carta`, prova C5, due pagine con rose
   diverse, stessa apertura a sette): NON E' VERO. I quattordici uomini
   scendono in campo con gli STESSI numeri — zero differenze su
   quattordici — e la partita finisce uguale: stesso punteggio, stessi
   sorteggi, stesse posizioni a ogni campione. Cambia UN nome su
   quattordici.

   Il limite resta [5], e la misura gli lascia in piedi la ragione vera,
   che e' un'altra: a sette e a undici IL CODICE NON DESCRIVE TUTTA LA
   SQUADRA. Questa toppa non cambia una riga di comportamento: sostituisce
   una spiegazione smentita con quella che la misura regge, a edizioni —
   il testo vecchio resta citato, con la data e la fonte accanto. Una
   ragione sbagliata scritta accanto a una scelta giusta manda il
   prossimo a cercare nel posto sbagliato.

   uso:  node strumenti/_toppa-carta-rettifica.js --out fuori/x.html
         node strumenti/_toppa-carta-rettifica.js --dentro
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
const outFile = dentro ? inFile : path.resolve(RADICE, arg('out', 'fuori/gioco-carta-rettifica.html'));

const A = `/* LA SFIDA DI CARTA SI GIOCA A CINQUE, e il formato porta la taglia
   lo stesso perche' domani possa aprirsi senza cambiare formato.
   PERCHE' SOLO CINQUE: la rosa del gioco e' da cinque (nuovaRosa), e a
   sette o a undici setupPlayers completa la squadra di casa con i
   «rincalzi di quartiere», che sono uomini PIATTI — quattro numeri
   uguali fra loro — e formaSquadre li sparge usando il loro NOME come
   asse. Quei nomi escono da rosaAvversaria, che legge SAVE.rosa: due
   telefoni con rose diverse schiererebbero due squadre diverse. A
   cinque non c'e' nessun rincalzo e il canale non esiste. */`;

const B = `/* LA SFIDA DI CARTA SI GIOCA A CINQUE, e il formato porta la taglia
   lo stesso perche' domani possa aprirsi senza cambiare formato.

   PERCHE' SOLO CINQUE — RETTIFICA A EDIZIONI (22 settembre 2026, voce
   #135, compito 3; fonte: strumenti/_q-carta.js, prova C5).

   IL TESTO DI IERI diceva: «a sette o a undici setupPlayers completa la
   squadra di casa coi rincalzi di quartiere, che sono uomini PIATTI e
   formaSquadre li sparge usando il loro NOME; quei nomi escono da
   rosaAvversaria, che legge SAVE.rosa: due telefoni con rose diverse
   schiererebbero due squadre diverse».

   MISURATO, ed e' FALSO. Due pagine con rose diverse, stessa apertura a
   sette, stesso seme: i quattordici uomini scendono in campo con gli
   STESSI numeri — zero differenze su quattordici — e la partita finisce
   uguale, punteggio, sorteggi e posizioni a ogni campione. Cambia UN
   nome su quattordici.

   LA RAGIONE VERA, quella che la misura lascia in piedi: a sette e a
   undici IL CODICE NON DESCRIVE TUTTA LA SQUADRA. La rosa del gioco e'
   da cinque (nuovaRosa), quindi a sette due uomini su sette e a undici
   sei su undici li ricostruisce il telefono — attributi dalla media
   della rosa, nome pescato evitando i cognomi di casa, cioe' da un dato
   locale. A cinque il codice descrive OGNI uomo che scende in campo, e
   infatti fra due telefoni non cambia nemmeno un nome di titolare
   (prova C1b: 28 nomi diversi su 240, tutti rincalzi entrati dalla
   panchina a partita in corso).

   Una sfida in cui meta' della squadra non sta nel codice non e' la
   stessa sfida: e' la stessa partita con un'altra formazione scritta
   sul foglio. */`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(A).length - 1;
if (n !== 1) { console.error('FALLITO: ancora trovata ' + n + ' volte invece di 1'); process.exit(1); }
const out = src.replace(A, B);
const attesi = [
  ['RETTIFICA A EDIZIONI (22 settembre 2026, voce', 1],
  ['const CARTA_TAGLIE = [5];', 1],
  /* NIENTE COMPORTAMENTO SI MUOVE: e' un commento, e queste quattro
     righe sono la garanzia che lo sia */
  ['function impaccaCarta(o){', 1],
  ['function spaccaCarta(testo){', 1],
  ['function apriCarta(o, daBattere){', 1],
  ['const MOTORE_V = 2;', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
/* e la prova che e' SOLO un commento: fuori dai commenti il file non
   cambia di un carattere */
const senzaCommenti = t => t.replace(/\/\*[\s\S]*?\*\//g, ' ');
if (senzaCommenti(src) !== senzaCommenti(out)) rotti.push('LA TOPPA HA TOCCATO DEL CODICE, non solo un commento');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  la ragione del limite a cinque e\' quella che la misura regge (rettifica a edizioni)');
console.log('    da   ' + inFile + '  (' + src.length + ' caratteri)');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri, ' + (out.length - src.length) + ')');
console.log('    fuori dai commenti il file e\' identico: nessun comportamento si muove');
