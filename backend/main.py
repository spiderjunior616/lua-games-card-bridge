import json
import os
import re
import shutil
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache
from typing import Any, Dict, Iterable, List, Optional, Tuple

try:
    import Millennium  # type: ignore
except Exception:  # Allows local diagnostics outside Steam.
    Millennium = None  # type: ignore


PLUGIN_NAME = "luatools-card-helper"
WEBKIT_DIR_NAME = "LuaToolsCardHelper"
WEB_UI_JS_FILE = "luatools-card-helper.js"

MAX_TEXT_FILE_BYTES = 20 * 1024 * 1024
HTTP_TIMEOUT_SECONDS = 8
STORE_CACHE_SECONDS = 6 * 60 * 60
LOCAL_DROP_INTERVAL_MINUTES = 30
MAX_VISUAL_CARDS = 100
MAX_VISUAL_BADGE_LEVELS = 100
MAX_VISUAL_REWARDS = 100
MAX_VISUAL_TEXT_LENGTH = 240

STORE_CACHE: Dict[int, Dict[str, Any]] = {}
STORE_CACHE_AT = 0
SETTINGS_FILE_NAME = "luatools-card-helper-settings.json"
CRAFT_STATE_FILE_NAME = "luatools-card-helper-craft-state.json"
VISUAL_CACHE_FILE_NAME = "luatools-card-helper-visual-cache.json"
VISUAL_DROP_MODE_HALF = "steam_half"
VISUAL_DROP_MODE_ALL = "all"
DEFAULT_SETTINGS: Dict[str, Any] = {
    "visualDropMode": VISUAL_DROP_MODE_HALF,
}


class Plugin:
    def _front_end_loaded(self):
        _copy_webkit_files()

    def _load(self):
        _log("backend loading")
        _copy_webkit_files()
        _inject_webkit_files()
        if Millennium:
            Millennium.ready()

    def _unload(self):
        _log("backend unloaded")


plugin = Plugin()


def _log(message: str) -> None:
    try:
        print(f"[Lua Games Card Bridge] {message}")
    except Exception:
        pass


def _steam_path() -> str:
    if Millennium:
        try:
            path = Millennium.steam_path() or ""
            if path:
                return os.path.abspath(path)
        except Exception:
            pass

    candidates = [
        os.environ.get("STEAM_PATH", ""),
        r"C:\Program Files (x86)\Steam",
        r"C:\Program Files\Steam",
    ]
    for path in candidates:
        if path and os.path.isdir(path):
            return os.path.abspath(path)
    return ""


def _plugin_dir() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), ".."))


def _settings_path() -> str:
    steam = _steam_path()
    if steam:
        return os.path.join(steam, "config", SETTINGS_FILE_NAME)
    return os.path.join(_plugin_dir(), SETTINGS_FILE_NAME)


def _craft_state_path() -> str:
    steam = _steam_path()
    if steam:
        return os.path.join(steam, "config", CRAFT_STATE_FILE_NAME)
    return os.path.join(_plugin_dir(), CRAFT_STATE_FILE_NAME)


def _visual_cache_path() -> str:
    steam = _steam_path()
    if steam:
        return os.path.join(steam, "config", VISUAL_CACHE_FILE_NAME)
    return os.path.join(_plugin_dir(), VISUAL_CACHE_FILE_NAME)


def _source_public_path(filename: str) -> str:
    steam = _steam_path()
    candidates = [
        os.path.join(_plugin_dir(), "public", filename),
        os.path.join(steam, "plugins", PLUGIN_NAME, "public", filename),
        os.path.join(steam, "millennium", "plugins", PLUGIN_NAME, "public", filename),
    ]
    for path in candidates:
        if path and os.path.exists(path):
            return path
    return candidates[0]


def _steam_ui_path() -> str:
    return os.path.join(_steam_path(), "steamui", WEBKIT_DIR_NAME)


def _copy_webkit_files() -> None:
    try:
        os.makedirs(_steam_ui_path(), exist_ok=True)
        src = _source_public_path(WEB_UI_JS_FILE)
        dst = os.path.join(_steam_ui_path(), WEB_UI_JS_FILE)
        shutil.copy(src, dst)
        _log("copied web UI into SteamUI bridge directory")
    except Exception as exc:
        _log(f"failed to copy web UI: {type(exc).__name__}")


def _inject_webkit_files() -> None:
    if not Millennium:
        return
    try:
        js_path = f"{WEBKIT_DIR_NAME}/{WEB_UI_JS_FILE}"
        Millennium.add_browser_js(js_path)
        _log(f"injected web UI: {js_path}")
    except Exception as exc:
        _log(f"failed to inject web UI: {exc}")


def _safe_int(value: Any, default: int = 0, minimum: int = 0, maximum: int = 2_147_483_647) -> int:
    try:
        parsed = int(value)
    except Exception:
        return default
    return max(minimum, min(maximum, parsed))


def _safe_text(value: Any, maximum: int = MAX_VISUAL_TEXT_LENGTH) -> str:
    text = str(value or "").strip()
    return text[: max(1, maximum)]


def _parse_appids_arg(value: Any, maximum: int = 160) -> List[int]:
    raw_items: List[Any] = []
    if isinstance(value, (list, tuple, set)):
        raw_items = list(value)
    elif isinstance(value, str):
        text = value.strip()
        if text:
            try:
                parsed = json.loads(text)
                if isinstance(parsed, (list, tuple)):
                    raw_items = list(parsed)
                else:
                    raw_items = re.split(r"[\s,;]+", text)
            except Exception:
                raw_items = re.split(r"[\s,;]+", text)

    out: List[int] = []
    for item in raw_items:
        appid = _safe_int(item, 0, 1)
        if appid and appid not in out:
            out.append(appid)
        if len(out) >= maximum:
            break
    return out


def _file_signature(path: str) -> Tuple[int, int]:
    try:
        stat = os.stat(path)
        return int(stat.st_mtime_ns), int(stat.st_size)
    except Exception:
        return 0, -1


@lru_cache(maxsize=512)
def _read_text_file_cached(path: str, mtime_ns: int, size: int) -> str:
    if size < 0 or size > MAX_TEXT_FILE_BYTES:
        return ""
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as handle:
            return handle.read()
    except Exception:
        return ""


def _read_text_file(path: str) -> str:
    return _read_text_file_cached(path, *_file_signature(path))


def _normalize_visual_drop_mode(value: Any) -> str:
    normalized = str(value or "").strip().lower()
    if normalized in (VISUAL_DROP_MODE_ALL, "all_cards", "full", "todas"):
        return VISUAL_DROP_MODE_ALL
    return VISUAL_DROP_MODE_HALF


def _normalize_settings(value: Any) -> Dict[str, Any]:
    data = value if isinstance(value, dict) else {}
    settings = dict(DEFAULT_SETTINGS)
    settings["visualDropMode"] = _normalize_visual_drop_mode(data.get("visualDropMode"))
    return settings


def _load_settings() -> Dict[str, Any]:
    path = _settings_path()
    try:
        with open(path, "r", encoding="utf-8") as handle:
            raw = json.load(handle)
    except Exception:
        raw = {}
    return _normalize_settings(raw)


def _save_settings(settings: Dict[str, Any]) -> Dict[str, Any]:
    normalized = _normalize_settings(settings)
    path = _settings_path()
    directory = os.path.dirname(path)
    tmp_path = f"{path}.tmp"
    try:
        os.makedirs(directory, exist_ok=True)
        with open(tmp_path, "w", encoding="utf-8") as handle:
            json.dump(normalized, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        os.replace(tmp_path, path)
    except Exception as exc:
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass
        raise exc
    return normalized


def _load_craft_state() -> Dict[str, Any]:
    path = _craft_state_path()
    try:
        with open(path, "r", encoding="utf-8") as handle:
            raw = json.load(handle)
    except Exception:
        raw = {}
    if not isinstance(raw, dict):
        raw = {}
    apps = raw.get("apps", {})
    if not isinstance(apps, dict):
        apps = {}
    return {"version": 1, "apps": apps}


def _save_craft_state(state: Dict[str, Any]) -> Dict[str, Any]:
    normalized = {
        "version": 1,
        "apps": state.get("apps", {}) if isinstance(state.get("apps"), dict) else {},
    }
    path = _craft_state_path()
    directory = os.path.dirname(path)
    tmp_path = f"{path}.tmp"
    try:
        os.makedirs(directory, exist_ok=True)
        with open(tmp_path, "w", encoding="utf-8") as handle:
            json.dump(normalized, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        os.replace(tmp_path, path)
    except Exception as exc:
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass
        raise exc
    return normalized


def _load_visual_cache() -> Dict[str, Any]:
    path = _visual_cache_path()
    try:
        with open(path, "r", encoding="utf-8") as handle:
            raw = json.load(handle)
    except Exception:
        raw = {}
    if not isinstance(raw, dict):
        raw = {}
    apps = raw.get("apps", {})
    if not isinstance(apps, dict):
        apps = {}
    return {"version": 1, "apps": apps}


def _save_visual_cache(cache: Dict[str, Any]) -> Dict[str, Any]:
    normalized = {
        "version": 1,
        "apps": cache.get("apps", {}) if isinstance(cache.get("apps"), dict) else {},
    }
    path = _visual_cache_path()
    directory = os.path.dirname(path)
    tmp_path = f"{path}.tmp"
    try:
        os.makedirs(directory, exist_ok=True)
        with open(tmp_path, "w", encoding="utf-8") as handle:
            json.dump(normalized, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        os.replace(tmp_path, path)
    except Exception as exc:
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass
        raise exc
    return normalized


def _unescape_vdf_token(value: str) -> str:
    return value.replace(r"\"", '"').replace(r"\\", "\\")


def _parse_vdf_simple(content: str) -> Dict[str, Any]:
    result: Dict[str, Any] = {}
    stack: List[Dict[str, Any]] = [result]
    current_key: Optional[str] = None

    tokens: List[str] = []
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("//"):
            continue
        tokens.extend(re.findall(r'"(?:\\.|[^"])*"|\{|\}', line))

    for raw_token in tokens:
        if raw_token == "{":
            if current_key:
                child: Dict[str, Any] = {}
                stack[-1][current_key] = child
                stack.append(child)
                current_key = None
            continue

        if raw_token == "}":
            if len(stack) > 1:
                stack.pop()
            current_key = None
            continue

        token = _unescape_vdf_token(raw_token[1:-1]) if raw_token.startswith('"') else raw_token
        if current_key is None:
            current_key = token
        else:
            stack[-1][current_key] = token
            current_key = None

    return result


def _read_vdf(path: str) -> Dict[str, Any]:
    content = _read_text_file(path)
    return _parse_vdf_simple(content) if content else {}


def _stplug_dir() -> str:
    return os.path.join(_steam_path(), "config", "stplug-in")


def _parse_lua_addappids(content: str) -> List[int]:
    appids: List[int] = []
    for match in re.finditer(r"(?m)^\s*addappid\s*\(\s*(\d+)", content):
        appid = _safe_int(match.group(1), 0, 1)
        if appid and appid not in appids:
            appids.append(appid)
    return appids


def _stplug_apps() -> Dict[int, Dict[str, Any]]:
    out: Dict[int, Dict[str, Any]] = {}
    stplug_dir = _stplug_dir()
    if not os.path.isdir(stplug_dir):
        return out

    try:
        names = os.listdir(stplug_dir)
    except Exception:
        return out

    for filename in names:
        match = re.match(r"^(\d+)\.lua(?:\.disabled)?$", filename)
        if not match:
            continue

        appid = int(match.group(1))
        path = os.path.join(stplug_dir, filename)
        content = _read_text_file(path)
        addappids = _parse_lua_addappids(content)
        mtime = 0
        try:
            mtime = int(os.path.getmtime(path))
        except Exception:
            pass

        out[appid] = {
            "appid": appid,
            "name": "",
            "enabled": not filename.endswith(".disabled"),
            "path": path,
            "mtime": mtime,
            "addappids": addappids[:32],
            "addappidCount": len(addappids),
            "hasSelfAdd": appid in addappids,
        }
    return out


def _loaded_app_paths() -> List[str]:
    steam = _steam_path()
    return [
        os.path.join(steam, "plugins", "luatools", "backend", "loadedappids.txt"),
        os.path.join(steam, "plugins", "ltsteamplugin", "backend", "loadedappids.txt"),
        os.path.join(steam, "millennium", "plugins", "luatools", "backend", "loadedappids.txt"),
        os.path.join(steam, "millennium", "plugins", "ltsteamplugin", "backend", "loadedappids.txt"),
    ]


def _parse_loaded_apps() -> Dict[int, str]:
    out: Dict[int, str] = {}
    for path in _loaded_app_paths():
        content = _read_text_file(path)
        if not content:
            continue
        for line in content.splitlines():
            if ":" not in line:
                continue
            appid_raw, name = line.split(":", 1)
            appid = _safe_int(appid_raw.strip(), 0, 1)
            if appid and name.strip():
                out[appid] = name.strip()
    return out


def _app_name_files() -> List[str]:
    steam = _steam_path()
    return [
        os.path.join(steam, "plugins", "luatools", "backend", "temp_dl", "games.json"),
        os.path.join(steam, "millennium", "plugins", "ltsteamplugin", "backend", "temp_dl", "games.json"),
        os.path.join(steam, "plugins", "luatools", "backend", "temp_dl", "all-appids.json"),
        os.path.join(steam, "millennium", "plugins", "ltsteamplugin", "backend", "temp_dl", "all-appids.json"),
    ]


def _names_from_json_file(path: str, wanted: Iterable[int]) -> Dict[int, str]:
    wanted_set = set(wanted)
    if not wanted_set or not os.path.exists(path):
        return {}

    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as handle:
            data = json.load(handle)
    except Exception:
        return {}

    out: Dict[int, str] = {}
    if isinstance(data, dict):
        for appid, value in data.items():
            appid_int = _safe_int(appid, 0, 1)
            if appid_int not in wanted_set:
                continue
            name = value.get("name") if isinstance(value, dict) else ""
            if isinstance(name, str) and name.strip():
                out[appid_int] = name.strip()
    elif isinstance(data, list):
        for row in data:
            if not isinstance(row, dict):
                continue
            appid_int = _safe_int(row.get("appid"), 0, 1)
            if appid_int not in wanted_set:
                continue
            name = row.get("name")
            if isinstance(name, str) and name.strip():
                out[appid_int] = name.strip()
    return out


def _resolve_app_names(apps: Dict[int, Dict[str, Any]]) -> None:
    loaded_names = _parse_loaded_apps()
    for appid, name in loaded_names.items():
        if appid in apps and name:
            apps[appid]["name"] = name

    missing = {appid for appid, app in apps.items() if not app.get("name")}
    for path in _app_name_files():
        if not missing:
            break
        names = _names_from_json_file(path, missing)
        for appid, name in names.items():
            apps[appid]["name"] = name
            missing.discard(appid)

    for appid in missing:
        apps[appid]["name"] = f"App {appid}"


def _library_paths() -> List[str]:
    steam = _steam_path()
    paths = [steam] if steam else []
    data = _read_vdf(os.path.join(steam, "steamapps", "libraryfolders.vdf"))
    folders = data.get("libraryfolders", {})
    if isinstance(folders, dict):
        for value in folders.values():
            if not isinstance(value, dict):
                continue
            path = value.get("path", "")
            if isinstance(path, str) and path and os.path.isdir(path):
                paths.append(os.path.abspath(path))

    ordered: List[str] = []
    for path in paths:
        path = os.path.abspath(path)
        if path not in ordered:
            ordered.append(path)
    return ordered


def _find_appmanifest(appid: int) -> Dict[str, Any]:
    for library in _library_paths():
        manifest_path = os.path.join(library, "steamapps", f"appmanifest_{appid}.acf")
        if not os.path.exists(manifest_path):
            continue
        data = _read_vdf(manifest_path)
        app_state = data.get("AppState", {}) if isinstance(data, dict) else {}
        if not isinstance(app_state, dict):
            app_state = {}
        return {
            "exists": True,
            "path": manifest_path,
            "library": library,
            "name": str(app_state.get("name", "") or ""),
            "installdir": str(app_state.get("installdir", "") or ""),
            "stateFlags": str(app_state.get("StateFlags", "") or ""),
        }
    return {"exists": False, "path": "", "library": "", "name": "", "installdir": "", "stateFlags": ""}


def _is_luatools_appid(appid: int) -> bool:
    if appid <= 0:
        return False
    try:
        if appid in _stplug_apps():
            return True
    except Exception:
        pass
    try:
        if appid in _parse_loaded_apps():
            return True
    except Exception:
        pass
    return False


def _userdata_dirs() -> List[str]:
    steam = _steam_path()
    root = os.path.join(steam, "userdata")
    if not steam or not os.path.isdir(root):
        return []
    out: List[str] = []
    try:
        for name in os.listdir(root):
            path = os.path.join(root, name)
            if os.path.isdir(path):
                out.append(path)
    except Exception:
        return []
    return out


def _localconfig_apps() -> List[Dict[str, Any]]:
    configs: List[Dict[str, Any]] = []
    for user_dir in _userdata_dirs():
        path = os.path.join(user_dir, "config", "localconfig.vdf")
        data = _read_vdf(path)
        store = data.get("UserLocalConfigStore", {}) if isinstance(data, dict) else {}
        software = store.get("Software", {}) if isinstance(store, dict) else {}
        valve = software.get("Valve", {}) if isinstance(software, dict) else {}
        steam = valve.get("Steam", {}) if isinstance(valve, dict) else {}
        apps = steam.get("Apps", {}) if isinstance(steam, dict) else {}
        if isinstance(apps, dict):
            configs.append(apps)
    return configs


def _local_playtime_minutes_from_configs(appid: int, configs: List[Dict[str, Any]]) -> int:
    best = 0
    for apps in configs:
        app = apps.get(str(appid), {})
        if not isinstance(app, dict):
            continue
        best = max(
            best,
            _safe_int(app.get("Playtime"), 0, 0),
            _safe_int(app.get("Playtime2wks"), 0, 0),
        )
    return best


def _local_playtime_minutes(appid: int) -> int:
    return _local_playtime_minutes_from_configs(appid, _localconfig_apps())


def _librarycache_paths(appid: int) -> List[str]:
    paths: List[str] = []
    for user_dir in _userdata_dirs():
        path = os.path.join(user_dir, "config", "librarycache", f"{appid}.json")
        if os.path.exists(path):
            paths.append(path)
    paths.sort(key=lambda item: _file_signature(item), reverse=True)
    return paths


def _read_librarycache_entries(path: str) -> Dict[str, Any]:
    try:
        raw = json.loads(_read_text_file(path))
    except Exception:
        return {}

    entries: Dict[str, Any] = {}
    if isinstance(raw, list):
        for entry in raw:
            if not isinstance(entry, list) or len(entry) < 2:
                continue
            key = str(entry[0] or "")
            wrapper = entry[1]
            data = wrapper.get("data") if isinstance(wrapper, dict) else wrapper
            if key:
                entries[key] = data
    elif isinstance(raw, dict):
        for key, wrapper in raw.items():
            data = wrapper.get("data") if isinstance(wrapper, dict) else wrapper
            entries[str(key)] = data
    return entries


def _is_allowed_steam_image_url(raw: str) -> bool:
    try:
        parsed = urllib.parse.urlparse(raw)
        host = (parsed.hostname or "").lower()
        scheme = (parsed.scheme or "").lower()
    except Exception:
        return False

    if scheme not in ("http", "https") or not host:
        return False
    allowed_domains = ("steamstatic.com", "steamcommunity.com", "steampowered.com")
    return any(host == domain or host.endswith(f".{domain}") for domain in allowed_domains)


def _normalize_community_image_url(value: Any, appid: int) -> str:
    raw = str(value or "").strip().replace(r"\/", "/")
    if not raw:
        return ""
    if len(raw) > 2048:
        return ""
    if re.search(rf"/steamcommunity/public/images/items/{appid}/?$", raw, re.IGNORECASE):
        return ""
    if re.match(r"^https?://", raw, re.IGNORECASE):
        return raw if _is_allowed_steam_image_url(raw) else ""
    if raw.startswith("//"):
        url = f"https:{raw}"
        return url if _is_allowed_steam_image_url(url) else ""
    if re.match(r"^steamcommunity/public/images/items/", raw, re.IGNORECASE):
        return f"https://cdn.fastly.steamstatic.com/{raw}"
    if re.match(r"^/steamcommunity/public/images/items/", raw, re.IGNORECASE):
        return f"https://cdn.fastly.steamstatic.com{raw}"
    if re.match(r"^[a-f0-9]{40}\.(png|jpg|jpeg|webp)$", raw, re.IGNORECASE):
        return f"https://cdn.fastly.steamstatic.com/steamcommunity/public/images/items/{appid}/{raw}"
    if re.match(r"^[A-Za-z0-9_-]{20,}$", raw):
        return f"https://community.cloudflare.steamstatic.com/economy/image/{raw}"
    return ""


def _image_url_from_item(item: Dict[str, Any], appid: int) -> str:
    for field in (
        "strIconURL",
        "strImgURL",
        "strArtworkURL",
        "item_image_composed",
        "item_image_large",
        "item_image_small",
        "icon_url_large",
        "icon_url",
        "image_url_large",
        "image_url",
        "image",
    ):
        url = _normalize_community_image_url(item.get(field), appid)
        if url:
            return url
    return ""


def _parse_key_values(value: Any) -> Dict[str, Any]:
    if isinstance(value, dict):
        return value
    if not value:
        return {}
    try:
        parsed = json.loads(str(value))
        return parsed if isinstance(parsed, dict) else {}
    except Exception:
        return {}


def _badge_icon_from_community_items(appid: int, definitions: Any, badge: Dict[str, Any]) -> str:
    if not isinstance(definitions, list):
        return ""

    candidates: List[Tuple[int, str]] = []
    for definition in definitions:
        if not isinstance(definition, dict):
            continue

        key_values = _parse_key_values(definition.get("item_key_values"))
        level_images = key_values.get("level_images", {}) if isinstance(key_values, dict) else {}
        icon = ""
        if isinstance(level_images, dict):
            icon = _normalize_community_image_url(level_images.get("1") or level_images.get(1), appid)
        if not icon:
            icon = _image_url_from_item(definition, appid)
        if not icon:
            continue

        score = 0
        if _safe_int(definition.get("item_class"), 0, 0) == 1 or _safe_int(definition.get("item_type"), 0, 0) == 1:
            score += 100
        name_blob = " ".join(
            str(definition.get(field) or "")
            for field in ("item_name", "item_title", "name", "title", "item_internal_name")
        ).lower()
        expected = str(badge.get("strName") or badge.get("strNextLevelName") or "").lower()
        if expected and expected in name_blob:
            score += 20
        if score > 0:
            candidates.append((score, icon))

    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates[0][1] if candidates else ""


def _badge_definition_from_community_items(definitions: Any, badge: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(definitions, list):
        return {}

    candidates: List[Tuple[int, Dict[str, Any]]] = []
    expected = str(badge.get("strName") or badge.get("strNextLevelName") or "").lower()
    for definition in definitions:
        if not isinstance(definition, dict):
            continue
        score = 0
        if _safe_int(definition.get("item_class"), 0, 0) == 1 or _safe_int(definition.get("item_type"), 0, 0) == 1:
            score += 100
        name_blob = " ".join(
            str(definition.get(field) or "")
            for field in ("item_name", "item_title", "name", "title", "item_internal_name")
        ).lower()
        if expected and expected in name_blob:
            score += 20
        key_values = _parse_key_values(definition.get("item_key_values"))
        if isinstance(key_values.get("level_images"), dict):
            score += 30
        if score > 0:
            candidates.append((score, definition))

    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates[0][1] if candidates else {}


def _localized_level_name(value: Any, fallback: str = "") -> str:
    if isinstance(value, dict):
        for language in ("brazilian", "portuguese", "english"):
            text = str(value.get(language) or "").strip()
            if text:
                return text
        for item in value.values():
            text = str(item or "").strip()
            if text:
                return text
        return fallback
    text = str(value or "").strip()
    return text or fallback


def _badge_levels_from_community_items(appid: int, definitions: Any, badge: Dict[str, Any]) -> List[Dict[str, Any]]:
    definition = _badge_definition_from_community_items(definitions, badge)
    key_values = _parse_key_values(definition.get("item_key_values") if definition else None)
    level_images = key_values.get("level_images", {}) if isinstance(key_values, dict) else {}
    level_names = key_values.get("level_names", {}) if isinstance(key_values, dict) else {}
    if not isinstance(level_images, dict):
        level_images = {}
    if not isinstance(level_names, dict):
        level_names = {}

    numeric_levels = []
    for key in set(list(level_images.keys()) + list(level_names.keys())):
        try:
            level = int(key)
        except Exception:
            continue
        if level > 0:
            numeric_levels.append(level)

    max_level = max(
        max(numeric_levels or [0]),
        _safe_int(badge.get("nMaxLevel"), 0, 0),
        _safe_int(badge.get("nLevel"), 0, 0),
    )
    if max_level <= 0:
        max_level = 5
    max_level = min(max_level, 100)

    levels: List[Dict[str, Any]] = []
    for level in range(1, max_level + 1):
        fallback_name = str(
            (badge.get("strName") if level == 1 else "")
            or badge.get("strNextLevelName")
            or definition.get("item_title")
            or definition.get("item_name")
            or f"Level {level}"
        )
        levels.append(
            {
                "level": level,
                "name": _localized_level_name(level_names.get(str(level)) or level_names.get(level), fallback_name),
                "xp": level * 100,
                "iconURL": _normalize_community_image_url(
                    level_images.get(str(level)) or level_images.get(level),
                    appid,
                ),
            }
        )

    return levels


def _badge_level_info(levels: List[Dict[str, Any]], level: int, fallback: Dict[str, Any]) -> Dict[str, Any]:
    level_int = _safe_int(level, 1, 1)
    for item in levels:
        if _safe_int(item.get("level"), 0, 0) == level_int:
            out = dict(item)
            if not out.get("name"):
                out["name"] = fallback.get("name", "")
            if not out.get("iconURL"):
                out["iconURL"] = fallback.get("iconURL", "")
            if not out.get("xp"):
                out["xp"] = level_int * 100
            return out
    return {
        "level": level_int,
        "name": str(fallback.get("name") or f"Level {level_int}"),
        "xp": level_int * 100,
        "iconURL": str(fallback.get("iconURL") or ""),
    }


def _cards_from_badge(appid: int, badge: Dict[str, Any]) -> List[Dict[str, Any]]:
    raw_cards = badge.get("rgCards", [])
    if not isinstance(raw_cards, list):
        return []

    cards: List[Dict[str, Any]] = []
    for index, card in enumerate(raw_cards):
        if not isinstance(card, dict):
            continue
        title = str(card.get("strTitle") or card.get("strName") or f"Card {index + 1}")
        name = str(card.get("strName") or title)
        cards.append(
            {
                "index": index,
                "title": title,
                "name": name,
                "marketHash": str(card.get("strMarketHash") or ""),
                "imageURL": _image_url_from_item(card, appid),
            }
        )
    return cards


def _cards_from_community_items(appid: int, definitions: Any) -> List[Dict[str, Any]]:
    if not isinstance(definitions, list):
        return []

    cards: List[Dict[str, Any]] = []
    for definition in definitions:
        if not isinstance(definition, dict):
            continue
        if _safe_int(definition.get("item_class"), 0, 0) != 2:
            continue
        image_url = _image_url_from_item(definition, appid)
        if not image_url:
            continue
        title = str(definition.get("item_title") or definition.get("item_name") or f"Card {len(cards) + 1}")
        cards.append(
            {
                "index": len(cards),
                "title": title,
                "name": str(definition.get("item_name") or title),
                "marketHash": f"{appid}-{definition.get('item_name') or title}",
                "imageURL": image_url,
            }
        )
    return cards


def _visual_reward_kind(item_class: int) -> str:
    if item_class == 3:
        return "profileBackground"
    if item_class == 4:
        return "emoticon"
    return ""


def _rewards_from_community_items(appid: int, definitions: Any) -> List[Dict[str, Any]]:
    if not isinstance(definitions, list):
        return []

    rewards: List[Dict[str, Any]] = []
    for definition in definitions:
        if not isinstance(definition, dict):
            continue
        item_class = _safe_int(definition.get("item_class"), 0, 0)
        kind = _visual_reward_kind(item_class)
        if not kind:
            continue
        image_url = _image_url_from_item(definition, appid)
        if not image_url:
            continue
        title = str(definition.get("item_title") or definition.get("item_name") or "").strip()
        name = str(definition.get("item_name") or title).strip()
        if not title and not name:
            continue
        rewards.append(
            {
                "kind": kind,
                "itemClass": item_class,
                "itemType": _safe_int(definition.get("item_type"), 0, 0),
                "title": title or name,
                "name": name or title,
                "imageURL": image_url,
            }
        )
    return rewards


def _normalize_visual_cards(appid: int, value: Any) -> List[Dict[str, Any]]:
    if not isinstance(value, list):
        return []
    cards: List[Dict[str, Any]] = []
    seen: set = set()
    for item in value:
        if not isinstance(item, dict):
            continue
        image_url = _normalize_community_image_url(item.get("imageURL") or item.get("strImgURL") or item.get("strIconURL"), appid)
        title = _safe_text(item.get("title") or item.get("strTitle") or item.get("name") or item.get("strName") or "")
        name = _safe_text(item.get("name") or item.get("strName") or title)
        if not title and not name:
            continue
        if not image_url:
            continue
        market_hash = _safe_text(item.get("marketHash") or item.get("strMarketHash") or name or title)
        key = (title or name, image_url)
        if key in seen:
            continue
        seen.add(key)
        cards.append(
            {
                "index": len(cards),
                "title": title or name or f"Card {len(cards) + 1}",
                "name": name or title or f"Card {len(cards) + 1}",
                "marketHash": market_hash,
                "imageURL": image_url,
            }
        )
        if len(cards) >= MAX_VISUAL_CARDS:
            break
    return cards


def _normalize_visual_rewards(appid: int, value: Any) -> List[Dict[str, Any]]:
    if not isinstance(value, list):
        return []
    rewards: List[Dict[str, Any]] = []
    seen: set = set()
    for item in value:
        if not isinstance(item, dict):
            continue
        item_class = _safe_int(item.get("itemClass") or item.get("item_class"), 0, 0)
        kind = str(item.get("kind") or _visual_reward_kind(item_class)).strip()
        if kind not in ("profileBackground", "emoticon"):
            continue
        image_url = _normalize_community_image_url(
            item.get("imageURL") or item.get("strImgURL") or item.get("strIconURL"),
            appid,
        )
        title = _safe_text(item.get("title") or item.get("item_title") or item.get("name") or item.get("item_name") or "")
        name = _safe_text(item.get("name") or item.get("item_name") or title)
        if not image_url or (not title and not name):
            continue
        key = (kind, title or name, image_url)
        if key in seen:
            continue
        seen.add(key)
        rewards.append(
            {
                "kind": kind,
                "itemClass": item_class,
                "itemType": _safe_int(item.get("itemType") or item.get("item_type"), 0, 0),
                "title": title or name,
                "name": name or title,
                "imageURL": image_url,
            }
        )
        if len(rewards) >= MAX_VISUAL_REWARDS:
            break
    return rewards


def _normalize_visual_badge_levels(appid: int, value: Any) -> List[Dict[str, Any]]:
    if not isinstance(value, list):
        return []
    levels: List[Dict[str, Any]] = []
    seen: set = set()
    for item in value:
        if not isinstance(item, dict):
            continue
        level = _safe_int(item.get("level"), 0, 1, 100)
        if not level or level in seen:
            continue
        seen.add(level)
        levels.append(
            {
                "level": level,
                "name": _safe_text(item.get("name") or item.get("strName") or f"Level {level}"),
                "xp": max(_safe_int(item.get("xp") or item.get("nXP"), level * 100, 0), level * 100),
                "iconURL": _normalize_community_image_url(item.get("iconURL") or item.get("strIconURL"), appid),
            }
        )
        if len(levels) >= MAX_VISUAL_BADGE_LEVELS:
            break
    levels.sort(key=lambda item: _safe_int(item.get("level"), 0, 0))
    return levels


def _normalize_visual_badge(appid: int, value: Any, levels: List[Dict[str, Any]]) -> Dict[str, Any]:
    data = value if isinstance(value, dict) else {}
    level_one = _badge_level_info(levels, 1, {}) if levels else {}
    return {
        "name": _safe_text(data.get("name") or data.get("strName") or level_one.get("name") or ""),
        "level": _safe_int(data.get("level") or data.get("nLevel"), 0, 0),
        "xp": max(
            _safe_int(data.get("xp") or data.get("nXP"), 0, 0),
            _safe_int(level_one.get("xp"), 0, 0),
            100,
        ),
        "iconURL": _normalize_community_image_url(data.get("iconURL") or data.get("strIconURL") or level_one.get("iconURL"), appid),
    }


def _save_visual_snapshot(
    appid: int,
    cards: List[Dict[str, Any]],
    badge_levels: List[Dict[str, Any]],
    badge: Dict[str, Any],
    rewards: List[Dict[str, Any]],
    source: str,
) -> bool:
    cards = _normalize_visual_cards(appid, cards)
    badge_levels = _normalize_visual_badge_levels(appid, badge_levels)
    badge = _normalize_visual_badge(appid, badge, badge_levels)
    rewards = _normalize_visual_rewards(appid, rewards)
    if not cards:
        return False

    cache = _load_visual_cache()
    apps = cache.get("apps", {})
    if not isinstance(apps, dict):
        apps = {}
    previous = apps.get(str(appid), {}) if isinstance(apps.get(str(appid)), dict) else {}
    previous_cards = _normalize_visual_cards(appid, previous.get("cards"))
    previous_levels = _normalize_visual_badge_levels(appid, previous.get("badgeLevels"))
    previous_badge = _normalize_visual_badge(appid, previous.get("badge"), previous_levels)
    previous_rewards = _normalize_visual_rewards(appid, previous.get("rewards"))

    if len(previous_cards) > len(cards):
        cards = previous_cards
    if len(previous_levels) > len(badge_levels):
        badge_levels = previous_levels
    if len(previous_rewards) > len(rewards):
        rewards = previous_rewards
    if not badge.get("iconURL") and previous_badge.get("iconURL"):
        badge["iconURL"] = previous_badge["iconURL"]
    if not badge.get("name") and previous_badge.get("name"):
        badge["name"] = previous_badge["name"]

    apps[str(appid)] = {
        "appid": appid,
        "savedAt": int(time.time()),
        "source": source,
        "cards": cards,
        "badge": badge,
        "badgeLevels": badge_levels,
        "rewards": rewards,
    }
    cache["apps"] = apps
    _save_visual_cache(cache)
    return True


def _hash_string(text: str) -> int:
    value = 2166136261
    for char in str(text or ""):
        value ^= ord(char)
        value = (value * 16777619) & 0xFFFFFFFF
    return value


def _community_visual_owned_indexes(appid: int, cards: List[Dict[str, Any]], target_owned: int) -> List[int]:
    ranked: List[Tuple[int, int]] = []
    for index, card in enumerate(cards):
        key = f"{appid}:{card.get('marketHash') or card.get('title') or card.get('name') or index}"
        ranked.append((_hash_string(key), index))
    ranked.sort(key=lambda item: item[0])
    return sorted(index for _, index in ranked[: max(0, min(len(cards), target_owned))])


def _build_visual_candidate(
    appid: int,
    cards: List[Dict[str, Any]],
    badge: Dict[str, Any],
    badge_levels: List[Dict[str, Any]],
    rewards: List[Dict[str, Any]],
    source: str,
    cache_path: str = "",
    settings: Optional[Dict[str, Any]] = None,
    craft_state: Optional[Dict[str, Any]] = None,
    localconfig_apps: Optional[List[Dict[str, Any]]] = None,
    clamp_state: bool = True,
) -> Dict[str, Any]:
    cards = _normalize_visual_cards(appid, cards)
    badge_levels = _normalize_visual_badge_levels(appid, badge_levels)
    base_badge = _normalize_visual_badge(appid, badge, badge_levels)
    rewards = _normalize_visual_rewards(appid, rewards)
    if not cards:
        return {}

    playtime_minutes = _local_playtime_minutes_from_configs(appid, localconfig_apps) if localconfig_apps is not None else _local_playtime_minutes(appid)
    settings_source = settings if isinstance(settings, dict) else _load_settings()
    mode = _normalize_visual_drop_mode(settings_source.get("visualDropMode"))
    max_drops = len(cards) if mode == VISUAL_DROP_MODE_ALL else int((len(cards) + 1) / 2)
    earned_by_time = int(playtime_minutes / LOCAL_DROP_INTERVAL_MINUTES)
    max_level = max([_safe_int(item.get("level"), 0, 0) for item in badge_levels] or [0])
    if not max_level:
        max_level = max(_safe_int(badge.get("nMaxLevel") or badge.get("maxLevel"), 5, 1), 1)
    full_set_minutes = len(cards) * LOCAL_DROP_INTERVAL_MINUTES
    available_craft_level = 0
    if full_set_minutes > 0:
        available_craft_level = min(max_level, int(playtime_minutes / full_set_minutes))

    state = craft_state if isinstance(craft_state, dict) else _load_craft_state()
    apps_state = state.get("apps", {})
    if not isinstance(apps_state, dict):
        apps_state = {}
    app_state = apps_state.get(str(appid), {})
    if not isinstance(app_state, dict):
        app_state = {}
    raw_saved_level = _safe_int(app_state.get("level"), 0, 0, max_level)
    saved_level = min(raw_saved_level, available_craft_level, max_level)
    if raw_saved_level != saved_level and clamp_state:
        if saved_level > 0:
            apps_state[str(appid)] = {
                "level": saved_level,
                "craftedAt": _safe_int(app_state.get("craftedAt"), int(time.time()), 0),
                "clampedAt": int(time.time()),
            }
        else:
            apps_state.pop(str(appid), None)
        state["apps"] = apps_state
        try:
            _save_craft_state(state)
        except Exception as exc:
            _log(f"failed clamping visual craft state for {appid}: {exc}")

    visual_level = min(max(saved_level, 0), max_level)
    crafted_at = _safe_int(app_state.get("craftedAt"), 0, 0) if visual_level > 0 else 0
    spent_by_craft = visual_level * len(cards)
    earned_remaining = max(0, earned_by_time - spent_by_craft)
    target_owned = max(0, min(max_drops, earned_remaining))
    owned_indexes = _community_visual_owned_indexes(appid, cards, target_owned)
    complete = bool(cards) and target_owned >= len(cards)
    preview_level = 1 if complete else _safe_int(badge.get("nLevel") or badge.get("level"), 0, 0, max_level)
    display_level = visual_level if visual_level > 0 else preview_level
    visual_badge = _badge_level_info(badge_levels, max(display_level, 1), base_badge)
    visual_badge["crafted"] = visual_level > 0
    visual_badge["preview"] = visual_level <= 0 and complete
    if display_level <= 0:
        visual_badge = dict(base_badge)
        visual_badge["crafted"] = False
        visual_badge["preview"] = False
    next_level = min(visual_level + 1, max_level)
    next_badge = _badge_level_info(badge_levels, next_level, base_badge)
    minutes_until_next_level = 0
    if visual_level < max_level and full_set_minutes > 0:
        minutes_until_next_level = max(0, (visual_level + 1) * full_set_minutes - playtime_minutes)

    return {
        "appid": appid,
        "active": True,
        "source": source,
        "visualDropMode": mode,
        "playtimeMinutes": playtime_minutes,
        "intervalMinutes": LOCAL_DROP_INTERVAL_MINUTES,
        "earnedByTime": earned_by_time,
        "earnedRemaining": earned_remaining,
        "spentByCraft": spent_by_craft,
        "cardCount": len(cards),
        "targetOwned": target_owned,
        "ownedIndexes": owned_indexes,
        "complete": complete,
        "badge": visual_badge,
        "badgeLevels": badge_levels,
        "rewards": rewards,
        "craft": {
            "level": visual_level,
            "maxLevel": max_level,
            "availableByPlaytime": available_craft_level,
            "fullSetMinutes": full_set_minutes,
            "minutesUntilNextLevel": minutes_until_next_level,
            "craftedAt": crafted_at,
            "canCraft": complete and visual_level < max_level and visual_level < available_craft_level,
            "nextLevel": next_level,
            "nextBadge": next_badge,
        },
        "cards": cards,
    }


def _build_community_visual_data(
    appid: int,
    settings: Optional[Dict[str, Any]] = None,
    craft_state: Optional[Dict[str, Any]] = None,
    visual_cache: Optional[Dict[str, Any]] = None,
    localconfig_apps: Optional[List[Dict[str, Any]]] = None,
    save_snapshot: bool = True,
    clamp_state: bool = True,
) -> Dict[str, Any]:
    best: Dict[str, Any] = {}
    for path in _librarycache_paths(appid):
        entries = _read_librarycache_entries(path)
        badge = entries.get("badge", {})
        if not isinstance(badge, dict):
            badge = {}
        definitions = entries.get("community_items", [])
        cards = _cards_from_badge(appid, badge) or _cards_from_community_items(appid, definitions)
        if not cards:
            continue

        icon_url = _normalize_community_image_url(badge.get("strIconURL"), appid)
        if not icon_url:
            icon_url = _badge_icon_from_community_items(appid, definitions, badge)
        base_badge = {
            "name": str(badge.get("strName") or badge.get("strNextLevelName") or ""),
            "level": _safe_int(badge.get("nLevel"), 0, 0),
            "xp": max(
                _safe_int(badge.get("nXP"), 0, 0),
                _safe_int(badge.get("nNextLevelXP"), 0, 0),
                100,
            ),
            "iconURL": icon_url,
            "nMaxLevel": _safe_int(badge.get("nMaxLevel"), 5, 1),
        }
        badge_levels = _badge_levels_from_community_items(appid, definitions, badge)
        rewards = _rewards_from_community_items(appid, definitions)
        candidate = _build_visual_candidate(
            appid,
            cards,
            base_badge,
            badge_levels,
            rewards,
            "local-librarycache",
            path,
            settings=settings,
            craft_state=craft_state,
            localconfig_apps=localconfig_apps,
            clamp_state=clamp_state,
        )
        if not candidate:
            continue
        if save_snapshot:
            try:
                _save_visual_snapshot(appid, cards, badge_levels, base_badge, rewards, "local-librarycache")
            except Exception as exc:
                _log(f"failed saving visual snapshot for {appid}: {exc}")

        if not best or candidate["cardCount"] > best.get("cardCount", 0) or candidate["complete"]:
            best = candidate
        if candidate["complete"] and icon_url:
            break

    if best:
        return best

    cache = visual_cache if isinstance(visual_cache, dict) else _load_visual_cache()
    apps = cache.get("apps", {}) if isinstance(cache.get("apps"), dict) else {}
    entry = apps.get(str(appid), {}) if isinstance(apps.get(str(appid)), dict) else {}
    cards = _normalize_visual_cards(appid, entry.get("cards"))
    badge_levels = _normalize_visual_badge_levels(appid, entry.get("badgeLevels"))
    badge = _normalize_visual_badge(appid, entry.get("badge"), badge_levels)
    rewards = _normalize_visual_rewards(appid, entry.get("rewards"))
    candidate = _build_visual_candidate(
        appid,
        cards,
        badge,
        badge_levels,
        rewards,
        "visual-cache",
        _visual_cache_path(),
        settings=settings,
        craft_state=craft_state,
        localconfig_apps=localconfig_apps,
        clamp_state=clamp_state,
    )
    if candidate:
        return candidate

    return {
        "appid": appid,
        "active": False,
        "source": "local-librarycache",
        "reason": "no local badge/card cache",
    }


def _request_json(url: str, timeout: int = HTTP_TIMEOUT_SECONDS) -> Dict[str, Any]:
    req = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json,text/plain,*/*",
            "User-Agent": "Mozilla/5.0 Steam Lua Games Card Bridge",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        raw = response.read(4 * 1024 * 1024)
    return json.loads(raw.decode("utf-8", errors="replace"))


def _fetch_store_details_for_chunk(appids: List[int]) -> Dict[int, Dict[str, Any]]:
    if not appids:
        return {}
    query = urllib.parse.urlencode(
        {
            "appids": ",".join(str(appid) for appid in appids),
            "filters": "basic,categories",
            "format": "json",
        }
    )
    url = f"https://store.steampowered.com/api/appdetails?{query}"
    data = _request_json(url)
    out: Dict[int, Dict[str, Any]] = {}
    for key, value in data.items():
        appid = _safe_int(key, 0, 1)
        if not appid or not isinstance(value, dict):
            continue
        entry = value.get("data", {}) if value.get("success") else {}
        if not isinstance(entry, dict):
            entry = {}
        categories = entry.get("categories", [])
        if not isinstance(categories, list):
            categories = []
        category_ids = []
        for category in categories:
            if isinstance(category, dict):
                category_ids.append(_safe_int(category.get("id"), 0, 0))
        out[appid] = {
            "storeSuccess": bool(value.get("success")),
            "storeName": str(entry.get("name", "") or ""),
            "hasTradingCards": 29 in category_ids,
            "categoryIds": [category_id for category_id in category_ids if category_id],
        }
    return out


def _fetch_store_details(appids: List[int], refresh: bool = False) -> Dict[int, Dict[str, Any]]:
    global STORE_CACHE_AT
    now = int(time.time())
    if refresh or now - STORE_CACHE_AT > STORE_CACHE_SECONDS:
        STORE_CACHE.clear()
        STORE_CACHE_AT = now

    missing = [appid for appid in appids if appid not in STORE_CACHE]
    with ThreadPoolExecutor(max_workers=12) as pool:
        futures = {pool.submit(_fetch_store_details_for_chunk, [appid]): appid for appid in missing}
        for future in as_completed(futures):
            appid = futures[future]
            try:
                STORE_CACHE.update(future.result())
            except Exception as exc:
                _log(f"store lookup failed for {appid}: {exc}")
                STORE_CACHE.setdefault(
                    appid,
                    {
                        "storeSuccess": False,
                        "storeName": "",
                        "hasTradingCards": False,
                        "categoryIds": [],
                        "error": str(exc),
                    },
                )

    return {appid: STORE_CACHE.get(appid, {}) for appid in appids}


def _parse_log_timestamp(value: str) -> int:
    try:
        return int(time.mktime(time.strptime(value, "%Y-%m-%d %H:%M:%S")))
    except Exception:
        return 0


def _gameprocess_log_path() -> str:
    return os.path.join(_steam_path(), "logs", "gameprocess_log.txt")


def _tracked_process_kind(command: str) -> str:
    lowered = command.lower()
    if "steamachievementmanager" in lowered or "sam.game.exe" in lowered:
        return "external-tool"
    if "\\steamapps\\common\\" in lowered or "/steamapps/common/" in lowered:
        return "steam-library"
    return "tracked"


def _read_gameprocess_states(appids: Iterable[int]) -> Dict[int, Dict[str, Any]]:
    wanted = set(appids)
    if not wanted:
        return {}

    content = _read_text_file(_gameprocess_log_path())
    if not content:
        return {}

    states: Dict[int, Dict[str, Any]] = {}
    for line in content.splitlines():
        stamp_match = re.match(r"^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]\s+(.*)$", line)
        if not stamp_match:
            continue

        at = _parse_log_timestamp(stamp_match.group(1))
        message = stamp_match.group(2)

        add_match = re.search(r"\bAppID\s+(\d+)\s+adding PID\s+(\d+)\s+as a tracked process", message)
        if add_match:
            appid = _safe_int(add_match.group(1), 0, 1)
            if appid in wanted:
                process_command = ""
                command_match = re.search(r"\bas a tracked process\s+(.+)$", message)
                if command_match:
                    process_command = command_match.group(1).strip()
                states[appid] = {
                    "seen": True,
                    "lastAt": at,
                    "lastStatus": "started",
                    "lastPid": _safe_int(add_match.group(2), 0),
                    "trackingKind": _tracked_process_kind(process_command),
                }
            continue

        stop_match = re.search(r"\bAppID\s+(\d+)\s+no longer tracking PID\s+(\d+)", message)
        if stop_match:
            appid = _safe_int(stop_match.group(1), 0, 1)
            if appid in wanted:
                previous = states.get(appid, {})
                states[appid] = {
                    "seen": True,
                    "lastAt": at,
                    "lastStatus": "stopped",
                    "lastPid": _safe_int(stop_match.group(2), 0),
                    "trackingKind": previous.get("trackingKind", "tracked"),
                }
            continue

        remove_match = re.search(r"\bRemove\s+(\d+)\s+from running list", message)
        if remove_match:
            appid = _safe_int(remove_match.group(1), 0, 1)
            if appid in wanted:
                previous = states.get(appid, {})
                states[appid] = {
                    "seen": True,
                    "lastAt": at,
                    "lastStatus": "stopped",
                    "lastPid": previous.get("lastPid", 0),
                    "trackingKind": previous.get("trackingKind", "tracked"),
                }

    return states


def _diagnose_app(app: Dict[str, Any]) -> None:
    notes: List[str] = []
    severity = "ok"

    if not app.get("enabled"):
        severity = "bad"
        notes.append("Lua desativado")
    if not app.get("hasSelfAdd"):
        severity = "warn" if severity == "ok" else severity
        notes.append("Arquivo Lua nao chama addappid para o AppID base")
    if not app.get("manifest", {}).get("exists"):
        severity = "warn" if severity == "ok" else severity
        notes.append("Sem appmanifest oficial em uma biblioteca Steam")
    if not app.get("store", {}).get("storeSuccess"):
        severity = "warn" if severity == "ok" else severity
        notes.append("Store API nao respondeu para este AppID")
    elif not app.get("store", {}).get("hasTradingCards"):
        severity = "info" if severity == "ok" else severity
        notes.append("A Store nao lista Steam Trading Cards")

    tracking = app.get("steamTracking", {})
    if app.get("store", {}).get("hasTradingCards") and not tracking.get("seen"):
        severity = "warn" if severity == "ok" else severity
        notes.append("Logs nao mostram a Steam rastreando este AppID como jogo rodando")
    elif tracking.get("trackingKind") == "external-tool":
        severity = "warn" if severity == "ok" else severity
        notes.append("Ultimo rastreio veio de ferramenta externa, nao do executavel do jogo")

    if not notes:
        notes.append("Fluxo local parece coerente; drops ainda dependem da conta, drops restantes e backend da Steam")

    app["severity"] = severity
    app["notes"] = notes


PRIVATE_RESPONSE_KEYS = {
    "cachePath",
    "library",
    "logPath",
    "path",
    "processCommand",
    "statePath",
    "steamPath",
    "visualCachePath",
}


def _public_payload(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: _public_payload(item)
            for key, item in value.items()
            if key not in PRIVATE_RESPONSE_KEYS
        }
    if isinstance(value, list):
        return [_public_payload(item) for item in value]
    return value


def _rank_apps(apps: Dict[int, Dict[str, Any]], max_apps: int) -> List[Dict[str, Any]]:
    ranked = list(apps.values())
    ranked.sort(
        key=lambda app: (
            1 if app.get("store", {}).get("hasTradingCards") else 0,
            _safe_int(app.get("steamTracking", {}).get("lastAt"), 0),
            _safe_int(app.get("mtime"), 0),
        ),
        reverse=True,
    )
    return ranked[:max_apps]


def _build_report(max_apps: int, refresh: bool = False, only_appid: int = 0) -> Dict[str, Any]:
    apps = _stplug_apps()
    loaded_names = _parse_loaded_apps()
    for appid, name in loaded_names.items():
        apps.setdefault(
            appid,
            {
                "appid": appid,
                "name": name,
                "enabled": True,
                "path": "",
                "mtime": int(time.time()),
                "addappids": [appid],
                "addappidCount": 1,
                "hasSelfAdd": True,
            },
        )

    if only_appid:
        apps = {appid: app for appid, app in apps.items() if appid == only_appid}

    _resolve_app_names(apps)
    appids = list(apps.keys())
    tracking_states = _read_gameprocess_states(appids)
    store_details = _fetch_store_details(appids, refresh=refresh) if appids else {}
    for appid, app in apps.items():
        manifest = _find_appmanifest(appid)
        store = store_details.get(appid, {})
        if manifest.get("name") and (not app.get("name") or str(app.get("name", "")).startswith("App ")):
            app["name"] = manifest["name"]
        if store.get("storeName") and (not app.get("name") or str(app.get("name", "")).startswith("App ")):
            app["name"] = store["storeName"]
        app["manifest"] = manifest
        app["store"] = store
        app["steamTracking"] = tracking_states.get(
            appid,
            {
                "seen": False,
                "lastAt": 0,
                "lastStatus": "never",
                "lastPid": 0,
                "trackingKind": "never",
            },
        )
        app["badgeUrl"] = f"https://steamcommunity.com/my/gamecards/{appid}/"
        app["storeUrl"] = f"https://store.steampowered.com/app/{appid}/"
        app["runUri"] = f"steam://rungameid/{appid}"
        _diagnose_app(app)

    ranked = _rank_apps(apps, max_apps)
    all_apps = list(apps.values())
    card_count = sum(1 for app in all_apps if app.get("store", {}).get("hasTradingCards"))
    tracked_count = sum(
        1
        for app in all_apps
        if app.get("steamTracking", {}).get("seen")
        and app.get("steamTracking", {}).get("trackingKind") != "external-tool"
    )
    tracked_any_count = sum(1 for app in all_apps if app.get("steamTracking", {}).get("seen"))
    manifest_count = sum(1 for app in all_apps if app.get("manifest", {}).get("exists"))

    return {
        "success": True,
        "generatedAt": int(time.time()),
        "source": "stplug-in",
        "count": len(ranked),
        "totalDetected": len(apps),
        "withTradingCards": card_count,
        "trackedBySteam": tracked_count,
        "trackedAny": tracked_any_count,
        "withManifest": manifest_count,
        "apps": ranked,
    }


def GetLuaToolsCardReport(
    maxApps: Any = 120,
    refresh: Any = False,
    contentScriptQuery: str = "",
    **kwargs: Any,
) -> str:
    if "maxApps" in kwargs:
        maxApps = kwargs.get("maxApps")
    if "refresh" in kwargs:
        refresh = kwargs.get("refresh")

    max_apps = _safe_int(maxApps, 120, 1, 300)
    force_refresh = str(refresh).lower() in ("1", "true", "yes")
    payload = _public_payload(_build_report(max_apps=max_apps, refresh=force_refresh))
    _log(f"served report for {payload['count']} apps")
    return json.dumps(payload, ensure_ascii=False)


def GetLuaToolsCardReportForApp(
    appid: Any = 0,
    refresh: Any = False,
    contentScriptQuery: str = "",
    **kwargs: Any,
) -> str:
    if "appid" in kwargs:
        appid = kwargs.get("appid")
    if "refresh" in kwargs:
        refresh = kwargs.get("refresh")

    appid_int = _safe_int(appid, 0, 1)
    force_refresh = str(refresh).lower() in ("1", "true", "yes")
    payload = _public_payload(_build_report(max_apps=1, refresh=force_refresh, only_appid=appid_int))
    return json.dumps(payload, ensure_ascii=False)


def GetLuaToolsCardManifest(
    maxApps: Any = 300,
    refresh: Any = False,
    contentScriptQuery: str = "",
    **kwargs: Any,
) -> str:
    if "maxApps" in kwargs:
        maxApps = kwargs.get("maxApps")
    if "refresh" in kwargs:
        refresh = kwargs.get("refresh")

    max_apps = _safe_int(maxApps, 300, 1, 500)
    force_refresh = str(refresh).lower() in ("1", "true", "yes")
    report = _build_report(max_apps=max_apps, refresh=force_refresh)
    apps: List[Dict[str, Any]] = []
    for app in report.get("apps", []):
        appid = _safe_int(app.get("appid"), 0, 1)
        if not appid:
            continue
        store = app.get("store", {}) if isinstance(app.get("store"), dict) else {}
        manifest = app.get("manifest", {}) if isinstance(app.get("manifest"), dict) else {}
        tracking = app.get("steamTracking", {}) if isinstance(app.get("steamTracking"), dict) else {}
        apps.append(
            {
                "appid": appid,
                "name": str(app.get("name") or f"App {appid}"),
                "enabled": bool(app.get("enabled", True)),
                "hasTradingCards": bool(store.get("hasTradingCards")),
                "storeSuccess": bool(store.get("storeSuccess")),
                "manifestExists": bool(manifest.get("exists")),
                "trackedBySteam": bool(tracking.get("seen"))
                and tracking.get("trackingKind") != "external-tool",
                "source": "stplug-in",
            }
        )

    card_appids = [app["appid"] for app in apps if app.get("hasTradingCards")]
    payload = {
        "success": True,
        "generatedAt": int(time.time()),
        "source": "local-stplug-in",
        "count": len(apps),
        "withTradingCards": len(card_appids),
        "appids": [app["appid"] for app in apps],
        "cardAppids": card_appids,
        "apps": apps,
    }
    _log(f"served card bridge manifest for {len(apps)} apps ({len(card_appids)} with cards)")
    return json.dumps(payload, ensure_ascii=False)


def GetLuaToolsCardCommunityVisualData(
    appid: Any = 0,
    contentScriptQuery: str = "",
    **kwargs: Any,
) -> str:
    if "appid" in kwargs:
        appid = kwargs.get("appid")

    appid_int = _safe_int(appid, 0, 1)
    if not appid_int:
        return json.dumps({"success": False, "error": "invalid appid"}, ensure_ascii=False)

    if not _is_luatools_appid(appid_int):
        return json.dumps(
            {
                "success": True,
                "appid": appid_int,
                "active": False,
                "reason": "appid is not a local Lua game",
            },
            ensure_ascii=False,
        )

    payload = _build_community_visual_data(appid_int)
    payload["success"] = True
    payload = _public_payload(payload)
    _log(
        "served community visual data: "
        f"appid={appid_int} active={payload.get('active')} "
        f"target={payload.get('targetOwned', 0)}/{payload.get('cardCount', 0)} "
        f"mode={payload.get('visualDropMode', '')}"
    )
    return json.dumps(payload, ensure_ascii=False)


def GetLuaToolsCardCommunityVisualBatch(
    appids: Any = None,
    maxApps: Any = 160,
    contentScriptQuery: str = "",
    **kwargs: Any,
) -> str:
    if "appids" in kwargs:
        appids = kwargs.get("appids")
    if "maxApps" in kwargs:
        maxApps = kwargs.get("maxApps")

    max_apps = _safe_int(maxApps, 160, 1, 300)
    apps = _stplug_apps()
    loaded_names = _parse_loaded_apps()
    for loaded_appid, loaded_name in loaded_names.items():
        apps.setdefault(
            loaded_appid,
            {
                "appid": loaded_appid,
                "name": loaded_name,
                "enabled": True,
                "path": "",
                "mtime": int(time.time()),
                "addappids": [loaded_appid],
                "addappidCount": 1,
                "hasSelfAdd": True,
            },
        )
        if loaded_name and not apps[loaded_appid].get("name"):
            apps[loaded_appid]["name"] = loaded_name

    requested = _parse_appids_arg(appids, maximum=max_apps)
    known_appids = set(apps.keys())
    if requested:
        selected = [appid for appid in requested if appid in known_appids]
    else:
        selected = list(known_appids)

    selected = selected[:max_apps]
    selected_apps = {appid: apps.get(appid, {"appid": appid, "name": f"App {appid}"}) for appid in selected}
    _resolve_app_names(selected_apps)

    settings = _load_settings()
    craft_state = _load_craft_state()
    visual_cache = _load_visual_cache()
    localconfigs = _localconfig_apps()

    items: List[Dict[str, Any]] = []
    active = 0
    relevant = 0
    for selected_appid in selected:
        payload = _build_community_visual_data(
            selected_appid,
            settings=settings,
            craft_state=craft_state,
            visual_cache=visual_cache,
            localconfig_apps=localconfigs,
            save_snapshot=False,
            clamp_state=False,
        )
        payload["success"] = True
        app_name = selected_apps.get(selected_appid, {}).get("name")
        if app_name:
            payload["name"] = str(app_name)
        items.append(payload)
        if payload.get("active"):
            active += 1
            craft = payload.get("craft", {}) if isinstance(payload.get("craft"), dict) else {}
            badge = payload.get("badge", {}) if isinstance(payload.get("badge"), dict) else {}
            level = max(_safe_int(craft.get("level"), 0, 0), _safe_int(badge.get("level"), 0, 0))
            if level > 0 or _safe_int(payload.get("targetOwned"), 0, 0) > 0 or payload.get("complete"):
                relevant += 1

    result = {
        "success": True,
        "generatedAt": int(time.time()),
        "source": "local-community-visual-batch",
        "requested": len(requested) if requested else 0,
        "count": len(items),
        "active": active,
        "relevant": relevant,
        "items": items,
    }
    result = _public_payload(result)
    _log(
        "served community visual batch: "
        f"requested={result['requested']} count={len(items)} active={active} relevant={relevant}"
    )
    return json.dumps(result, ensure_ascii=False)


def CraftLuaToolsCardVisualBadge(
    appid: Any = 0,
    contentScriptQuery: str = "",
    **kwargs: Any,
) -> str:
    if "appid" in kwargs:
        appid = kwargs.get("appid")

    appid_int = _safe_int(appid, 0, 1)
    if not appid_int:
        return json.dumps({"success": False, "error": "invalid appid"}, ensure_ascii=False)
    if not _is_luatools_appid(appid_int):
        return json.dumps({"success": False, "error": "appid is not a local Lua game"}, ensure_ascii=False)

    payload = _build_community_visual_data(appid_int)
    if not payload.get("active") or not payload.get("complete"):
        return json.dumps(
            {
                "success": False,
                "error": "visual card set is not complete",
                "data": payload,
            },
            ensure_ascii=False,
        )

    craft = payload.get("craft", {}) if isinstance(payload.get("craft"), dict) else {}
    current_level = _safe_int(craft.get("level"), 0, 0)
    max_level = _safe_int(craft.get("maxLevel"), 5, 1, 100)
    available_level = _safe_int(craft.get("availableByPlaytime"), 0, 0, max_level)
    if current_level >= max_level:
        return json.dumps(
            {
                "success": False,
                "error": "visual badge is already at max level",
                "data": payload,
            },
            ensure_ascii=False,
        )
    if current_level >= available_level:
        return json.dumps(
            {
                "success": False,
                "error": "not enough local playtime for the next visual badge level",
                "data": payload,
            },
            ensure_ascii=False,
        )
    next_level = min(max(current_level + 1, 1), max_level)

    state = _load_craft_state()
    apps = state.get("apps", {})
    if not isinstance(apps, dict):
        apps = {}
    apps[str(appid_int)] = {
        "level": next_level,
        "craftedAt": int(time.time()),
    }
    state["apps"] = apps
    _save_craft_state(state)

    updated = _build_community_visual_data(appid_int)
    updated["success"] = True
    updated["crafted"] = True
    updated = _public_payload(updated)
    _log(f"crafted visual badge locally: appid={appid_int} level={next_level}/{max_level}")
    return json.dumps(updated, ensure_ascii=False)


def SaveLuaToolsCardVisualSnapshot(
    appid: Any = 0,
    cards: Any = None,
    badge: Any = None,
    badgeLevels: Any = None,
    source: Any = "steamui",
    contentScriptQuery: str = "",
    **kwargs: Any,
) -> str:
    if "appid" in kwargs:
        appid = kwargs.get("appid")
    if "cards" in kwargs:
        cards = kwargs.get("cards")
    if "badge" in kwargs:
        badge = kwargs.get("badge")
    if "badgeLevels" in kwargs:
        badgeLevels = kwargs.get("badgeLevels")
    if "source" in kwargs:
        source = kwargs.get("source")

    appid_int = _safe_int(appid, 0, 1)
    if not appid_int:
        return json.dumps({"success": False, "error": "invalid appid"}, ensure_ascii=False)
    if not _is_luatools_appid(appid_int):
        return json.dumps({"success": False, "error": "appid is not a local Lua game"}, ensure_ascii=False)

    source_text = re.sub(r"[^A-Za-z0-9_.:-]+", "-", _safe_text(source, 80)) or "steamui"
    try:
        saved = _save_visual_snapshot(
            appid_int,
            cards if isinstance(cards, list) else [],
            badgeLevels if isinstance(badgeLevels, list) else [],
            badge if isinstance(badge, dict) else {},
            [],
            source_text,
        )
    except Exception as exc:
        _log(f"failed to save visual snapshot: {type(exc).__name__}")
        return json.dumps({"success": False, "error": "failed to save visual snapshot"}, ensure_ascii=False)

    payload = _build_community_visual_data(appid_int)
    payload["success"] = True
    payload["saved"] = bool(saved)
    payload = _public_payload(payload)
    _log(
        "saved visual snapshot: "
        f"appid={appid_int} saved={bool(saved)} cards={payload.get('cardCount', 0)} "
        f"source={source_text}"
    )
    return json.dumps(payload, ensure_ascii=False)


def GetLuaToolsCardBridgeSettings(contentScriptQuery: str = "", **kwargs: Any) -> str:
    settings = _load_settings()
    payload = {
        "success": True,
        "settings": settings,
        "modes": [
            {
                "value": VISUAL_DROP_MODE_HALF,
                "label": "Metade estilo Steam",
                "description": "Mostra o limite visual normal de drops por playtime.",
            },
            {
                "value": VISUAL_DROP_MODE_ALL,
                "label": "Todas as cartas",
                "description": "Permite completar visualmente o set inteiro por playtime.",
            },
        ],
    }
    return json.dumps(payload, ensure_ascii=False)


def SetLuaToolsCardBridgeSettings(
    settings: Any = None,
    visualDropMode: Any = "",
    contentScriptQuery: str = "",
    **kwargs: Any,
) -> str:
    if "settings" in kwargs:
        settings = kwargs.get("settings")
    if "visualDropMode" in kwargs:
        visualDropMode = kwargs.get("visualDropMode")

    incoming: Dict[str, Any] = {}
    if isinstance(settings, str) and settings.strip():
        try:
            parsed = json.loads(settings)
            if isinstance(parsed, dict):
                incoming = parsed
        except Exception:
            incoming = {}
    elif isinstance(settings, dict):
        incoming = settings

    if visualDropMode:
        incoming["visualDropMode"] = visualDropMode

    try:
        saved = _save_settings(incoming)
        _log(f"saved settings: visualDropMode={saved.get('visualDropMode')}")
        return json.dumps({"success": True, "settings": saved}, ensure_ascii=False)
    except Exception as exc:
        _log(f"failed to save settings: {type(exc).__name__}")
        return json.dumps(
            {"success": False, "error": "failed to save settings", "settings": _load_settings()},
            ensure_ascii=False,
        )
