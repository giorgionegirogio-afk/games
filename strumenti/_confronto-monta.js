/* =====================================================================
   _confronto-monta.js — monta il documento del confronto CALCETTO contro
   EA SPORTS FC Mobile a partire dai file di lavoro.

   Legge fuori/confronto/fatto-*.json e lacuna-*.json (le differenze
   normalizzate: area A-N, verso, grado di verifica), toglie i doppioni
   rimasti, e scrive:
     _analisi/DIFFERENZE-FC-MOBILE.md   il documento, ordinato per area
     fuori/confronto/tutte.json         il crudo, per chi vuole rifare i conti

   uso:  node strumenti/_confronto-monta.js
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const C = path.join(RADICE, 'fuori', 'confronto');

const AREE = {
  A: 'Modalita di gioco e struttura della partita',
  B: 'Regole del calcio',
  C: 'Comandi e ingresso (il pollice)',
  D: 'Simulazione, fisica e intelligenza artificiale',
  E: 'Grafica, telecamere e presentazione',
  F: 'Audio',
  G: 'Animazione e corpo',
  H: 'Contenuti e licenze',
  I: 'Progressione, rosa e carte',
  J: 'Economia e monetizzazione',
  K: 'Rete, conto e servizi',
  L: 'Interfaccia, apprendimento e accessibilita',
  M: 'Piattaforma: peso, prestazioni, privacy, autorizzazioni',
  N: 'Longevita e contorno',
};

const file = fs.readdirSync(C).filter(f => /^(fatto|lacuna)-.*\.json$/.test(f));
if (!file.length) { console.error('nessun file pronto in ' + C); process.exit(1); }

let righe = [];
const rotti = [];
for (const f of file) {
  try {
    const v = JSON.parse(fs.readFileSync(path.join(C, f), 'utf8'));
    if (Array.isArray(v)) righe.push(...v.map(x => ({ ...x, _da: f })));
    else rotti.push(f + ' (non e un elenco)');
  } catch (e) { rotti.push(f + ' (' + e.message.slice(0, 60) + ')'); }
}

/* doppioni: stessa area e stesso nucleo di parole nell'aspetto */
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const chiave = d => (d.area || '?') + '|' + norm(d.aspetto).split(' ').filter(w => w.length > 3).sort().slice(0, 5).join('-');
const m = new Map();
for (const d of righe) {
  const k = chiave(d);
  if (!m.has(k)) m.set(k, d);
  else {
    const e = m.get(k);
    /* si tiene la versione che dice di piu' */
    if (String(d.fcmobile || '').length > String(e.fcmobile || '').length) e.fcmobile = d.fcmobile;
    if (String(d.calcetto || '').length > String(e.calcetto || '').length) e.calcetto = d.calcetto;
    if (!e.prova && d.prova) e.prova = d.prova;
  }
}
const tutte = [...m.values()];
fs.writeFileSync(path.join(C, 'tutte.json'), JSON.stringify(tutte, null, 1));

const conta = (k, v) => tutte.filter(d => d[k] === v).length;
const per = k => { const o = {}; for (const d of tutte) { const x = d[k] || '(non detto)'; o[x] = (o[x] || 0) + 1; } return o; };

const ORD_PESO = { alto: 0, medio: 1, basso: 2 };
const ORD_FAV = { fcmobile: 0, calcetto: 1, pari: 2, 'non-confrontabile': 3 };
const simbolo = f => f === 'calcetto' ? 'CALCETTO' : f === 'fcmobile' ? 'FC Mobile' : f === 'pari' ? 'pari' : '—';

let out = '';
out += '# Tutte le differenze fra CALCETTO e EA SPORTS FC Mobile\n\n';
out += 'Aggiornato al 27 agosto 2026. Confronto fra `CALCETTO-il-gioco.html` (un\n';
out += 'file HTML di 1,94 MB, canvas 2D, APK da 717 kB, zero permessi, offline) e\n';
out += '**EA SPORTS FC Mobile** `com.ea.gp.fifamobile` versione 27.0.04\n';
out += '(160 MB di pacchetto, ~949 MB sul telefono, 19 permessi, motore nativo\n';
out += 'Osiris/IronMonkey da 116 MB).\n\n';
out += '## Come e stato fatto, e che cosa vale\n\n';
out += 'Tre fonti, in ordine di forza:\n\n';
out += '1. **Il gioco vero, sul telefono** — installato, aperto e guardato\n';
out += '   (`_analisi/FCMOBILE-OSSERVATO.md`): peso su disco, permessi, memoria,\n';
out += '   tempo d avvio, menu, tutorial, comandi in campo.\n';
out += '2. **Il pacchetto smontato** — 146.695 stringhe leggibili del motore\n';
out += '   nativo, il manifest, i 3.216 file dell APK. Si e letto per SAPERE, non\n';
out += '   per prendere: niente di EA e stato copiato, e l APK e escluso dal\n';
out += '   repository.\n';
out += '3. **Il nostro codice** — letto riga per riga, coi numeri gia misurati dai\n';
out += '   banchi in `strumenti/`.\n\n';
out += 'Ogni riga porta il **verso** (chi sta meglio) e il **grado di verifica**.\n';
out += 'Le righe marcate `dedotto` sono ragionamenti senza prova: restano, ma si\n';
out += 'riconoscono. Un elenco onesto vale piu di uno lungo.\n\n';

out += '## I numeri dell elenco\n\n';
out += '| | |\n|---|---|\n';
out += '| differenze trovate | **' + tutte.length + '** |\n';
out += '| a favore di FC Mobile | ' + conta('favore', 'fcmobile') + ' |\n';
out += '| a favore di CALCETTO | ' + conta('favore', 'calcetto') + ' |\n';
out += '| pari | ' + conta('favore', 'pari') + ' |\n';
out += '| non confrontabili | ' + conta('favore', 'non-confrontabile') + ' |\n';
out += '| di peso alto | ' + conta('peso', 'alto') + ' |\n\n';
out += 'Per grado di verifica: ' + Object.entries(per('verifica')).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v).join(' · ') + '.\n\n';
out += 'Fattibilita in CALCETTO senza tradire il mandato (offline, zero permessi,\n';
out += 'senza licenze): ' + Object.entries(per('fattibile')).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v).join(' · ') + '.\n\n';
out += '---\n\n';

for (const [k, nome] of Object.entries(AREE)) {
  const g = tutte.filter(d => d.area === k);
  if (!g.length) continue;
  g.sort((a, b) => (ORD_PESO[a.peso] ?? 3) - (ORD_PESO[b.peso] ?? 3) || (ORD_FAV[a.favore] ?? 4) - (ORD_FAV[b.favore] ?? 4));
  out += '## ' + k + ' — ' + nome + '  (' + g.length + ')\n\n';
  let pesoCorrente = null;
  for (const d of g) {
    if (d.peso !== pesoCorrente) { pesoCorrente = d.peso; out += '### peso ' + (pesoCorrente || '(non detto)') + '\n\n'; }
    out += '**' + (d.aspetto || '(senza nome)') + '**  ·  meglio: ' + simbolo(d.favore) +
           '  ·  ' + (d.verifica || 'non detto') + (d.fattibile ? '  ·  fattibile: ' + d.fattibile : '') + '\n\n';
    out += '- FC Mobile: ' + (d.fcmobile || '—') + '\n';
    out += '- CALCETTO: ' + (d.calcetto || '—') + '\n';
    if (d.prova) out += '- prova: `' + String(d.prova).replace(/`/g, "'") + '`\n';
    out += '\n';
  }
}

if (rotti.length) {
  out += '---\n\n## File di lavoro che non si sono potuti leggere\n\n';
  for (const r of rotti) out += '- ' + r + '\n';
  out += '\n';
}

fs.writeFileSync(path.join(RADICE, '_analisi', 'DIFFERENZE-FC-MOBILE.md'), out);
console.log('montate ' + tutte.length + ' differenze da ' + file.length + ' file');
console.log('  a favore di FC Mobile: ' + conta('favore', 'fcmobile'));
console.log('  a favore di CALCETTO:  ' + conta('favore', 'calcetto'));
console.log('  pari: ' + conta('favore', 'pari') + '  ·  non confrontabili: ' + conta('favore', 'non-confrontabile'));
if (rotti.length) console.log('  NON LETTI: ' + rotti.join(', '));
console.log('scritto _analisi/DIFFERENZE-FC-MOBILE.md (' + out.length.toLocaleString('it-IT') + ' caratteri)');
