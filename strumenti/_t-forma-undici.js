/* =====================================================================
   _t-forma-undici.js — LA FORMA DELL'11: IL CAMPO PRENDE I SUOI 68 METRI
   (voce #86, compito 3, ramo voce-86-proporzioni).

   IL PERCHE'. TAGLIE[11].FH vale 1120 da sempre: un rapporto d'aspetto
   2,05 identico alle taglie 5 e 7, MAI misurato contro un campo vero.
   Il campo IFAB 105x68 m, alla scala 21,90 u/m gia' scelta per FW
   (2300 = 105*21,90), vuole FH = 68*21,90 = 1489,5 -> 1490. Da qui in
   avanti il rapporto d'aspetto NON e' piu' 2,05 su tutte le taglie: a
   11 diventa 1,5436 (2300/1490), a un soffio dal vero IFAB 1,5441
   (105/68) — scarto -0,03%. 5 e 7 restano 2,05 al bit: questo compito
   tocca SOLO la riga di FH:1120 e i commenti che la descrivono, mai la
   riga 5 o la riga 7.

   QUESTO E' IL PRIMO COMPITO DELLA VOCE #86 CHE DIVERGE PER COSTRUZIONE
   (dichiarato dalla tavola dei bersagli del piano, riga "3 (forma
   dell'11)"): a 5 e 7 il confronto due-versioni deve restare a ZERO
   partite divergenti (FH non cambia, nessun altro numero cambia); a 11
   DIVERGE, perche' ogni posizione che dipende da FH (modulo in
   frazioni fy, kTetto della camera, k0 della minimappa, POSTI, GY0/GY1,
   la gabbia FW/FH) si ricalcola su un campo piu' alto — e la stessa
   sequenza di sorteggi CPU produce quindi una partita diversa fin dal
   primo fotogramma, senza che sia cambiata una sola chiamata a dado().

   VERIFICATO PRIMA DI SCRIVERE QUESTO ATTREZZO, perche' fy e kTetto sono
   "consumati" da questo compito e non toccati nel codice:
     - il modulo dell'11 e' in frazioni fy di FH (formation(), riga
       "FH/2 + FH*m.fy*M.largo]);"): il fy piu' largo e' ±0,36, la
       mentalita' ATTACCO lo allarga fino a ±0,36*1,14=±0,4104 di FH.
       Con FH=1490 il piazzamento piu' estremo arriva a 1490*0,4104=611
       unita' dal centro, cioe' y fra 134 e 1356: dentro [0,1490] con
       margine, nessuna clamp mai raggiunta.
     - kTetto (updateCamera, "grep -n kTetto") e' gia' parametrico su
       FW*FH: kTetto = sqrt((1150*560)/(FW*FH)). A 11, oggi (FH 1120)
       vale sqrt(644000/2576000)=0,500 (il numero che il commento sopra
       Z_BORDO gia' documenta); con FH 1490 diventa
       sqrt(644000/3427000)=0,4335 (-13,3%): il tetto di zoom
       proporzionale sull'11 si abbassa un altro poco, perche' il campo
       e' ancora piu' grande. NESSUNA riga di codice tocca kTetto: la
       formula legge FW/FH che setTaglia ha gia' aggiornato.

   I DUE COMMENTI RETTIFICATI (stile edizioni: il fatto nuovo accanto,
   non la cancellazione della storia):
     1. il commento di testa delle taglie ("Rapporto d'aspetto 2.05
        INVARIATO su tutte") diventa falso per l'11 e va detto in
        chiaro, con la data e i due numeri (1,5436 vs 1,5441 vero).
     2. il commento sopra k0 in drawMinimappa diceva "sull'11 si vede
        ~1/4 di campo" — una stima a occhio, mai misurata, e sbagliava
        per eccesso anche PRIMA di questo compito. Misurato dal vivo con
        Playwright (fuori/_misura-minimappa-11.js, formula del brief:
        (VW/S2)/FW x (VH/S2)/FH allo zoom di riposo S2_BASE_DEV — lo
        stesso zRiposo che updateCamera calcola per l'inquadratura del
        menu — su telefono 915x412): PRIMA di questo compito (FH 1120)
        l'11 mostrava il 9,4% del campo (~1/11), non un quarto; DOPO
        (FH 1490) il 7,0% (~1/14) — ANCORA MENO, perche' il campo e'
        piu' alto e lo schermo non e' cambiato. Il fattore k0=1,35 non
        si tocca: nessuna misura dice che non basta piu', e la regola di
        casa vieta il ritocco al buio — lo giudichera' chi rivede questo
        compito, con lo stesso numero sotto gli occhi.

   LEGGE DEI SORTEGGI: zero chiamate nuove a dado(). Le uniche righe
   toccate sono un letterale (FH:1120->1490) e tre commenti: nessuna
   riga eseguibile nuova, nessuna funzione nuova.

   uso:  node strumenti/_t-forma-undici.js --out fuori/forma-undici.html
         node strumenti/_t-forma-undici.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/forma-undici.html'));

const ANCORE = [

/* 1 — TAGLIE[11].FH: 1120 -> 1490 (68 m IFAB alla scala 21,90 u/m gia'
   scelta per FW). Riga isolata: 5 e 7 non compaiono in questa stringa,
   quindi non possono essere toccate per sbaglio. */
{
  nome: '1/3 TAGLIE[11].FH 1120->1490 (68 m IFAB)',
  cerca:
`  11:{ FW:2300, FH:1120, GOAL_H:196, kPasso:1.3,  nome:'11 CONTRO 11',`,
  metti:
`  11:{ FW:2300, FH:1490, GOAL_H:196, kPasso:1.3,  nome:'11 CONTRO 11',`,
},

/* 2 — il commento di testa delle taglie: "2.05 INVARIATO su tutte" era
   vero fino a qui. La frase seguente ("La porta cresce MENO del
   campo...") resta intatta: parla di GOAL_H, che questo compito non
   tocca. */
{
  nome: '2/3 rettifica: il rapporto 2.05 non e\' piu\' su tutte',
  cerca:
`   Rapporto d'aspetto 2.05 INVARIATO su tutte: minimappa e taratura
   camera restano vere senza ritocchi.`,
  metti:
`   RETTIFICA (voce #86, compito 3, 6 settembre 2026): "INVARIATO su
   tutte" era vero fino a qui. Restano 2,05 le taglie 5 e 7; l'11 passa
   da FH:1120 a FH:1490 per prendere i 68 m veri del campo IFAB
   (105x68 m), e il suo rapporto scende a 1,5436 (2300/1490) contro il
   vero 1,5441 (105/68): scarto -0,03%. Minimappa (k0 in drawMinimappa)
   e camera (kTetto in updateCamera) leggono FW/FH a ogni fotogramma:
   restano vere SENZA UN SOLO RITOCCO anche sull'11 — verificato e
   misurato in questo compito, non solo promesso (vedi i commenti
   accanto a k0 e a kTetto).`,
},

/* 3 — il commento sopra k0 in drawMinimappa: "~1/4 di campo" era una
   stima, non una misura. La riga di codice (k0 = ...) resta intatta:
   nessuna misura dice che 1,35 non basta piu'. */
{
  nome: '3/3 rettifica: quanto campo si vede sull\'11, misurato',
  cerca:
`  /* sull'11 contro 11 si vede ~1/4 di campo: la bussola c'e' sempre (la
     quota 0,92 non scatta mai) ed e' l'unico orientamento, quindi il
     fattore grande vale anche sotto i 700px */`,
  metti:
`  /* RETTIFICA (voce #86, compito 3, 6 settembre 2026): "~1/4 di campo"
     non era una misura, era una stima a occhio — e sbagliava per
     eccesso gia' PRIMA di questo compito. Misurato dal vivo con
     Playwright (fuori/_misura-minimappa-11.js), formula del brief
     (VW/S2)/FW x (VH/S2)/FH allo zoom di riposo (S2_BASE_DEV, lo
     stesso zRiposo che updateCamera calcola per il menu), su telefono
     915x412: PRIMA di questo compito (FH 1120) l'11 mostrava il 9,4%
     del campo (~1/11); DOPO (FH 1490, i 68 m IFAB) ne mostra il 7,0%
     (~1/14) — ANCORA MENO, perche' il campo e' piu' alto e lo schermo
     non e' cambiato. La bussola resta quindi necessaria almeno quanto
     prima: la quota 0,92 non scatta mai e l'unico orientamento resta
     questo, quindi il fattore grande vale anche sotto i 700px. Il
     fattore k0=1,35 non si tocca qui: nessuna misura dice che non
     basta piu'. */`,
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
/* CONTEGGI A DELTA (come negli altri attrezzi della voce #86): il file
   arriva qui con i compiti 1-2 gia' dentro. */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  [`FH:1490, GOAL_H:196, kPasso:1.3,  nome:'11 CONTRO 11',`, 1],
  ['RETTIFICA (voce #86, compito 3, 6 settembre 2026): "INVARIATO su', 1],
  ['RETTIFICA (voce #86, compito 3, 6 settembre 2026): "~1/4 di campo"', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
