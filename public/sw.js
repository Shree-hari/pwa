

importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');


var CACHE_STATIC_NAME = 'static-v19';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
var STATIC_FILES = [
          // '/',
          '/index.html',
          '/offline.html',
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/js/idb.js',
          '/src/js/promise.js',
          '/src/js/fetch.js',
          '/src/js/material.min.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          '/src/images/main-image.jpg',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'];


// var dbPromise = idb.open('posts-store' /*database name*/, 1/*version no.*/ , function(db){
//   //Here first we need to check if the table is already present or not 
//   //If it is already present there's no need to create the table with the same name again 
//   //If we do it without checking then whole table with be replaced by entirely new table
//   if (!db.objectStoreNames.contains('posts')){
//     db.createObjectStore('posts'/*table name*/, {keyPath: 'id'}/*kind oof primary key*/);
//   }
// });


self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll(STATIC_FILES);
      })
  )
});

// function trimCache(cacheName, maxItems) {
//   caches.open(cacheName)
//     .then(function (cache) {
//       return cache.keys()
//         .then(function (keys) {
//           if (keys.length > maxItems) {
//             cache.delete(keys[0])
//               .then(trimCache(cacheName, maxItems));
//           }
//         });
//     })
// }


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

function isInArray(string,array){
  for(var i=0;i<array.length;i++){
    if(array[i]===string){
      return true;
    }
  } return false;
}

//Cache then network strategy

self.addEventListener('fetch', function(event) {
  var url = 'https://pwagram-6cc96.firebaseio.com/posts';
  if(event.request.url.indexOf(url)> -1){
    event.respondWith(  // here we have used event.request because all the sites are loaded when a client sends request for that site and gets respose in return
    /*caches.open(CACHE_DYNAMIC_NAME)
     .then(function(cache){
      return */fetch(event.request)
        .then(function(res){
         // cache.put(event.request , res.clone());
          var clonedRes = res.clone();
          clearAllData('posts')
            .then(function(){
              return clonedRes.json();//.json() is a promise so now to access the data from the json list we need to use then() 
                               
            })
            .then(function(data){
                  for (var key in data){//here key is just the identifier of all the poasts though  
                    writeData('posts' , data[key]);
                    // dbPromise// now in the .then() we get the access of the opened database
                    //   .then(function(db){
                    //     //we need to use .transaction() function because indexed DB is a trasactional database
                    //     var tx = db.transaction('posts'/*Table name*/, 'readwrite'/*operation to be performed*/); 
                    //     var store = tx.objectStore('posts');
                    //     store.put(data[key]);
                    //     return tx.complete;//here .complete is not a method its just a property
                    //   });

                  }
              });

          return res;
        })
     //})
  ); 
  } else if(isInArray(event.request.url , STATIC_FILES)){
       event.respondWith(
   caches.match(event.request)
   );
  } else{ // here we have used event.request because all the sites are loaded when a client sends request for that site and gets respose in return
    event.respondWith( 
      // This line basically says that we need to check if the URL links which we need to load the site if they are present in the cache or not.
      caches.match(event.request)  
      .then(function(response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function(res) {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(function(cache) {
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            })
            .catch(function(err) {
              return caches.open(CACHE_STATIC_NAME)
                .then(function(cache) {
                  //the below line of code ensures that we load the offline page only if any of the html pages fail to load.
                  //here we eleminate the appearing of offline page in case any kind of css or json file fails to load 
                  if(event.request.headers.get('accept').includes('text/html')){
                    // falling back to offline page when the we get get any kind of error while loading any of the pages  
                    return cache.match('/offline.html');
                  }
                  
                });
            });
        }
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
