/* =====================================================================
   _toppa-149-commenti.js — LE RETTIFICHE A EDIZIONI DENTRO IL GIOCO
   (voce #149, compito 4)

   Non cambia una riga di comportamento: rettifica tre commenti superati e
   ne aggiunge uno che dichiara un limite misurato. Sono rilievi MINORI
   della revisione d'insieme dell'onda E, e si curano come tutti gli
   altri — A EDIZIONI, senza cancellare il testo vecchio.

     1  «MOTORE_V resta 4» (il respiro, voce #141)
     2  «MOTORE_V resta 2 apposta» (il ritardo davanti alle porte)
     3  «MOTORE_V resta 2» (ritardo(0) in __test)
        Tutte e tre dicono il vero DELLA LORO CURA e il falso di oggi: il
        numero e' salito quattro volte da allora (2 -> 4 al #144, 4 -> 5
        al #148, 5 -> 6 al #149) per ragioni che non c'entrano niente con
        quelle tre righe. Chi legge crede di leggere il valore corrente.

     4  IL MOTORE NELLA CARTA STA IN QUATTRO BIT, cioe' arriva a 15. Con
        MOTORE_V a 6 il margine e' NOVE, dopo quattro salti in due
        giorni. Il giorno in cui passasse 15, `& 15` troncherebbe IN
        SILENZIO e una carta dichiarerebbe un motore che non e' il suo.
        Il limite si dichiara accanto ai bit, e un cancello di _q-carta
        lo sorveglia.

   uso:  node strumenti/_toppa-149-commenti.js [file.html]
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const FILE = process.argv[2] ? path.resolve(RADICE, process.argv[2])
                             : path.join(RADICE, 'CALCETTO-il-gioco.html');
if (!fs.existsSync(FILE)) { console.error('TOPPA NON APPLICATA: ' + FILE + ' non esiste'); process.exit(1); }
let t = fs.readFileSync(FILE, 'utf8');

const COPPIE = [
  [`   A K = 0 QUESTO BLOCCO E' INERTE: nessuna coda, nessuna carica, nessun
   pixel diverso. E' la ragione per cui il gioco offline di oggi non si
   muove di un bit e MOTORE_V resta 4.`,
   `   A K = 0 QUESTO BLOCCO E' INERTE: nessuna coda, nessuna carica, nessun
   pixel diverso. E' la ragione per cui il gioco offline di oggi non si
   muove di un bit e MOTORE_V resta 4.

   RETTIFICA A EDIZIONI (24 settembre 2026, voce #149). «MOTORE_V resta 4»
   dice il vero DI QUESTA CURA e il falso del valore di oggi: il numero e'
   salito tre volte dopo, e nessuna delle tre per colpa di questo blocco
   (4 -> 5 al #148, 5 -> 6 al #149; prima, 2 -> 4 al #144). La frase va
   letta come «questa cura non lo muove», che e' quel che voleva dire.`],

  [`   Un comando dato al tick T esegue al tick T+K. A K=0 questo blocco non
   fa niente: un confronto e un ritorno, zero sorteggi, zero rami nuovi
   nella fisica. MOTORE_V resta 2 apposta, e un banco lo verifica.`,
   `   Un comando dato al tick T esegue al tick T+K. A K=0 questo blocco non
   fa niente: un confronto e un ritorno, zero sorteggi, zero rami nuovi
   nella fisica. MOTORE_V resta 2 apposta, e un banco lo verifica.

   RETTIFICA A EDIZIONI (24 settembre 2026, voce #149): il 2 era il valore
   del giorno del #141. Oggi MOTORE_V vale 6 — quattro salti in mezzo, e
   nessuno per colpa di questa coda. Quel che resta vero, ed e' quel che
   la riga voleva dire, e' che a K=0 questo blocco non muove un bit.`],

  [`     ritardo(0) lo spegne, e a ritardo spento il gioco e' identico al
     bit a quello di prima: MOTORE_V resta 2.`,
   `     ritardo(0) lo spegne, e a ritardo spento il gioco e' identico al
     bit a quello di prima (RETTIFICA A EDIZIONI, 24 settembre 2026, voce
     #149: allora MOTORE_V valeva 2 e oggi vale 6 — l'identita' al bit
     regge, il numero no).`],

  [`  met((o.ver === undefined ? CARTA_VER : (o.ver|0)) & 15, 4);
  met((o.motore === undefined ? MOTORE_V : (o.motore|0)) & 15, 4);
  met(Math.max(0, [5,7,11].indexOf(o.taglia|0)) & 3, 2);`,
   `  met((o.ver === undefined ? CARTA_VER : (o.ver|0)) & 15, 4);
  /* =====================================================================
     IL MOTORE NELLA CARTA STA IN QUATTRO BIT, E IL MARGINE E' UN NUMERO
     (voce #149). Quattro bit arrivano a 15. MOTORE_V oggi vale 6, quindi
     il margine e' NOVE — e i salti sono stati quattro in due giorni
     (2 -> 4 al #144, 4 -> 5 al #148, 5 -> 6 al #149).

     IL GIORNO IN CUI PASSASSE 15, & 15 TRONCHEREBBE IN SILENZIO: una
     carta dichiarerebbe un motore che non e' il suo, e chi la leggesse
     direbbe «altro-motore» a se' stesso senza capire perche'. Allargare
     il campo oggi vorrebbe dire cambiare il formato della carta, cioe'
     buttare le carte in giro: non si fa per un margine, si fa quando
     serve. Quel che si fa oggi e' non lasciare che arrivi di sorpresa —
     strumenti/_q-carta.js ha un cancello che diventa rosso PRIMA, a
     MOTORE_V 15.
     ===================================================================== */
  met((o.motore === undefined ? MOTORE_V : (o.motore|0)) & 15, 4);
  met(Math.max(0, [5,7,11].indexOf(o.taglia|0)) & 3, 2);`],
];

for (const [cerca, metti] of COPPIE) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) {
    console.error('TOPPA NON APPLICATA: un ancoraggio e\' stato trovato ' + n + ' volte (ne serve 1).');
    console.error('  ' + cerca.split('\n')[0].trim().slice(0, 90));
    process.exit(1);
  }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(FILE, t);
console.log('toppa 149-commenti applicata a ' + path.relative(RADICE, FILE) + ' (' + COPPIE.length + ' ancoraggi)');
