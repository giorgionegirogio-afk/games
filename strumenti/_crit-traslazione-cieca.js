/* =====================================================================
   _crit-traslazione-cieca.js — IL RITARDO CHE RISPARMIA I VERBI.

   Un falso per `strumenti/_q-ritardo.js`, ed e' il PIU' GENTILE dei tre:
   quello che mostra danno, tanto da sembrare un banco che funziona.

   COSTRUITO NEL CASO PEGGIORE. Trasla i `touchmove` (tipo 1) — che sono
   il novantacinque per cento delle righe di un nastro, perche' un dito
   che gira sulla levetta ne produce uno per fotogramma — e NON trasla i
   `touchstart` (tipo 0) ne' i `chiudi` (tipo 2). Il risultato:

     · la levetta e' in ritardo, quindi la corsa sbanda, la fedelta' cala
       e l'impronta si stacca presto: la prova 5 di `_q-ritardo.js` passa
       tranquillamente, e la curva del danno ha una forma plausibile;
     · ma i VERBI — tiro, passaggio, filtrante, cambio, scivolata —
       partono ESATTAMENTE IN ORARIO, perche' l'atto si risolve al
       touchstart (`Touch5.start`, dove `touchBtnLayout` decide che cosa
       fa quel disco) e il touchstart non e' stato toccato.

   E' il falso che conta di piu', perche' il verbo in orario e' proprio
   cio' che un ritardo d'ingresso NON risparmia: chi tira a 300 ms tira
   tardi, e se il banco non lo vede misura solo la levetta e chiama
   «ritardo d'ingresso» qualcosa che ne e' un terzo.

   CHE COSA DEVE MORDERE: la prova 0a di `_q-ritardo.js`, che chiede a
   OGNI riga di comando — tipo per tipo — di essersi mossa di esattamente
   K. Nessuna prova sui numeri del gioco lo prenderebbe, e questa e'
   esattamente la ragione per cui la 0a esiste.

   uso: node strumenti/_q-ritardo.js --bugia strumenti/_crit-traslazione-cieca.js
   ===================================================================== */
module.exports = {
  nome: 'traslazione-cieca',
  descrizione: 'ritarda solo i touchmove: la levetta sbanda ma i verbi partono in orario',
  morde: ['0a'],
  traslazione: `function(righe, K){
    if(K <= 0) return;
    for(const r of righe){
      /* solo il trascinamento del dito. L'appoggio e il rilascio — cioe'
         l'atto — restano dove sono. */
      if(r[1] === 1) r[0] += K;
      else if(r[1] === 6) r[4] += K;
    }
  }`,
};
