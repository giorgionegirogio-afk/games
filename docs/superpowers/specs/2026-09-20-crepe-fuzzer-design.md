# Le due crepe del fuzzer + il residuo (voce #128, dentro l'onda C)

20 settembre 2026. Il fuzzer (voce #126, onda C-2) al primo giro ha trovato DUE
violazioni VERE del motore (P0 secondo il mandato §13.3). Il committente ha scelto:
curarle entrambe E indagare il residuo di determinismo cross-partita emerso durante
la diagnosi. Questo cantiere fa quello, poi il fuzzer (#126) si riprende col gioco
sano. E' il primo cantiere di questa sessione che tocca il MOTORE (non solo i banchi):
massima attenzione al determinismo.

## Il metodo (mandato §13.3: "ogni bug ha prima un test fallito")
Ogni P0 ha gia' il suo test che oggi FALLISCE (le prove di `_q-invarianti.js` che il
fuzzer ha reso rosse con input umano, + gli scenari diretti riprodotti dalla
diagnosi). Curare = rendere quei test VERDI. Il test deve nascere/restare ROSSO sul
gioco di oggi e diventare verde dopo la cura — non un test scritto per passare.

## P0-1 — il cross-proiettile (doCross)
`CALCETTO-il-gioco.html:15888-15914`: `doCross` calcola `speed = dist/T` con `T`
bloccato in [0.66, 0.75] ma `dist` NON limitato — l'UNICO tiro del gioco che non
passa da `tiroVelocita()`/`Math.min(TIRO_TETTO, ...)`. Un cross lungo diventa un
proiettile: misurato fino a 1446,9 u/s contro il tetto ~902 (la prova 9 di
`_q-invarianti`, `TETTO_VEL_PALLA`). Riprodotto bit-per-bit (fuori/, seme 20260920,
frame 856).
**Cura.** Clampare la velocita' del cross al tetto coerente col resto (il cross
lungo ricade prima invece di volare come proiettile — comportamento piu' corretto e
coerente con `TIRO_TETTO` gli altri tiri). L'implementatore verifica il design
esatto (clampare `speed` o `dist`; il cross NORMALE deve restare invariato — solo i
cross oltre il tetto cambiano). **Scelta di design dichiarata**: un cross molto lungo
ora e' piu' lento (fisica realistica), non un razzo. Il test: la prova 9 con un cross
lungo (fixture/scenario) ROSSA -> VERDE.

## P0-2 — il battitore espulso (resetKickoff)
`CALCETTO-il-gioco.html:10904-10964`: `resetKickoff` scarica prima il cartellino
differito (`scaricaCardVantaggio` :10922 -> `infliggiCartellino`, che rilascia la
palla correttamente), MA poi sceglie il battitore del calcio d'inizio per team+idx
FISSO (`p.team===kt && p.idx===1`, :10955) SENZA controllo `out<=0`: se il giocatore
appena espulso e' idx1 della squadra che batte, viene rimesso in campo, gli si da'
`owner` (:10958) e il controllo se umano. La palla finisce a un espulso (prova 2 di
`_q-invarianti`, owner-valido). Scenario diretto riprodotto (fuori/, stagiona
`G.vantaggio.card` su team0/idx1 + `G.stats.gialli[0]=1` + `G.kickTeam=false`, chiama
`resetKickoff()` -> owner:1, out:12).
**Cura.** Aggiungere `&& p.out<=0` alla condizione :10955, con fallback a un compagno
eleggibile (`diMovimentoInCampo(p.team)[0]`, il pattern gia' in `infliggiCartellino`
:18529) se idx1 non e' disponibile. Il test: lo scenario diretto ROSSO -> VERDE.

## Il residuo — determinismo cross-partita (INDAGINE, poi cura o dichiarazione)
Durante la diagnosi della P0-2 e' emerso un DUBBIO NON ISOLATO: la stessa coppia di
semi (semeGioco, semeComandi) da' partite DIVERSE a seconda di QUANTE partite la
precedono sulla stessa pagina (il seme isolato finisce a 6559 senza anomalia; la
sequenza dei 18 semi precedenti + questo la riproduce a 8039). Escluso `G.stats`/
`G.players` (azzerati in `startMatch`). NON isolato. Possibile problema di
determinismo cross-partita: qualcosa sopravvive tra partite sulla stessa pagina che
`startMatch` non azzera. RILEVANTE per soak/fuzzer (giocano molte partite in fila).
`_q-determinismo` (13/13) NON lo coglie: verifica due corse con lo STESSO seme, non
partita-dopo-N-partite vs partita-fresca. **Indagine**: isolare cosa sopravvive
(un altro stato globale non azzerato? un cronometro non nella lista dei fratelli? il
PRNG SEME che non si re-semina identico? un accumulo in un buffer?). Poi: se e' un
bug (stato che dovrebbe azzerarsi), curarlo (azzerare in `startMatch`); se e' atteso
(es. una cache legittima che non tocca la simulazione), dichiararlo e spiegare perche'
non intacca il determinismo delle sfide (il nastro + seme, che e' cio' che conta).

## I vincoli (cantiere di MOTORE)
- Ogni tocco al gioco via ATTREZZO a ancore (`--out` poi `--dentro`).
- **Il due-versioni DIVERGE per costruzione** (doCross cambia la velocita' di alcuni
  cross; resetKickoff cambia chi batte in casi con espulsione): si dichiara per
  taglia. `_q-determinismo` DEVE restare verde (stessa versione, stesso seme).
- **MOTORE_V**: entrambe le cure cambiano l'esito di una stessa sequenza di comandi
  (un cross lungo, un kickoff dopo espulsione) -> un nastro di sfida vecchio
  rigiocato sul gioco curato potrebbe divergere. VALUTARE a banco (`_q-replay`): se
  un nastro vecchio diverge, MOTORE_V va incrementato (da 1 a 2), e Sfida.guarda
  gestisce la versione (gia' fa il confronto MOTORE_V). Decidere coi numeri, non a
  priori.
- Ogni P0 ha il suo test rosso->verde (il mandato). Batteria intera a fine cantiere
  (le cure toccano la simulazione: rilanciare tutto). `_q-invarianti` e `_q-fuzzer`
  (dal ramo #126, se serve) devono tornare verdi sul gioco curato.

## Le cure, in tre (o quattro) compiti
1. **P0-1 doCross**: attrezzo, clamp della velocita' del cross; il test (prova 9 con
   cross lungo) rosso->verde; MOTORE_V valutato; il cross normale invariato.
2. **P0-2 resetKickoff**: attrezzo, `&& p.out<=0` + fallback; lo scenario diretto
   rosso->verde; MOTORE_V valutato.
3. **Il residuo**: indagine (isolare la causa cross-partita), poi cura o
   dichiarazione. + batteria intera + verbale (voce #128): le 2 P0 curate coi test,
   l'esito MOTORE_V, l'esito del residuo, il due-versioni dichiarato. PUNTO
   aggiornato. (Se il residuo si rivela grande, diventa un compito 3 + un compito 4
   batteria/verbale, o un seguito dichiarato.)

## Fuori perimetro
Il fuzzer (#126, si riprende dopo, coi compiti 2-3: duello, INV-04, batteria). Il
soak (onda C-3). Modifiche a doCross oltre il clamp (il design del cross resta
quello, solo la velocita' fuori tetto e' corretta). Se il residuo si rivela un
cantiere grande a se', si dichiara e si rimanda (non si forza dentro qui).
