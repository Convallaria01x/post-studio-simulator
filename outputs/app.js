const $ = (id) => document.getElementById(id);
const state = {
  platform: (new URLSearchParams(window.location.search).get('template') === 'threads' || window.location.href.includes('template=threads')) ? 'threads' : 'x',
  theme: 'paper',
  showStats: true,
  zoom: 1,
  avatar: '',
  avatarZoom: 120,
  avatarX: 50,
  avatarY: 50,
  media: '',
  mediaMode: 'auto',
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
    name: $('displayName').value.trim() || '空想泡芙',
    handle: $('handle').value.trim().replace(/^@/, '') || 'floppetharyn',
    content: $('content').value,
    date: $('dateText').value.trim() || '13:14 · 2033/12/31',
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

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = value;
}

function fitCanvas() {
  const width = card.offsetWidth;
  if (!width) return;
  card.style.height = 'auto';
  card.style.aspectRatio = 'auto';
  const screen = state.platform === 'x' ? $('xScreen') : $('threadsScreen');
  const cardTop = card.getBoundingClientRect().top;
  const layoutScale = card.getBoundingClientRect().width / width || 1;
  const lastFlowItem = Array.from(screen.children)
    .filter((element) => {
      const style = getComputedStyle(element);
      return style.display !== 'none' && style.position !== 'absolute' && style.position !== 'fixed';
    })
    .pop();
  const flowBottom = lastFlowItem
    ? (lastFlowItem.getBoundingClientRect().bottom - cardTop) / layoutScale
    : width * 0.8;
  const bottomReserve = 24;
  const minimumHeight = 0;
  const targetHeight = Math.max(minimumHeight, flowBottom + bottomReserve);
  card.style.aspectRatio = 'auto';
  card.style.height = Math.ceil(targetHeight) + 'px';
  const exportWidth = state.platform === 'x' ? 1080 : 1220;
  const exportHeight = Math.round(targetHeight * exportWidth / width);
  $('dimensionLabel').textContent = exportWidth + ' × ' + exportHeight + ' · 自适应画布';
}

function applyMedia() {
  ['X', 'T'].forEach((suffix) => {
    const box = $('postMedia' + suffix);
    const image = $('mediaImage' + suffix);
    const hasMedia = Boolean(state.media);
    box.classList.toggle('has-media', hasMedia);
    if (!hasMedia) {
      image.removeAttribute('src');
      box.style.removeProperty('aspect-ratio');
      return;
    }
    if (image.src !== state.media) image.src = state.media;
    const platformRatio = state.platform === 'x' ? '3 / 4' : '4 / 5';
    const applyImageRatio = () => {
      if (state.mediaMode === 'cover') {
        box.style.aspectRatio = platformRatio;
        image.style.objectFit = 'cover';
      } else {
        box.style.aspectRatio = `${image.naturalWidth} / ${image.naturalHeight}`;
        image.style.objectFit = 'contain';
      }
      requestAnimationFrame(fitCanvas);
    };
    if (image.complete && image.naturalWidth) applyImageRatio();
    else image.onload = applyImageRatio;
  });
}

function render() {
  const d = data();
  setText('previewNameX', d.name);
  setText('previewHandleX', d.handle);
  setText('previewContentX', d.content);
  setText('previewDateX', d.date);
  setText('previewViewX', d.views);
  setText('previewRepliesX', d.replies);
  setText('previewNameT', d.name);
  setText('previewContentT', d.content);
  setText('threadViews', d.threadViews + '　›');
  setText('threadTitle', d.threadTitle);
  setText('threadAge', d.threadAge);
  setText('previewLikesT', d.likes);
  setText('previewSharesT', d.shares);
  $('charCount').textContent = d.content.length + ' / ' + (state.platform === 'x' ? 280 : 500);
  $('charCount').style.color = d.content.length > (state.platform === 'x' ? 280 : 500) ? '#c85f58' : '';
  $('xScreen').style.display = state.platform === 'x' ? 'flex' : 'none';
  $('threadsScreen').style.display = state.platform === 'threads' ? 'flex' : 'none';
  document.querySelectorAll('.threads-only-field').forEach((field) => { field.style.display = state.platform === 'threads' ? 'block' : 'none'; });
  $('platformLabel').textContent = state.platform === 'x' ? 'X 帖子' : 'Threads 串文';
  $('dimensionLabel').textContent = '1080 × 1440 · 3:4';
  const textLength = Math.max(d.content.length, 1);
  const xSize = Math.max(12, Math.min(17, 3800 / textLength));
  const threadSize = Math.max(12, Math.min(17, 3600 / textLength));
  card.style.setProperty('--x-copy-size', xSize + 'px');
  card.style.setProperty('--x-copy-leading', (textLength > 220 ? 1.35 : 1.5).toString());
  card.style.setProperty('--thread-copy-size', threadSize + 'px');
  card.style.setProperty('--thread-copy-leading', (textLength > 180 ? 1.34 : 1.5).toString());
  const mediaWidth = textLength > 180 ? 220 : (textLength > 100 ? 260 : 300);
  card.style.setProperty('--media-width', mediaWidth + 'px');
  $('toggleStats').textContent = state.showStats ? '隐藏' : '显示';
  $('xActions').style.display = state.showStats ? '' : 'none';
  $('threadActions').style.display = state.showStats ? '' : 'none';
  card.className = 'phone-card theme-' + state.theme + ' platform-' + state.platform;
  $('canvasWrap').style.transform = 'scale(' + state.zoom + ')';
  $('zoomValue').textContent = Math.round(state.zoom * 100) + '%';
  document.querySelectorAll('.platform-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.platform === state.platform));
  document.querySelectorAll('.swatch').forEach((swatch) => swatch.classList.toggle('active', swatch.dataset.theme === state.theme));
  applyAvatar();
  applyMedia();
  requestAnimationFrame(fitCanvas);
  if (window.lucide) window.lucide.createIcons();
}

function applyAvatar() {
  const zoom = state.avatarZoom;
  const offset = (100 - zoom);
  ['X', 'T'].forEach((suffix) => {
    const img = $('avatarImage' + suffix);
    const fallback = $('avatarFallback' + suffix);
    if (state.avatar) {
      img.src = state.avatar;
      img.style.display = 'block';
      img.style.width = zoom + '%';
      img.style.height = zoom + '%';
      img.style.left = (offset * state.avatarX / 100) + '%';
      img.style.top = (offset * state.avatarY / 100) + '%';
      img.style.transform = 'none';
      fallback.style.display = 'none';
    }
    else { img.removeAttribute('src'); img.style.display = 'none'; fallback.style.display = 'grid'; fallback.textContent = data().name.charAt(0); }
  });
  const compose = $('avatarImageCompose');
  if (state.avatar) {
    compose.src = state.avatar;
    compose.style.display = 'block';
    compose.style.width = zoom + '%';
    compose.style.height = zoom + '%';
    compose.style.left = (offset * state.avatarX / 100) + '%';
    compose.style.top = (offset * state.avatarY / 100) + '%';
    compose.style.transform = 'none';
  } else compose.style.display = 'none';
  $('avatarZoomValue').textContent = state.avatarZoom + '%';
  $('avatarXValue').textContent = state.avatarX + '%';
  $('avatarYValue').textContent = state.avatarY + '%';
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
$('clearAvatar').addEventListener('click', () => {
  state.avatar = '';
  state.avatarZoom = 120;
  state.avatarX = 50;
  state.avatarY = 50;
  $('avatarInput').value = '';
  $('avatarZoom').value = 120;
  $('avatarX').value = 50;
  $('avatarY').value = 50;
  render();
});
['avatarZoom', 'avatarX', 'avatarY'].forEach((id) => $(id).addEventListener('input', () => {
  state.avatarZoom = Number($('avatarZoom').value);
  state.avatarX = Number($('avatarX').value);
  state.avatarY = Number($('avatarY').value);
  render();
}));
$('mediaInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { state.media = reader.result; render(); };
  reader.readAsDataURL(file);
});
$('clearMedia').addEventListener('click', () => {
  state.media = '';
  $('mediaInput').value = '';
  render();
});
$('mediaMode').addEventListener('change', (event) => {
  state.mediaMode = event.target.value;
  render();
});
$('toggleStats').addEventListener('click', () => { state.showStats = !state.showStats; render(); });
$('zoomIn').addEventListener('click', () => { state.zoom = Math.min(1.2, +(state.zoom + .1).toFixed(2)); render(); });
$('zoomOut').addEventListener('click', () => { state.zoom = Math.max(.8, +(state.zoom - .1).toFixed(2)); render(); });
window.addEventListener('resize', () => requestAnimationFrame(fitCanvas));
$('resetButton').addEventListener('click', () => window.location.reload());

function isMobileBrowser() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '')
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isAppleMobileBrowser() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent || '')
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG conversion failed')), 'image/png');
  });
}

let savedBlob = null;
let savedPreviewUrl = '';
let savedDataUrl = '';

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function openSaveSheet(blob, filename) {
  savedBlob = blob;
  if (savedPreviewUrl) URL.revokeObjectURL(savedPreviewUrl);
  savedDataUrl = '';
  savedPreviewUrl = URL.createObjectURL(blob);
  $('savePreview').src = savedPreviewUrl;
  $('savePreview').dataset.filename = filename;
  const downloadLink = $('downloadSavedImage');
  downloadLink.href = savedPreviewUrl;
  downloadLink.download = filename;
  blobToDataUrl(blob).then((dataUrl) => {
    if (savedBlob !== blob) return;
    savedDataUrl = dataUrl;
    $('savePreview').src = dataUrl;
    downloadLink.href = dataUrl;
  }).catch(() => undefined);
  $('saveSheet').classList.add('open');
  $('saveSheet').setAttribute('aria-hidden', 'false');
}

function closeSaveSheet() {
  $('saveSheet').classList.remove('open');
  $('saveSheet').setAttribute('aria-hidden', 'true');
  if (savedPreviewUrl) URL.revokeObjectURL(savedPreviewUrl);
  savedPreviewUrl = '';
  savedDataUrl = '';
  savedBlob = null;
  $('savePreview').removeAttribute('src');
  $('downloadSavedImage').removeAttribute('href');
}

async function saveImage(canvas) {
  const blob = await canvasToBlob(canvas);
  const filename = 'post-studio-' + state.platform + '.png';
  const mobile = isMobileBrowser();
  if (mobile) {
    openSaveSheet(blob, filename);
    return '图片已生成，请在预览中长按保存';
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  return mobile ? '图片已打开，请长按图片保存' : '图片已保存，可以直接发到小红书';
}

async function renderExportCanvas() {
  const exportWidth = state.platform === 'x' ? 540 : 610;
  const exportHeight = Math.ceil(card.offsetHeight / card.offsetWidth * exportWidth);
  const clone = card.cloneNode(true);
  clone.classList.add('exporting');
  clone.style.width = exportWidth + 'px';
  clone.style.minWidth = exportWidth + 'px';
  clone.style.height = exportHeight + 'px';
  clone.style.aspectRatio = 'auto';
  clone.style.position = 'fixed';
  clone.style.left = '-10000px';
  clone.style.top = '0';
  clone.style.transform = 'none';
  document.body.appendChild(clone);
  try {
    await document.fonts.ready;
    await Promise.all(Array.from(clone.querySelectorAll('img')).map((image) => {
      if (image.complete && image.naturalWidth) return Promise.resolve();
      return typeof image.decode === 'function'
        ? image.decode().catch(() => undefined)
        : new Promise((resolve) => { image.onload = resolve; image.onerror = resolve; });
    }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return await html2canvas(clone, {
      width: exportWidth,
      height: exportHeight,
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      windowWidth: exportWidth,
      windowHeight: exportHeight,
    });
  } finally {
    clone.remove();
  }
}

async function shareSavedImage() {
  if (!savedBlob) return false;
  const filename = $('savePreview').dataset.filename || 'post-studio.png';
  try {
    if (navigator.share && navigator.canShare && typeof File !== 'undefined') {
      const file = new File([savedBlob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Post Studio 图片' });
        $('toast').textContent = '已打开系统分享面板';
        return true;
      }
    }
  } catch (error) {
    if (error && error.name === 'AbortError') return false;
  }
  const imageUrl = savedDataUrl || savedPreviewUrl;
  if (imageUrl) {
    const opened = window.open(imageUrl, '_blank', 'noopener');
    if (!opened) window.location.href = imageUrl;
    return true;
  }
  return false;
}

$('closeSaveSheet').addEventListener('click', closeSaveSheet);
$('closeSaveSheetButton').addEventListener('click', closeSaveSheet);
$('shareSavedImage').addEventListener('click', shareSavedImage);
$('downloadSavedImage').addEventListener('click', (event) => {
  if (!isAppleMobileBrowser() || !savedPreviewUrl) return;
  event.preventDefault();
  const imageUrl = savedDataUrl || savedPreviewUrl;
  const opened = window.open(imageUrl, '_blank', 'noopener');
  if (!opened) window.location.href = imageUrl;
});

$('exportButton').addEventListener('click', async () => {
  const button = $('exportButton'); button.disabled = true; button.textContent = '生成中…';
  try {
    if (!window.html2canvas) throw new Error('html2canvas is not ready');
    const shot = await renderExportCanvas();
    $('toast').textContent = await saveImage(shot);
  } catch (error) {
    $('toast').textContent = error && error.name === 'AbortError' ? '已取消保存' : '保存失败，请稍后再试';
  }
  finally { card.classList.remove('exporting'); }
  button.disabled = false; button.innerHTML = '<span class="button-icon">↓</span>保存图片';
  $('toast').classList.add('show'); setTimeout(() => $('toast').classList.remove('show'), 2400);
});
render();
