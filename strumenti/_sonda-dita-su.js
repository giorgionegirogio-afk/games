/* SONDA — le dita si alzano davvero quando lo strumento muore?

   Usa la classe Vetro VERA di strumenti/_vetro.js (coda compresa), ma al
   posto di adb mette un tubo finto che registra i byte e il momento in
   cui viene chiuso. La cosa sotto esame non e' adb: e' l'ORDINE con cui
   Vetro versa la coda e chiude il tubo. Un byte che arriva dopo la
   chiusura non arriva.

   Poi ricostruisce dagli eventi (24 byte l'uno, ABS_MT_TRACKING_ID)
   quali dita restano GIU' alla fine del flusso.

   Non serve il telefono.
   uso: node strumenti/_sonda-dita-su.js
*/
const cp = require('child_process');

/* --- il tubo finto, installato PRIMA che _vetro.js catturi spawn --- */
const TUBI = [];
const spawnVero = cp.spawn;
cp.spawn = function (cmd, args, opz) {
  const tubo = { byte: [], chiuso: false, ucciso: false, dopoChiusura: 0 };
  TUBI.push(tubo);
  const finto = {
    stdin: {
      write(b) {
        if (tubo.chiuso) { tubo.dopoChiusura += b.length; return false; }
        tubo.byte.push(Buffer.from(b)); return true;
      },
      end() { tubo.chiuso = true; },
    },
    stderr: { on() { } },
    on() { },
    kill() { tubo.ucciso = true; tubo.chiuso = true; },
  };
  return finto;
};

const { Vetro, EV_ABS, SLOT, TID } = require('./_vetro.js');
cp.spawn = spawnVero;                    // rimesso a posto: serviva solo al require

const pausa = ms => new Promise(r => setTimeout(r, ms));

function ditaGiu(tubo) {
  const b = Buffer.concat(tubo.byte);
  let slot = 0;
  const giu = new Set();
  for (let i = 0; i + 24 <= b.length; i += 24) {
    const tipo = b.readUInt16LE(i + 16), cod = b.readUInt16LE(i + 18), val = b.readInt32LE(i + 20);
    if (tipo === EV_ABS && cod === SLOT) slot = val;
    else if (tipo === EV_ABS && cod === TID) { if (val >= 0) giu.add(slot); else giu.delete(slot); }
  }
  return { giu: [...giu], eventi: Math.floor(b.length / 24), persi: Math.floor(tubo.dopoChiusura / 24) };
}

async function prova(nome, chiusura) {
  TUBI.length = 0;
  const v = new Vetro('adb-finto', 'finto', '/dev/null');
  v.giu(0, 100, 300);                    // il pollice sinistro: la levetta, che non si alza mai
  await pausa(60);
  v.giu(1, 800, 350);                    // il pollice destro: un pulsante
  await pausa(120);
  await chiusura(v);
  await pausa(400);                      // tempo abbondante perche' la coda finisca
  const r = ditaGiu(TUBI[0]);
  console.log('  ' + nome.padEnd(28) + String(r.eventi).padStart(2) + ' eventi arrivati' +
    (r.persi ? ', ' + r.persi + ' scritti DOPO la chiusura (persi)' : '') +
    '  ·  dita ancora GIU\': ' +
    (r.giu.length ? '[' + r.giu.join(',') + ']  <-- TOCCO FANTASMA' : 'nessuna'));
  return r.giu;
}

(async () => {
  console.log('=== LE DITA SI ALZANO? (classe Vetro vera, tubo finto) ===\n');

  /* 1. quello che faceva la prima edizione della toppa: process.exit(2)
        da dentro il giro della partita, cioe' niente del tutto. */
  const a = await prova('uscita secca (niente)', async () => { });

  /* 2. solo chiudi(), con le dita ancora giu': e' la trappola che sta
        dentro _vetro.js — su() mette in coda, chiudi() chiude subito. */
  const b = await prova('solo chiudi()', async v => { v.chiudi(); });

  /* 3. la chiusura ingenua, come la scriverebbe chiunque */
  const c = await prova('su+su+chiudi di fila', async v => { v.su(1); v.su(0); v.chiudi(); });

  /* 4. lo smonta() della toppa: alza, ASPETTA CHE LA CODA SIA VUOTA,
        poi chiude. */
  const d = await prova('smonta() della toppa', async v => {
    try { v.su(1); v.su(0); } catch (e) { }
    for (let i = 0; i < 200 && v.coda && v.coda.length; i++) await pausa(5);
    await pausa(120);
    try { v.chiudi(); } catch (e) { }
    await pausa(80);
  });

  console.log('');
  const casoCattivoECattivo = a.length > 0;
  const rimedioRimedia = d.length === 0;
  if (!casoCattivoECattivo) console.log('LA PROVA NON PROVA NIENTE: il caso cattivo non lascia dita giu\'.');
  if (!rimedioRimedia) console.log('IL RIMEDIO NON RIMEDIA: smonta() lascia dita giu\'.');
  if (casoCattivoECattivo && rimedioRimedia)
    console.log('IL RIMEDIO RIMEDIA: l\'uscita secca lascia dita giu\', smonta() le alza tutte.');
  process.exit(casoCattivoECattivo && rimedioRimedia ? 0 : 1);
})();
