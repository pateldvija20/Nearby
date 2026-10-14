const NB={H:h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255})};
NB.PRIM={"magenta/300":"#FF8FC6","magenta/400":"#FF57A8","magenta/500":"#FF1E8C","magenta/600":"#D6006B","green":"#16C47F","red/400":"#FF5C5C","red/500":"#FF2020","blue/300":"#8FB4FF","blue/400":"#5590FF","blue/500":"#0F5FF5","sky/300":"#BFE9FB","neutral/0":"#FFFFFF","neutral/100":"#EDEDEF","neutral/300":"#ABABB3","neutral/400":"#7C7C85","neutral/500":"#55555D","neutral/600":"#38383E","neutral/700":"#26262A","neutral/800":"#17171A","neutral/900":"#0D0D0F","neutral/1000":"#000000"};
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
async function chip(label,on){const f=NB.auto(NB.frame("chip",null,34,{plain:true,r:999}),{dir:"HORIZONTAL",gap:6,pl:14,pr:14,cross:"CENTER"});f.primaryAxisSizingMode="AUTO";let tc="text/secondary";if(on){NB.fill(f,"bg/accent");tc="text/on-accent";}else{f.strokes=[NB.paint("border/default")];f.strokeWeight=1;}f.appendChild(await NB.text(label,{s:13,w:500,c:tc}));return f;}
async function scoreN(n,size=22){const sc=NB.auto(NB.frame("score",null,null,{plain:true}),{dir:"HORIZONTAL",gap:2});sc.appendChild(await NB.text(String(n),{f:"Archivo",w:900,s:size,ls:-4,c:"text/accent"}));sc.appendChild(await NB.text("%",{s:12,c:"text/accent",op:.7}));return sc;}
async function btn(variant,label,size="MD"){const z={SM:[36,13,16],MD:[48,15,24],LG:[56,17,32]}[size];const f=NB.auto(NB.frame("btn "+label,null,z[0],{plain:true,r:999}),{dir:"HORIZONTAL",gap:8,pl:z[2],pr:z[2],main:"CENTER",cross:"CENTER"});f.primaryAxisSizingMode="AUTO";f.counterAxisSizingMode="FIXED";
 if(variant==="primary"){NB.fill(f,"bg/accent");f.effects=[NB.glow(NB.res("bg/accent"))];}
 else if(variant==="secondary"){f.fills=[];f.strokes=[NB.paint("border/strong")];f.strokeWeight=1;}
 else{f.fills=[];}
 f.appendChild(await NB.text(label,{s:z[1],w:600,c:variant==="primary"?"text/on-accent":"text/secondary"}));return f;}
async function toggle(on){const f=NB.frame("toggle",48,28,{r:999,plain:true});NB.fill(f,on?"bg/accent":"neutral/700");const d=NB.frame("d",22,22,{r:999,plain:true});NB.fill(d,on?"neutral/0":"neutral/300");d.y=3;d.x=on?23:3;f.appendChild(d);return f;}
function mapBase(w,h,blobs){const f=NB.frame("map",w,h);NB.fill(f,"bg/sunken");f.clipsContent=true;
 for(const[yt,vert,pos]of[[.34,false,0],[.68,false,0],[0,true,.28],[0,true,.64]]){const r=NB.frame("road",vert?2:w,vert?h:2,{plain:true});NB.fill(r,"neutral/700");r.opacity=.35;r.x=vert?Math.round(w*pos)-1:0;r.y=vert?0:Math.round(h*yt)-1;f.appendChild(r);}
 for(const[tok,x,y,s,b]of blobs)NB.blob(f,tok,x,y,s,b||60);
 return f;}
async function pinAt(parent,tok,label,num,x,y){const p=NB.auto(NB.frame("pin",null,null,{plain:true}),{dir:"VERTICAL",gap:3,cross:"CENTER"});
 if(num){const n=NB.frame("num",26,26,{r:999});NB.fill(n,"bg/accent");n.strokes=[{type:"SOLID",color:{r:0,g:0,b:0}}];n.strokeWeight=2;const t=await NB.text(String(num),{f:"Archivo",w:800,s:12,c:"text/on-accent"});n.appendChild(t);t.x=(26-t.width)/2;t.y=(26-t.height)/2;p.appendChild(n);}
 else{const d=NB.frame("dot",20,20,{r:999});NB.fill(d,tok);d.strokes=[{type:"SOLID",color:{...NB.H("#000"),a:.65}}];d.strokeWeight=2;d.effects=[{type:"DROP_SHADOW",color:{...NB.H(NB.res(tok)),a:.9},offset:{x:0,y:0},radius:14,spread:2,visible:true,blendMode:"NORMAL"}];p.appendChild(d);}
 if(label){const l=NB.auto(NB.frame("lb",null,null,{plain:true}),{pt:2,pb:2,pl:6,pr:6});l.fills=[{type:"SOLID",color:{...NB.H("#000"),a:.72}}];l.cornerRadius=3;l.appendChild(await NB.text(label.toUpperCase(),{f:"JetBrains Mono",w:400,s:9,ls:6,c:"text/primary"}));p.appendChild(l);}
 parent.appendChild(p);p.x=Math.round(x*parent.width-p.width/2);p.y=Math.round(y*parent.height-p.height);return p;}
async function listRow(thumbTok,title,meta,n,w=372){const f=NB.auto(NB.frame("row "+title,w,null,{plain:true}),{dir:"HORIZONTAL",gap:12,pt:12,pb:12,cross:"CENTER"});
 const th=NB.frame("thumb",56,56,{r:12,clip:true});NB.fill(th,"bg/raised");th.clipsContent=true;th.appendChild(NB.blob(th,thumbTok,-11,-17,90,28));f.appendChild(th);
 const m=NB.auto(NB.frame("m",null,null,{plain:true}),{gap:3});m.primaryAxisSizingMode="AUTO";m.layoutGrow=1;m.appendChild(await NB.text(title,{s:14,w:600}));m.appendChild(await NB.text(meta.toUpperCase(),{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));f.appendChild(m);
 f.appendChild(await scoreN(n));
 return f;}
async function navbar(active,venue){const f=NB.auto(NB.frame("navbar",1440,79,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER",pl:40,pr:40});f.primaryAxisSizingMode="FIXED";f.counterAxisSizingMode="FIXED";f.strokes=[NB.paint("border/subtle")];f.strokeWeight=1;
 const l=NB.auto(NB.frame("l",null,null,{plain:true}),{dir:"HORIZONTAL",gap:44,cross:"CENTER"});l.primaryAxisSizingMode="AUTO";
 const logo=await NB.text("NEARBY",{f:"Archivo",w:900,s:20,ls:-3});logo.textAutoResize="WIDTH_AND_HEIGHT";logo.resize(logo.width,logo.height);l.appendChild(logo);
 if(venue){const b=NB.auto(NB.frame("vb",null,22,{plain:true,r:4}),{pt:2,pb:2,pl:9,pr:9,cross:"CENTER"});b.primaryAxisSizingMode="AUTO";b.counterAxisSizingMode="FIXED";const bp=NB.paint("heat/mine");bp.opacity=.16;b.fills=[bp];b.appendChild(await NB.text("FOR VENUES",{f:"JetBrains Mono",w:500,s:10,ls:8,c:"magenta/400"}));l.appendChild(b);}
 else{for(const item of["Explore","Plan","Feed","Saved"]){const on=item===active;l.appendChild(await NB.text(item,{s:14,w:on?600:500,c:on?"text/primary":"text/tertiary"}));}}
 f.appendChild(l);
 const r=NB.auto(NB.frame("r",null,null,{plain:true}),{dir:"HORIZONTAL",gap:14,cross:"CENTER"});r.primaryAxisSizingMode="AUTO";
 if(venue){r.appendChild(await NB.text("Blue Tokai · Indiranagar",{s:13,c:"text/secondary"}));}
 else{const si=NB.auto(NB.frame("search",280,42,{plain:true,r:999}),{cross:"CENTER",pl:44});NB.fill(si,"bg/surface");si.strokes=[NB.paint("border/subtle")];si.strokeWeight=1;const ic=await NB.text("⌕",{s:15,c:"text/tertiary"});si.appendChild(ic);ic.layoutPositioning="ABSOLUTE";ic.x=16;ic.y=12;si.appendChild(await NB.text("Search",{s:14,c:"text/tertiary"}));r.appendChild(si);}
 const a=NB.frame("av",32,32,{r:999});NB.fill(a,venue?"heat/friends":"heat/mine");const at=await NB.text(venue?"BT":"DP",{f:"Archivo",w:700,s:12});a.appendChild(at);at.x=(32-at.width)/2;at.y=(32-at.height)/2;r.appendChild(a);
 f.appendChild(r);return f;}
async function stopCard(num,title,time,meta,note,last){const g=NB.frame("stop "+num,null,null,{plain:true});g.fills=[];
 if(!last){const line=NB.frame("line",2,64,{plain:true});line.fills=[{type:"SOLID",color:NB.H("#D6006B")}];line.dashPattern=[5,6];line.x=19;line.y=48;g.appendChild(line);}
 const circ=NB.frame("circ",30,30,{r:999});NB.fill(circ,"bg/accent");const t=await NB.text(String(num),{f:"Archivo",w:800,s:14,c:"text/on-accent"});circ.appendChild(t);t.x=(30-t.width)/2;t.y=(30-t.height)/2;circ.x=5;circ.y=4;g.appendChild(circ);
 const card=NB.auto(NB.frame("card",340,null,{plain:true}),{gap:6,p:14});NB.fill(card,"bg/surface");card.strokes=[NB.paint("border/subtle")];card.strokeWeight=1;card.cornerRadius=16;card.x=56;card.y=0;g.appendChild(card);
 const r1=NB.auto(NB.frame("r1",312,10,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER"});r1.primaryAxisSizingMode="FIXED";card.appendChild(r1);
 r1.appendChild(await NB.text(title,{f:"Archivo",w:700,s:17}));
 const tm=await NB.text(time,{f:"JetBrains Mono",w:400,s:10,c:"text/accent"});tm.textAlignHorizontal="RIGHT";r1.appendChild(tm);
 card.appendChild(await NB.text(meta.toUpperCase(),{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));
 card.appendChild(await NB.text(note,{s:12,c:"text/secondary"}));
 return g;}
async function main(){
 await NB.ensureVars();
 const pg=await NB.page("04 Web App");
 const old=pg.children.filter(c=>c.name.startsWith("screen "));old.forEach(c=>c.remove());
 let y=100;
 const put=async(name,h,build)=>{const wrap=NB.auto(NB.frame("screen "+name,null,null,{plain:true}),{gap:10});wrap.clipsContent=false;
  wrap.appendChild(await NB.text(name.toUpperCase(),{f:"JetBrains Mono",w:400,s:11,c:"text/tertiary"}));
  const w=NB.frame(name,1440,h,{bg:"bg/canvas"});w.strokes=[NB.paint("border/default")];w.cornerRadius=8;wrap.appendChild(w);
  await build(w);
  pg.appendChild(wrap);wrap.x=100;y+=h+120;wrap.y=y-h-120;};
 {await put("W1 / Landing",900,async wb=>{
  NB.blob(wb,"heat/mine",-230,-126,760);NB.blob(wb,"heat/hot",-115,746,520);NB.blob(wb,"heat/friends",633,414,640);NB.blob(wb,"heat/undiscovered",57,558,420);
  const nav=await navbar(null);wb.appendChild(nav);nav.x=0;nav.y=0;
  const hero=NB.auto(NB.frame("hero",1000,10,{plain:true}),{gap:28});wb.appendChild(hero);hero.x=80;hero.y=189;
  hero.appendChild(await NB.text("BENGALURU · MUMBAI · DELHI",{s:11,w:600,ls:14,c:"text/tertiary"}));
  hero.appendChild(await NB.text("The city looks\ndifferent to\neveryone.",{f:"Archivo",w:900,s:86,ls:-3,lh:.98}));
  hero.appendChild(await NB.text("Nearby learns what you actually like, then redraws the map around it — and turns one sentence into a route you can walk tonight.",{s:19,lh:1.5,c:"text/secondary",tw:520}));
  const brow=NB.auto(NB.frame("btns",null,10,{plain:true}),{dir:"HORIZONTAL",gap:14});hero.appendChild(brow);
  brow.appendChild(await btn("primary","Build my map","LG"));brow.appendChild(await btn("secondary","See how it works","LG"));
  const stats=NB.auto(NB.frame("stats",null,10,{plain:true}),{dir:"HORIZONTAL",gap:48});hero.appendChild(stats);
  for(const[v,l]of[["1,284","PLACES MAPPED"],["62%","NEVER ON A TOP-10 LIST"],["8 MIN","MEDIAN WALK"]]){const c=NB.auto(NB.frame(l,null,null,{plain:true}),{gap:4});c.appendChild(await NB.text(v,{f:"Archivo",w:900,s:36,ls:-4}));c.appendChild(await NB.text(l,{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));stats.appendChild(c);}});}
 {await put("W2 / Explore",900,async wb=>{
  const nav=await navbar("Explore");wb.appendChild(nav);nav.x=0;nav.y=0;
  const side=NB.auto(NB.frame("sidebar",420,821,{plain:true}),{gap:18,pt:24,pb:16,pl:24,pr:24});side.primaryAxisSizingMode="FIXED";side.counterAxisSizingMode="FIXED";side.strokes=[NB.paint("border/subtle")];side.strokeWeight=1;wb.appendChild(side);side.x=0;side.y=79;
  side.appendChild(await NB.text("14 places in your taste",{f:"Archivo",w:700,s:24,ls:-1.5}));
  side.appendChild(await NB.text("INDIRANAGAR · WITHIN 2 MI",{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));
  const cr=NB.auto(NB.frame("chips",null,10,{plain:true}),{dir:"HORIZONTAL",wrap:true,gap:8});cr.primaryAxisSizingMode="AUTO";cr.counterAxisSizingMode="AUTO";side.appendChild(cr);
  for(const[c,on]of[["My taste",1],["Friends",0],["Trending",0],["New",0]])cr.appendChild(await chip(c,on===1));
  for(const[tok,t,m,n]of[["heat/mine","Blue Tokai","0.4 mi · filter coffee · ₹₹",94],["heat/friends","Toit Brewpub","1.1 mi · 4 friends went",83],["heat/undiscovered","Corner Store","0.7 mi · never been",76],["heat/hot","Third Wave","0.3 mi · busy now",91],["heat/mine","Naru Noodle Bar","0.5 mi · 14 seats",92],["heat/undiscovered","Dyu Art Cafe","0.4 mi · quiet",84]])side.appendChild(await listRow(tok,t,m,n));
  const mp=mapBase(1020,821,[["heat/mine",-61,131,420],["heat/hot",388,16,300],["heat/friends",490,328,380],["heat/undiscovered",61,459,320]]);wb.appendChild(mp);mp.x=420;mp.y=79;
  await pinAt(mp,"heat/mine","Blue Tokai",null,.20,.30);await pinAt(mp,"heat/hot","Toit",null,.46,.22);await pinAt(mp,"heat/friends","Spirit Fwd",null,.66,.46);await pinAt(mp,"heat/undiscovered","Corner St.",null,.32,.60);await pinAt(mp,"heat/mine",null,null,.54,.54);await pinAt(mp,"heat/mine",null,null,.78,.28);
  const zb=NB.auto(NB.frame("zoom",null,null,{plain:true}),{dir:"VERTICAL",gap:8});wb.appendChild(zb);zb.x=1380;zb.y=99;
  for(const g of["+","−"]){const b=NB.auto(NB.frame(g,40,40,{r:999}),{main:"CENTER",cross:"CENTER"});b.primaryAxisSizingMode="FIXED";b.counterAxisSizingMode="FIXED";b.strokes=[NB.paint("border/default")];b.strokeWeight=1;b.fills=[{type:"SOLID",color:{...NB.H("#0A0A0C"),a:.6}}];b.appendChild(await NB.text(g,{s:15}));zb.appendChild(b);}
  const lgd=NB.auto(NB.frame("legend",null,null,{plain:true,r:12}),{gap:10,pt:14,pb:14,pl:18,pr:18});lgd.fills=[{type:"SOLID",color:{...NB.H("#0A0A0C"),a:.9}}];lgd.strokes=[NB.paint("border/default")];lgd.strokeWeight=1;wb.appendChild(lgd);lgd.x=20;lgd.y=800;
  lgd.appendChild(await NB.text("LEGEND",{s:11,w:600,ls:14,c:"text/tertiary"}));
  const lr=NB.auto(NB.frame("items",null,10,{plain:true}),{dir:"HORIZONTAL",gap:18});lr.primaryAxisSizingMode="AUTO";
  for(const[tok,l]of[["heat/mine","MY TASTE"],["heat/friends","FRIENDS"],["heat/hot","TRENDING"],["heat/undiscovered","NEW"]]){const it=NB.auto(NB.frame(l,null,10,{plain:true}),{dir:"HORIZONTAL",gap:6,cross:"CENTER"});it.primaryAxisSizingMode="AUTO";
   const d=NB.frame("dot",9,9,{r:999});NB.fill(d,tok);d.effects=[{type:"DROP_SHADOW",color:{...NB.H(NB.res(tok)),a:.7},offset:{x:0,y:0},radius:10,spread:1,visible:true,blendMode:"NORMAL"}];it.appendChild(d);
   it.appendChild(await NB.text(l,{f:"JetBrains Mono",w:400,s:9,c:"text/secondary"}));lr.appendChild(it);}
  lgd.appendChild(lr);});}
 {await put("W3 / Itinerary planner",900,async wb=>{
  const nav=await navbar("Plan");wb.appendChild(nav);nav.x=0;nav.y=0;
  const panel=NB.auto(NB.frame("panel",460,821,{plain:true}),{gap:16,pt:28,pb:28,pl:28,pr:28});panel.primaryAxisSizingMode="FIXED";panel.counterAxisSizingMode="FIXED";panel.strokes=[NB.paint("border/subtle")];panel.strokeWeight=1;wb.appendChild(panel);panel.x=0;panel.y=79;
  panel.appendChild(await NB.text("YOUR PROMPT",{s:11,w:600,ls:14,c:"text/tertiary"}));
  const ta=NB.auto(NB.frame("ta",404,100),{pt:16,pb:16,pl:16,pr:16});NB.fill(ta,"bg/surface");ta.cornerRadius=16;ta.strokes=[NB.paint("border/subtle")];ta.strokeWeight=1;
  ta.appendChild(await NB.text("Quiet dinner, then somewhere we can actually hear each other. Walking distance. Under ₹2000 for two.",{s:15,lh:1.5}));panel.appendChild(ta);
  const pc=NB.auto(NB.frame("p-chips",null,10,{plain:true}),{dir:"HORIZONTAL",gap:8});pc.primaryAxisSizingMode="AUTO";
  for(const c of["◷ Tonight 7pm","● 2 people","↗ Walk only"])pc.appendChild(await chip(c));panel.appendChild(pc);
  const hr=NB.auto(NB.frame("hdr",404,10,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER"});hr.primaryAxisSizingMode="FIXED";panel.appendChild(hr);
  hr.appendChild(await NB.text("Quiet, then quieter",{f:"Archivo",w:600,s:20,ls:-1}));
  hr.appendChild(await NB.text("1.2 MI · ₹1,850",{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));
  const stops=NB.frame("stops",null,10,{plain:true});stops.fills=[];stops.resize(404,360);panel.appendChild(stops);
  stops.appendChild(await stopCard(1,"Blue Tokai","7:00","0.4 mi · 8 min walk","Back room is the quiet one."));
  const s2=await stopCard(2,"Naru Noodle Bar","8:15","0.5 mi · 9 min walk","Only 14 seats. Walk-ins till 8.");s2.y=110;stops.appendChild(s2);
  const s3=await stopCard(3,"Spirit Forward","9:45","0.3 mi · 6 min walk","No music after 10.",true);s3.y=234;stops.appendChild(s3);
  const brow=NB.auto(NB.frame("btns",404,10,{plain:true}),{dir:"HORIZONTAL",gap:10});brow.primaryAxisSizingMode="FIXED";panel.appendChild(brow);
  brow.appendChild(await btn("secondary","Shuffle"));brow.children[brow.children.length-1].layoutGrow=1;
  brow.appendChild(await btn("primary","Share route"));brow.children[brow.children.length-1].layoutGrow=1.4;
  const mp=mapBase(980,821,[["heat/mine",-39,377,340],["heat/hot",470,33,300]]);wb.appendChild(mp);mp.x=460;mp.y=79;
  await pinAt(mp,null,null,1,.20,.66);await pinAt(mp,null,null,2,.46,.46);await pinAt(mp,null,null,3,.72,.28);
  const route=figma.createVector();route.vectorPaths=[{windingRule:"NONE",data:`M ${Math.round(.20*980)} ${Math.round(.66*821)-26} L ${Math.round(.46*980)} ${Math.round(.46*821)-26} L ${Math.round(.72*980)} ${Math.round(.28*821)-26}`}];route.strokes=[NB.paint("heat/mine")];route.strokeWeight=3;route.dashPattern=[9,9];route.strokeCap="ROUND";mp.appendChild(route);});}
 {await put("W4 / Collection editor",780,async wb=>{
  const nav=await navbar("Saved");wb.appendChild(nav);nav.x=0;nav.y=0;
  const body=NB.auto(NB.frame("body",1440,701,{plain:true}),{gap:26,pt:36,pl:60,pr:60});body.primaryAxisSizingMode="FIXED";body.counterAxisSizingMode="FIXED";wb.appendChild(body);body.x=0;body.y=79;
  const cover=NB.frame("cover",1320,180,{clip:true,r:16});NB.fill(cover,"bg/raised");
  NB.blob(cover,"heat/undiscovered",-105,-235,620);NB.blob(cover,"heat/mine",1060,90,340,28);
  const ct=NB.auto(NB.frame("ct",null,null,{plain:true}),{gap:6});cover.appendChild(ct);ct.x=26;ct.y=82;
  ct.appendChild(await NB.text("Cold things, late",{f:"Archivo",w:800,s:38,ls:-2.5}));
  ct.appendChild(await NB.text("9 PLACES · PUBLIC · 24 SAVES",{f:"JetBrains Mono",w:400,s:11,c:"text/secondary"}));
  const cb=NB.auto(NB.frame("cb",null,null,{plain:true}),{dir:"HORIZONTAL",gap:8});cover.appendChild(cb);cb.x=1080;cb.y=20;
  cb.appendChild(await btn("secondary","Edit cover","SM"));cb.appendChild(await btn("primary","Share","SM"));
  body.appendChild(cover);
  const cols=NB.auto(NB.frame("cols",1320,10,{plain:true}),{dir:"HORIZONTAL",gap:36});
  const pl=NB.auto(NB.frame("places",964,10,{plain:true}),{gap:8});
  const ph=NB.auto(NB.frame("ph",964,10,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER"});ph.primaryAxisSizingMode="FIXED";
  ph.appendChild(await NB.text("PLACES · DRAG TO REORDER",{s:11,w:600,ls:14,c:"text/tertiary"}));
  const addb=NB.auto(NB.frame("add",null,10,{plain:true}),{dir:"HORIZONTAL",gap:6});addb.primaryAxisSizingMode="AUTO";addb.appendChild(await NB.text("+ Add place",{s:13,c:"text/secondary"}));ph.appendChild(addb);
  pl.appendChild(ph);
  for(const[tok,t,m,n]of[["heat/undiscovered","Corner Store","0.7 mi · ice cream · ₹",88],["heat/mine","Naturals","1.4 mi · open till 12",81],["heat/undiscovered","Ibaco","2.1 mi · never been",74],["heat/friends","Milk & Honey","0.9 mi · 2 friends",69]])pl.appendChild(await listRow(tok,t,m,n,964));
  cols.appendChild(pl);
  const setc=NB.auto(NB.frame("settings",320,10,{plain:true}),{gap:12});
  setc.appendChild(await NB.text("COLLECTION SETTINGS",{s:11,w:600,ls:14,c:"text/tertiary"}));
  const card=NB.auto(NB.frame("card",320,null,{plain:true}),{gap:0,p:18});NB.fill(card,"bg/surface");card.strokes=[NB.paint("border/subtle")];card.strokeWeight=1;card.cornerRadius=16;
  for(const[t,on]of[["Public",1],["Allow contributions",0],["Show on my profile",1]]){const r=NB.auto(NB.frame(t,284,null,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER",pt:12,pb:12});r.primaryAxisSizingMode="FIXED";r.strokes=[NB.paint("border/subtle")];r.strokeWeight=1;
   r.appendChild(await NB.text(t,{s:13}));r.appendChild(await toggle(on===1));card.appendChild(r);}
  const sp=NB.frame("sp",1,16,{plain:true});sp.fills=[];card.appendChild(sp);
  card.appendChild(await NB.text("DESCRIPTION",{s:11,w:600,ls:14,c:"text/tertiary"}));
  const ta=NB.auto(NB.frame("ta",284,74),{pt:12,pb:12,pl:12,pr:12});NB.fill(ta,"bg/sunken");ta.strokes=[NB.paint("border/subtle")];ta.strokeWeight=1;ta.cornerRadius=8;
  ta.appendChild(await NB.text("Places for when it's too hot to sleep.",{s:13}));card.appendChild(ta);
  setc.appendChild(card);
  cols.appendChild(setc);
  body.appendChild(cols);});}
 {await put("W5 / Profile",860,async wb=>{
  const nav=await navbar(null);wb.appendChild(nav);nav.x=0;nav.y=0;
  const hero=NB.frame("hero",1440,250,{clip:true});hero.appendChild(mapBase(1440,250,[["heat/mine",59,10,420],["heat/mine",634,60,280,28],["heat/undiscovered",951,41,300],["heat/friends",346,100,260]]));
  const hl=await NB.text("YOUR TASTE MAP · 47 PLACES",{s:11,w:600,ls:14,c:"text/tertiary"});hero.appendChild(hl);hl.x=60;hl.y=214;wb.appendChild(hero);hero.x=0;hero.y=79;
  const id=NB.auto(NB.frame("id",1320,10,{plain:true}),{dir:"HORIZONTAL",gap:20,cross:"MAX"});wb.appendChild(id);id.x=60;id.y=289;
  const av=NB.frame("av",104,104,{r:999});NB.fill(av,"heat/mine");av.strokes=[NB.paint("bg/canvas")];av.strokeWeight=3;av.strokeAlign="OUTSIDE";
  const at=await NB.text("DP",{f:"Archivo",w:700,s:34});av.appendChild(at);at.x=(104-at.width)/2;at.y=(104-at.height)/2;id.appendChild(av);
  const who=NB.auto(NB.frame("who",null,10,{plain:true}),{gap:4});who.primaryAxisSizingMode="AUTO";who.layoutGrow=1;who.counterAxisAlignItems="MIN";
  who.appendChild(await NB.text("Dvija Patel",{f:"Archivo",w:700,s:32,ls:-2}));
  who.appendChild(await NB.text("BENGALURU · 83 FOLLOWING · 61 FOLLOWERS",{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));id.appendChild(who);
  id.appendChild(await btn("secondary","Edit taste"));
  const stats=NB.auto(NB.frame("stats",1320,10,{plain:true}),{dir:"HORIZONTAL",gap:56,pt:20,pb:20});stats.strokes=[NB.paint("border/subtle")];stats.strokeWeight=1;wb.appendChild(stats);stats.x=60;stats.y=id.y+124;
  for(const[v,l]of[["47","PLACES"],["12","ROUTES"],["6","COLLECTIONS"],["94%","AVG MATCH"],["62%","OFF THE LIST"]]){const c=NB.auto(NB.frame(l,null,null,{plain:true}),{gap:2});c.appendChild(await NB.text(v,{f:"Archivo",w:900,s:30,ls:-4}));c.appendChild(await NB.text(l,{f:"JetBrains Mono",w:400,s:9,c:"text/tertiary"}));stats.appendChild(c);}
  const cols=NB.auto(NB.frame("cols",1320,10,{plain:true}),{dir:"HORIZONTAL",gap:36});wb.appendChild(cols);cols.x=60;cols.y=stats.y+96;
  const routes=NB.auto(NB.frame("routes",964,10,{plain:true}),{gap:12});
  routes.appendChild(await NB.text("RECENT ROUTES",{s:11,w:600,ls:14,c:"text/tertiary"}));
  for(const[t,m]of[["Quiet, then quieter","3 STOPS · 1.2 MI · LAST FRIDAY"],["Cheap and loud","4 STOPS · 2.0 MI · MARCH 14"],["When Priya visited","5 STOPS · 3.1 MI · MARCH 2"]]){
   const c=NB.auto(NB.frame(t,964,null,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER",p:16});NB.fill(c,"bg/surface");c.strokes=[NB.paint("border/subtle")];c.strokeWeight=1;c.cornerRadius=16;c.primaryAxisSizingMode="FIXED";
   const lc=NB.auto(NB.frame("l",null,null,{plain:true}),{gap:4});lc.primaryAxisSizingMode="AUTO";
   lc.appendChild(await NB.text(t,{f:"Archivo",w:700,s:16}));lc.appendChild(await NB.text(m,{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));c.appendChild(lc);
   c.appendChild(await NB.text("›",{s:15,c:"text/secondary"}));routes.appendChild(c);}
  cols.appendChild(routes);
  const tc=NB.auto(NB.frame("taste",320,10,{plain:true}),{gap:14});
  tc.appendChild(await NB.text("YOUR TASTE, IN FIVE WORDS",{s:11,w:600,ls:14,c:"text/tertiary"}));
  const tags=NB.auto(NB.frame("tags",320,10,{plain:true}),{dir:"HORIZONTAL",wrap:true,gap:8});tags.primaryAxisSizingMode="FIXED";
  for(const w of["quiet","filter coffee","walkable","no queues","late"]){const chipEl=NB.auto(NB.frame(w,null,34,{plain:true,r:999}),{dir:"HORIZONTAL",pl:14,pr:14,cross:"CENTER"});chipEl.primaryAxisSizingMode="AUTO";chipEl.strokes=[NB.paint("magenta/700")];chipEl.strokeWeight=1;chipEl.appendChild(await NB.text(w,{s:13,w:500,c:"magenta/300"}));tags.appendChild(chipEl);}
  tc.appendChild(tags);cols.appendChild(tc);});}
 {await put("W6 / Venue partner dashboard",760,async wb=>{
  const nav=await navbar(null,true);wb.appendChild(nav);nav.x=0;nav.y=0;
  const body=NB.auto(NB.frame("body",1440,681,{plain:true}),{gap:28,pt:32,pl:40,pr:40});body.primaryAxisSizingMode="FIXED";body.counterAxisSizingMode="FIXED";wb.appendChild(body);body.x=0;body.y=79;
  body.appendChild(await NB.text("Who is finding you",{f:"Archivo",w:700,s:32,ls:-2}));
  body.appendChild(await NB.text("Aggregate and anonymised. Nearby never shares individual profiles.",{s:13,c:"text/secondary"}));
  const kpis=NB.auto(NB.frame("kpis",1360,10,{plain:true}),{dir:"HORIZONTAL",gap:16});
  for(const[l,v,d,dc]of[["APPEARED ON MAPS","3,412","▲ 18% vs last week","status/success"],["ADDED TO ROUTES","284","▲ 7% vs last week","status/success"],["MEDIAN MATCH","88%","Top decile in your area","text/secondary"],["WALK-INS FROM ROUTES","96","▼ 3% vs last week","heat/hot"]]){
   const c=NB.auto(NB.frame(l,null,null,{plain:true}),{gap:10,p:20});NB.fill(c,"bg/surface");c.strokes=[NB.paint("border/subtle")];c.strokeWeight=1;c.cornerRadius=16;c.layoutGrow=1;
   c.appendChild(await NB.text(l,{f:"JetBrains Mono",w:400,s:9,c:"text/secondary"}));
   c.appendChild(await NB.text(v,{f:"Archivo",w:900,s:34,ls:-4}));
   c.appendChild(await NB.text(d,{s:11,c:dc}));kpis.appendChild(c);}
  body.appendChild(kpis);
  const cols=NB.auto(NB.frame("cols",1360,10,{plain:true}),{dir:"HORIZONTAL",gap:24});
  const tastes=NB.auto(NB.frame("tastes",null,null,{plain:true}),{gap:18,p:22});NB.fill(tastes,"bg/surface");tastes.strokes=[NB.paint("border/subtle")];tastes.strokeWeight=1;tastes.cornerRadius=16;tastes.layoutGrow=1.4;tastes.primaryAxisSizingMode="AUTO";
  tastes.appendChild(await NB.text("WHICH TASTES YOU MATCH",{s:11,w:600,ls:14,c:"text/tertiary"}));
  for(const[t,v]of[["Filter coffee",94],["Quiet rooms",81],["Laptop-friendly",66],["Late night",34],["Group-friendly",21]]){
   const g=NB.auto(NB.frame(t,null,null,{plain:true}),{gap:6});
   const hr=NB.auto(NB.frame("hr",null,10,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN"});hr.primaryAxisSizingMode="AUTO";
   hr.appendChild(await NB.text(t,{s:12,c:"text/primary"}));hr.appendChild(await NB.text(v+"%",{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));g.appendChild(hr);
   const tr=NB.frame("track",600,3,{clip:false});NB.fill(tr,"neutral/800");
   const fl=NB.frame("fill",Math.max(3,Math.round(600*v/100)),3,{plain:true,bgTok:"bg/accent"});tr.appendChild(fl);fl.x=0;fl.y=0;g.appendChild(tr);
   tastes.appendChild(g);}
  cols.appendChild(tastes);
  const src=NB.auto(NB.frame("src",null,null,{plain:true}),{gap:14,p:22,clip:true});NB.fill(src,"bg/surface");src.strokes=[NB.paint("border/subtle")];src.strokeWeight=1;src.cornerRadius=16;src.layoutGrow=1;src.primaryAxisSizingMode="AUTO";
  NB.blob(src,"heat/mine",140,140,320,110,.5);
  src.appendChild(await NB.text("WHERE THEY COME FROM",{s:11,w:600,ls:14,c:"text/tertiary"}));
  src.appendChild(await NB.text("Indiranagar — 58%\nKoramangala — 19%\nHSR Layout — 12%\nElsewhere — 11%",{s:13,lh:2.1,c:"text/secondary"}));
  cols.appendChild(src);
  body.appendChild(cols);});}
 figma.viewport.scrollAndZoomIntoView(pg.children);
 figma.notify("Run G done — Web W1–W6.");
}
main().catch(e=>{console.error(e);figma.notify("Run G error: "+String(e&&e.message||e));});
