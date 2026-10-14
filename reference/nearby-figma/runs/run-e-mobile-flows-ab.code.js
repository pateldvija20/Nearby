const NB={H:h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255})};
NB.PRIM={"magenta/300":"#FF8FC6","magenta/400":"#FF57A8","magenta/500":"#FF1E8C","magenta/600":"#D6006B","red/400":"#FF5C5C","red/500":"#FF2020","blue/300":"#8FB4FF","blue/400":"#5590FF","blue/500":"#0F5FF5","sky/300":"#BFE9FB","neutral/0":"#FFFFFF","neutral/100":"#EDEDEF","neutral/300":"#ABABB3","neutral/400":"#7C7C85","neutral/500":"#55555D","neutral/600":"#38383E","neutral/700":"#26262A","neutral/800":"#17171A","neutral/900":"#0D0D0F","neutral/1000":"#000000"};
NB.ALIAS={"bg/canvas":"neutral/1000","bg/surface":"neutral/900","bg/raised":"neutral/800","bg/inverse":"neutral/0","bg/accent":"magenta/500","text/primary":"neutral/0","text/secondary":"neutral/300","text/tertiary":"neutral/400","text/on-accent":"neutral/0","border/subtle":"neutral/800","border/default":"neutral/700","border/strong":"neutral/600","heat/mine":"magenta/500","heat/friends":"blue/500","heat/hot":"red/500","heat/undiscovered":"sky/300"};
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
async function badge(kind,label){const tok=kind==="Match"?"heat/mine":kind==="Hot"?"heat/hot":kind==="Friend"?"heat/friends":"heat/undiscovered";const f=NB.auto(NB.frame("badge",null,22,{plain:true,r:4}),{dir:"HORIZONTAL",gap:5,pl:9,pr:9,cross:"CENTER"});f.primaryAxisSizingMode="AUTO";f.counterAxisSizingMode="FIXED";const b=NB.paint(tok==="heat/undiscovered"?"sky/300":tok);b.opacity=.16;f.fills=[b];const fg=kind==="Match"?"magenta/400":kind==="Hot"?"red/400":kind==="Friend"?"blue/400":tok;f.appendChild(await NB.text(label.toUpperCase(),{f:"JetBrains Mono",w:500,s:10,ls:8,c:fg}));return f;}
async function scoreN(n,size=26){const sc=NB.auto(NB.frame("score",null,null,{plain:true}),{dir:"HORIZONTAL",gap:2});sc.appendChild(await NB.text(String(n),{f:"Archivo",w:900,s:size,ls:-4,c:"text/accent"}));sc.appendChild(await NB.text("%",{s:12,c:"text/accent",op:.7}));return sc;}
async function btn(variant,label,size="MD",blockW){const z={SM:[36,13,16],MD:[48,15,24],LG:[56,17,32]}[size];const f=NB.auto(NB.frame("btn "+label,null,z[0],{plain:true,r:999}),{dir:"HORIZONTAL",gap:8,pl:z[2],pr:z[2],main:"CENTER",cross:"CENTER"});f.primaryAxisSizingMode=blockW?"FIXED":"AUTO";f.counterAxisSizingMode="FIXED";
 if(variant==="primary"){NB.fill(f,"bg/accent");f.effects=[NB.glow(NB.res("bg/accent"))];}
 else if(variant==="secondary"){f.fills=[];f.strokes=[NB.paint("border/strong")];f.strokeWeight=1;}
 else if(variant==="danger"){NB.fill(f,"heat/hot");}
 else if(variant==="inverse"){NB.fill(f,"bg/inverse");}
 else{f.fills=[];}
 const tc=variant==="primary"||variant==="danger"?"text/on-accent":variant==="inverse"?"text/inverse":"text/secondary";
 f.appendChild(await NB.text(label,{s:z[1],w:600,c:tc}));
 if(blockW){f.resize(blockW,z[0]);f.primaryAxisSizingMode="FIXED";}
 return f;}
async function iconBtn(glyph,dim=40){const f=NB.auto(NB.frame("ib",dim,dim,{plain:true,r:999}),{dir:"HORIZONTAL",main:"CENTER",cross:"CENTER"});f.strokes=[NB.paint("border/strong")];f.strokeWeight=1;f.fills=[];f.appendChild(await NB.text(glyph,{s:15}));return f;}
async function toggle(on){const f=NB.frame("toggle",48,28,{r:999,plain:true});NB.fill(f,on?"bg/accent":"neutral/700");const d=NB.frame("d",22,22,{r:999,plain:true});NB.fill(d,on?"neutral/0":"neutral/300");d.y=3;d.x=on?23:3;f.appendChild(d);return f;}
async function slider(w,pct,l1,l2){const g=NB.auto(NB.frame("slider",null,null,{plain:true}),{gap:10});const tr=NB.frame("track",w,4,{plain:true,r:2});NB.fill(tr,"neutral/700");g.appendChild(tr);const fl=NB.frame("fill",Math.round(w*pct),4,{plain:true,r:2,bgTok:"bg/accent"});tr.appendChild(fl);fl.x=0;fl.y=0;const kn=NB.frame("knob",24,24,{plain:true,r:999,bgTok:"neutral/0"});kn.x=Math.round(w*pct)-12;kn.y=-10;kn.effects=[{type:"DROP_SHADOW",color:{r:0,g:0,b:0,a:.55},offset:{x:0,y:8},radius:24,spread:0,visible:true,blendMode:"NORMAL"}];tr.appendChild(kn);
 const lb=NB.auto(NB.frame("lbl",w,10,{plain:true}),{dir:"HORIZONTAL"});lb.primaryAxisAlignItems="SPACE_BETWEEN";lb.appendChild(await NB.text(l1.toUpperCase(),{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));lb.appendChild(await NB.text(l2.toUpperCase(),{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));g.appendChild(lb);return g;}
async function seg(active,w){const f=NB.auto(NB.frame("seg",null,null,{plain:true,r:999,bgTok:"bg/raised"}),{dir:"HORIZONTAL",p:3});f.primaryAxisSizingMode="AUTO";f.counterAxisSizingMode="AUTO";for(const it of["Map","List"]){const item=NB.auto(NB.frame(it,null,null,{plain:true,r:999}),{pt:8,pb:8,pl:18,pr:18,cross:"CENTER"});item.primaryAxisSizingMode="AUTO";item.counterAxisSizingMode="AUTO";if(it===active)NB.fill(item,"bg/inverse");item.appendChild(await NB.text(it,{s:13,w:600,c:it===active?"text/inverse":"text/tertiary"}));f.appendChild(item);}return f;}
async function statusBar(){const f=NB.auto(NB.frame("statusbar",390,52,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"MAX",pl:24,pr:24,pb:6});f.primaryAxisSizingMode="FIXED";f.appendChild(await NB.text("9:41",{f:"JetBrains Mono",w:500,s:13}));f.appendChild(await NB.text("●●● ▤",{f:"JetBrains Mono",w:500,s:11}));return f;}
async function topBar(label,title,rightGlyphs=["⌕"]){const f=NB.auto(NB.frame("topbar",390,null,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER",pl:20,pr:20,pt:12,pb:12});
 const l=NB.auto(NB.frame("l",null,null,{plain:true}),{gap:2});l.primaryAxisSizingMode="AUTO";if(label)l.appendChild(await NB.text(label.toUpperCase(),{s:11,w:600,ls:14,c:"text/tertiary"}));l.appendChild(await NB.text(title,{f:"Archivo",w:600,s:20,ls:-1}));f.appendChild(l);
 const r=NB.auto(NB.frame("r",null,null,{plain:true}),{dir:"HORIZONTAL",gap:8});r.primaryAxisSizingMode="AUTO";for(const g of rightGlyphs)r.appendChild(await iconBtn(g));f.appendChild(r);return f;}
async function tabbar(active){const items=[["◎","Map"],["◆","Plan"],["☰","Feed"],["♡","Saved"],["●","You"]];const f=NB.auto(NB.frame("tabbar",390,78,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER",pl:24,pr:24,pb:14});f.primaryAxisSizingMode="FIXED";f.counterAxisSizingMode="FIXED";f.fills=[{type:"SOLID",color:NB.H("#0A0A0C"),opacity:.86}];f.strokes=[NB.paint("border/subtle")];f.strokeWeight=1;
 for(const[g,label]of items){const on=label===active;const it=NB.auto(NB.frame(label,null,null,{plain:true}),{dir:"VERTICAL",gap:5,cross:"CENTER"});it.primaryAxisSizingMode="AUTO";it.counterAxisSizingMode="AUTO";it.appendChild(await NB.text(g,{s:17,c:on?"text/primary":"text/tertiary"}));it.appendChild(await NB.text(label.toUpperCase(),{s:10,w:600,ls:2,c:on?"text/primary":"text/tertiary"}));f.appendChild(it);}return f;}
async function safe(){const f=NB.auto(NB.frame("safe",390,34,{plain:true}),{cross:"CENTER",main:"CENTER"});f.primaryAxisSizingMode="FIXED";const hi=NB.frame("home-ind",134,5,{plain:true,r:3,bgTok:"neutral/500"});f.appendChild(hi);return f;}
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
async function sheet(children){const f=NB.auto(NB.frame("sheet",390,null),{gap:14,pt:12,pb:24,pl:20,pr:20});f.topLeftRadius=f.topRightRadius=32;f.strokes=[NB.paint("border/default")];f.strokeWeight=1;
 const gr=NB.frame("grabber",40,4,{r:2});NB.fill(gr,"neutral/600");f.appendChild(gr);gr.layoutPositioning="ABSOLUTE";gr.x=175;
 for(const c of children)f.appendChild(c);return f;}
async function main(){
 await NB.ensureVars();
 const pg=await NB.page("03 Mobile App");
 let y=100;const old=pg.children.filter(c=>c.name.startsWith("Flow ")||c.name.startsWith("screen"));old.forEach(c=>c.remove());
 let maxX=0;for(const ch of pg.children)maxX=Math.max(maxX,ch.y+ch.height);y=maxX+150;
 const flowHead=async(t,d)=>{const h=NB.auto(NB.frame("Flow "+t,760,10,{plain:true}),{gap:10});h.appendChild(await NB.text(t.toUpperCase(),{f:"Instrument Sans",w:600,s:11,ls:18,c:"text/accent"}));h.appendChild(await NB.text(t,{f:"Archivo",w:700,s:32,ls:-2}));h.appendChild(await NB.text(d,{s:15,c:"text/secondary",tw:680}));pg.appendChild(h);h.x=100;h.y=y;y+=h.height+40;};
 const cell=async(name,build)=>{const wrap=NB.auto(NB.frame("screen "+name,null,null,{plain:true}),{gap:10});wrap.clipsContent=false;wrap.appendChild(await NB.text(name.toUpperCase(),{f:"JetBrains Mono",w:400,s:11,c:"text/tertiary"}));
  const ph=NB.frame(name,390,844,{bg:"bg/canvas",r:44});ph.strokes=[NB.paint("border/default")];ph.strokeWeight=1;wrap.appendChild(ph);
  await build(ph);
  pg.appendChild(wrap);wrap.x=100;y+=934;wrap.y=y-934;return wrap;};
 const st=async ph=>{const s=await statusBar();ph.appendChild(s);s.x=0;s.y=0;};

 await flowHead("Flow A — Onboarding","The taste model is built here. Six screens, and the app is useless until they are done.");
 {await cell("A1 / Splash",async ph=>{await st(ph);NB.blob(ph,"heat/mine",-95,70,420);NB.blob(ph,"heat/hot",290,-40,300);NB.blob(ph,"heat/friends",135,440,340);
   const t=await NB.text("NEARBY",{f:"Archivo",w:900,s:64,ls:-3});ph.appendChild(t);t.x=(390-t.width)/2;t.y=380;
   const c=await NB.text("YOUR CITY · YOUR TASTE",{f:"JetBrains Mono",w:400,s:11,c:"text/secondary"});ph.appendChild(c);c.x=(390-c.width)/2;c.y=458;
   ph.appendChild(await safe());const sf=ph.children[ph.children.length-1];sf.y=810;});}
 {await cell("A2 / Value prop",async ph=>{await st(ph);NB.blob(ph,"heat/mine",-115,-65,400);NB.blob(ph,"heat/undiscovered",280,190,280);
   const col=NB.auto(NB.frame("col",342,10,{plain:true}),{gap:16});ph.appendChild(col);col.x=24;col.y=430;
   col.appendChild(await NB.text("Everyone else\nshows you the\nsame list.",{f:"Archivo",w:800,s:38,ls:-2.5,lh:1.06}));
   col.appendChild(await NB.text("Nearby learns what you actually like, then redraws the map around it.",{s:17,lh:1.5,c:"text/secondary",tw:330}));
   const dots=NB.auto(NB.frame("dots",90,3,{plain:true}),{dir:"HORIZONTAL",gap:6});dots.appendChild(NB.frame("a",26,3,{plain:true,r:2,bgTok:"bg/accent"}));dots.appendChild(NB.frame("b",26,3,{plain:true,r:2,bgTok:"neutral/700"}));dots.appendChild(NB.frame("c",26,3,{plain:true,r:2,bgTok:"neutral/700"}));col.appendChild(dots);
   col.appendChild(await btn("primary","Get started","LG",342));
   const alt=await NB.text("I already have an account",{s:13,c:"text/secondary"});ph.appendChild(alt);alt.x=(390-alt.width)/2;alt.y=770;
   ph.appendChild(await safe());const sf=ph.children[ph.children.length-1];sf.y=810;});}
 {await cell("A3 / Location permission",async ph=>{await st(ph);NB.blob(ph,"heat/friends",-36,55,360);
   const ring=NB.frame("ring",96,96,{r:999,plain:true});ring.strokes=[NB.paint("border/strong")];ring.strokeWeight=1;ph.appendChild(ring);ring.x=147;ring.y=210;
   const dot=NB.frame("dot",16,16,{r:999});NB.fill(dot,"heat/mine");dot.effects=[{type:"DROP_SHADOW",color:{...NB.H(NB.res("heat/mine")),a:.9},offset:{x:0,y:0},radius:26,spread:4,visible:true,blendMode:"NORMAL"}];ph.appendChild(dot);dot.x=187;dot.y=250;
   const col=NB.auto(NB.frame("col",342,10,{plain:true}),{gap:12,cross:"CENTER"});ph.appendChild(col);col.x=24;col.y=350;
   col.appendChild(await NB.text("Where are you?",{f:"Archivo",w:700,s:32,ls:-2}));
   col.appendChild(await NB.text("Nearby needs your location to build a map that means anything.",{s:15,lh:1.47,c:"text/secondary",tw:320}));
   col.appendChild(await NB.text("We never store your location history.",{s:13,c:"text/secondary"}));
   const sp=NB.frame("sp",1,24,{plain:true});sp.fills=[];col.appendChild(sp);
   col.appendChild(await btn("primary","Allow while using","LG",342));
   col.appendChild(await btn("ghost","Enter a city instead","MD",342));
   ph.appendChild(await safe());const sf=ph.children[ph.children.length-1];sf.y=810;});}
 {await cell("A4 / Interest picker",async ph=>{await st(ph);
   const head=NB.auto(NB.frame("head",350,10,{plain:true}),{gap:22});ph.appendChild(head);head.x=20;head.y=60;
   const pr=NB.frame("progress",350,3,{plain:true,r:2});NB.fill(pr,"neutral/800");pr.clipsContent=true;const pf=NB.frame("pf",140,3,{plain:true,bgTok:"bg/accent"});pr.appendChild(pf);pf.x=0;pf.y=0;head.appendChild(pr);
   head.appendChild(await NB.text("What pulls you out\nof the house?",{f:"Archivo",w:700,s:32,ls:-2,lh:1.12}));
   head.appendChild(await NB.text("Pick at least five. You can change these anytime.",{s:13,c:"text/secondary"}));
   const chips=NB.auto(NB.frame("chips",350,10,{plain:true}),{dir:"HORIZONTAL",wrap:true,gap:10});chips.resize(350,chips.height);chips.primaryAxisSizingMode="FIXED";chips.counterAxisSizingMode="AUTO";ph.appendChild(chips);chips.x=20;chips.y=250;
   const ints=[["Filter coffee",1],["Natural wine",0],["Ramen",0],["Live music",1],["Bookshops",0],["Late-night food",1],["Rooftops",0],["Ice cream",1],["Craft beer",0],["Street food",0],["Vinyl",0],["Brunch",0],["Cocktails",1],["Vegetarian",0],["Galleries",0],["Board games",0]];
   for(const[l,on]of ints)chips.appendChild(await chip(l,on===1));
   ph.appendChild(await btn("primary","Continue · 5 picked","LG",350)).x=20;ph.children[ph.children.length-1].y=730;
   ph.appendChild(await safe());const sf=ph.children[ph.children.length-1];sf.y=810;});}
 {await cell("A5 / Vibe calibration",async ph=>{await st(ph);
   const head=NB.auto(NB.frame("head",350,10,{plain:true}),{gap:22});ph.appendChild(head);head.x=20;head.y=60;
   const pr=NB.frame("progress",350,3,{plain:true,r:2});NB.fill(pr,"neutral/800");pr.clipsContent=true;const pf=NB.frame("pf",245,3,{plain:true,bgTok:"bg/accent"});pr.appendChild(pf);pf.x=0;pf.y=0;head.appendChild(pr);
   head.appendChild(await NB.text("Now the feel of it.",{f:"Archivo",w:700,s:32,ls:-2}));
   head.appendChild(await NB.text("This is what separates two people who both said “coffee”.",{s:13,c:"text/secondary",tw:330}));
   const col=NB.auto(NB.frame("sliders",350,10,{plain:true}),{gap:34});ph.appendChild(col);col.x=20;col.y=260;
   for(const[t,pct,a,b]of[["Room energy",.32,"Quiet","Lively"],["What you'll spend",.55,"Cheap","Splurge"],["Known or new",.74,"Reliable","Hidden"],["Who you go with",.40,"Solo","A crowd"]]){const g=NB.auto(NB.frame(t,null,null,{plain:true}),{gap:16});g.primaryAxisSizingMode="AUTO";g.appendChild(await NB.text(t,{s:15,w:600}));g.appendChild(await slider(350,pct,a,b));col.appendChild(g);}
   ph.appendChild(await btn("primary","Build my map","LG",350)).x=20;ph.children[ph.children.length-1].y=730;
   ph.appendChild(await safe());const sf=ph.children[ph.children.length-1];sf.y=810;});}
 {await cell("A6 / Building your map",async ph=>{await st(ph);
   const mp=mapBase(390,844,[["heat/mine",-78,85,300],["heat/hot",214,253,220],["heat/undiscovered",39,524,260]]);ph.appendChild(mp);mp.x=0;mp.y=0;
   const col=NB.auto(NB.frame("c",null,null,{plain:true}),{gap:10,cross:"CENTER"});ph.appendChild(col);
   col.appendChild(await NB.text("Reading the city",{f:"Archivo",w:700,s:24,ls:-1.5}));
   col.appendChild(await NB.text("MATCHING 1,284 PLACES",{f:"JetBrains Mono",w:400,s:11,c:"text/accent"}));
   const pr=NB.frame("progress",180,3,{plain:true,r:2});NB.fill(pr,"neutral/800");pr.clipsContent=true;const pf=NB.frame("pf",133,3,{plain:true,bgTok:"bg/accent"});pr.appendChild(pf);pf.x=0;pf.y=0;col.appendChild(pr);
   col.x=(390-col.width)/2;col.y=380;
   ph.appendChild(await safe());const sf=ph.children[ph.children.length-1];sf.y=810;});}

 await flowHead("Flow B — Discovery","The home map is the product. Everything else is a way back to it.");
 const homePins=async(mp)=>{await pinAt(mp,"heat/mine","Blue Tokai",null,.22,.30);await pinAt(mp,"heat/hot","Toit",null,.58,.22);await pinAt(mp,"heat/friends","Spirit Fwd",null,.74,.48);await pinAt(mp,"heat/undiscovered","Corner St.",null,.35,.62);await pinAt(mp,"heat/mine",null,null,.50,.44);};
 {await cell("B1 / Home — map",async ph=>{
   const mp=mapBase(390,650,[["heat/mine",-70,117,320],["heat/hot",187,39,230],["heat/friends",214,273,260],["heat/undiscovered",31,377,220]]);ph.appendChild(mp);mp.x=0;mp.y=0;await homePins(mp);
   const s=await statusBar();ph.appendChild(s);s.x=0;s.y=0;
   const tb=await topBar("Bengaluru · Indiranagar","Your map");ph.appendChild(tb);tb.x=0;tb.y=52;
   const lr=NB.auto(NB.frame("layers",390,10,{plain:true}),{dir:"HORIZONTAL",gap:8,pl:20});lr.primaryAxisSizingMode="FIXED";lr.clipsContent=false;ph.appendChild(lr);lr.y=130;
   lr.appendChild(await chip("My taste",true));lr.appendChild(await chip("Friends"));lr.appendChild(await chip("Trending"));lr.appendChild(await chip("New"));
   const sh=await sheet([
     (async()=>{const r=NB.auto(NB.frame("hdr",350,10,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER"});r.primaryAxisSizingMode="FIXED";r.appendChild(await NB.text("14 places in your taste",{f:"Archivo",w:600,s:20,ls:-1}));r.appendChild(await seg("Map"));return r;})(),
     await listRow("heat/mine","Blue Tokai","0.4 mi · filter coffee · ₹₹",94),
     await listRow("heat/friends","Toit Brewpub","1.1 mi · 4 friends went",83)
   ]);sh.y=844-sh.height-78;ph.appendChild(sh);
   const tbb=await tabbar("Map");ph.appendChild(tbb);tbb.x=0;tbb.y=844-78;});}
 {await cell("B2 / Home — list",async ph=>{await st(ph);
   const tb=await topBar("Bengaluru · Indiranagar","Your map");ph.appendChild(tb);tb.x=0;tb.y=52;
   const sr=NB.auto(NB.frame("sort",350,10,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER"});sr.primaryAxisSizingMode="FIXED";ph.appendChild(sr);sr.x=20;sr.y=132;
   sr.appendChild(await NB.text("SORTED BY MATCH",{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));sr.appendChild(await seg("List"));
   const cards=[["heat/mine","Your taste","Match","Blue Tokai","FILTER COFFEE · 0.4 MI · ₹₹","94"],["heat/friends","4 friends","Friend","Toit Brewpub","CRAFT BEER · 1.1 MI · ₹₹","83"],["heat/undiscovered","Never been","New","Corner Store","ICE CREAM · 0.7 MI · ₹","76"]];
   let cy=180;for(const[tok,bt,bk,title,meta,n]of cards){const card=NB.auto(NB.frame(title,350,null,{plain:true,r:16}),{});card.strokes=[NB.paint("border/subtle")];card.strokeWeight=1;
    const media=NB.frame("media",350,112,{clip:true});NB.fill(media,"bg/raised");media.appendChild(NB.blob(media,tok,-35,-50,200,28));
    const bd=await badge(bk,bt);bd.x=10;bd.y=10;media.appendChild(bd);
    const sc=await scoreN(+n);media.appendChild(sc);sc.x=350-sc.width-12;sc.y=112-sc.height-10;
    card.appendChild(media);
    const body=NB.auto(NB.frame("body",350,null,{plain:true}),{gap:4,p:13});body.primaryAxisSizingMode="FIXED";body.appendChild(await NB.text(title,{f:"Archivo",w:700,s:17}));body.appendChild(await NB.text(meta,{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));card.appendChild(body);
    ph.appendChild(card);card.x=20;card.y=cy;cy+=card.height+14;}
   const tbb=await tabbar("Map");ph.appendChild(tbb);tbb.x=0;tbb.y=844-78;});}
 {await cell("B3 / Layers sheet",async ph=>{
   const mp=mapBase(390,844,[["heat/mine",-70,152,320],["heat/friends",214,253,280]]);ph.appendChild(mp);mp.x=0;mp.y=0;await homePins(mp);
   const s=await statusBar();ph.appendChild(s);s.x=0;s.y=0;
   const tb=await topBar("Bengaluru","Your map");ph.appendChild(tb);tb.x=0;tb.y=52;
   const dim=NB.frame("dim",390,844,{plain:true});NB.fill(dim,"neutral/1000");dim.opacity=.55;ph.appendChild(dim);dim.x=0;dim.y=0;
   const sh=NB.auto(NB.frame("sheet",390,null),{gap:0,pt:12,pb:24,pl:20,pr:20});sh.topLeftRadius=sh.topRightRadius=32;sh.strokes=[NB.paint("border/default")];sh.strokeWeight=1;
   const gr=NB.frame("grabber",40,4,{r:2});NB.fill(gr,"neutral/600");sh.appendChild(gr);gr.layoutPositioning="ABSOLUTE";gr.x=175;
   const t1=await NB.text("Layers",{f:"Archivo",w:700,s:24,ls:-1.5});sh.appendChild(t1);sh.itemSpacing=4;
   sh.appendChild(await NB.text("What should the map be showing you?",{s:13,c:"text/secondary"}));
   const sp=NB.frame("sp",1,18,{plain:true});sp.fills=[];sh.appendChild(sp);
   for(const[tok,on,t,d]of[["heat/mine",true,"My taste","Places matching your graph"],["heat/friends",true,"Friends","Where your people go"],["heat/hot",false,"Trending now","Busy in the last 2 hours"],["heat/undiscovered",true,"Never been","In your taste, not yet visited"]]){
    const r=NB.auto(NB.frame(t,350,null,{plain:true}),{dir:"HORIZONTAL",gap:14,pt:13,pb:13,cross:"CENTER"});r.strokes=[NB.paint("border/subtle")];r.strokeWeight=1;
    const dot=NB.frame("dot",12,12,{r:999});NB.fill(dot,tok);dot.effects=[{type:"DROP_SHADOW",color:{...NB.H(NB.res(tok)),a:.8},offset:{x:0,y:0},radius:14,spread:2,visible:true,blendMode:"NORMAL"}];r.appendChild(dot);
    const mc=NB.auto(NB.frame("m",null,null,{plain:true}),{gap:2});mc.primaryAxisSizingMode="AUTO";mc.layoutGrow=1;mc.appendChild(await NB.text(t,{s:14,w:600}));mc.appendChild(await NB.text(d,{s:11,c:"text/secondary"}));r.appendChild(mc);
    r.appendChild(await toggle(on));sh.appendChild(r);}
   sh.itemSpacing=0;const sp2=NB.frame("sp",1,20,{plain:true});sp2.fills=[];sh.appendChild(sp2);
   sh.appendChild(await btn("primary","Apply","MD",350));
   ph.appendChild(sh);sh.y=844-sh.height;});}
 {await cell("B4 / Place detail",async ph=>{
   const hero=NB.frame("hero",390,290,{clip:true});hero.appendChild(NB.blob(hero,"heat/mine",-98,-130,400));hero.appendChild(NB.blob(hero,"heat/hot",270,58,200,28));ph.appendChild(hero);hero.x=0;hero.y=0;
   const s=await statusBar();ph.appendChild(s);s.x=0;s.y=0;
   const tb=NB.auto(NB.frame("topbar",390,null,{plain:true}),{dir:"HORIZONTAL",main:"SPACE_BETWEEN",cross:"CENTER",pl:20,pr:20,pt:12,pb:12});ph.appendChild(tb);tb.x=0;tb.y=52;
   tb.appendChild(await iconBtn("←"));
   const rr=NB.auto(NB.frame("r",null,null,{plain:true}),{dir:"HORIZONTAL",gap:8});rr.primaryAxisSizingMode="AUTO";rr.appendChild(await iconBtn("♡"));rr.appendChild(await iconBtn("↗"));tb.appendChild(rr);
   const hb=NB.auto(NB.frame("heroinfo",350,null,{plain:true}),{gap:8});ph.appendChild(hb);hb.x=20;hb.y=196;
   const brow=NB.auto(NB.frame("br",null,null,{plain:true}),{});brow.appendChild(await badge("Match","94% match"));hb.appendChild(brow);
   hb.appendChild(await NB.text("Blue Tokai",{f:"Archivo",w:800,s:34,ls:-2.5}));
   hb.appendChild(await NB.text("FILTER COFFEE · 0.4 MI · 8 MIN WALK",{f:"JetBrains Mono",w:400,s:11,c:"text/secondary"}));
   let cy=306;
   const chips=NB.auto(NB.frame("tags",350,10,{plain:true}),{dir:"HORIZONTAL",gap:8});ph.appendChild(chips);chips.x=20;chips.y=cy;
   chips.appendChild(await chip("● Quiet till 6",false,true));chips.appendChild(await chip("Laptops ok"));chips.appendChild(await chip("₹₹"));
   cy+=50;
   const desc=await NB.text("Single origin, no espresso after 11. The back room is the quiet one — most people miss it.",{s:15,lh:1.47,c:"text/secondary",tw:350});ph.appendChild(desc);desc.x=20;desc.y=cy;cy+=desc.height+22;
   const why=NB.auto(NB.frame("why",350,null,{plain:true}),{gap:12});ph.appendChild(why);why.x=20;why.y=cy;
   why.appendChild(await NB.text("WHY THIS IS ON YOUR MAP",{s:11,w:600,ls:14,c:"text/tertiary"}));
   const box=NB.auto(NB.frame("box",350,null),{gap:2,p:16});NB.fill(box,"bg/surface");box.cornerRadius=12;
   box.appendChild(await NB.text("● Matches filter coffee and quiet rooms\n● You saved two places like this in Koramangala\n● Under your usual spend",{s:13,c:"text/secondary",lh:1.9}));why.appendChild(box);
   cy+=why.height+22;
   const ppl=NB.auto(NB.frame("ppl",350,10,{plain:true}),{dir:"HORIZONTAL",gap:12,cross:"CENTER"});ph.appendChild(ppl);ppl.x=20;ppl.y=cy;
   ppl.appendChild(await NB.text("PEOPLE YOU FOLLOW",{s:11,w:600,ls:14,c:"text/tertiary"}));
   const stack=NB.auto(NB.frame("stack",null,44,{plain:true}),{dir:"HORIZONTAL"});stack.primaryAxisSizingMode="AUTO";
   const avs=[["RK","heat/mine"],["AM","heat/friends"],["JS","heat/undiscovered"]];
   for(let i=0;i<avs.length;i++){const[ini,tok]=avs[i];const a=NB.frame("av",44,44,{r:999});NB.fill(a,tok);const t=await NB.text(ini,{f:"Archivo",w:700,s:15,c:tok==="heat/undiscovered"?"neutral/1000":"text/on-accent"});a.appendChild(t);t.x=(44-t.width)/2;t.y=(44-t.height)/2;stack.appendChild(a);a.layoutPositioning="ABSOLUTE";a.x=i*34;a.y=0;a.strokes=[NB.paint("bg/canvas")];a.strokeWeight=2;a.strokeAlign="OUTSIDE";}
   ppl.appendChild(stack);
   const bar=NB.auto(NB.frame("cta",390,null,{plain:true}),{dir:"HORIZONTAL",gap:10,pt:14,pb:14,pl:20,pr:20});bar.strokes=[NB.paint("border/subtle")];bar.strokeWeight=1;ph.appendChild(bar);bar.x=0;bar.y=844-76;
   bar.appendChild(await btn("secondary","Add to plan")).children;bar.children[bar.children.length-1].layoutGrow=1;
   bar.appendChild(await btn("primary","Directions")).children;bar.children[bar.children.length-1].layoutGrow=1.4;
   ph.appendChild(await safe());const sf=ph.children[ph.children.length-1];sf.y=810;});}
 {await cell("B5 / Collection detail",async ph=>{await st(ph);
   const art=NB.frame("art",350,150,{clip:true,r:16});NB.fill(art,"bg/raised");
   NB.blob(art,"heat/undiscovered",-70,-90,300);NB.blob(art,"heat/mine",240,110,180,28);
   const ti=NB.auto(NB.frame("t",null,null,{plain:true}),{gap:4});art.appendChild(ti);ti.x=16;ti.y=88;
   ti.appendChild(await NB.text("Cold things, late",{f:"Archivo",w:700,s:24,ls:-1.5}));
   ti.appendChild(await NB.text("9 PLACES · OPEN AFTER 10PM",{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));
   ph.appendChild(art);art.x=20;art.y=60;
   let cy=230;
   for(const[tok,t,m,n]of[["heat/undiscovered","Corner Store","0.7 mi · ice cream · ₹",88],["heat/mine","Naturals","1.4 mi · open till 12",81],["heat/undiscovered","Ibaco","2.1 mi · never been",74],["heat/friends","Milk & Honey","0.9 mi · 2 friends",69]]){ph.appendChild(await listRow(tok,t,m,n));ph.children[ph.children.length-1].y=cy;cy+=81;}
   const tbb=await tabbar("Saved");ph.appendChild(tbb);tbb.x=0;tbb.y=844-78;});}
 {await cell("B6 / Search",async ph=>{await st(ph);
   const si=NB.auto(NB.frame("search",350,48,{plain:true,r:999}),{dir:"HORIZONTAL",cross:"CENTER",pl:44,pr:16});NB.fill(si,"bg/surface");si.strokes=[NB.paint("border/subtle")];si.strokeWeight=1;ph.appendChild(si);si.x=20;si.y=60;
   const ic=await NB.text("⌕",{s:16,c:"text/tertiary"});si.appendChild(ic);ic.layoutPositioning="ABSOLUTE";ic.x=16;ic.y=14;
   si.appendChild(await NB.text("quiet coffee",{s:15}));
   let cy=124;
   ph.appendChild(await NB.text("TRY A VIBE, NOT A CATEGORY",{s:11,w:600,ls:14,c:"text/tertiary"})).x=20;ph.children[ph.children.length-1].y=cy;cy+=26;
   const vc=NB.auto(NB.frame("vibes",350,10,{plain:true}),{dir:"HORIZONTAL",wrap:true,gap:8});vc.primaryAxisSizingMode="FIXED";ph.appendChild(vc);vc.x=20;vc.y=cy;
   for(const v of["somewhere to read","no music","open past midnight","first date"])vc.appendChild(await chip(v));
   cy+=96;
   ph.appendChild(await NB.text("PLACES",{s:11,w:600,ls:14,c:"text/tertiary"})).x=20;ph.children[ph.children.length-1].y=cy;cy+=16;
   ph.appendChild(await listRow("heat/mine","Blue Tokai","0.4 mi · quiet till 6",94)).x=20;ph.children[ph.children.length-1].y=cy;cy+=81;
   ph.appendChild(await listRow("heat/hot","Third Wave","0.3 mi · busy now",91)).x=20;ph.children[ph.children.length-1].y=cy;cy+=86;
   ph.appendChild(await NB.text("PEOPLE",{s:11,w:600,ls:14,c:"text/tertiary"})).x=20;ph.children[ph.children.length-1].y=cy;cy+=22;
   const pr=NB.auto(NB.frame("person",350,null,{plain:true}),{dir:"HORIZONTAL",gap:12,pt:12,cross:"CENTER"});ph.appendChild(pr);pr.x=20;pr.y=cy;
   const a=NB.frame("av",44,44,{r:999});NB.fill(a,"heat/friends");const t=await NB.text("RK",{f:"Archivo",w:700,s:15});a.appendChild(t);t.x=(44-t.width)/2;t.y=(44-t.height)/2;pr.appendChild(a);
   const mc=NB.auto(NB.frame("m",null,null,{plain:true}),{gap:2});mc.primaryAxisSizingMode="AUTO";mc.layoutGrow=1;mc.appendChild(await NB.text("Rhea Kapoor",{s:14,w:600}));mc.appendChild(await NB.text("72% TASTE OVERLAP",{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"}));pr.appendChild(mc);
   pr.appendChild(await btn("secondary","Follow","SM"));
   const tbb=await tabbar("Map");ph.appendChild(tbb);tbb.x=0;tbb.y=844-78;});}
 figma.viewport.scrollAndZoomIntoView(pg.children);
 figma.notify("Run E done — Flows A & B (12 screens).");
}
main().catch(e=>{console.error(e);figma.notify("Run E error: "+String(e&&e.message||e));});
