#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./schemas/item')
var Category = require('./schemas/category')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = []
var categories = []

function categoryCreate(title, cb) {
    let categoryDetail = {title};
    let category = new Category(categoryDetail);
    category.save(function(err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log("New Category: " + category);
        categories.push(category);
        cb(null, category);
    });
}

function itemCreate(name, description, category, price, stock, cb) {
    let itemDetail = {name, description, price, stock};
    if (category != false) itemDetail.category = category;
    let item = new Item(itemDetail);
    item.save(function(err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log("New Item: " + item);
        items.push(item);
        cb(null, item);
    });
}

function createCategories(cb) {
    async.series([
        function(callback) {
            categoryCreate("Fruit", callback);
        },
        function(callback) {
            categoryCreate("Vegetable", callback);
        },
        function(callback) {
            categoryCreate("Meat", callback);
        },
        function(callback) {
            categoryCreate("Dairy", callback);
        },
        function(callback) {
            categoryCreate("Packaged Food", callback);
        }
    ], cb);
}

function createFruits(cb) {
    async.parallel([
        function(callback) {
            itemCreate("Apple", "a sweet apple", categories[0], .99, 5, callback);
        },
        function(callback) {
            itemCreate("Banana", "go banana for these!", categories[0], .30, 9, callback);
        },
        function(callback) {
            itemCreate("Pineapple", "hawaiian surprise", categories[0], 2.50, 3, callback);
        },
        function(callback) {
            itemCreate("Durian", "don't eat this", categories[0], 5.00, 0, callback);
        },
        function(callback) {
            itemCreate("Kiwi", "pretty good", categories[0], .50, 2, callback);
        }
    ], cb);
}

function createVegetables(cb) {
    async.parallel([
        function(callback) {
            itemCreate("Carrot", "they're ok", categories[1], 1.00, 2, callback);
        },
        function(callback) {
            itemCreate("Lettuce", false, categories[1], 1.10, 1, callback);
        }
    ], cb);
}

function createMeat(cb) {
    async.parallel([
        function(callback) {
            itemCreate("Prime Rib", "now that's what i'm talking about", categories[2], 10.00, 2, callback);
        },
        function(callback) {
            itemCreate("Beef", "BEEF", categories[2], 3.99, 0, callback);
        }
    ], cb);
}

function createDairy(cb) {
    async.parallel([
        function(callback) {
            itemCreate("Blue Stilton", "a classic that keith likes", categories[3], 9.99, 1, callback);
        }
    ], cb);
}

async.series([
    createCategories,
    createFruits,
    createVegetables,
    createMeat,
    createDairy
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log("good job");
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



