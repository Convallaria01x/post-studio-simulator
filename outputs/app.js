const state = { platform: 'x', theme: 'paper', showStats: true, zoom: 1 };
const $ = (id) => document.getElementById(id);
const card = $('socialCard');
const previewContent = $('previewContent');

function getFormData() {
  return {
    name: $('displayName').value.trim() || '林默',
    handle: $('handle').value.trim().replace(/^@/, '') || 'linmo.notes',
    content: $('content').value,
    date: $('dateText').value.trim() || '10月27日 · 21:16',
    location: $('locationText').value.trim() || '杭州',
    replies: $('replies').value.trim() || '0',
    reposts: $('reposts').value.trim() || '0',
    likes: $('likes').value.trim() || '0',
  };
}

function render() {
  const data = getFormData();
  $('previewName').textContent = data.name;
  $('previewHandle').textContent = data.handle;
  $('avatar').textContent = data.name.charAt(0);
  previewContent.textContent = data.content;
  $('previewDate').textContent = data.date;
  $('previewLocation').textContent = data.location;
  $('previewReplies').textContent = data.replies;
  $('previewReposts').textContent = data.reposts;
  $('previewLikes').textContent = data.likes;
  const lengthLimit = state.platform === 'x' ? 280 : 500;
  $('charCount').textContent = data.content.length + ' / ' + lengthLimit;
  $('charCount').style.color = data.content.length > lengthLimit ? '#c85f58' : '';
  $('engagement').style.display = state.showStats ? '' : 'none';
  $('toggleStats').textContent = state.showStats ? '隐藏' : '显示';
  card.className = 'social-card theme-' + state.theme + ' platform-' + state.platform;
  const isThreads = state.platform === 'threads';
  const isNote = state.platform === 'note';
  $('platformGlyph').textContent = isThreads ? '@' : isNote ? 'POST STUDIO · NOTE' : '𝕏';
  $('platformLabel').textContent = isThreads ? 'Threads' : isNote ? '极简长文' : 'X / Twitter';
  $('platformMeta').textContent = isThreads ? '来自 Threads' : '来自 X';
  document.querySelectorAll('.platform-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.platform === state.platform));
  document.querySelectorAll('.swatch').forEach((swatch) => swatch.classList.toggle('active', swatch.dataset.theme === state.theme));
  $('canvasWrap').style.transform = 'scale(' + state.zoom + ')';
  $('zoomValue').textContent = Math.round(state.zoom * 100) + '%';
}

document.querySelectorAll('input, textarea').forEach((input) => input.addEventListener('input', render));
document.querySelectorAll('.platform-tab').forEach((tab) => tab.addEventListener('click', () => { state.platform = tab.dataset.platform; render(); }));
document.querySelectorAll('.swatch').forEach((swatch) => swatch.addEventListener('click', () => { state.theme = swatch.dataset.theme; render(); }));
document.querySelectorAll('.quick-chips button').forEach((chip) => chip.addEventListener('click', () => {
  const input = $('content');
  const start = input.selectionStart;
  input.value = input.value.slice(0, start) + chip.dataset.insert + input.value.slice(input.selectionEnd);
  input.focus();
  input.selectionStart = input.selectionEnd = start + chip.dataset.insert.length;
  render();
}));
$('toggleStats').addEventListener('click', () => { state.showStats = !state.showStats; render(); });
$('zoomIn').addEventListener('click', () => { state.zoom = Math.min(1.2, +(state.zoom + .1).toFixed(2)); render(); });
$('zoomOut').addEventListener('click', () => { state.zoom = Math.max(.8, +(state.zoom - .1).toFixed(2)); render(); });
$('resetButton').addEventListener('click', () => window.location.reload());
$('exportButton').addEventListener('click', async () => {
  const button = $('exportButton');
  button.disabled = true;
  button.textContent = '生成中…';
  try {
    if (window.html2canvas) {
      await document.fonts.ready;
      const shot = await html2canvas(card, {
        scale: 1080 / card.getBoundingClientRect().width,
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = 'post-studio-' + state.platform + '.png';
      link.href = shot.toDataURL('image/png');
      link.click();
      $('toast').textContent = 'PNG 已下载，可以直接发到小红书';
    } else {
      $('toast').textContent = '请等待预览工具加载后再导出';
    }
  } catch {
    $('toast').textContent = '导出失败，请直接截图保存';
  }
  button.disabled = false;
  button.innerHTML = '<span class="button-icon">↓</span>保存图片';
  $('toast').classList.add('show');
  setTimeout(() => $('toast').classList.remove('show'), 2400);
});

render();
