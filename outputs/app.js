const $ = (id) => document.getElementById(id);
const state = {
  platform: new URLSearchParams(window.location.search).get('template') === 'threads' ? 'threads' : 'x',
  theme: 'paper',
  showStats: true,
  zoom: 1,
  avatar: '',
  drafts: {
    x: $('content')?.value || '',
    threads: '其实我一直在等\n有没有签售姐问他俩喜欢对方的哪张小卡\n或者哪个造型\n图可能会精选一些自己满意的小卡送给他哥\n壮没准还会指定要哪张…\n我一想到两个人家里还会有卡册\n没事的时候一起贴一下\n萌鼠了…',
  },
};
if (state.platform === 'threads') $('content').value = state.drafts.threads;
const card = $('socialCard');

function data() {
  return {
    name: $('displayName').value.trim() || '李见',
    handle: $('handle').value.trim().replace(/^@/, '') || 'ordnorii',
    content: $('content').value,
    date: $('dateText').value.trim() || '12:42 · 2026/10/19',
    views: $('viewText').value.trim() || '1 次查看',
    threadViews: $('threadViewText').value.trim() || '697 次观看',
    threadTitle: $('threadTitleInput').value.trim() || '中文',
    threadAge: $('threadAgeInput').value.trim() || '2 小时',
    likes: $('likes').value.trim() || '21',
    replies: $('replies').value.trim() || '8',
    reposts: $('reposts').value.trim() || '1',
    shares: $('shares').value.trim() || '1',
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
  setText('previewNameT', d.handle || 'convallaria_01');
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
  $('dimensionLabel').textContent = state.platform === 'x' ? '1080 × 1581' : '1080 × 2351';
  $('previewContentX').style.fontSize = Math.max(13, Math.min(18, 5700 / Math.max(d.content.length, 1))) + 'px';
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
    const targetWidth = state.platform === 'threads' ? 1220 : 1080;
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
