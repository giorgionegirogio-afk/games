/* =====================================================================
   _156-costo.js — IL COSTO DEL DISEGNO DELLE FIGURE, SENZA IL VSYNC IN
   MEZZO.

   PERCHE' ESISTE. prestazione.js misura il FOTOGRAMMA INTERO di una
   partita vera: e' la misura giusta e resta il cancello. Ma il suo
   numero e' agganciato al vsync e al gioco della macchina, e il suo
   stesso referto lo dice — il 25 settembre 2026 il «ballo fra repliche
   dello stesso file» e' uscito 157,8% e poi 298,4%, con i giri che
   scavalcano lo zero e due corse consecutive che danno -8,9% e +7,4%
   sulla stessa coppia di file. Due numeri di segno opposto sulla stessa
   cosa sono un attrezzo che non sta misurando.
   Il criterio C8 della giuria della voce #155 chiede pero' un numero:
   «se la misura non c'e', C8 NON PASSA — prova nulla qui vale come
   bocciatura». E il mandato dice cosa fare quando il banco si dichiara
   cieco: «serve una sonda che non abbia un secondo file di mezzo».

   COSA MISURA, e perche' e' piu' fermo. Il lavoro che questa onda ha
   aggiunto sta TUTTO dentro due cose:
     1. il disegno della figura (Rig3D.disegna) — maniche, manica in
        ombra, larghezze che seguono la corporatura, la testa;
     2. la lettura della quota e dell'impatto per l'ombra
        (Rig3D.quotaAria + Rig3D.impatto), una coppia per figura.
   Qui si misurano quelle due, in un ciclo stretto dentro la pagina:
   22 figure per 60 fotogrammi, ripetuto, e si tiene il MINIMO dei
   campioni (il perche' sta accanto alla riga che lo prende: il rumore,
   su un ciclo di CPU, e' additivo). Niente vsync, niente scheduler del
   gioco, niente rete.
   La CPU e' frenata 4x via CDP, che e' il freno con cui il mandato
   chiede di misurare Android 10.

   APPAIATO, E DENTRO LO STESSO BROWSER. I due file si alternano
   A-B-B-A dentro ogni giro, come fa prestazione.js, cosi' una deriva
   lineare della macchina si cancella nella differenza.

   SI DICHIARA CIECO. Alla fine stampa il ballo fra repliche dello
   STESSO file: se la differenza misurata e' piu' piccola di quel
   numero, il referto lo scrive e non pretende un segno.

   USO (server acceso su 8777):
     node strumenti/_156-costo.js --a fuori/155-g2.html --b fuori/p7.html
     node strumenti/_156-costo.js --a X --b X        (prova di onesta')
   Uscite: 0 ha misurato, 2 il banco non ha aperto un file, 3 prova nulla.
   ===================================================================== */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const PORTA = arg('porta', '8777');
const FA = arg('a', 'fuori/155-g2.html');
const FB = arg('b', 'CALCETTO-il-gioco.html');
const GIRI = parseInt(arg('giri', '6'), 10);
const CAMPIONI = parseInt(arg('campioni', '11'), 10);
const FRENO = parseFloat(arg('freno', '4'));
const RADICE = path.resolve(__dirname, '..');
for (const f of [FA, FB]) if (!fs.existsSync(path.join(RADICE, f))) {
  console.error('PROVA NULLA: il file non esiste: ' + f); process.exit(3);
}

/* il ciclo stretto: 22 figure x 60 fotogrammi, piu' la coppia
   quota/impatto per figura — cioe' esattamente il lavoro per fotogramma
   che questa onda ha toccato */
const MISURA = `(function(){
  const cv=document.createElement('canvas'); cv.width=420; cv.height=420;
  const g=cv.getContext('2d');
  const lk=Rig3D.lookPredefinito;
  const CL=['corsa','fermo','tiro','tuffo','contrasto','passaggio'];
  function giro(){
    for(let f=0;f<60;f++){
      g.clearRect(0,0,420,420);
      for(let i=0;i<22;i++){
        const nome=CL[i%CL.length];
        /* la coppia che la passata delle ombre fa per ogni figura */
        Rig3D.quotaAria(nome, f/60+i*0.13);
        if(typeof Rig3D.impatto==='function') Rig3D.impatto(nome, f/60+i*0.13);
        Rig3D.disegna(g, 40+(i%6)*62, 70+((i/6)|0)*86, 50, i*0.6, 'alto',
                      nome, f/60+i*0.13, lk, true, 1.37);
      }
    }
  }
  giro(); giro();                 // riscaldamento: mai il primo numero
  const v=[];
  for(let k=0;k<__N;k++){ const t=performance.now(); giro(); v.push((performance.now()-t)/60); }
  v.sort((a,b)=>a-b);
  return { mediana:v[(v.length/2)|0], min:v[0], max:v[v.length-1], n:v.length };
})()`;

(async () => {
  let br;
  try { br = await chromium.launch(); }
  catch (e) { console.error('[156-costo] BANCO: playwright non parte: ' + e.message); process.exit(2); }

  async function misura(file) {
    const pg = await br.newPage();
    const cli = await pg.context().newCDPSession(pg);
    await cli.send('Emulation.setCPUThrottlingRate', { rate: FRENO });
    try {
      await pg.goto('http://127.0.0.1:' + PORTA + '/' + file + '?provino&t=' + Date.now());
      await pg.waitForFunction('typeof Rig3D==="object"', { timeout: 60000 });
    } catch (e) {
      await pg.close();
      throw new Error('il file non si e\' aperto: ' + file + ' — ' + e.message);
    }
    const r = await pg.evaluate(MISURA.replace('__N', String(CAMPIONI)));
    await pg.close();
    return r;
  }

  const dif = [], msA = [], msB = [], ripet = [];
  try {
    for (let g = 0; g < GIRI; g++) {
      const ordine = g % 2 === 0 ? ['A', 'B', 'B', 'A'] : ['B', 'A', 'A', 'B'];
      const pres = { A: [], B: [] };
      for (const q of ordine) {
        const r = await misura(q === 'A' ? FA : FB);
        /* IL NUMERO CHE DECIDE E' IL MINIMO, non la mediana, e la ragione
           e' che qui si misura un CICLO DI CPU deterministico: tutto
           cio' che lo allunga (un altro processo, la raccolta della
           memoria, il freno che scatta) e' rumore ADDITIVO, e il
           campione piu' basso e' quello meno disturbato. La mediana, su
           undici campioni di cui tre sporchi, porta dentro il rumore
           invece di toglierlo. La mediana si stampa lo stesso, accanto,
           perche' chi legge veda se le due si allontanano. */
        pres[q].push(r.min);
        console.log('  giro ' + (g + 1) + ' ' + q + ': ' + r.min.toFixed(3)
                  + ' ms/fotogramma  (mediana ' + r.mediana.toFixed(3) + ', max ' + r.max.toFixed(3) + ')');
      }
      /* il BALLO: quanto distano fra loro le DUE repliche dello stesso
         file dentro lo stesso giro. E' il pavimento dell'attrezzo: una
         differenza piu' piccola di questo non va creduta. */
      ripet.push(Math.abs(pres.A[0]-pres.A[1])/((pres.A[0]+pres.A[1])/2)*100);
      ripet.push(Math.abs(pres.B[0]-pres.B[1])/((pres.B[0]+pres.B[1])/2)*100);
      const a = (pres.A[0] + pres.A[1]) / 2, b = (pres.B[0] + pres.B[1]) / 2;
      msA.push(a); msB.push(b);
      const d = (b - a) / a * 100;
      dif.push(d);
      console.log('    -> dentro il giro ' + (g + 1) + ': ' + (d >= 0 ? '+' : '') + d.toFixed(2) + '%');
    }
  } catch (e) {
    console.error('[156-costo] BANCO: ' + e.message);
    await br.close(); process.exit(2);
  }
  await br.close();

  const med = v => { const s = v.slice().sort((x, y) => x - y); return s[(s.length / 2) | 0]; };
  const D = med(dif), A = med(msA), B = med(msB);
  const ballo = med(ripet);
  console.log('');
  console.log('[156-costo] A (riferimento) = ' + FA);
  console.log('[156-costo] B (in esame)    = ' + FB);
  console.log('  freno CPU ' + FRENO + 'x  ·  22 figure a 50 px  ·  ' + CAMPIONI
            + ' campioni per replica  ·  ' + GIRI + ' giri appaiati A-B-B-A');
  console.log('  costo del disegno: A ' + A.toFixed(3) + ' ms   B ' + B.toFixed(3) + ' ms'
            + '   differenza mediana ' + (D >= 0 ? '+' : '') + D.toFixed(2) + '%');
  console.log('  i ' + GIRI + ' giri: ' + dif.map(v => (v >= 0 ? '+' : '') + v.toFixed(2) + '%').join('  '));
  const minD = Math.min.apply(null, dif), maxD = Math.max.apply(null, dif);
  console.log('  intervallo dei giri: da ' + minD.toFixed(2) + '% a ' + maxD.toFixed(2) + '%'
            + (minD * maxD <= 0 ? '  — SCAVALCA LO ZERO: il segno non e\' provato' : '  — segno concorde'));
  console.log('  ballo fra repliche dello STESSO file: mediana ' + ballo.toFixed(2)
            + '%, peggio ' + Math.max.apply(null, ripet).toFixed(2) + '%');
  console.log(Math.abs(D) < ballo
    ? '  LA DIFFERENZA E\' PIU\' PICCOLA DEL BALLO: questo attrezzo, oggi, non la distingue da zero.'
    : '  la differenza e\' piu\' grande del ballo dell\'attrezzo.');
  process.exit(0);
})();
