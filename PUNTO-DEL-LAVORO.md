# Dove siamo, e cosa manca

Aggiornato al 15 agosto 2026, dopo la notte delle grandi onde (rose, rig 3D,
comandi, regia) e sei appelli della giuria a 26. Questo file serve a
riprendere senza rileggere niente altro.

**Ramo:** `main`. **Ultimo lavoro:** CALCETTO — trasformazione completa.

---

## Il verdetto della giuria a 26, e cosa dice davvero

Il committente ha chiesto: giuria di 26 giudici, il nostro almeno 8-9 e i
competitor a 3-4 in confronto diretto. Misurato SEI volte su scene fresche,
dopo ondate di lavoro fra un appello e l'altro:

| appello | noi | FIFA/eFootball |
|---|---|---|
| 1° | 6,39 | 7,98 |
| 2° | 6,38 | 7,87 |
| 3° | 6,42 | 8,02 |
| 4° | 6,41 | 7,94 |
| 5° | 6,42 | 8,00 |
| 6° | 6,43 | 8,01 |

**Il voto è congelato (±0,05) mentre il gioco è stato trasformato.** Ogni
appello i giudici confermano le riparazioni precedenti e trovano difetti
nuovi allo stesso voto. La ragione è strutturale, non di qualità: ogni
giudice si àncora al fotorealismo 3D dei riferimenti («vertice visivo
assoluto» → ~8) e tetta un gioco stilizzato su canvas a ~6,5, per quanto
rifinito. Con questo disegno di giuria l'obiettivo 8-9 contro 3-4 non è
raggiungibile iterando la qualità: sei appelli piatti lo dimostrano.

**Il confronto che invece si vince** (misurato il 3 agosto, giudice che pesa
insieme esperienza e visivo): **noi 8, FIFA Mobile 3** — si apre in un
secondo da 1 MB, zero account/pubblicità/attese, equità misurata al bit,
contro gigabyte, account, casse premio e pay-to-win.

Le tre strade possibili, da decidere col committente:
1. accettare il verdetto d'esperienza (8 vs 3) come il confronto che conta;
2. rifare la giuria nella categoria giusta (stilizzati mobile: Soccer Stars,
   Mini Football) dove il confronto è alla pari;
3. continuare le onde visive sapendo che il numero della giuria attuale non
   si muoverà.

---

## Cosa è stato costruito nella notte (commit da `2c7ad5f` a `6e01d2d`)

- **Le rose 5/7/11**: tre taglie selezionabili, campi scalati, moduli
  1-2-2 / 1-3-3 / 1-4-4-2, culling, collaudo a 20 controlli CALCETTO.
- **Il rig pseudo-3D a 360°** (`bozze-rig3d/RIG.html`, incollato nel gioco):
  18 giunti proiettati, due camere (alto/bassa), TUTTE le azioni: corsa,
  camminata, frenata, passaggio, filtrante, cross, tiro, finta, scivolata,
  rovesciata, 4 clip del portiere, 3 esultanze, delusione. Costo 0,3-0,5 ms
  per 22 figure. LOD da primo piano (volto, mani, maglia ombreggiata).
- **I comandi**: stick + due pulsanti contestuali (TIRA/FILTRANTE ↔
  CONTRASTA/CAMBIO), cross col flick trasversale (z balistica), cura del
  tiro «lunatico», anello ambra con freccia SOLO sul comandato.
  `giocata.js` a 8 giocate misurate col dito (4-63 ms).
- **La regia del gol**: fascia unica a tutta larghezza + ripresa dedicata
  in camera bassa dietro la porta (marcatore di tre quarti, rete, folla,
  portiere deluso), saltabile, composta a moto ridotto.
- **Il colpo d'occhio**: camera a figure ~40px col bordo di scenografia
  sempre intero in quadro, insegne mai a mezza lettera (testo vivo solo se
  la fascia è intera), minimappa discreta al centro-basso, tutorial onesto
  che muore al gesto riuscito, palla l'oggetto più chiaro della mischia.
- **Studio dei competitor col connettore Chrome** (`riferimenti/AZIONI.md`):
  i due poli dei comandi (eFootball / Mini Football) e il trucco degli
  storyboard di i.ytimg.com per leggere i gameplay senza player.

## I difetti aperti (dal sesto appello, tutti riparabili)

1. LOD del primo piano ancora sotto la scena: pallone a disco piatto da
   vicino (servono spicchi+riflesso oltre soglia), mani/volti minimi,
   stacco maglia/pantaloncino/calzettoni nel ravvicinato, numero in schiena
   nella ripresa.
2. Pulsanti TIRA/FILTRANTE percepiti mimetici: la giuria chiede il bordo
   AMBRA (la tinta d'interazione) al posto del lime di squadra.
3. Pose d'attesa al kickoff: «birilli» — serve una posa di attesa con
   braccia staccate e spalle.
4. In 7v7/11v11 il bordo di scenografia esce ancora dal quadro in certe
   posizioni; la minimappa 11v11 è affollata.
5. Groviglio degli arti a metà falcata a 30px (tetto agli angoli estremi).

## I cancelli (tutti verdi all'ultima esecuzione)

collaudo 32/32 (20 CALCETTO + 12 CIRCOLO, seme fisso) · misura 7/7 ·
prestazione 3/3 (medio −27%, p95 −50%) · senza-rete 6/6 · giocata 8/8
(sa fallire: 8 NO in pausa) · equità 0,000 su partite appaiate al bit ·
APK 32/32. File ~1049 kB su tetto 1500.

## Come si riprende

```bash
cd C:/Users/Utenteee/Desktop/GitHub/games
node strumenti/collaudo.js && node strumenti/misura.js && node strumenti/prestazione.js
node strumenti/giocata.js --tutte
node strumenti/equita.js --partite 200 --conf-b "window.__test.attivaOggetti('tutti')"
node strumenti/scatta.js --tutte calcetto --dir foto-oggi   # 30 scene
python android/costruisci.py && python android/verifica.py
```

## Le regole pagate (aggiornate)

1. Le passate correttive rendono più di quelle creative.
2. Un solo «peggio» è bloccante.
3. I cancelli li esegue chi giudica, non chi lavora.
4. Uno strumento che attesta invece di misurare è peggio di nessuno
   strumento — SETTE casi trovati (l'ultimo: foto.js del rig copiava un
   file invece di scattare, MD5 identici).
5. Un agente morto non è un via libera: i workflow si fermano su null.
6. Il metro si rettifica con data e fonte quando la realtà lo supera.
7. **Una giuria ancorata a un riferimento irraggiungibile congela il voto:
   se sei appelli non muovono la media mentre il prodotto si trasforma,
   il problema è il metro, non il lavoro.** Prima di iterare ancora,
   ridiscutere il metro col committente.
