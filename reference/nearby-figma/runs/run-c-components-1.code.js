const NB={H:h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255})};
NB.PRIM={"magenta/300":"#FF8FC6","magenta/400":"#FF57A8","magenta/500":"#FF1E8C","magenta/600":"#D6006B","magenta/700":"#A30050","red/400":"#FF5C5C","red/500":"#FF2020","red/600":"#D40000","blue/300":"#8FB4FF","blue/400":"#5590FF","blue/500":"#0F5FF5","blue/600":"#0040C2","sky/300":"#BFE9FB","neutral/0":"#FFFFFF","neutral/300":"#ABABB3","neutral/400":"#7C7C85","neutral/500":"#55555D","neutral/700":"#26262A","neutral/800":"#17171A","neutral/900":"#0D0D0F","neutral/1000":"#000000","sky/400":"#8FD5F5"};
NB.ALIAS={"bg/canvas":"neutral/1000","bg/surface":"neutral/900","bg/raised":"neutral/800","bg/inverse":"neutral/0","bg/accent":"magenta/500","text/primary":"neutral/0","text/secondary":"neutral/300","text/tertiary":"neutral/400","text/on-accent":"neutral/0","border/subtle":"neutral/800","border/default":"neutral/700","border/strong":"neutral/600","border/accent":"magenta/500","heat/mine":"magenta/500","heat/friends":"blue/500","heat/hot":"red/500","heat/undiscovered":"sky/300","status/danger":"red/500"};
NB.STY={"Archivo":{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold",800:"ExtraBold",900:"Black"},"Instrument Sans":{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"},"JetBrains Mono":{400:"Regular",500:"Medium",700:"Bold"}};
NB._fc={};
NB.page=async n=>{let p=figma.root.children.find(c=>c.name===n);if(!p){p=figma.createPage();p.name=n;}if(p.loadAsync){try{await p.loadAsync();}catch(e){}}return p;};

NB.font=async(fam,w)=>{const tries=[[fam,(NB.STY[fam]||{})[w]||"Regular"],["Archivo",(NB.STY["Archivo"]||{})[w]],["Instrument Sans",{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold",800:"ExtraBold",900:"Black"}[w]||"Regular"]];for(const[fa,st]of tries){if(!st)continue;for(const s of new Set([st,st.replace("SemiBold","Semi Bold").replace("ExtraBold","Extra Bold")])){const k=fa+"/"+s;if(NB._fc[k])return{family:fa,style:s};try{await figma.loadFontAsync({family:fa,style:s});NB._fc[k]=1;return{family:fa,style:s};}catch(e){}}}return{family:"Inter",style:"Regular"};};
NB.res=n=>NB.ALIAS[n]?NB.PRIM[NB.ALIAS[n]]:(NB.PRIM[n]||"#000000");
NB.ensureVars=async()=>{if(NB.V)return;NB.V={};let pc=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==="Primitives");if(!pc)pc=figma.variables.createVariableCollection("Primitives");let sc=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==="Semantic");if(!sc)sc=figma.variables.createVariableCollection("Semantic");const find=async(c,n)=>{for(const i of c.variableIds){const v=await figma.variables.getVariableByIdAsync(i);if(v&&v.name===n)return v;}return null;};for(const[p,h]of Object.entries(NB.PRIM)){let v=await find(pc,p);if(!v)v=figma.variables.createVariable(p,pc,"COLOR");v.setValueForMode(pc.modes[0].modeId,NB.H(h));NB.V[p]=v;}for(const[n,a]of Object.entries(NB.ALIAS)){const full="color/"+n;let v=await find(sc,full);if(!v)v=figma.variables.createVariable(full,sc,"COLOR");v.setValueForMode(sc.modes[0].modeId,{type:"VARIABLE_ALIAS",id:NB.V[a].id});NB.V[full]=v;NB.V[n]=v;}};
NB.paint=n=>{const v=NB.V&&NB.V[n];const p={type:"SOLID",color:NB.H(NB.res(n))};if(v)p.boundVariables={color:{type:"VARIABLE_ALIAS",id:v.id}};return p;};
NB.glow=h=>({type:"DROP_SHADOW",color:{...NB.H(h),a:.45},offset:{x:0,y:0},radius:32,spread:0,visible:true,blendMode:"NORMAL"});
NB.text=async(ch,o={})=>{const t=figma.createText();t.fontName=await NB.font(o.f||"Instrument Sans",o.w||400);t.characters=ch;t.fontSize=o.s||15;if(o.ls!==undefined)t.letterSpacing={unit:"PERCENT",value:o.ls};if(o.lh)t.lineHeight={unit:"PIXELS",value:Math.round((o.s||15)*o.lh)};t.fills=[NB.paint(o.c||"text/primary")];return t;};
NB.frame=(name,w,h,o={})=>{const f=figma.createFrame();f.name=name;f.resize(w||100,h||100);f.clipsContent=false;f.fills=o.bg?[NB.paint(o.bg)]:[];if(o.r!==undefined)f.cornerRadius=o.r;if(o.stroke){f.strokes=[NB.paint(o.stroke)];f.strokeWeight=1;}if(o.op!==undefined)f.opacity=o.op;return f;};
NB.auto=(f,o={})=>{f.layoutMode=o.dir||"VERTICAL";f.itemSpacing=o.gap??0;f.paddingTop=o.pt??0;f.paddingBottom=o.pb??0;f.paddingLeft=o.pl??0;f.paddingRight=o.pr??0;if(o.main)f.primaryAxisAlignItems=o.main;if(o.cross)f.counterAxisAlignItems=o.cross;if(o.w!==undefined){f.resize(o.w,f.height);f.primaryAxisSizingMode="FIXED";}else if(f.layoutMode!=="NONE")f.primaryAxisSizingMode="AUTO";if(o.h!==undefined){f.resize(f.width,o.h);f.counterAxisSizingMode="FIXED";}else if(f.layoutMode!=="NONE")f.counterAxisSizingMode="AUTO";return f;};
async function btnVariant(type,size,state){const z=SIZES[size];const f=NB.auto(NB.frame("btn",10,z.h,{r:999}),{dir:"HORIZONTAL",gap:8,pl:z.px,pr:z.px,main:"CENTER"});
 f.primaryAxisSizingMode="AUTO";f.counterAxisSizingMode="FIXED";
 if(type==="Primary"){NB.fill(f,"bg/accent");f.effects=[NB.glow(NB.res("bg/accent"))];}
 else if(type==="Secondary"){f.fills=[];f.strokes=[NB.paint("border/strong")];f.strokeWeight=1;}
 else if(type==="Ghost"){f.fills=[];}
 else if(type==="Inverse"){NB.fill(f,"bg/inverse");}
 else{NB.fill(f,"status/danger");}
 const label=type==="Icon"?"●":state==="Disabled"?"Disabled":"Take me there";
 const tx=await NB.text(label,{s:z.fs,w:600,c:type==="Primary"||type==="Danger"?"text/on-accent":type==="Inverse"?"text/inverse":"text/secondary"});
 f.appendChild(tx);if(state==="Disabled")f.opacity=.35;
 await new Promise(r=>setTimeout(r,0));
 return f;}
const SIZES={SM:{h:36,px:16,fs:13},MD:{h:48,px:24,fs:15},LG:{h:56,px:32,fs:17}};
async function main(){
 await NB.ensureVars();
 const pg=await NB.page("02 Components");
 for(const ch of [...pg.children])ch.remove();
 let y=100;
 const cap=async t=>{const c=await NB.text(t.toUpperCase(),{f:"JetBrains Mono",w:500,s:11,c:"text/accent"});pg.appendChild(c);c.x=100;c.y=y;y+=26;};
 const put=async set=>{pg.appendChild(set);set.x=100;set.y=y;y+=set.height+70;};
 const step=async(name,fn)=>{try{await fn();}catch(e){console.error(name,e);figma.notify("Run C skipped "+name+": "+String(e&&e.message||e));}};
 await cap("02 — Components · every block binds to tokens");

 await step("buttons",async()=>{
  const nodes=[];for(const t of["Primary","Secondary","Ghost","Inverse","Danger"])for(const s of["SM","MD","LG"])for(const st of["Default","Disabled"]){const n=await btnVariant(t,s,st);n.name=`Type=${t}, Size=${s}, State=${st}`;nodes.push(n);}
  nodes.forEach(n=>pg.appendChild(n));
  const set=figma.combineAsVariants(nodes,pg);set.name="Button";set.layoutMode="HORIZONTAL";set.itemSpacing=14;set.paddingLeft=set.paddingRight=set.paddingTop=set.paddingBottom=20;set.primaryAxisSizingMode="AUTO";set.counterAxisSizingMode="AUTO";await put(set);});
 await step("icon buttons",async()=>{
  const nodes=[];for(const t of["Primary","Secondary","Ghost"])for(const st of["Default","Disabled"]){const n=await btnVariant(t,"MD",st);n.name=`Type=${t}, State=${st}`;nodes.push(n);}
  nodes.forEach(n=>pg.appendChild(n));
  const set=figma.combineAsVariants(nodes,pg);set.name="Icon Button";set.layoutMode="HORIZONTAL";set.itemSpacing=14;set.paddingTop=set.paddingBottom=set.paddingLeft=set.paddingRight=20;set.primaryAxisSizingMode="AUTO";set.counterAxisSizingMode="AUTO";await put(set);});
 async function chipVar(state,size){const lg=size==="LG";const f=NB.auto(NB.frame("chip",10,lg?44:34,{r:999}),{dir:"HORIZONTAL",gap:6,pl:lg?20:14,pr:lg?20:14,cross:"CENTER"});f.primaryAxisSizingMode="AUTO";f.counterAxisSizingMode="FIXED";let tc="text/secondary";
  if(state==="On"){NB.fill(f,"bg/accent");tc="text/on-accent";}
  else if(state==="Heat"){f.strokes=[NB.paint("border/accent")];f.strokeWeight=1;tc="text/accent";}
  else{f.strokes=[NB.paint("border/default")];f.strokeWeight=1;}
  const lbl=state==="On"?"Natural wine ✕":state==="Heat"?"● Trending":"Filter coffee";
  f.appendChild(await NB.text(lbl,{s:lg?15:13,w:500,c:tc}));return f;}
 await step("chips",async()=>{
  const nodes=[];for(const s of["MD","LG"])for(const st of["Off","On","Heat"]){const n=await chipVar(st,s);n.name=`Size=${s}, State=${st}`;nodes.push(n);}
  nodes.forEach(n=>pg.appendChild(n));
  const set=figma.combineAsVariants(nodes,pg);set.name="Chip";set.layoutMode="HORIZONTAL";set.itemSpacing=14;set.paddingTop=set.paddingBottom=set.paddingLeft=set.paddingRight=20;set.primaryAxisSizingMode="AUTO";set.counterAxisSizingMode="AUTO";await put(set);});
 async function badgeVar(kind){const map={Hot:["heat/hot","red/400","● BUSY NOW"],New:["heat/undiscovered","text/secondary","NEVER BEEN"],Friend:["heat/friends","blue/400","3 FRIENDS"],Match:["heat/mine","text/accent","94% MATCH"]};const[bg,fg,lbl]=map[kind];const f=NB.auto(NB.frame("badge",10,22,{r:4}),{dir:"HORIZONTAL",gap:5,pl:9,pr:9,cross:"CENTER"});f.primaryAxisSizingMode="AUTO";f.counterAxisSizingMode="FIXED";const base=NB.paint(bg);base.opacity=.16;f.fills=[base];f.appendChild(await NB.text(lbl,{f:"JetBrains Mono",w:500,s:10,ls:8,c:bg==="heat/undiscovered"?"text/secondary":fg}));return f;}
 await step("badges",async()=>{
  const nodes=[];for(const k of["Hot","New","Friend","Match"]){const n=await badgeVar(k);n.name=`Kind=${k}`;nodes.push(n);}
  nodes.forEach(n=>pg.appendChild(n));
  const set=figma.combineAsVariants(nodes,pg);set.name="Badge";set.layoutMode="HORIZONTAL";set.itemSpacing=14;set.paddingTop=set.paddingBottom=set.paddingLeft=set.paddingRight=20;set.primaryAxisSizingMode="AUTO";set.counterAxisSizingMode="AUTO";await put(set);});
 async function inputVar(state){const search=state==="Search";const h=search?48:52;const f=NB.auto(NB.frame("input",280,h),{dir:"HORIZONTAL",cross:"CENTER",pl:search?44:16,pr:16});f.cornerRadius=search?999:12;NB.fill(f,"bg/surface");f.strokes=[NB.paint(state==="Focus"?"border/accent":"border/subtle")];f.strokeWeight=1;
  const val=state==="Filled"?"Dvija Patel":state==="Focus"?"Dvija|":search?"Search places, vibes, people":"Your name";
  if(search){const ic=await NB.text("⌕",{s:16,c:"text/tertiary"});f.appendChild(ic);ic.layoutPositioning="ABSOLUTE";ic.x=16;ic.y=(h-19)/2;}
  f.appendChild(await NB.text(val,{s:15,c:(state==="Empty"||state==="Search")?"text/tertiary":"text/primary"}));return f;}
 await step("inputs",async()=>{
  const nodes=[];for(const s of["Empty","Filled","Focus","Search"]){const n=await inputVar(s);n.name=`State=${s}`;nodes.push(n);}
  nodes.forEach(n=>pg.appendChild(n));
  const set=figma.combineAsVariants(nodes,pg);set.name="Input";set.layoutMode="VERTICAL";set.itemSpacing=14;set.paddingTop=set.paddingBottom=set.paddingLeft=set.paddingRight=20;set.primaryAxisSizingMode="AUTO";set.counterAxisSizingMode="AUTO";await put(set);});
 async function textareaVar(kind){const f=NB.auto(NB.frame("textarea",340,120),{pt:16,pb:16,pl:16,pr:16});f.cornerRadius=16;NB.fill(f,"bg/surface");f.strokes=[NB.paint("border/subtle")];f.strokeWeight=1;f.appendChild(await NB.text(kind==="Prompt"?"Quiet dinner, then somewhere we can actually hear each other. Under 2000 for two.":"Placeholder text",{s:kind==="Prompt"?17:15,lh:1.5,c:kind==="Prompt"?"text/primary":"text/tertiary"}));return f;}
 await step("textarea",async()=>{
  const nodes=[];for(const k of["Placeholder","Prompt"]){const n=await textareaVar(k);n.name=`Kind=${k}`;nodes.push(n);}
  nodes.forEach(n=>pg.appendChild(n));
  const set=figma.combineAsVariants(nodes,pg);set.name="Textarea";set.layoutMode="HORIZONTAL";set.itemSpacing=14;set.paddingTop=set.paddingBottom=set.paddingLeft=set.paddingRight=20;set.primaryAxisSizingMode="AUTO";set.counterAxisSizingMode="AUTO";await put(set);});
 async function sliderVar(){const w=280;const g=NB.frame("slider",w,58,{plain:true});g.fills=[];
  const track=NB.frame("track",w,4,{bg:"neutral/700",r:2});track.y=18;g.appendChild(track);
  const fill=NB.frame("fill",Math.round(w*.68),4,{bg:"bg/accent",r:2});track.appendChild(fill);fill.x=0;fill.y=0;
  const knob=NB.frame("knob",24,24,{bg:"neutral/0",r:999});knob.x=Math.round(w*.68)-12;knob.y=-10;knob.effects=[{type:"DROP_SHADOW",color:{r:0,g:0,b:0,a:.55},offset:{x:0,y:8},radius:24,spread:0,visible:true,blendMode:"NORMAL"}];track.appendChild(knob);
  const l=await NB.text("QUIET",{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"});l.x=0;l.y=34;g.appendChild(l);
  const r2=await NB.text("LIVELY",{f:"JetBrains Mono",w:400,s:10,c:"text/secondary"});g.appendChild(r2);r2.x=w-r2.width;r2.y=34;
  return g;}
 await step("slider",async()=>{
  const n=await sliderVar();pg.appendChild(n);
  const set=figma.combineAsVariants([n],pg);set.name="Slider";set.paddingTop=set.paddingBottom=set.paddingLeft=set.paddingRight=20;await put(set);});
 async function toggleVar(on){const f=NB.frame("toggle",48,28,{r:999});NB.fill(f,on?"bg/accent":"neutral/700");const dot=NB.frame("dot",22,22,{r:999});NB.fill(dot,on?"neutral/0":"neutral/300");dot.y=3;dot.x=on?23:3;f.appendChild(dot);return f;}
 await step("toggle",async()=>{
  const nodes=[];for(const s of["Off","On"]){const n=await toggleVar(s==="On");n.name=`State=${s}`;nodes.push(n);}
  nodes.forEach(n=>pg.appendChild(n));
  const set=figma.combineAsVariants(nodes,pg);set.name="Toggle";set.layoutMode="HORIZONTAL";set.itemSpacing=14;set.paddingTop=set.paddingBottom=set.paddingLeft=set.paddingRight=20;set.primaryAxisSizingMode="AUTO";set.counterAxisSizingMode="AUTO";await put(set);});
 async function segVar(active){const f=NB.auto(NB.frame("seg",10,10,{bg:"bg/raised",r:999}),{dir:"HORIZONTAL",p:3});
  for(const it of["Map","List"]){const item=NB.auto(NB.frame(it,10,10,{r:999}),{pt:8,pb:8,pl:18,pr:18,cross:"CENTER"});if(it===active)NB.fill(item,"bg/inverse");item.appendChild(await NB.text(it,{s:13,w:600,c:it===active?"text/inverse":"text/tertiary"}));f.appendChild(item);}return f;}
 await step("segmented",async()=>{
  const nodes=[];for(const a of["Map","List"]){const n=await segVar(a);n.name=`Active=${a}`;nodes.push(n);}
  nodes.forEach(n=>pg.appendChild(n));
  const set=figma.combineAsVariants(nodes,pg);set.name="Segmented";set.layoutMode="HORIZONTAL";set.itemSpacing=14;set.paddingTop=set.paddingBottom=set.paddingLeft=set.paddingRight=20;set.primaryAxisSizingMode="AUTO";set.counterAxisSizingMode="AUTO";await put(set);});
 figma.viewport.scrollAndZoomIntoView(pg.children);
 figma.notify("Run C done — Buttons, Chips, Badges, Inputs, Controls.");
}
main().catch(e=>{console.error(e);figma.notify("Run C error: "+String(e&&e.message||e));});
