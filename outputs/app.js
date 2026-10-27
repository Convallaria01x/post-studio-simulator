const $ = (id) => document.getElementById(id);
const state = {
  platform: (new URLSearchParams(window.location.search).get('template') === 'threads' || window.location.href.includes('template=threads')) ? 'threads' : 'x',
  theme: 'paper',
  showStats: true,
  zoom: 1,
  avatar: '',
  drafts: {
    x: '',
    threads: '',
  },
};
if (state.platform === 'threads') $('content').value = state.drafts.threads;
else $('content').value = state.drafts.x;
const card = $('socialCard');

function data() {
  return {
    name: $('displayName').value.trim() || '李见',
    handle: $('handle').value.trim().replace(/^@/, '') || 'ordnorii',
    content: $('content').value,
    date: $('dateText').value.trim() || '16:31 · 2026/10/16',
    views: $('viewText').value.trim() || '0 次查看',
    threadViews: $('threadViewText').value.trim() || '0 次观看',
    threadTitle: $('threadTitleInput').value.trim() || '串文',
    threadAge: $('threadAgeInput').value.trim() || '2 小时',
    likes: $('likes').value.trim() || '0',
    replies: $('replies').value.trim() || '0',
    reposts: $('reposts').value.trim() || '0',
    shares: $('shares').value.trim() || '0',
  };
}

function setText(id, value) { $(id).textContent = value; }

function render() {
  const d = data();
  setText('previewNameX', d.name);
  setText('previewHandleX', d.handle);
  setText('previewContentX', d.content);
  setText('previewDateX', d.date);
  setText('previewViewX', d.views);
  setText('previewRepliesX', d.replies);
  setText('previewNameT', 'convallaria_01');
  setText('previewContentT', d.content);
  setText('threadViews', d.threadViews + '　›');
  setText('threadTitle', d.threadTitle);
  setText('threadAge', d.threadAge);
  setText('previewLikesT', d.likes);
  setText('previewSharesT', d.shares);
  $('charCount').textContent = d.content.length + ' / ' + (state.platform === 'x' ? 280 : 500);
  $('charCount').style.color = d.content.length > (state.platform === 'x' ? 280 : 500) ? '#c85f58' : '';
  $('xScreen').style.display = state.platform === 'x' ? 'block' : 'none';
  $('threadsScreen').style.display = state.platform === 'threads' ? 'block' : 'none';
  document.querySelectorAll('.threads-only-field').forEach((field) => { field.style.display = state.platform === 'threads' ? 'block' : 'none'; });
  $('platformLabel').textContent = state.platform === 'x' ? 'X 帖子' : 'Threads 串文';
  $('dimensionLabel').textContent = '1080 × 1440 · 3:4';
  const textLength = Math.max(d.content.length, 1);
  const xSize = Math.max(13, Math.min(22, 5200 / textLength));
  const threadSize = Math.max(13, Math.min(21, 5000 / textLength));
  card.style.setProperty('--x-copy-size', xSize + 'px');
  card.style.setProperty('--x-copy-leading', (textLength > 220 ? 1.35 : 1.5).toString());
  card.style.setProperty('--thread-copy-size', threadSize + 'px');
  card.style.setProperty('--thread-copy-leading', (textLength > 180 ? 1.34 : 1.5).toString());
  $('toggleStats').textContent = state.showStats ? '隐藏' : '显示';
  $('xActions').style.display = state.showStats ? '' : 'none';
  $('threadActions').style.display = state.showStats ? '' : 'none';
  card.className = 'phone-card theme-' + state.theme + ' platform-' + state.platform;
  $('canvasWrap').style.transform = 'scale(' + state.zoom + ')';
  $('zoomValue').textContent = Math.round(state.zoom * 100) + '%';
  document.querySelectorAll('.platform-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.platform === state.platform));
  document.querySelectorAll('.swatch').forEach((swatch) => swatch.classList.toggle('active', swatch.dataset.theme === state.theme));
  applyAvatar();
  if (window.lucide) window.lucide.createIcons();
}

function applyAvatar() {
  ['X', 'T'].forEach((suffix) => {
    const img = $('avatarImage' + suffix);
    const fallback = $('avatarFallback' + suffix);
    if (state.avatar) { img.src = state.avatar; img.style.display = 'block'; fallback.style.display = 'none'; }
    else { img.removeAttribute('src'); img.style.display = 'none'; fallback.style.display = 'grid'; fallback.textContent = data().name.charAt(0); }
  });
  const compose = $('avatarImageCompose');
  if (state.avatar) { compose.src = state.avatar; compose.style.display = 'block'; } else compose.style.display = 'none';
}

document.querySelectorAll('input, textarea').forEach((input) => input.addEventListener('input', render));
document.querySelectorAll('.platform-tab').forEach((tab) => tab.addEventListener('click', () => {
  state.drafts[state.platform] = $('content').value;
  state.platform = tab.dataset.platform;
  $('content').value = state.drafts[state.platform];
  render();
}));
document.querySelectorAll('.swatch').forEach((swatch) => swatch.addEventListener('click', () => { state.theme = swatch.dataset.theme; render(); }));
document.querySelectorAll('.quick-chips button').forEach((chip) => chip.addEventListener('click', () => {
  const input = $('content'); const start = input.selectionStart;
  input.value = input.value.slice(0, start) + chip.dataset.insert + input.value.slice(input.selectionEnd);
  input.focus(); input.selectionStart = input.selectionEnd = start + chip.dataset.insert.length; state.drafts[state.platform] = input.value; render();
}));
 $('content').addEventListener('input', () => { state.drafts[state.platform] = $('content').value; });
$('avatarInput').addEventListener('change', (event) => {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader(); reader.onload = () => { state.avatar = reader.result; render(); }; reader.readAsDataURL(file);
});
$('clearAvatar').addEventListener('click', () => { state.avatar = ''; $('avatarInput').value = ''; render(); });
$('toggleStats').addEventListener('click', () => { state.showStats = !state.showStats; render(); });
$('zoomIn').addEventListener('click', () => { state.zoom = Math.min(1.2, +(state.zoom + .1).toFixed(2)); render(); });
$('zoomOut').addEventListener('click', () => { state.zoom = Math.max(.8, +(state.zoom - .1).toFixed(2)); render(); });
$('resetButton').addEventListener('click', () => window.location.reload());
$('exportButton').addEventListener('click', async () => {
  const button = $('exportButton'); button.disabled = true; button.textContent = '生成中…';
  try {
    if (!window.html2canvas) throw new Error('html2canvas is not ready');
    await document.fonts.ready;
    card.classList.add('exporting');
    const targetWidth = 1080;
    const shot = await html2canvas(card, {
      scale: targetWidth / card.getBoundingClientRect().width,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });
    const link = document.createElement('a');
    link.download = 'post-studio-' + state.platform + '.png';
    link.href = shot.toDataURL('image/png');
    link.click();
    $('toast').textContent = '图片已保存，可以直接发到小红书';
  } catch { $('toast').textContent = '保存失败，请稍后再试'; }
  finally { card.classList.remove('exporting'); }
  button.disabled = false; button.innerHTML = '<span class="button-icon">↓</span>保存图片';
  $('toast').classList.add('show'); setTimeout(() => $('toast').classList.remove('show'), 2400);
});
render();
