(function() {

  function trim_nulls(data) {
    var y;
    for (var x in data) {
      y = data[x];
      if (y === "null" || y === null || y === "" || typeof y === "undefined" || (y instanceof Object && Object.keys(y).length === 0)) {
        delete data[x];
      }
      if (y instanceof Object) y = trim_nulls(y);
    }
    return data;
  }

  /**
   * Compact arrays with null entries; delete keys from objects with null value
   *
   * @param {json} data
   * @returns data with nulls removed.
   */
  exports.removeNulls = function(data) {
    var obj2 = JSON.parse(JSON.stringify(data));
    return trim_nulls(obj2);
  };

  exports.getUuid = function(){
    var uuidV4 = require('uuid/v4');
    return uuidV4();
  };

  exports.catchError = function(req, res, e) {
    result = {
        "code": e.code || 400,
        "message": e.name + " -- " + e.message,
        "fields": e.fields || null
      };
    res.end(JSON.stringify(trim_nulls(result)));
  };
}());
