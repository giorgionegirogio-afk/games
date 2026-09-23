/* =====================================================================
   _crit-schermi-grana.js — IL VETTORE QUANTIZZATO GROSSO
   (voce #144, compito 1).

   IL FALSO. Lo scostamento del trascinamento si scrive a passi di
   sedici pixel invece che di uno. E' la «compressione» che qualcuno
   proporra' il giorno in cui il nastro sembrera' pesante, e cambia il
   gioco: la dead-zone della levetta vale dodici pixel (`STICK_DEAD`) e
   la corsa piena quarantasei (`STICK_FULL`), quindi sedici pixel di
   grana sono un terzo abbondante della corsa — la levetta salta da
   ferma a mezza spinta senza passare per il mezzo.

   NON E' UN FALSO DI SCHERMO, ed e' dichiarato invece che nascosto: un
   vettore corrotto e' corrotto su qualunque geometria, quindi morde
   anche il braccio di CONTROLLO. Sta qui lo stesso per due ragioni: la
   quarta bugia che il mandato di questo cantiere chiedeva era proprio
   «quantizzare il vettore cosi' grossolanamente da cambiare il gioco», e
   perche' dice una cosa che gli altri quattro non dicono — il banco vede
   anche un comando CORROTTO, non solo un comando SPOSTATO.

   MISURATO: morde **A2**, e solo A2 — il controllo di esercizio, cioe'
   la prova che dice «il braccio di registrazione rigioca la sua
   partita». Con sedici pixel di grana quel braccio smette di dire
   TORNA (dice INCOMPLETO/duello-senza-righe: la rigiocata prende una
   strada che il nastro non ha) e da li' in poi tutto il resto del banco
   confronta i bracci con un controllo gia' sbagliato. E' esattamente il
   servizio che A2 deve rendere, ed e' la ragione per cui il gruppo A
   esiste prima di tutti gli altri.

   uso:  node strumenti/_crit-schermi-grana.js
   ===================================================================== */
const C = require('./_crit-schermi.js');
C.falso({
  nome: 'crit-schermi-grana',
  titolo: 'lo scostamento del trascinamento si quantizza a sedici pixel',
  morde: 'A2, il controllo di esercizio — UNA prova su trenta, e lo dichiara in testa (MISURATO)',
  cambi: [
    { nome: 'la porta quantizza lo scostamento', cerca:
`          if(o) Reg.scrivi(13, [idM, b - o[0], c - o[1]]);`,
      metti:
`          /* IL FALSO (_crit-schermi-grana.js): sedici pixel di grana. */
          if(o) Reg.scrivi(13, [idM, Math.round((b - o[0]) / 16) * 16,
                                     Math.round((c - o[1]) / 16) * 16]);` },
  ],
});
