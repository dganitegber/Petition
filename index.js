// const signatures = require("./signatures");
const express = require("express");
const app = express();
const db = require("./db");

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(express.static("./public"));
// app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist/"));
//so req.body isn't empty
app.use(
    express.urlencoded({
        extended: false
    })
);

app.get("/", (req, res) => {
    res.render("home", {
        layout: "main"
    });
    console.log("yay home");
});

app.get("/home", req => console.log(req.body));

app.post("/", (req, res) => {
    const body = req.body;
    res.redirect("/thanks");
    console.log("thanks", "29");
    console.log(req.body, "29");
    db.addSignature(body.first, body.last, "signature");
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        layout: "main"
    });
});

app.listen(8080, () => console.log("port 8080 listening"));
