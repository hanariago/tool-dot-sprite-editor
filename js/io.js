// ═══════════════════════ SAVE / LOAD / EXPORT ═══════════════════════
document.getElementById('btn-save-file').addEventListener('click',()=>{commitCurrentFrame();const blob=new Blob([JSON.stringify({version:3,size:SIZE,frames,curFrame,userColors,curBits})],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='sprite_'+SIZE+'x'+SIZE+'_'+frames.length+'f_'+Date.now()+'.sprite';a.click();});
document.getElementById('btn-load-file').addEventListener('click',()=>document.getElementById('load-input').click());
document.getElementById('load-input').addEventListener('change',function(){const f=this.files[0];if(!f)return;const r=new FileReader();r.onload=e=>{try{
  const d=JSON.parse(e.target.result);SIZE=d.size;userColors=d.userColors||[];
  if(Array.isArray(d.frames)&&d.frames.length){frames=d.frames.map(cloneGrid);curFrame=Math.min(d.curFrame||0,frames.length-1);pixels=cloneGrid(frames[curFrame]);}
  else{pixels=d.pixels;frames=[cloneGrid(pixels)];curFrame=0;} // v2 하위호환
  document.getElementById('sel-size').value=String(SIZE);document.getElementById('st-size').textContent=SIZE+'x'+SIZE;
  resetHistory();
  centerCanvas();renderAll();buildPalette();renderFramesBar();
}catch{alert('파일 형식 오류');}};r.readAsText(f);this.value='';});
// PNG 내보내기 (배율 선택) — 현재 프레임, nearest로 도트 유지
function updatePngInfo(){const s=parseInt(document.getElementById('png-scale').value)||1;document.getElementById('png-info').textContent=SIZE+'×'+SIZE+' → '+(SIZE*s)+'×'+(SIZE*s)+'px';}
document.getElementById('btn-export').addEventListener('click',()=>{updatePngInfo();document.getElementById('png-overlay').classList.add('open');});
document.getElementById('png-scale').addEventListener('change',updatePngInfo);
document.getElementById('png-cancel').addEventListener('click',()=>document.getElementById('png-overlay').classList.remove('open'));
document.getElementById('png-run').addEventListener('click',()=>{
  const s=parseInt(document.getElementById('png-scale').value)||1;
  const oc=document.createElement('canvas');oc.width=SIZE*s;oc.height=SIZE*s;const octx=oc.getContext('2d');
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){if(pixels[y][x]){octx.fillStyle=pixels[y][x];octx.fillRect(x*s,y*s,s,s);}}
  const a=document.createElement('a');a.href=oc.toDataURL('image/png');a.download='sprite_'+SIZE+'x'+SIZE+(s>1?('_x'+s):'')+'.png';a.click();
  document.getElementById('png-overlay').classList.remove('open');
});

// ═══════════════════════ 팔레트 저장 / 불러오기 (배치2) ═══════════════════════
document.getElementById('btn-pal-save').addEventListener('click',()=>{
  const colors=[...paletteColors,...userColors];
  const blob=new Blob([JSON.stringify({type:'sprite-palette',version:1,colors})],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='palette_'+colors.length+'_'+Date.now()+'.pal';a.click();
});
document.getElementById('btn-pal-load').addEventListener('click',()=>document.getElementById('pal-input').click());
document.getElementById('pal-input').addEventListener('change',function(){
  const f=this.files[0];if(!f)return;const r=new FileReader();
  r.onload=e=>{try{
    const d=JSON.parse(e.target.result);
    const colors=Array.isArray(d)?d:d.colors;
    if(!Array.isArray(colors)||!colors.length)throw 0;
    // 유효한 hex만 채택, 불러온 팔레트로 전체 교체
    paletteColors=colors.filter(c=>typeof c==='string'&&/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(c));
    userColors=[];buildPalette();
  }catch{alert('팔레트 파일 형식 오류');}};
  r.readAsText(f);this.value='';
});

// ═══════════════════════ SETTINGS (일반만 — API 키는 AI 모달로 이동) ═══════════════════════
document.getElementById('btn-settings').addEventListener('click',()=>{document.getElementById('cfg-defsize').value=String(cfg.defSize);document.getElementById('cfg-defzoom').value=String(cfg.defZoom);document.getElementById('settings-overlay').classList.add('open');});
document.getElementById('settings-cancel').addEventListener('click',()=>document.getElementById('settings-overlay').classList.remove('open'));
document.getElementById('settings-save').addEventListener('click',()=>{cfg.defSize=parseInt(document.getElementById('cfg-defsize').value);cfg.defZoom=parseInt(document.getElementById('cfg-defzoom').value);saveCfg();document.getElementById('settings-overlay').classList.remove('open');});
// AI 모달 탭 전환
document.querySelectorAll('.aitab').forEach(t=>{t.addEventListener('click',()=>{document.querySelectorAll('.aitab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.aipane').forEach(x=>x.classList.remove('active'));t.classList.add('active');document.getElementById('aitab-'+t.dataset.aitab).classList.add('active');});});

// ═══════════════════════ LLM MODELS ═══════════════════════
const MODELS={
  claude:[{id:'claude-sonnet-4-6',label:'Claude Sonnet 4.6 (최신)'},{id:'claude-opus-4-5',label:'Claude Opus 4.5'},{id:'claude-sonnet-4-5',label:'Claude Sonnet 4.5'},{id:'claude-haiku-4-5',label:'Claude Haiku 4.5 (빠름)'},{id:'custom',label:'직접입력...'}],
  gpt:[{id:'gpt-4o',label:'GPT-4o (최신)'},{id:'gpt-4o-mini',label:'GPT-4o mini (빠름)'},{id:'gpt-4.1',label:'GPT-4.1'},{id:'gpt-4.1-mini',label:'GPT-4.1 mini'},{id:'o4-mini',label:'o4-mini'},{id:'o3',label:'o3'},{id:'custom',label:'직접입력...'}],
  grok:[{id:'grok-3',label:'Grok 3 (최신)'},{id:'grok-3-fast',label:'Grok 3 Fast'},{id:'grok-3-mini',label:'Grok 3 mini'},{id:'grok-2-1212',label:'Grok 2'},{id:'custom',label:'직접입력...'}],
  gemini:[{id:'gemini-2.5-pro-preview-06-05',label:'Gemini 2.5 Pro (최신)'},{id:'gemini-2.5-flash-preview-05-20',label:'Gemini 2.5 Flash'},{id:'gemini-2.0-flash',label:'Gemini 2.0 Flash'},{id:'gemini-1.5-pro',label:'Gemini 1.5 Pro'},{id:'custom',label:'직접입력...'}],
  hermes:[{id:'custom',label:'모델 ID 직접입력 (또는 목록 버튼)'}]
};
function populateModels(p){const sel=document.getElementById('llm-model');sel.innerHTML='';(MODELS[p]||[]).forEach(m=>{const o=document.createElement('option');o.value=m.id;o.textContent=m.label;sel.appendChild(o);});document.getElementById('llm-model-custom').style.display='none';document.getElementById('btn-custom-model').classList.remove('active');
  // Hermes: 모델 목록 불러오기 버튼 노출 + 기본 직접입력 모드
  const loadBtn=document.getElementById('btn-load-models');
  if(p==='hermes'){loadBtn.style.display='';sel.value='custom';document.getElementById('llm-model-custom').style.display='block';}
  else{loadBtn.style.display='none';}
}
// Hermes /v1/models 에서 모델 목록 가져와 드롭다운 채우기
async function loadHermesModels(){
  const st=document.getElementById('llm-status');
  if(!cfg.hermesKey){st.textContent='먼저 Hermes 키를 입력하세요.';return;}
  st.textContent='모델 목록 불러오는 중...';
  try{
    const res=await fetch(hermesBase()+'/models',{headers:{'Authorization':'Bearer '+cfg.hermesKey}});
    const d=await res.json();
    const list=(d.data||d.models||[]).map(m=>m.id||m).filter(Boolean);
    if(!list.length)throw new Error('모델이 비어있음');
    const sel=document.getElementById('llm-model');sel.innerHTML='';
    list.forEach(id=>{const o=document.createElement('option');o.value=id;o.textContent=id;sel.appendChild(o);});
    const o=document.createElement('option');o.value='custom';o.textContent='직접입력...';sel.appendChild(o);
    document.getElementById('llm-model-custom').style.display='none';
    st.textContent=list.length+'개 모델 로드됨.';
  }catch(err){st.textContent='목록 실패: '+err.message+' (주소/키/CORS 확인)';}
}
document.getElementById('llm-provider').addEventListener('change',function(){populateModels(this.value);syncKeyArea();});
document.getElementById('llm-model').addEventListener('change',function(){const show=this.value==='custom';document.getElementById('llm-model-custom').style.display=show?'block':'none';document.getElementById('btn-custom-model').classList.toggle('active',show);});
document.getElementById('btn-custom-model').addEventListener('click',()=>{document.getElementById('llm-model').value='custom';document.getElementById('llm-model-custom').style.display='block';document.getElementById('btn-custom-model').classList.add('active');document.getElementById('llm-model-custom').focus();});
document.getElementById('btn-load-models').addEventListener('click',loadHermesModels);
function getSelectedModel(){const sel=document.getElementById('llm-model');return sel.value==='custom'?document.getElementById('llm-model-custom').value.trim():sel.value;}
const KEYFIELD={claude:'keyClaud',gpt:'keyGpt',grok:'keyGrok',gemini:'keyGemini'};
const KEYHELP={claude:'console.anthropic.com → API Keys',gpt:'platform.openai.com → API Keys',grok:'console.x.ai → API Keys',gemini:'aistudio.google.com → Get API Key'};
function getApiKey(){const p=document.getElementById('llm-provider').value;return{claude:cfg.keyClaud,gpt:cfg.keyGpt,grok:cfg.keyGrok,gemini:cfg.keyGemini,hermes:cfg.hermesKey}[p]||'';}
// Hermes(또는 OpenAI 호환) Base URL — 끝 슬래시 정리
function hermesBase(){return (cfg.hermesUrl||'http://localhost:8642/v1').replace(/\/+$/,'');}
// 선택한 서비스에 맞춰 키 입력칸 표시/채우기
function syncKeyArea(){
  const p=document.getElementById('llm-provider').value;
  const std=document.getElementById('key-row-std'),herm=document.getElementById('key-row-hermes');
  if(p==='hermes'){std.style.display='none';herm.style.display='block';document.getElementById('ai-hermes-url').value=cfg.hermesUrl;document.getElementById('ai-hermes-key').value=cfg.hermesKey;}
  else{herm.style.display='none';std.style.display='block';document.getElementById('ai-key').value=cfg[KEYFIELD[p]]||'';document.getElementById('ai-key-help').textContent=KEYHELP[p]||'';}
}
document.getElementById('ai-key').addEventListener('input',function(){const p=document.getElementById('llm-provider').value;if(KEYFIELD[p]){cfg[KEYFIELD[p]]=this.value.trim();saveCfg();}});
document.getElementById('ai-hermes-url').addEventListener('input',function(){cfg.hermesUrl=this.value.trim()||'http://localhost:8642/v1';saveCfg();});
document.getElementById('ai-hermes-key').addEventListener('input',function(){cfg.hermesKey=this.value.trim();saveCfg();});

// ── 결과 타입 (1프레임 / 모션) ──
function frameType(){const r=document.querySelector('input[name=frametype]:checked');return r?r.value:'single';}
function isMotion(){return frameType()==='motion';}

// ── 방식 (JSON 픽셀 / 이미지→도트) ──
const IMAGE_MODELS=[
  {id:'gemini-2.5-flash-image',label:'Nano Banana (2.5 Flash Image)'},
  {id:'gemini-3.1-flash-image-preview',label:'Nano Banana 2 (3.1, 유료)'},
  {id:'gemini-3-pro-image-preview',label:'Nano Banana Pro (3 Pro, 유료)'},
  {id:'custom',label:'직접입력...'}
];
function outputMode(){const r=document.querySelector('input[name=outputmode]:checked');return r?r.value:'json';}
function applyOutputMode(){
  const img=outputMode()==='image';
  document.getElementById('provider-field').style.display=img?'none':'block';
  document.getElementById('image-mode-note').style.display=img?'block':'none';
  document.getElementById('btn-test-conn').style.display=img?'none':'inline-block';
  // 프롬프트 복사 탭: 이미지 모드면 JSON 섹션 숨기고 임포트 안내 표시
  document.getElementById('manual-json').style.display=img?'none':'block';
  document.getElementById('manual-image').style.display=img?'block':'none';
  document.getElementById('btn-copy-prompt').textContent=img?'① 도트 이미지 프롬프트 복사 → 구독 이미지 AI에 붙여넣기':'① 프롬프트 복사 → 구독 채팅에 붙여넣기';
  // 결과 타입(모션) — 이미지 모드는 1프레임만 (애니메이션 일관성 어려움)
  document.querySelectorAll('input[name=frametype]').forEach(r=>{r.disabled=img;if(img&&r.value==='single')r.checked=true;});
  if(img){
    document.getElementById('llm-provider').value='gemini'; // 이미지 생성은 Gemini 고정
    const sel=document.getElementById('llm-model');sel.innerHTML='';
    IMAGE_MODELS.forEach(m=>{const o=document.createElement('option');o.value=m.id;o.textContent=m.label;sel.appendChild(o);});
    document.getElementById('llm-model-custom').style.display='none';
    document.getElementById('btn-load-models').style.display='none';
    syncKeyArea(); // gemini 키 표시
  }else{
    populateModels(document.getElementById('llm-provider').value);
    syncKeyArea();
  }
}
document.querySelectorAll('input[name=outputmode]').forEach(r=>r.addEventListener('change',applyOutputMode));

// Gemini(Nano Banana) 이미지 생성 → data URL 반환
async function genGeminiImage(model,apiKey,prompt){
  const url='https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent?key='+apiKey;
  const body={contents:[{parts:[{text:prompt}]}],generationConfig:{responseModalities:['TEXT','IMAGE']}};
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const d=await res.json();
  if(d.error)throw new Error(d.error.message);
  const parts=(d.candidates&&d.candidates[0]&&d.candidates[0].content&&d.candidates[0].content.parts)||[];
  const part=parts.find(p=>p.inlineData||p.inline_data);
  const inline=part&&(part.inlineData||part.inline_data);
  if(!inline||!inline.data)throw new Error('응답에 이미지가 없습니다 (모델 ID 확인)');
  return 'data:'+(inline.mimeType||inline.mime_type||'image/png')+';base64,'+inline.data;
}

// ── 팔레트 색상 제한 (프롬프트에 주입) ──
function usePalette(){const c=document.getElementById('use-palette');return!!(c&&c.checked);}
function paletteList(){return[...paletteColors,...userColors].slice(0,48);}
function paletteConstraintText(){
  if(!usePalette())return'';
  return '\nUse ONLY these hex colors and no others: '+paletteList().join(', ')+' (append "ff" for full opacity).';
}

// ── 공용 프롬프트 / 픽셀 적용 ──
function buildSystemPrompt(multi){
  let base;
  if(multi){
    const n=frames.length;
    base='You are a pixel art animation generator. Output ONLY a JSON object with a "frames" key (array), nothing else, no markdown.\nProduce exactly '+n+' frames for a smooth looping animation. Each frame is {"pixels": <'+SIZE+'x'+SIZE+' 2D array>}. Each cell: null (transparent) OR a hex color "#rrggbbaa".\nKeep the character/object consistent across frames; only move what should move.';
  }else{
    base='You are a pixel art generator. Output ONLY a JSON object with a "pixels" key, nothing else, no markdown.\nThe pixels value must be a '+SIZE+'x'+SIZE+' 2D array. Each cell: null (transparent) OR a hex color "#rrggbbaa" (8 hex chars).\nDraw a clear, recognizable, iconic pixel art. Use bold solid colors.';
  }
  return base+paletteConstraintText();
}
function buildUserText(prompt,multi){
  return multi
    ? 'Draw a '+SIZE+'x'+SIZE+' pixel art animation of: '+prompt+'. Return exactly '+frames.length+' frames in the "frames" array.'
    : 'Draw a '+SIZE+'x'+SIZE+' pixel art of: '+prompt;
}
// 도트(픽셀아트) 이미지 생성용 프롬프트 (텍스트→이미지 AI에 붙여넣기)
function buildImagePrompt(){
  const p=document.getElementById('llm-prompt').value.trim()||'(여기에 그릴 내용을 적으세요)';
  return 'Generate TRUE pixel art (도트 그림) of: '+p+'.\n'
    +'- '+SIZE+'x'+SIZE+' pixel grid look — each pixel is a LARGE solid square block (chunky pixels), aligned to the grid.\n'
    +'- Hard edges only. NO anti-aliasing, NO blur, NO gradient, NO smooth shading.\n'
    +'- Limited flat color palette, clear dark 1px outline. 16-bit retro game sprite (SNES/NES JRPG) style.\n'
    +'- Single subject, centered, full body, plain solid white background, no drop shadow.\n'
    +'- Square 1:1 image.\n'
    +(usePalette()?'- Use ONLY this color palette, no other colors: '+paletteList().join(', ')+'.\n':'')
    +'(이 도트 이미지를 "이미지 임포트"로 '+SIZE+'×'+SIZE+' 도트로 변환합니다.)';
}
function buildManualPrompt(){
  if(outputMode()==='image')return buildImagePrompt();
  const p=document.getElementById('llm-prompt').value.trim()||'(여기에 그릴 내용을 적으세요)';
  const multi=isMotion();
  return buildSystemPrompt(multi)+'\n\n'+buildUserText(p,multi);
}
// 2D 배열 g를 현재 SIZE 기준 정규화(유효 hex만, 나머지 null)
function normalizeGrid(g){return Array.from({length:SIZE},(_,y)=>Array.from({length:SIZE},(_,x)=>{const row=g[y];if(!row)return null;const c=row[x];if(!c||c==='null')return null;return typeof c==='string'&&c.startsWith('#')?c:null;}));}
// parsed가 {frames:[...]} 또는 {pixels:[...]} — 자동 판별해 적용
function applyParsedResult(parsed){
  if(parsed&&Array.isArray(parsed.frames)){
    const grids=parsed.frames.map(f=>Array.isArray(f)?f:(f&&f.pixels)).filter(g=>Array.isArray(g));
    if(!grids.length)throw new Error('frames가 비어있음');
    const ph=grids[0].length,prevSize=SIZE;
    if(ph!==SIZE&&[8,16,32,48,64,96,128].includes(ph)){SIZE=ph;document.getElementById('sel-size').value=String(SIZE);document.getElementById('st-size').textContent=SIZE+'x'+SIZE;}
    frames=grids.map(normalizeGrid);curFrame=0;pixels=frames[0].map(r=>[...r]);
    if(SIZE!==prevSize)centerCanvas();
    resetHistory();
    renderAll();renderFramesBar();
    return grids.length;
  }
  if(parsed&&Array.isArray(parsed.pixels)){
    const ph=parsed.pixels.length,prevSize=SIZE;
    if(ph!==SIZE&&[8,16,32,48,64,96,128].includes(ph)){SIZE=ph;document.getElementById('sel-size').value=String(SIZE);document.getElementById('st-size').textContent=SIZE+'x'+SIZE;}
    pixels=normalizeGrid(parsed.pixels);
    if(SIZE!==prevSize){centerCanvas();initFrames();}
    snap();renderAll();
    return 1;
  }
  throw new Error('pixels / frames 키가 없음');
}

// ── 수동: 프롬프트 복사 ──
function fallbackCopy(text){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();let ok=false;try{ok=document.execCommand('copy');}catch(e){}document.body.removeChild(ta);return ok;}
function copyDrawPrompt(){
  const st=document.getElementById('llm-status');const text=buildManualPrompt();
  const done=()=>{st.textContent='✅ 프롬프트 복사됨! 구독 채팅에 붙여넣고, 받은 JSON을 아래 칸에 넣으세요.';};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(done).catch(()=>{fallbackCopy(text)?done():st.textContent='복사 실패 — 수동 복사가 막혔어요.';});}
  else{fallbackCopy(text)?done():st.textContent='복사 실패 — 브라우저가 막았습니다.';}
}
// ── 수동: JSON 붙여넣기 적용 ──
function applyPastedJSON(){
  const st=document.getElementById('llm-status');
  const raw=document.getElementById('paste-json').value.trim();
  if(!raw){st.textContent='붙여넣을 JSON이 없습니다.';return;}
  try{
    const jm=raw.match(/\{[\s\S]*\}/);
    const parsed=JSON.parse(jm?jm[0]:raw);
    const n=applyParsedResult(parsed);
    st.textContent=n>1?('✅ 완료! '+n+'프레임이 그려졌어요.'):'✅ 완료! 캔버스에 그려졌어요.';
    document.getElementById('paste-json').value='';
    setTimeout(()=>document.getElementById('llm-overlay').classList.remove('open'),1300);
  }catch(err){st.textContent='JSON 오류: '+err.message;}
}

// ═══════════════════════ LLM DRAW ═══════════════════════
document.getElementById('btn-llm').addEventListener('click',()=>{
  document.getElementById('ft-n').textContent=frames.length;
  document.getElementById('pal-n').textContent='('+[...paletteColors,...userColors].length+'색)';
  document.getElementById('llm-status').textContent='';
  // 항상 '자동 연결' 탭 + JSON 방식으로 초기화
  document.querySelectorAll('.aitab').forEach(x=>x.classList.toggle('active',x.dataset.aitab==='auto'));
  document.querySelectorAll('.aipane').forEach(x=>x.classList.toggle('active',x.id==='aitab-auto'));
  document.querySelector('input[name=outputmode][value=json]').checked=true;
  applyOutputMode(); // populateModels + syncKeyArea 포함
  document.getElementById('llm-overlay').classList.add('open');
});
document.getElementById('llm-cancel').addEventListener('click',()=>document.getElementById('llm-overlay').classList.remove('open'));
document.getElementById('btn-copy-prompt').addEventListener('click',copyDrawPrompt);
document.getElementById('btn-apply-json').addEventListener('click',applyPastedJSON);
document.getElementById('btn-open-import').addEventListener('click',()=>{document.getElementById('llm-overlay').classList.remove('open');openImportModal();});

// 서비스별 호출 → 응답 텍스트 반환 (생성·테스트 공용)
async function callLLM(provider,model,apiKey,systemPrompt,userText,maxTokens){
  if(provider==='claude'){
    const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},body:JSON.stringify({model,max_tokens:maxTokens,system:systemPrompt,messages:[{role:'user',content:userText}]})});
    const d=await res.json();if(d.error)throw new Error(d.error.message);
    return d.content.filter(b=>b.type==='text').map(b=>b.text).join('');
  }
  if(provider==='gpt'||provider==='grok'||provider==='hermes'){
    const url=provider==='gpt'?'https://api.openai.com/v1/chat/completions':provider==='grok'?'https://api.x.ai/v1/chat/completions':hermesBase()+'/chat/completions';
    const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},body:JSON.stringify({model,max_tokens:maxTokens,messages:[{role:'system',content:systemPrompt},{role:'user',content:userText}]})});
    const d=await res.json();if(d.error)throw new Error(d.error.message||JSON.stringify(d.error));
    return d.choices[0].message.content;
  }
  if(provider==='gemini'){
    const url='https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent?key='+apiKey;
    const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:systemPrompt+'\n\n'+userText}]}],generationConfig:{maxOutputTokens:maxTokens}})});
    const d=await res.json();if(d.error)throw new Error(d.error.message);
    return d.candidates[0].content.parts.map(p=>p.text).join('');
  }
  throw new Error('알 수 없는 서비스');
}

// 연결 테스트
document.getElementById('btn-test-conn').addEventListener('click',async()=>{
  const provider=document.getElementById('llm-provider').value,model=getSelectedModel(),apiKey=getApiKey();
  const st=document.getElementById('llm-status');
  if(!apiKey){st.textContent='❌ 키(또는 Hermes 키)를 먼저 입력하세요.';return;}
  if(!model){st.textContent='❌ 모델을 선택/입력하세요.';return;}
  st.textContent='🔌 연결 테스트 중...';document.getElementById('btn-test-conn').disabled=true;
  try{
    const out=await callLLM(provider,model,apiKey,'You are a connection test.','Reply with exactly: OK',16);
    st.textContent=(out&&out.trim())?('✅ 연결 성공! ('+model+')'):'⚠️ 응답이 비었어요. 모델 ID를 확인하세요.';
  }catch(err){st.textContent='❌ 실패: '+err.message+'  (키·모델·주소·CORS 확인)';}
  document.getElementById('btn-test-conn').disabled=false;
});

// 생성
document.getElementById('llm-run').addEventListener('click',async()=>{
  const provider=document.getElementById('llm-provider').value,model=getSelectedModel(),apiKey=getApiKey(),prompt=document.getElementById('llm-prompt').value.trim();
  const statusEl=document.getElementById('llm-status');
  if(!prompt){statusEl.textContent='그려줄 내용을 입력해 주세요.';return;}
  if(!apiKey){statusEl.textContent='API 키(또는 Hermes 키)를 입력해 주세요.';return;}
  if(!model){statusEl.textContent='모델을 선택하거나 입력해 주세요.';return;}
  document.getElementById('llm-run').disabled=true;
  try{
    if(outputMode()==='image'){
      // 이미지 생성(Nano Banana) → 이미지 임포트 모달로 전달
      statusEl.textContent='🎨 이미지 생성 중... (수십 초 걸릴 수 있어요)';
      const imgPrompt=prompt+', retro pixel art sprite, flat bold colors, simple shapes, plain solid background, centered, full body';
      const dataUrl=await genGeminiImage(model,apiKey,imgPrompt);
      const blob=await (await fetch(dataUrl)).blob();
      document.getElementById('llm-overlay').classList.remove('open');
      openImportModal();
      await loadImportFile(blob);
      statusEl.textContent='';
    }else{
      const multi=isMotion();
      statusEl.textContent=multi?('AI가 '+frames.length+'프레임 그리는 중...'):'AI가 그리는 중...';
      const rt=await callLLM(provider,model,apiKey,buildSystemPrompt(multi),buildUserText(prompt,multi),8192);
      const jm=rt.match(/\{[\s\S]*\}/);if(!jm)throw new Error('JSON을 찾을 수 없음');
      const n=applyParsedResult(JSON.parse(jm[0]));
      statusEl.textContent=n>1?('완료! '+n+'프레임 생성됨.'):'완료! 직접 수정해 보세요.';
      setTimeout(()=>document.getElementById('llm-overlay').classList.remove('open'),1400);
    }
  }catch(err){statusEl.textContent='실패: '+err.message;}
  document.getElementById('llm-run').disabled=false;
});

document.getElementById('fmt-help-btn').addEventListener('click',()=>document.getElementById('fmt-overlay').classList.add('open'));
document.getElementById('fmt-close').addEventListener('click',()=>document.getElementById('fmt-overlay').classList.remove('open'));

// ═══════════════════════ CONFIRM ═══════════════════════
function showConfirm(title,msg,btns){document.getElementById('confirm-title').textContent=title;document.getElementById('confirm-msg').textContent=msg;const bc=document.getElementById('confirm-btns');bc.innerHTML='';btns.forEach(b=>{const el=document.createElement('button');el.textContent=b.label;if(b.cls)el.className=b.cls;el.onclick=()=>{document.getElementById('confirm-overlay').classList.remove('open');b.fn();};bc.appendChild(el);});document.getElementById('confirm-overlay').classList.add('open');}
document.querySelectorAll('.overlay').forEach(ov=>{ov.addEventListener('click',e=>{if(e.target===ov)ov.classList.remove('open');});});

// ═══════════════════════ WINDOW RESIZE - keep canvas centered ═══════════════════════
let resizeTimer;
window.addEventListener('resize',()=>{
  clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{
    const vw=canvasVP.clientWidth,vh=canvasVP.clientHeight;
    const prevVw=canvasVP._lastVw||vw,prevVh=canvasVP._lastVh||vh;
    offsetX+=Math.round((vw-prevVw)/2);offsetY+=Math.round((vh-prevVh)/2);
    canvasVP._lastVw=vw;canvasVP._lastVh=vh;applyTransform();renderAll();
  },80);
});

// ═══════════════════════ IMAGE IMPORT ═══════════════════════
let importSrcImage = null; // 로드된 원본 ImageBitmap

function openImportModal(){
  importSrcImage=null;
  document.getElementById('import-preview-canvas').style.display='none';
  document.getElementById('drop-msg').style.display='block';
  document.getElementById('import-preview-wrap').textContent='';
  document.getElementById('import-run').disabled=true;
  document.getElementById('import-bg-mode').value='none';
  document.getElementById('import-bg-row').style.display='none';
  document.getElementById('import-overlay').classList.add('open');
}
document.getElementById('btn-import-img').addEventListener('click',openImportModal);
document.getElementById('import-cancel').addEventListener('click',()=>document.getElementById('import-overlay').classList.remove('open'));
document.getElementById('img-input').addEventListener('change',function(){if(this.files[0])loadImportFile(this.files[0]);this.value='';});

// 드롭존 클릭 → file input
const dropZone=document.getElementById('drop-zone');
dropZone.addEventListener('click',()=>document.getElementById('img-input').click());

// 드롭존 드래그 이벤트
dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.classList.add('drag-over');});
dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop',e=>{
  e.preventDefault();dropZone.classList.remove('drag-over');
  const f=e.dataTransfer.files[0];if(f&&f.type.startsWith('image/'))loadImportFile(f);
});

// 캔버스 영역 드래그&드롭 (모달 열지 않고 바로 임포트)
document.getElementById('canvas-area').addEventListener('dragover',e=>e.preventDefault());
document.getElementById('canvas-area').addEventListener('drop',e=>{
  e.preventDefault();
  const f=e.dataTransfer.files[0];
  if(f&&f.type.startsWith('image/')){openImportModal();loadImportFile(f);}
});

async function loadImportFile(file){
  const bmp=await createImageBitmap(file);
  importSrcImage=bmp;
  updateImportPreview();
}

function getImportTargetSize(){
  const v=document.getElementById('import-size').value;
  return v==='canvas'?SIZE:parseInt(v);
}
// 팔레트 감소 대상 색 목록 (없으면 null=원본 유지)
function getImportPalette(){
  const v=document.getElementById('import-palette').value;
  if(v==='none')return null;
  if(v==='current'){const a=[...paletteColors,...userColors];return a.length?a:null;}
  return FP[parseInt(v)]||FP[256];
}
// 가장 가까운 팔레트 색으로 매핑 (투명 유지)
function applyPaletteToCtx(ctx,size,palette){
  if(!palette||!palette.length)return;
  const pal=palette.map(c=>{const{r,g,b}=hexToRgba(c);return[r,g,b];});
  const id=ctx.getImageData(0,0,size,size);const d=id.data;
  for(let i=0;i<d.length;i+=4){
    if(d[i+3]<10)continue;
    let minD=Infinity,br=0,bg=0,bb=0;
    for(const[pr,pg,pb] of pal){const dist=(d[i]-pr)**2+(d[i+1]-pg)**2+(d[i+2]-pb)**2;if(dist<minD){minD=dist;br=pr;bg=pg;bb=pb;}}
    d[i]=br;d[i+1]=bg;d[i+2]=bb;
  }
  ctx.putImageData(id,0,0);
}
// 배경 제거: 가장자리에서 '연결된' 배경색 영역만 투명 처리 (안쪽 같은 색은 유지)
function removeBg(ctx,size){
  const mode=document.getElementById('import-bg-mode').value;
  if(mode==='none')return;
  const id=ctx.getImageData(0,0,size,size);const d=id.data;
  let br,bg,bb;
  if(mode==='auto'){
    const cor=[[0,0],[size-1,0],[0,size-1],[size-1,size-1]];let sr=0,sg=0,sb=0;
    for(const[x,y] of cor){const i=(y*size+x)*4;sr+=d[i];sg+=d[i+1];sb+=d[i+2];}
    br=sr/4;bg=sg/4;bb=sb/4;
  }else{const c=hexToRgba(document.getElementById('import-bg-color').value);br=c.r;bg=c.g;bb=c.b;}
  const tol=parseInt(document.getElementById('import-bg-tol').value)||0;
  const thr=(tol/100)*441.673; // 최대 RGB 거리 sqrt(3*255^2)
  const visited=new Uint8Array(size*size),stack=[];
  // 투명/반투명(<128)은 '벽'으로 취급 → 투명 구멍을 타고 내부로 새지 않음 (내부 같은색 보존)
  const match=i=>{if(d[i+3]<128)return false;const dr=d[i]-br,dg=d[i+1]-bg,db=d[i+2]-bb;return Math.sqrt(dr*dr+dg*dg+db*db)<=thr;};
  const tryPush=(x,y)=>{if(x<0||y<0||x>=size||y>=size)return;const k=y*size+x;if(visited[k])return;visited[k]=1;if(match(k*4))stack.push(k);};
  for(let x=0;x<size;x++){tryPush(x,0);tryPush(x,size-1);}
  for(let y=0;y<size;y++){tryPush(0,y);tryPush(size-1,y);}
  while(stack.length){const k=stack.pop();const x=k%size,y=(k-x)/size;d[k*4+3]=0;tryPush(x+1,y);tryPush(x-1,y);tryPush(x,y+1);tryPush(x,y-1);}
  ctx.putImageData(id,0,0);
}
// 알파 이진화: 슬라이더 % 이상 불투명만 남기고 나머지는 투명 (0=원본 유지)
function applyAlphaThreshold(ctx,size){
  const t=parseInt(document.getElementById('import-edge-tol').value)||0;
  if(t<=0)return; // 원본 유지
  const thr=Math.round(t/100*255);
  const id=ctx.getImageData(0,0,size,size),d=id.data;
  for(let i=0;i<d.length;i+=4){d[i+3]=d[i+3]>=thr?255:0;}
  ctx.putImageData(id,0,0);
}
// 도트 블록: 격자를 N×N 칸씩 한 색으로 묶음 (불투명 픽셀 평균색, 알파는 다수결)
function getImportBlock(){return Math.max(1,parseInt(document.getElementById('import-block').value)||1);}
function applyBlockify(ctx,size,n){
  if(n<=1)return;
  const id=ctx.getImageData(0,0,size,size),d=id.data;
  for(let by=0;by<size;by+=n)for(let bx=0;bx<size;bx+=n){
    const x1=Math.min(bx+n,size),y1=Math.min(by+n,size);
    let r=0,g=0,b=0,opaque=0,total=0;
    for(let y=by;y<y1;y++)for(let x=bx;x<x1;x++){const i=(y*size+x)*4;total++;if(d[i+3]>=128){r+=d[i];g+=d[i+1];b+=d[i+2];opaque++;}}
    const a=(opaque*2>=total)?255:0;
    const ar=opaque?Math.round(r/opaque):0,ag=opaque?Math.round(g/opaque):0,ab=opaque?Math.round(b/opaque):0;
    for(let y=by;y<y1;y++)for(let x=bx;x<x1;x++){const i=(y*size+x)*4;d[i]=ar;d[i+1]=ag;d[i+2]=ab;d[i+3]=a;}
  }
  ctx.putImageData(id,0,0);
}
// 처리 결과(투명 포함) 캔버스 생성 — 프리뷰·적용 공용
function buildImportResult(targetSize){
  const oc=document.createElement('canvas');oc.width=targetSize;oc.height=targetSize;
  const octx=oc.getContext('2d');
  octx.imageSmoothingEnabled=(document.getElementById('import-resample').value==='bilinear');
  octx.imageSmoothingQuality='high';
  octx.drawImage(importSrcImage,0,0,targetSize,targetSize);
  applyAlphaThreshold(octx,targetSize);   // ① 가장자리 먼저 딱딱하게 → 배경제거가 내부로 안 샘
  removeBg(octx,targetSize);              // ② 가장자리에서 연결된 배경만 투명 (내부 같은색 보존)
  applyBlockify(octx,targetSize,getImportBlock()); // ③ N×N 블록으로 묶어 격자 정렬·픽셀화
  applyPaletteToCtx(octx,targetSize,getImportPalette()); // ④ 묶은 색을 팔레트로 스냅
  return oc;
}
function updateImportPreview(){
  if(!importSrcImage)return;
  const targetSize=getImportTargetSize();
  const pc=document.getElementById('import-preview-canvas');
  const dispSize=Math.min(180,targetSize*4);
  pc.width=targetSize;pc.height=targetSize;
  pc.style.width=dispSize+'px';pc.style.height=dispSize+'px';
  pc.style.display='block';pc.style.cursor=(document.getElementById('import-bg-mode').value==='pick')?'crosshair':'default';
  document.getElementById('drop-msg').style.display='none';
  const ctx=pc.getContext('2d');
  ctx.clearRect(0,0,targetSize,targetSize);
  // 체커 배경
  for(let y=0;y<targetSize;y++)for(let x=0;x<targetSize;x++){ctx.fillStyle=((x+y)%2===0)?'#b8b8b8':'#e8e8e8';ctx.fillRect(x,y,1,1);}
  // 처리 결과를 체커 위에 합성 (투명 영역은 체커가 비침)
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(buildImportResult(targetSize),0,0);
  document.getElementById('import-preview-wrap').textContent=`${importSrcImage.width}×${importSrcImage.height}px → ${targetSize}×${targetSize}px`;
  document.getElementById('import-run').disabled=false;
}

// 옵션 변경 시 프리뷰 갱신
['import-resample','import-palette','import-size','import-block'].forEach(id=>{
  document.getElementById(id).addEventListener('change',updateImportPreview);
});
document.getElementById('import-edge-tol').addEventListener('input',function(){document.getElementById('import-edge-tolv').textContent=this.value+'%';updateImportPreview();});
// 배경 제거 컨트롤
document.getElementById('import-bg-mode').addEventListener('change',function(){document.getElementById('import-bg-row').style.display=this.value==='none'?'none':'flex';updateImportPreview();});
document.getElementById('import-bg-color').addEventListener('input',updateImportPreview);
document.getElementById('import-bg-tol').addEventListener('input',function(){document.getElementById('import-bg-tolv').textContent=this.value+'%';updateImportPreview();});
// 미리보기 클릭 → 배경색 추출 (색 지정 모드)
document.getElementById('import-preview-canvas').addEventListener('click',function(e){
  if(!importSrcImage)return;
  const ts=getImportTargetSize(),r=this.getBoundingClientRect();
  const x=Math.max(0,Math.min(ts-1,Math.floor((e.clientX-r.left)/r.width*ts)));
  const y=Math.max(0,Math.min(ts-1,Math.floor((e.clientY-r.top)/r.height*ts)));
  const tc=document.createElement('canvas');tc.width=ts;tc.height=ts;const tctx=tc.getContext('2d');
  tctx.imageSmoothingEnabled=(document.getElementById('import-resample').value==='bilinear');tctx.drawImage(importSrcImage,0,0,ts,ts);
  const p=tctx.getImageData(x,y,1,1).data;
  document.getElementById('import-bg-color').value='#'+[p[0],p[1],p[2]].map(v=>v.toString(16).padStart(2,'0')).join('');
  document.getElementById('import-bg-mode').value='pick';
  document.getElementById('import-bg-row').style.display='flex';
  updateImportPreview();
});

// 캔버스에 적용
document.getElementById('import-run').addEventListener('click',()=>{
  if(!importSrcImage)return;
  const targetSize=getImportTargetSize();
  // 배경 제거 + 팔레트 매핑이 적용된 결과에서 픽셀 추출
  const oc=buildImportResult(targetSize);
  const id=oc.getContext('2d').getImageData(0,0,targetSize,targetSize);const d=id.data;

  // SIZE 변경 필요 시
  const prevSize=SIZE;
  if(targetSize!==SIZE){
    SIZE=targetSize;
    document.getElementById('sel-size').value=String(SIZE).replace(/[^0-9]/g,'');
    // sel-size에 없는 값이면 무시하고 가장 가까운 옵션으로
    const opts=[8,16,32,48,64,96,128];
    const closest=opts.reduce((a,b)=>Math.abs(b-SIZE)<Math.abs(a-SIZE)?b:a);
    SIZE=closest;
    document.getElementById('sel-size').value=String(SIZE);
    document.getElementById('st-size').textContent=SIZE+'x'+SIZE;
  }

  // 새 픽셀 배열 생성
  const newP=Array.from({length:SIZE},()=>Array(SIZE).fill(null));
  for(let y=0;y<Math.min(targetSize,SIZE);y++){
    for(let x=0;x<Math.min(targetSize,SIZE);x++){
      const i=(y*targetSize+x)*4;
      const a=d[i+3];
      if(a<10)continue; // 거의 투명 → null
      newP[y][x]=rgbaToHex(d[i],d[i+1],d[i+2],a);
    }
  }
  pixels=newP;
  if(targetSize!==prevSize){centerCanvas();initFrames();} // 크기 바뀌면 프레임 리셋 (배치4)
  snap();renderAll();
  document.getElementById('import-overlay').classList.remove('open');
});
