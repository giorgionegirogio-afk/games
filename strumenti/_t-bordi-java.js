/* =====================================================================
   _t-bordi-java.js — LA TOPPA ALLA SHELL ANDROID.

   ####################################################################
   ##  QUESTA TOPPA NON SI APPLICA, E IL RIFIUTO E' ESEGUIBILE:      ##
   ##  lanciata cosi' com'e' esce 3 e non scrive niente. Il divieto   ##
   ##  sta nel codice, poche righe sotto, non in questo riquadro.    ##
   ####################################################################

   IL 19 AGOSTO 2026 E' STATA MISURATA SUL TELEFONO VERO, E LA MISURA LA
   BLOCCA. OnePlus 6, Android 11, pagina 810x384 CSS a dpr 2,8125, con
   l'APK di prova costruito apposta e i tocchi scritti sul kernel
   (/dev/input/event2, strumenti/_vetro.js). Ogni campione con il suo
   controllo positivo appiccicato: se il dito non arrivava, il campione
   veniva buttato invece che contato come «il sistema me l'ha rubato».

   Questa toppa toglie ad Android il diritto di rubare il gesto sui 200 dp
   bassi dei bordi verticali. Per sapere che cosa succede DOPO averglielo
   tolto, la stessa condizione si e' riprodotta senza ricostruire niente:
   il telefono e' stato messo a NAVIGAZIONE A TRE TASTI
   (`cmd overlay disable ...navbar.gestural` + `enable ...navbar.threebutton`,
   verificato `settings get secure navigation_mode` = 0 e non fidandosi
   dell'etichetta). In quello stato la striscia rubata misura ZERO su
   tutt'e tre i bordi — che e' il controllo che dice che l'esperimento e'
   davvero avvenuto.

   COL FURTO (com'e' oggi):     strisciata dal bordo destro -> 0 calci su 6,
                                0 comandi su 6, ma LA PARTITA VA IN PAUSA 3 su 6.
   SENZA FURTO (cio' che questa toppa creerebbe):
                                3 CALCI su 6 e 3 COMANDI NON CHIESTI su 6,
                                uguale sul gioco base e su quello toppato.

   E SE NE CONOSCE LA CAUSA, che non e' quella che si sarebbe indovinata.
   Registrando le coordinate che la PAGINA riceve: il dito scende a VW-3,
   ma il primo `touchstart` consegnato alla pagina arriva 32 o 48 px PIU'
   DENTRO (in 6 casi su 8; negli altri 2 arriva dov'e' sceso davvero). I
   primi campioni al bordo se li tiene la catena d'ingresso. Quel
   touchdown finto cade DENTRO la presa del pulsante grande — a x 759 il
   centro dista 13 px — e il gioco lo legge come una pressione: startCharge
   al tocco, releaseCharge/fireShot/kickBall al rilascio. Un tiro che
   nessuno ha chiesto.

   PERCHE' PIU' MARGINE NON RISOLVE: lo scostamento misurato (fino a 48 px)
   e' piu' grande della presa intera (50 px) e di qualunque margine
   ragionevole. Il problema non e' dove sta il comando: e' che il sistema
   dichiara il dito altrove. Serve un'altra riparazione — per esempio che
   Touch5.start rifiuti un touchdown il cui primo movimento e' una
   strisciata veloce verso l'interno partita dal bordo — e finche' non
   c'e', questa toppa scambierebbe «la partita va in pausa» con «il gioco
   tira da solo». Il secondo e' peggio.

   RIPRODURRE LA MISURA:
     node strumenti/_t-bordi-prova.js --telefono <pkg> --navigazione threebutton
     node strumenti/_t-bordi-prova.js --telefono <pkg> --navigazione gestural
   Lo strumento rimette la navigazione com'era prima di uscire.

   CAUTELA DICHIARATA: il dito e' sintetico (scritto sul dispositivo del
   kernel). Lo scostamento nasce SOPRA il kernel, quindi un dito vero
   percorre la stessa strada; ma con un dito umano non l'ho verificato.

   UNA COSA CHE QUESTA TOPPA NON DEVE PIU' FARE. Il cambio 3 qui sotto
   raddrizza il commento di Gioco.java che dichiarava «il gioco usa gia'
   env(safe-area-inset-*)» quando le occorrenze erano zero. Quel commento
   NON E' PIU' FALSO senza bisogno di questa toppa: appena si applica
   _t-bordi.js il gioco le env() le usa davvero (sonda #inserti), e sul
   telefono l'ha dimostrato leggendo env(safe-area-inset-left) = 29 px —
   la tacca del OnePlus 6 in orizzontale. La bugia si e' chiusa dalla
   parte del gioco, che era la parte giusta.

   --------------------------------------------------------------------
   Quello che segue e' il testo della toppa com'era concepita, e resta
   qui perche' la riparazione va finita, non buttata.

   Compagna di _t-bordi.js, e SEPARATA perche' costa una cosa che l'altra
   non costa: L'APK VA RICOSTRUITO (python android/costruisci.py). Finche'
   non lo si ricostruisce, sul telefono vive solo meta' della riparazione
   — che e' comunque la meta' che tiene la presa dentro il bordo.

   COSA MANCA OGGI ALLA SHELL, verificato leggendola: android/Gioco.java
   non nomina mai setSystemGestureExclusionRects, non legge mai
   WindowInsets, e in testa a onCreate dichiara «il gioco usa gia'
   env(safe-area-inset-*) nel proprio CSS» — che al 19 agosto 2026 era
   falso, zero occorrenze nel file del gioco. Una shell che chiede la
   deroga sulla tacca per conto di un CSS che non la usa.

   COSA AGGIUNGE QUESTA TOPPA, due cose e nessuna in piu'.

   1. I RIQUADRI DI PRESA SI ESCLUDONO DAL GESTO.
      setSystemGestureExclusionRects (API 29) dice al sistema: «in questi
      rettangoli il gesto dal bordo non e' tuo». Android ne accetta al
      massimo 200 dp di altezza per ciascun bordo verticale, ed e' un
      tetto duro: chiederne di piu' non fa errore, fa peggio — il sistema
      taglia e non si sa dove. Qui si chiedono esattamente due rettangoli
      di 200 dp x 300 dp negli angoli bassi: a destra ci vivono i due
      comandi, a sinistra la levetta (che non ha una posizione fissa, ma
      nasce dove cade il pollice, e il pollice sinistro riposa li').
      QUESTO NON COPRE IL FONDO: la strisciata dell'home non e'
      escludibile da nessuna app, per nessun motivo. Il margine dal fondo
      deve venire dalla geometria, ed e' per questo che _t-bordi.js
      arretra il comando grande di dieci pixel invece di limitarsi a
      chiedere l'esclusione.

   2. GLI INSERTI DEL GESTO ARRIVANO AL GIOCO.
      Non esiste una env() per la striscia del gesto: il CSS conosce la
      safe area (tacca, barre) e non conosce la zona in cui il tocco viene
      rubato. La shell invece la sa — WindowInsets.getSystemGestureInsets()
      — e la sensibilita' del gesto e' una IMPOSTAZIONE dell'utente, che
      su Android puo' portarla ben oltre i 24 dp nominali. Quindi la shell
      legge i quattro numeri, li divide per la densita' (su una WebView a
      width=device-width un px CSS e' un dp: la divisione e' la
      conversione, non un'approssimazione) e li consegna alla pagina in
      window.__insertiSistema, poi chiama window.__insertiCambiati().
      Da quel momento il gioco non usa piu' il minimo di casa ma IL NUMERO
      DEL TELEFONO CHE SI HA IN MANO. E' la differenza fra un margine
      stimato e un margine misurato.

   PERCHE' CLASSI CON UN NOME E NON ANONIME: la nota gia' in fondo a
   Gioco.java. Il d8 delle build-tools 34 si rompe sulle classi anonime
   prodotte da javac recente, e sui generici. Qui i due ascoltatori sono
   classi di primo livello e la lista dei rettangoli e' un ArrayList
   GREZZO di proposito.

   uso: node strumenti/_t-bordi-java.js android/Gioco.java uscita/Gioco.java
   DOPO: python android/costruisci.py    (l'APK va rifatto, senza non vale)
   E PRIMA: leggere il DIVIETO ESEGUIBILE qui sotto, che non e' prosa.
   ===================================================================== */
const fs = require('fs');

/* =====================================================================
   IL DIVIETO E' QUESTO, e sta nel codice perche' un divieto scritto solo
   in un commento non e' un divieto.

   La prima edizione di questo file diceva in testa, a lettere maiuscole,
   «QUESTA TOPPA NON SI APPLICA». Poi la si lanciava e scriveva il file,
   uscendo ZERO. Il critico l'ha provato in due righe di terminale, e
   aveva ragione: una toppa che si dichiara dannosa con la propria misura
   e che poi si applica a chiunque la lanci ha esattamente il difetto che
   questa casa passa la giornata a togliere dagli strumenti — attestare
   invece di fare.

   LA MISURA CHE BLOCCA (OnePlus 6, Android 11, 19 agosto 2026, dita vere
   scritte su /dev/input): togliendo ad Android il furto del gesto, una
   strisciata dal bordo destro all'altezza del pulsante grande passa da
   «0 calci e 0 comandi, ma la partita va in pausa» a «3 calci su 6 e 3
   comandi non chiesti su 6». La causa non e' la geometria: il primo
   touchstart consegnato alla pagina arriva fino a 48 px PIU' DENTRO del
   punto in cui il dito e' sceso, cioe' dentro la presa del comando.
   Nessun margine copre uno scostamento piu' grande della presa intera.

   PERCHE' UNA VARIABILE D'AMBIENTE E NON UNA RIGA CANCELLATA: la
   riparazione non e' sbagliata, e' INCOMPLETA — le manca il rifiuto del
   touchdown che nasce da una strisciata dal bordo. Chi la finisce deve
   poterla costruire e misurare; chi passa di qui per sbaglio no. Il nome
   della variabile e' lungo apposta: non lo si scrive per distrazione.
   ===================================================================== */
const CHIAVE = 'TOPPA_JAVA_BORDI_RIMISURATA';
const PAROLA = 'ho-rimisurato-sul-telefono';
if (process.env[CHIAVE] !== PAROLA) {
  console.error('QUESTA TOPPA E\' BLOCCATA, e il blocco e\' una misura, non un\'opinione.');
  console.error('');
  console.error('  Sul telefono vero (OnePlus 6, Android 11, 19 agosto 2026) applicarla');
  console.error('  PEGGIORA il gioco: senza il furto del gesto una strisciata dal bordo');
  console.error('  destro produce 3 calci su 6 e 3 comandi non chiesti su 6, contro 0 e 0');
  console.error('  di adesso. La causa e\' il touchdown consegnato fino a 48 px piu\' dentro');
  console.error('  di dov\'e\' sceso il dito: e\' piu\' grande della presa (50 px), quindi non');
  console.error('  la copre nessun margine. Serve prima che Touch5.start rifiuti un');
  console.error('  touchdown nato da una strisciata dal bordo.');
  console.error('');
  console.error('  Riprodurre la misura che blocca:');
  console.error('    node strumenti/_t-bordi-prova.js --telefono <pkg> --navigazione threebutton');
  console.error('    node strumenti/_t-bordi-prova.js --telefono <pkg> --navigazione gestural');
  console.error('');
  console.error(`  Se l'hai rifatta e il numero e' cambiato:  set ${CHIAVE}=${PAROLA}`);
  process.exit(3);
}
console.error(`ATTENZIONE: ${CHIAVE} e' impostata, il divieto e' stato scavalcato a mano.`);
console.error('Chi la applica si prende i 3 calci su 6 finche\' non li ha rimisurati.');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------ 1 */
cambio('1. import — Rect e WindowInsets',
`import android.app.Activity;
import android.os.Build;`,
`import android.app.Activity;
import android.graphics.Rect;
import android.os.Build;`);

cambio('2. import — WindowInsets accanto a Window',
`import android.view.Window;
import android.view.WindowManager;`,
`import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowManager;`);

/* ------------------------------------------------------------------ 3
   Il commento che dichiarava una cosa non vera. */
cambio('3. il commento sulla tacca diceva il falso',
`    /* si disegna anche sotto la tacca del telefono: il gioco usa gia'
       env(safe-area-inset-*) nel proprio CSS */`,
`    /* Si disegna anche sotto la tacca del telefono. QUESTA RIGA HA AVUTO
       TORTO PER SETTIMANE: diceva «il gioco usa gia' env(safe-area-inset-*)
       nel proprio CSS», e nel file del gioco quelle env() erano ZERO. Si
       prendeva la deroga senza pagarne il prezzo, e il prezzo lo pagava il
       pollice destro. Da oggi e' vera: il gioco legge gli inserti (vedi la
       sonda #inserti nel suo CSS) e questa shell gli consegna anche quelli
       del GESTO, che il CSS non puo' conoscere — vedi riportaInserti. */`);

/* ------------------------------------------------------------------ 4
   Gli ascoltatori e i due metodi nuovi. */
cambio('4. onCreate — ascoltatori degli inserti e dei riquadri',
`    setContentView(vista);
    schermoIntero();
    vista.loadUrl("file:///android_asset/" + fileDelGioco());
  }`,
`    setContentView(vista);
    schermoIntero();

    /* IL GESTO DI SISTEMA NON DEVE ARRIVARE SOTTO I COMANDI.
       Due ascoltatori, e nessuno dei due indovina niente:
         · Inserti  legge gli inserti veri quando il sistema li consegna
                    (rotazione, cambio di modalita' di navigazione,
                    cambio di sensibilita' del gesto) e li passa al gioco;
         · Riquadri riapplica i rettangoli di esclusione a ogni layout,
                    perche' dipendono dalla misura della vista e quella
                    cambia con la rotazione.
       requestApplyInsets forza il primo giro: senza, su una finestra
       immersiva l'ascoltatore puo' non essere chiamato prima che la
       pagina sia gia' in piedi. */
    vista.setOnApplyWindowInsetsListener(new Inserti(this));
    vista.addOnLayoutChangeListener(new Riquadri());
    if (Build.VERSION.SDK_INT >= 20) vista.requestApplyInsets();

    vista.loadUrl("file:///android_asset/" + fileDelGioco());
  }

  /* I RIQUADRI DI PRESA, SOTTRATTI AL GESTO DAL BORDO.
     Il tetto di Android e' 200 dp di altezza per ciascun bordo verticale:
     si chiede esattamente quello, non un pixel di piu', cosi' il sistema
     non deve tagliare a modo suo. In basso a destra vivono i due comandi,
     in basso a sinistra riposa il pollice della levetta.
     LA STRISCIATA DAL FONDO NON E' QUI E NON PUO' ESSERCI: l'home gesture
     non e' escludibile. Quel margine lo fa la geometria dei comandi. */
  static void escludiGesti(View v) {
    if (Build.VERSION.SDK_INT < 29) return;
    int w = v.getWidth(), h = v.getHeight();
    if (w <= 0 || h <= 0) return;
    float d = v.getResources().getDisplayMetrics().density;
    if (d <= 0) d = 1;
    int alta = Math.min(h, Math.round(200 * d));
    int larga = Math.min(w / 2, Math.round(300 * d));
    /* ArrayList GREZZO di proposito: coi generici javac aggiunge un
       attributo Signature e il d8 delle build-tools 34 ci si rompe sopra
       (stessa ragione della nota in fondo al file). */
    java.util.ArrayList riquadri = new java.util.ArrayList();
    riquadri.add(new Rect(0, h - alta, larga, h));
    riquadri.add(new Rect(w - larga, h - alta, w, h));
    v.setSystemGestureExclusionRects(riquadri);
  }

  /* GLI INSERTI DEL GESTO, CONSEGNATI AL GIOCO.
     Il CSS conosce la safe area e NON conosce la zona in cui il sistema
     ruba il tocco: quella la sa solo qui. Si convertono in px CSS
     dividendo per la densita' — su una WebView a width=device-width e
     initial-scale=1 un px CSS e' un dp, quindi e' una conversione esatta
     e non una stima — e si passano alla pagina, che li usa al posto del
     proprio minimo quando sono piu' larghi. */
  void riportaInserti(View v, WindowInsets in) {
    escludiGesti(v);
    if (Build.VERSION.SDK_INT < 29 || vista == null) return;
    android.graphics.Insets g = in.getSystemGestureInsets();
    float d = v.getResources().getDisplayMetrics().density;
    if (d <= 0) d = 1;
    int l = Math.round(g.left / d), r = Math.round(g.right / d);
    int t = Math.round(g.top / d),  b = Math.round(g.bottom / d);
    String js = "window.__insertiSistema={l:" + l + ",r:" + r + ",t:" + t + ",b:" + b + "};"
              + "if(window.__insertiCambiati)window.__insertiCambiati();";
    try { vista.evaluateJavascript(js, null); } catch (Exception e) { /* pagina non ancora pronta */ }
    Log.i("GiocoJS", "inserti del gesto in px CSS: l=" + l + " r=" + r + " t=" + t + " b=" + b);
  }`);

/* ------------------------------------------------------------------ 5
   Le due classi con un nome. */
cambio('5. le due classi non anonime',
`/* Classi a se' stanti e non anonime: d8 delle build-tools 34 va in errore
   sulle classi anonime prodotte da javac recenti. */
class Cronaca extends WebChromeClient {`,
`/* Classi a se' stanti e non anonime: d8 delle build-tools 34 va in errore
   sulle classi anonime prodotte da javac recenti. */

/** Prende gli inserti dal sistema e li gira all'Activity, poi lascia che
    la vista faccia il suo lavoro di sempre: restituire il risultato di
    v.onApplyWindowInsets(in) e' quello che tiene in piedi il
    comportamento predefinito. Ingoiare gli inserti qui spegnerebbe la
    safe area anche per il CSS. */
class Inserti implements View.OnApplyWindowInsetsListener {
  private final Gioco schermo;
  Inserti(Gioco g) { schermo = g; }
  @Override
  public WindowInsets onApplyWindowInsets(View v, WindowInsets in) {
    try { schermo.riportaInserti(v, in); } catch (Exception e) { }
    return v.onApplyWindowInsets(in);
  }
}

/** I rettangoli di esclusione dipendono dalla misura della vista, che
    cambia con la rotazione: si riapplicano a ogni layout invece di una
    volta sola all'avvio. */
class Riquadri implements View.OnLayoutChangeListener {
  @Override
  public void onLayoutChange(View v, int sx, int su, int dx, int giu,
                             int vsx, int vsu, int vdx, int vgiu) {
    if (sx != vsx || su != vsu || dx != vdx || giu != vgiu) Gioco.escludiGesti(v);
  }
}

class Cronaca extends WebChromeClient {`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_t-bordi-java.js ingresso.java uscita.java'); process.exit(2); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: ancoraggio trovato ${n} volte (ne serve 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
fs.writeFileSync(usc, t);
console.log(`toppa applicata: ${CAMBI.length} cambi, ${ing} -> ${usc}`);
console.log('ATTENZIONE: questa toppa vive nell\'APK, non nel file HTML.');
console.log('Senza  python android/costruisci.py  sul telefono non cambia niente.');
