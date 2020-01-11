// const signatures = require("./signatures");
const express = require("express");
const app = express();
const db = require("./db");
var cookieSession = require("cookie-session");
const csurf = require("csurf");
var noOfSigners = db.countEntries();

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

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 6
    })
);

app.get("/", (req, res) => {
    res.render("home", {
        layout: "main"
    });
});

app.get("/home", () => console.log(""));

app.post("/", (req, res) => {
    const body = req.body;
    //add conditions and ifs
    if (
        body.first.length !== 0 &&
        body.last.length !== 0 &&
        body.signature.length != 1326
    ) {
        db.addSignature(body.first, body.last, body.signature)
            .then(() => {
                const sign = req.body.signature;
                const first = body.first;

                res.render("thanks", {
                    layout: "main",
                    first,
                    sign,
                    noOfSigners
                });
            })
            .catch(err => {
                res.render("home", {
                    err
                });
            });
    } else {
        const oops = "Please fill the correct forms";
        res.render("home", {
            err: "Error",
            oops
        });
    }
});

app.listen(8080, () => console.log("port 8080 listening"));
