/* =====================================================================
   _toppa-160-atlanti.js — RIMETTE GLI ATLANTI NUOVI in un gioco che ha
   GIA' gli sprite (voce #160, 2 novembre 2026).

   PERCHE' ESISTE. La toppa del #158 innesta il modulo Sprite3D e i sei
   blocchi base64 sostituendo delle ANCORE nel gioco di prima degli sprite;
   su un gioco che li ha gia' le ancore non ci sono piu' («l'ancora compare
   0 volte, non 1: non scrivo niente»), e rilanciarla dalla base del 25/9
   butterebbe via tutte le cure venute dopo (#159 compresa). Quando cambiano
   SOLO i fogli — oggi tre: scivolata distesa, camminata larga, fermo a
   braccia staccate — bastano quattro sostituzioni, e questa toppa fa solo
   quelle:
     1. `const TAV={...};`   la tavola delle celle dell'atlante in pianta
     2. `TAV2={...};`        la tavola dell'atlante da vicino (192)
     3. `SORG_PELLE=[...];`  il colore sorgente della pelle misurato da atlante.py
     4. i sei blocchi <script type="text/plain" id="sprite-*"> in fondo
   Ogni marcatore deve comparire UNA volta sola, altrimenti non scrive.
   Il modulo (il programma) non si tocca: se un giorno cambia sprite3d.js,
   la via resta quella del #158 dalla sua base, e poi questa per i byte.

   USO:  node strumenti/_toppa-160-atlanti.js --da CALCETTO-il-gioco.html --out fuori/160/CALCETTO-fogli.html
         node strumenti/_toppa-160-atlanti.js --dentro CALCETTO-il-gioco.html
         [--atlante fuori/sprite/atlante] [--atlante2 fuori/sprite/atlante192]
   ===================================================================== */
const fs = require('fs'), path = require('path');
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : null; };
const DA = pren('--da') || pren('--dentro') || 'CALCETTO-il-gioco.html';
const A = pren('--out') || pren('--dentro') || DA;
const ATL = pren('--atlante') || 'fuori/sprite/atlante';
const ATL2 = pren('--atlante2') || 'fuori/sprite/atlante192';

const uri = (p, tipo) => 'data:' + tipo + ';base64,' + fs.readFileSync(p).toString('base64');
const immagine = (cart, nome) => {
  const w = path.join(cart, nome + '.webp'), p = path.join(cart, nome + '.png');
  if (fs.existsSync(w)) return uri(w, 'image/webp');
  if (fs.existsSync(p)) return uri(p, 'image/png');
  console.error('FALLITO: manca ' + w + ' (e ' + p + ')'); process.exit(1);
};
const tavola = (cart) => JSON.stringify(JSON.parse(fs.readFileSync(path.join(cart, 'atlante.json'), 'utf8')));

let testo = fs.readFileSync(DA, 'utf8');
const prima = testo.length;
let n = 0;
function una(nome, re, nuovo) {
  const m = testo.match(re);
  const quante = m ? testo.split(re).length - 1 : 0;
  if (quante !== 1) { console.error('FALLITO [' + nome + ']: il marcatore compare ' + quante + ' volte, non 1. Non scrivo niente.'); process.exit(1); }
  testo = testo.replace(re, () => nuovo);
  n++;
}

const tav = tavola(ATL), tav2 = tavola(ATL2);
const pelle = JSON.stringify(JSON.parse(tav).sorg_pelle || [203, 158, 133]);
una('TAV', /^  const TAV=\{[^\n]*?\};/m, '  const TAV=' + tav + ';');
una('TAV2', /^  const TAV2=\{[^\n]*?\};/m, '  const TAV2=' + tav2 + ';');
una('SORG_PELLE', /^  const SORG_PELLE=\[[^\]\n]*\];/m, '  const SORG_PELLE=' + pelle + ';');
const blocchi = [['src', ATL, 'atlante'], ['m', ATL, 'atlante-m'], ['k', ATL, 'atlante-k'],
                 ['src2', ATL2, 'atlante'], ['m2', ATL2, 'atlante-m'], ['k2', ATL2, 'atlante-k']];
for (const [id, cart, nome] of blocchi) {
  const re = new RegExp('<script type="text/plain" id="sprite-' + id + '">[^<]*</script>');
  una('blocco sprite-' + id, re, '<script type="text/plain" id="sprite-' + id + '">' + immagine(cart, nome) + '</scr' + 'ipt>');
}

const dest = path.resolve(A);
fs.writeFileSync(dest, testo);
console.log('toppa #160 applicata: ' + n + ' sostituzioni (2 tavole, la pelle ' + pelle + ', 6 blocchi)');
console.log('  da:   ' + DA + ' (' + prima + ' byte)');
console.log('  a:    ' + dest + ' (' + testo.length + ' byte, ' + ((testo.length - prima) / 1024).toFixed(1) + ' kB)');
