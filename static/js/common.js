jQuery(document).ready(function () {
  var getdevicewidth = $(window).width();
  if (getdevicewidth < 768) {
    $('.mobilemenu_js').click(function () {
      $(".logoandmenudiv").slideToggle(400, function () {
        $(".logoandmenudiv").toggleClass("active");
        $(".mobilemenu_js").children().toggleClass("fa-close fa-bars");
      });
    });
  }
});
