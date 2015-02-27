import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['things'],
  actions: {
    addNote: function(id) {
      var note = this.store.createRecord('note', {
        text: Math.random() * 3333
      });
      var thing = this.store.find('thing', id).then(
        function(t) {
          return t;
        },
        function() {
          return null;
        }
      );
      note.save().then(
        function(n) {
          thing.then(function(t) {
            t.get('notes').addObject(n);
            console.log(t.get('notes'));
            console.log("------------------------------------------")
            console.log("ADDING NOTE TO THING:")
            console.log("     NOTE: " + JSON.stringify(n));
            t.save().then(function(_t) {
              console.log("     THING: " + JSON.stringify(_t));
            })
            console.log("------------------------------------------")
          })
        });
    }
  }
});




