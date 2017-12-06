// Outer Heaven - Virus Parse Code 1.0

function OpenVrWnd(srcname) {
	var found = false;
	var foundidx = 0;
	var foundkey = "";
	var foundentry1 = "";
	var foundentry2 = "";
	for (var key in virusData) {
		for (var i = 0; i <= 6; i++) { 
			if (virusData[key].virus[i].name === srcname) { 
				found = true; 
				foundkey = key;
				foundidx = i;
				break; 
			}
		}
	}
	if (found === true) {
	foundentry1 = "<strong>" + virusData[foundkey].virus[foundidx].name + "</strong> <a href='javascript:window.open(\"" 
	foundentry2 = "\", window.opener, false); window.close();'>(" + foundkey + ")</a><br><br>";
	if (virusData[foundkey].family_note !== "") foundentry2 += (virusData[foundkey].family_note + "<br><br>");
	foundentry2 += "Area:";
	if (virusData[foundkey].family_area.length === 0) { foundentry2 += " All<br><br>"; }
    else if (foundidx === 6) { foundentry2 += " Undernet<br><br>"; }
	else {
		for (var i = 0; i < virusData[foundkey].family_area.length; i++) {
			if (i === virusData[foundkey].family_area.length-1) foundentry2 += " " + virusData[foundkey].family_area[i] + "<br><br>";
			else foundentry2 += " " + virusData[foundkey].family_area[i] + ",";
		}
	}
	foundentry2 += virusData[foundkey].virus[foundidx].desc;
	
	var oWindow = window.open("", "", "height=640,width=480"); 
	with (oWindow.document) {
		write("");
		write("");
		write("<title>"+srcname+"<\/title>");
		write("<\/head>");
		write("<body style=\"background-color: #eeeeee; font-family: \'Helvetica\', \'Arial\', \'Bitstream Vera Sans\', \'Verdana\', sans-serif; font-size:93.3%;\">");
		write(foundentry1);
		write(encodeURI(virusData[foundkey].family_url));
		write(foundentry2);
		write("<hr>");
		write("<input type='button' value='Close' onclick='window.close()'>");
		write("<\/body>");
		write("<\/html>");
		close(); 
		}
	}
	else alert("Virus entry not found.");
}

if(localStorage.getItem("vDataCache1") && localStorage.getItem("vDataCache2")) {
	var virusData1 = JSON.parse(localStorage.getItem("vDataCache1"));
	var virusData2 = JSON.parse(localStorage.getItem("vDataCache2"));
	var virusData = Object.assign(virusData1, virusData2);
}

$(document).ready(function() {
  $('.c_post:contains("[virus"):not(:has("textarea"))').each(function() {
    $(this).html($(this).html().replace(/\[virus]([^[]*)\[\/virus]/g, function(match, p1) {
		return "<span class='vr_tag'>" + p1 + "</span>";
	}));
    $(this).html($(this).html().replace(/\[virus=([^[]*)]([^[]*)\[\/virus]/g, function(match, p1, p2) {
		return "<span class='vr_tag' name=" + p1 + ">" + p2 + "</span>";
	}));
  });
  $('.c_post:contains("[furl"):not(:has("textarea")), .c_sig:contains("[furl"):not(:has("textarea"))').each(function() {
    $(this).html($(this).html().replace(/\[furl=([0-9]*)(,([0-9]*),([0-9]*))?](.+?(?=\[\/furl]))\[\/furl]/g, function(match, topic, p1, page, post, text) {
		if (!p1) return "<a href ='" + $.zb.stat.url + "topic/" + topic + "/1/' target='_blank' rel='nofollow'>" + text + "</a>";
		else return "<a href ='" + $.zb.stat.url + "topic/" + topic + "/" + page + "/#post-" + post + "' target='_blank' rel='nofollow'>" + text + "</a>";
	}));
  });
  $('.c_post:contains("[imgur"):not(:has("textarea")), .c_sig:contains("[imgur"):not(:has("textarea"))').each(function() {
    $(this).html($(this).html().replace(/\[imgur=([^\]]*)]/g, function(match, id) {
		return "<img src='http://i.imgur.com/" + id + ".png' alt='Posted Image'>";
	}));
  });
  if(localStorage.getItem("vDataCache1")){
		$(".vr_tag").css("cursor", "pointer").click(function() {
			OpenVrWnd($(this).attr("name") ? $(this).attr("name") : $(this).text());
		});
  }

});
