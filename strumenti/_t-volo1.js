/* =====================================================================
   _t-volo1.js — LA PALLA NOSTRA IN VOLO RESTA NOSTRA (voce #88)

   LA DIAGNOSI: puoTirare(t) rispondeva vero solo col pallone al piede
   (entro KICK_R*1,4) o dentro la finestra della rovesciata. Durante il
   volo di un cross nostro, appena il pallone esce da quella frontiera,
   la domanda "e' mio?" tornava falsa per costruzione — il predicato non
   sapeva rispondere "si', e' nostro, e lo sto per raggiungere" — e il
   disco grande smetteva di offrire TIRA: misurato il 1 settembre 2026,
   sonda a 1/60, 5% (12/237) dei fotogrammi del volo (_q-volo.js, prova
   A; soglia 90%).

   LA CURA: si aggiunge una seconda via, dopo la rovesciata (che
   mantiene la precedenza), che risponde vero quando il pallone e'
   NOSTRO secondo squadraDelPallone() — funzione pura, gia' in casa
   dalla voce #82, gia' coperta dall'estrazione di _q-precedenza — E
   raggiungibile in poco piu' di un secondo alla velocita' massima di un
   uomo (P_SPEED*1,2) — E IN VOLO (b.z>0 o b.vz>0, lo stesso idioma
   della guardia dell'integrazione fisica alla riga 17704 e della
   finestra della rovesciata stessa). Nessuna previsione del punto di
   caduta: sarebbe un secondo modello della fisica dentro un predicato
   che deve restare puro.

   PERCHE' IL VOLO E' UNA GUARDIA, NON UN DETTAGLIO (rilievo della
   revisione, 2 settembre 2026): senza di lei la seconda via si apre
   anche a un pallone FERMO A TERRA — la spazzata difensiva di
   _q-l12.js prova F lo dimostra: comandato nel proprio terzo, pallone
   libero e GIA' NOSTRO per l'ultimo tocco (b.z=0, b.vz=0), a 45 unita'
   (oltre KICK_R*1,4 ma dentro P_SPEED*1,2). Senza la guardia il disco
   offriva TIRA al posto di CONTRASTA e le 30 scene della prova
   diventavano tutte nulle (30/30, banco rosso: misurato applicando
   solo le prime due condizioni). Il titolo del compito lo dice gia' —
   «la palla NOSTRA IN VOLO» — e la guardia lo rende vero anche nel
   codice: a terra il pallone si spazza, non si tira.

   LEGGE DEI SORTEGGI: squadraDelPallone non scrive un bit e non chiama
   dado(); il predicato resta puro, senza effetti collaterali. b.z e
   b.vz sono letture di campo, non chiamate: _q-precedenza non le vede
   ne' deve vederle (cattura solo i nomi seguiti da parentesi).

   uso:  node strumenti/_t-volo1.js --out fuori/volo1.html
         node strumenti/_t-volo1.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/volo1.html'));

const ANCORE = [

/* 1 — puoTirare risponde vero anche col pallone nostro in volo, se raggiungibile */
{
  nome: '1/1 puoTirare: la palla nostra in volo resta nostra',
  cerca:
`function puoTirare(t){
  const p=ctrlPlayer(t);
  if(!p || p.slide>=0 || p.recover>0 || p.rove>=0) return false;
  const pi=G.players.indexOf(p);
  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4)
    return finestraRovesciata(p);
  return true;
}`,
  metti:
`/* LA PORTATA DEL TIRO (voce #88, 1 settembre 2026): oltre il raggio di
   calcio il tiro resta offerto se il pallone e' NOSTRO, IN VOLO, e il
   comandato puo' raggiungerlo — un uomo copre P_SPEED*1,2 unita' in
   poco piu' di un secondo. Un numero solo, dichiarato: se il banco
   mostrasse che spegne troppo, sale a 1,5 e si rimisura. Nessuna
   previsione del punto di caduta: sarebbe un secondo modello della
   fisica dentro un predicato che deve restare puro. */
const TIRO_PORTATA = 1.2;
function puoTirare(t){
  const p=ctrlPlayer(t);
  if(!p || p.slide>=0 || p.recover>0 || p.rove>=0) return false;
  const pi=G.players.indexOf(p);
  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4){
    /* LA FACCIA SEGUE IL POSSESSO, NON LA GEOMETRIA (voce #88). Fino a
       oggi qui si rispondeva con la sola finestra della rovesciata, e
       il disco grande diventava CONTRASTA per il 91-97% del volo di un
       nostro cross (misurato il 1 settembre 2026, sonda a 1/60): il
       verbale delle capacita' lo prevedeva — «"nostra" e' una domanda
       che durante il volo di un passaggio non ha risposta» — e la
       risposta adesso c'e', ed e' squadraDelPallone: il padrone se c'e',
       altrimenti la squadra dell'ultimo tocco. La rovesciata mantiene la
       precedenza: si prova per prima.
       IN VOLO NON E' UN DETTAGLIO (rilievo della revisione, 2 settembre
       2026): senza questa terza guardia (b.z>0 o b.vz>0, lo stesso
       idioma della riga 17704 e della finestra della rovesciata) la via
       si apre anche a un pallone FERMO A TERRA — la spazzata difensiva
       di _q-l12 prova F ne era la prova: comandato nel proprio terzo,
       pallone libero e gia' nostro per l'ultimo tocco, a 45 unita' (oltre
       KICK_R*1,4 ma dentro P_SPEED*1,2), offriva TIRA al posto di
       CONTRASTA e le 30 scene diventavano tutte nulle. A terra il
       pallone si spazza, non si tira: il titolo del compito lo dice
       gia' — «la palla NOSTRA IN VOLO». */
    if(finestraRovesciata(p)) return true;
    return squadraDelPallone()===t &&
           len(G.ball.x-p.x,G.ball.y-p.y) <= P_SPEED*TIRO_PORTATA &&
           (G.ball.z>0 || G.ball.vz>0);
  }
  return true;
}`,
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
  ['const TIRO_PORTATA = 1.2;', 1],
  ['squadraDelPallone()===t &&', 1],
  ['(G.ball.z>0 || G.ball.vz>0)', 1],         // la guardia del volo: a terra si spazza, non si tira
  ['if(finestraRovesciata(p)) return true;', 1],
  ['    return finestraRovesciata(p);', 0],   // il vecchio ramo secco e' morto
  ['voce #88', 2],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
