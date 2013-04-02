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
        var fn = function(x,y,z) {return x+y+z}
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
    }
};
