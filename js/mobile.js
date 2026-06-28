// ═══════════════════════ 모바일 인터랙션 ═══════════════════════
// 상단바(메뉴/undo/redo/색/언어) · 하단 도구바 · ☰ 드로어(=툴바) · 색 바텀시트(=좌패널)
function mClose(){document.body.classList.remove('m-menu','m-color');}

document.getElementById('m-menu').addEventListener('click',()=>{document.body.classList.remove('m-color');document.body.classList.toggle('m-menu');});
document.getElementById('m-swatch').addEventListener('click',()=>{document.body.classList.remove('m-menu');document.body.classList.toggle('m-color');});
document.getElementById('m-overlay').addEventListener('click',mClose);
document.getElementById('m-undo').addEventListener('click',()=>undo());
document.getElementById('m-redo').addEventListener('click',()=>redo());
document.getElementById('m-lang').addEventListener('click',toggleLang);

// 하단 도구바 → setTool (드로어 자동 닫힘 없음, 도구는 자주 바꾸니 유지)
document.querySelectorAll('#m-tools .m-tool').forEach(b=>{
  b.addEventListener('click',()=>{setTool(b.dataset.mtool);});
});
// 드로어 안에서 기능 누르면 닫기 (저장/내보내기/모달 등)
document.getElementById('toolbar').addEventListener('click',e=>{
  if(e.target.closest('button')&&document.body.classList.contains('m-menu'))setTimeout(mClose,80);
});

// 현재 도구 → 모바일 도구바 active 동기화
function syncMTools(){document.querySelectorAll('#m-tools .m-tool').forEach(b=>b.classList.toggle('active',b.dataset.mtool===tool));}
// 현재 전경색 → 모바일 스와치
function renderMSwatch(){const c=document.getElementById('m-swatch');if(c&&typeof drawCheckerOnCanvas==='function')drawCheckerOnCanvas(c,fgColor,5);}

// 초기 동기화
renderMSwatch();syncMTools();
