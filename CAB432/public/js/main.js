$(document).ready(() => {

  // Place JavaScript code here...
  $('[data-toggle="tooltip"]').tooltip();

  setInterval(() => {
    $.ajax({
      "url": "/tweetsjson",
      "success": function (data) {
        console.log(data);
      },
      "error": function (error) {
        console.log(error);
      }
    });
  }, 5000);
});