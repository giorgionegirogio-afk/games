const { chromium } = require('playwright');
(async()=>{
  const br = await chromium.launch();
  const pg = await br.newPage();
  await pg.goto('http://127.0.0.1:8777/fuori/155-g2.html?provino&t='+Date.now());
  await pg.waitForFunction('typeof Rig3D==="object"',{timeout:45000});
  const r = await pg.evaluate(()=>{
    const out={};
    for(const k of Object.keys(Rig3D.CLIPS)){
      const v=[];
      for(let i=0;i<16;i++) v.push(+Rig3D.quotaAria(k, (i/16)/Rig3D.CLIPS[k].freq).toFixed(3));
      out[k]=v;
    }
    return out;
  });
  for(const k in r){ const m=Math.max(...r[k]); if(m>0.001) console.log(k.padEnd(12), 'max', m.toFixed(3), r[k].join(' ')); }
  console.log('--- clip senza aria:', Object.keys(r).filter(k=>Math.max(...r[k])<=0.001).join(' '));
  await br.close();
})();
