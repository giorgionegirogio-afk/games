/* =====================================================================
   _q-dischetto-seme.js — IL SEME «A DUE MANI» LO DEVONO TENERE IN DUE
   (voce #149 compito 3, riscritto dalla voce #150 compito 1)

   COM'ERA, E PERCHE' NON BASTA PIU'. Nato col #149, questo cancello
   DOCUMENTAVA un difetto aperto: due prove sole, dieci giri, e il
   criterio «il baro non vince SEMPRE». Andava bene per dire «il buco
   c'e'», e infatti diceva 10 su 10. Non basta per dire «il buco e'
   chiuso»: un baro che vincesse il 70% delle volte passerebbe quel
   criterio senza che nessuno se ne accorga, e DIECI PROVE DISTINGUONO
   MALE 5/10 DA 7/10. Il #141 ha gia' pagato questa lezione con un'altra
   moneta: «il 95% non e' decidibile con 6 tentativi».

   LA POTENZA DELLA MISURA, DICHIARATA PRIMA DI MISURARE.
   n = 400 appuntamenti per braccio (un appuntamento costa ~0,04 s sul
   banco), e si e' rossi se il baro vince PIU' della soglia

       soglia = n/2 + 1,225 * radice(n)          (400 -> 224, cioe' 56%)

   che sotto il caso puro (p = 0,5) lascia passare un falso rosso
   0,7 volte su cento, e prende:
       un baro al 60%  ->  94 su 100
       un baro al 65%  ->  99,98 su 100
       il difetto di oggi (100%) -> sempre
   Il cancello si stampa questi tre numeri da se', ricalcolati sul n che
   gli e' stato dato: un banco che dichiara una potenza che non ha e'
   peggio di un banco che non ne dichiara nessuna.

   I DUE BARI DEL SEME, E DOVE MORDONO.
     semesuo      ritarda il saluto, legge quello dell'altro e macina
                  4096 nonce per il bit che vuole.                -> S1
     semepaziente NON PARLA finche' non ha in mano il nonce dell'altro.
                  E' il piu' cattivo dei due perche' non e' statistico:
                  o il protocollo glielo fa vedere (e allora sceglie
                  sapendo tutto, sempre) o non glielo fa vedere (e allora
                  resta li'). Il suo esito giusto e' lo STALLO.  -> S5
     semerivelato si impegna su un nonce e ne rivela un altro.     -> S4

   LE SETTE PROVE
     S1  il baro che si sceglie il nonce non vince il bit piu' del caso.
     S2  TESTIMONE — lo stesso braccio a bugia spenta sta anch'esso sotto
         la soglia. Senza, «il baro vince sempre» potrebbe voler dire che
         il lato 'b' tira sempre per primo, e il banco misurerebbe il
         proprio sorteggio invece dell'attacco.
     S3  il saluto del GIOCO, letto DENTRO LA CASSETTA, non porta il
         nonce in chiaro ma il suo impegno. E' la misura diretta del
         difetto: non si chiede al gioco «hai barato?», si guarda la
         busta che ha imbucato.
     S4  il baro che rivela un nonce DIVERSO da quello impegnato non
         porta mai a casa il seme che ha scelto.
     S5  il baro paziente non chiude MAI l'appuntamento: chi non si
         impegna non vede niente.
     S6  TESTIMONE DEL BANCO — due telefoni onesti si danno appuntamento
         e i due semi coincidono. Senza, un banco rotto in modo da essere
         rosso sempre «condannerebbe» ogni bugia senza discriminare
         niente.
     S7  un pari che dichiara una versione del protocollo che non
         conosciamo viene RIFIUTATO con causa vera (`versione-diversa`),
         non accusato e non servito.

   IL BANCO E' FINTO E SI DICHIARA: la cassetta e' quella in memoria di
   _dischetto-due-telefoni.js, col freno SPENTO (qui si misura il seme,
   non il freno: quello e' il gruppo E di _q-dischetto). Il server vero
   risponde ma non ha un database — senza SUPABASE_URL dice
   {"ok":false,"errore":"spento"} — quindi puntarci un banco
   misurerebbe un 503, non un protocollo.

   uso:  node strumenti/_q-dischetto-seme.js [--gioco f.html]
                                             [--giri 400] [--secchi 40]
   esce  0 se il seme resta a due mani · 1 se una mano se lo prende ·
         2 se il banco e' esploso · 3 prova nulla
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const T = require('./_dischetto-due-telefoni.js');

const RADICE = T.RADICE;
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const GIOCO = arg('gioco');
if (GIOCO && !fs.existsSync(path.resolve(RADICE, GIOCO))) {
  console.error('PROVA NULLA: il file indicato non esiste: ' + GIOCO);
  process.exit(3);
}
const PROVA = GIOCO ? path.resolve(RADICE, GIOCO) : null;
const N = Math.max(40, Math.min(2000, parseInt(arg('giri', '400'), 10) || 400));
/* i bracci SECCHI non sono statistici: il protocollo o regge o non
   regge. Quaranta tentativi: se l'attacco riuscisse anche solo una volta
   su dieci, il banco lo vedrebbe con probabilita' 98,5%. */
const SECCHI = Math.max(10, Math.min(200, parseInt(arg('secchi', '40'), 10) || 40));
const SOGLIA = Math.floor(N / 2 + 1.225 * Math.sqrt(N));

/* la normale cumulativa, per dichiarare la potenza invece di affermarla.
   Abramowitz-Stegun 7.1.26 sulla erf: basta e avanza a tre cifre. */
function Phi(z) {
  const s = z < 0 ? -1 : 1, x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return 0.5 * (1 + s * y);
}
/* P(vinte > SOGLIA) quando il baro vince con probabilita' p, con la
   correzione di continuita' */
const potenza = p => 1 - Phi((SOGLIA + 0.5 - N * p) / Math.sqrt(N * p * (1 - p)));

const esiti = [];
const di = (ok, nome, det) => { esiti.push(!!ok); console.log((ok ? '  OK  ' : '  NO  ') + nome + (det ? '   [' + det + ']' : '')); };
const pc = x => (x * 100).toFixed(x > 0.999 || x < 0.001 ? 3 : 2) + '%';

const d_stato = P => P.pag.evaluate(() => window.__test.dischetto.stato);
const d_giro = P => P.pag.evaluate(async () => await window.__test.dischetto.giro());
const d_crea = P => P.pag.evaluate(async () => await window.__test.dischetto.crea());
const d_entra = (P, c) => P.pag.evaluate(async c => await window.__test.dischetto.entra(c), c);
const d_chiudi = P => P.pag.evaluate(() => window.__test.dischetto.chiudi());
const d_vers = P => P.pag.evaluate(() => window.__test.dischetto.v | 0);

(async () => {
  console.log('\nIL SEME A DUE MANI, E LA MANO CHE PROVA A PRENDERSELO' + (GIOCO ? '   [' + GIOCO + ']' : ''));
  const sg = await T.serviGioco(PROVA);
  const cass = await T.serviCassetta({ frenoAcceso: false });
  const browser = await chromium.launch();
  let esploso = null;
  const aperti = [];
  try {
    const A = await T.apri(browser, sg.porta); aperti.push(A);
    if (!await A.pag.evaluate(() => !!(window.__test && window.__test.dischetto))) {
      console.error('PROVA NULLA: questo gioco non ha la sfida dal dischetto.');
      for (const P of aperti) await P.ctx.close();
      await browser.close(); sg.chiudi(); cass.chiudi();
      process.exit(3);
    }
    const base = 'http://127.0.0.1:' + cass.porta;
    await T.collega(A, cass.porta, 'ALFA');
    await T.entra(A);
    const VERS = await d_vers(A);

    console.log('\n  LA POTENZA DELLA MISURA, PRIMA DI MISURARE');
    console.log('    protocollo del gioco: v' + VERS + ' · ' + N + ' appuntamenti per braccio statistico, ' +
                SECCHI + ' per braccio secco');
    console.log('    rosso se il baro vince piu\' di ' + SOGLIA + ' su ' + N +
                ' (' + (100 * SOGLIA / N).toFixed(1) + '%)');
    console.log('    falso rosso sotto il caso puro: ' + pc(potenza(0.5)) +
                ' · potenza contro un baro al 60%: ' + pc(potenza(0.60)) +
                ' · al 65%: ' + pc(potenza(0.65)) +
                ' · al 100%: ' + pc(1));

    /* il saluto che il GIOCO ha imbucato, letto dalla cassetta e non
       chiesto al gioco: un banco che chiede «hai barato?» non misura */
    const bustaSaluto = stanza => {
      const c = cass.db.stanze.get(stanza);
      if (!c) return null;
      const m = c.msg.find(x => x.k === 'S' && x.r === 'a');
      return m ? m.d : null;
    };
    /* IL NONCE DEL GIOCO, comunque il protocollo glielo faccia uscire:
       dentro il saluto (v1) o dentro la rivelazione (v2). Serve per
       RICALCOLARE il seme e sapere se il baro ha davvero portato a casa
       quello che ha scelto — «l'appuntamento si e' chiuso» da solo non
       lo dice, perche' potrebbe essersi chiuso sul nonce impegnato. */
    const nonceGioco = stanza => {
      const c = cass.db.stanze.get(stanza);
      if (!c) return null;
      const n = c.msg.find(x => x.k === 'N' && x.r === 'a');
      if (n && n.d && n.d.n) return n.d.n;
      const s = c.msg.find(x => x.k === 'S' && x.r === 'a');
      return (s && s.d && s.d.n) || null;
    };

    /* UN APPUNTAMENTO SOLO, e chi lo chiude decide chi tira per primo.
       Il pari finto entra come lato 'b', cioe' come chi arriva per
       secondo: e' esattamente la posizione dell'attacco. */
    async function unGiro(bugia, vFinta) {
      const r = await d_crea(A);
      const cred = await T.credenziali(base);
      const P = new T.PariFinto(base, cred, r.stanza, 'b', bugia || {});
      /* IL RESPIRO DEL GIOCO, ed e' la riga che fa di questo banco una
         misura invece di un'attestazione: mentre il baro aspetta, il
         telefono deve poter fare il proprio giro di rete. Senza, il baro
         paziente si arrende prima che il gioco abbia parlato e la MEZZA
         CURA passa per cura — misurato, voce #150. */
      P.respiro = () => d_giro(A);
      const s0 = await d_stato(A);
      await P.saluta({ v: (vFinta == null ? VERS : vFinta), mv: s0.motoreV, imp: s0.impronta,
                       rosa: T.rosaFinta(3), n: T.esa(crypto.randomBytes(8)) });
      let s = null;
      for (let g = 0; g < 20; g++) {
        await d_giro(A);
        await P.ritira();
        await P.rivelaNonce();
        s = await d_stato(A);
        if (s && (s.primo || s.fase === 'fine')) break;
      }
      const busta = bustaSaluto(r.stanza);
      const suo = nonceGioco(r.stanza);
      await d_chiudi(A);
      return {
        primo: (s && s.primo) || '', seme: (s && s.seme) || 0,
        fase: s && s.fase, causa: s && s.causa, busta, nonceGioco: suo,
        impegnato: P.mioNonce, rivelato: P.nonceRivelato, muto: !!P.pazienzaPersa,
      };
    }

    /* ---------------------------------------- S1 e S2: i due bracci */
    let vinteF = 0, misF = 0, chiareF = 0;
    for (let i = 0; i < N; i++) {
      const g = await unGiro({ semesuo: true });
      if (!g.primo) continue;
      misF++; if (g.primo === 'b') vinteF++;
      if (g.busta && g.busta.n) chiareF++;
    }
    let vinteO = 0, misO = 0, chiareO = 0, rispecchio = 0;
    for (let i = 0; i < N; i++) {
      const g = await unGiro({});
      if (!g.primo) continue;
      misO++; if (g.primo === 'b') vinteO++;
      if (g.busta && g.busta.n) chiareO++;
      /* IL BANCO SA RICALCOLARE IL SEME? Se questo conto restasse zero,
         S4 sarebbe verde per cecita' e non per merito: il confronto non
         combacerebbe MAI, nemmeno quando deve. E' la meta' che manca a
         quasi tutti i banchi. */
      if (g.nonceGioco && (g.seme >>> 0) === ((T.mescola(g.nonceGioco, g.impegnato) >>> 0) || 1)) rispecchio++;
    }
    if (!misF || !misO) {
      console.error('PROVA NULLA: nessun appuntamento si e\' chiuso (il pari finto non ha parlato)');
      for (const P of aperti) await P.ctx.close();
      await browser.close(); sg.chiudi(); cass.chiudi();
      process.exit(3);
    }
    /* LA SOGLIA SI SCALA SUGLI APPUNTAMENTI CHE SI SONO DAVVERO CHIUSI:
       se qualcuno e' andato perso, dichiarare il conto su N sarebbe
       dichiarare una potenza che non si ha. */
    const sogliaDi = m => Math.floor(m / 2 + 1.225 * Math.sqrt(m));
    console.log('');
    di(vinteF <= sogliaDi(misF),
       'S1) il baro che ritarda il saluto e si sceglie il nonce non vince il bit piu\' del caso',
       'vinte ' + vinteF + ' su ' + misF + ', soglia ' + sogliaDi(misF) +
       (vinteF > sogliaDi(misF) ? '   IL SEME A DUE MANI LO TIENE UNA MANO SOLA' : ''));
    di(vinteO <= sogliaDi(misO),
       'S2) TESTIMONE — lo stesso braccio a bugia spenta sta anche lui sotto la soglia',
       'vinte ' + vinteO + ' su ' + misO + ', soglia ' + sogliaDi(misO) +
       (vinteO > sogliaDi(misO) ? '   il banco sta misurando il proprio sorteggio, non l\'attacco' : ''));

    /* ------------------------------ S3: la busta, guardata nella cassetta */
    const chiare = chiareF + chiareO, buste = misF + misO;
    di(chiare === 0,
       'S3) il saluto del gioco porta l\'IMPEGNO del nonce, non il nonce in chiaro',
       'saluti col nonce in chiaro: ' + chiare + ' su ' + buste +
       (chiare ? '   chi entra per secondo lo legge e se ne sceglie uno su misura' : ''));

    /* ---------------------------- S4: chi rivela un nonce che non e' il suo */
    let scambiati = 0, misR = 0; const causeR = new Map();
    for (let i = 0; i < SECCHI; i++) {
      const g = await unGiro({ semerivelato: true });
      misR++;
      if (g.causa) causeR.set(g.causa, (causeR.get(g.causa) || 0) + 1);
      /* IL SEME SI RICALCOLA, non si deduce dalla fase. Il baro ha
         portato a casa quel che ha scelto solo se il seme del gioco e'
         quello che esce dal nonce SCAMBIATO: un appuntamento chiuso sul
         nonce impegnato e' il protocollo che tiene, non il baro che
         vince, e confondere le due cose sarebbe un'accusa gratis. */
      if (g.primo && g.rivelato && g.rivelato !== g.impegnato && g.nonceGioco &&
          (g.seme >>> 0) === ((T.mescola(g.nonceGioco, g.rivelato) >>> 0) || 1)) scambiati++;
    }
    const dettoR = [...causeR.entries()].map(([k, v]) => k + '×' + v).join(' ') || 'nessuna';
    di(scambiati === 0 && rispecchio > 0,
       'S4) il baro che rivela un nonce diverso da quello impegnato non porta a casa niente',
       'appuntamenti chiusi col nonce scambiato: ' + scambiati + ' su ' + misR + ' · cause: ' + dettoR +
       ' · TESTIMONE del ricalcolo: ' + rispecchio + ' su ' + misO + ' semi onesti ricomposti dal banco' +
       (rispecchio ? '' : '   IL BANCO NON SA RICALCOLARE IL SEME: questa prova non discrimina niente'));

    /* -------------------------------------------- S5: il baro paziente */
    let chiusiP = 0, vinteP = 0, mutiP = 0;
    for (let i = 0; i < SECCHI; i++) {
      const g = await unGiro({ semepaziente: true });
      if (g.muto) mutiP++;
      if (g.primo) { chiusiP++; if (g.primo === 'b') vinteP++; }
    }
    di(chiusiP === 0,
       'S5) il baro che aspetta di vedere il nonce dell\'altro prima di scegliere il proprio resta a bocca asciutta',
       'appuntamenti chiusi ' + chiusiP + ' su ' + SECCHI + ' (bit vinti ' + vinteP + '), stalli ' + mutiP +
       (chiusiP ? '   ha scelto SAPENDO, e il gioco gliel\'ha lasciato fare' : ''));

    /* ------------------------ S6: due telefoni onesti, il testimone del banco */
    const B = await T.apri(browser, sg.porta); aperti.push(B);
    await T.collega(B, cass.porta, 'BETA');
    await T.entra(B);
    let coppie = 0, uguali = 0;
    for (let i = 0; i < 5; i++) {
      const r = await d_crea(A);
      await d_entra(B, r.stanza);
      let sa = null, sb = null;
      for (let g = 0; g < 20; g++) {
        [sa, sb] = await Promise.all([d_stato(A), d_stato(B)]);
        if (sa.seme && sb.seme) break;
        await Promise.all([d_giro(A), d_giro(B)]);
      }
      if (sa && sb && sa.seme && sb.seme) { coppie++; if (sa.seme === sb.seme && sa.primo === sb.primo) uguali++; }
      await d_chiudi(A); await d_chiudi(B);
    }
    di(coppie === 5 && uguali === 5,
       'S6) TESTIMONE DEL BANCO — due telefoni onesti si danno appuntamento e i due semi coincidono',
       'appuntamenti chiusi ' + coppie + ' su 5, semi uguali ' + uguali +
       (coppie < 5 ? '   il banco non sa far chiudere un appuntamento: non assolve e non condanna' : ''));
    /* ------------------------------- S7: una versione che non conosciamo */
    let serviti = 0, rifiutati = 0; const causeV = new Map();
    for (let i = 0; i < 5; i++) {
      const g = await unGiro({}, VERS + 7);
      if (g.primo) serviti++;
      if (g.causa) causeV.set(g.causa, (causeV.get(g.causa) || 0) + 1);
      if (g.causa === 'versione-diversa') rifiutati++;
    }
    const dettoV = [...causeV.entries()].map(([k, v]) => k + '×' + v).join(' ') || 'nessuna';
    di(serviti === 0 && rifiutati === 5,
       'S7) un pari di una versione che non conosciamo e\' RIFIUTATO con causa vera, non servito',
       'serviti ' + serviti + ' su 5 · rifiutati per versione ' + rifiutati + ' · cause: ' + dettoV);

  } catch (e) { esploso = e; }
  finally {
    for (const P of aperti) { try { await P.ctx.close(); } catch (x) {} }
    try { await browser.close(); } catch (x) {}
    try { sg.chiudi(); } catch (x) {}
    try { cass.chiudi(); } catch (x) {}
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
