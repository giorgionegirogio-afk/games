/* METRO DELLA SERA (attrezzo di lavoro, temporaneo).
   Misura DENTRO il gioco, alla stessa ora della scena sera-secondo-tempo:
     · contrasto maglia/erba con la STESSA logica di collaudo.js
     · erba: grigio percettivo, saturazione HSV, tinta, per colonne di schermo
     · Y95 dell'erba (la grana: se crolla, e' nebbia)
     · R-B fra quadranti opposti (la rampa termica, in livelli)
     · palla contro la mediana dell'erba
   uso: node strumenti/_sera.js [--sec 20] [--file CALCETTO-il-gioco.html]
*/
const fs=require('fs'),path=require('path'),http=require('http');
const {chromium}=require('playwright');
const RADICE=path.resolve(__dirname,'..');
function arg(n,d){const i=process.argv.indexOf('--'+n);return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;}
function servi(){return new Promise(ok=>{const s=http.createServer((req,res)=>{const f=path.join(RADICE,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(RADICE)||!fs.existsSync(f)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});fs.createReadStream(f).pipe(res);});s.listen(0,'127.0.0.1',()=>ok({porta:s.address().port,chiudi:()=>s.close()}));});}
(async()=>{
  const FILE=arg('file','CALCETTO-il-gioco.html');
  const SEC=+arg('sec',20);
  const srv=await servi();
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'it-IT'});
  const pag=await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${srv.porta}/${FILE}`,{waitUntil:'load'});
  await pag.waitForFunction('window.__test !== undefined',null,{timeout:20000});
  await pag.waitForTimeout(400);
  const out=await pag.evaluate(async (SEC)=>{
    const t=window.__test;
    const cv=document.getElementById('gioco');
    const c2=cv.getContext('2d',{willReadFrequently:true});
    const DPRc=cv.width/window.innerWidth;
    t.dismissSplash&&t.dismissSplash();
    t.startMatch(1,1); t.setCpuVsCpu(true);
    const lin=c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);};
    const lumin=(r,g,b)=>0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
    const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[s.length>>1];};
    const perc=(a,q)=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(s.length*q))];};
    const hsv=(r,g,b)=>{const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;
      if(d){if(mx===r)h=60*(((g-b)/d)%6);else if(mx===g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4);}
      if(h<0)h+=360;return{h,s:mx?d/mx:0,v:mx/255};};
    const FW=1150,FH=560;
    const maglia=[[],[]],erba=[[],[]];
    const OMB=(t.ombraCapsula&&t.ombraCapsula())||{ux:.9406,uy:.3402,l0:0,l1:140,semiCorto:7.6,piedeX:4.2,piedeY:7.8};
    const dentroOmbra=(qx,qy,wx,wy)=>{const ax=qx+OMB.piedeX,ay=qy+OMB.piedeY,rx=wx-ax,ry=wy-ay;
      let t2=rx*OMB.ux+ry*OMB.uy;if(t2<OMB.l0)t2=OMB.l0;if(t2>OMB.l1)t2=OMB.l1;
      const px=ax+OMB.ux*t2,py=ay+OMB.uy*t2;return Math.hypot(wx-px,wy-py)<OMB.semiCorto*1.6+4;};
    /* si porta la partita all'ora chiesta, come fa scatta.js */
    t.simulate(4.0);
    for(let i=0;i<90;i++){const s=t.state;if((s==='play'||s==='golden')&&!t.moviola)break;t.simulate(0.12);}
    t.setTimeLeft(SEC); t.simulate(0.2);
    let fotogrammi=0; const colonne=[[],[],[],[],[],[],[]]; const gy=[]; const quad=[[],[],[],[]];
    const pallaC=[],erbaTutta=[],portM=[],portE=[];const inPozza=[],fuoriPozza=[];
    for(let k=0;k<8;k++){
      t.simulate(0.5);
      t.setTimeLeft(SEC);
      for(let i=0;i<60&&!(t.state==='play'||t.state==='golden');i++)t.simulate(0.1);
      if(t.state!=='play'&&t.state!=='golden')continue;
      t.disegna(); fotogrammi++;
      const img=c2.getImageData(0,0,cv.width,cv.height).data;
      const W=cv.width,H=cv.height,S2=t.view.S2,Ax=t.view.Ax,Ay=t.view.Ay,B=t.bande;
      const VWc=W/DPRc,VHc=H/DPRc;
      const pixel=(sx,sy)=>{const x=Math.round(sx*DPRc),y=Math.round(sy*DPRc);
        if(x<0||y<0||x>=W||y>=H)return null;const o=(y*W+x)*4;return [img[o],img[o+1],img[o+2]];};
      const inQuadro=(sx,sy)=>sx>2&&sx<VWc-2&&sy>B.bar+2&&sy<VHc-B.foot-2;
      for(const p of t.players){
        if(p.role==='gk'||p.out>0)continue;
        if(p.slide>=0||p.recover>0||p.dive>0||p.celeb>0)continue;
        for(const av of [-12.5,-11.5,-10.5])for(const la of [-1.5,-1,-.5,0,.5,1,1.5]){
          const sx=(p.x+la)*S2+Ax,sy=(p.y+av)*S2+Ay;
          if(!inQuadro(sx,sy))continue;const c=pixel(sx,sy);if(c)maglia[p.team].push(c);}
        for(const r of [30,34,38,42])for(let ang=0;ang<360;ang+=15){
          const rad=ang*Math.PI/180,cx=Math.cos(rad),cy=Math.sin(rad);
          if(cx*OMB.ux+cy*OMB.uy>0)continue;
          const wx=p.x+cx*r,wy=p.y+cy*r;
          if(wx<8||wx>FW-8||wy<8||wy>FH-8)continue;
          let libero=true;
          for(const q of t.players){if(q.out>0)continue;
            if(q!==p&&Math.hypot(q.x-wx,q.y-wy)<30){libero=false;break;}
            if(Math.abs(wx-q.x)<20&&Math.abs(wy-(q.y+2))<28){libero=false;break;}
            if(dentroOmbra(q.x,q.y,wx,wy)){libero=false;break;}}
          if(!libero)continue;
          if(Math.hypot(t.ball.x-wx,t.ball.y-wy)<24)continue;
          const sx=wx*S2+Ax,sy=wy*S2+Ay;
          if(!inQuadro(sx,sy))continue;const c=pixel(sx,sy);if(c)erba[p.team].push(c);}
      }
      /* IL PORTATORE: la figura piu' importante del fotogramma, quella col
         cerchio di possesso. Il manto attorno a lui e' quello che la pozza
         dorata e la pozza del faro schiariscono insieme. */
      { const own=t.ball?t.ball.owner:-1; const p=own>=0?t.players[own]:null;
        if(p&&p.out<=0){
          for(const av of [-12.5,-11.5,-10.5])for(const la of [-1.5,-1,-.5,0,.5,1,1.5]){
            const sx=(p.x+la)*S2+Ax,sy=(p.y+av)*S2+Ay;
            if(!inQuadro(sx,sy))continue;const c=pixel(sx,sy);if(c)portM.push(c);}
          for(const r of [13,16,19,22])for(let ang=0;ang<360;ang+=12){
            const rad=ang*Math.PI/180,cx=Math.cos(rad),cy=Math.sin(rad);
            if(cx*OMB.ux+cy*OMB.uy>0)continue;
            const wx=p.x+cx*r,wy=p.y+cy*r;
            const sx=wx*S2+Ax,sy=wy*S2+Ay;
            if(!inQuadro(sx,sy))continue;
            const c=pixel(sx,sy);
            if(c&&c[1]>c[0]&&c[1]>c[2])portE.push(c);}
        } }
      /* DENTRO E FUORI LA POZZA: si proiettano i centri delle quattro
         lampade e si legge il manto li' contro il manto della corsia buia */
      { const FWl=1150,FHl=560,dx=58,dy=52;
        const pali=[[-dx,-dy],[FWl+dx,-dy],[-dx,FHl+dy],[FWl+dx,FHl+dy]];
        for(const pl of pali){
          const px=pl[0]+(FWl/2-pl[0])*0.72, py=pl[1]+(FHl/2-pl[1])*0.66;
          for(let a2=0;a2<360;a2+=30)for(const rr of [0,18,34]){
            const wx=px+Math.cos(a2*Math.PI/180)*rr, wy=py+Math.sin(a2*Math.PI/180)*rr;
            const sx=wx*S2+Ax, sy=wy*S2+Ay;
            if(!inQuadro(sx,sy))continue;
            const c=pixel(sx,sy); if(c&&c[1]>c[0]+4&&c[1]>c[2]+4)inPozza.push(c);}
          /* la corsia buia: a meta' strada fra questa pozza e il centro campo */
          const qx=(px+FWl/2)/2, qy=(py+FHl/2)/2;
          for(let a2=0;a2<360;a2+=45)for(const rr of [0,14]){
            const wx=qx+Math.cos(a2*Math.PI/180)*rr, wy=qy+Math.sin(a2*Math.PI/180)*rr;
            const sx=wx*S2+Ax, sy=wy*S2+Ay;
            if(!inQuadro(sx,sy))continue;
            const c=pixel(sx,sy); if(c&&c[1]>c[0]+4&&c[1]>c[2]+4)fuoriPozza.push(c);}
        } }
      /* la palla */
      { const sx=t.ball.x*S2+Ax, sy=(t.ball.y-(t.ball.z||0)*0.5)*S2+Ay;
        let best=null,bl=-1;
        for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++){const c=pixel(sx+dx,sy+dy);if(!c)continue;
          const L=lumin(c[0],c[1],c[2]); if(L>bl){bl=L;best=c;} }
        if(best)pallaC.push(best); }
      /* il manto: una griglia sullo schermo, si scartano i pixel non-verdi
         (figure, righe, HUD) tenendo solo cio' che e' plausibilmente erba */
      for(let sy=B.bar+30;sy<VHc-B.foot-30;sy+=7)for(let sx=8;sx<VWc-8;sx+=7){
        const c=pixel(sx,sy);if(!c)continue;
        if(!(c[1]>c[0]+8&&c[1]>c[2]+8))continue;          // verde: G domina
        const H2=hsv(c[0],c[1],c[2]);
        if(H2.s<0.25)continue;
        const col=Math.min(6,Math.floor(sx/VWc*7));
        colonne[col].push(c); erbaTutta.push(c);
        gy.push(lumin(c[0],c[1],c[2]));
        const qi=(sx<VWc/2?0:1)+(sy<VHc/2?0:2);
        quad[qi].push(c[0]-c[2]);
      }
    }
    const rappr=a=>a.length?[med(a.map(c=>c[0])),med(a.map(c=>c[1])),med(a.map(c=>c[2]))]:null;
    const esa=c=>c?'#'+c.map(v=>v.toString(16).padStart(2,'0')).join(''):'?';
    const squadre=[];
    for(let sq=0;sq<2;sq++){const m=rappr(maglia[sq]),e=rappr(erba[sq]);
      let rap=null;if(m&&e){const Lm=lumin(...m),Le=lumin(...e);rap=(Math.max(Lm,Le)+0.05)/(Math.min(Lm,Le)+0.05);}
      squadre.push({sq,rap,maglia:esa(m),erba:esa(e),nM:maglia[sq].length,nE:erba[sq].length});}
    const colStat=colonne.map(a=>{if(!a.length)return null;const c=rappr(a);const H2=hsv(...c);
      return {grigio:Math.round(0.2126*c[0]+0.7152*c[1]+0.0722*c[2]),sat:+H2.s.toFixed(3),tinta:Math.round(H2.h),rgb:esa(c)};});
    const eM=rappr(erbaTutta), pM=rappr(pallaC);
    const pmM=rappr(portM), peM=rappr(portE);
    let rapPort=null; if(pmM&&peM){const L1=lumin(...pmM),L2=lumin(...peM);rapPort=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);}
    let rapPalla=null; if(eM&&pM){const Lp=lumin(...pM),Le=lumin(...eM);rapPalla=(Math.max(Lp,Le)+0.05)/(Math.min(Lp,Le)+0.05);}
    const qm=quad.map(a=>a.length?med(a):null);
    const ip=rappr(inPozza), fp=rappr(fuoriPozza);
    const gr=c=>c?Math.round(0.2126*c[0]+0.7152*c[1]+0.0722*c[2]):null;
    return {fotogrammi,squadre,colStat,
      Y50:+perc(gy,0.5).toFixed(4),Y95:+perc(gy,0.95).toFixed(4),Y05:+perc(gy,0.05).toFixed(4),
      erbaMed:esa(eM),erbaSat:eM?+hsv(...eM).s.toFixed(3):null,palla:esa(pM),rapPalla,
      portatore:{maglia:esa(pmM),erba:esa(peM),rap:rapPort,nM:portM.length,nE:portE.length,
        Ye:peM?+lumin(...peM).toFixed(4):null,Ym:pmM?+lumin(...pmM).toFixed(4):null},
      pozza:{dentro:esa(ip),fuori:esa(fp),grDentro:gr(ip),grFuori:gr(fp),
        Yd:ip?+lumin(...ip).toFixed(4):null,Yf:fp?+lumin(...fp).toFixed(4):null,
        tintaD:ip?Math.round(hsv(...ip).h):null,tintaF:fp?Math.round(hsv(...fp).h):null,
        n:[inPozza.length,fuoriPozza.length]},
      quadRB:qm, rampaRB:(qm[0]!=null&&qm[1]!=null)?(qm[0]-qm[1]):null, nErba:erbaTutta.length};
  }, SEC);
  await ctx.close();await browser.close();srv.chiudi();
  console.log(`--- ora: setTimeLeft(${SEC})  ·  ${out.fotogrammi} fotogrammi  ·  ${out.nErba} campioni d'erba`);
  out.squadre.forEach(s=>console.log(`  contrasto maglia/erba P${s.sq+1}: ${s.rap?s.rap.toFixed(2):'?'}:1   maglia ${s.maglia} su erba ${s.erba}  (${s.nM}/${s.nE} campioni)`));
  console.log(`  PORTATORE  contrasto ${out.portatore.rap?out.portatore.rap.toFixed(2):'?'}:1   maglia ${out.portatore.maglia} (Y ${out.portatore.Ym}) su manto ${out.portatore.erba} (Y ${out.portatore.Ye})  (${out.portatore.nM}/${out.portatore.nE})`);
  console.log(`  erba mediana ${out.erbaMed}  sat ${out.erbaSat}   Y05 ${out.Y05}  Y50 ${out.Y50}  Y95 ${out.Y95}`);
  console.log(`  palla ${out.palla}  rapporto palla/erba ${out.rapPalla?out.rapPalla.toFixed(2):'?'}:1`);
  { const z=out.pozza;
    console.log(`  POZZA  dentro ${z.dentro} grigio ${z.grDentro} tinta ${z.tintaD} Y ${z.Yd}  ·  fuori ${z.fuori} grigio ${z.grFuori} tinta ${z.tintaF} Y ${z.Yf}  ·  stacco ${z.grDentro-z.grFuori} livelli, ${z.tintaF-z.tintaD} gradi (${z.n})`); }
  console.log('  colonne di schermo (ovest -> est):');
  out.colStat.forEach((c,i)=>console.log(`    ${i}  ${c?`${c.rgb}  grigio ${String(c.grigio).padStart(3)}  sat ${c.sat.toFixed(3)}  tinta ${c.tinta}`:'—'}`));
  console.log(`  R-B per quadrante [NO,NE,SO,SE] = ${JSON.stringify(out.quadRB)}   rampa ovest-est (nord) = ${out.rampaRB}`);
})();
