# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Che cos'è

Due giochi per telefono, ognuno in **un solo file HTML autosufficiente** (font,
grafica, suoni e logica tutti inline, zero rete, zero dipendenze a runtime):

- `CALCETTO-il-gioco.html` (~2,5 MB) — calcio 3v3/5v5/7v7/11v11. È qui che si
  concentra quasi tutto il lavoro corrente.
- `CIRCOLO-il-gioco.html` (~470 kB) — Scopa, Scopone, Briscola.

**Tutto il progetto è in italiano**: commenti, nomi, messaggi di commit,
documentazione, output degli strumenti. Scrivi in italiano anche tu.

**I file di gioco sono enormi: non leggerli mai per intero.** Usa Grep per
trovare la funzione, poi Read con offset/limit. I commenti nel gioco sono
lunghi e spiegano il "perché": leggili prima di toccare la zona.

## Comandi

```bash
npm install                                  # solo playwright (per gli strumenti)

node strumenti/tutti.js                      # la batteria dei cancelli che conta
node strumenti/tutti.js --tutto              # anche i lenti (volti, avvio, audio)
node strumenti/tutti.js --solo collaudo,istantanea
node strumenti/tutti.js --ripetuto 3         # per smascherare cancelli rumorosi
node strumenti/tutti.js --gioco fuori/x.html # punta la batteria su un ALTRO file
                                             # (vale anche la variabile GIOCO_PROVA)
node strumenti/collaudo.js [circolo]         # un cancello singolo, stessa forma
node strumenti/_q-invarianti.js              # idem per ogni _q-*.js

python android/costruisci.py                 # gli APK (aapt2→javac→d8→zipalign→apksigner)
python android/verifica.py                   # 32 controlli sugli APK finiti
```

**Codici di uscita di casa, per la batteria e per ogni cancello:** 0 verde ·
1 il gioco è rosso · 2 il banco è esploso (il cancello non può fidarsi di sé) ·
3 prova nulla (niente di misurabile). **Un 2 o un 3 NON accusano il gioco** —
chi li confonde con un rosso manda qualcuno a riparare la cosa sbagliata.

## Come si collauda (le trappole già pagate)

- Entrambi i giochi espongono `window.__test`: avvio partita, simulazione a
  passo fisso, autoplay, stato serializzato, forzatura di eventi. È la via
  giusta: decine di partite misurate, mai "giocare a mano e guardare".
- Playwright blocca `file://`. Gli strumenti si servono da soli via HTTP
  locale; se lavori a mano: `python -m http.server 8777 --bind 127.0.0.1`.
- **Il service worker (`sw.js`) ignora la query string** (`ignoreSearch:true`):
  `?v=N` come cache-busting non funziona e i test misurano la copia vecchia.
  Se un test non riflette una modifica appena fatta, per prima cosa
  `unregister()` dei service worker e `caches.delete()`.
- **Due classi di banco, e solo una è ripetibile.** I banchi a
  `t.simulate(dt)` a passo fisso sono deterministici dato il seme. I banchi
  che pilotano tocchi reali via CDP (`giocata.js` e simili) girano in tempo
  reale e NON lo sono: un solo rosso non è una prova, va rilanciato con
  `--ripetuto N` (che dichiara da sé i cancelli «RUMOROSI OGGI»).
- **Il determinismo pieno vale a taglia 5.** A 7/11 `rebuildCrowd` consuma
  PRNG in proporzione al campo e lo stream slitta (voce #98, causa isolata,
  seguito #129). Banchi e fuzzer girano a taglia 5, o dichiarano la #98.
- **Ordine sacro nei banchi:** `startMatch(...)` PRIMA, `setCpuVsCpu(true)`
  DOPO. L'ordine inverso viene annullato in silenzio e congela una squadra:
  il banco misura sé stesso, non il gioco (voci #107/#108, dieci strumenti
  colpiti). `_q-cpu-ordine.js` fa la guardia.
- Alcuni verbi sono **solo umani** (strappo, scudo, contrasto in piedi, cross
  da `doCrossUmano`): in CPU-contro-CPU non escono mai. «Zero occorrenze» su
  partite automatiche non significa «rotto», significa «nessuno lo usa». Per
  misurarli si chiamano le funzioni globali del gioco da `pag.evaluate`.
- Un banco che teletrasporta il pallone deve azzerare lo stato derivato
  (`b.lastTouch`/`b.toccoPiede`), altrimenti eredita l'ultimo evento vero e
  resta bloccato per sempre (lezione 21 di `PUNTO-DEL-LAVORO.md`).

## La cartella `strumenti/` — convenzioni di nome

- **Senza underscore** (`tutti.js`, `collaudo.js`, `giocata.js`, `seme.js`,
  `istantanea.js`, …): infrastruttura stabile e cancelli storici della batteria.
- **`_q-*.js`**: banchi/cancelli di qualità, i candidati alla batteria. Si
  registrano in `tutti.js` con `conta:true` quando promossi.
- **`_t-*.js`**: attrezzi di un compito specifico — il test che nasce ROSSO
  sul difetto e diventa verde con la cura (mandato §13.3: «ogni bug ha prima
  un test fallito»).
- **`_crit*.js`**: versioni bugiarde del gioco (mutanti) costruite per
  condannare un banco: provano che il cancello discrimina invece di attestare.
  Un falso troppo gentile non prova niente: va costruito nel caso peggiore.
- **`_sonda-*.js` / `_diag-*.js`**: sonde diagnostiche usa-e-getta.
- **`_toppa-*.js`**: script che applicano una modifica al gioco.

La cartella `fuori/` (non tracciata) tiene copie di versioni del gioco per i
confronti due-versioni (`--gioco`, `_c3-sorteggi.js`, ecc.).

## Dove sta la verità

- **`PUNTO-DEL-LAVORO.md`** — lo stato del lavoro, giornata per giornata, e le
  «regole pagate» in fondo. **Da leggere per riprendere**; le righe più
  recenti superano quelle vecchie (sono marcate «RIGA SUPERATA»).
- **`MANUALE.md`** — il manuale del gioco (ogni riga verificata sul codice) e
  in fondo il **§A registro**: il verbale completo di ogni voce #N.
- **`_analisi/MAPPA-MANDATO.md`** — il mandato in corso (onde A/B/C) e le
  invarianti INV-01..15.
- **`docs/superpowers/specs/` e `plans/`** — spec e piani datati
  (`AAAA-MM-GG-nome-design.md`), scritti prima di ogni cantiere.
- **`fcm-estratto/`** — asset estratti da FC Mobile: riferimento per
  soluzioni collaudate. Le meccaniche sono libere, **l'espressione no**: non
  copiarne grafica, testi o asset nel gioco.

## Come si lavora qui

- Il lavoro procede per **voci numerate** (#N) raggruppate in **onde**; ogni
  voce è un «cantiere» con merge-base dichiarato, spec/piano in
  `docs/superpowers/`, e verbale finale in `MANUALE.md` §A.
- Branch per voce: `voce-N-nome` (es. `voce-126-fuzzer`). Commit narrativi in
  italiano, chiusi da `(voce #N, compito M)`.
- **In un cantiere a più compiti, la batteria INTERA si rilancia a ogni
  compito**, non solo i cancelli nominati dal piano: cinque regressioni sono
  state trovate solo così (lezione 22).
- **`MOTORE_V`** (versione del motore nel gioco) si incrementa quando una cura
  cambia l'esito di sequenze di comandi identiche: i nastri registrati sul
  motore vecchio vengono rifiutati con causa vera, non rigiocati storti.
- Le affermazioni superate nei documenti **si rettificano a edizioni**: si
  corregge in chiaro con data e fonte accanto, senza cancellare il testo
  vecchio.
- Prima di chiamare «regressione» un numero rosso, **misuralo sull'ultimo
  commit** (30 secondi; tre diagnosi su quattro non erano regressioni). E
  «pre-esistente» si verifica contro l'ORIGINE del guasto, non contro il
  commit immediatamente precedente.
- **Un numero con la dispersione fuori soglia non si trascrive da nessuna
  parte**, e uno strumento che attesta invece di misurare è peggio di nessuno
  strumento. Quando ne ripari uno, cerca subito la stessa ferita negli
  strumenti che l'hanno copiato.

## Cosa non pubblicare

`STUDIO-02*.html`, `STUDIO 03*.html` e `studi-locali.js` contengono costi e
strategia: sono nel `.gitignore` apposta, non vanno su repo pubblici né citati
per nome in file pubblicati. `android/chiave.jks` è la chiave di firma degli
APK: mai committarla (`costruisci.py` se ne genera una se manca).
