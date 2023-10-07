let express = require("express");
let path = require("path");
let bodyParser = require("body-parser");
let dotenv = require('dotenv');
let NodeCache = require('node-cache');

dotenv.config({
  path: "./config.env",
});

let app = express();
let cache = new NodeCache();
let port = process.env.PORT || 3000;

let sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database("./Registration.db");

// Création de la table "students" si elle n'existe pas
db.serialize(function () {
  db.run(
    "CREATE TABLE IF NOT EXISTS students (student_id INTEGER PRIMARY KEY AUTOINCREMENT, first_name TEXT, last_name TEXT, email TEXT)"
  );
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views"));


app.get("/students", function (req, res) {
  if (cache.has("students")) {
    return res.json({
      success : true,
      students : cache.get("students"),
    })
  } else {
    db.all("SELECT * FROM students ORDER BY student_id", function (err, rows) {
      if (err) {
        console.log(err);
        res.status(500).json({ err });
      } else {
        res. json(rows);
      }
    });

  }
});
app.post("/DeleteStudent/:id", (req, res) => {
  db.run("DELETE FROM students WHERE student_id = ?", req.params.id, function (
    err
  ) {
    if (err) {
      console.log(err);
      res.status(500).json({ err });
    } else {
      res.redirect("/");
    }
  });
});


app.get("/addStudent", (req, res) => {
  res.render("addStudent");
});

app.post("/addStudent", (req, res) => {
  if (req.body.email == null) {
    req.body.email = "N";
  }
  db.run(
    "INSERT INTO students (first_name, last_name, email) VALUES (?, ?, ?)",
    [req.body.first_name, req.body.last_name, req.body.email],
    function (err) {
      if (err) {
        console.log(err);
        res.status(500).json({ error : "une erreur s'est produite lors de l'ajout de l'etudiant" });
      } else {
        console.log("Etudiant ajouté avec succès");
        res.redirect("/");
      }
    }
  );
});

app.get("/updateStudent", (req, res) => {
  res.render("updateStudent");
});

app.post("/updateStudent", (req, res) => {
  if (req.body.email == null) {
    req.body.email = "N";
  }
  db.run(
    "UPDATE students SET first_name = ?, last_name = ?, email = ? WHERE student_id = ?",
    [
      req.body.first_name,
      req.body.last_name,
      req.body.email,
      req.body.student_id,
    ],
    function (err) {
      if (err) {
        console.log(err);
        res.status(500).json({ err });
      } else {
        res.redirect("/");
      }
    }
  );
});

app.get("/about", function (req, res) {
  res.sendFile(path.join(__dirname + "/about.html"));
});

app.get("/email", function (req, res) {
  res.sendFile(path.join(__dirname + "/emailpage.html"));
});

app.listen(port, function () {
  console.log("J'écoute les mouvements sur le port " + process.env.PORT);
});

