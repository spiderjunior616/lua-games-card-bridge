(() => {
  if (window.__LuaToolsCardHelperWebkitShimLoaded) return;
  window.__LuaToolsCardHelperWebkitShimLoaded = true;

  const current = document.currentScript && document.currentScript.src;
  if (!current) {
    console.error("[Lua Games Card Bridge] webkit shim missing current script URL");
    return;
  }

  const script = document.createElement("script");
  script.src = new URL("../../public/luatools-card-helper.js", current).href;
  script.onload = () => console.log("[Lua Games Card Bridge] webkit shim loaded");
  script.onerror = () => console.error("[Lua Games Card Bridge] failed loading webkit runtime", script.src);
  document.documentElement.appendChild(script);
})();
