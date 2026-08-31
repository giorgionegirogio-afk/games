package it.dopolavoro.gioco;

import android.app.Activity;
import android.content.SharedPreferences;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.AcknowledgePurchaseResponseListener;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingConfig;
import com.android.billingclient.api.BillingConfigResponseListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.ConsumeResponseListener;
import com.android.billingclient.api.GetBillingConfigParams;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.ProductDetailsResponseListener;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesResponseListener;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Il ponte fra il gioco (una pagina in una WebView) e Google Play Billing.
 *
 * PERCHE' QUESTO FILE ESISTE E STA FUORI DA Gioco.java. Il guscio del
 * gioco fa quattro cose e non ne vuole una quinta: se i pagamenti
 * stessero dentro Gioco.java, l'APK distribuito FUORI da Play (quello a
 * zero permessi, che è metà del nostro vanto) porterebbe comunque dentro
 * la libreria di fatturazione. Qui invece il file si compila oppure no:
 * costruisci.py può fare due pacchetti dallo stesso sorgente, e quello
 * senza pagamenti resta identico a oggi.
 *
 * PERCHE' addJavascriptInterface, DOPO CHE Gioco.java DICHIARA DI
 * EVITARLO. Il commento di Gioco.java è preciso: lì non si usa perché
 * per leggere `window.__test.state` bastava evaluateJavascript e aprire
 * un ponte JS→Java sarebbe stato pagare una superficie per niente. Qui
 * il verso è opposto — la fatturazione È un'API Java e non esiste altro
 * modo di raggiungerla da una pagina. Le mitigazioni sono tre e valgono
 * la pena di essere scritte:
 *   1. la WebView carica UN solo documento, da file:///android_asset, e
 *      non naviga da nessun'altra parte (nessun link esterno, nessuna
 *      fetch: nel gioco ce ne sono zero, contate);
 *   2. da minSdk 24 solo i metodi con @JavascriptInterface sono esposti,
 *      e qui sono nove, tutti a parametri String o boolean;
 *   3. nessun parametro che arriva da JS diventa un'azione: `compra` e
 *      `chiudi` cercano il codice prodotto e il gettone dentro liste che
 *      vengono da Play, e se non ci sono non fanno niente. Non c'è un
 *      cammino in cui una stringa inventata dalla pagina produca un
 *      addebito o una consegna.
 *
 * PERCHE' TANTE CLASSI PICCOLE INVECE DI CLASSI ANONIME. Non è stile:
 * d8 delle build-tools 34 (R8 8.2.2) si rompe sui .class prodotti da
 * javac recente quando la classe porta attributi generici — classi
 * anonime e classi che implementano interfacce parametriche. L'errore è
 * un NullPointerException dentro d8 che non dice niente. E' già costato
 * tempo a questo progetto (memoria «apk-android-senza-gradle»): qui
 * dentro ci sono SOLO classi di primo livello e i parametri delle
 * richiamate sono tipi GREZZI (`List` e non `List<Purchase>`). La
 * compilazione emette avvisi di unchecked: sono voluti.
 *
 * L'ORDINE DELLE OPERAZIONI, che è l'unica regola da ricordare:
 *
 *        1. il gioco ACCREDITA   2. il gioco SALVA   3. Java CHIUDE
 *
 * Il lato Java non consuma e non riconosce NIENTE di sua iniziativa:
 * aspetta che sia il gioco a chiamare `chiudi(gettone)`, e il gioco lo
 * chiama solo dopo aver scritto. Il motivo sta in ponte.js: «consumato
 * senza aver accreditato» non si recupera in nessun modo, «accreditato
 * due volte» si impedisce con il gettone come chiave. Si sbaglia sempre
 * dalla parte che si può correggere.
 *
 * IL TERMINE, ed è di Google: un acquisto non riconosciuto entro tre
 * giorni viene rimborsato d'ufficio e il diritto revocato. Per questo la
 * riconciliazione gira a ogni avvio e a ogni ritorno in primo piano, e
 * non solo dopo un acquisto.
 */
public class Pagamenti {

  static final String TAG = "GiocoPag";

  /** I codici prodotto, e sono gli stessi sette di ponte.js.
   *  QUESTA E' UNA COPIA, ed è l'unica del progetto: Play vuole i codici
   *  in Java prima che la pagina esista. Se un giorno divergono, il
   *  sintomo è muto (una voce che non compare nel negozio), quindi
   *  `elenco()` restituisce anche i codici che Play NON ha riconosciuto:
   *  così la divergenza si vede invece di nascondersi. */
  static final String[] CODICI = {
      "campetto_completo", "pacchetto_campi", "pacchetto_divise",
      "la_curva", "lo_sponsor", "monete_sacchetto", "monete_cassetta",
  };

  /** Quali si consumano. I diritti no: si riconoscono e restano.
   *  Il gioco lo ridice quando chiama `chiudi`, ma la verità la tiene
   *  anche qui, perché consumare per sbaglio un diritto significa che al
   *  prossimo avvio il giocatore non ce l'ha più. */
  static boolean siConsuma(String codice) {
    return "monete_sacchetto".equals(codice) || "monete_cassetta".equals(codice);
  }

  final Activity att;
  final WebView vista;
  final SharedPreferences deposito;

  BillingClient cliente;
  boolean connesso = false;
  int tentativi = 0;
  String paese = null;

  final Map schede = new HashMap();      // codice prodotto -> ProductDetails
  final Map acquisti = new HashMap();    // gettone -> Purchase
  final List codiciIgnoti = new ArrayList();

  /**
   * L'unica riga da aggiungere a Gioco.java, dopo aver creato la vista e
   * prima di caricare il gioco:
   *
   *     Pagamenti.collega(this, vista);
   *
   * e in onResume:
   *
   *     Pagamenti.riprendi();
   */
  static Pagamenti unico = null;

  public static void collega(Activity a, WebView v) {
    if (unico != null) return;
    unico = new Pagamenti(a, v);
    v.addJavascriptInterface(unico, "PagamentiJava");
    unico.connetti();
  }

  public static void riprendi() {
    if (unico != null && unico.connesso) unico.chiediAcquisti();
  }

  public static void stacca() {
    if (unico != null && unico.cliente != null) {
      try { unico.cliente.endConnection(); } catch (Throwable t) { /* si sta chiudendo comunque */ }
    }
    unico = null;
  }

  Pagamenti(Activity a, WebView v) {
    this.att = a;
    this.vista = v;
    /* IL DEPOSITO DUREVOLE, e non è il localStorage.
       Chromium scrive il localStorage su disco in differita: un processo
       ucciso mentre l'app è in primo piano perde gli ultimi secondi
       (misurato in questo progetto con `am force-stop`). Un registro di
       acquisti che perde gli ultimi secondi è esattamente il guasto che
       questo file esiste per impedire. SharedPreferences con commit()
       scrive prima di tornare: costa qualche millisecondo su un'azione
       che capita cinque volte nella vita dell'app. */
    this.deposito = a.getSharedPreferences("calcetto_pagamenti", Activity.MODE_PRIVATE);
  }

  /* =================================================================
     LA CONNESSIONE

     Il servizio di Play può non esserci (dispositivo senza Play, ROM
     alternativa, Play in aggiornamento) e può cadere mentre si gioca. In
     tutti e due i casi il gioco NON deve accorgersene: il negozio a
     monete continua a funzionare e il bottone in euro si spegne con una
     riga di spiegazione. Nessuna rotella che gira, nessun riquadro
     d'errore modale.
     ================================================================= */
  void connetti() {
    PendingPurchasesParams pend = PendingPurchasesParams.newBuilder()
        .enableOneTimeProducts()      // il pagamento in contanti in cartoleria esiste e va gestito
        .build();
    cliente = BillingClient.newBuilder(att)
        .setListener(new PagamentiAggiornamento(this))
        .enablePendingPurchases(pend)
        .build();
    cliente.startConnection(new PagamentiConnessione(this));
  }

  void connessa(BillingResult r) {
    if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) {
      Log.w(TAG, "fatturazione non disponibile: " + r.getResponseCode() + " " + r.getDebugMessage());
      connesso = false;
      versoJS("assente", String.valueOf(r.getResponseCode()));
      return;
    }
    connesso = true;
    tentativi = 0;
    chiediPaese();
    chiediSchede();
    chiediAcquisti();     // LA RICONCILIAZIONE ALL'AVVIO: è la prima cosa, non l'ultima
    versoJS("pronto", null);
  }

  /* Caduta della connessione. Si riprova con attesa crescente e con un
     tetto: riprovare all'infinito ogni secondo scalda la batteria di
     chiunque non abbia Play installato, e quella è gente che il gioco
     deve servire lo stesso. Dopo sei tentativi si smette e si riprova al
     prossimo ritorno in primo piano, che è quando le cose cambiano
     davvero. */
  void caduta() {
    connesso = false;
    versoJS("caduta", null);
    if (tentativi >= 6) return;
    tentativi++;
    long attesa = 1000L * (1L << Math.min(tentativi, 5));   // 2s, 4s, 8s, 16s, 32s, 32s
    vista.postDelayed(new PagamentiRiprova(this), attesa);
  }

  /* =================================================================
     IL PAESE DI FATTURAZIONE

     Serve per una cosa sola: sapere se si può mostrare la bustina a
     sorpresa. In Belgio la commissione dei giochi d'azzardo considera i
     pacchetti casuali a pagamento un gioco d'azzardo dal 2018, e nei
     Paesi Bassi la questione è aperta.

     PERCHE' getBillingConfigAsync E NON LA LINGUA DEL TELEFONO O LA SIM.
     Perché è il paese di FATTURAZIONE, cioè quello che decide la legge
     applicabile all'acquisto, ed è quello che Play userà comunque per
     incassare. La lingua è una preferenza, la SIM è un viaggio, il conto
     Play è dove si paga. E non costa nessun permesso.

     QUANDO NON SI SA, resta null, e la regola scritta in ponte.js è:
     senza paese si mostra la bacheca deterministica. Sbagliare verso la
     bacheca non toglie niente a nessuno; sbagliare verso la bustina
     vende un prodotto vietato.
     ================================================================= */
  void chiediPaese() {
    cliente.getBillingConfigAsync(GetBillingConfigParams.newBuilder().build(),
        new PagamentiPaese(this));
  }

  /* =================================================================
     LE SCHEDE DEI PRODOTTI

     Il prezzo che si mostra a chi paga DEVE essere quello che torna da
     qui (getFormattedPrice), mai il «3,99 €» scritto nel sorgente. Play
     applica listini per Paese, IVA e valuta locale: un prezzo cablato è
     giusto in Italia e sbagliato ovunque altro, e sbagliato in Italia il
     giorno che cambia l'IVA. I prezzi in ponte.js sono di ripiego, per
     la finta e per i tre secondi prima che Play risponda.
     ================================================================= */
  void chiediSchede() {
    List elenco = new ArrayList();
    for (int i = 0; i < CODICI.length; i++) {
      elenco.add(QueryProductDetailsParams.Product.newBuilder()
          .setProductId(CODICI[i])
          .setProductType(BillingClient.ProductType.INAPP)
          .build());
    }
    QueryProductDetailsParams p = QueryProductDetailsParams.newBuilder()
        .setProductList(elenco).build();
    cliente.queryProductDetailsAsync(p, new PagamentiSchede(this));
  }

  void schedeArrivate(BillingResult r, List lista) {
    if (r.getResponseCode() != BillingClient.BillingResponseCode.OK || lista == null) {
      Log.w(TAG, "schede non arrivate: " + r.getResponseCode());
      return;
    }
    schede.clear();
    for (int i = 0; i < lista.size(); i++) {
      ProductDetails d = (ProductDetails) lista.get(i);
      schede.put(d.getProductId(), d);
    }
    /* I codici che Play NON conosce. Capita per due motivi, e sono i due
       modi in cui una pubblicazione va storta senza dirlo: il prodotto
       non è stato creato nella console, oppure l'APK installato non è
       firmato con la chiave di rilascio. In tutti e due i casi la voce
       sparisce dal negozio e nessuno capisce perché — quindi qui la si
       tiene e `elenco()` la restituisce. */
    codiciIgnoti.clear();
    for (int i = 0; i < CODICI.length; i++) {
      if (!schede.containsKey(CODICI[i])) codiciIgnoti.add(CODICI[i]);
    }
    if (!codiciIgnoti.isEmpty()) Log.w(TAG, "codici che Play non conosce: " + codiciIgnoti);
    versoJS("schede", null);
  }

  /* =================================================================
     LA RICONCILIAZIONE

     queryPurchasesAsync chiede alla PLAY STORE APP, non alla rete: la
     risposta arriva dalla sua cache locale, quindi funziona anche a
     rete staccata. E' il fatto tecnico su cui poggia la risposta alla
     domanda «deve poter funzionare anche offline»: comprare no,
     CONSEGNARE sì. Un acquisto fatto ieri in stazione si consegna oggi
     in galleria, senza una tacca.
     ================================================================= */
  void chiediAcquisti() {
    if (!connesso) return;
    QueryPurchasesParams p = QueryPurchasesParams.newBuilder()
        .setProductType(BillingClient.ProductType.INAPP).build();
    cliente.queryPurchasesAsync(p, new PagamentiElenco(this));
  }

  void acquistiArrivati(BillingResult r, List lista) {
    if (lista == null) return;
    for (int i = 0; i < lista.size(); i++) {
      Purchase a = (Purchase) lista.get(i);
      acquisti.put(a.getPurchaseToken(), a);
    }
    versoJS("acquisti", null);     // il gioco richiama riconcilia() e legge acquisti()
  }

  /* =================================================================
     I NOVE METODI CHE LA PAGINA PUO' CHIAMARE

     Girano su un thread di binder, non su quello dell'interfaccia:
     tutto ciò che tocca la WebView o apre una finestra deve passare da
     runOnUiThread. Chi lo dimentica ottiene un'eccezione a caso in
     produzione e non in prova.
     ================================================================= */

  @JavascriptInterface
  public boolean pronto() { return cliente != null; }

  @JavascriptInterface
  public boolean connesso() { return connesso; }

  @JavascriptInterface
  public String paese() { return paese; }

  /** Il listino come lo conosce Play, prezzi locali compresi. */
  @JavascriptInterface
  public String elenco() {
    JSONArray fuori = new JSONArray();
    try {
      for (int i = 0; i < CODICI.length; i++) {
        ProductDetails d = (ProductDetails) schede.get(CODICI[i]);
        JSONObject o = new JSONObject();
        o.put("sku", CODICI[i]);
        o.put("noto", d != null);
        if (d != null) {
          o.put("nome", d.getName());
          ProductDetails.OneTimePurchaseOfferDetails off = d.getOneTimePurchaseOfferDetails();
          if (off != null) {
            o.put("prezzo", off.getFormattedPrice());
            o.put("micro", off.getPriceAmountMicros());
            o.put("valuta", off.getPriceCurrencyCode());
          }
        }
        fuori.put(o);
      }
    } catch (Throwable t) {
      Log.w(TAG, "elenco: " + t);
    }
    return fuori.toString();
  }

  /** Gli acquisti che Play conosce, nel vocabolario di ponte.js. */
  @JavascriptInterface
  public String acquisti() {
    JSONArray fuori = new JSONArray();
    try {
      Object[] chiavi = acquisti.keySet().toArray();
      for (int i = 0; i < chiavi.length; i++) {
        Purchase a = (Purchase) acquisti.get(chiavi[i]);
        if (a == null) continue;
        String stato;
        if (a.getPurchaseState() == Purchase.PurchaseState.PURCHASED) stato = "comprato";
        else if (a.getPurchaseState() == Purchase.PurchaseState.PENDING) stato = "attesa";
        else continue;              // annullato o sconosciuto: non è affar nostro
        List codici = a.getProducts();
        JSONObject o = new JSONObject();
        o.put("token", a.getPurchaseToken());
        o.put("sku", codici.isEmpty() ? "" : (String) codici.get(0));
        o.put("stato", stato);
        o.put("quando", a.getPurchaseTime());
        o.put("riconosciuto", a.isAcknowledged());
        fuori.put(o);
      }
    } catch (Throwable t) {
      Log.w(TAG, "acquisti: " + t);
    }
    return fuori.toString();
  }

  /** Apre il pagamento. Il gettone NON torna da qui: torna dall'evento. */
  @JavascriptInterface
  public void compra(String codice) {
    ProductDetails d = (ProductDetails) schede.get(codice);
    if (d == null) { versoJS("rifiutato", codice); return; }
    att.runOnUiThread(new PagamentiApri(this, d));
  }

  /** Rilegge l'elenco di Play. Da chiamare all'avvio e al risveglio. */
  @JavascriptInterface
  public void riconcilia() { chiediAcquisti(); }

  /**
   * Chiude la pratica con Play — e si chiama SOLO dopo che il gioco ha
   * accreditato e salvato. Questo metodo non decide niente da solo:
   * decide il gioco, e questa è la ragione per cui l'ordine regge.
   */
  @JavascriptInterface
  public void chiudi(String gettone, boolean consumabile) {
    Purchase a = (Purchase) acquisti.get(gettone);
    if (a == null) return;
    if (a.getPurchaseState() != Purchase.PurchaseState.PURCHASED) return;

    /* La verità sul consumabile la tiene anche Java: consumare per
       sbaglio un diritto vuol dire che al prossimo avvio il giocatore
       non ce l'ha più, e non c'è modo di rimetterlo. */
    List codici = a.getProducts();
    String codice = codici.isEmpty() ? "" : (String) codici.get(0);
    boolean cons = consumabile && siConsuma(codice);

    if (cons) {
      ConsumeParams p = ConsumeParams.newBuilder().setPurchaseToken(gettone).build();
      cliente.consumeAsync(p, new PagamentiConsumo(this));
    } else {
      if (a.isAcknowledged()) { chiusa(gettone); return; }
      AcknowledgePurchaseParams p = AcknowledgePurchaseParams.newBuilder()
          .setPurchaseToken(gettone).build();
      cliente.acknowledgePurchase(p, new PagamentiRiconoscimento(this, gettone));
    }
  }

  /** Il registro degli acquisti, copia durevole. Lo scrive ponte.js. */
  @JavascriptInterface
  public String leggiRegistro() { return deposito.getString("registro", null); }

  @JavascriptInterface
  public void scriviRegistro(String json) {
    if (json == null) return;
    SharedPreferences.Editor e = deposito.edit();
    e.putString("registro", json);
    /* commit() e non apply(): apply() scrive in differita, ed è
       esattamente la differita che questo registro esiste per evitare.
       Il costo è qualche millisecondo su un'azione che capita cinque
       volte nella vita dell'app. */
    e.commit();
  }

  /* =================================================================
     RITORNI
     ================================================================= */
  void chiusa(String gettone) {
    acquisti.remove(gettone);
    versoJS("chiuso", gettone);
  }

  void versoJS(String evento, String dato) {
    String js = "window.Pagamenti && window.Pagamenti._daJava("
        + inStringa(evento) + "," + inStringa(dato) + ")";
    att.runOnUiThread(new PagamentiVersoJS(vista, js));
  }

  /** Una stringa che finisce dentro codice JavaScript. Passa da JSONObject
   *  e non da una concatenazione a mano: un apostrofo in un messaggio di
   *  Play romperebbe l'espressione, e un messaggio di Play non è testo
   *  che scriviamo noi. */
  static String inStringa(String s) {
    if (s == null) return "null";
    return JSONObject.quote(s);
  }
}

/* ===================================================================
   Le richiamate, tutte classi di primo livello e a tipi grezzi: vedi la
   nota su d8 in testa al file. Nessuna classe anonima, nessuna lambda,
   nessuna interfaccia parametrica.
   =================================================================== */

class PagamentiConnessione implements BillingClientStateListener {
  private final Pagamenti p;
  PagamentiConnessione(Pagamenti p) { this.p = p; }
  public void onBillingSetupFinished(BillingResult r) { p.connessa(r); }
  public void onBillingServiceDisconnected() { p.caduta(); }
}

class PagamentiRiprova implements Runnable {
  private final Pagamenti p;
  PagamentiRiprova(Pagamenti p) { this.p = p; }
  public void run() {
    if (p.cliente == null || p.connesso) return;
    try { p.cliente.startConnection(new PagamentiConnessione(p)); }
    catch (Throwable t) { Log.w(Pagamenti.TAG, "riprova: " + t); }
  }
}

class PagamentiSchede implements ProductDetailsResponseListener {
  private final Pagamenti p;
  PagamentiSchede(Pagamenti p) { this.p = p; }
  public void onProductDetailsResponse(BillingResult r, List lista) { p.schedeArrivate(r, lista); }
}

class PagamentiElenco implements PurchasesResponseListener {
  private final Pagamenti p;
  PagamentiElenco(Pagamenti p) { this.p = p; }
  public void onQueryPurchasesResponse(BillingResult r, List lista) { p.acquistiArrivati(r, lista); }
}

/* L'aggiornamento che arriva quando il pagamento si chiude — o quando
   l'utente annulla, che è il caso più frequente di tutti e non è un
   errore: si torna al negozio e non si dice niente. */
class PagamentiAggiornamento implements PurchasesUpdatedListener {
  private final Pagamenti p;
  PagamentiAggiornamento(Pagamenti p) { this.p = p; }
  public void onPurchasesUpdated(BillingResult r, List lista) {
    int c = r.getResponseCode();
    if (c == BillingClient.BillingResponseCode.USER_CANCELED) { p.versoJS("annullato", null); return; }
    if (c != BillingClient.BillingResponseCode.OK) {
      Log.w(Pagamenti.TAG, "acquisto non riuscito: " + c + " " + r.getDebugMessage());
      p.versoJS("fallito", String.valueOf(c));
      /* ITEM_ALREADY_OWNED non è un errore da mostrare: è un acquisto
         precedente mai consegnato, cioè esattamente il caso per cui la
         coda esiste. Si va a riprenderlo. */
      if (c == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) p.chiediAcquisti();
      return;
    }
    p.acquistiArrivati(r, lista);
  }
}

class PagamentiConsumo implements ConsumeResponseListener {
  private final Pagamenti p;
  PagamentiConsumo(Pagamenti p) { this.p = p; }
  public void onConsumeResponse(BillingResult r, String gettone) {
    if (r.getResponseCode() == BillingClient.BillingResponseCode.OK) { p.chiusa(gettone); return; }
    /* Fallito: la riga resta «consegnato» in ponte.js e si ritenta al
       prossimo avvio. Il termine è i tre giorni del rimborso d'ufficio,
       che sono tanti rispetto a «la prossima volta che apri il gioco». */
    Log.w(Pagamenti.TAG, "consumo fallito: " + r.getResponseCode());
  }
}

class PagamentiRiconoscimento implements AcknowledgePurchaseResponseListener {
  private final Pagamenti p;
  private final String gettone;
  PagamentiRiconoscimento(Pagamenti p, String gettone) { this.p = p; this.gettone = gettone; }
  public void onAcknowledgePurchaseResponse(BillingResult r) {
    if (r.getResponseCode() == BillingClient.BillingResponseCode.OK) { p.chiusa(gettone); return; }
    Log.w(Pagamenti.TAG, "riconoscimento fallito: " + r.getResponseCode());
  }
}

class PagamentiPaese implements BillingConfigResponseListener {
  private final Pagamenti p;
  PagamentiPaese(Pagamenti p) { this.p = p; }
  public void onBillingConfigResponse(BillingResult r, BillingConfig c) {
    if (r.getResponseCode() == BillingClient.BillingResponseCode.OK && c != null) {
      p.paese = c.getCountryCode();
    }
    /* Se non arriva resta null, e ponte.js mostra la bacheca. E' il
       ripiego che non toglie niente a nessuno. */
    p.versoJS("paese", p.paese);
  }
}

/* launchBillingFlow vuole il thread dell'interfaccia: apre una finestra
   di sistema sopra la nostra. */
class PagamentiApri implements Runnable {
  private final Pagamenti p;
  private final ProductDetails d;
  PagamentiApri(Pagamenti p, ProductDetails d) { this.p = p; this.d = d; }
  public void run() {
    try {
      List l = new ArrayList();
      l.add(BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(d).build());
      BillingFlowParams f = BillingFlowParams.newBuilder().setProductDetailsParamsList(l).build();
      /* NIENTE setObfuscatedAccountId. Sarebbe il posto giusto per legare
         l'acquisto a un conto — e noi un conto non ce l'abbiamo, per
         scelta (rete/LEGGIMI.md: identità anonima, zero dati personali).
         Passarci l'identificatore anonimo della classifica significherebbe
         consegnarlo a Google, cioè trasformare un identificatore che non
         è nessuno in un identificatore che è qualcuno. */
      BillingResult r = p.cliente.launchBillingFlow(p.att, f);
      if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) {
        p.versoJS("fallito", String.valueOf(r.getResponseCode()));
      }
    } catch (Throwable t) {
      Log.w(Pagamenti.TAG, "apertura pagamento: " + t);
      p.versoJS("fallito", "eccezione");
    }
  }
}

class PagamentiVersoJS implements Runnable {
  private final WebView vista;
  private final String js;
  PagamentiVersoJS(WebView vista, String js) { this.vista = vista; this.js = js; }
  public void run() {
    /* null come richiamata: non ci interessa la risposta, e passarne una
       vorrebbe dire una ValueCallback<String>, cioè un'interfaccia
       parametrica, cioè la trappola di d8 descritta in testa al file. */
    try { vista.evaluateJavascript(js, null); }
    catch (Throwable t) { Log.w(Pagamenti.TAG, "verso JS: " + t); }
  }
}
