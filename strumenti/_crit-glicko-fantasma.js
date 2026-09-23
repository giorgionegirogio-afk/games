/* =====================================================================
   _crit-glicko-fantasma.js — IL RATING CHE IMPARA DAI FANTASMI (voce
   #140, compito 4).

   IL FALSO. Contro un avversario costruito dal server, il rating
   nascosto si muove: il fantasma vale «un giocatore medio», cioe' 1500
   con incertezza 350.

   ED E' LA COSA PIU' RAGIONEVOLE DEL MONDO, a leggerla. I punti
   visibili si muovono gia' (a meta'), perche' «una classifica che non
   si muove e' una classifica morta»; un lettore che arriva qui dopo
   quella riga pensa di star togliendo un'incoerenza. Non nomina nessun
   numero inventato, non forza niente, usa i valori di partenza del
   sistema.

   E FA ESATTAMENTE IL DANNO CHE IL CANTIERE ESISTE PER EVITARE. Nessuno
   ha mai stabilito che una squadra costruita da un seme valga 1500:
   `forza_avv * 20` e' una convenzione per i punti, non una misura. Chi
   gioca solo allenamenti si ritroverebbe un rating «certo» costruito su
   partite contro nessuno, e l'abbinamento gli manderebbe contro persone
   vere scelte su quella certezza finta. Il giocatore che si allena per
   una settimana verrebbe abbinato peggio di quello che non ha mai
   giocato.

   PASSA A (l'esempio del paper non ha fantasmi), passa B, passa C e
   passa D. Morde la riga che dice la cosa, e nient'altro.

   uso:  node strumenti/_crit-glicko-fantasma.js
   ===================================================================== */
require('./_crit-sospetto.js').falso({
  nome: 'crit-glicko-fantasma',
  cancello: '_q-glicko.js',
  titolo: 'il rating nascosto impara anche dalle partite contro gli avversari costruiti',
  morde: 'E4 (il fantasma non muove il rating). PASSA A, B, C e D',
  file: 'lib/glicko.js',
  cerca: "export function dopoLaSfida(mio, suo, esito, data) {\n" +
         "  if (!suo) return null;",
  metti: "export function dopoLaSfida(mio, suo, esito, data) {\n" +
         "  /* IL FALSO (_crit-glicko-fantasma.js): un avversario costruito\n" +
         "     vale un giocatore medio. Sembra il contrario di un'incoerenza\n" +
         "     — i punti visibili si muovono gia' — ed e' un rating «certo»\n" +
         "     costruito su partite contro nessuno. */\n" +
         "  if (!suo) suo = { nascosto: R0, incertezza: RD0 };",
  attesi: [
    ["export function inattivo(me, periodi) {", 1],
    ["export function aggiorna(me, partite) {", 1],
    ["export const TAU = 0.5;", 1],
  ],
});
