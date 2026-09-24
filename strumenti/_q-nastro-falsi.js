/* =====================================================================
   _q-nastro-falsi.js — I SETTE FALSI CHE CONDANNANO IL BANCO
   (voce #148, compito 1)

   PERCHE' ESISTE. Un banco che stampa undici OK non ha ancora provato
   niente: potrebbe essere verde perche' il gioco e' giusto, o perche'
   guarda dalla parte sbagliata. DICIOTTO cantieri di fila in questa casa
   hanno pagato questa lezione, e il #148 l'ha pagata di nuovo al primo
   verde — la prova A3 accusava il gioco di scrivere «rose diverse» sui
   due telefoni mentre stava guardando UN MILLISECONDO di scarto
   d'orologio.

   Qui si costruiscono SETTE VERSIONI BUGIARDE DEL GIOCO, e per ognuna si
   dichiara PRIMA quali prove devono cadere E quali devono RESTARE VERDI.
   La seconda meta' e' quella che fa la differenza fra un banco che
   discrimina e uno che e' rosso comunque: se un falso facesse cadere
   tutto, il banco non starebbe distinguendo niente.

   I SETTE, e le prove che ciascuno muove:

     possesso        ognuno si mette in casa: su un capo le rose sono
                     scambiate.               -> A3, A6 · A1 resta VERDE
     scambiate       le due rose scambiate SUI DUE CAPI ALLO STESSO MODO:
                     la bugia e' coerente, e A3 non la puo' vedere.
                                              -> A6 · A1 e A3 restano VERDI
     mie             due volte la propria rosa.  -> A3, A6
     solo-a          le tre righe solo sul telefono che ha creato la
                     stanza.                  -> A2, A3, A6 · A1 VERDE
     primo-storto    la riga 15 dichiara sempre l'altro tiratore.
                                              -> A1, A2 · A5 e A6 VERDI
     serie-cieca     il giudice non apre la serie: e' il gioco di ieri
                     piu' le tre righe, cioe' la cura che il #147 aveva
                     stimato.                 -> A1, A2, A5 (i passi esplodono)
     punteggio       il giudice guarda G.score invece dei rigori segnati.
                                              -> A1, A2 · A5 e A6 VERDI

   E LA COSA CHE I TRE FALSI DELLE ROSE HANNO INSEGNATO AL BANCO, che e'
   una misura e non un'opinione: IN UNA SERIE DI RIGORI IL PUNTEGGIO NON
   DIPENDE DALLE ROSE. Il duello legge le zone, la banda di potenza e la
   manopola della difficolta', e non tocca nessun attributo di nessun
   giocatore. Percio' A1 e A2 — il verdetto del giudice — restano VERDI
   con le rose scambiate, per possesso e raddoppiate: la prima stesura
   del banco dichiarava che le avrebbero morse, e le ha viste scappare
   tutte e tre. La prova che le prende e' A6, che confronta le rose
   scritte con quelle VERE dei due telefoni invece di aspettarsi che
   sbaglino il punteggio.

   IL CONTROLLO POSITIVO, che e' la meta' che manca a quasi tutti i
   banchi di falsi: PRIMA si verifica che il gioco ONESTO passi. Senza,
   un banco rotto in modo da essere rosso SEMPRE «condannerebbe» tutti e
   sette senza discriminare niente.

   E L'OTTAVO, dichiarato in fondo perche' e' scomodo: `_crit-nastro-
   tardi` scrive le tre righe DOPO il primo tiro, e questo banco NON LO
   MORDE. Non e' una svista: per un nastro del dischetto l'ordine delle
   righe di testa non e' un formato (vagliaNastro le cerca scorrendo, e
   le tre astensioni dello schermo — le uniche che guardino l'ordine —
   su un nastro senza pixel non si applicano, voce #144). Si costruisce e
   si misura lo stesso, perche' un banco che morde sette su sette senza
   aver cercato l'ottavo sta attestando.

   uso:  node strumenti/_q-nastro-falsi.js [--gioco f.html]
   esce  0 se il gioco onesto passa e ogni falso e' morso come dichiarato
         1 se un falso scappa (o ne cade uno che doveva restare verde)
         2 se il banco e' esploso
         3 se il gioco indicato non ha ancora la cura del #148
   ===================================================================== */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const arg = n => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : null; };
const GIOCO = arg('gioco') ? path.resolve(RADICE, arg('gioco')) : path.join(RADICE, 'CALCETTO-il-gioco.html');

const FALSI = [
  { nome: 'possesso',     crit: '_crit-nastro-possesso.js',     morde: ['A3', 'A6'],       lascia: ['A1', 'A5'] },
  { nome: 'scambiate',    crit: '_crit-nastro-scambiate.js',    morde: ['A6'],             lascia: ['A1', 'A3', 'A5'] },
  { nome: 'mie',          crit: '_crit-nastro-mie.js',          morde: ['A3', 'A6'],       lascia: ['A1', 'A5'] },
  { nome: 'solo-a',       crit: '_crit-nastro-solo-a.js',       morde: ['A2', 'A3', 'A6'], lascia: ['A1'] },
  { nome: 'primo-storto', crit: '_crit-nastro-primo-storto.js', morde: ['A1', 'A2'],       lascia: ['A3', 'A5', 'A6'] },
  { nome: 'serie-cieca',  crit: '_crit-giudice-serie-cieca.js', morde: ['A1', 'A2', 'A5'], lascia: ['A3', 'A6'] },
  { nome: 'punteggio',    crit: '_crit-giudice-punteggio.js',   morde: ['A1', 'A2'],       lascia: ['A3', 'A5', 'A6'] },
];
/* l'ottavo: si costruisce, si misura e si dichiara. Non ha un `morde`. */
const OTTAVO = { nome: 'tardi', crit: '_crit-nastro-tardi.js' };

function corri(fileGioco) {
  const a = ['strumenti/_q-nastro-differito.js', '--gioco', path.relative(RADICE, fileGioco).split(path.sep).join('/'), '--solo', 'A'];
  const r = spawnSync(process.execPath, a, { cwd: RADICE, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { uscita: r.status, testo: (r.stdout || '') + (r.stderr || '') };
}
const rossa = (testo, p) => new RegExp('^\\s*NO\\s+' + p + '\\)', 'm').test(testo);
const verde = (testo, p) => new RegExp('^\\s*OK\\s+' + p + '\\)', 'm').test(testo);

(async () => {
  console.log('\nI SETTE FALSI DEL NASTRO GIUDICABILE');
  if (!fs.existsSync(GIOCO)) { console.error('PROVA NULLA: ' + GIOCO + ' non esiste'); process.exit(3); }
  /* PRIMA DELLA CURA I SETTE NON ESISTONO, e non e' un rosso: i loro
     ancoraggi sono dentro la cura. Dirlo qui, con la causa vera, invece
     di lasciare che sette falsi «non costruiti» sembrino sette buchi. */
  if (!fs.readFileSync(GIOCO, 'utf8').includes('Reg.carta(')) {
    console.log('  PROVA NULLA: questo gioco non ha ancora la cura del #148 (Reg.carta) —');
    console.log('               i sette falsi si costruiscono sopra di lei.');
    process.exit(3);
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'falsi-148-'));

  /* ------------------------------------------- IL CONTROLLO POSITIVO */
  const onesto = corri(GIOCO);
  if (onesto.uscita === 3) {
    console.log('  PROVA NULLA: ' + (onesto.testo.match(/PROVA NULLA:.*/) || ['il banco non ha potuto misurare'])[0]);
    process.exit(3);
  }
  const ok = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].every(p => verde(onesto.testo, p));
  console.log('  ' + (ok ? 'OK  ' : 'NO  ') + 'il gioco ONESTO passa il gruppo A (senza, i sette non provano niente)');
  if (!ok) {
    console.log(onesto.testo.split('\n').filter(r => /^\s*(OK|NO)\s+A/.test(r)).join('\n'));
    console.log('\n  IL BANCO NON PUO\' CONDANNARE NESSUNO: il gioco onesto e\' gia\' rosso.');
    process.exit(1);
  }

  let scappati = 0, caduti = 0;
  for (const f of FALSI) {
    const via = path.join(tmp, 'falso-' + f.nome + '.html');
    const c = spawnSync(process.execPath, ['strumenti/' + f.crit, path.relative(RADICE, GIOCO).split(path.sep).join('/'), via],
                        { cwd: RADICE, encoding: 'utf8' });
    if (c.status !== 0) {
      console.log('  NO  ' + f.nome.padEnd(13) + ' FALSO NON COSTRUITO: ' + (c.stderr || c.stdout || '').trim());
      scappati++;
      continue;
    }
    const r = corri(via);
    if (r.uscita === 3) {
      console.log('  NO  ' + f.nome.padEnd(13) + ' PROVA NULLA sul falso: ' +
                  (r.testo.match(/PROVA NULLA:.*/) || [''])[0]);
      scappati++;
      continue;
    }
    const morse = f.morde.filter(p => rossa(r.testo, p));
    const sfuggite = f.morde.filter(p => !rossa(r.testo, p));
    const tenute = f.lascia.filter(p => verde(r.testo, p));
    const perse = f.lascia.filter(p => !verde(r.testo, p));
    const bene = !sfuggite.length && !perse.length;
    if (!bene) { if (sfuggite.length) scappati++; if (perse.length) caduti++; }
    console.log('  ' + (bene ? 'OK  ' : 'NO  ') + f.nome.padEnd(13) +
                ' morso da ' + (morse.join('+') || 'NESSUNA') +
                (sfuggite.length ? '   SFUGGITO A ' + sfuggite.join('+') : '') +
                (f.lascia.length ? '   · restano verdi ' + (tenute.join('+') || 'NESSUNA') : '') +
                (perse.length ? '   CADUTE ANCHE ' + perse.join('+') + ' (il banco non discrimina)' : ''));
  }

  /* -------------------------------------------------------- L'OTTAVO */
  const viaO = path.join(tmp, 'falso-' + OTTAVO.nome + '.html');
  const cO = spawnSync(process.execPath, ['strumenti/' + OTTAVO.crit, path.relative(RADICE, GIOCO).split(path.sep).join('/'), viaO],
                       { cwd: RADICE, encoding: 'utf8' });
  let rigaOttavo = 'non costruito: ' + (cO.stderr || '').trim();
  if (cO.status === 0) {
    const rO = corri(viaO);
    const rosse = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].filter(p => rossa(rO.testo, p));
    rigaOttavo = rosse.length ? ('MORSO da ' + rosse.join('+') + ' — la dichiarazione qui sotto va riscritta')
                              : 'NON MORSO, come dichiarato';
  }
  console.log('\n  L\'OTTAVO, dichiarato: «tardi» (le tre righe dopo il primo tiro) — ' + rigaOttavo + '.');
  console.log('    Per un nastro del dischetto l\'ordine delle righe di testa non e\' un formato:');
  console.log('    vagliaNastro le cerca scorrendo, e le tre astensioni dello schermo — le uniche');
  console.log('    che guardino l\'ordine — su un nastro senza pixel non si applicano (voce #144).');

  const rossi = scappati + caduti;
  console.log('\n  ' + (FALSI.length - rossi) + ' su ' + FALSI.length +
              (rossi ? ('   SCAPPATI: ' + scappati + ' · BANCO CHE NON DISCRIMINA: ' + caduti) : '   tutti morsi come dichiarato'));
  process.exit(rossi ? 1 : 0);
})();
