import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ["thing"],
  countThings: Ember.computed.alias('model.length'),
  countDisplay: function() {
    var count = this.get('countThings');
    var eh = this.store.find('thing', {name: 'T1'});
    console.log(eh);
    return count + ' Thing' + (count !== 1 ? 's' : '');
  }.property('countThings'),

  actions: {
    delete: function(thing) {
      console.log('DELETING THING ' + thing.get('id'));
      thing.destroyRecord();
    },

    save: function() {
      var thing = this.store.createRecord('thing', {
        title: this.get('newTitle'),
        description: this.get('newDescription')
      });
      thing.save().then(function() {
        this.transitionToRoute('things.index');
      }.bind(this), function(error) {
        alert(error);
      });
    }
  }
});
