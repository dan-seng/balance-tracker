(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  function formatBytes(bytes) {
    if (!bytes || bytes < 0) return "";
    var mb = bytes / 1024 / 1024;
    return mb >= 1 ? mb.toFixed(1) + " MB" : Math.round(mb * 1024) + " KB";
  }

  function findApk(assets) {
    for (var i = 0; i < assets.length; i++) {
      var n = assets[i].name || "";
      if (/\.apk$/i.test(n) && /^hisab/i.test(n)) return assets[i];
    }
    return null;
  }

  fetch("https://api.github.com/repos/dan-seng/balance-tracker/releases/latest", {
    headers: { Accept: "application/vnd.github+json" },
  })
    .then(function (res) {
      if (!res.ok) throw new Error("bad response");
      return res.json();
    })
    .then(function (release) {
      var tag = (release.tag_name || "").split("-")[0];
      var meta = document.getElementById("latest-meta");
      var downloadMeta = document.getElementById("download-meta");

      if (meta && tag) meta.textContent = "v" + tag.replace(/^v/i, "");

      var apk = findApk(release.assets || []);
      if (downloadMeta && apk) {
        downloadMeta.textContent = "· " + apk.name + " · " + formatBytes(apk.size);
      }

      var buttons = document.querySelectorAll('a[href*="releases/latest/download/Hisab.apk"]');
      buttons.forEach(function (btn) {
        btn.setAttribute("download", apk ? apk.name : "Hisab.apk");
      });
    })
    .catch(function () {
      var meta = document.getElementById("latest-meta");
      if (meta) meta.textContent = "v0.0.1";
    });
})();