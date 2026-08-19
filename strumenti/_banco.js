/* =====================================================================
   _banco.js — ATTREZZO DI PROTOTIPAZIONE (prefisso _, non fa parte dei
   cancelli). Non misura niente di suo.

   A COSA SERVE. I cancelli (istantanea.js, collaudo.js, misura.js)
   servono il gioco da un server locale con la radice fissata al repo e
   il nome del file scritto a mano: `/CALCETTO-il-gioco.html`. Per
   provare una toppa SENZA toccare il file del repo serve poter puntare
   gli stessi cancelli, senza cambiare una riga della loro misura, su una
   copia che sta fuori dal repo.

   COSA FA. Genera in strumenti/ una copia patchata di ciascun cancello
   (_p-istantanea.js, _p-collaudo.js, _p-misura.js) in cui SOLO il
   risolutore di file del server e' toccato: quando la richiesta e'
   `/CALCETTO-il-gioco.html` e la variabile d'ambiente GIOCO_PROVA e'
   valorizzata, il server serve QUEL file. Tutto il resto — la partita,
   il seme, le soglie, la stampa — resta byte per byte l'originale.

   PERCHE' UNA COPIA PATCHATA E NON UN require(): i cancelli sono script
   monolitici che eseguono al caricamento; l'unico innesto pulito e'
   testuale, e va rifatto a ogni esecuzione cosi' non puo' invecchiare
   rispetto all'originale.

   uso:
     node strumenti/_banco.js                    rigenera le copie
     GIOCO_PROVA=/percorso/prova.html node strumenti/_p-istantanea.js --dir cartella
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const QUI = __dirname;
/* equita, giocata e senza-rete hanno lo STESSO server di istantanea,
   collaudo e misura — stessa RADICE, stesso risolutore, stessa guardia —
   quindi accettano lo stesso identico innesto. Senza di loro una toppa si
   poteva provare sull'immagine ma non sull'EQUITA' ne' sulla giocabilita',
   che sono i due cancelli che una passata sul motore rischia davvero.
   prestazione.js resta fuori: ha gia' --oggi <percorso>, e quindi sa
   puntare da solo su un file esterno. */
const CANCELLI = ['istantanea.js', 'collaudo.js', 'misura.js',
                  'equita.js', 'giocata.js', 'senza-rete.js'];

const PRELUDIO = `\n/* --- innesto di _banco.js: la radice resta il repo, ma il gioco puo'\n   arrivare da fuori. Nessun altro comportamento e' toccato. --- */\nconst __PROVA = process.env.GIOCO_PROVA ? require('path').resolve(process.env.GIOCO_PROVA) : '';\nconst __rid = f => (__PROVA && /CALCETTO-il-gioco\\.html$/i.test(f)) ? __PROVA : f;\n`;

let fatti = 0, saltati = [];
for (const nome of CANCELLI) {
  const src = path.join(QUI, nome);
  let t = fs.readFileSync(src, 'utf8');

  /* 1. il preludio subito dopo la definizione della radice */
  const mR = t.match(/^const RADICE = .*$/m);
  if (!mR) { saltati.push(nome + ' (RADICE non trovata)'); continue; }
  t = t.replace(mR[0], mR[0] + PRELUDIO);

  /* 2. il risolutore: `const f = path.join(RADICE, ... );` -> passa da __rid */
  const mF = t.match(/const f = (path\.join\(RADICE,[\s\S]*?\));/);
  if (!mF) { saltati.push(nome + ' (risolutore non trovato)'); continue; }
  t = t.replace(mF[0], 'const f = __rid(' + mF[1] + ');');

  /* 3. la guardia anti-traversal deve lasciar passare il file di prova */
  const nG = (t.match(/!f\.startsWith\(RADICE\)/g) || []).length;
  if (!nG) { saltati.push(nome + ' (guardia non trovata)'); continue; }
  t = t.replace(/!f\.startsWith\(RADICE\)/g, '(!f.startsWith(RADICE) && f !== __PROVA)');

  fs.writeFileSync(path.join(QUI, '_p-' + nome), t);
  fatti++;
}
console.log(`_banco: ${fatti} cancelli patchati su ${CANCELLI.length}` +
  (saltati.length ? `; SALTATI: ${saltati.join(', ')}` : ''));
if (saltati.length) process.exitCode = 1;
