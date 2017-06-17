// Outer Heaven - Chip Parse Code 1.0

var chipData = {};
var remoteChipTime;
var chipGet = $.Deferred();

var timeGet = $.get("https://api.myjson.com/bins/10uw9", function (data, textStatus, jqXHR) {
remoteChipTime = data.timestamp;
if (!(localStorage.getItem("cCacheTime"))) localStorage.setItem("cCacheTime", data.timestamp.toString()); 
});

timeGet.done(function() { 

if((localStorage.getItem("cDataCache")) && (parseInt(localStorage.getItem("cCacheTime"), 10) === remoteChipTime)) {
    chipData = JSON.parse(localStorage.getItem("cDataCache"));
	chipGet.resolve();
  } else {
	$.get("https://api.myjson.com/bins/1c6zx", function (data, textStatus, jqXHR) {
	chipData = data;
	localStorage.setItem("cDataCache", JSON.stringify(data));
	localStorage.setItem("cCacheTime", remoteChipTime.toString());
	}) .done(function(){ chipGet.resolve(); });
}

});

$(document).data("readyDeferred", $.Deferred()).ready(function() {
    $(document).data("readyDeferred").resolve();
});

$.when( $(document).data("readyDeferred"), chipGet ).done (function() {
  $('.c_post:contains("[chip="):not(:has("textarea")), .c_sig:contains("[chip="):not(:has("textarea"))').each(function() {
    $(this).html($(this).html().replace(/\[chip=([^,\]]*)(,(i|s|f|a))?\]/g, function(match, p1, p2, p3) {
    	if (!(p1 in chipData)) return match; else return chipTagReplace(p1,p3);
	  }));
	});
  chipTagFunction();  
});

function chipTagReplace(name, param) {
	switch(param) {
		case "i":
			return `<img src='https://execfera.github.io/rern_chip/${name}.png'>`;
		case "s":
			return `${chipData[name].summ} (Acc: ${chipData[name].acc})`;
		case "f":
			return `<img src='https://execfera.github.io/rern_chip/${name.replace('+','')}.png'> <span class='chip'><span class='chipclick'>${name}</span><span class='chipbody'>${chipData[name].desc}</span></span>`;
		case "a":
			if (!("alias" in chipData[name])) return match; 
			else return `<img src='https://execfera.github.io/rern_chip/${name.replace('+','')}.png'> <span class='chip'><span class='chipclick'>${chipData[name].alias}</span><span class='chipbody'>${chipData[name].desc}</span></span>`;
		default: 
			var elcolor; 
			switch (chipData[name].elem) {
				case "Fire": elcolor = "<font color=#d22700>" + name + "</font>"; break;
				case "Aqua": elcolor = "<font color=#6495ed>" + name + "</font>"; break;
				case "Elec": elcolor = "<font color=#dbcd00>" + name + "</font>"; break;
				case "Wood": elcolor = "<font color=#00c96b>" + name + "</font>"; break;
				default: elcolor = name; break;
			}		
			return `<img src='https://execfera.github.io/rern_chip/${name}.png'> <strong>${elcolor}</strong>: ${chipData[name].summ}`;
	}
}

function chipTagFunction () {
  $("body").unbind("click");
  $("body").click(function(event) {
  	$(".chipbody").hide();
  }).click();
	$(".chipclick").unbind("click");
	$(".chipclick").click(function(event) {
    $(this.nextSibling).toggle();
    event.stopPropagation();
  });
	$(".chipbody").unbind("click");
  $(".chipbody").click(function(event) {
    event.stopPropagation();
		return false;
  }); fixZBSpoiler();
}
function fixZBSpoiler () {
  $("div.spoiler_toggle").unbind("click");
  $("div.spoiler_toggle").click(function(event) {
    $(this.nextSibling).toggle();
    event.stopPropagation();
	});
}