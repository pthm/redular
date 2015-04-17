module.exports = {
  isFunction: function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  },

  isBefore: function(date1, date2){
    if(date1 < date2){
      return false;
    } else {
      return true;
    }
  }
};
