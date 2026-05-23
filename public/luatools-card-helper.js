(function () {
  "use strict";

  const PLUGIN_NAME = "luatools-card-helper";
  const TAG = "[Lua Games Card Bridge]";
  const MARKER = "__LuaToolsCardBridge_v2";
  const MAX_APPS = 300;
  const SECTION_RETRY_MS = 250;
  const SECTION_MAX_TRIES = 160;
  const MANIFEST_REFRESH_MS = 10 * 60 * 1000;
  const SETTINGS_REFRESH_MS = 60 * 1000;
  const FETCH_COOLDOWN_MS = 45 * 1000;
  const COMMUNITY_VISUAL_SYNC_MS = 2500;
  const NATIVE_BADGE_SYNC_INTERVAL_MS = 4000;
  const NATIVE_BADGE_SYNC_APP_TTL_MS = 10 * 60 * 1000;
  const LOCAL_DROP_INTERVAL_MINUTES = 30;
  const SETTINGS_STORAGE_KEY = "LuaToolsCardBridgeSettings";
  const VISUAL_DROP_MODE_HALF = "steam_half";
  const VISUAL_DROP_MODE_ALL = "all";
  const REAL_OWNED_MARKER = "__ltchRealOwned";
  const LOCAL_VISUAL_OWNED_MARKER = "__ltchLocalVisualOwned";
  const REAL_BADGE_LEVEL_MARKER = "__ltchRealBadgeLevel";
  const REAL_BADGE_XP_MARKER = "__ltchRealBadgeXP";
  const REAL_BADGE_ICON_MARKER = "__ltchRealBadgeIconURL";
  const LOCAL_VISUAL_BADGE_MARKER = "__ltchLocalVisualBadge";
  const LOCAL_VISUAL_BADGE_ICON_SOURCE_MARKER = "__ltchLocalVisualBadgeIconSource";
  const STEAM_CARD_BADGE_ICON_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAa0SURBVFhH7Zd5TJRnHsf7/yabbLKuDDPDMdyHgEIRRLPZ1W4polwDCpRTEFAQRO1Kq6VbUa5BBDkHibIDKod4rDSuBtuVEldN7bbaRrfrouJRFVzlEJDjs3lf5Rzb+FLcI/FNPpnM+z6/7/OZ3zzPM5k3DAwM+H/gjak3/leRKCpDJldiaKRCbmz+SjBUmiIzVOjN/fKiMhkKlTU2S6JwXVXCwtQjLNx4bAY5ikdyHfNCs7Fw90EmN5qOqAyFmS2O6q14bDj6ynFPOoDN72IndfalRIWv2mZJNB6pR/5juCVUYe7qJU1UYWaHS3QRC1IPT8J9fSNuAikTWN+oN246uCfX4RCwRZqo0tIRt+QG3FMax1n/DNfkQzgnNYi4CK+J9bgk1YvS4piJNZI4hHNU0fRER3Fd18CClEMEbjtBankr68s+J6mkhaTiFiI1zSxMbcQpoZb5yfWT6qQyLdH56+rHcEmswzWpjui8Zk5/eYs7nb3c6ejldkcPl9s60TR8iXtyPXYxNeK4ibVSmBcpVdTCkTcTayfhvPYg89fVsabwU85cuk1P31NGgOGREb5/2EtZ02UWpNRjGa3jzbUHcZ1S/zI4RRRKE1VYOOKy9qAejvE12MZUE5TxCcf/2sbj3n5GRhB51NPP/k+vsii1HlXYPpwTDojCUzN+DMfwAumizmv2vxDHOB3W0VV4bzlK/V/+zsPuPlFUuHr7n/Kns/9k8aZDmIRWMjehBpe1+hk/hGNYvlRRB+bFV7+YhBocVuuwjNzLbzfWs+/P39DZ3S8uA+HqHxii+eIN/NOPYRO1D6fVOn3idMydmhtfjUPoTumiTnF//EHmxutwiK3CJETLgjgdn5y9xsDToeeq8KR/kBPn21iUchADdRnKlVoUK8tFlMFaVO/uwSGmirmCcJwg/izXPkQjUdTcAcfYqh/FKqISVaiW+LyTXG57wNDwsCgpbK7bHd3sqD4rPvdYt5/3yj/j/coWkfSqVjZXnMHz9w3Yr9qLQ8y+sUy74FxponLzOTjECCEvYNVezMMqMAvVsqHkNN+1P5wkeet+F5uKmpn1lobFG2r5/NJtup8M0N03QNeTAdrvd6E9/jcWJddgHbGHOaLsM2xXZksXnRNdqYd9lNDFMsxDy/hgzxlu3Oti5PlOGh4e4frdR8RmNvFz9214vlfLt9c7xPujH+L+v3rJr7+AVZgW0+BSvXzboCyJomZzsI+smIRdZAVmIaXYRGjJ0LXyfWfP2JocHBrm6o1Ogrc08AvXPxDwYSO3HnSPPR8aGubmvS626VoxDirGKLCYOVF79OawCdwhXdQ2QjuGTXg5FqGluMbvpeTIF+KRNDA4JCJ8pReu3MFv4wEUizKIzWmis+uJKCg0W9hkV252kKb9DHnAbpSBu7GLHM+eiJV6u1RRe2zCy0Ssw8uwCC3BNqKM1blNnLxwjdZL7Zy+eJ3mi23oTn6NV2oNVl4aNpc2i+tx9OobGOTi1bskFpxgtm8+SnWhmDOaPRXLgAzpotbvloxhFVqMbVgpzjEVOEaVi+8tn2OkLuBX7+QQl3Nc7OTo4S+szZv3HpNW3szP3s7C0C8fm7DxzBdh4fexNFFDM3ssQ4vGEMQsQoowXVGIMiB/HHU+RupdIm+l6jjacoVHwuEv/qyOiOLVp77m10lVyP12ogoqxCpEyBvPnoi570cSRVV2WAQXSmLWslzsworRHvuCB496xV0uNLenb4BTF67hl3YApa8Gk4B8vdpRzHzSpYuaryyQhNmKXfxyaRamgflk17TQfu/x2NHU1z9Iy1c3CPuoAVNfDcb+eZit0M9QLf9QuqgqKH9azFqahcJPQ1rZKb5r72TouaxwQpz/9harMw9j7p+H0jcXs6B8kdFaE2+Jf0VkKjtM1TunhSpwJ7OXZSP3ySFRc4yv/nFX3P39A4N09Q5w7pt2Unc1YRNcgNIvF1N13litidcHEkVNbTEJENbTNFFrkC3LQumTTXB6LbsbzlJ25Bylh89Tevgc6ZXNeMRpUfjmYOw/XmfslTYNUd8sjP1zfxJyn2wMvDMx8snGxFcgB5VfDuaBGlRqYa1OHJ+D8dubJIoaW6BckoKRX/ZPJAf58ixmL90+CQPvHSjFRuSIY8SxPhkoPMKliRrIjTB0egfl8u1i4KsnE4VnGoZWbhJFBZSmGLoFo/T++JmwT+YrYAfK5RkoPN8XGzNx/pcXFZAbIXNYjOI3a1B4bUGxdOvM4bUVhedm5AsjkVnN15tbmuh/kdeiM81r0ZnmtehM81p0pvk3CTKyquXRmfAAAAAASUVORK5CYII=";
  const SCRIPT_BASE_URL = (() => {
    try {
      const src = document.currentScript && document.currentScript.src;
      return src ? new URL(".", src).href : "";
    } catch (_) {
      return "";
    }
  })();

  if (window[MARKER]) return;
  window[MARKER] = true;

  const STATE = {
    req: null,
    modules: null,
    manifest: null,
    manifestPromise: null,
    manifestLoadedAt: 0,
    settings: { visualDropMode: VISUAL_DROP_MODE_HALF },
    settingsPromise: null,
    settingsLoadedAt: 0,
    luaApps: new Map(),
    cardApps: new Set(),
    badgeAppsWithCards: new Set(),
    badgeAppsWithoutCards: new Set(),
    fetchInFlight: new Map(),
    lastFetchAt: new Map(),
    loggedSections: new Set(),
    loggedBadgeData: new Set(),
    loggedVisualDrops: new Set(),
    loggedVisualBadges: new Set(),
    visualDropPlans: new Map(),
    badgeIconCache: new Map(),
    badgeIconFetches: new Map(),
    badgeIconRetryAt: new Map(),
    communityVisualData: new Map(),
    communityVisualPromises: new Map(),
    communityVisualBatchPromises: new Map(),
    communityVisualBatchLoaded: new Set(),
    communityVisualSyncAt: new Map(),
    nativeBadgeSyncApps: new Map(),
    nativeBadgeSyncTimer: 0,
    communityPatchObserver: null,
    communityPatchTimer: 0,
    communityBadgesObserver: null,
    communityBadgesTimer: 0,
    loggedCommunityVisuals: new Set(),
    loggedCommunityBadges: new Set(),
    savedVisualSnapshots: new Set(),
    nativeBadgeRefreshAt: new Map(),
    patchedBadgeStore: false,
    patchedSections: false,
    settingsScanTimer: 0,
    settingsObserver: null,
  };

  function stringify(value) {
    const seen = new WeakSet();
    try {
      return JSON.stringify(value, (key, val) => {
        if (typeof val === "function") return `[function ${val.name || "anonymous"}]`;
        if (val && typeof val === "object") {
          if (seen.has(val)) return "[circular]";
          seen.add(val);
        }
        return val;
      });
    } catch (err) {
      return `[unserializable: ${err && err.message ? err.message : String(err)}]`;
    }
  }

  function log(message, data) {
    try {
      if (data === undefined) console.log(TAG, message);
      else console.log(TAG, message, stringify(data));
    } catch (_) {}
  }

  function warn(message, data) {
    try {
      if (data === undefined) console.warn(TAG, message);
      else console.warn(TAG, message, stringify(data));
    } catch (_) {}
  }

  function pluginAssetUrl(path) {
    try {
      if (SCRIPT_BASE_URL) return new URL(path, SCRIPT_BASE_URL).href;
    } catch (_) {}
    return path;
  }

  function parsePayload(raw) {
    if (!raw) return null;
    if (typeof raw === "string") return JSON.parse(raw);
    return raw;
  }

  function callBackend(method, args) {
    if (!window.Millennium || typeof window.Millennium.callServerMethod !== "function") {
      return Promise.reject(new Error("Millennium.callServerMethod unavailable"));
    }
    return window.Millennium.callServerMethod(PLUGIN_NAME, method, {
      ...(args || {}),
      contentScriptQuery: "",
    });
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

  function fallbackSettings() {
    try {
      const raw = window.localStorage && window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      return normalizeSettings(raw ? JSON.parse(raw) : STATE.settings);
    } catch (_) {
      return normalizeSettings(STATE.settings);
    }
  }

  function rememberFallbackSettings(settings) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalizeSettings(settings)));
      }
    } catch (_) {}
  }

  function loadSettings(force) {
    const now = Date.now();
    if (STATE.settingsPromise && !force) return STATE.settingsPromise;
    if (!force && STATE.settingsLoadedAt && now - STATE.settingsLoadedAt < SETTINGS_REFRESH_MS) {
      return Promise.resolve(STATE.settings);
    }

    STATE.settingsPromise = callBackend("GetLuaToolsCardBridgeSettings", {})
      .then(parsePayload)
      .then((payload) => {
        if (!payload || !payload.success) throw new Error("backend returned no settings");
        STATE.settings = normalizeSettings(payload.settings);
        STATE.settingsLoadedAt = Date.now();
        rememberFallbackSettings(STATE.settings);
        log("settings loaded", STATE.settings);
        return STATE.settings;
      })
      .catch((err) => {
        STATE.settings = fallbackSettings();
        STATE.settingsLoadedAt = Date.now();
        warn("failed loading settings, using fallback", { error: err && err.message ? err.message : String(err) });
        return STATE.settings;
      })
      .finally(() => {
        STATE.settingsPromise = null;
      });

    return STATE.settingsPromise;
  }

  function saveSettings(nextSettings) {
    const settings = normalizeSettings({ ...STATE.settings, ...(nextSettings || {}) });
    rememberFallbackSettings(settings);
    return callBackend("SetLuaToolsCardBridgeSettings", { settings })
      .then(parsePayload)
      .then((payload) => {
        if (!payload || !payload.success) throw new Error((payload && payload.error) || "backend did not save settings");
        STATE.settings = normalizeSettings(payload.settings);
        STATE.settingsLoadedAt = Date.now();
        rememberFallbackSettings(STATE.settings);
        log("settings saved", STATE.settings);
        refreshVisualDrops("settings-change");
        refreshCommunityGamecardsVisual("settings-change");
        refreshCommunityBadgesVisual("settings-change");
        return { success: true, settings: STATE.settings };
      })
      .catch((err) => {
        STATE.settings = settings;
        STATE.settingsLoadedAt = Date.now();
        warn("failed saving settings, kept local fallback", { error: err && err.message ? err.message : String(err) });
        refreshVisualDrops("settings-fallback");
        refreshCommunityGamecardsVisual("settings-fallback");
        refreshCommunityBadgesVisual("settings-fallback");
        return { success: false, settings: STATE.settings, error: err && err.message ? err.message : String(err) };
      });
  }

  function installSettingsEventBridge() {
    window.addEventListener("LuaToolsCardBridgeSettingsChanged", (event) => {
      STATE.settings = normalizeSettings(event && event.detail);
      STATE.settingsLoadedAt = Date.now();
      rememberFallbackSettings(STATE.settings);
      log("settings changed by Millennium config panel", STATE.settings);
      refreshVisualDrops("settings-event");
      refreshCommunityGamecardsVisual("settings-event");
      refreshCommunityBadgesVisual("settings-event");
    });
  }

  function getVisualDropMode() {
    return normalizeVisualDropMode(STATE.settings && STATE.settings.visualDropMode);
  }

  function captureWebpackRequire() {
    if (STATE.req) return STATE.req;
    if (window.__LuaToolsCardBridgeWebpackRequire) return (STATE.req = window.__LuaToolsCardBridgeWebpackRequire);
    if (window.__NativeFeedBridgeWebpackRequire) return (STATE.req = window.__NativeFeedBridgeWebpackRequire);
    if (window.__LuaToolsWhatsNewWebpackRequire) return (STATE.req = window.__LuaToolsWhatsNewWebpackRequire);

    for (const chunkName of ["webpackChunksteamui", "webpackChunkappmgmt_storeadmin", "webpackChunkcommunity"]) {
      const chunk = window[chunkName];
      if (!chunk || !Array.isArray(chunk) || typeof chunk.push !== "function") continue;
      try {
        chunk.push([[Math.floor(Math.random() * 1e9)], {}, (req) => {
          window.__LuaToolsCardBridgeWebpackRequire = req;
          STATE.req = req;
        }]);
        if (STATE.req) {
          log("webpack require captured", { chunkName });
          return STATE.req;
        }
      } catch (err) {
        warn("failed to capture webpack require", { chunkName, error: err && err.message ? err.message : String(err) });
      }
    }
    return null;
  }

  function getNativeModules() {
    if (STATE.modules) return STATE.modules;
    const req = captureWebpackRequire();
    if (!req) return null;

    let badgeModule = null;
    let sectionModule = null;
    let appModule = null;
    try { badgeModule = req(47801); } catch (err) { warn("badge module unavailable", { error: err && err.message ? err.message : String(err) }); }
    try { sectionModule = req(59856); } catch (err) { warn("section module unavailable", { error: err && err.message ? err.message : String(err) }); }
    try { appModule = req(1776); } catch (_) {}

    STATE.modules = {
      badgeModule,
      sectionModule,
      badgeStore: (badgeModule && badgeModule.x_) || window.badgeStore || null,
      appOverviewStore: (appModule && appModule.tw) || null,
    };
    log("native modules loaded", {
      hasBadgeStore: !!STATE.modules.badgeStore,
      hasSectionModule: !!STATE.modules.sectionModule,
      hasAppOverviewStore: !!STATE.modules.appOverviewStore,
    });
    return STATE.modules;
  }

  function toAppId(value) {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  function getOverviewAppId(overview, details) {
    return toAppId(
      (details && (details.unAppID || details.appid || details.app_id || details.m_unAppID)) ||
      (overview && (overview.appid || overview.unAppID || overview.m_unAppID || overview.gameid)) ||
      0,
    );
  }

  function sectionArray(sections) {
    try {
      if (!sections) return [];
      if (Array.isArray(sections)) return sections.slice();
      if (typeof sections.values === "function") return Array.from(sections.values());
      if (typeof sections.forEach === "function") {
        const out = [];
        sections.forEach((value) => out.push(value));
        return out;
      }
    } catch (_) {}
    return [];
  }

  function hasSection(sections, name) {
    try {
      if (!sections) return false;
      if (typeof sections.has === "function") return sections.has(name);
      return sectionArray(sections).includes(name);
    } catch (_) {
      return false;
    }
  }

  function addSection(sections, name) {
    try {
      if (!sections || hasSection(sections, name)) return false;
      if (typeof sections.add === "function") {
        sections.add(name);
        return true;
      }
      if (Array.isArray(sections)) {
        sections.push(name);
        return true;
      }
    } catch (err) {
      warn("failed adding section", { name, error: err && err.message ? err.message : String(err) });
    }
    return false;
  }

  function appName(appid) {
    const app = STATE.luaApps.get(Number(appid));
    if (app && app.name) return app.name;
    const store = getNativeModules() && STATE.modules.appOverviewStore;
    try {
      const overview = store && store.GetAppOverviewByAppID(Number(appid));
      return (overview && (overview.display_name || overview.name)) || `App ${appid}`;
    } catch (_) {
      return `App ${appid}`;
    }
  }

  function getAppOverview(appid) {
    const modules = getNativeModules();
    const store = modules && modules.appOverviewStore;
    try {
      return store && typeof store.GetAppOverviewByAppID === "function"
        ? store.GetAppOverviewByAppID(Number(appid))
        : null;
    } catch (_) {
      return null;
    }
  }

  function readNumber(value) {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  function formatCommunityBadgeAchievedAt(timestampSeconds) {
    const timestamp = readNumber(timestampSeconds);
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    if (!Number.isFinite(date.getTime())) return "";
    const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const day = date.getDate();
    const month = months[date.getMonth()] || "";
    const hour = String(date.getHours());
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `Alcan\u00e7ada em ${day} de ${month} \u00e0s ${hour}:${minute}`;
  }

  function getPlaytimeMinutes(appid) {
    const overview = getAppOverview(appid);
    if (!overview) return 0;

    const direct = readNumber(
      overview.minutes_playtime_forever ||
      overview.m_unMinutesPlayedForever ||
      overview.playtime_forever ||
      overview.nPlaytimeForever,
    );
    if (direct) return direct;

    const clients = Array.isArray(overview.per_client_data) ? overview.per_client_data : [];
    return clients.reduce((total, client) => {
      return total + readNumber(
        client.minutes_playtime_forever ||
        client.m_unMinutesPlayedForever ||
        client.playtime_forever ||
        client.nPlaytimeForever,
      );
    }, 0);
  }

  function maxVisualDrops(cardCount) {
    const count = Math.max(0, Number(cardCount || 0));
    if (getVisualDropMode() === VISUAL_DROP_MODE_ALL) return count;
    return Math.ceil(count / 2);
  }

  function hashString(text) {
    let hash = 2166136261;
    const value = String(text || "");
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function stableCardKey(appid, card, index) {
    return `${appid}:${card.strMarketHash || card.strTitle || card.strName || index}`;
  }

  function realOwnedCount(card) {
    if (Object.prototype.hasOwnProperty.call(card, REAL_OWNED_MARKER)) {
      return readNumber(card[REAL_OWNED_MARKER]);
    }
    return readNumber(card.nOwned);
  }

  function defineHiddenValue(object, key, value) {
    try {
      Object.defineProperty(object, key, {
        value,
        enumerable: false,
        configurable: true,
        writable: true,
      });
    } catch (_) {
      object[key] = value;
    }
  }

  function rememberRealBadgeFields(badgeData) {
    if (!badgeData || typeof badgeData !== "object") return;
    if (badgeData[LOCAL_VISUAL_BADGE_MARKER]) {
      if (!Object.prototype.hasOwnProperty.call(badgeData, REAL_BADGE_LEVEL_MARKER)) {
        defineHiddenValue(badgeData, REAL_BADGE_LEVEL_MARKER, 0);
      }
      if (!Object.prototype.hasOwnProperty.call(badgeData, REAL_BADGE_XP_MARKER)) {
        defineHiddenValue(badgeData, REAL_BADGE_XP_MARKER, 0);
      }
      if (!Object.prototype.hasOwnProperty.call(badgeData, REAL_BADGE_ICON_MARKER)) {
        defineHiddenValue(badgeData, REAL_BADGE_ICON_MARKER, "");
      }
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(badgeData, REAL_BADGE_LEVEL_MARKER)) {
      defineHiddenValue(badgeData, REAL_BADGE_LEVEL_MARKER, readNumber(badgeData.nLevel));
    }
    if (!Object.prototype.hasOwnProperty.call(badgeData, REAL_BADGE_XP_MARKER)) {
      defineHiddenValue(badgeData, REAL_BADGE_XP_MARKER, readNumber(badgeData.nXP));
    }
    if (!Object.prototype.hasOwnProperty.call(badgeData, REAL_BADGE_ICON_MARKER)) {
      defineHiddenValue(badgeData, REAL_BADGE_ICON_MARKER, String(badgeData.strIconURL || ""));
    }
  }

  function restoreLocalVisualBadge(badgeData) {
    if (!badgeData || !badgeData[LOCAL_VISUAL_BADGE_MARKER]) return;
    if (Object.prototype.hasOwnProperty.call(badgeData, REAL_BADGE_LEVEL_MARKER)) {
      badgeData.nLevel = badgeData[REAL_BADGE_LEVEL_MARKER];
    }
    if (Object.prototype.hasOwnProperty.call(badgeData, REAL_BADGE_XP_MARKER)) {
      badgeData.nXP = badgeData[REAL_BADGE_XP_MARKER];
    }
    if (Object.prototype.hasOwnProperty.call(badgeData, REAL_BADGE_ICON_MARKER)) {
      badgeData.strIconURL = badgeData[REAL_BADGE_ICON_MARKER];
    }
    defineHiddenValue(badgeData, LOCAL_VISUAL_BADGE_MARKER, false);
    defineHiddenValue(badgeData, LOCAL_VISUAL_BADGE_ICON_SOURCE_MARKER, "");
  }

  function normalizeText(value) {
    try {
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
    } catch (_) {
      return String(value || "").toLowerCase().trim();
    }
  }

  function isAllowedSteamImageURL(raw) {
    try {
      const url = new URL(String(raw || ""), window.location && window.location.href);
      const host = url.hostname.toLowerCase();
      if (url.protocol !== "http:" && url.protocol !== "https:") return false;
      return (
        host === "steamstatic.com" ||
        host.endsWith(".steamstatic.com") ||
        host === "steamcommunity.com" ||
        host.endsWith(".steamcommunity.com") ||
        host === "steampowered.com" ||
        host.endsWith(".steampowered.com")
      );
    } catch (_) {
      return false;
    }
  }

  function normalizeImageURL(value, appid) {
    const raw = String(value || "").trim().replace(/\\\//g, "/");
    if (!raw) return "";
    if (raw.length > 2048) return "";
    const appItemsRoot = new RegExp(`/steamcommunity/public/images/items/${appid}/?$`, "i");
    if (appItemsRoot.test(raw)) return "";
    if (/^https?:\/\//i.test(raw)) return isAllowedSteamImageURL(raw) ? raw : "";
    if (/^\/\//.test(raw)) {
      const url = `https:${raw}`;
      return isAllowedSteamImageURL(url) ? url : "";
    }
    if (/^steamcommunity\/public\/images\/items\//i.test(raw)) {
      return `https://cdn.fastly.steamstatic.com/${raw}`;
    }
    if (/^\/steamcommunity\/public\/images\/items\//i.test(raw)) {
      return `https://cdn.fastly.steamstatic.com${raw}`;
    }
    if (/^[a-f0-9]{40}\.(png|jpg|jpeg|webp)$/i.test(raw)) {
      return `https://cdn.fastly.steamstatic.com/steamcommunity/public/images/items/${appid}/${raw}`;
    }
    if (/^[A-Za-z0-9_-]{20,}$/.test(raw)) {
      return `https://community.cloudflare.steamstatic.com/economy/image/${raw}`;
    }
    return "";
  }

  function imageURLFromObject(object, appid) {
    if (!object || typeof object !== "object") return "";
    const fields = [
      "strIconURL",
      "item_image_large",
      "item_image_small",
      "item_image_composed",
      "icon_url_large",
      "icon_url",
      "image_url_large",
      "image_url",
      "image_large",
      "image",
      "icon",
      "url",
    ];
    for (const field of fields) {
      const url = normalizeImageURL(object[field], appid);
      if (url) return url;
    }
    return "";
  }

  function parseKeyValues(value) {
    if (!value) return null;
    if (typeof value === "object") return value;
    try {
      return JSON.parse(String(value));
    } catch (_) {
      return null;
    }
  }

  function badgeLevelIconFromDefinition(definition, appid) {
    const keyValues = parseKeyValues(definition && definition.item_key_values);
    const levelImages = keyValues && keyValues.level_images;
    if (!levelImages || typeof levelImages !== "object") return "";
    return normalizeImageURL(levelImages["1"] || levelImages[1], appid);
  }

  function getCommunityDefinitions(appid) {
    const modules = getNativeModules();
    const store = modules && modules.badgeStore;
    try {
      if (store && typeof store.GetCommunityItemDefinitions === "function") {
        const definitions = store.GetCommunityItemDefinitions(appid);
        return Array.isArray(definitions) ? definitions : [];
      }
    } catch (err) {
      warn("community item definitions unavailable", { appid, error: err && err.message ? err.message : String(err) });
    }
    return [];
  }

  function findBadgeIconFromCommunityDefinitions(appid, badgeData) {
    const definitions = getCommunityDefinitions(appid);
    if (!definitions.length) return "";

    const expectedNames = [
      badgeData && badgeData.strName,
      badgeData && badgeData.strNextLevelName,
    ].map(normalizeText).filter(Boolean);

    const candidates = [];
    definitions.forEach((definition) => {
      if (!definition || typeof definition !== "object") return;
      const icon = badgeLevelIconFromDefinition(definition, appid) || imageURLFromObject(definition, appid);
      if (!icon) return;

      const label = normalizeText([
        definition.name,
        definition.title,
        definition.item_name,
        definition.display_name,
        definition.market_hash_name,
        definition.type,
        definition.item_type_name,
        definition.description,
      ].filter(Boolean).join(" "));

      let score = 0;
      if (expectedNames.some((name) => label === name || label.includes(name) || name.includes(label))) score += 100;
      if (/\b(badge|insignia|emblema|distintivo)\b/.test(label)) score += 20;
      if (Number(definition.item_class || 0) === 1 || Number(definition.item_type || 0) === 1) score += 80;
      if (Number(definition.level || definition.badge_level || 0) === 1) score += 5;
      if (score > 0) candidates.push({ icon, score, label });
    });

    candidates.sort((a, b) => b.score - a.score);
    return candidates.length ? candidates[0].icon : "";
  }

  function findBadgeIconFromGamecardsHTML(appid, html) {
    const source = String(html || "").replace(/\\\//g, "/");
    try {
      const doc = new DOMParser().parseFromString(source, "text/html");
      const selectors = [
        ".badge_gamecard_page .badge_info_image img",
        ".badge_row.depressed .badge_info_image img",
        ".badge_info_image img.badge_icon",
        ".badge_info_image img",
        "img.badge_icon",
      ];
      for (const selector of selectors) {
        const image = doc.querySelector(selector);
        const icon = normalizeImageURL(
          image && (image.getAttribute("src") || image.getAttribute("data-src")),
          appid,
        );
        if (icon) return icon;
      }
    } catch (_) {}

    const escaped = String(appid).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(`https?:\\/\\/[^"'<>\\s]+\\/steamcommunity\\/public\\/images\\/items\\/${escaped}\\/[a-f0-9]{40}\\.png`, "gi"),
      new RegExp(`\\/steamcommunity\\/public\\/images\\/items\\/${escaped}\\/[a-f0-9]{40}\\.png`, "gi"),
    ];
    for (const pattern of patterns) {
      const match = pattern.exec(source);
      if (match && match[0]) return normalizeImageURL(match[0], appid);
    }
    return "";
  }

  function fetchBadgeIconFromGamecardsPage(appid) {
    if (STATE.badgeIconCache.has(appid)) return Promise.resolve(STATE.badgeIconCache.get(appid));
    if (STATE.badgeIconFetches.has(appid)) return STATE.badgeIconFetches.get(appid);

    const request = fetch(`https://steamcommunity.com/my/gamecards/${appid}?l=english`, {
      credentials: "include",
      cache: "force-cache",
    })
      .then((response) => (response && response.ok ? response.text() : ""))
      .then((html) => {
        const icon = findBadgeIconFromGamecardsHTML(appid, html);
        if (icon) {
          STATE.badgeIconCache.set(appid, icon);
          log("cached badge icon from Steam Community page", { appid, name: appName(appid) });
          window.setTimeout(() => primeApp(appid, "badge-icon"), 50);
        }
        return icon;
      })
      .catch((err) => {
        warn("failed fetching badge icon from Steam Community page", { appid, error: err && err.message ? err.message : String(err) });
        return "";
      })
      .finally(() => {
        STATE.badgeIconFetches.delete(appid);
      });

    STATE.badgeIconFetches.set(appid, request);
    return request;
  }

  function requestBadgeIconRetry(appid) {
    const now = Date.now();
    const last = STATE.badgeIconRetryAt.get(appid) || 0;
    if (now - last < 10 * 1000) return;
    STATE.badgeIconRetryAt.set(appid, now);

    primeCommunityDefinitions(appid, "visual-badge");
    fetchBadgeIconFromGamecardsPage(appid);
    window.setTimeout(() => primeApp(appid, "visual-badge-icon"), 1800);
  }

  function resolveBadgeIconURL(appid, badgeData) {
    const existing = normalizeImageURL(badgeData && badgeData.strIconURL, appid);
    if (existing) {
      defineHiddenValue(badgeData, LOCAL_VISUAL_BADGE_ICON_SOURCE_MARKER, "official");
      return existing;
    }

    const cached = STATE.badgeIconCache.get(appid);
    if (cached) {
      defineHiddenValue(badgeData, LOCAL_VISUAL_BADGE_ICON_SOURCE_MARKER, "gamecards-cache");
      return cached;
    }

    const definitionIcon = findBadgeIconFromCommunityDefinitions(appid, badgeData);
    if (definitionIcon) {
      STATE.badgeIconCache.set(appid, definitionIcon);
      defineHiddenValue(badgeData, LOCAL_VISUAL_BADGE_ICON_SOURCE_MARKER, "community-definitions");
      return definitionIcon;
    }

    defineHiddenValue(badgeData, LOCAL_VISUAL_BADGE_ICON_SOURCE_MARKER, "");
    requestBadgeIconRetry(appid);
    return "";
  }

  function applyLocalVisualBadge(appid, badgeData, plan, visualPayload) {
    if (!badgeData || !plan || !plan.cardCount) return false;
    rememberRealBadgeFields(badgeData);

    const payload = visualPayload || cachedCommunityVisualData(appid);
    if (!visualPayload && !payload) requestNativeVisualBadgeState(appid, badgeData, plan);

    const payloadBadge = payload && payload.badge && typeof payload.badge === "object" ? payload.badge : null;
    const payloadCraft = payload && payload.craft && typeof payload.craft === "object" ? payload.craft : null;
    const craftedLevel = readNumber(payloadCraft && payloadCraft.level);
    const payloadLevel = readNumber(payloadBadge && payloadBadge.level);
    const payloadXP = readNumber(payloadBadge && payloadBadge.xp);
    const payloadIcon = normalizeImageURL(payloadBadge && payloadBadge.iconURL, appid);
    const payloadName = String((payloadBadge && payloadBadge.name) || "").trim();

    const realLevel = readNumber(badgeData[REAL_BADGE_LEVEL_MARKER]);
    const visualSetComplete = plan.targetOwned >= plan.cardCount;
    const realMaxed = !!badgeData.bMaxed && !badgeData[LOCAL_VISUAL_BADGE_MARKER];
    const realBadgeWins = realLevel > 0 && craftedLevel <= realLevel;
    if ((!visualSetComplete && !craftedLevel) || realBadgeWins || realMaxed) {
      restoreLocalVisualBadge(badgeData);
      plan.visualBadgeUnlocked = false;
      return false;
    }

    const iconURL = payloadIcon || resolveBadgeIconURL(appid, badgeData);
    badgeData.nLevel = craftedLevel || 0;
    badgeData.nXP = craftedLevel > 0
      ? Math.max(payloadXP, craftedLevel * 100, 100)
      : Math.max(payloadXP, readNumber(badgeData.nXP), 100);
    if (payloadName) badgeData.strName = payloadName;
    else if (!badgeData.strName && badgeData.strNextLevelName) badgeData.strName = badgeData.strNextLevelName;
    if (iconURL) badgeData.strIconURL = iconURL;
    defineHiddenValue(badgeData, LOCAL_VISUAL_BADGE_MARKER, true);

    plan.visualBadgeUnlocked = true;
    plan.visualBadgeLevel = badgeData.nLevel;
    plan.visualBadgePreviewLevel = payloadLevel || 1;
    plan.visualBadgeXP = badgeData.nXP;
    plan.visualBadgeHasIcon = !!badgeData.strIconURL;
    plan.visualBadgeIconSource = badgeData[LOCAL_VISUAL_BADGE_ICON_SOURCE_MARKER] || "";

    const logKey = `${appid}:${plan.visualDropMode}:${plan.targetOwned}:${plan.cardCount}:${plan.visualBadgeLevel}:${plan.visualBadgePreviewLevel}:${plan.visualBadgeHasIcon}:${plan.visualBadgeIconSource}`;
    if (!STATE.loggedVisualBadges.has(logKey)) {
      STATE.loggedVisualBadges.add(logKey);
      log("applied local visual badge", {
        appid,
        name: plan.name,
        level: plan.visualBadgeLevel,
        previewLevel: plan.visualBadgePreviewLevel,
        xp: plan.visualBadgeXP,
        hasIcon: plan.visualBadgeHasIcon,
        iconSource: plan.visualBadgeIconSource || "pending",
        source: plan.source,
      });
    }

    return true;
  }

  function applyLocalVisualDrops(appid, badgeData, source) {
    appid = toAppId(appid);
    if (!appid || !badgeData || !Array.isArray(badgeData.rgCards) || !isLuaApp(appid)) return badgeData;
    if (badgeData.bMaxed) return badgeData;

    const cards = badgeData.rgCards;
    const playtimeMinutes = getPlaytimeMinutes(appid);
    const maxDrops = maxVisualDrops(cards.length);
    const earnedByTime = Math.floor(playtimeMinutes / LOCAL_DROP_INTERVAL_MINUTES);
    const payload = cachedCommunityVisualData(appid);
    const payloadTarget = Number(payload && payload.targetOwned);
    const hasPayloadTarget = !!(payload && payload.active && Number.isFinite(payloadTarget));
    if (!payload) {
      fetchCommunityVisualData(appid, false).then((latest) => {
        if (latest && latest.active) refreshVisualDrops("visual-state-loaded");
      });
    }
    const targetOwned = hasPayloadTarget
      ? Math.max(0, Math.min(maxDrops, payloadTarget))
      : Math.max(0, Math.min(maxDrops, earnedByTime));

    let realOwned = 0;
    const unowned = [];
    cards.forEach((card, index) => {
      if (!card || typeof card !== "object") return;
      if (card[LOCAL_VISUAL_OWNED_MARKER]) {
        defineHiddenValue(card, REAL_OWNED_MARKER, 0);
      } else if (!Object.prototype.hasOwnProperty.call(card, REAL_OWNED_MARKER)) {
        defineHiddenValue(card, REAL_OWNED_MARKER, readNumber(card.nOwned));
      }
      Object.defineProperty(card, LOCAL_VISUAL_OWNED_MARKER, {
        value: false,
        enumerable: false,
        configurable: true,
        writable: true,
      });

      const owned = realOwnedCount(card);
      card.nOwned = owned;
      if (owned > 0) {
        realOwned += 1;
      } else {
        unowned.push({ card, index, score: hashString(stableCardKey(appid, card, index)) });
      }
    });

    const localNeeded = Math.max(0, targetOwned - realOwned);
    unowned
      .sort((a, b) => a.score - b.score)
      .slice(0, localNeeded)
      .forEach(({ card }) => {
        card.nOwned = Math.max(1, readNumber(card.nOwned));
        card[LOCAL_VISUAL_OWNED_MARKER] = true;
      });

    const localOwned = Math.min(localNeeded, unowned.length);
    const plan = {
      appid,
      name: appName(appid),
      playtimeMinutes,
      cardCount: cards.length,
      maxDrops,
      earnedByTime,
      earnedRemaining: hasPayloadTarget ? readNumber(payload && payload.earnedRemaining) : targetOwned,
      spentByCraft: hasPayloadTarget ? readNumber(payload && payload.spentByCraft) : 0,
      realOwned,
      localOwned,
      targetOwned: realOwned + localOwned,
      intervalMinutes: LOCAL_DROP_INTERVAL_MINUTES,
      visualDropMode: getVisualDropMode(),
      source,
    };
    applyLocalVisualBadge(appid, badgeData, plan);
    STATE.visualDropPlans.set(appid, plan);

    const logKey = `${appid}:${getVisualDropMode()}:${playtimeMinutes}:${cards.length}:${realOwned}:${localOwned}:${targetOwned}`;
    if (!STATE.loggedVisualDrops.has(logKey)) {
      STATE.loggedVisualDrops.add(logKey);
      log("applied local visual card drops", plan);
    }

    return badgeData;
  }

  function loadManifest(force) {
    const now = Date.now();
    if (STATE.manifestPromise && !force) return STATE.manifestPromise;
    if (!force && STATE.manifest && now - STATE.manifestLoadedAt < MANIFEST_REFRESH_MS) {
      return Promise.resolve(STATE.manifest);
    }

    STATE.manifestPromise = callBackend("GetLuaToolsCardManifest", {
      maxApps: MAX_APPS,
      refresh: !!force,
    })
      .then(parsePayload)
      .then((payload) => {
        if (!payload || !payload.success) throw new Error("backend returned no manifest");

        STATE.luaApps.clear();
        STATE.cardApps.clear();
        const apps = Array.isArray(payload.apps) ? payload.apps : [];
        apps.forEach((app) => {
          const appid = toAppId(app && app.appid);
          if (!appid) return;
          STATE.luaApps.set(appid, app);
          if (app.hasTradingCards) STATE.cardApps.add(appid);
        });

        STATE.manifest = payload;
        STATE.manifestLoadedAt = Date.now();
        log("local Lua games card manifest loaded", {
          apps: STATE.luaApps.size,
          cardApps: STATE.cardApps.size,
          source: payload.source,
        });
        return payload;
      })
      .catch((err) => {
        warn("failed loading local card manifest", { error: err && err.message ? err.message : String(err) });
        return STATE.manifest;
      })
      .finally(() => {
        STATE.manifestPromise = null;
      });

    return STATE.manifestPromise;
  }

  function isLuaApp(appid) {
    return STATE.luaApps.has(Number(appid));
  }

  function hasManifestCards(appid) {
    return STATE.cardApps.has(Number(appid));
  }

  function hasBadgeCards(appid) {
    return STATE.badgeAppsWithCards.has(Number(appid));
  }

  function getCommunityGamecardsAppId() {
    try {
      const pathname = String((window.location && window.location.pathname) || "");
      const match = pathname.match(/\/gamecards\/(\d+)/i);
      return match ? toAppId(match[1]) : 0;
    } catch (_) {
      return 0;
    }
  }

  function isCommunityGamecardsPage() {
    return !!getCommunityGamecardsAppId();
  }

  function isCommunityBadgesPage() {
    try {
      const pathname = String((window.location && window.location.pathname) || "");
      return /\/badges\/?$/i.test(pathname);
    } catch (_) {
      return false;
    }
  }

  function communityVisualCacheKey(appid) {
    return `${toAppId(appid)}:${getVisualDropMode()}`;
  }

  function rememberCommunityVisualPayload(payload) {
    const appid = toAppId(payload && payload.appid);
    if (!appid) return null;

    STATE.communityVisualData.set(communityVisualCacheKey(appid), payload);
    const name = String((payload && payload.name) || "").trim();
    if (name || (payload && payload.active)) {
      const app = STATE.luaApps.get(appid) || { appid, enabled: true, source: "community-visual-batch" };
      if (name) app.name = name;
      if (payload && payload.active) app.hasTradingCards = true;
      STATE.luaApps.set(appid, app);
    }
    if (payload && payload.active) STATE.cardApps.add(appid);
    return payload;
  }

  function normalizeAppidList(appids, maxCount) {
    const ids = Array.isArray(appids) ? appids : [];
    const seen = new Set();
    const out = [];
    ids.forEach((appid) => {
      appid = toAppId(appid);
      if (!appid || seen.has(appid)) return;
      seen.add(appid);
      out.push(appid);
    });
    return out.slice(0, maxCount || 160);
  }

  function communityVisualBatchKey(appids) {
    const ids = normalizeAppidList(appids, 300).sort((a, b) => a - b);
    return `${getVisualDropMode()}:${ids.length ? ids.join(",") : "__all"}`;
  }

  function cachedCommunityVisualBatchForKey(appids, key) {
    const ids = normalizeAppidList(appids, 300);
    if (ids.length) return ids.map((appid) => cachedCommunityVisualData(appid)).filter(Boolean);
    const mode = getVisualDropMode();
    return Array.from(STATE.communityVisualData.values()).filter((payload) => {
      return payload && payload.visualDropMode === mode;
    });
  }

  function fetchCommunityVisualBatch(appids, force) {
    const ids = normalizeAppidList(appids, 160);
    const key = communityVisualBatchKey(ids);
    if (!force && ids.length && ids.every((appid) => !!cachedCommunityVisualData(appid))) {
      return Promise.resolve(cachedCommunityVisualBatchForKey(ids, key));
    }
    if (!force && STATE.communityVisualBatchLoaded.has(key)) {
      return Promise.resolve(cachedCommunityVisualBatchForKey(ids, key));
    }
    if (!force && STATE.communityVisualBatchPromises.has(key)) {
      return STATE.communityVisualBatchPromises.get(key);
    }

    const request = callBackend("GetLuaToolsCardCommunityVisualBatch", {
      appids: ids,
      maxApps: ids.length || 160,
    })
      .then(parsePayload)
      .then((payload) => {
        if (!payload || !payload.success || !Array.isArray(payload.items)) {
          throw new Error((payload && payload.error) || "backend returned no community visual batch");
        }
        const items = payload.items.map(rememberCommunityVisualPayload).filter(Boolean);
        STATE.communityVisualBatchLoaded.add(key);
        log("community visual batch loaded", {
          requested: ids.length,
          count: payload.count || items.length,
          active: payload.active || 0,
          relevant: payload.relevant || 0,
        });
        return items;
      })
      .catch((err) => {
        warn("failed loading Steam Community visual batch", {
          requested: ids.length,
          error: err && err.message ? err.message : String(err),
        });
        return cachedCommunityVisualBatchForKey(ids, key);
      })
      .finally(() => {
        STATE.communityVisualBatchPromises.delete(key);
      });

    STATE.communityVisualBatchPromises.set(key, request);
    return request;
  }

  function fetchCommunityVisualData(appid, force) {
    appid = toAppId(appid);
    if (!appid) return Promise.resolve(null);

    const key = communityVisualCacheKey(appid);
    if (!force && STATE.communityVisualData.has(key)) {
      return Promise.resolve(STATE.communityVisualData.get(key));
    }
    if (!force && STATE.communityVisualPromises.has(key)) {
      return STATE.communityVisualPromises.get(key);
    }

    const request = callBackend("GetLuaToolsCardCommunityVisualData", { appid })
      .then(parsePayload)
      .then((payload) => {
        if (!payload || !payload.success) {
          throw new Error((payload && payload.error) || "backend returned no community visual data");
        }
        return rememberCommunityVisualPayload(payload);
      })
      .catch((err) => {
        warn("failed loading Steam Community visual data", {
          appid,
          error: err && err.message ? err.message : String(err),
        });
        return null;
      })
      .finally(() => {
        STATE.communityVisualPromises.delete(key);
      });

    STATE.communityVisualPromises.set(key, request);
    return request;
  }

  function cachedCommunityVisualData(appid) {
    appid = toAppId(appid);
    if (!appid) return null;
    return STATE.communityVisualData.get(communityVisualCacheKey(appid)) || null;
  }

  function communityVisualStateSignature(payload) {
    if (!payload || !payload.active) return "";
    const badge = payload.badge && typeof payload.badge === "object" ? payload.badge : {};
    const craft = payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    return [
      payload.appid || 0,
      payload.visualDropMode || "",
      payload.cardCount || 0,
      payload.targetOwned || 0,
      payload.earnedRemaining || 0,
      craft.level || 0,
      craft.availableByPlaytime || 0,
      badge.level || 0,
      badge.xp || 0,
      badge.name || "",
      badge.iconURL || "",
    ].join(":");
  }

  function badgeImageURLFromCard(card, appid) {
    return normalizeImageURL(
      card && (card.strImgURL || card.strIconURL || card.strArtworkURL || card.imageURL || card.iconURL),
      appid,
    );
  }

  function snapshotCardsFromBadgeData(appid, badgeData) {
    if (!badgeData || !Array.isArray(badgeData.rgCards)) return [];
    return badgeData.rgCards
      .map((card, index) => {
        if (!card || typeof card !== "object") return null;
        const title = String(card.strTitle || card.title || card.strName || card.name || `Card ${index + 1}`).trim();
        const name = String(card.strName || card.name || title).trim();
        const imageURL = badgeImageURLFromCard(card, appid);
        if (!title || !imageURL) return null;
        return {
          index,
          title,
          name,
          marketHash: String(card.strMarketHash || card.marketHash || name || title),
          imageURL,
        };
      })
      .filter(Boolean);
  }

  function snapshotBadgeLevelsFromBadgeData(appid, badgeData) {
    if (!badgeData || typeof badgeData !== "object") return [];
    const levels = [];
    const level = Math.max(1, readNumber(badgeData.nLevel) || 1);
    const name = String(badgeData.strName || badgeData.strNextLevelName || "").trim();
    const iconURL = normalizeImageURL(badgeData.strIconURL, appid);
    if (name || iconURL) {
      levels.push({
        level,
        name: name || `Level ${level}`,
        xp: Math.max(readNumber(badgeData.nXP), level * 100, 100),
        iconURL,
      });
    }
    const nextName = String(badgeData.strNextLevelName || "").trim();
    const nextXP = readNumber(badgeData.nNextLevelXP);
    if (nextName && nextName !== name) {
      const nextLevel = Math.max(level + 1, Math.ceil(nextXP / 100) || level + 1);
      levels.push({
        level: nextLevel,
        name: nextName,
        xp: Math.max(nextXP, nextLevel * 100),
        iconURL: "",
      });
    }
    return levels;
  }

  function saveVisualSnapshotFromBadgeData(appid, badgeData, source) {
    appid = toAppId(appid);
    if (!appid || !isLuaApp(appid) || !badgeData) return;
    const cards = snapshotCardsFromBadgeData(appid, badgeData);
    if (!cards.length) return;

    const badge = {
      name: String(badgeData.strName || badgeData.strNextLevelName || "").trim(),
      level: readNumber(badgeData.nLevel),
      xp: Math.max(readNumber(badgeData.nXP), readNumber(badgeData.nNextLevelXP), 100),
      iconURL: normalizeImageURL(badgeData.strIconURL, appid),
    };
    const badgeLevels = snapshotBadgeLevelsFromBadgeData(appid, badgeData);
    const key = `${appid}:${cards.length}:${badge.name}:${badge.iconURL}:${source || "badge-data"}`;
    if (STATE.savedVisualSnapshots.has(key)) return;
    STATE.savedVisualSnapshots.add(key);

    callBackend("SaveLuaToolsCardVisualSnapshot", {
      appid,
      cards,
      badge,
      badgeLevels,
      source: source || "badge-data",
    })
      .then(parsePayload)
      .then((payload) => {
        if (!payload || !payload.success) throw new Error((payload && payload.error) || "snapshot save failed");
        if (payload.active) STATE.communityVisualData.set(communityVisualCacheKey(appid), payload);
        log("saved local visual card snapshot", {
          appid,
          source: source || "badge-data",
          cards: payload.cardCount || cards.length,
        });
      })
      .catch((err) => {
        warn("failed saving local visual card snapshot", {
          appid,
          source: source || "badge-data",
          error: err && err.message ? err.message : String(err),
        });
      });
  }

  function localBadgeDataFromVisualPayload(appid, payload) {
    appid = toAppId(appid);
    if (!appid || !payload || !payload.active || !Array.isArray(payload.cards) || !payload.cards.length) return null;
    const badge = payload.badge && typeof payload.badge === "object" ? payload.badge : {};
    const craft = payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    const nextBadge = craft.nextBadge && typeof craft.nextBadge === "object" ? craft.nextBadge : {};
    const level = Math.max(0, readNumber(craft.level) || readNumber(badge.level));
    const xp = Math.max(readNumber(badge.xp), level * 100, 100);
    const cards = payload.cards.map((card, index) => ({
      nOwned: 0,
      strTitle: String((card && (card.title || card.strTitle || card.name || card.strName)) || `Card ${index + 1}`),
      strName: String((card && (card.name || card.strName || card.title || card.strTitle)) || `Card ${index + 1}`),
      strMarketHash: String((card && (card.marketHash || card.strMarketHash || card.name || card.title)) || `Card ${index + 1}`),
      strImgURL: normalizeImageURL(card && (card.imageURL || card.strImgURL || card.strIconURL), appid),
      strIconURL: normalizeImageURL(card && (card.imageURL || card.strImgURL || card.strIconURL), appid),
      bFoil: false,
    }));

    const data = {
      appid,
      nAppID: appid,
      nLevel: level,
      nXP: xp,
      nNextLevelXP: Math.max(readNumber(nextBadge.xp), (level + 1) * 100, 100),
      nMaxLevel: Math.max(readNumber(craft.maxLevel), 5),
      bMaxed: level >= Math.max(readNumber(craft.maxLevel), 5),
      strName: String(badge.name || nextBadge.name || ""),
      strNextLevelName: String(nextBadge.name || badge.name || ""),
      strIconURL: normalizeImageURL(badge.iconURL || nextBadge.iconURL, appid),
      rgCards: cards,
    };

    defineHiddenValue(data, LOCAL_VISUAL_BADGE_MARKER, true);
    defineHiddenValue(data, REAL_BADGE_LEVEL_MARKER, 0);
    defineHiddenValue(data, REAL_BADGE_XP_MARKER, 0);
    defineHiddenValue(data, REAL_BADGE_ICON_MARKER, "");
    cards.forEach((card) => {
      defineHiddenValue(card, REAL_OWNED_MARKER, 0);
      defineHiddenValue(card, LOCAL_VISUAL_OWNED_MARKER, false);
    });
    return data;
  }

  function writeBadgeData(store, appid, data) {
    if (!store || !data) return false;
    try {
      if (store.m_mapBadgeData && typeof store.m_mapBadgeData.set === "function") {
        store.m_mapBadgeData.set(Number(appid), data);
        return true;
      }
    } catch (err) {
      warn("failed writing local badge data", { appid, error: err && err.message ? err.message : String(err) });
    }
    return false;
  }

  function installLocalBadgeDataFromPayload(store, appid, payload, source) {
    const data = localBadgeDataFromVisualPayload(appid, payload);
    if (!data) return null;
    writeBadgeData(store, appid, data);
    STATE.badgeAppsWithCards.add(appid);
    STATE.badgeAppsWithoutCards.delete(appid);
    rememberBadgeData(appid, data, source || "visual-cache");
    return data;
  }

  function ensureLocalBadgeData(store, appid, source, force) {
    appid = toAppId(appid);
    if (!appid || !shouldPrimeApp(appid)) return Promise.resolve(null);
    const cached = cachedCommunityVisualData(appid);
    if (cached && cached.active) {
      return Promise.resolve(installLocalBadgeDataFromPayload(store, appid, cached, source || "visual-cache"));
    }
    return fetchCommunityVisualData(appid, !!force).then((payload) => {
      if (!payload || !payload.active) return null;
      return installLocalBadgeDataFromPayload(store, appid, payload, source || "visual-cache");
    });
  }

  function syncCommunityVisualBadgeData(store, appid, badgeData, source) {
    appid = toAppId(appid);
    if (!store || !appid || !shouldPrimeApp(appid)) return;

    const key = communityVisualCacheKey(appid);
    const now = Date.now();
    const lastSync = STATE.communityVisualSyncAt.get(key) || 0;
    if (now - lastSync < COMMUNITY_VISUAL_SYNC_MS) return;
    STATE.communityVisualSyncAt.set(key, now);

    const beforeSignature = communityVisualStateSignature(cachedCommunityVisualData(appid));
    fetchCommunityVisualData(appid, true).then((payload) => {
      if (!payload || !payload.active) return;
      if (beforeSignature === communityVisualStateSignature(payload)) return;
      const latest = readBadgeData(store, appid)
        || badgeData
        || installLocalBadgeDataFromPayload(store, appid, payload, `${source || "badge-data"}:visual-sync`);
      if (!latest) return;
      rememberBadgeData(appid, latest, `${source || "badge-data"}:visual-sync`);
      refreshNativeBadgeView(appid);
    });
  }

  function syncTrackedNativeBadgeApps() {
    const modules = getNativeModules();
    const store = modules && modules.badgeStore;
    if (!store) return;

    const now = Date.now();
    STATE.nativeBadgeSyncApps.forEach((seenAt, appid) => {
      if (now - seenAt > NATIVE_BADGE_SYNC_APP_TTL_MS) {
        STATE.nativeBadgeSyncApps.delete(appid);
        return;
      }
      const data = readBadgeData(store, appid);
      if (data && Array.isArray(data.rgCards) && data.rgCards.length > 0) {
        syncCommunityVisualBadgeData(store, appid, data, "app-details-watch");
      }
    });
  }

  function trackNativeBadgeApp(appid) {
    appid = toAppId(appid);
    if (!appid || !shouldPrimeApp(appid)) return;
    STATE.nativeBadgeSyncApps.set(appid, Date.now());
    if (STATE.nativeBadgeSyncTimer) return;
    STATE.nativeBadgeSyncTimer = window.setInterval(syncTrackedNativeBadgeApps, NATIVE_BADGE_SYNC_INTERVAL_MS);
  }

  function refreshNativeBadgeView(appid) {
    appid = toAppId(appid);
    if (!appid) return;

    const now = Date.now();
    const last = STATE.nativeBadgeRefreshAt.get(appid) || 0;
    if (now - last < 2500) return;
    STATE.nativeBadgeRefreshAt.set(appid, now);

    const modules = getNativeModules();
    const store = modules && modules.badgeStore;
    try {
      if (store && typeof store.InvalidateBadgeData === "function") {
        store.InvalidateBadgeData(appid);
      } else {
        window.setTimeout(() => primeApp(appid, "visual-badge-state"), 50);
      }
    } catch (_) {
      window.setTimeout(() => primeApp(appid, "visual-badge-state"), 50);
    }
  }

  function requestNativeVisualBadgeState(appid, badgeData, plan) {
    appid = toAppId(appid);
    if (!appid) return;

    fetchCommunityVisualData(appid, false).then((payload) => {
      if (!payload || !payload.active) return;
      const latestPlan = STATE.visualDropPlans.get(appid) || plan;
      applyLocalVisualBadge(appid, badgeData, latestPlan, payload);
      refreshNativeBadgeView(appid);
    });
  }

  function ensureCommunityGamecardsStyles() {
    if (!document.head || document.getElementById("ltch-community-gamecards-style")) return;
    const style = document.createElement("style");
    style.id = "ltch-community-gamecards-style";
    style.textContent = `
      .ltch-community-visual .ltch-card-owned,
      .ltch-community-visual .ltch-card-owned.unowned{opacity:1!important;filter:none!important}
      .ltch-community-visual .ltch-card-owned .gamecard,
      .ltch-community-visual .ltch-card-owned img{opacity:1!important;filter:none!important}
      .ltch-community-visual .ltch-card-owned .game_card_unowned_border{display:none!important}
      .ltch-community-visual .ltch-card-spent{opacity:.36!important;filter:grayscale(1) brightness(.55)!important;position:relative!important}
      .ltch-community-visual .ltch-card-spent img{opacity:1!important;filter:none!important}
      .ltch-community-visual .ltch-card-spent .ltch-community-card-image{display:block!important;width:100%!important;height:auto!important;opacity:1!important;filter:none!important}
      .ltch-community-visual .ltch-card-spent .ltch-community-card-host{display:block!important;position:relative!important}
      .ltch-community-visual .ltch-card-spent .ltch-community-spent-card-art{display:block!important;position:absolute!important;left:0!important;top:0!important;width:100%!important;height:auto!important;opacity:1!important;filter:none!important;z-index:2!important;pointer-events:none!important}
      .ltch-community-visual .ltch-card-spent .ltch-community-card-load-error{display:none!important}
      .ltch-community-visual .ltch-community-badge-info{display:flex!important;align-items:center!important}
      .ltch-community-visual .ltch-community-badge-image{display:block!important;opacity:1!important;filter:none!important}
      .ltch-community-visual .ltch-community-badge-image .badge_icon{display:block!important;opacity:1!important;filter:none!important;max-width:80px!important;max-height:80px!important;object-fit:contain!important}
      .ltch-community-badges-row .ltch-community-badges-icon,
      .ltch-community-badges-row .ltch-community-badges-icon img{display:block!important;opacity:1!important;filter:none!important}
      .ltch-community-badges-row .ltch-community-badges-icon img{max-width:80px!important;max-height:80px!important;object-fit:contain!important}
      .ltch-community-badges-row .ltch-community-badges-empty-icon{background:transparent!important;border:0!important}
      .ltch-community-badges-row .ltch-community-badges-empty-icon img{display:none!important}
      .ltch-community-badges-row .ltch-community-badges-empty-icon .badge_empty_circle{display:block!important;float:left!important;width:46px!important;height:46px!important;margin:6px 14px 6px 6px!important;border-radius:23px!important;border:2px dashed #656565!important;box-sizing:content-box!important}
      .ltch-community-badges-row .ltch-community-badges-preview-icon img,
      .ltch-community-badges-row img.ltch-community-badges-preview-icon{opacity:.72!important;filter:saturate(.9)!important}
      .ltch-community-badges-status{margin-top:4px!important;color:#8f98a0!important;font-size:13px!important;line-height:1.35!important}
      .ltch-community-badges-status.ltch-ready{color:#66c0f4!important}
      .ltch-community-badges-status.ltch-maxed{color:#c7d5e0!important}
      .ltch-community-badges-actions{display:flex!important;justify-content:flex-end!important;gap:8px!important;margin-top:8px!important}
      .ltch-community-badges-actions .btn_small>span{line-height:26px!important}
      .ltch-community-badges-local-section{margin:0 0 12px!important}
      .ltch-community-badges-local-row{display:block!important;position:relative!important;padding:1px!important;border-radius:var(--border0,5px)!important;margin-bottom:31px!important;border:1px solid transparent!important;background-color:var(--thegrey,#212222)!important;background:var(--thegrey,linear-gradient(to bottom,#383939 5%,#000 95%))!important;color:#828282!important;overflow:visible!important}
      .ltch-community-badges-local-row:hover{border:1px solid #5491cf!important;background:none!important;background-color:var(--thegrey,#1d1e1f)!important;box-shadow:inset 1px 1px 4px #000!important}
      .ltch-community-badges-local-row .badge_row_overlay{display:block!important;position:absolute!important;inset:0!important;z-index:2!important}
      .ltch-community-badges-local-row .badge_row_inner{position:relative!important;z-index:1!important;display:block!important;min-height:154px!important;background-color:var(--thegrey,#212222)!important;border-radius:var(--border0,5px)!important;background:var(--thegrey,linear-gradient(to bottom,#232424 5%,#141414 95%))!important}
      .ltch-community-badges-local-row:hover .badge_row_inner{background:none!important}
      .ltch-community-badges-local-row .badge_title_row{display:block!important;position:relative!important;height:32px!important;padding:8px 12px 0 12px!important;white-space:nowrap!important;box-sizing:content-box!important}
      .ltch-community-badges-local-row .badge_title_stats{float:right!important;padding-right:40px!important;font-size:12px!important;line-height:15px!important;color:#7b7b7c!important;text-align:right!important}
      .ltch-community-badges-local-row .ltch-community-badges-steam-icon{position:absolute!important;right:12px!important;top:8px!important;z-index:4!important;display:block!important;width:30px!important;height:30px!important;border-radius:5px!important;overflow:hidden!important;background:transparent!important}
      .ltch-community-badges-local-row .ltch-community-badges-steam-icon img{display:block!important;width:30px!important;height:30px!important;object-fit:cover!important}
      .ltch-community-badges-local-row .badge_title_stats_content{overflow:hidden!important}
      .ltch-community-badges-local-row .badge_title_stats_drops{color:#6ca1d5!important}
      .ltch-community-badges-local-row .badge_title{display:block!important;line-height:32px!important;font-size:20px!important;font-weight:200!important;color:#fff!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;letter-spacing:0!important}
      .ltch-community-badges-local-row .badge_view_details{color:#6ca1d5!important;font-size:12px!important;visibility:hidden!important}
      .ltch-community-badges-local-row:hover .badge_view_details{visibility:visible!important}
      .ltch-community-badges-local-row .badge_title_rule{margin:0 3px!important;height:0!important;border-top:0!important;background-color:transparent!important}
      .ltch-community-badges-local-row .badge_content{padding:10px!important;position:relative!important;min-height:114px!important;box-sizing:content-box!important}
      .ltch-community-badges-local-row .badge_current{width:296px!important;float:left!important;height:auto!important;border:0!important;background:transparent!important;overflow:visible!important}
      .ltch-community-badges-local-row .badge_info{display:block!important;height:auto!important;min-width:0!important}
      .ltch-community-badges-local-row .badge_info_image{float:left!important;margin-right:24px!important;width:80px!important;height:80px!important;display:block!important}
      .ltch-community-badges-local-row .badge_info_description{padding-top:13px!important;min-width:0!important;color:#8f98a0!important}
      .ltch-community-badges-local-row .badge_info_title{font-size:14px!important;line-height:18px!important;color:#9fb2c3!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .ltch-community-badges-local-row .badge_info_unlocked{font-size:12px!important;line-height:16px!important;color:#8f98a0!important;white-space:pre-line!important}
      .ltch-community-badges-local-row.ltch-community-badges-level-zero .badge_info_image{width:70px!important;height:58px!important;margin-right:0!important}
      .ltch-community-badges-local-row.ltch-community-badges-level-zero .badge_info_title,
      .ltch-community-badges-local-row.ltch-community-badges-level-zero .badge_info_unlocked{color:#5c5c5c!important}
      .ltch-community-badges-local-row .ltch-community-badges-card-strip{float:left!important;display:block!important;width:522px!important;margin-top:12px!important;overflow:hidden!important}
      .ltch-community-badges-local-row .ltch-community-badges-card{float:left!important;position:relative!important;width:98px!important;height:114px!important;margin-left:2px!important;border:1px solid transparent!important;box-sizing:border-box!important;background:transparent!important;overflow:hidden!important}
      .ltch-community-badges-local-row .ltch-community-badges-card:first-child{margin-left:0!important}
      .ltch-community-badges-local-row .ltch-community-badges-card img{display:block!important;width:98px!important;height:114px!important;object-fit:cover!important}
      .ltch-community-badges-local-row .ltch-community-badges-card.ltch-unowned,
      .ltch-community-badges-local-row .ltch-community-badges-card.unowned{border:0!important;background-color:#101010!important}
      .ltch-community-badges-local-row .ltch-community-badges-card.ltch-unowned img,
      .ltch-community-badges-local-row .ltch-community-badges-card.unowned img{opacity:.1!important;filter:none!important}
      .ltch-community-badges-local-row .ltch-community-badges-progress{width:92px!important;float:right!important;margin-left:10px!important;padding-top:20px!important;color:#9fb2c3!important;text-align:center!important;font-size:13px!important;line-height:18px!important;white-space:pre-line!important}
      .ltch-community-badges-local-row .ltch-community-badges-progress .progress_info_bold{color:#5491cf!important}
      .ltch-community-badges-local-row .ltch-community-badges-actions{float:right!important;position:relative!important;z-index:4!important;width:108px!important;margin:0 6px 0 10px!important;padding-top:12px!important;text-align:center!important}
      .ltch-community-badges-local-row .ltch-community-badges-actions .badge_craft_button{display:block!important}
      .ltch-community-badges-local-row .ltch-community-badges-actions .badge_craft_button>span{display:block!important;line-height:68px!important}
      .ltch-community-badges-local-row .ltch-community-badges-actions .btn_medium>span{min-width:64px!important;line-height:42px!important;font-size:16px!important;padding:0 14px!important;text-align:center!important}
      .ltch-community-visual.ltch-community-badge-unlocked .badge_info,
      .ltch-community-visual.ltch-community-badge-unlocked .badge_current{opacity:1!important;filter:none!important}
      .ltch-community-visual.ltch-community-complete .ltch-community-hidden-market-action{display:none!important}
      .ltch-community-visual.ltch-community-complete .ltch-community-complete-banner{background:linear-gradient(90deg,#43a9e8,#244fd4)!important;color:#fff!important;cursor:default!important;pointer-events:none!important}
      .ltch-community-visual.ltch-community-complete .ltch-community-owned-note{color:#9fb2c3!important}
      .ltch-community-visual.ltch-community-complete .ltch-community-hidden-market-price{display:none!important}
      .ltch-community-visual .badge_content{position:relative!important}
      .ltch-community-craft-slot{float:right!important;display:block!important;margin:0 0 16px 18px!important;min-height:70px!important;text-align:right!important}
      .ltch-community-craft-slot .btn_medium>span{font-size:18px!important;line-height:38px!important;padding:0 22px!important}
      .ltch-community-craft-overlay{position:fixed!important;inset:0!important;z-index:2147483600!important;display:flex!important;align-items:center!important;justify-content:center!important;background:rgba(0,0,0,.58)!important}
      .ltch-community-craft-dialog{position:relative!important;width:min(520px,calc(100vw - 32px))!important;min-height:452px!important;overflow:hidden!important;color:#fff!important;background:#182336 radial-gradient(circle at 50% 16%,rgba(78,120,188,.36),transparent 42%)!important;border:1px solid rgba(113,128,150,.9)!important;box-shadow:0 18px 54px rgba(0,0,0,.72)!important}
      .ltch-community-craft-titlebar{height:44px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:0 14px!important;color:#fff!important;font-size:16px!important;background:linear-gradient(180deg,#515151,#2c2c2c)!important;border-bottom:1px solid rgba(0,0,0,.72)!important}
      .ltch-community-craft-close{appearance:none!important;border:0!important;background:transparent!important;color:#a7adb5!important;font-size:29px!important;line-height:1!important;padding:0 2px!important;cursor:pointer!important}
      .ltch-community-craft-body{min-height:408px!important;padding:26px 22px 22px!important;text-align:center!important}
      .ltch-community-craft-heading{font-size:27px!important;font-weight:400!important;line-height:1.2!important;margin:18px 0 18px!important;letter-spacing:0!important}
      .ltch-community-craft-pile{position:relative!important;height:260px!important;margin:10px auto 0!important;width:min(390px,100%)!important}
      .ltch-community-craft-pile-card{position:absolute!important;left:50%!important;top:50%!important;width:174px!important;height:auto!important;max-height:250px!important;object-fit:contain!important;box-shadow:0 12px 32px rgba(0,0,0,.54)!important;transform:translate(-50%,-50%) rotate(var(--ltch-tilt)) translate(var(--ltch-x),var(--ltch-y))!important;animation:ltch-community-card-craft 1.3s ease-in-out infinite alternate!important}
      .ltch-community-craft-pile-card:nth-child(2n){animation-delay:-.34s!important}
      .ltch-community-craft-pile-card:nth-child(3n){animation-delay:-.72s!important}
      .ltch-community-craft-result{display:flex!important;align-items:center!important;gap:18px!important;margin:12px auto 16px!important;padding:14px!important;width:min(420px,100%)!important;min-height:102px!important;text-align:left!important;background:rgba(10,13,18,.68)!important;border:1px solid rgba(119,127,137,.62)!important;box-shadow:0 10px 28px rgba(0,0,0,.48)!important}
      .ltch-community-craft-result-icon{display:block!important;width:96px!important;height:96px!important;object-fit:contain!important;flex:none!important}
      .ltch-community-craft-result-placeholder{width:96px!important;height:96px!important;flex:none!important;border:1px dashed rgba(171,183,198,.55)!important}
      .ltch-community-craft-result-name{font-size:18px!important;line-height:1.25!important;color:#fff!important}
      .ltch-community-craft-result-meta{font-size:13px!important;line-height:1.35!important;color:#8cb8ea!important}
      .ltch-community-craft-reward-title{width:min(420px,100%)!important;margin:0 auto 7px!important;text-align:left!important;color:#c7d5e0!important;font-size:15px!important}
      .ltch-community-craft-rewards{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(128px,1fr))!important;gap:8px!important;width:min(420px,100%)!important;margin:0 auto 18px!important;text-align:left!important}
      .ltch-community-craft-reward{display:flex!important;align-items:center!important;gap:9px!important;min-height:62px!important;padding:8px!important;background:rgba(6,10,16,.62)!important;border:1px solid rgba(109,125,146,.56)!important}
      .ltch-community-craft-reward-icon{display:block!important;width:48px!important;height:48px!important;object-fit:contain!important;flex:none!important;background:rgba(0,0,0,.28)!important}
      .ltch-community-craft-reward-xp{display:flex!important;align-items:center!important;justify-content:center!important;width:48px!important;height:48px!important;flex:none!important;background:linear-gradient(135deg,#5bbef5,#244ed2)!important;color:#fff!important;font-size:13px!important;font-weight:600!important;text-align:center!important}
      .ltch-community-craft-reward-name{font-size:13px!important;line-height:1.25!important;color:#fff!important;overflow-wrap:anywhere!important}
      .ltch-community-craft-reward-kind{font-size:12px!important;line-height:1.25!important;color:#8fabc1!important}
      .ltch-community-craft-actions{display:grid!important;gap:8px!important;width:min(264px,100%)!important;margin:0 auto!important}
      .ltch-community-craft-actions .btn_medium>span{display:block!important;line-height:30px!important}
      .ltch-community-craft-error{display:flex!important;align-items:center!important;justify-content:center!important;min-height:210px!important;color:#c7d5e0!important;font-size:15px!important}
      @keyframes ltch-community-card-craft{from{margin-top:0}to{margin-top:-10px}}
    `;
    document.head.appendChild(style);
  }

  function setTextIfChanged(node, text) {
    if (!node) return;
    const next = String(text || "");
    if (node.textContent !== next) node.textContent = next;
  }

  function ensureCommunityBadgeInfo(row) {
    let info = row.querySelector(".badge_info");
    if (info) return info;

    let current = row.querySelector(".badge_current");
    if (!current) {
      const content = row.querySelector(".badge_content") || row.querySelector(".badge_row_inner") || row;
      current = document.createElement("div");
      current.className = "badge_current";
      content.insertBefore(current, content.firstChild);
    }

    info = document.createElement("div");
    info.className = "badge_info";
    current.insertBefore(info, current.firstChild);
    return info;
  }

  function ensureCommunityBadgeDescription(info) {
    let description = info.querySelector(".badge_info_description");
    if (!description) {
      description = document.createElement("div");
      description.className = "badge_info_description";
      info.appendChild(description);
    }
    return description;
  }

  function ensureCommunityBadgeIcon(info, iconURL) {
    if (!iconURL) return false;

    let image = info.querySelector(".badge_info_image");
    if (!image) {
      image = document.createElement("div");
      image.className = "badge_info_image";
      info.insertBefore(image, info.firstChild);
    }

    image.classList.add("ltch-community-badge-image");
    image.classList.remove("badge_empty", "badge_empty_left", "badge_empty_right");

    let img = image.querySelector("img.badge_icon") || image.querySelector("img");
    if (!img) {
      image.textContent = "";
      img = document.createElement("img");
      image.appendChild(img);
    }

    img.classList.add("badge_icon");
    img.setAttribute("alt", "");
    if (img.getAttribute("src") !== iconURL) img.setAttribute("src", iconURL);
    return true;
  }

  function applyCommunityBadgeVisual(row, payload) {
    if (!payload) return false;

    const badge = payload.badge && typeof payload.badge === "object" ? payload.badge : {};
    const craft = payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    const craftedLevel = readNumber(craft.level);
    if (!payload.complete && !craftedLevel) return false;

    const info = ensureCommunityBadgeInfo(row);
    while (info.firstChild) info.removeChild(info.firstChild);
    info.classList.add("ltch-community-badge-info");

    const description = ensureCommunityBadgeDescription(info);
    const hasIcon = ensureCommunityBadgeIcon(info, badge.iconURL || "");

    let title = description.querySelector(".badge_info_title");
    if (!title) {
      title = document.createElement("div");
      title.className = "badge_info_title";
      description.insertBefore(title, description.firstChild);
    }

    const name = badge.name || visibleText(title) || "Insignia";
    const xp = Math.max(100, readNumber(badge.xp || 100));
    setTextIfChanged(title, name);

    let levelLine = title.nextElementSibling;
    if (!levelLine || levelLine.classList.contains("badge_info_unlocked")) {
      levelLine = document.createElement("div");
      title.insertAdjacentElement("afterend", levelLine);
    }
    setTextIfChanged(levelLine, craftedLevel > 0 ? `Nivel ${craftedLevel}, ${xp} XP` : `${xp} XP`);

    row.classList.add("ltch-community-badge-unlocked");
    return hasIcon || !!name;
  }

  function communityCraftCards(payload) {
    return (Array.isArray(payload && payload.cards) ? payload.cards : [])
      .map((card) => String((card && card.imageURL) || "").trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  function communityCraftRewardKind(kind) {
    return kind === "profileBackground" ? "Plano de fundo" : "Emoticon";
  }

  function communityCraftRewardItems(payload, level) {
    const rewards = (Array.isArray(payload && payload.rewards) ? payload.rewards : [])
      .filter((item) => item && typeof item === "object")
      .filter((item) => (item.kind === "profileBackground" || item.kind === "emoticon") && item.imageURL);
    const selected = [];
    ["emoticon", "profileBackground"].forEach((kind) => {
      const choices = rewards.filter((item) => item.kind === kind);
      if (!choices.length) return;
      const index = hashString(`${payload.appid || 0}:${kind}:${level}`) % choices.length;
      selected.push(choices[index]);
    });
    return selected;
  }

  function appendCommunityCraftRewards(body, payload, level) {
    if (!body) return;

    const title = document.createElement("div");
    title.className = "ltch-community-craft-reward-title";
    setTextIfChanged(title, "Recompensas");
    body.appendChild(title);

    const rewards = document.createElement("div");
    rewards.className = "ltch-community-craft-rewards";
    body.appendChild(rewards);

    const xp = document.createElement("div");
    xp.className = "ltch-community-craft-reward";
    rewards.appendChild(xp);
    const xpIcon = document.createElement("span");
    xpIcon.className = "ltch-community-craft-reward-xp";
    setTextIfChanged(xpIcon, "+100 XP");
    xp.appendChild(xpIcon);
    const xpDetails = document.createElement("div");
    xp.appendChild(xpDetails);
    const xpName = document.createElement("div");
    xpName.className = "ltch-community-craft-reward-name";
    setTextIfChanged(xpName, "XP da insignia");
    xpDetails.appendChild(xpName);

    communityCraftRewardItems(payload, level).forEach((item) => {
      const reward = document.createElement("div");
      reward.className = "ltch-community-craft-reward";
      rewards.appendChild(reward);

      const image = document.createElement("img");
      image.className = "ltch-community-craft-reward-icon";
      image.setAttribute("alt", "");
      image.setAttribute("src", item.imageURL);
      reward.appendChild(image);

      const details = document.createElement("div");
      reward.appendChild(details);
      const name = document.createElement("div");
      name.className = "ltch-community-craft-reward-name";
      setTextIfChanged(name, item.title || item.name || communityCraftRewardKind(item.kind));
      details.appendChild(name);
      const kind = document.createElement("div");
      kind.className = "ltch-community-craft-reward-kind";
      setTextIfChanged(kind, communityCraftRewardKind(item.kind));
      details.appendChild(kind);
    });
  }

  function closeCommunityCraftDialog(dialog) {
    const overlay = dialog && dialog.closest(".ltch-community-craft-overlay");
    if (overlay) overlay.remove();
  }

  function appendCommunityCraftButton(parent, className, text, onClick) {
    const button = document.createElement("a");
    button.href = "javascript:void(0)";
    button.className = className;
    const span = document.createElement("span");
    setTextIfChanged(span, text);
    button.appendChild(span);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (typeof onClick === "function") onClick(event);
    });
    parent.appendChild(button);
    return button;
  }

  function communityCraftDialogShell() {
    document.querySelectorAll(".ltch-community-craft-overlay").forEach((node) => node.remove());

    const overlay = document.createElement("div");
    overlay.className = "ltch-community-craft-overlay";
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) overlay.remove();
    });

    const dialog = document.createElement("div");
    dialog.className = "ltch-community-craft-dialog";
    overlay.appendChild(dialog);

    const titlebar = document.createElement("div");
    titlebar.className = "ltch-community-craft-titlebar";
    dialog.appendChild(titlebar);

    const title = document.createElement("span");
    setTextIfChanged(title, "Fabricar insignia");
    titlebar.appendChild(title);

    const close = document.createElement("button");
    close.type = "button";
    close.className = "ltch-community-craft-close";
    close.setAttribute("aria-label", "Fechar");
    close.textContent = "\u00d7";
    close.addEventListener("click", () => closeCommunityCraftDialog(dialog));
    titlebar.appendChild(close);

    const body = document.createElement("div");
    body.className = "ltch-community-craft-body";
    dialog.appendChild(body);

    document.body.appendChild(overlay);
    return dialog;
  }

  function showCommunityCraftingDialog(payload) {
    const dialog = communityCraftDialogShell();
    const body = dialog.querySelector(".ltch-community-craft-body");
    if (!body) return dialog;

    const heading = document.createElement("div");
    heading.className = "ltch-community-craft-heading";
    setTextIfChanged(heading, "Fabricando...");
    body.appendChild(heading);

    const pile = document.createElement("div");
    pile.className = "ltch-community-craft-pile";
    body.appendChild(pile);

    const cards = communityCraftCards(payload);
    cards.forEach((url, index) => {
      const card = document.createElement("img");
      card.className = "ltch-community-craft-pile-card";
      card.setAttribute("alt", "");
      card.setAttribute("src", url);
      card.style.setProperty("--ltch-x", `${((index % 4) - 1.5) * 42}px`);
      card.style.setProperty("--ltch-y", `${(Math.floor(index / 4) - .5) * 42}px`);
      card.style.setProperty("--ltch-tilt", `${((index % 5) - 2) * 12}deg`);
      pile.appendChild(card);
    });

    return dialog;
  }

  function showCommunityCraftResult(dialog, payload) {
    const body = dialog && dialog.querySelector(".ltch-community-craft-body");
    if (!body) return;
    while (body.firstChild) body.removeChild(body.firstChild);

    const badge = payload && payload.badge && typeof payload.badge === "object" ? payload.badge : {};
    const craft = payload && payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    const level = Math.max(1, readNumber(craft.level || badge.level || 1));
    const xp = Math.max(100, readNumber(badge.xp || level * 100));

    const heading = document.createElement("div");
    heading.className = "ltch-community-craft-heading";
    setTextIfChanged(heading, "Insignia fabricada");
    body.appendChild(heading);

    const result = document.createElement("div");
    result.className = "ltch-community-craft-result";
    body.appendChild(result);

    const iconURL = String(badge.iconURL || "").trim();
    if (iconURL) {
      const icon = document.createElement("img");
      icon.className = "ltch-community-craft-result-icon";
      icon.setAttribute("alt", "");
      icon.setAttribute("src", iconURL);
      result.appendChild(icon);
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = "ltch-community-craft-result-placeholder";
      result.appendChild(placeholder);
    }

    const details = document.createElement("div");
    result.appendChild(details);
    const name = document.createElement("div");
    name.className = "ltch-community-craft-result-name";
    setTextIfChanged(name, badge.name || "Insignia");
    details.appendChild(name);
    const meta = document.createElement("div");
    meta.className = "ltch-community-craft-result-meta";
    setTextIfChanged(meta, `Nivel ${level}, ${xp} XP`);
    details.appendChild(meta);

    appendCommunityCraftRewards(body, payload, level);

    const actions = document.createElement("div");
    actions.className = "ltch-community-craft-actions";
    body.appendChild(actions);
    appendCommunityCraftButton(actions, "btn_blue_white_innerfade btn_medium", "Fechar", () => closeCommunityCraftDialog(dialog));
  }

  function showCommunityCraftError(dialog, message) {
    const body = dialog && dialog.querySelector(".ltch-community-craft-body");
    if (!body) return;
    while (body.firstChild) body.removeChild(body.firstChild);

    const heading = document.createElement("div");
    heading.className = "ltch-community-craft-heading";
    setTextIfChanged(heading, "Fabricar insignia");
    body.appendChild(heading);

    const error = document.createElement("div");
    error.className = "ltch-community-craft-error";
    setTextIfChanged(error, message || "Falha ao fabricar a insignia.");
    body.appendChild(error);

    const actions = document.createElement("div");
    actions.className = "ltch-community-craft-actions";
    body.appendChild(actions);
    appendCommunityCraftButton(actions, "btn_grey_white_innerfade btn_medium", "Fechar", () => closeCommunityCraftDialog(dialog));
  }

  function craftVisualBadge(appid, button, payload) {
    appid = toAppId(appid);
    if (!appid) return;
    if (button && button.dataset.ltchCrafting === "1") return;
    const dialog = showCommunityCraftingDialog(payload);
    const startedAt = Date.now();

    if (button) {
      button.dataset.ltchCrafting = "1";
      button.classList.add("btn_disabled");
      const span = button.querySelector("span") || button;
      setTextIfChanged(span, "Criando...");
    }

    callBackend("CraftLuaToolsCardVisualBadge", { appid })
      .then(parsePayload)
      .then((payload) => {
        if (!payload || !payload.success) throw new Error((payload && payload.error) || "visual craft failed");
        STATE.communityVisualData.set(communityVisualCacheKey(appid), payload);
        STATE.loggedCommunityVisuals.clear();
        applyCommunityGamecardsVisual(appid, payload, "visual-craft");
        refreshVisualDrops("visual-craft");
        refreshNativeBadgeView(appid);
        refreshCommunityBadgesVisual("visual-craft");
        window.setTimeout(
          () => showCommunityCraftResult(dialog, payload),
          Math.max(0, 1250 - (Date.now() - startedAt)),
        );
      })
      .catch((err) => {
        warn("visual badge craft failed", { appid, error: err && err.message ? err.message : String(err) });
        showCommunityCraftError(dialog, err && err.message ? err.message : String(err));
        if (button) {
          button.dataset.ltchCrafting = "0";
          button.classList.remove("btn_disabled");
          const span = button.querySelector("span") || button;
          setTextIfChanged(span, "Criar insignia");
        }
      });
  }

  function ensureCommunityCraftButton(row, payload, appid) {
    if (!payload) return false;
    const craft = payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    const maxLevel = Math.max(1, readNumber(craft.maxLevel || 5));
    const level = Math.max(0, readNumber(craft.level));
    const existingWrap = row.querySelector(".ltch-community-craft-slot");
    if (!payload.complete || level >= maxLevel) {
      if (existingWrap) existingWrap.remove();
      return false;
    }
    const minutesUntilNextLevel = Math.max(0, readNumber(craft.minutesUntilNextLevel));
    const canCraft = !!craft.canCraft && level < maxLevel;
    const content = row.querySelector(".badge_content") || row.querySelector(".badge_row_inner") || row;
    if (!content) return false;

    let wrap = existingWrap;
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "ltch-community-craft-slot";
      content.insertBefore(wrap, content.firstChild);
    }

    let button = wrap.querySelector(".ltch-community-craft-button");
    if (!button) {
      button = document.createElement("a");
      button.href = "javascript:void(0)";
      button.className = "btn_blue_white_innerfade btn_medium ltch-community-craft-button";
      const span = document.createElement("span");
      button.appendChild(span);
      wrap.appendChild(button);
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (button.getAttribute("aria-disabled") === "true") return;
        craftVisualBadge(appid, button, payload);
      });
    }

    button.className = canCraft
      ? "btn_blue_white_innerfade btn_medium ltch-community-craft-button"
      : "btn_grey_white_innerfade btn_medium btn_disabled ltch-community-craft-button";
    button.dataset.ltchCrafting = "0";
    button.setAttribute("aria-disabled", canCraft ? "false" : "true");
    setTextIfChanged(button.querySelector("span") || button, canCraft ? "Criar insignia" : "Jogue mais");
    button.title = !canCraft && level < maxLevel && minutesUntilNextLevel > 0
      ? `Proximo nivel em ${minutesUntilNextLevel} min`
      : "";
    return true;
  }

  function ensureCommunityCardImage(card, cardData) {
    const url = String((cardData && cardData.imageURL) || "").trim();
    if (!card || !url) return null;

    let image = card.querySelector("img.gamecard") || card.querySelector(".game_card_ctn img") || card.querySelector("img");
    if (!image) {
      let host = card.querySelector(".game_card_ctn") || card.querySelector(".badge_card_set_card_content");
      if (!host) {
        host = document.createElement("div");
        host.className = "game_card_ctn ltch-community-card-host";
        card.insertBefore(host, card.firstChild);
      } else {
        host.classList.add("ltch-community-card-host");
      }
      image = document.createElement("img");
      image.className = "gamecard ltch-community-card-image";
      image.setAttribute("alt", "");
      host.insertBefore(image, host.firstChild);
    }

    image.classList.add("ltch-community-card-image");
    if (image.getAttribute("src") !== url) image.setAttribute("src", url);
    return image;
  }

  function hideCommunitySpentCardErrors(card) {
    return replaceVisibleTextNodes(
      card,
      (_text, normalized) => (
        normalized.includes("ocorreu um erro") ||
        normalized.includes("tentar novamente") ||
        normalized.includes("an error occurred") ||
        normalized.includes("try again")
      ),
      "",
      "ltch-community-card-load-error",
    );
  }

  function ensureCommunitySpentCardArt(card, cardData) {
    const url = String((cardData && cardData.imageURL) || "").trim();
    if (!card || !url) return null;

    let art = card.querySelector(".ltch-community-spent-card-art");
    if (!art) {
      art = document.createElement("img");
      art.className = "gamecard ltch-community-spent-card-art";
      art.setAttribute("alt", "");
      card.insertBefore(art, card.firstChild);
    }

    if (art.getAttribute("src") !== url) art.setAttribute("src", url);
    return art;
  }

  function applyCommunityCardsVisual(row, payload) {
    const ownedIndexes = new Set(
      Array.isArray(payload && payload.ownedIndexes)
        ? payload.ownedIndexes.map((index) => Number(index))
        : [],
    );
    const payloadCards = Array.isArray(payload && payload.cards) ? payload.cards : [];

    let patched = 0;
    const cards = Array.from(row.querySelectorAll(".badge_card_set_card"));
    cards.forEach((card, index) => {
      const cardData = payloadCards[index] || {};
      const isOwned = ownedIndexes.has(index);
      card.classList.toggle("ltch-card-owned", isOwned);
      card.classList.toggle("ltch-card-spent", !isOwned);
      card.classList.toggle("unowned", !isOwned);
      card.dataset.ltchVisualOwned = isOwned ? "1" : "0";
      if (isOwned) card.querySelectorAll(".game_card_unowned_border").forEach((border) => border.remove());
      if (isOwned) card.querySelectorAll(".ltch-community-spent-card-art").forEach((art) => art.remove());

      const image = ensureCommunityCardImage(card, cardData);
      if (image) {
        if (isOwned) {
          image.style.setProperty("opacity", "1", "important");
          image.style.setProperty("filter", "none", "important");
        } else {
          image.style.removeProperty("opacity");
          image.style.removeProperty("filter");
        }
      }
      if (!isOwned) {
        ensureCommunitySpentCardArt(card, cardData);
        hideCommunitySpentCardErrors(card);
      }
      patched += 1;
    });
    return patched;
  }

  function communityCardSnapshotFromDOM(row, appid) {
    if (!row) return null;
    const cards = Array.from(row.querySelectorAll(".badge_card_set_card"))
      .map((card, index) => {
        const image = card.querySelector("img.gamecard") || card.querySelector(".game_card_ctn img") || card.querySelector("img");
        const imageURL = normalizeImageURL(image && image.getAttribute("src"), appid);
        let title = visibleText(card.querySelector(".badge_card_set_title") || card.querySelector(".badge_card_set_text") || card);
        title = String(title || "")
          .split(/\n|\r/)
          .map((part) => part.trim())
          .filter(Boolean)[0] || "";
        title = title
          .replace(/\d+\s+(?:de|of)\s+\d+.*$/i, "")
          .replace(/(?:Carregando|Loading).*$/i, "")
          .trim();
        if (!title || !imageURL) return null;
        return {
          index,
          title,
          name: title,
          marketHash: `${appid}-${title}`,
          imageURL,
        };
      })
      .filter(Boolean);
    if (!cards.length) return null;

    const badgeTitle = visibleText(row.querySelector(".badge_info_title") || row.querySelector(".badge_title"));
    const badgeImage = row.querySelector(".badge_info_image img") || row.querySelector(".badge_icon") || row.querySelector(".badge_current img");
    const iconURL = normalizeImageURL(badgeImage && badgeImage.getAttribute("src"), appid) || STATE.badgeIconCache.get(appid) || "";
    const badge = {
      name: badgeTitle || "",
      level: 0,
      xp: 100,
      iconURL,
    };

    return {
      cards,
      badge,
      badgeLevels: badge.name || badge.iconURL ? [{ level: 1, name: badge.name || "Level 1", xp: 100, iconURL: badge.iconURL }] : [],
    };
  }

  function saveVisualSnapshotFromCommunityDOM(appid, row, source) {
    appid = toAppId(appid);
    if (!appid || !isLuaApp(appid)) return Promise.resolve(null);
    const snapshot = communityCardSnapshotFromDOM(row, appid);
    if (!snapshot) return Promise.resolve(null);
    const key = `${appid}:community-dom:${snapshot.cards.length}:${snapshot.badge.name}:${snapshot.badge.iconURL}`;
    if (STATE.savedVisualSnapshots.has(key)) return Promise.resolve(null);
    STATE.savedVisualSnapshots.add(key);
    return callBackend("SaveLuaToolsCardVisualSnapshot", {
      appid,
      cards: snapshot.cards,
      badge: snapshot.badge,
      badgeLevels: snapshot.badgeLevels,
      source: source || "community-dom",
    })
      .then(parsePayload)
      .then((payload) => {
        if (!payload || !payload.success) throw new Error((payload && payload.error) || "DOM snapshot save failed");
        if (payload.active) STATE.communityVisualData.set(communityVisualCacheKey(appid), payload);
        log("saved visual snapshot from Community DOM", {
          appid,
          cards: payload.cardCount || snapshot.cards.length,
          source: source || "community-dom",
        });
        return payload;
      })
      .catch((err) => {
        warn("failed saving Community DOM visual snapshot", {
          appid,
          error: err && err.message ? err.message : String(err),
        });
        return null;
      });
  }

  function disableCommunityAction(element) {
    if (!element || element.dataset.ltchActionDisabled === "1") return;
    element.dataset.ltchActionDisabled = "1";
    element.removeAttribute("href");
    element.removeAttribute("onclick");
    element.setAttribute("aria-disabled", "true");
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
  }

  function communityActionTarget(element) {
    try {
      return element && (element.closest("a,button") || element);
    } catch (_) {
      return element;
    }
  }

  function canReplaceElementText(element) {
    if (!element) return false;
    const children = Array.from(element.children || []).filter((child) => {
      return String(child.tagName || "").toUpperCase() !== "BR";
    });
    return children.length === 0;
  }

  function replaceCompactElementText(element, text, className) {
    if (!element || !text) return false;
    if (!canReplaceElementText(element)) return false;
    setTextIfChanged(element, text);
    if (className) element.classList.add(className);
    return true;
  }

  function replaceVisibleTextNodes(root, matcher, replacement, className) {
    if (!root || !document.createTreeWalker) return 0;
    let patched = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node && node.parentElement;
        if (!parent || parent.closest("script,style,noscript")) return NodeFilter.FILTER_REJECT;
        const text = String(node.nodeValue || "").replace(/\s+/g, " ").trim();
        if (!text) return NodeFilter.FILTER_REJECT;
        return matcher(text, normalizeText(text)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      node.nodeValue = replacement;
      if (className && node.parentElement) node.parentElement.classList.add(className);
      patched += 1;
    });
    return patched;
  }

  function clearCommunityMarketPriceText(row) {
    const priceValuePattern = /^(?:R\$|US\$|\$|€|£)\s*[\d,.]+$/i;
    let patched = 0;

    patched += replaceVisibleTextNodes(
      row,
      (text, normalized) => (
        normalized.includes("preco mais baixo atualmente") ||
        normalized.includes("lowest price currently") ||
        priceValuePattern.test(text.trim()) ||
        normalized === "n a"
      ),
      "",
      "ltch-community-hidden-market-price",
    );

    return patched;
  }

  function applyCommunityRemainingCount(row, payload) {
    const cardCount = Math.max(0, readNumber(payload && payload.cardCount));
    const targetOwned = Math.max(0, Math.min(cardCount, readNumber(payload && payload.targetOwned)));
    const remaining = Math.max(0, cardCount - targetOwned);
    const text = `${remaining} ${remaining === 1 ? "carta restante" : "cartas restantes"} para colecionar`;

    return replaceVisibleTextNodes(
      row,
      (_text, normalized) => (
        normalized.includes("cartas restantes para colecionar") ||
        normalized.includes("carta restante para colecionar") ||
        normalized.includes("cards remaining to collect") ||
        normalized.includes("card remaining to collect")
      ),
      text,
      "ltch-community-remaining-count",
    );
  }

  function applyCommunityCompleteCopy(row, payload) {
    if (!payload || !payload.complete) return 0;

    let patched = 0;
    patched += clearCommunityMarketPriceText(row);
    patched += replaceVisibleTextNodes(
      row,
      (_text, normalized) => (
        normalized.includes("nenhum amigo tem essa carta") ||
        normalized.includes("no friends have this card")
      ),
      "Voce tem esta carta.",
      "ltch-community-owned-note",
    );

    const nodes = Array.from(row.querySelectorAll("a,button,div,span"));
    nodes.forEach((node) => {
      const text = visibleText(node);
      if (!text || text.length > 140) return;

      const normalized = normalizeText(text);
      if (!normalized) return;

      if (
        normalized.includes("comprar as cartas restantes") ||
        normalized.includes("buy remaining cards")
      ) {
        const target = communityActionTarget(node);
        if (target && target.dataset.ltchMarketActionHidden !== "1") {
          target.dataset.ltchMarketActionHidden = "1";
          target.classList.add("ltch-community-hidden-market-action");
          disableCommunityAction(target);
          patched += 1;
        }
        return;
      }

      if (
        normalized.includes("buscar no mercado") ||
        normalized.includes("search the market") ||
        normalized.includes("visitar forum de troca") ||
        normalized.includes("visit trade forum")
      ) {
        const target = communityActionTarget(node);
        if (target && target.dataset.ltchMarketActionHidden !== "1") {
          target.dataset.ltchMarketActionHidden = "1";
          target.classList.add("ltch-community-hidden-market-action");
          disableCommunityAction(target);
          patched += 1;
        }
        return;
      }

    });

    return patched;
  }

  function applyCommunityGamecardsVisual(appid, payload, reason) {
    if (!payload || !payload.active || !payload.cardCount) return false;
    const row = document.querySelector(".badge_gamecard_page") || document.querySelector(".badge_row.depressed");
    if (!row) return false;

    ensureCommunityGamecardsStyles();
    row.classList.add("ltch-community-visual");
    row.classList.toggle("ltch-community-complete", !!payload.complete);
    row.dataset.ltchCommunityVisualAppid = String(appid);
    row.dataset.ltchCommunityVisualMode = payload.visualDropMode || getVisualDropMode();

    const patchedCards = applyCommunityCardsVisual(row, payload);
    const patchedBadge = applyCommunityBadgeVisual(row, payload);
    const patchedCopy = applyCommunityRemainingCount(row, payload) + applyCommunityCompleteCopy(row, payload);
    const patchedCraft = ensureCommunityCraftButton(row, payload, appid);
    const craft = payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    const signature = `${appid}:${payload.visualDropMode}:${payload.targetOwned}:${payload.cardCount}:${payload.complete}:${patchedCards}:${patchedBadge}:${patchedCopy}:${patchedCraft}:${craft.level || 0}:${craft.maxLevel || 0}`;
    if (!STATE.loggedCommunityVisuals.has(signature)) {
      STATE.loggedCommunityVisuals.add(signature);
      log("applied Steam Community gamecards visual", {
        appid,
        mode: payload.visualDropMode,
        targetOwned: payload.targetOwned,
        cardCount: payload.cardCount,
        complete: !!payload.complete,
        patchedCards,
        patchedBadge,
        patchedCopy,
        patchedCraft,
        craftLevel: craft.level || 0,
        craftMaxLevel: craft.maxLevel || 0,
        reason: reason || "patch",
      });
    }
    return patchedCards > 0 || patchedBadge || patchedCopy > 0 || patchedCraft;
  }

  function scheduleCommunityGamecardsPatch(reason, force) {
    if (!isCommunityGamecardsPage()) return;
    if (STATE.communityPatchTimer) return;
    STATE.communityPatchTimer = window.setTimeout(() => {
      STATE.communityPatchTimer = 0;
      patchCommunityGamecardsPage(reason || "scheduled", !!force);
    }, 200);
  }

  function patchCommunityGamecardsPage(reason, force) {
    const appid = getCommunityGamecardsAppId();
    if (!appid) return Promise.resolve(false);
    const row = document.querySelector(".badge_gamecard_page") || document.querySelector(".badge_row.depressed");
    return loadSettings(false)
      .then(() => fetchCommunityVisualData(appid, force))
      .then((payload) => {
        if (payload && payload.active) return applyCommunityGamecardsVisual(appid, payload, reason);
        return saveVisualSnapshotFromCommunityDOM(appid, row, "community-dom").then((savedPayload) => {
          if (savedPayload && savedPayload.active) return applyCommunityGamecardsVisual(appid, savedPayload, reason || "dom-snapshot");
          return false;
        });
      })
      .catch((err) => {
        warn("Steam Community gamecards visual patch failed", {
          appid,
          reason,
          error: err && err.message ? err.message : String(err),
        });
        return false;
      });
  }

  function refreshCommunityGamecardsVisual(reason) {
    STATE.communityVisualData.clear();
    STATE.communityVisualPromises.clear();
    STATE.communityVisualBatchPromises.clear();
    STATE.communityVisualBatchLoaded.clear();
    STATE.loggedCommunityVisuals.clear();
    scheduleCommunityGamecardsPatch(reason || "refresh", true);
  }

  function startCommunityGamecardsWatcher() {
    if (!isCommunityGamecardsPage()) return;
    ensureCommunityGamecardsStyles();
    scheduleCommunityGamecardsPatch("initial", true);

    const attachObserver = () => {
      if (!document.body) {
        window.setTimeout(attachObserver, 500);
        return;
      }
      if (STATE.communityPatchObserver) return;
      STATE.communityPatchObserver = new MutationObserver(() => scheduleCommunityGamecardsPatch("dom-change", false));
      STATE.communityPatchObserver.observe(document.body, { childList: true, subtree: true });
    };
    attachObserver();
  }

  function communityGamecardsUrl(appid) {
    return `https://steamcommunity.com/my/gamecards/${toAppId(appid)}/`;
  }

  function appIdFromGamecardsReference(value) {
    const text = String(value || "");
    const match = text.match(/\/gamecards\/(\d+)/i) || text.match(/gamecards\/(\d+)/i);
    return match ? toAppId(match[1]) : 0;
  }

  function communityBadgesRowFromElement(element) {
    if (!element || !element.closest) return null;
    const row = element.closest(".badge_row");
    if (row) return row;

    const selectors = [
      ".profile_badges_badge",
      ".badge_content",
      ".badge_row_inner",
      ".badge_title_row",
    ];
    for (const selector of selectors) {
      const candidate = element.closest(selector);
      if (candidate) return candidate;
    }

    let current = element;
    for (let depth = 0; depth < 8 && current && current.parentElement; depth += 1) {
      current = current.parentElement;
      if (!current || current === document.body) break;
      const rect = current.getBoundingClientRect ? current.getBoundingClientRect() : { width: 0, height: 0 };
      if (rect.width >= 260 && rect.height >= 54) return current;
    }
    return element.parentElement || null;
  }

  function findCommunityBadgesRows() {
    if (!document.body) return [];
    const rows = new Map();
    const candidates = Array.from(document.querySelectorAll('a[href*="gamecards"], [onclick*="gamecards"]'));
    candidates.forEach((candidate) => {
      const appid = appIdFromGamecardsReference(
        candidate.getAttribute("href") ||
        candidate.href ||
        candidate.getAttribute("onclick") ||
        "",
      );
      if (!appid) return;
      const row = communityBadgesRowFromElement(candidate);
      if (!row || row.closest(".ltch-community-craft-overlay")) return;
      if (!rows.has(row)) rows.set(row, appid);
    });
    return Array.from(rows, ([row, appid]) => ({ row, appid }));
  }

  function communityBadgesStatus(payload) {
    if (!payload || !payload.active) return { text: "", state: "" };
    const craft = payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    const badge = payload.badge && typeof payload.badge === "object" ? payload.badge : {};
    const level = Math.max(0, readNumber(craft.level || badge.level));
    const maxLevel = Math.max(1, readNumber(craft.maxLevel || 5));
    const cardCount = Math.max(0, readNumber(payload.cardCount));
    const targetOwned = Math.max(0, Math.min(cardCount, readNumber(payload.targetOwned)));
    const minutesUntilNextLevel = Math.max(0, readNumber(craft.minutesUntilNextLevel));

    if (level >= maxLevel) {
      return { text: `Insignia visual: nivel maximo ${level} de ${maxLevel}`, state: "maxed" };
    }
    if (payload.complete && craft.canCraft) {
      return { text: `Conjunto completo, pronto para criar nivel ${level + 1}`, state: "ready" };
    }
    if (level > 0) {
      const wait = minutesUntilNextLevel > 0 ? ` / proximo nivel em ${minutesUntilNextLevel} min` : "";
      return { text: `Insignia visual: nivel ${level} de ${maxLevel}${wait}`, state: "" };
    }
    if (targetOwned > 0 && cardCount > 0) {
      return { text: `Cartas visuais: ${targetOwned} de ${cardCount}`, state: "" };
    }
    return { text: "", state: "" };
  }

  function ensureCommunityBadgesStatus(row, payload) {
    if (row && row.classList && row.classList.contains("ltch-community-badges-local-row")) {
      const status = row.querySelector(".ltch-community-badges-status");
      if (status) status.remove();
      return false;
    }

    const statusInfo = communityBadgesStatus(payload);
    let status = row.querySelector(".ltch-community-badges-status");
    if (!statusInfo.text) {
      if (status) status.remove();
      return false;
    }

    if (!status) {
      status = document.createElement("div");
      status.className = "ltch-community-badges-status";
      const host = row.querySelector(".badge_info") ||
        row.querySelector(".badge_row_inner") ||
        row.querySelector(".badge_content") ||
        row;
      const title = host.querySelector(".badge_title, .badge_info_title, .badge_title_row, .badge_name");
      if (title && title.parentElement === host) title.insertAdjacentElement("afterend", status);
      else host.appendChild(status);
    }

    status.classList.toggle("ltch-ready", statusInfo.state === "ready");
    status.classList.toggle("ltch-maxed", statusInfo.state === "maxed");
    setTextIfChanged(status, statusInfo.text);
    return true;
  }

  function communityBadgesIconURL(appid, payload, level) {
    const craft = payload && payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    const badge = payload && payload.badge && typeof payload.badge === "object" ? payload.badge : {};
    const nextBadge = craft.nextBadge && typeof craft.nextBadge === "object" ? craft.nextBadge : {};
    const levels = Array.isArray(payload && payload.badgeLevels) ? payload.badgeLevels : [];
    const exactLevel = levels.find((item) => readNumber(item && item.level) === level);
    const anyLevelWithIcon = levels.find((item) => normalizeImageURL(item && item.iconURL, appid));
    return normalizeImageURL(badge.iconURL, appid) ||
      normalizeImageURL(exactLevel && exactLevel.iconURL, appid) ||
      normalizeImageURL(nextBadge.iconURL, appid) ||
      normalizeImageURL(anyLevelWithIcon && anyLevelWithIcon.iconURL, appid) ||
      normalizeImageURL(STATE.badgeIconCache.get(appid), appid);
  }

  function requestCommunityBadgesIconFallback(appid, payload) {
    if (!appid) return;
    fetchBadgeIconFromGamecardsPage(appid).then((icon) => {
      if (!icon) return;
      const badge = payload && payload.badge && typeof payload.badge === "object" ? payload.badge : null;
      if (badge && !badge.iconURL) badge.iconURL = icon;
      scheduleCommunityBadgesPatch("badge-icon", true);
    });
  }

  function ensureCommunityBadgesIcon(row, appid, payload) {
    const craft = payload && payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    const badge = payload && payload.badge && typeof payload.badge === "object" ? payload.badge : {};
    const level = Math.max(0, readNumber(craft.level || badge.level));

    let holder = row.querySelector(".ltch-community-badges-icon") ||
      row.querySelector(".badge_info_image") ||
      row.querySelector(".badge_icon, .badge_empty");
    let image = holder && (holder.querySelector("img.badge_icon") || holder.querySelector("img"));
    if (!holder) {
      const host = row.querySelector(".badge_row_inner") || row.querySelector(".badge_content") || row;
      holder = document.createElement("div");
      holder.className = "badge_icon ltch-community-badges-icon";
      host.insertBefore(holder, host.firstChild);
    }

    holder.classList.add("ltch-community-badges-icon");
    if (row && row.classList) {
      row.classList.toggle("ltch-community-badges-level-zero", level <= 0);
      row.classList.toggle("ltch-community-badges-has-level", level > 0);
    }
    if (level <= 0) {
      holder.classList.add("badge_empty", "ltch-community-badges-empty-icon");
      holder.classList.remove("ltch-community-badges-preview-icon", "badge_empty_left", "badge_empty_right");
      Array.from(holder.querySelectorAll("img")).forEach((img) => img.remove());
      if (!holder.querySelector(".badge_empty_circle")) {
        holder.textContent = "";
        const circle = document.createElement("div");
        circle.className = "badge_empty_circle";
        holder.appendChild(circle);
      }
      return true;
    }

    const iconURL = communityBadgesIconURL(appid, payload, level);
    if (!iconURL) {
      requestCommunityBadgesIconFallback(appid, payload);
      return false;
    }

    holder.classList.remove("badge_empty", "badge_empty_left", "badge_empty_right", "ltch-community-badges-empty-icon");
    holder.classList.remove("ltch-community-badges-preview-icon");
    const emptyCircle = holder.querySelector(".badge_empty_circle");
    if (emptyCircle) emptyCircle.remove();
    if (!image) {
      holder.textContent = "";
      image = document.createElement("img");
      image.className = "badge_icon";
      image.setAttribute("alt", "");
      holder.appendChild(image);
    }
    image.classList.add("badge_icon");
    image.classList.toggle("ltch-community-badges-preview-icon", level <= 0);
    if (image.getAttribute("src") !== iconURL) image.setAttribute("src", iconURL);
    return true;
  }

  function ensureCommunityBadgesAction(row, payload, appid) {
    const craft = payload && payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    const level = Math.max(0, readNumber(craft.level));
    const maxLevel = Math.max(1, readNumber(craft.maxLevel || 5));
    const canCraft = !!(payload && payload.complete && craft.canCraft && level < maxLevel);
    const isLocalRow = !!(row && row.classList && row.classList.contains("ltch-community-badges-local-row"));
    let actions = row.querySelector(".ltch-community-badges-actions");
    if (!canCraft) {
      if (actions) actions.remove();
      return false;
    }

    if (!actions) {
      actions = document.createElement("div");
      actions.className = "ltch-community-badges-actions";
      const host = row.querySelector(".badge_content") || row.querySelector(".badge_row_inner") || row;
      const clear = host.querySelector(".ltch-community-badges-clear");
      if (clear) host.insertBefore(actions, clear);
      else host.appendChild(actions);
    }

    let button = actions.querySelector(".ltch-community-badges-craft");
    if (!button) {
      button = document.createElement("a");
      button.className = `${isLocalRow ? "badge_craft_button" : "btn_blue_white_innerfade btn_small"} ltch-community-badges-craft`;
      button.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      const span = document.createElement("span");
      button.appendChild(span);
      actions.appendChild(button);
    }

    button.setAttribute("href", communityGamecardsUrl(appid));
    button.setAttribute("title", "Abrir cartas para criar a insignia visual");
    button.className = `${isLocalRow ? "badge_craft_button" : "btn_blue_white_innerfade btn_small"} ltch-community-badges-craft`;
    setTextIfChanged(button.querySelector("span") || button, isLocalRow ? "Pronto" : "Criar insignia");
    return true;
  }

  function patchCommunityBadgesProgressCopy(row, payload) {
    if (row && row.classList && row.classList.contains("ltch-community-badges-local-row")) return 0;

    const cardCount = Math.max(0, readNumber(payload && payload.cardCount));
    const targetOwned = Math.max(0, Math.min(cardCount, readNumber(payload && payload.targetOwned)));
    const remaining = Math.max(0, cardCount - targetOwned);
    return replaceVisibleTextNodes(
      row,
      (_text, normalized) => (
        normalized.includes("cartas restantes") ||
        normalized.includes("carta restante") ||
        normalized.includes("cards remaining") ||
        normalized.includes("card remaining")
      ),
      `${remaining} ${remaining === 1 ? "carta restante" : "cartas restantes"}`,
      "ltch-community-remaining-count",
    );
  }

  function applyCommunityBadgesRowVisual(row, appid, payload, reason) {
    if (!row || !payload || !payload.active || !payload.cardCount) return false;
    const craft = payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    const badge = payload.badge && typeof payload.badge === "object" ? payload.badge : {};
    const level = Math.max(0, readNumber(craft.level || badge.level));

    row.classList.add("ltch-community-badges-row");
    row.dataset.ltchCommunityBadgesAppid = String(appid);
    row.dataset.ltchCommunityBadgesMode = payload.visualDropMode || getVisualDropMode();

    const patchedIcon = ensureCommunityBadgesIcon(row, appid, payload);
    const patchedStatus = ensureCommunityBadgesStatus(row, payload);
    const patchedAction = ensureCommunityBadgesAction(row, payload, appid);
    const patchedCopy = patchCommunityBadgesProgressCopy(row, payload);

    const signature = [
      appid,
      payload.visualDropMode || "",
      payload.targetOwned || 0,
      payload.cardCount || 0,
      !!payload.complete,
      level,
      craft.maxLevel || 0,
      craft.canCraft ? 1 : 0,
      patchedIcon ? 1 : 0,
      patchedStatus ? 1 : 0,
      patchedAction ? 1 : 0,
    ].join(":");
    if (!STATE.loggedCommunityBadges.has(signature)) {
      STATE.loggedCommunityBadges.add(signature);
      log("applied Steam Community badges overview visual", {
        appid,
        mode: payload.visualDropMode,
        targetOwned: payload.targetOwned,
        cardCount: payload.cardCount,
        complete: !!payload.complete,
        craftLevel: level,
        craftMaxLevel: craft.maxLevel || 0,
        craftReady: !!craft.canCraft,
        reason: reason || "patch",
      });
    }

    return patchedIcon || patchedStatus || patchedAction || patchedCopy > 0;
  }

  function ensureCommunityBadgesBadgeText(row, payload) {
    if (!row || !payload || !row.classList.contains("ltch-community-badges-local-row")) return false;
    const craft = payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    const badge = payload.badge && typeof payload.badge === "object" ? payload.badge : {};
    const nextBadge = craft.nextBadge && typeof craft.nextBadge === "object" ? craft.nextBadge : {};
    const level = Math.max(0, readNumber(craft.level || badge.level));
    const badgeName = String((level > 0 ? badge.name : (badge.name || nextBadge.name)) || "Insignia").trim();
    const xp = Math.max(100, readNumber((level > 0 ? badge.xp : (nextBadge.xp || badge.xp)) || 100));
    const achievedAt = level > 0 ? formatCommunityBadgeAchievedAt(craft.craftedAt || badge.craftedAt) : "";

    const title = row.querySelector(".badge_info_title");
    const unlocked = row.querySelector(".badge_info_unlocked");
    setTextIfChanged(title, badgeName);
    setTextIfChanged(unlocked, level > 0
      ? `Nivel ${level}, ${xp} XP${achievedAt ? `\n${achievedAt}` : ""}`
      : `${xp} XP`);
    return true;
  }

  function ensureCommunityBadgesCardStrip(row, payload) {
    if (!row || !payload || !row.classList.contains("ltch-community-badges-local-row")) return false;
    const strip = row.querySelector(".ltch-community-badges-card-strip");
    if (!strip) return false;

    const cards = Array.isArray(payload.cards) ? payload.cards.slice(0, 5) : [];
    const craft = payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    const badge = payload.badge && typeof payload.badge === "object" ? payload.badge : {};
    const craftedLevel = Math.max(0, readNumber(craft.level || badge.level));
    const owned = new Set(
      Array.isArray(payload.ownedIndexes)
        ? payload.ownedIndexes.map((index) => Number(index))
        : [],
    );

    while (strip.children.length > cards.length) strip.lastChild.remove();
    cards.forEach((card, index) => {
      let tile = strip.children[index];
      if (!tile) {
        tile = document.createElement("div");
        tile.className = "badge_progress_card ltch-community-badges-card";
        const img = document.createElement("img");
        img.setAttribute("alt", "");
        tile.appendChild(img);
        strip.appendChild(tile);
      }

      const img = tile.querySelector("img");
      const imageURL = String((card && card.imageURL) || "").trim();
      const isOwned = craftedLevel > 0 || owned.has(index);
      tile.classList.toggle("ltch-unowned", !isOwned);
      tile.classList.toggle("unowned", !isOwned);
      tile.classList.toggle("owned", isOwned);
      tile.setAttribute("title", String((card && (card.title || card.name)) || ""));
      if (img && imageURL && img.getAttribute("src") !== imageURL) img.setAttribute("src", imageURL);
    });
    return cards.length > 0;
  }

  function ensureCommunityBadgesProgress(row, payload) {
    if (!row || !payload || !row.classList.contains("ltch-community-badges-local-row")) return false;
    const progress = row.querySelector(".ltch-community-badges-progress");
    if (!progress) return false;
    const craft = payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    const level = Math.max(0, readNumber(craft.level));
    const maxLevel = Math.max(1, readNumber(craft.maxLevel || 5));
    const cardCount = Math.max(0, readNumber(payload.cardCount));
    const targetOwned = Math.max(0, Math.min(cardCount, readNumber(payload.targetOwned)));

    if (payload.complete && craft.canCraft && level < maxLevel) {
      setTextIfChanged(progress, "");
      progress.style.display = "none";
      return true;
    }

    progress.style.display = "";
    if (level >= maxLevel) {
      setTextIfChanged(progress, `Nivel maximo\n${level} de ${maxLevel}`);
      return true;
    }
    setTextIfChanged(progress, `${targetOwned} de ${cardCount} cartas\ncoletadas`);
    return true;
  }

  function communityBadgesPayloadIsRelevant(payload) {
    if (!payload || !payload.active || !payload.cardCount) return false;
    const craft = payload.craft && typeof payload.craft === "object" ? payload.craft : {};
    const badge = payload.badge && typeof payload.badge === "object" ? payload.badge : {};
    const level = Math.max(0, readNumber(craft.level || badge.level));
    const targetOwned = Math.max(0, readNumber(payload.targetOwned));
    return level > 0 || targetOwned > 0 || !!payload.complete;
  }

  function communityBadgesLocalHost() {
    return document.querySelector(".badges_sheet") ||
      document.querySelector(".profile_badges") ||
      document.querySelector(".profile_content_inner") ||
      document.querySelector(".responsive_page_template_content") ||
      document.body;
  }

  function ensureCommunityBadgesLocalSection() {
    if (!document.body) return null;
    let section = document.getElementById("ltch-community-badges-local-section");
    if (section) return section;

    const host = communityBadgesLocalHost();
    if (!host) return null;
    section = document.createElement("div");
    section.id = "ltch-community-badges-local-section";
    section.className = "ltch-community-badges-local-section";

    const firstRow = host.querySelector(".badge_row");
    if (firstRow && firstRow.parentElement) firstRow.parentElement.insertBefore(section, firstRow);
    else host.appendChild(section);
    return section;
  }

  function createCommunityBadgesLocalRow(section, appid) {
    const row = document.createElement("div");
    row.className = "badge_row is_link ltch-community-badges-local-row";
    row.dataset.ltchLocalBadgesAppid = String(appid);

    const overlay = document.createElement("a");
    overlay.className = "badge_row_overlay";
    overlay.setAttribute("href", communityGamecardsUrl(appid));
    overlay.setAttribute("aria-label", "Abrir cartas");
    row.appendChild(overlay);

    const inner = document.createElement("div");
    inner.className = "badge_row_inner";
    row.appendChild(inner);

    const titleRow = document.createElement("div");
    titleRow.className = "badge_title_row";
    inner.appendChild(titleRow);

    const stats = document.createElement("div");
    stats.className = "badge_title_stats";
    titleRow.appendChild(stats);

    const steamIcon = document.createElement("a");
    steamIcon.className = "ltch-community-badges-steam-icon";
    steamIcon.setAttribute("href", communityGamecardsUrl(appid));
    steamIcon.setAttribute("title", "Cartas Colecionaveis Steam");
    steamIcon.setAttribute("aria-label", "Cartas Colecionaveis Steam");
    const steamIconImage = document.createElement("img");
    steamIconImage.setAttribute("alt", "");
    steamIconImage.setAttribute("src", STEAM_CARD_BADGE_ICON_URL);
    steamIcon.appendChild(steamIconImage);
    titleRow.appendChild(steamIcon);

    const statsContent = document.createElement("div");
    statsContent.className = "badge_title_stats_content";
    stats.appendChild(statsContent);

    const playtime = document.createElement("div");
    playtime.className = "badge_title_stats_playtime";
    playtime.textContent = "\u00a0";
    statsContent.appendChild(playtime);

    const drops = document.createElement("div");
    drops.className = "badge_title_stats_drops";
    const dropsDone = document.createElement("span");
    dropsDone.textContent = "Jogo não dará mais cartas";
    const dropsHelp = document.createElement("span");
    dropsHelp.textContent = "Como eu consigo cartas?";
    drops.appendChild(dropsDone);
    drops.appendChild(document.createTextNode("\u00a0\u00a0"));
    drops.appendChild(dropsHelp);
    statsContent.appendChild(drops);

    const title = document.createElement("div");
    title.className = "badge_title";
    titleRow.appendChild(title);

    const titleRule = document.createElement("div");
    titleRule.className = "badge_title_rule";
    inner.appendChild(titleRule);

    const content = document.createElement("div");
    content.className = "badge_content";
    inner.appendChild(content);

    const current = document.createElement("div");
    current.className = "badge_current";
    content.appendChild(current);

    const info = document.createElement("div");
    info.className = "badge_info";
    current.appendChild(info);

    const icon = document.createElement("div");
    icon.className = "badge_info_image badge_empty ltch-community-badges-icon";
    info.appendChild(icon);

    const description = document.createElement("div");
    description.className = "badge_info_description";
    info.appendChild(description);

    const badgeTitle = document.createElement("div");
    badgeTitle.className = "badge_info_title";
    description.appendChild(badgeTitle);

    const unlocked = document.createElement("div");
    unlocked.className = "badge_info_unlocked";
    description.appendChild(unlocked);

    const progress = document.createElement("div");
    progress.className = "badge_progress_info ltch-community-badges-progress";
    content.appendChild(progress);

    const strip = document.createElement("div");
    strip.className = "badge_progress_cards ltch-community-badges-card-strip";
    content.appendChild(strip);

    const clear = document.createElement("div");
    clear.className = "ltch-community-badges-clear";
    clear.style.clear = "both";
    content.appendChild(clear);

    row.addEventListener("click", (event) => {
      if (event.target && event.target.closest && event.target.closest("a,button")) return;
      window.location.href = communityGamecardsUrl(appid);
    });

    section.appendChild(row);
    return row;
  }

  function renderCommunityBadgesLocalRow(section, appid, payload, reason) {
    if (!section || !communityBadgesPayloadIsRelevant(payload)) return false;
    let row = section.querySelector(`[data-ltch-local-badges-appid="${appid}"]`);
    if (!row) row = createCommunityBadgesLocalRow(section, appid);

    const title = row.querySelector(".badge_title");
    setTextIfChanged(title, String((payload && payload.name) || "").trim() || appName(appid));
    const patchedMain = applyCommunityBadgesRowVisual(row, appid, payload, reason || "local-row");
    const patchedBadgeText = ensureCommunityBadgesBadgeText(row, payload);
    const patchedCards = ensureCommunityBadgesCardStrip(row, payload);
    const patchedProgress = ensureCommunityBadgesProgress(row, payload);
    return patchedMain || patchedBadgeText || patchedCards || patchedProgress;
  }

  function communityBadgesCandidateAppIds(existingAppIds) {
    const ids = new Set();
    STATE.cardApps.forEach((appid) => {
      appid = toAppId(appid);
      if (!appid || !isLuaApp(appid)) return;
      if (existingAppIds && existingAppIds.has(appid)) return;
      ids.add(appid);
    });
    STATE.badgeAppsWithCards.forEach((appid) => {
      appid = toAppId(appid);
      if (!appid || !isLuaApp(appid)) return;
      if (existingAppIds && existingAppIds.has(appid)) return;
      ids.add(appid);
    });
    return Array.from(ids).slice(0, 120);
  }

  function compareCommunityBadgesPayloads(a, b) {
    const craftA = a && a.craft && typeof a.craft === "object" ? a.craft : {};
    const craftB = b && b.craft && typeof b.craft === "object" ? b.craft : {};
    const levelDelta = readNumber(craftB.level) - readNumber(craftA.level);
    if (levelDelta) return levelDelta;
    const readyDelta = (b && b.complete ? 1 : 0) - (a && a.complete ? 1 : 0);
    if (readyDelta) return readyDelta;
    const ownedDelta = readNumber(b && b.targetOwned) - readNumber(a && a.targetOwned);
    if (ownedDelta) return ownedDelta;
    return appName(a && a.appid).localeCompare(appName(b && b.appid));
  }

  function patchCommunityBadgesLocalRows(existingAppIds, reason, force) {
    const appids = communityBadgesCandidateAppIds(existingAppIds);
    if (!appids.length) return Promise.resolve(false);

    return fetchCommunityVisualBatch(appids, !!force).then((payloads) => {
      const relevant = payloads.filter(communityBadgesPayloadIsRelevant).sort(compareCommunityBadgesPayloads);
      const section = relevant.length ? ensureCommunityBadgesLocalSection() : document.getElementById("ltch-community-badges-local-section");
      if (!section) return false;

      const seen = new Set();
      let patched = 0;
      relevant.slice(0, 60).forEach((payload) => {
        const appid = toAppId(payload && payload.appid);
        if (!appid) return;
        seen.add(String(appid));
        if (renderCommunityBadgesLocalRow(section, appid, payload, reason || "local-row")) patched += 1;
      });

      Array.from(section.querySelectorAll("[data-ltch-local-badges-appid]")).forEach((row) => {
        if (!seen.has(row.getAttribute("data-ltch-local-badges-appid"))) row.remove();
      });
      if (!section.children.length) section.remove();

      const scanKey = `local:${relevant.length}:${patched}:${reason || "patch"}`;
      if (!STATE.loggedCommunityBadges.has(scanKey)) {
        STATE.loggedCommunityBadges.add(scanKey);
        log("applied local Steam Community badges rows", {
          candidates: appids.length,
          relevant: relevant.length,
          patched,
          reason: reason || "patch",
        });
      }
      return patched > 0;
    });
  }

  function scheduleCommunityBadgesPatch(reason, force) {
    if (!isCommunityBadgesPage()) return;
    if (STATE.communityBadgesTimer) return;
    STATE.communityBadgesTimer = window.setTimeout(() => {
      STATE.communityBadgesTimer = 0;
      patchCommunityBadgesPage(reason || "scheduled", !!force);
    }, 80);
  }

  function patchCommunityBadgesPage(reason, force) {
    if (!isCommunityBadgesPage()) return Promise.resolve(false);
    ensureCommunityGamecardsStyles();
    return loadSettings(false)
      .then(() => fetchCommunityVisualBatch([], !!force))
      .then(() => {
        const foundRows = findCommunityBadgesRows();
        const officialRows = foundRows.filter(({ row }) => !row.closest("#ltch-community-badges-local-section"));
        const existingAppIds = new Set(officialRows.map(({ appid }) => appid).filter(Boolean));
        const rows = officialRows.filter(({ appid }) => isLuaApp(appid)).slice(0, 120);
        const requestedAppids = Array.from(new Set([
          ...rows.map(({ appid }) => appid),
          ...communityBadgesCandidateAppIds(existingAppIds),
        ])).slice(0, 160);
        const scanKey = `scan:${foundRows.length}:${rows.length}:${reason || "patch"}`;
        if (!STATE.loggedCommunityBadges.has(scanKey)) {
          STATE.loggedCommunityBadges.add(scanKey);
          log("scanned Steam Community badges overview", {
            officialRows: foundRows.length,
            steamRows: officialRows.length,
            luaOfficialRows: rows.length,
            localCandidates: communityBadgesCandidateAppIds(existingAppIds).length,
            reason: reason || "patch",
          });
        }

        return fetchCommunityVisualBatch(requestedAppids, !!force).then(() => {
          const officialPatch = Promise.all(rows.map(({ row, appid }) => {
            const cached = cachedCommunityVisualData(appid);
            if (cached) return Promise.resolve(applyCommunityBadgesRowVisual(row, appid, cached, reason));
            return fetchCommunityVisualData(appid, !!force)
              .then((payload) => applyCommunityBadgesRowVisual(row, appid, payload, reason))
              .catch((err) => {
                warn("Steam Community badges overview row patch failed", {
                  appid,
                  reason,
                  error: err && err.message ? err.message : String(err),
                });
                return false;
              });
          })).then((results) => results.some(Boolean));

          return Promise.all([
            officialPatch,
            patchCommunityBadgesLocalRows(existingAppIds, reason, false),
          ]).then((results) => results.some(Boolean));
        });
      })
      .catch((err) => {
        warn("Steam Community badges overview visual patch failed", {
          reason,
          error: err && err.message ? err.message : String(err),
        });
        return false;
      });
  }

  function refreshCommunityBadgesVisual(reason) {
    STATE.communityVisualBatchPromises.clear();
    STATE.communityVisualBatchLoaded.clear();
    STATE.loggedCommunityBadges.clear();
    scheduleCommunityBadgesPatch(reason || "refresh", true);
  }

  function startCommunityBadgesWatcher() {
    if (!isCommunityBadgesPage()) return;
    ensureCommunityGamecardsStyles();
    loadSettings(false)
      .then(() => fetchCommunityVisualBatch([], false))
      .then((items) => {
        scheduleCommunityBadgesPatch("initial", false);
        if (!items || !items.length) {
          loadManifest(false).then(() => scheduleCommunityBadgesPatch("manifest-ready", false));
        }
      });

    const attachObserver = () => {
      if (!document.body) {
        window.setTimeout(attachObserver, 500);
        return;
      }
      if (STATE.communityBadgesObserver) return;
      STATE.communityBadgesObserver = new MutationObserver(() => scheduleCommunityBadgesPatch("dom-change", false));
      STATE.communityBadgesObserver.observe(document.body, { childList: true, subtree: true });
    };
    attachObserver();
  }

  function shouldPrimeApp(appid) {
    return isLuaApp(appid) || hasManifestCards(appid) || hasBadgeCards(appid);
  }

  function readBadgeData(store, appid) {
    try {
      if (store && store.m_mapBadgeData && typeof store.m_mapBadgeData.get === "function") {
        return store.m_mapBadgeData.get(Number(appid));
      }
    } catch (_) {}
    return null;
  }

  function rememberBadgeData(appid, data, source) {
    appid = toAppId(appid);
    if (!appid || !data) return;

    applyLocalVisualDrops(appid, data, source);
    const cards = Array.isArray(data.rgCards) ? data.rgCards : [];
    const key = `${appid}:${cards.length}:${source}`;
    if (cards.length > 0) {
      saveVisualSnapshotFromBadgeData(appid, data, source);
      STATE.badgeAppsWithCards.add(appid);
      STATE.badgeAppsWithoutCards.delete(appid);
      if (!STATE.loggedBadgeData.has(key)) {
        STATE.loggedBadgeData.add(key);
        log("official badge data has cards", {
          appid,
          name: appName(appid),
          cards: cards.length,
          source,
          level: Object.prototype.hasOwnProperty.call(data, REAL_BADGE_LEVEL_MARKER) ? data[REAL_BADGE_LEVEL_MARKER] : (data.nLevel || 0),
          xp: Object.prototype.hasOwnProperty.call(data, REAL_BADGE_XP_MARKER) ? data[REAL_BADGE_XP_MARKER] : (data.nXP || 0),
          visualLevel: data.nLevel || 0,
          visualBadge: !!data[LOCAL_VISUAL_BADGE_MARKER],
        });
      }
      return;
    }

    if (data.strName || data.nLevel !== undefined || data.nXP !== undefined) {
      STATE.badgeAppsWithoutCards.add(appid);
      if (!STATE.loggedBadgeData.has(key)) {
        STATE.loggedBadgeData.add(key);
        log("official badge data loaded without card list", {
          appid,
          name: appName(appid),
          source,
          hasName: !!data.strName,
        });
      }
    }
  }

  function scheduleFetchBadgeData(appid, reason) {
    appid = toAppId(appid);
    if (!appid) return null;

    const modules = getNativeModules();
    const store = modules && modules.badgeStore;
    if (!store || typeof store.FetchBadgeData !== "function") return null;

    const now = Date.now();
    const last = STATE.lastFetchAt.get(appid) || 0;
    if (now - last < FETCH_COOLDOWN_MS) return STATE.fetchInFlight.get(appid) || null;
    if (STATE.fetchInFlight.has(appid)) return STATE.fetchInFlight.get(appid);

    STATE.lastFetchAt.set(appid, now);
    const request = Promise.resolve()
      .then(() => store.FetchBadgeData(appid))
      .then((result) => {
        rememberBadgeData(appid, readBadgeData(store, appid), `FetchBadgeData:${reason || "prime"}`);
        return result;
      })
      .catch((err) => {
        warn("official badge fetch failed", { appid, reason, error: err && err.message ? err.message : String(err) });
        return null;
      })
      .finally(() => {
        STATE.fetchInFlight.delete(appid);
      });
    STATE.fetchInFlight.set(appid, request);
    log("primed official badge data", { appid, name: appName(appid), reason: reason || "prime" });
    return request;
  }

  function primeCommunityDefinitions(appid, reason) {
    appid = toAppId(appid);
    if (!appid) return;
    const modules = getNativeModules();
    const store = modules && modules.badgeStore;
    try {
      if (store && typeof store.GetCommunityItemDefinitions === "function") {
        store.GetCommunityItemDefinitions(appid);
      }
    } catch (err) {
      warn("community item definition prime failed", { appid, reason, error: err && err.message ? err.message : String(err) });
    }
  }

  function primeApp(appid, reason) {
    appid = toAppId(appid);
    if (!appid || !shouldPrimeApp(appid)) return;
    const modules = getNativeModules();
    const store = modules && modules.badgeStore;
    if (!store) return;

    try {
      if (typeof store.GetBadgeData === "function") {
        const data = store.GetBadgeData(appid);
        rememberBadgeData(appid, data, `GetBadgeData:${reason || "prime"}`);
      } else {
        rememberBadgeData(appid, readBadgeData(store, appid), `read:${reason || "prime"}`);
      }
    } catch (err) {
      warn("badge store prime failed", { appid, reason, error: err && err.message ? err.message : String(err) });
    }

    scheduleFetchBadgeData(appid, reason);
    primeCommunityDefinitions(appid, reason);
  }

  function patchBadgeStore() {
    const modules = getNativeModules();
    const store = modules && modules.badgeStore;
    if (!store) return false;
    if (store.__LuaToolsCardBridgePatched) {
      STATE.patchedBadgeStore = true;
      return true;
    }

    try {
      Object.defineProperty(store, "__LuaToolsCardBridgePatched", {
        value: true,
        enumerable: false,
        configurable: false,
        writable: false,
      });
    } catch (_) {
      store.__LuaToolsCardBridgePatched = true;
    }

    if (typeof store.GetBadgeData === "function") {
      const originalGetBadgeData = store.GetBadgeData;
      Object.defineProperty(store, "__LuaToolsCardBridgeOriginalGetBadgeData", {
        value: originalGetBadgeData,
        enumerable: false,
        configurable: true,
      });
      store.GetBadgeData = function luaToolsCardBridgeGetBadgeData(appid, ...args) {
        let data = originalGetBadgeData.call(this, appid, ...args);
        const appidInt = toAppId(appid);
        if (appidInt && shouldPrimeApp(appidInt)) {
          const hasCards = data && Array.isArray(data.rgCards) && data.rgCards.length > 0;
          if (!hasCards) {
            const cached = cachedCommunityVisualData(appidInt);
            if (cached && cached.active) {
              data = installLocalBadgeDataFromPayload(this, appidInt, cached, "GetBadgeData:visual-cache") || data;
            } else {
              ensureLocalBadgeData(this, appidInt, "GetBadgeData:visual-cache", false).then((synthetic) => {
                if (synthetic) refreshNativeBadgeView(appidInt);
              });
            }
          } else {
            syncCommunityVisualBadgeData(this, appidInt, data, "GetBadgeData");
          }
          rememberBadgeData(appidInt, data, "GetBadgeData");
        }
        return data;
      };
    }

    if (typeof store.FetchBadgeData === "function") {
      const originalFetchBadgeData = store.FetchBadgeData;
      Object.defineProperty(store, "__LuaToolsCardBridgeOriginalFetchBadgeData", {
        value: originalFetchBadgeData,
        enumerable: false,
        configurable: true,
      });
      store.FetchBadgeData = async function luaToolsCardBridgeFetchBadgeData(appid, ...args) {
        let result = null;
        let fetchError = null;
        try {
          result = await originalFetchBadgeData.call(this, appid, ...args);
        } catch (err) {
          fetchError = err;
        }
        const appidInt = toAppId(appid);
        if (appidInt && shouldPrimeApp(appidInt)) {
          await fetchCommunityVisualData(appidInt, false);
          let data = readBadgeData(this, appidInt);
          const hasCards = data && Array.isArray(data.rgCards) && data.rgCards.length > 0;
          if (!hasCards) {
            data = await ensureLocalBadgeData(this, appidInt, "FetchBadgeData:visual-cache", !!fetchError);
          }
          rememberBadgeData(appidInt, data, "FetchBadgeData");
          if (fetchError && data) {
            warn("official badge fetch failed; using local visual badge data", {
              appid: appidInt,
              error: fetchError && fetchError.message ? fetchError.message : String(fetchError),
            });
            return data;
          }
        }
        if (fetchError) throw fetchError;
        return result;
      };
    }

    if (typeof store.InvalidateBadgeData === "function") {
      const originalInvalidateBadgeData = store.InvalidateBadgeData;
      Object.defineProperty(store, "__LuaToolsCardBridgeOriginalInvalidateBadgeData", {
        value: originalInvalidateBadgeData,
        enumerable: false,
        configurable: true,
      });
      store.InvalidateBadgeData = function luaToolsCardBridgeInvalidateBadgeData(appid, ...args) {
        const result = originalInvalidateBadgeData.call(this, appid, ...args);
        const appidInt = toAppId(appid);
        if (appidInt && shouldPrimeApp(appidInt)) {
          window.setTimeout(() => scheduleFetchBadgeData(appidInt, "invalidate"), 100);
        }
        return result;
      };
    }

    STATE.patchedBadgeStore = true;
    log("patched official BadgeStore locally");
    return true;
  }

  function patchAppDetailsSections() {
    const modules = getNativeModules();
    const sectionModule = modules && modules.sectionModule;
    const proto = sectionModule && sectionModule.N_ && sectionModule.N_.prototype;
    if (!proto || typeof proto.GetSections !== "function") return false;
    if (proto.__LuaToolsCardBridgeOriginalGetSections) {
      STATE.patchedSections = true;
      return true;
    }

    const original = proto.GetSections;
    Object.defineProperty(proto, "__LuaToolsCardBridgeOriginalGetSections", {
      value: original,
      enumerable: false,
      configurable: false,
      writable: false,
    });

    proto.GetSections = function luaToolsCardBridgeGetSections(overview, details) {
      const sections = original.call(this, overview, details);
      const appid = getOverviewAppId(overview, details);
      if (!appid) return sections;

      if (shouldPrimeApp(appid)) {
        trackNativeBadgeApp(appid);
        primeApp(appid, "app-details");
      }

      const before = sectionArray(sections);
      const alreadyHasCards = before.includes("cards") || hasSection(sections, "cards");
      const shouldAddCards = !alreadyHasCards && (hasManifestCards(appid) || hasBadgeCards(appid));
      if (shouldAddCards && addSection(sections, "cards")) {
        log("enabled native cards section for Lua game", {
          appid,
          name: appName(appid),
          reason: hasBadgeCards(appid) ? "badge-data" : "store-category",
          before,
          after: sectionArray(sections),
        });
      }

      const sectionKey = `${appid}:${alreadyHasCards}:${shouldAddCards}`;
      if (isLuaApp(appid) && !STATE.loggedSections.has(sectionKey)) {
        STATE.loggedSections.add(sectionKey);
        log("observed Lua game sections", {
          appid,
          name: appName(appid),
          hasCardsSection: alreadyHasCards || shouldAddCards,
          manifestHasCards: hasManifestCards(appid),
          badgeHasCards: hasBadgeCards(appid),
          sections: before,
        });
      }

      return sections;
    };

    STATE.patchedSections = true;
    log("patched Steam AppDetails GetSections for local cards bridge");
    return true;
  }

  function primeKnownCardApps() {
    if (!STATE.cardApps.size) return;
    let delay = 0;
    Array.from(STATE.cardApps).slice(0, 80).forEach((appid) => {
      window.setTimeout(() => primeApp(appid, "manifest"), delay);
      delay += 180;
    });
  }

  function refreshVisualDrops(reason) {
    const modules = getNativeModules();
    const store = modules && modules.badgeStore;
    const appids = new Set([...STATE.cardApps, ...STATE.badgeAppsWithCards]);
    let refreshed = 0;

    STATE.loggedVisualDrops.clear();
    STATE.loggedVisualBadges.clear();
    appids.forEach((appid) => {
      const data = readBadgeData(store, appid);
      if (data) {
        rememberBadgeData(appid, data, reason || "refresh");
        refreshed += 1;
      }
      window.setTimeout(() => primeApp(appid, reason || "refresh"), 50);
    });

    try {
      window.dispatchEvent(new Event("resize"));
    } catch (_) {}

    log("refreshed local visual card drops", {
      reason: reason || "refresh",
      visualDropMode: getVisualDropMode(),
      apps: appids.size,
      refreshed,
    });
  }

  function startManifestLoad() {
    if (STATE.manifest || STATE.manifestPromise) return;
    loadSettings(false)
      .then(() => loadManifest(false))
      .then(primeKnownCardApps);
  }

  function ensureSettingsStyles() {
    if (document.getElementById("ltch-settings-style")) return;
    const style = document.createElement("style");
    style.id = "ltch-settings-style";
    style.textContent = `
      .ltch-settings-entry{cursor:pointer!important;pointer-events:auto!important;color:#dfe3e6!important;opacity:1!important;box-shadow:inset 2px 0 0 rgba(102,192,244,.45)!important}
      .ltch-settings-entry:hover{background:rgba(102,192,244,.12)!important;color:#fff!important}
      .ltch-settings-overlay{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.48)}
      .ltch-settings-dialog{width:min(420px,calc(100vw - 32px));background:#111820;color:#dfe3e6;border:1px solid #32465a;border-radius:6px;box-shadow:0 24px 70px rgba(0,0,0,.58);font-family:Motiva Sans,Arial,sans-serif}
      .ltch-settings-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 12px;border-bottom:1px solid rgba(255,255,255,.08)}
      .ltch-settings-title{font-size:18px;font-weight:700;color:#fff}
      .ltch-settings-close{width:32px;height:32px;border:0;border-radius:4px;background:#202b38;color:#c7d5e0;font-size:18px;cursor:pointer}
      .ltch-settings-close:hover{background:#2e3b4b;color:#fff}
      .ltch-settings-body{padding:18px 20px 20px}
      .ltch-settings-label{font-size:12px;letter-spacing:0;text-transform:uppercase;color:#8fa6bb;margin-bottom:10px;font-weight:700}
      .ltch-mode-switch{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .ltch-mode-switch button{min-height:40px;border:1px solid #3a4d63;border-radius:4px;background:#202b38;color:#dfe3e6;font-size:14px;cursor:pointer}
      .ltch-mode-switch button:hover{border-color:#66c0f4;color:#fff}
      .ltch-mode-switch button.ltch-selected{background:#214b6b;border-color:#66c0f4;color:#fff}
      .ltch-settings-caption{margin-top:12px;color:#9fb2c3;font-size:13px;line-height:1.35}
      .ltch-settings-status{min-height:18px;margin-top:12px;color:#66c0f4;font-size:12px}
    `;
    document.head.appendChild(style);
  }

  function removeSettingsOverlay() {
    const overlay = document.querySelector(".ltch-settings-overlay");
    if (overlay) overlay.remove();
  }

  function openSettingsOverlay() {
    ensureSettingsStyles();
    loadSettings(true).then(() => {
      removeSettingsOverlay();
      const overlay = document.createElement("div");
      overlay.className = "ltch-settings-overlay";

      const dialog = document.createElement("div");
      dialog.className = "ltch-settings-dialog";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-label", "Lua Games Card Bridge");
      overlay.appendChild(dialog);

      const head = document.createElement("div");
      head.className = "ltch-settings-head";
      dialog.appendChild(head);

      const title = document.createElement("div");
      title.className = "ltch-settings-title";
      title.textContent = "Lua Games Card Bridge";
      head.appendChild(title);

      const close = document.createElement("button");
      close.className = "ltch-settings-close";
      close.type = "button";
      close.title = "Fechar";
      close.textContent = "x";
      head.appendChild(close);

      const body = document.createElement("div");
      body.className = "ltch-settings-body";
      dialog.appendChild(body);

      const label = document.createElement("div");
      label.className = "ltch-settings-label";
      label.textContent = "Drops visuais";
      body.appendChild(label);

      const switcher = document.createElement("div");
      switcher.className = "ltch-mode-switch";
      switcher.setAttribute("role", "group");
      body.appendChild(switcher);

      const halfButton = document.createElement("button");
      halfButton.type = "button";
      halfButton.dataset.mode = VISUAL_DROP_MODE_HALF;
      halfButton.textContent = "Metade";
      switcher.appendChild(halfButton);

      const allButton = document.createElement("button");
      allButton.type = "button";
      allButton.dataset.mode = VISUAL_DROP_MODE_ALL;
      allButton.textContent = "Todas";
      switcher.appendChild(allButton);

      const caption = document.createElement("div");
      caption.className = "ltch-settings-caption";
      caption.textContent = "Metade segue o limite normal da Steam. Todas deixa o set inteiro aparecer conforme o tempo jogado.";
      body.appendChild(caption);

      const status = document.createElement("div");
      status.className = "ltch-settings-status";
      body.appendChild(status);

      const buttons = Array.from(overlay.querySelectorAll("[data-mode]"));
      const render = () => {
        const mode = getVisualDropMode();
        buttons.forEach((button) => {
          button.classList.toggle("ltch-selected", button.getAttribute("data-mode") === mode);
        });
      };

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const mode = normalizeVisualDropMode(button.getAttribute("data-mode"));
          if (mode === getVisualDropMode()) return;
          status.textContent = "Salvando...";
          saveSettings({ visualDropMode: mode }).then((result) => {
            render();
            status.textContent = result.success ? "Salvo." : "Salvo localmente.";
          });
        });
      });

      close.addEventListener("click", removeSettingsOverlay);
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) removeSettingsOverlay();
      });
      window.addEventListener("keydown", function onKeydown(event) {
        if (event.key === "Escape") {
          window.removeEventListener("keydown", onKeydown);
          removeSettingsOverlay();
        }
      });

      document.body.appendChild(overlay);
      render();
    });
  }

  function visibleText(node) {
    return String((node && (node.innerText || node.textContent)) || "").replace(/\s+/g, " ").trim();
  }

  function librarySettingsOpen() {
    const text = visibleText(document.body);
    return text.includes("Library Settings") && text.includes("PLUGIN SETTINGS");
  }

  function findSettingsRow(element) {
    let row = element;
    for (let i = 0; i < 4 && row && row.parentElement; i += 1) {
      const parent = row.parentElement;
      const parentText = visibleText(parent);
      const rect = parent.getBoundingClientRect ? parent.getBoundingClientRect() : { width: 0, height: 0 };
      if (parentText === "Lua Games Card Bridge" && rect.width >= 160 && rect.height >= 24 && rect.height <= 70) {
        row = parent;
      } else {
        break;
      }
    }
    return row;
  }

  function bindSettingsRows() {
    if (!document.body || !librarySettingsOpen()) return;
    ensureSettingsStyles();
    const nodes = Array.from(document.querySelectorAll("div,button,span"));
    nodes.forEach((node) => {
      if (node.closest(".ltch-settings-overlay")) return;
      const nodeText = visibleText(node);
      if (nodeText !== "Lua Games Card Bridge") return;
      const row = findSettingsRow(node);
      if (!row || row.dataset.ltchSettingsBound === "1") return;
      row.dataset.ltchSettingsBound = "1";
      row.classList.add("ltch-settings-entry");
      if ("disabled" in row) {
        try {
          row.disabled = false;
        } catch (_) {}
      }
      row.removeAttribute("disabled");
      row.setAttribute("aria-disabled", "false");
      row.setAttribute("role", "button");
      row.setAttribute("tabindex", "0");
      row.setAttribute("title", "Configurar drops visuais");
      row.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openSettingsOverlay();
      });
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openSettingsOverlay();
        }
      });
      log("bound Library Settings row");
    });
  }

  function scheduleSettingsScan() {
    if (STATE.settingsScanTimer) return;
    STATE.settingsScanTimer = window.setTimeout(() => {
      STATE.settingsScanTimer = 0;
      bindSettingsRows();
    }, 250);
  }

  function startSettingsWatcher() {
    if (!document.body) {
      window.setTimeout(startSettingsWatcher, 500);
      return;
    }
    ensureSettingsStyles();
    bindSettingsRows();
    if (STATE.settingsObserver) return;
    STATE.settingsObserver = new MutationObserver(scheduleSettingsScan);
    STATE.settingsObserver.observe(document.body, { childList: true, subtree: true });
  }

  function startPatchLoop() {
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      patchBadgeStore();
      patchAppDetailsSections();
      if (STATE.patchedBadgeStore && STATE.patchedSections) {
        startManifestLoad();
      }
      if ((STATE.patchedBadgeStore && STATE.patchedSections) || tries > SECTION_MAX_TRIES) {
        window.clearInterval(timer);
        if (!STATE.patchedBadgeStore) warn("gave up patching BadgeStore after retries", { tries });
        if (!STATE.patchedSections) warn("gave up patching GetSections after retries", { tries });
      }
    }, SECTION_RETRY_MS);
  }

  log("bridge loaded", {
    mode: "local-steamui-store-bridge",
    note: "no diagnostic panel, no inventory mutation, official BadgeStore only",
  });
  installSettingsEventBridge();
  loadSettings(false);
  startCommunityGamecardsWatcher();
  startCommunityBadgesWatcher();
  startPatchLoop();
})();
