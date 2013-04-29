var types = require('../types'),
util = require('../util');

exports.testUtil = {
    testExtend: function(test) {
        var target = {};
        var sourceOne = {
            one:1,
            two:2,
            three:3
        };
        var sourceTwo = {
            four:4,
            five:5,
            six:6
        };
        util.extend(target, sourceOne, sourceTwo);
        test.equal(target.one, 1);
        test.equal(target.two, 2);
        test.equal(target.three, 3);
        test.equal(target.four, 4);
        test.equal(target.five, 5);
        test.equal(target.six, 6);
        test.done();
    },
    testCompose: function(test) {
        var map = function(f, a) { return a.map(f) }
        var square = function(x) { return x * x }
        var sum = function(a) { return a.reduce(function(x,y) { return x + y }) }
        var addOne = function(x) { return x+1 }
        var things = [1,2,3];
        var result = util.compose(addOne, sum, map.bind(null, square))(things);
        test.equal(result, 15);
        test.done();
    },
    testGetWith: function(test) {
        var obj = {a:'hello'};
        var ret = util.getWith('a', obj);
        test.equal(ret, 'hello');
        test.done();
    },
    testGet: function(test) {
        var obj = {a:'hello'};
        var ret = util.get(obj, 'a');
        test.equal(ret, 'hello');
        test.done();
    },
    testApplyFirst: function(test) {
        var fn = function(greeting, whom) {
            return greeting + ', ' + whom + '!';
        }
        var ret = util.applyFirst(fn, 'hello')('nate');
        test.equal(ret, 'hello, nate!');
        test.done();
    },
    testMaybe: function(test) {
        var throwing = function() { throw "an error" }
        var nothrow = function() { return "a value" }

        var noneResult = util.maybe(throwing)();
        test.equal(noneResult.v(), 'an error');
        var valResult = util.maybe(nothrow)();
        test.equal(valResult.v(), 'a value');

        test.done();
    },
    testSlice: function(test) {
        (function(x,y,z) {
            var args = util.__slice(arguments);
            test.ok(args instanceof Array);
            test.deepEqual(args, [1,2,3]);
        })(1,2,3);

        test.done();
    },
    testTuples2Obj: function(test) {
        var tuples = [
            ['key0', 'value0'],
            ['key1', 'value1'],
            ['key2', 'value2'],
            ['key3', 'value3']
        ];
        var obj = util.tuples2obj(tuples);
        test.deepEqual(obj, {
            key0:'value0',
            key1:'value1',
            key2:'value2',
            key3:'value3'
        });
        test.done();
    },
    testApplyArg: function(test) {
        var fn = function(x,y,z) {
            test.equal(x, 'hi');
            test.equal(y, 'there');
            test.equal(z, 'how');
            return x+y+z
        }
        var wrapped = util.applyArg(fn);
        var result = wrapped(['hi', 'there', 'how']);
        test.equal(result, 'hitherehow');
        test.done();
    },
    testArity: function(test) {
        var fn = function(x,y,z) {return x+y+z}
        var wrapped = util.arity(3)(fn);
        var result = wrapped('hi', 'there', 'how');
        test.equal(result, 'hitherehow');
        test.throws(function() { wrapped(1,2) });
        test.done();
    },
};

exports.testVariadic = {
    testNoArgs: function(test) {
        var fn = function() { return 'a' }
        test.ok(util.variadic(fn)(), 'a');
        test.done();
    },
    testOneArg: function(test) {
        var fn = function(a) { return a }
        var ret = util.variadic(fn)(1,2,3,4,5);
        test.deepEqual([1,2,3,4,5], ret);
        test.done();
    },
    testNArgs: function(test) {
        var fn = function(a, b, c, rest) {
            return [a, b, c, rest];
        }
        var args = [1,2,3,4,5,6,7,8,9];
        var ret = util.variadic(fn)(1,2,3,4,5,6,7,8,9);
        test.deepEqual([1,2,3,[4,5,6,7,8,9]], ret);
        test.done();
    }
};

exports.testSkipUntil = {
    setUp: function(cb) {
        this.fn = function(x) { return x % 2 === 0 }
        cb();
    },
    testMany: function(test) {
        var a = [1,1,3,5,7,5,2,4,4,2,6,3,3,3];
        var result = util.skipUntil(this.fn, a);
        test.deepEqual(result, [2,4,4,2,6,3,3,3]);
        test.done();
    },
    testImmediate: function(test) {
        var a = [2,3,4,5,6];
        var result = util.skipUntil(this.fn, a);
        test.deepEqual(result, [2,3,4,5,6]);
        test.done();
    },
    testEmpty: function(test) {
        var a = [];
        var result = util.skipUntil(this.fn, a);
        test.deepEqual(result, []);
        test.done();
    },
    testNone: function(test) {
        var a = [1,3,5,7];
        var result = util.skipUntil(this.fn, a);
        test.deepEqual(result, []);
        test.done();
    }
};
