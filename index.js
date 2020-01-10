// const signatures = require("./signatures");
const express = require("express");
const app = express();
const db = require("./db");
var cookieSession = require("cookie-session");
const csurf = require("csurf");

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
    console.log("yay home");
});

app.get("/home", req => console.log(req.body));

app.post("/", (req, res) => {
    const body = req.body;
    console.log(req.body, "29");
    //add conditions and ifs
    db.addSignature(body.first, body.last, body.signature).then(results => {
        const sign = req.body.signature;
        const first = body.first;
        console.log("data", results.rows);
        // req.session.signatureID = results.rows[0].id;
        // var id = results.rows[0].id;
        res.redirect("/thanks").then(
            res.render("thanks", {
                layout: "main",
                first,
                sign
            })
        );
    });
});

app.listen(8080, () => console.log("port 8080 listening"));
