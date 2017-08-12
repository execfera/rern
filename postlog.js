var hkorigin = window.location.href, hkhook;
if (hkorigin.indexOf("post/?mode=3") === -1 && hkorigin.indexOf("/home/") === -1 && hkorigin.indexOf("/msg/") === -1){	
	$('.exclusivebutton').last().submit(function (e) {
		var hkuser = $('#top_info a').first().text(), hkhook = '';
		var hkurl = main_url + 'topic/' + $('.exclusivebutton:last input[name="t"]').val() + '/#new';
		if (window.location.href.indexOf("post/?mode=2") !== -1){ 
			var hkthread = $('li','#nav').eq(-3).text(), hkarea = $('li','#nav').eq(-5).text();
		}
		else if (window.location.href.indexOf("post/?type=1&mode=1") !== -1) { 
			var hkthread = $("input[name='title']").val(), hkarea = $('li','#nav').eq(-3).text();
			hkurl = $('li a','#nav').eq(2).attr('href');
		}
		else { var hkthread = $('title').text(), hkarea = $('li','#nav').eq(-3).text(); }
		var content = { content: "User: `" + hkuser + "` Thread: `" + hkthread + "` Area: `" + hkarea + "`\nURL: <" + hkurl + ">"};
		if (hkthread.indexOf("Posting reply to") === -1) { 
      if ($('li','#nav').eq(5).text() === "Mod Cave" && $('li','#nav').eq(7).text() !== "Admin Council") hkhook = "https://discordapp.com/api/webhooks/275471962011074561/jqx51rmGcyQQBALxVYMkWTN9fyiX9tB6OkIOKK6K1Hci79SZSCyEDOrG0Gn42ncjQMK0";
      else hkhook = "https://discordapp.com/api/webhooks/266821624915951616/z7_sauLbBZ9yu_lB3rQiNCVg7PUBeaD8azxOaqScZ1k2pghSpOsA-sBM_JMLnD3o3tNb?wait=true";
      $.ajax({ url: hkhook, type: "POST", method: "POST", data: JSON.stringify(content), contentType: "application/json; charset=utf-8", async: false}); 
    }
	});
}