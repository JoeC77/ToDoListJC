
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

const item1 = new Item ({
  name: "Buy Food"
});
const item2 = new Item ({
  name: "Study"
});
const item3 = new Item ({
  name: "Get some exercise"
});

const workItems = [item1, item2, item3];
const day = date.getDate();

// Item.insertMany([item1, item2, item3], function(err){
//   if(err){
//     console.log(err);
//   } else{
//     console.log("Entries succesfully entered");
//   }
// });

// Item.find({}, function(err, items){
//   if(err){
//     console.log(err);
//   } else{
//     items.forEach(function(item){
//       console.log(item.name);
//     });
//   }
// });

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany([item1, item2, item3], function(err){
      console.log("Entries succesfully entered");
    });
    res.redirect("/");
    } else {
      res.render("list", { listTitle: day, newListItems: foundItems });
    };
  });
});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list;

  const newEntry = new Item ({
    name: item
  });

  if(listName === day){
    newEntry.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newEntry);
      foundList.save();
      res.redirect("/" + listName);
    });
  };
});

app.post("/delete", function(req, res){

  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day){
    Item.deleteOne({ _id: itemId }, function (err) {
      if (!err) {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  };
});

app.get("/:customListName", function(req, res){
  let customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: workItems
        });
        list.save();
        res.redirect("/"+ customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      };
    }
  });
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
