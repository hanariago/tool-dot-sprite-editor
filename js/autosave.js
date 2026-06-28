// ═══════════════════════ 임시저장 (수동, 로컬) ═══════════════════════
// 사용자가 직접 '임시저장' 버튼으로 저장하고, 목록에서 직접 삭제한다. (자동저장/자동삭제 없음)
const HIST_KEY='sprite_history_v1';
const TEMP_CAP=50; // 안전 상한 (이 이상은 직접 지워야 함)

function histLoad(){try{return JSON.parse(localStorage.getItem(HIST_KEY))||[];}catch(e){return[];}}
function histStoreRaw(list){localStorage.setItem(HIST_KEY,JSON.stringify(list));}
// 현재 프레임 56px 썸네일 (체커 배경)
function histThumb(){
  const oc=document.createElement('canvas');oc.width=56;oc.height=56;const c=oc.getContext('2d');
  for(let y=0;y<56;y+=8)for(let x=0;x<56;x+=8){c.fillStyle=((x/8+y/8)%2===0)?'#d8d8d8':'#f0f0f0';c.fillRect(x,y,8,8);}
  const sc=56/SIZE;
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){if(pixels[y][x]){c.fillStyle=pixels[y][x];c.fillRect(Math.floor(x*sc),Math.floor(y*sc),Math.ceil(sc),Math.ceil(sc));}}
  return oc.toDataURL('image/png');
}
function histTimeStr(ts){const d=Date.now()-ts;if(d<60000)return'방금';if(d<3600000)return Math.floor(d/60000)+'분 전';if(d<86400000)return Math.floor(d/3600000)+'시간 전';return Math.floor(d/86400000)+'일 전';}

// 현재 상태를 임시저장 (수동)
function saveTempWork(){
  const st=document.getElementById('temp-status');
  if(typeof commitCurrentFrame==='function')commitCurrentFrame();
  if(!frames.some(g=>g.some(r=>r.some(v=>v)))){st.textContent='빈 캔버스는 저장하지 않아요.';return;}
  const list=histLoad();
  if(list.length>=TEMP_CAP){st.textContent='목록이 가득 찼어요('+TEMP_CAP+'). 일부 삭제 후 다시 저장하세요.';return;}
  list.push({size:SIZE,frames,userColors,curBits,ts:Date.now(),thumb:histThumb()});
  try{histStoreRaw(list);st.textContent='✅ 저장됨! ('+list.length+'개)';}
  catch(e){st.textContent='⚠️ 저장 공간이 부족해요. 목록에서 일부 지워주세요.';return;}
  renderRecentWorks();
}

function histRestore(item){
  SIZE=item.size;frames=item.frames.map(g=>g.map(r=>[...r]));curFrame=0;pixels=frames[0].map(r=>[...r]);
  userColors=item.userColors||[];if(item.curBits!=null)curBits=item.curBits;
  const sel=document.getElementById('sel-size');
  if(![...sel.options].some(o=>o.value===String(SIZE))){const o=document.createElement('option');o.value=String(SIZE);o.textContent=String(SIZE);sel.appendChild(o);}
  sel.value=String(SIZE);document.getElementById('st-size').textContent=SIZE+'x'+SIZE;
  resetHistory();
  centerCanvas();renderAll();renderFramesBar();buildPalette();
  document.getElementById('recent-overlay').classList.remove('open');
}

function renderRecentWorks(){
  const wrap=document.getElementById('recent-list');wrap.innerHTML='';
  const list=histLoad();
  if(!list.length){wrap.innerHTML='<div style="grid-column:1/-1;font-size:12px;color:var(--text3);text-align:center;padding:18px">아직 임시저장이 없어요.<br>위의 「＋ 지금 상태 저장」을 눌러 저장하세요.</div>';return;}
  list.slice().reverse().forEach((item,ri)=>{
    const idx=list.length-1-ri;
    const cell=document.createElement('div');cell.className='recent-item';cell.title='클릭해서 복원 ('+item.size+'×'+item.size+' · '+item.frames.length+'프레임)';
    const img=document.createElement('img');img.src=item.thumb;img.className='recent-thumb';cell.appendChild(img);
    const lbl=document.createElement('div');lbl.className='recent-lbl';lbl.textContent=histTimeStr(item.ts)+' · '+item.size+'px'+(item.frames.length>1?(' · '+item.frames.length+'F'):'');cell.appendChild(lbl);
    const del=document.createElement('button');del.className='recent-del';del.textContent='×';del.title='이 항목 삭제';
    del.addEventListener('click',e=>{e.stopPropagation();const l=histLoad();l.splice(idx,1);histStoreRaw(l);renderRecentWorks();});
    cell.appendChild(del);
    cell.addEventListener('click',()=>histRestore(item));
    wrap.appendChild(cell);
  });
}

// ── 바인딩 ──
document.getElementById('btn-recent').addEventListener('click',()=>{document.getElementById('temp-status').textContent='';renderRecentWorks();document.getElementById('recent-overlay').classList.add('open');});
document.getElementById('temp-save').addEventListener('click',saveTempWork);
document.getElementById('recent-close').addEventListener('click',()=>document.getElementById('recent-overlay').classList.remove('open'));
document.getElementById('recent-clear').addEventListener('click',()=>{showConfirm('전체 삭제','임시저장된 작업을 모두 지웁니다. 되돌릴 수 없어요.',[{label:'취소',fn:()=>{}},{label:'삭제',cls:'warn',fn:()=>{localStorage.removeItem(HIST_KEY);renderRecentWorks();}}]);});
