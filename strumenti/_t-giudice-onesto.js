/* =====================================================================
   _t-giudice-onesto.js — QUANTE PARTITE ONESTE IL GIUDICE CONDANNA
   (voce #133, compito 3).

   NON E' UN CANCELLO, E' UNA MISURA. Un giudice che sbaglia in un verso
   non fa danno: una partita truccata che passa resta un punto rubato.
   Un giudice che sbaglia nell'altro verso toglie punti a chi non ha
   barato — e quello e' l'errore piu' caro che una classifica possa
   fare, perche' non si vede e non si corregge.

   Percio' qui non si prova niente: si GIOCANO N sfide vere, si
   giudicano i loro nastri, e si dichiara quante tornano. Se anche una
   sola partita onesta da' NON TORNA, ci si ferma e si indaga la causa:
   e' un canale non ancora chiuso, ed e' una scoperta piu' importante del
   giudice stesso.

   E LE TRE TAGLIE. Il terreno ancorato di casa e' il 5, ma il giudice
   deve funzionare anche a 7 e a 11 — a 11 in particolare, perche' e' la
   taglia su cui il tetto per taglia (voce #130) fa la differenza fra
   verificare e arrendersi.

   I TRE CANALI SOSPETTI, misurati apposta perche' il banco normale non
   li vedrebbe (due pagine uguali non si accorgono di niente):

     (a) I NOMI. Il nastro non porta i nomi delle due squadre — e' un
         dato di una persona — quindi il giudice rigioca con dei
         segnaposti fissi. I nomi entrano in rosaAvversaria (xorshift
         locale seminato dal nome, e che legge anche SAVE.rosa per non
         ripetere i cognomi) e in G.oppName. Dalla voce #132 il carattere
         viene dall'indice e non dal nome; resta da confermare che quel
         che il nome decide sia soltanto cosmetico. Due pagine di
         giudizio con nomi e rose diverse — una si chiama GASOMETRO, che
         nella tabella dei caratteri C'E' — devono dare lo stesso
         verdetto sullo stesso nastro.

     (b) L'AUDIO. Un giudice lato server non ha un gesto che sblocchi il
         contesto audio; un telefono ce l'ha. La voce #132 ha curato il
         canale (Audio5.noiseBuf riempiva un secondo di campionamento col
         generatore SEMINATO: 48.000 sorteggi al primo sblocco) e qui si
         rimisura dalla parte del giudice, che e' quella che conta.

     (c) LA FINESTRA. rebuildCrowd e paintField consumavano il PRNG di
         gioco in proporzione al campo (voce #98); la voce #129 li ha
         spostati su DECO, un generatore separato. Se la cura tiene, la
         dimensione della finestra del giudice non sposta un verdetto —
         e un verificatore su un server non ha la finestra di un
         telefono.

   uso:  node strumenti/_t-giudice-onesto.js
         node strumenti/_t-giudice-onesto.js --sfide 10 --sfide7 2 --sfide11 2
         node strumenti/_t-giudice-onesto.js --gioco fuori/falso.html
   esce 0 se ogni partita onesta torna e i tre canali concordano,
   1 se anche una sola partita onesta non torna (o un canale diverge),
   2 se il banco esplode, 3 se non c'e' niente da misurare.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const B = require('./_sfida-due-telefoni.js');
const N = require('./_nastri-bugiardi.js');

const RADICE = B.RADICE;
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
const N5 = parseInt(arg('sfide', '10'), 10);
const N7 = parseInt(arg('sfide7', '2'), 10);
const N11 = parseInt(arg('sfide11', '2'), 10);

const giudizio = (P, nastro, atteso, opz) => P.pag.evaluate(([n, a, o]) => {
  const t = window.__test;
  if (typeof t.giudica !== 'function') return { manca: true, verdetto: 'ASSENTE' };
  try { return Object.assign({ manca: false }, t.giudica(n, a, o)); }
  catch (e) { return { manca: false, verdetto: 'ECCEZIONE', causa: e.message }; }
}, [nastro, atteso, opz]);

/* la squadra di una pagina di giudizio: nome e rosa, senza collegarsi a
   nessun server — un giudice non ha un avversario */
const vesti = (P, nome, scarto) => P.pag.evaluate(([nome, k]) => {
  const t = window.__test;
  t.save.teamName = nome;
  t.save.rosa = t.save.rosa.map((r, i) => Object.assign({}, r, {
    nome: nome + ' ' + (i + 1),
    vel: 50 + ((i * 7 + k) % 30), tiro: 50 + ((i * 11 + k) % 30),
    tecnica: 50 + ((i * 5 + k) % 30), tackle: 50 + ((i * 13 + k) % 30),
  }));
}, [nome, scarto]);

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  if (prova && !fs.existsSync(prova)) { console.error('PROVA NULLA: non esiste ' + prova); process.exit(3); }
  const sg = await B.serviGioco(prova);
  const ss = await B.serviServer();
  let browser;
  const righe = [];        /* una per sfida giudicata */
  const canali = [];
  try {
    browser = await chromium.launch();
    console.log('=== IL TASSO DI FALSI «NON TORNA» SU PARTITE ONESTE (voce #133, compito 3) ===');
    console.log('    gioco ' + (provaRel || 'CALCETTO-il-gioco.html') + ', ' +
      N5 + ' sfide a taglia 5, ' + N7 + ' a 7, ' + N11 + ' a 11\n');

    const Bt = await B.apri(browser, sg.porta);
    const At = await B.apri(browser, sg.porta);
    const c = await At.pag.evaluate(() => ({ schermata: !!document.getElementById('sfida'),
                                             giudice: typeof window.__test.giudica === 'function' }));
    if (!c.schermata) { console.error('PROVA NULLA: questo gioco non ha la schermata della sfida.');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3); }
    if (!c.giudice) { console.error('PROVA NULLA: questo gioco non ha il giudice (window.__test.giudica).');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3); }
    await B.collega(Bt, ss.porta, 'BORGATA');
    await B.collega(At, ss.porta, 'DOPOLAVORO');
    await B.entra(Bt); await B.entra(At); await B.pubblica(Bt); await B.pubblica(At);

    /* IL GIUDICE PRINCIPALE: mai collegato, mai giocato, e con le
       impostazioni locali all'opposto di quelle che una sfida forza. */
    const J = await B.apri(browser, sg.porta);
    await J.pag.evaluate(() => { const t = window.__test; t.save.sponde = 'campo'; t.save.miraGuidata = 'essenziale'; });
    await vesti(J, 'GIUDICE UNO', 3);

    const giocaEGiudica = async (taglia, quante, passiMax) => {
      if (quante <= 0) return;
      await At.pag.evaluate(t => { window.__test.save.taglia = t; }, taglia);
      for (let i = 0; i < quante; i++) {
        const s = await B.giocaUna(At, ss, [], passiMax, 0);
        if (!s.partita || !s.riga) { righe.push({ taglia, seme: '—', esito: 'SFIDA NON ARRIVATA AL FISCHIO' }); continue; }
        const crudo = N.allarga(s.riga.replay);
        const g = await giudizio(J, crudo, [s.riga.gol_a | 0, s.riga.gol_d | 0],
                                 { seme: s.riga.seme, taglia: s.riga.taglia | 0 });
        righe.push({ taglia: s.riga.taglia | 0, seme: s.riga.seme, s, g,
                     esito: g.verdetto, gol: (g.gol || []).join('-'),
                     dichiarato: (s.riga.gol_a | 0) + '-' + (s.riga.gol_d | 0),
                     passi: g.passi | 0, tetto: g.tetto | 0, duello: String(s.fine.tipi).indexOf('6') >= 0 });
      }
    };
    await giocaEGiudica(5, N5, 24000);
    await giocaEGiudica(7, N7, 28000);
    await giocaEGiudica(11, N11, 32000);

    /* ------------------------------------------------ i tre canali */
    const primo = righe.find(r => r.s && r.esito === 'TORNA') || righe.find(r => r.s);
    if (primo && primo.s) {
      const crudo = N.allarga(primo.s.riga.replay);
      const att = [primo.s.riga.gol_a | 0, primo.s.riga.gol_d | 0];
      const opz = { seme: primo.s.riga.seme, taglia: primo.s.riga.taglia | 0 };

      /* (a) i nomi — GASOMETRO sta nella tabella dei caratteri */
      const J2 = await B.apri(browser, sg.porta);
      await vesti(J2, 'GASOMETRO', 17);
      canali.push({ nome: '(a) i nomi: GIUDICE UNO contro GASOMETRO, rose diverse',
                    a: primo.g, b: await giudizio(J2, crudo, att, opz) });
      await J2.ctx.close();

      /* (b) l'audio — una pagina che non l'ha mai sbloccato */
      const J3 = await B.apri(browser, sg.porta, null, true);
      await vesti(J3, 'GIUDICE UNO', 3);
      canali.push({ nome: '(b) l\'audio: pagina con contesto audio contro pagina senza',
                    a: primo.g, b: await giudizio(J3, crudo, att, opz) });
      await J3.ctx.close();

      /* =================================================================
         (c) LA FINESTRA — ed e' il canale che ha morso (voce #133,
         compito 3). Non passa dai sorteggi (quello lo ha chiuso la voce
         #129 spostando la cosmetica su DECO): passa dai PIXEL. Il nastro
         porta i tocchi in coordinate di SCHERMO e su uno schermo diverso
         gli stessi numeri premono altro — misurato, a 800x360 la stessa
         partita finisce 0-3 invece di 3-4.

         Percio' qui non si chiede piu' «stesso verdetto»: si chiede che
         il giudice NON ACCUSI. Su uno schermo diverso deve dire
         INCOMPLETO/schermo-diverso e dichiarare quale schermo serve; e
         aperto a QUELLO schermo deve tornare a dire TORNA. Un verdetto
         NON TORNA qui sarebbe un innocente condannato da una finestra.
         ================================================================= */
      const J4 = await B.apri(browser, sg.porta, { width: 800, height: 360 });
      await vesti(J4, 'GIUDICE UNO', 3);
      const g4 = await giudizio(J4, crudo, att, opz);
      await J4.ctx.close();
      canali.push({ nome: '(c) la finestra: da 800x360 il giudice si rifiuta invece di accusare',
                    a: primo.g, b: g4, regola: 'rifiuto',
                    ok: g4.verdetto === 'INCOMPLETO' && g4.causa === 'schermo-diverso' && Array.isArray(g4.schermo) });

      const sc = N.schermoDi(crudo);
      if (sc) {
        const J5 = await B.apri(browser, sg.porta, { width: sc[0], height: sc[1] });
        await vesti(J5, 'GIUDICE UNO', 3);
        const g5 = await giudizio(J5, crudo, att, opz);
        await J5.ctx.close();
        canali.push({ nome: '(c2) e aperto allo schermo ' + sc.join('x') + ' che il nastro dichiara, TORNA',
                      a: primo.g, b: g5 });
      } else {
        canali.push({ nome: '(c2) lo schermo NON e\' nel nastro: il giudice non puo\' saperlo',
                      a: primo.g, b: { verdetto: 'ASSENTE', gol: [], passi: 0 }, regola: 'rifiuto', ok: false });
      }
    }

    if (At.errori.length || Bt.errori.length || J.errori.length)
      throw new Error('eccezione di pagina: ' + (At.errori[0] || Bt.errori[0] || J.errori[0]));
    await At.ctx.close(); await Bt.ctx.close(); await J.ctx.close();
  } catch (e) {
    console.error('FALLITO (banco): ' + e.message);
    if (browser) await browser.close();
    sg.chiudi(); ss.chiudi(); process.exit(2);
  }
  await browser.close(); sg.chiudi(); ss.chiudi();

  const valide = righe.filter(r => r.g);
  if (!valide.length) { console.error('PROVA NULLA: nessuna sfida e\' arrivata al fischio finale.'); process.exit(3); }

  console.log('  taglia  seme        dichiarato  rigiocata  passi/tetto  duello  verdetto');
  for (const r of righe) {
    if (!r.g) { console.log('  ' + String(r.taglia).padStart(6) + '  ' + String(r.seme).padEnd(12) + r.esito); continue; }
    console.log('  ' + String(r.taglia).padStart(6) + '  ' + String(r.seme).padEnd(12) +
      String(r.dichiarato).padEnd(12) + String(r.gol).padEnd(11) +
      (r.passi + '/' + r.tetto).padEnd(13) + (r.duello ? 'si      ' : 'no      ') + r.esito);
  }
  console.log('');

  const perTaglia = t => valide.filter(r => r.taglia === t);
  for (const t of [5, 7, 11]) {
    const v = perTaglia(t);
    if (!v.length) continue;
    const ok = v.filter(r => r.esito === 'TORNA').length;
    console.log('  taglia ' + t + ': ' + ok + ' TORNA su ' + v.length + ' giudicate' +
      (ok === v.length ? '' : '   <-- GUARDA QUI'));
  }
  const tornate = valide.filter(r => r.esito === 'TORNA').length;
  const bugie = valide.filter(r => r.esito === 'NON TORNA');
  console.log('\n  TOTALE: ' + tornate + ' TORNA su ' + valide.length + ' partite oneste giudicate');
  console.log('  TASSO DI FALSI «NON TORNA» SU PARTITE ONESTE: ' + bugie.length + '/' + valide.length +
    ' (' + (bugie.length / valide.length * 100).toFixed(1) + '%)');
  const altri = valide.filter(r => r.esito !== 'TORNA' && r.esito !== 'NON TORNA');
  if (altri.length) {
    console.log('  e ' + altri.length + ' con un verdetto che NON muove punti:');
    for (const r of altri) console.log('    taglia ' + r.taglia + ' seme ' + r.seme + ': ' + r.esito + '/' + (r.g.causa || ''));
  }

  console.log('\n  I TRE CANALI SOSPETTI — stesso nastro, giudici diversi:');
  let canaliOk = true;
  for (const c of canali) {
    /* due regole: la maggior parte dei canali non deve spostare NIENTE
       (stesso verdetto, stessi gol, stessi passi); quello dello schermo
       deve far RIFIUTARE il giudice invece di farlo accusare */
    const uguale = c.regola === 'rifiuto' ? !!c.ok
      : (c.a && c.b && c.a.verdetto === c.b.verdetto &&
         String((c.a.gol || []).join('-')) === String((c.b.gol || []).join('-')) &&
         (c.a.passi | 0) === (c.b.passi | 0));
    if (!uguale) canaliOk = false;
    console.log('    ' + (uguale ? 'OK  ' : 'NO  ') + c.nome + '  [' +
      c.a.verdetto + ' ' + (c.a.gol || []).join('-') + ' ' + (c.a.passi | 0) + ' passi  contro  ' +
      c.b.verdetto + (c.b.causa ? '/' + c.b.causa : '') + ' ' + (c.b.gol || []).join('-') + ' ' + (c.b.passi | 0) + ' passi]');
  }
  if (!canali.length) { console.log('    (nessuna sfida su cui misurarli)'); canaliOk = false; }

  console.log('');
  if (bugie.length) {
    console.error('ROSSO — ' + bugie.length + ' partita/e ONESTA/E condannata/e dal giudice. FERMARSI E INDAGARE:');
    for (const r of bugie)
      console.error('  taglia ' + r.taglia + ' seme ' + r.seme + ': dichiarato ' + r.dichiarato +
        ', rigiocato ' + r.gol + ' in ' + r.passi + ' passi' + (r.duello ? ' (passata dal dischetto)' : ''));
    process.exit(1);
  }
  if (!canaliOk) { console.error('ROSSO — un canale fa divergere il giudizio: stesso nastro, verdetti diversi.'); process.exit(1); }
  console.log('VERDE — nessuna partita onesta condannata, e i tre canali non spostano un verdetto.');
  process.exit(0);
})();
