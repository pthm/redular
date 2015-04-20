var Redular = require('../index');

var redular = new Redular();

redular.defineHandler('test', function(name){
  console.log('Hello from the future, ' + name);
});

var date = new Date();
date.setSeconds(date.getSeconds() + 5);

redular.scheduleEvent('test', date, false, 'pthm');
