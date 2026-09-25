/* =====================================================================
   _155-inchiostro.js — QUANTO INCHIOSTRO E' CAMBIATO FRA DUE FOGLI.

   La giuria della voce #155 ha misurato il giro 1 cosi': «foglio-sagoma-40
   misurato, 6,46% dell'inchiostro cambiato, 93,5% identico». E' la
   domanda giusta e nessuno strumento la faceva: qui si fa. Due PNG con
   lo stesso impaginato, stesso conto.

   USO:  node strumenti/_155-inchiostro.js A.png B.png
   ===================================================================== */
const fs = require('fs'), zlib = require('zlib');
function leggiPNG(p){
  const b = fs.readFileSync(p);
  let i = 8, w=0, h=0, bit=0, col=0, dati=[];
  while (i < b.length) {
    const len = b.readUInt32BE(i), tipo = b.toString('ascii', i+4, i+8);
    if (tipo === 'IHDR') { w=b.readUInt32BE(i+8); h=b.readUInt32BE(i+12); bit=b[i+16]; col=b[i+17]; }
    else if (tipo === 'IDAT') dati.push(b.slice(i+8, i+8+len));
    i += 12 + len;
  }
  if (bit !== 8) throw new Error('solo 8 bit per canale: ' + p);
  const canali = col===6?4:col===2?3:col===0?1:col===4?2:0;
  if (!canali) throw new Error('tavolozza non gestita: ' + p);
  const raw = zlib.inflateSync(Buffer.concat(dati));
  const bpp = canali, riga = w*bpp;
  const out = Buffer.alloc(w*h*bpp);
  let o = 0, p0 = 0;
  for (let y=0; y<h; y++) {
    const f = raw[p0++];
    for (let x=0; x<riga; x++) {
      const a = x>=bpp ? out[o+x-bpp] : 0;
      const bq = y>0 ? out[o-riga+x] : 0;
      const c = (y>0 && x>=bpp) ? out[o-riga+x-bpp] : 0;
      const v = raw[p0+x];
      let r;
      if (f===0) r=v; else if (f===1) r=v+a; else if (f===2) r=v+bq;
      else if (f===3) r=v+((a+bq)>>1);
      else { const pa=Math.abs(bq-c), pb=Math.abs(a-c), pc=Math.abs(a+bq-2*c);
             r = v + ((pa<=pb&&pa<=pc)?a:(pb<=pc?bq:c)); }
      out[o+x] = r & 255;
    }
    p0 += riga; o += riga;
  }
  return {w,h,bpp,d:out};
}
const A = leggiPNG(process.argv[2]), B = leggiPNG(process.argv[3]);
if (A.w!==B.w || A.h!==B.h) { console.error('i due fogli non hanno la stessa taglia'); process.exit(3); }
/* LA LUMINANZA, NON IL SOLO CANALE ROSSO. La prima stesura guardava il
   primo canale: su un foglio col fondo VERDE (0,102,0) il rosso vale zero
   e tutto il manto finiva contato come inchiostro — il conto usciva 1,6%
   su fasi-frenata, dove meta' dei fotogrammi era cambiata a occhio.
   E su un foglio A COLORI l'inchiostro non e' comunque la domanda: la
   sagoma puo' non muoversi di un pixel mentre il VALORE dentro cambia
   (e' esattamente cio' che fanno la scarpa e la maglia di questo giro).
   Percio' si dichiara di che foglio si tratta, invece di lasciarlo
   indovinare a chi legge. */
const lum = (d,i,bpp) => bpp>=3
  ? (0.2126*d[i*bpp] + 0.7152*d[i*bpp+1] + 0.0722*d[i*bpp+2])
  : d[i*bpp];
let nero=0, neroB=0, cambiati=0, diversi=0, chiari=0;
for (let i=0;i<A.w*A.h;i++){
  const a = lum(A.d,i,A.bpp), b = lum(B.d,i,B.bpp);
  const na = a<128, nb = b<128;
  if (a>200) chiari++;
  if (na) nero++;
  if (nb) neroB++;
  if (na!==nb) cambiati++;
  if (Math.abs(a-b)>8) diversi++;
}
/* una maschera nera su bianco ha piu' di un terzo di tela quasi bianca;
   un foglio a contatto sul manto verde no */
const mascheraNera = chiari > 0.35*A.w*A.h;
console.log('foglio A: ' + process.argv[2]);
console.log('foglio B: ' + process.argv[3]);
console.log('  pixel neri  A ' + nero + '   B ' + neroB + '   (' + ((neroB-nero)/nero*100).toFixed(2) + '%)');
console.log('  INCHIOSTRO CAMBIATO: ' + cambiati + ' px, cioe\' il '
          + (cambiati/Math.max(nero,neroB)*100).toFixed(2) + '% dell\'inchiostro'
          + '  (identico il ' + (100-cambiati/Math.max(nero,neroB)*100).toFixed(2) + '%)');
console.log('  pixel diversi di piu\' di 8 livelli: ' + diversi
          + ' su ' + (A.w*A.h) + ' (' + (diversi/(A.w*A.h)*100).toFixed(2) + '% della tela)');
console.log(mascheraNera
  ? '  (foglio a MASCHERA NERA: vale il conto dell\'INCHIOSTRO qui sopra)'
  : '  (foglio A COLORI: l\'inchiostro qui non vuol dire niente; il numero che vale\n'
  + '   e\' quello dei PIXEL DIVERSI: la sagoma puo\' non muoversi e il valore cambiare)');
