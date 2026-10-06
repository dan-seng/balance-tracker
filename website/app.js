/**
 * Hisab - Interactive Web Client
 * Manages light/dark theme and download functionality.
 */

(function () {
  'use strict';

  const FALLBACK_TAG = 'Latest';

  // SVG Icons
  const ANDROID_ICON = `<svg class="os-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.413 13.8564 8 12 8s-3.5902.413-5.1368.9507L4.8409 5.4477a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/></svg>`;
  const PORTFOLIO_ICON = `<svg class="os-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`;

  const SUN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  const MOON_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

  // Default direct release URLs
  const DEFAULT_URLS = {
    androidApk: 'Hisab.apk',
    portfolio: 'https://daniii.dev'
  };

  let releaseData = {
    tag: FALLBACK_TAG,
    urls: { ...DEFAULT_URLS },
    sizes: {
      androidApk: '28 MB'
    }
  };

  /**
   * Anonymous download counter
   */
  const VISITOR_ID_KEY = 'hisab_visitor_id';

  function getVisitorId() {
    try {
      let id = localStorage.getItem(VISITOR_ID_KEY);
      if (!id) {
        id =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(VISITOR_ID_KEY, id);
      }
      return id;
    } catch (err) {
      return '';
    }
  }

  function trackDownload() {
    try {
      navigator.sendBeacon(`/api/download?id=${encodeURIComponent(getVisitorId())}`);
    } catch (err) {
      // tracking must never block the download itself
    }
  }

  function formatCount(value) {
    return new Intl.NumberFormat('en-US').format(value);
  }

  function renderDownloadCount() {
    const hosts = document.querySelectorAll('[data-download-counter]');
    if (!hosts.length || typeof fetch !== 'function') return;

    fetch('/api/count', { headers: { Accept: 'application/json' } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data || !data.downloads) return;

        hosts.forEach((host) => {
          const downloads = host.querySelector('[data-count-downloads]');
          const users = host.querySelector('[data-count-users]');
          if (downloads) downloads.textContent = formatCount(data.downloads);
          if (users) {
            users.textContent =
              data.users > 0
                ? ` from ${formatCount(data.users)} ${data.users === 1 ? 'person' : 'people'}`
                : '';
          }
          host.hidden = false;
        });
      })
      .catch(() => {
        // stay hidden when the counter is unavailable
      });
  }

  /**
   * Theme Management (Light / Dark)
   */
  function initTheme() {
    const savedTheme = localStorage.getItem('hisab_theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'dark');

    setTheme(currentTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
      });
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hisab_theme', theme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#070709' : '#fafafc');
    }

    // Update toggle button icon
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.innerHTML = theme === 'dark' ? SUN_ICON : MOON_ICON;
      toggleBtn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
  }

  /**
   * Format bytes to readable MB/GB
   */
  function formatBytes(bytes) {
    if (!bytes || isNaN(bytes)) return '';
    const mb = bytes / (1024 * 1024);
    return `${Math.round(mb)} MB`;
  }

  /**
   * Update UI download buttons based on OS and current active format
   */
  function updateDownloadButtons(formatOverride) {
    const primaryBtn = document.getElementById('primary-download-btn');
    const bottomBtn = document.getElementById('bottom-download-btn');
    const metaCaption = document.getElementById('meta-caption');
    const bottomMetaCaption = document.getElementById('bottom-meta-caption');
    const pills = document.querySelectorAll('.pill-link');

    let targetUrl = releaseData.urls.androidApk;
    let label = `Download Android APK (${releaseData.sizes.androidApk})`;
    let meta = `${releaseData.tag} • Android 7.0+ • Free & Open Source`;
    let activeKey = 'androidApk';
    let iconSvg = ANDROID_ICON;

    if (formatOverride === 'githubReleases') {
      targetUrl = releaseData.urls.releasesPage;
      label = 'View GitHub Releases';
      meta = 'All tagged releases, changelogs, and APK assets';
      activeKey = 'githubReleases';
      iconSvg = GITHUB_ICON;
    } else if (formatOverride === 'sourceZip') {
      targetUrl = releaseData.urls.sourceZip;
      label = 'Download Source Code (.zip)';
      meta = 'Latest main branch • TypeScript & React Native codebase';
      activeKey = 'sourceZip';
      iconSvg = CODE_ICON;
    } else {
      targetUrl = releaseData.urls.androidApk;
      label = `Download Android APK (${releaseData.sizes.androidApk})`;
      meta = `${releaseData.tag} • Android 7.0+ (ARM64 & x86_64) • Direct Standalone APK`;
      activeKey = 'androidApk';
      iconSvg = ANDROID_ICON;
    }

    // Apply to Primary CTA
    if (primaryBtn) {
      primaryBtn.href = targetUrl;
      const iconSpan = primaryBtn.querySelector('.btn-icon');
      if (iconSpan) iconSpan.innerHTML = iconSvg;
      const textSpan = primaryBtn.querySelector('.btn-text');
      if (textSpan) textSpan.textContent = label;
    }

    // Apply to Bottom CTA
    if (bottomBtn) {
      bottomBtn.href = targetUrl;
      const iconSpan = bottomBtn.querySelector('.btn-icon');
      if (iconSpan) iconSpan.innerHTML = iconSvg;
      const textSpan = bottomBtn.querySelector('.btn-text');
      if (textSpan) textSpan.textContent = label;
    }

    // Apply captions
    if (metaCaption) metaCaption.textContent = meta;
    if (bottomMetaCaption) bottomMetaCaption.textContent = meta;

    // Update active pill styling
    pills.forEach((pill) => {
      const format = pill.getAttribute('data-format');
      if (format === activeKey) {
        pill.classList.add('active-pill');
      } else {
        pill.classList.remove('active-pill');
      }
    });
  }

  /**
   * Fetch Latest Release from GitHub API
   */
  async function fetchGitHubReleases() {
    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`, {
        headers: { Accept: 'application/vnd.github.v3+json' }
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.tag_name) {
        releaseData.tag = data.tag_name;
      }

      if (Array.isArray(data.assets)) {
        data.assets.forEach((asset) => {
          const name = asset.name.toLowerCase();
          const downloadUrl = asset.browser_download_url;
          const size = formatBytes(asset.size);

          if (name.endsWith('.apk')) {
            releaseData.urls.androidApk = downloadUrl;
            if (size) releaseData.sizes.androidApk = size;
          }
        });
      }

      updateDownloadButtons();
    } catch (err) {
      console.warn('Using fallback direct release paths:', err);
    }
  }

  /**
   * Initialize on DOM Ready
   */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateDownloadButtons();

    // Pill click listener to select formats
    document.querySelectorAll('.pill-link').forEach((pill) => {
      pill.addEventListener('click', (e) => {
        const format = pill.getAttribute('data-format');
        if (format) {
          if (format !== 'githubReleases' && format !== 'sourceZip') {
            e.preventDefault();
          }
          updateDownloadButtons(format);
        }
      });
    });

    // Count a download only when it actually navigates. Registered after the
    // pill listener so its preventDefault() is already visible here.
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (!target || typeof target.closest !== 'function') return;
      const link = target.closest('a[href]');
      if (!link) return;
      if (!link.href.split('?')[0].endsWith('.apk')) return;
      trackDownload();
    });

    renderDownloadCount();

    // Fetch real-time release info from GitHub API
    fetchGitHubReleases();
  });
})();
