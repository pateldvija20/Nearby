const NB={H:h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255})};
NB.PRIM={"magenta/300":"#FF8FC6","magenta/400":"#FF57A8","magenta/500":"#FF1E8C","magenta/600":"#D6006B","green":"#16C47F","red/400":"#FF5C5C","red/500":"#FF2020","blue/300":"#8FB4FF","blue/500":"#0F5FF5","sky/300":"#BFE9FB","neutral/0":"#FFFFFF","neutral/300":"#ABABB3","neutral/400":"#7C7C85","neutral/500":"#55555D","neutral/600":"#38383E","neutral/700":"#26262A","neutral/800":"#17171A","neutral/900":"#0D0D0F","neutral/1000":"#000000"};
NB.ALIAS={"bg/canvas":"neutral/1000","bg/surface":"neutral/900","bg/raised":"neutral/800","bg/inverse":"neutral/0","bg/accent":"magenta/500","text/primary":"neutral/0","text/secondary":"neutral/300","text/tertiary":"neutral/400","text/on-accent":"neutral/0","border/subtle":"neutral/800","border/default":"neutral/700","border/strong":"neutral/600","heat/mine":"magenta/500","heat/friends":"blue/500","heat/hot":"red/500","heat/undiscovered":"sky/300","status/success":"green"};
NB.STY={"Archivo":{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold",800:"ExtraBold",900:"Black"},"Instrument Sans":{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"},"JetBrains Mono":{400:"Regular",500:"Medium",700:"Bold"}};
NB._fc={};
NB.page=async n=>{let p=figma.root.children.find(c=>c.name===n);if(!p){p=figma.createPage();p.name=n;}if(p.loadAsync){try{await p.loadAsync();}catch(e){}}return p;};

NB.font=async(fam,w)=>{const tries=[[fam,(NB.STY[fam]||{})[w]||"Regular"],["Archivo",(NB.STY["Archivo"]||{})[w]],["Instrument Sans",{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold",800:"ExtraBold",900:"Black"}[w]||"Regular"]];for(const[fa,st]of tries){if(!st)continue;for(const s of new Set([st,st.replace("SemiBold","Semi Bold").replace("ExtraBold","Extra Bold")])){const k=fa+"/"+s;if(NB._fc[k])return{family:fa,style:s};try{await figma.loadFontAsync({family:fa,style:s});NB._fc[k]=1;return{family:fa,style:s};}catch(e){}}}return{family:"Inter",style:"Regular"};};
NB.res=n=>NB.ALIAS[n]?NB.PRIM[NB.ALIAS[n]]:(NB.PRIM[n]||"#000000");
NB.ensureVars=async()=>{if(NB.V)return;NB.V={};let pc=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==="Primitives");if(!pc)pc=figma.variables.createVariableCollection("Primitives");let sc=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==="Semantic");if(!sc)sc=figma.variables.createVariableCollection("Semantic");const find=async(c,n)=>{for(const i of c.variableIds){const v=await figma.variables.getVariableByIdAsync(i);if(v&&v.name===n)return v;}return null;};for(const[p,h]of Object.entries(NB.PRIM)){let v=await find(pc,p);if(!v)v=figma.variables.createVariable(p,pc,"COLOR");v.setValueForMode(pc.modes[0].modeId,NB.H(h));NB.V[p]=v;}for(const[n,a]of Object.entries(NB.ALIAS)){const full="color/"+n;let v=await find(sc,full);if(!v)v=figma.variables.createVariable(full,sc,"COLOR");v.setValueForMode(sc.modes[0].modeId,{type:"VARIABLE_ALIAS",id:NB.V[a].id});NB.V[full]=v;NB.V[n]=v;}};
NB.paint=n=>{const v=NB.V&&NB.V[n];const p={type:"SOLID",color:NB.H(NB.res(n))};if(v)p.boundVariables={color:{type:"VARIABLE_ALIAS",id:v.id}};return p;};
NB.glow=h=>({type:"DROP_SHADOW",color:{...NB.H(h),a:.45},offset:{x:0,y:0},radius:32,spread:0,visible:true,blendMode:"NORMAL"});
NB.text=async(ch,o={})=>{const t=figma.createText();t.fontName=await NB.font(o.f||"Instrument Sans",o.w||400);t.characters=ch;t.fontSize=o.s||15;if(o.ls!==undefined)t.letterSpacing={unit:"PERCENT",value:o.ls};if(o.lh)t.lineHeight={unit:"PIXELS",value:Math.round((o.s||15)*o.lh)};t.fills=[NB.paint(o.c||"text/primary")];if(o.op!==undefined)t.opacity=o.op;if(o.tw){t.textAutoResize="HEIGHT";t.resize(o.tw,t.height);}return t;};
NB.frame=(name,w,h,o={})=>{const f=figma.createFrame();f.name=name;if(w)f.resize(w,h);f.clipsContent=o.clip!==false;f.fills=o.bg?[NB.paint(o.bg)]:(o.plain?[]:[NB.paint("bg/canvas")]);if(o.r!==undefined)f.cornerRadius=o.r;if(o.stroke){f.strokes=[NB.paint(o.stroke)];f.strokeWeight=1;}return f;};
NB.auto=(f,o={})=>{f.layoutMode=o.dir||"VERTICAL";f.itemSpacing=o.gap??0;f.paddingTop=o.pt??0;f.paddingBottom=o.pb??0;f.paddingLeft=o.pl??0;f.paddingRight=o.pr??0;if(o.main)f.primaryAxisAlignItems=o.main;if(o.cross)f.counterAxisAlignItems=o.cross;if(o.w!==undefined){f.resize(o.w,f.height);f.primaryAxisSizingMode="FIXED";}else if(f.layoutMode!=="NONE")f.primaryAxisSizingMode="AUTO";if(o.h!==undefined){f.resize(f.width,o.h);f.counterAxisSizingMode="FIXED";}else if(f.layoutMode!=="NONE")f.counterAxisSizingMode="AUTO";return f;};
NB.blob=(p,tok,x,y,s,blur=60,op=.85)=>{const e=figma.createEllipse();e.resize(s,s);p.appendChild(e);if(p.layoutMode&&p.layoutMode!=='NONE')e.layoutPositioning='ABSOLUTE';e.x=x;e.y=y;const c=NB.H(NB.res(tok));e.fills=[{type:"GRADIENT_RADIAL",gradientStops:[{position:0,color:{...c,a:op}},{position:.72,color:{...c,a:0}}],gradientTransform:[[1,0,0],[0,1,0]]}];e.effects=[{type:"LAYER_BLUR",radius:blur,visible:true}];return e;};
async function chip(label,on,heat,lg){const f=NB.auto(NB.frame("chip",null,lg?44:34,{plain:true,r:999}),{dir:"HORIZONTAL",gap:6,pl:lg?20:14,pr:lg?20:14,cross:"CENTER"});f.primaryAxisSizingMode="AUTO";let tc="text/secondary";if(on){NB.fill(f,"bg/accent");tc="text/on-accent";}else if(heat){f.strokes=[NB.paint("border/accent")];f.strokeWeight=1;tc="text/accent";}else{f.strokes=[NB.paint("border/default")];f.strokeWeight=1;}f.appendChild(await NB.text(label,{s:lg?15:13,w:500,c:tc}));return f;}
async function badge(kind,label){const tok=kind==="Match"?"heat/mine":kind==="Hot"?"heat/hot":kind==="Friend"?"heat/friends":"heat/undiscovered";const f=NB.auto(NB.frame("badge",null,22,{plain:true,r:4}),{dir:"HORIZONTAL",gap:5,pl:9,pr:9,cross:"CENTER"});f.primaryAxisSizingMode="AUTO";f.counterAxisSizingMode="FIXED";const b=NB.paint(tok==="heat/undiscovered"?"sky/300":tok);b.opacity=.16;f.fills=[b];f.appendChild(await NB.text(label.toUpperCase(),{f:"JetBrains Mono",w:500,s:10,ls:8,c:kind==="Match"?"magenta/400":kind==="Hot"?"red/400":kind==="Friend"?"blue/500":"text/secondary"}));return f;}
async function scoreN(n,size=26){const sc=NB.auto(NB.frame("score",null,null,{plain:true}),{dir:"HORIZONTAL",gap:2});sc.appendChild(await NB.text(String(n),{f:"Archivo",w:900,s:size,ls:-4,c:"text/accent"}));sc.appendChild(await NB.text("%",{s:12,c:"text/accent",op:.7}));return sc;}
async function btn(variant,label,size="MD",blockW){const z={SM:[36,13,16],MD:[48,15,24],LG:[56,17,32]}[size];const f=NB.auto(NB.frame("btn "+label,null,z[0],{plain:true,r:999}),{dir:"HORIZONTAL",gap:8,pl:z[2],pr:z[2],main:"CENTER",cross:"CENTER"});f.primaryAxisSizingMode=blockW?"FIXED":"AUTO";f.counterAxisSizingMode="FIXED";
 if(variant==="primary"){NB.fill(f,"bg/accent");f.effects=[NB.glow(NB.res("bg/accent"))];}
 else if(variant==="secondary"){f.fills=[];f.strokes=[NB.paint("border/strong")];f.strokeWeight=1;}
 else{f.fills=[];}
 const tc=variant==="primary"?"text/on-accent":variant==="inverse"?"text/inverse":"text/secondary";
 f.appendChild(await NB.text(label,{s:z[1],w:600,c:tc}));
 if(blockW){f.resize(blockW,z[0]);f.primaryAxisSizingMode="FIXED";}
 return f;}
async function iconBtn(glyph,dim=40){const f=NB.auto(NB.frame("ib",dim,dim,{plain:true,r:999}),{dir:"HORIZONTAL",main:"CENTER",cross:"CENTER"});f.strokes=[NB.paint("border/strong")];f.strokeWeight=1;f.fills=[];f.appendChild(await NB.text(glyph,{s:15}));return f;}
async function toggle(on){const f=NB.frame("toggle",48,28,{r:999,plain:true});NB.fill(f,on?"bg/accent":"neutral/700");const d=NB.frame("d",22,22,{r:999,plain:true});NB.fill(d,on?"neutral/0":"neutral/300");d.y=3;d.x=on?23:3;f.appendChild(d);return f;}
async function seg(active){const f=NB.auto(NB.frame("seg",null,null,{plain:true,r:999,bgTok:"bg/raised"}),{dir:"HORIZONTAL",p:3});f.primaryAxisSizingMode="AUTO";f.counterAxisSizingMode="AUTO";for(const it of["Map","List"]){const item=NB.auto(NB.frame(it,null,null,{plain:true,r:999}),{pt:8,pb:8,pl:18,pr:18,cross:"CENTER"});item.primaryAxisSizingMode="AUTO";item.counterAxisSizingMode="AUTO";if(it===active)NB.fill(item,"bg/inverse");item.appendChild(await NB.text(it,{s:13,w:600,c:it===active?"text/inverse":"text/tertiary"}));f.appendChild(item);}return f;}
async function statusBar(){const f=NB.auto(NB.frame("statusbar",390,52,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"MAX",pl:24,pr:24,pb:6});f.primaryAxisSizingMode="FIXED";f.counterAxisSizingMode="FIXED";f.appendChild(await NB.text("9:41",{f:"JetBrains Mono",w:500,s:13}));f.appendChild(await NB.text("●●● ▤",{f:"JetBrains Mono",w:500,s:11}));return f;}
async function topBar(label,title,rightGlyphs=["⌕"]){const f=NB.auto(NB.frame("topbar",390,null,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER",pl:20,pr:20,pt:12,pb:12});
 const l=NB.auto(NB.frame("l",null,null,{plain:true}),{gap:2});l.primaryAxisSizingMode="AUTO";if(label)l.appendChild(await NB.text(label.toUpperCase(),{s:11,w:600,ls:14,c:"text/tertiary"}));l.appendChild(await NB.text(title,{f:"Archivo",w:600,s:20,ls:-1}));f.appendChild(l);
 const r=NB.auto(NB.frame("r",null,null,{plain:true}),{dir:"HORIZONTAL",gap:8});r.primaryAxisSizingMode="AUTO";for(const g of rightGlyphs)r.appendChild(await iconBtn(g));f.appendChild(r);return f;}
async function tabbar(active){const items=[["◎","Map"],["◆","Plan"],["☰","Feed"],["♡","Saved"],["●","You"]];const f=NB.auto(NB.frame("tabbar",390,78,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER",pl:24,pr:24,pb:14});f.primaryAxisSizingMode="FIXED";f.counterAxisSizingMode="FIXED";f.fills=[{type:"SOLID",color:NB.H("#0A0A0C"),opacity:.86}];f.strokes=[NB.paint("border/subtle")];f.strokeWeight=1;
 for(const[g,label]of items){const on=label===active;const it=NB.auto(NB.frame(label,null,null,{plain:true}),{dir:"VERTICAL",gap:5,cross:"CENTER"});it.primaryAxisSizingMode="AUTO";it.counterAxisSizingMode="AUTO";it.appendChild(await NB.text(g,{s:17,c:on?"text/primary":"text/tertiary"}));it.appendChild(await NB.text(label.toUpperCase(),{s:10,w:600,ls:2,c:on?"text/primary":"text/tertiary"}));f.appendChild(it);}return f;}
async function safe(){const f=NB.auto(NB.frame("safe",390,34,{plain:true}),{cross:"CENTER",main:"CENTER"});f.primaryAxisSizingMode="FIXED";f.counterAxisSizingMode="FIXED";const hi=NB.frame("home-ind",134,5,{plain:true,r:3,bgTok:"neutral/500"});f.appendChild(hi);return f;}
async function listRow(thumbTok,title,meta,n,fs=14){const f=NB.auto(NB.frame("row "+title,350,null,{plain:true}),{dir:"HORIZONTAL",gap:12,pt:12,pb:12,cross:"CENTER"});
 const th=NB.frame("thumb",56,56,{r:12,clip:true});NB.fill(th,"bg/raised");th.clipsContent=true;th.appendChild(NB.blob(th,thumbTok,-11,-17,90,28));f.appendChild(th);
 const m=NB.auto(NB.frame("m",null,null,{plain:true}),{gap:3});m.primaryAxisSizingMode="AUTO";m.layoutGrow=1;m.appendChild(await NB.text(title,{s:fs,w:600}));m.appendChild(await NB.text(meta.toUpperCase(),{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));f.appendChild(m);
 f.appendChild(await scoreN(n,22));
 return f;}
function mapBase(w,h,blobs){const f=NB.frame("map",w,h);NB.fill(f,"bg/sunken");f.clipsContent=true;
 for(const[yt,vert,pos]of[[.38,false,0],[.66,false,0],[0,true,.30],[0,true,.72]]){const r=NB.frame("road",vert?2:w,vert?h:2,{plain:true});NB.fill(r,"neutral/700");r.opacity=.35;r.x=vert?Math.round(w*pos)-1:0;r.y=vert?0:Math.round(h*yt)-1;f.appendChild(r);}
 for(const[tok,x,y,s,b]of blobs)NB.blob(f,tok,x,y,s,b||60);
 return f;}
async function pinAt(parent,tok,label,num,x,y){const p=NB.auto(NB.frame("pin",null,null,{plain:true}),{dir:"VERTICAL",gap:3,cross:"CENTER"});
 if(num){const n=NB.frame("num",26,26,{r:999});NB.fill(n,"bg/accent");n.strokes=[{type:"SOLID",color:{r:0,g:0,b:0}}];n.strokeWeight=2;const t=await NB.text(String(num),{f:"Archivo",w:800,s:12,c:"text/on-accent"});n.appendChild(t);t.x=(26-t.width)/2;t.y=(26-t.height)/2;p.appendChild(n);}
 else{const d=NB.frame("dot",20,20,{r:999});NB.fill(d,tok);d.strokes=[{type:"SOLID",color:{...NB.H("#000"),a:.65}}];d.strokeWeight=2;d.effects=[{type:"DROP_SHADOW",color:{...NB.H(NB.res(tok)),a:.9},offset:{x:0,y:0},radius:14,spread:2,visible:true,blendMode:"NORMAL"}];p.appendChild(d);}
 if(label){const l=NB.auto(NB.frame("lb",null,null,{plain:true}),{pt:2,pb:2,pl:6,pr:6});l.fills=[{type:"SOLID",color:{...NB.H("#000"),a:.72}}];l.cornerRadius=3;l.appendChild(await NB.text(label.toUpperCase(),{f:"JetBrains Mono",w:400,s:9,ls:6,c:"text/primary"}));p.appendChild(l);}
 parent.appendChild(p);p.x=Math.round(x*parent.width-p.width/2);p.y=Math.round(y*parent.height-p.height);return p;}
async function main(){
 await NB.ensureVars();
 const pg=await NB.page("03 Mobile App");
 const old=pg.children.filter(c=>c.name.startsWith("Flow ")||c.name.startsWith("screen "));old.forEach(c=>c.remove());
 let y=100;
 const flowHead=async(t,d)=>{const h=NB.auto(NB.frame("Flow "+t,760,10,{plain:true}),{gap:10});h.appendChild(await NB.text(t.toUpperCase(),{f:"Instrument Sans",w:600,s:11,ls:18,c:"text/accent"}));h.appendChild(await NB.text(t,{f:"Archivo",w:700,s:32,ls:-2}));h.appendChild(await NB.text(d,{s:15,c:"text/secondary",tw:680}));pg.appendChild(h);h.x=100;h.y=y;y+=h.height+40;};
 const cell=async(name,build)=>{const wrap=NB.auto(NB.frame("screen "+name,null,null,{plain:true}),{gap:10});wrap.clipsContent=false;wrap.appendChild(await NB.text(name.toUpperCase(),{f:"JetBrains Mono",w:400,s:11,c:"text/tertiary"}));
  const ph=NB.frame(name,390,844,{bg:"bg/canvas",r:44});ph.strokes=[NB.paint("border/default")];ph.strokeWeight=1;wrap.appendChild(ph);
  await build(ph);
  pg.appendChild(wrap);wrap.x=100;y+=934;wrap.y=y-934;};
 const st=async ph=>{const s=await statusBar();ph.appendChild(s);s.x=0;s.y=0;};

 await flowHead("Flow C — Prompt to itinerary","The differentiator. A sentence in, a walkable route out.");
 {await cell("C1 / Prompt composer",async ph=>{await st(ph);NB.blob(ph,"heat/mine",-98,-33,340);
  const col=NB.auto(NB.frame("col",350,10,{plain:true}),{gap:0});ph.appendChild(col);col.x=20;col.y=60;
  col.appendChild(await NB.text("PLAN",{s:11,w:600,ls:14,c:"text/tertiary"}));
  const sp=NB.frame("sp",1,8,{plain:true});sp.fills=[];col.appendChild(sp);
  col.appendChild(await NB.text("What's the evening?",{f:"Archivo",w:700,s:32,ls:-2}));
  const sp2=NB.frame("sp",1,20,{plain:true});sp2.fills=[];col.appendChild(sp2);
  const ta=NB.auto(NB.frame("ta",350,150),{pt:16,pb:16,pl:16,pr:16});NB.fill(ta,"bg/surface");ta.cornerRadius=16;ta.strokes=[NB.paint("border/subtle")];ta.strokeWeight=1;
  ta.appendChild(await NB.text("Quiet dinner, then somewhere we can actually hear each other. Walking distance. Under ₹2000 for two.",{s:17,lh:1.5}));
  col.appendChild(ta);
  const sp3=NB.frame("sp",1,26,{plain:true});sp3.fills=[];col.appendChild(sp3);
  col.appendChild(await NB.text("OR START FROM",{s:11,w:600,ls:14,c:"text/tertiary"}));
  const sp4=NB.frame("sp",1,12,{plain:true});sp4.fills=[];col.appendChild(sp4);
  const ch=NB.auto(NB.frame("chips",350,10,{plain:true}),{dir:"HORIZONTAL",wrap:true,gap:8});ch.primaryAxisSizingMode="FIXED";ch.counterAxisSizingMode="AUTO";col.appendChild(ch);
  for(const v of["Solo Sunday","Out-of-town friend","Cheap and loud","Rainy day","Nothing planned"])ch.appendChild(await chip(v));
  const sp5=NB.frame("sp",1,28,{plain:true});sp5.fills=[];col.appendChild(sp5);
  const lgs=NB.auto(NB.frame("lg",350,10,{plain:true}),{dir:"HORIZONTAL",gap:10});col.appendChild(lgs);
  lgs.appendChild(await chip("◷ Tonight, 7pm",false,false,true));lgs.appendChild(await chip("● 2 people",false,false,true));
  ph.appendChild(await btn("primary","Make me a route","LG",350)).x=20;ph.children[ph.children.length-1].y=720;
  const tbb=await tabbar("Plan");ph.appendChild(tbb);tbb.x=0;tbb.y=844-78;});}
 {await cell("C2 / Generating",async ph=>{await st(ph);
  const mp=mapBase(390,844,[["heat/mine",-78,118,300],["heat/hot",195,287,240],["heat/friends",47,506,240]]);ph.appendChild(mp);mp.x=0;mp.y=0;
  const col=NB.auto(NB.frame("c",null,null,{plain:true}),{gap:22,cross:"MIN"});ph.appendChild(col);
  col.appendChild(await NB.text("Building your route",{f:"Archivo",w:700,s:24,ls:-1.5}));
  col.appendChild(await NB.text("✓ READ THE PROMPT\n✓ FILTERED 1,284 → 62\n● CHECKING WHAT'S OPEN\n○ ORDERING BY WALK TIME",{f:"JetBrains Mono",w:400,s:11,lh:2.4,c:"text/secondary"}));
  col.x=(390-col.width)/2;col.y=330;
  ph.appendChild(await safe());const sf=ph.children[ph.children.length-1];sf.y=810;});}
 async function stopCard(num,title,time,meta,note,last){const g=NB.frame("stop "+num,null,null,{plain:true});g.fills=[];
  if(!last){const line=NB.frame("line",2,60,{plain:true});line.fills=[{type:"SOLID",color:NB.H("#D6006B")}];line.dashPattern=[5,6];line.x=17;line.y=46;g.appendChild(line);}
  const circ=NB.frame("circ",28,28,{r:999});NB.fill(circ,"bg/accent");const t=await NB.text(String(num),{f:"Archivo",w:800,s:13,c:"text/on-accent"});circ.appendChild(t);t.x=(28-t.width)/2;t.y=(28-t.height)/2;circ.x=4;circ.y=2;g.appendChild(circ);
  const card=NB.auto(NB.frame("card",310,null,{plain:true}),{gap:5,p:13});NB.fill(card,"bg/surface");card.strokes=[NB.paint("border/subtle")];card.strokeWeight=1;card.cornerRadius=16;card.x=52;card.y=0;g.appendChild(card);
  const r1=NB.auto(NB.frame("r1",284,10,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER"});r1.primaryAxisSizingMode="FIXED";card.appendChild(r1);
  r1.appendChild(await NB.text(title,{f:"Archivo",w:700,s:17}));
  const tm=await NB.text(time,{f:"JetBrains Mono",w:400,s:10,c:"text/accent"});tm.textAlignHorizontal="RIGHT";r1.appendChild(tm);
  card.appendChild(await NB.text(meta.toUpperCase(),{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));
  card.appendChild(await NB.text(note,{s:12,c:"text/secondary"}));
  return g;}
 {await cell("C3 / Itinerary result",async ph=>{await st(ph);
  const tb=await topBar("Tonight · 2 people","Quiet, then quieter",["↗"]);ph.appendChild(tb);tb.x=0;tb.y=52;
  const mr=NB.auto(NB.frame("meta",350,10,{plain:true}),{dir:"HORIZONTAL",gap:14});ph.appendChild(mr);mr.x=20;mr.y=130;
  for(const m of["3 STOPS","1.2 MI TOTAL","₹1,850 EST"])mr.appendChild(await NB.text(m.toUpperCase(),{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));
  let cy=166;
  ph.appendChild(await stopCard(1,"Blue Tokai","7:00","0.4 mi · 8 min walk","Back room is the quiet one.")).x=20;ph.children[ph.children.length-1].y=cy;cy+=110;
  ph.appendChild(await stopCard(2,"Naru Noodle Bar","8:15","0.5 mi · 9 min walk","Only 14 seats. They hold walk-ins till 8.")).x=20;ph.children[ph.children.length-1].y=cy;cy+=124;
  ph.appendChild(await stopCard(3,"Spirit Forward","9:45","0.3 mi · 6 min walk","No music after 10. Rhea has been twice.",true)).x=20;ph.children[ph.children.length-1].y=cy;
  const bar=NB.auto(NB.frame("cta",390,null,{plain:true}),{dir:"HORIZONTAL",gap:10,pt:14,pb:14,pl:20,pr:20});bar.strokes=[NB.paint("border/subtle")];bar.strokeWeight=1;ph.appendChild(bar);bar.x=0;bar.y=844-122;
  bar.appendChild(await btn("secondary","Shuffle"));bar.children[bar.children.length-1].layoutGrow=1;
  bar.appendChild(await btn("primary","Start route"));bar.children[bar.children.length-1].layoutGrow=1.4;
  const tbb=await tabbar("Plan");ph.appendChild(tbb);tbb.x=0;tbb.y=844-78;});}
 {await cell("C4 / Itinerary map",async ph=>{
  const mp=mapBase(390,844,[["heat/mine",-47,355,260],["heat/hot",214,68,220]]);ph.appendChild(mp);mp.x=0;mp.y=0;
  await pinAt(mp,null,null,1,.24,.62);await pinAt(mp,null,null,2,.52,.42);await pinAt(mp,null,null,3,.76,.26);
  const route=figma.createVector();route.vectorPaths=[{windingRule:"NONE",data:`M ${Math.round(.24*390)} ${Math.round(.62*650)-26} L ${Math.round(.52*390)} ${Math.round(.42*650)-26} L ${Math.round(.76*390)} ${Math.round(.26*650)-26}`}];route.strokes=[NB.paint("heat/mine")];route.strokeWeight=2.5;route.dashPattern=[7,7];route.strokeCap="ROUND";mp.appendChild(route);route.x=route.x;route.y=route.y;
  const s=await statusBar();ph.appendChild(s);s.x=0;s.y=0;
  const tb=NB.auto(NB.frame("tb",390,null,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER",pl:20,pr:20,pt:12,pb:12});ph.appendChild(tb);tb.x=0;tb.y=52;
  tb.appendChild(await iconBtn("←"));
  tb.appendChild(await chip("● Stop 1 of 3",false,true));
  tb.appendChild(await iconBtn("⌕"));
  const sh=NB.auto(NB.frame("sheet",390,null),{gap:14,pt:12,pb:24,pl:20,pr:20});sh.topLeftRadius=sh.topRightRadius=32;sh.strokes=[NB.paint("border/default")];sh.strokeWeight=1;
  const gr=NB.frame("grabber",40,4,{r:2});NB.fill(gr,"neutral/600");sh.appendChild(gr);gr.layoutPositioning="ABSOLUTE";gr.x=175;
  const hr=NB.auto(NB.frame("hr",350,10,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER"});hr.primaryAxisSizingMode="FIXED";sh.appendChild(hr);
  const hl=NB.auto(NB.frame("hl",null,null,{plain:true}),{gap:4});hl.primaryAxisSizingMode="AUTO";
  hl.appendChild(await NB.text("NEXT · 7:00",{f:"JetBrains Mono",w:400,s:10,c:"text/accent"}));
  hl.appendChild(await NB.text("Blue Tokai",{f:"Archivo",w:700,s:24,ls:-1.5}));hr.appendChild(hl);
  hr.appendChild(await scoreN(94));
  sh.appendChild(await NB.text("0.4 MI · 8 MIN WALK · OPEN TILL 11",{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));
  const brow=NB.auto(NB.frame("btns",350,10,{plain:true}),{dir:"HORIZONTAL",gap:10});sh.appendChild(brow);
  brow.appendChild(await btn("secondary","Swap"));brow.children[brow.children.length-1].layoutGrow=1;
  brow.appendChild(await btn("primary","Walk there"));brow.children[brow.children.length-1].layoutGrow=1.4;
  ph.appendChild(sh);sh.y=844-sh.height;});}
 {await cell("C5 / Swap a stop",async ph=>{await st(ph);
  const tb=NB.auto(NB.frame("tb",390,null,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER",pl:20,pr:20,pt:12,pb:12});ph.appendChild(tb);tb.x=0;tb.y=52;
  tb.appendChild(await iconBtn("✕"));
  tb.appendChild(await NB.text("Swap stop 2",{f:"Archivo",w:600,s:20,ls:-1}));
  const sp=NB.frame("sp",40,40,{plain:true});sp.fills=[];tb.appendChild(sp);
  const d=await NB.text("Same walk time, same budget. Ordered by how well they fit the rest of the night.",{s:13,c:"text/secondary",tw:350});ph.appendChild(d);d.x=20;d.y=126;
  let cy=180;
  for(const[tok,t,m,n]of[["heat/mine","Naru Noodle Bar","0.5 mi · current pick",92],["heat/mine","Burma Burma","0.6 mi · quiet · ₹₹",87],["heat/undiscovered","Dyu Art Cafe","0.4 mi · never been",84],["heat/friends","Sunny's","0.7 mi · 2 friends went",78]]){ph.appendChild(await listRow(tok,t,m,n));ph.children[ph.children.length-1].x=20;ph.children[ph.children.length-1].y=cy;cy+=81;}
  ph.appendChild(await btn("primary","Replace stop","MD",350)).x=20;ph.children[ph.children.length-1].y=750;
  ph.appendChild(await safe());const sf=ph.children[ph.children.length-1];sf.y=810;});}

 await flowHead("Flow D — Social","Taste overlap, not follower counts. Seeing a friend's map should feel like reading their diary.");
 {await cell("D1 / Activity feed",async ph=>{await st(ph);
  const tb=await topBar("Your people","Feed",["♡"]);ph.appendChild(tb);tb.x=0;tb.y=52;
  let cy=132;
  const items=[["RK","heat/friends","Rhea","went somewhere new","2H AGO · 0.5 MI FROM YOU","Naru Noodle Bar"],["AM","heat/hot","Arjun","built a route","YESTERDAY","Cheap and loud · 4 stops"],["JS","heat/undiscovered","Jas","saved 3 places","YESTERDAY","Cold things, late"]];
  for(const[ini,tok,name,did,when,title]of items){
   const it=NB.auto(NB.frame("item",350,null,{plain:true}),{gap:12,pt:18,pb:18});it.strokes=[NB.paint("border/subtle")];it.strokeWeight=1;ph.appendChild(it);it.x=20;it.y=cy;
   const hd=NB.auto(NB.frame("hd",350,10,{plain:true}),{dir:"HORIZONTAL",gap:12,cross:"CENTER"});hd.primaryAxisSizingMode="FIXED";it.appendChild(hd);
   const a=NB.frame("av",44,44,{r:999});NB.fill(a,tok);const t=await NB.text(ini,{f:"Archivo",w:700,s:15,c:tok==="heat/undiscovered"?"neutral/1000":"text/on-accent"});a.appendChild(t);t.x=(44-t.width)/2;t.y=(44-t.height)/2;hd.appendChild(a);
   const mc=NB.auto(NB.frame("m",null,null,{plain:true}),{gap:2});mc.primaryAxisSizingMode="AUTO";mc.layoutGrow=1;
   const line=NB.auto(NB.frame("l",null,10,{plain:true}),{dir:"HORIZONTAL",gap:4});line.primaryAxisSizingMode="AUTO";
   line.appendChild(await NB.text(name,{s:14,w:700}));line.appendChild(await NB.text(did,{s:14,c:"text/secondary"}));
   mc.appendChild(line);mc.appendChild(await NB.text(when,{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));hd.appendChild(mc);
   const cd=NB.frame("card",350,96,{clip:true,r:16});NB.fill(cd,"bg/surface");cd.strokes=[NB.paint("border/subtle")];cd.strokeWeight=1;
   NB.blob(cd,tok,-28,-68,200,28);
   const tt=await NB.text(title,{f:"Archivo",w:700,s:16});tt.x=14;tt.y=58;cd.appendChild(tt);
   it.appendChild(cd);
   cy+=it.height+2;} 
  const tbb=await tabbar("Feed");ph.appendChild(tbb);tbb.x=0;tbb.y=844-78;});}
 {await cell("D2 / Profile",async ph=>{
  const hero=NB.frame("hero",390,250,{clip:true});hero.appendChild(mapBase(390,250,[["heat/mine",-70,20,300],["heat/mine",203,80,200,28],["heat/undiscovered",78,145,220]]));ph.appendChild(hero);hero.x=0;hero.y=0;
  const s=await statusBar();ph.appendChild(s);s.x=0;s.y=0;
  const tb=NB.auto(NB.frame("tb",390,null,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER",pl:20,pr:20,pt:12,pb:12});ph.appendChild(tb);tb.x=0;tb.y=52;
  tb.appendChild(await NB.text("YOUR TASTE MAP",{s:11,w:600,ls:14,c:"text/tertiary"}));
  tb.appendChild(await iconBtn("⚙"));
  const av=NB.frame("av",104,104,{r:999});NB.fill(av,"heat/mine");av.strokes=[NB.paint("bg/canvas")];av.strokeWeight=3;av.strokeAlign="OUTSIDE";
  const at=await NB.text("DP",{f:"Archivo",w:700,s:34});av.appendChild(at);at.x=(104-at.width)/2;at.y=(104-at.height)/2;
  ph.appendChild(av);av.x=20;av.y=212;
  const idc=NB.auto(NB.frame("id",null,null,{plain:true}),{gap:4});ph.appendChild(idc);idc.x=140;idc.y=238;
  idc.appendChild(await NB.text("Dvija",{f:"Archivo",w:700,s:24,ls:-1.5}));
  idc.appendChild(await NB.text("BENGALURU · JOINED MAR 2026",{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));
  const stats=NB.auto(NB.frame("stats",350,null,{plain:true}),{dir:"HORIZONTAL",gap:26,pt:16,pb:16});stats.strokes=[NB.paint("border/subtle")];stats.strokeWeight=1;ph.appendChild(stats);stats.x=20;stats.y=340;
  for(const[v,l]of[["47","PLACES"],["12","ROUTES"],["83","FOLLOWING"],["6","COLLECTIONS"]]){const c=NB.auto(NB.frame(l,null,null,{plain:true}),{gap:2});c.appendChild(await NB.text(v,{f:"Archivo",w:900,s:26,ls:-4}));c.appendChild(await NB.text(l,{f:"JetBrains Mono",w:400,s:9,c:"text/tertiary"}));stats.appendChild(c);}
  const tl=NB.auto(NB.frame("taste",350,10,{plain:true}),{gap:14});ph.appendChild(tl);tl.x=20;tl.y=430;
  tl.appendChild(await NB.text("YOUR TASTE, IN FIVE WORDS",{s:11,w:600,ls:14,c:"text/tertiary"}));
  const tc=NB.auto(NB.frame("tags",350,10,{plain:true}),{dir:"HORIZONTAL",wrap:true,gap:8});tc.primaryAxisSizingMode="FIXED";ph.appendChild(tc);tc.x=20;tl.y=452;tc.y=486;
  for(const w of["quiet","filter coffee","walkable","no queues","late"])tc.appendChild(await chip(w,false,true));
  const tbb=await tabbar("You");ph.appendChild(tbb);tbb.x=0;tbb.y=844-78;});}
 {await cell("D3 / Saved",async ph=>{await st(ph);
  const tb=NB.auto(NB.frame("tb",390,null,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER",pl:20,pr:20,pt:12,pb:12});ph.appendChild(tb);tb.x=0;tb.y=52;
  const l=NB.auto(NB.frame("l",null,null,{plain:true}),{gap:2});l.primaryAxisSizingMode="AUTO";l.appendChild(await NB.text("47 PLACES",{s:11,w:600,ls:14,c:"text/tertiary"}));l.appendChild(await NB.text("Saved",{f:"Archivo",w:600,s:20,ls:-1}));tb.appendChild(l);
  tb.appendChild(await iconBtn("+"));
  const fl=NB.auto(NB.frame("filters",350,10,{plain:true}),{dir:"HORIZONTAL",gap:8,pt:14,pb:14});ph.appendChild(fl);fl.x=20;fl.y=126;
  fl.appendChild(await chip("Collections",true));fl.appendChild(await chip("All places"));
  let cy=182;
  for(const[tok,t,m]of[["heat/undiscovered","Cold things, late","9 PLACES"],["heat/friends","Rainy day","6 PLACES"],["heat/mine","When people visit","14 PLACES"],["heat/hot","Cheap and loud","11 PLACES"]]){
   const c=NB.frame("col "+t,350,104,{clip:true,r:16});NB.fill(c,"bg/surface");NB.blob(c,tok,-35,-75,230,28);
   const ti=NB.auto(NB.frame("t",null,null,{plain:true}),{gap:3});c.appendChild(ti);ti.x=16;ti.y=56;
   ti.appendChild(await NB.text(t,{f:"Archivo",w:600,s:20,ls:-1}));
   ti.appendChild(await NB.text(m,{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));
   ph.appendChild(c);c.x=20;c.y=cy;cy+=118;}
  const tbb=await tabbar("Saved");ph.appendChild(tbb);tbb.x=0;tbb.y=844-78;});}
 {await cell("D4 / Friend's map",async ph=>{
  const mp=mapBase(390,844,[["heat/friends",-58,169,320],["heat/friends",195,388,250],["heat/mine",156,101,160,28]]);ph.appendChild(mp);mp.x=0;mp.y=0;
  await pinAt(mp,"heat/friends",null,null,.28,.34);await pinAt(mp,"heat/friends",null,null,.62,.54);await pinAt(mp,"heat/mine","Both of you",null,.48,.24);
  const s=await statusBar();ph.appendChild(s);s.x=0;s.y=0;
  const tb=NB.auto(NB.frame("tb",390,null,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER",pl:20,pr:20,pt:12,pb:12});ph.appendChild(tb);tb.x=0;tb.y=52;
  tb.appendChild(await iconBtn("←"));
  const mid=NB.auto(NB.frame("mid",null,null,{plain:true}),{dir:"HORIZONTAL",gap:10,cross:"CENTER"});mid.primaryAxisSizingMode="AUTO";
  const a=NB.frame("av",32,32,{r:999});NB.fill(a,"heat/friends");const at=await NB.text("RK",{f:"Archivo",w:700,s:12});a.appendChild(at);at.x=(32-at.width)/2;at.y=(32-at.height)/2;mid.appendChild(a);
  mid.appendChild(await NB.text("Rhea's map",{f:"Archivo",w:600,s:20,ls:-1}));tb.appendChild(mid);
  const sp=NB.frame("sp",40,40,{plain:true});sp.fills=[];tb.appendChild(sp);
  const sh=NB.auto(NB.frame("sheet",390,null),{gap:14,pt:12,pb:24,pl:20,pr:20});sh.topLeftRadius=sh.topRightRadius=32;sh.strokes=[NB.paint("border/default")];sh.strokeWeight=1;
  const gr=NB.frame("grabber",40,4,{r:2});NB.fill(gr,"neutral/600");sh.appendChild(gr);gr.layoutPositioning="ABSOLUTE";gr.x=175;
  const hr=NB.auto(NB.frame("hr",350,10,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER"});hr.primaryAxisSizingMode="FIXED";sh.appendChild(hr);
  const hl=NB.auto(NB.frame("hl",null,null,{plain:true}),{gap:4});hl.primaryAxisSizingMode="AUTO";
  hl.appendChild(await NB.text("72% taste overlap",{f:"Archivo",w:600,s:20,ls:-1}));
  hl.appendChild(await NB.text("11 places you both love",{s:12,c:"text/secondary"}));hr.appendChild(hl);
  hr.appendChild(await btn("primary","Following","SM"));
  sh.appendChild(await listRow("heat/friends","Naru Noodle Bar","WENT 2H AGO",92));
  ph.appendChild(sh);sh.y=844-sh.height;});}

 await flowHead("Flow E — Utility","Unglamorous and load-bearing.");
 {await cell("E1 / Notifications",async ph=>{await st(ph);
  const tb=await topBar(null,"Notifications",["⚙"]);ph.appendChild(tb);tb.x=0;tb.y=52;
  let cy=136;
  for(const[tok,txt,when]of[["heat/undiscovered","Three places opened near you that fit “quiet, late”","20 MIN AGO"],["heat/friends","Rhea went to Naru Noodle Bar — you saved it in March","2H AGO"],["heat/hot","Spirit Forward is unusually quiet for a Friday","5H AGO"],["heat/mine","Your Sunday route is ready","YESTERDAY"]]){
   const r=NB.auto(NB.frame("n",350,null,{plain:true}),{dir:"HORIZONTAL",gap:13,pt:16,pb:16,cross:"MIN"});r.strokes=[NB.paint("border/subtle")];r.strokeWeight=1;ph.appendChild(r);r.x=20;r.y=cy;
   const d=NB.frame("dot",9,9,{r:999});NB.fill(d,tok);d.effects=[{type:"DROP_SHADOW",color:{...NB.H(NB.res(tok)),a:.8},offset:{x:0,y:0},radius:12,spread:2,visible:true,blendMode:"NORMAL"}];d.y=8;r.appendChild(d);
   const mc=NB.auto(NB.frame("m",null,null,{plain:true}),{gap:3});mc.primaryAxisSizingMode="AUTO";mc.layoutGrow=1;
   mc.appendChild(await NB.text(txt,{s:14,lh:1.4,tw:300}));
   mc.appendChild(await NB.text(when,{f:"JetBrains Mono",w:400,s:10,c:"text/tertiary"}));r.appendChild(mc);
   cy+=r.height+2;}
  const tbb=await tabbar("Feed");ph.appendChild(tbb);tbb.x=0;tbb.y=844-78;});}
 {await cell("E2 / Settings",async ph=>{await st(ph);
  const tb=NB.auto(NB.frame("tb",390,null,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER",pl:20,pr:20,pt:12,pb:12});ph.appendChild(tb);tb.x=0;tb.y=52;
  tb.appendChild(await iconBtn("←"));
  tb.appendChild(await NB.text("Settings",{f:"Archivo",w:600,s:20,ls:-1}));
  const sp=NB.frame("sp",40,40,{plain:true});sp.fills=[];tb.appendChild(sp);
  let cy=130;
  const section=async(lbl)=>{ph.appendChild(await NB.text(lbl.toUpperCase(),{s:11,w:600,ls:14,c:"text/tertiary"})).x=20;ph.children[ph.children.length-1].y=cy;cy+=24;};
  const row=async(t,d,tog)=>{const r=NB.auto(NB.frame(t,350,null,{plain:true}),{dir:"HORIZONTAL",gap:14,pt:14,pb:14,cross:"CENTER"});r.strokes=[NB.paint("border/subtle")];r.strokeWeight=1;ph.appendChild(r);r.x=20;r.y=cy;
   const mc=NB.auto(NB.frame("m",null,null,{plain:true}),{gap:2});mc.primaryAxisSizingMode="AUTO";mc.layoutGrow=1;mc.appendChild(await NB.text(t,{s:14,w:500}));if(d)mc.appendChild(await NB.text(d,{s:11,c:"text/secondary"}));r.appendChild(mc);
   if(tog)r.appendChild(await toggle(tog==="on"));else r.appendChild(await NB.text("›",{s:15,c:"text/secondary"}));
   cy+=r.height+2;};
  await section("Taste");
  await row("Edit interests","16 selected");await row("Recalibrate vibe","Last done in March");await row("Reset my map","Start the graph over");
  cy+=14;await section("Privacy");
  await row("Location","While using the app");await row("Show my map to followers",null,"on");await row("Appear in taste-overlap search",null,"off");
  cy+=14;await section("Notifications");
  await row("New places in your taste",null,"on");await row("Friend activity",null,"on");await row("Trending surges",null,"off");
  const tbb=await tabbar("You");ph.appendChild(tbb);tbb.x=0;tbb.y=844-78;});}
 {await cell("E3 / Empty & offline",async ph=>{await st(ph);
  const tb=await topBar("Bengaluru","Your map");ph.appendChild(tb);tb.x=0;tb.y=52;
  const col=NB.auto(NB.frame("c",342,10,{plain:true}),{gap:10,cross:"CENTER"});ph.appendChild(col);col.x=24;col.y=290;
  const ring=NB.frame("ring",64,64,{r:999,plain:true});ring.dashPattern=[6,6];ring.strokes=[NB.paint("border/strong")];ring.strokeWeight=1;col.appendChild(ring);
  col.appendChild(await NB.text("No signal out here",{f:"Archivo",w:700,s:24,ls:-1.5}));
  col.appendChild(await NB.text("We can't read the city right now. Your saved places still work offline.",{s:13,c:"text/secondary",tw:300}));
  const sp=NB.frame("sp",1,16,{plain:true});sp.fills=[];col.appendChild(sp);
  col.appendChild(await btn("secondary","Try again"));
  col.appendChild(await btn("ghost","Open saved places","SM"));
  const tbb=await tabbar("Map");ph.appendChild(tbb);tbb.x=0;tbb.y=844-78;});}
 figma.viewport.scrollAndZoomIntoView(pg.children);
 figma.notify("Run F done — Flows C, D & E (12 screens).");
}
main().catch(e=>{console.error(e);figma.notify("Run F error: "+String(e&&e.message||e));});
