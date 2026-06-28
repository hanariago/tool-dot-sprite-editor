// ═══════════════════════ COLOR ═══════════════════════
function hexToRgba(hex){let h=(hex||'#000000ff').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16),a=h.length>=8?parseInt(h.slice(6,8),16):255;return{r,g,b,a};}
function rgbaToHex(r,g,b,a=255){return'#'+[r,g,b,a].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');}
function hexToHsl(hex){let{r,g,b}=hexToRgba(hex);r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0,l=(mx+mn)/2;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);if(mx===r)h=((g-b)/d+(g<b?6:0))/6;else if(mx===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6;}return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};}
function hslToHex(h,s,l,a=255){s/=100;l/=100;const k=n=>(n+h/30)%12,_a=s*Math.min(l,1-l),f=n=>Math.round((l-_a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1))))*255);return rgbaToHex(f(0),f(8),f(4),a);}

// ── CHECKER CANVAS HELPER ──────────────────────
// canvas에 체커보드 + 색상을 직접 그림. cell: 체커 한 칸 px 크기
function drawCheckerOnCanvas(canvas, hexColor, cell){
  const w=canvas.width,h=canvas.height;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,w,h);
  // 체커 배경
  for(let y=0;y<h;y+=cell)for(let x=0;x<w;x+=cell){
    ctx.fillStyle=((Math.floor(x/cell)+Math.floor(y/cell))%2===0)?'#b8b8b8':'#e8e8e8';
    ctx.fillRect(x,y,cell,cell);
  }
  // 색상 오버레이
  if(hexColor){
    const{r,g,b,a}=hexToRgba(hexColor);
    ctx.fillStyle=`rgba(${r},${g},${b},${a/255})`;
    ctx.fillRect(0,0,w,h);
  }
}

function setFgColor(hex){fgColor=hex;applyColorToUI(hex);}
function applyColorToUI(hex){
  const fg=document.getElementById('swatch-fg');
  drawCheckerOnCanvas(fg, hex, 5);
  if(typeof renderMSwatch==='function')renderMSwatch();
  if(!hex){document.getElementById('hex-input').value='transparent';document.getElementById('opacity-range').value=0;document.getElementById('opacity-val').textContent='0%';return;}
  const{r,g,b,a}=hexToRgba(hex);
  document.getElementById('native-picker').value='#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  document.getElementById('hex-input').value=hex;document.getElementById('opacity-range').value=a;document.getElementById('opacity-val').textContent=Math.round(a/255*100)+'%';
  const{h,s,l}=hexToHsl(hex);
  document.getElementById('h-range').value=h;document.getElementById('h-val').textContent=h;
  document.getElementById('s-range').value=s;document.getElementById('s-val').textContent=s;
  document.getElementById('l-range').value=l;document.getElementById('l-val').textContent=l;
}
function renderBgSwatch(){drawCheckerOnCanvas(document.getElementById('swatch-bg'), bgColor, 5);}

// ═══════════════════════ 최근 색 (배치2) ═══════════════════════
function pushRecent(c){
  if(!c)return; // 투명색은 기록 안 함
  recentColors=[c,...recentColors.filter(x=>x!==c)].slice(0,8);
  renderRecent();
}
function renderRecent(){
  const grid=document.getElementById('recent-grid');if(!grid)return;
  grid.innerHTML='';
  if(!recentColors.length){grid.innerHTML='<span style="font-size:10px;color:var(--text3);grid-column:1/-1">아직 없음</span>';return;}
  recentColors.forEach(c=>{
    const cv=document.createElement('canvas');cv.width=16;cv.height=16;
    cv.className='p-swatch';cv.title=c;
    drawCheckerOnCanvas(cv,c,4);
    if(c===fgColor)cv.classList.add('sel-fg');
    cv.addEventListener('click',()=>{setFgColor(c);buildPalette();renderRecent();});
    cv.addEventListener('contextmenu',e=>{e.preventDefault();bgColor=c;renderBgSwatch();buildPalette();});
    grid.appendChild(cv);
  });
}

// ═══════════════════════ PALETTE ═══════════════════════
function buildPalette(){
  const grid=document.getElementById('palette-grid');grid.innerHTML='';
  const all=[...paletteColors,...userColors];document.getElementById('palette-count').textContent='('+all.length+')';
  all.forEach(c=>{
    const cv=document.createElement('canvas');cv.width=16;cv.height=16;
    cv.className='p-swatch';cv.title=c;
    drawCheckerOnCanvas(cv,c,4);
    if(c===fgColor)cv.classList.add('sel-fg');
    if(c===bgColor)cv.classList.add('sel-bg');
    cv.addEventListener('click',()=>{setFgColor(c);buildPalette();});
    cv.addEventListener('contextmenu',e=>{e.preventDefault();bgColor=c;renderBgSwatch();buildPalette();});
    grid.appendChild(cv);
  });
}
