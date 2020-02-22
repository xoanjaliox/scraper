// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

// Initialize Express
var app = express();
var PORT = process.env.PORT || 3000;

// Database configuration
// Save the URL of our database as well as the name of our collection
// var databaseUrl = "scraper";
// var collections = ["beauty"];

// Require all models
var db = require("./models");

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static directory
app.use(express.static("public"));

//Set up handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main"});
app.set("view engine", "handlebars");

//connect to Mongodb
// const db = require("./config/keys").mongoURI;
// mongoose
//   .connect(db, { useNewUrlParser: true })
//   .then(() => console.log("MongoDB Connected"))
//   .catch(err => console.log(err));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/populatedb", { useNewUrlParser: true });

// Routes
// 1. At the root path, send a simple hello world message to the browser
app.get("/", function(req, res) {
  res.send("Hello world!");
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
  res.send("");
});

// Set the app to listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port 3000!");
});
