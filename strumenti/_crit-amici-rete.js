/* =====================================================================
   _crit-amici-rete.js — LA CLASSIFICA CHE PASSA DAL SERVER (voce #136,
   compito 3). Il falso che condanna D5.

   CHE COSA FALSIFICA. Segnare una riga manda anche una copia al
   server: «cosi' se cambi telefono la classifica ti segue, e un giorno
   ci si puo' fare una classifica generale». E' la proposta piu'
   ragionevole che si possa fare a questa funzione, ed e' esattamente
   quella che la disfa: da quel momento la classifica degli amici non
   funziona piu' senza campo, e sul server finisce chi gioca con chi —
   che e' l'unica cosa che questo cantiere aveva promesso di non far
   uscire dal telefono.

   E' IL CASO PEGGIORE: la richiesta parte in sottofondo, nessuno la
   aspetta, nessun errore arriva a schermo. La riga si segna lo stesso,
   il codice resta di ventuno caratteri, non contiene nessuna identita',
   la classifica si specchia, il salvataggio e' additivo, la piega non
   si muove, il pannello si scorre. Tutto verde, tranne il conteggio
   delle richieste.

   E CADE NELLA PRIMA TACCA di D5 — quella che gira con l'indirizzo del
   server ancora al suo posto — e non nella terza: un banco che avesse
   misurato la rete solo a telefono spento non lo prenderebbe, perche'
   con Rete.base vuoto questa fetch non parte nemmeno. E' il motivo per
   cui le tacche sono tre.

   L'ESITO ATTESO: ROSSO su D5, VERDE su tutto il resto.

   uso:  node strumenti/_crit-amici-rete.js
         node strumenti/_q-amici.js --solo D --gioco fuori/gioco-amici-rete.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-amici-rete.html'));

const A = `    r.q = Date.now();
    try{ persistSave(); }catch(e){}
    return { ok:true, nome:nome, come:come, riga:r, uscito:uscito, miei:[ma,md], suoi:[sa,sd] };`;
const B = `    r.q = Date.now();
    try{ persistSave(); }catch(e){}
    /* IL FALSO (voce #136, _crit-amici-rete): «cosi' se cambi telefono
       la classifica ti segue». Parte in sottofondo, nessuno la aspetta,
       nessun errore si vede. E la classifica degli amici smette di
       essere una cosa che funziona senza campo. */
    try{
      if(Rete.base) fetch(Rete.base + '/api/amici', { method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ amico:nome, seme:seme, miei:[ma,md], suoi:[sa,sd] }) }).catch(()=>{});
    }catch(e){}
    return { ok:true, nome:nome, come:come, riga:r, uscito:uscito, miei:[ma,md], suoi:[sa,sd] };`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(A).length - 1;
if (n !== 1) { console.error('FALLITO: ancora trovata ' + n + ' volte invece di 1'); process.exit(1); }
const out = src.replace(A, B);
const attesi = [
  ["fetch(Rete.base + '/api/amici'", 1],
  ['#sfidaCarta{align-items:flex-start}', 1],
  ['id="claAmici"', 1],
  ['const Amici = {', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  la classifica degli amici adesso passa dal server');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-amici.js --solo D --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su D5, VERDE su tutto il resto');
