const STAGES=[
{id:1,simple:"Aucune différenciation visible",tech:"Pseudothèces sans différenciation",date:"2026-02-10"},
{id:2,simple:"Les futures structures commencent à se former",tech:"Pseudothèce avec asques en voie de différenciation",date:"2026-02-18"},
{id:3,simple:"Les sacs contenant les spores sont formés",tech:"Pseudothèce avec asques différenciés",date:"2026-02-26"},
{id:4,simple:"Les spores sont visibles mais encore claires",tech:"Pseudothèce avec ascospores claires",date:"2026-03-03"},
{id:5,simple:"Début de coloration des spores",tech:"Pseudothèce avec 1 à 15 asques contenant des ascospores colorées",date:"2026-03-08"},
{id:6,simple:"Maturation bien engagée",tech:"Pseudothèce avec 16 à 50 asques contenant des ascospores colorées",date:"2026-03-11"},
{id:7,simple:"Spores prêtes à être projetées",tech:"Pseudothèce avec plus de 50 asques contenant des ascospores colorées",date:"2026-03-14"}];

const MONITORING={seasonClosed:true,closedOn:"2026-06-18"};
const DEMO=[
{id:1,episode:"Épisode 1",date_obs:"2026-03-14",heure_obs:"03:00",pluie_mm:4.8,spores:13,statut:"Validé",comptage_termine:true},
{id:2,episode:"Épisode 2",date_obs:"2026-03-23",heure_obs:"12:00",pluie_mm:9.7,spores:52,statut:"Validé",comptage_termine:true},
{id:3,episode:"Épisode 3",date_obs:"2026-04-05",heure_obs:"06:00",pluie_mm:7.6,spores:0,statut:"Pas de contamination",comptage_termine:true},
{id:4,episode:"Épisode 4",date_obs:"2026-04-18",heure_obs:"21:00",pluie_mm:13.5,spores:95,statut:"Validé",comptage_termine:true},
{id:5,episode:"Épisode 5",date_obs:"2026-05-02",heure_obs:"06:00",pluie_mm:3.4,spores:25,statut:"Validé",comptage_termine:true},
{id:6,episode:"Épisode 6",date_obs:"2026-05-21",heure_obs:"15:00",pluie_mm:10.7,spores:47,statut:"Validé",comptage_termine:true},
{id:7,episode:"Épisode 7",date_obs:"2026-06-10",heure_obs:"03:00",pluie_mm:5.5,spores:null,statut:"En cours",comptage_termine:false}
];

const fd=d=>new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR");
const fdt=(d,h)=>new Date(`${d}T${h||"00:00"}:00`).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
const fn=v=>new Intl.NumberFormat("fr-FR",{maximumFractionDigits:1}).format(v);

let sb=null,records=[],chart=null;

function configured(){
 const c=window.SAM_CONFIG||{};
 return c.supabaseUrl&&c.supabaseAnonKey&&!c.supabaseUrl.includes("VOTRE_")&&!c.supabaseAnonKey.includes("VOTRE_");
}

function biofix(){return STAGES.find(s=>s.id===7&&s.date)?.date||null;}

function renderStages(){
 stageTableBody.innerHTML=STAGES.map(s=>`<tr><td><strong>Stade ${s.id}</strong></td><td>${s.simple}</td><td>${s.tech}</td><td>${s.date?fd(s.date):"—"}</td></tr>`).join("");
}

function warn(t){
 supabaseConfigMessage.textContent=t;
 supabaseConfigMessage.classList.remove("hidden");
}

function clearWarn(){supabaseConfigMessage.classList.add("hidden");}

async function load(){
 if(!sb){records=[...DEMO];refresh();return;}
 const {data,error}=await sb.from(window.SAM_CONFIG.countsTable||"tavelure_comptages").select("*").order("date_obs").order("heure_obs");
 if(error){console.error(error);warn("Impossible de lire Supabase. Les données de démonstration sont affichées.");records=[...DEMO];}
 else{clearWarn();records=data||[];}
 refresh();
}

function filtered(){
 const j0=biofix(),start=startDateInput.value||j0||"",end=endDateInput.value||"";
 return records.filter(r=>(!j0||r.date_obs>=j0)&&(!start||r.date_obs>=start)&&(!end||r.date_obs<=end))
 .sort((a,b)=>`${a.date_obs}T${a.heure_obs||"00:00"}`.localeCompare(`${b.date_obs}T${b.heure_obs||"00:00"}`));
}

function episodes(src){
 const m=new Map();
 src.forEach(r=>{
  const k=r.episode||"Épisode sans nom";
  if(!m.has(k))m.set(k,{episode:k,date_obs:r.date_obs,heure_obs:r.heure_obs||"00:00",pluie_mm:0,spores:0,has:false,statuts:[],done:[]});
  const x=m.get(k);
  if(`${r.date_obs}T${r.heure_obs||"00:00"}`<`${x.date_obs}T${x.heure_obs}`){x.date_obs=r.date_obs;x.heure_obs=r.heure_obs||"00:00";}
  x.pluie_mm+=Number(r.pluie_mm)||0;
  if(r.spores!==null&&r.spores!==undefined&&r.spores!==""){x.spores+=Number(r.spores)||0;x.has=true;}
  x.statuts.push(r.statut);x.done.push(Boolean(r.comptage_termine));
 });
 return [...m.values()].map(x=>({...x,pluie_mm:+x.pluie_mm.toFixed(1),spores:x.has?x.spores:null,statut:x.statuts.includes("En cours")?"En cours":((x.spores||0)===0?"Pas de contamination":"Validé"),comptage_termine:x.done.every(Boolean)}))
 .sort((a,b)=>`${a.date_obs}T${a.heure_obs}`.localeCompare(`${b.date_obs}T${b.heure_obs}`));
}

function badge(s){
 if(s==="Validé")return '<span class="badge badge-valid">Validé</span>';
 if(s==="En cours")return '<span class="badge badge-pending">En cours</span>';
 return '<span class="badge badge-none">Pas de contamination</span>';
}
function done(v){return v?'<span class="badge badge-done">Terminé</span>':'<span class="badge badge-open">Non terminé</span>';}

function summary(){
 const j0=biofix(),ls=[...STAGES].filter(s=>s.date).sort((a,b)=>a.date.localeCompare(b.date)).at(-1);
 const lr=[...records].sort((a,b)=>`${a.date_obs}T${a.heure_obs||"00:00"}`.localeCompare(`${b.date_obs}T${b.heure_obs||"00:00"}`)).at(-1);
 biofixValue.textContent=j0?fd(j0):"Non défini";
 latestStageValue.textContent=ls?`Stade ${ls.id}`:"—";
 latestStageMeta.textContent=ls?`${ls.simple} — ${fd(ls.date)}`:"Aucune date renseignée";
 lastCountValue.textContent=lr?(lr.spores==null?"Comptage en cours":`${fn(lr.spores)} spores`):"—";
 lastCountMeta.textContent=lr?`${lr.episode} · ${fdt(lr.date_obs,lr.heure_obs)}`:"—";
 seasonStatusValue.textContent=MONITORING.seasonClosed?"Terminé":"En cours";
 seasonStatusMeta.textContent=MONITORING.seasonClosed?`Fin du suivi le ${fd(MONITORING.closedOn)}`:"Le suivi des projections est encore en cours";
}

function draw(){
 const j0=biofix();
 if(!j0){biofixWarning.classList.remove("hidden");if(chart)chart.destroy();return;}
 biofixWarning.classList.add("hidden");
 const e=episodes(filtered());
 if(chart)chart.destroy();
 chart=new Chart(sporeChart,{
  data:{labels:e.map(x=>`${x.episode} · ${fd(x.date_obs)}`),datasets:[
   {type:"bar",label:"Pluviométrie (mm)",data:e.map(x=>x.pluie_mm),backgroundColor:"rgba(43,121,194,.75)",borderColor:"#2b79c2",borderWidth:1,borderRadius:4,yAxisID:"yRain"},
   {type:"line",label:"Spores observées",data:e.map(x=>x.spores),borderColor:"#cf1e2e",backgroundColor:"#cf1e2e",tension:.25,pointRadius:4,spanGaps:false,yAxisID:"ySpores"}]},
  options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{usePointStyle:true,boxWidth:8,padding:18}},tooltip:{intersect:false,mode:"index"}},scales:{
   x:{grid:{display:false},ticks:{maxRotation:0,autoSkip:true,maxTicksLimit:12}},
   yRain:{beginAtZero:true,position:"left",title:{display:true,text:"Pluie (mm)"},grid:{color:"rgba(102,113,124,.13)"}},
   ySpores:{beginAtZero:true,position:"right",title:{display:true,text:"Nombre de spores"},grid:{drawOnChartArea:false}}
  }}
 });
}

function history(){
 const f=filtered();
 historyTableBody.innerHTML=f.length?f.map(r=>`<tr><td><strong>${r.episode}</strong></td><td>${fdt(r.date_obs,r.heure_obs)}</td><td>${fn(r.pluie_mm||0)} mm</td><td>${r.spores==null?"—":fn(r.spores)}</td><td>${badge(r.statut)}</td><td>${done(Boolean(r.comptage_termine))}</td></tr>`).join(""):'<tr><td colspan="6">Aucune donnée sur la période sélectionnée.</td></tr>';
}

function refresh(){summary();draw();history();}

function reset(){
 const j0=biofix(),last=[...records].sort((a,b)=>a.date_obs.localeCompare(b.date_obs)).at(-1)?.date_obs||"";
 startDateInput.value=j0||"";endDateInput.value=last;refresh();
}

function exportCsv(){
 const e=episodes(filtered());if(!e.length)return;
 const rows=[["episode","date","heure","pluie_mm","spores","statut","comptage_termine"],...e.map(x=>[x.episode,x.date_obs,x.heure_obs,String(x.pluie_mm).replace(".",","),x.spores??"",x.statut,x.comptage_termine?"oui":"non"])];
 const csv=rows.map(r=>r.map(c=>`"${String(c).replaceAll('"','""')}"`).join(";")).join("\n");
 const blob=new Blob(["\ufeff",csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="sam-tavelure-episodes.csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}

async function adminUi(){
 if(!sb){
  adminConnectionBadge.textContent="Supabase non configuré";
  loginBlock.classList.remove("hidden");entryBlock.classList.add("hidden");
  warn("Renseigne l'URL et la clé publique Supabase dans config.js pour activer la saisie administrateur.");
  return;
 }
 const {data}=await sb.auth.getSession(),u=data.session?.user||null;
 loginBlock.classList.toggle("hidden",Boolean(u));entryBlock.classList.toggle("hidden",!u);
 adminConnectionBadge.textContent=u?"Administrateur connecté":"Non connecté";
 adminConnectionBadge.classList.toggle("connected",Boolean(u));
}

async function login(ev){
 ev.preventDefault();if(!sb){warn("Supabase doit d'abord être configuré dans config.js.");return;}
 loginMessage.textContent="Connexion…";
 const {error}=await sb.auth.signInWithPassword({email:adminEmail.value.trim(),password:adminPassword.value});
 loginMessage.textContent=error?`Connexion impossible : ${error.message}`:"";
 await adminUi();
}

async function addEntry(ev){
 ev.preventDefault();if(!sb){warn("Supabase doit être configuré avant toute saisie.");return;}
 const s=entrySpores.value;
 const payload={episode:entryEpisode.value.trim(),date_obs:entryDate.value,heure_obs:entryTime.value,pluie_mm:Number(entryRain.value),spores:s===""?null:Number(s),statut:entryStatus.value,comptage_termine:entryDone.checked};
 entryMessage.textContent="Enregistrement…";
 const {error}=await sb.from(window.SAM_CONFIG.countsTable||"tavelure_comptages").insert(payload);
 if(error){entryMessage.textContent=`Enregistrement impossible : ${error.message}`;return;}
 entryMessage.textContent="Comptage enregistré.";manualEntryForm.reset();await load();
}

document.addEventListener("DOMContentLoaded",async()=>{
 renderStages();
 startDateInput.addEventListener("change",refresh);endDateInput.addEventListener("change",refresh);
 resetFiltersButton.addEventListener("click",reset);exportGraphButton.addEventListener("click",exportCsv);
 adminLoginForm.addEventListener("submit",login);manualEntryForm.addEventListener("submit",addEntry);
 logoutButton.addEventListener("click",async()=>{if(sb)await sb.auth.signOut();await adminUi();});
 if(configured()&&window.supabase){sb=window.supabase.createClient(window.SAM_CONFIG.supabaseUrl,window.SAM_CONFIG.supabaseAnonKey);sb.auth.onAuthStateChange(()=>adminUi());}
 await load();reset();await adminUi();
});
