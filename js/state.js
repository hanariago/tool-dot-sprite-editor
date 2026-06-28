// ═══════════════════════ STATE ═══════════════════════
let SIZE=32,ZOOM=10,offsetX=0,offsetY=0,pixels=[],fgColor='#000000ff',bgColor=null,tool='draw',showGrid=true,showBg=true;
let history=[],histIdx=-1,isPointerDown=false,isMidPanning=false;
let midPanStartX=0,midPanStartY=0,midPanOriginX=0,midPanOriginY=0,lastPos=null;
let showPrevGrid=true;
// ── 그리기 엔진 확장 상태 (배치1) ──
let brushSize=1;            // 1 / 2 / 3 px
let mirrorMode='none';      // none / h(좌우) / v(상하) / hv(사방)
let shapeStart=null;        // 선/도형 도구 시작점
const SHAPE_TOOLS=['line','rect','ellipse'];
let showTile=false;         // 타일(3x3 반복) 미리보기 (배치3)
let showPrevChecker=true;   // 미리보기 체커(투명) 배경 표시
let showPrevBox=true;       // 미리보기 박스(테두리 사각형) 표시
let spaceHeld=false;        // Space 키 누름 → 패닝 모드 (배치3)
let frames=[];              // 프레임 배열(각 SIZE×SIZE 픽셀 2D) (배치4)
let curFrame=0;             // 현재 편집 프레임 인덱스
let onionSkin=false;        // 어니언 스킨(이전/다음 프레임 고스트) (모션)
let playTimer=null;         // 애니메이션 재생 타이머
let playIdx=0;              // 재생 중 프레임 인덱스
let cfg={keyClaud:'',keyGpt:'',keyGrok:'',keyGemini:'',defSize:32,defZoom:10,hermesUrl:'http://localhost:8642/v1',hermesKey:''};
function loadCfg(){try{const s=localStorage.getItem('sprite_cfg2');if(s)Object.assign(cfg,JSON.parse(s));}catch(e){}}
function saveCfg(){try{localStorage.setItem('sprite_cfg2',JSON.stringify(cfg));}catch(e){}}
loadCfg();

// ── ZOOM 정수 스냅 (BUG-1) ──────────────────────────
// ZOOM이 float이면 SIZE*ZOOM에 서브픽셀 오차가 생겨 격자가 어긋난다.
// 항상 아래 정수 스텝 중 하나만 ZOOM 값으로 사용한다.
const ZOOM_STEPS=[1,2,3,4,5,6,7,8,10,12,14,16,20,24,28,32,40,48,56,64];
// 임의의 float z에서 가장 가까운 스텝 인덱스
function nearestZoomIdx(z){
  let bi=0,bd=Infinity;
  for(let i=0;i<ZOOM_STEPS.length;i++){const d=Math.abs(ZOOM_STEPS[i]-z);if(d<bd){bd=d;bi=i;}}
  return bi;
}
// float z를 가장 가까운 스텝 값으로 스냅
function snapZoom(z){return ZOOM_STEPS[nearestZoomIdx(z)];}
// 방향(dir:+1 확대/-1 축소)으로 한 스텝 이동. 현재 ZOOM이 스텝 위에 없으면 가까운 곳 기준.
function zoomStep(dir){
  let i=ZOOM_STEPS.indexOf(ZOOM);
  if(i===-1)i=nearestZoomIdx(ZOOM);
  i=Math.max(0,Math.min(ZOOM_STEPS.length-1,i+dir));
  return ZOOM_STEPS[i];
}

// ═══════════════════════ PALETTES ═══════════════════════
const FP={8:['#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff'],16:['#000000','#ffffff','#ff0000','#c0c0c0','#808080','#800000','#ffff00','#808000','#00ff00','#008000','#00ffff','#008080','#0000ff','#000080','#ff00ff','#800080'],32:null,64:null,128:null,256:null,0:null};
function grayH(v){return'#'+v.toString(16).padStart(2,'0').repeat(3)}
function hslH(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>Math.round((l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1))))*255);return'#'+[f(0),f(8),f(4)].map(v=>v.toString(16).padStart(2,'0')).join('')}
function buildHSL(){const c=[];for(let i=0;i<=10;i++)c.push(grayH(Math.round(i*25.5)));for(let h=0;h<360;h+=30)for(const s of[60,80,100])for(const l of[25,45,70])c.push(hslH(h,s,l));return c;}
function buildN(n){const r=Math.ceil(n**(1/3)),c=[];for(let ri=0;ri<r;ri++)for(let gi=0;gi<r;gi++)for(let bi=0;bi<r;bi++){if(c.length>=n)break;c.push('#'+[ri,gi,bi].map(v=>Math.round(v*(255/(r-1||1))).toString(16).padStart(2,'0')).join(''));}return c;}
// 표준 256색: 웹세이프 216(6×6×6) + 회색 40
function build256(){
  const c=[],lv=[0,51,102,153,204,255];
  for(const r of lv)for(const g of lv)for(const b of lv)c.push('#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''));
  for(let i=0;i<40;i++){const v=Math.round(i*255/39);c.push('#'+v.toString(16).padStart(2,'0').repeat(3));}
  return c; // 216 + 40 = 256
}
FP[32]=buildN(32);FP[64]=buildN(64);FP[128]=buildN(128);FP[256]=build256();FP[0]=buildHSL();
let paletteColors=[...FP[8]],userColors=[],curBits=8;
let recentColors=[];       // 최근 사용한 전경색 (최대 8, 배치2)

// ═══════════════════════ CANVAS REFS ═══════════════════════
const canvasVP=document.getElementById('canvas-viewport');
const bgC=document.getElementById('bg-layer');
const mainC=document.getElementById('canvas-layer'),gridC=document.getElementById('grid-layer');
const bgCtx=bgC.getContext('2d'),mainCtx=mainC.getContext('2d'),gridCtx=gridC.getContext('2d');
