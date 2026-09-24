# IL NASTRO DEL DISCHETTO SI PUÒ CONFERMARE — piano (voce #148)

Progetto: `docs/superpowers/specs/2026-09-24-nastro-giudicabile-design.md`.
Merge-base `01265bc`. Ramo `voce-148-nastro-giudicabile`. Quattro compiti, un
commit per compito, batteria **intera** a ogni compito (lezione 22).

## Compito 0 — la misura di partenza (questo commit)

* `strumenti/_sonda-148-differita.js`: serie vera fino in fondo fra due
  telefoni, nastro, verdetto, e le due righe di tipo 7 messe a confronto.
* Misurato sul merge-base: `INCOMPLETO/rose-assenti`.
* Misurato su `fuori/148-diagnosi.html` (le tre righe e basta): **NON TORNA**,
  atteso [4,3], rigiocato [3,2], 8462 passi.
* Spec e piano. **La diagnosi del #147 è corretta a metà e il progetto lo dice.**

## Compito 1 — il banco che condanna, e i suoi falsi

* `strumenti/_q-nastro-differito.js`, sei cancelli A..F (spec §5). **Nasce
  rosso** su A e F.
* `strumenti/_crit-nastro-*.js`: sei falsi nel caso peggiore (spec §5). Ognuno è
  una toppa che produce una copia bugiarda del gioco in `fuori/`; il banco li
  gira uno per uno e **dichiara la bite list**.
* Verde atteso al compito 1: C, D, E (le astensioni che il #147 ha già comprato)
  — e il banco lo deve dire, se no un rosso di A nasconderebbe un verde comprato
  con un'assenza.

## Compito 2 — la cura

`strumenti/_toppa-148-differita.js`, ad ancore, cinque pezzi:

1. `Reg.carta(mentA, mentD, pacA, pacD, iCar)` — la porta unica che scrive 7,
   10, 11 nell'ordine di oggi, con i commenti del #132/#133/#142 che oggi stanno
   dentro `Sfida.gioca`.
2. `Sfida.gioca` la chiama al posto delle tre righe. **Il nastro non cambia di
   un byte** — da misurare, non da dichiarare.
3. `Dischetto.avvia` la chiama, con `[1,1]`, `rA`, `rB`,
   `indiceCarattere('FUORI')`; e la riga 15 porta anche il primo tiratore.
4. `serializza`/`deserializza` imparano il secondo numero della riga 15.
5. `vagliaNastro` mette il fatto nel referto (`out.disco`), e `giudica` apre la
   serie (`G.kickTeam` + `avviaRigori()`) e confronta `G.rigori.seg`.

Poi: la staffetta. Si misura che un nastro del dischetto si raggruppi
(`qualunque@<impronta>`) e si giudichi come gli altri; se serve un adattamento
si fa **e si misura**.

## Compito 3 — i numeri, la batteria, i verbali

* `strumenti/_t-148-motorev.js`: nei due versi, con il criterio del #147 (lo
  scarto di righe dev'essere **esattamente** 3). `MOTORE_V` 4 → 5 con la prova
  in mano; `DISCHETTO_V` resta 1 e si dice perché.
* `_q-nastro-differito` registrato in `tutti.js` con `conta:true`.
* Batteria intera a gruppi (`--solo`), `--ripetuto 3` sui banchi a tocchi reali.
* Verbale in `MANUALE.md` §A in cima, riga nuova in `PUNTO-DEL-LAVORO.md`, e la
  **rettifica a edizioni** del residuo (1) del #147 in tutti e due i posti.

## Le reti di sicurezza, a ogni compito

`_q-volto`, `_q-volto-falsi`, `_q-dischetto` (29/29), `_q-dischetto-falsi`,
`_q-motori`, `_q-casa`, `_q-schermi`, `_q-duello-impronta` (44/44), `_q-giudice`,
`_q-sigillo`, `_q-carta`, `_q-amici`, `_q-sospetto`, `_q-staffetta`,
`_q-finestra`, `_q-glicko`, `_q-motore-nastro`, `_q-determinismo`,
`_q-rete-latenza`, i quattro del #132, `_q-rete`, `_q-sfida`, `senza-rete`,
`salvataggio`, `rete/prove/tutte.js` (62/62).
