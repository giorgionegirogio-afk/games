/* =====================================================================
   VETRO — dita vere sul pannello, in un posto solo.

   Sta qui e non dentro chi lo usa perche' questo progetto ha gia' pagato
   una volta l'errore opposto: `_identita.js` era nato copiando il
   campionamento di `istantanea.js` e ne aveva ereditato il difetto
   insieme al resto, e la ferita chiusa in un file e' rimasta aperta in
   quello accanto. Il vetro lo usano `pollici.js` e `giocatore.js`, e
   quando si ripara si ripara per tutti e due.

   TRE COSE CHE DEVONO ESSERE VERE INSIEME, e ognuna delle tre, da sola,
   produce lo stesso identico silenzio — il telefono che non risponde:

   1. NIENTE PSEUDO-TERMINALE. `adb shell` senza -T ne alloca uno e
      traduce i fine riga: su un flusso binario corrompe ogni 0x0a.
      `adb exec-in`, che pure e' documentato come crudo, con questo
      bersaglio inghiotte lo stdin senza scrivere niente e senza dire
      niente su stderr. Misurato affiancando i tre trasporti con
      coordinate diverse: -T le fa arrivare tutte, exec-in nessuna.
   2. LA REDIREZIONE STA DENTRO `su`. Il dispositivo e' crw-rw-rw-, quindi
      i permessi Unix non c'entrano: SELinux e' in enforcing e nega
      all'utente `shell` il contesto `input_device`. Con `su -c 'cat >
      DEV'` il file lo apre la shell ESTERNA, che e' ancora `shell`.
      Serve `su -c 'sh -c "cat > DEV"'`.
   3. SI PARLA LA LINGUA CHE IL PANNELLO DICHIARA. Questo synaptics s3320
      NON dichiara BTN_TOUCH: dichiara BTN_TOOL_FINGER. Un codice non
      annunciato viene scartato in silenzio dal lettore di ingresso.
      Si legge `getevent -lp`, non si presume.

   E LA QUARTA, che e' la piu' insidiosa. Il dispositivo accetta solo
   scritture multiple di 24 byte. `cat` fa read() e poi write() di quel
   che ha letto: se il trasporto spezza una consegna a meta' evento, cat
   scrive un troncone, il kernel risponde EINVAL — e quei byte sono persi.
   Il guaio non e' l'evento perso: e' che il RESTO DEL FLUSSO RESTA
   DISALLINEATO, e da li' in poi ogni ventiquattro byte descrivono un
   evento che nessuno ha voluto. Sul telefono si e' visto come
   `cat: xwrite: Invalid argument` durante una partita di 81 secondi.
   Qui la sentinella lo intercetta su stderr, ALZA TUTTE LE DITA, butta
   giu' il tubo e ne apre uno nuovo — che riparte allineato — e conta
   quante volte e' successo. Un referto che non dichiara quante volte il
   suo canale si e' rotto non e' un referto.
   ===================================================================== */
const { spawn } = require('child_process');

const EV_SYN = 0, EV_KEY = 1, EV_ABS = 3;
const SLOT = 0x2f, MAJ = 0x30, POSX = 0x35, POSY = 0x36, TID = 0x39;
const TOOL = 0x145;                 // BTN_TOOL_FINGER: l'unico che questo pannello conosce

function ev(t, c, v) {
  const b = Buffer.alloc(24);
  b.writeUInt16LE(t & 0xffff, 16);
  b.writeUInt16LE(c & 0xffff, 18);
  b.writeInt32LE(v | 0, 20);
  return b;
}

class Vetro {
  constructor(adb, dev, devIn = '/dev/input/event2') {
    this.adb = adb; this.dev = dev; this.devIn = devIn;
    this.dita = new Map();          // slot -> {x,y}
    this.id = 200;
    this.rotture = 0;               // quante volte il canale si e' disallineato
    this.err = '';
    this.coda = [];
    this.pompaAccesa = false;
    this.PASSO_MS = 3;
    this.apri();
  }

  apri() {
    this.p = spawn(this.adb, ['-s', this.dev, 'shell', '-T',
      `su -c 'sh -c "cat > ${this.devIn}"'`], { stdio: ['pipe', 'pipe', 'pipe'] });
    this.p.stderr.on('data', d => {
      const s = String(d);
      this.err += s;
      /* LA SENTINELLA: EINVAL vuol dire scrittura non allineata, e da qui
         in poi il flusso non e' piu' affidabile. Non si prosegue sperando. */
      if (/xwrite|Invalid argument/i.test(s)) this.riallinea();
    });
    this.p.on('error', e => { this.err += '[spawn] ' + e.message; });
  }

  riallinea() {
    this.rotture++;
    const erano = [...this.dita.entries()];
    this.dita.clear();
    /* la coda del flusso morto si butta: quei byte appartengono a un tubo
       che non esiste piu', e riversarli nel nuovo lo disallineerebbe
       daccapo — cioe' la cura diventerebbe la malattia */
    this.coda.length = 0;
    this.pompaAccesa = false;
    try { this.p.stdin.end(); } catch (e) { }
    try { this.p.kill(); } catch (e) { }
    this.apri();
    /* le dita che erano giu' si rimettono giu' dove stavano: un dito che
       sparisce a meta' partita e' un guasto peggiore di quello che si
       stava riparando */
    for (const [s, d] of erano) this.giu(s, d.x, d.y);
  }

  /* LA CODA CHE DISTANZIA LE SCRITTURE, e perche' la sentinella da sola
     non bastava. Con la sola sentinella una partita di 70 secondi ha
     prodotto OTTO riallineamenti: recuperati tutti, ma otto guasti sono
     un rumore che finisce nella misura. La causa non e' la dimensione —
     un gruppo di eventi sta in 168 byte, e una pipe garantisce
     l'atomicita' fino a 4096 — e' che DUE SCRITTURE A DISTANZA DI
     MICROSECONDI vengono impacchettate insieme dal trasporto e poi
     rispezzate su un confine qualunque, che quasi mai cade su un multiplo
     di 24. Nel giro di controllo succede di continuo: la levetta si muove
     e nello stesso istante il pollice destro preme.
     Rimedio: una coda che versa un gruppo ogni 3 ms. Tre millisecondi
     sono un quinto di fotogramma — sotto la risoluzione di qualunque cosa
     stiamo misurando — e bastano perche' ogni gruppo viaggi da solo. */
  w(bs) {
    this.coda.push(Buffer.concat(bs));
    this.pompa();
  }

  pompa() {
    if (this.pompaAccesa || !this.coda.length) return;
    this.pompaAccesa = true;
    const passo = () => {
      const b = this.coda.shift();
      if (!b) { this.pompaAccesa = false; return; }
      try { this.p.stdin.write(b); } catch (e) { this.err += '[write] ' + e.message; }
      setTimeout(passo, this.PASSO_MS);
    };
    passo();
  }

  giu(slot, x, y) {
    if (this.dita.has(slot)) return this.muovi(slot, x, y);
    const d = { x: Math.round(x), y: Math.round(y) };
    this.dita.set(slot, d);
    this.w([ev(EV_ABS, SLOT, slot), ev(EV_ABS, TID, this.id++),
      ev(EV_ABS, POSX, d.x), ev(EV_ABS, POSY, d.y), ev(EV_ABS, MAJ, 40),
      ev(EV_KEY, TOOL, 1), ev(EV_SYN, 0, 0)]);
  }

  muovi(slot, x, y) {
    const d = this.dita.get(slot); if (!d) return;
    const nx = Math.round(x), ny = Math.round(y);
    if (nx === d.x && ny === d.y) return;
    const bs = [ev(EV_ABS, SLOT, slot)];
    if (nx !== d.x) { bs.push(ev(EV_ABS, POSX, nx)); d.x = nx; }
    if (ny !== d.y) { bs.push(ev(EV_ABS, POSY, ny)); d.y = ny; }
    bs.push(ev(EV_SYN, 0, 0));
    this.w(bs);
  }

  su(slot) {
    if (!this.dita.has(slot)) return;
    this.dita.delete(slot);
    const bs = [ev(EV_ABS, SLOT, slot), ev(EV_ABS, TID, -1)];
    if (this.dita.size === 0) bs.push(ev(EV_KEY, TOOL, 0));
    bs.push(ev(EV_SYN, 0, 0));
    this.w(bs);
  }

  chiudi() {
    for (const s of [...this.dita.keys()]) this.su(s);
    try { this.p.stdin.end(); } catch (e) { }
    try { this.p.kill(); } catch (e) { }
  }
}

module.exports = { Vetro, ev, EV_SYN, EV_KEY, EV_ABS, SLOT, MAJ, POSX, POSY, TID, TOOL };
