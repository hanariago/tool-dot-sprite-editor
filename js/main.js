// ═══════════════════════ INIT ═══════════════════════
SIZE=cfg.defSize||32;ZOOM=snapZoom(cfg.defZoom||10);
document.getElementById('sel-size').value=String(SIZE);
paletteColors=[...FP[8]];buildPalette();renderRecent();renderBgSwatch();
setFgColor('#000000ff');initCanvas();initFrames();snap();setTool('draw');
document.getElementById('st-size').textContent=SIZE+'x'+SIZE;
document.getElementById('st-zoom').textContent='x'+ZOOM;
updateUndoUI();
canvasVP._lastVw=canvasVP.clientWidth;canvasVP._lastVh=canvasVP.clientHeight;
populateModels('claude');
// i18n 초기화 + 언어 토글
document.getElementById('btn-lang').addEventListener('click',toggleLang);
applyI18n(detectLang());
