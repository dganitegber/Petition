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

app.get("/register", (req, res) => {
    console.log("*********************GET REGISTER*************************");

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
app.post("/register", (req, res) => {
    console.log(
        "******************************POST REGISTER*****************************"
    );
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
});
app.get("/login", (req, res) => {
    console.log(
        "****************************GET LOGIN****************************"
    );
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
app.post("/login", (req, res) => {
    console.log("*************************POST LOGIN*************************");
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
                                                res.redirect("/thanks").catch(
                                                    err => {
                                                        console.log(
                                                            "im here",
                                                            err
                                                        );
                                                        res.render("login", {
                                                            err
                                                        });
                                                    }
                                                );
                                            } else {
                                                console.log("this happened");
                                                res.redirect("/petition");
                                            }
                                        }
                                    );
                                })
                                .catch(err => {
                                    console.log("im here", err);
                                    res.render("login", {
                                        err
                                    });
                                });
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

app.post("/profile", (req, res) => {
    console.log(
        "*********************************POSR PROFILE***************************"
    );
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
app.get("/profile", (req, res) => {
    console.log("*********************GET PROFILE*************************");
    if (req.session.userId === undefined) {
        console.log(req.session.userId, "req.session.userId", "login");
        res.redirect("register");
    } else {
        console.log(req.session.userId, "req.session.userId", "login");

        db.getName(req.session.userId).then(results => {
            let first = results.rows[0].first;
            let last = results.rows[0].last;
            res.render("profile", {
                layout: "main",
                first,
                last
            });
        });
    }
});

app.get("/thanks", (req, res) => {
    console.log("*********************GET THANKS*************************");
    var noOfSigners;
    db.countSigners()
        .then(results => {
            noOfSigners = results.rows[0].count;
            console.log(noOfSigners, "83");
        })
        .then(() => db.getNameAndSignature(req.session.userId))
        .then(find => {
            let first = find.rows[0].first;
            let last = find.rows[0].last;
            let signature = find.rows[0].signature;

            res.render("thanks", {
                layout: "main",
                first,
                last,
                signature,
                noOfSigners
            });
        });
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

app.get("/petition", (req, res) => {
    console.log(
        "**********************************************GET PETITION**********************************"
    );
    if (req.session.userId === undefined) {
        console.log(req.session.userId, "req.session.userId", "login");
        res.redirect("register").catch(err => {
            console.log(err);
            res.render("register", {
                err
            });
        });
    } else {
        db.getSignature(req.session.userId).then(results => {
            console.log(results.rows[0]);
            if (results.rows[0] === undefined) {
                db.getName(req.session.userId).then(results => {
                    let first = results.rows[0].first;
                    let last = results.rows[0].last;
                    res.render("petition", {
                        layout: "main",
                        first,
                        last
                    });
                });
            } else {
                console.log("im in else", "286");
                res.redirect("thanks");
            }
        });
    }
});
app.post("/petition", (req, res) => {
    console.log("***************POST PETITION********************");
    var body = req.body;
    console.log(body, "306");
    //add conditions and ifs
    if (body.signature.length != 1326) {
        db.addSignature(body.signature, req.session.userId)
            .then(() => {
                res.redirect("thanks");
            })
            .catch(err => {
                console.log(err);
                res.render("petition", {
                    err
                });
            });
    } else {
        console.log(body.signature.length, "326");
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
});

app.get("/signers", (req, res) => {
    console.log(
        "*****************************************GET SIGNERS*********************************"
    );
    db.getSigners()
        .then(results => {
            let namesSigned = results.rows;
            console.log("namesSigned", namesSigned);
            res.render("signers", {
                layout: "main",
                namesSigned
            });
        })
        .catch(err => {
            console.log(err);
        });
    ///get rest of info
});

app.get("/logout", (req, res) => {
    console.log(
        "****************************************GET LOGOUT****************************************"
    );
    req.session = null;
    res.redirect("/bye");
});

app.get("/bye", (req, res) => {
    console.log(
        "****************************************GET bye****************************************"
    );
    res.render("bye", {
        layout: "main"
    });
});

app.get("/edit", (req, res) => {
    console.log(
        "****************************************GET edit****************************************"
    );
    if (req.session.userId === undefined) {
        console.log(req.session.userId, "req.session.userId", "login");
        res.redirect("register");
    } else {
        console.log(req.session.userId, "req.session.userId", "login");

        db.getSigners().then(results => {
            console.log(results);
            res.render("edit", {
                layout: "main"
            }).catch(err => {
                console.log(err);
            });
        });
    }
});
app.get("/signers/:city", (req, res) => {
    console.log("***get signers by city***");
    const city = req.params.city;
    console.log(req.params, "params");

    db.getSignersByCity(city)
        .then(results => {
            let signersByCity = results.rows;
            res.render("city", {
                layout: "main",
                signersByCity,
                city
            });
        })
        .catch(err => console.log("ERROR", err));
});

app.post("/deletesig", (req, res) => {
    res.redirect("deletesig");
});
app.get("/deletesig", (req, res) => {
    console.log("*******************GET DELETESIG***************************");
    db.getNameAndSignature(req.session.userId).then(results => {
        if (results.rows[0] === undefined) {
            res.redirect("/petition");
        } else {
            let first = results.rows[0].first;
            let signature = results.rows[0].signature;

            res.render("deletesig", {
                layout: "main",
                first,
                signature
            });
        }
    });
});

app.post("/yesdel", (req, res) => {
    console.log("+++++POST yesdel+++++");

    db.deleteSignature(req.session.userId).then(() => {
        res.redirect("/petition");
    });
});

// app.get("/deleteSig", (req, res));

app.listen(process.env.PORT || 8080, () => console.log("port 8080 listening"));
