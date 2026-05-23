const MILLENNIUM_IS_CLIENT_MODULE = true;
const pluginName = "luatools-card-helper";
const currentScriptSrc = document.currentScript && document.currentScript.src;

(window.PLUGIN_LIST ||= {})[pluginName] ||= {};
window.MILLENNIUM_SIDEBAR_NAVIGATION_PANELS ||= {};

const VISUAL_DROP_MODE_HALF = "steam_half";
const VISUAL_DROP_MODE_ALL = "all";

function getReact() {
  return window.SP_REACT || window.React || globalThis.SP_REACT || globalThis.React || null;
}

function parsePayload(raw) {
  const value = raw && typeof raw === "object" && "returnValue" in raw ? raw.returnValue : raw;
  if (!value) return null;
  if (typeof value === "string") return JSON.parse(value);
  return value;
}

function normalizeVisualDropMode(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === VISUAL_DROP_MODE_ALL || normalized === "all_cards" || normalized === "todas"
    ? VISUAL_DROP_MODE_ALL
    : VISUAL_DROP_MODE_HALF;
}

function normalizeSettings(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    visualDropMode: normalizeVisualDropMode(source.visualDropMode),
  };
}

function callBackend(methodName, argumentList) {
  if (!window.Millennium || typeof window.Millennium.callServerMethod !== "function") {
    return Promise.reject(new Error("Millennium.callServerMethod unavailable"));
  }

  return window.Millennium
    .callServerMethod(pluginName, methodName, {
      ...(argumentList || {}),
      contentScriptQuery: "",
    })
    .then(parsePayload);
}

function publishSettings(settings) {
  const normalized = normalizeSettings(settings);
  try {
    window.dispatchEvent(new CustomEvent("LuaToolsCardBridgeSettingsChanged", { detail: normalized }));
  } catch (_) {}
}

function resolveRuntimeUrl() {
  return currentScriptSrc ? new URL("../../public/luatools-card-helper.js", currentScriptSrc).href : "";
}

function loadCardRuntime() {
  if (window.__LuaToolsCardHelperCoreShimLoaded) return;
  window.__LuaToolsCardHelperCoreShimLoaded = true;

  const runtimeUrl = resolveRuntimeUrl();
  if (!runtimeUrl) {
    console.error("[Lua Games Card Bridge] core shim missing current script URL");
    return;
  }

  const script = document.createElement("script");
  script.src = runtimeUrl;
  script.onload = () => console.log("[Lua Games Card Bridge] core shim loaded");
  script.onerror = () => console.error("[Lua Games Card Bridge] failed loading core shim", script.src);
  document.documentElement.appendChild(script);
}

function SettingsIcon() {
  const React = getReact();
  if (!React) return null;
  return React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: 20,
      height: 20,
      fill: "none",
      "aria-hidden": true,
    },
    React.createElement("rect", {
      x: 6,
      y: 4,
      width: 10,
      height: 14,
      rx: 1.6,
      stroke: "currentColor",
      strokeWidth: 1.8,
    }),
    React.createElement("rect", {
      x: 9,
      y: 7,
      width: 10,
      height: 14,
      rx: 1.6,
      stroke: "currentColor",
      strokeWidth: 1.8,
      opacity: 0.68,
    }),
  );
}

function SettingsPanel() {
  const React = getReact();
  const h = React.createElement;
  const [mode, setMode] = React.useState(VISUAL_DROP_MODE_HALF);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState("");

  const loadSettings = React.useCallback(() => {
    setLoading(true);
    setStatus("");
    callBackend("GetLuaToolsCardBridgeSettings", {})
      .then((payload) => {
        const settings = normalizeSettings(payload && payload.settings);
        setMode(settings.visualDropMode);
        publishSettings(settings);
      })
      .catch((error) => {
        console.warn("[Lua Games Card Bridge] failed loading config panel settings", error);
        setStatus("Nao consegui ler a configuracao salva.");
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveMode = (nextMode) => {
    const normalizedMode = normalizeVisualDropMode(nextMode);
    if (saving || normalizedMode === mode) return;

    setSaving(true);
    setMode(normalizedMode);
    setStatus("Salvando...");
    callBackend("SetLuaToolsCardBridgeSettings", { visualDropMode: normalizedMode })
      .then((payload) => {
        const settings = normalizeSettings((payload && payload.settings) || { visualDropMode: normalizedMode });
        setMode(settings.visualDropMode);
        publishSettings(settings);
        setStatus("Salvo.");
      })
      .catch((error) => {
        console.warn("[Lua Games Card Bridge] failed saving config panel settings", error);
        setStatus("Nao consegui salvar agora.");
      })
      .finally(() => setSaving(false));
  };

  const optionButton = (value, title, text) => {
    const selected = mode === value;
    return h(
      "button",
      {
        type: "button",
        onClick: () => saveMode(value),
        disabled: loading || saving,
        style: {
          minHeight: 74,
          padding: "12px 14px",
          border: selected ? "1px solid #66c0f4" : "1px solid rgba(103, 126, 149, 0.6)",
          borderRadius: 4,
          background: selected ? "rgba(102, 192, 244, 0.18)" : "rgba(32, 43, 56, 0.76)",
          color: selected ? "#ffffff" : "#dfe3e6",
          cursor: loading || saving ? "default" : "pointer",
          textAlign: "left",
          fontFamily: "Motiva Sans, Arial, sans-serif",
          opacity: loading || saving ? 0.72 : 1,
        },
      },
      h("div", { style: { fontSize: 15, fontWeight: 700, marginBottom: 4 } }, title),
      h("div", { style: { fontSize: 13, lineHeight: 1.35, color: selected ? "#c9e8fb" : "#9fb2c3" } }, text),
    );
  };

  return h(
    "div",
    {
      style: {
        color: "#dfe3e6",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        fontFamily: "Motiva Sans, Arial, sans-serif",
        maxWidth: 620,
        minWidth: 360,
      },
    },
    h("div", { style: { fontSize: 18, fontWeight: 700, color: "#ffffff" } }, "Drops visuais de cartas"),
    h(
      "div",
      {
        style: {
          color: "#9fb2c3",
          fontSize: 13,
          lineHeight: 1.4,
        },
      },
      "Escolha como o bridge visual marca cartas locais na aba de cartas da Biblioteca.",
    ),
    h(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
        },
      },
      optionButton(VISUAL_DROP_MODE_HALF, "Metade estilo Steam", "Limita o visual ao numero normal de drops."),
      optionButton(VISUAL_DROP_MODE_ALL, "Todas as cartas", "Permite completar visualmente o set inteiro."),
    ),
    h(
      "div",
      {
        style: {
          minHeight: 18,
          color: status === "Salvo." ? "#8bc53f" : "#66c0f4",
          fontSize: 12,
        },
      },
      loading ? "Carregando..." : status,
    ),
  );
}

function buildConfigPanel() {
  const React = getReact();
  if (!React || typeof React.createElement !== "function") {
    console.warn("[Lua Games Card Bridge] SP_REACT unavailable; config panel disabled");
    return null;
  }

  return {
    title: React.createElement("p", null, "Lua Games Card Bridge"),
    icon: React.createElement(SettingsIcon),
    content: React.createElement(SettingsPanel),
  };
}

function PluginEntryPointMain() {
  const exports = {};
  exports.default = async function () {
    console.log("[Lua Games Card Bridge] Millennium config frontend loaded");
    return buildConfigPanel();
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  return exports;
}

let backendReadySent = false;
function signalBackendReady() {
  if (backendReadySent) return;
  backendReadySent = true;
  try {
    window.MILLENNIUM_BACKEND_IPC?.postMessage?.(1, { pluginName });
  } catch (error) {
    console.error("[Lua Games Card Bridge] failed to signal Millennium readiness", error);
  }
}

(async () => {
  try {
    const exports = PluginEntryPointMain();
    Object.assign(window.PLUGIN_LIST[pluginName], {
      ...exports,
      __millennium_internal_plugin_name_do_not_use_or_change__: pluginName,
    });

    const panel = await exports.default();
    if (panel && panel.title !== undefined && panel.icon !== undefined && panel.content !== undefined) {
      window.MILLENNIUM_SIDEBAR_NAVIGATION_PANELS[pluginName] = panel;
      console.log("[Lua Games Card Bridge] registered Millennium config panel");
    } else {
      console.warn("[Lua Games Card Bridge] config panel unavailable");
    }
  } catch (error) {
    console.error("[Lua Games Card Bridge] Millennium frontend failed", error);
  } finally {
    signalBackendReady();
    loadCardRuntime();
  }
})();
