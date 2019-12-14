var dbPromise = idb.open('posts-store' /*database name*/, 1/*version no.*/ , function(db){
  //Here first we need to check if the table is already present or not 
  //If it is already present there's no need to create the table with the same name again 
  //If we do it without checking then whole table with be replaced by entirely new table
  if (!db.objectStoreNames.contains('posts')){
    db.createObjectStore('posts'/*table name*/, {keyPath: 'id'}/*kind oof primary key*/);
  }
  if (!db.objectStoreNames.contains('sync-posts')){
    db.createObjectStore('sync-posts'/*table name*/, {keyPath: 'id'}/*kind oof primary key*/);
  }
});

function writeData(st , data){
	return dbPromise// now in the .then() we get the access of the opened database
                  .then(function(db){
                    //we need to use .transaction() function because indexed DB is a trasactional database
                    var tx = db.transaction(st/*Table name*/, 'readwrite'/*operation to be performed*/); 
                    var store = tx.objectStore(st);
                    store.put(data);
                    return tx.complete;//here .complete is not a method its just a property which ensures that the transaction is done
                  });
}

function readAllData(st){
	return dbPromise// now in the .then() we get the access of the opened database
                  .then(function(db){
                    //we need to use .transaction() function because indexed DB is a trasactional database
                    var tx = db.transaction(st/*Table name*/, 'readonly'/*operation to be performed*/); 
                    var store = tx.objectStore(st);
                    return store.getAll();
                  });
}

function clearAllData(st){
	return dbPromise// now in the .then() we get the access of the opened database
                  .then(function(db){
                    //we need to use .transaction() function because indexed DB is a trasactional database
                    var tx = db.transaction(st/*Table name*/, 'readwrite'/*operation to be performed*/); 
                    var store = tx.objectStore(st);
                    store.clear();
                    return tx.complete;//after performing any kind of write operation on the table we need to use this property
                  });
}

function deleteItemFromData(st , id){
	return dbPromise// now in the .then() we get the access of the opened database
                  .then(function(db){
                    //we need to use .transaction() function because indexed DB is a trasactional database
                    var tx = db.transaction(st/*Table name*/, 'readwrite'/*operation to be performed*/); 
                    var store = tx.objectStore(st);
                    store.delete(id);
                    return tx.complete;//here .complete is not a method its just a property
                  })
                  .then(function(){
                  	console.log('Item deleted');
                  });
}