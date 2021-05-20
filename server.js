"use strict";

const express = require("express");
require("dotenv").config();
const cors = require("cors");
const superagent = require("superagent");

const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.DEV_MODE ? false : { rejectUnauthorized: false },
// });

const methodOverride = require("method-override");

const server = express();
server.use(cors());
server.use(express.static("./public"));

server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");
server.use(methodOverride("_method"));
const PORT = process.env.PORT || 3010;

server.get("/", homeHandler);
server.post("/productbyprice", productByPriceHandler);
server.get("/allprouducts", allProductsHandler);
server.get("/showedproduct", showMine);
server.post("/save", addToMyProducts);
server.post("/detail/:id", detailHandler);
server.put("/update/:id", updateHandler);
server.delete("/delete/:id", deleteHandler);

function Products(data) {
  this.name = data.name;
  this.price = data.price;
  this.image_link = data.image_link;
  this.description = data.description;
}

function homeHandler(req, res) {
  res.render("index");
}

function productByPriceHandler(req, res) {
  let brand = req.body.productbyprices;
  let min = req.body.min;
  let max = req.body.max;
  let URL = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}&price_greater_than=${min}&price_less_than=${max}`;

  superagent.get(URL).then((data) => {
    let dataArr = data.body.map((value) => {
      return new Products(value);
    });
    res.render("productbyprice", { datas: dataArr });
  });
}

function allProductsHandler(req, res) {
  let URL = `https://makeup-api.herokuapp.com/api/v1/products.json`;
  superagent.get(URL).then((data) => {
    let dataArr = data.body.map((value) => {
      return new Products(value);
    });
    res.render("allproducts", { allproducts: dataArr });
  });
}

function addToMyProducts(req, res) {
  let SQL = `INSERT INTO makeuptable (name,price,image_link,description)
    VALUES($1,$2,$3,$4) RETURNING *;`;
  let values = [
    req.body.name,
    req.body.price,
    req.body.image_link,
    req.body.description,
  ];
  client
    .query(SQL, values)
    .then(() => {
      res.redirect("showedproduct");
    })
    .catch((err) => {
      res.send(err);
    });
}

function showMine(req, res) {
  let SQL = `SELECT * FROM makeuptable;`;
  client.query(SQL).then((data) => {
    let dataArr = data.rows;
    // console.log(data.rows);
    res.render("myproducts", { myfavproducts: dataArr });
  });
}

function detailHandler(req, res) {
  let SQL = `SELECT * FROM makeuptable WHERE id=$1;`;
  let id = req.params.id;
  client.query(SQL, [id]).then((data) => {
    let dataArr = data.rows[0];
    res.render("detail", { datadetail: dataArr });
  });
}

function updateHandler(req, res) {
  //   let id = req.params.id;
  let SQL = `UPDATE makeuptable SET name=$1,price=$2,description=$3 WHERE id=$4; `;
  //   let SQL = `UPDATE makeuptable SET name=$1,price=$2,image_link=$3 WHERE id=$4;`;
  let savevalues = [
    req.body.name,
    req.body.price,
    req.body.description,
    req.params.id,
  ];
  client.query(SQL, savevalues).then(() => {
    res.redirect(`detail/${req.params.id}`);
  });
}

function deleteHandler(req, res) {
  let SQL = `DELETE FROM makeuptable WHERE id =$1;`;
  let id = req.params.id;
  let savevalues = [id];
  client.query(SQL, savevalues).then(() => {
    res.redirect("/showedproduct");
  });
}

client.connect().then(() => {
  server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
});

// server.listen(PORT, () => {
//   console.log(`LISTENING ON ${PORT}`);
// });
