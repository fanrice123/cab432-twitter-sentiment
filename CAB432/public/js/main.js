$(document).ready(() => {

  // Place JavaScript code here...
  $('[data-toggle="tooltip"]').tooltip();


  document.getElementById('main-form').onsubmit = function obSubmit(form) {
    $('.loading-txt').fadeIn(500);
    return true;
  };

  // setInterval(() => {
  //   $.ajax({
  //     "url": "/tweetsjson",
  //     "success": function (data) {
  //       console.log(data);
  //     },
  //     "error": function (error) {
  //       console.log(error);
  //     }
  //   });
  // }, 5000);
});