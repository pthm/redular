var Redular = require('../index');


var redular = new Redular();

redular.defineHandler('test', function(){
  console.log('test');
});

var date = new Date();
date.setSeconds(date.getSeconds() + 2);

redular.scheduleEvent('test', new Date(date));
