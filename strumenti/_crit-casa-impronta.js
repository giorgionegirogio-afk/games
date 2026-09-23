/* =====================================================================
   _crit-casa-impronta.js — LA CURA SI MANGIA IL TESTIMONE
   (voce #143, compito 4 — mutante)

   LA BUGIA: la cura completa, SENZA proteggere `improntaMotore()`.
   Anche le sette chiamate dentro l'impronta del motore passano da casa.

   PERCHE' E' IL FALSO PIU' SUBDOLO, e perche' non e' di fantasia: e'
   quello che succede da solo se la toppa si scrive «dirotta tutto»
   senza pensarci. Nessuna prova di QUESTO cantiere se ne accorge —
   `_q-motori` resta verde (anzi, e' verde per la stessa ragione),
   `_q-casa` resta verde, la partita e' identica ovunque. A rompersi e'
   un cantiere DI PRIMA: `improntaMotore()` (voce #142) dichiara quale
   motore JavaScript ha calcolato un nastro, e lo fa proprio chiamando
   le sette native e leggendone i bit. Se passano da casa, l'impronta
   vale lo STESSO NUMERO su Chromium, WebKit e Firefox: dice sempre
   «stesso motore».

   E un'impronta che dice sempre «stesso motore» non e' innocua, e' il
   falso `_crit-motore-piatto` del #142 rinato dentro la cura del #143:
   il giudice smetterebbe di astenersi sui nastri che non puo'
   giudicare, e ricomincerebbe ad accusare gli onesti — che e'
   esattamente il critico in produzione che il #142 e' nato per curare.

   L'impronta SERVE ANCORA dopo questo cantiere, ed e' la ragione per
   cui il blocco resta nativo: la casa rende identica la SIMULAZIONE,
   non il disegno, e i nastri registrati prima del #143 sono stati
   calcolati con le native.

   LA PROVA CHE DEVE MORDERE: l'impronta letta su tre motori deve dare
   tre numeri diversi. Con questo mutante ne da' uno solo.

   uso: node strumenti/_crit-casa-impronta.js [uscita.html]
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { innesta, sguaina } = require('./_toppa-143-matematica.js');

const RADICE = path.resolve(__dirname, '..');
const usc = process.argv[2] || path.join(RADICE, 'fuori', 'crit-casa-impronta.html');
const ing = path.join(RADICE, 'CALCETTO-il-gioco.html');

fs.mkdirSync(path.dirname(usc), { recursive: true });
let r;
/* IL GIOCO SENZA LA CURA NON STA IN UN FILE, STA IN UN COMMIT — e un
   banco che dipendesse da un commit smetterebbe di funzionare al primo
   rebase. Qui si ricostruisce dal gioco di oggi togliendo la libreria e
   rimettendo i nomi nativi: `sguaina` e' l'innesto al contrario, e
   `_q-casa-falsi.js` verifica a ogni corsa che innesta(sguaina(x)) sia
   x parola per parola. */
let base;
try { base = sguaina(fs.readFileSync(ing, 'utf8')).testo; }
catch (e) { console.error('MUTANTE NON COSTRUITO: non riesco a togliere la cura dal gioco: ' + e.message); process.exit(2); }
try { r = innesta(base, { impronta: false }); }
catch (e) { console.error('MUTANTE NON COSTRUITO: ' + e.message); process.exit(2); }
fs.writeFileSync(usc, r.testo);
console.log('mutante «impronta» costruito: ' + r.siti + ' chiamate dirottate, improntaMotore compresa -> ' + usc);
