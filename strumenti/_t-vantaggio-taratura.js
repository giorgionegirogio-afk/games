/* =====================================================================
   _t-vantaggio-taratura.js -- CORREZIONE DI REVISIONE, compito 3 (voce
   #107): la finestra parte quando il fallito si rialza, e la punizione
   resta sul punto.

   IL RILIEVO (misura indipendente del revisore, 150 partite, taglia 5).
   Contabilita' vera: 260 finestre -> sfumato 97,7%, silenzioso 1,9%,
   PIENO 0%. Il 93% degli sfumati muore al PRIMO controllo (t<0,6 s)
   perche' lo stordimento preesistente carrier.recover=0.35 s (scritto
   in checkSlideContact PRIMA di aprire G.vantaggio, invariato da questo
   compito) mangia la finestra di grazia VANT_VALUTA=0.5 s: G.vantaggio.t
   parte da 0 e accumula dt anche mentre il fallito e' ancora incollato a
   terra, quindi il primo controllo (a 0,5 s reali dal fallo) arriva dopo
   appena ~0,15 s di moto VERO. La regola misura lo stordimento, non
   l'azione. Un secondo rilievo, indipendente dal primo: nel ramo
   punizioneRapida dello sfumato la "punizione dal punto" regge un solo
   fotogramma -- il sostituto (il fallito scelto per battere) non e'
   co-locato sul punto salvato, e la molla del dribbling (updateBall,
   il bersaglio o.x+o.fx*avanti) trascina la palla verso di lui appena
   la fisica riparte (misurato: ~38 unita' in 0,33 s).

   LA CURA, IN DUE PARTI (mandato della correzione, 18 settembre 2026).

   F1 -- LA FINESTRA PARTE QUANDO IL FALLITO SI RIALZA. All'apertura di
   G.vantaggio (checkSlideContact, il ramo del fallo NUOVO, quello senza
   una finestra gia' pendente) t nasce a -(carrier.recover) invece che a
   0: l'accumulo esistente (G.vantaggio.t+=dt, dentro step()) e i due
   controlli (VANT_VALUTA/VANT_T) restano CARATTERE PER CARATTERE quelli
   di prima. Il numero negativo e' solo un differimento dell'orologio:
   finche' t<0 il fallito e' ancora a terra (carrier.recover>0 blocca il
   suo moto in updatePlayerFisica, riga "if(p.recover>0){...return;}",
   invariata) e la finestra non sta ancora misurando niente di lui. La
   grazia torna a misurare MOTO LIBERO, non stordimento -- esattamente il
   rilievo del revisore.

   F3 -- LA PUNIZIONE RESTA SUL PUNTO. Nel ramo punizioneRapida dello
   sfumato (fuori da area/cumulo), il "fallito" sostituto viene
   CO-LOCATO sul punto salvato PRIMA della battuta -- lo stesso pattern
   di posaBattuta col suo battitore (bt.x=clamp(...), bt.y=clamp(...)):
   qui il pallone non ha un offset (punizioneRapida non sposta b.x/b.y,
   a differenza di posaBattuta che mette la palla a CARRY_DIST dal
   battitore), quindi il fallito va clampato ESATTAMENTE sul punto, non
   a una distanza. clampPlayer(p) esiste gia' in questo file
   (p.x=clamp(p.x,P_R,FW-P_R); p.y=clamp(...)) ed e' la stessa funzione
   che il moto normale usa per restare in campo: riusarla qui invece di
   scrivere un clamp a mano tiene un'unica fonte di verita' per il
   confine del campo.

   uso:  node strumenti/_t-vantaggio-taratura.js --out fuori/vantaggio-taratura.html
         node strumenti/_t-vantaggio-taratura.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/vantaggio-taratura.html'));

const ANCORE = [

/* 1/2 -- checkSlideContact: l'apertura della finestra nasce da -recover,
   non da zero. Ancora sull'assegnazione vera, l'unico punto del file
   dove una finestra NUOVA si apre (il ramo "vantaggio gia' pendente"
   qui sopra fischia subito e non apre mai una seconda finestra: non lo
   tocca questo attrezzo). */
{
  nome: '1/2 checkSlideContact: G.vantaggio nasce a t=-recover, non a t=0',
  cerca:
`        G.vantaggio = { team:carrier.team, x:p.x, y:p.y, t:0, card: cattivo?G.players.indexOf(p):null };
        return;`,
  metti:
`        /* F1 (correzione di revisione, voce #107 compito 3, 18 settembre
           2026): la finestra parte quando il fallito SI RIALZA, non dal
           fischio del fallo. carrier.recover e' appena stato scritto
           (Math.max(carrier.recover,0.35) qui sopra, invariato) -- finche'
           e' positivo il fallito e' incollato a terra (updatePlayerFisica,
           "if(p.recover>0){...return;}"), e un t che partisse da zero
           misurerebbe quello stordimento, non l'azione. Misura del
           revisore (150 partite, taglia 5): con t da zero il 93% dei
           vantaggi SFUMATI moriva al PRIMO controllo (t<0,6 s), pieno mai
           una volta su 260 finestre. t negativo e' solo un differimento
           dell'orologio: l'accumulo (t+=dt, sotto in step()) e i due
           controlli (VANT_VALUTA/VANT_T) restano invariati carattere per
           carattere -- la finestra adesso misura MOTO LIBERO dal momento
           in cui il fallito torna in piedi, non dal momento del fallo. */
        G.vantaggio = { team:carrier.team, x:p.x, y:p.y, t:-(carrier.recover>0?carrier.recover:0), card: cattivo?G.players.indexOf(p):null };
        return;`,
},

/* 2/2 -- step(), il ramo SFUMATO senza duello: il sostituto si co-loca
   sul punto salvato PRIMA di punizioneRapida, cosi' la molla del
   dribbling (updateBall) non lo trascina via nel fotogramma dopo. */
{
  nome: '2/2 step(): il fallito si co-loca sul punto salvato prima di punizioneRapida',
  cerca:
`          let fallito=null, fd=1e9;
          for(const q of diMovimentoInCampo(vTeam)){
            const d=len(q.x-vx,q.y-vy);
            if(d<fd){ fd=d; fallito=q; }
          }
          if(fallito) punizioneRapida(fallito, null);`,
  metti:
`          let fallito=null, fd=1e9;
          for(const q of diMovimentoInCampo(vTeam)){
            const d=len(q.x-vx,q.y-vy);
            if(d<fd){ fd=d; fallito=q; }
          }
          if(fallito){
            /* F3 (correzione di revisione, voce #107 compito 3): la
               "punizione dal punto" reggeva un solo fotogramma -- il
               sostituto restava dov'era (fd unita' dal punto salvato,
               non zero: la partita e' andata avanti durante la finestra)
               e punizioneRapida non sposta mai b.x/b.y, quindi la palla
               restava al punto salvato per UN fotogramma, poi la molla
               del dribbling di updateBall (bersaglio o.x+o.fx*avanti) la
               trascinava verso il sostituto vero (misurato: ~38 unita' in
               0,33 s). Il sostituto va CO-LOCATO sul punto PRIMA della
               battuta -- lo stesso pattern di posaBattuta col suo
               battitore, ma senza l'offset di CARRY_DIST: qui la palla
               non si sposta rispetto al giocatore, quindi il giocatore
               deve arrivare esattamente dove sta gia' la palla.
               clampPlayer riusa il confine di campo che il moto normale
               gia' rispetta -- nessun secondo clamp scritto a mano. */
            fallito.x=vx; fallito.y=vy; fallito.vx=0; fallito.vy=0;
            clampPlayer(fallito);
            punizioneRapida(fallito, null);
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

/* CONTEGGI A DELTA. */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
const attesiEsatti = [
  ['t:-(carrier.recover>0?carrier.recover:0)', 1],
  ['fallito.x=vx; fallito.y=vy; fallito.vx=0; fallito.vy=0;', 1],
  ['clampPlayer(fallito);', 1],
];
for (const [s, atteso] of attesiEsatti) {
  const n = conta(out, s);
  if (n !== atteso) rotti.push(s + ': atteso ' + atteso + ', trovato ' + n);
}
if (conta(out, 't:0, card: cattivo?G.players.indexOf(p):null') !== 0) {
  rotti.push('il vecchio "t:0" all\'apertura del vantaggio e\' ancora presente: la sostituzione non e\' andata a segno');
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
