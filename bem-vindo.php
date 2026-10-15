<?php
session_start();
if (!isset($_SESSION["usuario_id"])) { header("Location: login.html"); exit; }
$nome = htmlspecialchars(explode(" ", $_SESSION["usuario_nome"])[0]);
?>
<!doctype html>
<html lang="pt-br" data-noloader>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bem-vindo · Netuno</title>
<meta name="description" content="Login realizado com sucesso.">
<meta name="theme-color" content="#0a2a52">
<link rel="icon" type="image/png" href="assets/img/Logo_Netuno.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&amp;display=swap">
<link rel="stylesheet" href="assets/css/netuno.css">
<script>(function(){var h=document.documentElement;h.classList.add("js");var mq=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches),rm=mq;try{var mp=localStorage.getItem("netuno:motion");if(mp)rm=mp==="reduced"}catch(e){}if(rm)h.classList.add("motion-reduced");try{var s=window.sessionStorage,t=+s.getItem("netuno:dive")||0;s.removeItem("netuno:dive");if(t&&Date.now()-t<8000&&!rm){h.classList.add("is-diving")}else if(!s.getItem("netuno:visited")&&!rm&&!h.hasAttribute("data-noloader")){h.classList.add("is-first")}}catch(e){}setTimeout(function(){if(!window.__netunoReady){h.classList.remove("is-first","is-diving")}},4000)})();</script>
</head>
<body data-page="bem-vindo" class="auth">
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
<svg class="auth__map" aria-hidden="true"></svg>
<header class="auth__top">
  <a class="brand" href="index.html" aria-label="Netuno, página inicial"><svg class="brand__mark" aria-hidden="true"><use href="#mark"/></svg><span class="brand__word">NETUNO</span></a>
  <a class="back-link" href="logout.php"><svg class="i" aria-hidden="true"><use href="#i-logout"/></svg>Sair</a>
</header>
<main class="auth__main auth__main--center" id="conteudo">
  <section class="panel notice" data-enter>
    <div class="notice__icon notice__icon--ok"><svg class="i" aria-hidden="true"><use href="#i-check"/></svg></div>
    <h1 class="h1">Olá, <?= $nome ?></h1>
    <p>Login realizado com sucesso. Seu painel de controle de scrap está pronto para uso.</p>
    <div class="notice__actions">
      <a class="btn btn--boia" href="dashboard.php" data-magnetic><span class="btn__label">Abrir dashboard de scrap</span><span class="btn__icon"><svg class="i" aria-hidden="true"><use href="#i-arrow-right"/></svg></span></a>
      <a class="btn btn--ghost" href="logout.php"><span class="btn__label">Sair</span><span class="btn__icon"><svg class="i" aria-hidden="true"><use href="#i-logout"/></svg></span></a>
    </div>
  </section>
</main>
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
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/DrawSVGPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/CustomEase.min.js"></script>
<script src="assets/js/netuno.js"></script>
</body>
</html>
