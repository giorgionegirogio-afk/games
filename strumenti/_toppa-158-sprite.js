/* =====================================================================
   _toppa-158-sprite.js — GLI SPRITE FOTOGRAFICI ENTRANO IN PARTITA
   (voce #158, compito 1)

   CHE COSA FA. Incorpora nel gioco il modulo Sprite3D (sorgente in
   strumenti/sprite/sprite3d.js) con dentro l'ATLANTE dei fotogrammi e le
   MASCHERE di tinta (fuori/sprite/atlante/, prodotti da atlante.py),
   come data-URI: il file resta uno e senza rete. Poi aggancia il modulo
   nei tre punti dove il rig disegnava una figura in partita:
     1. la chiamata a Rig3D.disegna del giocatore in pianta: si prova
        prima lo sprite; il rig resta il ripiego se lo sprite non c'e'
        (atlante non decodificato, clip senza fotogrammi, camera bassa);
     2. l'ancora del NUMERO DI MAGLIA: con lo sprite la legge Sprite3D
        (Rig3D.torso() sarebbe la posa dell'ULTIMA figura del rig, cioe'
        di un altro uomo);
     3. il ritaglio del glifo attorno alla testa (copre): vive sui giunti
        del rig, che con lo sprite non esistono — si spegne.
   E un rubinetto: window.__test.sprite legge lo stato e spriteOn(v)
   accende/spegne gli sprite, per i confronti A/B dei banchi.

   CHE COSA NON FA. Non tocca una riga di simulazione, non consuma un
   sorteggio, non cambia MOTORE_V. Le figure nella camera 'bassa' (rigori,
   ripresa del gol), il duello e il menu restano al rig: lo sprite non ha
   quell'angolo e non deve fingere.

   USO:  node strumenti/_toppa-158-sprite.js --out <dest.html>
         node strumenti/_toppa-158-sprite.js --dentro CALCETTO-il-gioco.html
         [--atlante fuori/sprite/atlante] [--da CALCETTO-il-gioco.html]
   Ogni ancora deve comparire UNA volta sola: altrimenti non scrive niente.
   ===================================================================== */
const fs = require('fs'), path = require('path');
const E = [];
const esatta = (nome, da, a) => E.push({ nome, da, a });
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const DA = pren('--da') || 'CALCETTO-il-gioco.html';
const A = pren('--a') || pren('--out') || pren('--dentro');
const ATL = pren('--atlante') || 'fuori/sprite/atlante';
const QUI = path.dirname(__filename);

/* ------------------------------------------------------------------
   0. il modulo, con i dati dentro
   ------------------------------------------------------------------ */
const leggi = (p) => fs.readFileSync(p);
const uri = (p, tipo) => 'data:' + tipo + ';base64,' + leggi(p).toString('base64');
const tav = fs.readFileSync(path.join(ATL, 'atlante.json'), 'utf8');
const webp = path.join(ATL, 'atlante.webp'), png = path.join(ATL, 'atlante.png');
const src = fs.existsSync(webp) ? uri(webp, 'image/webp') : uri(png, 'image/png');
/* le maschere in WebP SENZA PERDITA se c'e' (79 kB contro 114 del PNG
   con 64 celle): una maschera con artefatti tingerebbe la pelle */
const webpM = path.join(ATL, 'atlante-m.webp');
const srcM = fs.existsSync(webpM) ? uri(webpM, 'image/webp') : uri(path.join(ATL, 'atlante-m.png'), 'image/png');
/* i capelli, terza immagine (compito 4) */
const webpK = path.join(ATL, 'atlante-k.webp');
const srcK = fs.existsSync(webpK) ? uri(webpK, 'image/webp') : uri(path.join(ATL, 'atlante-k.png'), 'image/png');
let modulo = fs.readFileSync(path.join(QUI, 'sprite', 'sprite3d.js'), 'utf8');
if (!/__SPRITE_TAV__/.test(modulo) || !/__SPRITE_SRC__/.test(modulo) || !/__SPRITE_SRCM__/.test(modulo) || !/__SPRITE_STATURE__/.test(modulo) || !/__SPRITE_SORG_PELLE__/.test(modulo)) {
  console.error('FALLITO: sprite3d.js senza i cinque segnaposto.'); process.exit(1);
}
/* il colore sorgente della pelle: se atlante.json lo dichiara (atlante.py
   lo misura sotto la maschera) si usa quello, altrimenti la misura del
   25 settembre 2026 sui primi 176 fotogrammi */
let sorgPelle = '[203,158,133]';
try { const tj = JSON.parse(tav); if (tj.sorg_pelle) sorgPelle = JSON.stringify(tj.sorg_pelle); } catch (e) {}
modulo = modulo.replace('__SPRITE_SORG_PELLE__', () => sorgPelle);
/* le quattro stature del rig (CORPI, voce #155): spilungone, tarchiato,
   piccoletto, neutro — copiate a mano, e _q-sprite le confronta col rig */
modulo = modulo.replace('__SPRITE_TAV__', () => tav)
               .replace('__SPRITE_SRC__', () => src)
               .replace('__SPRITE_SRCM__', () => srcM)
               .replace('__SPRITE_SRCK__', () => srcK)
               .replace('__SPRITE_STATURE__', () => '[1.040,0.925,0.855,1.000]');

esatta('il modulo Sprite3D, subito dopo Rig3D',
`               tagli:()=>TAGLI, azzeraTagli:()=>{TAGLI=0;}}};
})();
`,
`               tagli:()=>TAGLI, azzeraTagli:()=>{TAGLI=0;}}};
})();

${modulo}
/* il rubinetto degli sprite: acceso; i banchi lo chiudono per l'A/B */
let SPRITE_ON = true;
Sprite3D.carica();
`);

/* ------------------------------------------------------------------
   1. la figura in partita: prima lo sprite, poi il rig come ripiego
   ------------------------------------------------------------------ */
esatta('la chiamata di disegno in partita',
`    Rig3D.guarda(rigGuarda(p, yaw - RIG_YAW_K));
    Rig3D.disegna(ctx, p.x, cy, hb, yaw, 'alto', st.clip, st.u/clip.freq, look, true,
                  (G.view.S2||1)*P_DIS, p.filo?1.7:0);
`,
`    /* LO SPRITE PRIMA DEL RIG (voce #158): stessa firma, stesso punto a
       terra, stessa altezza apparente. Se risponde false — atlante non
       ancora decodificato, clip senza fotogrammi — il rig disegna come
       ha sempre fatto. La dichiarazione della testa (guarda) si arma
       SOLO per il rig: e' monouso e la consumerebbe la figura dopo. */
    const conSprite = SPRITE_ON && SAVE.figure!==0 && Sprite3D.disegna(ctx, p.x, cy, hb, yaw, 'alto', st.clip,
                        st.u/clip.freq, look, true, (G.view.S2||1)*P_DIS, p.filo?1.7:0);
    if(!conSprite){
      Rig3D.guarda(rigGuarda(p, yaw - RIG_YAW_K));
      Rig3D.disegna(ctx, p.x, cy, hb, yaw, 'alto', st.clip, st.u/clip.freq, look, true,
                    (G.view.S2||1)*P_DIS, p.filo?1.7:0);
    }
`);

/* ------------------------------------------------------------------
   2. l'ancora del numero, e 3. il ritaglio attorno alla testa
   ------------------------------------------------------------------ */
/* Rig3D.torso() compare tre volte nel file (partita, portiere del
   dischetto, tiratore del dischetto): l'ancora porta con se' la riga di
   commento che segue, che e' solo della partita. */
esatta('l\'ancora del numero di maglia',
`      const T=Rig3D.torso();
      /* 0,80 e non 0,72 (A0)`,
`      const T=conSprite?Sprite3D.torso():Rig3D.torso();
      /* 0,80 e non 0,72 (A0)`);

esatta('il ritaglio del glifo attorno alla testa',
`        const copre = (gDx*gDx+gDy*gDy < gRag*gRag) &&`,
`        const copre = !conSprite && (gDx*gDx+gDy*gDy < gRag*gRag) &&`);

/* ------------------------------------------------------------------
   3b. LE SCENE IN CAMERA BASSA (compito 3): il portiere e il tiratore del
   dischetto, e la ripresa del gol. Stessa forma dell'aggancio in pianta:
   prima lo sprite, il rig come ripiego; il numero si ancora al torso di
   chi ha disegnato davvero.
   ------------------------------------------------------------------ */
esatta('il portiere del dischetto (camera bassa)',
`    Rig3D.disegna(ctx, kx, ky, hbK, yawK, 'bassa', clipK,
                  uK/Rig3D.CLIPS[clipK].freq, rigLook(DUEL_RIG_K), true, DPR);
    /* il numero 1, ancorato al torso del rig */
    {
      const T=Rig3D.torso();`,
`    const conSpriteK = SPRITE_ON && SAVE.figure!==0 && Sprite3D.disegna(ctx, kx, ky, hbK, yawK, 'bassa', clipK,
                         uK/Rig3D.CLIPS[clipK].freq, rigLook(DUEL_RIG_K), true, DPR);
    if(!conSpriteK)
      Rig3D.disegna(ctx, kx, ky, hbK, yawK, 'bassa', clipK,
                    uK/Rig3D.CLIPS[clipK].freq, rigLook(DUEL_RIG_K), true, DPR);
    /* il numero 1, ancorato al torso di chi ha disegnato (voce #158) */
    {
      const T=conSpriteK?Sprite3D.torso():Rig3D.torso();`);

esatta('il tiratore del dischetto (camera bassa)',
`    Rig3D.disegna(ctx, sx2, py2, hbS, 0.5, 'bassa', clipS,
                  uS/Rig3D.CLIPS[clipS].freq, rigLook(DUEL_RIG_S), true, DPR);
    /* numero sulla schiena: e' di spalle, il numero e' cio' che si vede */
    {
      const T=Rig3D.torso();`,
`    const conSpriteS = SPRITE_ON && SAVE.figure!==0 && Sprite3D.disegna(ctx, sx2, py2, hbS, 0.5, 'bassa', clipS,
                         uS/Rig3D.CLIPS[clipS].freq, rigLook(DUEL_RIG_S), true, DPR);
    if(!conSpriteS)
      Rig3D.disegna(ctx, sx2, py2, hbS, 0.5, 'bassa', clipS,
                    uS/Rig3D.CLIPS[clipS].freq, rigLook(DUEL_RIG_S), true, DPR);
    /* numero sulla schiena: e' di spalle, il numero e' cio' che si vede */
    {
      const T=conSpriteS?Sprite3D.torso():Rig3D.torso();`);

esatta('la ripresa del gol (camera bassa)',
`    Rig3D.disegna(ctx, x, y, hb, o.yaw, 'bassa', o.clip, o.tSec, rigLook(q), false, DPR);
  }`,
`    /* LO SPRITE ANCHE IN RIPRESA (voce #158, compito 3): con l'ombra di
       contatto sua, perche' qui il rig la disegnava da se' */
    if(!(SPRITE_ON && SAVE.figure!==0 && Sprite3D.disegna(ctx, x, y, hb, o.yaw, 'bassa', o.clip, o.tSec, rigLook(q), false, DPR)))
      Rig3D.disegna(ctx, x, y, hb, o.yaw, 'bassa', o.clip, o.tSec, rigLook(q), false, DPR);
  }`);

/* ------------------------------------------------------------------
   4. il rubinetto per i banchi
   ------------------------------------------------------------------ */
esatta('window.__test: stato e rubinetto degli sprite',
`window.__test = {
  get state(){ return G.scene; },`,
`window.__test = {
  get state(){ return G.scene; },
  /* GLI SPRITE (voce #158): lo stato dell'atlante e il rubinetto per i
     confronti A/B — spento, il gioco disegna col rig come prima. */
  get sprite(){ return Object.assign({on:SPRITE_ON && SAVE.figure!==0, rubinetto:SPRITE_ON, figure:SAVE.figure}, Sprite3D.stato()); },
  spriteOn(v){ SPRITE_ON = !!v; return SPRITE_ON; },`);

/* ------------------------------------------------------------------
   5. l'interruttore nelle Impostazioni: FIGURE fotografiche / disegnate
   (SAVE.figure, additivo come SAVE.amici al #136: un salvataggio vecchio
   non ha la chiave e vale «fotografiche»)
   ------------------------------------------------------------------ */
/* IN FONDO ad Accessibilita' e A TUTTA RIGA (`sola`), non davanti a
   MOVIMENTO: la prima stesura lo metteva per primo nella coppia, e in
   orizzontale (griglia a due colonne) spostava ALTO CONTRASTO da solo
   sulla riga dopo — `disposizione` ROSSO, «1 ORFANO, 1 BUCATA», su 7
   formati, dal commit c485d5d fino al 8aeca73 (la batteria mirata dei
   quattro compiti non lo comprendeva; la batteria intera si'). Una voce
   a tutta riga, come SOTTOTITOLI subito sopra, non puo' spaiare nessuno. */
esatta('il pulsante FIGURE nelle impostazioni (markup)',
`      <button class="voce sw sola" id="btnSetSott">SOTTOTITOLI: S&Igrave; <small>fischio — a video</small></button>`,
`      <button class="voce sw sola" id="btnSetSott">SOTTOTITOLI: S&Igrave; <small>fischio — a video</small></button>
      <button class="voce sw sola" id="btnSetFigure">FIGURE: FOTOGRAFICHE <small>giocatori fotografici o disegnati</small></button>`);

esatta('il pulsante FIGURE nelle impostazioni (etichetta)',
`  $('btnSetMoto').innerHTML='MOVIMENTO: '+(SAVE.moto?'COMPLETO':'RIDOTTO')+
    ' <small>scossa, coriandoli, transizioni</small>';`,
`  $('btnSetMoto').innerHTML='MOVIMENTO: '+(SAVE.moto?'COMPLETO':'RIDOTTO')+
    ' <small>scossa, coriandoli, transizioni</small>';
  $('btnSetFigure').innerHTML='FIGURE: '+(SAVE.figure===0?'DISEGNATE':'FOTOGRAFICHE')+
    ' <small>giocatori fotografici o disegnati</small>';`);

esatta('il pulsante FIGURE nelle impostazioni (stato acceso)',
`  $('btnSetMoto').classList.toggle('on', !!SAVE.moto);`,
`  $('btnSetMoto').classList.toggle('on', !!SAVE.moto);
  $('btnSetFigure').classList.toggle('on', SAVE.figure!==0);`);

esatta('il pulsante FIGURE nelle impostazioni (aria)',
`  $('btnSetMoto').setAttribute('aria-pressed', SAVE.moto?'true':'false');`,
`  $('btnSetMoto').setAttribute('aria-pressed', SAVE.moto?'true':'false');
  $('btnSetFigure').setAttribute('aria-pressed', SAVE.figure!==0?'true':'false');`);

esatta('il pulsante FIGURE nelle impostazioni (click)',
`$('btnSetMoto').addEventListener('click', ()=>{`,
`$('btnSetFigure').addEventListener('click', ()=>{
  /* FIGURE (voce #158): fotografiche (sprite) o disegnate (rig). E' solo
     disegno: la partita non cambia di un bit, e si puo' cambiare anche a
     partita in corso. */
  SAVE.figure = (SAVE.figure===0)?1:0; persistSave(); refreshImpostUI(); Audio5.beep(480);
});
$('btnSetMoto').addEventListener('click', ()=>{`);

esatta('SAVE.figure fra i predefiniti',
`    moto:1, dalt:0, durata:90,     // accessibilita': effetti, contrasto divise, durata`,
`    moto:1, dalt:0, durata:90,     // accessibilita': effetti, contrasto divise, durata
    figure:1,                      // voce #158: 1 giocatori fotografici (sprite), 0 disegnati (rig)`);

/* ===================================================================== */
if (!A) { console.error('FALLITO: manca --out <destinazione> (o --dentro).'); process.exit(1); }
if (!fs.existsSync(DA)) { console.error('FALLITO: sorgente inesistente: ' + DA); process.exit(1); }

let testo = fs.readFileSync(DA, 'utf8');
const prima = testo.length;
for (const e of E) {
  const n = testo.split(e.da).length - 1;
  if (n !== 1) {
    console.error('FALLITO [' + e.nome + ']: l\'ancora compare ' + n + ' volte, non 1. Non scrivo niente.');
    console.error('  ancora: ' + e.da.slice(0, 160).replace(/\n/g, ' | '));
    process.exit(1);
  }
  testo = testo.replace(e.da, () => e.a);
}
const dest = path.resolve(A);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, testo);
console.log('toppa applicata: ' + E.length + ' ancore');
console.log('  da:   ' + DA + ' (' + prima + ' byte)');
console.log('  a:    ' + dest + ' (' + testo.length + ' byte, +' + ((testo.length - prima) / 1024).toFixed(1) + ' kB)');
console.log('  atlante: ' + ATL + (fs.existsSync(webp) ? ' (webp)' : ' (png)'));
