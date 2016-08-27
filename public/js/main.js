/**
 * Created by austin on 8/23/16.
 */

// Register an onclick to play sound for the video

$(function() {
  var introButtonClicked = false;

  $('#intro-button').click(function() {
    introButtonClicked = true;
  });
  $('.panel-video').click(function() {
    if (introButtonClicked) {
      introButtonClicked = false;
      return;
    }
    var video = $('video');
    video.prop('muted', !video.prop('muted'));
  });
});