/* =====================================================================
   LA SONDA DELLA DISPOSIZIONE — il pezzo che gira DENTRO la pagina.

   Sta in un file suo perche' lo usano in due: il cancello
   (strumenti/disposizione.js) e il diagnostico (_diag-griglia.js), e due
   copie della stessa misura sono due misure che prima o poi divergono.

   Torna, per la schermata visibile:
     · FILE DI BOTTONI — ogni contenitore con bottoni figli diretti, le
       sue righe, e per ogni riga: le larghezze, lo SCARTO fra la piu'
       larga e la piu' stretta, e lo SBILANCIO (quanto il vuoto della
       riga sta tutto da una parte invece che diviso).
     · BANDE E VUOTI — dove c'e' INCHIOSTRO sullo schermo e dove no.
       Inchiostro = testo proprio, bottoni, tele, immagini, icone. NON
       i fondi dei contenitori: la fascia dei bottoni ha un gradiente
       che copre anche il suo tratto vuoto, e contarlo direbbe «pieno»
       di mezzo schermo che l'occhio legge vuoto.
   ===================================================================== */
(() => {
  const vis = el => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.02;
  };
  /* LA SCHERMATA SI DICE, NON SI INDOVINA. Cercando «la prima .ov non
     nascosta» si prendeva quasi sempre quella sbagliata: le sovrapposte
     (.trasp) restano visibili sopra le altre, e su diciannove schermate
     ne arrivavano misurate tre. Chi chiama mette l'id in window.__sondaOv. */
  const ov = window.__sondaOv
    ? document.getElementById(window.__sondaOv)
    : [...document.querySelectorAll('.ov')].find(o => !o.classList.contains('hidden') && vis(o));
  if (!ov || !vis(ov) || ov.classList.contains('hidden')) return null;
  const n1 = x => +x.toFixed(1);
  const VH = innerHeight, VW = innerWidth;

  const nome = el => el.id ? '#' + el.id
    : (el.className && typeof el.className === 'string' && el.className.trim())
      ? '.' + el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase();

  /* ---------------- 1. LE FILE DI BOTTONI ---------------- */
  const file = [];
  for (const cont of ov.querySelectorAll('*')) {
    if (!vis(cont)) continue;
    const figli = [...cont.children].filter(vis);
    /* «fila di bottoni» = ha almeno DUE figli diretti visibili ed almeno
       uno e' un bottone. Con un figlio solo non c'e' nessuna fila da
       confrontare, ma il contenitore va guardato lo stesso: una voce
       sola dentro una griglia a due colonne e' il difetto tipico, e la
       si vede dallo SBILANCIO, non dallo scarto. */
    const bottoni = figli.filter(f => f.tagName === 'BUTTON' || f.classList.contains('voce') || f.classList.contains('btnA'));
    if (!bottoni.length) continue;
    const cs = getComputedStyle(cont);
    const rc = cont.getBoundingClientRect();
    /* il riquadro UTILE: dentro l'imbottitura, che non e' spazio sprecato */
    const cx0 = rc.left + parseFloat(cs.paddingLeft || 0);
    const cx1 = rc.right - parseFloat(cs.paddingRight || 0);
    const larg = cx1 - cx0;
    if (larg < 20) continue;
    /* quante colonne dichiara, se e' una griglia */
    const colonne = cs.display.includes('grid') && cs.gridTemplateColumns && cs.gridTemplateColumns !== 'none'
      ? cs.gridTemplateColumns.trim().split(/\s+/).length : 0;
    const righe = new Map();
    for (const f of figli) {
      const r = f.getBoundingClientRect();
      let k = null;
      for (const [kk] of righe) if (Math.abs(kk - r.top) <= 6) { k = kk; break; }
      if (k === null) { k = r.top; righe.set(k, []); }
      righe.get(k).push({
        t: (f.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24),
        bottone: f.tagName === 'BUTTON' || f.classList.contains('voce') || f.classList.contains('btnA'),
        x: n1(r.left), y: n1(r.top), w: n1(r.width), h: n1(r.height), r: n1(r.right),
      });
    }
    const elenco = [...righe.entries()].sort((a, b) => a[0] - b[0]).map(([, v], i) => {
      v.sort((a, b) => a.x - b.x);
      const ws = v.map(b => b.w);
      const sx = n1(Math.min(...v.map(b => b.x)) - cx0);
      const dx = n1(cx1 - Math.max(...v.map(b => b.r)));
      const sbil = n1(Math.abs(sx - dx));
      return {
        n: i + 1, bottoni: v, larghezze: ws.map(n1),
        scarto: n1(Math.max(...ws) - Math.min(...ws)),
        sx, dx, sbilancio: sbil, sbilancioPc: +(sbil / larg * 100).toFixed(1),
        soloBottoni: v.every(b => b.bottone),
      };
    });
    file.push({
      via: nome(cont), display: cs.display, colonne: cs.display.includes('grid') ? cs.gridTemplateColumns : '',
      nColonne: colonne, giustifica: cs.justifyContent, w: n1(larg), righe: elenco,
    });
  }

  /* ---------------- 2. DOVE C'E' INCHIOSTRO ---------------- */
  const rett = [];
  for (const el of ov.querySelectorAll('*')) {
    if (!vis(el)) continue;
    const cs = getComputedStyle(el);
    const suoTesto = [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
    const inchiostro = suoTesto
      || ['BUTTON', 'CANVAS', 'IMG', 'SVG', 'INPUT', 'SELECT', 'TEXTAREA', 'HR'].includes(el.tagName)
      || el.tagName === 'svg'
      || /url\(/.test(cs.backgroundImage);
    if (!inchiostro) continue;
    const r = el.getBoundingClientRect();
    const a = Math.max(0, r.top), b = Math.min(VH, r.bottom);
    if (b - a < 1 || r.right < 0 || r.left > VW) continue;
    rett.push({ a, b, chi: nome(el) + ' «' + (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 18) + '»' });
  }
  rett.sort((x, y) => x.a - y.a);
  const bande = [];
  for (const r of rett) {
    const u = bande[bande.length - 1];
    if (u && r.a <= u.b + 1) { u.b = Math.max(u.b, r.b); u.chi += ' + ' + r.chi; }
    else bande.push({ a: r.a, b: r.b, chi: r.chi });
  }
  for (const b of bande) { b.a = n1(b.a); b.b = n1(b.b); b.chi = b.chi.slice(0, 120); }

  const vuoti = [];
  for (let i = 1; i < bande.length; i++) {
    const px = n1(bande[i].a - bande[i - 1].b);
    if (px > 2) vuoti.push({ a: bande[i - 1].b, b: bande[i].a, px, pc: +(px / VH * 100).toFixed(1) });
  }
  const vuotoMax = vuoti.length ? Math.max(...vuoti.map(v => v.px)) : 0;
  const coda = bande.length ? n1(VH - bande[bande.length - 1].b) : VH;
  const testa = bande.length ? n1(bande[0].a) : VH;

  /* il riquadro del pannello: serve a chi guarda i PIXEL di un buco, per
     sapere in che striscia orizzontale guardare */
  const bx = ov.querySelector('.box') || ov.querySelector('.pannello') || ov;
  const rb = bx.getBoundingClientRect();

  return {
    id: ov.id, classi: ov.className, vh: VH, vw: VW,
    box: { x: n1(Math.max(0, rb.left)), w: n1(Math.min(VW, rb.right) - Math.max(0, rb.left)) },
    sh: ov.scrollHeight, ch: ov.clientHeight, scorre: ov.scrollHeight - ov.clientHeight > 28,
    file, bande, vuoti,
    vuotoMax, vuotoMaxPc: +(vuotoMax / VH * 100).toFixed(1),
    coda, codaPc: +(coda / VH * 100).toFixed(1),
    testa, testaPc: +(testa / VH * 100).toFixed(1),
  };
})()
