# Voce #149 — LA CURA DELLA REVISIONE D'INSIEME

**Data**: 24 settembre 2026 · **merge-base**: `b87f512` · **ramo**: `voce-149-cura-revisione`

La revisione d'insieme dell'ONDA E ha dato **«NON CHIUSA ONESTAMENTE: NO»**.
Questo cantiere non aggiunge gioco: cura i rilievi. È una passata
correttiva, e le passate correttive rendono più di quelle creative.

---

## 1. IL CRITICO — una serie onesta si fa accusare in tre modi

Il revisore ha costruito un banco a due telefoni veri (serie onesta 2-1,
seme 1561173679, nastro 1068 caratteri) e ha giudicato **lo stesso nastro**
cambiando **una cosa alla volta**. Tre casi danno **NON TORNA a un onesto**:

| # | che cosa si cambia | verdetto misurato |
|---|---|---|
| 7 | SOLO la riga 15 tolta, le 14 restano | NON TORNA, rigiocato [1,3] in 7839 passi |
| 8 | la 15 **e** tutte le 14 tolte (il residuo) | NON TORNA, rigiocato [1,3] in 7839 passi |
| 10b | il bit «chi ha tirato per primo» capovolto | NON TORNA, rigiocato [1,2] in 646 passi |

### 1.1 La causa, in codice

`CALCETTO-il-gioco.html:46782-46790` — la guardia delle testimonianze è **a
senso unico**:

```js
if(disco || testi.size){ let buone = testi.size > 0; … if(!buone) return no('INCOMPLETO','testimonianze-assenti'); }
```

Pretende `15 ⇒ le 14 complete`. **Non pretende mai `le 14 ⇒ la 15`.** Tolta
la sola 15, `disco` è `null`, `giudica` (`:47081`) non chiama
`avviaRigori()`, rigioca novanta secondi di calcio e confronta `G.score`
(che dopo una serie vale 1-0) col punteggio dei rigori.

### 1.2 Lo standard violato è quello di casa

Il **#133** (`schermo-ignoto`) e il **#142** (`motore-js-ignoto`) hanno
scritto due volte la stessa frase: *un nastro senza quella riga non si può
sapere; procedere alla cieca produce accuse false in una sola direzione,
quindi **ci si astiene***. Per la riga 15 si procede alla cieca. Non è un
difetto nuovo: è una regola già pagata e non applicata.

### 1.3 La cura, in quattro pezzi

**(a) La guardia nei due versi.** In `vagliaNastro`, accanto alle altre:

```js
if(testi.size && !disco) return no('INCOMPLETO','dischetto-assente');
```

Prende il caso 7. È la stessa forma delle altre astensioni: INCOMPLETO non
muove punti.

**(b) `disco.v` contro `DISCHETTO_V`.** Oggi la versione del protocollo è
**scritta e mai letta in differita**: `:47888` la definisce, `:48147` la
scrive, `:48647` la controlla **solo dal vivo**. Misurato dal revisore: un
nastro con `v=2` dà **TORNA**. Un nastro di un protocollo che non
conosciamo va trattato come un motore che non conosciamo — `ALTRO MOTORE`
non è il verdetto giusto (il motore è lo stesso), l'astensione sì:
`INCOMPLETO/dischetto-versione`.

**(c) Il residuo (caso 8), e la forma che lo chiude davvero.** Tolte 15 e
14, `testi.size` è 0 e `disco` è `null`: la guardia (a) non può vedere
niente. Il commento del #147 lo dichiarava «indistinguibile da una partita
normale» e chiudeva con «chiuderlo vorrebbe dire FIRMARE la 15».

**La dichiarazione era vera per l'identificazione e falsa per
l'astensione.** Il nastro resta distinguibile per una proprietà che non
dipende da nessuna firma: **porta comandi di duello (tipo 6) che la
rigiocata non raccoglie mai**. `Reg.duelli` / `Reg.iDuello` esistono già, e
il giudice ha già la metà gemella di questo controllo: `duello-senza-righe`
(`:24464`, `:47132`) si alza quando **si apre un duello e il nastro non ha
righe**. Manca l'altra metà: **il nastro ha righe e non si apre mai il
duello che le consumi**.

Si aggiunge `INCOMPLETO/duelli-mai-letti`. Non è una guardia del dischetto:
è una guardia del *giudice*, e vale per qualunque nastro. Prende il caso 8
senza sapere niente del dischetto — ed è la ragione per cui è la forma
giusta.

> **RETTIFICA A EDIZIONI (24 settembre 2026, in corso di cantiere).** La
> prima stesura diceva «se avanza anche un comando solo, astieniti», ed è
> stata **bocciata da una rete di sicurezza**: `_q-staffetta` B1 pretende
> `NON TORNA` sul nastro di una sfida vera giudicato col **seme sbagliato**,
> e la forma larga lo trasformava in un'astensione — cioè rovesciava una
> decisione del #133 senza una misura che la giustificasse.
> **MISURATO** (`strumenti/_sonda-149-duelli.js`): sfida congelata col seme
> sbagliato **4 comandi avanzati su 6**; serie dal dischetto, il residuo,
> **12 su 12**; nastri onesti **0 su 6 e 0 su 12**; punteggio gonfiato di uno
> **0 su 6, e resta NON TORNA**. I due casi sono **diversi in natura**: con
> qualche comando letto la rigiocata era entrata nel nastro e poi ne è
> uscita (una divergenza, e il giudice ha già due risposte per quella); con
> **nessun** comando letto non è mai entrata. La soglia diventa «nemmeno
> uno». **Resta aperta**, col numero accanto, la domanda se un nastro che
> diverge a metà meriti un'accusa o un'astensione: questo cantiere non ha la
> misura per rispondere e non la inventa.

**(d) Il bit `primo` (caso 10b).** Il #148 ha deciso apposta di **non**
ri-dedurre `primo` dentro `giudica`, per non fare una seconda copia della
regola del sorteggio: *«il giorno in cui il dischetto la cambiasse i nastri
vecchi verrebbero rigiocati storti in silenzio»*. **La ragione era buona, e
il prezzo accettato era un'accusa.**

La forma che astiene **senza duplicare la regola** è una **porta sola**, che
è il modo di casa (`vagliaNastro`, `improntaDelNastro`, `schermiDelNastro`,
`Reg.carta`): si estrae `dsPrimoDalSeme(seme)` — *l'unico* posto in cui la
regola vive — e la chiamano **tutti e due** i capi: `chiudiAppuntamento`
(che oggi scrive `S.primo = (S.seme & 1) ? 'b' : 'a'`) e il giudice.

Il giudice **non la usa per decidere chi tira**: continua a leggere la riga
15, come il #148 ha stabilito. La usa solo per un **riscontro**: se il
nastro dice una cosa e il seme ne dice un'altra, **non si sa quale delle due
menta**, e si scrive `INCOMPLETO/dischetto-primo-incoerente`. Il giorno in
cui il sorteggio cambiasse, i nastri vecchi non verrebbero rigiocati storti:
si asterrebbero, che è esattamente il comportamento che il #148 voleva
proteggere.

**(e) Il `catch` muto.** `try{ Reg.scrivi(15, …) }catch(e){}` (`:48147`)
ingoia in silenzio il fallimento della scrittura: il gioco può produrre da
solo il nastro che poi si accusa. Con (a) e (c) in piedi l'esito di quel
fallimento non è più un'accusa ma un'astensione — ma il silenzio resta un
difetto, e va **dichiarato** accanto alla riga.

### 1.4 Il banco

Tre prove nuove nel **gruppo B** di `_q-nastro-differito` (B5, B6, B7), più
il **falso che condanna una cura pigra**: una cura che si limitasse alla
riga (a) lascerebbe verdi 8 e 10b, e il banco deve dirlo.

---

## 2. I due banchi che attestano invece di misurare

**`_q-nastro-tronco.js:110` è verde per il motivo sbagliato.** Usa il nastro
finto `'1|2||'` per provare che «un nastro VUOTO non passa per buono», ma a
respingerlo è `motoreV !== MOTORE_V` (il `2` in testa), non la guardia del
nastro vuoto. Se quella guardia sparisse la prova resterebbe verde. Cura:
leggere `MOTORE_V` dal file (come `_t-143-motorev.js:177`) e pretendere la
**causa** `nastro-vuoto`.

**`_q-dischetto` E1 attesta il freno.** Conta le richieste pedalando
`battito()` a mano e moltiplica per `DISCHETTO_SEC_TIRO = 10`, che nel gioco
non scandisce niente. Sulla guida vera (`ritmo()` a 900 ms, `:48439`;
`giro()` ritira in ogni fase, `:48167`) la punta è **76-77 richieste/min per
identità** contro un tetto di 60, non le 33-36 verbalizzate. Il gioco
degrada bene (429 → 2200 ms) e il danno d'uso è nullo — **ma tre
affermazioni sono false come sono scritte**. Il metro giusto
(`puntaAlMinuto()`) esiste già inutilizzato in
`_dischetto-due-telefoni.js:258`.

---

## 3. Il seme «a due mani» non è protetto dal protocollo

`:48641-48652`: il nonce del saluto viaggia in chiaro, e chi entra per
secondo può sceglierselo per vincere il bit `primo` — **misurato 10 su 10**
col pari finto. L'arma esiste già
(`_dischetto-due-telefoni.js:406-428`, col commento «il banco deve
accorgersene») e **nessun cancello la mette in campo**. Questo cantiere la
mette in campo. La cura del protocollo (impegno sul nonce, lo stesso schema
in due tempi del #146) **si valuta e si dichiara**: se non si fa ora, è un
**difetto aperto con la misura accanto**, non una nota.

---

## 4. Le rettifiche documentali

Due affermazioni **false** nei verbali, mai rettificate:

1. `MANUALE.md:1313-1314` (#146) e la gemella a `:912` (#147): «il punteggio
   rigiocherebbe comunque giusto …, quindi nessun innocente viene accusato».
   **Il caso 7 la smentisce.** Il #148 ha rettificato la frase gemella a
   `:1015-1026` e ha lasciato in piedi queste due.
2. `MANUALE.md:2142-2145` (#143): «`istantanea` è rossa anche sul gioco di
   `main` (45 quote su 56 contro le 42 del curato): non è il #143».
   **Quarantacinque contro quarantadue è la prova A FAVORE
   dell'attribuzione.** Da lì 42/56 è diventata la base. Si **rimisura** su
   tre versioni (oggi, `b87f512`, `a2607d0`) e si scrive il numero vero.

E la **dichiarazione al committente**: la sostituzione del live 1v1 con la
serie di rigori è dichiarata onestamente **in una copia sola**
(`docs/superpowers/specs/2026-09-23-onda-e-architettura.md:267`). Non
compare in `MANUALE.md`, non in `PUNTO-DEL-LAVORO.md`, non nei verbali
#146/#147/#148 — che invece dicono tre volte «ONDA E CHIUSA», e nel
vocabolario agli atti «onda E» **significa** «live 1v1»
(`_analisi/MAPPA-MANDATO.md:792`). La rettifica va scritta **a edizioni** in
tutti e tre i posti, con l'elenco di ciò che il committente **non** ha
ricevuto.

Gli altri rilievi (numeri divergenti, etichetta p95/p99, endpoint, i «409
casi», il §j del #146, i limiti scritti nel posto sbagliato, i minori) sono
nel piano, uno per riga.

---

## 5. Che cosa NON fa questo cantiere

- Non costruisce il live 1v1, né il lockstep, né il server autoritativo.
  Li **dichiara mancanti**.
- Non pubblica il nastro, non accende nessuna rete.
- Non chiede il committente (la SOGLIA-UMANA e il collaudo umano del
  pannello restano **non eseguiti**, e questa volta scritti dove si leggono).

## 6. Le invarianti che reggono la cura

- Ogni cura ha prima un test che **nasce rosso**.
- Il giudice **si astiene, non accusa**: ogni riga nuova è un INCOMPLETO.
- `MOTORE_V` sale se la cura cambia il verdetto che un altro telefono darebbe
  sullo stesso nastro (criterio allargato dal #148). **Va misurato, non
  supposto.**
- Rettifiche **a edizioni**: il testo vecchio non si cancella.
