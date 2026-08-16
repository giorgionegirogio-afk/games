/* zoom: ritaglia e ingrandisce un PNG (verifica "zoom 200%") */
const fs=require('fs'), path=require('path');
const {chromium}=require('playwright');
(async()=>{
  const [src,x,y,w,h,out,sc]=process.argv.slice(2);
  const S=+(sc||2);
  const b64=fs.readFileSync(src).toString('base64');
  const br=await chromium.launch();
  const pg=await br.newPage({viewportSize:{width:Math.round(w*S),height:Math.round(h*S)}});
  await pg.setContent(`<style>html,body{margin:0}canvas{display:block}</style><canvas id=c></canvas>`);
  await pg.evaluate(async ({b64,x,y,w,h,S})=>{
    const im=new Image(); im.src='data:image/png;base64,'+b64;
    await im.decode();
    const c=document.getElementById('c'); c.width=w*S; c.height=h*S;
    const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
    g.drawImage(im,x,y,w,h,0,0,w*S,h*S);
  },{b64,x:+x,y:+y,w:+w,h:+h,S});
  await pg.locator('#c').screenshot({path:out});
  await br.close();
  console.log('ok',out);
})();
