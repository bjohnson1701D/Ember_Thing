import Ember from "ember";
import DS from "ember-data";

var ApplicationAdapter = DS.Adapter.extend({
  db: null,
  dbName: "Things",
  delDB: true,

  init: function() {
    this.removeDB();
  },

  getDB: function() {
    var _this = this;
    var version = 1;
    var types = ["thing", "note"];
    if(this.db) {
      return new Ember.RSVP.Promise(function(resolve) {
        resolve(_this.get('db'));
      });
    } else {
      return new Ember.RSVP.Promise(function(resolve) {
        var request = window.indexedDB.open(_this.dbName, version);
        request.onsuccess = function(e) {
          var _db = e.target.result;
          _this.set('db', _db);
          resolve(_db);
        }.bind(_this);
        request.onerror = function(e) {
          console.log(e);
        };
        request.onupgradeneeded = function(e) {
          types.forEach(function(type) {
            if(!e.target.result.objectStoreNames.contains(type)) {
              console.log('Created Table: ' + type);
              e.target.result.createObjectStore(type, {keyPath: "id"});
            }
          })
        };
      });
    }
  },

  removeDB: function() {
    var req = indexedDB.deleteDatabase(this.dbName);
    req.onsuccess = function() {
      console.log("Deleted database successfully");
    };
    req.onerror = function() {
      console.log("Couldn't delete database");
    };
    req.onblocked = function() {
      console.log("Couldn't delete database due to the operation being blocked");
    };
  },

  createStore: function(type) {
    var _this = this;
    return new Ember.RSVP.Promise(
      function(resolve, reject) {
        _this.getDB().then(
          function(db) {
            var transaction = db.transaction(type, 'readwrite');
            var objectStore = transaction.objectStore(type);
            resolve(objectStore);
          },
          function(error) {
            console.log(error);
            reject(error)
          }
        );
      });
  },

  find: function(store, type, id, record) {
    var _this = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var _type = type.typeKey;
      _this.createStore(_type).then(
        function(objectStore) {
          var request = objectStore.get(id);
          request.onsuccess = function(event) {
            console.log("Found Thing - " + id);
            resolve(request.result);
          };
          request.onerror = function(event) {
            reject(event);
            console.log(event);
          };
        });
    });
  },

  createRecord: function(store, type, record) {
    console.log("CREATE RECORD");
    var _this = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var _type = type.typeKey;
      _this.createStore(_type).then(
        function(objectStore) {
          var _record = record.serialize({includeId: true});
          var request = objectStore.add(_record);
          request.onsuccess = function(event) {
            console.log("Created New " + _type);
            resolve(_record);
          };
          request.onerror = function(event) {
            reject(event);
            console.log(event);
          };
        }
      );
    });
  },

  updateRecord: function(store, type, record) {
    console.log("UPDATE RECORD");
    record.get('notes').forEach(function(n) {
      console.log(JSON.stringify(n));
    });
    var _this = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var _type = type.typeKey;
      _this.createStore(_type).then(
        function(objectStore) {
          var _record = record.serialize({includeId: false});
          _record.id = record.get('id')
          var request = objectStore.put(_record);
          request.onsuccess = function(event) {
            resolve(_record);
          };
          request.onerror = function(event) {
            reject(event);
          };
        });
    });
  },

  deleteRecord: function(store, type, record) {
    var _this = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var _type = type.typeKey;
      _this.createStore(_type).then(
        function(objectStore) {
          var deleteRequest = objectStore.delete(record.id);
          deleteRequest.onsuccess = function(event) {
            console.log("Success Deleting - " + record);
            resolve(record);
          };
          deleteRequest.onerror = function(event) {
            console.log("Error Deleting - " + record);
            reject(event);
          };
        });
    });
  },

  findAll: function(store, type, sinceToken) {
    console.log("FINDING ALL THINGS");
    console.log("------------------");
    var _this = this;
    var items = [];
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var _type = type.typeKey;
      _this.createStore(_type).then(
        function(objectStore) {
          var cursorRequest = objectStore.openCursor();
          cursorRequest.onerror = function(error) {
            reject(error);
          };
          cursorRequest.onsuccess = function(evt) {
            var cursor = evt.target.result;
            if(cursor) {
              items.push(cursor.value);
              console.log(JSON.stringify(cursor.value));
              cursor.continue();
            } else {
              console.log("------------------");
              console.log("Total - " + items.length);
              resolve(items);
            }
          };
        }
      );
    });
  },

  findHasMany: function(store, record, url, relationship) {
    console.log("HAS MANY????");
    console.log(record);
    return {};
  },

  findQuery: function(store, type, query) {
    console.log("FIND QUERY");
    //TODO
    console.log(query);
    return [];
  },

  generateIdForRecord: function() {
    return guid();
  }

});

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

export default ApplicationAdapter;
