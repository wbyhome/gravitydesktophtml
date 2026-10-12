/* =========================================================
   Gravity Desktop — 首页交互
   原生 JS，零依赖
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LANG_KEY = 'gravity-lang';
  var THEME_KEY = 'gravity-theme';

  /* 主题的初值已由 index.html <head> 里的内联脚本在首次绘制前设好（避免闪一下），
     这里只是把它读出来；切换逻辑见第 6 节。 */
  var currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

  /* =======================================================
     1. 中英双语
     英文写在 HTML 里作默认内容（利于 SEO），中文挂在 data-zh
     ======================================================= */
  var META = {
    en: {
      title: 'Gravity Desktop – A desktop that stays where you put it',
      desc: 'Gravity Desktop is a free Windows 10/11 desktop organizer. Files gather around a visual core and stay where you pin them — nothing on disk is moved.'
    },
    zh: {
      title: 'Gravity Desktop – 让桌面停在你放下的位置',
      desc: 'Gravity Desktop 是一款免费的 Windows 10/11 桌面工具。文件围绕「视觉核心」聚拢，位置一旦固定就不再漂移。不移动任何真实文件，无需账号。'
    }
  };

  var textNodes = [];
  document.querySelectorAll('[data-zh]').forEach(function (el) {
    textNodes.push({ el: el, en: el.innerHTML, zh: el.getAttribute('data-zh') });
  });

  var metaDesc = document.querySelector('meta[name="description"]');
  var ogTitle  = document.querySelector('meta[property="og:title"]');
  var ogDesc   = document.querySelector('meta[property="og:description"]');
  var twTitle  = document.querySelector('meta[name="twitter:title"]');
  var twDesc   = document.querySelector('meta[name="twitter:description"]');
  var segBtns  = Array.prototype.slice.call(document.querySelectorAll('#langSeg button'));
  var currentLang = 'en';

  function applyLang(lang) {
    currentLang = (lang === 'zh') ? 'zh' : 'en';
    var isZh = currentLang === 'zh';

    textNodes.forEach(function (n) { n.el.innerHTML = isZh ? n.zh : n.en; });

    var m = META[currentLang];
    document.title = m.title;
    if (metaDesc) metaDesc.setAttribute('content', m.desc);
    if (ogTitle)  ogTitle.setAttribute('content', m.title);
    if (ogDesc)   ogDesc.setAttribute('content', m.desc);
    if (twTitle)  twTitle.setAttribute('content', m.title);
    if (twDesc)   twDesc.setAttribute('content', m.desc);

    document.documentElement.setAttribute('lang', isZh ? 'zh-CN' : 'en');
    segBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === currentLang ? 'true' : 'false');
    });
  }

  var saved = null;
  try { saved = localStorage.getItem(LANG_KEY); } catch (e) { /* 隐私模式 */ }
  var initial = saved || ((navigator.language || 'en').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en');
  applyLang(initial);

  segBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var next = b.getAttribute('data-lang');
      if (next === currentLang) return;
      applyLang(next);
      try { localStorage.setItem(LANG_KEY, next); } catch (e) { /* 忽略 */ }
      syncDemoState();
    });
  });

  /* =======================================================
     2. 示意图：窄屏收窄 viewBox，让核心与文件占满可用宽度
     ======================================================= */
  var orb = document.querySelector('.orb');

  function fitOrbit() {
    if (!orb) return;
    var small = window.innerWidth <= 700;
    orb.setAttribute('viewBox', small ? '438 186 344 314' : '334 183 540 320');
  }
  fitOrbit();

  var wasSmall = window.innerWidth <= 700;
  window.addEventListener('resize', function () {
    var isSmall = window.innerWidth <= 700;
    if (isSmall !== wasSmall) { wasSmall = isSmall; fitOrbit(); }
  }, { passive: true });

  /* =======================================================
     3. 顶栏：滚动过一点之后加一条描边
     「窗口」现在是 1280 宽的居中块（不再通栏），顶栏不需要「落在深色上转深」，
     否则反白文字会落在窗口两侧的页面底色上、读不出来。见 style.css 第 5 节。
     ======================================================= */
  var header = document.querySelector('.top');

  function onScroll() {
    if (!header) return;
    var y = window.scrollY || window.pageYOffset || 0;
    header.classList.toggle('scrolled', y > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =======================================================
     4. 滚动进场
     ======================================================= */
  var revealEls = [];
  ['.stage', '.stage-cap',
   '.eyebrow', '.hero-title', '.hero-lede', '.hero-actions',
   '.orbit-head', '.orbit-stage', '.orbit-legend', '.shot', '.clip',
   '.sec-title', '.prose', '.steps li',
   '.langs-sub', '.lang-row', '.langs-note',
   '.cta-title', '.cta-sub', '.cta .btn'
  ].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { revealEls.push(el); });
  });

  revealEls.forEach(function (el) {
    el.classList.add('reveal');
    var idx = Array.prototype.indexOf.call(el.parentElement.children, el);
    if (idx > 0) el.style.setProperty('--d', Math.min(idx, 3) * 70 + 'ms');
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* =======================================================
     5. 演示舞台：1280×768 固定画布，等比缩放到容器宽度
     iframe 内部布局视口始终是 1280×768，所以绝对坐标、
     动画、交互全部保持原样，只有外面套了一层 scale()。
     ======================================================= */
  var stage = document.getElementById('stage');
  var stageFrame = document.getElementById('stageFrame');
  var DEMO_BASE = 'assets/demo/gravity-demo.html';
  var COMPACT_W = 700;

  function fitStage() {
    if (!stage || !stageFrame) return;
    var w = stage.clientWidth;
    if (!w) return;
    stageFrame.style.transform = 'scale(' + (w / 1280) + ')';
  }

  function postToDemo(msg) {
    if (!stageFrame || !stageFrame.contentWindow) return;
    try { stageFrame.contentWindow.postMessage(msg, '*'); } catch (e) { /* 忽略 */ }
  }

  /* 语言 + 窄屏紧凑态 + 主题：窄屏下演示内部收起按钮，只保留自动演示 */
  function syncDemoState() {
    postToDemo({ type: 'gd-lang', lang: currentLang });
    postToDemo({ type: 'gd-compact', compact: window.innerWidth <= COMPACT_W });
    postToDemo({ type: 'gd-theme', theme: currentTheme });
  }

  if (stageFrame) {
    var wantSrc = DEMO_BASE + '?lang=' + currentLang +
                  '&autoplay=' + (reduceMotion ? '0' : '1') +
                  '&theme=' + currentTheme;
    if (stageFrame.getAttribute('src') !== wantSrc) stageFrame.setAttribute('src', wantSrc);
    stageFrame.addEventListener('load', syncDemoState);
  }

  fitStage();
  if ('ResizeObserver' in window && stage) {
    new ResizeObserver(fitStage).observe(stage);
  } else {
    window.addEventListener('resize', fitStage, { passive: true });
  }
  window.addEventListener('resize', syncDemoState, { passive: true });

  /* =======================================================
     6. 主题：浅色 / 深色
     整站配色由 <html data-theme> 决定（令牌见 style.css 第 1 / 1.1 节）。
     初值在 <head> 的内联脚本里设好，这里负责点击切换、记住选择、通知演示。
     优先级：URL ?theme= > localStorage > 默认 light
     ======================================================= */
  var themeBtns = Array.prototype.slice.call(document.querySelectorAll('#themeSeg button'));
  var themeMeta = document.getElementById('themeColor');
  var THEME_COLOR = { light: '#ffffff', dark: '#0b0d12' };

  function applyTheme(theme, persist) {
    currentTheme = (theme === 'dark') ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-theme') === currentTheme ? 'true' : 'false');
    });
    if (themeMeta) themeMeta.setAttribute('content', THEME_COLOR[currentTheme]);

    if (persist) { try { localStorage.setItem(THEME_KEY, currentTheme); } catch (e) { /* 忽略 */ } }

    syncDemoState();   /* 演示 iframe 跟着换皮肤 */
  }

  applyTheme(currentTheme, false);

  themeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var next = b.getAttribute('data-theme');
      if (next === currentTheme) return;
      applyTheme(next, true);
    });
  });

  /* =======================================================
     7. 兜底：商店链接一律新标签安全打开
     ======================================================= */
  document.querySelectorAll('a[href*="apps.microsoft.com"]').forEach(function (a) {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });
})();
