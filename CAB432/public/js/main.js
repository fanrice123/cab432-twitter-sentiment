$(document).ready(function () {

  // Place JavaScript code here...
  $('[data-toggle="tooltip"]').tooltip();

  $('#birthday').datepicker({
    format: 'yyyy-mm-dd',
    endDate: '+0d',
    defaultViewDate: { year: 1987, month: 2, day: 18 },
    autoclose: true
  });

  $('#ttsButton').click(() => {
    var text = $('#translatedName').text();
    $('#ttsButton').removeClass('fa-volume-up').addClass('fa-circle-o-notch fa-spin');
    responsiveVoice.speak(text, "Chinese Female", {
      onstart: () => {
        $('#ttsButton').removeClass('fa-circle-o-notch fa-spin').addClass('fa-volume-up');
      }
    });
  });
});