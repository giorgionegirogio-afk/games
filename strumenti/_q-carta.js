/* =====================================================================
   _q-carta.js — LA SFIDA STA IN UN MESSAGGIO, E NON PORTA VIA
   L'IDENTITA' DI NESSUNO (voce #135). Nasce ROSSO: nel gioco non c'e'
   niente, `window.__test.carta` non esiste.

   CHE COSA MISURA, e perche' non lo misura nessun altro cancello.
   L'onda D ha costruito la sfida di RETE e il suo giudizio: il metro
   (#130), il duello nel nastro (#131), i cinque canali (#132), il
   giudice (#133), il sigillo (#134). Tutti e cinque poggiano su una
   cosa: c'e' un server. Il mandato (S5, punto 12b) chiede l'altra
   meta' — due persone che si sfidano incollandosi un codice, senza
   conto, senza rete, senza server.

   `rete` e `sfida` sorvegliano il motore e la schermata della sfida
   ONLINE e non sanno niente di un codice. `senza-rete` pretende che il
   gioco si apra senza una richiesta, ma non conosce questa funzione.
   Nessuno guarda quel che questo cancello guarda.

   QUATTRO GRUPPI.

   A) IL CODICE. Impacca-e-spacca dev'essere l'identita'; il codice deve
      stare in un messaggio; il controllo deve prendere gli errori di
      battitura — e si misura ESAUSTIVAMENTE sulle due classi che
      contano (una cifra cambiata, due scambiate), non a occhio. Piu' i
      rifiuti: un altro motore, un'altra versione, un codice troncato,
      una lettera che nell'alfabeto non c'e'.

   B) DENTRO IL CODICE NON C'E' NESSUNO. E' il gruppo piu' importante di
      tutto il cantiere. `Rete.codiceTrasferimento()` produce
      `id.segreto.controllo`, e chi lo incolla DIVENTA quella squadra
      (`accettaTrasferimento` scrive m.id e m.segreto): darlo a un amico
      per sfidarlo vuol dire regalargli la squadra. Il codice della
      sfida non deve contenere NIENTE che dipenda da chi lo genera.
      LA PROVA CHE DISCRIMINA NON E' LA RICERCA DI SOTTOSTRINGHE — un
      falso che ci infilasse il segreto cifrato la passerebbe. E' che
      DUE TELEFONI con identita' diverse e stessa partita devono
      produrre lo STESSO codice, carattere per carattere. E al
      contrario: leggere un codice non deve cambiare di un carattere
      l'identita' di chi legge.

   C) DUE TELEFONI, LA STESSA PARTITA. Qui non si scambia un nastro (i
      tocchi in coordinate di schermo, voce #133): si scambia una
      partita da rigiocare da zero. Percio' lo schermo NON entra nel
      codice — ma va dimostrato, non dichiarato: stesso codice, viste
      diverse, salvataggi diversi, e la partita dev'essere la stessa al
      sorteggio.

   D) LA SCHERMATA, E LA RETE CHE NON C'E'. Il pannello, le cause dette
      in italiano, la piega (CERCA AVVERSARIO e la prima riga della
      lista non si muovono di un pixel: e' il cancello `_q-sigillo` B3
      che lo pretende, e il difetto gia' pagato e' quello del TORNEO), e
      ZERO richieste di rete in tutto il giro — creare, giocare,
      incollare, rigiocare.

   uso:  node strumenti/_q-carta.js
         node strumenti/_q-carta.js --gioco fuori/x.html
         node strumenti/_q-carta.js --solo A,B
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const T = require('./_sfida-due-telefoni.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
const gruppiChiesti = arg('solo', 'A,B,C,D').toUpperCase().split(',').map(s => s.trim());

let ok = 0, no = 0;
const di = (buono, nome, det) => {
  if (buono) { ok++; console.log('  OK  ' + nome + (det ? '  [' + det + ']' : '')); }
  else { no++; console.log('  NO  ' + nome + (det ? '  [' + det + ']' : '')); }
};
const titolo = t => console.log('\n' + t);

/* LA SOGLIA DELLA LUNGHEZZA, e da dove viene. Un SMS sta in 160
   caratteri: e' il tetto piu' basso fra i posti dove un codice del
   genere viene incollato davvero (WhatsApp e Telegram ne reggono
   migliaia). Si pretende meno della meta' — 100 — perche' un codice che
   riempie il messaggio e' un codice che chi lo riceve non riesce a
   selezionare con un tocco solo. Misurato al compito 0: 79 caratteri. */
const TETTO_CARATTERI = 100;

/* la porta del gioco. Se non c'e', ogni prova e' rossa: e' il difetto,
   non un guasto del banco. */
const haPorta = P => P.pag.evaluate(() => !!(window.__test && window.__test.carta));

/* =====================================================================
   IL GIRO DEL CODICE, TUTTO DENTRO LA PAGINA.

   Sta in una funzione sola passata a evaluate perche' le prove di forma
   (l'identita' del giro, la lunghezza, il controllo esaustivo) sono
   aritmetica pura: farle in pagina costa un viaggio invece di mille, e
   soprattutto le fa fare AL GIOCO — un banco che rifacesse l'alfabeto
   in Node misurerebbe la propria copia del formato, non quella spedita.
   ===================================================================== */
const GIRO_A = `(function(){
  const t = window.__test, C = t.carta;
  const out = { errori: [] };
  const semi = [20260922, 20260923, 1, 4294967295, 777, 123456789, 2147483648, 99];
  /* 1) impacca e spacca e' l'identita'? */
  let identici = 0, lunghezze = [], esempio = '';
  for(const s of semi){
    for(const tg of [5,7,11]){
      for(const ga of [0,3,17]){
        const o = C.componi(s, tg);
        o.golA = ga; o.golD = (ga*2+1) % 31;
        const testo = C.impacca(o);
        if(!esempio) esempio = testo;
        lunghezze.push(testo.length);
        const r = C.spacca(testo);
        const uguale = !r.errore && r.ver === o.ver && r.motore === o.motore &&
          r.taglia === o.taglia && r.seme === o.seme && r.mentA === o.mentA &&
          r.mentD === o.mentD && r.car === o.car && r.golA === o.golA && r.golD === o.golD &&
          JSON.stringify(r.rosaA.map(x => [x.vel,x.tiro,x.tecnica,x.tackle])) ===
          JSON.stringify(o.rosaA.map(x => [x.vel,x.tiro,x.tecnica,x.tackle])) &&
          JSON.stringify(r.rosaD.map(x => [x.vel,x.tiro,x.tecnica,x.tackle])) ===
          JSON.stringify(o.rosaD.map(x => [x.vel,x.tiro,x.tecnica,x.tackle]));
        if(uguale) identici++; else if(out.errori.length < 4) out.errori.push(JSON.stringify(r).slice(0,180));
      }
    }
  }
  out.prove = semi.length * 9;
  out.identici = identici;
  out.lungMin = Math.min.apply(null, lunghezze);
  out.lungMax = Math.max.apply(null, lunghezze);
  out.esempio = esempio;

  /* 2) il controllo, ESAUSTIVO sulle due classi che il mandato nomina */
  const ALF = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const base = esempio;
  const corpo = base.slice(5);
  let provA = 0, preseA = 0;
  for(let i = 0; i < corpo.length; i++){
    for(let v = 0; v < 32; v++){
      if(ALF[v] === corpo[i]) continue;
      provA++;
      if(C.spacca('CARTA' + corpo.slice(0,i) + ALF[v] + corpo.slice(i+1)).errore) preseA++;
    }
  }
  out.unaCifra = { prove: provA, prese: preseA };
  let provB = 0, preseB = 0;
  for(let i = 0; i < corpo.length; i++){
    for(let j = i+1; j < corpo.length; j++){
      if(corpo[i] === corpo[j]) continue;
      const a = corpo.split(''); const x = a[i]; a[i] = a[j]; a[j] = x;
      provB++;
      if(C.spacca('CARTA' + a.join('')).errore) preseB++;
    }
  }
  out.dueScambiate = { prove: provB, prese: preseB };
  /* e a campione, da 1 a 4 simboli a caso */
  let h = 20260922 >>> 0;
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h >>>= 0; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  let provC = 0, preseC = 0;
  for(let k = 0; k < 30000; k++){
    const a = corpo.split('');
    const quante = 1 + ((rnd()*4)|0);
    for(let q = 0; q < quante; q++) a[(rnd()*a.length)|0] = ALF[(rnd()*32)|0];
    const s = a.join('');
    if(s === corpo) continue;
    provC++;
    if(C.spacca('CARTA' + s).errore) preseC++;
  }
  out.aCaso = { prove: provC, prese: preseC };

  /* 3) i rifiuti, uno per uno */
  const o = C.componi(20260922, 5); o.golA = 3; o.golD = 2;
  const buono = C.impacca(o);
  const conVer = (function(){ const p = C.componi(20260922,5); p.golA=3; p.golD=2; p.ver = (o.ver + 1) & 15; return C.impacca(p); })();
  const conMot = (function(){ const p = C.componi(20260922,5); p.golA=3; p.golD=2; p.motore = (o.motore + 1) & 15; return C.impacca(p); })();
  out.rifiuti = {
    buono: C.spacca(buono).errore || '',
    versione: C.spacca(conVer).errore || '',
    motore: C.spacca(conMot).errore || '',
    troncato: C.spacca(buono.slice(0, buono.length - 9)).errore || '',
    lettera: C.spacca(buono.slice(0, 20) + 'U' + buono.slice(21)).errore || '',
    vuoto: C.spacca('').errore || '',
    senzaPrefisso: C.spacca(buono.slice(5)).errore || '',
  };
  /* con spazi, a capo, minuscole e trattini in mezzo deve passare lo
     stesso: e' quel che fanno gli applicativi di messaggistica */
  const sporco = '  ' + buono.slice(0,10).toLowerCase() + '-' + buono.slice(10,30) + '\\n' +
                 buono.slice(30).toLowerCase() + '  ';
  const rSporco = C.spacca(sporco);
  out.sporco = { errore: rSporco.errore || '', seme: rSporco.seme };
  out.semeBuono = C.spacca(buono).seme;

  /* 4) le due serrature contro il codice di trasferimento */
  const trasf = t.rete.codiceTrasferimento();
  out.trasferimento = trasf;
  out.trasfComeSfida = C.spacca(trasf).errore || '(ACCETTATO!)';
  out.sfidaHaPunti = buono.indexOf('.') >= 0;
  /* e il codice della sfida non deve essere accettato come
     trasferimento: si prova sul VERO accettaTrasferimento, ma prima si
     fotografa l'identita' per rimetterla com'era */
  const prima = { id: t.rete.mem().id, segreto: t.rete.mem().segreto };
  const accettato = t.rete.accettaTrasferimento(buono);
  const dopo = { id: t.rete.mem().id, segreto: t.rete.mem().segreto };
  if(accettato){ t.rete.mem().id = prima.id; t.rete.mem().segreto = prima.segreto; }
  out.sfidaComeTrasferimento = { accettato: accettato,
    identitaCambiata: dopo.id !== prima.id || dopo.segreto !== prima.segreto };
  return out;
})`;

async function gruppoA(browser, porta) {
  titolo('A) IL CODICE — il giro, la lunghezza, il controllo, i rifiuti');
  const P = await T.apri(browser, porta, { width: 915, height: 412 });
  try {
    if (!await haPorta(P)) {
      di(false, 'A) la porta __test.carta non c\'e\': il gioco non sa fare un codice di sfida',
         'window.__test.carta === undefined');
      no += 6; console.log('  NO  A1..A7 — niente da misurare senza la porta');
      return;
    }
    const r = await P.pag.evaluate(([g]) => (new Function('return ' + g))()(), [GIRO_A]);

    di(r.identici === r.prove,
       'A1) impacca-e-spacca e\' l\'identita\'', r.identici + '/' + r.prove +
       (r.errori.length ? ' · primo guasto: ' + r.errori[0] : ''));

    di(r.lungMax <= TETTO_CARATTERI,
       'A2) il codice sta in un messaggio (tetto ' + TETTO_CARATTERI + ' caratteri)',
       'lunghezza ' + r.lungMin + '..' + r.lungMax + ' · SMS 160: ' +
       (r.lungMax <= 160 ? 'ci sta' : 'NON ci sta') + ' · ' + r.esempio);

    di(r.unaCifra.prese === r.unaCifra.prove && r.unaCifra.prove > 1000,
       'A3a) UNA cifra cambiata: catturate tutte (esaustivo)',
       r.unaCifra.prese + '/' + r.unaCifra.prove + ' = ' +
       (100 * r.unaCifra.prese / Math.max(1, r.unaCifra.prove)).toFixed(3) + '%');

    di(r.dueScambiate.prese === r.dueScambiate.prove && r.dueScambiate.prove > 1000,
       'A3b) DUE cifre scambiate: catturate tutte (esaustivo)',
       r.dueScambiate.prese + '/' + r.dueScambiate.prove + ' = ' +
       (100 * r.dueScambiate.prese / Math.max(1, r.dueScambiate.prove)).toFixed(3) + '%');

    /* la soglia a campione e' 99,9%: con 20 bit di controllo la fuga
       teorica e' una su un milione, e un controllo da UN carattere
       (misurato al compito 0) si ferma al 97,5% — la soglia sta in
       mezzo apposta, cosi' distingue i due */
    const tasso = 100 * r.aCaso.prese / Math.max(1, r.aCaso.prove);
    di(tasso >= 99.9 && r.aCaso.prove > 20000,
       'A3c) da 1 a 4 simboli a caso: almeno il 99,9% catturato',
       r.aCaso.prese + '/' + r.aCaso.prove + ' = ' + tasso.toFixed(3) + '%');

    const R = r.rifiuti;
    di(R.buono === '' && R.versione === 'altra-versione' && R.motore === 'altro-motore' &&
       R.troncato !== '' && R.lettera !== '' && R.vuoto !== '' && R.senzaPrefisso !== '' &&
       r.sporco.errore === '' && r.sporco.seme === r.semeBuono,
       'A4) i rifiuti dicono la causa vera, e un codice sporcato dalla messaggistica passa lo stesso',
       JSON.stringify(R) + ' · sporco: ' + (r.sporco.errore || 'passa, seme ' + r.sporco.seme));

    di(r.trasfComeSfida !== '' && r.trasfComeSfida !== '(ACCETTATO!)' && !r.sfidaHaPunti &&
       !r.sfidaComeTrasferimento.accettato && !r.sfidaComeTrasferimento.identitaCambiata,
       'A5) le due serrature: il codice di trasferimento non e\' una sfida, e la sfida non e\' un trasferimento',
       'trasferimento letto come sfida -> ' + r.trasfComeSfida +
       ' · la sfida contiene punti: ' + r.sfidaHaPunti +
       ' · accettaTrasferimento(sfida) -> ' + r.sfidaComeTrasferimento.accettato);
  } finally { await P.ctx.close(); }
}

/* =====================================================================
   GRUPPO B — DENTRO IL CODICE NON C'E' NESSUNO.

   I due telefoni hanno la STESSA partita (stessi attributi di rosa,
   stessa postura, stesso seme, stessa taglia) e IDENTITA' DIVERSE: id,
   segreto, nome della squadra, nomi dei cinque giocatori. Se una sola
   di quelle cose finisse nel codice — in chiaro, cifrata, mescolata,
   non importa — i due codici sarebbero diversi.
   ===================================================================== */
const ATTRIBUTI = [[71, 64, 58, 52], [55, 77, 63, 49], [62, 51, 80, 66], [68, 59, 54, 74], [50, 66, 70, 61]];

const vesti = (P, chi) => P.pag.evaluate(([chi, attr]) => {
  const t = window.__test;
  /* l'identita': diversa. Il segreto e l'id sono quelli che NON devono
     uscire, il nome della squadra e i nomi dei giocatori sono i dati
     personali che non devono uscire nemmeno loro. */
  const m = t.rete.mem();
  m.id = chi.id; m.segreto = chi.segreto;
  t.save.teamName = chi.squadra;
  /* la partita: identica. Gli attributi sono quel che il codice DEVE
     portare; i nomi sono quel che NON deve portare. */
  t.save.rosa = attr.map((a, i) => ({ nome: chi.squadra + ' GIOCATORE ' + i,
                                      vel: a[0], tiro: a[1], tecnica: a[2], tackle: a[3] }));
  t.save.mentalita = 1;
  t.save.taglia = 5;
  return { id: m.id, segreto: m.segreto, squadra: t.save.teamName };
}, [chi, ATTRIBUTI]);

async function gruppoB(browser, porta) {
  titolo('B) DENTRO IL CODICE NON C\'E\' NESSUNO — due identita\', un codice solo');
  const A = await T.apri(browser, porta, { width: 915, height: 412 });
  const B = await T.apri(browser, porta, { width: 915, height: 412 });
  try {
    if (!await haPorta(A)) {
      no += 4;
      console.log('  NO  B1..B4 — la porta __test.carta non c\'e\'');
      return;
    }
    const chiA = { id: '11111111-1111-4111-8111-111111111111', segreto: 'SEGRETODIUNO', squadra: 'DOPOLAVORO' };
    const chiB = { id: '22222222-2222-4222-8222-222222222222', segreto: 'SEGRETODIDUE', squadra: 'BORGATA VECCHIA' };
    await vesti(A, chiA);
    await vesti(B, chiB);

    const codice = P => P.pag.evaluate(() => {
      const o = window.__test.carta.componi(20260922, 5);
      o.golA = 4; o.golD = 1;
      return window.__test.carta.impacca(o);
    });
    const cA = await codice(A), cB = await codice(B);

    di(cA === cB && cA.length > 20,
       'B1) due telefoni con identita\' diverse e la stessa partita danno lo STESSO codice',
       cA === cB ? cA : ('A: ' + cA + '  ·  B: ' + cB));

    /* la prova grossolana: la sottostringa. Da sola non prova niente (un
       falso che cifrasse il segreto la passerebbe), ma un falso ingenuo
       lo prende, e costa un confronto. */
    const nudo = s => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const dentro = [];
    for (const [nome, v] of [['id', chiA.id], ['segreto', chiA.segreto], ['squadra', chiA.squadra],
                             ['nome di un giocatore', chiA.squadra + ' GIOCATORE 0']]) {
      if (nudo(v).length > 3 && nudo(cA).indexOf(nudo(v)) >= 0) dentro.push(nome);
    }
    di(dentro.length === 0,
       'B2) e nel codice non si legge ne\' l\'id ne\' il segreto ne\' un nome',
       dentro.length ? 'TROVATI: ' + dentro.join(', ') : 'nessuno dei quattro');

    /* B3 — AL CONTRARIO: leggere una sfida non e' diventare qualcuno.
       E' il pericolo vero di questo cantiere, e va misurato sul giro
       COMPLETO, non sulla sola funzione che spacca. */
    const prima = await B.pag.evaluate(() => { const m = window.__test.rete.mem();
                                               return { id: m.id, segreto: m.segreto, nome: window.__test.save.teamName }; });
    await B.pag.evaluate(c => { try { window.__test.carta.gioca(c); } catch (e) {} }, cA);
    const dopo = await B.pag.evaluate(() => { const m = window.__test.rete.mem();
                                              return { id: m.id, segreto: m.segreto, nome: window.__test.save.teamName }; });
    di(prima.id === dopo.id && prima.segreto === dopo.segreto,
       'B3) leggere e giocare una sfida di carta non cambia l\'identita\' di chi la riceve',
       'id ' + (prima.id === dopo.id ? 'fermo' : prima.id + ' -> ' + dopo.id) +
       ' · segreto ' + (prima.segreto === dopo.segreto ? 'fermo' : 'CAMBIATO'));

    /* B4 — e il codice non dipende nemmeno dall'ORDINE in cui si e'
       arrivati: ricostruito due volte sullo stesso telefono, e dopo aver
       giocato, dev'essere lo stesso. Un codice che si muovesse da solo
       non sarebbe scambiabile. */
    const cA2 = await codice(A);
    const cB2 = await codice(B);
    di(cA2 === cA && cB2 === cA,
       'B4) lo stesso codice a ogni ricostruzione, anche dopo aver giocato',
       cA2 === cA && cB2 === cA ? 'stabile' : 'A2: ' + cA2 + ' · B2: ' + cB2);
  } finally { await A.ctx.close(); await B.ctx.close(); }
}

/* =====================================================================
   GRUPPO C — DUE TELEFONI, LA STESSA PARTITA.

   CPU contro CPU: nessun dito, quindi nessuna coordinata di schermo per
   costruzione. E' il modo piu' spietato di chiedere se lo schermo entra
   nella simulazione. Ordine sacro: startMatch (dentro cartaGioca)
   PRIMA, setCpuVsCpu DOPO.
   ===================================================================== */
/* LA PARTITA SI PORTA FINO AL FISCHIO FINALE, non a un campione: i
   cambi entrano dopo il primo terzo (CAMBIO_OGNI), e i nomi della
   panchina escono da rosaAvversaria, che legge SAVE.rosa. Una prova
   che si fermasse a meta' non vedrebbe mai il canale che va cercato. */
const GIOCA_CODICE = `(function(codice){
  const t = window.__test;
  const r = t.carta.gioca(codice);
  if(r && r.errore) return { errore: r.errore };
  t.setCpuVsCpu(true);
  /* L'IMPRONTA E' DI SOLE POSIZIONI, e i nomi si guardano a parte: e'
     una separazione misurata, non una comodita'. Un rincalzo che entra
     puo' chiamarsi in due modi diversi sui due telefoni — rosaAvversaria
     scarta i cognomi gia' usati da SAVE.rosa, e quella e' locale — ma
     entra allo stesso secondo e coi numeri identici. Mescolare le due
     cose in un'impronta sola farebbe gridare al difetto per un cognome. */
  const impronta = () => {
    let h = 2166136261 >>> 0;
    const v = t.players.map(p => Math.round(p.x*8) + ',' + Math.round(p.y*8)).join('|')
            + '#' + Math.round(t.ball.x*8) + ',' + Math.round(t.ball.y*8);
    for(let i=0;i<v.length;i++){ h = (h ^ v.charCodeAt(i)) >>> 0; h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  };
  const titolari = t.players.map(p => p.nome + ':' + p.vel + '/' + p.tiro + '/' + p.tecnica + '/' + p.tackle);
  const nomiVia = t.players.map(p => p.nome);
  const tappe = [];
  for(let k=0;k<40 && t.state !== 'end';k++){ t.simulate(5); tappe.push(impronta()); }
  return { punteggio: t.score.slice(), scena: t.state, sorteggi: t.sorteggi, tappe: tappe,
           durata: Math.round(t.timeLeft),
           titolari: titolari,
           nomiVia: nomiVia,
           nomiFine: t.players.map(p => p.nome),
           attrFine: t.players.map(p => p.vel + '/' + p.tiro + '/' + p.tecnica + '/' + p.tackle),
           panchina: JSON.stringify(t.panchina || null),
           daBattere: t.carta.sfida ? [t.carta.sfida.golA, t.carta.sfida.golD] : null };
})`;

/* =====================================================================
   LA STESSA APERTURA, MA A SETTE. Non passa da cartaGioca — che a sette
   si rifiuta — ma ricostruisce a mano le stesse opzioni: e' la misura
   che GIUSTIFICA il rifiuto invece di dichiararlo. Se a sette due
   telefoni con rose diverse giocassero la stessa partita, la sfida di
   carta potrebbe aprirsi anche li' e il limite sarebbe una pigrizia.
   ===================================================================== */
const SETTE = `(function(seme, rosaA, rosaD){
  const t = window.__test;
  G.sfida = { seme:String(seme), taglia:7, chi:'GASOMETRO', vero:false, replay:false };
  t.semina(seme);
  t.startMatch(1, 1, {
    size:7, sponde:'gabbia', miraGuidata:'pieno',
    mia:{ n:'SFIDANTE', c1:'#3355aa', c2:'#111820', pat:0, ment:1, rosa:rosaA },
    opp:{ n:'GASOMETRO', c1:'#cf3e6b', c2:'#123a80', pat:1, ment:1, car:0, rosa:rosaD },
  });
  t.setCpuVsCpu(true);
  const nomiVia = t.players.map(p => p.nome);
  const numeriVia = t.players.map(p => p.vel + '/' + p.tiro + '/' + p.tecnica + '/' + p.tackle);
  const impronta = () => {
    let h = 2166136261 >>> 0;
    const v = t.players.map(p => Math.round(p.x*8) + ',' + Math.round(p.y*8)).join('|')
            + '#' + Math.round(t.ball.x*8) + ',' + Math.round(t.ball.y*8);
    for(let i=0;i<v.length;i++){ h = (h ^ v.charCodeAt(i)) >>> 0; h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  };
  const tappe = [];
  for(let k=0;k<40 && t.state !== 'end';k++){ t.simulate(5); tappe.push(impronta()); }
  const out = { punteggio: t.score.slice(), sorteggi: t.sorteggi, tappe: tappe,
                nomiVia: nomiVia, numeriVia: numeriVia,
                numeriFine: t.players.map(p => p.vel + '/' + p.tiro + '/' + p.tecnica + '/' + p.tackle) };
  G.sfida = null; t.desemina();
  return out;
})`;

/* quattro telefoni davvero diversi: vista, nome, rosa (coi nomi VERI
   delle tabelle del gioco, che e' quel che rosaAvversaria legge per non
   ripetere i cognomi), sponde, mira guidata, durata, mentalita', taglia
   preferita. Se una sola di queste entrasse nella partita, si vedrebbe. */
const VISTE = [{ width: 915, height: 412 }, { width: 800, height: 360 },
               { width: 380, height: 640 }, { width: 1024, height: 460 }];

const telefonoDiverso = (P, i) => P.pag.evaluate(i => {
  const t = window.__test;
  const m = t.rete.mem();
  m.id = 'aaaaaaaa-0000-4000-8000-00000000000' + i; m.segreto = 'segreto-' + i;
  t.save.teamName = ['DOPOLAVORO', 'BORGATA', 'CASE NUOVE', 'MOLO 4'][i];
  /* I NOMI SONO VERI E SONO DIVERSI, ed e' la differenza che conta.
     nuovaRosa() pesca dalle due tabelle del gioco ed e' deterministica:
     lasciandola stare, tutti i telefoni avrebbero gli stessi cinque
     nomi e il canale da cercare resterebbe chiuso. rosaAvversaria
     inietta i nomi di SAVE.rosa fra quelli «gia' usati» per non
     ripetere i cognomi (righe 9885-9891 del gioco), e da li' escono i
     rincalzi e le due PANCHINE: se quel canale arrivasse fino alla
     partita, due telefoni con rose diverse divergerebbero. */
  t.save.rosa = t.save.rosa.map((r, k) => ({
    nome: NOMI_ROSA[(i * 5 + k) % NOMI_ROSA.length] + ' ' + COGNOMI_ROSA[(i * 7 + k * 3) % COGNOMI_ROSA.length],
    vel: 50 + ((k * 7 + i * 3) % 40), tiro: 45 + ((k * 11 + i * 5) % 45),
    tecnica: 40 + ((k * 5 + i * 7) % 50), tackle: 55 + ((k * 13 + i * 2) % 40),
  }));
  t.save.sponde = i % 2 ? 'campo' : 'gabbia';
  t.save.miraGuidata = i % 2 ? 'essenziale' : 'pieno';
  t.save.durata = [90, 120, 180, 90][i];
  t.save.mentalita = i % 3;
  t.save.taglia = [5, 7, 11][i % 3];
  t.save.diff = i % 3;
  return { squadra: t.save.teamName, rosa: t.save.rosa.map(r => r.nome).join(', ') };
}, i);

async function gruppoC(browser, porta) {
  titolo('C) DUE TELEFONI, LA STESSA PARTITA — lo schermo non entra nel codice');
  /* il codice si fa su UNA pagina e si gioca su tutte, quella compresa:
     chi CREA deve giocare la stessa partita di chi RICEVE */
  const P0 = await T.apri(browser, porta, VISTE[0]);
  let codici = [];
  try {
    if (!await haPorta(P0)) {
      no += 3; console.log('  NO  C1..C3 — la porta __test.carta non c\'e\'');
      await P0.ctx.close(); return;
    }
    await telefonoDiverso(P0, 0);
    codici = await P0.pag.evaluate(() => [20260922, 20260923, 777, 1, 4294967295, 31337].map(s => {
      const o = window.__test.carta.componi(s, 5);
      o.golA = 3; o.golD = 2;
      return window.__test.carta.impacca(o);
    }));
  } finally { await P0.ctx.close(); }

  let tuttiUguali = true, righe = [], daBattere = true;
  let nomiDiversi = 0, nomiConfrontati = 0, nomiFuoriPanchina = 0, guasti = [];
  for (const codice of codici) {
    const esiti = [];
    for (let i = 0; i < VISTE.length; i++) {
      const P = await T.apri(browser, porta, VISTE[i]);
      try {
        await telefonoDiverso(P, i);
        esiti.push(await P.pag.evaluate(([g, c]) => (new Function('return ' + g))()(c), [GIOCA_CODICE, codice]));
      } finally { await P.ctx.close(); }
    }
    const rif = esiti[0];
    if (rif.errore) { tuttiUguali = false; righe.push('codice rifiutato: ' + rif.errore); continue; }
    for (const e of esiti) {
      if (e.errore) { tuttiUguali = false; guasti.push('errore ' + e.errore); continue; }
      const fuori = [];
      if (e.punteggio.join('-') !== rif.punteggio.join('-')) fuori.push('punteggio');
      if (e.sorteggi !== rif.sorteggi) fuori.push('sorteggi');
      if (e.durata !== rif.durata) fuori.push('durata');
      if (e.tappe.join(',') !== rif.tappe.join(',')) fuori.push('posizioni');
      if (e.titolari.join('|') !== rif.titolari.join('|')) fuori.push('titolari');
      if (e.attrFine.join('|') !== rif.attrFine.join('|')) fuori.push('numeri a fine partita');
      if (fuori.length) { tuttiUguali = false; guasti.push(fuori.join('+')); }
      /* i NOMI si contano, non si pretendono: vedi C1b */
      for (let k = 0; k < e.nomiFine.length; k++) {
        nomiConfrontati++;
        if (e.nomiFine[k] === rif.nomiFine[k]) continue;
        nomiDiversi++;
        /* l'unico scarto ammesso e' su un uomo ENTRATO DALLA PANCHINA:
           se cambia il nome di uno sceso in campo al fischio d'inizio,
           il codice non ha schierato la stessa squadra */
        if (e.nomiFine[k] === e.nomiVia[k] && rif.nomiFine[k] === rif.nomiVia[k]) nomiFuoriPanchina++;
      }
    }
    if (!esiti.every(e => e.daBattere && e.daBattere[0] === 3 && e.daBattere[1] === 2)) daBattere = false;
    righe.push(esiti.map((e, i) => VISTE[i].width + 'x' + VISTE[i].height + '->' +
      (e.errore ? 'ERRORE ' + e.errore : e.punteggio.join('-') + '/' + e.sorteggi)).join(' '));
  }
  di(tuttiUguali && codici.length === 6,
     'C1) lo stesso codice su quattro viste e quattro salvataggi diversi: la STESSA partita',
     righe.join('  |  ') + (guasti.length ? '   FUORI: ' + guasti.slice(0, 6).join(', ') : ''));
  di(daBattere,
     'C2) e il punteggio da battere torna dal codice, uguale su tutte',
     daBattere ? '3-2 su ' + (codici.length * VISTE.length) + ' aperture' : 'NO');

  /* =====================================================================
     C1b — L'UNICA COSA CHE PUO' CAMBIARE, E QUANTO CAMBIA.

     MISURATO (fuori/_sonda-135-canale.js, e questa prova lo tiene fermo):
     fra due telefoni con rose diverse, a parita' di codice, restano
     identici punteggio, sorteggi, durata, posizioni a ogni campione,
     titolari con nomi e numeri, e i numeri di tutti a fine partita.
     L'unica differenza e' il NOME di un rincalzo entrato dalla panchina —
     «Ivano il Professore» contro «Ivano Fulmine», con gli stessi
     identici 54/53/42/64 — perche' rosaAvversaria scarta i cognomi gia'
     usati da SAVE.rosa, che e' locale.

     E' cosmetica e sta dichiarata invece che nascosta. Ma il confine e'
     duro: se a cambiare fosse il nome di un TITOLARE, il codice non
     starebbe schierando la stessa squadra, e questa prova diventa rossa.
     ===================================================================== */
  di(nomiFuoriPanchina === 0 && nomiConfrontati > 100,
     'C1b) e l\'unico nome che puo\' cambiare e\' quello di un rincalzo entrato dalla panchina',
     nomiDiversi + ' nomi diversi su ' + nomiConfrontati + ' confrontati, tutti entrati dalla panchina' +
     (nomiFuoriPanchina ? ' TRANNE ' + nomiFuoriPanchina + ' TITOLARI' : ''));

  /* C3 — CHI CREA E CHI RICEVE. Il giro vero: una pagina crea la sfida
     con cartaNuova, la gioca fino in fondo, il gioco ne fa il codice; una
     seconda pagina incolla quel codice e deve trovarsi in campo la
     stessa identica partita. */
  const A = await T.apri(browser, porta, VISTE[0]);
  const B = await T.apri(browser, porta, VISTE[1]);
  try {
    await telefonoDiverso(A, 0);
    await telefonoDiverso(B, 1);
    const creata = await A.pag.evaluate(([g]) => {
      const t = window.__test;
      const r = t.carta.nuova({ seme: 20260924, taglia: 5 });
      if (r && r.errore) return { errore: r.errore };
      t.setCpuVsCpu(true);
      const f = (new Function('return ' + g))();
      /* la partita si porta fino al fischio finale: il codice nasce li' */
      for (let k = 0; k < 40 && t.state !== 'end'; k++) t.simulate(6);
      return { punteggio: t.score.slice(), scena: t.state, codice: t.carta.codice };
    }, [GIOCA_CODICE]);
    let rigiocata = null;
    if (creata.codice) {
      rigiocata = await B.pag.evaluate(([g, c]) => (new Function('return ' + g))()(c), [GIOCA_CODICE, creata.codice]);
    }
    di(!!creata.codice && creata.scena === 'end' && !!rigiocata && !rigiocata.errore &&
       rigiocata.daBattere && rigiocata.daBattere[0] === creata.punteggio[0] &&
       rigiocata.daBattere[1] === creata.punteggio[1],
       'C3) chi crea gioca, il codice nasce col punteggio vero, chi riceve lo legge',
       'creata ' + (creata.punteggio ? creata.punteggio.join('-') : '—') + ' (' + creata.scena + ')' +
       ' · codice ' + (creata.codice || 'ASSENTE') +
       ' · da battere per chi riceve ' + (rigiocata && rigiocata.daBattere ? rigiocata.daBattere.join('-') : '—'));

    /* C4 — E LO STESSO TELEFONO, DUE VOLTE. Una sfida che cambia fra
       due aperture sulla stessa pagina non e' rigiocabile nemmeno da
       chi l'ha creata: e' il caso in cui lo stato lasciato dalla
       partita precedente entra in quella dopo (la famiglia dei
       «cronometri fratelli», grep G.recT). */
    if (creata.codice) {
      const due = [];
      for (let k = 0; k < 2; k++)
        due.push(await B.pag.evaluate(([g, c]) => (new Function('return ' + g))()(c), [GIOCA_CODICE, creata.codice]));
      di(!due[0].errore && due[0].punteggio.join('-') === due[1].punteggio.join('-') &&
         due[0].sorteggi === due[1].sorteggi && due[0].tappe.join(',') === due[1].tappe.join(','),
         'C4) lo stesso codice due volte di fila sulla stessa pagina: la stessa partita',
         due.map(d => d.punteggio.join('-') + '/' + d.sorteggi).join(' e '));
    } else di(false, 'C4) lo stesso codice due volte di fila sulla stessa pagina', 'nessun codice da rigiocare');
  } finally { await A.ctx.close(); await B.ctx.close(); }

  /* =====================================================================
     C5 — PERCHE' LA SFIDA DI CARTA SI FERMA A CINQUE, misurato invece
     che dichiarato — e la misura NON e' quella che ci si aspettava.

     LA PRIMA STESURA DI QUESTA PROVA sosteneva che a sette due telefoni
     con rose diverse divergono, perche' setupPlayers completa la
     squadra di casa coi «rincalzi di quartiere» (uomini PIATTI, che
     formaSquadre sparge) e i loro nomi escono da rosaAvversaria, che
     legge SAVE.rosa. MISURATO: FALSO. A sette, fra due telefoni con
     rose diverse, i quattordici uomini scendono in campo con gli
     STESSI numeri, e la partita finisce uguale — punteggio, sorteggi e
     posizioni a ogni campione.

     QUEL CHE CAMBIA DAVVERO sono i NOMI dei due rincalzi, che sono
     uomini che IL CODICE NON DESCRIVE: la rosa del gioco e' da cinque
     (nuovaRosa), quindi a sette due uomini su sette e a undici sei su
     undici li ricostruisce il telefono, dalla media della rosa e con un
     nome pescato evitando i cognomi di casa. A cinque, invece, il
     codice descrive OGNI uomo che scende in campo, e infatti nessun
     titolare cambia nome (prova C1b).

     Il limite resta [5], e adesso ha la sua ragione vera: non «a sette
     diverge», che non e' vero, ma «a sette il codice non dice chi
     gioca». Questa prova tiene ferme tutte e due le cose: che a sette i
     nomi dei titolari si separano, e che il gioco si rifiuta di aprirla.
     ===================================================================== */
  const S1 = await T.apri(browser, porta, VISTE[0]);
  const S2 = await T.apri(browser, porta, VISTE[0]);
  try {
    await telefonoDiverso(S1, 0);
    await telefonoDiverso(S2, 1);
    const rosaA = [], rosaD = [];
    for (let i = 0; i < 5; i++) {
      rosaA.push({ nome: 'A' + i, vel: 71 - i, tiro: 64 + i, tecnica: 58 + i * 2, tackle: 52 + i });
      rosaD.push({ nome: 'D' + i, vel: 59 + i, tiro: 72 - i, tecnica: 61 + i, tackle: 55 + i * 2 });
    }
    const a7 = await S1.pag.evaluate(([g, s, a, d]) => (new Function('return ' + g))()(s, a, d), [SETTE, 20260922, rosaA, rosaD]);
    const b7 = await S2.pag.evaluate(([g, s, a, d]) => (new Function('return ' + g))()(s, a, d), [SETTE, 20260922, rosaA, rosaD]);
    const nomiFuori = a7.nomiVia.filter((x, i) => x !== b7.nomiVia[i]).length;
    const numeriFuori = a7.numeriVia.filter((x, i) => x !== b7.numeriVia[i]).length;
    const partitaUguale = a7.punteggio.join('-') === b7.punteggio.join('-') &&
                          a7.sorteggi === b7.sorteggi && a7.tappe.join(',') === b7.tappe.join(',');
    const rifiuto = await S1.pag.evaluate(() => {
      const t = window.__test;
      const o = t.carta.componi(20260922, 7); o.golA = 1; o.golD = 0;
      const r = t.carta.gioca(t.carta.impacca(o));
      return { errore: r.errore || '', taglie: t.carta.taglie };
    });
    di(nomiFuori > 0 && numeriFuori === 0 && partitaUguale &&
       rifiuto.errore === 'taglia-non-prevista' && rifiuto.taglie.join(',') === '5',
       'C5) a sette il codice non dice chi gioca (nomi diversi, numeri uguali) e il gioco si rifiuta di aprirla',
       'sette: ' + nomiFuori + ' nomi diversi su ' + a7.nomiVia.length + ' al fischio d\'inizio, ' +
       numeriFuori + ' numeri diversi · partita ' + (partitaUguale ? 'UGUALE' : 'DIVERSA') +
       ' (' + a7.punteggio.join('-') + ' contro ' + b7.punteggio.join('-') + ')' +
       ' · rifiuto «' + rifiuto.errore + '» · taglie aperte [' + rifiuto.taglie.join(',') + ']');
  } finally { await S1.ctx.close(); await S2.ctx.close(); }
}

/* =====================================================================
   GRUPPO D — LA SCHERMATA, E LA RETE CHE NON C'E'.
   ===================================================================== */
async function gruppoD(browser, porta) {
  titolo('D) LA SCHERMATA E LA RETE CHE NON C\'E\'');

  /* D1/D2 — il pannello, e le cause dette in italiano */
  const P = await T.apri(browser, porta, { width: 915, height: 412 });
  try {
    const vista = await P.pag.evaluate(async () => {
      const t = window.__test;
      const bottone = document.getElementById('btnSfidaCarta');
      if (!bottone) return { bottone: false };
      t.sfida.apri();
      for (let i = 0; i < 60 && t.sfida.occupato; i++) await new Promise(r => setTimeout(r, 50));
      bottone.click();
      const pannello = document.getElementById('sfidaCarta');
      const campo = document.getElementById('sfCartaIn');
      const mio = document.getElementById('sfCartaMio');
      const aperto = !!pannello && !pannello.classList.contains('hidden');
      /* una causa vera, detta in italiano */
      const cause = [];
      for (const storto of ['', 'PIPPO', t.rete.codiceTrasferimento(), 'CARTA0000000000000000']) {
        if (campo) campo.value = storto;
        t.sfida.usaCarta();
        cause.push((document.getElementById('sfCartaNota') || {}).textContent || '');
      }
      return { bottone: true, aperto, campo: !!campo, mio: !!mio, cause,
               testo: (pannello ? pannello.textContent : '') };
    });
    di(vista.bottone && vista.aperto && vista.campo && vista.mio,
       'D1) c\'e\' l\'ingresso e il pannello si apre, col codice da copiare e il campo da incollare',
       JSON.stringify({ bottone: vista.bottone, aperto: vista.aperto, campo: vista.campo, mio: vista.mio }));
    const cause = vista.cause || [];
    di(cause.length === 4 && cause.every(c => c && c.length > 12) &&
       new Set(cause).size >= 3,
       'D2) un codice storto dice perche\', e le cause non sono tutte la stessa frase',
       JSON.stringify(cause));
    /* IL LIMITE DICHIARATO: una sfida di carta non porta una prova, e il
       gioco lo deve dire invece di lasciarlo credere. */
    di(/fidar|prova|verific/i.test(String(vista.testo || '')),
       'D3) il pannello dice che una sfida di carta non porta una prova',
       (String(vista.testo || '').replace(/\s+/g, ' ').slice(0, 140) || '(pannello vuoto)'));
  } finally { await P.ctx.close(); }

  /* D4 — LA PIEGA. Gli stessi tre bersagli di _q-sigillo B3, agli stessi
     pixel di oggi, piu' l'ingresso nuovo che dev'essere sopra la piega. */
  const C = await T.apri(browser, porta, { width: 800, height: 360 });
  try {
    const piega = await C.pag.evaluate(async () => {
      const t = window.__test;
      t.sfida.sfide = [];
      for (let i = 0; i < 5; i++) t.sfida.sfide.push({
        id: i + 1, attaccante: 'x', seme: '7' + i, taglia: 5, gol_a: 3, gol_d: 2,
        giocata: new Date().toISOString(), vista: i > 1, verificata: 0, nome: 'SQUADRA ' + i });
      t.sfida.apri();
      for (let i = 0; i < 60 && t.sfida.occupato; i++) await new Promise(r => setTimeout(r, 50));
      t.sfida.dipingi();
      const r = e => { const x = e && e.getBoundingClientRect(); return x ? Math.round(x.bottom) : -1; };
      const out = { h: innerHeight, righe: document.querySelectorAll('#sfLista .sfriga').length,
                    cerca: r(document.getElementById('btnSfidaCerca')),
                    primaRiga: r(document.querySelector('#sfLista .sfriga')),
                    primoGuarda: r(document.querySelector('#sfLista [data-guarda]')) };
      t.sfida.sfide = [];
      t.sfida.dipingi();
      out.cartaVuota = r(document.getElementById('btnSfidaCarta'));
      return out;
    });
    di(piega.righe === 5 && piega.cerca === 220 && piega.primaRiga === 329 && piega.primoGuarda === 308 &&
       piega.cartaVuota > 0 && piega.cartaVuota <= piega.h,
       'D4) la piega non si muove (CERCA@220, prima riga@329, GUARDA@308) e l\'ingresso nuovo sta sopra',
       'CERCA@' + piega.cerca + ' primaRiga@' + piega.primaRiga + ' GUARDA@' + piega.primoGuarda +
       ' · SFIDA DI CARTA@' + piega.cartaVuota + ' su piega ' + piega.h);
  } finally { await C.ctx.close(); }

  /* =====================================================================
     D5 — ZERO RETE. Si intercetta tutto e passa solo il documento del
     gioco: il resto viene BLOCCATO e annotato. Cosi' la prova non e'
     «non ha chiesto niente perche' era in cache»: e' «non gli serve
     niente». Lo stesso impianto di senza-rete.js.

     E SI CONTA IL DELTA, NON IL TOTALE, ed e' una correzione che il
     banco ha imparato addosso: aprire la schermata SFIDA chiede
     /api/entra al server, e lo chiede da sempre, per progetto (grep «La
     prima richiesta al server la fa apri()»). Contare quella richiesta
     come colpa della sfida di carta vorrebbe dire misurare la funzione
     sbagliata. Si prende una tacca dopo aver aperto la schermata — e
     con la rete gia' tutta bloccata, cioe' nella condizione di chi non
     ha campo — e si pretende che da li' in avanti, per tutto il giro
     della carta, il contatore NON SI MUOVA. Il giro deve anche
     arrivare in fondo: una funzione che non chiede niente perche' non
     fa niente non prova niente. */
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const indirizzo = 'http://127.0.0.1:' + porta + '/CALCETTO-il-gioco.html';
  const bloccate = [];
  try {
    await pag.route('**/*', route => {
      const url = route.request().url();
      if (url === indirizzo || url.startsWith(indirizzo + '?')) return route.continue();
      bloccate.push(url);
      return route.abort();
    });
    await pag.goto(indirizzo, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); });
    /* la schermata SFIDA si apre per prima, con la rete gia' tutta
       bloccata: e' il telefono senza campo, ed e' da li' che si arriva
       alla sfida di carta */
    await pag.evaluate(async () => {
      const t = window.__test;
      t.sfida.apri();
      for (let i = 0; i < 40 && t.sfida.occupato; i++) await new Promise(r => setTimeout(r, 50));
    });
    await pag.waitForTimeout(400);
    const tacca = bloccate.length;
    const giro = await pag.evaluate(() => {
      const t = window.__test;
      if (!t.carta) return { errore: 'niente-porta' };
      const b = document.getElementById('btnSfidaCarta');
      if (!b) return { errore: 'niente-bottone' };
      b.click();                                   /* il pannello, offline */
      const r = t.carta.nuova({ seme: 20260925, taglia: 5 });
      if (r && r.errore) return { errore: r.errore };
      t.setCpuVsCpu(true);
      for (let k = 0; k < 40 && t.state !== 'end'; k++) t.simulate(6);
      const codice = t.carta.codice;
      if (!codice) return { errore: 'niente-codice' };
      /* si incolla nel campo vero e si preme il bottone vero */
      const campo = document.getElementById('sfCartaIn');
      if (!campo) return { errore: 'niente-campo', codice: codice };
      campo.value = codice;
      t.sfida.usaCarta();
      if (!t.sfidaStato.inPartita) return { errore: 'non-e-partita', codice: codice };
      t.setCpuVsCpu(true);
      for (let k = 0; k < 40 && t.state !== 'end'; k++) t.simulate(6);
      return { codice: codice, scena: t.state, esito: t.carta.esito };
    });
    await pag.waitForTimeout(400);
    const nuove = bloccate.slice(tacca);
    di(!giro.errore && giro.scena === 'end' && !!giro.esito && nuove.length === 0,
       'D5) tutto il giro — crea, gioca, incolla, rigioca — senza una sola richiesta di rete',
       (giro.errore ? 'ERRORE ' + giro.errore + ' · ' : '') +
       'esito «' + (giro.esito || '—') + '» · ' + nuove.length + ' richieste nuove' +
       (nuove.length ? ': ' + nuove.slice(0, 4).join(' ') : '') +
       ' (prima del giro, ad aprire SFIDA: ' + tacca + ')');
  } finally { await ctx.close(); }
}

/* ------------------------------------------------------------------ */
(async () => {
  let browser = null, g = null;
  try {
    const { chromium } = require('playwright');
    const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
    if (prova && !fs.existsSync(prova)) { console.error('non trovo ' + prova); process.exit(3); }
    g = await T.serviGioco(prova);
    browser = await chromium.launch();
    if (gruppiChiesti.includes('A')) await gruppoA(browser, g.porta);
    if (gruppiChiesti.includes('B')) await gruppoB(browser, g.porta);
    if (gruppiChiesti.includes('C')) await gruppoC(browser, g.porta);
    if (gruppiChiesti.includes('D')) await gruppoD(browser, g.porta);
    console.log('\n' + (ok + no) + ' controlli, ' + ok + ' passati, ' + no + ' falliti');
    process.exit(no ? 1 : 0);
  } catch (e) {
    console.error('\nBANCO ESPLOSO: ' + (e && e.stack || e));
    process.exit(2);
  } finally {
    if (browser) await browser.close();
    if (g) g.chiudi();
  }
})();
