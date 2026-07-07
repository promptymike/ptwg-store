import "server-only";

import path from "node:path";

const PLANNER_ASSET_BASE_PATH = "/api/planner-assets";

const EXTERNAL_ASSET_REPLACEMENTS = new Map<string, string>([
  ["https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js", `${PLANNER_ASSET_BASE_PATH}/chart.umd.js`],
  ["https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js", `${PLANNER_ASSET_BASE_PATH}/chart.umd.js`],
  ["https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js", `${PLANNER_ASSET_BASE_PATH}/chart.umd.js`],
  ["https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js", `${PLANNER_ASSET_BASE_PATH}/Sortable.min.js`],
  ["https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js", `${PLANNER_ASSET_BASE_PATH}/Sortable.min.js`],
  ["https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js", `${PLANNER_ASSET_BASE_PATH}/dayjs.min.js`],
  ["https://cdn.jsdelivr.net/npm/dayjs@1.11.10/locale/pl.js", `${PLANNER_ASSET_BASE_PATH}/dayjs-locale-pl.js`],
  ["https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/weekOfYear.js", `${PLANNER_ASSET_BASE_PATH}/dayjs-weekOfYear.js`],
  ["https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/customParseFormat.js", `${PLANNER_ASSET_BASE_PATH}/dayjs-customParseFormat.js`],
  ["https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/isBetween.js", `${PLANNER_ASSET_BASE_PATH}/dayjs-isBetween.js`],
  ["https://unpkg.com/lucide@latest/dist/umd/lucide.min.js", `${PLANNER_ASSET_BASE_PATH}/lucide.min.js`],
  ["https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js", `${PLANNER_ASSET_BASE_PATH}/leaflet.js`],
  ["https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css", `${PLANNER_ASSET_BASE_PATH}/leaflet.css`],
]);

type PlannerAssetDefinition = {
  relativePath: string;
  contentType: string;
  wrapper?: "lucide-cjs";
};

const PLANNER_ASSETS: Record<string, PlannerAssetDefinition> = {
  "chart.umd.js": {
    relativePath: "chart.js/dist/chart.umd.js",
    contentType: "text/javascript; charset=utf-8",
  },
  "Sortable.min.js": {
    relativePath: "sortablejs/Sortable.min.js",
    contentType: "text/javascript; charset=utf-8",
  },
  "dayjs.min.js": {
    relativePath: "dayjs/dayjs.min.js",
    contentType: "text/javascript; charset=utf-8",
  },
  "dayjs-locale-pl.js": {
    relativePath: "dayjs/locale/pl.js",
    contentType: "text/javascript; charset=utf-8",
  },
  "dayjs-weekOfYear.js": {
    relativePath: "dayjs/plugin/weekOfYear.js",
    contentType: "text/javascript; charset=utf-8",
  },
  "dayjs-customParseFormat.js": {
    relativePath: "dayjs/plugin/customParseFormat.js",
    contentType: "text/javascript; charset=utf-8",
  },
  "dayjs-isBetween.js": {
    relativePath: "dayjs/plugin/isBetween.js",
    contentType: "text/javascript; charset=utf-8",
  },
  "lucide.min.js": {
    relativePath: "lucide/dist/cjs/lucide.js",
    contentType: "text/javascript; charset=utf-8",
    wrapper: "lucide-cjs",
  },
  "leaflet.js": {
    relativePath: "leaflet/dist/leaflet.js",
    contentType: "text/javascript; charset=utf-8",
  },
  "leaflet.css": {
    relativePath: "leaflet/dist/leaflet.css",
    contentType: "text/css; charset=utf-8",
  },
  "images/layers.png": {
    relativePath: "leaflet/dist/images/layers.png",
    contentType: "image/png",
  },
  "images/layers-2x.png": {
    relativePath: "leaflet/dist/images/layers-2x.png",
    contentType: "image/png",
  },
  "images/marker-icon.png": {
    relativePath: "leaflet/dist/images/marker-icon.png",
    contentType: "image/png",
  },
  "images/marker-icon-2x.png": {
    relativePath: "leaflet/dist/images/marker-icon-2x.png",
    contentType: "image/png",
  },
  "images/marker-shadow.png": {
    relativePath: "leaflet/dist/images/marker-shadow.png",
    contentType: "image/png",
  },
};

export function localizePlannerAssets(source: string): string {
  let html = source;

  for (const [externalUrl, localUrl] of EXTERNAL_ASSET_REPLACEMENTS) {
    html = html.split(externalUrl).join(localUrl);
  }

  return html;
}

export function resolvePlannerAsset(assetPath: string): (PlannerAssetDefinition & { filePath: string }) | null {
  const normalizedAssetPath = assetPath.replace(/\\/g, "/").replace(/^\/+/, "");
  const asset = PLANNER_ASSETS[normalizedAssetPath];

  if (!asset) {
    return null;
  }

  return {
    ...asset,
    filePath: path.join(process.cwd(), "node_modules", ...asset.relativePath.split("/")),
  };
}

export function wrapPlannerAssetSource(source: string, wrapper: PlannerAssetDefinition["wrapper"]): string {
  if (wrapper === "lucide-cjs") {
    return `;(function () {
var exports = {};
${source}
var nativeCreateIcons = exports.createIcons;
exports.createIcons = function (options) {
  return nativeCreateIcons(Object.assign({ icons: exports.icons }, options || {}));
};
window.lucide = exports;
})();`;
  }

  return source;
}
