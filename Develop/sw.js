
const FILES_TO_CACHE = ["/", "index.html", "index.js", "server.js"];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cage-v1";

self.addEventListener('install', function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Files were pre cached.");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(evt){
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME){
                        console.log("Removing old cache data", key);
            return caches.delete(key);

                    }
                })
            )
        })
    )
});

self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
     evt.respondWith(
      caches.match(evt.request).then(function(response){
          return response || fetch(evt.request);
      })
  );
  });

 