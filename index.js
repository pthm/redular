var redis = require('redis');
var extras = require('./extras');
var RedisEvent = require('./RedisEvent');
var shortId = require('shortid');

/**
 * Node.js scheduling system powered by Redis Keyspace Notifications
 * @param options {Object}
 * @constructor
 */
var Redular = function(options){
  var _this = this;

  if(!options){
    options = {};
  }

  if(!options.redis){
    options.redis = {};
  }

  this.options = {
    id: options.id || shortId.generate(),
    autoConfig: options.autoConfig ||  false,
    redis: {
      port: options.redis.port || 6379,
      host: options.redishost || '127.0.0.1',
      redis: options.redis.options || {}
    }
  };

  this.redisSub = redis.createClient(this.options.redis.port, this.options.redis.host, this.options.redis.options);
  this.redis = redis.createClient(this.options.redis.port, this.options.redis.host, this.options.redis.options);

  if(this.options.autoConfig){
    var config = '';
    this.redis.config("GET", "notify-keyspace-events", function(err, data){
      if(data){
        config = data[1];
      }
      if(config.indexOf('E') == -1){
        config += 'E'
      }
      if(config.indexOf('x') == -1){
        config += 'x'
      }
      _this.redis.config("SET", "notify-keyspace-events", config)
    });
  }

  var expiryListener = new RedisEvent(this.redisSub, 'expired', /(redular:)(.+)(:)(.+)/);
  expiryListener.defineHandler(function(key){
    var eventName = key[4];
    var eventId = key[2];
    if(eventId == _this.options.id || eventId == 'global'){

      _this.redis.get(key[0] + ':data', function(err, data){
        if(data){
          data = JSON.parse(data);
        }
        _this.handleEvent(eventName, data);
      });

    }
  });
};

Redular.prototype = {
  handlers: {}
};

/**
 * Schedules an event to occur some time in the future
 * @param name {String} - The name of the event
 * @param date {Date} - Javascript date object or string accepted by new Date(), must be in the future
 * @param global {Boolean} - Should this event be handled by all handlers
 */
Redular.prototype.scheduleEvent = function(name, date, global, data){
  var now = new Date();
  date = new Date(date);

  if(extras.isBefore(date, now)){
    return;
  }

  var diff = date.getTime() - now.getTime();
  var seconds = Math.floor(diff / 1000);
  var eventId = this.options.id;

  if(global){
    eventId = 'global'
  }

  if(data){
    try{
      data = JSON.stringify(data);
    } catch (e) {
      throw e;
    }
    this.redis.set('redular:' + eventId + ':' + name + ':data', data);
  }

  this.redis.set('redular:' + eventId + ':' + name, this.options.id);
  this.redis.expire('redular:' + eventId + ':' + name, seconds);
};

/**
 * This is called when an event occurs, if no handler exists nothing happens
 * @param name
 */
Redular.prototype.handleEvent = function(name, data){
  if(this.handlers.hasOwnProperty(name)){
    this.handlers[name](data);
  }
};

/**
 * Define a handler for an event name
 * @param name {String} - The event's name
 * @param action {Function} - The function to be called when the event is triggered
 */
Redular.prototype.defineHandler = function(name, action){
  if(!extras.isFunction(action)){
    throw 'InvalidHandlerException'
  }
  if(this.handlers.hasOwnProperty(name)){
    throw 'HandlerAlreadyExistsException';
  }
  this.handlers[name] = action;
};


module.exports = Redular;
