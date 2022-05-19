// Setup the environement variables form a .env file
require("dotenv").config();

const connection = require("./db-config");

// Import expres
const express = require("express");

// We store all express methods in a variable called app
const app = express();

// If an environment variable named PORT exists, we take it in order to let the user change the port without chaning the source code. Otherwise we give a default value of 3000
const port = process.env.PORT ?? 3000;

connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
  } else {
    console.log('connected to database with threadId :  ' + connection.threadId);
  }
});

app.use(express.json());
connection.query("SELECT * FROM movies", (err, result) => {
  // Do something when mysql is done executing the query
  console.log(err, result)
});

app.get("/api/movies", (req, res) => {
  let sql = "SELECT * FROM movies";
  const sqlValues = [];

  if (req.query.color) {
    sql += " WHERE color = ?";
    sqlValues.push(req.query.color);
  }
  if (req.query.max_duration) {
    sql += " WHERE duration <= ?";
    sqlValues.push(req.query.max_duration);
  }

  connection.query(sql, sqlValues, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving users from database");
    } else {
      res.json(result);
    }
  });
});


app.get('/api/movies/:id', (req, res) => {
  const userId = req.params.id;
  connection.query(
    'SELECT * FROM movies WHERE id = ?',
    [userId],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error retrieving users from database');
      } else if (result.length === 0) {
        res.status(404).send("Movie not found");
      } else {
        res.json(result[0]);
      }
    }
  );
});

// We listen to incoming request on the port defined above
app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});