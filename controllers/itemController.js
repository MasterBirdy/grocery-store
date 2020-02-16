var Category = require("../schemas/category");
var Item = require("../schemas/item");
var async = require("async");
const { body,validationResult, check } = require('express-validator');
var hbs = require("hbs");

hbs.registerHelper("if_eq", function(a, b, opts) {
    if (a.toString() === b.toString())
        return opts.fn(this);
    else
        return opts.inverse(this);
});

hbs.registerHelper("if_neq", function(a, b, opts) {
    if (a !== b)
        return opts.fn(this);
    else
        return opts.inverse(this);
});

hbs.registerHelper("if_module", function(a, b, opts) {
    if (a % 3 === b)
        return opts.fn(this);
    else
        return opts.inverse(this);
});

hbs.registerHelper("at_end", function(a, b, opts){
    if (parseInt(a) === (b.length - 1))
        return opts.fn(this);
    else
        return opts.inverse(this);
})


exports.item_list = function(req, res, next) {
    Item.find()
    .populate("category")
    .exec(function(err, results) {
        if (err) {return next(err);}
        res.render("item_list", {title: "Item", items: results});
    });
}

exports.item_detail = function(req, res, next) {
    Item.findById(req.params.id)
    .populate("category")
    .exec(function(err, results) {
        if (err) {return next(err);}
        if (results == null) {
            let err = new Error("Item not found");
            err.status = 404;
            return next(err);
        }
        res.render("item_detail", {title: "Item Detail", item: results});
    })
}

exports.item_create_get = function(req, res, next) {
    Category.find()
    .exec(function(err, results) {
        if (err) {return next(err);}
        res.render("item_form", {title: "Create Item", categories: results});
    })
}

exports.item_create_post = [
    body("nameid").isLength({min: 3}).trim().withMessage("Name must be 3 charactesr or longer."),
    body("price").isDecimal({min: 0.01}).trim().withMessage("Price must be higher than $0.01."),
    body("stock").isNumeric({min: 0, max: 999}).trim().withMessage("Check your stock is between 0-999."),
    body("category").isLength({min: 1}).trim().withMessage("Author must not be empty"),
    body("description").optional({checkFalsy: true}),
    check("nameid").escape(),
    check("price").escape(),
    check("stock").escape(),
    check("category").escape(),
    check("description").escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        var item = new Item({
            name: req.body.nameid,
            price: req.body.price,
            stock: req.body.stock,
            category: req.body.category,
            description: req.body.description
        })
        if (!errors.isEmpty()) {
            Category.find()
            .exec(function(err, results) {
                if (err) {return next(err);}
                res.render("item_form", {title: "Create Item", categories: results, item, errors: errors.array()})
            })
        } else {
            item.save(function(err){
                if (err) {return next(err); }
                res.redirect(item.url);
            })
        }
    }
]

exports.item_delete_get = function(req, res, next) {
    Item.findById(req.params.id)
    .exec(function(err, results) {
        if (err) {return next(err);}
        if (results == null)
        {
            let err = new Error("item not found!");
            err.status = 404;
            return next(err);
        }
        res.render("item_delete", {title: "Delete Form", item: results});
    })
}

exports.item_delete_post = function(req, res, next) {
    Item.findById(req.body.itemid)
    .exec(function(err, results){
        if (err) {return next(err);}
        else {
            Item.findByIdAndRemove(req.body.itemid, function(err) {
                if (err) {return next(err);}
                res.redirect("/catalog");
            })
        }
    })
}

exports.item_update_get = function(req, res, next) {
    async.parallel({
        item: function(callback) {
            Item.findById(req.params.id)
            .populate("category")
            .exec(callback);
        },
        categories: function(callback) {
            Category.find()
            .exec(callback);
        }
    }, function(err, results) {
        if (err) {return next(err);}
        if (results == null) {
            let err = new Error("Item not found");
            err.status = 404;
            return next(err);
        }
        res.render("item_form", {title: "Update Item", categories: results.categories, item: results.item})
    })
}

exports.item_update_post = [
    body("nameid").isLength({min: 3}).trim().withMessage("Name must be 3 charactesr or longer."),
    body("price").isDecimal({min: 0.01}).trim().withMessage("Price must be higher than $0.01."),
    body("stock").isNumeric({min: 0, max: 999}).trim().withMessage("Check your stock is between 0-999."),
    body("category").isLength({min: 1}).trim().withMessage("Author must not be empty"),
    body("description").optional({checkFalsy: true}),
    check("nameid").escape(),
    check("price").escape(),
    check("stock").escape(),
    check("category").escape(),
    check("description").escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        var item = new Item({
            name: req.body.nameid,
            price: req.body.price,
            stock: req.body.stock,
            category: req.body.category,
            description: req.body.description,
            _id: req.params.id
        })
        if (!errors.isEmpty()) {
            Category.find()
            .exec(function(err, results) {
                if (err) {return next(err);}
                res.render("item_form", {title: "Update Item", categories: results, item, errors: errors.array()})
            })
        } else {
            Item.findByIdAndUpdate(req.params.id, item, {}, function(err, the_item) {
                if (err) {return next(err);}
                res.redirect(the_item.url);
            })
        }
    }
]