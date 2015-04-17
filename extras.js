module.exports = {
  isFunction: function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  },

  isBefore: function(date1, date2) {
    return date1 < date2;
  }
};
