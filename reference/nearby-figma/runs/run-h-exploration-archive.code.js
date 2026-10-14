const NB={H:h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255})};
NB.PRIM={"magenta/300":"#FF8FC6","magenta/400":"#FF57A8","magenta/500":"#FF1E8C","red/400":"#FF5C5C","red/500":"#FF2020","blue/300":"#8FB4FF","blue/500":"#0F5FF5","sky/300":"#BFE9FB","neutral/0":"#FFFFFF","neutral/300":"#ABABB3","neutral/400":"#7C7C85","neutral/600":"#38383E","neutral/700":"#26262A","neutral/800":"#17171A","amber":"#FFB020"};
NB.ALIAS={"bg/canvas":"neutral/1000","bg/surface":"neutral/900","bg/raised":"neutral/800","bg/accent":"magenta/500","text/primary":"neutral/0","text/secondary":"neutral/300","text/tertiary":"neutral/400","border/subtle":"neutral/800","border/default":"neutral/700","border/strong":"neutral/600","heat/mine":"magenta/500","heat/friends":"blue/500","heat/hot":"red/500","heat/undiscovered":"sky/300","status/success":"status/success","status/danger":"heat/hot","status/warning":"status/warning"};
NB.STY={"Archivo":{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold",800:"ExtraBold",900:"Black"},"Instrument Sans":{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"},"JetBrains Mono":{400:"Regular",500:"Medium",700:"Bold"}};
NB._fc={};
NB.page=async n=>{let p=figma.root.children.find(c=>c.name===n);if(!p){p=figma.createPage();p.name=n;}if(p.loadAsync){try{await p.loadAsync();}catch(e){}}return p;};

NB.font=async(fam,w)=>{const tries=[[fam,(NB.STY[fam]||{})[w]||"Regular"],["Archivo",(NB.STY["Archivo"]||{})[w]],["Instrument Sans",{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold",800:"ExtraBold",900:"Black"}[w]||"Regular"]];for(const[fa,st]of tries){if(!st)continue;for(const s of new Set([st,st.replace("SemiBold","Semi Bold").replace("ExtraBold","Extra Bold")])){const k=fa+"/"+s;if(NB._fc[k])return{family:fa,style:s};try{await figma.loadFontAsync({family:fa,style:s});NB._fc[k]=1;return{family:fa,style:s};}catch(e){}}}return{family:"Inter",style:"Regular"};};
NB.res=n=>{if(NB.PRIM[n])return NB.PRIM[n];if(n==="status/success")return"#16C47F";if(n==="status/warning")return"#FFB020";return NB.ALIAS[n]?NB.PRIM[NB.ALIAS[n]]:"#000000";};
NB.ensureVars=async()=>{if(NB.V)return;NB.V={};let pc=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==="Primitives");if(!pc)pc=figma.variables.createVariableCollection("Primitives");let sc=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==="Semantic");if(!sc)sc=figma.variables.createVariableCollection("Semantic");const find=async(c,n)=>{for(const i of c.variableIds){const v=await figma.variables.getVariableByIdAsync(i);if(v&&v.name===n)return v;}return null;};for(const[p,h]of Object.entries({"magenta/300":"#FF8FC6","magenta/400":"#FF57A8","magenta/500":"#FF1E8C","magenta/700":"#A30050","red/400":"#FF5C5C","red/500":"#FF2020","blue/300":"#8FB4FF","blue/400":"#5590FF","blue/500":"#0F5FF5","sky/300":"#BFE9FB","green/500":"#16C47F","amber/500":"#FFB020","neutral/0":"#FFFFFF","neutral/300":"#ABABB3","neutral/400":"#7C7C85","neutral/600":"#38383E","neutral/700":"#26262A","neutral/800":"#17171A","neutral/900":"#0D0D0F","neutral/1000":"#000000"})){let v=await find(pc,p);if(!v)v=figma.variables.createVariable(p,pc,"COLOR");v.setValueForMode(pc.modes[0].modeId,NB.H(h));NB.V[p]=v;}for(const[n,a]of Object.entries({"bg/canvas":"neutral/1000","bg/surface":"neutral/900","bg/raised":"neutral/800","bg/accent":"magenta/500","text/primary":"neutral/0","text/secondary":"neutral/300","text/tertiary":"neutral/400","text/on-accent":"neutral/0","border/subtle":"neutral/800","border/default":"neutral/700","border/strong":"neutral/600","heat/mine":"magenta/500","heat/friends":"blue/500","heat/hot":"red/500","heat/undiscovered":"sky/300","status/success":"green/500","status/warning":"amber/500","status/danger":"red/500"})){const full="color/"+n;let v=await find(sc,full);if(!v)v=figma.variables.createVariable(full,sc,"COLOR");v.setValueForMode(sc.modes[0].modeId,{type:"VARIABLE_ALIAS",id:NB.V[a].id});NB.V[full]=v;NB.V[n]=v;}};
NB.paint=n=>{const v=NB.V&&(NB.V[n]||NB.V["color/"+n]);const p={type:"SOLID",color:NB.H(NB.res(n))};if(v)p.boundVariables={color:{type:"VARIABLE_ALIAS",id:v.id}};return p;};
NB.text=async(ch,o={})=>{const t=figma.createText();t.fontName=await NB.font(o.f||"Instrument Sans",o.w||400);t.characters=ch;t.fontSize=o.s||15;if(o.ls!==undefined)t.letterSpacing={unit:"PERCENT",value:o.ls};if(o.lh)t.lineHeight={unit:"PIXELS",value:Math.round((o.s||15)*o.lh)};t.fills=[NB.paint(o.c||"text/primary")];if(o.op!==undefined)t.opacity=o.op;if(o.tw){t.textAutoResize="HEIGHT";t.resize(o.tw,t.height);}return t;};
NB.frame=(name,w,h,o={})=>{const f=figma.createFrame();f.name=name;if(w)f.resize(w,h);f.clipsContent=o.clip!==false;f.fills=o.bg?[NB.paint(o.bg)]:(o.plain?[]:[NB.paint("bg/canvas")]);if(o.r!==undefined)f.cornerRadius=o.r;if(o.stroke){f.strokes=[NB.paint(o.stroke)];f.strokeWeight=1;}if(o.dash)f.dashPattern=o.dash;return f;};
NB.auto=(f,o={})=>{f.layoutMode=o.dir||"VERTICAL";f.itemSpacing=o.gap??0;f.paddingTop=o.pt??0;f.paddingBottom=o.pb??0;f.paddingLeft=o.pl??0;f.paddingRight=o.pr??0;if(o.main)f.primaryAxisAlignItems=o.main;if(o.cross)f.counterAxisAlignItems=o.cross;if(o.w!==undefined){f.resize(o.w,f.height);f.primaryAxisSizingMode="FIXED";}else if(f.layoutMode!=="NONE")f.primaryAxisSizingMode="AUTO";if(o.h!==undefined){f.resize(f.width,o.h);f.counterAxisSizingMode="FIXED";}else if(f.layoutMode!=="NONE")f.counterAxisSizingMode="AUTO";return f;};
NB.blob=(p,tok,x,y,s,blur=60,op=.85)=>{const e=figma.createEllipse();e.resize(s,s);p.appendChild(e);if(p.layoutMode&&p.layoutMode!=='NONE')e.layoutPositioning='ABSOLUTE';e.x=x;e.y=y;const c=NB.H(NB.res(tok));e.fills=[{type:"GRADIENT_RADIAL",gradientStops:[{position:0,color:{...c,a:op}},{position:.72,color:{...c,a:0}}],gradientTransform:[[1,0,0],[0,1,0]]}];e.effects=[{type:"LAYER_BLUR",radius:blur,visible:true}];return e;};
function roads(f){for(const[yt,vert,pos]of[[.38,false,0],[.66,false,0],[0,true,.30],[0,true,.64]]){const r=NB.frame("road",vert?2:f.width,vert?f.height:2,{plain:true});NB.fill(r,"neutral/700");r.opacity=.35;r.x=vert?Math.round(f.width*pos)-1:0;r.y=vert?0:Math.round(f.height*yt)-1;f.appendChild(r);}}
async function scoreN(n){const sc=NB.auto(NB.frame("score",null,null,{plain:true}),{dir:"HORIZONTAL",gap:2});sc.appendChild(await NB.text(String(n),{f:"Archivo",w:900,s:26,ls:-4,c:"text/accent"}));sc.appendChild(await NB.text("%",{s:12,c:"text/accent",op:.7}));return sc;}
async function tile(section,status,statusTok,title,cap,builder){const t=NB.auto(NB.frame(section+" / "+title,330,null,{plain:true}),{gap:12});
 const box=NB.frame("box",330,220,{clip:true,r:16});box.strokes=[NB.paint("border/subtle")];box.strokeWeight=1;await builder(box);t.appendChild(box);
 const sr=NB.auto(NB.frame("status",null,10,{plain:true}),{dir:"HORIZONTAL",gap:8,cross:"CENTER"});
 const dot=NB.frame("dot",7,7,{plain:true,r:999});NB.fill(dot,statusTok);sr.appendChild(dot);
 sr.appendChild(await NB.text(status.toUpperCase(),{f:"JetBrains Mono",w:400,s:10,c:statusTok}));t.appendChild(sr);
 t.appendChild(await NB.text(title,{s:14,w:600}));
 t.appendChild(await NB.text(cap,{s:12,c:"text/secondary",tw:310}));return t;}
async function main(){
 await NB.ensureVars();
 let y=100;
 {const pg=await NB.page("05 Exploration");
  for(const ch of [...pg.children])ch.remove();
  const hdr=NB.auto(NB.frame("head",1120,10,{plain:true}),{gap:14});
  hdr.appendChild(await NB.text("05 — EXPLORATION",{f:"Instrument Sans",w:600,s:11,ls:18,c:"text/accent"}));
  hdr.appendChild(await NB.text("Exploration",{f:"Archivo",w:800,s:40,ls:-2.5}));
  hdr.appendChild(await NB.text("Directions that were tried, and why they did or didn't survive. Keeping the rejected ones is the point.",{s:17,c:"text/secondary",tw:720}));
  pg.appendChild(hdr);hdr.x=100;hdr.y=y;y+=hdr.height+70;
  const secHead=async(t,d)=>{const s=NB.auto(NB.frame("sec "+t,1120,10,{plain:true}),{gap:10});s.appendChild(await NB.text(t.toUpperCase(),{f:"Instrument Sans",w:600,s:11,ls:18,c:"text/accent"}));s.appendChild(await NB.text(d,{s:14,c:"text/secondary",tw:680}));pg.appendChild(s);s.x=100;s.y=y;y+=s.height+28;};
  const row=async tiles=>{const r=NB.auto(NB.frame("tiles",1062,10,{plain:true}),{dir:"HORIZONTAL",gap:36});for(const t of tiles)r.appendChild(await t());pg.appendChild(r);r.x=100;r.y=y;y+=r.height+80;};
  await secHead("Map treatment","The single biggest decision in the product.");
  await row([
   async()=>await tile("map","Kept","status/success","Blurred density field","Reads as feeling, not data points. Works at every zoom.",async b=>{const m=NB.frame("m",330,220,{plain:true});NB.fill(m,"bg/sunken");b.appendChild(m);m.x=0;m.y=0;roads(m);NB.blob(m,"heat/mine",-33,22,260);NB.blob(m,"heat/hot",152,70,200);NB.blob(m,"heat/undiscovered",33,128,220);}),
   async()=>await tile("map","Rejected","status/danger","Discrete pins only","Honest but flat — looked like every other map app.",async b=>{const m=NB.frame("m",330,220,{plain:true});NB.fill(m,"bg/sunken");roads(m);b.appendChild(m);m.x=0;m.y=0;
    const pts=[[.2,.30,"heat/mine"],[.44,.22,"heat/hot"],[.66,.46,"heat/friends"],[.32,.60,"heat/undiscovered"],[.54,.54,"heat/mine"],[.78,.34,"heat/mine"]];
    for(const[x,y,tok]of pts){const d=NB.frame("d",14,14,{plain:true,r:999});NB.fill(d,tok);m.appendChild(d);d.x=x*330-7;d.y=y*220-7;}}),
   async()=>await tile("map","Parked","status/warning","Hex-bin heat grid","Most legible for real density, but hard edges fight the brand.",async b=>{const m=NB.frame("m",330,220,{plain:true});NB.fill(m,"bg/sunken");roads(m);b.appendChild(m);m.x=0;m.y=0;
    const cells=[[10,20,"heat/mine",.8],[54,20,"heat/mine",.5],[98,20,"heat/hot",.7],[32,68,"heat/mine",.95],[76,68,"heat/mine",.6],[120,68,"heat/friends",.5],[54,116,"sky/300",.4],[98,116,"heat/friends",.7],[142,116,"heat/mine",.35]];
    for(const[x,y,tok,op]of cells){const v=figma.createVector();v.vectorPaths=[{windingRule:"NONZERO",data:`M ${x+11} ${y} L ${x+33} ${y} L ${x+44} ${y+19} L ${x+33} ${y+38} L ${x+11} ${y+38} L ${x} ${y+19} Z`}];v.fills=[{...NB.paint(tok),opacity:op}];v.strokes=[];m.appendChild(v);}})]);
  await secHead("Card anatomy","What sits in the media area determines whether this is a taste engine or a directory.");
  await row([
   async()=>await tile("card","Kept","status/success","Heat-field media","No photos means no stock-image problem and no venue gaming the feed.",async b=>{
    const c=NB.auto(NB.frame("card",280,null,{plain:true}),{});NB.fill(c,"bg/surface");c.strokes=[NB.paint("border/subtle")];c.strokeWeight=1;c.cornerRadius=16;c.x=25;c.y=42;b.appendChild(c);
    const m=NB.frame("media",280,100,{clip:true});NB.fill(m,"bg/raised");NB.blob(m,"heat/mine",-28,-50,200,28);c.appendChild(m);
    b.appendChild(await scoreN(94));}),
   async()=>await tile("card","Rejected","status/danger","Photo-led cards","Turns the product into a restaurant directory. The thing Nearby exists to break.",async b=>{
    const c=NB.auto(NB.frame("card",280,null,{plain:true}),{});NB.fill(c,"bg/surface");c.strokes=[NB.paint("border/subtle")];c.strokeWeight=1;c.cornerRadius=16;c.x=25;c.y=42;b.appendChild(c);
    const m=NB.auto(NB.frame("media",280,110,{plain:true}),{main:"CENTER",cross:"CENTER"});m.fills=[{type:"GRADIENT_LINEAR",gradientStops:[{position:0,color:{...NB.H("#38383E"),a:1}},{position:1,color:{...NB.H("#17171A"),a:1}}],gradientTransform:[[1,0,0],[0,1,0]]}];
    m.appendChild(await NB.text("PHOTO",{f:"JetBrains Mono",w:400,s:10,c:"text/tertiary"}));c.appendChild(m);
    const bd=NB.auto(NB.frame("body",280,null,{plain:true}),{gap:4,p:12});bd.primaryAxisSizingMode="FIXED";
    bd.appendChild(await NB.text("Blue Tokai",{s:15,w:600}));bd.appendChild(await NB.text("★★★★☆ 4.4 · 812 reviews",{s:11,c:"text/secondary"}));c.appendChild(bd);}),
   async()=>await tile("card","Parked","status/warning","Score as the whole card","Bold, but a number with no context reads as arbitrary.",async b=>{
    const c=NB.auto(NB.frame("card",280,null,{plain:true}),{main:"CENTER",cross:"CENTER",gap:6,p:22,clip:true});NB.fill(c,"bg/surface");c.strokes=[NB.paint("border/subtle")];c.strokeWeight=1;c.cornerRadius=16;c.x=25;c.y=42;b.appendChild(c);
    NB.blob(c,"heat/mine",10,-26,260,110,.6);
    c.appendChild(await NB.text("94",{f:"Archivo",w:900,s:56,ls:-4,c:"text/accent"}));
    c.appendChild(await NB.text("Blue Tokai",{f:"Archivo",w:700,s:17}));})]);
  await secHead("Wordmark","Three passes. The field lockup is marketing-only.");
  await row([
   async()=>await tile("wm","Kept","status/success","Archivo Black, tight","Reads at 20px in a nav bar and at 86px on a hero.",async b=>{const t=await NB.text("NEARBY",{f:"Archivo",w:900,s:46,ls:-3});b.appendChild(t);t.x=Math.max(0,(330-t.width)/2);t.y=(220-t.height)/2;}),
   async()=>await tile("wm","Kept","status/success","With the field behind","Marketing lockup only. Never inside product UI.",async b=>{NB.blob(b,"heat/mine",-24,-24,240);NB.blob(b,"heat/friends",180,150,200);const t=await NB.text("NEARBY",{f:"Archivo",w:900,s:46,ls:-3});b.appendChild(t);t.x=Math.max(0,(330-t.width)/2);t.y=(220-t.height)/2;}),
   async()=>await tile("wm","Rejected","status/danger","Lowercase, spaced","Too soft. Reads like a wellness app.",async b=>{const t=await NB.text("n e a r b y",{f:"Instrument Sans",w:400,s:34});b.appendChild(t);t.x=Math.max(0,(330-t.width)/2);t.y=(220-t.height)/2;})]);
  const open=NB.auto(NB.frame("still-open",1120,null,{plain:true}),{gap:10,p:26});open.dashPattern=[6,6];open.strokes=[NB.paint("border/strong")];open.strokeWeight=1;
  open.appendChild(await NB.text("STILL OPEN",{s:11,w:600,ls:14,c:"text/tertiary"}));
  open.appendChild(await NB.text("● Does the match score need to be a number at all, or is a heat colour enough?\n● What happens to the map in a city with no data yet?\n● How does someone correct the model when it is confidently wrong about them?\n● Is “62% never on a top-10 list” a real claim or marketing? Needs data before it ships.",{s:13,c:"text/secondary",lh:2}));
  pg.appendChild(open);open.x=100;open.y=y;}
 {const pg=await NB.page("06 Source Refs");
  for(const ch of [...pg.children])ch.remove();
  const hdr=NB.auto(NB.frame("head",1300,10,{plain:true}),{gap:14});
  hdr.appendChild(await NB.text("06 — SOURCE REFS",{f:"Instrument Sans",w:600,s:11,ls:18,c:"text/accent"}));
  hdr.appendChild(await NB.text("Source references",{f:"Archivo",w:800,s:40,ls:-2.5}));
  hdr.appendChild(await NB.text("Intentionally empty. Paste INVT.RSVP originals here so the lineage becomes real instead of assumed.",{s:17,c:"text/secondary",tw:720}));
  pg.appendChild(hdr);hdr.x=100;hdr.y=100;y=100+hdr.height+50;
  const warn=NB.auto(NB.frame("warning",1300,null,{plain:true}),{gap:10,p:26});warn.strokes=[NB.paint("status/warning")];warn.strokeWeight=1;
  warn.appendChild(await NB.text("READ THIS BEFORE USING THE FILE IN A PORTFOLIO",{s:11,w:600,ls:14,c:"status/warning"}));
  warn.appendChild(await NB.text("No user research was conducted for NEARBY. The flows are design hypotheses built from a product brief. Any persona, statistic or finding you add must come from real work — a reviewer will ask, and invented research is the fastest way to lose an interview.",{s:15,lh:1.8,c:"text/secondary",tw:820}));
  pg.appendChild(warn);warn.x=100;warn.y=y;y+=warn.height+52;
  const row=NB.auto(NB.frame("placeholders",1300,10,{plain:true}),{dir:"HORIZONTAL",gap:36});
  const labels=["INVT.RSVP / Onboarding","INVT.RSVP / Core screens","INVT.RSVP / Components","INVIT / Research board"];
  const caps=["The original onboarding, for comparing against Flow A.","Home, event detail, RSVP.","Existing components worth carrying over.","Findings, interviews, synthesis from the FigJam board."];
  for(let i=0;i<4;i++){const l=labels[i];
   const c=NB.auto(NB.frame(l,390,null,{plain:true}),{gap:10});
   c.appendChild(await NB.text(l.toUpperCase(),{f:"JetBrains Mono",w:400,s:11,c:"text/tertiary"}));
   const box=NB.auto(NB.frame("drop",390,520,{plain:true,r:16}),{main:"CENTER",cross:"CENTER",gap:18,p:30});box.dashPattern=[6,6];box.strokes=[NB.paint("border/strong")];box.strokeWeight=1;
   const ring=NB.frame("ring",44,44,{plain:true,r:999});ring.dashPattern=[4,4];ring.strokes=[NB.paint("border/strong")];ring.strokeWeight=1;box.appendChild(ring);
   box.appendChild(await NB.text("Paste here",{f:"Archivo",w:600,s:20,ls:-1}));
   box.appendChild(await NB.text(caps[i],{s:12,c:"text/secondary",tw:300}));
   c.appendChild(box);row.appendChild(c);}
  pg.appendChild(row);row.x=100;row.y=y;}
 {const pg=await NB.page("99 Archive");
  for(const ch of [...pg.children])ch.remove();
  const hdr=NB.auto(NB.frame("head",1100,10,{plain:true}),{gap:14});
  hdr.appendChild(await NB.text("99 — ARCHIVE",{f:"Instrument Sans",w:600,s:11,ls:18,c:"text/accent"}));
  hdr.appendChild(await NB.text("Archive",{f:"Archivo",w:800,s:40,ls:-2.5}));
  hdr.appendChild(await NB.text("Nothing is deprecated yet. When something is cut, it gets moved here rather than deleted — the reasoning is worth more than the screen.",{s:17,c:"text/secondary",tw:720}));
  pg.appendChild(hdr);hdr.x=100;hdr.y=100;
  const guide=NB.auto(NB.frame("guide",1100,null,{plain:true}),{gap:14,p:28});guide.strokes=[NB.paint("border/default")];guide.strokeWeight=1;
  guide.appendChild(await NB.text("WHEN YOU ARCHIVE SOMETHING, RECORD",{s:11,w:600,ls:14,c:"text/tertiary"}));
  guide.appendChild(await NB.text("WHAT — the screen or component name and where it lived\nWHEN — the date it was cut\nWHY — the actual reason, not “redesigned”\nWHAT REPLACED IT — a link to the successor",{s:15,lh:2.1,c:"text/secondary"}));
  pg.appendChild(guide);guide.x=100;guide.y=100+hdr.height+50;
  const empty=NB.auto(NB.frame("empty",1100,220,{plain:true}),{main:"CENTER",cross:"CENTER",gap:8});empty.dashPattern=[6,6];empty.strokes=[NB.paint("border/strong")];empty.strokeWeight=1;
  empty.appendChild(await NB.text("Empty",{f:"Archivo",w:600,s:20,ls:-1}));
  empty.appendChild(await NB.text("First archived item goes here.",{s:13,c:"text/secondary"}));
  pg.appendChild(empty);empty.x=100;empty.y=100+hdr.height+50+guide.height+40;}
 figma.notify("Run H done — Exploration, Source Refs, Archive.");
}
main().catch(e=>{console.error(e);figma.notify("Run H error: "+String(e&&e.message||e));});
