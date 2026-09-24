/* =====================================================================
   _toppa-147-pannello.js — IL PANNELLO DELLA SFIDA DAL DISCHETTO
   (voce #147, compito 2)

   OTTO ANCORE, e niente altro. Il gioco non si tocca con un Edit: si
   tocca solo di qui, e ogni ancora deve comparire UNA VOLTA SOLA.

   DOVE VA LA VOCE NUOVA, E PERCHE' NON COSTA UN PIXEL.

   Il commento accanto a `btnSfidaCarta` porta tre numeri che il #135
   ha pagato per misurare: CERCA AVVERSARIO chiude a 220, la prima riga
   a 329, il primo GUARDA a 308, e una voce sopra la lista spingerebbe
   la prima riga a 375 su una piega di 360. Tutti e tre i bersagli
   stanno SOPRA `btnSfidaCarta`, e in un flusso verticale la loro
   posizione dipende solo da cio' che li precede: percio' la voce nuova
   va DOPO la carta, e non puo' muoverli.

   MISURATO PRIMA (strumenti/_sonda-147-piega.js, merge-base 999fbf8,
   24 settembre 2026, identico a 800x360 e a 915x412):
     CERCA@220 · primaRiga@329 · GUARDA@308 · CARTA(vuota)@347
     MENU(vuota)@418 · altezza scorribile 466
   Il 418 dice una cosa che va detta: la riga delle azioni sta GIA'
   sotto la piega ai due formati, e `.ov` ha `overflow-y:auto`. In
   questa schermata «sotto la piega» vuol dire «una scrollata», non
   «perduto». La voce nuova si giudica con quel metro.

   IL PEZZO DURO: IL DITO CHE DIVENTA UNA MOSSA.

   Il protocollo del #146 pretende che la mossa si scelga AL BUIO e si
   impegni PRIMA di vedere quella dell'altro; le tre porte vere
   (pickZone/stopPower/pickKeeper) le chiama `risolviDuello` quando le
   due mosse sono sul tavolo. Quindi il dito NON puo' chiamarle: se le
   chiamasse, il duello si risolverebbe in locale, le righe di tipo 6
   uscirebbero doppie e `risolviDuello` non troverebbe mai
   `phase==='zone'`.

   Percio' le tre porte si avvolgono UNA SECONDA VOLTA, e questo
   avvolgimento sta FUORI da quello del nastro: il blocco del dischetto
   viene dopo (`Reg` avvolge le porte piu' in su nel file), e chi arriva
   dopo sta fuori. A cattura accesa — e si accende solo quando la fase
   e' `scegli` — le porte non passano: REGISTRANO.

   E UN CANCELLO SUL DUELLO, che e' anche l'immagine del cantiere.
   Con rAF vivo, `Duel.update` fa due cose che in una sfida fra due
   persone non deve fare: la CPU tira da se' (`s.pickZone((dado()*3)|0)`)
   e la CPU si tuffa da se'. In una partita del dischetto `startMatch(1,
   ...)` mette `G.cpu = [false, true]`, quindi meta' dei rigori avrebbe
   una macchina che decide al posto dell'altra persona — e consumerebbe
   `dado()`, cioe' il PRNG DI GIOCO. Finche' il dischetto aspetta, il
   duello avanza SOLO i suoi orologi di presentazione: nessuna CPU,
   nessuna fase, nessun sorteggio. E' il fiato trattenuto del progetto
   d'onda, ed e' anche la sua correttezza.

   E I DUE RUOLI SI DICONO LA VERITA'. Chi gioca dal lato `b` ha
   `mioTeam = 1` e `G.cpu[1]` vero: senza una riga il gioco gli
   scriverebbe «TIRA LA CPU» mentre tira lui. Di piu': nel rigore
   normale il portiere sceglie in fase `wait`, DOPO che il tiratore ha
   fermato la barra; qui i due scelgono insieme in fase `zone`. Quindi
   mentre si trattiene il fiato il dito passa SEMPRE dal gesto della
   mira, e a dividere i due ruoli e' la cattura, non il gestore del
   tocco.

   MOTORE_V NON SI MUOVE, e la ragione e' strutturale prima che
   misurata: ogni riga di questa toppa e' dentro un `if` che e' falso
   quando `Dischetto.s` e' `null`, cioe' in tutte le partite che
   esistevano ieri. Si misura lo stesso, nei due versi, in
   strumenti/_t-147-motorev.js.

   uso:  node strumenti/_toppa-147-pannello.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

/* ------------------------------------------------------------ 1. CSS */
const A1 = `#sfidaCodice,#sfidaCarta{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;
  background:rgba(3,10,6,.72);overflow-y:auto;overscroll-behavior:contain}
#sfidaCodice.hidden,#sfidaCarta.hidden{display:none}
#sfidaCodice .patto,#sfidaCarta .patto{max-width:460px;margin:16px;padding:20px 22px;text-align:left;position:relative;
  background:linear-gradient(180deg,#f2ecdb,#e3d9c0);color:#3a3020;
  font-family:var(--cond);font-weight:600;font-size:14.5px;line-height:1.5;
  box-shadow:0 8px 18px rgba(0,0,0,.6)}
#sfidaCodice .patto b,#sfidaCarta .patto b{font-weight:700}
#sfidaCodice .sf-nota,#sfidaCarta .sf-nota{font-size:12.5px;color:#5a4d33;margin-top:10px}
#sfidaCodice input,#sfidaCarta input{display:block;width:100%;box-sizing:border-box;margin:8px 0 2px;padding:8px 9px;
  font-family:var(--mono);font-weight:700;font-size:12px;letter-spacing:.04em;
  color:#20301a;background:#f8f3e6;border:1px solid #8d7c57;border-radius:2px}
#sfidaCodice .fbtn,#sfidaCarta .fbtn{margin-top:12px;margin-right:8px;color:#57492e;border-color:#b3a380;
  background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.08));
  box-shadow:0 2px 0 rgba(90,70,40,.4)}
#sfidaCodice .fbtn.paga,#sfidaCarta .fbtn.paga{background:linear-gradient(180deg,#ffc757,#e59200);border-color:#a86f00;color:#12210f}`;

const B1 = `#sfidaCodice,#sfidaCarta,#sfidaDischetto{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;
  background:rgba(3,10,6,.72);overflow-y:auto;overscroll-behavior:contain}
#sfidaCodice.hidden,#sfidaCarta.hidden,#sfidaDischetto.hidden{display:none}
#sfidaCodice .patto,#sfidaCarta .patto,#sfidaDischetto .patto{max-width:460px;margin:16px;padding:20px 22px;text-align:left;position:relative;
  background:linear-gradient(180deg,#f2ecdb,#e3d9c0);color:#3a3020;
  font-family:var(--cond);font-weight:600;font-size:14.5px;line-height:1.5;
  box-shadow:0 8px 18px rgba(0,0,0,.6)}
#sfidaCodice .patto b,#sfidaCarta .patto b,#sfidaDischetto .patto b{font-weight:700}
#sfidaCodice .sf-nota,#sfidaCarta .sf-nota,#sfidaDischetto .sf-nota{font-size:12.5px;color:#5a4d33;margin-top:10px}
#sfidaCodice input,#sfidaCarta input,#sfidaDischetto input{display:block;width:100%;box-sizing:border-box;margin:8px 0 2px;padding:8px 9px;
  font-family:var(--mono);font-weight:700;font-size:12px;letter-spacing:.04em;
  color:#20301a;background:#f8f3e6;border:1px solid #8d7c57;border-radius:2px}
#sfidaCodice .fbtn,#sfidaCarta .fbtn,#sfidaDischetto .fbtn{margin-top:12px;margin-right:8px;color:#57492e;border-color:#b3a380;
  background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.08));
  box-shadow:0 2px 0 rgba(90,70,40,.4)}
#sfidaCodice .fbtn.paga,#sfidaCarta .fbtn.paga,#sfidaDischetto .fbtn.paga{background:linear-gradient(180deg,#ffc757,#e59200);border-color:#a86f00;color:#12210f}
/* =====================================================================
   IL TABELLONE DELLA SERIE (voce #147). Tre righe, e nessuna di piu':
   il codice della stanza in grande perche' e' la cosa da leggere ad
   alta voce a un amico, il punteggio, e i tiri gia' fatti come pallini.
   Un tabellone che dicesse anche i millisecondi della rete direbbe un
   numero che non serve a nessuno: il ritardo lo dice il fiato.
   ===================================================================== */
#sfidaDischetto{align-items:flex-start}
/* =====================================================================
   LA VOCE NUOVA E' UN BLOCCO, E NON E' UN GUSTO: E' UNA MISURA.
   .voce non dichiara display, quindi un <button> e' inline-block, e .box
   e' larga 640 a tutti i formati: due voci da ~300 px STANNO SULLA
   STESSA RIGA. Misurato (strumenti/_diag-147-voce.js, 24 settembre 2026,
   800x360): SFIDA DI CARTA e SFIDA DAL DISCHETTO tutte e due a 301-347.
   Costerebbe zero pixel di piega, ed e' stata la tentazione — ma e' una
   disposizione che non si puo' misurare una volta: basta un telefono
   piu' stretto, o una lingua con una parola piu' lunga, e le due voci
   vanno a capo. In quell'istante la piega si muove, e si muove a casa di
   qualcun altro, dove nessun banco guarda.
   Blocco: la voce sta sulla sua riga a ogni larghezza, e il prezzo si
   paga qui e si dichiara — la riga delle azioni scende di 56 px (TORNA
   AL MENU da 418 a 474), che in questa schermata e' una scrollata,
   perche' stava GIA' sotto la piega ai due formati e .ov scorre.
   ===================================================================== */
#btnSfidaDischetto{display:block;width:100%;margin-top:10px}
#dsMio{font-size:22px;letter-spacing:.34em;text-align:center;padding:10px 9px}
.ds-tab{margin-top:12px;padding:10px 12px;background:rgba(32,48,26,.08);border:1px solid #b3a380;border-radius:3px}
.ds-punti{font-family:var(--mono);font-weight:800;font-size:22px;letter-spacing:.06em;color:#20301a}
.ds-tiri{margin-top:6px;font-family:var(--mono);font-size:15px;letter-spacing:.16em;color:#5a4d33;min-height:18px}
/* LA FASCIA SOPRA IL DUELLO. E' position:fixed e non entra nel flusso
   di nessuna schermata: non puo' muovere nessuna piega, e questo e' il
   motivo per cui la serie si guarda di qui e non dal pannello — il
   duello ha bisogno dello schermo intero per la mira. */
#dsFascia{position:fixed;left:0;right:0;top:0;z-index:35;display:flex;align-items:center;justify-content:center;gap:10px;
  padding:5px 10px;background:rgba(3,10,6,.62);color:#f2f5ef;
  font-family:var(--cond);font-weight:700;font-size:13px;letter-spacing:.04em;pointer-events:none}
#dsFascia.hidden{display:none}
/* IL FIATO, E NON UN NUMERO DI MILLISECONDI. E' lo stesso oggetto del
   respiro (voce #147, compito 3): quando la rete e' brutta il fiato e'
   piu' lungo. Un oggetto, due significati, zero interfaccia nuova. */
#dsFiato{display:inline-block;width:46px;height:6px;border-radius:3px;background:rgba(242,245,239,.22);position:relative}
#dsFiato::after{content:'';position:absolute;left:0;top:0;bottom:0;width:var(--fiato,0%);border-radius:3px;background:#d6ff26}`;

/* ------------------------------------------------------- 2. LA VOCE */
const A2 = `    <button class="voce" id="btnSfidaCarta">SFIDA DI CARTA <small>un codice da incollare &middot; senza rete</small></button>`;
const B2 = `    <button class="voce" id="btnSfidaCarta">SFIDA DI CARTA <small>un codice da incollare &middot; senza rete</small></button>
    <!-- ============ LA SFIDA DAL DISCHETTO (voce #147) ============
         STA QUI, SOTTO LA CARTA, E IL POSTO E' MISURATO.
         I tre bersagli del commento qui sopra — CERCA AVVERSARIO (220),
         la prima riga (329), il primo GUARDA (308) — stanno tutti e tre
         SOPRA la carta, e in un flusso verticale niente che si
         inserisca dopo puo' muoverli. Misurato prima e dopo ai due
         formati (strumenti/_sonda-147-piega.js, 800x360 e 915x412):
         scarto ZERO su tutti e tre, e la carta a lista vuota resta a
         347. Il prezzo e' che la riga delle azioni scende — ma stava
         GIA' sotto la piega (418 su 412 e su 360) e .ov scorre: qui
         «sotto la piega» vuol dire una scrollata, non un bottone
         perduto.
         E' la sola voce di questa schermata che pretende che ci sia
         un'ALTRA PERSONA nello stesso momento: la sfida di rete non ha
         bisogno che l'avversario sia sveglio, la carta non ha bisogno
         nemmeno della rete, questa ha bisogno di tutte e due. Sta in
         fondo per quello. -->
    <button class="voce" id="btnSfidaDischetto">SFIDA DAL DISCHETTO <small>rigori con un amico, adesso &middot; un codice da mandare</small></button>`;

/* ------------------------------------------------------ 3. IL PANNELLO */
const A3 = `      qui sopra. <b>E non &egrave; il codice del cambio telefono:</b> quello si tiene per s&eacute;,
      perch&eacute; chi lo incolla diventa la tua squadra.</div>
    </div>
  </div>
</div>`;
const B3 = `      qui sopra. <b>E non &egrave; il codice del cambio telefono:</b> quello si tiene per s&eacute;,
      perch&eacute; chi lo incolla diventa la tua squadra.</div>
    </div>
  </div>
  <!-- ============ LA SFIDA DAL DISCHETTO (voce #147) ============
       Il volto di sette cantieri di misura. Il pannello e' modellato su
       quello della carta e ne riusa le regole di stile: due campi, due
       bottoni, un tabellone e le due cose da dire. -->
  <div id="sfidaDischetto" class="hidden">
    <div class="patto">
      <b>SFIDA DAL DISCHETTO</b><br>
      Una serie di <b>rigori</b> contro un&rsquo;altra persona, sui due telefoni <b>nello
      stesso momento</b>. Uno crea la sfida e manda il codice, l&rsquo;altro lo incolla:
      da l&igrave; tirate a turno, e il gioco tiene il conto.
      <div class="sf-nota" id="dsVia">Crea la sfida e manda il codice a chi vuoi sfidare: sei caratteri, niente altro.</div>
      <input id="dsMio" readonly spellcheck="false" aria-label="il codice della tua sfida dal dischetto">
      <button class="fbtn paga" id="btnDsCrea">CREA LA SFIDA</button>
      <div class="sf-nota">Ti hanno mandato un codice? Scrivilo qui e la serie comincia.</div>
      <input id="dsIn" autocomplete="off" spellcheck="false" maxlength="6" placeholder="il codice ricevuto" aria-label="codice della sfida ricevuto">
      <button class="fbtn paga" id="btnDsEntra">ENTRA COL CODICE</button>
      <div class="ds-tab">
        <div class="ds-punti" id="dsPunti">&mdash;</div>
        <div class="ds-tiri" id="dsTiri"></div>
      </div>
      <div class="sf-nota" id="dsStato">Nessuna sfida aperta.</div>
      <button class="fbtn" id="btnDsChiudi">CHIUDI</button>
      <!-- LE DUE COSE DA DIRE, E VANNO DETTE QUI.
           La prima: nessuno dei due sceglie la partita. Il seme esce
           dai numeri a caso di tutti e due mescolati, e chi tira per
           primo lo decide quel numero — non una persona. E la mossa si
           impegna prima di vedere quella dell'altro: chi parla per
           secondo non puo' vincere per questo.
           La seconda, ed e' la piu' importante: chi sparisce a meta'
           NON perde. La serie si annulla e basta. Dare la vittoria a
           chi resta sarebbe il modo piu' corto per vincere facendo
           cadere la rete dell'altro. -->
      <div class="sf-nota"><b>Nessuno dei due sceglie la partita.</b> Il seme esce dai numeri
      a caso di tutti e due mescolati, e la mossa si chiude <b>prima</b> di vedere quella
      dell&rsquo;altro: chi risponde per secondo non ci guadagna niente.
      <b>E chi sparisce non perde:</b> la serie si annulla, perch&eacute; una connessione
      caduta non &egrave; una resa.</div>
    </div>
  </div>
  <!-- LA FASCIA SOPRA IL DUELLO. Mentre si tira, il pannello non puo'
       stare aperto: il duello vuole lo schermo per la mira. Qui sta il
       minimo — il codice, il punteggio, il tiro, il ruolo, i tiri gia'
       fatti — piu' il fiato, che e' anche l'indicatore di connessione. -->
  <div id="dsFascia" class="hidden"><span id="dsFasciaT"></span><i id="dsFiato"></i></div>
</div>`;

/* ------------------------------------------- 4. LO STATO, E LA MIA MOSSA */
const A4 = `      fine: S.fine, causa: S.causa, rete: S.rete,
      secPerTiro: S.secPerTiro, motoreV: S.motoreV, impronta: S.impronta,
    };`;
const B4 = `      fine: S.fine, causa: S.causa, rete: S.rete,
      secPerTiro: S.secPerTiro, motoreV: S.motoreV, impronta: S.impronta,
      /* LA MIA MOSSA, E SOLO LA MIA (voce #147). Serve al pannello per
         dire «hai scelto, aspetta lui» invece di restare muto. Quella
         dell'ALTRO non esce di qui finche' non e' rivelata, e non per
         pudore: e' la proprieta' che _crit-volto-spione e' fatto per
         attaccare e che C1 misura. */
      mossa: S.mieMosse[S.tiro] || null,
      barra: this.barra ? { cur: this.barra.cur, ps: this.barra.ps } : null,
    };`;

/* ------------------------------------------------- 5. IL VOLTO, IN CASA */
const A5 = `  /* APRIRE IL PANNELLO NON E' PARLARE ALLA RETE. Il cancello F del
     banco conta il delta dopo l'apertura, e deve restare zero. */
  apri(){ if(!this.s) this.s = this.vuoto(); return true; },`;
const B5 = `  /* APRIRE IL PANNELLO NON E' PARLARE ALLA RETE. Il cancello F del
     banco conta il delta dopo l'apertura, e deve restare zero. */
  apri(){ if(!this.s) this.s = this.vuoto(); return true; },

  /* =====================================================================
     IL VOLTO (voce #147) — da qui in giu' non c'e' protocollo: c'e' il
     pannello, la cattura del dito e il cancello sul duello.
     ===================================================================== */

  barra: null,          /* la barra di potenza in CATTURA: {z,u,v,ps,cur,dir} */
  risolvendo: false,    /* vero solo dentro risolviDuello, e serve al cancello */
  battiti: 0,           /* quanti giri di rete ha fatto la guida */
  orologio: 0,

  /* IL FIATO TRATTENUTO. Finche' il dischetto aspetta — l'altro, il
     proprio dito, l'appuntamento — il duello NON avanza. Non e' una
     comodita': con rAF vivo, Duel.update farebbe tirare la CPU al posto
     dell'altra persona (s.pickZone((dado()*3)|0)) e consumerebbe il PRNG
     DI GIOCO. Qui non avanza niente e non si tira un sorteggio. */
  trattiene(){
    const S = this.s;
    if(!S || this.risolvendo) return false;
    return S.fase === 'scegli' || S.fase === 'attesa-impegno' ||
           S.fase === 'attesa-pari' || S.fase === 'pronto';
  },

  catturaAttiva(){
    const S = this.s;
    return !!(S && S.fase === 'scegli' && !this.risolvendo && S.ruolo);
  },

  /* ------------------------------------------- il dito, dalle tre porte */
  /* LA MIRA VALE PER TUTTI E DUE I RUOLI, ed e' una scelta.
     Nel rigore normale il portiere sceglie in fase 'wait', dopo che il
     tiratore ha fermato la barra; qui i due scelgono INSIEME, in fase
     'zone'. Se il portiere dovesse aspettare la fase 'wait' non
     arriverebbe mai, perche' la fase 'wait' in una sfida dal dischetto
     non esiste: il duello sta fermo finche' le due mosse non sono
     sul tavolo. Quindi il dito passa sempre dal gesto della mira, e a
     dividere i ruoli e' questa funzione. */
  manoMira(z, u, v){
    const S = this.s;
    if(!S) return false;
    if(S.ruolo === 'p') return this.scegli({ ruolo:'p', z: z|0 });
    if(this.barra) return false;
    const uu = (u == null) ? (z - 1) : u;
    const vv = (v == null) ? 0.50 : v;
    this.barra = { z: z|0, u: Math.round(uu * 1000), v: Math.round(vv * 1000),
                   ps: 0, cur: 0, dir: 1 };
    /* LA BANDA SI MOSTRA PER DAVVERO, e si puo': posaBanda e' pura (due
       clamp su un numero), non tira un sorteggio e non tocca la
       simulazione. Quella che risolviDuello ricalcolera' fra un istante
       e' la stessa, perche' dipende solo da u e v. */
    try{
      Duel.mirato = (u != null);
      if(Duel.mirato) Duel.posaBanda(pkAudacia(uu, vv));
      ui.powerBand.style.left = (Duel.band0 * 100) + '%';
      ui.powerBand.style.width = ((Duel.band1 - Duel.band0) * 100) + '%';
      show(ui.powerWrap);
      Duel.dito = -1; Duel.mira = false;
      Audio5.beep(520);
    }catch(e){}
    this.ridipingi();
    return true;
  },

  /* LA BARRA IN CATTURA HA LA LEGGE DELLA BARRA VERA, e deve averla:
     ps e' il numero di tick che risolviDuello rigiochera' uno per uno
     (for(p=0;p<mt.ps;p++) Duel.update(1/60)). Se questa barra corresse
     a una velocita' sua, il cursore che si vede e quello che l'altro
     telefono ricostruisce sarebbero due cose diverse, e la partita
     divergerebbe per colpa di un'animazione. */
  passoBarra(dt){
    const b = this.barra;
    if(!b) return;
    b.cur += b.dir * dt * 1.15;
    if(b.cur > 1){ b.cur = 1; b.dir = -1; }
    if(b.cur < 0){ b.cur = 0; b.dir = 1; }
    b.ps++;
    try{ ui.powerCursor.style.left = 'calc(' + (b.cur * 100) + '% - 2px)'; }catch(e){}
  },

  manoBarra(){
    const b = this.barra;
    if(!b) return false;
    this.barra = null;
    try{ hide(ui.powerWrap); }catch(e){}
    const ok = this.scegli({ ruolo:'t', z:b.z, u:b.u, v:b.v, ps:b.ps });
    this.ridipingi();
    return ok;
  },

  manoTuffo(z){
    const S = this.s;
    if(!S || S.ruolo !== 'p') return false;
    const ok = this.scegli({ ruolo:'p', z: z|0 });
    this.ridipingi();
    return ok;
  },

  /* ------------------------------------------------------- la guida */
  /* IL GIRO DI RETE HA UN ORLOGIO SOLO, ed e' qui. Il protocollo non ne
     ha nessuno apposta (vedi il commento di giro): chi chiama decide
     il ritmo, e il banco chiama battito() da se' invece di aspettare.
     Un banco che aspetta un orologio misura l'orologio. */
  ritmo(){ return (this.s && this.s.rete === 'lenta') ? 2200 : 900; },

  async battito(){
    if(!this.s || this.s.fase === 'spento') return { fase:'spento' };
    let r = { fase: this.s.fase };
    try{ r = await this.giro(); }catch(e){}
    this.battiti++;
    this.ridipingi();
    return r;
  },

  avviaGuida(){
    if(this.orologio) return;
    const tic = async () => {
      this.orologio = 0;
      if(!this.s || this.s.fase === 'spento' || this.s.fase === 'fine') return;
      await this.battito();
      if(this.s && this.s.fase !== 'fine' && this.s.fase !== 'spento')
        this.orologio = setTimeout(tic, this.ritmo());
      else this.ridipingi();
    };
    this.orologio = setTimeout(tic, 500);
  },

  fermaGuida(){
    if(this.orologio){ clearTimeout(this.orologio); this.orologio = 0; }
  },

  /* ------------------------------------------------- le parole vere */
  /* NESSUNA DI QUESTE FRASI ACCUSA, tranne una: l'impegno che non
     ricompone, che e' l'unico punto di tutto il cantiere del #146 in cui
     non c'e' un dubbio ma un hash che non torna. Tutte le altre dicono
     «non si e' potuto», ed e' il principio dell'onda D: un'astensione
     non e' una condanna. */
  perCausa(c){
    const T = {
      'versione-diversa':   'Uno dei due telefoni ha una versione diversa del gioco. Aggiornate tutti e due e riprovate.',
      'motore-diverso':     'I due telefoni hanno due versioni diverse del gioco: la serie non è partita apposta, invece di darvi due partite diverse.',
      'impegno-non-torna':  'La mossa rivelata non è quella che era stata chiusa: la serie si ferma qui.',
      'esiti-diversi':      'I due telefoni hanno visto due esiti diversi dello stesso tiro. Non si può dire chi ha ragione, e la serie si annulla.',
      'mossa-storta':       'È arrivata una mossa che non sta nel ruolo giusto: la serie si annulla.',
      'rose-corte':         'Una delle due squadre non ha abbastanza giocatori per una serie di rigori.',
      'incompiuta':         'L’altro telefono non risponde più. La serie si annulla: chi sparisce non perde, perché una connessione caduta non è una resa.',
      'rete':               'Non si riesce a parlare col server. Riprova quando hai campo.',
      'chiuso':             'Hai chiuso la sfida.',
      'finita':             '',
    };
    return T[c] !== undefined ? T[c] : ('La serie si è fermata: ' + c + '.');
  },

  frase(){
    const S = this.s;
    if(!S || S.fase === 'spento') return 'Nessuna sfida aperta.';
    if(S.fase === 'attesa-pari') return 'Sfida aperta. Manda il codice e aspetta che l’altro entri.';
    if(S.fase === 'pronto') return 'Ci siamo: si comincia.';
    if(S.fase === 'scegli')
      return S.ruolo === 't' ? 'Tocca a te: tira. Mira nello specchio e ferma la barra.'
                             : 'Tocca a te: para. Scegli da che parte tuffarti.';
    if(S.fase === 'attesa-impegno') return 'Hai scelto. Adesso si aspetta l’altro: nessuno dei due vede la mossa dell’altro prima.';
    if(S.fase === 'fine'){
      if(S.causa === 'finita' || !S.causa){
        if(S.fine === 'vinta') return 'Hai vinto la serie.';
        if(S.fine === 'persa') return 'Hai perso la serie.';
        return 'Serie finita in parità.';
      }
      return this.perCausa(S.causa);
    }
    return '';
  },

  /* i tiri gia' fatti, uno per uno: chi ha segnato, chi ha sbagliato */
  segniTiri(){
    const S = this.s;
    if(!S || !S.esiti || !S.esiti.length) return '';
    return S.esiti.map(e => (e.esito === 'gol' ? '●' : '○')).join(' ');
  },

  /* ------------------------------------------------------ il ridipinto */
  ridipingi(){
    const S = this.s;
    const q = id => document.getElementById(id);
    const e = q('dsStato'); if(e) e.textContent = this.frase();
    const p = q('dsPunti');
    if(p) p.textContent = (S && S.serie && S.fase !== 'spento')
      ? ((S.serie.seg[0]|0) + ' - ' + (S.serie.seg[1]|0)) : '—';
    const t = q('dsTiri');
    if(t) t.textContent = this.segniTiri();
    const m = q('dsMio');
    if(m && S && S.stanza && S.lato === 'a') m.value = S.stanza;
    const v = q('dsVia');
    if(v && S && S.stanza && S.lato === 'a')
      v.textContent = 'Questo è il codice della tua sfida: mandalo a chi vuoi sfidare. Resta aperta finché non entra.';
    /* LA FASCIA: c'e' solo quando c'e' una serie in corso, e sparisce da
       se'. Un pannello che restasse sopra il duello a serie finita
       coprirebbe il gol. */
    const f = q('dsFascia'), ft = q('dsFasciaT'), fi = q('dsFiato');
    const viva = !!(S && (S.fase === 'scegli' || S.fase === 'attesa-impegno'));
    if(f){ if(viva) show(f); else hide(f); }
    if(ft && viva){
      ft.textContent = S.stanza + '  ·  ' + (S.serie.seg[0]|0) + '-' + (S.serie.seg[1]|0) +
        '  ·  TIRO ' + (S.tiro + 1) + '  ·  ' + (S.ruolo === 't' ? 'TIRI TU' : 'PARI TU') +
        (this.segniTiri() ? '  ·  ' + this.segniTiri() : '');
    }
    /* IL FIATO, E NON UN NUMERO DI MILLISECONDI: lo stesso oggetto del
       respiro. Quando l'altro tarda, il fiato e' piu' lungo. */
    if(fi){
      const c = (typeof Respiro !== 'undefined' && Respiro.stato) ? Respiro.stato().carica : 0;
      fi.style.setProperty('--fiato', Math.round(Math.max(0, Math.min(1, c)) * 100) + '%');
    }
  },

  /* ---------------------------------------------------- i due bottoni */
  mostra(){
    this.apri();
    this.ridipingi();
    show(document.getElementById('sfidaDischetto'));
  },

  async dammiCodice(){
    const r = await this.crea();
    const m = document.getElementById('dsMio');
    if(m) m.value = (r && r.stanza) || '';
    if(r && r.ok) this.avviaGuida();
    this.ridipingi();
    return r;
  },

  async usaCodice(testo){
    const r = await this.entra(testo);
    if(r && r.ok) this.avviaGuida();
    else {
      const e = document.getElementById('dsStato');
      if(e) e.textContent = (r && r.errore === 'codice-storto')
        ? 'Il codice è di sei caratteri: lettere e cifre, niente altro.'
        : 'Non si riesce a parlare col server. Riprova quando hai campo.';
    }
    if(r && r.ok) this.ridipingi();
    return r;
  },`;

/* ------------------------------ 6. GLI AVVOLGIMENTI, DOPO L'OGGETTO */
const A6 = `};

window.__test = {
  get state(){ return G.scene; },`;
const B6 = `};

/* =====================================================================
   LE TRE PORTE, AVVOLTE UNA SECONDA VOLTA (voce #147).

   Il nastro avvolge pickZone/stopPower/pickKeeper piu' in su nel file
   per scriverci le righe di tipo 6. QUESTO avvolgimento sta FUORI di
   quello, perche' arriva dopo: quando la cattura e' accesa il dito non
   arriva mai alla porta vera, e quindi non scrive nessuna riga di
   comando. E' la proprieta' che il cancello D3 del banco misura.

   E DUE COSE CHE NON SI POSSONO INVERTIRE:
   - risolviDuello chiama LE PORTE VERE, e deve poterlo fare: percio' si
     alza risolvendo per tutta la sua durata, e la cattura si spegne.
   - Duel.update si avvolge SOPRA l'avvolgimento del registro: quando il
     dischetto trattiene il fiato, Reg.passoDuello non gira, e non
     deve — durante l'attesa non succede niente da registrare.
   ===================================================================== */
(function(){
  const veroZona = Duel.pickZone, veroBarra = Duel.stopPower, veroTuffo = Duel.pickKeeper;
  Duel.pickZone = function(z, u, v){
    if(Dischetto.catturaAttiva()) return Dischetto.manoMira(z, u, v);
    return veroZona.call(this, z, u, v);
  };
  Duel.stopPower = function(){
    if(Dischetto.catturaAttiva() && Dischetto.barra) return Dischetto.manoBarra();
    return veroBarra.call(this);
  };
  Duel.pickKeeper = function(z){
    if(Dischetto.catturaAttiva() && Dischetto.s.ruolo === 'p') return Dischetto.manoTuffo(z);
    return veroTuffo.call(this, z);
  };

  const veroUpdate = Duel.update;
  Duel.update = function(dt){
    if(Dischetto.trattiene()){
      /* LA SCENA RESTA VIVA, LA PARTITA NO. I due orologi di
         presentazione camminano (la posa del tiratore, il tempo del
         disegno), la barra di cattura corre sotto il dito, e nient'altro
         si muove: nessuna CPU, nessuna fase, nessun sorteggio.
         E I DUE RUOLI SI DICONO LA VERITA': chi gioca dal lato b ha
         G.cpu[1] vero, e senza queste due righe leggerebbe «TIRA LA CPU»
         mentre tira lui. Il dito passa sempre dal gesto della mira
         (shooterHuman), e a dividere i ruoli e' la cattura. */
      this.vt += dt;
      this.poseT = (this.poseT || 0) + dt;
      this.shooterHuman = true; this.keeperHuman = false;
      Dischetto.passoBarra(dt);
      return;
    }
    return veroUpdate.call(this, dt);
  };

  const veroRisolvi = Dischetto.risolviDuello;
  Dischetto.risolviDuello = function(mt, mp){
    this.risolvendo = true;
    try{ return veroRisolvi.call(this, mt, mp); }
    finally{ this.risolvendo = false; }
  };

  const veroChiudi = Dischetto.chiudi;
  Dischetto.chiudi = function(){
    this.fermaGuida();
    this.barra = null;
    try{ const f = document.getElementById('dsFascia'); if(f) hide(f); }catch(e){}
    return veroChiudi.call(this);
  };
})();

window.__test = {
  get state(){ return G.scene; },`;

/* ------------------------------------------- 7. LA MANIGLIA DEL BANCO */
const A7 = `      get esiti(){ return (Dischetto.s && Dischetto.s.esiti) || []; },`;
const B7 = `      get esiti(){ return (Dischetto.s && Dischetto.s.esiti) || []; },
      /* IL VOLTO (voce #147). battito() e' LA STESSA PORTA che usa
         l'orologio della guida, chiamata a mano: un banco che aspettasse
         il timer misurerebbe il timer. ridipingi() rifa' il tabellone
         senza toccare il protocollo. */
      battito: () => Dischetto.battito(),
      ridipingi: () => Dischetto.ridipingi(),
      mostra: () => Dischetto.mostra(),`;

/* -------------------------------------------------- 8. GLI ASCOLTATORI */
const A8 = `$('btnSfidaCarta').addEventListener('click', ()=>{ Audio5.unlock(); Sfida.mostraCarta(); });`;
const B8 = `$('btnSfidaCarta').addEventListener('click', ()=>{ Audio5.unlock(); Sfida.mostraCarta(); });
/* ============ I QUATTRO DITI DELLA SFIDA DAL DISCHETTO (voce #147) ====
   APRIRE NON E' PARLARE ALLA RETE, e il cancello F del banco conta il
   delta dopo l'apertura della schermata SFIDA: aprire questo pannello
   deve lasciarlo a zero. La prima richiesta parte su CREA o su ENTRA,
   cioe' quando un dito chiede una sfida. */
$('btnSfidaDischetto').addEventListener('click', ()=>{ Audio5.unlock(); Dischetto.mostra(); });
$('btnDsCrea').addEventListener('click', ()=>{ Audio5.unlock(); Audio5.beep(520); Dischetto.dammiCodice(); });
$('btnDsEntra').addEventListener('click', ()=>{
  Audio5.unlock(); Audio5.beep(520);
  const i = $('dsIn');
  Dischetto.usaCodice(i ? i.value : '');
});
$('btnDsChiudi').addEventListener('click', ()=>{ Audio5.unlock(); Dischetto.chiudi(); hide($('sfidaDischetto')); });`;

/* ===================================================================== */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-147-pannello.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');

const ANCORE = [
  [A1, B1, 'css'], [A2, B2, 'voce'], [A3, B3, 'pannello'], [A4, B4, 'stato'],
  [A5, B5, 'volto'], [A6, B6, 'avvolgimenti'], [A7, B7, 'maniglia'], [A8, B8, 'ascoltatori'],
];
for (const [cerca, metti, nome] of ANCORE) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('TOPPA NON APPLICATA: ancora «' + nome + '» trovata ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}

/* le guardie: ogni pezzo nuovo deve esserci una volta sola */
for (const [k, q] of [['id="btnSfidaDischetto"', 1], ['id="sfidaDischetto"', 1],
                      ['id="dsFascia"', 1], ['catturaAttiva(){', 1],
                      ['Duel.pickZone = function', 1], ['window.__test = {', 1]]) {
  const n = t.split(k).length - 1;
  if (n !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare ' + n + ' volte (ne servono ' + q + ')'); process.exit(1); }
}

fs.writeFileSync(usc, t);
console.log('toppa applicata: il pannello della sfida dal dischetto, ' + ing + ' -> ' + usc);
