import "server-only";

export function renderPlannerBridge(slug: string, mode: "demo" | "owned") {
  const config = JSON.stringify({ slug, mode });
  return `<script>
(function () {
  var config = ${config};
  var values = Object.create(null);
  var aiRequests = Object.create(null);
  var hydratedFromName = false;
  try {
    var remembered = JSON.parse(window.name || 'null');
    if (remembered && remembered.slug === config.slug && remembered.data) {
      Object.keys(remembered.data).forEach(function (key) { values[key] = String(remembered.data[key]); });
      hydratedFromName = true;
    }
  } catch (_) {}
  function remember() {
    try { window.name = JSON.stringify({ slug: config.slug, data: values }); } catch (_) {}
  }
  function managedStorageValue(key, currentValue) {
    if (config.mode !== 'owned') return currentValue;
    if (/(?:aiApiKey|ai_api_key)$/.test(key)) return JSON.stringify('templify-managed');
    if (/(?:aiModel|ai_model)$/.test(key)) return JSON.stringify('openrouter/free');
    if (config.slug === 'mealmind' && key === 'mm_settings') {
      var mealSettings = {};
      try { mealSettings = JSON.parse(currentValue || '{}') || {}; } catch (_) {}
      mealSettings.openrouterKey = 'templify-managed';
      mealSettings.aiModel = 'openrouter/free';
      mealSettings.freeModels = ['openrouter/free'];
      return JSON.stringify(mealSettings);
    }
    if (config.slug === 'planer-budowy' && /_settings$/.test(key)) {
      var buildSettings = {};
      try { buildSettings = JSON.parse(currentValue || '{}') || {}; } catch (_) {}
      buildSettings.openrouterKey = 'templify-managed';
      return JSON.stringify(buildSettings);
    }
    return currentValue;
  }
  var storage = {
    get length() { return Object.keys(values).length; },
    key: function (index) { return Object.keys(values)[index] || null; },
    getItem: function (key) {
      key = String(key);
      var currentValue = Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null;
      return managedStorageValue(key, currentValue);
    },
    setItem: function (key, value) {
      key = String(key); value = String(value); values[key] = value;
      remember();
      window.parent.postMessage({ type: 'templify:planner-change', slug: config.slug, key: key, value: value }, '*');
    },
    removeItem: function (key) {
      key = String(key); delete values[key];
      remember();
      window.parent.postMessage({ type: 'templify:planner-change', slug: config.slug, key: key, value: null }, '*');
    },
    clear: function () {
      values = Object.create(null);
      remember();
      window.parent.postMessage({ type: 'templify:planner-clear', slug: config.slug }, '*');
    }
  };
  try { Object.defineProperty(window, 'localStorage', { configurable: true, value: storage }); } catch (_) {}
  window.addEventListener('message', function (event) {
    var message = event.data;
    if (!message || message.slug !== config.slug) return;
    if (message.type === 'templify:planner-ai-response') {
      var pending = aiRequests[message.requestId];
      if (!pending) return;
      delete aiRequests[message.requestId];
      window.clearTimeout(pending.timer);
      pending.resolve(new Response(JSON.stringify(message.body || {}), {
        status: message.status || 500,
        headers: { 'Content-Type': 'application/json' }
      }));
      return;
    }
    if (message.type !== 'templify:planner-hydrate') return;
    values = Object.create(null);
    var data = message.data || {};
    Object.keys(data).forEach(function (key) { values[key] = String(data[key]); });
    remember();
    window.parent.postMessage({ type: 'templify:planner-hydrated', slug: config.slug }, '*');
    if (!hydratedFromName) {
      window.location.reload();
    }
  });
  window.addEventListener('DOMContentLoaded', function () {
    window.parent.postMessage({ type: 'templify:planner-ready', slug: config.slug, mode: config.mode }, '*');
  });
  var nativeFetch = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf('openrouter.ai/api/v1/models') !== -1) {
      return Promise.resolve(new Response(JSON.stringify({ data: [{ id: 'openrouter/free', pricing: { prompt: '0', completion: '0' } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    if (url.indexOf('openrouter.ai/api/v1/chat/completions') !== -1) {
      if (config.mode !== 'owned') {
        return Promise.resolve(new Response(JSON.stringify({ error: { message: 'Asystent AI jest dostępny w pełnej wersji planera.' } }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
      var body = {};
      try { body = JSON.parse((init && init.body) || '{}'); } catch (_) {}
      var requestId = Date.now().toString(36) + Math.random().toString(36).slice(2);
      return new Promise(function (resolve) {
        var timer = window.setTimeout(function () {
          delete aiRequests[requestId];
          resolve(new Response(JSON.stringify({ error: { message: 'Asystent AI nie odpowiedział na czas.' } }), {
            status: 504,
            headers: { 'Content-Type': 'application/json' }
          }));
        }, 45000);
        aiRequests[requestId] = { resolve: resolve, timer: timer };
        window.parent.postMessage({
          type: 'templify:planner-ai-request',
          slug: config.slug,
          requestId: requestId,
          body: body
        }, '*');
      });
    }
    return nativeFetch.call(window, input, init);
  };
})();
</script>`;
}
