# La classifica degli amici — piano (voce #136)

Progetto: `docs/superpowers/specs/2026-09-22-classifica-amici-design.md`.
Base: `main` = `66b17fe`. Ramo: `voce-136-classifica-amici`. Cantiere di
MOTORE, di SALVATAGGIO e di SCHERMATA: si tocca **solo**
`CALCETTO-il-gioco.html`, e solo per ancore. Niente server, niente
`rete/`: e' la funzione che esiste per non averne bisogno. Quattro
compiti (0..3), un commit ciascuno.

## Vincoli globali

1. **Il gioco si tocca solo via attrezzo a ancore.** Ogni compito che
   modifica `CALCETTO-il-gioco.html` porta il suo `strumenti/_toppa-*.js`
   che cerca una stringa-ancora unica, la sostituisce, e scrive con
   `--out` una copia o con `--dentro` il gioco stesso, specchio
   byte-per-byte. Mai un Edit diretto.
2. **Ogni funzione nuova ha prima un TEST che nasce ROSSO**, e ogni
   affermazione ha il suo FALSO (`_crit-*.js`) che dimostra che il banco
   discrimina. Il falso va costruito nel caso peggiore: deve PASSARE le
   prove di forma e CADERE su quella di sostanza. In quest'onda cinque
   cantieri di fila hanno dovuto impararlo in revisione.
3. **Le reti di sicurezza verdi a OGNI compito**: `_q-duello-impronta`
   44/44, `_q-giudice` 21/21, `_q-sigillo` 14/14, `_q-carta` 22/22,
   `_q-sfida` 54/54, `_q-rete` 22/22, `_q-ment-nastro` 6/6,
   `_q-carattere-nastro` 4/4, `_q-rosa-scala` 4/4, `_q-nastro-tronco`
   5/5, `senza-rete` 6/6, `salvataggio` 11/11. Se una si muove di un
   numero ci si ferma e si riferisce.
4. **Batteria INTERA a ogni compito** (lezione 22), a gruppi con
   `--solo`: `--tutto` chiede piu' dei dieci minuti che l'attrezzo
   concede.
5. Commenti senza lettere accentate.
6. Banchi a taglia 5; ordine sacro `startMatch(...)` PRIMA,
   `setCpuVsCpu(true)` DOPO.
7. Codici di uscita: 0 verde, 1 gioco rosso, 2 banco esploso, 3 prova
   nulla.
8. `MOTORE_V` resta **2**. Non si tocca il nastro ne' la simulazione.
9. **Il divieto di sicurezza**, che e' quello della voce #135 allargato:
   nel codice di risposta non entrano ne' l'id ne' il segreto ne' un solo
   dato personale, e i tre codici del gioco non si confondono fra loro in
   nessun verso. Se un compito finisse per volerne uno, ci si ferma.
10. **Il salvataggio resta v4.** Se una misura dicesse che serve una v5,
    ci si ferma e si riferisce invece di alzarla.

## Compito 0 — spec e piano

Questo documento e la spec. Niente codice nel gioco; quattro sonde
usa-e-getta in `fuori/`, che non sono cancelli.

Misure di partenza, prese prima di toccare qualunque cosa:

- le reti di sicurezza, **tutte verdi**: `senza-rete` 6/6 ·
  `salvataggio` 11/11 · `_q-rete` 22/22 · `_q-duello-impronta` 44 duelli
  firmati · `_q-giudice` 21/21 · `_q-sigillo` 14/14 · `_q-sfida` 54/54 ·
  `_q-ment-nastro` 6/6 · `_q-carattere-nastro` 4/4 · `_q-rosa-scala` 4/4
  · `_q-nastro-tronco` 5/5 · `_q-carta` 22/22.
- `fuori/_sonda-136-codice.js`: il formato. **21 caratteri**, identici
  su 1000 risposte a caso; impacca-e-spacca identita' 1000/1000;
  controllo a quattro simboli **100% esaustivo** su una cifra cambiata
  (24.800) e su due scambiate (5.770), 99,994% su 99.147 mutazioni a
  caso — e le sei fughe sono **tutte** la coppia 11+15, la classe che
  nessun controllo puo' prendere. Con un simbolo solo: 66,06% sulle due
  scambiate.
- `fuori/_sonda-136-save.js`: l'additivita'. Salvataggio vissuto di 37
  chiavi e 1.784 byte; togliendo `div` si perde **zero** sulle altre 36;
  aggiungendo una chiave sconosciuta si perde **zero** e la chiave viene
  ignorata; al primo `persistSave` di una versione vecchia la chiave
  **sparisce** (il prezzo, dichiarato). Venti amici pesano +5.695 byte,
  lo 0,143% del tetto di `localStorage`.
- `fuori/_sonda-136-piega.js`: la schermata CLASSIFICA, tre viste,
  quattro riempimenti, gli amici sopra contro gli amici sotto. Vince
  SOPRA: il primo amico a 114 px su tutte e due le viste orizzontali,
  contro gli 876 px della scelta opposta a classifica di rete piena.
- `fuori/_sonda-136-pannello.js`: **un difetto del gioco spedito**. Il
  pannello della sfida di carta e' alto 542 px su pieghe di 412 e 360, e
  `align-items:center` gli manda la cima a -65 / -91 **senza che nessuno
  scorrimento la raggiunga** (scrollHeight 493 contro 574). Il titolo
  sta a -44: non si legge. Il pannello del cambio telefono (349 px) non
  ha il difetto e non si tocca.

Commit `(voce #136, compito 0)`.

## Compito 1 — il banco che condanna, e i falsi

**Test primo:** `strumenti/_q-amici.js`, che nasce ROSSO perche' nel
gioco non c'e' niente: `window.__test.amici` non esiste.

Quattro gruppi (il dettaglio e' nella spec):

- **A) il codice di risposta** — identita' del giro, lunghezza,
  controllo esaustivo su cinquanta codici, rifiuti, le tre serrature,
  il codice sporcato che passa lo stesso.
- **B) dentro non c'e' nessuno** — due identita' diverse, un codice
  solo, carattere per carattere; le sottostringhe; e leggere una
  risposta non cambia l'identita' di chi legge.
- **C) la classifica si compila e le due si specchiano** — il giro
  intero su due telefoni, il doppione, i tre tetti, il riavvio,
  l'additivita' del salvataggio chiave per chiave, il punteggio proprio
  che un codice non riscrive.
- **D) la schermata e la rete che non c'e'** — la classifica a rete
  spenta, la piega della schermata SFIDA che non si muove, la cima del
  pannello raggiungibile, zero richieste in tutto il giro.

**I sette falsi** (`_crit-amici-identita`, `-nome`, `-doppio`,
`-senzatetto`, `-scordone`, `-credulone`, `-centrato`), ciascuno una
copia del gioco costruita da un attrezzo a ancore che scrive in
`fuori/`. Al compito 1 non si possono ancora provare (non c'e' la cura
da guastare): si scrivono e si provano al compito 2, subito dopo la
cura, e il compito 1 lascia il banco rosso su tutti e quattro i gruppi.

Reti di sicurezza + batteria intera (il gioco non e' stato toccato: e'
la misura che dice che il banco nuovo non ha disturbato nessuno).
Commit `(voce #136, compito 1)`.

## Compito 2 — il codice, il salvataggio, la classifica

`strumenti/_toppa-amici-codice.js`. Tutto quello che non ha schermo:

- `ESITO_VER`, `impaccaEsito(o)` e `spaccaEsito(testo)` — il formato
  della spec, col controllo a quattro simboli e la normalizzazione del
  prefisso;
- la terza serratura dentro `spaccaCarta` (`e-un-risultato`);
- `esitoCarta(ga,gd,ba,bd)` — la regola «prima la differenza, poi i gol
  fatti» estratta da `chiudiSfida` e chiamata da tutte e due le porte;
- `AMICI_TETTO`, `AMICI_SEMI`, `AMICI_MIE` e l'oggetto `Amici`
  (`lista`, `segna`, `ordinata`, `ricordaMia`, `pulisciNome`);
- `SAVE.amici` nel `defaultSave()` e la sua rilettura a whitelist coi
  tre tetti, senza alzare la versione;
- il ramo `S.carta` di `chiudiSfida`: il codice di risposta quando la
  sfida era ricevuta, il ricordo della propria sfida quando era creata;
- `Sfida.segnaCarta()`, le cause in italiano, e
  `window.__test.amici = {...}`, la porta del banco.

I gruppi **A**, **B** e **C** di `_q-amici` diventano verdi. Il gruppo D
resta rosso (non c'e' ancora niente a schermo).

Subito dopo la cura si scrivono e si provano i **sette falsi**: ognuno
dev'essere bocciato dalla sua prova e passare le altre. Un falso che
passa tutto e' un difetto del banco, e si ripara prima di andare avanti.

Reti di sicurezza + batteria intera. Commit `(voce #136, compito 2)`.

## Compito 3 — la schermata, la batteria, il verbale

`strumenti/_toppa-amici-schermata.js`:

- `align-items:flex-start` su `#sfidaCarta` (e solo su quello), con la
  misura accanto;
- la sezione dei testa a testa nella schermata CLASSIFICA, **sopra**
  quella di rete, dipinta **prima** di parlare col server;
- nel pannello: la riga, il campo del nome, il bottone SEGNA IL
  RISULTATO, e `#sfCartaMio` che dopo una sfida ricevuta mostra il
  codice da rimandare;
- il gruppo D di `_q-amici` diventa verde, compresa la misura della
  piega;
- `_q-amici` registrato in `strumenti/tutti.js` con `conta:true` e il
  suo cappello (perche' esiste, che cosa nessun altro cancello vede);
- Batteria INTERA a gruppi, referto trascritto;
- `MANUALE.md` §A, voce #136 in cima al registro;
- `PUNTO-DEL-LAVORO.md`, la riga della giornata.

Commit `(voce #136, compito 3)`.

## Quello che fa fermare il cantiere

- Una rete di sicurezza che si muove di un numero.
- Il gruppo B che non discrimina: se `_crit-amici-identita` passa, il
  banco non protegge niente e il cantiere ha costruito una serratura di
  cartone.
- Le due classifiche che NON si specchiano: se dopo lo stesso giro un
  telefono dice «vinta» e l'altro non dice «persa» sulla stessa partita,
  questa funzione non e' una classifica, e' due conti separati.
- Un salvataggio che perde una chiave: si ferma tutto, perche' li'
  dentro c'e' la squadra di qualcuno.
- Un codice di risposta che non sta in un messaggio.
