'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "manifest.json": "752fc4dafe203a8fe5ce4240946843c0",
"flutter.js": "f85e6fb278b0fd20c349186fb46ae36d",
"index.html": "980feba7ae09f49d1db3950ef50e7a8c",
"/": "980feba7ae09f49d1db3950ef50e7a8c",
"favicon.ico": "5fdb38b5d3ef3d7033c0ed0bd634ed8f",
"icons/android-icon-72x72.png": "39da61586e046f4dd6d81d86dc06eb85",
"icons/ms-icon-144x144.png": "d676e616f54acc6c43c6e313334c6802",
"icons/android-icon-144x144.png": "d676e616f54acc6c43c6e313334c6802",
"icons/favicon-16x16.png": "b775a13129fe5943594a10e72b48e491",
"icons/apple-icon-120x120.png": "fdfba8c6f8d8f050a995efe73b4e31b7",
"icons/android-icon-36x36.png": "31a0095672cc76762684428300d69dbd",
"icons/ms-icon-150x150.png": "023aeb601c610d21807f43a81a7a3a47",
"icons/apple-icon-60x60.png": "26a5d17c58e868b5362122cc49d4ad7d",
"icons/apple-icon-76x76.png": "88e17fc6814c620716780ddbac400c41",
"icons/android-icon-192x192.png": "c9db17ff62a4bacbf28e08465499932c",
"icons/ms-icon-310x310.png": "7585908cea41015219f0e36d98a92475",
"icons/apple-icon-precomposed.png": "2c5c91adfbfaa7ef5f996efe2e5e869c",
"icons/favicon-32x32.png": "2edffb2ee3dcbeaa1e23344e81320223",
"icons/apple-icon-144x144.png": "d676e616f54acc6c43c6e313334c6802",
"icons/ms-icon-70x70.png": "c339540c974a377e9be4e77ceb5ce881",
"icons/apple-icon-114x114.png": "c11b37caf93b4f3d5f0a7b9f4b26c726",
"icons/apple-icon-152x152.png": "fe2a2c4613ddc8028327e81f44042b31",
"icons/android-icon-48x48.png": "106536b0009379f0cde28312458e5ad4",
"icons/favicon-96x96.png": "7c4d4e669b1979104d4a292a0d356002",
"icons/apple-icon-57x57.png": "7a0d82b4b4c792515a35c270df371f6e",
"icons/apple-icon.png": "2c5c91adfbfaa7ef5f996efe2e5e869c",
"icons/apple-icon-180x180.png": "8a5c6a68d6b2d47fcd6258d7656f202f",
"icons/android-icon-96x96.png": "7c4d4e669b1979104d4a292a0d356002",
"icons/apple-icon-72x72.png": "39da61586e046f4dd6d81d86dc06eb85",
"main.dart.js": "69a7cd89bcc416a436eb6c38df33a00c",
"version.json": "fa7be2a1f5c68ee70678ff3f3d1a62d3",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/NOTICES": "0cbeb08e255e0b5c87ff635a931e5102",
"assets/AssetManifest.json": "44b6461f93fca3258b2f023378ea869c",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/shaders/ink_sparkle.frag": "52a81f2bfd3666fd44346152cc7eb26f",
"assets/assets/fmg_icon.png": "c03e395be87b87cb07631196a5cb8f2e",
"assets/assets/grandpa.jpg": "8b2b4197aa001a41b4f76c083ce94714",
"canvaskit/profiling/canvaskit.js": "38164e5a72bdad0faa4ce740c9b8e564",
"canvaskit/profiling/canvaskit.wasm": "95a45378b69e77af5ed2bc72b2209b94",
"canvaskit/canvaskit.js": "2bc454a691c631b07a9307ac4ca47797",
"canvaskit/canvaskit.wasm": "bf50631470eb967688cca13ee181af62"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
