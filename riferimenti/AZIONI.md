# Le azioni e i comandi — studiati sui gameplay veri (3 agosto 2026)

Fonte: storyboard dei video YouTube (fotogrammi ogni ~5 s sull'intera partita),
studiati col connettore Chrome. Video: «Algeria vs Tunisia — eFootball 2026
Gameplay Android» (Khalifa02dz, 7 giorni fa) e «Mini Football Mobile —
Gameplay Video Tutorial Part 1» (GAMEPLAYBOX). Le immagini restano in locale,
questo documento distilla ciò che serve a noi. **Serve a calibrare, non a
copiare**: niente layout identici, niente marchi.

---

## I due poli dei comandi mobile

### eFootball 2026 (il polo «completo»)
- **Stick sinistro**: una grande palla bianca traslucida, molto leggibile,
  posizione fissa in basso a sinistra.
- **Quattro pulsanti verdi traslucidi a rombo in basso a destra, CONTESTUALI
  al possesso**:
  - in attacco: `Through` (filtrante), `Shoot` (tiro), `Pass` (passaggio),
    `Dash` (scatto); vicino alla propria area `Shoot` diventa `Clear`
    (spazzata);
  - in difesa: `Match-up` (accompagna), `Tackle` (contrasto), `Switch`
    (cambio giocatore), `Dash & Pressure` (pressione).
  - Stesse QUATTRO posizioni, etichette che cambiano: il pollice impara i
    posti, non i nomi.
- **Giocatore attivo**: anello ciano + freccia sotto i piedi + nome sopra la
  testa. Sempre visibile, mai ambiguo.
- **HUD in partita**: una sola riga in alto a sinistra (`ALG 0 0 TUN 0:22`),
  radar minuscolo in basso al centro. Densità bassissima.
- **Presentazione del gol**: fascia gialla A TUTTA LARGHEZZA con marcatore e
  minuto (`Naif Bin Fathi 13'` sopra `Algeria 2 ⚽ 0 Tunisia`), camera che
  ruota dietro la porta. Il gol è UN EVENTO, non una scritta.

### Mini Football (il polo «minimo» — il più vicino a noi)
- **Stick blu traslucido** in basso a sinistra + **UN pulsante contestuale**
  in basso a destra: verde (passa/tira) col possesso, rosso (contrasta) senza.
  A volte un secondo pulsante minore (scatto/cross).
- **Tutorial**: l'allenatore parla a schermate brevi («tap to continue»), poi
  UNA prova guidata sul campo con percorsi di coni e frecce per ogni gesto.
  Si impara facendo, un gesto per volta.

---

## Cosa ne segue per CALCETTO (decisioni)

1. **Teniamo lo stick + pulsanti contestuali**, tra i due poli: stick sinistro
   (ancorato, palla traslucida, zona morta corta) e DUE pulsanti a destra che
   cambiano col possesso — grande: `TIRA`/`CONTRASTA`; piccolo sopra:
   `FILTRANTE`/`CAMBIO`. Il cross è il flick laterale dallo stick (gesto già
   nostro), la rovesciata è `TIRA` tenuto quando la palla arriva alta.
   Poche posizioni, etichette nostre in italiano, smalto su lavagna.
2. **L'anello sul giocatore attivo** deve reggere il confronto con il ciano
   di eFootball: pieno, con freccia di direzione, MAI staccato dai piedi.
3. **La presentazione del gol**: fascia a tutta larghezza col marcatore e il
   minuto (nel nostro linguaggio: smalto su lavagna, non gradiente viola),
   e la ripresa con la camera bassa dietro la porta — il rig 3D nasce per
   questo.
4. **Il tutorial diventa prove guidate**: la lavagna del mister resta, ma ogni
   gesto ha la sua prova sul campo con i coni (già nel nostro stile).
5. **La densità**: eFootball tiene UNA riga di HUD; noi abbiamo già pulito, e
   la regola resta «Soccer Stars ce l'ha?».

## Nota di metodo: come si studiano i video senza il player

Il flusso video di YouTube non decodifica sul banco (nero con rotella, mentre
le anteprime al passaggio del mouse girano). La via che funziona: dalla pagina
del video si legge `ytInitialPlayerResponse.storyboards.…spec`, si costruisce
`https://i.ytimg.com/sb/<ID>/storyboard3_L<liv>/M<n>.jpg?sqp=…&sigh=<firma>`
e si naviga il mosaico (livello più alto = fotogrammi più grandi; L3 = 400×180,
un fotogramma ogni 5 s, griglia 3×3). Due mosaici coprono una partita intera.
