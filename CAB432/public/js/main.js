$(document).ready(() => {

  // Place JavaScript code here...
  $('[data-toggle="tooltip"]').tooltip();


  if (window.location.pathname == '/home') {
    document.getElementById('main-form').onsubmit = function obSubmit(form) {
      $('.loading-txt').fadeIn(500);
      
      setTimeout(() => {
        $('.loading-txt > h4').text('Creating visuals...');
      }, 5 * 1000);
    };
  }

  if (window.location.pathname == '/result') {    
    setInterval(function () {
      $.ajax({
        "url": '/intervalData',
        "success": function (data) {
          console.log(data);
        },
        "error": function (error) {
        }
      })
    }, 1000);
  }

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