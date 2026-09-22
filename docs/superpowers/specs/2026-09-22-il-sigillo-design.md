# Il sigillo (voce #134)

22 settembre 2026. Quarto cantiere dell'onda D, e quello che chiude il
cerchio aperto dalla #130. Le tre voci precedenti hanno costruito il
GIUDIZIO: il metro (#130), il duello dentro al nastro (#131), i cinque
canali che facevano divergere una rigiocata onesta (#132), il giudice coi
cinque verdetti (#133). Resta un fatto scomodo: **nessuno vede niente**.

Il mandato (§10.5) chiede che «la classifica si ripulisce da sola» sia
vero. La #133 lo ha reso *misurabile* — `giudica(nastro, atteso, {seme,
taglia})`, 14 partite oneste su 14 che tornano, zero falsi `NON TORNA`.
Ma fra il giudizio e il giocatore c'e' ancora un muro, e il muro e' alto
due mattoni:

1. **La colonna `verificata` non esce dal database.** Esiste in
   `rete/schema.sql:125` (`int not null default 0`), ha il suo indice
   parziale (`sfida_daverificare`, riga 131), ha un commento che spiega i
   tre valori (righe 98-113). Ma `grep verificata rete/api/` trova **una
   sola occorrenza, dentro a un commento** (`sfida.js`, riga 22: «Lo fa
   un lavoratore periodico, a campione, su `verificata = 0`»). La
   `select` del `GET /api/sfida` e' `id,seme,taglia,gol_a,gol_d,giocata,
   vista,attaccante`: la colonna del verdetto non e' in lista. Il dato
   c'e', il tubo no.
2. **La riga della lista non ha un posto dove dirlo.** `Sfida.dipingi`
   (`CALCETTO-il-gioco.html:43418`) stampa quattro cose per riga: il
   pallino delle non guardate, il nome di chi ha attaccato, una riga
   piccola con `VERDETTO · 5 contro 5 · oggi`, il punteggio e il bottone
   GUARDA. Della verifica, niente — non perche' sia stata scartata, ma
   perche' non e' mai arrivata fin li'.

Il risultato e' che il giudice puo' anche lavorare, e nessuno se ne
accorge. Una pulizia che non si vede non e' una promessa mantenuta: e'
la stessa promessa, scritta piu' in piccolo.

## Che cosa costruisce questo cantiere

Tre cose, in quest'ordine, perche' ognuna poggia sulla precedente.

### (a) Il verdetto viaggia

`GET /api/sfida` restituisce `verificata` insieme al resto della riga.
Una parola in piu' nella `select`, un campo in piu' in una risposta che
gia' esiste: **nessuna tabella nuova, nessun endpoint nuovo, nessuna
query nuova.** E' la scelta piu' piccola che risolve il problema, ed e'
anche l'unica che non tocca RLS: una tabella nuova senza
`enable row level security` + `revoke` sarebbe l'unica porta aperta di
tutto il database (`rete/schema.sql:284-300`), e qui non serve.

**IL FRENO, e una dichiarazione.** La regola di casa e' che ogni endpoint
abbia il suo freno nel database (`frena(k, tetto, secondi)`), perche' le
funzioni Vercel non condividono memoria. Guardato riga per riga: il
`POST /api/sfida` ce l'ha (`'sfida:'+io.id`, 30/60), il `GET
/api/classifica` ce l'ha (`'cla:'+io.id`, 60/60), il `GET /api/sfida`
**non ce l'ha** — ed e' un buco che sta li' da prima di questo cantiere,
non una conseguenza della cura. Siccome questo cantiere quell'endpoint lo
tocca, il freno si mette: `'sfl:'+io.id`, 60 al minuto, gli stessi numeri
del fratello che serve la classifica. Il client ne fa **una** chiamata per
apertura della schermata (`Sfida.aggiorna`), quindi sessanta e' due ordini
di grandezza sopra l'uso vero, e il `429` che ne uscirebbe ha gia' la sua
riga in italiano (`Sfida.perche('troppe')`).

### (b) Il verdetto si vede

La riga della lista porta il sigillo. **Cinque parole, una famiglia sola**
(tutte dal verbo «verificare», cosi' che non si debba imparare un
vocabolario):

| che cosa si sa | la parola | chi la scrive |
|---|---|---|
| `verificata = 0` | `DA VERIFICARE` | il server |
| `verificata = 1` | `VERIFICATA` | il server |
| `verificata = -1` | `NON TORNA` | il server |
| il replay appena guardato torna | `TORNA` | questo telefono |
| il replay non si e' potuto giudicare | `NON VERIFICABILE` | questo telefono |

**Perche' `DA VERIFICARE` e non `DA GUARDARE`** (che e' la parola scritta
nello schema): nella stessa riga ci sono gia' un pallino ambra e un filo
di sinistra acceso che vogliono dire «questa non l'hai ancora guardata»,
e il bottone accanto dice `GUARDA`. Una terza cosa che dice «da guardare»
parlerebbe di un'altra faccenda con le stesse parole.

**Perche' `TORNA` e non `VERIFICATA` quando lo dice il telefono**: sono
due fatti diversi e vanno detti con due parole diverse. «VERIFICATA»
vuol dire *il server l'ha controllata e i conti stanno in piedi*;
«TORNA» vuol dire *il replay che hai appena visto finisce come dice il
tabellone*. Chi difende e' una parte in causa: il suo telefono puo' dire
che cosa ha visto, non puo' timbrare la classifica.

**E infatti non si manda niente indietro.** Il verdetto locale resta
locale, e la ragione e' la stessa del cantiere #132: chi ha subito la
sfida ha un interesse diretto a che quel risultato cada. Un endpoint che
accettasse «il mio telefono dice che il tuo replay non torna» sarebbe una
leva per togliere punti a un innocente, cioe' esattamente il danno che
tutta l'onda D esiste per evitare. Il verdetto che muove punti lo da' il
lavoratore differito, che non ha una squadra in classifica.

**L'AUTORITA' E' DEL SERVER.** Il sigillo locale si vede **solo** quando
il server dice `0` (cioe' «non lo so ancora»). Se il server ha gia'
deciso — `1` o `-1` — resta quello che dice lui: sovrascrivere un `-1`
del giudice differito con un `NON VERIFICABILE` di questo telefono
vorrebbe dire nascondere l'unico verdetto che conta.

**La piega.** Misurato prima di toccare qualunque cosa
(`fuori/_sonda-134-piega.js`, tre viewport, cinque righe finte):

| schermo | CERCA AVVERSARIO | riga | prima riga della lista |
|---|---|---|---|
| 915x412 | 174..220 | 46 px | ~268..314 |
| 800x360 | 174..220 | 46 px | ~268..314 |
| 380x640 | 224..298 | 46 px | ~318..364 |

L'azione primaria sta **sopra** la lista, quindi una riga piu' alta non
la puo' spingere da nessuna parte; il rischio vero e' un'altra cosa, ed
e' il difetto gia' pagato del TORNEO (`CALCETTO-il-gioco.html:2290`, «LE
OTTO SQUADRE SOPRA LA PIEGA»: il tabellone finiva 17 px sotto il piede
opaco dei bottoni e l'ottava squadra spariva). La tentazione di questo
cantiere e' la fascia di riepilogo in cima — «3 da verificare, 1 non
torna» — che spingerebbe la lista sotto la piega a 800x360, dove il
margine e' 46 px. **Non si fa**, e c'e' un cancello che lo impedisce.
Il sigillo e' una seconda riga dentro `.sfchi`, sotto il nome: costa
un'interlinea per riga e niente a chi sta sopra.

### (c) GUARDA verifica mentre mostra

Quando si preme GUARDA, il gioco **gia' rigioca il nastro sul motore
vero** e **gia' confronta** il punteggio uscito con quello dichiarato
(`chiudiSfida`, grep `S.atteso`). E' il lavoro del giudice, fatto con lo
schermo acceso. Quello che manca e' che quel confronto lasci un segno.

**E QUI NON SI SCRIVE UN SECONDO GIUDICE.** E' il punto su cui questo
cantiere puo' sbagliare in modo grave: `Sfida.guarda` e `giudica` fanno
gli stessi nove controlli sul nastro, e oggi li fanno **due volte, in due
posti**. Se la riga della lista dicesse «NON TORNA» in base ai controlli
di `Sfida.guarda` e il lavoratore differito dicesse `INCOMPLETO` in base
a quelli di `giudica`, il gioco si contraddirebbe da solo — e siccome i
due elenchi non sono identici (`Sfida.guarda` ripiega sul profilo di
oggi dove `giudica` si rifiuta, e non guarda lo schermo per niente),
succederebbe *davvero*, non in teoria.

La cura e' **una porta sola**: i nove controlli escono da `giudica` e
diventano `vagliaNastro()`, che le due chiamano tutte e due. Chi vaglia
e' uno; che cosa se ne fa dipende dal chiamante:

| che cosa dice il vaglio | `giudica` | `Sfida.guarda` |
|---|---|---|
| `ALTRO MOTORE` / `motore-diverso` | si ferma | non mostra il film, dice la causa |
| `INCOMPLETO` / `nastro-vuoto` | si ferma | non mostra il film, dice la causa |
| `INCOMPLETO` / `nastro-troncato` | si ferma | non mostra il film, dice la causa |
| `INCOMPLETO` / `duello-marchiato` | si ferma | non mostra il film, dice la causa |
| `INCOMPLETO` / `rose-assenti` | si ferma | **mostra** il film col profilo di oggi |
| `INCOMPLETO` / `carattere-assente` | si ferma | **mostra** il film |
| `INCOMPLETO` / `schermo-ignoto` | si ferma | **mostra** il film |
| `INCOMPLETO` / `schermo-diverso` | si ferma | **mostra** il film |
| niente da dire | rigioca e confronta | mostra il film e, alla fine, confronta |

Le quattro righe in grassetto sono la differenza dichiarata fra un film e
un verdetto, ed era gia' scritta nel commento del giudice: «un film
approssimato costa niente; un verdetto approssimato costa punti a
qualcuno». Il comportamento visibile di `Sfida.guarda` **non cambia di un
carattere**: gli stessi quattro rifiuti di prima, gli stessi messaggi,
gli stessi film mostrati. Cambia soltanto che adesso lascia un sigillo, e
che nei quattro casi tollerati il sigillo dice `NON VERIFICABILE` invece
di `TORNA`/`NON TORNA`.

**Nessun innocente accusato, anche nelle parole.** `NON TORNA` compare
solo sul verdetto `NON TORNA`. Gli altri tre «no» del giudice
(`INCOMPLETO`, `ALTRO MOTORE`, `NON FINISCE`) sono «non lo so» e portano
`NON VERIFICABILE` con la causa vera scritta accanto, nella riga di stato
che gia' esiste. Fra i quattro casi tollerati, `schermo-diverso` e'
quello che in produzione capitera' quasi sempre — due telefoni con lo
stesso schermo sono l'eccezione — e senza questa distinzione la lista
direbbe «NON TORNA» a quasi tutti. La #133 ha misurato esattamente
questo: `800x360` contro `915x412` da' 0-3 dove il tabellone dice 3-4.

## Che cosa NON fa questo cantiere

- **Non scrive il lavoratore differito.** Resta fuori, come dopo la #133:
  quello e' un processo che gira da qualche parte, con un browser senza
  finestra aperto alla misura che il nastro dichiara. Qui si costruisce
  il tubo che porta il suo verdetto fino all'occhio di chi gioca.
- **Non manda verdetti al server.** Vedi sopra: il difensore e' parte in
  causa.
- **Non cambia `MOTORE_V`.** Non si tocca il nastro, non si tocca la
  simulazione: si sposta un blocco di controlli da una funzione a una
  funzione e si aggiunge una riga alla lista. `MOTORE_V` resta **2**, e
  la prova e' che l'impronta del duello resta 44 su 44 e il giudice 21 su
  21 a ogni compito.
- **Non tocca lo schema.** La colonna c'e', i tre valori bastano. La
  rettifica a edizioni della #133 (`schema.sql:100-113`) resta la regola:
  il lavoratore che verra' mappa `INCOMPLETO`/`ALTRO MOTORE`/`NON
  FINISCE` su `0`, mai su `-1`.

## Zero rete all'avvio

Il cancello `senza-rete` (in batteria, `conta:true`) pretende che il
gioco funzioni senza una sola richiesta. La regola gia' pagata: la prima
richiesta parte quando un dito preme SFIDA, non un istante prima. Questo
cantiere non aggiunge nessuna chiamata: legge un campo in piu' da una
risposta che gia' arriva, e dipinge. La schermata continua ad aprirsi
anche a rete spenta, e a dire perche' in una riga (`Sfida.perche`).

## Il banco

`strumenti/_q-sigillo.js`, che nasce ROSSO, e cinque falsi che lo
condannano. Le prove stanno in tre gruppi, uno per ogni pezzo:

- **A) il server.** Si importa `rete/api/sfida.js` **vero** (e' un modulo
  ESM, il banco lo carica con `import()` dinamico) con un `db` finto al
  posto di PostgREST, e si chiama il `GET`. La risposta deve portare
  `verificata` con il valore della riga. Si controlla anche che il freno
  sia stato interrogato.
- **B) la lista.** Tre righe sul server finto con `verificata` 1, -1 e 0:
  la schermata deve mostrare tre parole diverse, e `NON TORNA` deve
  comparire **una volta sola**, sulla riga del `-1`. E l'azione primaria e
  la prima riga della lista devono restare sopra la piega a 800x360.
- **C) GUARDA.** Una sfida vera giocata a due telefoni. Guardata dal
  difensore sullo stesso schermo: `TORNA`. Guardata con il punteggio
  dichiarato gonfiato di un gol: `NON TORNA`. Guardata da uno schermo
  diverso: **mai** `NON TORNA`, ma `NON VERIFICABILE` con la causa. E il
  verdetto della schermata deve coincidere con quello che `__test.giudica`
  da' sullo stesso nastro — la prova che la porta e' una sola.

### I cinque falsi

| falso | che cosa sbaglia | quale prova deve bocciarlo |
|---|---|---|
| `_crit-sigillo-server-sordo.js` | `rete/api/sfida.js` senza `verificata` nella `select` | A |
| `_crit-sigillo-muto.js` | la riga non stampa nessun sigillo | B1 |
| `_crit-sigillo-accusa.js` | dice `NON TORNA` su ogni `verificata != 1` | B2, C3 |
| `_crit-sigillo-fascia.js` | la fascia di riepilogo in cima alla lista | B3 (la piega) |
| `_crit-sigillo-timbro.js` | GUARDA sigilla sempre `TORNA` | C2 |

Un falso che passasse sia con il gioco giusto sia col gioco storto
sarebbe un difetto del banco, non del gioco: in quest'onda tre revisioni
di fila hanno bocciato prove troppo gentili. Ogni falso deve **passare**
le prove di forma e **cadere** su quella di sostanza.

## Le reti di sicurezza

A ogni compito, tutte e sei:

- `_q-duello-impronta.js` — 44 su 44 (misurato prima di toccare: verde);
- `_q-giudice.js` — 21 su 21 (misurato: verde). E' la rete che sorveglia
  l'estrazione di `vagliaNastro`: se il vaglio cambia di un
  comportamento, il giudice se ne accorge;
- `_q-ment-nastro` 6/6, `_q-carattere-nastro` 4/4, `_q-rosa-scala` 4/4,
  `_q-nastro-tronco` 5/5 (misurati: verdi);
- `_q-rete` e `_q-sfida`, in batteria dalla #130;
- `senza-rete`, per la regola dell'avvio.

E la batteria INTERA a ogni compito, a gruppi (lezione 22).
