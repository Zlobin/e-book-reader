if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(el /*, from*/) {
    var from = Number(arguments[1]) || 0,
        len = this.length >>> 0;

    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);

    if (from < 0) {
      from += len;
    }
 
    for (;from < len; from++) {
      if (from in this && this[from] === el) {
        return from;
      }
    }

    return -1;
  };
}
