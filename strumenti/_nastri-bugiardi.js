/* =====================================================================
   _nastri-bugiardi.js — LA FAMIGLIA DEI NASTRI FALSI, IN COMUNE
   (voce #133). Non misura niente di suo: e' il bisturi che i banchi del
   giudice condividono.

   PERCHE' STA A PARTE. Il giudice ha cinque verdetti, e un banco che non
   li distingue fra loro attesta invece di misurare. Per distinguerli
   servono ingressi costruiti apposta, uno per verdetto — e devono
   nascere da un nastro VERO, registrato da una partita vera: un nastro
   scritto a mano proverebbe il banco, non il gioco.

   IL FORMATO, per chi legge (vedi Reg.serializza nel gioco):
     `1|<motoreV>|<tasti separati da virgola>|<pezzi separati da ;>`
   e ogni pezzo e' `dT,tipo,dMs[,argomenti]`. Tick e millisecondi sono
   DIFFERENZE dal pezzo precedente.

   DA QUI LA REGOLA DI QUESTO FILE: un pezzo non si TOGLIE mai, si
   TRASFORMA. Toglierlo sposterebbe il tick e il tempo di tutti i pezzi
   che seguono — e allora il nastro falso sarebbe falso per DUE ragioni,
   e il banco non saprebbe quale delle due ha morso. Si trasforma nel
   tipo 3 (Touch5.azzera) con lo stesso dT e lo stesso dMs: tre caratteri,
   la catena intatta, e in rilettura un azzeramento dei tocchi al posto
   di quel comando.

   IL NASTRO ARRIVA STRETTO dal server (deflate-raw + base64url: lo
   stringe chiudiSfida, e il server rifiuta per contratto qualunque cosa
   non sia base64url). Si allarga QUI, in Node, e non e' una
   scorciatoia: e' esattamente quello che fara' il verificatore differito
   quando vivra' sul server — pesca la riga, la allarga, e passa il testo
   crudo alla pagina. `deflate-raw` e' RFC 1951, non una regola del
   gioco: `zlib.inflateRawSync` e' `DecompressionStream('deflate-raw')`,
   non una seconda implementazione della stessa logica.
   ===================================================================== */
const zlib = require('zlib');

function allarga(stretto) {
  const t = String(stretto || '');
  if (!t) return '';
  if (t.indexOf('|') >= 0) return t;            /* gia' crudo */
  let s = t.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  try { return zlib.inflateRawSync(Buffer.from(s, 'base64')).toString('utf8'); }
  catch (e) { return ''; }
}

const spacca = n => { const p = String(n).split('|'); return { p, pezzi: (p[3] || '').split(';').filter(Boolean) }; };
const rifai = (p, pezzi) => p[0] + '|' + p[1] + '|' + p[2] + '|' + pezzi.join(';');

/* trasforma in tipo 3 ogni pezzo del tipo chiesto; torna null se non ce
   n'era nemmeno uno, cosi' chi chiama sa che la prova non si esercita */
function spegniTipo(nastro, tipo) {
  const { p, pezzi } = spacca(nastro);
  let n = 0;
  const fuori = pezzi.map(z => {
    const v = z.split(',');
    if (v[1] !== String(tipo)) return z;
    n++;
    return v[0] + ',3,' + v[2];
  });
  return n ? rifai(p, fuori) : null;
}

module.exports = {
  allarga,
  spacca, rifai,

  /* LE DUE ROSE VIA (tipo 7). Il giudice deve rifiutare: senza le rose
     dovrebbe ripiegare sul profilo vivo, cioe' giudicare un'altra
     partita. -> INCOMPLETO/rose-assenti */
  senzaRose: n => spegniTipo(n, 7),

  /* I COMANDI DEL DUELLO VIA (tipo 6, voce #131). La rigiocata arriva a
     un calcio piazzato di cui il nastro non ha piu' i comandi.
     -> INCOMPLETO/duello-senza-righe. Torna null se quella partita non
     e' passata da nessun duello: allora la prova non si esercita. */
  senzaDuelli: n => spegniTipo(n, 6),

  /* IL NASTRO TAGLIATO A META' E MARCHIATO (tipo 9, voce #132).
     -> INCOMPLETO/nastro-troncato */
  mozzato(n) {
    const { p, pezzi } = spacca(n);
    const meta = Math.max(1, Math.floor(pezzi.length / 2));
    return rifai(p, pezzi.slice(0, meta).concat(['0,9,0']));
  },

  /* IL MARCHIO DEL DUELLO SENZA COMANDI (tipo 5): e' il segno dei nastri
     scritti PRIMA della voce #131, quelli che il duello non ce l'hanno
     davvero. -> INCOMPLETO/duello-marchiato */
  marchiato(n) {
    const { p, pezzi } = spacca(n);
    return rifai(p, pezzi.concat(['0,5,0']));
  },

  /* UN ALTRO MOTORE in testa. -> ALTRO MOTORE */
  altroMotore(n, v) { const { p, pezzi } = spacca(n); p[1] = String(v === undefined ? 99 : v); return rifai(p, pezzi); },

  /* IL NASTRO VUOTO: forma perfetta, zero comandi, cinque caratteri.
     -> INCOMPLETO/nastro-vuoto */
  vuoto(n) { const { p } = spacca(n); return '1|' + p[1] + '||'; },

  /* IL NASTRO ILLEGGIBILE: il marcatore di formato non e' 1.
     -> INCOMPLETO/nastro-illeggibile */
  illeggibile(n) { const { p, pezzi } = spacca(n); p[0] = '7'; return rifai(p, pezzi); },
};
