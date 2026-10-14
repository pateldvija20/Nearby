const NB={H:h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255})};
NB.PRIM={"magenta/300":"#FF8FC6","magenta/400":"#FF57A8","magenta/500":"#FF1E8C","magenta/600":"#D6006B","magenta/700":"#A30050","red/400":"#FF5C5C","red/500":"#FF2020","red/600":"#D40000","blue/300":"#8FB4FF","blue/400":"#5590FF","blue/500":"#0F5FF5","blue/600":"#0040C2","sky/100":"#EAF7FE","sky/200":"#D2EFFC","sky/300":"#BFE9FB","sky/400":"#8FD5F5","neutral/0":"#FFFFFF","neutral/50":"#F7F7F8","neutral/100":"#EDEDEF","neutral/200":"#D6D6DA","neutral/300":"#ABABB3","neutral/400":"#7C7C85","neutral/500":"#55555D","neutral/600":"#38383E","neutral/700":"#26262A","neutral/800":"#17171A","neutral/900":"#0D0D0F","neutral/1000":"#000000","green/500":"#16C47F","amber/500":"#FFB020"};
NB.ALIAS={"bg/canvas":"neutral/1000","bg/surface":"neutral/900","bg/raised":"neutral/800","bg/sunken":"neutral/1000","bg/inverse":"neutral/0","bg/accent":"magenta/500","bg/accent-soft":"magenta/700","text/primary":"neutral/0","text/secondary":"neutral/300","text/tertiary":"neutral/400","text/inverse":"neutral/1000","text/accent":"magenta/400","text/on-accent":"neutral/0","border/subtle":"neutral/800","border/default":"neutral/700","border/strong":"neutral/600","border/accent":"magenta/500","heat/mine":"magenta/500","heat/friends":"blue/500","heat/hot":"red/500","heat/undiscovered":"sky/300","status/success":"green/500","status/warning":"amber/500","status/danger":"red/500"};
NB.STY={"Archivo":{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold",800:"ExtraBold",900:"Black"},"Instrument Sans":{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"},"JetBrains Mono":{400:"Regular",500:"Medium",700:"Bold"}};
NB._fc={};
NB.page=async n=>{let p=figma.root.children.find(c=>c.name===n);if(!p){p=figma.createPage();p.name=n;}if(p.loadAsync){try{await p.loadAsync();}catch(e){}}return p;};

NB.font=async(fam,w)=>{const tries=[[fam,(NB.STY[fam]||{})[w]||"Regular"],["Archivo",(NB.STY["Archivo"]||{})[w]],["Instrument Sans",{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold",800:"ExtraBold",900:"Black"}[w]||"Regular"]];for(const[fa,st]of tries){if(!st)continue;for(const s of new Set([st,st.replace("SemiBold","Semi Bold").replace("ExtraBold","Extra Bold")])){const k=fa+"/"+s;if(NB._fc[k])return{family:fa,style:s};try{await figma.loadFontAsync({family:fa,style:s});NB._fc[k]=1;return{family:fa,style:s};}catch(e){}}}return{family:"Inter",style:"Regular"};};
NB.res=n=>NB.ALIAS[n]?NB.PRIM[NB.ALIAS[n]]:(NB.PRIM[n]||"#000000");
NB.ensureVars=async()=>{if(NB.V)return;NB.V={};let pc=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==="Primitives");if(!pc)pc=figma.variables.createVariableCollection("Primitives");let sc=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==="Semantic");if(!sc)sc=figma.variables.createVariableCollection("Semantic");const find=async(c,n)=>{for(const i of c.variableIds){const v=await figma.variables.getVariableByIdAsync(i);if(v&&v.name===n)return v;}return null;};for(const[p,h]of Object.entries(NB.PRIM)){let v=await find(pc,p);if(!v)v=figma.variables.createVariable(p,pc,"COLOR");v.setValueForMode(pc.modes[0].modeId,NB.H(h));NB.V[p]=v;}for(const[n,a]of Object.entries(NB.ALIAS)){const full="color/"+n;let v=await find(sc,full);if(!v)v=figma.variables.createVariable(full,sc,"COLOR");v.setValueForMode(sc.modes[0].modeId,{type:"VARIABLE_ALIAS",id:NB.V[a].id});NB.V[full]=v;NB.V[n]=v;}for(const[n,num]of Object.entries({"sp/2":2,"sp/4":4,"sp/8":8,"sp/12":12,"sp/16":16,"sp/20":20,"sp/24":24,"sp/32":32,"sp/40":40,"sp/48":48,"sp/64":64,"sp/80":80,"r/xs":4,"r/sm":8,"r/md":12,"r/lg":16,"r/xl":24,"r/2xl":32})){let v=await find(sc,n);if(!v)v=figma.variables.createVariable(n,sc,"FLOAT");v.setValueForMode(sc.modes[0].modeId,num);NB.V[n]=v;}};
NB.paint=n=>{const v=NB.V&&NB.V[n];const p={type:"SOLID",color:NB.H(NB.res(n))};if(v)p.boundVariables={color:{type:"VARIABLE_ALIAS",id:v.id}};return p;};
NB.text=async(ch,o={})=>{const t=figma.createText();t.fontName=await NB.font(o.f||"Instrument Sans",o.w||400);t.characters=ch;t.fontSize=o.s||15;if(o.ls!==undefined)t.letterSpacing={unit:"PERCENT",value:o.ls};if(o.lh)t.lineHeight={unit:"PIXELS",value:Math.round((o.s||15)*o.lh)};t.fills=[NB.paint(o.c||"text/primary")];if(o.tw){t.textAutoResize="HEIGHT";t.resize(o.tw,t.height);}return t;};
NB.frame=(name,w,h,o={})=>{const f=figma.createFrame();f.name=name;f.resize(w,h);f.clipsContent=o.clip!==false;f.fills=o.bg?[NB.paint(o.bg)]:[];if(o.r!==undefined)f.cornerRadius=o.r;if(o.stroke){f.strokes=[NB.paint(o.stroke)];f.strokeWeight=1;}return f;};
NB.auto=(f,o={})=>{f.layoutMode=o.dir||"VERTICAL";f.itemSpacing=o.gap??0;f.paddingTop=o.pt??0;f.paddingBottom=o.pb??0;f.paddingLeft=o.pl??0;f.paddingRight=o.pr??0;if(o.main)f.primaryAxisAlignItems=o.main;if(o.cross)f.counterAxisAlignItems=o.cross;if(o.w!==undefined){f.resize(o.w,f.height);f.primaryAxisSizingMode="FIXED";}else f.primaryAxisSizingMode="AUTO";if(o.h!==undefined){f.resize(f.width,o.h);f.counterAxisSizingMode="FIXED";}else f.counterAxisSizingMode="AUTO";return f;};
NB.blob=(p,tok,x,y,s,blur=60,op=.85)=>{const e=figma.createEllipse();e.resize(s,s);p.appendChild(e);if(p.layoutMode&&p.layoutMode!=="NONE")e.layoutPositioning="ABSOLUTE";e.x=x;e.y=y;const c=NB.H(NB.res(tok));e.fills=[{type:"GRADIENT_RADIAL",gradientStops:[{position:0,color:{...c,a:op}},{position:.72,color:{...c,a:0}}],gradientTransform:[[1,0,0],[0,1,0]]}];e.effects=[{type:"LAYER_BLUR",radius:blur,visible:true}];return e;};
const secTitle=async(t,d)=>{const s=NB.auto(NB.frame("sec "+t,1120,10),{gap:28});s.appendChild(await NB.text(t.toUpperCase(),{f:"Instrument Sans",w:600,s:11,ls:18,c:"text/accent"}));if(d)s.appendChild(await NB.text(d,{s:14,c:"text/secondary",tw:640}));return s;};
async function main(){
  await NB.ensureVars();
  const pg=await NB.page("01 Foundations");
  for(const ch of [...pg.children])ch.remove();
  let y=100;
  const put=async(node)=>{pg.appendChild(node);node.x=100;node.y=y;y+=node.height+90;};
  const hdr=NB.auto(NB.frame("head",1120,10),{gap:14});
  hdr.appendChild(await NB.text("01 — FOUNDATIONS",{f:"Instrument Sans",w:600,s:11,ls:18,c:"text/accent"}));
  hdr.appendChild(await NB.text("Foundations",{f:"Archivo",w:800,s:40,ls:-2.5}));
  hdr.appendChild(await NB.text("The brand rests on one idea: colour is data. A bloom of magenta means your taste is dense there. Blue means your people go there. Nothing in this system is coloured for decoration.",{s:17,c:"text/secondary",tw:720}));
  await put(hdr);

  const brand=await secTitle("Brand concept","The cover art is not an illustration — it is a heatmap. That is the whole visual system.");
  const brow=NB.auto(NB.frame("brand-tiles",1120,10),{dir:"HORIZONTAL",gap:24});
  const tile=async(name,builder,cap)=>{const t=NB.auto(NB.frame(name,357,10),{gap:10});const box=NB.frame(name+" box",357,200,{bg:"bg/canvas",r:16});box.strokes=[NB.paint("border/subtle")];box.strokeWeight=1;builder(box);t.appendChild(box);t.appendChild(await NB.text(name.toUpperCase(),{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));t.appendChild(await NB.text(cap,{s:11,c:"text/tertiary",tw:340}));brow.appendChild(t);};
  await tile("field / ambient",b=>{NB.blob(b,"heat/mine",-50,-52,260);NB.blob(b,"heat/friends",230,130,220);},"Two blobs, blur 60, opacity .85. Behind content.");
  await tile("field / density",b=>{NB.blob(b,"heat/hot",78,48,120,28);NB.blob(b,"heat/mine",185,88,150,28);NB.blob(b,"heat/undiscovered",50,120,100,28);},"Blur 28. Each blob is real data — a cluster of places.");
  await tile("field / brand",b=>{NB.blob(b,"heat/mine",-110,-50,460,44,.95);NB.blob(b,"heat/hot",180,-36,380,30,.95);NB.blob(b,"heat/friends",190,20,320,38);NB.blob(b,"heat/mine",160,140,280,46);},"Hard-edged saturated blooms. Marketing and covers only.");
  brand.appendChild(brow);await put(brand);

  const heat=await secTitle("Heat layer","Four tokens carry every meaning colour is allowed to have in this product.");
  const hrow=NB.auto(NB.frame("heat-cards",1120,10),{dir:"HORIZONTAL",gap:16});
  const hcards=[["heat/mine","Your taste density","Places matching your interest graph"],["heat/friends","People you follow","Where your network actually goes"],["heat/hot","Trending now","Live surge — busy in the last 2 hours"],["heat/undiscovered","Never visited","In your taste, but you have not been"]];
  for(const[tok,t,d]of hcards){const c=NB.auto(NB.frame(tok,268,170,{r:16}),{pl:20,pb:20,gap:14,main:"MAX"});c.strokes=[NB.paint("border/subtle")];c.strokeWeight=1;c.clipsContent=true;NB.blob(c,tok,-60,-70,200,48);const dot=figma.createEllipse();dot.resize(16,16);NB.fill(dot,tok);dot.effects=[{type:"DROP_SHADOW",color:{...NB.H(NB.res(tok)),a:.8},offset:{x:0,y:0},radius:18,spread:2,visible:true,blendMode:"NORMAL"}];c.appendChild(dot);c.appendChild(await NB.text("heat/"+tok.split("/")[1],{f:"JetBrains Mono",w:400,s:10,c:tok==="heat/undiscovered"?"text/primary":tok}));c.appendChild(await NB.text(t,{s:15,w:600}));c.appendChild(await NB.text(d,{s:13,c:"text/secondary",tw:228}));hrow.appendChild(c);}
  heat.appendChild(hrow);await put(heat);

  const prim=await secTitle("Primitives","Raw values. Never referenced directly by a component — always through a semantic token.");
  const ramps={"magenta":["300","400","500","600","700"],"red":["400","500","600"],"blue":["300","400","500","600"],"sky":["100","200","300","400"],"neutral":["0","50","100","200","300","400","500","600","700","800","900","1000"]};
  for(const[rname,steps]of Object.entries(ramps)){prim.appendChild(await NB.text(rname.toUpperCase(),{s:11,w:600,ls:14,c:"text/tertiary"}));const row=NB.auto(NB.frame("ramp "+rname,1120,10),{dir:"HORIZONTAL",gap:16});for(const st of steps){const tok=rname+"/"+st;const cellw=ramps[rname].length>8?86:Math.min(200,Math.floor(1072/ramps[rname].length)-16);const cell=NB.auto(NB.frame(tok,cellw,10),{gap:8});const sw=NB.frame(tok,cellw-24,88,{r:12});NB.fill(sw,tok);sw.strokes=[NB.paint("border/subtle")];sw.strokeWeight=1;cell.appendChild(sw);cell.appendChild(await NB.text(tok,{f:"JetBrains Mono",w:400,s:10}));cell.appendChild(await NB.text(NB.PRIM[tok].toUpperCase(),{f:"JetBrains Mono",w:400,s:10,c:"text/tertiary"}));row.appendChild(cell);}prim.appendChild(row);}
  await put(prim);

  const sem=await secTitle("Semantic tokens","What components actually bind to. Every one aliases a primitive.");
  for(const[n,a]of Object.entries(NB.ALIAS)){const r=NB.auto(NB.frame(n,1120,10),{dir:"HORIZONTAL",gap:18,pt:12,pb:12,cross:"CENTER"});r.strokes=[];r.appendChild(NB.frame("sw",44,32,{bg:n,r:6}));const nm=await NB.text("color/"+n,{f:"JetBrains Mono",w:400,s:11});nm.textAutoResize="WIDTH_AND_HEIGHT";nm.resize(210,nm.height);r.appendChild(nm);const al=await NB.text("→ "+a,{f:"JetBrains Mono",w:400,s:11,c:"text/tertiary"});al.textAutoResize="WIDTH_AND_HEIGHT";al.resize(170,al.height);r.appendChild(al);r.appendChild(await NB.text(NB.PRIM[a],{f:"JetBrains Mono",w:400,s:11,c:"text/tertiary"}));sem.appendChild(r);}
  await put(sem);

  const theme=await secTitle("Theming","Dark is the product. Light is specified for the marketing surface. Starter collections are capped at one mode, so Light lives in nearby-tokens.json until upgrade.");
  const trow=NB.auto(NB.frame("theme-cards",1120,10),{dir:"HORIZONTAL",gap:28});
  const dk=NB.auto(NB.frame("dark",546,10,{bg:"bg/canvas",r:16}),{gap:14,p:0,pt:20,pb:20,pl:20,pr:20});dk.strokes=[NB.paint("border/default")];dk.strokeWeight=1;
  dk.appendChild(await NB.text("Dark (built)",{s:11,w:600,ls:14,c:"text/tertiary"}));
  dk.appendChild(await NB.text("bg/canvas → neutral/1000\nbg/surface → neutral/900\ntext/primary → neutral/0\nborder/default → neutral/700",{f:"JetBrains Mono",w:400,s:11,lh:2.1,c:"text/secondary"}));
  trow.appendChild(dk);
  const lt=NB.auto(NB.frame("light",546,10,{bg:"neutral/50",r:16}),{gap:14,pt:20,pb:20,pl:20,pr:20});
  lt.appendChild(await NB.text("Light (spec)",{s:11,w:600,ls:14,c:"neutral/500"}));
  const ltx=await NB.text("bg/canvas → neutral/0\nbg/surface → neutral/50\ntext/primary → neutral/1000\nborder/default → neutral/200",{f:"JetBrains Mono",w:400,s:11,lh:2.1,c:"neutral/500"});lt.appendChild(ltx);
  trow.appendChild(lt);
  theme.appendChild(trow);await put(theme);

  const typ=await secTitle("Typography","Archivo carries weight and numerals. Instrument Sans carries language. JetBrains Mono carries data.");
  const specs=[["display-xl","Archivo Black 56/57",async()=>NB.text("Hidden filter coffee, 0.4mi",{f:"Archivo",w:900,s:56,ls:-3}),"Hero moments only"],["display","Archivo ExtraBold 40/42",async()=>NB.text("Hidden filter coffee, 0.4mi",{f:"Archivo",w:800,s:40,ls:-2.5}),"Screen titles"],["h1","Archivo Bold 32/36",async()=>NB.text("Hidden filter coffee, 0.4mi",{f:"Archivo",w:700,s:32,ls:-2}),"Section heads"],["h2","Archivo Bold 24/29",async()=>NB.text("Hidden filter coffee, 0.4mi",{f:"Archivo",w:700,s:24,ls:-1.5}),"Card titles"],["h3","Archivo SemiBold 20/25",async()=>NB.text("Hidden filter coffee, 0.4mi",{f:"Archivo",w:600,s:20,ls:-1}),"List headers"],["body-lg","Instrument Sans 17/26",async()=>NB.text("Hidden filter coffee, 0.4mi",{s:17,lh:1.5}),"Lead paragraphs"],["body","Instrument Sans 15/22",async()=>NB.text("Hidden filter coffee, 0.4mi",{s:15}),"Default"],["body-sm","Instrument Sans 13/18",async()=>NB.text("Hidden filter coffee, 0.4mi",{s:13,c:"text/secondary"}),"Secondary"],["label","Instrument Sans 11 · .14em",async()=>NB.text("HIDDEN FILTER COFFEE, 0.4MI",{s:11,w:600,ls:14,c:"text/tertiary"}),"Eyebrows"],["mono","JetBrains Mono 12 · .02em",async()=>NB.text("HIDDEN FILTER COFFEE, 0.4MI",{f:"JetBrains Mono",w:400,s:12,c:"text/secondary"}),"Distance, time, price"]];
  for(const[nm,meta,mk,use]of specs){const r=NB.auto(NB.frame(nm,1120,10),{dir:"HORIZONTAL",gap:32,pt:20,pb:20,cross:"CENTER"});const lc=NB.auto(NB.frame("m",150,10),{gap:2});lc.appendChild(await NB.text(nm,{f:"JetBrains Mono",w:400,s:11,c:"text/accent"}));lc.appendChild(await NB.text(meta,{s:11,c:"text/tertiary"}));r.appendChild(lc);r.appendChild(await mk());const rc=await NB.text(use,{s:11,c:"text/tertiary"});rc.textAutoResize="WIDTH_AND_HEIGHT";rc.resize(140,rc.height);rc.textAlignHorizontal="RIGHT";r.appendChild(rc);typ.appendChild(r);}
  await put(typ);

  const sp=await secTitle("Spacing","8px base with a 2 and 4 for optical work.");
  for(const k of ["sp/2","sp/4","sp/8","sp/12","sp/16","sp/20","sp/24","sp/32","sp/40","sp/48","sp/64","sp/80"]){const r=NB.auto(NB.frame(k,420,10),{dir:"HORIZONTAL",gap:16,pt:4,pb:4,cross:"CENTER"});const lbl=await NB.text(k,{f:"JetBrains Mono",w:400,s:11});lbl.textAutoResize="WIDTH_AND_HEIGHT";lbl.resize(74,lbl.height);r.appendChild(lbl);const bar=NB.frame("bar",NB.NUM[k]||2,14,{bg:"bg/accent",r:2});r.appendChild(bar);r.appendChild(await NB.text((NB.NUM[k])+"px",{s:11,c:"text/tertiary"}));sp.appendChild(r);}
  await put(sp);

  const rad=await secTitle("Radius","Generous on containers, pill on anything interactive.");
  const rrow=NB.auto(NB.frame("radius",1120,10),{dir:"HORIZONTAL",gap:16});
  for(const[k,v]of Object.entries({"r/xs":4,"r/sm":8,"r/md":12,"r/lg":16,"r/xl":24,"r/2xl":32,"r/full":999})){const c=NB.auto(NB.frame(k,146,10),{gap:8,cross:"CENTER"});const b=NB.frame(k,130,76,{bg:"bg/raised"});b.strokes=[NB.paint("border/default")];b.strokeWeight=1;b.cornerRadius=v;c.appendChild(b);c.appendChild(await NB.text(k,{f:"JetBrains Mono",w:400,s:10}));rrow.appendChild(c);}
  rad.appendChild(rrow);await put(rad);

  const use=await secTitle("Usage rules","The system fails fastest when the field becomes decoration.");
  const urow=NB.auto(NB.frame("usage",1120,10),{dir:"HORIZONTAL",gap:24});
  const dok=NB.auto(NB.frame("do",548,10,{r:16}),{gap:12,pt:22,pb:22,pl:22,pr:22});dok.strokes=[NB.paint("status/success")];dok.strokeWeight=1;
  dok.appendChild(await NB.text("DO",{s:11,w:600,ls:14,c:"status/success"}));
  dok.appendChild(await NB.text("Let colour mean something — every bloom maps to a heat token.\nKeep UI chrome monochrome so data reads first.\nSet distance, time and price in mono.\nGive the field room; it needs black around it to glow.",{s:13,c:"text/secondary",lh:1.8,tw:500}));
  urow.appendChild(dok);
  const dont=NB.auto(NB.frame("dont",548,10,{r:16}),{gap:12,pt:22,pb:22,pl:22,pr:22});dont.strokes=[NB.paint("status/danger")];dont.strokeWeight=1;
  dont.appendChild(await NB.text("DON'T",{s:11,w:600,ls:14,c:"status/danger"}));
  dont.appendChild(await NB.text("Use gradients as decoration behind unrelated content.\nPut magenta on a button that isn't the primary action.\nStack more than three blobs in one viewport.\nUse the brand field inside product UI.",{s:13,c:"text/secondary",lh:1.8,tw:500}));
  urow.appendChild(dont);
  use.appendChild(urow);await put(use);

  const voice=await secTitle("Voice & tone","Specificity is the brand. Enthusiasm is not.");
  const vrow=NB.auto(NB.frame("voice",1120,10),{dir:"HORIZONTAL",gap:40});
  const v1=NB.auto(NB.frame("voice-def",520,10),{gap:14});
  v1.appendChild(await NB.text("VOICE",{s:11,w:600,ls:14,c:"text/tertiary"}));
  v1.appendChild(await NB.text("A local friend with good taste who doesn't oversell. Specific over enthusiastic. Never uses the word \"amazing\". Names the thing: not \"great coffee\" but \"filter, single origin, no laptops after 12\".",{s:15,c:"text/secondary",lh:1.8,tw:520}));
  vrow.appendChild(v1);
  const v2=NB.auto(NB.frame("voice-ex",520,10),{gap:8});
  v2.appendChild(await NB.text("IN PRACTICE",{s:11,w:600,ls:14,c:"text/tertiary"}));
  v2.appendChild(await NB.text("✓ \"Quiet until 6. Cash only.\"\n✗ \"Discover amazing hidden gems!\"\n✓ \"Three of your people went last week.\"\n✗ \"Trending in your area right now!!\"",{s:13,c:"text/secondary",lh:2}));
  vrow.appendChild(v2);
  voice.appendChild(vrow);await put(voice);
  figma.viewport.scrollAndZoomIntoView(pg.children);
  figma.notify("Run B done — Foundations boards built.");
}
main().catch(e=>{console.error(e);figma.notify("Run B error: "+String(e&&e.message||e));});
