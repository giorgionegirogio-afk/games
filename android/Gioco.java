package it.dopolavoro.gioco;

import android.app.Activity;
import android.graphics.Rect;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;          // l'orologio che chiede alla pagina se si sta giocando
import android.provider.Settings;   // per sapere se il telefono ha il debug USB acceso
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.ValueCallback;
import android.widget.Toast;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.ArrayList;
import java.util.List;

/**
 * Un guscio minimo attorno al gioco.
 *
 * Il gioco è un unico file HTML dentro gli asset: niente rete, niente
 * permessi, niente librerie. Questa classe fa quattro cose e basta:
 *   1. apre una WebView a schermo intero sul file del gioco;
 *   2. tiene lo schermo acceso SOLO mentre si sta giocando (voce A2.3);
 *   3. fa funzionare il tasto Indietro come ci si aspetta;
 *   4. dice al sistema che la fascia dei comandi non è sua (voce L0.3).
 */
public class Gioco extends Activity {

  private WebView vista;

  /* ===================================================================
     LO SCHERMO ACCESO SOLO IN PARTITA — voce A2.3.

     Come stava prima: FLAG_KEEP_SCREEN_ON messo in onCreate e mai piu'
     tolto. Misurato sul telefono (OnePlus 6, Android 11, seriale
     01c8eb5a) con l'APK del deposito prima di questa modifica: app
     aperta sul MENU, nessuna partita in corso, e
     «dumpsys power | grep -A4 'Wake Locks:'» dice
     «size=1  SCREEN_BRIGHT_WAKE_LOCK 'WindowManager' ... uid=1000
     ws=WorkSource{10244}» — cioe' il telefono non si spegne mai finche'
     il gioco e' davanti, anche se sta fermo sul menu da un'ora.

     COME LO SO SE SI STA GIOCANDO, senza toccare il gioco. Il gioco
     espone gia' `window.__test.state` (che e' G.scene) e
     `window.__test.paused`: sono i due valori che tutti gli strumenti
     della casa leggono da mesi. Il guscio li chiede alla pagina con una
     evaluateJavascript ogni 5 secondi. NON si usa
     addJavascriptInterface, che avrebbe voluto una riga dentro il gioco
     (vietato in questa onda) e avrebbe aperto un ponte JS→Java che qui
     non serve a nient'altro.

     PERCHE' 5 SECONDI E NON DI PIU', NE' DI MENO. Il timeout di
     spegnimento piu' corto che Android offre e' 15 s, quindi 5 s non
     puo' far spegnire lo schermo in ritardo di un tempo che si veda; e
     una chiamata ogni 5 s e' 0,2 Hz, cioe' niente accanto ai 60 fotogrammi
     al secondo che la stessa WebView sta gia' disegnando. La prima
     domanda parte a 5 s dall'avvio APPOSTA: cosi' non cade dentro
     l'intervallo che avvio.js misura (1,5 s icona→pallone) e non sporca
     quella misura.

     LA REGOLA E' QUELLA DEL GIOCO, NON UNA MIA. «Si sta giocando» =
     scena diversa da 'menu' e da 'end' e partita non in pausa: e' la
     stessa identica condizione che il gioco usa al suo interno per
     decidere se il campo e' vivo (CALCETTO-il-gioco.html:26807 e
     :32156, «G.scene==='menu'||G.scene==='end'||G.paused»). Se un giorno
     cambia li', questa si accorge da sola perche' legge i valori, non
     li reinventa.

     SE NON SI PUO' SAPERE, SI TIENE ACCESO. Pagina non ancora caricata,
     __test assente, WebView morta: la risposta e' -1 e lo schermo resta
     acceso, cioe' esattamente come si comportava prima. «Non misurato»
     non deve mai diventare «spegni lo schermo in faccia a chi gioca».
     =================================================================== */
  private static final long PASSO = 5000;      // ms fra due domande alla pagina
  private static final String SCENA =
      "(function(){try{var t=window.__test;if(!t||typeof t.state!=='string')return -1;" +
      "return (t.state!=='menu'&&t.state!=='end'&&!t.paused)?1:0}catch(e){return -1}})()";
  private final Handler orologio = new Handler();
  private Runnable sonda;                      // creato in onCreate: gli serve `this`
  private boolean schermoTenuto = true;        // onCreate accende: si parte da acceso
  private boolean avvisatoMuto = false;        // il «non lo so» si scrive una volta sola

  /** il file da aprire arriva dal manifest, così lo stesso codice serve i due giochi */
  private String fileDelGioco() {
    try {
      android.content.pm.ApplicationInfo ai = getPackageManager()
          .getApplicationInfo(getPackageName(), android.content.pm.PackageManager.GET_META_DATA);
      String f = ai.metaData != null ? ai.metaData.getString("gioco") : null;
      if (f != null && f.length() > 0) return f;
    } catch (Exception e) { /* si ripiega sul valore sotto */ }
    return "gioco.html";
  }

  @Override
  protected void onCreate(Bundle stato) {
    super.onCreate(stato);
    requestWindowFeature(Window.FEATURE_NO_TITLE);

    /* Si parte con lo schermo tenuto acceso perche' il caricamento del
       gioco (un file HTML da 1,8 MB) non e' istantaneo e non si puo'
       ancora chiedere niente alla pagina. Da qui in poi decide la sonda
       qui sopra: al primo giro utile, se si e' nel menu, questo flag
       viene tolto. */
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

    /* si disegna anche sotto la tacca del telefono: il gioco usa gia'
       env(safe-area-inset-*) nel proprio CSS */
    if (Build.VERSION.SDK_INT >= 28) {
      getWindow().getAttributes().layoutInDisplayCutoutMode =
          WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
    }

    vista = new WebView(this);
    WebSettings s = vista.getSettings();
    s.setJavaScriptEnabled(true);
    /* localStorage: è dove finiscono partite salvate, trofei e impostazioni */
    s.setDomStorageEnabled(true);
    s.setAllowFileAccess(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    s.setSupportZoom(false);
    s.setBuiltInZoomControls(false);
    s.setCacheMode(WebSettings.LOAD_NO_CACHE);   // il file è locale: nessuna cache serve

    vista.setWebViewClient(new WebViewClient());

    /* Se qualcosa nel gioco si rompe, senza questo si vedrebbe solo uno
       schermo nero e non si saprebbe perche'. Cosi' invece l'errore finisce
       in logcat: "adb logcat -s GiocoJS" e si legge cos'e' successo. */
    vista.setWebChromeClient(new Cronaca());
    apriLaConsoleSoloSeServe();
    vista.setBackgroundColor(0xFF0B1F16);
    vista.setOverScrollMode(View.OVER_SCROLL_NEVER);
    vista.setLongClickable(false);
    vista.setHapticFeedbackEnabled(false);

    /* ===================================================================
       LA FASCIA DEI COMANDI NON E' DEL SISTEMA — voce L0.3.

       Il problema, misurato sul telefono e non dedotto (OnePlus 6,
       Android 11, navigazione a gesti, dita vere scritte sul dispositivo
       di ingresso del kernel — strumenti/_p-l03.js): un dito posato
       dentro la presa del disco grande, a 16 px dal bordo destro, e
       trascinato verso sinistra non arriva MAI alla pagina. Venti prove
       su venti. Se lo prende il gesto «indietro» di Android, e in tredici
       di quelle venti il gioco va anche in pausa da solo, perche' il
       sistema ha eseguito «indietro» al posto suo. Lo stesso gesto dal
       centro del disco arriva sempre: 0 su 20.

       setSystemGestureExclusionRects e' il modo che Android da' a
       un'applicazione per dire «questa striscia la gestisco io». Serve
       ANCHE se il gioco sposta i comandi verso il centro (toppa
       strumenti/_t-l03.js), perche' quella toppa puo' allontanarsi solo
       dalla fascia PREDEFINITA: l'utente puo' allargarla a piacere nelle
       impostazioni («back sensitivity»: gli overlay gestural_wide_back e
       gestural_extra_wide_back esistono su questo telefono), e nessuna
       geometria scritta nel gioco puo' inseguirla. Solo questa chiamata
       vince a qualunque sensibilita'.

       PERCHE' DUE RETTANGOLI E NON I DUE CERCHI DI PRESA. Il metodo
       vuole rettangoli, e soprattutto i cerchi si spostano: stanno a
       destra in un giocatore, su TUTTI E DUE i lati in due giocatori, e
       cambiano con la misura della finestra. Inseguirli vorrebbe dire
       chiedere la geometria alla pagina di continuo, cioe' legare il
       guscio al gioco e pagare una evaluateJavascript a ripetizione. Due
       bande ai lati, alte quanto la fascia dei comandi, li contengono
       tutti e in ogni modalita'. Cio' che eccede la striscia dei gesti
       non ha nessun effetto — il sistema interseca comunque — quindi
       essere larghi qui non costa niente a nessuno.

       IL TETTO, dichiarato: Android ignora l'esclusione oltre 200 dp per
       ogni bordo. 140 dp stanno sotto, quindi la richiesta viene
       esaudita intera e non silenziosamente tagliata.

       CIO' CHE QUESTO NON FA: il gesto «home», che nasce dal fondo dello
       schermo, NON e' escludibile da nessuna applicazione — Android non
       lo consente e basta. Contro quello c'e' solo la banda minima di
       20 px che la toppa del gioco tiene libera in fondo.
       =================================================================== */
    if (Build.VERSION.SDK_INT >= 29) vista.addOnLayoutChangeListener(new Bordi());

    setContentView(vista);
    schermoIntero();
    vista.loadUrl("file:///android_asset/" + fileDelGioco());

    /* la sonda dello schermo parte fra 5 secondi, non adesso: vedi il
       cartello sopra (non deve cadere dentro la misura d'avvio) */
    sonda = new Sonda(this);
    orologio.postDelayed(sonda, PASSO);
  }

  /* ===================================================================
     LA CONSOLE DI DEBUG NON E' PIU' SEMPRE APERTA — voce A2.2.

     Come stava prima: `WebView.setWebContentsDebuggingEnabled(true)`
     nudo, in ogni pacchetto, sempre. Misurato prima della modifica
     sull'APK del deposito: aperto il gioco, «cat /proc/net/unix» sul
     telefono mostra «@webview_devtools_remote_16658». Quel socket e'
     l'intera pagina apparecchiata per chi si collega: DOM, sorgente,
     variabili, console.

     LA REGOLA, in ordine, e il perche' di ognuna:

     1. `calcetto_collaudo` (un valore in Settings.Global) e' l'ultima
        parola, in tutti e due i versi: 1 accende, 0 spegne, assente
        lascia decidere le regole sotto. Si scrive SOLO da adb
        («adb shell settings put global calcetto_collaudo 0») perche'
        richiede WRITE_SECURE_SETTINGS, che nessuna app puo' avere.
        Serve a due cose vere: dare a chi consegna un telefono in mano a
        un provino un modo per chiudere la console senza ricostruire, e
        dare a questo cancello il suo CONTROLLO NEGATIVO — senza di
        questo non potrei mostrare la console SPENTA su un banco che per
        esistere ha bisogno che adb sia acceso.

     2. Se l'APK e' costruito debuggabile (FLAG_DEBUGGABLE) la console
        si accende. E' la regola standard di Android, quella che il lint
        di Google si aspetta; oggi questa catena non produce APK
        debuggabili (nessun gradle, nessun BuildConfig: BuildConfig NON
        ESISTE qui, per questo non lo si nomina), ma se un domani il
        manifest guadagna android:debuggable la riga e' gia' giusta.

     3. Altrimenti la console segue il DEBUG USB del telefono
        (Settings.Global.ADB_ENABLED). E' l'unica condizione onesta:
        quel socket e' raggiungibile SOLO attraverso adb, quindi su un
        telefono con il debug USB spento non serviva a nessuno e restava
        aperto per niente; e su un banco di collaudo — dove adb e'
        acceso per definizione, altrimenti nessuno dei sedici strumenti
        che si attaccano a quel socket potrebbe girare — resta aperto
        senza che nessuno debba ricordarsi di niente. E' anche il motivo
        per cui questa modifica non rompe UN SOLO strumento della casa.

     CIO' CHE QUESTO NON FA, dichiarato: non nasconde il gioco a chi
     apre l'APK. Il file HTML e' un asset in chiaro dentro un pacchetto
     firmato: chiunque lo estrae con unzip. Qui non si protegge un
     segreto — non ce n'e' nessuno — si chiude una porta che nel
     pacchetto pubblicato non ha piu' nessun motivo di stare aperta.

     E il logcat resta: Cronaca (WebChromeClient) continua a portare gli
     errori del gioco in «adb logcat -s GiocoJS» anche con la console
     chiusa, quindi uno schermo nero resta diagnosticabile lo stesso.
     =================================================================== */
  private void apriLaConsoleSoloSeServe() {
    boolean acceso;
    String perche;
    int forzato = -1, adb = 0;
    boolean debuggabile = (getApplicationInfo().flags
        & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    try {
      forzato = Settings.Global.getInt(getContentResolver(), "calcetto_collaudo", -1);
      adb = Settings.Global.getInt(getContentResolver(), Settings.Global.ADB_ENABLED, 0);
    } catch (Exception e) {
      /* se le impostazioni non si leggono non si indovina: si resta
         chiusi, che e' il comportamento del pacchetto pubblicato */
    }
    if (forzato == 1)      { acceso = true;  perche = "chiesta a mano (calcetto_collaudo=1)"; }
    else if (forzato == 0) { acceso = false; perche = "spenta a mano (calcetto_collaudo=0)"; }
    else if (debuggabile)  { acceso = true;  perche = "pacchetto debuggabile"; }
    else if (adb == 1)     { acceso = true;  perche = "debug USB acceso sul telefono"; }
    else                   { acceso = false; perche = "pacchetto pubblicato"; }
    if (acceso) WebView.setWebContentsDebuggingEnabled(true);
    /* si scrive sempre in logcat, accesa o spenta: un cancello che non
       si vede non si puo' collaudare */
    Log.i("GiocoJS", "console di debug " + (acceso ? "APERTA" : "chiusa") + " — " + perche);
  }

  /** la sonda: chiede alla pagina se si sta giocando e si riprogramma */
  void chiediSeSiGioca() {
    if (vista == null) return;
    vista.evaluateJavascript(SCENA, new RispostaScena(this));
    orologio.postDelayed(sonda, PASSO);
  }

  /** la risposta della pagina: 1 si gioca, 0 no, -1 non si e' potuto sapere */
  void rispostaScena(Object valore) {
    String s = valore == null ? "" : String.valueOf(valore).replace("\"", "").trim();
    if ("1".equals(s)) tieniLoSchermo(true);
    else if ("0".equals(s)) tieniLoSchermo(false);
    else {
      if (!avvisatoMuto) {
        avvisatoMuto = true;
        Log.i("GiocoJS", "non so se si sta giocando (risposta: " + s
            + "): tengo lo schermo acceso, com'era prima");
      }
      tieniLoSchermo(true);
    }
  }

  /** l'unico punto che tocca il flag, e solo quando la risposta cambia */
  private void tieniLoSchermo(boolean si) {
    if (si == schermoTenuto) return;      // non si sveglia la finestra per niente
    schermoTenuto = si;
    if (si) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    Log.i("GiocoJS", "schermo tenuto acceso: " + si);
  }

  /** barre di sistema nascoste, ma richiamabili con una strisciata */
  private void schermoIntero() {
    View d = getWindow().getDecorView();
    d.setSystemUiVisibility(
        View.SYSTEM_UI_FLAG_LAYOUT_STABLE
      | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
      | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
      | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
      | View.SYSTEM_UI_FLAG_FULLSCREEN
      | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
  }

  @Override
  public void onWindowFocusChanged(boolean haIlFuoco) {
    super.onWindowFocusChanged(haIlFuoco);
    if (haIlFuoco) schermoIntero();
  }

  @Override
  protected void onPause() {
    super.onPause();
    if (vista != null) vista.onPause();
    /* niente domande alla pagina mentre l'app non e' davanti: sarebbero
       IPC pagati per una risposta che non serve a nessuno */
    orologio.removeCallbacks(sonda);
  }

  @Override
  protected void onResume() {
    super.onResume();
    if (vista != null) vista.onResume();
    schermoIntero();
    /* si riparte con lo stesso passo: al ritorno da una telefonata la
       partita puo' essere in pausa, e lo schermo va lasciato spegnere */
    orologio.removeCallbacks(sonda);
    if (sonda != null) orologio.postDelayed(sonda, PASSO);
  }

  /* Il tasto Indietro.
     Il gioco è una pagina sola: non esiste una cronologia da percorrere a
     ritroso, quindi senza questo codice ogni pressione chiuderebbe l'app —
     anche a metà partita. Si chiede invece al gioco stesso, che sa dove ci
     si trova: chiude un pannello, mette in pausa, risale al menu. Solo
     quando risponde "non ho nulla da annullare" si esce, e comunque non al
     primo colpo: serve una seconda pressione entro due secondi. */
  private long ultimoIndietro = 0;

  @Override
  public void onBackPressed() {
    if (vista == null) { super.onBackPressed(); return; }
    vista.evaluateJavascript(
        "(function(){try{return (window.__indietro && window.__indietro())?1:0}catch(e){return 0}})()",
        new Risposta(this));
  }

  /** chiamato quando il gioco non ha saputo che farsene del tasto Indietro */
  void chiediSeUscire() {
    long ora = System.currentTimeMillis();
    if (ora - ultimoIndietro < 2000) { finish(); return; }
    ultimoIndietro = ora;
    Toast.makeText(this, "Premi di nuovo per uscire", Toast.LENGTH_SHORT).show();
  }

  @Override
  protected void onDestroy() {
    /* prima di buttare la vista si spegne la sonda: un postDelayed vivo
       su una WebView distrutta e' una NullPointerException a 5 secondi */
    orologio.removeCallbacks(sonda);
    if (vista != null) { vista.destroy(); vista = null; }
    super.onDestroy();
  }
}

/** L'orologio della sonda dello schermo. Classe a se' e non anonima per
    lo stesso motivo delle altre: d8 delle build-tools 34 si rompe sulle
    classi anonime prodotte da javac recenti. */
class Sonda implements Runnable {
  private final Gioco schermo;
  Sonda(Gioco g) { schermo = g; }
  @Override
  public void run() { schermo.chiediSeSiGioca(); }
}

/** Raccoglie la risposta della pagina alla domanda «si sta giocando?».
    ValueCallback senza parametro di tipo, come Risposta: coi generici
    javac aggiunge un metodo ponte e un attributo Signature, e il d8
    delle build-tools 34 ci si rompe sopra. */
@SuppressWarnings("rawtypes")
class RispostaScena implements ValueCallback {
  private final Gioco schermo;
  RispostaScena(Gioco g) { schermo = g; }
  @Override
  public void onReceiveValue(Object valore) { schermo.rispostaScena(valore); }
}

/* Classi a se' stanti e non anonime: d8 delle build-tools 34 va in errore
   sulle classi anonime prodotte da javac recenti. */
class Cronaca extends WebChromeClient {
  @Override
  public boolean onConsoleMessage(ConsoleMessage m) {
    Log.i("GiocoJS", m.message() + "   (riga " + m.lineNumber() + ")");
    return true;
  }
}

/** raccoglie la risposta del gioco alla pressione del tasto Indietro.
    ValueCallback e' usato senza parametro di tipo di proposito: con i
    generici javac aggiunge un metodo ponte e un attributo Signature, e il
    d8 delle build-tools 34 ci si rompe sopra. */
@SuppressWarnings("rawtypes")
class Risposta implements ValueCallback {
  private final Gioco schermo;
  Risposta(Gioco g) { schermo = g; }
  @Override
  public void onReceiveValue(Object valore) {
    if (!"1".equals(valore)) schermo.chiediSeUscire();
  }
}

/** Le due bande laterali in fondo, dove stanno i comandi del gioco: il
    sistema non ci fa nascere i suoi gesti di bordo.

    Sta su un ascoltatore di layout, e non in una riga sola dentro
    onCreate, per due motivi: in onCreate la vista non ha ancora una
    misura (0x0, e un rettangolo vuoto non esclude niente), e alla
    rotazione la misura cambia. Rimetterli a ogni layout e' l'unico modo
    perche' siano giusti in tutti e due i casi.

    Le misure sono in dp convertiti in px della vista, non in px CSS della
    pagina: 130 dp di larghezza contengono la presa del disco grande
    (58 dp dal centro, che sta a 64 dp dal bordo) e 140 dp di altezza
    contengono la fascia intera dei due dischi (il piu' alto arriva a
    120 dp dal fondo). Il tetto di Android e' 200 dp per bordo: ci si sta
    dentro, quindi l'esclusione vale tutta. */
class Bordi implements View.OnLayoutChangeListener {
  @Override
  public void onLayoutChange(View v, int sx, int su, int dx, int giu,
                             int vsx, int vsu, int vdx, int vgiu) {
    int larghezza = dx - sx, altezza = giu - su;
    if (larghezza <= 0 || altezza <= 0) return;
    float dp = v.getResources().getDisplayMetrics().density;
    int banda = Math.round(130 * dp);            // quanto entra dal lato
    int alta = Math.round(140 * dp);             // quanto sale dal fondo
    if (banda > larghezza / 2) banda = larghezza / 2;
    if (alta > altezza) alta = altezza;
    List<Rect> zone = new ArrayList<Rect>();
    zone.add(new Rect(0, altezza - alta, banda, altezza));
    zone.add(new Rect(larghezza - banda, altezza - alta, larghezza, altezza));
    v.setSystemGestureExclusionRects(zone);
  }
}
