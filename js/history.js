// ═══════════════════════ HISTORY (전체 문서 스냅샷) ═══════════════════════
// 각 항목 = {size, frames(전 프레임 깊은복사), curFrame} → 그리기뿐 아니라 크기변경·배율도 undo 가능
function makeSnapshot(){
  const fr=(typeof frames!=='undefined'&&frames.length)?frames.map(g=>g.map(r=>[...r])):[pixels.map(r=>[...r])];
  return {size:SIZE,frames:fr,curFrame:(typeof curFrame!=='undefined'?curFrame:0)};
}
// 크기·프레임 수에 따라 undo 단계 동적 제한 (메모리 보호)
function histCap(){const per=SIZE*SIZE*Math.max(1,(typeof frames!=='undefined'?frames.length:1));return Math.max(3,Math.min(20,Math.floor(6000000/per)));}
// 히스토리 초기화(현재 상태 1개로) — 불러오기/프레임전환 등에서 호출
function resetHistory(){history=[makeSnapshot()];histIdx=0;updateUndoUI();}

function snap(){
  if(typeof frames!=='undefined'&&frames.length){frames[curFrame]=pixels.map(r=>[...r]);} // 현재 픽셀 동기화
  histIdx++;history.splice(histIdx);history.push(makeSnapshot());
  const cap=histCap();while(history.length>cap){history.shift();histIdx--;}
  updateUndoUI();
  if(typeof updateCurrentThumb==='function')updateCurrentThumb();
}
function applySnapshot(s){
  SIZE=s.size;
  frames=s.frames.map(g=>g.map(r=>[...r]));
  curFrame=Math.min(s.curFrame||0,frames.length-1);
  pixels=frames[curFrame].map(r=>[...r]);
  const sel=document.getElementById('sel-size');
  if(![...sel.options].some(o=>o.value===String(SIZE))){const o=document.createElement('option');o.value=String(SIZE);o.textContent=String(SIZE);sel.appendChild(o);}
  sel.value=String(SIZE);
  document.getElementById('st-size').textContent=SIZE+'x'+SIZE;
  centerCanvas();renderAll();
  if(typeof renderFramesBar==='function')renderFramesBar();
}
function undo(){if(histIdx<=0)return;histIdx--;applySnapshot(history[histIdx]);updateUndoUI();}
function redo(){if(histIdx>=history.length-1)return;histIdx++;applySnapshot(history[histIdx]);updateUndoUI();}
function updateUndoUI(){document.getElementById('undo-count').textContent=(histIdx+1)+'/'+history.length;document.getElementById('btn-undo').disabled=histIdx<=0;document.getElementById('btn-redo').disabled=histIdx>=history.length-1;}
