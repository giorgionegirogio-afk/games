/* =====================================================================
   _crit-ritardo-attestatore.js — IL METRO CHE GUARDA DALLA PARTE
   SBAGLIATA.

   Un falso per `strumenti/_q-ritardo.js`. Qui la traslazione e' ONESTA —
   il ritardo c'e' davvero, tutto — e a mentire e' la MISURA.

   COSTRUITO NEL CASO PEGGIORE, e i due modi ingenui sono stati scartati:

     · «restituisci sempre zero» morirebbe subito contro il cancello
       della prova nulla (servono >= 20 tiri nello specchio a K=0);
     · «restituisci sempre gli stessi numeri» morirebbe contro la prova
       0b (il metro deve variare fra venti partite diverse).

   Questo fa una cosa piu' cattiva e molto piu' facile da scrivere per
   sbaglio: SCAMBIA LE SQUADRE. Riporta i numeri della squadra 1 — la
   CPU — come se fossero quelli della squadra comandata. Sono numeri
   veri, misurati sulla partita giusta, che variano da un nastro
   all'altro e che riempiono le soglie di eventi: passano il cancello
   della prova nulla, passano la 0b, passano il confronto a K=0 (perche'
   registrazione e rigiocata usano lo stesso metro storto).

   E non mostrano danno, perche' la CPU non e' ritardata. Anzi: quando la
   squadra comandata peggiora, la CPU MIGLIORA — quindi il banco
   stamperebbe un peggioramento NEGATIVO, cioe' «col ritardo si gioca
   meglio», e direbbe SOGLIA TENUTA con una faccia serissima.

   E' l'errore di lettura piu' comune che esista in questa casa:
   `G.stats.tiri` e' un array di due, e scriverne l'indice sbagliato non
   fa saltare niente. Sei mesi di numeri verdi e nessuno se ne accorge.

   CHE COSA DEVE MORDERE: la prova 0c di `_q-ritardo.js`, IL CONTROLLO
   NEGATIVO. Si rigioca lo stesso nastro con OGNI comando tolto: la
   squadra comandata, senza un dito in novanta secondi, deve andare
   molto peggio. La squadra 1 in quelle condizioni va MEGLIO. Un metro
   che non distingue «con le dita» da «senza dita» non sta guardando chi
   dice di guardare, e un ritardo — che e' un danno molto piu' piccolo —
   non lo vedrebbe mai.

   uso: node strumenti/_q-ritardo.js --bugia strumenti/_crit-ritardo-attestatore.js
   ===================================================================== */
module.exports = {
  nome: 'ritardo-attestatore',
  descrizione: 'traslazione onesta, ma legge i numeri della CPU come se fossero della squadra comandata',
  morde: ['0c'],
  misura: `function(){
    const s = G.stats, c = G.ctrl ? G.ctrl[0] : -1;
    const p = (c >= 0 && G.players[c]) ? G.players[c] : null;
    /* l'indice sbagliato, e non salta niente */
    return { gol:[G.score[1]|0, G.score[0]|0],
             tiri:[s.tiri[1]|0, s.tiri[0]|0],
             specchio:[(s.inPorta[1]||0)|0, (s.inPorta[0]||0)|0],
             possesso:[Math.round(s.possesso[1]||0), Math.round(s.possesso[0]||0)],
             rubate:[s.rubate[1]|0, s.rubate[0]|0],
             falli:[s.falli[1]|0, s.falli[0]|0],
             parate:[s.parate[1]|0, s.parate[0]|0],
             ctrl:c, px: p?p.x:0, py: p?p.y:0 };
  }`,
};
