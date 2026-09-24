/* =====================================================================
   _toppa-147-chiudi.js — CHIUDI LASCIA DAVVERO LA PARTITA
   (voce #147, compito 4)

   IL DIFETTO, TROVATO LEGGENDO E MISURATO PRIMA DI CURARLO.

   Il pannello del compito 2 ha un bottone CHIUDI, e `Dischetto.chiudi`
   fa quel che il #146 gli aveva insegnato a fare: spegne il protocollo
   (`fase = 'fine'`, causa `chiuso`) e chiude il filo. Con
   `window.__test` quello bastava, perche' il banco non stava dentro una
   partita. Con un dito no: LA PARTITA RESTA IN PIEDI.

   E appena il protocollo e' spento il cancello sul duello non trattiene
   piu' niente — `trattiene()` e' falsa a fase `fine` — quindi
   `Duel.update` torna a girare per intero e la CPU riprende a tirare e a
   tuffarsi al posto delle due persone. Chi ha premuto CHIUDI resta
   chiuso dentro a guardare una serie di rigori che si gioca da sola.
   Nessuna eccezione, nessun rosso in console: solo una schermata da cui
   non si esce.

   MISURATO PRIMA DELLA CURA (strumenti/_q-volto.js B5, 24 settembre
   2026, sul gioco col pannello e il respiro):

     prima di CHIUDI: scena freekick · duello zone · in partita true
     dopo  di CHIUDI: scena freekick · duello zone · in partita true

   LA CURA: `chiudi` usa la porta che il gioco ha gia' — `abbandonaSfida()`
   — e rifa' la stessa uscita del bottone ABBANDONA della pausa
   (`hideAllScreens`, `hide(ui.duel)`, `show(ui.menu)`, `setScene('menu')`,
   la folla che tace). Poi riapre SFIDA e lascia aperto il pannello: chi
   ha chiuso una sfida vuole vedere che e' chiusa, non ritrovarsi al
   menu senza sapere che cos'e' successo.

   E SI FA SOLO SE LA PARTITA E' DEL DISCHETTO (`G.sfida.chi ===
   'DISCHETTO'`): `chiudi()` si chiama anche dal banco su una pagina che
   non ha nessuna partita aperta, e uscire da una partita che non c'e'
   spegnerebbe il registro di qualcun altro.

   uso:  node strumenti/_toppa-147-chiudi.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const A1 = `  const veroChiudi = Dischetto.chiudi;
  Dischetto.chiudi = function(){
    this.fermaGuida();
    this.barra = null;
    try{ const f = document.getElementById('dsFascia'); if(f) hide(f); }catch(e){}
    return veroChiudi.call(this);
  };`;

const B1 = `  const veroChiudi = Dischetto.chiudi;
  Dischetto.chiudi = function(){
    this.fermaGuida();
    this.barra = null;
    try{ const f = document.getElementById('dsFascia'); if(f) hide(f); }catch(e){}
    const r = veroChiudi.call(this);
    /* =====================================================================
       E SI ESCE DALLA PARTITA (voce #147, compito 4).

       Senza queste righe CHIUDI spegne il protocollo e lascia la partita
       in piedi; e appena il protocollo e' spento il cancello sul duello
       non trattiene piu' niente, quindi la CPU riprende a tirare e a
       tuffarsi al posto delle due persone. Chi ha premuto CHIUDI resta
       chiuso dentro a guardare una serie che si gioca da sola.
       MISURATO prima della cura (_q-volto B5): scena freekick, duello
       zone e partita viva sia prima sia dopo il CHIUDI.

       Si usa la porta che il gioco ha gia' — abbandonaSfida(), la stessa
       del bottone ABBANDONA della pausa — e si rifa' la sua uscita.
       SOLO se la partita e' del dischetto: chiudi() si chiama anche dal
       banco su una pagina senza partita, e uscire da una partita che non
       c'e' spegnerebbe il registro di qualcun altro. */
    try{
      if(G.sfida && G.sfida.chi === 'DISCHETTO'){
        abbandonaSfida();
        Duel.phase = 'off';
        G.paused = false; hide(ui.pausa);
        hideAllScreens(); hide(ui.duel); show(ui.menu);
        setScene('menu'); Audio5.crowdLevel(0);
        /* e si torna dove si era: chi ha chiuso una sfida vuole vedere
           che e' chiusa, non ritrovarsi al menu senza sapere perche' */
        Sfida.apri();
        this.mostra();
      }
    }catch(e){}
    return r;
  };`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-147-chiudi.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(A1).length - 1;
if (n !== 1) { console.error('TOPPA NON APPLICATA: ancora trovata ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(A1, B1);
if (t.split('abbandonaSfida();').length - 1 !== 4) {
  console.error('TOPPA NON APPLICATA: abbandonaSfida() non compare quattro volte come atteso'); process.exit(1);
}
fs.writeFileSync(usc, t);
console.log('toppa applicata: CHIUDI lascia la partita, ' + ing + ' -> ' + usc);
