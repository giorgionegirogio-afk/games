/* =====================================================================
   _q-meta-controllo.js — IL CONTROLLO NEGATIVO di _q-meta.js.

   PERCHE' ESISTE. Regola di casa: uno strumento che non e' stato visto
   FALLIRE non e' uno strumento (censimento 20 ago, §3.8.18: quattro
   cancelli mai visti rossi sono decorazioni). Qui si rompe APPOSTA, in
   tre copie del gioco fuori dal repo, esattamente cio' che _q-meta.js
   sorveglia — e su ognuna il cancello DEVE uscire 1 con il rosso GIUSTO,
   non un rosso qualsiasi:

     punti        registraRisultato paga 2 punti la vittoria invece di 3:
                  la classifica del gioco diverge da quella ricalcolata
                  dalla definizione (3/1/0). Atteso: NO con
                  «LA CLASSIFICA NON TORNA».
     tabellone    advanceTournament mette lo stesso vincitore nei due
                  posti del turno nuovo: squadra doppia, avversario
                  sparito. Atteso: NO su «vincitori giusti» o
                  «squadra doppia».
     salvataggio  persistSave scrive il salvataggio SENZA la stagione:
                  alla ricarica di meta' stagione i dati del giocatore
                  sono perduti. Atteso: NO su «regge la ricarica» oppure
                  «SPARITA dal salvataggio».

   Le copie si scrivono in fuori/ (mai nel repo del gioco) con la regola
   delle toppe di casa: l'ancora deve trovarsi ESATTAMENTE UNA VOLTA,
   altrimenti ci si ferma senza scrivere. Il gioco vero NON viene toccato.

   uso:
     node strumenti/_q-meta-controllo.js              i tre sabotaggi
     node strumenti/_q-meta-controllo.js --anche-verde  prima il gioco vero
                                                      (deve uscire 0), poi i tre
   uscita: 0 = il cancello sa fallire su tutti e tre (ed e' verde sul
   vero, se chiesto) · 1 = almeno un sabotaggio non e' stato visto.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const GIOCO = path.join(RADICE, 'CALCETTO-il-gioco.html');
const FUORI = path.join(RADICE, 'fuori');

/* [nome, ancora, sostituto, rosso atteso nel referto] — le ancore sono
   righe VIVE del gioco (md5 30279089de83): se il gioco cambia e un'ancora
   non si trova piu' esattamente una volta, questo strumento si ferma
   invece di fabbricare un falso che non somiglia al gioco */
const SABOTAGGI = [
  ['punti',
    'if(ga>gb){ A.v++; B.p++; A.pt+=3; }',
    'if(ga>gb){ A.v++; B.p++; A.pt+=2; }',
    'LA CLASSIFICA NON TORNA'],
  ['tabellone',
    'for(let i=0;i<N.length;i++){ N[i].a=R[i*2].w; N[i].b=R[i*2+1].w; N[i].w=-1; }',
    'for(let i=0;i<N.length;i++){ N[i].a=R[i*2].w; N[i].b=R[i*2].w; N[i].w=-1; }',
    'vincitori giusti|squadra doppia'],
  ['salvataggio',
    'try{ localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); }catch(e){}',
    'try{ const _s=Object.assign({},SAVE); _s.season=null; localStorage.setItem(SAVE_KEY, JSON.stringify(_s)); }catch(e){}',
    'regge la ricarica|SPARITA dal salvataggio'],
];

function corri(gioco) {
  const r = spawnSync(process.execPath, [path.join(__dirname, '_q-meta.js'), '--gioco', gioco],
    { cwd: RADICE, encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
  return { codice: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

(() => {
  const src = fs.readFileSync(GIOCO, 'utf8');
  if (!fs.existsSync(FUORI)) fs.mkdirSync(FUORI);
  let falliti = 0;

  /* il verde sul vero, se chiesto: un controllo negativo accanto a un
     cancello che boccia anche il sano non prova niente */
  if (process.argv.includes('--anche-verde')) {
    process.stdout.write('  ... il gioco vero (atteso VERDE)\n');
    const v = corri(GIOCO);
    const ok = v.codice === 0;
    if (!ok) falliti++;
    console.log('  ' + (ok ? 'OK  ' : 'NO  ') + 'gioco vero: uscita ' + v.codice + ' (attesa 0)');
  }

  for (const [nome, ancora, sostituto, atteso] of SABOTAGGI) {
    const conte = src.split(ancora).length - 1;
    if (conte !== 1) {
      console.log('  NO   ' + nome + ': ancora trovata ' + conte + ' volte invece di 1 — il gioco e\' cambiato, mi fermo senza scrivere');
      falliti++;
      continue;
    }
    const copia = path.join(FUORI, '_nc-meta-' + nome + '.html');
    fs.writeFileSync(copia, src.replace(ancora, sostituto));
    process.stdout.write('  ... sabotaggio "' + nome + '" (atteso ROSSO: ' + atteso + ')\n');
    const r = corri(copia);
    const righeNo = r.out.split(/\r?\n/).filter(x => /^\s*NO\b/.test(x));
    const giusto = new RegExp(atteso).test(righeNo.join('\n'));
    const ok = r.codice === 1 && giusto;
    if (!ok) falliti++;
    console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + ': uscita ' + r.codice + ' (attesa 1), rosso giusto: ' + (giusto ? 'si\'' : 'NO') +
      (righeNo.length ? '  |  primo NO: ' + righeNo[0].trim().slice(0, 110) : '  |  NESSUNA RIGA NO'));
  }

  const su = SABOTAGGI.length + (process.argv.includes('--anche-verde') ? 1 : 0);
  console.log('\n' + su + ' prove, ' + (su - falliti) + ' passate, ' + falliti + ' fallite' +
    (falliti ? '' : ' — il cancello sa fallire, ed e\' stato visto'));
  process.exit(falliti ? 1 : 0);
})();
