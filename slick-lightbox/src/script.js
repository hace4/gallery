$('.portfolio-slides').slick({
  infinite        : true,
  slidesToShow    : 3,
  slidesToScroll  : 1,
  mobileFirst     : true
});


$('.portfolio-slides').slickLightbox({
  itemSelector        : 'a',
  navigateByKeyboard  : true
});