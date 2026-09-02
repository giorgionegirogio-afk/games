/* =====================================================================
   _t-difesa-ferma.js — IN DIFESA LA FACCIA NON MENTE (voce #88, compito 5)

   LA DIAGNOSI: entro il raggio di calcio (KICK_R*1,4) puoTirare(t)
   tornava sempre vero, qualunque fosse il padrone del pallone: solo
   OLTRE quel raggio la funzione controlla di chi e' il pallone; sotto
   la soglia cade dritta nel «return true» finale, senza guardia. Un
   avversario inseguito da vicino faceva quindi sfarfallare il disco
   grande fra TIRA e CONTRASTA a ogni variazione minima di distanza
   attorno a KICK_R*1,4 — i due lati della stessa frontiera rispondevano
   cose diverse alla stessa domanda «e' mio?»: misurato il 1 settembre
   2026, sonda a 1/60, 4-6 cambi di faccia in 6 secondi di inseguimento,
   tutti fra 33,4 e 36,9 unita' — mentre la squadra dell'ultimo tocco,
   in quello stesso intervallo, non cambiava MAI (_q-volo.js prova B).

   LA CURA STA SOLO NEL RAMO ENTRO IL RAGGIO (dal titolo del compito):
   il ramo OLTRE KICK_R*1,4 resta intatto — e' lui che porta la
   rovesciata (finestraRovesciata, precedenza sua) e la palla nostra in
   volo raggiungibile; toccarlo rompe la prova F (misurato: la prima
   stesura di questa cura metteva la guardia PRIMA dell'intero
   if-oltre-il-raggio, e una rovesciata che arriva da un pallone
   toccato per ultimo dagli avversari — il caso normale, e' spesso una
   respinta loro — smetteva di aprirsi: F passava da OK a NO). La
   guardia nuova si aggiunge dopo, appena prima del «return true» che
   chiudeva la funzione: se il pallone non e' al piede del comandato
   (owner!==pi, quindi si e' gia' uscito vivi dal ramo lontano) e la
   squadra del pallone (squadraDelPallone, funzione pura, voce #82) e'
   quella avversaria (1-t), il tiro non e' offerto — il verbo torna il
   contrasto, che e' quello vero, e i due lati della frontiera dicono
   adesso la stessa cosa.

   IL PREZZO, dichiarato e misurato: la guardia si attiva anche ENTRO
   il raggio di calcio, dove prima — pallone avversario vicino — TIRA
   restava offerto e premerlo strappava via il pallone (la
   «punta-rubata»). _p-contrasto20.js misura le scivolate riuscite su
   20 gesti, prima e dopo, in due lanci ciascuno (il banco usa dita
   vere, non ripete al bit): il rapporto nel file di verbale accanto
   dice i quattro numeri e l'intervallo prima/dopo.

   LEGGE DEI SORTEGGI: squadraDelPallone non chiama dado() e non scrive
   un bit; resta un confronto puro fra letture di campo.

   uso:  node strumenti/_t-difesa-ferma.js --out fuori/difesa-ferma.html
         node strumenti/_t-difesa-ferma.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/difesa-ferma.html'));

const ANCORE = [

/* 1 — puoTirare: niente TIRA sulla palla degli avversari, entro il
   raggio di calcio (il ramo OLTRE il raggio — rovesciata compresa —
   resta intatto: toccarlo rompe la prova F, vedi intestazione) */
{
  nome: '1/1 puoTirare: niente TIRA sulla palla degli avversari (entro il raggio)',
  cerca:
`    return squadraDelPallone()===t &&
           len(G.ball.x-p.x,G.ball.y-p.y) <= P_SPEED*TIRO_PORTATA &&
           inCorsa;
  }
  return true;
}`,
  metti:
`    return squadraDelPallone()===t &&
           len(G.ball.x-p.x,G.ball.y-p.y) <= P_SPEED*TIRO_PORTATA &&
           inCorsa;
  }
  /* IN DIFESA LA FACCIA NON MENTE (voce #88): entro il raggio di calcio,
     se il pallone e' degli AVVERSARI il verbo e' il contrasto, non il
     tiro. Misurato il 1 settembre 2026: inseguendo un portatore la
     faccia cambiava piu' volte in sei secondi, tutte fra 33,4 e 36,9
     unita' (la frontiera di KICK_R*1,4), mentre la squadra dell'ultimo
     tocco non cambiava MAI. Qui, e non prima dell'if-oltre-il-raggio,
     perche' quel ramo porta la rovesciata: una guardia messa prima
     blocca anche il caso normale — pallone toccato per ultimo dagli
     avversari, in volo verso di noi — e la prova F si spegne.
     IL PREZZO, dichiarato: si perde la punta-rubata — premere TIRA su
     un pallone avversario vicino e strapparlo via. Misurato con
     _p-contrasto20 prima e dopo: se i furti calano, la cura si aggiusta. */
  if(G.ball.owner!==pi && squadraDelPallone()===(1-t)) return false;
  return true;
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
  ['squadraDelPallone()===(1-t)) return false;', 1],
  ['IN DIFESA LA FACCIA NON MENTE', 1],
  ['voce #88', 5],   // le 4 gia' in casa (compito 2/3) piu' questa
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
