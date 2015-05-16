var should = require('should');
var redular = require('../index');

describe('Redular', function(){

  var options = {
    autoConfig: true
  };

  var Redular1 = new redular(options);
  var Redular2 = new redular(options);

  beforeEach(function() {
    Redular1.deleteHandler('testEvent');
    Redular2.deleteHandler('testEvent');
  });

  it('should be able to define a handler', function(done){
    Redular1.defineHandler('testEvent', function(){});
    var handlers = Redular1.getHandlers();
    if(handlers.hasOwnProperty('testEvent')){
      done();
    } else {
      throw 'Handler not defined'
    }
  });

  it('should be able to schedule and handle an event', function(done){
    Redular1.defineHandler('testEvent', function(){
      done();
    });

    var now = new Date();
    Redular1.scheduleEvent('testEvent', now.setSeconds(now.getSeconds() + 2));
  });

  it('should not handle events with different names', function(done){
    Redular1.defineHandler('testEvent2', function(){
      throw 'Invalid name'
    });

    var now = new Date();
    Redular1.scheduleEvent('testEvent', now.setSeconds(now.getSeconds() + 2));

    setTimeout(function(){
      done();
    }, 1500)
  });

  it('should not handle events for other Redular instances', function(done){
    Redular1.defineHandler('testEvent', function(){
      setTimeout(function(){
        done();
      }, 1000)
    });

    Redular2.defineHandler('testEvent', function(){
      throw 'Wrong instance';
    });

    var now = new Date();
    Redular1.scheduleEvent('testEvent', now.setSeconds(now.getSeconds() + 2));
  });

  it('should generate unique ids for all instances', function(done){
    if(Redular1.getClientId() != Redular2.getClientId){
      done();
    } else {
      throw 'Ids should not match'
    }
  });

  it('should not be able to define multiple handlers with the same name', function(done){
    Redular1.defineHandler('testEvent', function(){});
    try{
      Redular1.defineHandler('testEvent', function(){});
    } catch(e) {
      done();
    }
  });

  it('should handle global events from other instances', function(done){
    Redular2.defineHandler('testEvent', function(){
      done();
    });

    var now = new Date();
    Redular1.scheduleEvent('testEvent', now.setSeconds(now.getSeconds() + 1), true);
  });

  it('should be able to pass data to events', function(done){
    Redular1.defineHandler('testEvent', function(data){
      if(data.test = 'Hello'){
        done();
      } else {
        throw 'No data'
      }
    });

    var now = new Date();
    Redular1.scheduleEvent('testEvent', now.setSeconds(now.getSeconds() + 2), false, {test: 'Hello'});
  });

});
