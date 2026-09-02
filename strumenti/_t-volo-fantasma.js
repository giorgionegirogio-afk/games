/* =====================================================================
   _t-volo-fantasma.js — IL TIRO FANTASMA DEL VOLO (voce #88, correzione
   della revisione del compito 9, rilievo ALTO, 2 settembre 2026)

   LA DIAGNOSI. Il ramo «TIRO AL VOLO» di updateBall (~17994-18035) ammette
   fino a KICK_R*1,15 (29,9 unita', riga ~18001) come guardia d'ingresso,
   ma kickBall applica la propria soglia, piu' stretta: KICK_R (26). Nella
   fascia 26-29,9 kickBall rifiuta il calcio (return false) e il suo esito
   non veniva MAI letto: G.stats.volee[t], G.stats.tiri[t] e b.tiroT si
   scrivevano comunque, un tiro/volee contato nel tabellino che il pallone
   non ha mai sentito.

   PERCHE' E' UN RILIEVO DI QUESTO COMPITO, e non solo un difetto
   preesistente segnalato a parte: la cura del compito 9 (puoTirare, il
   ramo "atteso") rende questa fascia PIU' probabile. Prima della cura la
   carica del tiro si poteva aprire solo entro P_SPEED*TIRO_PORTATA (201,6
   unita'); il destinatario dichiarato adesso la apre da oltre 300 unita'
   e la tiene armata molto piu' a lungo mentre il pallone si avvicina —
   piu' fotogrammi di carica aperta vuol dire piu' esposizione alla fascia
   stretta 26-29,9 quando il pallone infine arriva a tiro.

   LA CURA: stesso schema di fireShotMirato (~15773), che gia' fa
   `if(!kickBall(...)) return;` PRIMA di scrivere G.stats.tiri[t]++. Qui il
   guardiano diventa `if(!kickBall(...)) continue;` (siamo dentro un
   for(const p of G.players), non in una funzione a se'): se il calcio non
   e' avvenuto, NESSUNA statistica sale e b.tiroT non si scrive — si
   prosegue a controllare eventuali altri candidati invece di interrompere
   il ciclo su un tentativo fallito.

   LEGGE DEI SORTEGGI: kickBall non chiama dado(); l'unica differenza e'
   il momento in cui l'esito gia' esistente viene letto. Zero sorteggi
   nuovi.

   uso:  node strumenti/_t-volo-fantasma.js --out fuori/volo-fantasma.html
         node strumenti/_t-volo-fantasma.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/volo-fantasma.html'));

const ANCORE = [

/* 1 — il ramo TIRO AL VOLO di updateBall: si legge l'esito di kickBall
   prima di scrivere qualunque statistica */
{
  nome: '1/1 updateBall (TIRO AL VOLO): l\'esito di kickBall si legge prima delle statistiche',
  cerca:
`      chiudiAnticipo(p);
      G.stats.volee[t]=(G.stats.volee[t]||0)+1;
      G.stats.tiri[t]++;
      /* il volo aveva lo stesso difetto del tiro fermo: la potenza non
         sapeva la distanza. Qui il pavimento e' lo stesso, e il bonus
         della palla in arrivo resta tutto. */
      const vel=Math.max((q===1?620:q===0?380:430)+bonus, tiroVelocita(q, 0, l));
      kickBall(p, dx/l, dy/l, vel, 0);
      b.tiroT=t;`,
  metti:
`      /* il volo aveva lo stesso difetto del tiro fermo: la potenza non
         sapeva la distanza. Qui il pavimento e' lo stesso, e il bonus
         della palla in arrivo resta tutto. */
      const vel=Math.max((q===1?620:q===0?380:430)+bonus, tiroVelocita(q, 0, l));
      /* IL TIRO FANTASMA (rilievo ALTO della revisione del compito 9, 2
         settembre 2026). Questa guardia d'ingresso ammette fino a
         KICK_R*1,15 (29,9 unita', qualche riga sopra), ma kickBall
         rifiuta sopra KICK_R (26): nella fascia 26-29,9 il tabellino
         segnava un tiro che il pallone non aveva mai sentito, perche'
         l'esito di kickBall non veniva mai letto. La cura del compito 9
         rende questa fascia PIU' probabile (il destinatario arma la
         carica da oltre 300 unita' invece che da 201,6, e la tiene
         aperta piu' a lungo), quindi e' un rilievo di questo compito.
         Stesso schema di fireShotMirato (~15773): si legge l'esito
         PRIMA di scrivere qualunque statistica. Misurato con la scena
         della prova D di _q-volo.js sul file non curato (seme 88001):
         il tentativo cadeva proprio nella fascia morta (33,9 unita' un
         fotogramma prima, dentro 26-29,9 al momento del controllo),
         G.stats.volee saliva, e b.vx/b.vy restavano bit-per-bit identici
         — un fantasma vero, non un caso di laboratorio. */
      if(!kickBall(p, dx/l, dy/l, vel, 0)) continue;
      /* chiudiAnticipo si sposta QUI, dopo il calcio riuscito — non piu'
         incondizionato prima del tentativo. Due ragioni, non una sola:
         (1) se il pallone e' ancora nella fascia morta, la carica RESTA
         aperta e il giocatore ritenta al fotogramma successivo invece di
         perdere il gesto su un tentativo che kickBall ha rifiutato — e
         un fotogramma dopo, nella stessa scena misurata sopra, il
         pallone e' gia' a 19,9 unita', dentro KICK_R per davvero: la
         prova D adesso esce con una volee' VERA, non con un contatore
         alzato a vuoto; (2) e' anche l'ordine giusto per il disegno:
         kickBall legge p.chargeClip per scegliere la clip del calcio
         ('tiro'), e chiudiAnticipo lo azzera — chiamarlo prima privava
         il calcio riuscito della sua clip. */
      chiudiAnticipo(p);
      G.stats.volee[t]=(G.stats.volee[t]||0)+1;
      G.stats.tiri[t]++;
      b.tiroT=t;`,
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
const contaSub = (s, sub) => s.split(sub).length - 1;
const attesi = [
  ['if(!kickBall(p, dx/l, dy/l, vel, 0)) continue;', 1],
  ['kickBall(p, dx/l, dy/l, vel, 0);\n      b.tiroT=t;', 0],
];
const rotti = attesi.filter(([s, n]) => contaSub(out, s) !== n)
  .map(([s, n]) => s + '  atteso ' + n + ', trovato ' + contaSub(out, s));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
