/* =====================================================================
   _sfida-due-telefoni.js — IL BANCO A DUE TELEFONI, IN COMUNE
   (voce #132). Non misura niente di suo: e' l'impianto che i quattro
   cancelli del cantiere condividono.

   PERCHE' ESISTE. Una sfida si puo' REGISTRARE solo attaccando e
   RIVEDERE solo difendendo: il nastro nasce in Sfida.gioca e si rilegge
   in Sfida.guarda, e in mezzo c'e' un server. Un banco che scrive il
   nastro a mano proverebbe il banco, non il gioco. Percio' due contesti
   di browser separati — due salvataggi, due identita', due telefoni — e
   un server finto in memoria.

   Il server finto e il copione delle dita sono quelli di _q-sfida.js,
   copiati e non reinventati: e' l'unico modo perche' un rosso qui e un
   rosso li' vogliano dire la stessa cosa. La sola aggiunta e' il
   parametro `azioni`: una lista di {f, js} che il copione esegue al
   fotogramma f, cioe' la maniglia con cui un cancello puo' premere un
   bottone A META' PARTITA senza riscrivere il copione.

   Non e' un cancello: non ha un'uscita, non stampa niente.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');

const RADICE = path.resolve(__dirname, '..');

/* ------------------------------------------------------ il gioco servito */
function serviGioco(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* =====================================================================
   IL SERVER FINTO — il contratto dei cinque endpoint, in memoria.
   Copiato da _q-sfida.js: stesse regole, stessi rifiuti (base64url,
   64 kB), cosi' un nastro che qui passa passerebbe anche dal vero.
   ===================================================================== */
function serviServer() {
  const db = { allenatori: new Map(), squadre: new Map(), punti: new Map(), impegni: new Map(), sfide: [] };
  const stato = { su: true, semeProssimo: 0 };
  const digest = s => crypto.createHash('sha256').update(String(s)).digest('hex');

  const chiSei = req => {
    const h = req.headers.authorization || '';
    const m = /^Calcetto\s+([^.\s]+)\.(\S+)$/.exec(h);
    if (!m) return null;
    const a = db.allenatori.get(m[1]);
    return (a && a.segreto === digest(m[2])) ? m[1] : null;
  };

  const s = http.createServer(async (req, res) => {
    const via = req.url.split('?')[0];
    const q = new URLSearchParams(req.url.split('?')[1] || '');
    const di = (codice, corpo) => {
      res.writeHead(codice, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      });
      res.end(JSON.stringify(corpo));
    };
    if (req.method === 'OPTIONS') return di(204, {});
    if (!stato.su) { req.socket.destroy(); return; }

    let corpo = {};
    if (req.method !== 'GET') {
      let g = ''; for await (const p of req) g += p;
      try { corpo = g ? JSON.parse(g) : {}; } catch { corpo = {}; }
    }

    if (via === '/api/entra') {
      if (corpo.id) {
        const io = chiSei(req);
        if (!io) return di(401, { ok: false, errore: 'ignoto' });
        return di(200, { ok: true, id: io, punti: db.punti.get(io) || null });
      }
      const id = crypto.randomUUID();
      const segreto = crypto.randomBytes(24).toString('base64url');
      db.allenatori.set(id, { segreto: digest(segreto) });
      db.punti.set(id, { punti: 1000, vinte: 0, pari: 0, perse: 0, serie: 0 });
      return di(200, { ok: true, id, segreto, nuovo: true });
    }

    const io = chiSei(req);
    if (!io) return di(401, { ok: false, errore: 'ignoto' });

    if (via === '/api/squadra') {
      const rosa = corpo.rosa;
      if (!Array.isArray(rosa) || rosa.length < 4) return di(400, { ok: false, errore: 'rosa' });
      const voto = g => ((g.vel | 0) + (g.tiro | 0) + (g.tecnica | 0) + (g.tackle | 0)) / 4;
      const taglia = [5, 7, 11].includes(+corpo.taglia) ? +corpo.taglia : 5;
      const mov = rosa.slice(1).map(voto).sort((a, b) => b - a).slice(0, Math.max(1, taglia - 1));
      const forza = Math.min(99, Math.max(1, Math.round(
        (mov.reduce((s, v) => s + v, 0) + voto(rosa[0]) * 2) / (mov.length + 2))));
      db.squadre.set(io, {
        allenatore: io, nome: String(corpo.nome || '').slice(0, 18), colori: corpo.colori,
        rosa, modulo: corpo.modulo || '4-4-2', indole: corpo.indole || {}, forza,
      });
      return di(200, { ok: true, squadra: db.squadre.get(io), forza });
    }

    if (via === '/api/avversario') {
      /* IL SEME LO DA' IL SERVER, e in un banco dev'essere ripetibile:
         qui e' un contatore, non un sorteggio. */
      stato.semeProssimo += 1;
      const seme = 20260800 + stato.semeProssimo;
      const taglia = [5, 7, 11].includes(+q.get('taglia')) ? +q.get('taglia') : 5;
      let avv = null;
      for (const [k, v] of db.squadre) if (k !== io) { avv = v; break; }
      db.impegni.set(io, { seme, taglia, difensore: avv ? avv.allenatore : null, creato: Date.now() });
      if (!avv) return di(200, { ok: true, vero: false, seme, taglia,
        avversario: { allenatore: null, nome: 'Borgo Nuovo', forza: 50,
          colori: { maglia: '#3355aa', calzoncini: '#111111', riga: '#3355aa', portiere: '#2b2b2b' },
          rosa: Array.from({ length: 5 }, () => ({ nome: 'Rossi', vel: 50, tiro: 50, tecnica: 50, tackle: 50, partite: 0, gol: 0 })),
          modulo: '4-4-2', indole: {}, punti: 1000 } });
      return di(200, { ok: true, vero: true, seme, taglia, avversario: avv });
    }

    if (via === '/api/sfida') {
      if (req.method === 'GET') {
        return di(200, { ok: true, sfide: db.sfide.filter(x => x.difensore === io).map(x => ({
          id: x.id, seme: x.seme, taglia: x.taglia, gol_a: x.gol_a, gol_d: x.gol_d,
          giocata: x.giocata, vista: x.vista,
          sfidante: db.squadre.get(x.attaccante)
            ? { nome: db.squadre.get(x.attaccante).nome, colori: db.squadre.get(x.attaccante).colori } : null,
        })) });
      }
      const imp = db.impegni.get(io);
      if (!imp) return di(409, { ok: false, errore: 'nessun-impegno' });
      if (String(imp.seme) !== String(corpo.seme)) return di(409, { ok: false, errore: 'seme-non-tuo' });
      db.impegni.delete(io);
      if (!corpo.replay || String(corpo.replay).length < 40) return di(400, { ok: false, errore: 'replay-vuoto' });
      if (String(corpo.replay).length > 64 * 1024) return di(413, { ok: false, errore: 'replay-grosso' });
      if (!/^[A-Za-z0-9_\-=+/]+$/.test(String(corpo.replay))) return di(400, { ok: false, errore: 'replay-forma' });
      const ga = corpo.gol_a | 0, gd = corpo.gol_d | 0;
      const p = db.punti.get(io);
      const delta = ga > gd ? 20 : ga < gd ? -20 : 0;
      p.punti = Math.max(100, p.punti + delta);
      if (imp.difensore) db.sfide.push({
        id: db.sfide.length + 1, attaccante: io, difensore: imp.difensore,
        seme: imp.seme, taglia: imp.taglia, gol_a: ga, gol_d: gd, replay: corpo.replay,
        giocata: new Date().toISOString(), vista: false,
      });
      return di(200, { ok: true, esito: ga > gd ? 'vinta' : ga < gd ? 'persa' : 'pari',
                       delta, punti: p.punti, vero: !!imp.difensore });
    }

    if (via === '/api/classifica') {
      if (q.get('replay')) {
        const sf = db.sfide.find(x => String(x.id) === q.get('replay'));
        if (!sf) return di(404, { ok: false, errore: 'non-c-e' });
        if (sf.attaccante !== io && sf.difensore !== io) return di(403, { ok: false, errore: 'non-tua' });
        if (sf.difensore === io) sf.vista = true;
        const rose = [db.squadre.get(sf.attaccante), db.squadre.get(sf.difensore)].filter(Boolean);
        return di(200, { ok: true, sfida: sf, squadre: rose });
      }
      const righe = [...db.punti.entries()].map(([k, v], i) => ({
        posto: i + 1, allenatore: k, nome: (db.squadre.get(k) || {}).nome || '?',
        punti: v.punti, sono_io: k === io,
      }));
      return di(200, { ok: true, righe });
    }
    return di(404, { ok: false, errore: 'via' });
  });

  return new Promise(ok => s.listen(0, '127.0.0.1', () => ok({
    porta: s.address().port, chiudi: () => s.close(), db, stato,
  })));
}

/* =====================================================================
   IL COPIONE DELLE DITA — quello di _q-sfida.js, con UNA aggiunta.

   Deve restare FISSO (nessun sorteggio: se no due esecuzioni non sono
   confrontabili) e deve toccare tutti i verbi. Il duello dal dischetto
   si risolve chiamando i tre metodi e non toccando i pixel, perche' in
   questo banco rAF e' zittito e la geometria del mirino non e' mai stata
   disegnata.

   `azioni` e' la maniglia nuova: [{f, js}, ...]. Al fotogramma f si
   esegue js. E' cosi' che un cancello preme il bottone della pausa a
   meta' partita senza che il copione sappia di quale bottone si tratti.
   ===================================================================== */
const COPIONE = `(function(passiMax, azioni, ditaExtra){
  const t = window.__test;
  const D = t.Duel;
  const dischi = t.pulsanti(0);
  const grande = dischi[0] || {x:800,y:330,r:44};
  const piccolo = dischi[1] || {x:720,y:250,r:34};
  const LX = 180, LY = 300;
  const fatte = [];
  let idL = 1, idB = 2, giu = false, giuB = false, duello = false, f = 0;
  /* LE DITA IN PIU' (voce #132, compito 4). Non fanno gioco: stanno
     appoggiate e si muovono di un pixel, che e' quel che fa un palmo
     sullo schermo di un telefono tenuto con due mani. Servono a UNA cosa:
     il registro scrive una riga per dito per fotogramma, quindi sono la
     leva con cui un cancello porta un nastro VERO contro il suo tetto
     senza abbassare il tetto. */
  const nExtra = ditaExtra | 0;
  for(let d = 0; d < nExtra; d++) Touch5.start(5000 + d, 60 + d * 7, 40);
  const azioniDi = {};
  for(const a of (azioni || [])) (azioniDi[a.f] = azioniDi[a.f] || []).push(a.js);
  const faiAzioni = () => {
    const lista = azioniDi[f];
    if(!lista) return;
    for(const js of lista){
      try { fatte.push({f:f, esito: String((new Function('return (' + js + ')'))()) }); }
      catch(e){ fatte.push({f:f, esito:'ECCEZIONE ' + e.message}); }
    }
  };
  while(f < passiMax){
    if(t.state === 'end') break;
    faiAzioni();
    for(let d = 0; d < nExtra; d++) Touch5.move(5000 + d, 60 + d * 7 + (f % 3), 40 + (f % 2));
    if(t.state === 'freekick'){
      duello = true;
      if(D.phase === 'zone' && D.shooterHuman) D.pickZone(2, 0.74, 0.44);
      else if(D.phase === 'power' && D.shooterHuman) D.stopPower();
      else if(D.phase === 'wait' && D.keeperHuman && D.keeperZone < 0) D.pickKeeper(0);
      t.simulate(1/60); f++;
      continue;
    }
    const a = f * 0.037;
    const rr = 34 + 22 * Math.sin(f * 0.011);
    const x = LX + Math.cos(a) * rr, y = LY + Math.sin(a) * rr;
    if(!giu){ Touch5.start(idL, LX, LY); giu = true; }
    else Touch5.move(idL, x, y);
    if(f % 97 === 96){ Touch5.chiudi(idL, false); giu = false; idL += 2; }
    if(f % 71 === 0 && !giuB){ Touch5.start(idB, grande.x, grande.y); giuB = true; }
    else if(giuB && f % 71 === 18){ Touch5.move(idB, grande.x - 26, grande.y - 14); }
    else if(giuB && f % 71 === 26){ Touch5.chiudi(idB, false); giuB = false; idB += 2; }
    if(f % 53 === 11){ const j = 900 + f; Touch5.start(j, piccolo.x, piccolo.y); Touch5.chiudi(j, false); }
    t.simulate(1/60); f++;
  }
  if(giu) Touch5.chiudi(idL, false);
  if(giuB) Touch5.chiudi(idB, false);
  return { score:[G.score[0],G.score[1]], scena:t.state, righe:t.registroRighe, duello:duello,
           rigori:!!G.rigori, golden:!!G.golden, passi:f, fatte:fatte,
           ment: t.mentalita, tipi: (typeof Reg !== 'undefined' ? Reg.righe.map(r=>r[1]).join('') : ''),
           troncato: (typeof Reg !== 'undefined' && !!Reg.troncato) };
})`;

/* il copione MUTO del replay: nessun dito, li mette il nastro. Le azioni
   restano, perche' la prova piu' importante del canale (a) e' proprio
   che il pollice di CHI GUARDA non deve poter cambiare la partita. */
const MUTO = `(function(passiMax, azioni){
  const t = window.__test;
  const fatte = [];
  let f = 0;
  const azioniDi = {};
  for(const a of (azioni || [])) (azioniDi[a.f] = azioniDi[a.f] || []).push(a.js);
  while(f < passiMax){
    if(t.state === 'end') break;
    const lista = azioniDi[f];
    if(lista) for(const js of lista){
      try { fatte.push({f:f, esito: String((new Function('return (' + js + ')'))()) }); }
      catch(e){ fatte.push({f:f, esito:'ECCEZIONE ' + e.message}); }
    }
    t.simulate(1/60); f++;
  }
  return { score:[G.score[0],G.score[1]], scena:t.state, passi:f, fatte:fatte, ment: t.mentalita };
})`;

/* =====================================================================
   APRIRE UN TELEFONO.

   L'AUDIO SI SBLOCCA ALL'APERTURA, e non e' un dettaglio del banco: e'
   quello che fa un giocatore vero. Nel gioco spedito ogni voce di menu e
   il tocco sulla copertina chiamano Audio5.unlock(), quindi quando una
   sfida comincia il contesto audio c'e' gia'. Un banco che lascia
   l'audio chiuso e poi preme un bottone A META' PARTITA lo sblocca li',
   e misura un canale che non aveva chiesto (voce #132: il primo unlock
   costava 48.000 sorteggi del generatore seminato, grep
   strumenti/_sonda-132-rumore.js).

   `senzaAudio` serve a chi QUEL canale lo vuole misurare apposta.
   ===================================================================== */
async function apri(browser, porta, viewport, senzaAudio) {
  const ctx = await browser.newContext({
    viewport: viewport || { width: 915, height: 412 },
    isMobile: true, hasTouch: true, locale: 'it-IT',
  });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  if (!senzaAudio) await pag.evaluate(() => { try { Audio5.unlock(); } catch (e) {} });
  return { ctx, pag, errori };
}

/* QUANTO COSTA APRIRE L'AUDIO, in sorteggi del generatore seminato.
   Va chiamata su una pagina aperta con senzaAudio: dopo, quella pagina
   l'audio ce l'ha. Zero e' la risposta giusta. */
const costoAudio = P => P.pag.evaluate(() => {
  const t = window.__test;
  t.semina(20260921);
  const prima = t.sorteggi;
  try { Audio5.unlock(); } catch (e) {}
  const dopo = t.sorteggi;
  t.desemina();
  return { costo: dopo - prima, sampleRate: (Audio5.ctx ? Audio5.ctx.sampleRate : 0) };
});

/* la squadra del telefono: nome, e una rosa diversa dall'altra (se fossero
   uguali, una squadra scambiata per l'altra non si vedrebbe) */
const collega = (P, portaServer, nome, rosaJs) => P.pag.evaluate(([p, nome, rosaJs]) => {
  const t = window.__test;
  t.reteBase('http://127.0.0.1:' + p);
  t.save.teamName = nome;
  t.save.rosa = t.save.rosa.map((r, i) => Object.assign({}, r, {
    nome: nome + ' ' + (i + 1),
    vel: 50 + ((i * 7 + nome.length * 3) % 30),
    tiro: 50 + ((i * 11 + nome.length * 5) % 30),
    tecnica: 50 + ((i * 5 + nome.length * 7) % 30),
    tackle: 50 + ((i * 13 + nome.length * 2) % 30),
  }));
  if (rosaJs) (new Function('rosa', rosaJs))(t.save.rosa);
}, [portaServer, nome, rosaJs || '']);

const entra = P => P.pag.evaluate(async () => await window.__test.rete.entra());
const pubblica = P => P.pag.evaluate(async () => await window.__test.rete.pubblica());

/* UNA SFIDA INTERA, dal CERCA AVVERSARIO al fischio finale. Torna anche
   l'id che il server ha dato: non e' il numero del tentativo, perche' una
   partita che non arriva al fischio non viene mandata. */
async function giocaUna(A, ss, azioni, passiMax, ditaExtra) {
  const r = await A.pag.evaluate(async ([c, azioni, passiMax, ditaExtra]) => {
    const t = window.__test;
    await t.sfida.cerca();
    if (!t.sfidaStato.inPartita) return { partita: false };
    const via = { seme: t.sfidaStato.seme, taglia: t.sfidaStato.taglia,
                  timeLeft: Math.round(t.timeLeft), ment: t.mentalita,
                  car: (G.car && G.car[1]) ? Object.values(G.car[1]).join('/') : '?',
                  loro: t.players.filter(p => p.team === 1).map(p => p.nome).join(','),
                  miei: t.players.filter(p => p.team === 0).map(p => p.nome).join(','),
                  attrMiei: t.players.filter(p => p.team === 0)
                    .map(p => [p.vel, p.tiro, p.tecnica, p.tackle].join('/')).join(' ') };
    const fine = (new Function('return ' + c))()(passiMax || 24000, azioni || [], ditaExtra || 0);
    return { partita: true, via, fine };
  }, [COPIONE, azioni || [], passiMax || 24000, ditaExtra || 0]);
  /* chiudiSfida spedisce senza che nessuno la aspetti: qui si aspetta */
  await A.pag.waitForTimeout(700);
  r.id = ss.db.sfide.length ? ss.db.sfide[ss.db.sfide.length - 1].id : 0;
  r.riga = ss.db.sfide.length ? ss.db.sfide[ss.db.sfide.length - 1] : null;
  return r;
}

/* IL REPLAY, dalla parte di chi ha subito. Nessun dito: se il replay
   avesse bisogno di un dito non sarebbe un replay. Le `azioni` servono
   solo alle prove che DEVONO provare a sporcarlo. */
async function guardaUna(B, id, azioni, passiMax) {
  const r = await B.pag.evaluate(async ([id, MUT, azioni, passiMax]) => {
    const t = window.__test;
    await t.sfida.guarda(id);
    const partito = { scena: t.state, seminato: t.seminato, registro: t.registroModo,
                      stato: t.sfidaStato, timeLeft: Math.round(t.timeLeft), ment: t.mentalita,
                      car: (G.car && G.car[1]) ? Object.values(G.car[1]).join('/') : '?',
                      miei: t.players ? t.players.filter(p => p.team === 0).map(p => p.nome).join(',') : '',
                      attrMiei: t.players ? t.players.filter(p => p.team === 0)
                        .map(p => [p.vel, p.tiro, p.tecnica, p.tackle].join('/')).join(' ') : '',
                      riga: (document.getElementById('sfStato') || {}).textContent || '' };
    if (t.registroModo !== 2) return { partito, fine: null, riga: partito.riga, rifiutato: true };
    const fine = (new Function('return ' + MUT))()(passiMax || 24000, azioni || []);
    return { partito, fine, rifiutato: false,
             riga: (document.getElementById('sfStato') || {}).textContent || '' };
  }, [id, MUTO, azioni || [], passiMax || 24000]);
  await B.pag.waitForTimeout(300);
  r.rigaFine = await B.pag.evaluate(() => (document.getElementById('sfStato') || {}).textContent || '');
  return r;
}

module.exports = { RADICE, serviGioco, serviServer, apri, costoAudio, collega, entra, pubblica,
                   giocaUna, guardaUna, COPIONE, MUTO };
