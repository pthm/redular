var redular = require('./index');

var Redular = new redular({
  autoConfig: true
});

Redular.defineHandler('testEvent', function(){
  console.log('This should only print once');
});

var now = new Date();
Redular.scheduleEvent('testEvent', now.setSeconds(now.getSeconds() + 10));

for(var i = 0; i < 300; i++){
  var now = new Date();
  var testRedular = new redular();
  console.log('Scheduling event', i+1);
  testRedular.scheduleEvent('testEvent', now.setSeconds(now.getSeconds() + 5));
}
