/* =====================================================================
   TUTTI — la batteria dei cancelli in una volta sola.

   PERCHE' ESISTE, e sono due ragioni misurate, non due opinioni.

   PRIMA: i cancelli venivano eseguiti IN FILA. Ognuno lancia il suo
   Chrome, ricarica un file da un megabyte e mezzo, gioca le sue partite
   e chiude. Una dozzina di strumenti, sommati, sono venti minuti — e
   ogni giro di lavoro li paga tre volte, perche' li esegue chi lavora,
   poi chi verifica, poi chi giudica. Sono processi INDIPENDENTI: non
   c'e' nessuna ragione perche' aspettino il proprio turno. Qui girano
   insieme, e il tempo dell'orologio diventa quello del cancello piu'
   lento invece della somma di tutti.

   SECONDA, e questa e' la piu' insidiosa: IL BERSAGLIO SI MUOVE. Mentre
   un lavoratore modifica CALCETTO-il-gioco.html, un verificatore lo
   misura. I due numeri che tornano descrivono due file diversi, e
   nessuno se ne accorge, perche' un referto non porta scritto su quale
   versione e' stato preso. E' successo: la stessa misura ha dato «ombre
   parallele 4 su 8» e, un'ora dopo, «7 su 8», e la differenza non era
   il caso — era che il file era cambiato in mezzo.
   Per questo qui l'impronta del file si prende PRIMA e DOPO. Se e'
   cambiata, il referto non viene dato: viene dichiarato nullo. Meglio
   nessun numero che un numero che parla di un file che non esiste piu'.

   La regola di casa, pagata undici volte: uno strumento che attesta
   invece di misurare e' peggio di nessuno strumento. Questo non misura
   niente di suo — esegue gli altri e riporta — ma puo' mentire in un
   modo tutto suo, cioe' dichiarando verde una batteria che non ha
   eseguito. Per questo stampa sempre quanti cancelli ha lanciato,
   quanti sono tornati, e nomina per esteso quelli saltati.

   uso:
     node strumenti/tutti.js                 la batteria che conta
     node strumenti/tutti.js --tutto         anche i lenti (avvio, equita lunga)
     node strumenti/tutti.js --insieme 2     quanti alla volta (default 4)
     node strumenti/tutti.js --solo collaudo,istantanea
     node strumenti/tutti.js --lento         uno alla volta, come prima
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const GIOCO = path.join(RADICE, 'CALCETTO-il-gioco.html');

function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const impronta = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0, 12);

/* QUANTO E' OCCUPATO IL BANCO, e perche' bisogna saperlo prima di credere
   a un cancello cronometrico.

   Un cancello che misura un tempo — giocata entro 500 ms, avvio entro 2
   secondi — su una macchina occupata boccia il gioco per un ritardo che
   non e' suo. E' successo due volte in un giorno: prestazione.js ha
   accusato l'onda di aver dimezzato il fotogramma quando il costo vero
   era un decimo di quello, e giocata ha bocciato tiro e carica mentre
   collaudo, sulla stessa macchina, passava da 36 a 219 secondi.

   Qui il carico si misura invece di supporlo, e senza dipendere dal
   sistema operativo: si cronometra un lavoro aritmetico FISSO. Su un
   banco libero dura sempre lo stesso tempo; su un banco conteso dura di
   piu', in proporzione a quanto gli e' stato tolto. Il riferimento non
   si scrive a mano — si tiene il PIU' VELOCE mai osservato, che e' la
   migliore stima disponibile di "banco libero" e non invecchia male
   quando la macchina cambia. */
const TARATURA = path.join(__dirname, 'banco-libero.json');
function carico() {
  const t0 = process.hrtime.bigint();
  let x = 0;
  for (let i = 1; i < 12e6; i++) x += Math.sqrt(i) / i;
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  let base = ms;
  try { base = JSON.parse(fs.readFileSync(TARATURA, 'utf8')).ms; } catch (e) { /* prima volta */ }
  if (ms < base) { base = ms; try { fs.writeFileSync(TARATURA, JSON.stringify({ ms: +ms.toFixed(1), nota: 'il piu veloce mai osservato: la miglior stima di banco libero' })); } catch (e) {} }
  return { ms, base, volte: ms / base, x };
}

/* I cancelli. "conta" false = lo eseguo e lo riporto, ma non fa rosso il
   totale: sono i due che danno una TABELLA da leggere invece di un si/no
   (istantanea misura 48 cose e alcune sono ambizioni, non requisiti).

   "solo" true = QUESTO NON PUO' CORRERE IN COMPAGNIA, e la ragione e' un
   difetto che questo strumento ha avuto appena nato. Alcuni cancelli non
   misurano un fatto, misurano un TEMPO: giocata.js controlla che una
   giocata risponda entro 500 ms, avvio.js che il gioco sia toccabile
   entro 2 secondi. Messi a correre accanto ad altri tre Chrome bocciano
   per contesa e non per difetto — misurato: sotto contesa a tre,
   collaudo e' passato da 36 a 265 secondi e giocata ha bocciato una
   giocata che da sola passa. Un cancello cronometrico dentro una
   batteria parallela e' uno strumento che attesta invece di misurare,
   cioe' esattamente la cosa che qui e' costata dodici volte. Quindi i
   cronometrici girano DOPO, da soli, con il campo libero: si paga il
   loro tempo per intero e si compra un numero che vale. */
const CANCELLI = [
  { nome: 'collaudo',    cmd: ['strumenti/collaudo.js'],                                conta: true,  lento: false },
  { nome: 'misura',      cmd: ['strumenti/misura.js'],                                  conta: true,  lento: false },
  { nome: 'senza-rete',  cmd: ['strumenti/senza-rete.js'],                              conta: true,  lento: false },
  { nome: 'equita',      cmd: ['strumenti/equita.js', '--partite', '10'],               conta: true,  lento: false },
  { nome: 'silhouette',  cmd: ['strumenti/silhouette.js'],                              conta: true,  lento: false },
  { nome: 'folla',       cmd: ['strumenti/folla.js'],                                   conta: true,  lento: false },
  { nome: 'seme',        cmd: ['strumenti/seme.js'],                                    conta: true,  lento: false },
  { nome: 'gabbia',      cmd: ['strumenti/gabbia.js'],                                  conta: true,  lento: false },
  { nome: 'istantanea',  cmd: ['strumenti/istantanea.js', '--dir', 'istantanee-tutti'], conta: false, lento: false },
  { nome: 'prestazione', cmd: ['strumenti/prestazione.js'],                             conta: false, lento: false },
  { nome: 'volti',       cmd: ['strumenti/volti.js'],                                   conta: true,  lento: true },
  /* da qui in giu': cronometrici, girano da soli */
  { nome: 'giocata',     cmd: ['strumenti/giocata.js', '--tutte'],                      conta: true,  lento: false, solo: true },
  { nome: 'avvio',       cmd: ['strumenti/avvio.js'],                                   conta: false, lento: true,  solo: true },
];

/* Le righe che vale la pena riportare: il verdetto finale di ognuno e
   ogni riga che dice NO. Il resto e' rumore in un referto d'insieme. */
function succo(testo) {
  const righe = testo.split(/\r?\n/);
  const no = righe.filter(r => /^\s*(NO|ROSSO)\b/.test(r) || /\bROSSO\b/.test(r)).map(r => r.trim());
  const fin = righe.filter(r => /\b(controlli|misure|confronti|azioni|prove|scene|misura[a-z]*)\b.*\b(passat|fallit|superat)/i.test(r)).map(r => r.trim());
  const tab = righe.filter(r => /^\s*su \d+\s|^\s*\d+ misure passate/.test(r)).map(r => r.trim());
  return { no, fin, tab };
}

function esegui(c) {
  return new Promise(ok => {
    const t0 = Date.now();
    const p = spawn(process.execPath, c.cmd, { cwd: RADICE, windowsHide: true });
    let out = '';
    p.stdout.on('data', d => { out += d; });
    p.stderr.on('data', d => { out += d; });
    p.on('error', e => ok({ ...c, codice: -1, out: String(e), sec: (Date.now() - t0) / 1000 }));
    p.on('close', codice => ok({ ...c, codice, out, sec: (Date.now() - t0) / 1000 }));
  });
}

/* Una coda con un tetto: il banco ha un numero finito di nuclei, e
   lanciare tredici Chrome insieme li fa litigare invece che correre. */
async function aCoda(lista, insieme) {
  const esiti = [];
  let i = 0;
  const operai = Array.from({ length: Math.min(insieme, lista.length) }, async () => {
    while (i < lista.length) {
      const mio = lista[i++];
      process.stderr.write(`  ... ${mio.nome}\n`);
      esiti.push(await esegui(mio));
    }
  });
  await Promise.all(operai);
  return esiti;
}

(async () => {
  const tutto = process.argv.includes('--tutto');
  const lento = process.argv.includes('--lento');
  const insieme = lento ? 1 : +arg('insieme', 4);
  const solo = arg('solo', null);

  let lista = CANCELLI.filter(c => tutto || !c.lento);
  if (solo) {
    const voluti = solo.split(',').map(s => s.trim());
    lista = CANCELLI.filter(c => voluti.includes(c.nome));
    const ignoti = voluti.filter(v => !CANCELLI.some(c => c.nome === v));
    if (ignoti.length) { console.error('cancelli sconosciuti: ' + ignoti.join(', ')); process.exit(2); }
  }
  const saltati = CANCELLI.filter(c => !lista.includes(c));

  const inCompagnia = lista.filter(c => !c.solo);
  const daSoli = lista.filter(c => c.solo);

  const prima = impronta(GIOCO);
  const t0 = Date.now();
  console.log(`\nBATTERIA — ${inCompagnia.length} cancelli ${insieme} alla volta` +
    (daSoli.length ? `, poi ${daSoli.length} cronometrici da soli (${daSoli.map(c => c.nome).join(', ')})` : '') +
    `, sul file ${prima}\n`);

  const esiti = await aCoda(inCompagnia, insieme);
  /* i cronometrici solo adesso, a campo libero: vedi il commento su "solo".
     E prima di eseguirli si guarda quanto e' occupato il banco, perche' e'
     l'unica cosa che puo' farli mentire. */
  let banco = null;
  if (daSoli.length) {
    /* PRIMA SI ASPETTA CHE IL BANCO SI RAFFREDDI, e questa riga e' nata da
       un errore di questo strumento. La prima versione misurava il carico
       UNA volta e tirava dritto: i Chrome della fase in compagnia stavano
       ancora morendo, il campione e' caduto in una tregua, la guardia non
       e' scattata, e avvio.js ha dichiarato 10.427 ms contro un cancello
       di 2.000. Misurato appaiato subito dopo, a banco davvero libero: la
       versione dell'ultimo commit 2.014 ms, quella di oggi 2.070. Il
       cancello aveva accusato il gioco di essere cinque volte piu' lento
       di quanto sia. Un solo campione non descrive un banco che si sta
       spegnendo: si guarda finche' non sta fermo. */
    const FINO_A = 60000, t = Date.now();
    for (;;) {
      banco = carico();
      if (banco.volte <= 1.25 || Date.now() - t > FINO_A) break;
      process.stderr.write(`  ... banco a ${banco.volte.toFixed(1)}x, aspetto che si liberi\n`);
    }
    if (banco.volte > 1.5) {
      console.log(`\n  ATTENZIONE: il banco e' occupato ${banco.volte.toFixed(1)} volte piu' del suo minimo`);
      console.log(`  (${banco.ms.toFixed(0)} ms contro ${banco.base.toFixed(0)} sul banco piu' libero mai visto).`);
      console.log(`  I cancelli cronometrici — ${daSoli.map(c => c.nome).join(', ')} — misurano un tempo,`);
      console.log(`  quindi qui possono bocciare per contesa invece che per difetto. Il loro`);
      console.log(`  verdetto va preso come un sospetto, non come una condanna: rifallo a banco libero.\n`);
    }
    esiti.push(...await aCoda(daSoli, 1));
  }
  const sec = (Date.now() - t0) / 1000;
  const dopo = impronta(GIOCO);

  esiti.sort((a, b) => CANCELLI.findIndex(c => c.nome === a.nome) - CANCELLI.findIndex(c => c.nome === b.nome));

  console.log('');
  for (const e of esiti) {
    const s = succo(e.out);
    const segno = e.codice === 0 ? 'OK ' : 'NO ';
    const peso = e.conta ? '' : '  (informativo)';
    console.log(`${segno} ${e.nome.padEnd(12)} ${String(Math.round(e.sec)).padStart(4)}s${peso}`);
    for (const r of s.fin) console.log(`       ${r}`);
    for (const r of s.tab) console.log(`       ${r}`);
    for (const r of s.no.slice(0, 8)) console.log(`       ${r}`);
    if (s.no.length > 8) console.log(`       ... e altre ${s.no.length - 8} righe NO`);
    if (e.codice !== 0 && !s.fin.length && !s.no.length) console.log(`       uscito a ${e.codice}; ultime righe:\n       ${e.out.trim().split(/\r?\n/).slice(-4).join('\n       ')}`);
  }

  const contati = esiti.filter(e => e.conta);
  const rossi = contati.filter(e => e.codice !== 0);
  const somma = esiti.reduce((a, e) => a + e.sec, 0);

  console.log(`\n  ${esiti.length} cancelli eseguiti in ${sec.toFixed(0)} s di orologio (${somma.toFixed(0)} s se in fila: ${(somma / Math.max(sec, 0.001)).toFixed(1)} volte piu' veloce)`);
  if (saltati.length) console.log(`  NON eseguiti: ${saltati.map(c => c.nome).join(', ')}${tutto ? '' : '  (--tutto per averli)'}`);

  if (dopo !== prima) {
    console.log(`\n  REFERTO NULLO: il file e' cambiato durante la misura (${prima} -> ${dopo}).`);
    console.log(`  Qualcuno sta scrivendo su CALCETTO-il-gioco.html mentre lo si misura: i numeri`);
    console.log(`  qui sopra descrivono due file diversi mescolati. Aspetta che il lavoro finisca`);
    console.log(`  e rifai la batteria. Nessun verdetto viene dato.`);
    process.exit(3);
  }

  const cronoRossi = rossi.filter(e => e.solo);
  console.log(rossi.length
    ? `\n  ROSSO: ${rossi.map(e => e.nome).join(', ')}` +
      (cronoRossi.length && banco && banco.volte > 1.5
        ? `\n  ma ${cronoRossi.map(e => e.nome).join(' e ')} misura${cronoRossi.length > 1 ? 'no' : ''} un tempo su un banco occupato ${banco.volte.toFixed(1)}x: sospetto, non condanna.\n`
        : '\n')
    : `\n  VERDE: tutti i ${contati.length} cancelli che contano sono passati, sul file ${prima}\n`);
  process.exit(rossi.length ? 1 : 0);
})();
