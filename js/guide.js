// ═══════════════════════ 첫 방문 가이드 팝업 ═══════════════════════
// 처음 열면 표시. '오늘 다시 보지 않기' 체크 시 그날은 다시 안 뜸(localStorage에 날짜 저장).
(function(){
  const KEY='sprite_guide_hide_date';
  function todayStr(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
  const ov=document.getElementById('guide-overlay');
  if(!ov)return;
  function close(){
    if(document.getElementById('guide-dont').checked){try{localStorage.setItem(KEY,todayStr());}catch(e){}}
    ov.classList.remove('open');
  }
  document.getElementById('guide-close').addEventListener('click',close);
  document.getElementById('guide-x').addEventListener('click',close);
  // 바깥(딤) 클릭 시에도 닫힘(체크박스 반영)
  ov.addEventListener('click',e=>{if(e.target===ov)close();});
  // 오늘 '다시 보지 않기' 했으면 스킵, 아니면 표시
  let hide=false;try{hide=localStorage.getItem(KEY)===todayStr();}catch(e){}
  if(!hide)ov.classList.add('open');
})();
