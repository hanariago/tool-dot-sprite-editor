// ═══════════════════════ 첫 방문 가이드 팝업 (온보딩 모달) ═══════════════════════
// 표준: 툴 개발 가이드 > '첫 방문 가이드 팝업'
// - 첫 방문(그날 처음) 자동 표시
// - '오늘 다시 보지 않기' 체크 후 닫으면 → 그날 하루 안 뜸 (localStorage 날짜)
// - 체크 없이 닫기/✕ → 같은 세션엔 안 뜸 (sessionStorage), 새 방문 때 다시
// - Esc / 바깥 딤 클릭으로도 닫힘
// ⚠️ 모든 도구가 같은 origin(hanariago.github.io)이라 스토리지 공유 → 키에 도구 접두어 'sprite_' 필수
(function(){
  const HIDE_KEY='sprite_guideHideDate', SEEN_KEY='sprite_guideSeen';
  const today=new Date().toISOString().slice(0,10);
  const ov=document.getElementById('guide-overlay');
  if(!ov)return;
  const isOpen=()=>ov.classList.contains('open');
  window.closeGuide=function(){
    if(document.getElementById('guide-dont').checked){try{localStorage.setItem(HIDE_KEY,today);}catch(e){}}
    try{sessionStorage.setItem(SEEN_KEY,'1');}catch(e){}
    ov.classList.remove('open');
  };
  document.getElementById('guide-close').addEventListener('click',closeGuide);
  document.getElementById('guide-x').addEventListener('click',closeGuide);
  ov.addEventListener('click',e=>{if(e.target===ov)closeGuide();});            // 바깥 딤 클릭
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen())closeGuide();}); // Esc
  // 표시 판단: 오늘 '안 보기' 했거나 이번 세션에 이미 봤으면 스킵
  let hide=null,seen=null;
  try{hide=localStorage.getItem(HIDE_KEY);}catch(e){}
  try{seen=sessionStorage.getItem(SEEN_KEY);}catch(e){}
  if(hide!==today && !seen)ov.classList.add('open');
})();
