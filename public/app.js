// We'll be rewriting the table's data frequently, so let's make our code more DRY
// by writing a function that takes in 'beauty' (JSON) and creates a table body
function displayResults(article) {
  // console.log("display running");

  $("#article-parent").empty();
  article.forEach(function(tip) {
    var card = $("<div>").addClass("card");
    var cardBody = $("<div>").addClass("card-body");
    var cardText = $("<div>").addClass("text");
    var title = $("<h4>")
      .addClass("card-title")
      .text(tip.title);
    var aTag = $("<a>").attr("href", tip.link);
    var pTag = $("<p>")
      .addClass("card-text")
      .text(tip.description);
    aTag.append(title);
    cardText.append(aTag, pTag);
    cardBody.append(cardText);
    card.append(cardBody);
    $("#article-parent").append(card);
  });
}

// 1: On Load
// ==========
// First thing: ask the back end for json with all saved articles
$.getJSON("/saved", function(data) {
  console.log("displaying saved articles");
  displayResults(data);
});

// 2: Button Interactions
// ======================
// When user clicks the scrape new articles button, update table with new articles if any
$("#scrape-articles").on("click", function() {
  console.log("just scraped new articles, deleting any not previously saved.");
  $.get("/scrape-articles").then(
    $.getJSON("/getarticles", function(data) {
      displayResults(data);
    })
  );
});

// When user clicks the name sort button, display the table sorted by name
$("#saved-articles").on("click", function() {
  $.getJSON("/saved", function(data) {
    displayResults(data);
  });
});
