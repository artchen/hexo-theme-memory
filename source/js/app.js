(function($) {
	
	"use strict";
	
	// options
	var GOOGLE_CUSTOM_SEARCH_ENABLE = true;
	var GOOGLE_CUSTOM_SEARCH_API_KEY = "AIzaSyBFj4A2FRz36n1bLiOQbcGhmUdpM-buAZ0";
	var GOOGLE_CUSTOM_SEARCH_ENGINE_ID = "017821029378163458527:c46kp7iwut4";
	
	var customSearch = {};
  
  var scrolltoElement = function(e) {
    e.preventDefault();
    var self = $(this),
        correction = e.data ? e.data.correction ? e.data.correction : 0 : 0;
    $('html, body').animate({'scrollTop': $(self.attr('href')).offset().top - correction }, 400);
  };
	
  var closeMenu = function(e) {
	  e.stopPropagation();
    $('body').removeClass('menu-open');
		$('#site-nav-switch').removeClass('active');
  };
  
  var toggleMenu = function(e) {
	  e.stopPropagation();
	  $('body').toggleClass('menu-open');
    $('#site-nav-switch').toggleClass('active');
  };
	
	$(function() {
		$('#footer, #main').addClass('loaded');
		$('#site-nav-switch').on('click', toggleMenu);
		$(document).on('click', closeMenu);
		$('#site-menu').on('click', function (e) {
			e.stopPropagation();
		});
		$('.window-nav, .go-comment').on('click', scrolltoElement);
    $(".content .video-container").fitVids();

		setTimeout(function() {
	    $('#loading-bar-wrapper').fadeOut(500);
	  }, 300);
	  
	  if (GOOGLE_CUSTOM_SEARCH_ENABLE) {
  	  customSearch = new GoogleCustomSearch({
    	  apiKey: GOOGLE_CUSTOM_SEARCH_API_KEY,
    	  engineId: GOOGLE_CUSTOM_SEARCH_ENGINE_ID
  	  });
	  }

	});
		
})(jQuery);