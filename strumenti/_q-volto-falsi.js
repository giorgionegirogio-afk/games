/* =====================================================================
   _q-volto-falsi.js — I NOVE FALSI CHE CONDANNANO IL BANCO DEL VOLTO
   (voce #147, compito 1)

   PERCHE' ESISTE. `_q-volto.js` che stampa ventun OK non ha provato
   niente: potrebbe essere verde perche' il gioco e' giusto, o perche'
   guarda dalla parte sbagliata. SEDICI cantieri di fila in questa casa
   hanno pagato questa lezione — il #144 promuoveva due falsi su cinque,
   il #145 aveva una sonda che condannava il P2P misurando il proprio
   numero di socket, il #146 ha dovuto aggiungere un testimone a B2
   perche' «zero sbirciate» e «cassetta vuota» davano lo stesso referto.

   E QUESTO BANCO HA GIA' PAGATO LA STESSA LEZIONE DUE VOLTE, nel giro
   di un'ora e prima di avere un solo falso: la sua prima stesura
   dichiarava VERDI C1 e G3 sul gioco del merge-base, dove il pannello
   non esiste. Un tabellone che non c'e' non mostra la mossa dell'altro,
   e un giudice che si ferma prima non accusa nessuno. Due verdi
   comprati con un'assenza. Adesso C1 pretende che il tabellone parli
   PRIMA di assolverlo, e G3 pretende che il controllo discrimini.

   I NOVE, e la prova che ciascuno deve far diventare rossa:

     volto-sopra     mette la voce nuova SOPRA la lista, dove il #135
                     aveva gia' misurato il danno (prima riga a 375 su
                     una piega di 360).                       -> A1
     volto-muto      il pannello si apre, e' bello, e i bottoni non
                     fanno niente.                            -> B2
     volto-ansioso   si impegna appena il dito lascia la mira, con la
                     barra ancora in corsa: la rivelazione dell'altro
                     arriva a gesto non finito.               -> C1
     volto-svelto    la cattura chiama le porte vere invece di posare
                     la mossa: il duello si risolve in locale e il
                     nastro prende le 6 due volte.            -> D1
     volto-rete      il pannello parla alla rete appena si apre.  -> F1
     respiro-piatto  la carica non si muove mai: attesta invece di
                     respirare.                               -> E1
     respiro-rotella a orologio fermo la carica si azzera: il blocco
                     si vede, ed e' proprio cio' che il progetto
                     dell'onda voleva togliere.               -> E2
     respiro-motore  il respiro SPOSTA il giocatore invece di
                     disegnarlo: e' presentazione che diventa
                     simulazione.                             -> E3
     respiro-dado    il tremolio esce da dado() invece che da
                     dadoDeco(): la cosmetica torna a mangiare i
                     sorteggi di gioco, che e' il difetto che il #129
                     ha curato e il #132 ha ritrovato nell'audio. -> E4

   Il falso della cura (c) NON sta qui: non e' un mutante del gioco, e'
   un mutante del NASTRO, e vive dentro `_q-volto.js` G2/G3 — si toglie
   una riga vera da un nastro vero e si guarda il verdetto. Un mutante
   del gioco sarebbe piu' debole: proverebbe che il gioco sa rifiutare
   il proprio nastro rotto, non che sa rifiutare quello di un altro.

   IL CONTROLLO POSITIVO, che e' la meta' che manca a quasi tutti i
   banchi di falsi: PRIMA si verifica che il gioco ONESTO passi le prove
   con cui si giudicheranno i falsi.

   E IL DECIMO. Un banco che morde nove su nove senza aver cercato il
   decimo sta attestando. Il decimo e' dichiarato in fondo al referto.

   uso:  node strumenti/_q-volto-falsi.js [--gioco f.html] [--falsi a,b]
   esce  0 se il gioco onesto passa e ogni falso e' morso dalla prova
         che dichiara · 1 se un falso scappa · 2 se il banco e' esploso ·
         3 se il gioco indicato non ha ancora il volto
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const arg = n => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : null; };
const GIOCO = arg('gioco') ? path.resolve(RADICE, arg('gioco')) : path.join(RADICE, 'CALCETTO-il-gioco.html');

/* --falsi a,b  corre solo quelli: serve a chi sta costruendo la cura un
   pezzo per volta, e non cambia niente per chi corre la batteria. */
const SOLOF = arg('falsi') ? arg('falsi').split(',').map(x => x.trim()) : null;

const FALSI = ([
  { nome: 'volto-sopra',     toppa: '_crit-volto-sopra.js',     morde: ['A1'] },
  { nome: 'volto-muto',      toppa: '_crit-volto-muto.js',      morde: ['B2'] },
  { nome: 'volto-ansioso',   toppa: '_crit-volto-ansioso.js',   morde: ['C1'] },
  { nome: 'volto-svelto',    toppa: '_crit-volto-svelto.js',    morde: ['D1'] },
  { nome: 'volto-rete',      toppa: '_crit-volto-rete.js',      morde: ['F1'] },
  { nome: 'respiro-piatto',  toppa: '_crit-respiro-piatto.js',  morde: ['E1'] },
  { nome: 'respiro-rotella', toppa: '_crit-respiro-rotella.js', morde: ['E2'] },
  { nome: 'respiro-motore',  toppa: '_crit-respiro-motore.js',  morde: ['E3'] },
  { nome: 'respiro-dado',    toppa: '_crit-respiro-dado.js',    morde: ['E4'] },
]).filter(f => !SOLOF || SOLOF.includes(f.nome));

/* A1 compare due volte nel referto (uno per formato): la prova si
   chiama A1@800x360 e A1@915x412, e basta che UNA sia rossa perche' la
   piega si sia mossa. Il resto ha un nome secco. */
const gruppoDi = p => p[0];
const espr = p => '^\\s*(NO|OK)\\s+' + p + '(@[0-9x]+)?\\)';
const rossa = (testo, p) => new RegExp('^\\s*NO\\s+' + p + '(@[0-9x]+)?\\)', 'm').test(testo);
const verde = (testo, p) => new RegExp('^\\s*OK\\s+' + p + '(@[0-9x]+)?\\)', 'm').test(testo) && !rossa(testo, p);
const presente = (testo, p) => new RegExp(espr(p), 'm').test(testo);

function corri(fileGioco, gruppi) {
  const a = ['strumenti/_q-volto.js', '--gioco', path.relative(RADICE, fileGioco)];
  if (gruppi) a.push('--solo', gruppi.join(','));
  const r = spawnSync(process.execPath, a, { cwd: RADICE, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { uscita: r.status, testo: (r.stdout || '') + (r.stderr || '') };
}

(async () => {
  console.log('\nI NOVE FALSI DEL VOLTO');
  if (!fs.existsSync(GIOCO)) { console.error('PROVA NULLA: ' + GIOCO + ' non esiste'); process.exit(3); }

  const gruppiTutti = [...new Set(FALSI.flatMap(f => f.morde.map(gruppoDi)))].sort();
  const onesto = corri(GIOCO, gruppiTutti);
  if (/btnSfidaDischetto non esiste/.test(onesto.testo)) {
    console.log('  PROVA NULLA: il gioco non ha ancora il volto — i falsi si costruiscono sopra la cura.');
    process.exit(3);
  }
  const provTutte = [...new Set(FALSI.flatMap(f => f.morde))];

  /* «ROSSA» E «ASSENTE» NON SONO LA STESSA COSA: e' la correzione che il
     #146 ha pagato, ricopiata parola per parola. Una prova che non
     compare nel referto non e' una prova fallita: vuol dire che il banco
     non ci e' arrivato, e allora non si conclude niente. */
  const rosse = provTutte.filter(p => rossa(onesto.testo, p));
  const assenti = provTutte.filter(p => !presente(onesto.testo, p));
  const oneste = provTutte.filter(p => verde(onesto.testo, p));
  console.log('\n  CONTROLLO POSITIVO — il gioco onesto: ' + oneste.length + ' su ' + provTutte.length + ' prove verdi');
  for (const p of rosse) console.log('    NO  ' + p + ' e\' ROSSA gia\' sul gioco onesto: con lei il banco non discrimina');
  for (const p of assenti) console.log('    ??  ' + p + ' non compare nel referto: il banco non ci e\' arrivato');

  if (onesto.uscita === 2 || assenti.length) {
    console.error('\n  PROVA NULLA: il controllo positivo non e\' utilizzabile' +
      (onesto.uscita === 2 ? ' (il banco e\' esploso, uscita 2)' : '') +
      (assenti.length ? ' (prove assenti: ' + assenti.join(', ') + ')' : '') + '.');
    console.error('  Non si conclude niente sui falsi: un banco che non ha misurato non assolve e non condanna.');
    console.error('  ultime righe del referto onesto:\n' + onesto.testo.trim().split('\n').slice(-6).join('\n'));
    process.exit(3);
  }
  if (rosse.length) {
    console.error('\n  IL CONTROLLO POSITIVO E\' FALLITO. Senza, ogni falso sarebbe "morso" da un banco rotto.');
    process.exit(1);
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'volto-falsi-'));
  let scappati = 0;
  console.log('\n  LA BITE LIST');
  for (const f of FALSI) {
    const toppa = path.join(__dirname, f.toppa);
    if (!fs.existsSync(toppa)) { console.log('    ??  ' + f.nome.padEnd(16) + ' TOPPA ASSENTE: ' + f.toppa); scappati++; continue; }
    const usc = path.join(tmp, 'falso-' + f.nome + '.html');
    const t = spawnSync(process.execPath, [toppa, GIOCO, usc], { cwd: RADICE, encoding: 'utf8' });
    if (t.status !== 0 || !fs.existsSync(usc)) {
      console.log('    ??  ' + f.nome.padEnd(16) + ' LA TOPPA NON SI APPLICA: ' + (t.stderr || t.stdout || '').trim());
      scappati++; continue;
    }
    const r = corri(usc, [...new Set(f.morde.map(gruppoDi))]);
    const morso = f.morde.every(p => rossa(r.testo, p));
    console.log('    ' + (morso ? 'MORSO ' : 'SCAPPA') + '  ' + f.nome.padEnd(16) + ' atteso rosso su ' + f.morde.join(',') +
      '   ->  ' + f.morde.map(p => p + '=' + (rossa(r.testo, p) ? 'NO' : (verde(r.testo, p) ? 'OK' : '?'))).join(' '));
    if (!morso) scappati++;
    try { fs.unlinkSync(usc); } catch (e) {}
  }
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log('\n  ' + (FALSI.length - scappati) + ' morsi su ' + FALSI.length);
  /* =====================================================================
     IL DECIMO E L'UNDICESIMO. Un banco che morde nove su nove senza aver
     cercato il decimo sta attestando; e l'undicesimo non e' una rinuncia,
     e' una scoperta fatta misurando.
     ===================================================================== */
  const DICHIARATI = [
    'IL DECIMO — IL PANNELLO BRUTTO. Un volto che funziona alla perfezione e parla',
    '  male: che accusa chi sparisce invece di annullare il tiro, che dice «errore di',
    '  rete» dove la causa vera e\' «l\'altro ha una versione diversa», che chiama',
    '  «imbroglio» un\'astensione. Il banco misura che una frase CI SIA e che non',
    '  perda il filo; non sa dire se la frase e\' giusta verso chi la legge. Misurare',
    '  la qualita\' di una parola con un cancello sarebbe attestare: quelle righe le',
    '  guarda una persona, e in questo cantiere le ha guardate.',
    '',
    'L\'UNDICESIMO — IL TABELLONE SPIONE, CHE NON SI PUO\' COSTRUIRE. Era in',
    '  programma: un pannello che mostra la mossa dell\'altro prima della',
    '  rivelazione. Misurandolo si e\' capito perche\' non esiste: quella mossa non',
    '  arriva MAI sul telefono prima che io mi sia impegnato, perche\' manda()',
    '  spedisce la rivelazione solo se ha in casa l\'impegno dell\'altro. La',
    '  proprieta\' e\' del PROTOCOLLO (#146, falso «gentile»), non del volto. Un',
    '  cancello che la rimisurasse sul pannello passerebbe SEMPRE, anche su un',
    '  pannello scritto male — ed e\' esattamente la prima stesura di C1, che e\'',
    '  stata buttata. Al suo posto C1 misura l\'istante che il pannello PUO\'',
    '  rompere: quando parte il mio impegno. E quel falso esiste: volto-ansioso.',
  ];
  console.log('\n  I FALSI DICHIARATI E NON MORSI\n');
  for (const r of DICHIARATI) console.log('    ' + r);
  process.exit(scappati ? 1 : 0);
})();
