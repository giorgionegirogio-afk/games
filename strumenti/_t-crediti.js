/* =====================================================================
   _t-crediti.js — LA LICENZA CHE NON VIAGGIAVA COL GIOCO ADESSO HA UNA
   PORTA NEL MENU.

   Toppa cerca/sostituisci nel formato di casa (modello _t-l04b.js).
   Legge CALCETTO-il-gioco.html (o --in), sostituisce CINQUE ancoraggi
   ESATTI e scrive la copia in --out. Senza --out scrive accanto
   all'originale un file col suffisso .crediti.html: MAI sull'originale,
   se non con --dentro. Se anche un solo ancoraggio non compare
   ESATTAMENTE UNA VOLTA si ferma con codice 1, dice quale, e non
   scrive niente.

   *** NON APPLICARE ADESSO. ***
   Scritta il 20 agosto 2026 contro l'md5 30279089de83249e44e66d2247294f5f.
   Sei specialisti hanno toppe ancorate sullo stesso md5 (l'onda dei
   verbi): questa VA APPLICATA DOPO quell'onda, rifacendo prima la prova
   --elenco e una corsa su copia. Quando entra: (1) si toglie la deroga
   `--nota-aperta ofl` dalla riga `diritti` di strumenti/tutti.js, cosi'
   il requisito diventa permanente; (2) strumenti/diritti.js senza
   deroga deve uscire VERDE sul file toppato (gia' verificato oggi
   sulla copia di prova).

   ---------------------------------------------------------------------
   IL PERCHE'. La OFL 1.1, condizione 2, chiede che ogni copia
   distribuita porti «the above copyright notice AND this license».
   I due woff2 incorporati sono sottoinsiemi: la FAQ OFL (2.6) dichiara
   che sottoinsiemizzare E' modificare, e nel sottoinsieme il nameID 13
   (testo della licenza) e' stato buttato via — misurato con fontTools
   4.63.0 il 20/8/2026: nameID 0 e 14 presenti, 13 ASSENTE in tutti e
   due. Quindi oggi l'APK distribuisce Font Software di terzi SENZA la
   licenza: e' l'unico obbligo verso terzi che il progetto ha gia'
   accettato e non sta rispettando. Questa toppa mette il testo dentro
   il gioco stesso (schermata CREDITI raggiungibile dall'ingranaggio),
   che e' il posto piu' robusto: viaggia con QUALSIASI copia del file,
   dentro o fuori dall'APK.

   COSA AGGIUNGE, e niente altro:
     1. una voce CREDITI E LICENZE nella schermata dell'ingranaggio
        (#extra), sotto COME SI GIOCA;
     2. la schermata #crediti: due righe di paternita', l'attribuzione
        dei due font coi loro copyright ESATTI (identici ai nameID 0
        letti nei binari), e il testo integrale della OFL 1.1 in un
        blocco scorrevole;
     3. la registrazione della schermata in SCREENS (senno'
        hideAllScreens non la chiude);
     4. i due gestori di clic (apri/chiudi), accanto a quello di btnHow;
     5. l'ingranaggio d'angolo nascosto anche su #crediti, come sulle
        altre schermate di servizio (un comando che rimanda a se' stesso).

   COSA NON TOCCA: zero stato, zero salvataggio, zero simulazione, zero
   sorteggi, zero canvas. E' HTML piu' due addEventListener: nessun
   banco a seme fisso puo' accorgersene.

   L'UNICA NOTA DI PESO: il testo OFL sono ~4.400 byte una volta sola
   (una licenza per tutte e due le famiglie: i corpi sono identici,
   cambiano solo le righe di copyright, che qui ci sono tutte e due).
   Il file cresce di ~7 kB su 1.794.676: lo 0,4%.

   uso:
     node strumenti/_t-crediti.js --elenco
     node strumenti/_t-crediti.js --out fuori/crediti.html
     node strumenti/_t-crediti.js --in altro.html --out x.html
     node strumenti/_t-crediti.js --dentro          (solo a onda verbi chiusa)
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* Il testo OFL 1.1 canonico (da google/fonts, normalizzato a LF; l'unica
   & e' resa &amp; perche' vive dentro l'HTML). E' lo stesso testo del
   NOTICE nella radice del repo. NON RIFORMATTARE: strumenti/diritti.js
   verifica la presenza della riga-titolo esatta. */
const OFL_TESTO = `This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION &amp; CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.`;

const ANCORE = [

/* 1 — la voce nel menu dell'ingranaggio, sotto COME SI GIOCA */
{
  nome: '1/5 la voce CREDITI nella schermata #extra',
  cerca:
`      <button class="voce" id="btnHow">COME SI GIOCA <small>regole e comandi</small></button>
    </div>`,
  metti:
`      <button class="voce" id="btnHow">COME SI GIOCA <small>regole e comandi</small></button>
      <!-- la porta della licenza: la OFL 1.1 obbliga ogni copia del
           gioco a portare con se' il testo della licenza dei font
           incorporati (condizione 2), e i woff2 sottoinsiemizzati non
           ce l'hanno piu' dentro (nameID 13 assente, misurato). Da qui
           il testo e' a due tocchi da chiunque, revisori di store
           compresi. -->
      <button class="voce" id="btnCrediti">CREDITI E LICENZE <small>i caratteri di terzi e la loro licenza</small></button>
    </div>`,
},

/* 2 — la schermata, subito prima di GIOCA */
{
  nome: '2/5 la schermata #crediti con il testo integrale della OFL',
  cerca:
`<!-- ============ GIOCA (amichevole) ============ -->
<div id="gioca" class="ov hidden">`,
  metti:
`<!-- ============ CREDITI E LICENZE ============
     Tutto nel gioco e' fatto in casa TRANNE due caratteri tipografici,
     e la loro licenza (SIL OFL 1.1) pretende di viaggiare con ogni
     copia. Il testo sta qui, non in un file accanto, perche' il gioco
     E' un file solo: ovunque vada il file, va anche la licenza. -->
<div id="crediti" class="ov hidden">
  <div class="box">
    <h1 class="sotto-titolo">CREDITI E LICENZE</h1>
    <div class="regole" style="text-align:left">
      <h3>Il gioco</h3>
      <p>CALCETTO e' un'opera originale: codice, disegno, animazioni,
      suoni (interamente sintetizzati), nomi di squadre, giocatori,
      campi e sponsor sono inventati e fatti in casa. Nessuna immagine,
      registrazione o libreria di terzi.</p>
      <h3>Caratteri tipografici di terzi</h3>
      <p>Gli unici componenti di terzi sono due caratteri, incorporati
      nel gioco come sottoinsiemi woff2:</p>
      <p>Archivo Black — Copyright 2017 The Archivo Black Project Authors (https://github.com/Omnibus-Type/ArchivoBlack)</p>
      <p>Barlow Condensed Bold — Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow)</p>
      <p>Entrambi sono distribuiti sotto la SIL Open Font License 1.1,
      senza Reserved Font Name. Il testo integrale della licenza,
      identico per le due famiglie, e' qui sotto.</p>
    </div>
    <div style="max-height:44vh;overflow:auto;margin:10px 0;padding:10px 12px;border:1px solid rgba(242,245,239,.25);border-radius:6px">
      <pre style="white-space:pre-wrap;font-family:var(--mono);font-size:10.5px;line-height:1.45;margin:0">${OFL_TESTO}</pre>
    </div>
    <div class="azioni"><button class="btnA sec" id="btnBackCrediti">TORNA AL MENU</button></div>
  </div>
</div>

<!-- ============ GIOCA (amichevole) ============ -->
<div id="gioca" class="ov hidden">`,
},

/* 3 — la registrazione in SCREENS: senza, hideAllScreens non la chiude
       e la schermata resterebbe sotto le altre */
{
  nome: '3/5 #crediti dentro SCREENS',
  cerca:
`const SCREENS=[ui.menu,ui.howto,ui.end,ui.gioca,ui.torneo,ui.campi,ui.squadra,ui.trofei,ui.statistiche,ui.impostazioni,
               $('spogliatoio'),$('bacheca'),$('extra'),$('rosa'),$('stagione'),$('negozio')].filter(Boolean);`,
  metti:
`const SCREENS=[ui.menu,ui.howto,ui.end,ui.gioca,ui.torneo,ui.campi,ui.squadra,ui.trofei,ui.statistiche,ui.impostazioni,
               $('spogliatoio'),$('bacheca'),$('extra'),$('rosa'),$('stagione'),$('negozio'),$('crediti')].filter(Boolean);`,
},

/* 4 — l'ingranaggio d'angolo non si mostra sopra i crediti: e' la
       stessa regola delle altre schermate di servizio */
{
  nome: '4/5 ingranaggio nascosto anche su #crediti',
  cerca:
`  if(gb) gb.classList.toggle('hidden', el===$('extra')||el===ui.impostazioni||el===ui.howto);`,
  metti:
`  if(gb) gb.classList.toggle('hidden', el===$('extra')||el===ui.impostazioni||el===ui.howto||el===$('crediti'));`,
},

/* 5 — i due gestori, accanto a quello di COME SI GIOCA */
{
  nome: '5/5 i gestori di apertura e chiusura',
  cerca:
`$('btnHow').addEventListener('click', ()=>{ Audio5.unlock(); goScreen(ui.howto); });`,
  metti:
`$('btnHow').addEventListener('click', ()=>{ Audio5.unlock(); goScreen(ui.howto); });
/* CREDITI: si apre dall'ingranaggio e torna all'ingranaggio, perche' e'
   da li' che si arriva — tornare al menu principale butterebbe l'utente
   due livelli piu' su di dove stava. */
$('btnCrediti').addEventListener('click', ()=>{ Audio5.unlock(); goScreen($('crediti')); });
$('btnBackCrediti').addEventListener('click', ()=>{ Audio5.unlock(); goScreen($('extra')); });`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-crediti.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.crediti.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) {
  console.error('FALLITO: --out coincide con --in. Senza --dentro non si scrive sull\'originale.');
  process.exit(2);
}

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi che non compaiono esattamente una volta — niente e\' stato scritto.');
  for (const m of mancanti) {
    console.error(`  · ${m.nome}: trovato ${m.n} volte`);
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}
/* controlli dopo la sostituzione: le prove che strumenti/diritti.js
   pretende, piu' i conteggi dei ganci */
const attesi = [
  ['id="crediti"', 1],
  ["$('crediti')", 3],
  ['btnCrediti', 2],
  ['btnBackCrediti', 2],
  ['SIL OPEN FONT LICENSE Version 1.1', 1],
  ['Copyright 2017 The Archivo Black Project Authors (https://github.com/Omnibus-Type/ArchivoBlack)', 1],
  ['Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow)', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s.slice(0, 50)} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
console.log('    ora: node strumenti/diritti.js --gioco ' + outFile + '   deve essere VERDE senza deroga');
