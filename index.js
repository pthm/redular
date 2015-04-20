var redis = require('redis');
var extras = require('./extras');
var RedisEvent = require('./RedisEvent');
var shortId = require('shortid');

/**
 * Node.js scheduling system powered by Redis Keyspace Notifications
 * @param port {Number} - Port to connect to Redis
 * @param host {String} - Hostname to connect to Redis
 * @param options {Object} - See options here (https://github.com/mranney/node_redis#rediscreateclient)
 * @constructor
 */
var Redular = function(options){
  var _this = this;

  if(!options){
    options = {
      redis: {}
    };
  }

  this.options = {
    id: options.id || shortId.generate(),
    redis: {
      port: options.redis.port || 6379,
      host: options.redishost || '127.0.0.1',
      redis: options.redis.options || {}
    }
  };

  this.redisSub = redis.createClient(this.options.redis.port, this.options.redis.host, this.options.redis.options);
  this.redis = redis.createClient(this.options.redis.port, this.options.redis.host, this.options.redis.options);

  var expiryListener = new RedisEvent(this.redisSub, 'expired', /(redular:)(.+)(:)(.+)/);
  expiryListener.defineHandler(function(key){
    var eventName = key[4];
    var eventId = key[2];
    if(eventId == _this.options.id || eventId == 'global'){
      _this.handleEvent(eventName);
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
Redular.prototype.scheduleEvent = function(name, date, global){
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

  this.redis.set('redular:' + eventId + ':' + name, this.options.id);
  this.redis.expire('redular:' + eventId + ':' + name, seconds);
};

/**
 * This is called when an event occurs, if no handler exists nothing happens
 * @param name
 */
Redular.prototype.handleEvent = function(name){
  if(this.handlers.hasOwnProperty(name)){
    this.handlers[name]();
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
