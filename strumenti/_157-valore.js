/* =====================================================================
   _157-valore.js — LA GERARCHIA DEL VALORE, SU TUTTE LE DIVISE DEL GIOCO
   (voce #155, giro 4 · rilievo 4 del verbale del giro 3)

   RILIEVO 4, alla lettera: «Bersaglio: calze ad almeno 40 livelli dalla
   maglia, pelle ad almeno 40 livelli sotto il capo di divisa piu'
   chiaro, e una terza riga nel verdetto del provino che stampi questi
   due scarti accanto a quello degli estremi.»

   PERCHE' UN BANCO A PARTE E NON SOLO IL PANNELLO DEL PROVINO. Il
   pannello guarda UNA divisa — quella scelta nella pagina — e il
   criterio parla della figura, cioe' di tutte e diciotto. Un capo che
   rispetta lo scarto sul celeste e lo sfonda sul bianco e' un capo che
   non rispetta niente: qui si contano tutte le divise del gioco, piu'
   tutte e sei le carnagioni, e si stampa il PEGGIO.

   Le tinte non si ricopiano: si leggono dal gioco (KITS, SKIN, HAIR) e
   si mescolano con la SUA mescolaTinta. Un banco con la sua copia della
   tavolozza misura la propria copia.

   USCITE: 0 ha misurato · 2 non e' riuscito ad aprire il gioco.
   USO:  node strumenti/_157-valore.js [--gioco fuori/x.html]
   ===================================================================== */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const PORTA = arg('porta', '8777');
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');

(async () => {
  let br;
  try { br = await chromium.launch(); }
  catch (e) { console.error('[157-valore] BANCO: playwright non parte: ' + e.message); process.exit(2); }
  const pg = await br.newPage();
  try {
    await pg.goto('http://127.0.0.1:' + PORTA + '/' + GIOCO + '?provino&t=' + Date.now());
    await pg.waitForFunction('typeof Rig3D==="object" && typeof KITS!=="undefined"', { timeout: 45000 });
  } catch (e) {
    console.error('[157-valore] BANCO: il gioco non si e\' aperto: ' + e.message);
    await br.close(); process.exit(2);
  }

  const out = await pg.evaluate(() => {
    const mt = Rig3D.mescolaTinta;
    const lum = h => { const r=parseInt(h.slice(1,3),16), g=parseInt(h.slice(3,5),16), b=parseInt(h.slice(5,7),16);
                       return 0.2126*r + 0.7152*g + 0.0722*b; };
    /* le stesse formule di rigLook, lette da li' una volta sola: se un
       giorno divergono, questo banco lo dice sbagliando insieme a loro.
       Si ricostruisce il look chiamando rigLook con un giocatore finto,
       cosi' le formule restano UNA sola copia — quella del gioco. */
    const righe = [];
    for (let k = 0; k < KITS.length; k++) {
      const kit = KITS[k];
      for (let sk = 0; sk < SKIN.length; sk++) {
        /* rigLook legge la divisa dalle tabelle di squadra: si
           scrivono, si chiama, si rimettono com'erano. Cosi' le formule
           restano UNA sola copia, quella del gioco. */
        const eraC1=TEAMCOL[0], eraC2=TEAMCOL2[0], eraP=TEAMPAT[0];
        TEAMCOL[0]=kit.c1; TEAMCOL2[0]=kit.c2; TEAMPAT[0]=kit.pat|0;
        const p = { team:0, skin: SKIN[sk], hair: HAIR[sk % HAIR.length], taglio: 0, corp: 3, seme: 0x1234567+sk*7+k*13 };
        const lk = rigLook(p);
        TEAMCOL[0]=eraC1; TEAMCOL2[0]=eraC2; TEAMPAT[0]=eraP;
        const V = { maglia:lk.maglia, '2a':lk.maglia2, manica:lk.manica,
                    calzoncini:lk.pantaloncini, calze:lk.calze };
        const divisa = Object.keys(V).filter(n=>V[n]).map(n=>({n, L:lum(V[n])}));
        divisa.sort((a,b)=>a.L-b.L);
        const tutti = divisa.concat([{n:'scarpe',L:lum(lk.scarpe),fuori:1},
                                     {n:'pelle',L:lum(lk.pelle),fuori:1},
                                     {n:'capelli',L:lum(lk.capelli),fuori:1}]);
        tutti.sort((a,b)=>a.L-b.L);
        const piuChiaroDivisa = divisa[divisa.length-1];
        righe.push({
          kit: kit.nome || ('kit'+k), skin: SKIN[sk],
          maglia: lum(lk.maglia), calze: lum(lk.calze), pelle: lum(lk.pelle),
          scartoCalze: Math.abs(lum(lk.calze)-lum(lk.maglia)),
          scartoPelle: piuChiaroDivisa.L - lum(lk.pelle),
          scartoCalzoncini: Math.abs(lum(lk.calze)-lum(lk.pantaloncini)),
          estremiOK: !tutti[0].fuori && !tutti[tutti.length-1].fuori,
          /* LA LETTERA DEL CRITERIO: «ne' la pelle ne' le scarpe agli
             estremi». I capelli non sono ne' l'una ne' le altre, e
             alzarli spegnerebbe lo spicchio della faccia: la deroga e'
             dichiarata da due giri, qui si conta a parte invece di
             nasconderla dentro un verdetto solo. */
          letteraOK: !/^(pelle|scarpe)$/.test(tutti[0].n) && !/^(pelle|scarpe)$/.test(tutti[tutti.length-1].n),
          piuScuro: tutti[0].n, piuChiaro: tutti[tutti.length-1].n,
        });
      }
    }
    return righe;
  });

  let pCalzo = 1e9, pCalze = 1e9, pPelle = 1e9, estremi = 0, lettera = 0, peggioC = null, peggioP = null, peggioE = null, peggioL = null;
  for (const r of out) {
    if (r.scartoCalze < pCalze) { pCalze = r.scartoCalze; peggioC = r; }
    if (r.scartoPelle < pPelle) { pPelle = r.scartoPelle; peggioP = r; }
    if (r.scartoCalzoncini < pCalzo) pCalzo = r.scartoCalzoncini;
    if (r.estremiOK) estremi++; else if (!peggioE) peggioE = r;
    if (r.letteraOK) lettera++; else if (!peggioL) peggioL = r;
  }
  console.log('[157-valore] file: ' + GIOCO + '  ·  ' + out.length + ' combinazioni (divise x carnagioni)');
  console.log('  SCARTO CALZE/MAGLIA      minimo ' + pCalze.toFixed(0).padStart(3) + '  (bersaglio 40)  '
            + (pCalze >= 40 ? 'PASSA' : 'NON PASSA') + '   peggio: ' + peggioC.kit);
  console.log('  SCARTO CALZE/CALZONCINI  minimo ' + pCalzo.toFixed(0).padStart(3) + '  (bersaglio 40)  '
            + (pCalzo >= 40 ? 'PASSA' : 'NON PASSA'));
  console.log('  SCARTO PELLE/DIVISA piu\' chiara  ' + pPelle.toFixed(0).padStart(3) + '  (bersaglio 40)  '
            + (pPelle >= 40 ? 'PASSA' : 'NON PASSA') + '   peggio: ' + peggioP.kit + ' / ' + peggioP.skin);
  console.log('  ESTREMI entrambi di DIVISA        ' + estremi + '/' + out.length + '  '
            + (estremi === out.length ? 'PASSA' : 'NON PASSA')
            + (peggioE ? ('   peggio: ' + peggioE.kit + ' (' + peggioE.piuScuro + ' .. ' + peggioE.piuChiaro + ')') : ''));
  console.log('  NE pelle NE scarpe agli estremi     ' + lettera + '/' + out.length + '  '
            + (lettera === out.length ? 'PASSA' : 'NON PASSA')
            + (peggioL ? ('   peggio: ' + peggioL.kit + ' (' + peggioL.piuScuro + ' .. ' + peggioL.piuChiaro + ')') : ''));
  if (process.argv.includes('--det')) {
    console.log('\n  divisa           carnagione  maglia calze pelle   calze-maglia  divisa-pelle');
    for (const r of out) console.log('  ' + r.kit.padEnd(16) + r.skin + '   '
      + r.maglia.toFixed(0).padStart(4) + r.calze.toFixed(0).padStart(6) + r.pelle.toFixed(0).padStart(6)
      + r.scartoCalze.toFixed(0).padStart(11) + r.scartoPelle.toFixed(0).padStart(13)
      + (r.estremiOK ? '' : '   estremi: ' + r.piuScuro + '..' + r.piuChiaro));
  }
  await br.close();
  process.exit(0);
})();
