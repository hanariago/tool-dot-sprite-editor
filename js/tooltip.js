// ═══════════════════════ 커스텀 툴팁 ═══════════════════════
// title 속성을 읽어 보기 좋은 박스로 표시. 네이티브 title은 억제(중복 방지).
(function(){
  const tip=document.createElement('div');tip.id='ui-tooltip';document.body.appendChild(tip);
  let showTimer=null,curEl=null;
  function textOf(el){return el.getAttribute('data-tip')||el.getAttribute('title');}
  function place(el){
    const r=el.getBoundingClientRect();
    const tw=tip.offsetWidth,th=tip.offsetHeight;
    let left=r.left+r.width/2-tw/2;
    left=Math.max(6,Math.min(left,window.innerWidth-tw-6));
    let top=r.bottom+7;                      // 기본: 요소 아래
    if(top+th>window.innerHeight-6)top=r.top-th-7; // 아래로 넘치면 위로
    tip.style.left=left+'px';tip.style.top=Math.max(6,top)+'px';
  }
  function onOver(e){
    const el=e.target.closest&&e.target.closest('[title],[data-tip]');
    if(!el||el===curEl)return;
    if(el.hasAttribute('title')){el.setAttribute('data-tip',el.getAttribute('title'));el.removeAttribute('title');} // 네이티브 억제
    const t=textOf(el);if(!t)return;
    curEl=el;
    clearTimeout(showTimer);
    showTimer=setTimeout(()=>{tip.textContent=t;tip.classList.add('show');place(el);},200);
  }
  function onOut(e){
    if(!curEl)return;
    const to=e.relatedTarget;
    if(to&&curEl.contains&&curEl.contains(to))return;
    clearTimeout(showTimer);tip.classList.remove('show');curEl=null;
  }
  document.addEventListener('mouseover',onOver,true);
  document.addEventListener('mouseout',onOut,true);
  document.addEventListener('mousedown',()=>{clearTimeout(showTimer);tip.classList.remove('show');curEl=null;},true);
  window.addEventListener('blur',()=>{tip.classList.remove('show');curEl=null;});
})();
