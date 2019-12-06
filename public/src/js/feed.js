
var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');

// Below is the function which is used to save something when user requests it to save it inside the cache. 
function onSaveButtonClicked(event){
  console.log("clicked");
  if('caches' in window){
    caches.open('user-requested')
      .then(function(cache){
        cache.add('https://httpbin.org/get');
        cache.add('/src/images/sf-boat.jpg');
      });
  }
}
  // these are the lines which helps us to deregister the service worker as and when required
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function(registrations) {
  //       for (var i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     })
  // }

//Function to open the + menu
function openCreatePostModal() {
  //createPostArea.style.display = 'block';
  createPostArea.style.transform = 'translateY(0)';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}
//Function to close the + menu
function closeCreatePostModal() {
  //createPostArea.style.display = 'none';
  createPostArea.style.transform = 'translateY(100vh)';
}

//using click as a trigger to open the + menu
shareImageButton.addEventListener('click', openCreatePostModal);

//using click as a trigger to close the x menu
closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

//Cache then network strategy

function updateUI(data){
  clearCards();
  for(var i=0; i<data.length; i++){
    createCard(data[i]);
  }
}

// var dbobject= firebase.database().ref();
// dbobject.on('value', function(snapshot) {
//   //updateUI(snapshot.val());
// console.log(snapshot.val());
// })
// ;

var url = 'https://pwagram-6cc96.firebaseio.com/posts.json';
var networkDataReceived = false ;
fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true ;
    console.log('From web: ',data);
    var dataArray=[];
    for (var key in data){
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });


if('indexedDB' in window){
  readAllData('posts')
    .then(function(data){
      if (!networkDataReceived){
        console.log('From Cache ->',data);
      }
    });
    // caches.match(url)
    //   .then(function(response){
    //     if(response){
    //       return response.json();
    //     }
    //   })
    //   .then(function(data){
    //     console.log('From cache: ',data);
    //     //this line ensures that if the data is fetched fatser from the network then we don't need to get the same data from the cache 
    //     if(!networkDataReceived){
    //       var dataArray=[];
    //       for (var key in data){
    //         dataArray.push(data[key]);
    //       }
    //       updateUI(dataArray);
            
    //     }
        
    //   });
  }

form.addEventListener('submit', function(event){
  event.preventDefault();
  if (titleInput.value.trim() === '' || locationInput.value.trim() === ''){
    alert('Please enter valid data');
    return;
  }
  closeCreatePostModal();
  // Lets check if the browser supports service worker and syncmanager
  if ('serviceWorker' in navigator && 'SyncManager' in navigator){
    navigator.serviceWorker.ready
    //we need to use the above command because the service worker was initiated in sw.js and after that to get it ready and working we use .ready promise
      .then(function(sw){
        var post = {
          id : new Date().toISOString(),
          title : titleInput.value,
          location : locationInput.value
        };
        writeData('sync-posts', post)// We need to use indexedDB before using sync register because sync register doesn't has its own database
          .then(function(){
            return sw.sync.register('sync-new-post');//this will register the sync event in the service worker file
          })
          .then(function(){
            var snackbarContainer = document.querySelector('#confirmation-toast');
            var data = {message: 'Your post was saved for syncing!'};
            snackbarContainer.MaterialSnackbar.showSnackar(data);
          })
          .catch(function (err){
            console.log(err);
          });
        
      });
  }

});

