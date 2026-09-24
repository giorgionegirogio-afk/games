/* =====================================================================
   _sonda-148-differita.js — UN NASTRO DEL DISCHETTO, GIUDICATO DAVVERO
   (voce #148, compito 0)

   Non e' un cancello: misura e stampa. La domanda e' quella che il #147
   ha lasciato aperta, e non e' «manca la riga delle rose?» — quella e'
   gia' risposta — ma quella dopo:

     una serie VERA e ONESTA, giocata fino in fondo fra due telefoni,
     che verdetto prende dal giudice in differita? E se le tre righe
     mancanti (7, 10, 11) ci fossero, lo prenderebbe TORNA?

   La differenza non e' accademica. Se il giudice, con le tre righe al
   loro posto, rigiocasse la serie come una partita qualunque — senza
   aprire la serie di rigori — direbbe NON TORNA a due persone oneste, e
   NON TORNA e' l'unico verdetto che toglie punti. Meglio l'astensione di
   oggi che un'accusa domani: percio' questa sonda si misura PRIMA di
   scrivere la cura, e su un gioco a cui le tre righe sono gia' state
   messe (--gioco).

   Stampa anche le due righe di tipo 7 dei DUE telefoni una accanto
   all'altra: devono essere identiche carattere per carattere. Se non lo
   fossero, la cura scriverebbe rose diverse sui due capi e il giudice
   direbbe NON TORNA a un onesto — il difetto peggiore di tutta l'onda D.

   uso:  node strumenti/_sonda-148-differita.js [percorso-gioco.html]
   ===================================================================== */
const { chromium } = require('playwright');
const T = require('./_dischetto-due-telefoni.js');

const mossaTiro = t => ({ ruolo: 't', z: t % 3, u: ((t * 317) % 1600) - 800, v: 200 + ((t * 211) % 600), ps: 30 + (t * 7) % 40 });
const mossaPara = t => ({ ruolo: 'p', z: (t * 2 + 1) % 3 });

const d_stato = P => P.pag.evaluate(() => window.__test.dischetto.stato);
const d_giro = P => P.pag.evaluate(async () => await window.__test.dischetto.giro());
const d_scegli = (P, m) => P.pag.evaluate(m => window.__test.dischetto.scegli(m), m);

/* le righe del nastro, per tipo, dal testo crudo */
function perTipo(testo) {
  const conta = {};
  for (const pezzo of (String(testo).split('|')[3] || '').split(';')) {
    if (!pezzo) continue;
    const tipo = Number(pezzo.split(',')[1]);
    conta[tipo] = (conta[tipo] || 0) + 1;
  }
  return conta;
}
function rigaDiTipo(testo, tipo) {
  for (const pezzo of (String(testo).split('|')[3] || '').split(';')) {
    if (pezzo && Number(pezzo.split(',')[1]) === tipo) return pezzo;
  }
  return '';
}
/* GLI ARGOMENTI, SENZA I DUE SCARTI DI TESTA (tick e millisecondi): due
   telefoni non possono avere lo stesso scarto di orologio da muro, e
   confrontare le righe intere farebbe dire «rose diverse» a una sonda
   che sta guardando un millisecondo. */
const argomentiDi = riga => riga ? riga.split(',').slice(3).join(',') : '';

(async () => {
  const prova = process.argv[2] || null;
  const srv = await T.serviGioco(prova);
  const cass = await T.serviCassetta({});
  const browser = await chromium.launch();
  const A = await T.apri(browser, srv.porta);
  const B = await T.apri(browser, srv.porta);
  try {
    console.log('gioco: ' + (prova || 'CALCETTO-il-gioco.html (di casa)'));
    await T.collega(A, cass.porta, 'ALFA');
    await T.collega(B, cass.porta, 'BETAX');
    await T.entra(A); await T.entra(B);

    const r = await A.pag.evaluate(async () => await window.__test.dischetto.crea());
    await B.pag.evaluate(async s => await window.__test.dischetto.entra(s), r.stanza);

    /* LA SERIE FINO IN FONDO, non tre tiri: un nastro a meta' non e' il
       nastro di una serie, e il giudizio di un troncone non dice niente
       su quello di una partita vera. */
    let giri = 0;
    for (; giri < 400; giri++) {
      for (const P of [A, B]) {
        const s = await d_stato(P);
        if (s && s.fase === 'scegli') await d_scegli(P, s.ruolo === 't' ? mossaTiro(s.tiro) : mossaPara(s.tiro));
      }
      await Promise.all([d_giro(A), d_giro(B)]);
      const sa = await d_stato(A), sb = await d_stato(B);
      if (sa.fase === 'fine' && sb.fase === 'fine') break;
    }

    const leggi = P => P.pag.evaluate(() => {
      const t = window.__test;
      const testo = t.nastro();
      const st = t.dischetto.stato;
      return { testo: testo, righe: t.registroRighe, stato: st };
    });
    const mA = await leggi(A), mB = await leggi(B);

    console.log('giri di rete      : ' + giri);
    console.log('serie A           : ' + JSON.stringify(mA.stato.serie) + ' · fase ' + mA.stato.fase + ' · causa ' + mA.stato.causa + ' · fine ' + mA.stato.fine);
    console.log('serie B           : ' + JSON.stringify(mB.stato.serie) + ' · fase ' + mB.stato.fase + ' · causa ' + mB.stato.causa + ' · fine ' + mB.stato.fine);
    console.log('nastro A          : ' + mA.testo.length + ' caratteri · per tipo ' + JSON.stringify(perTipo(mA.testo)));
    console.log('nastro B          : ' + mB.testo.length + ' caratteri · per tipo ' + JSON.stringify(perTipo(mB.testo)));
    const r7a = rigaDiTipo(mA.testo, 7), r7b = rigaDiTipo(mB.testo, 7);
    console.log('riga 7 di A       : ' + (r7a || '(nessuna)'));
    console.log('riga 7 di B       : ' + (r7b || '(nessuna)'));
    const a7a = argomentiDi(r7a), a7b = argomentiDi(r7b);
    console.log('LE DUE ROSE       : ' + (a7a && a7a === a7b ? 'IDENTICHE sui due telefoni (' + a7a.split(',').length + ' numeri)'
      : (!a7a && !a7b ? 'ASSENTI da tutti e due' : 'DIVERSE — e sarebbe il guaio peggiore')));
    console.log('riga 10 di A      : ' + (rigaDiTipo(mA.testo, 10) || '(nessuna)'));
    console.log('riga 11 di A      : ' + (rigaDiTipo(mA.testo, 11) || '(nessuna)'));

    /* IL GIUDIZIO, dal telefono A, sul proprio nastro. Il punteggio
       dichiarato e' quello della SERIE (i rigori segnati), che e' quel
       che le due persone hanno visto sul tabellone. */
    for (const [nome, P, m] of [['A', A, mA], ['B', B, mB]]) {
      const v = await P.pag.evaluate(t => {
        const st = window.__test.dischetto.stato;
        const g = window.__test.giudica(t, [st.serie.seg[0], st.serie.seg[1]],
                                        { seme: String(st.seme), taglia: 5 });
        return { verdetto: g.verdetto, causa: g.causa, gol: g.gol, passi: g.passi, righe: g.righe, atteso: g.atteso };
      }, m.testo);
      console.log('verdetto su ' + nome + '      : ' + v.verdetto + (v.causa ? ' / ' + v.causa : '')
        + ' · atteso ' + JSON.stringify(v.atteso) + ' · rigiocato ' + JSON.stringify(v.gol)
        + ' · passi ' + v.passi + ' · righe ' + v.righe);
    }
    console.log('errori di pagina  : A ' + A.errori.length + ' · B ' + B.errori.length);
    if (A.errori.length) console.log('  A: ' + A.errori.slice(0, 3).join(' | '));
  } finally {
    await A.ctx.close(); await B.ctx.close();
    await browser.close(); srv.chiudi(); cass.chiudi();
  }
})().catch(e => { console.error('BANCO ESPLOSO: ' + e.message); process.exit(2); });
