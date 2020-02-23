// Dependencies
var express = require("express");
var mongoose = require("mongoose");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

// Require all models
var db = require("./models");

// Initialize Express
var app = express();
var PORT = process.env.PORT || 3000;

// Database configuration
// Save the URL of our database as well as the name of our collection
// var databaseUrl = "scraper";
// var collections = ["beauty"];


// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static directory
app.use(express.static("public"));

//Set up handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main"}));
app.set("view engine", "handlebars");

//connect to Mongodb
// const db = require("./config/keys").mongoURI;
// mongoose
//   .connect(db, { useNewUrlParser: true })
//   .then(() => console.log("MongoDB Connected"))
//   .catch(err => console.log(err));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser: true });

// Routes
// 1. At the root path, send a simple hello world message to the browser
app.get("/", function(req, res) {
  res.send("Hello world!");
});

// 2. At the "/all" path, display every entry in the animals collection
app.get("/all", function(req, res) {
  // Grab every document in the Articles collection
  db.BeautyArticle.find({})
    .then(function(found) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(found);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


app.get("/scrape", function (req,res) {
  axios.get("https://sokoglam.com/blogs/news").then(async function(response) {
    var $ = cheerio.load(response.data);
    await $(".article-content").each(function(i, element) {
      // Saves an empty result object
      var result = {};
      // Save text and link of current element
      result.title = $(this).children("h2").children("a").text();
      result.link = $(this).children("h2").children("a").attr("href");
      result.date = $(this).children("span").text().split("\n")[1].trim();
      result.author = $(this).children("span").children("span").text();
      
      if (result.title && result.link && result.date && result.author) {
        console.log("result", result);

        db.BeautyArticle.findOne({link:result.link})
        .then(function(found) {
          if (!found) {
            db.BeautyArticle.create(result)
            .then(function(inserted) {
              console.log("New articles found & added to db", inserted);

              res.json(inserted);
            })
            .catch(function(err) {
              // If an error occurred, show it
              res.json(err);
            });
          }     
        })
        .catch(function(err) {
          // If an error occurred, show it
          res.json(err);
        });
      }
      });

      //res.status(200).finished();
    });
  });

  app.get("/date", function(req, res) {
    db.BeautyArticle.find({})
      .sort({ date: 1 })
      .exec(function(err, found) {
        if (err) {
          console.log(err);
        } else {
          //res.json(found);
          res.render("index", { blogPost: found });
        }
      });
  });

  app.get("/author", function(req, res) {
    db.BeautyArticle.find({})
      .sort({ author: 1 })
      .exec(function(err, found) {
        if (err) {
          console.log(err);
        } else {
          //res.json(found);
          res.render("index", { blogPost: found });
        }
      });
  });

// Set the app to listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port 3000!");
});
