/* =====================================================================
   _crit-staffetta-cieca.js — LA STAFFETTA CHE APRE SEMPRE LA SUA
   FINESTRA (voce #138, compito 1).

   IL FALSO. Legge la misura dal nastro, la mette nel referto, la usa per
   raggruppare — e poi apre il browser della misura DI SERIE, sempre. E'
   la staffetta che qualcuno scriverebbe la prima volta, prima di sapere
   che i tocchi del nastro sono in coordinate di schermo: «tanto il
   browser e' headless, che differenza fa la finestra?».

   LA DIFFERENZA E' MISURATA, ed e' il perno di tutto il cantiere: lo
   stesso nastro registrato a 1024x460, rigiocato a 915x412, non e' la
   stessa partita. Il giudice della voce #133 questo lo sa e si RIFIUTA
   (INCOMPLETO/schermo-diverso, mai NON TORNA): quindi questo falso non
   accusa nessuno — fa una cosa piu' sottile e piu' insidiosa, perche'
   non si vede in nessun contatore di accuse. **Non verifica piu'
   niente** di quel che non e' stato registrato sulla sua stessa
   finestra, e la coda delle righe a `verificata = 0` cresce per sempre
   mentre il referto dice che e' tutto a posto.

   COSTRUITO NEL CASO PEGGIORE, e i due pezzi contano tutti e due:
     1. il raggruppamento resta quello giusto (A4 passa), e anche il
        conto dei contesti (C4 passa: tre gruppi, tre contesti);
     2. quattro righe su sei del giro completo sono registrate PROPRIO a
        915x412, quindi continuano a tornare. Un falso che sbagliasse
        anche quelle sarebbe goffo: questo sbaglia solo dove il banco
        deve avere una riga apposta.

   E' per questo che il banco gioca una sfida VERA a 1024x460 dentro la
   corsa invece di fidarsi della sola fixture congelata: senza quella
   riga, «apre la misura giusta» sarebbe un racconto e questo falso
   passerebbe tutto.

   uso:  node strumenti/_crit-staffetta-cieca.js
   ===================================================================== */
const B = require('./_crit-staffetta.js');

B.falso({
  nome: 'cieca',
  titolo: 'apre sempre la finestra di serie invece di quella dichiarata dal nastro',
  morde: 'MISURATO (sweep del 22 settembre 2026, banco a 42 controlli): B1 B2 C1 C2 C6b — 5 su 42 — la sfida a 1024x460 non torna piu, e le tre finestre aperte sono tutte 915x412',
  cambi: [
    { cerca: B.A_MISURA,
      metti: '    /* IL FALSO (_crit-staffetta-cieca.js): «tanto e\' headless, che\n' +
             '       differenza fa la finestra?». */\n' +
             '    const misura = MISURA_SERIE;' },
  ],
  attesi: [
    [B.A_PAROLA, 1],
    [B.A_RICORDA, 1],
    [B.A_FRENO, 1],
    /* il raggruppamento per misura resta intatto: il falso non e' pigro,
       e' cieco */
    ["const chiave = m ? (m[0] + 'x' + m[1]) : 'ignota';", 1],
  ],
});
