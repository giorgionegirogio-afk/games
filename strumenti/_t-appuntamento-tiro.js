/* =====================================================================
   _t-appuntamento-tiro.js — L'APPUNTAMENTO DEL TIRO AL VOLO (voce #88,
   compito 9)

   LA DIAGNOSI (misurata da fuori/_p-a10.js, scena: cross a 7 contro 7,
   seme 88001, comandato in fascia, compagno in area — la stessa di
   _q-volo.js prova A). Dopo i compiti 2, 3 e 6 la prova A e' all'82%
   (46/56 fotogrammi): i dieci fotogrammi mancanti sono i numeri 17-26, e
   in tutti e dieci lo stato e' identico nella sostanza — il comando E'
   GIA' passato al destinatario dichiarato del cross (ctrl===dest, la
   cura del compito 6 funziona), la palla e' nostra e in volo verso di
   lui (crossTo>=0, z e vz positivi), il corpo e' sano (slide/rec/rove a
   riposo), e il disco offre CONTRASTA perche' la distanza (304,7 -> 205,7
   unita' nei dieci fotogrammi) resta sempre sopra la soglia geometrica
   P_SPEED*TIRO_PORTATA = 201,6, per un soffio alla fine.

   LA CAUSA: puoTirare guarda DOVE STA LA PALLA ADESSO invece di guardare
   A CHI E' DESTINATA — la stessa confusione fra geometria e possesso
   della voce #88, sopravvissuta in forma piu' sottile perche' il
   compito 2 aveva sostituito una soglia geometrica (il raggio di calcio)
   con un'altra soglia geometrica piu' larga, non con una domanda sul
   possesso.

   LA CURA: se il comandato E' il destinatario dichiarato (G.ball.crossTo
   o, in mancanza, G.ball.passTo) di una palla nostra in volo, TIRA si
   offre SENZA guardare la distanza. Per chiunque altro — un terzo uomo
   che non aspetta quel pallone — la soglia di distanza resta com'era: e'
   la guardia che il compito 2 ha messo per una ragione buona (non far
   tirare da lontano un pallone diretto a un compagno), e questa cura non
   la tocca.

   LA DOMANDA DEL RILASCIO A VUOTO (misurata da fuori/_p-rilascio-vuoto.js
   PRIMA di questa cura): se il dito preme TIRA quando il pallone e' a
   trecento unita' e lo rilascia prima che arrivi, che cosa succede OGGI?
   Niente di male, per costruzione — e non per questa cura, che non tocca
   il percorso del rilascio. releaseCharge chiude sempre la carica
   (chiudiAnticipo) prima di provare a calciare, e sia fireShotMirato che
   fireShot rifiutano il calcio (stessa guardia KICK_R*1.4 di sempre) se
   il pallone e' ancora fuori portata: nessun tiro fantasma, nessun
   cambio di possesso, nessuna carica che resta appesa. Misurato: velocita'
   della palla bit-per-bit identica prima e dopo il rilascio, statistiche
   dei tiri invariate, p.charge<0 dopo. Poiche' questa cura allarga SOLO
   il cancello che APRE la carica (puoTirare), non il percorso che la
   CHIUDE, la risposta resta la stessa dopo la cura: e' quello che la
   prova nuova del banco (_q-volo.js) dimostra sapendo condannare.

   LEGGE DEI SORTEGGI: ne' squadraDelPallone() ne' il confronto
   G.players[dest]===p chiamano dado(); zero sorteggi nuovi.

   uso:  node strumenti/_t-appuntamento-tiro.js --out fuori/appuntamento-tiro.html
         node strumenti/_t-appuntamento-tiro.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/appuntamento-tiro.html'));

const ANCORE = [

/* 1 — puoTirare: il destinatario dichiarato non aspetta la soglia di distanza */
{
  nome: '1/1 puoTirare: atteso scavalca la soglia di distanza',
  cerca:
`    const inCorsa = (G.ball.passTo>=0 || G.ball.crossTo>=0 || G.ball.z>0 || G.ball.vz>0);
    return squadraDelPallone()===t &&
           len(G.ball.x-p.x,G.ball.y-p.y) <= P_SPEED*TIRO_PORTATA &&
           inCorsa;
  }`,
  metti:
`    const inCorsa = (G.ball.passTo>=0 || G.ball.crossTo>=0 || G.ball.z>0 || G.ball.vz>0);
    /* L'APPUNTAMENTO DEL TIRO AL VOLO (voce #88, compito 9, 2 settembre
       2026). Fino a oggi qui contava SOLO la distanza: P_SPEED*TIRO_PORTATA
       (201,6) bastava per un terzo uomo qualunque, ma negava il tiro al
       destinatario dichiarato del cross appena il pallone superava quella
       soglia. Misurato sulla stessa scena del cross a 7 contro 7 (seme
       88001, fuori/_p-a10.js): nei fotogrammi 17-26 il comando era GIA'
       del destinatario (ctrl===dest, la cura del compito 6 funziona), la
       palla era nostra e in volo verso di lui, e la distanza scendeva da
       304,7 a 205,7 — sempre sopra 201,6, per un soffio alla fine. Dieci
       fotogrammi su 56 (82%), sempre la stessa causa: il gioco guardava
       DOVE STA LA PALLA ADESSO invece di A CHI E' DESTINATA.
       Chi e' il destinatario dichiarato sta gia' andando all'appuntamento:
       la soglia di distanza, che resta per chiunque altro (un terzo uomo
       che non aspetta quel pallone), non deve chiedergli di aspettare che
       il pallone sia a due passi per potersi preparare al volo. */
    const dest = G.ball.crossTo>=0 ? G.ball.crossTo : G.ball.passTo;
    const atteso = dest>=0 && G.players[dest]===p;
    return squadraDelPallone()===t && inCorsa &&
           (atteso || len(G.ball.x-p.x,G.ball.y-p.y) <= P_SPEED*TIRO_PORTATA);
  }`,
},

];

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}
const attesi = [
  ['const dest = G.ball.crossTo>=0 ? G.ball.crossTo : G.ball.passTo;', 1],
  ['const atteso = dest>=0 && G.players[dest]===p;', 1],
  /* la vecchia forma a due righe (senza inCorsa in AND diretto col resto)
     deve essere sparita: se e' ancora presente l'ancoraggio ha sostituito
     nel posto sbagliato o due volte */
  ['return squadraDelPallone()===t &&\n           len(G.ball.x-p.x,G.ball.y-p.y) <= P_SPEED*TIRO_PORTATA &&\n           inCorsa;', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
