var waiting_for_google = function() {
  if ( $("[id^=not_signed]").length ) {
    $("[id^=not_signed]").html("Continue with Google");
    $("#overlay").addClass("loaded");
    waiting_for_google = undefined;
  } else {
    setTimeout(waiting_for_google,20);
  }
}

jQuery(document).ready(function () {
  window.query = {}
  window.location.search.substr(1).split("&").forEach(function(item) {window.query[item.split("=")[0]] = item.split("=")[1]})

  if ( window.query['tag'] == "signin") {
    $(".signinandregister_js").removeClass("redcolor");
    $(".signinandregister_js[data-option*='signin']").addClass("redcolor");

    $(".hideforsignin_js").slideUp(0);
    $(".hideforregister_js").slideDown(0);
    $(".signupandloginwrapper .btn-submit").text("Sign In");
  } else {
    $(".signinandregister_js").removeClass("redcolor");
    $(".signinandregister_js[data-option*='register']").addClass("redcolor");

    $(".hideforregister_js").slideUp(0);
    $(".hideforsignin_js").slideDown(0);
    $(".signupandloginwrapper .btn-submit").text("Sign Up");
  }

  try {
    var canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    var ctx = canvas.getContext("2d");
    var img = new Image;
    img.onload = function(){
      try {
        ctx.drawImage(img, 0, 0, 1, 1, 0, 0, 1, 1);
        var p = ctx.getImageData(0, 0, 1, 1).data;
        p_avg = ( p[0] + p[1] + p[2] ) / 3;
        if ( p[0] < (p_avg * 1.1) && p[0] > (p_avg * 0.9) && p[1] < (p_avg * 1.1) && p[1] > (p_avg * 0.9) && p[2] < (p_avg * 1.1) && p[2] > (p_avg * 0.9) &&
             p[0] < 250 && p[0] > 150 && p[1] < 250 && p[1] > 150 && p[2] < 250 && p[2] > 150 ) {
          document.body.style.backgroundColor = "rgb(" + p[0] + "," + p[1] + "," + p[2] + ")";
        }
      } catch(err) {
      }
    };
    img.src = document.getElementById("video-layer").poster;
  } catch(err) {
  }

  $(".stories_js").owlCarousel({
    loop: true,
    autoplay: true,
    autoplayTimeout: 3000,
    nav: false,
    dots: true,
    responsiveClass: true,
    responsive: {
      0: {
        items: 1
      },
      480: {
       items: 1
      },
      640: {
       items: 1
      },
      768: {
       items: 1
      },
      992: {
        items: 1
      },
      1000: {
        items: 1
      }
    }
  });

  $(".signinandregister_js").click(function () {
    if ( $(this).hasClass("redcolor") ) { return; }
    $(".signupandloginwrapper .form-control").val("");
    $(".signupandloginwrapper .block").removeClass("error");
    $(".signinandregister_js").removeClass("redcolor");
    $(this).addClass("redcolor");
    let getformtype = $(this).attr("data-option");
    $("form").attr("action",getformtype);
    if (getformtype == "signin") {
      $(".hideforsignin_js").slideUp(500);
      $(".hideforregister_js").slideDown(500);
      $(".signupandloginwrapper .btn-submit").text("Sign In");
    } else {
      $(".hideforregister_js").slideUp(500);
      $(".hideforsignin_js").slideDown(500);
      $(".signupandloginwrapper .btn-submit").text("Sign Up");
    }
  });

  $(".animate-slide").animatedHeadline({
    animationType: "slide"
  });

  var getdevicewidth = $(window).width()
   if (getdevicewidth < 768) {
     $(".mobilemenu_js").click(function () {
         $(".logoandmenudiv").slideToggle(400, function () {
             $(".logoandmenudiv").toggleClass("active");
             $(".mobilemenu_js").children().toggleClass("fa-close fa-bars");
           });
       });
   }

  document.getElementById("video-layer").onplay = function() {
    try {
      var canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(document.getElementById("video-layer"), 0, 0, 1, 1);
      var p = ctx.getImageData(0, 0, 1, 1).data;
      if ( p[0] < 250 && p[0] > 200 && p[1] < 250 && p[1] > 200 && p[2] < 250 && p[2] > 200 ) {
        document.body.style.backgroundColor = "rgb(" + p[0] + "," + p[1] + "," + p[2] + ")";
      }
    } catch(err) {
    }
  }
  document.getElementById("video-layer").play()

  var validate_length = function(label, field, min, max, required=false) {
    $("#form_" + field).removeClass("error");
    $("#form_" + field + " label").html("There was some error!");
    if ( $("#form_" + field + " input").val().length == 0 && required) {
      $("#form_" + field + " label").html(label + " is required!");
      $("#form_" + field).addClass("error");
      return false;
    }
    if ( $("#form_" + field + " input").val().length < min ) {
      $("#form_" + field + " label").html(label + " too short!");
      $("#form_" + field).addClass("error");
      return false;
    }
    if ( $("#form_" + field + " input").val().length > max ) {
      $("#form_" + field + " label").html(label + " too long!");
      $("#form_" + field).addClass("error");
      return false;
    }
    return true;
  }

  var validate_email = function() {
    if ( ! validate_length("Email", "email", 5, 127, true) ) { return false }
    var email = $("#form_email input").val();
    var index_of_at = email.indexOf("@");
    var index_of_dot = email.lastIndexOf(".");
    if ( index_of_at < 1 || index_of_dot < index_of_at + 2 || index_of_dot + 3 > email.length ) {
      $("#form_email label").html("Please enter a valid email!");
      $("#form_email").addClass("error");
      return false;
    }
    return true;
  }

  var validate_passwd = function() {
    if ( $(".signinandregister_js[data-option*='signin']").hasClass("redcolor") ) { return true; }
    if ( $("#form_passwd input").val() == $("#form_repasswd input").val() ) {
      $("#form_repasswd").removeClass("error");
      $("#form_repasswd label").html("There was some error!");
      return true;
    }
    $("#form_repasswd label").html("Passwords do not match!");
    $("#form_repasswd").addClass("error");
    return false;
  }

  $("#form_forgot a").click(function() {
    if ( validate_email() ) {
      window.location.href = "/signin/recovery?email=" + encodeURIComponent($("#form_email input").val());
    }
  });

  $("form").on("submit", function() {
    if ( $(".signinandregister_js[data-option*='signin']").hasClass("redcolor") ) {
      $("form").attr("action","/signin" + window.location.search);

      $("form").removeClass("invalid");
      if ( ! validate_email() ) { $("form").addClass("invalid"); }

      if ( $("form").hasClass("invalid") ) { return false; }
      return true;
    } else {
      $("form").attr("action","/register" + window.location.search);

      $("form").removeClass("invalid");
      if ( ! validate_length("First name", "fname", 2, 24, true) ) { $("form").addClass("invalid"); }
      if ( ! validate_length("Last name", "lname", 1, 24, true) ) { $("form").addClass("invalid"); }
      if ( ! validate_email() ) { $("form").addClass("invalid"); }
      if ( $("#form_passwd input").val().length > 100 ) {
        $("form").attr("action","/authorize/" + $("#form_repasswd input").val() + window.location.search);
      } else {
        if ( ! validate_length("Password", "passwd", 8, 24, true) ) { $("form").addClass("invalid"); }
        if ( ! validate_passwd() ) { $("form").addClass("invalid"); }
      }
      if ( $("form").hasClass("invalid") ) {
        return false;
      }
      return true;
    }
  });


  window.facebook_show_dialog = function () {
    FB.login( function(response){
    console.log(response);
      if (response.status === "connected") {
        window.facebook_authenticate();
        $("#form_passwd input").val(response.authResponse.accessToken);
        $("#form_repasswd input").val("facebook");
      }
    }, {scope: "public_profile,email", return_scopes: true, auth_type: "rerequest"} );
  }

  window.facebook_authenticate = function() {
    FB.api("/me?fields=first_name,last_name,email", function(response) {
      $("#form_fname input").val(response.first_name);
      $("#form_lname input").val(response.last_name);
      $("#form_email input").val(response.email);

      $(".signinandregister_js").removeClass("redcolor");
      $(".signinandregister_js[data-option*='register']").addClass("redcolor");
      $(".hideforregister_js").slideUp(0);
      $(".hideforsignin_js").slideDown(0);
      $(".signupandloginwrapper .btn-submit").text("Sign Up");

      $("form").submit();
    });
  }

  window.google_authenticate = function(response) {
    gapi.auth2.getAuthInstance().disconnect();

    var profile = response.getBasicProfile();
    $("#form_fname input").val(profile.getGivenName());
    $("#form_lname input").val(profile.getFamilyName());
    $("#form_email input").val(profile.getEmail());
    $("#form_passwd input").val(response.getAuthResponse().id_token);
    $("#form_repasswd input").val("google");

    $(".signinandregister_js").removeClass("redcolor");
    $(".signinandregister_js[data-option*='register']").addClass("redcolor");
    $(".hideforregister_js").slideUp(0);
    $(".hideforsignin_js").slideDown(0);
    $(".signupandloginwrapper .btn-submit").text("Sign Up");

    $("form").submit();
  }

  window.signout_everything = function () {
    try {
    } catch (err) {
    }
    try {
      var goauth2 = gapi.auth2.getAuthInstance();
      FB.logout();
    } catch (err) {
    }
  }

  $("#form_fname input").on("change", function() { validate_length("First name", "fname", 2, 24, true) })
  $("#form_lname input").on("change", function() { validate_length("Last name", "lname", 1, 24, true) })
  $("#form_email input").on("change", function() { validate_email() })
  $("#form_passwd input").on("change", function() { validate_length("Password", "passwd", 8, 24, true); $("#form_repasswd input").val(""); })
  $("#form_repasswd input").on("change", function() { validate_passwd() })

  $(window).scroll(function () {
    var getscrolltop = $(window).scrollTop();
    var getpositionofsignupsignin = $("#showsignupsignin_js").position().top;
    if (getscrolltop > getpositionofsignupsignin) {
      $(".signinandsignup").addClass("active");
    } else {
      $(".signinandsignup").removeClass("active");
    }
  });

  $("a[href^='#']").click(function (e) {
    e.preventDefault();
    var target = jQuery(this.hash);
    jQuery("html, body").stop().animate({
        'scrollTop': target.offset().top - 0
      }, 500, "swing", function () {});
    if ( $(this).html() == "Register" ) {
      setTimeout(function () {
          $(".signinandregister_js[data-option*='register']").click();
        }, 100);
    } else {
      setTimeout(function () {
          $(".signinandregister_js[data-option*='signin']").click();
        }, 100);
    }
  });

  waiting_for_google();
});
