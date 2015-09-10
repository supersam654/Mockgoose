/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

describe('Mockgoose Update Tests', function () {
    'use strict';

    var mockgoose = require('../../');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost:27017/TestingDB');
    var AccountModel = require('./../models/AccountModel')(mongoose);

    beforeEach(function (done) {
        mockgoose.reset();
        AccountModel.create(
            {email: 'valid@valid.com', password: 'password'},
            {email: 'invalid@invalid.com', password: 'password'},
            function (err, models) {
                expect(err).not.to.be.ok;
                expect(models).to.be.ok;
                done(err);
            });

    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$pullAll', function () {

        it('should be able to pull items from nested documents array', function (done) {
            AccountModel.create(
                {email: 'tester@valid.com', password: 'password', values: ['one', 'two']},
                function () {
                    AccountModel.findOneAndUpdate(
                        {email: 'tester@valid.com'},
                        {$pullAll: {values: ['one']}},
                        {'new': true},
                        function (err, result) {
                            expect(result).not.to.be.undefined;
                            if (result) {
                                expect(result.values.length).to.equal(1);
                                expect(result.values[0]).to.equal('two');
                                done(err);
                            } else {
                                done('Error finding item');
                            }
                        }
                    );
                });
        });

        it('should be able to pull multiple items from nested documents array by property', function (done) {
            AccountModel.create(
                {email: 'multiples@valid.com', password: 'password', values: [
                    {name: 'one'},
                    {name: 'two'},
                    {name: 'three'}
                ]},
                function () {
                    AccountModel.findOneAndUpdate(
                        {email: 'multiples@valid.com'},
                        {$pullAll: {values: [{name:'one'},{name:'two'}]}},
                        {'new': true},
                        function (err, result) {
                            expect(result).not.to.be.undefined;
                            if (result) {
                                expect(result.values.length).to.equal(1);
                                if (result.values.length === 1) {
                                    expect(result.values[0].name).to.equal('three');
                                    done(err);
                                } else {
                                    done('invalid values length');
                                }
                            } else {
                                done('Error finding models');
                            }
                        }
                    );
                });
        });
    });

});
