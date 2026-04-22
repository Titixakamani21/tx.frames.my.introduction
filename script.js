/* ═══════════════════════════════════════════════════
   FOLDER DATA
   Edit titles, notes, bubble text, and photo labels here.
   To add real photos, uncomment the backgroundImage lines
   inside openFolder() below.
═══════════════════════════════════════════════════ */
const folderData = {
  live: {
    label: '',
    title: 'Life in Berlin',
    bubble: 'canal walks, cold mornings, and finding the best späti — this is home 🫶',
    bubbleClass: 'bubble-tail-left',
    photos: ['favourite spot', 'neighbourhood', 'daily corner'],
    layout: 'layout-a',
    imageFiles: ['berlin1.png', 'berlin2.png', 'berlin3.png']
  },
  do: {
    label: '',
    title: 'Things I Build',
    bubble: 'code by day, soap and side projects by night — it all makes sense somehow ✨',
    bubbleClass: 'bubble-tail-right',
    photos: ['workspace', 'creative mode', 'at work'],
    layout: 'layout-b',
    imageFiles: ['work1.png', 'work2.png', 'work3.png'],
    imageFit: 'contain'
  },
  obsessions: {
    label: '',
    title: 'Current Obsessions',
    bubble: 'F1, matcha, good fonts, and Indian equity charts — my brain in 4 things 🌟',
    bubbleClass: 'bubble-tail-right',
    photos: ['obsession #1', 'obsession #2', 'guilty pleasure'],
    layout: 'layout-c',
    imageFiles: ['O1.png', 'O2.png', 'O3.png'],
    imageFit: 'contain'
  }
};

const introScreen = document.getElementById('introScreen');
const introType = document.getElementById('introType');
const introMessage = 'Welcome to my digital life.';

document.body.classList.add('is-intro-active');

if (introScreen && introType) {
  let introIndex = 0;
  const typeInterval = window.setInterval(() => {
    introType.textContent = introMessage.slice(0, introIndex + 1);
    introIndex += 1;

    if (introIndex >= introMessage.length) {
      window.clearInterval(typeInterval);
    }
  }, 70);

  window.setTimeout(() => {
    introScreen.classList.add('is-exiting');
  }, 2400);

  window.setTimeout(() => {
    introScreen.classList.remove('active', 'is-exiting');
    document.body.classList.remove('is-intro-active');
  }, 3000);
}

/* ═══════════════════════════════════════════════════
   DRAG SYSTEM
   Makes every .el element freely draggable via touch or mouse.
   Elements stay within screen bounds and stack on top when grabbed.
═══════════════════════════════════════════════════ */
let zTop = 20;

function makeDraggable(el) {
  let startX, startY, origLeft, origTop;
  let dragging = false;
  let moved    = false;
  let timer    = null;

  /* Lock in px position so right/bottom don't fight left/top */
  function initPos() {
    const r = el.getBoundingClientRect();
    el.style.right  = 'auto';
    el.style.bottom = 'auto';
    el.style.left   = r.left + 'px';
    el.style.top    = r.top  + 'px';
  }

  function onStart(cx, cy) {
    initPos();
    startX   = cx;
    startY   = cy;
    origLeft = parseFloat(el.style.left);
    origTop  = parseFloat(el.style.top);
    moved    = false;

    /* Short hold activates drag so quick taps still fire clicks */
    timer = setTimeout(() => {
      dragging = true;
      el.classList.add('dragging');
      zTop++;
      el.style.zIndex = zTop;
    }, 130);
  }

  function onMove(cx, cy) {
    if (!dragging) return;
    const dx = cx - startX;
    const dy = cy - startY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;

    /* Clamp to screen */
    const W = window.innerWidth;
    const H = window.innerHeight;
    const w = el.offsetWidth;
    const h = el.offsetHeight;

    el.style.left = Math.max(0, Math.min(W - w, origLeft + dx)) + 'px';
    el.style.top  = Math.max(0, Math.min(H - h, origTop  + dy)) + 'px';
  }

  function onEnd(e) {
    clearTimeout(timer);
    if (dragging) {
      el.classList.remove('dragging');
      dragging = false;
      if (moved) e.stopPropagation(); /* block click after a drag */
    }
  }

  /* Touch events */
  el.addEventListener('touchstart', e => onStart(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  el.addEventListener('touchmove',  e => { if (dragging) e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  el.addEventListener('touchend',   e => onEnd(e), { passive: false });

  /* Mouse events */
  el.addEventListener('mousedown', e => {
    onStart(e.clientX, e.clientY);
    const onMouseMove = ev => onMove(ev.clientX, ev.clientY);
    const onMouseUp   = ev => {
      onEnd(ev);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
  });
}

/* Apply drag to all desktop elements */
document.querySelectorAll('.el').forEach(makeDraggable);

/* ═══════════════════════════════════════════════════
   FOLDER POPUP
═══════════════════════════════════════════════════ */
document.querySelectorAll('[data-folder]').forEach(el => {
  el.addEventListener('click', function () {
    if (this.classList.contains('dragging')) return;
    openFolder(this.dataset.folder);
  });
});

function openFolder(key) {
  const f = folderData[key];
  const popup = document.getElementById('popup');
  popup.classList.remove('popup-live-mode', 'popup-do-mode', 'popup-live-folder-mode', 'popup-obsessions-mode');

  /* Heading + label */
  document.getElementById('popupLabel').textContent  = f.label;
  document.getElementById('popupTitle2').textContent = f.title;

  /* Bubble */
  const bubble = document.getElementById('popupBubble');
  bubble.textContent = f.bubble;
  bubble.className   = 'popup-bubble ' + f.bubbleClass;

  /* Photos */
  const container = document.getElementById('popupPhotos');
  container.className = 'popup-photos ' + f.layout;
  container.innerHTML = '';

  if (key === 'live' || key === 'obsessions' || key === 'do') {
    popup.classList.add('popup-live-mode');
    if (key === 'do') popup.classList.add('popup-do-mode');
    if (key === 'live') popup.classList.add('popup-live-folder-mode');
    if (key === 'obsessions') popup.classList.add('popup-obsessions-mode');
    container.className = 'popup-photos live-carousel';

    f.imageFiles.forEach((imageFile, i) => {
      const slide = document.createElement('div');
      slide.className = 'live-slide';

      const img = document.createElement('img');
      img.className = 'live-slide-img';
      img.src = imageFile;
      img.alt = f.photos[i] || `Berlin photo ${i + 1}`;

      slide.appendChild(img);
      container.appendChild(slide);
    });

    document.getElementById('overlay').classList.add('active');
    return;
  }

  popup.classList.remove('popup-live-mode');

  f.photos.forEach((label, i) => {
    const card = document.createElement('div');
    card.className = 'popup-photo';

    const img = document.createElement('div');
    img.className = 'popup-photo-img';
    const imageFile = f.imageFiles?.[i];

    if (imageFile) {
      img.style.backgroundImage = `url('${imageFile}')`;
      img.style.backgroundSize = f.imageFit || 'cover';
      img.style.backgroundRepeat = 'no-repeat';
      img.style.backgroundPosition = 'center';
      img.setAttribute('aria-label', label);
    } else {
      img.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="m21 15-5-5L5 21"/>
        </svg>
        <span>${label}</span>`;
    }

    card.appendChild(img);
    container.appendChild(card);
  });

  /* Always put bubble after photos */
  document.getElementById('popup').appendChild(bubble);

  document.getElementById('overlay').classList.add('active');
}

function closeFolder() {
  const popup = document.getElementById('popup');
  const overlay = document.getElementById('overlay');
  popup.classList.remove('is-closing', 'popup-live-mode', 'popup-do-mode', 'popup-live-folder-mode', 'popup-obsessions-mode');
  overlay.classList.remove('active');
}

/* Close on overlay tap */
document.getElementById('overlay').addEventListener('click', function (e) {
  if (e.target === this) closeFolder();
});

/* Close button */
document.getElementById('popupClose').addEventListener('click', closeFolder);

/* Swipe down to close */
let swipeStartY = 0;
document.getElementById('popup').addEventListener('touchstart', e => {
  swipeStartY = e.touches[0].clientY;
}, { passive: true });
document.getElementById('popup').addEventListener('touchend', e => {
  if (e.changedTouches[0].clientY - swipeStartY > 60) closeFolder();
}, { passive: true });
