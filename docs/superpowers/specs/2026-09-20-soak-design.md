# Il soak con bande (voce #127, onda C — 3, ultimo anello)

20 settembre 2026. Terzo e ultimo anello dell'ONDA C. Il mandato (§13.1.5): "Soak
tests: 1,000 bot-vs-bot matches per night per profile ... zero crashes, zero
invariant violations, no match longer than the expected real duration + 25%". La
mappa: "soak con bande per taglia, dentro la batteria" (2g). Chiude l'onda C
(invarianti #125 + fuzzer #126 gia' in main).

## Che cos'e' (e come si distingue dal fuzzer)
Il FUZZER (#126) genera INPUT casuale (Touch5) e verifica le invarianti a ogni tick
— cerca il caso avversariale. Il SOAK e' complementare: guida un VOLUME di partite
CPU-contro-CPU (nessun input umano) fino a `'end'`, verificando su OGNI partita
(a) zero violazioni delle invarianti di `_q-invarianti.js` (NaN, owner, punteggio,
timeLeft, cronometri, clamp, >=2 uomini, palla, INV-04), (b) INV-15: nessuna partita
supera il tetto di durata (`TETTO_FOTOGRAMMI`, +25% gia' incorporato), e misura le
BANDE statistiche (gol/90s, tiri, parate, durata gioco vivo, ...) con quartili,
ANCORATE per taglia (come `_eventi.js`, che il soak puo' riusare per le misure).

## Le decisioni di design (dai vincoli noti)
1. **Taglia 5 come cancello ancorato e ripetibile**; 7/11 misurate ma dichiarate
   non-bit-ripetibili. Ragione: la VOCE #98 (determinismo instabile a 7/11) ha causa
   isolata (rebuildCrowd/setTaglia consuma il PRNG in proporzione al perimetro, #129
   aperto). A taglia 5 il determinismo cross-partita e' pulito (con la rosa
   rigenerata). Il soak-cancello (in batteria, ripetibile) gira a **taglia 5**; le
   bande a 7/11 si possono misurare (le invarianti e le statistiche valgono), ma si
   DICHIARA che non sono bit-ripetibili finche' #129 non e' curato.
2. **Rigenerare `SAVE.rosa`** (`nuovaRosa()`) a ogni partita, come il fuzzer (#126):
   la rosa di carriera cresce a ogni partita (per disegno) e desincronizza le
   partite in sequenza — il soak la rigenera per essere deterministico e ripetibile.
3. **Ordine `setCpuVsCpu` GIUSTO** (dopo `startMatch`), come da #108/#121.
4. **Dentro la batteria, ma `lento`**: il soak fa un CAMPIONE nella corsa di batteria
   (es. 50-100 partite, sotto `--tutto`/`lento:true` come `audio.js`), e un modo per
   la corsa NOTTURNA completa (es. `--partite 1000` o `--notte`): il mandato chiede
   1000/notte, non 1000 a ogni batteria. Le bande si ancorano sul campione dichiarato.
5. **Se il soak TROVA una violazione** (un'invariante rotta, o una partita oltre il
   tetto): e' una scoperta P0 (mandato §13.3) — si FERMA e si riferisce, riproducibile
   dal seme. Come il fuzzer, il soak e' una rete permanente.

## Le bande (ancorate, come _eventi)
Riusa `_eventi.js` (misura gia' gol/tiri/parate/legni/durata-gioco-vivo su N partite
CPU-CPU, con autodiagnosi di riproducibilita') per le statistiche, O misura le stesse
voci nel soak. Le bande di riferimento (mediana + quartili per taglia 5) si SALVANO
(un file di bande, o le costanti nel banco) e il soak verde se le partite restano
nelle bande. ATTENZIONE (lezione #112/#114): le bande non tarate a favore; una banda
troppo stretta condanna un cambiamento legittimo domani, una troppo larga non misura.
Dichiarare la larghezza e la ragione.

## Cosa il soak aggiunge oltre invarianti+bande
- **INV-15 su volume**: la clausola "durata <= attesa +25%" (l'hang #119) verificata
  su MOLTE partite, non solo 2 scenari — la generalizzazione che _q-cpu-ordine
  (2 scenari) e _q-invarianti (8 semi) non danno.
- **Stabilita' su volume**: zero crash / NaN / stati impossibili su centinaia di
  partite (il valore del soak: il caso raro che 8 semi non pescano).

## Le cure (2-3 compiti)
1. **Il soak base**: `strumenti/_q-soak.js` (calco `_q-invarianti.js`/`_eventi.js`):
   guida N partite CPU-CPU a taglia 5 (rosa rigenerata, ordine giusto), verifica le
   invarianti (riusa `verificaTickInvarianti`/`verificaCronometriFratelli` di
   `_q-invarianti.js`) su ogni partita + INV-15 (arriva a 'end' entro il tetto),
   deterministico e ripetibile (due corse identiche). Zero violazioni sul gioco sano
   (se ne trova una, P0 -> fermarsi). Un modo `--partite N` per il volume.
2. **Le bande**: misura le statistiche (gol/90s, tiri, parate, durata gioco vivo,
   ...) su N partite a taglia 5, ancora le bande (mediana+quartili), verde se dentro.
   Nasce ROSSA su una versione bugiarda che sfora una banda (o un caso di controllo).
   Bande a 7/11 misurate e dichiarate non-bit-ripetibili (#98).
3. **Batteria + verbale**: `_q-soak` in `tutti.js` (conta:true, `lento:true`); il
   campione di batteria (es. 50-100 partite) verde. Verbale (voce #127): cosa fa il
   soak (volume, invarianti, bande, INV-15), le bande ancorate a taglia 5, la #98 a
   7/11 dichiarata, la rosa rigenerata, l'ONDA C DICHIARATA CHIUSA (invarianti #125 +
   fuzzer #126 + soak #127). PUNTO aggiornato. (Se 1+2 sono snelli, si accorpano.)

## Vincoli
- Cantiere di BANCO: il gioco NON si tocca (riusa __test/_q-invarianti/_eventi). Se
  serve un hook di sola lettura, via attrezzo, dichiarato. `git diff` del gioco vuoto.
- Deterministico e ripetibile a taglia 5 (rosa rigenerata, ordine giusto). Seme fisso.
- Le invarianti RIUSATE da `_q-invarianti.js`, non duplicate. Le bande non tarate.
- Una violazione trovata = P0 (fermarsi, riferire, riproducibile).
- Commenti senza accentate; un commit per compito; verbale a edizioni.

## Fuori perimetro
Il "battito delle pose" (§8.8, animazione, non robustezza engine — resta fuori
dall'onda C engine). La cura della #98/#129 (rebuildCrowd nel PRNG — seguito
dedicato). INV-06/07 (validita' gol/ripresa — assert dedicato, seguito). Le 1000
partite a ogni batteria (troppo lente: il campione in batteria, il volume in
`--notte`). Il gioco (salvo scoperta P0).
