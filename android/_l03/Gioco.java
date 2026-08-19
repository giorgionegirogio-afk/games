package it.dopolavoro.gioco;

import android.app.Activity;
import android.graphics.Rect;
import android.os.Build;
import android.os.Bundle;
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
 *   2. tiene lo schermo acceso mentre l'app è in primo piano;
 *   3. fa funzionare il tasto Indietro come ci si aspetta;
 *   4. dice al sistema che la fascia dei comandi non è sua (voce L0.3).
 */
public class Gioco extends Activity {

  private WebView vista;

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

    /* lo schermo non si spegne durante una partita */
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
    WebView.setWebContentsDebuggingEnabled(true);
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
  }

  @Override
  protected void onResume() {
    super.onResume();
    if (vista != null) vista.onResume();
    schermoIntero();
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
    if (vista != null) { vista.destroy(); vista = null; }
    super.onDestroy();
  }
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
