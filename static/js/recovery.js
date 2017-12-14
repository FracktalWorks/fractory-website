jQuery(document).ready(function () {
  $(".signinandsignup").addClass("active");

  window.main_content_min_height = $("#main_content").outerHeight();
  window.onresize = function() {
    $("#main_content").height(window.main_content_min_height);
    var diff = $("#overlay").outerHeight() - $("#main_content").outerHeight() - $("footer").outerHeight() - $("header").outerHeight() - 2;
    if (diff > 0) {
      $("#main_content").height($("#main_content").outerHeight() + diff);
    }
  }
  window.onresize();

  $("#overlay").addClass("loaded");
});
