// ═══════════════════════ 프레임 시스템 + 스프라이트 시트 — 배치4 ═══════════════════════
function cloneGrid(g){return g.map(r=>[...r]);}
function emptyGrid(){return Array.from({length:SIZE},()=>Array(SIZE).fill(null));}

// 현재 pixels를 frames[curFrame]에 저장
function commitCurrentFrame(){if(frames.length)frames[curFrame]=cloneGrid(pixels);}

// 프레임 1개로 초기화 (현재 캔버스를 프레임0으로)
function initFrames(){frames=[cloneGrid(pixels)];curFrame=0;renderFramesBar();}

// nearest-neighbor 리샘플: oldS×oldS 그리드 → newS×newS
function resampleGrid(g,oldS,newS){
  const out=Array.from({length:newS},()=>Array(newS).fill(null));
  for(let y=0;y<newS;y++)for(let x=0;x<newS;x++){
    const sx=Math.min(oldS-1,Math.floor(x*oldS/newS)),sy=Math.min(oldS-1,Math.floor(y*oldS/newS));
    out[y][x]=(g[sy]&&g[sy][sx])||null;
  }
  return out;
}
// 캔버스 크기 변경 — 모든 프레임을 새 크기로 리샘플(내용 유지)
function resizeCanvas(newS){
  commitCurrentFrame();
  const old=SIZE;
  frames=frames.map(g=>resampleGrid(g,old,newS));
  SIZE=newS;curFrame=Math.min(curFrame,frames.length-1);
  pixels=cloneGrid(frames[curFrame]);
  // 드롭다운에 없는 크기면 옵션 추가해서 표시
  const sel=document.getElementById('sel-size');
  if(![...sel.options].some(o=>o.value===String(SIZE))){const o=document.createElement('option');o.value=String(SIZE);o.textContent=String(SIZE);sel.appendChild(o);}
  sel.value=String(SIZE);
  document.getElementById('st-size').textContent=SIZE+'x'+SIZE;
  // 히스토리 리셋 안 함 → 호출부의 snap()이 새 스냅샷 추가, 직전(리사이즈 전) 스냅샷은 undo용으로 남음
  centerCanvas();renderAll();renderFramesBar();
}

// 프레임 전환: 현재 작업 저장 → 대상 로드 → 히스토리 리셋
function switchFrame(j){
  if(j<0||j>=frames.length||j===curFrame){return;}
  if(typeof stopPlay==='function')stopPlay();
  commitCurrentFrame();
  curFrame=j;
  pixels=cloneGrid(frames[curFrame]);
  resetHistory();
  renderAll();renderFramesBar();
}
function addFrame(){
  commitCurrentFrame();
  frames.splice(curFrame+1,0,emptyGrid());
  switchFrame(curFrame+1);
}
function duplicateFrame(){
  commitCurrentFrame();
  frames.splice(curFrame+1,0,cloneGrid(frames[curFrame]));
  switchFrame(curFrame+1);
}
function deleteFrame(){
  if(frames.length<=1){return;} // 최소 1개 유지
  frames.splice(curFrame,1);
  const nj=Math.min(curFrame,frames.length-1);
  curFrame=-1;        // switchFrame의 동일 인덱스 가드 회피
  switchFrame(nj);
}

// 프레임 스트립 UI 렌더
function renderFramesBar(){
  const bar=document.getElementById('frames-list');if(!bar)return;
  bar.innerHTML='';
  frames.forEach((g,i)=>{
    const wrap=document.createElement('div');
    wrap.className='frame-thumb'+(i===curFrame?' active':'');
    wrap.title='프레임 '+(i+1);
    const cv=document.createElement('canvas');cv.width=SIZE;cv.height=SIZE;
    const ct=cv.getContext('2d');
    for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){ct.fillStyle=((x+y)%2===0)?'#cfcfcf':'#efefef';ct.fillRect(x,y,1,1);}
    const src=(i===curFrame)?pixels:g;
    for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){if(src[y][x]){ct.fillStyle=src[y][x];ct.fillRect(x,y,1,1);}}
    wrap.appendChild(cv);
    const n=document.createElement('span');n.className='fnum';n.textContent=i+1;wrap.appendChild(n);
    wrap.addEventListener('click',()=>switchFrame(i));
    bar.appendChild(wrap);
  });
  document.getElementById('frame-count').textContent=frames.length+'프레임';
  document.getElementById('btn-frame-del').disabled=frames.length<=1;
}
// 현재 프레임 썸네일만 갱신 (그리기 확정 시 호출)
function updateCurrentThumb(){renderFramesBar();}

// ── 스프라이트 시트 내보내기 ──
function openSheetModal(){
  commitCurrentFrame();
  const n=frames.length;
  document.getElementById('sheet-cols').value=String(n);
  updateSheetInfo();
  document.getElementById('sheet-overlay').classList.add('open');
}
function updateSheetInfo(){
  const n=frames.length;
  let cols=parseInt(document.getElementById('sheet-cols').value)||n;
  cols=Math.max(1,Math.min(n,cols));
  const rows=Math.ceil(n/cols);
  document.getElementById('sheet-info').textContent=
    `${n}프레임 → ${cols}×${rows} 배치 · ${SIZE*cols}×${SIZE*rows}px`;
}
function exportSheet(){
  commitCurrentFrame();
  const n=frames.length;
  let cols=parseInt(document.getElementById('sheet-cols').value)||n;
  cols=Math.max(1,Math.min(n,cols));
  const rows=Math.ceil(n/cols);
  const oc=document.createElement('canvas');oc.width=SIZE*cols;oc.height=SIZE*rows;
  const octx=oc.getContext('2d');
  frames.forEach((g,i)=>{
    const cx=(i%cols)*SIZE,cy=Math.floor(i/cols)*SIZE;
    for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){if(g[y][x]){octx.fillStyle=g[y][x];octx.fillRect(cx+x,cy+y,1,1);}}
  });
  const a=document.createElement('a');a.href=oc.toDataURL('image/png');
  a.download='spritesheet_'+SIZE+'x'+SIZE+'_'+n+'f.png';a.click();
  document.getElementById('sheet-overlay').classList.remove('open');
}

// ═══════════════════════ 애니메이션 재생 (모션) ═══════════════════════
function startPlay(){
  if(frames.length<2)return;
  commitCurrentFrame();
  const fps=Math.max(1,Math.min(30,parseInt(document.getElementById('anim-fps').value)||8));
  playIdx=0;
  document.getElementById('btn-play').textContent='⏸';
  document.getElementById('btn-play').classList.add('active');
  playTimer=setInterval(()=>{
    renderFrameToMain(frames[playIdx]);
    playIdx=(playIdx+1)%frames.length;
  },Math.round(1000/fps));
}
function stopPlay(){
  if(!playTimer)return;
  clearInterval(playTimer);playTimer=null;
  document.getElementById('btn-play').textContent='▶';
  document.getElementById('btn-play').classList.remove('active');
  renderMain(); // 현재 편집 프레임으로 복귀
}
function togglePlay(){playTimer?stopPlay():startPlay();}

// ═══════════════════════ 모션 프레임 템플릿 (모션) ═══════════════════════
const MOTION_PRESETS=[
  {key:'walk',label:'걷기',n:4},{key:'run',label:'달리기',n:6},
  {key:'attack',label:'공격',n:3},{key:'jump',label:'점프',n:3},
  {key:'blink',label:'깜빡임',n:2},{key:'idle',label:'대기',n:2}
];
function openMotionModal(){document.getElementById('motion-overlay').classList.add('open');}
// 빈 프레임 n개를 현재 프레임 뒤에 추가 (기존 작업 보존), 첫 새 프레임으로 이동
function applyMotionTemplate(n){
  stopPlay();commitCurrentFrame();
  const insertAt=curFrame+1;
  const blanks=[];for(let i=0;i<n;i++)blanks.push(emptyGrid());
  frames.splice(insertAt,0,...blanks);
  document.getElementById('motion-overlay').classList.remove('open');
  curFrame=-1;switchFrame(insertAt);
}

// ── 바인딩 ──
document.getElementById('btn-frame-add').addEventListener('click',addFrame);
document.getElementById('btn-frame-dup').addEventListener('click',duplicateFrame);
document.getElementById('btn-frame-del').addEventListener('click',deleteFrame);
document.getElementById('btn-export-sheet').addEventListener('click',openSheetModal);
document.getElementById('sheet-cols').addEventListener('input',updateSheetInfo);
document.getElementById('sheet-cancel').addEventListener('click',()=>document.getElementById('sheet-overlay').classList.remove('open'));
document.getElementById('sheet-run').addEventListener('click',exportSheet);
// 모션: 재생 / 어니언 / 템플릿
document.getElementById('btn-play').addEventListener('click',togglePlay);
document.getElementById('btn-onion').addEventListener('click',function(){onionSkin=!onionSkin;this.classList.toggle('active',onionSkin);renderMain();});
document.getElementById('btn-motion').addEventListener('click',openMotionModal);
document.getElementById('motion-cancel').addEventListener('click',()=>document.getElementById('motion-overlay').classList.remove('open'));
(function(){
  const wrap=document.getElementById('motion-presets');
  MOTION_PRESETS.forEach(p=>{const b=document.createElement('button');b.textContent=p.label+' ('+p.n+')';b.addEventListener('click',()=>applyMotionTemplate(p.n));wrap.appendChild(b);});
})();
document.getElementById('motion-custom-run').addEventListener('click',()=>{const n=Math.max(1,Math.min(24,parseInt(document.getElementById('motion-custom-n').value)||1));applyMotionTemplate(n);});
