var Redular = require('../index');


var redular = new Redular(6379, 'localhost', {});

redular.defineHandler('test', function(){
  console.log('test');
});

var date = new Date();
date.setSeconds(date.getSeconds() + 10);

redular.scheduleEvent('test', new Date(date));
