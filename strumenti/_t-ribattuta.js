/* =====================================================================
   _t-ribattuta.js — LA RIBATTUTA HA UN PADRONE (23 agosto 2026).

   LA DIAGNOSI. A 11 contro 11 il cancello --tre-taglie e' rosso: 40%
   di 0-0 contro il 33% ammesso (8 tiri e 1 gol in mediana). La catena
   delle parate spiega dove muore l'azione: il portiere BLOCCA tutto
   cio' che arriva sotto le 330 unita'/s (tentaPresa) — e i tiri q=0 e
   q=2 arrivano per progetto a 230 e 210 — mentre sopra le 330
   RESPINGE corto (177-310 unita' di corsa), apposta perche' esista la
   ribattuta. Ma a 11 la ribattuta non ha nessuno che la raccolga: il
   tiro parte da 650-900 unita' (vola 1,6-2,2 s), gli smarcati sono
   rimasti indietro col portatore, i liberi col pallone di nessuno
   rientrano tutti in copertura, e la punta — l'unico uomo davanti —
   sta di stazione a FW*0,30 = 690 unita' dalla porta e NON SI MUOVE
   nemmeno mentre il tiro della sua squadra e' in volo. La respinta
   cade a 180-310 dalla porta in un'area piena di difensori e vuota
   di attaccanti.

   LA CURA, UN SOLO RAMO: mentre vola un tiro della sua squadra
   (b.tiroT e' l'etichetta che fireShot mette al pallone e che
   QUALUNQUE altro calcio azzera — la stessa che addGoal e tentaPresa
   leggono per lo specchio), la punta smette di stare di stazione e
   attacca il bordo dell'area. Con 2 secondi di volo copre ~330
   unita': sulla respinta e' l'uomo piu' vicino, e la caccia al
   pallone libero fa il resto. Non e' la «punta a 500» gia' bocciata:
   quella toglieva un uomo alla manovra PER TUTTA LA PARTITA (0-0 al
   50%); qui la corsa parte quando la manovra e' GIA' finita — il
   pallone e' in volo verso la porta — e finisce con l'etichetta.

   PERIMETRO: il ruolo 'punta' nasce solo da taglia 7 in su
   (assegnaRuoli: TAGLIA>=7), quindi il 5 contro 5 e' identico al bit
   per costruzione. Zero sorteggi nuovi: il seme scorre come prima.

   Cancello: strumenti/_q-meta.js --tre-taglie (gia' ROSSO sull'11:
   40% contro 33%).

   -------------------------------------------------------------------
   NOTA DI BOCCIATURA, 23 AGOSTO 2026 — L'ATTACCO CHE SCALA COL CAMPO
   (strumenti/_t-avanti.js) E' STATO PROVATO E BOCCIATO CON LA MISURA.
   L'idea: lo slancio dello smarcato e della chiamata scalava con
   kPasso (1,3 a 11) su un campo che raddoppia, quindi portarlo in
   frazione di campo (KAVANTI = FW/1150: 340 unita' a 11 invece di
   221). Identico al bit a 5v5. Misurato su 30 partite a seme fisso
   per taglia: l'11 PEGGIORA dal 40% al 53% di 0-0, il 7 dal 20% al
   37%; le decisioni del portatore calano da 952 a 709 e i tiri da 63
   a 47 (8 partite, _misura-undici). La ragione: il rischio di un
   passaggio cresce con la lunghezza piu' in fretta del campo
   guadagnato — l'appoggio lungo attraversa piu' linee, e il compagno
   piu' lontano lascia il portatore pressato senza lo scarico corto.
   Non riprovarla senza numeri nuovi.
   -------------------------------------------------------------------

   uso:  node strumenti/_t-ribattuta.js --out fuori/ribattuta.html
         node strumenti/_t-ribattuta.js --dentro
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

/* 1 — la punta attacca la respinta */
{
  nome: '1/1 la punta attacca la porta mentre il tiro vola',
  cerca:
`    }else if(mioRuolo==='punta'){
      /* NON RIENTRA. Stazione fissa in frazione di campo — cosi' vale
         uguale a 7 e a 11 — e altezza che segue il pallone a meta'
         strada, perche' l'appoggio in profondita' abbia un bersaglio dal
         lato giusto senza che la punta insegua la palla. */
      p.aiTX = opGoalX===FW ? FW*PUNTA_X : FW*(1-PUNTA_X);
      p.aiTY = clamp(FH/2 + (b.y-FH/2)*0.45, 60, FH-60);`,
  metti:
`    }else if(mioRuolo==='punta'){
      /* LA RIBATTUTA HA UN PADRONE (23 ago 2026), E SOLO LA CANNONATA
         NE HA UNA. Mentre un tiro della sua squadra e' in volo
         (b.tiroT: la mette fireShot, la azzera qualunque altro calcio)
         la punta attacca il bordo dell'area — ma SOLO se il pallone si
         presentera' sopra le 330 unita'/s, perche' sotto quella soglia
         tentaPresa BLOCCA e la ribattuta non esiste: la prima stesura
         correva su ogni tiro, la punta perdeva la stazione su ogni
         PRESA, e trenta partite hanno detto 50% di 0-0 invece di 40.
         Il residuo si legge con la stessa aritmetica del portiere
         (TIRO_ATTR, lineare nello spazio). La respinta cade a 180-310
         dalla porta, corta apposta; con 2 s di volo la punta copre
         ~330 unita' ed e' l'uomo piu' vicino alla palla vagante.
         Quando l'etichetta muore, torna alla stazione da sola. */
      let ribatti=false;
      if(b.tiroT===p.team && b.owner<0){
        const spT=len(b.vx,b.vy);
        const residT=spT - TIRO_ATTR*(Math.abs(b.x-opGoalX)*spT/Math.max(60,Math.abs(b.vx)));
        ribatti = spT>=330 && residT>=300;
      }
      if(ribatti){
        p.aiTX = opGoalX===FW ? FW-GK_AREA_X-40 : GK_AREA_X+40;
        p.aiTY = clamp(FH/2 + (b.y-FH/2)*0.35, GY0-30, GY1+30);
      }else{
      /* NON RIENTRA. Stazione fissa in frazione di campo — cosi' vale
         uguale a 7 e a 11 — e altezza che segue il pallone a meta'
         strada, perche' l'appoggio in profondita' abbia un bersaglio dal
         lato giusto senza che la punta insegua la palla. */
      p.aiTX = opGoalX===FW ? FW*PUNTA_X : FW*(1-PUNTA_X);
      p.aiTY = clamp(FH/2 + (b.y-FH/2)*0.45, 60, FH-60);
      }`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-ribattuta.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.ribattuta.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) {
  console.error('FALLITO: --out coincide con --in.');
  process.exit(2);
}

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}
const attesi = [
  ['ribatti = spT>=330 && residT>=300;', 1],
  ['FW-GK_AREA_X-40', 1],
  ['FW*PUNTA_X', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
