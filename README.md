# redular
Node.js event scheduling system powered by Redis keyspace notifications.

**This is a work in progress**

# How it works
This sets keys in redis with expiry times, then using the keyspace notifications triggers handlers defined in your code.

This is useful because it means you can define handlers and trigger them from anywhere in your infrastructure.

# Installation
`npm install redular`

This module requires at least version 2.8.0 of Redis
You must enable Keyspace Notifications (Specifically expiry)

You can use the following command inside `redis-cli` to enable expiry keyspace notificaitons.
`config set notify-keyspace-events Ex`

# Basic Usage
    var Redular = require('redular');
    
    var options = {
      redis : {
        port: 6379,
        host: 'localhost'
      }
    }
    
    var myRedular = new Redular(options);
    
    myRedular.defineHandler('test-event', function(){
        console.log('This would happen in the future');
    })
    
    myRedular.scheduleEvent('test-event', new Date('3000-01-01T12:00:00Z');
