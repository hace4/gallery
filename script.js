$('.portfolio-slides').slick({
  infinite        : true,
  slidesToShow    : 2,
  slidesToScroll  : 1,
  mobileFirst     : true
});


$('.portfolio-slides').slickLightbox({
  itemSelector        : 'a',
  navigateByKeyboard  : true
});