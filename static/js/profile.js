jQuery(document).ready(function () {
  var reset_form = function() {
    $(".editpassword_js").slideDown(500);
    $(".editprofile_js").slideDown(500);
    $(".changepasswordwrapper").slideUp(500);
    $(".backandsavebuttons").removeClass("active");

    $("[name=fname]").prop('disabled', true);
    $("[name=lname]").prop('disabled', true);
    $("[name=organisation]").prop('disabled', true);
    $("[name=phone]").prop('disabled', true);
    $("[name=passwd]").prop('disabled', true);

    // TODO: Reset profile values
    $("[name=passwd]").val("fracktal");
  }
  reset_form();

  $(".editprofile_js").click(function () {
    reset_form();
    $(this).slideUp(500);
    $(".backandsavebuttons").addClass("active");
    $("[name=fname]").prop('disabled', false);
    $("[name=lname]").prop('disabled', false);
    $("[name=organisation]").prop('disabled', false);
    $("[name=phone]").prop('disabled', false);
  });

  $(".editpassword_js").click(function () {
    reset_form();
    $("[name=passwd]").prop('disabled', false);
    $(".changepasswordwrapper").slideDown(500);
  });


  $(".saveprofile_js").click(function () {
    reset_form();
/*



    $("form").attr("action","/profile" + window.location.search);

    $("form").removeClass("invalid");
    if ( ! validate_length("First name", "fname", 2, 24, true) ) { $("form").addClass("invalid"); }
    if ( ! validate_length("Last name", "lname", 1, 24, true) ) { $("form").addClass("invalid"); }
    if ( ! validate_length("Password", "passwd", 8, 24, false) ) { $("form").addClass("invalid"); }
    if ( ! validate_length("Password", "new_passwd", 8, 24, false) ) { $("form").addClass("invalid"); }
    if ( ! validate_passwd() ) { $("form").addClass("invalid"); }

    if ( $("form").hasClass("invalid") ) {
      return false;
    }
    return true;
*/
  });

  $(".resetprofile_js").click(function () {
    reset_form();
  });

  $('.scrollbars').ClassyScroll({
    wheelSpeed: 80,
    touchSpeed: 50
  });

  $(".triggerOrderDetails_js").click(function () {
    $(".triggerOrderDetails_js").removeClass("active");
    $(this).addClass("active");
    $(".orderdetialswrapper").addClass("active");
  });

  $(".closeOrderDeatils_js").click(function () {
    $(".triggerOrderDetails_js").removeClass("active");
    $(".orderdetialswrapper").removeClass("active");
  });

  var validate_length = function(label, field, min, max, required=false) {
    $("#" + field).removeClass("error");
    $("#" + field).val("There was some error!");
    if ( $("[name=" + field + "]").val().length == 0 && required) {
      $("#" + field).val(label + " is required!");
      $("#" + field).addClass("error");
      return false;
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

  function validate_phone() {
    if ( $("[name=phone]").val() == "" || $("[name=phone]").intlTelInput("isValidNumber") ) {
      $("#phone").removeClass("error")
      $("#phone").val("")
      $("[name=phone]").val($("[name=phone]").intlTelInput("getNumber", 1))
      return true
    }
    $("#phone").addClass("error")
    $("#phone").val("Please enter a valid number!")
    return false
  }

  $("[name=phone]").intlTelInput({
    preferredCountries: ["in"],
    initialCountry: "in",
    utilsScript: "libraries/intlTelInput/js/utils.js"
  });

  $("[name=phone]").on("change", function() { validate_profile_phone() })
  $("[name=fname]").on("change", function() { validate_length("First name", "fname", 2, 24, true); })
  $("[name=lname]").on("change", function() { validate_length("Last name", "lname", 1, 24, true); })
  $("[name=passwd]").on("change", function() { validate_length("Password", "passwd", 8, 24, false); })
  $("[name=new_passwd]").on("change", function() { validate_length("Password", "passwd", 8, 24, false); $("[name=re_new_passwd]").val(""); })
  $("[name=re_new_passwd]").on("change", function() { validate_passwd(); })

  $("#overlay").addClass('loaded');
});
