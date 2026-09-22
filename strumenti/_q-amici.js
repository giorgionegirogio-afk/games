/* =====================================================================
   _q-amici.js — LA CLASSIFICA SI COMPILA DAI CODICI CHE TORNANO
   INDIETRO, E NON VIAGGIA NESSUNO (voce #136). Nasce ROSSO: nel gioco
   non c'e' niente, `window.__test.amici` non esiste.

   CHE COSA MISURA, e perche' non lo misura nessun altro cancello.
   La voce #135 ha costruito la sfida di carta: settantanove caratteri
   che contengono una partita intera. Ma e' un giro a META' — io ti
   mando il codice, tu giochi la mia partita, e il mio telefono non
   sapra' mai com'e' andata. Questa voce chiude il giro con ventuno
   caratteri che tornano indietro, e da quelli compila una classifica
   dei testa a testa che non passa da nessun server.

   `carta` sorveglia il codice della sfida e la partita che ne esce, e
   non sa niente di un risultato che torna. `rete` e `sfida` guardano la
   sfida ONLINE. `salvataggio` guarda che il salvataggio regga una
   ricarica, ma non sa che cosa sia un amico. `senza-rete` pretende che
   il gioco si apra senza una richiesta, e non conosce questa funzione.
   Nessuno guarda quel che questo cancello guarda.

   QUATTRO GRUPPI.

   A) IL CODICE DI RISPOSTA. Impacca-e-spacca dev'essere l'identita'; il
      codice deve stare in un messaggio (e in una telefonata: ventuno
      lettere si dettano); il controllo deve prendere gli errori di
      battitura, misurato ESAUSTIVAMENTE su cinquanta codici e non su
      uno — un corpo di dodici simboli e' corto, e una misura su un
      codice solo e' un aneddoto. Piu' i rifiuti e le TRE serrature: nel
      gioco girano adesso tre codici che si incollano nello stesso
      posto, e nessuno dei tre deve poter essere scambiato per un altro.

   B) DENTRO IL CODICE NON C'E' NESSUNO. E' il gruppo che questo
      cantiere esiste per far passare. Il codice di risposta e' il
      codice che si manda a qualcuno che non ti ha mandato niente
      prima: un giorno finira' in un gruppo di venti persone. LA PROVA
      CHE DISCRIMINA NON E' LA RICERCA DI SOTTOSTRINGHE — un falso che
      ci infilasse il segreto cifrato la passerebbe. E' che DUE
      TELEFONI con identita' diverse e lo stesso risultato devono
      produrre lo STESSO codice, carattere per carattere.

   C) LA CLASSIFICA SI COMPILA, E LE DUE SI SPECCHIANO. La prova che
      dice se questa funzione ha senso: due telefoni veri fanno il giro
      intero — crea, manda, gioca, rimanda, segna — e alla fine la riga
      di uno dice «vinta» e quella dell'altro dice «persa», sulla stessa
      partita. Piu' il doppione, i tre tetti, il riavvio, l'additivita'
      del salvataggio chiave per chiave, e il punteggio proprio che un
      codice non puo' riscrivere.

   D) LA SCHERMATA, E LA RETE CHE NON C'E'. La classifica si apre a rete
      spenta e mostra i testa a testa PIU' la riga che dice perche'
      quella di rete non c'e'; la piega della schermata SFIDA non si
      muove di un pixel (e' il cancello `sigillo` B3 e `carta` D4 che lo
      pretendono); la cima del pannello e' raggiungibile — misurato al
      compito 0, oggi NON lo e'; e zero richieste di rete in tutto il
      giro.

   uso:  node strumenti/_q-amici.js
         node strumenti/_q-amici.js --gioco fuori/x.html
         node strumenti/_q-amici.js --solo A,B
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

/* IL TETTO DELLA LUNGHEZZA, e da dove viene. Il codice della sfida
   (voce #135) sta in 79 caratteri e il tetto li' era 100. Qui si chiede
   molto di meno — 40 — perche' un codice di RISPOSTA ha un mestiere in
   piu': si detta al telefono. Misurato al compito 0: 21 caratteri. */
const TETTO_CARATTERI = 40;

const haPorta = P => P.pag.evaluate(() => !!(window.__test && window.__test.amici));

/* =====================================================================
   GRUPPO A — IL CODICE. Tutto dentro la pagina: e' aritmetica pura, e
   farla fare AL GIOCO e' il punto. Un banco che rifacesse l'alfabeto in
   Node misurerebbe la propria copia del formato, non quella spedita.
   ===================================================================== */
const GIRO_A = `(function(){
  const t = window.__test, A = t.amici, C = t.carta;
  const out = { errori: [] };
  const semi = [20260922, 20260923, 1, 4294967295, 777, 123456789, 2147483648, 99];
  const casi = [];
  for(const s of semi) for(const g of [[0,0],[3,2],[17,5],[31,31]])
    casi.push({ ver:A.ver, motore:A.motore, seme:s>>>0, sfA:g[0], sfD:g[1], riA:(g[1]+1)%32, riD:g[0] });
  let identici = 0; const lung = [];
  let esempio = '';
  for(const o of casi){
    const testo = A.impacca(o);
    if(!esempio) esempio = testo;
    lung.push(testo.length);
    const r = A.spacca(testo);
    const uguale = !r.errore && r.ver === o.ver && r.motore === o.motore && r.seme === o.seme &&
      r.sfA === o.sfA && r.sfD === o.sfD && r.riA === o.riA && r.riD === o.riD;
    if(uguale) identici++; else if(out.errori.length < 4) out.errori.push(JSON.stringify(r).slice(0,160));
  }
  out.prove = casi.length; out.identici = identici;
  out.lungMin = Math.min.apply(null, lung); out.lungMax = Math.max.apply(null, lung);
  out.esempio = esempio;

  /* IL CONTROLLO, su CINQUANTA codici diversi e non su uno. */
  const ALF = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let h = 20260922 >>> 0;
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h >>>= 0; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  let pA = 0, cA = 0, pB = 0, cB = 0, pC = 0, cC = 0;
  const fughe = {};
  for(let k = 0; k < 50; k++){
    const base = A.impacca({ ver:A.ver, motore:A.motore, seme:(rnd()*4294967296)>>>0,
                             sfA:(rnd()*12)|0, sfD:(rnd()*12)|0, riA:(rnd()*12)|0, riD:(rnd()*12)|0 });
    const pre = base.slice(0, 5), corpo = base.slice(5);
    for(let i = 0; i < corpo.length; i++)
      for(let v = 0; v < 32; v++){
        if(ALF[v] === corpo[i]) continue;
        pA++;
        if(A.spacca(pre + corpo.slice(0,i) + ALF[v] + corpo.slice(i+1)).errore) cA++;
      }
    for(let i = 0; i < corpo.length; i++)
      for(let j = i+1; j < corpo.length; j++){
        if(corpo[i] === corpo[j]) continue;
        const a = corpo.split(''); const x = a[i]; a[i] = a[j]; a[j] = x;
        pB++;
        if(A.spacca(pre + a.join('')).errore) cB++;
      }
    for(let q = 0; q < 2000; q++){
      const a = corpo.split('');
      const quante = 1 + ((rnd()*4)|0);
      for(let w = 0; w < quante; w++) a[(rnd()*a.length)|0] = ALF[(rnd()*32)|0];
      const s = a.join('');
      if(s === corpo) continue;
      pC++;
      if(A.spacca(pre + s).errore) cC++;
      else { const d = [];
             for(let w = 0; w < corpo.length; w++) if(corpo[w] !== s[w]) d.push(w);
             fughe[d.join('+')] = (fughe[d.join('+')] || 0) + 1; }
    }
  }
  out.unaCifra = { prove:pA, prese:cA };
  out.dueScambiate = { prove:pB, prese:cB };
  out.aCaso = { prove:pC, prese:cC, fughe: fughe };

  /* i rifiuti */
  const o = { ver:A.ver, motore:A.motore, seme:20260922, sfA:3, sfD:2, riA:2, riD:2 };
  const buono = A.impacca(o);
  const altroVer = A.impacca(Object.assign({}, o, { ver:(A.ver + 1) & 15 }));
  const altroMot = A.impacca(Object.assign({}, o, { motore:(A.motore + 1) & 15 }));
  out.rifiuti = {
    buono: A.spacca(buono).errore || '',
    versione: A.spacca(altroVer).errore || '',
    motore: A.spacca(altroMot).errore || '',
    troncato: A.spacca(buono.slice(0, buono.length - 4)).errore || '',
    lettera: A.spacca(buono.slice(0, 10) + 'U' + buono.slice(11)).errore || '',
    vuoto: A.spacca('').errore || '',
    senzaPrefisso: A.spacca(buono.slice(5)).errore || '',
  };
  /* sporcato dalla messaggistica, e ricopiato a mano con I e O al posto
     di 1 e 0: deve passare lo stesso e dare la stessa partita */
  const sporco = '  ' + buono.slice(0,9).toLowerCase() + '-' + buono.slice(9,15) + '\\n' + buono.slice(15) + ' ';
  const aMano = 'es1t0' + buono.slice(5);
  out.sporco = A.spacca(sporco);
  out.aMano = A.spacca(aMano);
  out.pulito = A.spacca(buono);

  /* LE TRE SERRATURE. Tre codici si incollano nello stesso posto: il
     cambio telefono (che REGALA la squadra), la sfida, la risposta. */
  const sfida = (function(){ const p = C.componi(20260922, 5); p.golA = 3; p.golD = 2; return C.impacca(p); })();
  const trasf = t.rete.codiceTrasferimento();
  out.serrature = {
    sfidaComeRisposta: A.spacca(sfida).errore || '(ACCETTATA!)',
    rispostaComeSfida: C.spacca(buono).errore || '(ACCETTATA!)',
    trasfComeRisposta: A.spacca(trasf).errore || '(ACCETTATO!)',
    rispostaHaPunti: buono.indexOf('.') >= 0,
  };
  const prima = { id: t.rete.mem().id, segreto: t.rete.mem().segreto };
  const accettato = t.rete.accettaTrasferimento(buono);
  const dopo = { id: t.rete.mem().id, segreto: t.rete.mem().segreto };
  if(accettato){ t.rete.mem().id = prima.id; t.rete.mem().segreto = prima.segreto; }
  out.serrature.rispostaComeTrasferimento = accettato ||
    dopo.id !== prima.id || dopo.segreto !== prima.segreto;
  return out;
})`;

async function gruppoA(browser, porta) {
  titolo('A) IL CODICE DI RISPOSTA — il giro, la lunghezza, il controllo, le tre serrature');
  const P = await T.apri(browser, porta, { width: 915, height: 412 });
  try {
    if (!await haPorta(P)) {
      di(false, 'A) la porta __test.amici non c\'e\': il gioco non sa fare un codice di risposta',
         'window.__test.amici === undefined');
      no += 5; console.log('  NO  A1..A6 — niente da misurare senza la porta');
      return;
    }
    const r = await P.pag.evaluate(([g]) => (new Function('return ' + g))()(), [GIRO_A]);

    di(r.identici === r.prove,
       'A1) impacca-e-spacca e\' l\'identita\'', r.identici + '/' + r.prove +
       (r.errori.length ? ' · primo guasto: ' + r.errori[0] : ''));

    di(r.lungMax <= TETTO_CARATTERI,
       'A2) il codice sta in un messaggio e si detta al telefono (tetto ' + TETTO_CARATTERI + ')',
       'lunghezza ' + r.lungMin + '..' + r.lungMax + ' · ' + r.esempio);

    di(r.unaCifra.prese === r.unaCifra.prove && r.unaCifra.prove > 10000,
       'A3a) UNA cifra cambiata: catturate tutte (esaustivo su 50 codici)',
       r.unaCifra.prese + '/' + r.unaCifra.prove + ' = ' +
       (100 * r.unaCifra.prese / Math.max(1, r.unaCifra.prove)).toFixed(3) + '%');

    di(r.dueScambiate.prese === r.dueScambiate.prove && r.dueScambiate.prove > 2000,
       'A3b) DUE cifre scambiate: catturate tutte (esaustivo su 50 codici)',
       r.dueScambiate.prese + '/' + r.dueScambiate.prove + ' = ' +
       (100 * r.dueScambiate.prese / Math.max(1, r.dueScambiate.prove)).toFixed(3) + '%');

    /* =====================================================================
       LA SOGLIA A CAMPIONE, e perche' non e' il 100%. Con 20 bit di
       controllo la fuga teorica e' una su un milione, ma esiste una
       classe che NESSUN controllo puo' prendere: cambiare l'ultimo
       simbolo del carico (che pesa 31^0=1) e compensare sull'ultimo
       simbolo di controllo da' un codice VALIDO di un'altra partita.
       Misurato al compito 0: sei fughe su 99.147, tutte e sei su quella
       coppia. La soglia e' il 99,9% — un controllo da un simbolo solo,
       misurato, si ferma al 98,56% sulle stesse mutazioni e al 66% sulle
       due scambiate, quindi la soglia distingue i due. */
    const tasso = 100 * r.aCaso.prese / Math.max(1, r.aCaso.prove);
    const classi = Object.keys(r.aCaso.fughe || {});
    di(tasso >= 99.9 && r.aCaso.prove > 50000,
       'A3c) da 1 a 4 simboli a caso: almeno il 99,9% catturato',
       r.aCaso.prese + '/' + r.aCaso.prove + ' = ' + tasso.toFixed(3) + '% · fughe: ' +
       (classi.length ? classi.map(k => k + ' x' + r.aCaso.fughe[k]).join(', ') : 'nessuna'));

    const R = r.rifiuti;
    di(R.buono === '' && R.versione === 'altra-versione' && R.motore === 'altro-motore' &&
       R.troncato !== '' && R.lettera !== '' && R.vuoto !== '' && R.senzaPrefisso !== '' &&
       !r.sporco.errore && r.sporco.seme === r.pulito.seme &&
       !r.aMano.errore && r.aMano.seme === r.pulito.seme,
       'A4) i rifiuti dicono la causa vera, e un codice sporcato o ricopiato a mano passa lo stesso',
       JSON.stringify(R) + ' · sporco: ' + (r.sporco.errore || 'passa') +
       ' · ES1T0: ' + (r.aMano.errore || 'passa'));

    const S = r.serrature;
    di(S.sfidaComeRisposta === 'e-una-sfida' && S.rispostaComeSfida === 'e-un-risultato' &&
       S.trasfComeRisposta !== '' && S.trasfComeRisposta !== '(ACCETTATO!)' &&
       !S.rispostaHaPunti && !S.rispostaComeTrasferimento,
       'A5) le tre serrature: sfida, risposta e cambio telefono non si confondono in nessun verso',
       'sfida letta come risposta -> ' + S.sfidaComeRisposta +
       ' · risposta letta come sfida -> ' + S.rispostaComeSfida +
       ' · trasferimento letto come risposta -> ' + S.trasfComeRisposta +
       ' · accettaTrasferimento(risposta) ha cambiato l\'identita\': ' + S.rispostaComeTrasferimento);
  } finally { await P.ctx.close(); }
}

/* =====================================================================
   GRUPPO B — DENTRO IL CODICE NON C'E' NESSUNO.
   ===================================================================== */
const vesti = (P, chi) => P.pag.evaluate(chi => {
  const t = window.__test;
  const m = t.rete.mem();
  m.id = chi.id; m.segreto = chi.segreto;
  t.save.teamName = chi.squadra;
  t.save.rosa = t.save.rosa.map((r, i) => ({ nome: chi.squadra + ' GIOCATORE ' + i,
    vel: 71 - i, tiro: 55 + i, tecnica: 62 + i * 2, tackle: 50 + i }));
  t.save.mentalita = 1; t.save.taglia = 5;
  return { id: m.id, squadra: t.save.teamName };
}, chi);

async function gruppoB(browser, porta) {
  titolo('B) DENTRO IL CODICE NON C\'E\' NESSUNO — due identita\', un codice solo');
  const A = await T.apri(browser, porta, { width: 915, height: 412 });
  const B = await T.apri(browser, porta, { width: 800, height: 360 });
  try {
    if (!await haPorta(A)) {
      no += 4; console.log('  NO  B1..B4 — la porta __test.amici non c\'e\'');
      return;
    }
    const chiA = { id: '11111111-1111-4111-8111-111111111111', segreto: 'SEGRETODIUNO', squadra: 'DOPOLAVORO' };
    const chiB = { id: '22222222-2222-4222-8222-222222222222', segreto: 'SEGRETODIDUE', squadra: 'BORGATA VECCHIA' };
    await vesti(A, chiA);
    await vesti(B, chiB);

    const codice = P => P.pag.evaluate(() => {
      const A = window.__test.amici;
      return A.impacca({ ver: A.ver, motore: A.motore, seme: 20260922, sfA: 3, sfD: 2, riA: 2, riD: 2 });
    });
    const cA = await codice(A), cB = await codice(B);
    di(cA === cB && cA.length > 12,
       'B1) due telefoni con identita\' diverse e lo stesso risultato danno lo STESSO codice',
       cA === cB ? cA : ('A: ' + cA + '  ·  B: ' + cB));

    /* la prova grossolana: da sola non prova niente (un falso che
       cifrasse il segreto la passerebbe), ma un falso ingenuo lo prende */
    const nudo = s => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const dentro = [];
    for (const [nome, v] of [['id', chiA.id], ['segreto', chiA.segreto], ['squadra', chiA.squadra],
                             ['nome di un giocatore', chiA.squadra + ' GIOCATORE 0']]) {
      if (nudo(v).length > 3 && nudo(cA).indexOf(nudo(v)) >= 0) dentro.push(nome);
    }
    di(dentro.length === 0,
       'B2) e nel codice non si legge ne\' l\'id ne\' il segreto ne\' un nome',
       dentro.length ? 'TROVATI: ' + dentro.join(', ') : 'nessuno dei quattro');

    /* B3 — AL CONTRARIO: leggere e SEGNARE una risposta non e' diventare
       qualcuno. Si misura sul giro completo, non sulla sola funzione che
       spacca: e' segnando che il gioco scrive nel salvataggio. */
    const prima = await B.pag.evaluate(() => { const m = window.__test.rete.mem();
      return { id: m.id, segreto: m.segreto, nome: window.__test.save.teamName }; });
    const esito = await B.pag.evaluate(c => {
      try { return JSON.stringify(window.__test.amici.segnaTesto('CHI TE LO MANDA', c)); }
      catch (e) { return 'ECCEZIONE ' + e.message; }
    }, cA);
    const dopo = await B.pag.evaluate(() => { const m = window.__test.rete.mem();
      return { id: m.id, segreto: m.segreto, nome: window.__test.save.teamName }; });
    di(prima.id === dopo.id && prima.segreto === dopo.segreto && prima.nome === dopo.nome,
       'B3) leggere e segnare una risposta non cambia l\'identita\' di chi la riceve',
       'id ' + (prima.id === dopo.id ? 'fermo' : prima.id + ' -> ' + dopo.id) +
       ' · segreto ' + (prima.segreto === dopo.segreto ? 'fermo' : 'CAMBIATO') +
       ' · nome ' + (prima.nome === dopo.nome ? 'fermo' : 'CAMBIATO') +
       ' · segnata: ' + String(esito).slice(0, 90));

    /* B4 — e il codice non si muove SULLO STESSO TELEFONO: ricostruito
       dopo aver segnato, con una classifica diversa in pancia, dev'essere
       identico a prima. Si confronta B con B e non B con A apposta: il
       confronto fra i due telefoni e' il mestiere di B1, e due prove che
       cadono insieme non sono due prove. */
    const cB2 = await codice(B);
    di(cB2 === cB, 'B4) lo stesso codice a ogni ricostruzione sullo stesso telefono, anche dopo aver segnato',
       cB2 === cB ? 'stabile' : cB + ' -> ' + cB2);
  } finally { await A.ctx.close(); await B.ctx.close(); }
}

/* =====================================================================
   GRUPPO C — LA CLASSIFICA SI COMPILA, E LE DUE SI SPECCHIANO.

   C1 e' l'unica prova che gioca davvero: due partite intere a CPU
   contro CPU (ordine sacro: la partita si apre dentro cartaNuova /
   cartaGioca, setCpuVsCpu DOPO). Le altre chiamano le porte, che sono
   pure: un banco che giocasse venti partite per misurare un tetto
   misurerebbe la propria pazienza.
   ===================================================================== */
const CREA = `(async function(seme){
  const t = window.__test;
  const r = t.carta.nuova({ seme: seme, taglia: 5 });
  if(r && r.errore) return { errore: r.errore };
  t.setCpuVsCpu(true);
  for(let k = 0; k < 60 && t.state !== 'end'; k++) t.simulate(6);
  await new Promise(x => setTimeout(x, 50));
  return { scena: t.state, punteggio: t.score.slice(), codice: t.carta.codice,
           mie: t.amici.mie, risposta: t.amici.risposta || '' };
})`;

/* =====================================================================
   E CHI RICEVE LA SFIDA NON GIOCA COME CHI L'HA MANDATA, altrimenti la
   prova dello specchio non prova niente.

   Due telefoni che giocano la STESSA partita con la CPU al comando
   finiscono con lo stesso punteggio — e' la garanzia della voce #135 —
   quindi ogni testa a testa sarebbe un pari, e un pari specchiato e'
   uguale a se stesso: passerebbe anche un gioco che si confonde i due
   punteggi. Qui il secondo telefono gioca COL POLLICE, il copione fisso
   di _sfida-due-telefoni (lo stesso di `sfida` e di `duello-impronta`):
   deterministico dato il seme, e diverso da come gioca la CPU. Cioe'
   quel che succede fra due persone diverse.
   ===================================================================== */
const GIOCA = `(async function(codice, copione){
  const t = window.__test;
  const r = t.carta.gioca(codice);
  if(r && r.errore) return { errore: r.errore };
  if(copione) (new Function('return ' + copione))()(24000, [], 0);
  else { t.setCpuVsCpu(true); for(let k = 0; k < 60 && t.state !== 'end'; k++) t.simulate(6); }
  await new Promise(x => setTimeout(x, 50));
  return { scena: t.state, punteggio: t.score.slice(), risposta: t.amici.risposta || '',
           daSegnare: t.amici.daSegnare, mie: t.amici.mie };
})`;

async function gruppoC(browser, porta) {
  titolo('C) LA CLASSIFICA SI COMPILA, E LE DUE SI SPECCHIANO');
  const A = await T.apri(browser, porta, { width: 915, height: 412 });
  const B = await T.apri(browser, porta, { width: 800, height: 360 });
  try {
    if (!await haPorta(A)) {
      no += 7; console.log('  NO  C1..C7 — la porta __test.amici non c\'e\'');
      return;
    }
    await vesti(A, { id: '11111111-1111-4111-8111-111111111111', segreto: 'UNO', squadra: 'DOPOLAVORO' });
    await vesti(B, { id: '22222222-2222-4222-8222-222222222222', segreto: 'DUE', squadra: 'BORGATA' });

    /* ---------------------------------------------------- C1, il giro */
    const anna = await A.pag.evaluate(([g, s]) => (new Function('return ' + g))()(s), [CREA, 20260922]);
    const bruno = anna.codice
      ? await B.pag.evaluate(([g, c, cop]) => (new Function('return ' + g))()(c, cop),
                             [GIOCA, anna.codice, T.COPIONE])
      : { errore: 'niente-codice' };

    /* Bruno segna da se': i due punteggi li ha gia' tutti e due */
    const rigaB = bruno.daSegnare ? await B.pag.evaluate(() => {
      const t = window.__test;
      return t.amici.segnaTesto('ANNA', '');
    }) : null;

    /* e rimanda ventuno caratteri. Anna li incolla e scrive un nome. */
    const rigaA = bruno.risposta ? await A.pag.evaluate(c => window.__test.amici.segnaTesto('BRUNO', c),
                                                        bruno.risposta) : null;

    const scontro = (a, b) => {   /* chi ha fatto meglio: differenza, poi gol */
      const ma = a[0] - a[1], mb = b[0] - b[1];
      return (ma > mb || (ma === mb && a[0] > b[0])) ? 'meglio' : ((ma < mb || (ma === mb && a[0] < b[0])) ? 'peggio' : 'pari');
    };
    const atteso = (anna.punteggio && bruno.punteggio) ? scontro(anna.punteggio, bruno.punteggio) : '?';
    const specchio = { meglio: 'peggio', peggio: 'meglio', pari: 'pari' }[atteso];
    const vA = rigaA && rigaA.riga, vB = rigaB && rigaB.riga;
    const contaGiusta = (r, come) => !!r && r.g === 1 &&
      r.v === (come === 'meglio' ? 1 : 0) && r.p === (come === 'pari' ? 1 : 0) &&
      r.s === (come === 'peggio' ? 1 : 0);
    di(!anna.errore && !bruno.errore && anna.codice && bruno.risposta &&
       contaGiusta(vA, atteso) && contaGiusta(vB, specchio) &&
       vA && vB && vA.n === 'BRUNO' && vB.n === 'ANNA' &&
       vA.mf === anna.punteggio[0] && vA.ms === anna.punteggio[1] &&
       vB.mf === bruno.punteggio[0] && vB.ms === bruno.punteggio[1] &&
       vA.sf === bruno.punteggio[0] && vB.sf === anna.punteggio[0],
       'C1) il giro intero su due telefoni, e le due classifiche si specchiano',
       'ANNA ' + (anna.punteggio || []).join('-') + ' (' + anna.scena + ') contro BRUNO ' +
       (bruno.punteggio || []).join('-') + ' (' + bruno.scena + ')' +
       ' · risposta ' + (bruno.risposta || '—') + ' (' + (bruno.risposta || '').length + ' caratteri)' +
       ' · da ANNA: ' + JSON.stringify(vA && { n: vA.n, v: vA.v, p: vA.p, s: vA.s }) +
       ' · da BRUNO: ' + JSON.stringify(vB && { n: vB.n, v: vB.v, p: vB.p, s: vB.s }) +
       (anna.errore ? ' · ERRORE A ' + anna.errore : '') + (bruno.errore ? ' · ERRORE B ' + bruno.errore : ''));

    /* ------------------------------------------------- C2, il doppione */
    const doppio = bruno.risposta ? await A.pag.evaluate(c => {
      const t = window.__test;
      const prima = JSON.parse(JSON.stringify(t.amici.righe));
      const r = t.amici.segnaTesto('BRUNO', c);
      return { esito: r, prima: prima, dopo: t.amici.righe };
    }, bruno.risposta) : null;
    di(!!doppio && doppio.esito && doppio.esito.errore === 'gia-segnata' &&
       JSON.stringify(doppio.prima) === JSON.stringify(doppio.dopo),
       'C2) lo stesso codice incollato due volte conta una volta sola',
       doppio ? 'esito «' + (doppio.esito.errore || 'ACCETTATO DI NUOVO') + '» · la riga si e\' mossa: ' +
                (JSON.stringify(doppio.prima) !== JSON.stringify(doppio.dopo)) : 'niente codice');

    /* --------------------------------------------- C3, il tetto e C7, i semi */
    const tetti = await A.pag.evaluate(() => {
      const t = window.__test, A = t.amici;
      A.azzera();
      const uno = (nome, seme) => A.segna({ nome: nome, seme: seme, miei: [3, 1], suoi: [1, 1] });
      /* AMICI_TETTO+1 nomi diversi: il piu' vecchio per data deve uscire */
      const esiti = [];
      for (let i = 0; i < A.tetto + 1; i++) esiti.push(uno('AMICO ' + i, 1000 + i));
      const righe = A.righe;
      /* e i semi di un amico solo: AMICI_SEMI+1 partite, poi la prima
         torna e deve poter rientrare (il tetto si vede solo cosi') */
      A.azzera();
      for (let k = 0; k < A.semiTetto + 1; k++) uno('SOLO UNO', 5000 + k);
      const dopo = A.righe[0];
      const rientro = uno('SOLO UNO', 5000);      /* il primo seme, sfrattato */
      return { tetto: A.tetto, semiTetto: A.semiTetto,
               quante: righe.length, nomi: righe.map(r => r.n),
               uscito: esiti[esiti.length - 1] && esiti[esiti.length - 1].uscito,
               semiTenuti: dopo ? dopo.semi.length : -1, giocate: dopo ? dopo.g : -1,
               rientro: rientro && (rientro.errore || 'ACCETTATO') };
    });
    di(tetti.quante === tetti.tetto && tetti.nomi.indexOf('AMICO 0') < 0 &&
       tetti.nomi.indexOf('AMICO ' + tetti.tetto) >= 0 && tetti.uscito === 'AMICO 0',
       'C3) la lista e\' tappata a ' + tetti.tetto + ' amici, ed esce il piu\' vecchio DICENDOLO',
       tetti.quante + ' righe · uscito «' + tetti.uscito + '» · dentro: ' +
       tetti.nomi.slice(0, 3).join(', ') + ' ... ' + tetti.nomi.slice(-2).join(', '));
    di(tetti.semiTenuti === tetti.semiTetto && tetti.giocate === tetti.semiTetto + 1 &&
       tetti.rientro === 'ACCETTATO',
       'C7) i semi ricordati sono tappati a ' + tetti.semiTetto + ' per amico, e il tetto si dichiara',
       tetti.semiTenuti + ' semi tenuti su ' + tetti.giocate + ' partite · il seme sfrattato rientra: ' +
       tetti.rientro + ' (e' + 'ra il prezzo dichiarato)');

    /* ------------------------------------------------- C4, il riavvio */
    /* e il nome si guarda come tutto il resto del salvataggio: si
       sfronda, si alza a maiuscolo, si accorcia a dodici come il nome
       della squadra. Il nome QUI e' lungo venti e pieno di spazi apposta. */
    /* DUE META', e la prima e' quella che discrimina davvero. Il gioco
       riscrive il salvataggio anche mentre la pagina se ne va (grep
       «salvaPerSparizione»), quindi una ricarica da sola NON dice se
       segnare scrive sul disco: lo scriverebbe l'uscita. Qui si guarda
       il disco SUBITO, senza chiudere niente, e poi si ricarica. */
    const scritto = await A.pag.evaluate(() => {
      const A = window.__test.amici;
      A.azzera();
      const r = A.segna({ nome: '  giovanni   battista  ', seme: 424242, miei: [4, 1], suoi: [2, 2] });
      let disco = null;
      try { disco = JSON.parse(localStorage.getItem('calcetto_save_v4')); } catch (e) {}
      return { nome: r.nome, suDisco: (disco && disco.amici && disco.amici.righe || []).map(x => x.n) };
    });
    await A.pag.reload({ waitUntil: 'load' });
    await A.pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
    const dopoRiavvio = await A.pag.evaluate(() => window.__test.amici.righe);
    di(dopoRiavvio.length === 1 && dopoRiavvio[0].n === 'GIOVANNI BAT' && scritto.nome === 'GIOVANNI BAT' &&
       scritto.suDisco.length === 1 && scritto.suDisco[0] === 'GIOVANNI BAT' &&
       dopoRiavvio[0].v === 1 && dopoRiavvio[0].mf === 4 && dopoRiavvio[0].ms === 1 &&
       dopoRiavvio[0].sf === 2 && dopoRiavvio[0].ss === 2 && dopoRiavvio[0].semi.length === 1,
       'C4) segnare scrive sul disco SUBITO, la riga torna dopo il riavvio, e il nome e\' sfrondato a dodici',
       '«  giovanni   battista  » -> «' + scritto.nome + '» · sul disco senza chiudere niente: ' +
       JSON.stringify(scritto.suDisco) + ' · dopo il riavvio: ' +
       JSON.stringify(dopoRiavvio.map(r => ({ n: r.n, g: r.g, v: r.v, mf: r.mf, ms: r.ms, semi: r.semi.length }))));

    /* ------------------------------- C5, il salvataggio e' ADDITIVO */
    /* =====================================================================
       COME SI MISURA, e non e' ovvio. Un salvataggio scritto PRIMA di
       questa voce e' quello stesso salvataggio senza la chiave `amici`:
       si costruisce togliendogliela, che e' esattamente la sua forma.

       Ma il confronto NON si fa fra il testo in localStorage e il SAVE
       riletto: la whitelist normalizza (una chiave che non rilegge, come
       `tutorialVisto`, torna al default e sembrerebbe persa per colpa
       mia). Si fa fra DUE RILETTURE dello stesso gioco — una col
       salvataggio intero, una senza la chiave — e si pretende che le due
       fotografie siano uguali chiave per chiave.
       ===================================================================== */
    /* E IL SALVATAGGIO NON SI DOTTORA DA FUORI, ed e' una trappola gia'
       pagata da questo banco: il gioco riscrive il salvataggio mentre la
       pagina se ne va (grep «mai un'eccezione mentre l'app se ne va»),
       quindi un localStorage.setItem seguito da un reload viene
       CANCELLATO dalla pagina che sta morendo. Si toglie la chiave dal
       SAVE vivo e si lascia scrivere il gioco: quel che esce e' la forma
       esatta di un salvataggio nato prima di questa voce. */
    const rileggi = async togli => {
      const testo = await A.pag.evaluate(k => {
        if (k) delete window.__test.save[k];
        persistSave();
        return localStorage.getItem('calcetto_save_v4');
      }, togli || '');
      await A.pag.reload({ waitUntil: 'load' });
      await A.pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
      const foto = await A.pag.evaluate(() => JSON.parse(JSON.stringify(window.__test.save)));
      return { testo, foto };
    };
    await A.pag.evaluate(() => {
      const t = window.__test, S = t.save;
      S.coins = 4321; S.teamName = 'DOPOLAVORO'; S.durata = 120; S.taglia = 7;
      S.tutorialDone = true; S.sponde = 'campo'; S.miraGuidata = 'essenziale';
      S.stats.partite = 77; S.div = { g: 3, stelle: 1, premi: [1, 1, 1, 0, 0, 0, 0, 0, 0] };
      S.rete.punti = 1180; S.lastRes = [3, 1]; S.record.golPartita = { v: 8, data: '2026-09-01' };
      t.amici.azzera();
      t.amici.segna({ nome: 'PRIMA', seme: 777, miei: [2, 0], suoi: [1, 0] });
    });
    const intero = await rileggi('');            /* col salvataggio nuovo */
    const vecchio = await rileggi('amici');      /* e senza la chiave, come prima */
    const conAmici = JSON.parse(intero.testo);
    const fotoPiena = intero.foto, fotoVecchia = vecchio.foto;
    const senzaAmici = JSON.parse(vecchio.testo);
    const segnaSubito = await A.pag.evaluate(() => {
      const r = window.__test.amici.segna({ nome: 'DOPO', seme: 888, miei: [1, 0], suoi: [0, 0] });
      return !!(r && r.ok);
    });
    const perse = [];
    for (const k of Object.keys(fotoPiena)) {
      if (k === 'amici') continue;
      if (JSON.stringify(fotoPiena[k]) !== JSON.stringify(fotoVecchia[k]))
        perse.push(k + ': ' + JSON.stringify(fotoPiena[k]).slice(0, 30) +
                   ' -> ' + JSON.stringify(fotoVecchia[k]).slice(0, 30));
    }
    di(conAmici.amici !== undefined && senzaAmici.amici === undefined && perse.length === 0 &&
       fotoPiena.v === 4 && fotoVecchia.v === 4 &&
       fotoVecchia.amici !== undefined && fotoVecchia.amici.righe.length === 0 && segnaSubito &&
       fotoPiena.amici && fotoPiena.amici.righe && fotoPiena.amici.righe.length === 1,
       'C5) la chiave `amici` e\' ADDITIVA: un salvataggio nato prima si rilegge senza perdere niente, e resta v4',
       (Object.keys(fotoPiena).length - 1) + ' chiavi confrontate, perse: ' +
       (perse.length ? perse.join(' | ') : 'NESSUNA') + ' · versione ' + fotoVecchia.v +
       ' · senza la chiave (' + senzaAmici.amici + ') torna il default vuoto: ' +
       JSON.stringify(fotoVecchia.amici) +
       ' · e su un salvataggio vecchio si segna subito: ' + segnaSubito);

    /* ------------------- C6, il punteggio proprio non lo riscrive nessuno */
    const bugia = await A.pag.evaluate(() => {
      const t = window.__test, A = t.amici;
      A.azzera();
      A.ricorda(31337, 3, 2);                     /* ho creato questa sfida e ho chiuso 3-2 */
      const falso = A.impacca({ ver: A.ver, motore: A.motore, seme: 31337,
                                sfA: 0, sfD: 5, riA: 4, riD: 0 });   /* «tu avevi fatto 0-5» */
      const r = A.segnaTesto('BUGIARDO', falso);
      const onesto = A.impacca({ ver: A.ver, motore: A.motore, seme: 31337,
                                 sfA: 3, sfD: 2, riA: 4, riD: 0 });
      return { esito: r, riga: A.righe[0], onestoUguale: A.spacca(onesto).seme === 31337 };
    });
    const rb = bugia.riga;
    di(!!rb && rb.mf === 3 && rb.ms === 2 && rb.sf === 4 && rb.ss === 0 &&
       !!(bugia.esito && bugia.esito.avviso) && rb.s === 1,
       'C6) un codice non puo\' riscrivere il TUO punteggio, se il telefono quel seme se lo ricorda',
       'il codice diceva che avevi fatto 0-5, il telefono ricordava 3-2 -> segnato ' +
       (rb ? rb.mf + '-' + rb.ms : '?') + ' · avviso: «' + ((bugia.esito && bugia.esito.avviso) || 'NESSUNO') + '»');
  } finally { await A.ctx.close(); await B.ctx.close(); }
}

/* =====================================================================
   GRUPPO D — LA SCHERMATA, E LA RETE CHE NON C'E'.
   ===================================================================== */
async function gruppoD(browser, porta) {
  titolo('D) LA SCHERMATA E LA RETE CHE NON C\'E\'');

  /* D1 — la classifica a rete spenta: i testa a testa si vedono LO
     STESSO, e la riga che spiega la rete c'e' accanto, non al posto */
  const P = await T.apri(browser, porta, { width: 915, height: 412 });
  try {
    const vista = await P.pag.evaluate(async () => {
      const t = window.__test;
      if (!t.amici) return { errore: 'niente-porta' };
      t.reteBase('');                        /* niente server: il telefono senza campo */
      t.amici.azzera();
      t.amici.segna({ nome: 'GIORGIO', seme: 11, miei: [3, 1], suoi: [1, 1] });
      t.amici.segna({ nome: 'GIORGIO', seme: 12, miei: [0, 2], suoi: [2, 0] });
      t.amici.segna({ nome: 'ANNA', seme: 13, miei: [2, 2], suoi: [2, 2] });
      await t.sfida.apriClassifica();
      const righe = [...document.querySelectorAll('#claAmici .clariga')].map(e => e.textContent.replace(/\s+/g, ' ').trim());
      const rete = (document.getElementById('claLista') || {}).textContent || '';
      return { righe: righe, rete: rete.replace(/\s+/g, ' ').trim(),
               schermo: (document.getElementById('classifica') || {}).className || '' };
    });
    di(!vista.errore && vista.righe && vista.righe.length === 2 &&
       /GIORGIO/.test(vista.righe.join(' ')) && /ANNA/.test(vista.righe.join(' ')) &&
       vista.rete.length > 20,
       'D1) a rete spenta la classifica degli amici si vede lo stesso, e la riga della rete dice perche\'',
       (vista.errore ? 'ERRORE ' + vista.errore + ' · ' : '') +
       'righe: ' + JSON.stringify(vista.righe) + ' · rete: «' + String(vista.rete).slice(0, 70) + '»');

    /* D2 — il pannello: il campo del nome, il bottone, e le cause */
    const pann = await P.pag.evaluate(async () => {
      const t = window.__test;
      if (!t.amici) return { errore: 'niente-porta' };
      t.amici.azzera();
      /* UN'IDENTITA' CI VUOLE, se no codiceTrasferimento() torna la
         stringa vuota (grep «if(!this.haIdentita) return ''») e la prova
         del codice-che-non-si-manda misurerebbe il vuoto */
      const m = t.rete.mem();
      m.id = '33333333-3333-4333-8333-333333333333'; m.segreto = 'SEGRETODIPROVA';
      t.sfida.apri();
      for (let i = 0; i < 60 && t.sfida.occupato; i++) await new Promise(r => setTimeout(r, 50));
      const b = document.getElementById('btnSfidaCarta');
      if (!b) return { errore: 'niente-ingresso' };
      b.click();
      const nome = document.getElementById('sfCartaAmico');
      const segna = document.getElementById('btnSfCartaSegna');
      const campo = document.getElementById('sfCartaIn');
      if (!nome || !segna || !campo) return { errore: 'niente-campi', nome: !!nome, segna: !!segna };
      const A = t.amici;
      const buono = A.impacca({ ver: A.ver, motore: A.motore, seme: 20260922, sfA: 3, sfD: 2, riA: 2, riD: 2 });
      const sfida = (function () { const p = t.carta.componi(20260922, 5); p.golA = 3; p.golD = 2; return t.carta.impacca(p); })();
      const prove = [
        ['senza nome', '', buono],
        ['un codice di sfida', 'GIORGIO', sfida],
        ['il cambio telefono', 'GIORGIO', t.rete.codiceTrasferimento()],
        ['storto', 'GIORGIO', buono.slice(0, 9) + (buono[9] === 'Z' ? 'Y' : 'Z') + buono.slice(10)],
        ['niente', 'GIORGIO', ''],
        ['buono', 'GIORGIO', buono],
      ];
      const cause = [];
      for (const [che, n, c] of prove) {
        nome.value = n; campo.value = c;
        segna.click();
        cause.push([che, ((document.getElementById('sfCartaNota') || {}).textContent || '').replace(/\s+/g, ' ').trim()]);
      }
      return { cause: cause, righe: A.righe.length, primo: A.righe[0] || null };
    });
    const cs = (pann.cause || []).map(c => c[1]);
    di(!pann.errore && cs.length === 6 && cs.every(c => c && c.length > 12) &&
       new Set(cs).size === 6 && /cambio telefono/i.test(cs[2] || '') &&
       pann.righe === 1 && pann.primo && pann.primo.n === 'GIORGIO',
       'D2) il pannello segna, e cinque modi di sbagliare danno cinque cause diverse',
       (pann.errore ? 'ERRORE ' + pann.errore + ' · ' : '') +
       (pann.cause || []).map(c => c[0] + ': «' + c[1].slice(0, 42) + '»').join(' · ') +
       ' · righe segnate: ' + pann.righe);
  } finally { await P.ctx.close(); }

  /* D3 — LA PIEGA. La schermata SFIDA non si tocca: i tre bersagli di
     `sigillo` B3 e il quarto della voce #135 devono stare AGLI STESSI
     PIXEL. E la classifica nuova dev'essere la prima cosa sotto il
     titolo. */
  const C = await T.apri(browser, porta, { width: 800, height: 360 });
  try {
    const piega = await C.pag.evaluate(async () => {
      const t = window.__test;
      const r = e => { const x = e && e.getBoundingClientRect(); return x ? Math.round(x.bottom) : -1; };
      t.reteBase('');                        /* la piega non deve aspettare un server */
      t.sfida.sfide = [];
      for (let i = 0; i < 5; i++) t.sfida.sfide.push({
        id: i + 1, attaccante: 'x', seme: '7' + i, taglia: 5, gol_a: 3, gol_d: 2,
        giocata: new Date().toISOString(), vista: i > 1, verificata: 0, nome: 'SQUADRA ' + i });
      t.sfida.apri();
      for (let i = 0; i < 60 && t.sfida.occupato; i++) await new Promise(x => setTimeout(x, 50));
      t.sfida.dipingi();
      const out = { h: innerHeight,
                    cerca: r(document.getElementById('btnSfidaCerca')),
                    primaRiga: r(document.querySelector('#sfLista .sfriga')),
                    primoGuarda: r(document.querySelector('#sfLista [data-guarda]')) };
      t.sfida.sfide = []; t.sfida.dipingi();
      out.carta = r(document.getElementById('btnSfidaCarta'));
      /* e la classifica, con cinque amici */
      if (t.amici) {
        t.amici.azzera();
        for (let i = 0; i < 5; i++) t.amici.segna({ nome: 'AMICO ' + i, seme: 900 + i, miei: [3, 1], suoi: [1, 1] });
        await t.sfida.apriClassifica();
        out.primoAmico = r(document.querySelector('#claAmici .clariga'));
        out.titolo = r(document.querySelector('#classifica h1'));
      }
      return out;
    });
    di(piega.cerca === 220 && piega.primaRiga === 329 && piega.primoGuarda === 308 && piega.carta === 347 &&
       piega.primoAmico > 0 && piega.primoAmico <= piega.h,
       'D3) la schermata SFIDA non si e\' mossa di un pixel, e il primo amico sta sopra la piega',
       'CERCA@' + piega.cerca + ' primaRiga@' + piega.primaRiga + ' GUARDA@' + piega.primoGuarda +
       ' SFIDA-DI-CARTA@' + piega.carta + ' · titolo@' + piega.titolo +
       ' primoAmico@' + piega.primoAmico + ' su piega ' + piega.h);

    /* D4 — LA CIMA DEL PANNELLO. Misurata al compito 0: oggi il pannello
       e' alto 542 px su una piega di 360 e `align-items:center` gli manda
       la cima a -91, dove nessuno scorrimento arriva. Col nome e il
       bottone diventa piu' alto ancora: o si raggiunge, o meta' della
       spiegazione non esiste. */
    const cima = await C.pag.evaluate(async () => {
      const t = window.__test;
      t.sfida.apri();
      for (let i = 0; i < 60 && t.sfida.occupato; i++) await new Promise(x => setTimeout(x, 50));
      t.sfida.cartaCodice = 'CARTA' + '0123456789ABCDEFGHJKMNPQRSTVWXYZ'.repeat(3).slice(0, 74);
      t.sfida.mostraCarta();
      const ov = document.getElementById('sfidaCarta');
      const patto = ov.querySelector('.patto');
      ov.scrollTop = 0;
      const t0 = Math.round(patto.getBoundingClientRect().top);
      const titolo = Math.round(patto.querySelector('b').getBoundingClientRect().top);
      ov.scrollTop = 99999;
      const fondo = Math.round(patto.getBoundingClientRect().bottom);
      return { cima: t0, titolo: titolo, fondo: fondo, h: innerHeight,
               alta: Math.round(patto.getBoundingClientRect().height) };
    });
    di(cima.cima >= 0 && cima.titolo >= 0 && cima.fondo <= cima.h + 2,
       'D4) il pannello si scorre tutto: la cima si raggiunge e il fondo anche',
       'cima@' + cima.cima + ' titolo@' + cima.titolo + ' fondo scorrendo@' + cima.fondo +
       ' · carta alta ' + cima.alta + ' su piega ' + cima.h);
  } finally { await C.ctx.close(); }

  /* =====================================================================
     D5 — ZERO RETE, IN TRE TACCHE.

     Si intercetta tutto e passa solo il documento del gioco. Si conta il
     DELTA dopo l'apertura della schermata SFIDA, che una richiesta la fa
     da sempre per progetto (grep «La prima richiesta al server la fa
     apri()»): contarla come colpa di questa funzione vorrebbe dire
     misurare la cosa sbagliata.

     E TRE TACCHE E NON UNA, perche' le domande sono tre e mescolarle
     darebbe una risposta sola e sbagliata:

       1) il giro — gioca una sfida ricevuta, fai nascere il codice di
          risposta, segna la riga — deve fare ZERO richieste. Qui
          l'indirizzo del server c'e' ancora: una versione che mandasse
          la classifica a un endpoint cadrebbe proprio in questa tacca;
       2) aprire CLASSIFICA con la rete accesa ne fa UNA, ed e' la
          classifica DI RETE, che chiede da sempre. Non e' un rosso: e'
          il confine fra le due cose che vivono in quella schermata;
       3) aprire CLASSIFICA a rete spenta ne fa ZERO e mostra i testa a
          testa lo stesso. E' il telefono senza campo, che e' il motivo
          per cui questa funzione esiste. */
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
    await pag.evaluate(async () => {
      const t = window.__test;
      t.sfida.apri();
      for (let i = 0; i < 40 && t.sfida.occupato; i++) await new Promise(r => setTimeout(r, 50));
    });
    await pag.waitForTimeout(400);
    const tacca = bloccate.length;
    const giro = await pag.evaluate(async () => {
      const t = window.__test;
      if (!t.amici) return { errore: 'niente-porta' };
      t.amici.azzera();
      /* si riceve una sfida e si gioca */
      const o = t.carta.componi(20260925, 5); o.golA = 3; o.golD = 2;
      const r = t.carta.gioca(t.carta.impacca(o));
      if (r && r.errore) return { errore: r.errore };
      t.setCpuVsCpu(true);
      for (let k = 0; k < 60 && t.state !== 'end'; k++) t.simulate(6);
      await new Promise(x => setTimeout(x, 50));
      const risposta = t.amici.risposta;
      if (!risposta) return { errore: 'niente-risposta' };
      /* si segna dal pannello vero, col bottone vero */
      const b = document.getElementById('btnSfidaCarta');
      if (b) b.click();
      const nome = document.getElementById('sfCartaAmico');
      if (!nome) return { errore: 'niente-campo-nome', risposta: risposta };
      nome.value = 'ANNA';
      const seg = document.getElementById('btnSfCartaSegna');
      if (!seg) return { errore: 'niente-bottone-segna' };
      seg.click();
      return { risposta: risposta, righe: t.amici.righe.length, base: !!t.reteStato().stato };
    });
    await pag.waitForTimeout(400);
    const dopoGiro = bloccate.slice(tacca);

    const tacca2 = bloccate.length;
    const conRete = await pag.evaluate(async () => {
      const t = window.__test;
      if (!t.amici) return { errore: 'niente-porta' };
      await t.sfida.apriClassifica();
      return { viste: document.querySelectorAll('#claAmici .clariga').length };
    });
    await pag.waitForTimeout(400);
    const dopoClassifica = bloccate.slice(tacca2);

    const tacca3 = bloccate.length;
    const senzaRete = await pag.evaluate(async () => {
      const t = window.__test;
      if (!t.amici) return { errore: 'niente-porta' };
      t.reteBase('');                       /* il telefono senza campo */
      await t.sfida.apriClassifica();
      return { viste: document.querySelectorAll('#claAmici .clariga').length,
               rete: ((document.getElementById('claLista') || {}).textContent || '').replace(/\s+/g, ' ').trim() };
    });
    await pag.waitForTimeout(400);
    const dopoSpenta = bloccate.slice(tacca3);

    di(!giro.errore && giro.righe === 1 && dopoGiro.length === 0 &&
       conRete.viste === 1 && senzaRete.viste === 1 && dopoSpenta.length === 0 &&
       senzaRete.rete.length > 20,
       'D5) il giro e la classifica degli amici non chiedono niente a nessuno, nemmeno col server acceso',
       (giro.errore ? 'ERRORE ' + giro.errore + ' · ' : '') +
       'risposta ' + (giro.risposta || '—') + ' · gioca+segna: ' + dopoGiro.length + ' richieste' +
       (dopoGiro.length ? ' (' + dopoGiro.slice(0, 3).join(' ') + ')' : '') +
       ' · CLASSIFICA con la rete: ' + dopoClassifica.length + ' (la classifica DI RETE, da sempre)' +
       ' · CLASSIFICA a rete spenta: ' + dopoSpenta.length + ', e i testa a testa si vedono lo stesso (' +
       senzaRete.viste + ' riga) con la riga della rete che dice perche\'' +
       ' · all\'apertura di SFIDA: ' + tacca);
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
