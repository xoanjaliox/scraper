// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Set up a static folder (public) for our web app
app.use(express.static("public"));

// Database configuration
// Save the URL of our database as well as the name of our collection
var databaseUrl = "scraper";
var collections = ["beauty", "onion"];

// Use mongojs to hook the database to the db variable
var db = mongojs(databaseUrl, collections);

// This makes sure that any errors are logged if mongodb runs into an issue
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Routes
// 1. At the root path, send a simple hello world message to the browser
app.get("/", function(req, res) {
  res.send("Hello world, you will see some new articles soon!");
});

// 2. At the "/all" path, display every entry in the animals collection
app.get("/all", function(req, res) {
  // Query: In our database, go to the animals collection, then "find" everything
  db.beauty.find({}, function(error, found) {
    // Log any errors if the server encounters one
    if (error) {
      console.log(error);
    }
    // Otherwise, send the result of this query to the browser
    else {
      res.json(found);
    }
  });
});

app.get("/scrape", function (req,res) {
  axios.get("https://sokoglam.com/blogs/news").then(function(response) {
    var $ = cheerio.load(response.data);
    $(".article-content").each(function(i, element) {
      // Save text and link of current element
      var title = $(element).children("h2").children("a").text();
      var link = $(element).children("h2").children("a").attr("href");
      var date = $(element).children("span").text().split("\n")[1].trim();
      var author = $(element).children("span").children("span").text();
      
      if (title && link && date && author) {
        db.beauty.insert({
          title,
          link,
          date,
          author
        },
        function(err, inserted) {
          if (err) {
            //Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            console.log(inserted);
          }
        });
      }
    });
  });

  // Send a "Scrape Complete" message to browser
  res.send("Scrape complete!");
});

// Set the app to listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
