/* =====================================================================
   _toppa-carattere-nastro.js — NEL NASTRO L'INDICE, NON IL NOME
   (voce #132, compito 2). Sei ancore.

   IL DIFETTO. Il carattere della CPU lo decide il NOME della squadra
   avversaria (`G.car = [CAR_NEUTRO, caratterePer(G.oppName)]`, :11356) e
   il nome nel nastro non viaggia — ed e' giusto che non viaggi, perche'
   e' il dato di una persona. Ma allora il carattere non e' deciso da
   niente che stia dentro la partita: chi attacca lo legge da `a.nome`,
   chi guarda da `dif.nome` col ripiego `SAVE.teamName`. Basta che il
   difensore cambi il nome della sua squadra fra la partita e il replay —
   una cosa che il gioco gli offre — perche' gli stessi comandi muovano
   un'altra CPU. Misurato: 5 semi su 5 divergenti, punteggio diverso in 4.

   LA CURA. Nel nastro entra un INDICE fra -1 e 9, non un nome. In coda
   alla riga di tipo 7 e non in testa, perche' la lettura e' posizionale:
   `spaccaRosa` restituisce gia' `fine`, quindi `dati[p2.fine]` e'
   l'indice se c'e' e niente se il nastro e' vecchio — retrocompatibile
   alla lettura, come la versione di motore lo fu per la voce #107.

   E CHI REGISTRA ATTRAVERSA LA STESSA PORTA DI CHI RIGIOCA: `Sfida.gioca`
   passa a `startMatch` lo STESSO `opp.car` che scrive nel nastro. Cosi' i
   due capi combaciano per costruzione invece che per fortuna — e'
   la dottrina che la voce #131 ha applicato alla mira del dischetto.

   uso:  node strumenti/_toppa-carattere-nastro.js --out fuori/x.html
         node strumenti/_toppa-carattere-nastro.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/carattere-nastro.html'));

const ANCORE = [

/* 1 — l'indice, e la dichiarazione che l'ordine della tabella e' un formato */
{
  nome: '1/6 CAR_NOMI, indiceCarattere e carPerIndice',
  cerca:
`function caratterePer(nome){ return CARATTERE[String(nome||'')] || CAR_NEUTRO; }`,
  metti:
`function caratterePer(nome){ return CARATTERE[String(nome||'')] || CAR_NEUTRO; }
/* =====================================================================
   E LO STESSO CARATTERE, DETTO CON UN NUMERO (voce #132, compito 2).

   In una sfida il carattere della CPU lo decide il NOME della squadra
   avversaria, e il nome nel nastro non c'e' — ed e' giusto che non ci
   sia: e' il dato di una persona, e il tipo 7 dichiara da sempre che i
   nomi non entrano (grep «COSA NON ENTRA: i nomi, le tinte»). Ma allora
   il carattere non lo decideva niente che viaggiasse con la partita:
   chi attaccava lo leggeva da a.nome, chi guardava da dif.nome col
   ripiego SAVE.teamName, e bastava un cambio di nome fra la partita e il
   replay perche' gli stessi comandi muovessero un'altra CPU. MISURATO
   (strumenti/_sonda-132-canali.js): avversario anonimo contro avversario
   chiamato GASOMETRO, 5 semi su 5 divergenti, punteggio diverso in 4.

   Nel nastro va il RISULTATO della tabella, non il suo ingresso: un
   indice fra -1 e 9. Zero dati personali, due byte.

   E DA OGGI L'ORDINE DI CARATTERE E' UN FORMATO. Chi riordina la tabella
   qui sopra — o ci infila una squadra in mezzo invece che in fondo —
   cambia il significato di tutti i nastri gia' scritti, e deve alzare
   MOTORE_V come farebbe per una cura della simulazione. Aggiungere in
   CODA non rompe niente.

   carPerIndice non fa un OR-zero sull'indice: su un nastro storto
   «undefined|0» sarebbe 0, cioe' la PRIMA squadra della tabella, e un
   numero storto diventerebbe un carattere vero invece che nessuno.
   ===================================================================== */
const CAR_NOMI = Object.keys(CARATTERE);
function indiceCarattere(nome){ return CAR_NOMI.indexOf(String(nome||'')); }
function carPerIndice(i){
  const k = Math.round(+i);
  return (Number.isFinite(k) && k >= 0 && k < CAR_NOMI.length) ? CARATTERE[CAR_NOMI[k]] : CAR_NEUTRO;
}`,
},

/* 2 — e startMatch lo preferisce al nome, quando c'e' */
{
  nome: '2/6 G.car guarda opts.opp.car',
  cerca:
`  G.car = [CAR_NEUTRO, caratterePer(G.oppName)];`,
  metti:
`  /* L'INDICE VINCE SUL NOME, QUANDO C'E' (voce #132, compito 2). Lo
     passano le due sole chiamate che hanno un nastro sotto — Sfida.gioca
     e Sfida.guarda — e lo passano tutte e due, cosi' la partita
     registrata e quella rigiocata attraversano la stessa porta. Quando
     non c'e' (ogni altra partita del gioco, e ogni nastro scritto prima
     di oggi) si ricade sul nome, che e' esattamente cio' che si faceva
     prima: la cura e' additiva. */
  G.car = [CAR_NEUTRO, (opts.opp && opts.opp.car !== undefined && opts.opp.car !== null)
                       ? carPerIndice(opts.opp.car) : caratterePer(G.oppName)];`,
},

/* 3 — chi attacca lo calcola una volta sola */
{
  nome: '3/6 Sfida.gioca calcola l\'indice',
  cerca:
`    const mentMia = mentDaIndole(Rete.miaIndole());
    const mentSua = mentDaIndole(a.indole);`,
  metti:
`    const mentMia = mentDaIndole(Rete.miaIndole());
    const mentSua = mentDaIndole(a.indole);
    /* L'INDICE DI CARATTERE DELL'AVVERSARIO (voce #132, compito 2). Si
       calcola sulla STESSA stringa che finira' in G.oppName — nome
       tagliato a 18 — se no il nastro direbbe un carattere e il campo ne
       vedrebbe un altro. */
    const iCarSua = indiceCarattere(String(a.nome || 'AVVERSARIO').slice(0,18));`,
},

/* 4 — e lo scrive in coda alla riga di testa */
{
  nome: '4/6 il tipo 7 porta l\'indice in coda',
  cerca:
`    Reg.scrivi(7, [mentMia, mentSua].concat(impaccaRosa(SAVE.rosa), impaccaRosa(a.rosa)));`,
  metti:
`    /* IN CODA, DOPO LE DUE ROSE (voce #132, compito 2). In coda e non in
       testa perche' la lettura e' posizionale: chi rilegge sa gia' dove
       finiscono le rose (spaccaRosa torna «fine»), quindi trova l'indice
       se c'e' e non trova niente se il nastro e' di ieri. Spostarlo in
       testa avrebbe fatto slittare di uno tutti gli indici di un nastro
       vecchio. */
    Reg.scrivi(7, [mentMia, mentSua].concat(impaccaRosa(SAVE.rosa), impaccaRosa(a.rosa), [iCarSua]));`,
},

/* 5 — e lo passa alla partita che sta per giocare */
{
  nome: '5/6 Sfida.gioca passa l\'indice a startMatch',
  cerca:
`        pat: improntaTesto(a.nome) % 3,
        forza: forza,
        ment: mentSua,
        rosa: a.rosa,
      },`,
  metti:
`        pat: improntaTesto(a.nome) % 3,
        forza: forza,
        ment: mentSua,
        /* LO STESSO NUMERO CHE E' APPENA ANDATO NEL NASTRO. Non
           «caratterePer(a.nome)», che darebbe la stessa cosa oggi e
           potrebbe non darla domani: chi registra e chi rigioca devono
           passare dalla stessa porta. */
        car: iCarSua,
        rosa: a.rosa,
      },`,
},

/* 6 — e chi guarda lo rilegge dalla coda */
{
  nome: '6/6 Sfida.guarda rilegge l\'indice e lo passa',
  cerca:
`    let mentAtt, mentDif, rosaAtt, rosaDif;
    if(dati && dati.length > 6){
      mentAtt = mentValida(dati[3]); mentDif = mentValida(dati[4]);
      const p1 = spaccaRosa(dati, 5, att.rosa);
      const p2 = spaccaRosa(dati, p1.fine, nomiDif);
      rosaAtt = p1.rosa; rosaDif = p2.rosa;
    }`,
  metti:
`    let mentAtt, mentDif, rosaAtt, rosaDif, carDif;
    if(dati && dati.length > 6){
      mentAtt = mentValida(dati[3]); mentDif = mentValida(dati[4]);
      const p1 = spaccaRosa(dati, 5, att.rosa);
      const p2 = spaccaRosa(dati, p1.fine, nomiDif);
      rosaAtt = p1.rosa; rosaDif = p2.rosa;
      /* L'INDICE DI CARATTERE, SE IL NASTRO LO PORTA (voce #132,
         compito 2). Un nastro scritto prima di oggi finisce esattamente
         a p2.fine e qui resta undefined: startMatch ricade sul nome, che
         e' quello che ha sempre fatto. */
      if(dati.length > p2.fine) carDif = dati[p2.fine];
    }`,
},

/* 7 — e la squadra 1 del replay lo riceve */
{
  nome: '7/7 opp.car nel replay',
  cerca:
`      opp: { n:String((dif && dif.nome) || SAVE.teamName || 'LA TUA SQUADRA').slice(0,18),
             c1:colD.maglia, c2:colD.calzoncini, pat:improntaTesto(dif && dif.nome) % 3,
             ment:mentDif, rosa:rosaDif },`,
  metti:
`      /* IL CARATTERE VIENE DAL NASTRO, NON DAL NOME DI OGGI (voce #132,
         compito 2). E' la riga che rende innocuo il rinominarsi: il nome
         qui sopra serve solo a stampare qualcosa sulla maglia, e puo'
         perfino essere il ripiego SAVE.teamName senza che la partita se
         ne accorga. */
      opp: { n:String((dif && dif.nome) || SAVE.teamName || 'LA TUA SQUADRA').slice(0,18),
             c1:colD.maglia, c2:colD.calzoncini, pat:improntaTesto(dif && dif.nome) % 3,
             ment:mentDif, car:carDif, rosa:rosaDif },`,
},

];

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}
const attesi = [
  ['const CAR_NOMI = Object.keys(CARATTERE);', 1],
  ['function indiceCarattere(nome){ return CAR_NOMI.indexOf(String(nome||\'\')); }', 1],
  ['function carPerIndice(i){', 1],
  ['? carPerIndice(opts.opp.car) : caratterePer(G.oppName)];', 1],
  ['const iCarSua = indiceCarattere(String(a.nome || \'AVVERSARIO\').slice(0,18));', 1],
  ['impaccaRosa(a.rosa), [iCarSua]));', 1],
  ['car: iCarSua,', 1],
  ['if(dati.length > p2.fine) carDif = dati[p2.fine];', 1],
  ['ment:mentDif, car:carDif, rosa:rosaDif },', 1],
  /* la vecchia riga che leggeva solo il nome non deve restare */
  ['G.car = [CAR_NEUTRO, caratterePer(G.oppName)];', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
