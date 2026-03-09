
    const windows = [...document.querySelectorAll('.window')];
    const dock = document.getElementById('dock');
    let topZ = 50;

    function updateClock() {
      const now = new Date();
      document.getElementById('clock').textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 1000 * 30);

    function focusWindow(win) {
      topZ += 1;
      win.style.zIndex = topZ;
    }

    function openWindow(name) {
      const win = document.getElementById(`window-${name}`);
      if (!win) return;
      win.classList.remove('hidden');
      focusWindow(win);
      syncDock();
    }

    function closeWindow(win) {
      win.classList.add('hidden');
      syncDock();
    }

    function syncDock() {
      dock.innerHTML = '';
      windows.filter(w => !w.classList.contains('hidden')).forEach(win => {
        const item = document.createElement('button');
        item.className = 'dock-item';
        item.title = win.querySelector('.window-title').textContent;
        item.textContent = win.querySelector('.window-icon').textContent.trim() || '•';
        item.addEventListener('click', () => focusWindow(win));
        dock.appendChild(item);
      });
    }

    document.querySelectorAll('.icon[data-window]').forEach(icon => {
      icon.addEventListener('click', () => openWindow(icon.dataset.window));
    });

    windows.forEach(win => {
      win.addEventListener('mousedown', () => focusWindow(win));
      win.querySelectorAll('.ctrl').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          if (action === 'close' || action === 'minimize') closeWindow(win);
          if (action === 'focus') focusWindow(win);
        });
      });

      const header = win.querySelector('.window-header');
      let dragging = false;
      let startX = 0, startY = 0, startLeft = 0, startTop = 0;

      header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.ctrl')) return;
        dragging = true;
        focusWindow(win);
        const rect = win.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;
        document.body.style.userSelect = 'none';
      });

      window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const maxLeft = window.innerWidth - win.offsetWidth - 16;
        const maxTop = window.innerHeight - win.offsetHeight - 90;
        const nextLeft = Math.min(Math.max(16, startLeft + dx), maxLeft);
        const nextTop = Math.min(Math.max(70, startTop + dy), maxTop);
        win.style.left = `${nextLeft}px`;
        win.style.top = `${nextTop}px`;
      });

      window.addEventListener('mouseup', () => {
        dragging = false;
        document.body.style.userSelect = '';
      });
    });

    syncDock();
