function validate_phone(required) {
  console.log("validating phone");
  $("#phone").removeClass("error")
  $("#phone").val("")
  if ( $("[name=phone]").val() == "" && required ) {
    $("#phone").addClass("error")
    $("#phone").val("Contact number is required");
    return false
  }
  if ( $("[name=phone]").val() == "" || $("[name=phone]").intlTelInput("isValidNumber") ) {
    $("[name=phone]").val($("[name=phone]").intlTelInput("getNumber", 1))
    return true
  }
  $("#phone").addClass("error")
  $("#phone").val("Please enter a valid number!")
  return false
}

var reset_form = function(first_run) {
  if (window.location.href.indexOf("address-book") < 0) {
    reset_profile_form(first_run);
  } else {
    reset_address_form(first_run);
  }
}

var reset_profile_form = function(first_run) {
  $(".editpassword_js").slideDown(500);
  $(".editprofile_js").slideDown(500);
  $(".changepasswordwrapper").slideUp(500);
  $(".backandsavebuttons").removeClass("active");

  $("[name=fname]").val(window.user.fname);
  $("[name=lname]").val(window.user.lname);
  $("[name=organisation]").val(window.user.organisations[0]);
  $("[name=phone]").val(window.user.phone);
  $("[name=passwd]").val('fracktal');
  $("[name=new_passwd]").val('');
  $("[name=re_new_passwd]").val('');

  $("[name=fname]").attr('readonly', 'readonly');
  $("[name=lname]").attr('readonly', 'readonly');
  $("[name=organisation]").attr('readonly', 'readonly');
  $("[name=phone]").attr('readonly', 'readonly');
  $("[name=passwd]").attr('readonly', 'readonly');

  if ( ! first_run ) {
    $("#fatal").removeClass("error");
    $("#fatal").val("");
    $("#fname").removeClass("error");
    $("#fname").val("");
    $("#lname").removeClass("error");
    $("#lname").val("");
    $("#organisation").removeClass("error");
    $("#organisation").val("");
    $("#email").removeClass("error");
    $("#email").val("");
    $("#phone").removeClass("error");
    $("#phone").val("");
    $("#passwd").removeClass("error");
    $("#passwd").val("");
    $("#new_passwd").removeClass("error");
    $("#new_passwd").val("");
    $("#re_new_passwd").removeClass("error");
    $("#re_new_passwd").val("");
  }
}

var reset_address_form = function(first_run) {
  var index = $("[name=index]").val();
  if ( window.user.addresses[index] ) {
    $("[name=identifier]").val(window.user.addresses[index].identifier);
    $("[name=full_name]").val(window.user.addresses[index].full_name);
    $("[name=organisation]").val(window.user.addresses[index].organisation);
    $("[name=line_1]").val(window.user.addresses[index].line_1);
    $("[name=line_2]").val(window.user.addresses[index].line_2);
    $("[name=city]").val(window.user.addresses[index].city);
    $("[name=state]").val(window.user.addresses[index].state);
    $("[name=area_code]").val(window.user.addresses[index].area_code);
    $("[name=phone]").val(window.user.addresses[index].phone);
    $("[name=identifier]").attr('readonly', 'readonly');
  } else {
    $("[name=index]").val(-1)
    $("[name=identifier]").val("");
    $("[name=full_name]").val("");
    $("[name=organisation]").val("");
    $("[name=line_1]").val("");
    $("[name=line_2]").val("");
    $("[name=city]").val("");
    $("[name=state]").val("");
    $("[name=area_code]").val("");
    $("[name=phone]").val("");
  }

  if ( ! first_run ) {
    $("#fatal").removeClass("error");
    $("#fatal").val("");
    $("#identifier").removeClass("error");
    $("#identifier").val("");
    $("#full_name").removeClass("error");
    $("#full_name").val("");
    $("#organisation").removeClass("error");
    $("#organisation").val("");
    $("#line_1").removeClass("error");
    $("#line_1").val("");
    $("#line_2").removeClass("error");
    $("#line_2").val("");
    $("#city").removeClass("error");
    $("#city").val("");
    $("#state").removeClass("error");
    $("#state").val("");
    $("#phone").removeClass("error");
    $("#phone").val("");
    $("#area_code").removeClass("error");
    $("#area_code").val("");
  }
}

var edit_address = function(index) {
  $("[name=index]").val(index);
  reset_form();
}

var delete_address = function(index) {
  if (confirm("Delete " + window.user.addresses[index].identifier + " address?")) {
    window.location.href = window.location.protocol + "//" + window.location.host + "/address-book/delete/" + index + window.location.search;
  }
}

jQuery(document).ready(function () {
  $("[name=phone]").intlTelInput({
    preferredCountries: ["in"],
    initialCountry: "in",
    utilsScript: "libraries/intlTelInput/js/utils.js"
  });

  reset_form(true);

  $(".editprofile_js").click(function () {
    reset_form();
    $(this).slideUp(500);
    $("[name=fname]").prop('readonly', false);
    $("[name=lname]").prop('readonly', false);
    $("[name=organisation]").prop('readonly', false);
    $("[name=phone]").prop('readonly', false);
    $(".backandsavebuttons").addClass("active");
  });

  $(".editpassword_js").click(function () {
    reset_form();
    $("[name=passwd]").val('');
    $("[name=passwd]").prop('readonly', false);
    $(".editpassword_js").slideUp(500);
    $(".editprofile_js").slideUp(500);
    $(".changepasswordwrapper").slideDown(500);
    $(".backandsavebuttons").addClass("active");
  });

  $(".saveprofile_js").click(function () {
    if ( $(".changepasswordwrapper").is(":visible") ) {
      $("form").attr("action","/signin/recovery");

      $("form").removeClass("invalid");
      if ( ! validate_length("Password", "passwd", 8, 24, false) ) { $("form").addClass("invalid"); }
      if ( ! validate_length("Password", "new_passwd", 8, 24, false) ) { $("form").addClass("invalid"); }
      if ( ! validate_passwd() ) { $("form").addClass("invalid"); }
      if ( $("form").hasClass("invalid") ) {
        return false;
      }
    } else {
      $("form").attr("action","/profile" + window.location.search);
      $("form").removeClass("invalid");
      if ( ! validate_length("First name", "fname", 2, 24, true) ) { $("form").addClass("invalid"); }
      if ( ! validate_length("Last name", "lname", 1, 24, true) ) { $("form").addClass("invalid"); }
      if ( ! validate_length("Organisation", "organisation", 5, 64, true) ) { $("form").addClass("invalid"); }
      if ( ! validate_phone() ) { $("form").addClass("invalid"); }
      if ( $("form").hasClass("invalid") ) {
        return false;
      }
    }
    $("form").submit();
  });

  $(".saveaddress_js").click(function () {
    var index = $("[name=index]").val();
    if ( window.user.addresses[index] ) {
      $("form").attr("action","/address-book/edit/" + $("[name=index]").val() + window.location.search);
    } else {
      $("form").attr("action","/address-book/add" + window.location.search);
    }
    $("form").removeClass("invalid");
    if ( ! validate_length("Identifier", "identifier", 3, 16, true) ) { $("form").addClass("invalid"); }
    if ( ! validate_length("Name", "full_name", 12, 64, true) ) { $("form").addClass("invalid"); }
    if ( ! validate_length("Organisation", "organisation", 5, 64, false) ) { $("form").addClass("invalid"); }
    if ( ! validate_length("Line 1", "line_1", 5, 64, true) ) { $("form").addClass("invalid"); }
    if ( ! validate_length("Line 2", "line_2", 8, 64, true) ) { $("form").addClass("invalid"); }
    if ( ! validate_length("City", "city", 2, 24, true) ) { $("form").addClass("invalid"); }
    if ( ! validate_length("State", "state", 2, 24, true) ) { $("form").addClass("invalid"); }
    if ( ! validate_length("Postal code", "area_code", 6, 6, true) ) { $("form").addClass("invalid"); }
    if ( ! validate_phone(true) ) { $("form").addClass("invalid"); }
    if ( $("form").hasClass("invalid") ) {
      return false;
    }
    $("form").submit();
  });

  $(".reset_js").click(function () {
    $("[name=index]").val(-1);
    reset_form();
  });

  $('.scrollbars').ClassyScroll({
    wheelSpeed: 80,
    touchSpeed: 50
  });
/*
  $(".triggerOrderDetails_js").click(function () {
    $(".triggerOrderDetails_js").removeClass("active");
    $(this).addClass("active");
    $(".orderdetialswrapper").addClass("active");
  });
*/
  $(".closeOrderDeatils_js").click(function () {
    $(".triggerOrderDetails_js").removeClass("active");
    $(".orderdetialswrapper").removeClass("active");
  });

  var validate_length = function(label, field, min, max, required) {
    $("#" + field).removeClass("error");
    $("#" + field).val("There was some error!");
    if ( $("[name=" + field + "]").val().length == 0 && required) {
      $("#" + field).val(label + " is required!");
      $("#" + field).addClass("error");
      return false;
    }
    if ( $("[name=" + field + "]").val().length == 0 && !required) {
      return true;
    }
    if ( $("[name=" + field + "]").val().length < min ) {
      $("#" + field).val(label + " too short!");
      $("#" + field).addClass("error");
      return false;
    }
    if ( $("[name=" + field + "]").val().length > max ) {
      $("#" + field).val(label + " too long!");
      $("#" + field).addClass("error");
      return false;
    }
    return true;
  }

  var validate_passwd = function() {
    if ( $("[name=new_passwd]").val() == $("[name=re_new_passwd]").val() ) {
      $("#re_new_passwd").removeClass("error");
      $("#re_new_passwd").val("");
      return true;
    }
    $("#re_new_passwd]").val("Passwords do not match!");
    $("#re_new_passwd").addClass("error");
    return false;
  }

  if (window.location.href.indexOf("address-book") < 0) {
    $("[name=phone]").on("change", function() { validate_phone() })
  } else {
    $("[name=phone]").on("change", function() { validate_phone(true) })
  }
  $("[name=organisation]").on("change", function() { validate_length("Organisation", "organisation", 5, 64, false); })

  $("[name=fname]").on("change", function() { validate_length("First name", "fname", 2, 24, true); })
  $("[name=lname]").on("change", function() { validate_length("Last name", "lname", 1, 24, true); })

  $("[name=identifier]").on("change", function() { validate_length("Identifier", "identifier", 3, 16, true); })
  $("[name=full_name]").on("change", function() { validate_length("Name", "full_name", 12, 64, true); })
  $("[name=line_1]").on("change", function() { validate_length("Line 1", "line_1", 5, 64, true); })
  $("[name=line_2]").on("change", function() { validate_length("Line 2", "line_2", 8, 64, true); })
  $("[name=city]").on("change", function() { validate_length("City", "city", 2, 24, true); })
  $("[name=state]").on("change", function() { validate_length("State", "state", 2, 24, true); })
  $("[name=area_code]").on("change", function() { validate_length("Postal code", "area_code", 6, 6, true); })

  $("[name=passwd]").on("change", function() { validate_length("Password", "passwd", 8, 24, false); })
  $("[name=new_passwd]").on("change", function() { validate_length("Password", "passwd", 8, 24, false); $("[name=re_new_passwd]").val(""); })
  $("[name=re_new_passwd]").on("change", function() { validate_passwd(); })

  window.main_content_min_height = $("#main_content").outerHeight();
  window.onresize = function() {
    $("#main_content").height(window.main_content_min_height);
    var diff = $("#overlay").outerHeight() - $("#main_content").outerHeight() - $("footer").outerHeight() - $("header").outerHeight();
    if (diff > 0) {
      $("#main_content").height($("#main_content").outerHeight() + diff);
    }
  }
  window.onresize();

  $("#overlay").addClass('loaded');
});
