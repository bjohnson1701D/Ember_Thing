import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('things', {path: '/things'}, function() {
    this.resource('things.thing', {path: '/:id'}, function() {
      this.route("edit", {path: "/edit"});
    });
    this.route("new", {path: "/new"});
  });
});

export default Router;
