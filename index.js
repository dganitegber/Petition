// const signatures = require("./signatures");
const express = require("express");
const app = express();
const db = require("./db");
const bcrypt = require("./bcrypt");
var cookieSession = require("cookie-session");
// const csurf = require("csurf");

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(express.static("./public"));
// app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist/"));
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
//so req.body isn't empty
app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main"
    });
});

app.get("/login", (req, res) => {
    if (req.session.userId === undefined) {
        console.log(req.session.userId, "req.session.userId", "login");
        res.redirect("/register");
    } else {
        console.log(req.session.userId, "req.session.userId", "login");
        res.redirect("/petition");
    }
});

app.get("/", (req, res) => {
    if (req.session.userId === undefined) {
        console.log(req.session.userId, "req.session.userId", "/");
        res.redirect("/register");
    } else {
        console.log(req.session.userId, "req.session.userId", "/");
        res.redirect("/petition");
    }
});
//----------------------app post register-----------------------
app.post("/register", (req, res) => {
    var body = req.body;
    console.log(body);
    if (
        body.first.length !== 0 &&
        body.last.length !== 0 &&
        body.email.length !== 0 &&
        body.password.length !== 0
    ) {
        let password = body.password;
        bcrypt.hash(password).then(hashedpw => {
            db.addUser(body.first, body.last, body.email, hashedpw)

                .then(results => {
                    console.log("results", results);
                    req.session.userId = results.rows[0].id;
                    res.redirect("/petition");
                    console.log(req.session);
                })

                .catch(err => {
                    console.log(err);
                    var oops = "Email address already exists!";
                    console.log("this is the error");
                    res.render("register", {
                        layout: "main",
                        oops
                    });
                });
        });
    } else {
        const oops = "Please fill the correct forms";
        res.render("register", {
            err: "Error",
            oops
        });
    }
}); //closes app.post register
//----------------------app post register-----------------------
app.use(
    express.urlencoded({
        extended: false
    })
);
//----------------------app post login-----------------------
app.post("/login", (req, res) => {
    var body = req.body;
    if (body.email.length !== 0 && body.password.length !== 0) {
        db.findPassword(body.email, body.password)
            .then(results => {
                bcrypt
                    .compare(body.password, results.rows[0].password)
                    .then(val => {
                        if (val === true) {
                            db.findIdByEmail(body.email)
                                .then(find => {
                                    req.session.userId = find.rows[0].id;
                                    console.log(req.session.userId, "95");
                                    db.getSignature(req.session.userId).then(
                                        signature => {
                                            if (signature.rows.length > 0) {
                                                var sign =
                                                    signature.rows[0].signature;
                                                db.getAll()
                                                    .then(results => {
                                                        console.log("im here");
                                                        let noOfSigners =
                                                            results.rows.length;
                                                        res.render("thanks", {
                                                            layout: "main",

                                                            sign,
                                                            noOfSigners
                                                        });

                                                        //ADD FIRST NAME;
                                                    })
                                                    .catch(err => {
                                                        console.log(
                                                            "im here",
                                                            err
                                                        );
                                                        res.render("login", {
                                                            err
                                                        });
                                                    });
                                            } else {
                                                console.log("this happened");
                                                res.redirect("/petition");
                                            }
                                        }
                                    );

                                    // if (user_id != 0) {
                                    //     res.redirect("petition");
                                    // }
                                })
                                .catch(err => {
                                    console.log("im here", err);
                                    res.render("login", {
                                        err
                                    });
                                });
                            //something with cookieSession
                            //check if petition is signed = if signature is there
                        } else {
                            const oops = "Email and Password do no match!";
                            res.render("login", {
                                err: "Error",
                                oops
                            });
                        }
                    });
            })
            .catch(err => {
                console.log("im here", err);
                res.render("login", {
                    err
                });
            });
    } else {
        const oops = "Please fill the correct forms";
        res.render("login", {
            err: "Error",
            oops
        });
    }
});

//----------------------app post login-----------------------

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main"
    });
});

app.get("/petition", (req, res) => {
    db.getFirstName(req.session.userId)
        .then(results => {
            var first = results.rows[0].first;
            var last = results.rows[0].last;

            res.render("petition", {
                layout: "main",
                first,
                last
            });
        })
        .catch(err => {
            console.log(err);
            res.render("petition", {
                err
            });
        });
});

app.post("/petition", (req, res) => {
    var body = req.body;
    //add conditions and ifs
    if (
        body.first.length !== 0 &&
        body.last.length !== 0 &&
        body.signature.length != 1326
    ) {
        db.addSignature(body.signature, req.session.userId)
            .then(() => {
                db.getAll().then(results => {
                    const sign = req.body.signature;
                    const first = body.first;
                    let noOfSigners = results.rows.length;
                    res.render("thanks", {
                        layout: "main",
                        first,
                        sign,
                        noOfSigners
                    });
                });
            })
            .catch(err => {
                res.render("petition", {
                    err
                });
            });
    } else {
        const oops = "Please fill the correct forms";
        res.render("petition", {
            err: "Error",
            oops
        });
    }
});

app.get("/signers", (req, res) => {
    db.getNames()
        .then(results => {
            console.log(results.rows);
            var names = results.rows;
            res.render("signers", {
                layout: "main",
                names
            });
        })
        .catch(err => {
            console.log(" error 231");
            res.render("signers", {
                err
            });
        });
});

app.listen(process.env.PORT || 8080, () => console.log("port 8080 listening"));
