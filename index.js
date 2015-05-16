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

  this.handlers = {};

  if(!options){
    options = {};
  }

  if(!options.redis){
    options.redis = {};
  }

  this.options = {
    id: options.id || shortId.generate(),
    autoConfig: options.autoConfig ||  false,
    dataExpiry: options.dataExpiry || 30,
    redis: {
      port: options.redis.port || 6379,
      host: options.redis.host || '127.0.0.1',
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

  var expiryListener = new RedisEvent(this.redisSub, 'expired', /redular:(.+):(.+):(.+)/);
  expiryListener.defineHandler(function(key){
    var clientId = key[1];
    var eventName = key[2];
    var eventId = key[3];

    _this.redis.get('redular-data:' + clientId + ':' + eventName + ':' + eventId, function(err, data){
      if(data){
        data = JSON.parse(data);
      }
      if(clientId == _this.options.id || clientId == 'global'){
        _this.handleEvent(eventName, data);
      }
    });

  });
};

Redular.prototype = {
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
  var clientId = this.options.id;
  var eventId = shortId.generate();

  if(global){
    clientId = 'global'
  }

  if(data){
    try{
      data = JSON.stringify(data);
    } catch (e) {
      throw e;
    }
    this.redis.set('redular-data:' + clientId + ':' + name + ':' + eventId, data);
    this.redis.expire('redular-data:' + clientId + ':' + name + ':' + eventId, seconds + this.options.dataExpiry);
  }

  this.redis.set('redular:' + clientId + ':' + name + ':' + eventId, this.options.id);
  this.redis.expire('redular:' + clientId + ':' + name + ':' + eventId, seconds);
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
  return name;
};

Redular.prototype.getHandlers = function(){
  return this.handlers;
};

Redular.prototype.deleteHandler = function(name){
  if(this.handlers.hasOwnProperty(name)){
    delete this.handlers[name];
  }
};

Redular.prototype.getClientId = function(){
  return this.options.id;
};

module.exports = Redular;
