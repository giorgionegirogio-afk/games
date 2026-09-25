/* _157-diag-quadro.js — sonda usa-e-getta: quanto sono separate in
   quadro le due gambe (caviglia, meta' tibia, ginocchio) e le due
   braccia (gomito), clip per clip e imbardata per imbardata, e quante
   righe con due tratti ne escono. Serve a scegliere il minimo della
   legge L4 guardando i numeri invece che indovinandoli. */
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const arg = (n,d)=>{const i=process.argv.indexOf('--'+n);return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;};
const PORTA = arg('porta','8777'), GIOCO = arg('gioco','CALCETTO-il-gioco.html');

(async () => {
  const br = await chromium.launch();
  const pg = await br.newPage();
  await pg.goto('http://127.0.0.1:'+PORTA+'/'+GIOCO+'?provino&t='+Date.now());
  await pg.waitForFunction('typeof Rig3D==="object"', { timeout: 45000 });
  const out = await pg.evaluate(() => {
    const NERO='#000';
    const nero={maglia:NERO,maglia2:NERO,manica:NERO,pantaloncini:NERO,calze:NERO,risvolto:NERO,
      pelle:NERO,capelli:NERO,scarpe:NERO,palla:null,taglio:0,corp:3,varb:0,manc:false,
      _lume:NERO,_ombra:NERO,_ombS:{maglia:NERO,maglia2:NERO,calze:NERO,pantaloncini:NERO,pelle:NERO}};
    const CW=130,CH=130;
    const cv=document.createElement('canvas'); cv.width=CW; cv.height=CH;
    const g=cv.getContext('2d',{willReadFrequently:true});
    const B=Rig3D.banco, P=B.P;
    const J={PELVIS:0,CHEST:1,NECK:2,HEAD:3,SHL:4,ELL:5,HAL:6,SHR:7,ELR:8,HAR:9,
             HIPL:10,KNL:11,FTL:12,HIPR:13,KNR:14,FTR:15,TOL:16,TOR:17};
    const righe=[];
    for(const clip of Object.keys(Rig3D.CLIPS)){
      for(const yawD of [54,144,234,324]){
        const yaw=yawD*Math.PI/180, ex=Math.cos(yaw), ez=Math.sin(yaw);
        /* la posa, valutata dal banco alla stessa fase del foglio */
        B.corpora(3,0); B.mancino(false);
        B.posa(clip,0.300);
        const q=(j)=>P[j*3]*ex+P[j*3+2]*ez;
        const cav=q(J.FTR)-q(J.FTL), gin=q(J.KNR)-q(J.KNL), gom=q(J.ELR)-q(J.ELL);
        const met=((q(J.KNR)+q(J.FTR))-(q(J.KNL)+q(J.FTL)))*0.5;
        /* e le righe a due tratti, dal disegno vero */
        g.clearRect(0,0,CW,CH);
        const cx=CW*0.5, cy=CH*0.84, sc=40/RIG_H;
        g.save(); g.translate(cx,cy); g.scale(sc,sc); g.translate(-cx,-cy);
        Rig3D.disegna(g,cx,cy,RIG_H,yaw,'alto',clip,0.300/Rig3D.CLIPS[clip].freq,nero,true,sc);
        g.restore();
        const d=g.getImageData(0,0,CW,CH).data;
        const m=new Uint8Array(CW*CH);
        let x0=CW,x1=-1,y0=CH,y1=-1;
        for(let y=0;y<CH;y++)for(let x=0;x<CW;x++) if(d[(y*CW+x)*4+3]>128){m[y*CW+x]=1;
          if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y;}
        const bh=y1-y0+1;
        let gb=0;
        for(let y=Math.floor(bh*0.66);y<bh;y++){
          let t=0,pr=0;
          for(let x=x0;x<=x1;x++){const v=m[(y+y0)*CW+x]; if(v&&!pr)t++; pr=v;}
          if(t>=2) gb++;
        }
        righe.push({clip,yaw:yawD,cav,met,gin,gom,gb});
      }
    }
    return righe;
  });
  console.log('clip             yaw   caviglie  mezzatibia ginocchia  gomiti   righe2');
  for(const r of out){
    console.log('  '+r.clip.padEnd(14)+String(r.yaw).padStart(4)+'  '
      +r.cav.toFixed(3).padStart(8)+'  '+r.met.toFixed(3).padStart(9)+'  '
      +r.gin.toFixed(3).padStart(8)+'  '+r.gom.toFixed(3).padStart(7)+'  '+String(r.gb).padStart(5));
  }
  /* la soglia empirica: a che separazione di MEZZA TIBIA si comprano tre righe? */
  for(const s of [0.15,0.18,0.21,0.24,0.27,0.30]){
    const den=out.filter(r=>Math.abs(r.met)>=s);
    const ok=den.filter(r=>r.gb>=3).length;
    console.log('  mezza tibia >= '+s.toFixed(2)+' m: '+ok+'/'+den.length
      +' hanno 3+ righe a due tratti');
  }
  await br.close();
})();
