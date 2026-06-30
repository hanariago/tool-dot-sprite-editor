// ═══════════════════════ i18n (한·영, 확장형) ═══════════════════════
// 사용법: data-i18n="key"(텍스트) / data-i18n-title="key"(툴팁) / data-i18n-ph="key"(placeholder)
// 동적 문자열은 t('key') 사용. 언어 추가 = I18N에 객체 하나 추가.
const I18N = {
  ko: {
    __title: '도트 스프라이트 에디터 — 무료 온라인 픽셀 아트 / 스프라이트 메이커',
    // 툴바 도구
    t_draw:'✏️', t_erase:'🧹', t_fill:'🪣', t_eyedrop:'💉', t_line:'╲', t_rect:'□', t_ellipse:'◯', t_select:'⬚',
    tip_draw:'그리기 (D) — 클릭·드래그로 픽셀을 현재 전경색으로 칠합니다.',
    tip_erase:'지우기 (E) — 픽셀을 투명하게 지웁니다.',
    tip_fill:'채우기 (F) — 이어진 같은 색 영역을 한 번에 채웁니다.',
    tip_eyedrop:'색상 추출 (I) — 클릭한 픽셀의 색을 전경색으로 가져옵니다.',
    tip_line:'선 (L) — 두 점을 잇는 직선을 그립니다.',
    tip_rect:'사각형 (R) — 드래그한 영역에 사각형 외곽선.',
    tip_ellipse:'원 (O) — 드래그한 영역에 타원/원 외곽선.',
    tip_select:'선택/이동 (S) — 영역 선택 후 이동, Alt+드래그=복사, Ctrl+C/V, Delete, 방향키, Esc.',
    lbl_brush:'브러시', lbl_size:'크기', lbl_palette:'팔레트',
    btn_mirror:'↔ 대칭', btn_grid:'격자', btn_bg:'배경', btn_scale:'⤢ 배율',
    btn_ai:'🤖 AI', btn_import:'🖼 이미지 임포트', btn_settings:'⚙️ 설정',
    btn_save:'💾 저장', btn_open:'📂 열기', btn_recent:'🕘 임시저장', btn_png:'⬇️ PNG', btn_sheet:'🎲 시트', btn_clear:'🗑 초기화',
    // 좌측 패널
    pnl_color:'색상', lbl_cur_color:'현재 색상', lbl_opacity:'불투명도',
    pnl_recent:'최근 색', pnl_palette:'팔레트', btn_add_color:'+ 현재 색 추가',
    btn_pal_save:'팔레트 저장', btn_pal_load:'불러오기',
    // 우측 미리보기
    pnl_preview:'미리보기', tg_tile:'타일', tg_grid:'격자', tg_checker:'체커', tg_box:'사각형',
    // 상태바
    st_pan:'휠클릭/Space: 이동 | 휠: 확대축소',
    // 랜딩/안내
    land_h1:'도트 스프라이트 에디터',
    land_sub:'브라우저에서 바로 쓰는 무료 픽셀 아트 / 스프라이트 에디터. 설치도 회원가입도 없이, 모든 작업은 당신의 브라우저 안에서만 처리됩니다.',
    land_use_h:'이렇게 쓰세요',
    land_use:'위 캔버스에 바로 도트를 찍어보세요. 브러시·대칭·선/도형으로 그리고, 프레임을 추가해 애니메이션(걷기·공격 등)을 만들고, 어니언 스킨으로 직전 동작을 비춰보며 다듬습니다. 완성하면 PNG(배율 선택)나 스프라이트 시트로 내보내거나, .sprite 파일로 저장해 나중에 이어서 편집하세요. 사진·이미지를 끌어다 놓으면 배경 제거·팔레트 감소를 거쳐 도트로 변환됩니다.',
    land_priv_h:'개인정보',
    land_priv:'그리기·저장·내보내기 등 모든 핵심 기능은 서버 없이 브라우저에서만 동작하며 아무것도 업로드하지 않습니다. AI 그리기 기능은 선택사항으로, 사용 시 당신이 입력한 API 키로 당신이 고른 AI 서비스에 직접 전송되며 이 사이트의 서버는 거치지 않고 아무것도 저장하지 않습니다.',
    faq_h:'자주 묻는 질문',
    faq_q1:'무료인가요?', faq_a1:'네, 완전 무료이며 회원가입이 필요 없습니다. 오픈소스입니다.',
    faq_q2:'내 그림이 서버로 전송되나요?', faq_a2:'아니요. 그리기·저장·내보내기는 모두 브라우저 안에서만 처리됩니다. AI 기능을 켤 때만, 당신의 키로 당신이 고른 AI에 직접 전송됩니다.',
    faq_q3:'어떤 형식으로 저장/내보내나요?', faq_a3:'편집을 이어가려면 .sprite(JSON, 프레임 포함), 결과물은 투명 PNG(배율 ×1~16) 또는 스프라이트 시트 PNG로 내보냅니다.',
    faq_q4:'모바일에서도 되나요?', faq_a4:'네. 터치로 그리기·핀치 줌을 지원하며 화면 폭에 맞춰 레이아웃이 조정됩니다.',
    faq_q5:'애니메이션도 만들 수 있나요?', faq_a5:'네. 여러 프레임을 만들고 FPS로 재생하며, 어니언 스킨과 모션 템플릿으로 걷기·공격 같은 동작을 그릴 수 있습니다.',
    faq_q6:'제 API 키는 안전한가요?', faq_a6:'AI 기능은 선택이며, 키를 넣지 않아도 모든 그리기·저장·내보내기를 쓸 수 있습니다. 입력한 키는 이 브라우저에만 저장되고(이 사이트 서버로 전송·저장되지 않음), 요청은 당신이 고른 AI 제공사로만 직접 전송됩니다. 코드는 오픈소스라 직접 확인할 수 있으니, 신뢰가 서는 경우에만 본인 책임으로 키를 입력하세요. 공용 PC에서는 사용 후 설정에서 키를 비우는 것을 권장합니다.',
    ai_key_note:'⚠️ 키는 이 브라우저에만 저장되고 당신이 고른 AI로만 직접 전송됩니다(이 사이트 서버 경유·저장 없음). 오픈소스라 검증 가능 — 신뢰가 설 때만 본인 책임으로 입력하세요. 키 없이도 위 「프롬프트 복사」 방식으로 쓸 수 있어요.',
    ftr_lic:'오픈소스 · MIT 라이선스', hub_link:'🔧 다른 도구 모음 →',
    guide_title:'도트 스프라이트 에디터에 오신 걸 환영해요 👋',
    guide_intro:'설치·회원가입 없이 브라우저에서 바로 픽셀 아트를 만들 수 있어요. 이런 걸 할 수 있어요:',
    guide_f1:'✏️ 그리기 — 브러시·대칭·선/도형·채우기·스포이드',
    guide_f2:'🎞️ 애니메이션 — 프레임 추가·어니언 스킨·FPS 재생·모션 템플릿',
    guide_f3:'🖼️ 이미지 임포트 — 사진·AI 그림을 끌어다 놓으면 도트로 변환(배경 제거·도트 블록 묶기)',
    guide_f4:'🤖 AI 그리기 — 글로 설명하면 AI가 픽셀아트로(선택·본인 키)',
    guide_f5:'💾 저장·내보내기 — .sprite로 저장, PNG(배율)·스프라이트 시트',
    guide_f6:'📱 모바일 — 터치 그리기·핀치 줌 지원',
    guide_dont:'오늘 다시 보지 않기', guide_close:'닫기'
  },
  en: {
    __title: 'Dot Sprite Editor — Free Online Pixel Art & Sprite Maker',
    t_draw:'✏️', t_erase:'🧹', t_fill:'🪣', t_eyedrop:'💉', t_line:'╲', t_rect:'□', t_ellipse:'◯', t_select:'⬚',
    tip_draw:'Pencil (D) — click & drag to paint pixels with the foreground color.',
    tip_erase:'Eraser (E) — erase pixels to transparent.',
    tip_fill:'Fill (F) — flood-fill a connected same-color area.',
    tip_eyedrop:'Eyedropper (I) — pick a pixel color as the foreground.',
    tip_line:'Line (L) — draw a straight line between two points.',
    tip_rect:'Rectangle (R) — outline a dragged area.',
    tip_ellipse:'Ellipse (O) — circle/ellipse outline in a dragged area.',
    tip_select:'Select/Move (S) — select an area, drag to move, Alt+drag = copy, Ctrl+C/V, Delete, arrows, Esc.',
    lbl_brush:'Brush', lbl_size:'Size', lbl_palette:'Palette',
    btn_mirror:'↔ Mirror', btn_grid:'Grid', btn_bg:'BG', btn_scale:'⤢ Scale',
    btn_ai:'🤖 AI', btn_import:'🖼 Import', btn_settings:'⚙️ Settings',
    btn_save:'💾 Save', btn_open:'📂 Open', btn_recent:'🕘 Drafts', btn_png:'⬇️ PNG', btn_sheet:'🎲 Sheet', btn_clear:'🗑 Clear',
    pnl_color:'Color', lbl_cur_color:'Current color', lbl_opacity:'Opacity',
    pnl_recent:'Recent', pnl_palette:'Palette', btn_add_color:'+ Add current color',
    btn_pal_save:'Save palette', btn_pal_load:'Load',
    pnl_preview:'Preview', tg_tile:'Tile', tg_grid:'Grid', tg_checker:'Checker', tg_box:'Box',
    st_pan:'Middle-click/Space: pan | Wheel: zoom',
    land_h1:'Dot Sprite Editor',
    land_sub:'A free pixel-art & sprite editor that runs right in your browser. No install, no sign-up — everything stays on your device.',
    land_use_h:'How to use',
    land_use:'Draw dots directly on the canvas above. Use the brush, symmetry and line/shape tools, add frames to build animations (walk, attack, …), and refine with onion skinning that shows the previous frame. Export as PNG (with scale) or a sprite sheet, or save a .sprite file to keep editing later. Drop a photo or image to convert it into dots with background removal and palette reduction.',
    land_priv_h:'Privacy',
    land_priv:'All core features (drawing, saving, exporting) run entirely in your browser and upload nothing. The AI drawing feature is optional; when used, requests go directly to the AI service you choose using your own API key — never through this site’s server, and nothing is stored.',
    faq_h:'FAQ',
    faq_q1:'Is it free?', faq_a1:'Yes, completely free with no sign-up. It is open source.',
    faq_q2:'Is my artwork sent to a server?', faq_a2:'No. Drawing, saving and exporting all happen in your browser. Only the optional AI feature sends data — directly to the AI you pick, with your own key.',
    faq_q3:'What formats can I save/export?', faq_a3:'Use .sprite (JSON, with frames) to keep editing, and export a transparent PNG (scale ×1–16) or a sprite-sheet PNG.',
    faq_q4:'Does it work on mobile?', faq_a4:'Yes. Touch drawing and pinch zoom are supported and the layout adapts to screen width.',
    faq_q5:'Can I make animations?', faq_a5:'Yes. Create multiple frames, play them at a chosen FPS, and draw motions like walk/attack with onion skinning and motion templates.',
    faq_q6:'Is my API key safe?', faq_a6:'The AI feature is optional — you can draw, save and export without entering any key. Any key you enter is stored only in this browser (never sent to or stored on this site), and requests go directly to the AI provider you choose. The code is open source so you can verify it; enter a key only if you trust it, at your own discretion. On shared computers, clear the key in Settings after use.',
    ai_key_note:'⚠️ Your key is stored only in this browser and sent only to the AI you choose (never via or stored on this site). Open source & verifiable — enter at your own discretion. No key? Use “Copy prompt” above instead.',
    ftr_lic:'Open source · MIT License', hub_link:'🔧 More tools →',
    guide_title:'Welcome to Dot Sprite Editor 👋',
    guide_intro:'Make pixel art right in your browser — no install, no sign-up. Here’s what you can do:',
    guide_f1:'✏️ Draw — brush, symmetry, line/shapes, fill, eyedropper',
    guide_f2:'🎞️ Animate — add frames, onion skin, FPS playback, motion templates',
    guide_f3:'🖼️ Import — drop a photo or AI image to convert to dots (bg removal, dot-block grouping)',
    guide_f4:'🤖 AI draw — describe it in words; optional, with your own key',
    guide_f5:'💾 Save & export — .sprite file, PNG (scaled) or sprite sheet',
    guide_f6:'📱 Mobile — touch drawing and pinch zoom',
    guide_dont:'Don’t show again today', guide_close:'Close'
  }
};

let curLang = 'ko';
function detectLang(){
  const q=new URLSearchParams(location.search).get('lang');
  if(q&&I18N[q])return q;
  const s=localStorage.getItem('sprite_lang');
  if(s&&I18N[s])return s;
  const n=(navigator.language||'ko').slice(0,2).toLowerCase();
  return I18N[n]?n:'ko';
}
function t(key){const L=I18N[curLang]||I18N.ko;return (key in L)?L[key]:(I18N.ko[key]!==undefined?I18N.ko[key]:key);}
function applyI18n(lang){
  curLang=I18N[lang]?lang:'ko';
  try{localStorage.setItem('sprite_lang',curLang);}catch(e){}
  document.documentElement.lang=curLang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.getAttribute('data-i18n'));});
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{el.title=t(el.getAttribute('data-i18n-title'));});
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{el.placeholder=t(el.getAttribute('data-i18n-ph'));});
  document.title=t('__title');
  const tb=document.getElementById('btn-lang');if(tb)tb.textContent=curLang==='ko'?'EN':'한';
}
function toggleLang(){applyI18n(curLang==='ko'?'en':'ko');}
