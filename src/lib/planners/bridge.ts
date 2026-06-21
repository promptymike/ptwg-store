import "server-only";

export function renderPlannerBridge(slug: string, mode: "demo" | "owned") {
  const config = JSON.stringify({ slug, mode });
  return `<script>
(function () {
  var config = ${config};
  var values = Object.create(null);
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
  var storage = {
    get length() { return Object.keys(values).length; },
    key: function (index) { return Object.keys(values)[index] || null; },
    getItem: function (key) { key = String(key); return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null; },
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
    if (!message || message.type !== 'templify:planner-hydrate' || message.slug !== config.slug) return;
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
    if (url.indexOf('openrouter.ai') !== -1) {
      return Promise.reject(new Error('Asystent AI będzie dostępny przez bezpieczne konto Templify.'));
    }
    return nativeFetch.call(window, input, init);
  };
})();
</script>`;
}
