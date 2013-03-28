exports.type = function(t,o) { return o instanceof t };
exports.Just = function(value) { this.value = value };
exports.Just.prototype.v = function() { return this.value };
exports.None = function(errorMsg) { this.errorMsg = errorMsg };
exports.None.prototype.v = function() { return this.errorMsg };
