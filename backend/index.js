const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbpath = path.join(__dirname, "mydb.db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let db = null;
app.use(express.json());

// connecting to database
const initilizeDBandServer = async () => {
  db = await open({
    filename: dbpath,
    driver: sqlite3.Database,
  });

  let createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL
    );
        
    CREATE TABLE IF NOT EXISTS products ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT
    );
    `;

  await db.exec(createTableQuery);

  // we can write this inside db or at the last
  app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000/");
  });
};

// we declared it first and now we should call it
initilizeDBandServer();

//inserting values into the table of only one row
// and in postman we can insert in body-> raw data
app.post("/register", async (request, response) => {
  const { name, email, password } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const searchEmailQuery = `SELECT * FROM users WHERE email = '${email}'`;
  const dbUser = await db.get(searchEmailQuery);
  if (dbUser === undefined) {
    const insertUserQuery = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    await db.run(insertUserQuery, [name, email, hashedPassword]);
    response.status(201).send("User registered successfully");
  } else {
    response.send("User already Exists");
  }
});

app.post("/login", async (request, response) => {
  const { email, password } = request.body;
  const selectUserQuery = `SELECT * FROM users WHERE email = '${email}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      const payload = {
        email: email,
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

//middleware
const authenticateToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid Access Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.send("Invalid Access Token");
      } else {
        next();
      }
    });
  }
};

//inserting values into the table of multiple rows
app.post("/products", async (req, res) => {
  const allProducts = req.body;
  const query = `INSERT INTO products (name, price, description) VALUES (?, ?, ?)`;
  for (let eachProd of allProducts) {
    // const query = `INSERT INTO products (name, price, description) VALUES (${eachProd.name}, ${eachProd.price}, ${eachProd.description})`;
    // await db.run(query)
    await db.run(query, [eachProd.name, eachProd.price, eachProd.description]);
  }
  res.send("all products inserted");
});

//retriving all the data from the table users
app.get("/users", authenticateToken, async (req, res) => {
  const query = `SELECT * FROM users`;
  const data = await db.all(query);
  res.send(data);
});

//retriving all the data from the table products
app.get("/products", authenticateToken, async (req, res) => {
  const query = `select * From products`;
  const data = await db.all(query);
  res.send(data);
});

//retriving data using id
app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  const query = `select * From products Where id=?`;
  const data = await db.get(query, [id]);
  res.send(data);
});

//updating product details
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, description } = req.body;
  const query = `UPDATE products SET name=?, price=?, description=? WHERE id=?`;
  await db.run(query, [name, price, description, id]);
  res.send("product details updated");
});

//deleting a product using id
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM products WHERE id=?`;
  await db.run(query, [id]);
  res.send("products table deleted");
});

//register user api

//login user api

// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFhYkBnbWFpbC5jb20iLCJpYXQiOjE3ODE2MDI3MTl9.WVglEn8IN2OqeJGIipyjoSZgKW2QvapLxCFyi-WwYBk";
