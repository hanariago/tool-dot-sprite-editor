// ═══════════════════════ DRAW ═══════════════════════
function getPixelPos(cx,cy){const r=canvasVP.getBoundingClientRect();return{x:Math.floor((cx-r.left-offsetX)/ZOOM),y:Math.floor((cy-r.top-offsetY)/ZOOM)};}
function inB(x,y){return x>=0&&y>=0&&x<SIZE&&y<SIZE;}
function drawPx(x,y,c){if(!inB(x,y))return;pixels[y][x]=c||null;}
function floodFill(sx,sy,nc){if(!inB(sx,sy))return;const oc=pixels[sy][sx];if(oc===nc)return;const q=[[sx,sy]],vis=new Set();while(q.length){const[x,y]=q.shift(),k=y*SIZE+x;if(vis.has(k)||!inB(x,y)||pixels[y][x]!==oc)continue;vis.add(k);pixels[y][x]=nc;q.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}}
function pickColor(x,y){if(!inB(x,y))return;const c=pixels[y][x];if(c)setFgColor(c);}
function doDrawAt(cx,cy){
  const p=getPixelPos(cx,cy);if(!inB(p.x,p.y)){lastPos=null;return;}
  if(tool==='draw'){if(lastPos){const dx=p.x-lastPos.x,dy=p.y-lastPos.y,steps=Math.max(Math.abs(dx),Math.abs(dy));for(let i=0;i<=steps;i++){const ix=Math.round(lastPos.x+dx*(i/steps)),iy=Math.round(lastPos.y+dy*(i/steps));paint(ix,iy,fgColor);}}else paint(p.x,p.y,fgColor);lastPos=p;}
  else if(tool==='erase'){if(lastPos){const dx=p.x-lastPos.x,dy=p.y-lastPos.y,steps=Math.max(Math.abs(dx),Math.abs(dy));for(let i=0;i<=steps;i++){const ix=Math.round(lastPos.x+dx*(i/steps)),iy=Math.round(lastPos.y+dy*(i/steps));paint(ix,iy,null);}}else paint(p.x,p.y,null);lastPos=p;}
  else if(tool==='eyedrop'){pickColor(p.x,p.y);}
  else if(tool==='fill'){floodFill(p.x,p.y,fgColor);}
  renderAll();
  if(inB(p.x,p.y)){document.getElementById('st-pos').textContent='('+p.x+','+p.y+')';document.getElementById('st-color').textContent=pixels[p.y][p.x]||'transparent';}
}

// ═══════════════════════ POINTER ═══════════════════════
canvasVP.addEventListener('pointerdown',e=>{
  if(playTimer&&typeof stopPlay==='function')stopPlay(); // 재생 중 캔버스 조작 시 정지 (모션)
  // 휠클릭(button 1) 또는 Space+좌클릭 → 패닝 (배치3)
  if(e.button===1||(e.button===0&&spaceHeld)){e.preventDefault();isMidPanning=true;midPanStartX=e.clientX;midPanStartY=e.clientY;midPanOriginX=offsetX;midPanOriginY=offsetY;canvasVP.style.cursor='grabbing';return;}
  if(e.button!==0)return;
  isPointerDown=true;canvasVP.setPointerCapture(e.pointerId);
  if(tool==='select'){selPointerDown(getPixelPos(e.clientX,e.clientY),e.altKey);return;}
  if(SHAPE_TOOLS.includes(tool)){const p=getPixelPos(e.clientX,e.clientY);shapeStart=p;return;}
  doDrawAt(e.clientX,e.clientY);
});
canvasVP.addEventListener('pointermove',e=>{
  if(isMidPanning){offsetX=midPanOriginX+(e.clientX-midPanStartX);offsetY=midPanOriginY+(e.clientY-midPanStartY);applyTransform();return;}
  if(isPointerDown&&tool==='select'){selPointerMove(getPixelPos(e.clientX,e.clientY));return;}
  if(isPointerDown&&SHAPE_TOOLS.includes(tool)&&shapeStart){const p=getPixelPos(e.clientX,e.clientY);previewShape(shapeStart,p);if(inB(p.x,p.y))document.getElementById('st-pos').textContent='('+p.x+','+p.y+')';return;}
  if(isPointerDown){doDrawAt(e.clientX,e.clientY);return;}
  const p=getPixelPos(e.clientX,e.clientY);if(inB(p.x,p.y)){document.getElementById('st-pos').textContent='('+p.x+','+p.y+')';document.getElementById('st-color').textContent=pixels[p.y][p.x]||'transparent';}
});
canvasVP.addEventListener('pointerup',e=>{
  if(isMidPanning){isMidPanning=false;canvasVP.style.cursor=spaceHeld?'grab':'default';return;}
  if(!isPointerDown)return;isPointerDown=false;
  if(tool==='select'){selPointerUp();return;}
  if(SHAPE_TOOLS.includes(tool)){if(shapeStart){const p=getPixelPos(e.clientX,e.clientY);commitShape(shapeStart,p);shapeStart=null;renderAll();pushRecent(fgColor);snap();}return;}
  lastPos=null;if(tool==='draw'||tool==='erase'||tool==='fill'){if(tool!=='erase')pushRecent(fgColor);snap();}
});
canvasVP.addEventListener('pointercancel',()=>{isPointerDown=false;isMidPanning=false;lastPos=null;shapeStart=null;selDrag=null;selMove=null;selMoveBase=null;canvasVP.style.cursor='default';});
canvasVP.addEventListener('contextmenu',e=>e.preventDefault());
canvasVP.addEventListener('mousedown',e=>{if(e.button===1)e.preventDefault();});

// ── WHEEL ZOOM - cursor centered, 정수 스냅 (BUG-1) ──
canvasVP.addEventListener('wheel',e=>{
  e.preventDefault();
  const rect=canvasVP.getBoundingClientRect();
  const mx=e.clientX-rect.left,my=e.clientY-rect.top;
  const wx=(mx-offsetX)/ZOOM,wy=(my-offsetY)/ZOOM;
  const dir=e.deltaY<0?1:-1;
  const nz=zoomStep(dir);
  if(nz===ZOOM){return;} // 더 이상 변화 없음
  ZOOM=nz;
  offsetX=Math.round(mx-wx*ZOOM);offsetY=Math.round(my-wy*ZOOM);
  applyTransform();renderBg();renderMain();renderGrid();
  document.getElementById('st-zoom').textContent='x'+ZOOM;
},{passive:false});

// ── TOUCH PINCH - 정수 스냅 (BUG-1) ──
let lastTD=null;
canvasVP.addEventListener('touchstart',e=>{if(e.touches.length===2)lastTD=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);},{passive:true});
canvasVP.addEventListener('touchmove',e=>{if(e.touches.length===2){e.preventDefault();const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(lastTD){const nz=snapZoom(Math.min(Math.max(ZOOM*(d/lastTD),1),64));if(nz!==ZOOM){ZOOM=nz;applyTransform();renderBg();renderMain();renderGrid();document.getElementById('st-zoom').textContent='x'+ZOOM;}}lastTD=d;}},{passive:false});
canvasVP.addEventListener('touchend',()=>{lastTD=null;},{passive:true});

// ═══════════════════════ KEYBOARD ═══════════════════════
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  if(e.code==='Space'){e.preventDefault();if(!spaceHeld){spaceHeld=true;if(!isMidPanning)canvasVP.style.cursor='grab';}return;}
  // 선택 영역 클립보드/조작 (배치4)
  if((e.ctrlKey||e.metaKey)&&e.key==='c'){if(selection){e.preventDefault();copySelection();}return;}
  if((e.ctrlKey||e.metaKey)&&e.key==='v'){if(clipboard){e.preventDefault();pasteClipboard();}return;}
  if(tool==='select'&&(e.key==='Delete'||e.key==='Backspace')){if(selection){e.preventDefault();deleteSelection();}return;}
  if(e.key==='Escape'){if(selection){clearSelection();}return;}
  if(selection&&(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();nudgeSelection(e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0,e.key==='ArrowUp'?-1:e.key==='ArrowDown'?1:0);return;}
  if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();undo();}
  else if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.shiftKey&&e.key==='Z'))){e.preventDefault();redo();}
  else if(e.key==='d')setTool('draw');
  else if(e.key==='e')setTool('erase');
  else if(e.key==='f')setTool('fill');
  else if(e.key==='i')setTool('eyedrop');
  else if(e.key==='l')setTool('line');
  else if(e.key==='r')setTool('rect');
  else if(e.key==='o')setTool('ellipse');
  else if(e.key==='s')setTool('select');
  else if(e.key==='m')cycleMirror();
  else if(e.key==='[')setBrush(brushSize-1);
  else if(e.key===']')setBrush(brushSize+1);
  else if(e.key==='x'){const t=fgColor;setFgColor(bgColor);bgColor=t;renderBgSwatch();}
});
document.addEventListener('keyup',e=>{
  if(e.code==='Space'){spaceHeld=false;if(!isMidPanning)canvasVP.style.cursor='default';}
});

// ── 브러시 크기 / 대칭 ──
function setBrush(n){brushSize=Math.max(1,Math.min(3,n));document.getElementById('sel-brush').value=String(brushSize);}
const MIRROR_CYCLE=['none','h','v','hv'];
const MIRROR_LABEL={none:'↔ 대칭',h:'↔ 좌우',v:'↕ 상하',hv:'✚ 사방'};
function setMirror(m){mirrorMode=m;const b=document.getElementById('btn-mirror');b.textContent=MIRROR_LABEL[m];b.classList.toggle('active',m!=='none');}
function cycleMirror(){setMirror(MIRROR_CYCLE[(MIRROR_CYCLE.indexOf(mirrorMode)+1)%MIRROR_CYCLE.length]);}
document.getElementById('sel-brush').addEventListener('change',function(){setBrush(parseInt(this.value));});
document.getElementById('btn-mirror').addEventListener('click',cycleMirror);

// ═══════════════════════ TOOLS / TOOLBAR BINDINGS ═══════════════════════
function setTool(t){tool=t;document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===t));if(typeof syncMTools==='function')syncMTools();}
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>setTool(b.dataset.tool)));
document.getElementById('btn-undo').addEventListener('click',undo);
document.getElementById('btn-redo').addEventListener('click',redo);
document.getElementById('btn-grid').addEventListener('click',function(){showGrid=!showGrid;this.classList.toggle('active',showGrid);renderGrid();});
document.getElementById('btn-bg-toggle').addEventListener('click',function(){showBg=!showBg;this.classList.toggle('active',showBg);renderBg();});
document.getElementById('btn-prev-grid').addEventListener('click',function(){showPrevGrid=!showPrevGrid;this.classList.toggle('active',showPrevGrid);renderPreviews();});
document.getElementById('btn-prev-tile').addEventListener('click',function(){showTile=!showTile;this.classList.toggle('active',showTile);renderPreviews();});
document.getElementById('btn-prev-checker').addEventListener('click',function(){showPrevChecker=!showPrevChecker;this.classList.toggle('active',showPrevChecker);renderPreviews();});
document.getElementById('btn-prev-box').addEventListener('click',function(){showPrevBox=!showPrevBox;this.classList.toggle('active',showPrevBox);document.getElementById('right-panel').classList.toggle('hide-box',!showPrevBox);});
document.getElementById('sel-size').addEventListener('change',function(){const v=parseInt(this.value);showConfirm('크기 변경 ('+SIZE+'→'+v+')','기존 그림을 어떻게 할까요?',[{label:'취소',fn:()=>{document.getElementById('sel-size').value=String(SIZE);}},{label:'비우기',fn:()=>{SIZE=v;document.getElementById('st-size').textContent=SIZE+'x'+SIZE;initCanvas();initFrames();snap();}},{label:'내용 유지(리사이즈)',cls:'active',fn:()=>{resizeCanvas(v);snap();}}]);});
document.getElementById('sel-bits').addEventListener('change',function(){curBits=parseInt(this.value)||0;paletteColors=[...(FP[curBits]||FP[0])];buildPalette();});
document.getElementById('btn-upscale').addEventListener('click',()=>{
  const btns=[{label:'취소',fn:()=>{}}];
  // 축소 ÷N (정수로 나눠지고 결과 ≥4) — 2×2 블록을 ÷2로 줄이면 1도트
  [2,3,4].forEach(n=>{if(SIZE%n===0&&SIZE/n>=4){const t=SIZE/n;btns.push({label:'÷'+n+' ('+t+'px)',fn:()=>{resizeCanvas(t);snap();}});}});
  // 확대 ×N (≤256)
  [2,3,4].forEach(n=>{if(SIZE*n<=512){const t=SIZE*n;btns.push({label:'×'+n+' ('+t+'px)',cls:n===2?'active':'',fn:()=>{resizeCanvas(t);snap();}});}});
  if(btns.length<=1){showConfirm('배율 조정','지금 크기에선 정수배 확대/축소가 안 돼요.',[{label:'확인',cls:'active',fn:()=>{}}]);return;}
  showConfirm('배율 조정 (현재 '+SIZE+'px)','도트를 정수배로 키우거나 줄입니다. 2×2 블록이면 ÷2로 1도트가 돼요. 모든 프레임에 적용.',btns);
});
document.getElementById('btn-clear').addEventListener('click',()=>{showConfirm('전체 초기화','캔버스를 비웁니다. 되돌릴 수 없습니다.',[{label:'취소',fn:()=>{}},{label:'초기화',cls:'warn',fn:()=>{pixels=Array.from({length:SIZE},()=>Array(SIZE).fill(null));snap();renderAll();}}]);});

// ═══════════════════════ COLOR CONTROLS ═══════════════════════
document.getElementById('native-picker').addEventListener('input',function(){const{a}=hexToRgba(fgColor||'#000000ff');fgColor=this.value+a.toString(16).padStart(2,'0');applyColorToUI(fgColor);buildPalette();});
document.getElementById('hex-input').addEventListener('change',function(){let v=this.value.trim();if(v==='transparent'){setFgColor(null);return;}if(!v.startsWith('#'))v='#'+v;if(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v)){setFgColor(v);buildPalette();}});
document.getElementById('opacity-range').addEventListener('input',function(){const{r,g,b}=hexToRgba(fgColor||'#000000ff');const a=parseInt(this.value);fgColor=rgbaToHex(r,g,b,a);document.getElementById('opacity-val').textContent=Math.round(a/255*100)+'%';drawCheckerOnCanvas(document.getElementById('swatch-fg'),fgColor,5);document.getElementById('hex-input').value=fgColor;});
['h','s','l'].forEach(ch=>{document.getElementById(ch+'-range').addEventListener('input',()=>{const h=+document.getElementById('h-range').value,s=+document.getElementById('s-range').value,l=+document.getElementById('l-range').value;document.getElementById('h-val').textContent=h;document.getElementById('s-val').textContent=s;document.getElementById('l-val').textContent=l;const{a}=hexToRgba(fgColor||'#000000ff');const hex=hslToHex(h,s,l,a);fgColor=hex;document.getElementById('native-picker').value=hex.slice(0,7);document.getElementById('hex-input').value=hex;drawCheckerOnCanvas(document.getElementById('swatch-fg'),hex,5);buildPalette();});});
document.getElementById('swatch-fg').addEventListener('click',()=>document.getElementById('native-picker').click());
document.getElementById('swap-btn').addEventListener('click',()=>{const t=fgColor;setFgColor(bgColor);bgColor=t;renderBgSwatch();});
document.getElementById('swatch-bg').addEventListener('click',()=>{bgColor=null;renderBgSwatch();buildPalette();});
document.getElementById('add-to-palette').addEventListener('click',()=>{if(fgColor&&!userColors.includes(fgColor)&&!paletteColors.includes(fgColor))userColors.push(fgColor);buildPalette();});
