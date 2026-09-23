# PIANO — LA SFIDA DAL DISCHETTO (voce #146)

Spec: `docs/superpowers/specs/2026-09-24-sfida-dal-dischetto-design.md`.
Merge-base `5038eee`. Ramo `voce-146-sfida-dal-dischetto`. Cinque compiti,
cinque commit.

**Regole che valgono a ogni compito, senza ripeterle sotto:**
- la **batteria INTERA** si rilancia a ogni compito, a gruppi con `--solo`
  (lezione 22: cinque regressioni nel programma trovate solo così);
- il gioco si tocca **solo** con `strumenti/_toppa-146-*.js` a ancore, mai a
  mano;
- ogni cosa nuova ha prima un test che **nasce rosso**;
- ogni cancello nuovo legge `--gioco` **da sé**, o la batteria lo esclude in
  silenzio da una misura mirata;
- commenti nel codice **senza lettere accentate**.

---

## C0 — spec e piano *(questo commit)*

- [x] `specs/2026-09-24-sfida-dal-dischetto-design.md` — la forma del gioco, il
      trasporto scelto col perché, il disegno della fiducia, i falsi previsti,
      i limiti, e le cinque cose che si rifiuta di scrivere.
- [x] `plans/2026-09-24-sfida-dal-dischetto.md` — questo.
- [x] **Una rettifica pagata prima di cominciare**: «`senza-rete` pretende che
      la prima richiesta parta al tocco su SFIDA» è falso. Il banco giusto è
      `_q-carta.js` D5, e conta **il delta dopo l'apertura**, non il totale.

---

## C1 — il banco che condanna, e i falsi

Nasce **rosso**, perché nel gioco non c'è ancora niente.

1. `strumenti/_dischetto-due-telefoni.js` — l'impianto. Riusa
   `serviGioco`/`apri`/`collega` da `_sfida-due-telefoni.js` (non si
   reinventa: «un rosso qui e un rosso lì devono voler dire la stessa cosa»)
   e aggiunge:
   - **la cassetta finta**: `/api/dischetto`, indicizzata, a scrittura sola
     una volta per `(stanza, tiro, ruolo, tipo)`, col freno `(60, 60)`;
   - **l'iniezione dei guasti**: `perdiRitiro`, `perdiImbuco`, `rispondi429`,
     `spegni` — perché C4 misuri e non racconti;
   - **il contatore delle richieste** per identità e per minuto, che è la
     misura del §2.4 della spec;
   - `FiloDiretto` finto (in-processo, ritardo zero) per la prova della
     cucitura.
2. `strumenti/_q-dischetto.js` — il cancello. Gruppi:
   - **A) l'appuntamento**: due telefoni, un codice corto, stesso seme, stessa
     rosa vista dai due lati, chi tira per primo non lo sceglie nessuno;
   - **B) la simultaneità**: chi parla per secondo **non** vince. È la prova
     centrale, e senza di lei il cantiere non esiste;
   - **C) la serie**: cinque tiri per parte, punteggio uguale sui due telefoni,
     tiro per tiro;
   - **D) la cucitura**: stesso copione su `FiloCassetta` e `FiloDiretto` →
     stesso esito;
   - **E) i freni**: richieste al minuto misurate contro il tetto di 60;
   - **F) zero rete**: tacca dopo l'apertura della schermata, delta zero fino
     al tocco (l'idioma di `_q-carta.js` D5).
3. I sette falsi di §6.2 della spec, in `strumenti/_crit-dischetto-*.js`,
   **costruiti per vincere**. E la ricerca dell'**ottavo**: il falso che il
   banco **non** morde, cercato apposta e dichiarato.

**Uscita del compito:** il banco stampa la bite list e esce **1** (rosso) sul
gioco di oggi, con la causa scritta: «il gioco non ha la sfida dal dischetto».

---

## C2 — l'appuntamento

1. `strumenti/_toppa-146-appuntamento.js`:
   - `DISCHETTO_V = 1`, la stanza di sei caratteri su `CARTA_ALF`, il nonce
     d'appuntamento, `mescola(nA, nB)` per seme e primo tiratore, taglia
     fissata a **5**;
   - `Filo` coi quattro verbi, e `FiloCassetta` come unica implementazione;
   - `Rete.dischetto*` che passa dalla porta unica `Rete.chiama` (`:47095`),
     quindi eredita tetto di tempo, `credentials:'omit'` e
     `Authorization: Calcetto <id>.<segreto>` — **nessuna chiave nuova**;
   - la schermata: SFIDA → **SFIDA DAL DISCHETTO** → CREA / ENTRA, accanto a
     SFIDA DI CARTA;
   - `window.__test.dischetto` per pilotare il tutto dal banco.
2. `rete/api/dischetto.js` — la cassetta vera: `frenato('dis:'+io.id, 60, 60)`
   (**gli stessi numeri del fratello più largo, nessun privilegio**), imbuco
   idempotente, ritiro «tutto dopo k».
3. `rete/schema.sql` — la tabella `cassetta` e la sua `revoke`, come tutte.
4. `rete/prove/tutte.js` — i casi puri della cassetta (indice, idempotenza,
   rifiuto del secondo imbuco diverso).

**Verde atteso:** gruppo A del banco. B/C/D restano rossi.

---

## C3 — lo scambio in diretta e la fiducia

1. `strumenti/_toppa-146-impegno.js`:
   - **SHA-256 inline** (il gioco è autosufficiente: zero dipendenze, zero
     rete) e `impegnoDi(T, ruolo, mossa, nonce)` troncato a 128 bit;
   - il giro a quattro messaggi: impegno → attesa → rivelazione → verifica;
   - `seme_T = mescola(n_A, n_B)`, e le tre porte del `Duel` chiamate con gli
     stessi valori sui due telefoni;
   - **l'esito dichiarato** a ogni tiro, e la fermata per astensione se i due
     non coincidono;
   - la **riga di nastro di tipo 14**, la testimonianza.
2. `strumenti/_t-146-motorev.js` — **la misura nei due versi**, come il #144:
   - verso 1: nastri del merge-base rigiocati sul curato;
   - verso 2: nastri del curato (con le righe 14) rigiocati sul gioco di ieri.
   **È questa misura a decidere se `MOTORE_V` resta 4 o sale a 5**, non il
   piano. Se sale, la toppa del numero e la rettifica a edizioni entrano qui.
3. Il giudice: `vagliaNastro` pretende che le righe 14 ricompongano; un
   impegno che non torna è **NON TORNA**, tutto il resto è astensione.

**Verde atteso:** gruppi B, C, D. Tutti i falsi morsi, tranne l'ottavo
dichiarato.

---

## C4 — il guasto, la batteria, il verbale

1. `strumenti/_toppa-146-guasto.js`: le quattro risposte di §5 della spec —
   l'attesa dichiarata, l'incompiuta a zero punti, il ritentativo
   idempotente, l'attesa che si allarga su 429/503 senza fermare un
   fotogramma.
2. Gruppo **G) il guasto** in `_q-dischetto.js`: i quattro guasti iniettati, e
   per ognuno **che cosa vede chi resta**.
3. `strumenti/tutti.js`: la riga
   `{ nome: 'dischetto', cmd: ['strumenti/_q-dischetto.js'], conta: true, lento: true },`
4. **La batteria intera**, a gruppi, più `--ripetuto 3` sui banchi a tocchi
   reali (non sono ripetibili: un solo rosso non è una prova).
5. `MANUALE.md` §A — il verbale della voce #146, in cima.
6. `PUNTO-DEL-LAVORO.md` — la riga della giornata.

---

## DOVE MI FERMO E RIFERISCO INVECE DI CHIUDERE

Il verdetto vero vale più di un cantiere che sembra chiuso. Mi fermo e
riferisco, senza inventare un ripiego, se:

- **la simultaneità non regge** — se il gruppo B non riesce a condannare il
  veggente, non c'è sfida onesta e non serve il resto;
- **il conto dei freni sfora** e l'unico modo di rientrare è alzare il tetto
  di un endpoint: sarebbe un privilegio, e va deciso dal committente;
- **il verso 2 di `MOTORE_V` dà un risultato che non so spiegare**: un numero
  con la dispersione fuori soglia non si trascrive da nessuna parte;
- **un falso non viene morso** e la cura richiederebbe di cambiare il banco
  invece del gioco — sarebbe uno strumento che attesta.
