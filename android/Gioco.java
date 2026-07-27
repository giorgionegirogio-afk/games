package it.dopolavoro.gioco;

import android.app.Activity;
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

/**
 * Un guscio minimo attorno al gioco.
 *
 * Il gioco è un unico file HTML dentro gli asset: niente rete, niente
 * permessi, niente librerie. Questa classe fa tre cose e basta:
 *   1. apre una WebView a schermo intero sul file del gioco;
 *   2. tiene lo schermo acceso mentre l'app è in primo piano;
 *   3. fa funzionare il tasto Indietro come ci si aspetta.
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
