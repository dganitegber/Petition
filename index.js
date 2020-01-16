// const signatures = require("./signatures");
const express = require("express");
const app = express();
const db = require("./db");
const bcrypt = require("./bcrypt");
var cookieSession = require("cookie-session");
const csurf = require("csurf");

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
// app.use(function(req, res, next) {
//     res.set("x-frame-options", "DENY");
//     res.locals.csrfToken = req.csrfToken();
//     next();
// });

function requireLoggedOutUser(req, res, next) {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        next();
    }
}

app.use((req, res, next) => {
    if (!req.session.userId && req.url != "/login" && req.url != "/register") {
        res.redirect("/register");
    } else {
        next();
    }
});
//so req.body isn't empty
app.get("/register", (req, res) => {
    if (req.session.userId === undefined) {
        console.log(req.session.userId, "req.session.userId", "login");
        res.render("register", {
            layout: "main"
        });
    } else {
        console.log(req.session.userId, "req.session.userId", "login");
        res.redirect("/petition");
    }
});
app.get("/profile", (req, res) => {
    db.getName(req.session.userId).then(results => {
        let first = results.rows.first;
        let last = results.rows.last;
        res.render("profile", {
            layout: "main",
            first,
            last
        });
    });
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        layout: "main"
    });
});

app.get("/login", (req, res) => {
    if (req.session.userId === undefined) {
        console.log(req.session.userId, "req.session.userId", "login");
        res.render("login", {
            layout: "main"
        });
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
                    req.session.userId = results.rows[0].id;
                    db.getName(req.session.userId).then(() => {
                        // let first = results.rows.first;
                        // let last = results.rows.last;
                        res.redirect("profile");
                    });

                    console.log(req.session);
                    console.log("register => profile form");
                })

                .catch(err => {
                    console.log(err);
                    var oops = "Email address already exists!";
                    console.log("this is the error", err);
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
                                                console.log("im here", "170");
                                                var sign =
                                                    signature.rows[0].signature;
                                                db.getSigners()
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
//----------------------app post profile-----------------------

app.post("/profile", (req, res) => {
    console.log("*************POST PETITION******************");
    var body = req.body;
    var userid = req.session.userId;
    db.userProfile(body.age, body.city, body.homepage, userid)
        .then(() => {
            res.redirect("petition");
        })
        .catch(err => {
            console.log(err);
            res.render("thanks", {
                err
            });
        });
});

//----------------------app post profile-----------------------
app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main"
    });
});

app.get("/petition", (req, res) => {
    if (req.session.userId === undefined) {
        console.log(req.session.userId, "req.session.userId", "login");
        res.render("register", {
            layout: "main"
        }).catch(err => {
            console.log(err);
            res.render("register", {
                err
            });
        });
    } else {
        db.getSignature(req.session.userId).then(results => {
            if (results.rows.signature !== undefined) {
                res.redirect("thanks").catch(err => {
                    console.log(err);
                    res.render("thanks", {
                        err
                    });
                });
            } else {
                db.getName(req.session.userId).then(results => {
                    let first = results.rows[0].first;
                    let last = results.rows[0].last;
                    res.render("petition", {
                        layout: "main",
                        first,
                        last
                    });
                });
            }
        });
    }
});

app.post("/petition", (req, res) => {
    var body = req.body;
    //add conditions and ifs
    if (body.signature.length != 1326) {
        db.addSignature(body.signature, req.session.userId)
            .then(() => {
                db.getSigners().then(results => {
                    const sign = req.body.signature;
                    var noOfSigners = results.rows.length;
                    res.render("thanks", {
                        layout: "main",
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
        const oops = "Please sign the petition";
        res.render("petition", {
            err: "Error",
            oops
        });
    }
    app.use(csurf());

    app.use(function(req, res, next) {
        res.set("x-frame-options", "DENY");
        res.locals.csrfToken = req.csrfToken();
        next();
    });
    //////// **** finish csurf **** ///////
    console.log("****** petition POST route ******");
});

app.get("/signers", (req, res) => {
    db.getSigners().then(results => {
        console.log("297", results);
        let namesSigned = results.rows;
        res.render("signers", {
            layout: "main",
            namesSigned
        });
    }); ///get rest of info
});

// .then(firstname =>
//     res.render("signers", {
//         layout: "main",
//
//         firstname
//     })
// );

app.listen(process.env.PORT || 8080, () => console.log("port 8080 listening"));
