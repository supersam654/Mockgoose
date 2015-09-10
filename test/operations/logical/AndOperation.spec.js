/*jshint expr: true*/
/*jshint -W079 */ //redefined expect
var expect = require('chai').expect;

describe('Mockgoose $and Tests', function () {
    'use strict';

    var mockgoose = require('../../..');
    var Mongoose = require('mongoose').Mongoose;
    var mongoose = new Mongoose();
    mockgoose(mongoose);
    mongoose.connect('mongodb://localhost/TestingDB77');

    var Schema = new mongoose.Schema({
        price: Number,
        qty: Number,
        sale: Boolean,
        historyprice: [Number]
    });
    var Model = mongoose.model('AllTests', Schema);

    beforeEach(function (done) {
        mockgoose.reset();
        Model.create(
            {
                price: 1.99,
                qty: 21,
                sale: true,
                historyprice: [1.90, 1.77, 1.50]
            },
            {
                price: 1.99,
                qty: 21,
                sale: true,
                historyprice: [20, 42]
            },
            {
                price: 1.99,
                qty: 19,
                sale: true
            },
            {
                price: 1.99,
                qty: 21,
                sale: false
            }, {
                price: 1,
                qty: 21,
                sale: false
            }
        ).then(function () {
                done();
            });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('$and Tests', function () {
        it('Find values that match $and operation', function (done) {
            Model.find({ $and: [
                { price: 1.99 },
                { qty: { $gt: 20 } },
                { sale: true }
            ] }).exec().then(function (results) {
                    expect(results.length).to.equal(2);
                    done();
                }
            );
        });

        it('Find values that match implicit $and operation', function (done) {
            Model.find({ price: 1.99, qty: { $gt: 20 }, sale: true }).exec().then(function (results) {
                expect(results.length).to.equal(2);
                done();
            });
        });

        it('Find values that match $and operation containing implicit $and operations', function (done) {
            Model.find({ $and: [
                { price: 1.99, sale: true },
                { qty: { $gt: 20 }, sale: true }
            ] }).exec().then(function (results) {
                    expect(results.length).to.equal(2);
                    done();
                }
            );
        });

        it('Perform the $and operation on a single field', function (done) {
            Model.update({ $and: [
                { price: { $ne: 1.99 } },
                { price: { $gt: 0 } }
            ] }, { $set: { qty: 15 } }).exec().then(function (result) {
                expect(result.n).to.equal(1);
                done();
            });
        });

        it('Perform the $and operation on a single field combined', function (done) {
            Model.update({ price: { $ne: 1.99, $gt: 0 } }, { $set: { qty: 15 } }).exec().then(function (result) {
                expect(result.n).to.equal(1);
                done();
            });
        });

        it('Find values that match $or inside $and operation', function (done) {
            Model.find({ $and: [
                { price: 1.99 },
                { $or: [{qty: 19}, {sale: false}] }
            ] }).exec().then(function (results) {
                    expect(results.length).to.equal(2);
                    done();
                }
            );
        });

        it('$and in an array of values', function (done) {
            Model.find({ $and: [
                { historyprice: 1.90 },
                { price: 1.99 }
            ]}).exec().then(function(results) {
                expect(results.length).to.equal(1);
                done();
            });
        });

        describe('Mongoose', function () {
            it('Find values with Mongoose and operation', function (done) {
                Model.find().and([
                        { price: 1.99 },
                        { qty: { $gt: 20 } },
                        { sale: true }
                    ]).exec().then(function (results) {
                        expect(results.length).to.equal(2);
                        done();
                    }
                );
            });
        });
    });

    describe('$and Tests Bugs', function () {
        describe('#41 Unexpected behavior such as null err and result with findOneAndUpdate `$and` queries', function () {
            var AccountModel = require('../../models/AccountModel')(mongoose);
            beforeEach(function(done){
                AccountModel.create(
                    {email: 'valid@valid.com', password: 'password', href:'href'},
                    {email: 'invalid@invalid.com', password: 'password', href:'href'},
                    done);
            });

            it('Should find by both email and password', function (done) {
                AccountModel.find({$and:[{email: 'valid@valid.com'}, {href: 'href'}]}).exec().then(function(results){
                    expect(results.length).to.equal(1);
                    var result = results[0];
                    if(result){
                        expect(results[0].email).to.equal('valid@valid.com');
                        expect(results[0].href).to.equal('href');
                    }
                    done();
                });
            });

            it('Should find by both email and password implicit', function (done) {
                AccountModel.find({email: 'valid@valid.com', href: 'href'}).exec().then(function(results){
                    expect(results.length).to.equal(1);
                    var result = results[0];
                    if(result){
                        expect(results[0].email).to.equal('valid@valid.com');
                        expect(results[0].href).to.equal('href');
                    }
                    done();
                });
            });
        });
    });
});
