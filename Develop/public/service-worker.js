const FILES_TO_CACHE = [
    "./index.html",
    "./css/styles.css",
    "./js/index.js",
]

const APP_PREFIX = "BudgetTracker-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;

self.addEventListener("install", function (e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        console.log("installing cache : " + CACHE_NAME);
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  });
  
  self.addEventListener('activate', function(e) {
      e.waitUntil(
        caches.keys().then(function(keyList) {
          let cacheKeeplist = keyList.filter(function(key) {
            return key.indexOf(APP_PREFIX);
          });
          cacheKeeplist.push(CACHE_NAME);
    
          return Promise.all(
            keyList.map(function(key, i) {
              if (cacheKeeplist.indexOf(key) === -1) {
                console.log('deleting cache : ' + keyList[i]);
                return caches.delete(keyList[i]);
              }
            })
          );
        })
      );
    });

    self.addEventListener('fetch', function (event) {
        if (event.request.url.includes("/api/")) {
            console.log("[Service Worker] Fetch (data)", event.request.url);
      
            event.respondWith(
                caches.open(STATIC_CACHE).then(cache => {
                    return fetch(event.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(event.request.url, response.clone());
                            }
                            return response;
                        })
                        .catch(err => {
                            return cache.match(event.request);
                        });
                })
            );
            return;
        }

        event.respondWith(
            caches.open(RUNTIME_CACHE).then(cache => {
                return cache.match(event.request).then(response => {
                    return response || fetch(event.request);
                });
            })
        );
      });