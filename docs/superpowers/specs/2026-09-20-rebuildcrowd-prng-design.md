# La folla fuori dal PRNG di gioco (voce #129, cura della #98)

20 settembre 2026. Seguito tecnico dell'onda C. La voce #98 (determinismo
instabile a taglia 7/11) ha avuto la sua causa ISOLATA durante il #128
(revisione finale, lente 3): `rebuildCrowd` consuma `dado()` (il PRNG di
gioco) in numero PROPORZIONALE al perimetro del campo. Questo cantiere la
cura.

## RETTIFICA A EDIZIONI (20 settembre 2026, misure del compito 1)
Il compito 1 ha MISURATO che la diagnosi qui sotto e' imprecisa su due punti
(il testo originale resta sotto, non cancellato):
1. **La funzione isolata era MINORITARIA.** Misurato `SEME.n` a taglia 11,
   stessa pagina, 2 partite: 1a (taglia cambia) 114093 sorteggi, 2a (guardia
   `setTaglia`) 67. `rebuildCrowd` DA SOLO = ~8920 (8%). Il consumatore
   DOMINANTE (~92%) e' `resize()`->`buildFieldTex()`->`paintField(vivo=true)`
   (:27502, loop grana piazzale :27523 ~3 `dado()`/iter x 1500*q, + gradinate/
   erba), chiamato da `setTaglia` :29997 PRIMA di `rebuildCrowd` :29998.
2. **DUE canali di casualita', cure diverse.** `_q-determinismo` prove A/B/C
   seminano `Math.random` GLOBALE (`window.__caso` via addInitScript :99-108),
   NON `SEME` -> insensibili a qualsiasi salva/ripristina di `SEME` (`dado()`
   a `SEME.on=false` fa `return Math.random()`). Solo la prova D usa
   `t.semina`->`SEME` (canale di PRODUZIONE, "due telefoni veri") e passa gia'.

**DECISIONE DEL COMMITTENTE: opzione 2 (PRNG DEDICATO per la cosmetica).**
La folla (`rebuildCrowd`) e la texture del campo (`paintField`/`buildFieldTex`,
piu' ogni altra `dado()` cosmetica raggiungibile da `setTaglia`/`resize`/boot)
usano un generatore DEDICATO (`dadoDeco`, stato proprio) con RESEED fisso
all'ingresso di ogni funzione cosmetica -> non consumano MAI il PRNG di gioco,
ne' `SEME` ne' `Math.random`. Cura ENTRAMBI i canali: `_q-determinismo` A/B/C
diventano 10/10 a 7/11 E i banchi a `SEME` (soak/fuzzer) diventano bit-
ripetibili a taglia piena. COSTO ACCETTATO: la texture e il layout della folla
CAMBIANO aspetto (regressione cosmetica deterministica, `istantanea` da
ri-ancorare/dichiarare). L'esito di GIOCO a taglia 5 resta invariato (a taglia
5 la cosmetica non gira in `startMatch` per la guardia) -> `_eventi` bit-
identico -> MOTORE_V resta 2. Il test-condanna diventa `_q-determinismo
--taglia 11` (8/10 -> 10/10), che ora e' SENSIBILE alla cura ed e' anche la
prova che il perimetro cosmetico e' COMPLETO. L'opzione (b) salva/ripristina
resta valida per il solo canale `SEME` ma NON cura A/B/C: scartata a favore
della piu' completa.

--- testo originale del progetto (opzione b), conservato: ---

## La causa, in chiaro (misurata al #128)
- `startMatch` (:10999) chiama `setTaglia(...)` come PRIMA riga, prima del
  primo `dado()` di gioco (`G.kickTeam` :11030).
- Il banco semina `SEME` PRIMA di `startMatch`. Quindi la sequenza e':
  semina -> `setTaglia` -> (se la taglia CAMBIA) `rebuildCrowd` (:29998)
  consuma ~114026 `dado()` a taglia 11 -> il gioco parte da uno stream
  SLITTATO.
- `setTaglia` (:29977) ha la guardia `if(n===TAGLIA) return`: solo la PRIMA
  partita a una taglia paga le estrazioni; le successive no.
- Effetto: prima partita a 7/11 (stream slittato) != partite successive
  (stream non slittato) col MEDESIMO seme -> determinismo cross-partita rotto
  a 7/11. A taglia 5 la guardia e' sempre attiva (il menu vive a taglia 5)
  -> consumo 0 -> determinismo pulito (coerente con la #98: 5 pulito, 7/11 no).

## Perche' la folla consumava il PRNG (l'intento storico)
Il commento a :29942-29949 (voce ~#100) consuma `dado()` "e lo butta" di
proposito: voleva che, cambiando il CODICE della folla, la partita gia'
fotografata (istantanea) non cambiasse -- consumare lo STESSO numero di
estrazioni tiene ferma la sequenza. Ma quel numero DIPENDE dal perimetro
(taglia), quindi la garanzia vale solo a taglia FISSA. E' proprio questo
accoppiamento a generare la #98 cross-taglia.

## La cura scelta: salvare/ripristinare SEME attorno a rebuildCrowd (opzione b)
All'ingresso di `rebuildCrowd`, salvare `SEME.s` e `SEME.n`; all'uscita,
ripristinarli. La folla puo' consumare `dado()` quanto vuole (anche in numero
variabile per taglia): lo stato del PRNG DI GIOCO torna ESATTAMENTE com'era.

Perche' e' la cura giusta:
1. **Chirurgica**: due righe piu' il commento riscritto; il corpo di
   `rebuildCrowd` (posizioni/tinte/hash) resta INVARIATO.
2. **Preserva la folla**: l'aspetto (posizioni, sciarpe, telefoni) e'
   identico a oggi -- la stessa `dado()` parte dallo stesso stato.
3. **Realizza MEGLIO l'intento storico**: la partita fotografata resta
   identica a QUALSIASI taglia, comunque cambi la logica della folla (non
   solo "stesso numero di estrazioni a taglia fissa", ma "zero effetto sul
   PRNG di gioco, sempre").
4. **Bit-identica a taglia 5**: in `startMatch` a taglia 5 la guardia salta
   `rebuildCrowd` -> nessun cambiamento; nessun nastro/sfida (tutti a taglia
   5 per la #98) e' toccato.
5. **A SEME spento** (gioco normale, `dado()` usa `Math.random()`): salvare
   e ripristinare `s`/`n` e' un no-op innocuo (dado non li tocca).

Opzioni scartate:
- (a) folla su un PRNG PROPRIO (seme dedicato, come `USURA_SEME` :26973):
  disaccoppia ma CAMBIA il layout della folla (regressione cosmetica da
  giustificare). Piu' invasiva senza vantaggio sulla (b).
- (c) `setTaglia` PRIMA della semina: richiederebbe di riordinare l'API
  (la semina e' nel banco/hook prima di `startMatch`, che fa `setTaglia`
  internamente). Fuori portata.

## Il collaudo (dove sta il rischio: negli EFFETTI, non nel codice)
1. **Test-condanna che nasce ROSSO**: `_q-determinismo` a taglia 7 e 11 oggi
   e' 8/10 (misurato al #128); dopo la cura deve dare 10/10. E' il test che
   nasce rosso sul difetto e diventa verde con la cura (mandato §13.3).
   Attrezzo `_t-*` che riproduce lo slittamento (prima/dopo N partite a 11,
   stesso seme -> impronte diverse oggi, identiche dopo).
2. **Non-regressione a taglia 5, BIT per BIT** (l'avvertimento a :8590):
   `_eventi.js` su 100 partite a taglia 5 IDENTICO prima/dopo (se un solo
   numero si sposta la cura e' sbagliata); `_q-invarianti`, collaudo, battute.
3. **MOTORE_V**: valutare a banco. A taglia 5 tutto bit-identico -> i nastri
   a taglia 5 rigiocano identici. A 7/11 la prima partita cambia, ma erano
   gia' non-deterministiche (nessun nastro affidabile). Se non esistono
   nastri validi a 7/11, MOTORE_V resta 2; se il banco `_q-replay`/`_q-regole`
   mostra un nastro (a qualsiasi taglia) che rigioca diverso, 2->3.
4. **Batteria intera** (lezione 22: si rilancia tutta a ogni compito).

## Vincoli
- Cantiere di MOTORE: il gioco si tocca SOLO via attrezzo a ancore (`_t-*`),
  cerca/metti, `--out` poi `--dentro`, specchio byte-per-byte.
- Ogni difetto ha prima un TEST FALLITO (il test-condanna del determinismo).
- La cura misurata a taglia 5 (bit-identita') e a 7/11 (10/10): entrambe.
- Commenti senza accentate; un commit per compito; verbale a edizioni; il
  commento storico :29942-49 RISCRITTO (a edizioni) per la nuova strategia.
- Se la cura NON riporta 7/11 a 10/10 (causa residua non isolata), FERMARSI
  e riferire: la diagnosi #128 sarebbe incompleta.

## Fuori perimetro
Il resto dei seguiti (INV-06/07, #123, la rosa canonica nelle sfide). Le
onde D/E. Ogni tocco al gioco oltre `rebuildCrowd` (salvo scoperta).
