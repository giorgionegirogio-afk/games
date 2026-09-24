# Piano — voce #149, LA CURA DELLA REVISIONE D'INSIEME

**merge-base** `b87f512` · ramo `voce-149-cura-revisione` · spec
`docs/superpowers/specs/2026-09-24-cura-revisione-design.md`

Cinque compiti, uno per commit. La **batteria intera** si rilancia a ogni
compito (lezione 22), a gruppi con `--solo` perché `--tutto` chiede ~1800 s.

---

## C0 — spec e piano

Questo file e lo spec. Nessuna riga di gioco.

## C1 — il banco dei tre casi (NASCE ROSSO)

1. `_q-nastro-differito.js`: aiutante `cambiaArg(testo, tipo, i, v)` accanto
   a `togliTipo` (non c'era: il revisore lo dava per presente).
2. Tre prove nuove nel gruppo B, **tutte e tre devono astenersi**:
   - **B5** tolta SOLO la riga 15, le 14 restano → atteso
     `INCOMPLETO/dischetto-assente`
   - **B6** tolte la 15 **e** tutte le 14 (il residuo) → atteso
     `INCOMPLETO/duelli-mai-letti`
   - **B7** il bit `primo` della riga 15 capovolto → atteso
     `INCOMPLETO/dischetto-primo-incoerente`
   - **B8** la riga 15 con `v = 2` (un protocollo che non conosciamo) →
     atteso `INCOMPLETO/dischetto-versione`
3. Si misura e si dichiara il rosso di partenza (atteso: quattro NON TORNA /
   TORNA al posto delle quattro astensioni).
4. Il **falso della cura pigra**: `_crit-giudice-mezza-guardia.js`, un
   mutante che applica SOLO la riga (a) della cura. Il banco deve restare
   rosso su B6, B7 e B8.

**Verde atteso a fine C1**: nessuno. È il compito del rosso.

## C2 — la cura, nel gioco (via `_toppa-149-*.js`, mai Edit diretto)

`strumenti/_toppa-149-giudice.js`, ancore esatte, con controllo di
applicazione una-volta-sola:

1. `vagliaNastro`: `if(testi.size && !disco) return no('INCOMPLETO','dischetto-assente');`
2. `vagliaNastro`: `if(disco && disco.v !== DISCHETTO_V) return no('INCOMPLETO','dischetto-versione');`
3. `dsPrimoDalSeme(seme)` — porta sola — chiamata da `chiudiAppuntamento` e
   dal giudice; il giudice la usa **solo per il riscontro**:
   `INCOMPLETO/dischetto-primo-incoerente`.
4. Alla fine della rigiocata: **nessun** comando di duello letto mentre il
   nastro ne porta → `INCOMPLETO/duelli-mai-letti` (la soglia è «nemmeno
   uno» e non «qualcuno»: lo dice una misura, vedi lo spec §1.3(c)).
5. Il `catch` muto di `:48147`: commento di dichiarazione accanto.
6. **`MOTORE_V`**: si misura se la cura cambia il verdetto su nastri già
   scritti. Quattro verdetti cambiano (da NON TORNA/TORNA a INCOMPLETO) su
   nastri **manomessi**; su un nastro **onesto** nessun verdetto cambia. Si
   decide con la misura, non con l'opinione, e si scrive il perché.

**Verde atteso**: `_q-nastro-differito` 17 su 17, `_crit-giudice-mezza-guardia`
condannato, reti di sicurezza verdi.

## C3 — i due banchi che attestano, e il falso del seme

1. `_q-nastro-tronco.js:110`: `MOTORE_V` letto dal file, e si pretende la
   **causa** `nastro-vuoto`. Falso di controllo: se si spegne la guardia del
   nastro vuoto la prova deve diventare rossa.
2. `_q-dischetto` E1: metro `puntaAlMinuto()` al posto della moltiplicazione
   per `DISCHETTO_SEC_TIRO`; si **rimisura** la punta vera e si riscrive la
   soglia che il banco pretende (il gioco degrada, quindi la prova vera è
   «degrada», non «sta sotto 60»).
3. Il falso del seme: `_crit-dischetto-nonce-scelto.js` (o l'arma già
   presente in `_dischetto-due-telefoni.js:406-428`) messo in campo in
   `_q-dischetto-falsi`. **Si misura** quante volte su N il secondo vince il
   bit. Poi si valuta la cura del protocollo e **si dichiara**.

## C4 — le rettifiche documentali, la batteria, il verbale

Tutte a edizioni, data 24 settembre 2026, senza cancellare il testo vecchio.

- **CRITICO 2** — la dichiarazione al committente in **tre** posti
  (`_analisi/MAPPA-MANDATO.md`, `MANUALE.md`, `PUNTO-DEL-LAVORO.md`), con
  l'elenco degli otto punti non ricevuti. Puntatore §5.3 → §5.4
  (`MANUALE.md:2599`, `PUNTO:21`).
- **CRITICO 3.1** — `MANUALE.md:1313-1314` e `:912`: «nessun innocente viene
  accusato» è falsa, il caso 7 la smentisce.
- **CRITICO 3.2** — `istantanea` **rimisurata** su tre versioni (oggi,
  `b87f512`, `a2607d0`), numeri veri, e `MANUALE.md:2142-2145` rettificata.
- **9** — `_q-nastro-differito`: 13 prove (`MANUALE.md:630,634` dice 12); la
  coda vale 3,68× e 5,54× (`PUNTO:21` dice 2,7).
- **10** — l'etichetta del #145: la quantità confrontata è **p99 + 1 tick**,
  non `p95` (`MANUALE.md:1509`, `_145-metro-rete.js:375`).
- **11** — `rete/LEGGIMI.md:266,269-277`: sei endpoint, non cinque; manca
  `/api/dischetto`.
- **12** — i «409 casi» della SHA-256 (`MANUALE.md:1169-1172`): **o** il
  banco che li rifà ed entra in batteria, **o** il numero si ritira.
- **13** — il #146 §j (`MANUALE.md:1296-1315`) descrive come «da fare» due
  cose già fatte dal #147.
- **8** — i limiti scritti nel posto sbagliato: il pannello mai visto da un
  occhio umano, il server finto della cassetta, la SOGLIA-UMANA del #141.
- **minori** — `tutti.js:910`; i commenti superati nel gioco (`:9237`,
  `:47313`, `:48826`); `MOTORE_V` a 4 bit nella CARTA (`:44757`, `:44907`);
  `Math.cbrt` fuori dalle sette di `_q-casa`; tre righe «| 0 |» nella stessa
  giornata di `PUNTO`; «la piega non si è mossa di un pixel».
- **batteria intera**, a gruppi, e il verbale #149 in `MANUALE.md` §A.

---

## Le reti di sicurezza, a ogni compito

`volto`, `volto-falsi`, `dischetto`, `dischetto-falsi`, `nastro-differito`,
`nastro-falsi`, `motori`, `casa`, `casa-falsi`, `perimetro`, `schermi`,
`duello-impronta`, `giudice`, `sigillo`, `carta`, `amici`, `sospetto`,
`staffetta`, `finestra`, `glicko`, `motore-nastro`, `motore-falsi`,
`determinismo`, `rete-latenza`, `rete-falsi`, i quattro del #132, `rete`,
`sfida`, `senza-rete`, `salvataggio`, `rete/prove/tutte.js`.
