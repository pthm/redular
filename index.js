var redis = require('redis');
var extras = require('./extras');
var RedisEvent = require('./RedisEvent');

/**
 * Node.js scheduling system powered by Redis Keyspace Notifications
 * @param port {Number} - Port to connect to Redis
 * @param host {String} - Hostname to connect to Redis
 * @param options {Object} - See options here (https://github.com/mranney/node_redis#rediscreateclient)
 * @constructor
 */
var Redular = function(port, host, options){
  var _this = this;

  this.handlers = {};
  this.redisSub = redis.createClient(port, host, options);
  this.redis = redis.createClient(port, host, options);

  var expiryListener = new RedisEvent(this.redisSub, 'expired', /(redular:event:)(.+)/);
  expiryListener.defineHandler(function(key){
    var eventName = key[2];
    _this.handleEvent(eventName);
  });
};

/**
 * Schedules an event to occur some time in the future
 * @param name {String} - The name of the event
 * @param date {Date} - Javascript date object when the event should occur, must be in the future
 */
Redular.prototype.scheduleEvent = function(name, date){
  var now = new Date();
  if(extras.isBefore(date, now)){
    return;
  }

  var diff = date.getTime() - now.getTime();
  var seconds = Math.abs(diff / 1000);

  this.redis.set('redular:event:' + name, name);
  this.redis.expire('redular:event:' + name, seconds);
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
