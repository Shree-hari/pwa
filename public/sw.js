
var CACHE_STATIC_NAME = 'static-v10';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll([
          // '/',
          '/index.html',
          '/offline.html',
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/js/promise.js',
          '/src/js/fetch.js',
          '/src/js/material.min.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          '/src/images/main-image.jpg',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
        ]);
      })
  )
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {// this line returns the list of caches inside the cache storage
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {//it checks if the updated static and dynamic keys are present or not  
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);//this line of code is to delete the older versions of caches inside the cache storage
          }
        }));
      })
  );
  return self.clients.claim();
});

//Cache then network strategy

self.addEventListener('fetch', function(event) {
  var url = 'https://httpbin.org/get';
  if(event.request.url.indexxOf(url)> -1){
    event.respondWith(  // here we have used event.request because all the sites are loaded when a client sends request for that site and gets respose in return
    caches.open(CACHE_DYNAMIC_NAME)
     .then(function(cache){
      return fetch(event.request)
        .then(function(res){
          caches.put(event.request , res.clone());
          return res;
        })
     })
  );  
  }
  
});


//Cache then network
// self.addEventListener('fetch', function(event) {
//   event.respondWith(  // here we have used event.request because all the sites are loaded when a client sends request for that site and gets respose in return
//     caches.match(event.request)// This line basically says that we need to check if the URL links which we need to load the site if they are present in the cache or not.  
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//             })
//             .catch(function(err) {
//               return caches.open(CACHE_STATIC_NAME)
//                 .then(function(cache) {
//                   return cache.match('/offline.html');// falling back to offline page when the we get get any kind of error while loading any of the pages
//                 });
//             });
//         }
//       })
//   );
// });

//Network only strategy
//self.addEventListener('fetch', function(event){
//  event.respondWith(
//    fetch(event.request)
//    );
//});

//Network with dynamic cache fallback
// self.addEventListener('fetch', function(event){
//   event.respondWith(
//     fetch(event.request)
//       .then(function(res){
//         return caches.open(CACHE_DYNAMIC_NAME)
//           .then(function(cache){
//             cache.put(event.request.url , res.clone());
//               return res;
//           })
//       })
//       .catch(function(err) {
//              return caches.open(CACHE_STATIC_NAME)
//                .then(function(cache) {
//                  return cache.match('/offline.html');// falling back to offline page when the we get get any kind of error while loading any of the pages
//                });
//            })
//     );
// });



//Cache only strategy
//self.addEventListener('fetch', function(event){
//  event.respondWith(
//    caches.match(event.request)
//    );
//});

//Network only strategy
//self.addEventListener('fetch', function(event){
//  event.respondWith(
//    fetch(event.request)
//    );
//});

//Network with dynamic cache fallback
// self.addEventListener('fetch', function(event){
//   event.respondWith(
//     fetch(event.request)
//       .then(function(res){
//         return caches.open(CACHE_DYNAMIC_NAME)
//           .then(function(cache){
//             cache.put(event.request.url , res.clone());
//               return res;
//           })
//       })
//       .catch(function(err) {
//              return caches.open(CACHE_STATIC_NAME)
//                .then(function(cache) {
//                  return cache.match('/offline.html');// falling back to offline page when the we get get any kind of error while loading any of the pages
//                })
//            })
//     );
// });
