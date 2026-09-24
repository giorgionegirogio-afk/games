/* =====================================================================
   _q-dischetto-falsi.js — I NOVE FALSI CHE CONDANNANO IL BANCO
   (voce #146 compito 1; i due del seme a due mani, voce #150 compito 3)

   PERCHE' ESISTE. Un banco a due telefoni che stampa sette OK non ha
   ancora provato niente: potrebbe essere verde perche' il gioco e'
   giusto, o perche' il banco guarda dalla parte sbagliata. QUINDICI
   cantieri di fila in questa casa hanno pagato questa lezione, e i due
   piu' recenti in modo rumoroso: il #144 ha scoperto che senza una
   prova aggiunta il suo banco promuoveva DUE falsi su cinque, e il #145
   ha avuto una sonda che condannava l'intero P2P misurando il proprio
   numero di socket.

   Percio' qui si costruiscono NOVE VERSIONI BUGIARDE DEL GIOCO, e per
   ognuna si dichiara PRIMA quale prova deve farla cadere. Un falso che
   non viene morso non e' un fallimento del falso: e' un buco nel banco,
   e il banco va riparato, non il falso addolcito.

   I NOVE, e la prova che ciascuno deve far diventare rossa:

     gentile     rivela senza aspettare l'impegno dell'altro.
                 E' IL PIU' CATTIVO: funziona, la serie finisce, i
                 punteggi coincidono, e sembra tutto a posto — solo che
                 chi parla per secondo vince sempre.          -> B1
     credulone   non verifica che la rivelazione ricomponga l'impegno.
                 L'impegno diventa una decorazione.           -> B3
     semesuo     calcola il seme dal proprio nonce soltanto.  -> A3
     fidato      crede all'esito dichiarato dall'altro invece di
                 calcolare il proprio: chi bara vince scrivendo «gol».
                                                              -> C6
     vincitore   quando l'altro sparisce assegna la vittoria a chi
                 resta. Spegnere il telefono dell'altro diventa una
                 strategia. Lascia la CAUSA giusta e cambia solo
                 l'esito, apposta: un banco che guardasse la parola e
                 non i punti lo promuoverebbe.                -> G5
     sfrenato    ritira senza pausa: sfonda il freno.         -> E1b
                 RETTIFICA A EDIZIONI (24 settembre 2026, voce #149):
                 era «-> E1», ed E1 non lo mordeva piu'. Il gruppo E e'
                 stato rifatto perche' attestava (moltiplicava le
                 richieste per una costante che nel gioco non scandisce
                 niente), e nella prima stesura nuova chiedeva solo che
                 il gioco SI ACCORGESSE di sfondare: lo sfrenato se ne
                 accorge benissimo e continua a chiedere sette volte
                 tanto. La prova che lo prende e' E1b, che pretende il
                 RIENTRO sotto il tetto dopo il primo 429.
     cieco       parla alla rete appena si apre il pannello.  -> F1

   E I DUE DEL SEME A DUE MANI (voce #150), che abitano l'altro cancello
   del cantiere — `_q-dischetto-seme.js`, le prove S1..S7:

     sbrigativo  LA MEZZA CURA, e il piu' cattivo di tutti e nove:
                 impegna il nonce del saluto come si deve — la busta
                 porta `hn` e non il nonce, chi guardasse solo la
                 cassetta direbbe «curato» — e poi lo rivela LO STESSO,
                 senza aspettare l'impegno dell'altro. E' il gemello di
                 `gentile` un piano piu' su. Il #149 ha scritto che una
                 mezza cura del protocollo e' peggio del buco dichiarato:
                 questo e' quel falso.                        -> S5
                 E NON LO MORDE S1, che e' la cosa da sapere: il baro di
                 S1 legge il saluto dell'altro, e anche nella mezza cura
                 il saluto porta solo un impegno. A farsi servire e' solo
                 chi si RIFIUTA di impegnarsi e aspetta.
     credone     non verifica che il nonce rivelato ricomponga l'impegno
                 del saluto: l'impegno diventa una decorazione, e i due
                 telefoni onesti escono lo stesso con lo stesso seme.
                 E' il gemello di `credulone`.                -> S4

   IL CONTROLLO POSITIVO, che e' la meta' che manca a quasi tutti i
   banchi di falsi: PRIMA si verifica che il gioco ONESTO passi. Senza,
   un banco rotto in modo da essere rosso SEMPRE «condannerebbe» tutti e
   sette senza discriminare niente — ed e' esattamente il modo in cui un
   banco di falsi diventa a sua volta un attestatore.

   E L'OTTAVO. Un banco che morde sette su sette senza aver cercato
   l'ottavo sta attestando. L'ottavo e' dichiarato in fondo al referto:
   e' il falso che questo banco NON morde, e va scritto anche se e'
   scomodo.

   uso:  node strumenti/_q-dischetto-falsi.js [--gioco f.html]
   esce  0 se il gioco onesto passa e ogni falso e' morso dalla prova
         che dichiara · 1 se un falso scappa · 2 se il banco e' esploso ·
         3 se il gioco indicato non ha ancora la sfida dal dischetto
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const arg = n => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : null; };
const GIOCO = arg('gioco') ? path.resolve(RADICE, arg('gioco')) : path.join(RADICE, 'CALCETTO-il-gioco.html');

/* nome del falso -> {toppa, banco, prove che DEVONO diventare rosse}
   `banco` dice QUALE cancello le prove nominate abitano: 'dischetto'
   (_q-dischetto.js, i gruppi A..G) o 'seme' (_q-dischetto-seme.js, le
   prove S1..S7 del seme a due mani, voce #150). */
const FALSI = [
  { nome: 'gentile',    toppa: '_crit-dischetto-gentile.js',    morde: ['B1'] },
  { nome: 'credulone',  toppa: '_crit-dischetto-credulone.js',  morde: ['B3'] },
  { nome: 'semesuo',    toppa: '_crit-dischetto-semesuo.js',    morde: ['A3'] },
  { nome: 'fidato',     toppa: '_crit-dischetto-fidato.js',     morde: ['C6'] },
  { nome: 'vincitore',  toppa: '_crit-dischetto-vincitore.js',  morde: ['G5'] },
  { nome: 'sfrenato',   toppa: '_crit-dischetto-sfrenato.js',   morde: ['E1b'] },
  { nome: 'cieco',      toppa: '_crit-dischetto-cieco.js',      morde: ['F1'] },
  /* I DUE DEL SEME A DUE MANI (voce #150). Stanno qui e non in un banco
     nuovo perche' la bite list di un cantiere si legge in un posto solo:
     un secondo elenco di falsi accanto al primo e' il modo piu' rapido
     per averne uno dei due dimenticato. */
  { nome: 'sbrigativo', toppa: '_crit-dischetto-sbrigativo.js', banco: 'seme', morde: ['S5'] },
  { nome: 'credone',    toppa: '_crit-dischetto-credone.js',    banco: 'seme', morde: ['S4'] },
];

/* quali gruppi servono a una prova: si corre solo quel gruppo, se no
   sette falsi x sette gruppi sono quaranta minuti di banco */
const gruppoDi = p => p[0];

function corri(fileGioco, gruppi) {
  const a = ['strumenti/_q-dischetto.js', '--gioco', path.relative(RADICE, fileGioco)];
  if (gruppi) a.push('--solo', gruppi.join(','));
  const r = spawnSync(process.execPath, a, { cwd: RADICE, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { uscita: r.status, testo: (r.stdout || '') + (r.stderr || '') };
}

/* IL BANCO DEL SEME, A TAGLIA RIDOTTA, E SI DICHIARA PERCHE'. Alla
   taglia piena (400 per braccio) il cancello costa 38 s, e nove falsi
   piu' il controllo positivo farebbero sei minuti di sola attesa. Qui
   non serve la potenza statistica: le due prove che devono mordere —
   S4 e S5 — sono SECCHE (20 su 20 o 0 su 20), e vent'anta tentativi
   bastano a distinguere «mai» da «sempre». Il braccio statistico resta
   a 80 solo per tenere in piedi il controllo positivo. */
function corriSeme(fileGioco) {
  const a = ['strumenti/_q-dischetto-seme.js', '--gioco', path.relative(RADICE, fileGioco),
             '--giri', '80', '--secchi', '20'];
  const r = spawnSync(process.execPath, a, { cwd: RADICE, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { uscita: r.status, testo: (r.stdout || '') + (r.stderr || '') };
}

/* una prova e' ROSSA se la sua riga comincia con NO */
const rossa = (testo, prova) => new RegExp('^\\s*NO\\s+' + prova + '\\)', 'm').test(testo);
const verde = (testo, prova) => new RegExp('^\\s*OK\\s+' + prova + '\\)', 'm').test(testo);

(async () => {
  console.log('\nI SETTE FALSI DELLA SFIDA DAL DISCHETTO');

  if (!fs.existsSync(GIOCO)) { console.error('PROVA NULLA: ' + GIOCO + ' non esiste'); process.exit(3); }

  /* ------------------------------------------- IL CONTROLLO POSITIVO */
  const gruppiTutti = [...new Set(FALSI.filter(f => f.banco !== 'seme').flatMap(f => f.morde.map(gruppoDi)))].sort();
  const onesto = corri(GIOCO, gruppiTutti);
  if (/PORTA\).*ASSENTE/.test(onesto.testo)) {
    console.log('  PROVA NULLA: il gioco non ha ancora la sfida dal dischetto — i falsi si costruiscono sopra la cura.');
    process.exit(3);
  }
  /* il controllo positivo vale per TUTTI E DUE i banchi: un banco del
     seme gia' rosso sul gioco onesto non potrebbe discriminare niente */
  const onestoS = corriSeme(GIOCO);
  onesto.testo += '\n' + onestoS.testo;
  if (onestoS.uscita === 2) onesto.uscita = 2;
  const provTutte = FALSI.flatMap(f => f.morde);

  /* «ROSSA» E «ASSENTE» NON SONO LA STESSA COSA, e confonderle e' il modo
     piu' rapido per far accusare il gioco da uno strumento che non ha
     misurato niente. Una prova che non compare nel referto NON e' una
     prova fallita: vuol dire che il banco non e' arrivato fin li' —
     browser che non parte sotto carico, contesa sulle porte, uscita 2.
     La prima versione le trattava uguale e stampava «G5 e' rossa GIA'
     sul gioco onesto», che e' un'accusa al gioco fatta con il silenzio
     del banco. Adesso si guardano TRE cose: il codice d'uscita, le
     prove rosse e le prove ASSENTI, e ognuna ha la sua parola. */
  const rosse = provTutte.filter(p => rossa(onesto.testo, p));
  const assenti = provTutte.filter(p => !rossa(onesto.testo, p) && !verde(onesto.testo, p));
  const oneste = provTutte.filter(p => verde(onesto.testo, p));
  console.log('\n  CONTROLLO POSITIVO — il gioco onesto: ' + oneste.length + ' su ' + provTutte.length + ' prove verdi');
  for (const p of rosse) console.log('    NO  ' + p + ' e\' ROSSA gia\' sul gioco onesto: il banco non puo\' discriminare con lei');
  for (const p of assenti) console.log('    ??  ' + p + ' non compare nel referto: il banco non ci e\' arrivato');

  if (onesto.uscita === 2 || assenti.length) {
    console.error('\n  PROVA NULLA: il controllo positivo non e\' utilizzabile' +
                  (onesto.uscita === 2 ? ' (il banco e\' esploso, uscita 2)' : '') +
                  (assenti.length ? ' (prove assenti: ' + assenti.join(', ') + ')' : '') + '.');
    console.error('  Non si conclude niente sui falsi: un banco che non ha misurato non assolve e non condanna.');
    const ult = onesto.testo.trim().split('\n').slice(-6).join('\n');
    console.error('  ultime righe del referto onesto:\n' + ult);
    process.exit(3);
  }
  if (rosse.length) {
    console.error('\n  IL CONTROLLO POSITIVO E\' FALLITO. Senza, ogni falso sarebbe "morso" da un banco rotto.');
    process.exit(1);
  }

  /* ------------------------------------------------------- I SETTE */
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dischetto-falsi-'));
  let scappati = 0;
  console.log('\n  LA BITE LIST');
  for (const f of FALSI) {
    const toppa = path.join(__dirname, f.toppa);
    if (!fs.existsSync(toppa)) { console.log('    ??  ' + f.nome.padEnd(11) + ' TOPPA ASSENTE: ' + f.toppa); scappati++; continue; }
    const usc = path.join(tmp, 'falso-' + f.nome + '.html');
    const t = spawnSync(process.execPath, [toppa, GIOCO, usc], { cwd: RADICE, encoding: 'utf8' });
    if (t.status !== 0 || !fs.existsSync(usc)) {
      console.log('    ??  ' + f.nome.padEnd(11) + ' LA TOPPA NON SI APPLICA: ' + (t.stderr || t.stdout || '').trim());
      scappati++; continue;
    }
    const r = (f.banco === 'seme') ? corriSeme(usc) : corri(usc, [...new Set(f.morde.map(gruppoDi))]);
    const morso = f.morde.every(p => rossa(r.testo, p));
    console.log('    ' + (morso ? 'MORSO ' : 'SCAPPA') + '  ' + f.nome.padEnd(11) + ' atteso rosso su ' + f.morde.join(',') +
                '   ->  ' + f.morde.map(p => p + '=' + (rossa(r.testo, p) ? 'NO' : (verde(r.testo, p) ? 'OK' : '?'))).join(' '));
    if (!morso) scappati++;
    try { fs.unlinkSync(usc); } catch (e) {}
  }
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log('\n  ' + (FALSI.length - scappati) + ' morsi su ' + FALSI.length);
  console.log('\n  L\'OTTAVO — il falso che questo banco NON morde, dichiarato perche' + '\'' +
              ' un banco che\n  morde sette su sette senza averlo cercato sta attestando:\n' +
              '    IL PARI CHE SPARISCE AL MOMENTO GIUSTO. Chi ha gia\' impegnato e ha letto la\n' +
              '    rivelazione dell\'altro puo\' non rivelare la propria e far annullare il tiro.\n' +
              '    Il banco lo VEDE (G4 misura l\'incompiuta) ma non lo CONDANNA, e non puo\':\n' +
              '    un abbandono puo\' essere una galleria. E\' la scelta di spec §3.4 — si toglie\n' +
              '    l\'incentivo (l\'abbandono non e\' una vittoria di nessuno) invece di\n' +
              '    sorvegliarlo. Chi legge questa riga domani: non e\' una svista, e\' il prezzo.');
  process.exit(scappati ? 1 : 0);
})();
