var hkorigin = window.location.href;
if (modhook && posthook && hkorigin.indexOf("post/?mode=3") === -1 && hkorigin.indexOf("/home/") === -1 && hkorigin.indexOf("/msg/") === -1) {
	$('.exclusivebutton').last().submit(function (e) {
    let hkhook = 'https://discordapp.com/api/webhooks/hookId/hookToken';
		var hkuser = $('#top_info a').first().text();
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
		if (hkthread.indexOf("Posting reply to") === -1 && hkarea !== "Admin Council") { 
      if ($('li','#nav').eq(5).text() === "Mod Cave" ) hkhook = hkhook.replace('hookId', modhook.id).replace('hookToken', modhook.token);
      else hkhook = hkhook.replace('hookId', posthook.id).replace('hookToken', posthook.token);
      $.ajax({ url: hkhook, type: "POST", method: "POST", data: JSON.stringify(content), contentType: "application/json; charset=utf-8", async: false}); 
    }
	});
}