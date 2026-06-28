// ═══════════════════════ 그리기 엔진 (브러시 · 대칭 · 도형) ═══════════════════════
// 모든 픽셀 쓰기는 paint()를 거친다 → 브러시 크기 × 대칭이 일괄 적용된다.

// 대칭 좌표: (x,y) + 모드에 따른 미러 좌표들
function mirrorCoords(x,y){
  const list=[[x,y]];
  const mx=SIZE-1-x, my=SIZE-1-y;
  if(mirrorMode==='h'||mirrorMode==='hv')list.push([mx,y]);
  if(mirrorMode==='v'||mirrorMode==='hv')list.push([x,my]);
  if(mirrorMode==='hv')list.push([mx,my]);
  return list;
}
// 브러시 크기에 따른 셀 좌표 (1:1칸, 2:2x2, 3:3x3 중심)
function brushCells(x,y){
  if(brushSize<=1)return[[x,y]];
  if(brushSize===2)return[[x,y],[x+1,y],[x,y+1],[x+1,y+1]];
  const cells=[];
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)cells.push([x+dx,y+dy]);
  return cells;
}
// 한 점에 브러시+대칭 적용해서 그리기
function paint(x,y,c){
  for(const[bx,by] of brushCells(x,y))
    for(const[px,py] of mirrorCoords(bx,by))
      drawPx(px,py,c);
}

// ── 도형 좌표 계산 (외곽선) ──
function linePts(a,b){
  const pts=[];const dx=b.x-a.x,dy=b.y-a.y,steps=Math.max(Math.abs(dx),Math.abs(dy));
  if(steps===0)return[[a.x,a.y]];
  for(let i=0;i<=steps;i++)pts.push([Math.round(a.x+dx*i/steps),Math.round(a.y+dy*i/steps)]);
  return pts;
}
function rectPts(a,b){
  const x0=Math.min(a.x,b.x),x1=Math.max(a.x,b.x),y0=Math.min(a.y,b.y),y1=Math.max(a.y,b.y);
  const pts=[];
  for(let x=x0;x<=x1;x++){pts.push([x,y0],[x,y1]);}
  for(let y=y0;y<=y1;y++){pts.push([x0,y],[x1,y]);}
  return pts;
}
function ellipsePts(a,b){
  const x0=Math.min(a.x,b.x),x1=Math.max(a.x,b.x),y0=Math.min(a.y,b.y),y1=Math.max(a.y,b.y);
  const rx=(x1-x0)/2,ry=(y1-y0)/2,cx=(x0+x1)/2,cy=(y0+y1)/2;
  if(rx<0.5&&ry<0.5)return[[Math.round(cx),Math.round(cy)]];
  const steps=Math.max(16,Math.round((rx+ry)*4)),pts=[];
  for(let i=0;i<steps;i++){const t=i/steps*2*Math.PI;pts.push([Math.round(cx+rx*Math.cos(t)),Math.round(cy+ry*Math.sin(t))]);}
  return pts;
}
function shapePts(tl,a,b){
  if(tl==='line')return linePts(a,b);
  if(tl==='rect')return rectPts(a,b);
  if(tl==='ellipse')return ellipsePts(a,b);
  return[];
}

// 도형을 실제 픽셀에 확정 (브러시+대칭 paint 경유)
function commitShape(a,b){
  for(const[x,y] of shapePts(tool,a,b))paint(x,y,fgColor);
}
// 드래그 중 프리뷰: pixels 백업 → 임시 그리기 → 렌더 → 복원
function previewShape(a,b){
  const backup=pixels.map(r=>[...r]);
  for(const[x,y] of shapePts(tool,a,b))paint(x,y,fgColor);
  renderAll();
  pixels=backup;
}
