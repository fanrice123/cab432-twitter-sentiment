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
});