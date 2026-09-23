/* =====================================================================
   _crit-glicko-ferma.js — LA CERTEZZA CHE NON DECADE (voce #140,
   compito 4).

   IL FALSO. `inattivo` c'e', e' chiamata nel posto giusto, prende i
   periodi e li conta — e restituisce l'incertezza di prima. Chi non
   gioca da tre anni resta certo come la sera in cui ha smesso.

   E' IL DIFETTO PIU' FACILE DA NON VEDERE, perche' non produce mai un
   numero assurdo: produce numeri PLAUSIBILI e vecchi. Un giocatore
   tornato dopo un anno viene abbinato come se il sistema sapesse ancora
   quanto vale — che e' esattamente la cosa che Glicko-2 esiste per non
   fare, e la sola ragione per cui il mandato lo chiede al posto
   dell'Elo.

   PASSA IL GRUPPO A: l'esempio lavorato di Glickman e' un periodo solo,
   senza giorni vuoti in mezzo, quindi `inattivo` non ci entra mai.
   Passa C, passa D (il codice c'e' tutto e lo schema e' identico) e
   passa quasi tutto E.

   uso:  node strumenti/_crit-glicko-ferma.js
   ===================================================================== */
require('./_crit-sospetto.js').falso({
  nome: 'crit-glicko-ferma',
  cancello: '_q-glicko.js',
  titolo: 'l\'incertezza non cresce mai per chi non gioca',
  morde: 'B3 e B4 (la certezza che decade) ed E1 (il giorno dopo)',
  file: 'lib/glicko.js',
  cerca: "export function inattivo(me, periodi) {\n" +
         "  const rd = incertezzaDi(me);\n" +
         "  const n = Math.floor(+periodi);\n" +
         "  if (!(n > 0)) return rd;\n" +
         "  const sigma = volatilitaDi(me);\n" +
         "  const phi = rd / SCALA_G;\n" +
         "  const cresciuta = SCALA_G * Math.sqrt(phi * phi + n * sigma * sigma);\n" +
         "  return Math.min(RD0, Math.max(RD_MIN, cresciuta));\n" +
         "}",
  metti: "export function inattivo(me, periodi) {\n" +
         "  const rd = incertezzaDi(me);\n" +
         "  const n = Math.floor(+periodi);\n" +
         "  if (!(n > 0)) return rd;\n" +
         "  const sigma = volatilitaDi(me);\n" +
         "  const phi = rd / SCALA_G;\n" +
         "  /* IL FALSO (_crit-glicko-ferma.js): il conto si fa tutto, e poi\n" +
         "     si butta. La funzione c'e', e' chiamata, conta i periodi e\n" +
         "     restituisce quel che aveva gia'. Nessun numero assurdo, mai:\n" +
         "     solo numeri vecchi. */\n" +
         "  const cresciuta = SCALA_G * Math.sqrt(phi * phi + n * sigma * sigma);\n" +
         "  return Math.min(RD0, Math.max(RD_MIN, rd));\n" +
         "}",
  attesi: [
    ["export function aggiorna(me, partite) {", 1],
    ["export const TAU = 0.5;", 1],
    ["export function dopoLaSfida(mio, suo, esito, data) {", 1],
  ],
});
