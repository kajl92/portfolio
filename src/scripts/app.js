"use strict"
// hamburger menu
$(function () {
  $('.hamburger-box').on('click', function (e) {
    $('.full-menu').slideToggle(1000);
  });

});

$(function () {
  $('.hamburger-box').on('click', function (e) {
    let elem = $(e.target),
        btn = elem.closest('.hamburger');
      
    if (!btn.hasClass('is-active')) {
      btn.addClass('is-active');
    } else {
      btn.removeClass('is-active');
    }

  })
});
