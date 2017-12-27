jQuery(document).ready(function () {
    //     var getbaseurl = $("#getbaseurl").val();
    $(".getformid_js").click(function () {

        $(".getformid_js").removeClass("nopointerevents");
        $(this).addClass("nopointerevents");
        let getformid = $(this).attr("data-formid");
        $(".hideform_js").slideUp(500);
        $(getformid).slideDown(500);
    });


    $(".signinandregister_js").click(function () {
        $('.signupandloginwrapper .form-control').val('');
        $(".signinandregister_js").removeClass("redcolor");
        $(this).addClass("redcolor");
        let getformtype = $(this).attr("data-option");
        if (getformtype == "signin") {
            $(".hideforsignin_js").slideUp(500);
            $(".signupandloginwrapper .btn-submit").text("Sign In");
        } else {
            $(".hideforsignin_js").slideDown(500);
            $(".signupandloginwrapper .btn-submit").text("Sign Up");
        }
    });
    $('.animate-slide').animatedHeadline({
        animationType: 'slide'
    });

    var getdevicewidth = $(window).width()
    if (getdevicewidth < 768) {
        $('.mobilemenu_js').click(function () {
            $(".logoandmenudiv").slideToggle(400, function () {
                $(".logoandmenudiv").toggleClass("active");
                $(".mobilemenu_js").children().toggleClass("fa-close fa-bars");

            });
        });
    }

    $(".editaddress_js").click(function () {
        $(".profiledetails").addClass("activeinputtype");
        $('#custompassword_js').prop('type', 'password');
        $(this).slideUp(500);
        $(".backandsavebuttons").addClass("active");
    });
    $(".savedetails_js").click(function () {
        $(".profiledetails").removeClass("activeinputtype");
        $(".editaddress_js,.hideeditpasswordcolumn_js").slideDown(500);
        $(".changepasswordwrapper").slideUp(500);
        $(".backandsavebuttons").removeClass("active");
    });
    $(".editpasswor_js").click(function () {
        $(".hideeditpasswordcolumn_js").slideUp(500);
        $(".changepasswordwrapper").addClass("activeinputtype");
        $(".changepasswordwrapper").slideDown(500);
        $('#custompassword_js').prop('type', 'text');
        $(".backandsavebuttons").addClass("active");
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
    
    $(".jqtransform").jqTransform();
    
    $(".quality_js").click(function(){
        $(this).parent().parent().children().find("a.quality_js").removeClass("active");
        $(this).addClass("active");
    });
    
    $(".increasequantity_js").click(function(){
        var getval = parseInt($(this).parent().prev().val());
        if(getval >= 0){
            getval += 1;
        } else {
            getval = 1;
        }
        $(this).parent().prev().val(getval).trigger("change");
    });

    $(".decreasequantity_js").click(function(){
        var getval = parseInt($(this).parent().prev().val());
        if(getval > 1){
            getval -= 1;
        } else {
            getval = 1;
        }
        $(this).parent().prev().val(getval).trigger("change");;
    });

    $(".closeuploadedproduct_js").click(function(){
        var b =$(this).parent().parent().parent();
        b.remove();
    });
    $(".triggerthreedpopup_js").click(function(){
        $(".threedviewpopup").addClass("active");
    });
    $(".closethreedviewpopup_js").click(function(){
        $(".threedviewpopup").removeClass("active");
    });

    $(".editaddresspopup_js").click(function(){
        $(".editaddresspopup").addClass("active");
    });
    $(".closeEditAddressPopup_js").click(function(){
        $(".editaddresspopup").removeClass("active");
    });

    $("#overlay").addClass('loaded');
});

function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode != 46 && charCode > 31
        && (charCode < 48 || charCode > 57))
        return false;

    return true;
}

