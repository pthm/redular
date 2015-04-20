var Redular = require('../index');


var redular = new Redular({
  autoConfig: true
});

redular.defineHandler('test', function(){
  console.log('test');
});

var date = new Date();
date.setSeconds(date.getSeconds() + 5);

redular.scheduleEvent('test', date);
