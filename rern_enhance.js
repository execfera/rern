// Inbox Notification
if($('#menu_pm small').text() && $('#menu_pm small').text() !== '0') {
     document.querySelector('link[rel="shortcut icon"]').href = "http://z6.ifrm.com/8164/173/0/f7000178/NewMailFavicon.gif"; 
} 
else { 
    document.querySelector('link[rel="shortcut icon"]').href = "http://z6.ifrm.com/8164/173/0/v1/favicon.gif"; 
}

// Spoiler Tag Makeshift Fix
$(".go_top").unbind("click").click(function(e) {chipTagFunction();});
setInterval(function() { if($('div.spoiler_toggle').length && !($('div.spoiler_toggle').data('events'))){chipTagFunction(); } }, 1500);

// Replace Delete Topic with View 100 Posts
if ($("#topic_viewer .right a:contains('Delete Topic')").length > 0) $("#topic_viewer .right a:contains('Delete Topic')").text('View 100 Posts').attr('href',main_url + 'topic/' + $('.exclusivebutton:last input[name="t"]').val() + "/?x=100").attr('onclick','');
else $("#topic_viewer .right a:contains('Edit Topic Title')").after(" · <a href='"+main_url + 'topic/' + $('.exclusivebutton:last input[name="t"]').val() + "/?x=100'>View 100 Posts</a>");

// Mobile Scaling
var md = new MobileDetect(window.navigator.userAgent);
if (md.mobile() && window.location.href.indexOf("/topic/") > -1) {
    $("#main_content img").css({
        height: "auto", 
        width: "100%"
    });
    $("#topic_viewer thead th").removeProp("colspan");
    $("#topic_viewer tbody tr:first-child th").removeProp("colspan");
    $("td.c_username, td.c_postinfo").addClass("mobilefix").css("display","block");
    $("td.c_user").css({
        display: "block",
        width: "auto"
    }).removeProp("colspan");
    $("dl.user_info").css({
        width: "auto",
        "margin-right": "10px"
    });
    $("td.c_post").css("display", "block");
    $("tr.c_postfoot td:first-child").css("display", "none");
    $(".post_sep, .c_view, .c_foot").removeProp("colspan");
    $("img[src$='house_logo.png']").css({
        "height": "auto",
        "max-height": "80px",
        "width": "90%",
        "max-width": "300px"
    }).parent().next().hide().parent().css("width","auto");
    $(".c_sig img").css({
        height: "auto", 
        width: "100%"
    });
    $(".c_sig").css("word-break", "break-all");
    $("#fast-reply").css("width", "100%");
}