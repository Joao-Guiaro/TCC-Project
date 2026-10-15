<?php
session_start();
if (!isset($_SESSION["usuario_id"])) { header("Location: login.html"); exit; }
$nome = htmlspecialchars($_SESSION["usuario_nome"]);
?>
<!doctype html>
<html lang="pt-br" data-noloader>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Controle de scrap · Netuno</title>
<meta name="description" content="Painel de controle de scrap da Netuno.">
<meta name="theme-color" content="#0a2a52">
<link rel="icon" type="image/png" href="assets/img/Logo_Netuno.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&amp;display=swap">
<link rel="stylesheet" href="assets/css/netuno.css">
<script>(function(){var h=document.documentElement;h.classList.add("js");var mq=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches),rm=mq;try{var mp=localStorage.getItem("netuno:motion");if(mp)rm=mp==="reduced"}catch(e){}if(rm)h.classList.add("motion-reduced");try{var s=window.sessionStorage,t=+s.getItem("netuno:dive")||0;s.removeItem("netuno:dive");if(t&&Date.now()-t<8000&&!rm){h.classList.add("is-diving")}else if(!s.getItem("netuno:visited")&&!rm&&!h.hasAttribute("data-noloader")){h.classList.add("is-first")}}catch(e){}setTimeout(function(){if(!window.__netunoReady){h.classList.remove("is-first","is-diving")}},4000)})();</script>
</head>
<body data-page="dashboard" class="app">
<svg class="sprite" aria-hidden="true" focusable="false">
  <defs>
    <clipPath id="markClip"><circle cx="50" cy="50" r="41"/></clipPath>
  </defs>
  <symbol id="mark" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="6"/>
    <g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M50 76V17"/><path d="M43.5 27 50 16l6.5 11"/><path d="M33 21c-1 13 3 23 17 26 14-3 18-13 17-26"/><path d="M29.5 26 33 20l3.5 6"/><path d="M63.5 26 67 20l3.5 6"/>
    </g>
    <g fill="none" stroke="#3aafdb" stroke-width="5" stroke-linecap="round" clip-path="url(#markClip)">
      <path d="M6 62c16-9 30 5 45-3s27-10 45-5"/><path d="M6 71c16-9 31 5 46-3s27-10 44-5"/><path d="M8 80c16-8 30 5 45-3s26-9 41-6"/>
    </g>
  </symbol>
  <symbol id="i-arrow-right" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></symbol>
  <symbol id="i-arrow-left" viewBox="0 0 24 24"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></symbol>
  <symbol id="i-arrow-up" viewBox="0 0 24 24"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></symbol>
  <symbol id="i-arrow-up-right" viewBox="0 0 24 24"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h10"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></symbol>
  <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/></symbol>
  <symbol id="i-eye-off" viewBox="0 0 24 24"><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="m2 2 20 20"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>
  <symbol id="i-alert" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></symbol>
  <symbol id="i-logout" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></symbol>
  <symbol id="i-download" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5v14"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></symbol>
  <symbol id="i-lock" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></symbol>
  <symbol id="i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></symbol>
  <symbol id="i-bulb" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></symbol>
  <symbol id="i-message" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></symbol>
  <symbol id="i-package" viewBox="0 0 24 24"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></symbol>
  <symbol id="i-activity" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></symbol>
  <symbol id="i-zap" viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></symbol>
</svg>

<header class="app__bar">
  <a class="brand" href="index.html" aria-label="Netuno, voltar ao site"><svg class="brand__mark" aria-hidden="true"><use href="#mark"/></svg><span class="brand__word">NETUNO</span></a>
  <span class="app__sep" aria-hidden="true"></span>
  <span class="app__title">Controle de scrap</span>
  <div class="app__user">
    <a class="who" href="bem-vindo.php"><?= $nome ?></a>
    <a class="app__out" href="logout.php"><svg class="i" aria-hidden="true"><use href="#i-logout"/></svg>Sair</a>
  </div>
</header>

<main class="app__main" id="conteudo">
  <div class="app__head">
    <div><h1>Controle de scrap</h1><p>Perdas, custos e causas da produção</p></div>
    <label style="min-width:200px">Período
      <select id="periodo"><option value="7">Últimos 7 dias</option><option value="30" selected>Últimos 30 dias</option><option value="0">Todo o histórico</option></select>
    </label>
  </div>

  <section class="kpis" aria-label="Indicadores">
    <div class="card kpi"><span>Peças refugadas</span><strong id="kQtd">0</strong><small id="kReg"></small></div>
    <div class="card kpi bad"><span>Custo do scrap</span><strong id="kCusto">R$ 0,00</strong><small>no período</small></div>
    <div class="card kpi" id="kpiTaxa"><span>Taxa de scrap</span><strong id="kTaxa">0%</strong><small>meta: <span id="kMeta"></span>%</small></div>
    <div class="card kpi"><span>Principal causa</span><strong id="kCausa" style="font-size:1.35rem;margin-top:.9rem">-</strong><small id="kCausaQ"></small></div>
  </section>

  <section class="grid g3">
    <div class="card"><h3>Por causa</h3><div class="chart"><canvas id="cCausa" aria-label="Gráfico de scrap por causa" role="img"></canvas></div></div>
    <div class="card"><h3>Por linha</h3><div class="chart"><canvas id="cLinha" aria-label="Gráfico de scrap por linha" role="img"></canvas></div></div>
    <div class="card"><h3>Evolução diária</h3><div class="chart"><canvas id="cDia" aria-label="Gráfico da evolução diária de scrap" role="img"></canvas></div></div>
  </section>

  <section class="card" style="margin-bottom:1rem">
    <h3>Registrar scrap</h3>
    <form id="form">
      <label>Data<input type="date" id="fData" required></label>
      <label>Linha<select id="fLinha"><option>Linha 1</option><option>Linha 2</option><option>Linha 3</option></select></label>
      <label>Produto<input id="fProduto" maxlength="80" placeholder="Ex.: Tampa A12" required></label>
      <label>Causa<select id="fCausa"><option>Falha de máquina</option><option>Erro de operador</option><option>Matéria-prima</option><option>Ajuste de setup</option><option>Outros</option></select></label>
      <label>Quantidade<input type="number" id="fQtd" min="1" required></label>
      <label>Custo unitário (R$)<input type="number" id="fCusto" min="0" step="0.01" required></label>
      <button class="btn-app" type="submit"><svg class="i" aria-hidden="true"><use href="#i-plus"/></svg>Registrar scrap</button>
    </form>
  </section>

  <section class="card">
    <div class="table-head">
      <h3>Registros</h3>
      <button class="btn-app sec" id="csv" type="button"><svg class="i" aria-hidden="true"><use href="#i-download"/></svg>Exportar CSV</button>
    </div>
    <div class="tab"><table>
      <thead><tr><th>Data</th><th>Linha</th><th>Produto</th><th>Causa</th><th class="n">Qtd</th><th class="n">Custo</th><th><span class="sr-only">Ações</span></th></tr></thead>
      <tbody id="tbody"></tbody></table></div>
    <div class="vazio" id="vazio" hidden><strong>Nenhum registro no período.</strong>Registre o primeiro scrap acima ou carregue dados de exemplo para conhecer o painel.<br><button class="btn-app" id="demo" type="button">Carregar dados de exemplo</button></div>
  </section>
</main>
<div id="msg" role="status" aria-live="polite"></div>
<div class="tide" aria-hidden="true">
  <div class="tide__sky"><div class="tide__brand"><svg class="tide__mark" viewBox="0 0 100 100" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle class="ring" cx="50" cy="50" r="45" stroke-width="5"/>
  <g class="trident" stroke-width="4.5"><path d="M50 76V17"/><path d="M43.5 27 50 16l6.5 11"/><path d="M33 21c-1 13 3 23 17 26 14-3 18-13 17-26"/><path d="M29.5 26 33 20l3.5 6"/><path d="M63.5 26 67 20l3.5 6"/></g>
  <g class="waves" stroke-width="4.5" clip-path="url(#markClip)"><path d="M6 62c16-9 30 5 45-3s27-10 45-5"/><path d="M6 71c16-9 31 5 46-3s27-10 44-5"/><path d="M8 80c16-8 30 5 45-3s26-9 41-6"/></g>
</svg><span class="tide__word">NETUNO</span><span class="tide__tag">Guiding through uncertainty</span></div></div>
  <div class="tide__water"><div class="tide__brand"><svg class="tide__mark" viewBox="0 0 100 100" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle class="ring" cx="50" cy="50" r="45" stroke-width="5"/>
  <g class="trident" stroke-width="4.5"><path d="M50 76V17"/><path d="M43.5 27 50 16l6.5 11"/><path d="M33 21c-1 13 3 23 17 26 14-3 18-13 17-26"/><path d="M29.5 26 33 20l3.5 6"/><path d="M63.5 26 67 20l3.5 6"/></g>
  <g class="waves" stroke-width="4.5" clip-path="url(#markClip)"><path d="M6 62c16-9 30 5 45-3s27-10 45-5"/><path d="M6 71c16-9 31 5 46-3s27-10 44-5"/><path d="M8 80c16-8 30 5 45-3s26-9 41-6"/></g>
</svg><span class="tide__word">NETUNO</span><span class="tide__tag">Guiding through uncertainty</span></div></div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/CustomEase.min.js"></script>
<script src="assets/js/netuno.js"></script>
<script>
const META = 3, PRODUCAO_DIA = 1000; // ajuste para a realidade da fábrica
const $ = id => document.getElementById(id);
const brl = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const iso = d => d.toISOString().slice(0,10);
const ago = n => { const d=new Date(); d.setDate(d.getDate()-n); return iso(d); };
const cores = ["#3aafdb","#ff8a5b","#8c9bff","#4fd1b5","#f2c14e"];
const reduz = document.documentElement.classList.contains("motion-reduced");
let regs = [], charts = {};
$("kMeta").textContent = META;

Chart.defaults.font.family = '"Archivo", "Helvetica Neue", Arial, sans-serif';
Chart.defaults.color = "#a8cde6";

// números contam até o valor novo (feedback de mudança de período/registro)
function contar(el, valor, formato){
  if (!window.gsap || reduz) { el.textContent = formato(valor); el.dataset.v = valor; return; }
  if (el._tw) el._tw.kill();
  const o = { v: parseFloat(el.dataset.v) || 0 };
  el._tw = gsap.to(o, { v: valor, duration: .7, ease: "power2.out", onUpdate: () => el.textContent = formato(o.v) });
  el.dataset.v = valor;
}

function aviso(t){ const m=$("msg"); m.textContent=t; m.classList.add("on"); clearTimeout(aviso.t); aviso.t=setTimeout(()=>m.classList.remove("on"),2400); }
async function api(url, opt){
  const r = await fetch(url, opt);
  if (r.status===401) { location.href="login.html"; return; }
  if (!r.ok) throw new Error();
  return r.json();
}
const enviar = (m,body,q="") => api("api.php"+q,{method:m,headers:{"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});

async function carregar(){
  try { regs = (await api("api.php")).map(r=>({...r,id:+r.id,qtd:+r.qtd,custo:+r.custo})); render(); }
  catch { aviso("Erro ao carregar os dados."); }
}
function agrupar(l,c){ const m={}; l.forEach(r=>m[r[c]]=(m[r[c]]||0)+r.qtd); return Object.entries(m).sort((a,b)=>b[1]-a[1]); }
function grafico(id,tipo,labels,data){
  charts[id]?.destroy();
  const rosca = tipo==="doughnut";
  charts[id] = new Chart($(id),{type:tipo,data:{labels,datasets:[{data,
      backgroundColor: rosca ? cores : (tipo==="line" ? "rgba(58,175,219,.14)" : "#3aafdb"),
      hoverBackgroundColor: rosca ? cores : "#ff8a5b",
      borderColor: tipo==="line" ? "#3aafdb" : (rosca ? "#0a2a52" : "transparent"),
      borderWidth: rosca ? 3 : 2, tension:.35, borderRadius: tipo==="bar" ? 6 : 0, fill: tipo==="line",
      pointRadius: tipo==="line" ? 0 : undefined, pointHoverRadius: 5, pointBackgroundColor:"#ff8a5b"}]},
    options:{maintainAspectRatio:false, animation: reduz ? false : {duration:600, easing:"easeOutQuart"}, cutout: rosca ? "64%" : undefined,
      interaction:{mode:"index",intersect:false},
      plugins:{legend:{display:rosca,position:"bottom",labels:{color:"#a8cde6",boxWidth:10,boxHeight:10,usePointStyle:true,padding:14}},
        tooltip:{backgroundColor:"#f4fafd",titleColor:"#0a2240",bodyColor:"#0a2240",padding:10,cornerRadius:10,displayColors:rosca}},
      scales: rosca ? {} : {x:{ticks:{color:"#a8cde6"},grid:{display:false},border:{color:"rgba(169,221,243,.16)"}},
                            y:{beginAtZero:true,ticks:{color:"#a8cde6",precision:0},grid:{color:"rgba(169,221,243,.1)"},border:{display:false}}}}});
}
function render(){
  const p = +$("periodo").value;
  const lista = regs.filter(r=>p===0||r.data>=ago(p-1));
  const qtd = lista.reduce((s,r)=>s+r.qtd,0), custo = lista.reduce((s,r)=>s+r.qtd*r.custo,0);
  const dias = p || Math.max(1,new Set(regs.map(r=>r.data)).size);
  const taxa = qtd/(PRODUCAO_DIA*dias)*100, causas = agrupar(lista,"causa");
  contar($("kQtd"), qtd, v => Math.round(v).toLocaleString("pt-BR"));
  $("kReg").textContent = lista.length+" registros";
  contar($("kCusto"), custo, brl);
  contar($("kTaxa"), taxa, v => v.toFixed(2).replace(".",",")+"%");
  $("kpiTaxa").className = "card kpi "+(qtd?(taxa>META?"bad":"good"):"");
  $("kCausa").textContent = causas[0]?.[0] ?? "-";
  $("kCausaQ").textContent = causas[0] ? causas[0][1]+" peças" : "";
  grafico("cCausa","doughnut",causas.map(c=>c[0]),causas.map(c=>c[1]));
  const li = agrupar(lista,"linha"); grafico("cLinha","bar",li.map(c=>c[0]),li.map(c=>c[1]));
  const n = p===7?7:14, dd=[...Array(n)].map((_,i)=>ago(n-1-i));
  grafico("cDia","line",dd.map(d=>d.slice(8)+"/"+d.slice(5,7)),dd.map(d=>regs.filter(r=>r.data===d).reduce((s,r)=>s+r.qtd,0)));
  $("tbody").innerHTML = lista.slice(0,20).map(r=>`<tr><td>${r.data.split("-").reverse().join("/")}</td><td>${esc(r.linha)}</td><td>${esc(r.produto)}</td><td>${esc(r.causa)}</td><td class="n">${r.qtd}</td><td class="n">${brl(r.qtd*r.custo)}</td><td class="n"><button class="del" type="button" data-id="${r.id}" aria-label="Excluir registro de ${esc(r.produto)}"><svg class="i" aria-hidden="true"><use href="#i-trash"/></svg><span>Excluir</span></button></td></tr>`).join("");
  $("vazio").hidden = lista.length>0;
}
$("form").addEventListener("submit", async e=>{
  e.preventDefault();
  try {
    await enviar("POST",{data:$("fData").value,linha:$("fLinha").value,produto:$("fProduto").value,causa:$("fCausa").value,qtd:$("fQtd").value,custo:$("fCusto").value});
    e.target.reset(); $("fData").value=iso(new Date()); aviso("Scrap registrado."); carregar();
  } catch { aviso("Não foi possível registrar. Confira os dados."); }
});
// exclusão em dois cliques: o primeiro arma, o segundo confirma (sem pop-up)
$("tbody").addEventListener("click", async e=>{
  const b = e.target.closest(".del"); if (!b) return;
  if (!b.classList.contains("is-armed")) {
    document.querySelectorAll(".del.is-armed").forEach(x=>{ x.classList.remove("is-armed"); x.querySelector("span").textContent="Excluir"; });
    b.classList.add("is-armed"); b.querySelector("span").textContent = "Confirmar";
    clearTimeout(b._t); b._t = setTimeout(()=>{ b.classList.remove("is-armed"); b.querySelector("span").textContent="Excluir"; }, 3000);
    return;
  }
  try { await enviar("DELETE",null,"?id="+b.dataset.id); aviso("Registro excluído."); carregar(); }
  catch { aviso("Não foi possível excluir."); }
});
$("demo").addEventListener("click", async()=>{ await enviar("POST",{acao:"demo"}); carregar(); });
$("periodo").addEventListener("change", render);
$("csv").addEventListener("click", ()=>{
  const l=["Data;Linha;Produto;Causa;Quantidade;Custo unitario",...regs.map(r=>[r.data,r.linha,r.produto,r.causa,r.qtd,r.custo].join(";"))].join("\n");
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob(["﻿"+l],{type:"text/csv"})); a.download="scrap.csv"; a.click();
});
$("fData").value = iso(new Date());
if (window.gsap && !reduz) gsap.from(".app__head, .app .card", { y: 16, autoAlpha: 0, duration: .5, stagger: .04, ease: "power2.out", clearProps: "transform,opacity,visibility" });
carregar();
</script>
</body>
</html>
