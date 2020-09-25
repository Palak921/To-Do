//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");   //using capitalize

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-palak:Test123@todolist.xakwo.mongodb.net/todoDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//mongoose.connect("mongodb://localhost:27017/todoDB", {
//    useNewUrlParser: true,
//    useUnifiedTopology: true
//});...............................................for local mongo shell




const itemsSchema = {
    name: String
};
const item = mongoose.model("item", itemsSchema);
const item1 = new item({
    name: "Welcome to your ToDo List"
})
const item2 = new item({
    name: "Hit the + button to add a new item"
})
const item3 = new item({
    name: "<-- Hit this to delete an item"
})

const defaultItem = [item1, item2, item3];


const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("list", listSchema);


app.get("/", function (req, res) {

    item.find({}, function (err, items) {
        if (items.length === 0) {
            item.insertMany(defaultItem, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Ïtems Inserted!!");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: items
            });
        }
    });
});


app.get("/:customList", function (req, res) {
    const customListName = _.capitalize(req.params.customList);

    List.findOne({name: customListName}, function (err, results) {
        if (!err) {
            if (!results) {
                const list = new List({
                    name: customListName,
                    items: defaultItem
                });
                
                list.save();
                res.redirect("/" + customListName);
            } 
            else {
                res.render("list", {
                    listTitle: results.name,
                    newListItems: results.items
                });
            }
        }
    });
});



app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listItem = req.body.list;

    const insertItem = new item({
        name: itemName
    });
    if (listItem === "Today") {
        insertItem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listItem},
                     function (err, results) {
            results.items.push(insertItem);
            results.save();
            res.redirect("/" + listItem);
        })

    }
});

app.post("/delete", function (req, res) {
    const check = req.body.checkbox;
    const listName = req.body.listItem;

    if (listName === "Today") {
        item.findByIdAndRemove(check, function (err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/");
                console.log("Deleted Succesfully!!!");
            }
        });
    } else {
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                items: {
                    _id: check
                }
            }
        }, function (err, results) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }


});





let port = process.env.PORT;
if(port== null || port==""){
    port=3000;
}
app.listen(port, function () {
    console.log("Server has started succesfully!!!");
});
