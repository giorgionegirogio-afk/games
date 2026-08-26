/* =====================================================================
   _t-cronometro.js — IL CRONOMETRO CONOSCE IL CAMPO (26 agosto 2026).

   LA SCOPERTA, ed e' l'unica cosa importante di questa toppa: l'11
   contro 11 non aveva un difetto di intelligenza. Aveva un difetto di
   OROLOGIO.

   Il cancello --tre-taglie chiede che le partite finite 0-0 nel tempo
   regolamentare stiano sotto il 33% a 11 contro 11. Su cento partite a
   semi fissi il gioco spedito ne fa il 50%, ed e' rosso da mesi. Sei
   cure di intelligenza sono state provate e bocciate una dopo l'altra,
   tutte con la misura, tutte per lo stesso motivo:

     tetto della zona di tiro a 600      0-0 73%   (_t-undici-fisica.js)
     punta a 500 unita' dalla porta      0-0 50%   (_t-undici-fisica.js)
     slancio dell'attacco in KAVANTI     0-0 53%   (_t-avanti.js)
     la punta attacca la ribattuta       0-0 55%   (_t-ribattuta.js)
     la corsa in area accesa a undici    tiri -2,25 su 7,31 (attaccaArea)
     la voglia di tirare per distanza    0-0 64-66% (_t-carica.js E/F/G)

   Sei bocciature con lo stesso profilo — i tiri calano e i gol seguono —
   non sono sei errori: sono un indizio. E l'indizio dice che la squadra
   non ha nessun modo di arrivare davanti alla porta piu' spesso di
   cosi', perche' il campo a 11 e' largo 2300 unita' contro le 1150 del
   5 contro 5, e le gambe sono le stesse (P_SPEED = 168 unita' al secondo
   su tutte e tre le taglie — ed e' giusto: sono gambe umane, e
   l'attraversata a 11 costa 13,7 secondi contro 6,8, che e' esattamente
   il rapporto fra un campo da calcio vero e un campo da calcio a 5).

   In novanta secondi, su un campo largo il doppio, ci stanno la meta'
   delle azioni. Chiedere lo stesso numero di gol allo stesso cronometro
   era la domanda sbagliata, e ogni cura misurata contro quella domanda
   era condannata prima di partire.

   LA PROVA, prima di qualunque riga di codice: cento partite a 11 contro
   11 col gioco SPEDITO, semi 20260803..20260902, cambiando solo la
   durata — che e' gia' un'impostazione del menu (SAVE.durata offre 90,
   120 o 180 secondi):

                            0-0    gol    tiri   precisione VERA
     90 secondi (oggi)      0,50   0,65   11,3        7%
     180 secondi            0,25   1,26   14,7        9%

   Il cancello passa — 25% contro il 33% ammesso — col gioco vergine, e
   i gol AL MINUTO sono identici (0,43 contro 0,42): non e' il gioco che
   cambia, e' la domanda che finalmente e' la sua.

   LA CURA, una funzione e tre chiamate. La durata scelta nel menu vale
   per il 5 contro 5, e le taglie grandi scalano il cronometro col campo,
   esattamente come TIRO_ATTR scala l'attrito e come KPASSO scala le
   distanze. Con la scelta di serie (90):

     5 contro 5    FW 1150    90 secondi     IDENTICO AL BIT
     7 contro 7    FW 1610   126 secondi
     11 contro 11  FW 2300   180 secondi

   e i tre numeri che escono dal conto sono, a due secondi di distanza,
   i tre numeri che il menu gia' offriva da solo. Non e' una coincidenza
   fortunata: chi ha scritto quel menu aveva in mente la stessa cosa, e
   non l'aveva collegata alla taglia.

   COSA NON CAMBIA: la scelta dell'utente resta sovrana (chi vuole 180 a
   5 contro 5 li ha, e a 11 ne avra' 360); il 5 contro 5 e' identico al
   bit su tutte le misure; il minuto scritto accanto al gol e l'ora della
   sera leggono la stessa funzione, quindi la mezz'ora di gioco cade
   sempre a meta' partita qualunque sia la taglia.

   Cancello:  node strumenti/_q-meta.js --tre-taglie
   Misura:    node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803

   uso:  node strumenti/_t-cronometro.js --out fuori/crono.html
         node strumenti/_t-cronometro.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const ANCORE = [

/* 1 — la funzione nasce accanto alla costante che sostituisce */
{
  nome: '1/5 durataPartita() dichiarata accanto a MATCH_SEC',
  cerca: `const MATCH_SEC = 90;`,
  metti:
`const MATCH_SEC = 90;
/* =====================================================================
   IL CRONOMETRO CONOSCE IL CAMPO (26 agosto 2026).

   Novanta secondi su un campo da 1150 unita' e novanta secondi su un
   campo da 2300 non sono la stessa partita: le gambe sono le stesse
   (P_SPEED, e deve restare cosi' — sono gambe umane), quindi
   l'attraversata costa 6,8 secondi a 5 contro 5 e 13,7 a 11, e in un
   tempo uguale ci stanno la meta' delle azioni. Misurato su cento
   partite a semi fissi col gioco spedito: a 90 secondi l'11 contro 11
   finisce 0-0 nel 50% dei casi, a 180 nel 25% — e i gol AL MINUTO sono
   gli stessi (0,43 contro 0,42). Non era un difetto del gioco: era la
   domanda posta al cronometro sbagliato.

   La durata scelta nel menu vale per il 5 contro 5. Le altre due taglie
   la scalano col campo, come TIRO_ATTR scala l'attrito e KPASSO le
   distanze. Con la scelta di serie escono 90, 126 e 180 secondi, che
   sono — a due secondi — i tre valori che il menu gia' offriva.
   ===================================================================== */
function durataPartita(){
  return Math.round((SAVE.durata || MATCH_SEC) * FW / 1150);
}`,
},

/* 2 — il cronometro della partita */
{
  nome: '2/5 startMatch carica il cronometro giusto',
  cerca: `  G.score=[0,0]; G.timeLeft=(SAVE.durata||MATCH_SEC); G.golden=false;`,
  metti: `  G.score=[0,0]; G.timeLeft=durataPartita(); G.golden=false;`,
},

/* 3 — il minuto scritto accanto al gol */
{
  nome: '3/5 il minuto del gol si conta sulla durata vera',
  cerca: `    const tot = (SAVE.durata||MATCH_SEC);
    G.goalMin = G.golden ? 'SUPPL.' : fmtTime(Math.max(0, tot-G.timeLeft));`,
  metti: `    const tot = durataPartita();
    G.goalMin = G.golden ? 'SUPPL.' : fmtTime(Math.max(0, tot-G.timeLeft));`,
},

/* 4 — l'ora della sera, che e' una frazione di partita */
{
  nome: '4/5 l\'ora della sera legge la stessa durata',
  cerca: `  const tot=(SAVE.durata||MATCH_SEC);
  if(!(tot>0)) return 0.35;`,
  metti: `  const tot=durataPartita();
  if(!(tot>0)) return 0.35;`,
},

/* 5 — il menu dice la verita' su cosa sta scegliendo */
{
  nome: '5/5 il menu dichiara i tre tempi delle tre taglie',
  cerca: `  $('btnSetTempo').innerHTML='DURATA PARTITA: '+SAVE.durata+'″ <small>90, 120 o 180 secondi</small>';`,
  metti:
`  /* LA VOCE DICE COSA SI STA SCEGLIENDO DAVVERO. Il numero del menu e' il
     tempo del 5 contro 5: sul campo a 7 e su quello a 11 il cronometro
     scala col campo (vedi durataPartita), e una voce che dicesse solo
     «90 secondi» mentirebbe a chi gioca a undici. I due numeri accanto
     sono contati, non scritti a mano. */
  $('btnSetTempo').innerHTML='DURATA PARTITA: '+SAVE.durata+'″ <small>a 7 contro 7 '+
    Math.round(SAVE.durata*1610/1150)+'″, a 11 contro 11 '+Math.round(SAVE.durata*2300/1150)+'″ — il campo e\\' piu\\' grande</small>';`,
},

/* 6 — anche il testo di partenza, quello scritto nel documento, dice la stessa
       cosa: refreshImpostUI lo riscrive al primo disegno del pannello, ma fino
       a quel momento e' lui che si legge, e diceva la versione di ieri */
{
  nome: '6/6 il testo di partenza del pulsante non mente piu\'',
  cerca: `<button class="voce" id="btnSetTempo">DURATA PARTITA: 90&Prime; <small>90, 120 o 180 secondi</small></button>`,
  metti: `<button class="voce" id="btnSetTempo">DURATA PARTITA: 90&Prime; <small>90, 120 o 180 secondi &mdash; a 7 e a 11 il campo &egrave; pi&ugrave; grande</small></button>`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-cronometro.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.crono.html';
outFile = path.resolve(RADICE, outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

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
  ['function durataPartita(){', 1],
  ['G.timeLeft=durataPartita();', 1],
  ['(SAVE.durata||MATCH_SEC)', 0],
  ['const tot = durataPartita();', 1],
  ['const tot=durataPartita();', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
