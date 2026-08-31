# I pagamenti — come si costruiscono senza gradle, e cosa non si può ancora provare

Scritto il 27 agosto 2026. Tre file in questa cartella:

| file | cos'è |
|---|---|
| `ponte.js` | il lato JavaScript: il listino, le probabilità, i tetti, la coda degli acquisti, e due realizzazioni (`finta` e `googlePlay`) dietro la stessa interfaccia |
| `Pagamenti.java` | il ponte verso Google Play Billing, esposto alla WebView |
| `LEGGIMI.md` | questo |

Il progetto sta in `_analisi/ECONOMIA.md`. Il banco che verifica l'aritmetica
sta in `rete/prove/economia.js` e gira con `node`, senza rete e senza telefono:
**86 controlli, 86 passati** all'ultima corsa.

---

## 1. Prima di tutto: cosa cambia nell'APK

Aggiungere la fatturazione non è aggiungere un file. Cambia tre numeri che
questo progetto usa come vanto, e vanno cambiati sapendolo.

**Il permesso.** Serve `com.android.vending.BILLING`. Da quel momento la riga
«zero permessi Android, contro i 19 di FC Mobile» diventa «un permesso, e si
chiama BILLING». È un permesso *normale*, non uno pericoloso: non compare un
riquadro di richiesta e non dà accesso a niente del telefono. Ma il conto passa
da 0 a 1 e va scritto così, non nascosto.

**Il controllo che diventa rosso.** `android/verifica.py`, riga 81:

```python
permessi = [r for r in badging.splitlines() if r.startswith('uses-permission')]
dice(not permessi, 'nessun permesso richiesto  %s' % (permessi or ''))
```

Questo controllo fallirà. **Non si toglie**: si trasforma in una lista bianca,
cioè si passa da «nessun permesso» a «esattamente questo permesso e nessun
altro», che è un controllo più forte e non più debole. Il giorno in cui la
libreria di Play si porta dietro un permesso che nessuno ha chiesto, il
controllo lo trova.

**Il peso.** L'APK di CALCETTO misura 717.654 byte, con 12 voci zip e nessuna
libreria di terzi. Il `classes.jar` della libreria di fatturazione, una volta
dexato, aggiunge qualcosa: **quanto, va misurato e non stimato**, con
`unzip -l` sull'APK prima e dopo. Non ho un numero da scrivere qui perché non
ho costruito l'APK con la libreria dentro (vedi la sezione 6).

**La conseguenza, e la raccomandazione.** `costruisci.py` dovrebbe produrre
**due** pacchetti dallo stesso sorgente:

- `CALCETTO.apk` — quello di oggi, zero permessi, zero librerie, per chi lo
  riceve da un amico. Il negozio funziona a monete e il bottone in euro non
  c'è. `ponte.js` con la realizzazione `finta` fa esattamente questo.
- `CALCETTO-play.apk` — con `Pagamenti.java`, la libreria e il permesso.

Costa una voce in più nella lista `APP` di `costruisci.py` e un `if` attorno a
`javac`. In cambio la frase «zero permessi» resta vera per la versione di cui è
vera.

---

## 2. Da dove si prende la libreria

Google la pubblica come AAR sul suo Maven. Non serve gradle per scaricarla:
serve un URL.

```sh
V=7.1.1
BASE=https://dl.google.com/dl/android/maven2/com/android/billingclient/billing/$V
curl -fL -o billing-$V.aar  $BASE/billing-$V.aar
curl -fL -o billing-$V.pom  $BASE/billing-$V.pom
```

**Quale versione.** Play impone una versione minima della libreria e la alza
ogni anno. Il numero **7.1.1** non è inventato: è quello che FC Mobile v27.0.04
dichiara nel proprio manifest
(`com.google.android.play.billingclient.version=7.1.1`, letto nel pacchetto,
`fcm-estratto/manifest.txt`). Prima di pubblicare **va verificata la soglia
corrente** sulla pagina di Play, perché una libreria sotto soglia fa rifiutare
il caricamento, non l'acquisto — cioè si scopre tardi.

**Attenzione all'API se si sale alla 8.x**: `queryProductDetailsAsync` ha
cambiato la forma della risposta (da `List<ProductDetails>` a un oggetto
`QueryProductDetailsResult`). In `Pagamenti.java` è una riga sola, la
richiamata `PagamentiSchede`, ma è una riga che non compila da sola.

**Il POM va letto**, non archiviato: dichiara le dipendenze. Nella 7.x sono
annotazioni `androidx.annotation` (a ritenzione `CLASS`, quindi non servono a
runtime) e poco altro; tutto il resto la libreria se lo porta dentro. Se `d8`
si lamenta di classi mancanti, la cura è scaricare anche quelle dallo stesso
Maven, con lo stesso metodo. **Non fidarsi di questa frase: leggere l'uscita di
`d8`.**

**Il file va inventariato.** `NOTICE` esiste perché «un gioco che si vuole
vendere deve poter dire in cinque minuti di chi è ogni suo byte». La libreria
di fatturazione è materiale di terzi (Google, Apache 2.0): va aggiunta lì, con
versione, sha256 e la data in cui è stata scaricata. Ed è anche la ragione per
cui l'AAR **si tiene nel deposito** invece di riscaricarlo a ogni build: la
catena di costruzione di questo progetto non tocca la rete, e non deve
cominciare adesso.

---

## 3. Aprire l'AAR

Un AAR è uno zip. Dentro c'è quello che gradle di solito nasconde.

```sh
mkdir -p billing && cd billing && unzip -o ../billing-$V.aar && cd ..
ls -la billing/
#  AndroidManifest.xml   ← va fuso a mano nel nostro (sezione 4)
#  classes.jar           ← il codice: va a javac e a d8
#  res/                  ← se non è vuota, va compilata (sezione 5)
#  proguard.txt          ← non ci serve: questa catena non offusca
#  R.txt                 ← utile solo se c'è res/
```

Guardare davvero cosa c'è dentro `res/`. Se è vuota o contiene solo file
`values` senza identificatori pubblici, la sezione 5 non serve. Se contiene
qualcosa, serve, e saltarla dà un `NoSuchFieldError` a runtime che sembra un
guasto della libreria e non lo è.

---

## 4. Il manifest, che senza gradle si fonde a mano

Questo è il passo che gradle fa in silenzio e che qui va fatto guardando.

```sh
# il manifest dentro l'AAR è già in chiaro (non è compilato)
cat billing/AndroidManifest.xml
```

Nel `MANIFEST` dentro `costruisci.py` vanno riportati, **verbatim**:

- ogni `<activity>` dichiarato dall'AAR — nella 7.x sono
  `com.android.billingclient.api.ProxyBillingActivity` e
  `ProxyBillingActivityV2`. Sono le finestre che Play apre sopra la nostra: se
  mancano, `launchBillingFlow` fallisce con un codice che non spiega niente;
- ogni `<service>`, `<provider>` e `<queries>` che l'AAR dichiari. Da Android
  11 la visibilità dei pacchetti è ristretta e un `<queries>` mancante fa
  sembrare Play «non installato» su un telefono dove Play c'è;
- il permesso, che va aggiunto da noi:

```xml
<uses-permission android:name="com.android.vending.BILLING" />
```

E si tolgono le due righe di commento che oggi dicono «Nessun permesso», perché
diventerebbero false.

**Verificare che sia servito a qualcosa**, sul pacchetto finito e non sul
sorgente:

```sh
aapt2 dump permissions apk/CALCETTO-play.apk
aapt2 dump xmltree --file AndroidManifest.xml apk/CALCETTO-play.apk | grep -i proxybilling
```

Se `INTERNET` compare in quell'elenco senza che nessuno l'abbia scritto, viene
dall'AAR e va dichiarato: la fatturazione passa dall'app di Play via binder e
non dovrebbe averne bisogno, ma «non dovrebbe» non è una misura.

---

## 5. Le risorse, se ce ne sono

Solo se `billing/res/` non è vuota.

```sh
aapt2 compile --dir billing/res -o billing-res.zip

aapt2 link -o base.apk -I $ANDROID_JAR \
  --manifest lavoro/AndroidManifest.xml \
  --min-sdk-version 24 --target-sdk-version 34 --no-version-vectors \
  --java lavoro/gen \
  --extra-packages com.android.billingclient.api \
  res.zip billing-res.zip
```

`--java` genera le `R.java` (la nostra e quella della libreria);
`--extra-packages` dice ad aapt2 di generarne una anche per il pacchetto della
libreria, che è il pezzo che gradle fa da solo. Le `R.java` generate vanno
aggiunte all'invocazione di `javac`.

---

## 6. Compilare e dexare

Rispetto a `costruisci.py` di oggi cambiano tre comandi.

```sh
BJ=billing/classes.jar

# javac: il jar della libreria entra nel classpath, e il file dei pagamenti
#        nell'elenco dei sorgenti (con le R.java generate, se ci sono)
javac -nowarn -source 8 -target 8 \
  -bootclasspath $ANDROID_JAR \
  -classpath "$ANDROID_JAR:$BJ" \
  -d lavoro/classi \
  android/Gioco.java android/pagamenti/Pagamenti.java

# d8: si dexa il NOSTRO codice E il jar della libreria, in un colpo solo
d8 --lib $ANDROID_JAR --min-api 24 --output lavoro \
   $(find lavoro/classi -name '*.class') $BJ
```

Su Windows il separatore del classpath è `;` e non `:` — e `costruisci.py` usa
già percorsi con `/`, quindi basta cambiare il separatore.

`d8` accetta un `.jar` accanto ai `.class`: non serve estrarlo. Il risultato
resta un `classes.dex` solo — la libreria è dell'ordine di poche migliaia di
metodi e il tetto è 65.536 — ma **si guarda**, non si presume: se `d8` produce
`classes2.dex`, va aggiunto allo zip in `costruisci.py`, che oggi ne scrive uno
solo (riga 219).

### La trappola di d8, e perché `Pagamenti.java` è scritto in quel modo

`d8` delle build-tools 34 (R8 8.2.2) si rompe sui `.class` prodotti da javac
recente quando la classe porta attributi generici: **classi anonime** e
**classi che implementano un'interfaccia parametrica**. L'errore è
`NullPointerException: Cannot invoke "String.length()" because "<parameter1>"
is null`, e non dice altro. È già costato tempo a questo progetto.

Per questo `Pagamenti.java` non ha una sola classe anonima, non ha lambda, e
tutte le richiamate sono **classi di primo livello** con parametri a **tipi
grezzi** (`List` e non `List<Purchase>`). `javac` emette avvisi di *unchecked*:
sono voluti, e `-nowarn` li tiene zitti. Se un giorno qualcuno «ripulisce» quei
tipi rimettendo i parametri, la build si rompe con un errore che non parla di
generici.

---

## 7. Attaccare il ponte

Due righe in `Gioco.java`, dopo aver creato la vista e prima di caricare il
gioco:

```java
Pagamenti.collega(this, vista);        // in onCreate, dopo new WebView(this)
Pagamenti.riprendi();                  // in onResume
Pagamenti.stacca();                    // in onDestroy
```

`riprendi()` in `onResume` non è una cortesia: è la **riconciliazione**. Un
acquisto fatto ieri, o fatto mentre l'app era in sottofondo, si consegna lì.

Dal lato pagina, `ponte.js` va incluso prima del gioco e agganciato una volta:

```js
Pagamenti.usaQuelloCheCe({
  accredita(sku, gettone) {
    /* SINCRONA, e deve salvare prima di tornare. È l'unico punto in cui
       il denaro tocca il salvataggio. */
  }
});
Pagamenti.riconcilia();
```

Se il ponte Java non c'è (APK fuori da Play, oppure il gioco aperto in un
browser sul computer), `usaQuelloCheCe` sceglie la `finta` e tutto continua a
funzionare: negozio a monete aperto, bottone in euro assente.

---

## 8. Quello che NON si può provare oggi, e perché

Questa sezione è la ragione per cui il file esiste. Il committente **non ha
comprato l'account sviluppatore Google (25 $, una volta)**, e senza quello una
parte di questo lavoro resta scritta e non misurata.

**Non si può provare niente che riguardi un acquisto vero.** Senza Play Console
non esistono i prodotti: i sette codici in `Pagamenti.CODICI` non sono
registrati da nessuna parte, quindi `queryProductDetailsAsync` torna una lista
vuota e `elenco()` restituisce tutti e sette con `noto: false`. Non è un
guasto: è l'unica risposta possibile.

**Non esistono più i codici di prova statici.** Le vecchie sigle
`android.test.purchased` e compagnia sono state tolte dalla libreria dalla
versione 3: non c'è un modo «finto ma vero» di far girare un pagamento in
locale. O c'è la Console, o non c'è.

**E anche con la Console, non basta.** Perché un acquisto parta servono, tutti
insieme: il prodotto creato e *attivo* nella Console; l'APK caricato almeno su
una traccia di prova interna; l'APK **firmato con la chiave di rilascio**, non
con `android/chiave.jks` (alias `collaudo`, password `collaudo`, che è una
chiave da banco e va bene per quello); il conto Google del collaudatore
iscritto ai *licence testers*; e l'app installata **da Play**, non trasferita
con `adb install`. Un APK trasferito a mano vede sempre zero prodotti, anche se
tutto il resto è a posto. È la prima cosa che fa perdere un pomeriggio.

**Non si può misurare il peso.** Il numero della sezione 1 manca perché la
libreria non è stata scaricata né dexata: non ho voluto scrivere una stima
accanto a misure vere.

**Non si può osservare il rimborso d'ufficio.** Google rimborsa dopo tre giorni
un acquisto non riconosciuto. Verificare che la nostra coda arrivi prima
richiede tre giorni di calendario e un acquisto vero.

**Non si può provare il paese di fatturazione.** `getBillingConfigAsync`
risponde con il Paese del conto Play: per vedere `BE` o `NL` serve un conto con
indirizzo di fatturazione lì. La *regola* che ne dipende — senza paese si
mostra la bacheca — è invece provata dal banco, perché è aritmetica e non rete.

### Quello che invece si può provare oggi, e conviene farlo subito

- **Tutta l'aritmetica**: `node rete/prove/economia.js`. 86 controlli: listino,
  cambio, ore, scala dei campi, probabilità, garanzia, tetti, coda degli
  acquisti, comportamento senza rete. Zero dipendenze, zero rete, un secondo.
- **Che `Pagamenti.java` compili e si dexi.** È un cancello vero: è lì che la
  trappola di d8 si presenta, ed è meglio scoprirla adesso che il giorno del
  caricamento.
- **Il cammino dell'assenza, sul telefono vero.** Un APK con la libreria dentro,
  trasferito con `adb install` su un telefono senza il prodotto pubblicato, è
  *esattamente* il caso «Play non ha niente da vendere». Deve succedere questo:
  il gioco parte come sempre, il negozio a monete funziona, il bottone in euro
  è spento con la sua riga, e in `adb logcat -s GiocoPag` si legge quale codice
  Play non ha riconosciuto. Se invece compare una rotella che gira o un
  riquadro d'errore, il ponte è sbagliato — e questo si scopre senza spendere
  25 $.
- **Che il gioco non si accorga di niente.** Con `ponte.js` in `finta`, i banchi
  del gioco (`strumenti/`) devono restare identici a oggi, compreso il collaudo
  d'equità.
