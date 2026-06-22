(function () {
  var REQUIRED_GLOBALS = [
    "AOLA_DEX_1_100",
    "Vue"
  ];
  var OPTIONAL_GAME_DATA_GLOBALS = [
    "AOLA_SPECIES_DATA_BY_DEX",
    "AOLA_SKILL_DATA_BY_ID",
    "AOLA_SKILL_DATA_LIST",
    "AOLA_EVOLUTION_CHAINS"
  ];

  function showCrash(message) {
    try {
      var box = document.createElement("div");
      box.style.position = "fixed";
      box.style.left = "12px";
      box.style.right = "12px";
      box.style.top = "12px";
      box.style.zIndex = "99999";
      box.style.background = "#7f1d1d";
      box.style.color = "#fff";
      box.style.padding = "10px 12px";
      box.style.borderRadius = "10px";
      box.style.font = "12px/1.5 Consolas, Menlo, monospace";
      box.style.whiteSpace = "pre-wrap";
      box.textContent = message;
      document.body.appendChild(box);
    } catch (_) {}
  }

  window.addEventListener("error", function (e) {
    var parts = [];
    parts.push("[JS Error] " + (e && e.message ? e.message : "unknown"));
    parts.push("file=" + (e && e.filename ? e.filename : ""));
    parts.push("line=" + (e && e.lineno ? e.lineno : 0) + ", col=" + (e && e.colno ? e.colno : 0));
    try {
      var diag = window.__aolaScriptDiag || {};
      var loaded = Array.isArray(diag.loaded) ? diag.loaded : [];
      var failed = Array.isArray(diag.failed) ? diag.failed : [];
      if (loaded.length) parts.push("loaded=" + loaded.join(" | "));
      if (failed.length) parts.push("failed=" + failed.join(" | "));
    } catch (_) {}
    if (e && e.error && e.error.stack) parts.push(String(e.error.stack));
    showCrash(parts.join("\n"));
  });

  window.addEventListener("unhandledrejection", function (e) {
    var reason = e && e.reason;
    var msg = reason && (reason.stack || reason.message) ? (reason.stack || reason.message) : String(reason);
    showCrash("[Promise Rejection]\n" + msg);
  });

  function runBootDiag() {
    try {
      var missing = [];
      for (var i = 0; i < REQUIRED_GLOBALS.length; i += 1) {
        var k = REQUIRED_GLOBALS[i];
        if (!(k in window) || window[k] == null) missing.push(k);
      }
      var app = document.getElementById("app");
      var hasRawMustache = false;
      var appVisible = false;
      if (app && typeof app.textContent === "string") {
        hasRawMustache = app.textContent.indexOf("{{") >= 0;
        appVisible = !!(app.offsetWidth || app.offsetHeight || (app.getClientRects && app.getClientRects().length));
      }
      if (missing.length > 0 || hasRawMustache) {
        var optionalMissing = [];
        for (var j = 0; j < OPTIONAL_GAME_DATA_GLOBALS.length; j += 1) {
          var optionalKey = OPTIONAL_GAME_DATA_GLOBALS[j];
          if (!(optionalKey in window) || window[optionalKey] == null) optionalMissing.push(optionalKey);
        }
        var lines = [];
        lines.push("[BOOT DIAG]");
        lines.push("missing_globals=" + (missing.length ? missing.join(", ") : "none"));
        lines.push("optional_game_data_missing=" + (optionalMissing.length ? optionalMissing.join(", ") : "none"));
        lines.push("raw_mustache=" + (hasRawMustache ? "yes" : "no"));
        lines.push("app_visible=" + (appVisible ? "yes" : "no"));
        try {
          var diag = window.__aolaScriptDiag || {};
          var loaded = Array.isArray(diag.loaded) ? diag.loaded : [];
          var failed = Array.isArray(diag.failed) ? diag.failed : [];
          lines.push("loaded=" + (loaded.length ? loaded.join(" | ") : "none"));
          lines.push("failed=" + (failed.length ? failed.join(" | ") : "none"));
        } catch (_) {}
        showCrash(lines.join("\n"));
      }
    } catch (_) {}
  }

  function runBootDiagWhenReady() {
    try {
      var diag = window.__aolaScriptDiag || {};
      if (diag.bootDone) {
        runBootDiag();
        return;
      }
      window.addEventListener("aola:bootdone", runBootDiag, { once: true });
      setTimeout(function () {
        var latest = window.__aolaScriptDiag || {};
        if (!latest.bootDone) runBootDiag();
      }, 12000);
    } catch (_) {
      setTimeout(runBootDiag, 12000);
    }
  }

  window.addEventListener("load", function () {
    setTimeout(runBootDiagWhenReady, 0);
  });
})();
