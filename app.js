const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = ["Brush your teeth", "Eat breakfast", "Get to work"];

app.get("/", function (_req, res) {
    let today = new Date();
    let options = { weekday: 'long', month: 'long', day: 'numeric' };
    let day = today.toLocaleDateString("en-US", options);
    res.render("list", { kindOfDay: day, newListItems: items });
});

app.post("/", function (req, res) {
    let new_item = req.body.next_task;
    items.push(new_item);
    res.redirect("/");
})

app.listen(3000, function () {
    console.log("Server started on port 3000.");
})