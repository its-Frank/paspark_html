const express = require("express");
const mysql = require("mysql");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

const conn = mysql.createConnection({
  database: "parkingms",
  host: "localhost",
  user: "root",
  password: "",
});

const app = express();

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.static("paspark"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "cat",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 },
  })
);
app.use((req, res, next) => {
  const protectedRoutes = [, "/profile", "/bookspace"];
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
    next();
  } else if (protectedRoutes.includes(req.path)) {
    // set redirectionhistorycookie-parser
    let path = req.path;
    if (Object.keys(req.query).length > 0) {
      const queryString = new URLSearchParams(req.query).toString();
      path += `${queryString}`;
    }
    res.cookie("redirectHistory", path, {
      maxAge: 1000 * 60 * 60 * 24, // Expires in 24 hours
      httpOnly: true, //Restricts access from client-side javascript
    });
    res.redirect("/signin?message=signin");
  } else {
    next();
  }
});
//routes
app.get("/", (req, res) => {
  res.render("index");
});
//about
app.get("/about", (req, res) => {
  res.render("about");
});
//pricing
app.get("/pricing", (req, res) => {
  res.render("pricing");
});
//why
app.get("/why", (req, res) => {
  res.render("why");
});
//testimonial
app.get("/testimonial", (req, res) => {
  res.render("testimonial");
});
//contact
app.get("/contact", (req, res) => {
  res.render("contact", { user: req.user || null });
});
app.post("/contact", (req, res) => {
  const { name, email, phone, subject, message, category } = req.body;
  const query =
    "INSERT INTO contacts (name, email, phone, subject, message, category) VALUES (?, ?, ?, ?, ?, ?)";
  conn.query(
    query,
    [name, email, phone, subject, message, category],
    (err, result) => {
      if (err) {
        console.error("Error inserting contact:", err);
        return res.render("contact", {
          user: req.user || null,
          error:
            "There was an error submitting your message. Please try again.",
        });
      }
      // Successful submission
      res.render("contact", {
        user: req.user || null,
        success:
          "Your message has been sent successfully. We will get in touch with you shortly!",
      });
    }
  );
});

//spaces
app.get("/spaces", (req, res) => {
  const location = req.query.location;
  const spacesQuery = `SELECT * FROM spaces WHERE space_location='${location}'`;

  conn.query(spacesQuery, (sqlErr, spaces) => {
    if (sqlErr) {
      res.status(500).render("500.ejs", {
        message: "Server Error: Contact Admin if this persists",
      });
    } else {
      res.render("spaces.ejs", { spaces: spaces });
    }
  });
});

//bookspace
app.get("/bookspace", (req, res) => {
  const spaceId = req.query.space_id;
  const selectSpaceInfo = `SELECT location_name,space_label, description, price_ksh_hour FROM spaces JOIN locations ON spaces.space_location = locations.location_id JOIN space_categories ON spaces.space_category = space_categories.category_id WHERE space_id = '${spaceId}'`;

  conn.query(selectSpaceInfo, (err, spaceInfo) => {
    if (err) {
      console.log(err);
      res.status(500).render("500.ejs", {
        message: "Server Error!! Contact admin if this persists.",
      });
    } else {
      console.log(spaceInfo);
      res.render("bookspace.ejs", {
        spaceId: spaceId,
        spaceInfo: spaceInfo[0],
      });
    }
  });
});
app.post("/bookspace", (req, res) => {
  const { time, paymentMethod, spaceId } = req.body;
  let confirmAvailability = `SELECT * from spaces WHERE space_id = '${spaceId}'`;
  let bookingStatement = `INSERT INTO bookings(user,space,payment_method,time_out,booking_status) VALUES('${
    req.session.user.email
  }', ${spaceId}, '${paymentMethod}', CURRENT_TIMESTAMP + INTERVAL ${Number(
    time
  )} HOUR, 'checked-in')`;
  let updateAvailability = `UPDATE spaces SET occupied = 1 WHERE space_id = ${spaceId}`;
  conn.query(confirmAvailability, (err, space) => {
    if (err) {
      console.log(err);
      res.status(500).render("500.ejs", {
        message: "Server Error!! Contact admin if this persists.",
      });
    } else {
      if (space[0].occupied !== 0) {
        // occupied
        res.redirect(
          `/spaces?location=${space[0].space_location}&message=occupied`
        );
      } else {
        conn.query(bookingStatement, (bookErr) => {
          if (bookErr) {
            console.log(bookErr);
            res.status(500).render("500.ejs", {
              message: "Server Error!! Contact admin if this persists.",
            });
          } else {
            // mark space as booked/occupied0 -,l
            conn.query(updateAvailability, (updateErr) => {
              if (updateErr) {
                console.log(updateErr);
                res.status(500).render("500.ejs", {
                  message: "Server Error!! Contact admin if this persists.",
                });
              } else {
                res.redirect("/profile");
              }
            });
          }
        });
      }
    }
  });
});
//booknow
app.get("/booknow", (req, res) => {
  conn.query("SELECT * FROM locations", (sqlErr, locations) => {
    if (sqlErr) {
      res.status(500).render("500.ejs", {
        message: "Server Error: Contact Admin if this persists",
      });
    } else {
      console.log(locations);
      // destructuring objects in js -- es6 feature
      res.render("locations.ejs", { locations: locations });
    }
  });
});
//profile
app.get("/profile", (req, res) => {
  // all bookings -- active booking, and history
  // active booking -- current bill , checkout link(make space available, thank you message.(reciept))
  const selectBookings = `SELECT * FROM bookings WHERE user = '${req.session.user.email}'`;

  conn.query(selectBookings, (selectErr, bookings) => {
    if (selectErr) {
      console.log(selectErr);
      res.status(500).render("500.ejs", {
        message: "Server Error!! Contact admin if this persists.",
      });
    } else {
      res.render("profile.ejs", { bookings: bookings });
    }
  });
});
//checkout
app.get("/checkout", (req, res) => {
  const spaceId = req.query.space;
  const updateSpaceAvailabity = `UPDATE spaces SET occupied = 0 WHERE space_id = ${Number(
    spaceId
  )} `;
  const checkoutBooking = `UPDATE bookings SET booking_status = "checked-out" WHERE space = ${Number(
    spaceId
  )} AND user = "${req.session.user.email}" `;

  conn.query(checkoutBooking, (checkoutErr) => {
    if (checkoutErr) {
      console.log(checkoutErr);
      res.status(500).render("500.ejs", {
        message: "Server Error!! Contact admin if this persists.",
      });
    } else {
      conn.query(updateSpaceAvailabity, (updateErr) => {
        if (updateErr) {
          console.log(updateErr);
          res.status(500).render("500.ejs", {
            message: "Server Error!! Contact admin if this persists.",
          });
        } else {
          res.redirect("/profile");
        }
      });
    }
  });
});

//logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
//signup
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.post("/signup", (req, res) => {
  if (req.body.pass === req.body.confirmPass) {
    conn.query(
      `SELECT email FROM users WHERE email = "${req.body.email}"`,
      (sqlError, emailData) => {
        if (sqlError) {
          res.status(500).render("signup.ejs", {
            error: true,
            errMessage: "Server Error: Contact Admin if this persists.",
            prevInput: req.body,
          });
        } else {
          if (emailData.length > 0) {
            res.render("signup.ejs", {
              error: true,
              errMessage:
                "Email Already Registered. Login with email and password!",
              prevInput: req.body,
            });
          } else {
            let sqlStatement = `INSERT INTO users(email,fullname,password,phone) VALUES( "${
              req.body.email
            }", "${req.body.fullname}", "${bcrypt.hashSync(
              req.body.pass,
              5
            )}", "${req.body.phone}")`;
            conn.query(sqlStatement, (sqlErr) => {
              if (sqlErr) {
                res.status(500).render("signup.ejs", {
                  error: true,
                  errMessage: "Server Error: Contact Admin if this persists.",
                  prevInput: req.body,
                });
              } else {
                res.status(304).redirect("/signin?signupSuccess=true");
              }
            });
          }
        }
      }
    );
  } else {
    res.render("signup.ejs", {
      error: true,
      errMessage: "password and confirm password do not match!",
      prevInput: req.body,
    });
  }
});
//signin
app.get("/signin", (req, res) => {
  if (req.query.signupSuccess) {
    res.render("signin.ejs", {
      message: "Signup successful!! You can now log in.",
    });
  } else if (req.query.message) {
    res.render("signin.ejs", { message: "Sign in to book a space." });
  } else {
    res.render("signin.ejs");
  }
});
app.post("/signin", (req, res) => {
  const loginStatement = `SELECT * FROM users WHERE email = '${req.body.email}'`;
  conn.query(loginStatement, (sqlErr, userData) => {
    if (sqlErr) {
      console.log(sqlErr.message);
      res.status(500).render("signin.ejs", {
        error: true,
        message: "Server Error, Contact Admin if this persists!",
        prevInput: req.body,
      });
    } else {
      console.log(userData);
      if (userData.length == 0) {
        res.status(401).render("signin.ejs", {
          error: true,
          message: "Email or Password Invalid",
          prevInput: req.body,
        });
      } else {
        if (bcrypt.compareSync(req.body.pass, userData[0].password)) {
          // create a session
          // res.cookie("email",userData[0].email, {maxAge: 60} )
          req.session.user = userData[0];
          // check if this was a redirection, we need to send them back to where they weere.
          // check if there is a cookie--- redirect history
          if (req.cookies.redirectHistory) {
            let redirectPath = req.cookies.redirectHistory;
            res.clearCookie("redirectHistory");
            res.redirect(redirectPath);
          } else {
            res.redirect("/");
          }
        } else {
          res.status(401).render("signin.ejs", {
            error: true,
            message: "Email or Password Invalid",
            prevInput: req.body,
          });
        }
      }
    }
  });
});

const port = 9000;
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
