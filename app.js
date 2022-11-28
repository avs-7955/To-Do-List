const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//To get the day and date
const day = date.getDate();

//Connecting to the database
mongoose.connect('mongodb://0.0.0.0:27017/todolistDB', { useNewUrlParser: true });

//Creating the item Schema
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Wheres the task name?']
    }
})

//Model created using the schema
const Item = mongoose.model("Item", itemSchema);

//Default items of to-do list
const def_01 = new Item({
    name: "Welcome to your todolist!",
});
const def_02 = new Item({
    name: "Hit the + button to add a new item",
});
const def_03 = new Item({
    name: "<-- Hit this to delete an item",
});

const defaultItems = [def_01, def_02, def_03];

//For Custom Categories
const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function (_req, res) {

    //To read from the db
    Item.find({}, function (err, foundItems) {
        if (err) {
            console.log(err);
        } else if (foundItems.length === 0) {
            //Inserting the default items into the database when the db runs for the first time.
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Insertion successfully completed.");
                }
            });
            res.redirect("/");
        }
        else {
            res.render("list", { list_title: day, newListItems: foundItems });
        };
    });
});


app.post("/", function (req, res) {
    let new_item_name = req.body.next_task;
    const list_name = req.body.button;

    const new_item = new Item({
        name: new_item_name,
    });

    if (list_name === day) {
        new_item.save();
        res.redirect("/");
    }
    else {
        List.findOne({ name: list_name }, function (err, found_list) {
            found_list.items.push(new_item);
            found_list.save();
            res.redirect("/" + list_name);
        });
    };
});

app.post("/delete", function (req, res) {
    const item_finished_id = req.body.check_box;
    const finished_list_title = req.body.hidden;

    if (finished_list_title === day) {
        //If the default list - use the default list parameter.
        Item.findByIdAndRemove(item_finished_id, function (err) {
            if (!err) {
                console.log("Deletion successfully completed.");
                res.redirect("/");
            };
        });
    }
    else {
        //$pull is mangodb inherit command.
        List.findOneAndUpdate({ name: finished_list_title }, { $pull: { items: { _id: item_finished_id } } }, function (err, found_list) {
            if (!err) {
                res.redirect("/" + finished_list_title);
            }
        });
    }
});

// Creating dynamic pages
app.get("/:customCategoryName", function (req, res) {
    const customCategoryName = _.capitalize(req.params.customCategoryName);

    List.findOne({ name: customCategoryName }, function (err, found_list) {
        if (!err) {
            if (!found_list) {
                //Creating a new list
                const list = new List({
                    name: customCategoryName,
                    items: defaultItems,
                });
                list.save();
                res.redirect("/" + customCategoryName);
            }
            else {
                //Show an existing list
                res.render("list", { list_title: found_list.name, newListItems: found_list.items });
            };
        };
    });
});

// app.get("/about", function (req, res) {
//     res.render("about");
// });

app.listen(3000, function () {
    console.log("Server started on port 3000.");
})