// ═══════════════════════ CANVAS SETUP / TRANSFORM ═══════════════════════
function initCanvas(){pixels=Array.from({length:SIZE},()=>Array(SIZE).fill(null));centerCanvas();renderAll();}
function centerCanvas(){const vw=canvasVP.clientWidth,vh=canvasVP.clientHeight;offsetX=Math.round((vw-SIZE*ZOOM)/2);offsetY=Math.round((vh-SIZE*ZOOM)/2);applyTransform();}
function applyTransform(){const s=`translate(${offsetX}px,${offsetY}px)`;bgC.style.transform=s;mainC.style.transform=s;gridC.style.transform=s;}

// ═══════════════════════ RENDER ═══════════════════════
// ZOOM은 항상 정수(ZOOM_STEPS)이지만 안전상 Math.round로 캔버스 픽셀 크기 확정 (BUG-1)
function canvasPx(){return Math.round(SIZE*ZOOM);}

function renderBg(){
  const w=canvasPx(),h=canvasPx();bgC.width=w;bgC.height=h;bgCtx.clearRect(0,0,w,h);
  if(!showBg)return;
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){bgCtx.fillStyle=((x+y)%2===0)?'#b8b8b8':'#e8e8e8';bgCtx.fillRect(Math.round(x*ZOOM),Math.round(y*ZOOM),ZOOM,ZOOM);}
}
function renderMain(){
  const w=canvasPx(),h=canvasPx();mainC.width=w;mainC.height=h;mainCtx.clearRect(0,0,w,h);
  // 어니언 스킨: 이전(빨강)·다음(파랑) 프레임을 실루엣 고스트로 (모션)
  if(onionSkin&&typeof frames!=='undefined'&&frames.length>1&&!playTimer){
    drawOnion(curFrame-1,'rgba(220,60,60,0.32)');
    drawOnion(curFrame+1,'rgba(60,120,220,0.32)');
  }
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){if(pixels[y][x]){mainCtx.fillStyle=pixels[y][x];mainCtx.fillRect(Math.round(x*ZOOM),Math.round(y*ZOOM),ZOOM,ZOOM);}}
}
function drawOnion(idx,style){
  if(idx<0||idx>=frames.length)return;
  const g=frames[idx];mainCtx.fillStyle=style;
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){if(g[y][x])mainCtx.fillRect(Math.round(x*ZOOM),Math.round(y*ZOOM),ZOOM,ZOOM);}
}
// 임의 프레임 g를 메인 캔버스에 렌더 (재생용)
function renderFrameToMain(g){
  const w=canvasPx();mainC.width=w;mainC.height=w;mainCtx.clearRect(0,0,w,w);
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){if(g[y][x]){mainCtx.fillStyle=g[y][x];mainCtx.fillRect(Math.round(x*ZOOM),Math.round(y*ZOOM),ZOOM,ZOOM);}}
}
function renderGrid(){
  const w=canvasPx(),h=canvasPx();gridC.width=w;gridC.height=h;gridCtx.clearRect(0,0,w,h);
  if(showGrid&&ZOOM>=3){
    gridCtx.strokeStyle='rgba(80,80,80,0.18)';gridCtx.lineWidth=1;
    // 좌표를 정수+0.5로 스냅 → anti-aliasing 흐림 방지 (BUG-1)
    for(let x=0;x<=SIZE;x++){const px=Math.round(x*ZOOM)+0.5;gridCtx.beginPath();gridCtx.moveTo(px,0);gridCtx.lineTo(px,h);gridCtx.stroke();}
    for(let y=0;y<=SIZE;y++){const py=Math.round(y*ZOOM)+0.5;gridCtx.beginPath();gridCtx.moveTo(0,py);gridCtx.lineTo(w,py);gridCtx.stroke();}
  }
  // 선택 영역 오버레이는 격자 토글과 무관하게 항상 그림 (배치4)
  if(typeof drawSelectionOverlay==='function')drawSelectionOverlay();
}

const PREV_SCALES=[[1,'prev1','lbl-prev1'],[2,'prev2','lbl-prev2'],[4,'prev4','lbl-prev4']];
function renderPreviews(){
  // BUG-2: 우측 패널이 숨겨져 있으면(680px 이하 display:none → offsetParent null / clientWidth 0) 스킵
  const rp=document.getElementById('right-panel');
  if(!rp||rp.offsetParent===null||rp.clientWidth===0)return;
  const rpw=rp.clientWidth-16;
  if(rpw<=0)return;
  PREV_SCALES.forEach(([sc,id,lblId])=>{
    const c=document.getElementById(id);
    const pw=SIZE*sc;c.width=pw;c.height=pw;
    const disp=Math.min(rpw,pw);
    c.style.width=disp+'px';c.style.height=disp+'px';
    const lbl=document.getElementById(lblId);
    if(lbl)lbl.textContent=sc+'x ('+pw+'×'+pw+'px)';
    const ct=c.getContext('2d');ct.clearRect(0,0,pw,pw);
    // 체커 배경 (1픽셀=sc크기로 맞춤) — 토글 시 생략
    if(showPrevChecker)for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
      ct.fillStyle=((x+y)%2===0)?'#b8b8b8':'#e8e8e8';
      ct.fillRect(x*sc,y*sc,sc,sc);
    }
    // 픽셀 그리기
    for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){if(pixels[y][x]){ct.fillStyle=pixels[y][x];ct.fillRect(x*sc,y*sc,sc,sc);}}
    if(showPrevGrid&&sc>1){
      ct.strokeStyle='rgba(80,80,80,0.18)';ct.lineWidth=0.5;
      for(let x=0;x<=SIZE;x++){ct.beginPath();ct.moveTo(x*sc,0);ct.lineTo(x*sc,pw);ct.stroke();}
      for(let y=0;y<=SIZE;y++){ct.beginPath();ct.moveTo(0,y*sc);ct.lineTo(pw,y*sc);ct.stroke();}
    }
  });
  renderTile(rpw);
}
// 타일(3×3 반복) 미리보기 — 이음새(seamless) 확인용 (배치3)
function renderTile(rpw){
  const block=document.getElementById('tile-block');
  if(!block)return;
  block.style.display=showTile?'block':'none';
  if(!showTile)return;
  const c=document.getElementById('prev-tile');
  const N=3,pw=SIZE*N; // 내부 해상도: 픽셀당 1
  c.width=pw;c.height=pw;
  const disp=Math.min(rpw,pw*4); // 표시 크기: 패널 너비 내에서 최대 4배
  c.style.width=disp+'px';c.style.height=disp+'px';
  const ct=c.getContext('2d');ct.clearRect(0,0,pw,pw);
  // 체커 배경 — 토글 시 생략
  if(showPrevChecker)for(let y=0;y<pw;y++)for(let x=0;x<pw;x++){ct.fillStyle=((x+y)%2===0)?'#b8b8b8':'#e8e8e8';ct.fillRect(x,y,1,1);}
  // 3x3 타일링
  for(let ty=0;ty<N;ty++)for(let tx=0;tx<N;tx++)
    for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)
      if(pixels[y][x]){ct.fillStyle=pixels[y][x];ct.fillRect(tx*SIZE+x,ty*SIZE+y,1,1);}
}
function renderAll(){renderBg();renderMain();renderGrid();renderPreviews();}
