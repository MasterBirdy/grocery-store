var express = require('express');
var router = express.Router();

var item_controller = require("../controllers/itemController");
var category_controller = require("../controllers/categoryController");

// get all items
router.get('/', item_controller.item_list);


// create an item
router.get("/item/create", item_controller.item_create_get);

// post create item
router.post("/item/create", item_controller.item_create_post);

// delete one
router.get("/item/:id/delete", item_controller.item_delete_get);

// post delete
router.post("/item/:id/delete", item_controller.item_delete_post);

// update item
router.get("/item/:id/update", item_controller.item_update_get);

// post update
router.post("/item/:id/update", item_controller.item_update_post);

// get a item detail
router.get("/item/:id", item_controller.item_detail);

// create one
router.get("/category/create", category_controller.category_create_get);

//post create
router.post("/category/create", category_controller.category_create_post);
 
// delete one
router.get("/category/:id/delete", category_controller.category_delete_get);

// post delete
router.post("/category/:id/delete", category_controller.category_delete_post);

// update one
router.get("/category/:id/update", category_controller.category_update_get);

// post update
router.post("/category/:id/update", category_controller.category_update_post);

// get one
router.get("/category/:id", category_controller.category_detail);

// get all
router.get("/categories/", category_controller.category_list);

  
module.exports = router;
  