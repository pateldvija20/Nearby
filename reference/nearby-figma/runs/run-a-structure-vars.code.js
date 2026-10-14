const NB={H:h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255})};
NB.PRIM={"magenta/300":"#FF8FC6","magenta/400":"#FF57A8","magenta/500":"#FF1E8C","magenta/600":"#D6006B","magenta/700":"#A30050","red/400":"#FF5C5C","red/500":"#FF2020","red/600":"#D40000","blue/300":"#8FB4FF","blue/400":"#5590FF","blue/500":"#0F5FF5","blue/600":"#0040C2","sky/100":"#EAF7FE","sky/200":"#D2EFFC","sky/300":"#BFE9FB","sky/400":"#8FD5F5","neutral/0":"#FFFFFF","neutral/50":"#F7F7F8","neutral/100":"#EDEDEF","neutral/200":"#D6D6DA","neutral/300":"#ABABB3","neutral/400":"#7C7C85","neutral/500":"#55555D","neutral/600":"#38383E","neutral/700":"#26262A","neutral/800":"#17171A","neutral/900":"#0D0D0F","neutral/1000":"#000000","green/500":"#16C47F","amber/500":"#FFB020"};
NB.ALIAS={"bg/canvas":"neutral/1000","bg/surface":"neutral/900","bg/raised":"neutral/800","bg/sunken":"neutral/1000","bg/inverse":"neutral/0","bg/accent":"magenta/500","bg/accent-soft":"magenta/700","text/primary":"neutral/0","text/secondary":"neutral/300","text/tertiary":"neutral/400","text/inverse":"neutral/1000","text/accent":"magenta/400","text/on-accent":"neutral/0","border/subtle":"neutral/800","border/default":"neutral/700","border/strong":"neutral/600","border/accent":"magenta/500","heat/mine":"magenta/500","heat/friends":"blue/500","heat/hot":"red/500","heat/undiscovered":"sky/300","status/success":"green/500","status/warning":"amber/500","status/danger":"red/500"};
NB.NUM={"sp/2":2,"sp/4":4,"sp/8":8,"sp/12":12,"sp/16":16,"sp/20":20,"sp/24":24,"sp/32":32,"sp/40":40,"sp/48":48,"sp/64":64,"sp/80":80,"r/xs":4,"r/sm":8,"r/md":12,"r/lg":16,"r/xl":24,"r/2xl":32};
NB.STY={"Archivo":{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold",800:"ExtraBold",900:"Black"},"Instrument Sans":{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"},"JetBrains Mono":{400:"Regular",500:"Medium",700:"Bold"}};
NB._fc={};
NB.font=async(fam,w)=>{const tries=[[fam,(NB.STY[fam]||{})[w]||"Regular"],["Archivo",(NB.STY["Archivo"]||{})[w]],["Instrument Sans",{400:"Regular",500:"Medium",600:"SemiBold",700:"Bold",800:"ExtraBold",900:"Black"}[w]||"Regular"]];for(const[fa,st]of tries){if(!st)continue;for(const s of new Set([st,st.replace(" SemiBold"," Semi Bold").replace("SemiBold","Semi Bold").replace("ExtraBold","Extra Bold")])){const k=fa+"/"+s;if(NB._fc[k])return{family:fa,style:s};try{await figma.loadFontAsync({family:fa,style:s});NB._fc[k]=1;return{family:fa,style:s};}catch(e){}}}return{family:"Inter",style:"Regular"};};
NB.res=n=>NB.ALIAS[n]?NB.PRIM[NB.ALIAS[n]]:(NB.PRIM[n]||"#000000");
NB.ensureVars=async()=>{if(NB.V)return;NB.V={};let pc=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==="Primitives");if(!pc)pc=figma.variables.createVariableCollection("Primitives");let sc=(await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==="Semantic");if(!sc)sc=figma.variables.createVariableCollection("Semantic");const find=async(c,n)=>{for(const i of c.variableIds){const v=await figma.variables.getVariableByIdAsync(i);if(v&&v.name===n)return v;}return null;};for(const[p,h]of Object.entries(NB.PRIM)){let v=await find(pc,p);if(!v)v=figma.variables.createVariable(p,pc,"COLOR");v.setValueForMode(pc.modes[0].modeId,NB.H(h));NB.V[p]=v;}for(const[n,a]of Object.entries(NB.ALIAS)){const full="color/"+n;let v=await find(sc,full);if(!v)v=figma.variables.createVariable(full,sc,"COLOR");v.setValueForMode(sc.modes[0].modeId,{type:"VARIABLE_ALIAS",id:NB.V[a].id});NB.V[full]=v;NB.V[n]=v;}for(const[n,num]of Object.entries(NB.NUM)){let v=await find(sc,n);if(!v)v=figma.variables.createVariable(n,sc,"FLOAT");v.setValueForMode(sc.modes[0].modeId,num);NB.V[n]=v;}};
NB.paint=n=>{const v=NB.V&&NB.V[n];const p={type:"SOLID",color:NB.H(NB.res(n))};if(v)p.boundVariables={color:{type:"VARIABLE_ALIAS",id:v.id}};return p;};
NB.fill=(nd,n)=>{nd.fills=[NB.paint(n)];};
NB.stroke=(nd,n,w=1)=>{nd.strokes=[NB.paint(n)];nd.strokeWeight=w;};
NB.glow=h=>({type:"DROP_SHADOW",color:{...NB.H(h),a:.45},offset:{x:0,y:0},radius:32,spread:0,visible:true,blendMode:"NORMAL"});
NB.sh=(al,y,b)=>({type:"DROP_SHADOW",color:{r:0,g:0,b:0,a:al},offset:{x:0,y},radius:b,spread:0,visible:true,blendMode:"NORMAL"});
NB.text=async(ch,o={})=>{const t=figma.createText();t.fontName=await NB.font(o.f||"Instrument Sans",o.w||400);t.characters=ch;t.fontSize=o.s||15;if(o.ls!==undefined)t.letterSpacing={unit:"PERCENT",value:o.ls};if(o.lh)t.lineHeight={unit:"PIXELS",value:Math.round((o.s||15)*o.lh)};t.fills=[NB.paint(o.c||"text/primary")];if(o.align)t.textAlignHorizontal=o.align;if(o.tw){t.textAutoResize="HEIGHT";t.resize(o.tw,t.height);}return t;};
NB.frame=(name,w,h,o={})=>{const f=figma.createFrame();f.name=name;f.resize(w,h);f.clipsContent=o.clip!==false;f.fills=o.bg?[NB.paint(o.bg)]:[];if(o.r!==undefined)f.cornerRadius=o.r;return f;};
NB.auto=(f,o={})=>{f.layoutMode=o.dir||"VERTICAL";f.itemSpacing=o.gap??0;f.paddingTop=o.pt??0;f.paddingBottom=o.pb??0;f.paddingLeft=o.pl??0;f.paddingRight=o.pr??0;if(o.main)f.primaryAxisAlignItems=o.main;if(o.cross)f.counterAxisAlignItems=o.cross;if(o.wrap)f.layoutWrap="WRAP";if(o.w!==undefined){f.resize(o.w,f.height);f.primaryAxisSizingMode="FIXED";}else f.primaryAxisSizingMode="AUTO";if(o.h!==undefined){f.resize(f.width,o.h);f.counterAxisSizingMode="FIXED";}else f.counterAxisSizingMode="AUTO";return f;};
NB.blob=(p,tok,x,y,s,blur=60,op=.85)=>{const e=figma.createEllipse();e.resize(s,s);p.appendChild(e);e.x=x;e.y=y;const c=NB.H(NB.res(tok));e.fills=[{type:"GRADIENT_RADIAL",gradientStops:[{position:0,color:{...c,a:op}},{position:.72,color:{...c,a:0}}],gradientTransform:[[1,0,0],[0,1,0]]}];e.effects=[{type:"LAYER_BLUR",radius:blur,visible:true}];return e;};
NB.page=async n=>{let p=figma.root.children.find(c=>c.name===n);if(!p){p=figma.createPage();p.name=n;}if(p.loadAsync){try{await p.loadAsync();}catch(e){}}return p;};
NB.TS={};
NB.ensureStyles=async()=>{const defs=[["NEARBY / Display XL","Archivo",900,56,-3,1.02],["NEARBY / Display","Archivo",800,40,-2.5,1.05],["NEARBY / H1","Archivo",700,32,-2,1.12],["NEARBY / H2","Archivo",700,24,-1.5,1.2],["NEARBY / H3","Archivo",600,20,-1,1.25],["NEARBY / Body LG","Instrument Sans",400,17,0,1.5],["NEARBY / Body","Instrument Sans",400,15,0,1.47],["NEARBY / Body SM","Instrument Sans",400,13,0,1.42],["NEARBY / Label","Instrument Sans",600,11,14,1.45],["NEARBY / Mono","JetBrains Mono",400,12,2,1.4],["NEARBY / Mono LG","JetBrains Mono",500,14,1,1.4],["NEARBY / Num","Archivo",900,26,-4,1]];for(const[n,f,w,s,ls,lh]of defs){let st=(await figma.getLocalTextStylesAsync()).find(t=>t.name===n);if(!st)st=figma.createTextStyle();st.name=n;st.fontName=await NB.font(f,w);st.fontSize=s;st.letterSpacing={unit:"PERCENT",value:ls};st.lineHeight={unit:"PIXELS",value:Math.round(s*lh)};NB.TS[n.split(" / ")[1]]=st;}};

async function main(){
  await NB.ensureVars();
  await NB.ensureStyles();
  const names=["00 Cover & Read Me","01 Foundations","02 Components","03 Mobile App","04 Web App","05 Exploration","06 Source Refs","99 Archive"];
  for(const n of names) await NB.page(n);
  figma.root.children.filter(c=>!names.includes(c.name)&&c.name!=="Components"&&c.name!=="Screens").forEach(()=>{});

  const cov=await NB.page("00 Cover & Read Me");
  const old=cov.findOne(n=>n.name==="NEARBY Cover Board");
  if(old)old.remove();
  const board=NB.frame("NEARBY Cover Board",980,1240,{bg:"bg/canvas",clip:false});
  cov.appendChild(board);board.x=100;board.y=100;

  const art=NB.frame("cover-art",852,360,{bg:"sky/300",r:16});
  art.x=0;art.y=0;board.appendChild(art);
  NB.blob(art,"heat/mine",-140,-120,760,44);
  NB.blob(art,"heat/hot",430,-90,620,34);
  NB.blob(art,"heat/friends",380,20,560,38);
  NB.blob(art,"heat/mine",480,180,420,46);

  const head=NB.auto(NB.frame("head",852,10),{gap:48,pt:56});
  board.appendChild(head);
  const hcol=NB.auto(NB.frame("title",340,10),{gap:10});
  hcol.appendChild(await NB.text("NEARBY",{f:"Archivo",w:900,s:56,ls:-3,lh:1.02}));
  hcol.appendChild(await NB.text("A map of the city drawn by what you actually like.",{s:17,c:"text/secondary",tw:340}));
  head.appendChild(hcol);
  const meta=NB.auto(NB.frame("meta",460,10),{gap:0});
  const rows=[["Status","Skeleton — v0.1"],["Product","Interest-mapped place discovery & itinerary generation"],["Platforms","iOS / Android / Web"],["Designer","Dvija Patel"],["Lineage","Shares a design lineage with INVT.RSVP; separate product"],["Type","Archivo · Instrument Sans · JetBrains Mono"],["Theme","Dark-first. Light mapping specified, not yet built."]];
  for(const[k,v]of rows){const r=NB.auto(NB.frame("row "+k,460,10),{dir:"HORIZONTAL",gap:24,pt:11,pb:11});const kl=await NB.text(k.toUpperCase(),{f:"JetBrains Mono",w:400,s:12,c:"text/secondary"});kl.textAutoResize="WIDTH_AND_HEIGHT";kl.resize(130,kl.height);r.appendChild(kl);r.appendChild(await NB.text(v,{s:15,tw:306}));meta.appendChild(r);}
  head.appendChild(meta);

  const idea=NB.auto(NB.frame("idea",852,10,{r:16}),{gap:12,pt:32,pb:32,pl:32,pr:32});
  idea.strokes=[NB.paint("border/default")];idea.strokeWeight=1;idea.fills=[];
  board.appendChild(idea);board.layoutMode="VERTICAL";
  NB.auto(board,{gap:56,pt:0,pb:0,pl:0,pr:0});
  idea.appendChild(await NB.text("THE IDEA IN ONE LINE",{f:"Instrument Sans",w:600,s:11,ls:14,c:"text/accent"}));
  idea.appendChild(await NB.text("Every other app shows you the same top-rated list. Nearby learns your taste, then redraws the map so the city looks different for every person on it.",{f:"Archivo",w:700,s:24,lh:1.3,tw:760}));

  const nav=NB.auto(NB.frame("navigate",852,10),{gap:20});
  board.appendChild(nav);
  nav.appendChild(await NB.text("HOW TO NAVIGATE THIS FILE",{f:"Instrument Sans",w:600,s:11,ls:14,c:"text/accent"}));
  const guide=[["00","Cover & Read Me","This page — orientation, status, conventions"],["01","Foundations","Brand concept, colour, type, space, radius, heat system"],["02","Components","Reusable building blocks with states and variants"],["03","Mobile App","All production mobile flows"],["04","Web App","Marketing, explore, planner, partner dashboard"],["05","Exploration","Alternate directions, parked ideas"],["06","Source Refs","PASTE INVT.RSVP SCREENS HERE — reference only"],["99","Archive","Deprecated screens, kept for provenance"]];
  for(const[num,n,d]of guide){const r=NB.auto(NB.frame("nav "+num,852,10),{dir:"HORIZONTAL",gap:24,pt:15,pb:15});r.strokes=[];r.appendChild(await NB.text(num,{f:"JetBrains Mono",w:400,s:12,c:"text/accent"}));const nm=await NB.text(n,{s:15,w:600});nm.textAutoResize="WIDTH_AND_HEIGHT";nm.resize(230,nm.height);r.appendChild(nm);r.appendChild(await NB.text(d,{s:13,c:"text/secondary",tw:520}));nav.appendChild(r);}
  figma.viewport.scrollAndZoomIntoView([board]);
  figma.notify("Run A done — pages, variables, text styles, cover.");
}
main().catch(e=>figma.notify("Run A error: "+e.message));
