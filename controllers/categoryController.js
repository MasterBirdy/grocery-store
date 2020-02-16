var Category = require("../schemas/category");
var Item = require("../schemas/item");
var async = require("async");
const { body,validationResult, check } = require('express-validator');

exports.category_list = function(req, res, next) {
    Category.find()
    .exec(function(err, results) {
        if (err) {return next(err);}
        res.render("category_list", {title: "Category List", categories: results});
    });
}

exports.category_detail = function(req, res, next) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
            .exec(callback);
        },
        items: function(callback) {
            Item.find({"category": req.params.id})
            .exec(callback);
        }
    }, function(err, results) {
        if (err) {return next(err);}
        if (results == null) {
            let err = new Error("Category Not Found");
            err.status = 404;
            return next(err);
        }
        res.render("item_list", {title: results.category.title, items: results.items, category: results.category})
    })
    
}

exports.category_create_get = function(req, res, next) {
    res.render("category_form", {title: "Create Category"});
}

exports.category_create_post = [
    body("title", "Title must be three characters or longer").isLength({min: 3}).trim(),
    check("title").escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        var category = new Category({
            title: req.body.title
        });
        if (!errors.isEmpty()) {
            res.render("category_form", {title: "Create Category", category, errors: errors.array()});
        } else {
            Category.findOne({"title": req.body.title})
            .exec(function(err, found_category) {
                if (err) {return next(err);}
                if (found_category) {
                    res.redirect(found_category.url);
                } else {
                    category.save(function(err) {
                        if (err) {return next(err);}
                        res.redirect(category.url);
                    })
                }
            })
        }
    }
]

exports.category_delete_get = function(req, res, next) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
            .exec(callback);
        },
        items: function(callback) {
            Item.find({"category": req.params.id})
            .exec(callback);
        }
    }, function(err, results) {
        if (err) {return next(err);}
        if (results == null) {
            let err = new Error("category not found");
            err.status = 404;
            return next(err);
        }
        res.render("category_delete", {title: "Delete Form", items: results.items, category: results.category})
    })
}

exports.category_delete_post = function(req, res, next) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.body.categoryid)
            .exec(callback);
        },
        items: function(callback) {
            Item.find({"category": req.body.categoryid})
            .exec(callback);
        }
    }, function(err, results){
        if (err) {return next(err);}
        if (results.items.length > 0) {
            res.render("category_delete", {title: "Delete Form", items: results.items, category: results.category})
        } else {
            Category.findByIdAndRemove(req.body.categoryid, function(err, results) {
                if (err) {return next(err);}
                res.redirect("/catalog/categories")
            })
        }
    })
}

exports.category_update_get = function(req, res, next) {
    Category.findById(req.params.id)
    .exec(function(err, results) {
        if (err) {return next(err);}
        if (results == null)
        {
            let err = new Error("Category not found");
            err.status = 404;
            return next(err);
        }
        res.render("category_form", {title: "Update Category", category: results});
    })
}

exports.category_update_post = [
    body("title", "Title must be three characters or longer").isLength({min: 3}).trim(),
    check("title").escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        var category = new Category({
            title: req.body.title,
            _id: req.params.id
        });
        if (!errors.isEmpty) {
            res.render("category_form", {title: "Update Category", category, errors: errors.array()})
        } else {
            Category.findByIdAndUpdate(req.params.id, category, {}, function(err, the_category){
                if (err) {return next(err);}
                res.redirect(the_category.url);
            })
        }
    }
]