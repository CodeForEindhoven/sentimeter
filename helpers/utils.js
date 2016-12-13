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
}());
