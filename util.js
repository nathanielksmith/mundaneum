var fs = require('fs');

var types = require('./types');

exports.stat = fs.existsSync;
exports.mkdir = fs.mkdir;
exports.read = fs.readFileSync;
exports.log = console.log;
exports.error = console.error;
exports.map = function(f, a) { return a.map(f); };
exports.filter = function(f, a) { return a.filter(f); };

var __slice = Array.prototype.slice.call.bind(Array.prototype.slice);

exports.variadic = function(fn) {
    // adapted from allong.es
    var fnLength = fn.length;
    if (fnLength === 0) return fn;
    else if (fnLength === 1) {
        return function() {
            var args = __slice(arguments);
            return fn.call(this, args);
        };
    }
    else {
        return function() {
            var numberOfArgs = arguments.length,
              namedArgs = __slice(arguments, 0, fnLength - 1),
              numberOfMissingNamedArgs = Math.max(fnLength - numberOfArgs - 1, 0),
              argPadding = new Array(numberOfMissingNamedArgs),
              variadicArgs = __slice(arguments, fnLength - 1);
            return fn.apply(this, namedArgs.concat(argPadding).concat([variadicArgs]))
        };
    }
};

exports.get = function(obj, p) { return obj[p] }
exports.getWith = function(p, obj) { return exports.get(obj, p) }

exports.extend = exports.variadic(function(t, os) {
    os.forEach(function(o) {
        for (var key in o) {
            if (o.hasOwnProperty(key)) t[key] = o[key];
        }
    });
});

exports.compose = exports.variadic(function(fns) {
    return fns.reduce(function(fnFst, fnSnd) {
        return exports.variadic(function(args) {
            return fnFst(fnSnd.apply(this, args));
        });
    });
});

exports.maybe = function(fn) {
    return exports.variadic(function(args) {
        try {
            return new types.Just(fn.apply(this, args));
        }
        catch (e) {
            return new types.None(e);
        }
    });
};

exports.applyFirst = function(fn, arg) {
    return function() {
        var args = exports.__slice(arguments);
        return fn.apply(this, [arg].concat(args));
    };
}

exports.__slice = __slice;
exports.tuples2obj = function(tuples) {
    var obj = {};
    tuples.forEach(function(t) {obj[t[0]] = t[1]});
    return obj;
};

exports.applyArg = function(fn) {
    return function() {
        var args = exports.__slice(arguments).pop();
        return fn.apply(this, args);
    }
};

exports.arity = function(a) {
    return function(fn) {
        return function() {
            if (arguments.length !== a)
                throw (fn.name||'function') + " expects " + a + " arguments; " + " got " + arguments.length;
            return fn.apply(this, arguments);
        };
    };
};

exports.endResponse = function(statusCode, response) {
    response.writeHead(statusCode);
    response.end();
};

exports.two = exports.applyFirst(exports.endResponse, 200);
exports.four = exports.applyFirst(exports.endResponse, 400);
exports.five = exports.applyFirst(exports.endResponse, 500);
