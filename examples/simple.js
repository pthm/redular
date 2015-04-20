var Redular = require('../index');

var redular = new Redular();

redular.defineHandler('test', function(){
  console.log('Triggered in the future');
});

var date = new Date();
date.setSeconds(date.getSeconds() + 5);

redular.scheduleEvent('test', date);
