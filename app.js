const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js")

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = ["Brush your teeth", "Eat breakfast", "Get to work"];
const workItems = []

app.get("/", function (_req, res) {
    const day = date.getDate();
    res.render("list", { kindOfDay: day, newListItems: items });
});

app.post("/", function (req, res) {
    let new_item = req.body.next_task;
    if (req.body.list === "Work") {
        workItems.push(new_item);
        res.redirect("/work");
    } else {
        items.push(new_item);
        res.redirect("/");
    }
});

app.get("/work", function (req, res) {
    res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function () {
    console.log("Server started on port 3000.");
})