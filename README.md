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

Alternatively you can set `autoConfig` to true in the Redular options to attempt to automatically
configure Redis.

# Options
| Key        | Value   | Default                                              | Description                                                                                      |
|------------|---------|------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| id         | String  | Random string                                        | The name of the Redular client, this enables events to only be handled by specific Redis clients |
| autoConfig | Boolean | false                                                | When true Redular will attempt to automatically configure Redis                                  |
| redis      | Object  | port: 6379, host:'localhost'                         | See [here](https://github.com/mranney/node_redis#rediscreateclient) for more options             |

# Basic Usage
    var Redular = require('redular');
    
    var options = {
      redis : {
        port: 6379,
        host: 'localhost'
      }
    }
    
    //Setup Redular
    var myRedular = new Redular(options);
    
    //Define a handler for an event
    myRedular.defineHandler('test-event', function(){
        console.log('Test event!');
    })
    
    //Schedule the event to happen 5 seconds in the future
    var date = new Date();
    date.setSeconds(date.getSeconds() + 5);
    myRedular.scheduleEvent('test', date);
    
