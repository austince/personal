/**
 * Created by austin on 8/23/16.
 */

// Register an onclick to play sound for the video

$(function() {
  var introButtonClicked = false;
  var video = $('video');

  $('#intro-button').click(function() {
    introButtonClicked = true;
  });
  $('.panel-video').click(function() {
    if (introButtonClicked) {
      introButtonClicked = false;
      return;
    }
    video.prop('muted', !video.prop('muted'));
  });

  video.on('loadeddata', function() {
    // remove the loading class to reset scale from poster
    video.removeClass('loading');
  });

  // Hide the video on all mobile devices but allow small screen computers to play it
  // Just don't want to deal with autoplay on mobile
  if(isMobile.any) {
    video.remove();
  }
});