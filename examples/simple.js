var Redular = require('../index');

var redular = new Redular();

redular.defineHandler('goodbye', function(name){
  console.log('Goodbye!');
});

redular.defineHandler('test', function(name){
  console.log(name);
});

var date = new Date();
date.setSeconds(date.getSeconds() + 6);
redular.scheduleEvent('goodbye', date);

date = new Date();
date.setSeconds(date.getSeconds() + 5);
redular.scheduleEvent('test', date, false, 'Bar');

date = new Date();
date.setSeconds(date.getSeconds() + 3);
redular.scheduleEvent('test', date, false, 'Foo');
