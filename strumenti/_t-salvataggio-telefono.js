/* =====================================================================
   _t-salvataggio-telefono.js — IL BACKUP DI ANDROID PRESERVA DAVVERO IL
   SALVATAGGIO? La domanda che il censimento lascia aperta come «non
   verificato», e che un browser non puo' chiudere.

   IL CONTESTO. Il manifest dichiara android:allowBackup="true" senza
   regole di backup. Se il backup automatico di Android comprende la
   cartella della WebView, allora il salvataggio del giocatore viaggia col
   telefono e sopravvive alla disinstallazione; se non la comprende, chi
   cambia telefono ricomincia da zero. Nessuno l'aveva mai provato.

   COSA PROVA QUESTO STRUMENTO, esattamente e non un dito di piu':
   che il SET DI BACKUP CONTIENE il salvataggio del gioco. Si scrive una
   sentinella nel salvataggio, si manda l'app in sottofondo (che e' cio'
   che fa scrivere su disco la coda differita di Chromium: sta nel
   quaderno di casa), si fa un backup vero col trasporto locale di
   Android, si cambia la sentinella, si ripristina, e si guarda quale
   delle due sentinelle torna a galla.

   COSA NON PROVA, e va detto invece di lasciarlo credere:
     · non prova il giro «disinstallo e reinstallo su un telefono nuovo»:
       li' entrano in gioco l'account, la rete e il trasporto di Google,
       non il trasporto locale;
     · non prova che il backup di Google (quello vero, sul cloud) faccia
       la stessa scelta di cartelle del trasporto locale — la regola di
       inclusione e' la stessa del sistema, ma il trasporto e' un altro;
     · non dice NIENTE su cosa fa un altro telefono, un'altra versione di
       Android o un utente che ha il backup spento.

   uso:  node strumenti/_t-salvataggio-telefono.js
   Uscite: 0 il backup contiene il salvataggio · 1 NON lo contiene
           3 la prova e' nulla (niente adb, niente telefono, backup spento,
             app non installata: si dichiara, non si inventa)
   ===================================================================== */
const path = require('path');
const { execFileSync } = require('child_process');

const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = PACCHETTO + '/it.dopolavoro.gioco.Gioco';
const LOCALE = 'com.android.localtransport/.LocalTransport';

function trovaAdb() {
  const sdk = (process.env.ANDROID_SDK || process.env.ANDROID_HOME || path.join(process.env.USERPROFILE || '', 'Android', 'Sdk'));
  for (const c of ['adb', path.join(sdk, 'platform-tools', 'adb.exe'), path.join(sdk, 'platform-tools', 'adb')]) {
    try { execFileSync(c, ['version'], { stdio: 'pipe', timeout: 20000 }); return c; } catch (e) { }
  }
  return null;
}
const adb = trovaAdb();
if (!adb) { console.log('PROVA NULLA: adb non c\'e\' ne\' nel PATH ne\' nell\'SDK.'); process.exit(3); }
let lista = '';
try { lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 }); } catch (e) { console.log('PROVA NULLA: adb devices non risponde.'); process.exit(3); }
const disp = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
if (!disp.length) { console.log('PROVA NULLA: nessun telefono collegato.'); process.exit(3); }
const dev = disp[0];
const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
const shq = (...a) => { try { return sh(...a); } catch (e) { return 'ERRORE: ' + String(e.message).split('\n')[0]; } };
const attendi = ms => new Promise(r => setTimeout(r, ms));

/* --- il filo con la WebView (stesso attrezzo di avvio.js) ------------- */
function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url);
    let n = 0, morto = false; const attesa = new Map();
    const scaduto = setTimeout(() => no(new Error('la WebView non risponde')), 20000);
    const uccidi = () => { morto = true; clearTimeout(scaduto); for (const [, r] of attesa) r({ morto: true }); attesa.clear(); };
    ws.onclose = uccidi;
    ws.onerror = () => { };
    /* SENZA QUESTA RIGA lo strumento e' cieco: i comandi partono e vengono
       eseguiti davvero sul telefono, ma nessuna risposta viene mai
       riconsegnata a chi l'aspetta — e ogni lettura torna «non misurato»
       dopo venti secondi di attesa. E' successo alla prima stesura, e
       sembrava un difetto del telefono. */
    ws.onmessage = ev => {
      const m = JSON.parse(ev.data);
      if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m); attesa.delete(m.id); }
    };
    ws.onopen = () => {
      clearTimeout(scaduto);
      ok({
        manda(metodo, params = {}) {
          if (morto) return Promise.resolve({ morto: true });
          const id = ++n;
          try { ws.send(JSON.stringify({ id, method: metodo, params })); } catch (e) { uccidi(); return Promise.resolve({ morto: true }); }
          return new Promise(res => { attesa.set(id, res); setTimeout(() => { if (attesa.has(id)) { attesa.delete(id); res({ scaduto: true }); } }, 20000); });
        },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}
async function conLaWebView(fai) {
  const unix = shq('shell', 'cat', '/proc/net/unix');
  const m = unix.match(/@(webview_devtools_remote_\S+)/);
  if (!m) return { errore: 'la WebView non espone il socket di debug (debug USB spento?)' };
  shq('forward', 'tcp:9222', 'localabstract:' + m[1]);
  try {
    let pagina = null;
    for (let i = 0; i < 40 && !pagina; i++) {
      try {
        const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
        pagina = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      } catch (e) { }
      if (!pagina) await attendi(500);
    }
    if (!pagina) return { errore: 'nessuna pagina nella WebView' };
    const c = await apriFilo(pagina.webSocketDebuggerUrl).catch(() => null);
    if (!c) return { errore: 'nessun filo con la WebView' };
    await c.manda('Runtime.enable');
    const out = await fai(c);
    c.chiudi();
    return out;
  } finally { shq('forward', '--remove', 'tcp:9222'); }
}
const valuta = async (c, espressione) => {
  const r = await c.manda('Runtime.evaluate', { expression: espressione, returnByValue: true, awaitPromise: true });
  return r && r.result && r.result.result ? r.result.result.value : undefined;
};

(async () => {
  console.log('=== IL BACKUP DI ANDROID E IL SALVATAGGIO — ' + dev + ' ===');
  const modello = shq('shell', 'getprop', 'ro.product.model').trim();
  const versione = shq('shell', 'getprop', 'ro.build.version.release').trim();
  console.log('telefono: ' + modello + ', Android ' + versione);

  if (!shq('shell', 'pm', 'list', 'packages', PACCHETTO).includes(PACCHETTO)) {
    console.log('PROVA NULLA: ' + PACCHETTO + ' non e\' installato. Non lo installo io: il telefono e\' di qualcun altro.');
    process.exit(3);
  }
  const abilitato = shq('shell', 'bmgr', 'enabled');
  console.log('gestore di backup: ' + abilitato.trim());
  if (!/currently enabled/i.test(abilitato)) {
    console.log('PROVA NULLA: su questo telefono il backup e\' SPENTO. Cio\' non dice niente su allowBackup: dice che qui non si puo\' misurare.');
    process.exit(3);
  }
  const trasporti = shq('shell', 'bmgr', 'list', 'transports');
  const attuale = (trasporti.split('\n').find(r => r.trim().startsWith('*')) || '').replace('*', '').trim();
  console.log('trasporto attivo prima della prova: ' + (attuale || '(sconosciuto)'));

  let esito = 3, ripristinaTrasporto = false;
  try {
    /* --- 1. la sentinella A, scritta nel salvataggio vero ------------- */
    const scriviSentinella = async (monete, nome) => {
      shq('shell', 'am', 'start', '-n', ATTIVITA);
      await attendi(6000);
      const r = await conLaWebView(async c => ({
        scritto: await valuta(c, 'try{ localStorage.setItem("calcetto_save_v4", JSON.stringify({v:4,coins:' + monete +
          ',teamName:"' + nome + '"})); localStorage.getItem("calcetto_save_v4"); }catch(e){ "ERRORE "+e.message }'),
      }));
      /* HOME: e' il passaggio in sottofondo che manda in scrittura la coda
         differita di Chromium — senza, un force-stop perde gli ultimi
         secondi (misurato e scritto nel quaderno di casa). */
      shq('shell', 'input', 'keyevent', '3');
      await attendi(3000);
      return r;
    };
    const a = await scriviSentinella(313370, 'SENTINELLA A');
    console.log('  --    sentinella A scritta: ' + JSON.stringify(a).slice(0, 160));
    if (a.errore) { console.log('PROVA NULLA: ' + a.errore); process.exit(3); }

    /* --- 2. un backup vero, col trasporto locale ---------------------- */
    console.log('  --    passo al trasporto locale: ' + shq('shell', 'bmgr', 'transport', LOCALE).trim());
    ripristinaTrasporto = true;
    const fatto = shq('shell', 'bmgr', 'backupnow', PACCHETTO);
    console.log('  --    backupnow:\n' + fatto.split('\n').map(r => '        ' + r).join('\n').trimEnd());
    const sets = shq('shell', 'bmgr', 'list', 'sets');
    console.log('  --    insiemi di backup:\n' + sets.split('\n').map(r => '        ' + r).join('\n').trimEnd());
    const mt = sets.match(/^\s*([0-9a-fA-F]+)\s*:/m) || sets.match(/([0-9a-fA-F]{6,})\s/);
    if (!/Success/i.test(fatto) || !mt) {
      console.log('PROVA NULLA: il backup non e\' riuscito o non ha lasciato un insieme da ripristinare.');
      process.exit(3);
    }
    const token = mt[1];

    /* --- 3. la sentinella B, che il ripristino deve spazzare via ------ */
    const b = await scriviSentinella(999, 'SENTINELLA B');
    console.log('  --    sentinella B scritta: ' + JSON.stringify(b).slice(0, 160));
    /* se la B non e' finita sul disco, il confronto dopo il ripristino non
       proverebbe niente: trovare la A vorrebbe dire soltanto che nessuno
       aveva mai scritto la B */
    if (!String(b.scritto || '').includes('999')) {
      console.log('PROVA NULLA: la sentinella B non risulta scritta, quindi il confronto non direbbe niente.');
      process.exit(3);
    }

    /* --- 4. il ripristino -------------------------------------------- */
    const rip = shq('shell', 'bmgr', 'restore', token, PACCHETTO);
    console.log('  --    restore ' + token + ':\n' + rip.split('\n').map(r => '        ' + r).join('\n').trimEnd());
    await attendi(3000);

    /* --- 5. chi e' tornato a galla ------------------------------------ */
    shq('shell', 'am', 'start', '-n', ATTIVITA);
    await attendi(7000);
    const letto = await conLaWebView(async c => ({
      raw: await valuta(c, 'try{ localStorage.getItem("calcetto_save_v4") }catch(e){ "ERRORE "+e.message }'),
      monete: await valuta(c, 'try{ (window.__test && window.__test.save) ? window.__test.save.coins : -1 }catch(e){ -2 }'),
    }));
    console.log('  --    dopo il ripristino: ' + JSON.stringify(letto).slice(0, 300));

    const raw = String(letto.raw || '');
    if (raw.indexOf('313370') >= 0) {
      console.log('\n  OK   il backup di Android CONTIENE il salvataggio: dopo il ripristino e\' tornata la');
      console.log('       sentinella A (313370), cioe\' il valore che c\'era al momento del backup, al posto');
      console.log('       della B (999) scritta dopo. Misurato su ' + modello + ', Android ' + versione +
        ', trasporto locale.');
      esito = 0;
    } else if (raw.indexOf('999') >= 0) {
      console.log('\n  NO   il backup di Android NON contiene il salvataggio: dopo il ripristino e\' rimasta la');
      console.log('       sentinella B (999), cioe\' il ripristino non ha toccato la cartella della WebView.');
      console.log('       Chi cambia telefono ricomincia da zero, e allowBackup="true" non lo protegge.');
      esito = 1;
    } else {
      console.log('\n  --   PROVA NULLA: dopo il ripristino non c\'e\' nessuna delle due sentinelle (' +
        raw.slice(0, 80) + '). Non si conclude niente.');
      esito = 3;
    }
  } catch (e) {
    console.log('PROVA NULLA: ' + String(e.message).split('\n')[0]);
    esito = 3;
  } finally {
    /* IL TELEFONO SI RESTITUISCE PULITO. Le sentinelle sono salvataggi
       finti: lasciarli li' vorrebbe dire consegnare al prossimo che
       accende il gioco una squadra che si chiama SENTINELLA A con 313370
       monete. Il salvataggio vero di prima non e' recuperabile — questa
       prova lo sovrascrive, e va detto — quindi si lascia lo stato di
       primo avvio, che e' l'unico stato neutro che esista. */
    try {
      shq('shell', 'am', 'start', '-n', ATTIVITA);
      await attendi(6000);
      const p = await conLaWebView(async c => ({
        fatto: await valuta(c, 'try{ window.__test.resetSave(); JSON.stringify(Object.keys(localStorage)); }catch(e){ "ERRORE "+e.message }'),
      }));
      shq('shell', 'input', 'keyevent', '3');
      console.log('  --    salvataggio del telefono riportato a primo avvio: ' + JSON.stringify(p).slice(0, 120));
    } catch (e) { console.log('  --    pulizia del telefono NON riuscita: ' + String(e.message).split('\n')[0]); }
    if (ripristinaTrasporto && attuale) console.log('  --    trasporto rimesso: ' + shq('shell', 'bmgr', 'transport', attuale).trim());
  }
  process.exit(esito);
})();
