(function ($) {

  "use strict";

  var toggleActive = function (self, e) {
    e.preventDefault();
    if (self.hasClass("active") === true) {
      self.removeClass("active");
    } else {
      self.addClass("active");
    }
  };

  var switchSidebarTab = function (e) {
    var self = $(this),
      target = self.attr('data-toggle'),
      counter_target = target === 'toc' ? 'bio' : 'toc';
    if (self.hasClass('active')) {
      return;
    }
    toggleActive(self, e);
    toggleActive(self.siblings('.dark-btn'), e);
    $('.site-' + counter_target).toggleClass('show');
    setTimeout(function () {
      $('.site-' + counter_target).hide();
      $('.site-' + target).show();
      setTimeout(function () {
        $('.site-' + target).toggleClass('show');
      }, 50);
    }, 240);
  };

  var scrolltoElement = function (e) {
    e.preventDefault();
    var self = $(this),
      correction = e.data ? e.data.correction ? e.data.correction : 0 : 0;
    $('html, body').animate({'scrollTop': $(self.attr('href')).offset().top - correction}, 400);
  };

  var closeMenu = function (e) {
    e.stopPropagation();
    $('body').removeClass('menu-open');
    $('#site-nav-switch').removeClass('active');
  };

  var toggleMenu = function (e) {
    e.stopPropagation();
    $('body').toggleClass('menu-open');
    $('#site-nav-switch').toggleClass('active');
  };

  var pixivArchiveStat = function () {
    var vol = $(".article-entry ul").length;
    var artistCount = $(".article-entry ul li").length;
    $("#pixiv-vol").text(vol);
    $("#pixiv-artist-count").text(artistCount);
  };

  $(function () {
    $('#footer, #main').addClass('loaded');
    $('#site-nav-switch').on('click', toggleMenu);
    $('#site-wrapper .overlay, #sidebar-close').on('click', closeMenu);
    $('.window-nav, .site-toc a').on('click', scrolltoElement);
    $(".content .video-container").fitVids();
    $('#site-sidebar .sidebar-switch .dark-btn').on('click', switchSidebarTab);

    if (window.location.pathname === '/pixiv' || window.location.pathname === '/pixiv/') {
      pixivArchiveStat();
    }

    setTimeout(function () {
      $('#loading-bar-wrapper').fadeOut(500);
    }, 300);
  });

})(jQuery);