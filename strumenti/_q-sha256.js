/* =====================================================================
   _q-sha256.js — LA SHA-256 SCRITTA A MANO, CONTRO QUELLA DI NODE
   (voce #149, compito 3)

   PERCHE' NASCE OGGI, E NON AL #146. Il verbale del #146 dichiara: «la
   SHA-256 e' scritta a mano ... confrontata con quella di Node su 409
   casi prima di entrare nel gioco — compresi i tre bordi di riempimento
   (55, 56, 64 byte) e il testo con accenti: identiche tutte e 409».

   LA REVISIONE D'INSIEME DELL'ONDA E HA CERCATO QUEI 409 CASI E NON LI
   HA TROVATI: «409» non compare in `strumenti/`, non in `rete/`, non nel
   piano e non nella spec. Il confronto e' stato fatto una volta, a mano,
   e il numero e' finito a verbale senza uno strumento che lo rifaccia.
   E non e' un numero qualunque: `dsSha256` regge `dsImpegno`, cioe' la
   funzione da cui dipende l'unica accusa di tutto il cantiere del
   dischetto (`impegno-non-torna`).

   O SI SCRIVE IL BANCO, O SI RITIRA IL NUMERO. Questo e' il banco.

   I 409 CASI, e come sono fatti (deterministici, nessun sorteggio: due
   esecuzioni confrontano le stesse stringhe):

     256  ogni lunghezza da 0 a 255 byte di un motivo fisso. Ci stanno
          dentro i TRE BORDI DI RIEMPIMENTO che il #146 nomina — 55, 56 e
          64 — che sono il posto in cui una SHA-256 scritta a mano
          sbaglia: a 55 byte il riempimento entra nel blocco, a 56 no e
          serve un blocco in piu', a 64 il messaggio e' un blocco esatto.
     128  stringhe pseudocasuali da un GENERATORE SEMINATO (xorshift32,
          seme 20260924): a caso ma le stesse a ogni corsa, come vuole
          questa casa.
      25  i casi scomodi, tutti dentro il piano base: testo con accenti
          (dove una implementazione che conta i CARATTERI invece dei BYTE
          sbaglia), greco, cinese, euro, spazi, stringhe gia' esadecimali,
          e le forme vere che il protocollo passa a dsImpegno. Il fuori-
          piano base non sta qui: sta in H4, perche' li' non combacia ed e'
          un LIMITE dichiarato, non un caso.

   IL TESTIMONE, senza il quale «identiche tutte e 409» non prova niente:
   un caso col testo sporcato di un carattere DEVE dare hash diversi. Un
   banco che confronta due cose sempre uguali non discrimina niente.

   E UN LIMITE TROVATO DA QUESTO BANCO, dichiarato invece che taciuto: FUORI
   DAL PIANO BASE le due implementazioni NON combaciano. `dsSha256` scrive
   tre byte per ogni unita' UTF-16, e un'emoji e' due unita' surrogate:
   CESU-8, non UTF-8. Non morde perche' tutto quel che il protocollo hasha e'
   ASCII — e H4 lo MISURA su trecento mosse invece di darlo per buono, cosi'
   il giorno in cui una parola scritta da una persona entrasse nel protocollo
   il cancello lo direbbe PRIMA che due telefoni si accusino a vicenda.

   uso:  node strumenti/_q-sha256.js [--gioco f.html]
   esce  0 se tutti i casi combaciano e il testimone morde ·
         1 se anche uno solo diverge · 2 se il banco e' esploso ·
         3 se il gioco indicato non espone dsSha256
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const T = require('./_dischetto-due-telefoni.js');

const RADICE = T.RADICE;
const arg = n => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : null; };
const GIOCO = arg('gioco');
if (GIOCO && !fs.existsSync(path.resolve(RADICE, GIOCO))) {
  console.error('PROVA NULLA: il file indicato non esiste: ' + GIOCO);
  process.exit(3);
}
const PROVA = GIOCO ? path.resolve(RADICE, GIOCO) : null;

const esiti = [];
const di = (ok, nome, det) => { esiti.push(!!ok); console.log((ok ? '  OK  ' : '  NO  ') + nome + (det ? '   [' + det + ']' : '')); };

/* IL MOTIVO FISSO delle 256 lunghezze: caratteri stampabili che
   coprono le classi che contano (cifre, lettere, segni), ripetuti. */
const MOTIVO = 'aB3-zQ9_xY7.mN1,';
const perLunghezza = n => { let s = ''; while (s.length < n) s += MOTIVO; return s.slice(0, n); };

/* IL GENERATORE SEMINATO: xorshift32, lo stesso idioma del gioco. */
function semina(s) {
  let x = s >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x; };
}
const ALF = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789|,.-_';

/* I VENTICINQUE CASI SCOMODI, TUTTI DENTRO IL PIANO BASE. Il fuori-piano
   sta in H4, che e' un'altra domanda: qui si misura se le due
   implementazioni combaciano, li' si misura un limite dichiarato. */
const SCOMODI = [
  'perché', 'città', 'è', 'àèìòù', 'ÀÈÌÒÙ', 'naïve café', 'Ãtest',
  'D1|0|a|t0,-800,200,30|deadbeef', 'D1|9|b|p2|00112233445566778899aabbccddeeff',
  'D1|abcdef0123456789|fedcba9876543210', 'D1||', '|||', ' ', '  ', '\t\n',
  '0000000000000000', 'ffffffffffffffff', 'αβγ greco', '中文',
  '€ euro', 'ES1T0', 'CALCETTO', 'x'.repeat(1000), 'à'.repeat(200), '',
];

/* IL FUORI-PIANO BASE, che sta a parte perche' e' un LIMITE e non un caso.
   `dsSha256` costruisce i byte a mano con tre rami (< 128, < 2048, resto):
   il terzo ramo scrive TRE byte per ogni unita' UTF-16, e un'emoji e' due
   unita' surrogate. Ne esce CESU-8, non UTF-8, e il digest non e' quello di
   Node. */
const FUORI_PIANO = ['𝄞 chiave di violino', '⚽️🥅', '😀'];

(async () => {
  console.log('\nLA SHA-256 SCRITTA A MANO, CONTRO QUELLA DI NODE' + (GIOCO ? '   [' + GIOCO + ']' : ''));
  const casi = [];
  for (let n = 0; n <= 255; n++) casi.push(perLunghezza(n));
  const rnd = semina(20260924);
  for (let i = 0; i < 128; i++) {
    const L = 1 + (rnd() % 200);
    let s = '';
    for (let k = 0; k < L; k++) s += ALF[rnd() % ALF.length];
    casi.push(s);
  }
  for (const s of SCOMODI) casi.push(s);

  const sg = await T.serviGioco(PROVA);
  const browser = await chromium.launch();
  let esploso = null;
  let P = null;
  try {
    P = await T.apri(browser, sg.porta);
    const c = await P.pag.evaluate(() => typeof dsSha256 === 'function');
    if (!c) {
      console.error('PROVA NULLA: questo gioco non espone dsSha256.');
      await P.ctx.close(); await browser.close(); sg.chiudi();
      process.exit(3);
    }
    const suoi = await P.pag.evaluate(v => v.map(s => dsSha256(s)), casi);
    const nostri = casi.map(s => crypto.createHash('sha256').update(s, 'utf8').digest('hex'));
    const storti = [];
    for (let i = 0; i < casi.length; i++)
      if (String(suoi[i]).toLowerCase() !== nostri[i]) storti.push(i);

    const bordi = [55, 56, 64].every(n => suoi[n] && String(suoi[n]).toLowerCase() === nostri[n]);
    di(storti.length === 0 && casi.length === 409,
       'H1) tutti i ' + casi.length + ' casi danno lo stesso digest di Node',
       storti.length
         ? (storti.length + ' diversi, il primo e\' il caso #' + storti[0] + ' (lungo ' +
            casi[storti[0]].length + '): gioco ' + suoi[storti[0]] + ' · Node ' + nostri[storti[0]])
         : ('256 lunghezze da 0 a 255 + 128 seminati + ' + SCOMODI.length + ' scomodi'));
    di(bordi, 'H2) e i TRE BORDI DI RIEMPIMENTO (55, 56, 64 byte) combaciano',
       [55, 56, 64].map(n => n + ':' + (String(suoi[n]).toLowerCase() === nostri[n] ? 'ok' : 'STORTO')).join(' · '));

    /* IL TESTIMONE: senza, «tutte identiche» e «il banco confronta due
       volte la stessa cosa» sono lo stesso referto. */
    const sporco = 'perché' + '́';
    const [a, b] = await Promise.all([
      P.pag.evaluate(s => dsSha256(s), 'perché'),
      P.pag.evaluate(s => dsSha256(s), sporco),
    ]);
    di(a !== b && String(b).toLowerCase() === crypto.createHash('sha256').update(sporco, 'utf8').digest('hex'),
       'H3) TESTIMONE — un carattere in piu\' cambia il digest, e lo cambia come lo cambia Node',
       'perché -> ' + String(a).slice(0, 16) + '… · perché+accento -> ' + String(b).slice(0, 16) + '…');

    /* =====================================================================
       H4 — IL LIMITE, MISURATO E DICHIARATO invece che taciuto.

       TROVATO DA QUESTO BANCO AL PRIMO VERDE, e vale la pena scrivere come:
       nella prima stesura i 409 casi comprendevano due emoji, e DUE SU 409
       divergevano. Non era un difetto del banco: `dsSha256` costruisce i
       byte con tre rami (< 128, < 2048, resto) e il terzo scrive tre byte
       per ogni unita' UTF-16. Un'emoji e' DUE unita' surrogate, quindi ne
       escono sei byte in CESU-8 invece dei quattro di UTF-8, e il digest
       non e' quello di Node.

       NON MORDE, E IL PERCHE' SI MISURA invece di ragionarlo: tutto quel che
       il protocollo passa a `dsSha256` e' ASCII — il testo della mossa
       (`dsTestoMossa`: una lettera, cifre e virgole), il nonce (esadecimale)
       e i separatori. Qui si generano trecento mosse e si verifica che il
       testo che ne esce non abbia un solo carattere sopra 127.

       IL GIORNO IN CUI QUALCOSA DI NON-ASCII ENTRASSE NEL PROTOCOLLO — un
       nome di squadra, una parola scritta da una persona — questa riga
       diventerebbe rossa PRIMA che due telefoni si accusino a vicenda con
       `impegno-non-torna`, che e' l'unica accusa di tutto il cantiere del
       dischetto. */
    const fuori = await P.pag.evaluate(v => v.map(s => dsSha256(s)), FUORI_PIANO);
    const fuoriNode = FUORI_PIANO.map(s => crypto.createHash('sha256').update(s, 'utf8').digest('hex'));
    const divergono = FUORI_PIANO.filter((s, i) => String(fuori[i]).toLowerCase() !== fuoriNode[i]).length;
    const ascii = await P.pag.evaluate(() => {
      let peggio = 0, quante = 0;
      for (let t = 0; t < 10; t++) {
        for (let z = 0; z < 3; z++) {
          for (let ps = 0; ps <= 100; ps += 10) {
            for (const m of [{ ruolo: 't', z, u: (t * 317) % 1600 - 800, v: 200 + ps, ps },
                             { ruolo: 'p', z }]) {
              const s = dsTestoMossa(m);
              quante++;
              for (let i = 0; i < s.length; i++) peggio = Math.max(peggio, s.charCodeAt(i));
            }
          }
        }
      }
      return { peggio, quante };
    });
    di(ascii.peggio < 128 && ascii.quante >= 300,
       'H4) IL LIMITE: fuori dal piano base il gioco scrive CESU-8 e diverge da Node — e il protocollo non ci passa mai',
       divergono + ' su ' + FUORI_PIANO.length + ' fuori-piano divergono (atteso: divergono, e\' il limite) · ' +
       'il protocollo e\' ASCII: su ' + ascii.quante + ' mosse il carattere piu\' alto e\' ' + ascii.peggio +
       (ascii.peggio < 128 ? ' (< 128)' : '   NON-ASCII NEL PROTOCOLLO: la divergenza adesso morde'));
  } catch (e) { esploso = e; }
  finally {
    try { if (P) await P.ctx.close(); } catch (x) {}
    try { await browser.close(); } catch (x) {}
    try { sg.chiudi(); } catch (x) {}
  }
  if (esploso) {
    console.error('\nIL BANCO E\' ESPLOSO: ' + (esploso && esploso.message));
    console.error(esploso && esploso.stack);
    process.exit(2);
  }
  const rossi = esiti.filter(x => !x).length;
  console.log('\n  ' + (esiti.length - rossi) + ' su ' + esiti.length + (rossi ? ('   ROSSI: ' + rossi) : '   verde'));
  process.exit(rossi ? 1 : 0);
})();
