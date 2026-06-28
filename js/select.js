// ═══════════════════════ 선택 영역 (이동 / 복사) — 배치4 ═══════════════════════
let selection=null;   // {x0,y0,x1,y1} inclusive (정규화됨)
let selDrag=null;     // 마퀴 드래그 중 {sx,sy}
let selMove=null;     // 이동 중 {data,w,h,ox,oy,gx,gy,copy}
let selMoveBase=null; // 이동 프리뷰용 베이스 픽셀
let clipboard=null;   // {w,h,data}

function normalizeSel(s){return{x0:Math.min(s.x0,s.x1),y0:Math.min(s.y0,s.y1),x1:Math.max(s.x0,s.x1),y1:Math.max(s.y0,s.y1)};}
function selBounds(){if(!selection)return null;return{x0:selection.x0,y0:selection.y0,x1:selection.x1,y1:selection.y1,w:selection.x1-selection.x0+1,h:selection.y1-selection.y0+1};}
function selInside(p){return!!selection&&p.x>=selection.x0&&p.x<=selection.x1&&p.y>=selection.y0&&p.y<=selection.y1;}
function clampPix(v){return Math.max(0,Math.min(SIZE-1,v));}

// 영역 픽셀 추출 (null 포함, 사각형 그대로)
function extractRegion(b){const data=[];for(let y=0;y<b.h;y++){const row=[];for(let x=0;x<b.w;x++){const px=b.x0+x,py=b.y0+y;row.push(inB(px,py)?pixels[py][px]:null);}data.push(row);}return data;}
// data를 (ox,oy)에 찍기. skipNull=true면 투명셀은 건너뜀(붙여넣기용)
function stampRegion(data,ox,oy,skipNull){for(let y=0;y<data.length;y++)for(let x=0;x<data[y].length;x++){const c=data[y][x];if(skipNull&&c===null)continue;drawPx(ox+x,oy+y,c);}}
function clearRegion(b){for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++)drawPx(b.x0+x,b.y0+y,null);}

function selPointerDown(p,alt){
  if(selInside(p)){
    const b=selBounds();
    selMove={data:extractRegion(b),w:b.w,h:b.h,ox:b.x0,oy:b.y0,gx:p.x,gy:p.y,copy:alt};
    if(!alt)clearRegion(b);             // 이동: 원본 들어올림 / 복사(alt): 원본 유지
    selMoveBase=pixels.map(r=>[...r]);  // 이후 프리뷰 베이스
  }else{
    const cx=clampPix(p.x),cy=clampPix(p.y);
    selDrag={sx:cx,sy:cy};selection={x0:cx,y0:cy,x1:cx,y1:cy};
    renderGrid();
  }
}
function selPointerMove(p){
  if(selMove){
    pixels=selMoveBase.map(r=>[...r]);
    const nx=selMove.ox+(p.x-selMove.gx),ny=selMove.oy+(p.y-selMove.gy);
    stampRegion(selMove.data,nx,ny,false);
    selection={x0:nx,y0:ny,x1:nx+selMove.w-1,y1:ny+selMove.h-1};
    renderAll();
  }else if(selDrag){
    selection={x0:selDrag.sx,y0:selDrag.sy,x1:clampPix(p.x),y1:clampPix(p.y)};
    renderGrid();
  }
}
function selPointerUp(){
  if(selMove){selection=normalizeSel(selection);selMove=null;selMoveBase=null;snap();}
  else if(selDrag){selection=normalizeSel(selection);selDrag=null;renderGrid();}
}

// 복사/붙여넣기/삭제/해제/이동
function copySelection(){if(!selection)return;clipboard=extractRegion(selBounds());}
function pasteClipboard(){
  if(!clipboard)return;
  const ox=selection?selection.x0:0,oy=selection?selection.y0:0;
  stampRegion(clipboard,ox,oy,true);
  selection={x0:ox,y0:oy,x1:ox+clipboard[0].length-1,y1:oy+clipboard.length-1};
  renderAll();snap();
}
function deleteSelection(){if(!selection)return;clearRegion(selBounds());renderAll();snap();}
function clearSelection(){selection=null;selDrag=null;selMove=null;renderGrid();}
function nudgeSelection(dx,dy){
  if(!selection)return;
  const b=selBounds(),data=extractRegion(b);
  clearRegion(b);stampRegion(data,b.x0+dx,b.y0+dy,false);
  selection={x0:b.x0+dx,y0:b.y0+dy,x1:b.x1+dx,y1:b.y1+dy};
  renderAll();snap();
}

// ── 좌우/상하 반전 ──
// 선택 영역이 있으면 그 영역만, 없으면 현재 프레임 전체를 반전
function flipTargetBounds(){
  return selection?selBounds():{x0:0,y0:0,x1:SIZE-1,y1:SIZE-1,w:SIZE,h:SIZE};
}
function flipHorizontal(){
  const b=flipTargetBounds(),data=extractRegion(b);
  for(let y=0;y<b.h;y++)data[y].reverse();
  for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++)drawPx(b.x0+x,b.y0+y,data[y][x]);
  renderAll();snap();
}
function flipVertical(){
  const b=flipTargetBounds(),data=extractRegion(b);
  data.reverse();
  for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++)drawPx(b.x0+x,b.y0+y,data[y][x]);
  renderAll();snap();
}

// ── 90° 회전 ──
// data[h][w] → 회전된 [w][h]. cw=true 시계방향, false 반시계.
function rotateGrid(data,cw){
  const h=data.length,w=data[0].length;
  const res=Array.from({length:w},()=>Array(h).fill(null));
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    if(cw)res[x][h-1-y]=data[y][x];
    else res[w-1-x][y]=data[y][x];
  }
  return res;
}
// 선택 영역(있으면) 또는 현재 프레임 전체를 90° 회전. 좌상단 기준, 가로세로 swap.
function rotate90(cw){
  const b=flipTargetBounds();
  const res=rotateGrid(extractRegion(b),cw);
  clearRegion(b);
  const nh=res.length,nw=res[0].length;
  for(let y=0;y<nh;y++)for(let x=0;x<nw;x++)drawPx(b.x0+x,b.y0+y,res[y][x]);
  if(selection)selection={x0:b.x0,y0:b.y0,x1:Math.min(SIZE-1,b.x0+nw-1),y1:Math.min(SIZE-1,b.y0+nh-1)};
  renderAll();snap();
}
function rotateCW(){rotate90(true);}
function rotateCCW(){rotate90(false);}

// 선택 영역 오버레이 (gridC 위, 점선) — renderGrid 끝에서 호출
function drawSelectionOverlay(){
  if(!selection)return;
  const b=selBounds();
  const x=Math.round(b.x0*ZOOM),y=Math.round(b.y0*ZOOM),w=Math.round(b.w*ZOOM),h=Math.round(b.h*ZOOM);
  gridCtx.save();
  gridCtx.lineWidth=1;gridCtx.setLineDash([4,3]);
  gridCtx.strokeStyle='rgba(0,0,0,0.9)';gridCtx.lineDashOffset=0;gridCtx.strokeRect(x+0.5,y+0.5,w-1,h-1);
  gridCtx.strokeStyle='rgba(255,255,255,0.9)';gridCtx.lineDashOffset=4;gridCtx.strokeRect(x+0.5,y+0.5,w-1,h-1);
  gridCtx.restore();
}

// ── 바인딩 ──
document.getElementById('btn-flip-h').addEventListener('click',flipHorizontal);
document.getElementById('btn-flip-v').addEventListener('click',flipVertical);
document.getElementById('btn-rot-cw').addEventListener('click',rotateCW);
document.getElementById('btn-rot-ccw').addEventListener('click',rotateCCW);
