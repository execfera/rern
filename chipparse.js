// Outer Heaven - Chip Parse Code 1.0

var chipData = {}, reduceChip = {};
var remoteChipTime;
var chipGet = $.Deferred();

var timeGet = $.get("https://api.myjson.com/bins/10uw9", function (data, textStatus, jqXHR) {
remoteChipTime = data.timestamp;
if (!(localStorage.getItem("cCacheTime"))) localStorage.setItem("cCacheTime", data.timestamp.toString()); 
});

timeGet.done(function() { 

if((localStorage.getItem("cDataCache")) && (parseInt(localStorage.getItem("cCacheTime"), 10) === remoteChipTime)) {
		chipData = JSON.parse(localStorage.getItem("cDataCache"));
		reduceChip = Object.keys(chipData).reduce(function (keys, k) { 
			keys[k.toLowerCase()] = k; 
			return keys;
		}, {});
	chipGet.resolve();
  } else {
	$.get("https://api.myjson.com/bins/1c6zx", function (data, textStatus, jqXHR) {
	chipData = data;
	reduceChip = Object.keys(chipData).reduce(function (keys, k) { 
		keys[k.toLowerCase()] = k; 
		return keys;
	}, {});
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
    $(this).html($(this).html().replace(/\[chip=([^,\]]*)(,(i|s|f|a|c))?\]/g, function(match, p1, p2, p3) {
    	if (!(p1.toLowerCase() in reduceChip)) return match; else return chipTagReplace(reduceChip[p1.toLowerCase()],p3);
	  }));
	});
  chipTagFunction();  
});

function chipTagReplace(name, param) {
	switch(param) {
		case "i":
			return `<img src='https://execfera.github.io/rern/chip/${name}.png'>`;
		case "s":
			return `${chipData[name].summ} (Acc: ${chipData[name].acc})`;
		case "f":
			return `<img src='https://execfera.github.io/rern/chip/${name.replace('+','')}.png'> <span class='chip'><span class='chipclick'>${name}</span><span class='chipbody'>${chipData[name].desc}<br>Trader Rank: ${chipData[name].rank}</span></span>`;
		case "a":
			if (!("alias" in chipData[name])) return match; 
			else return `<img src='https://execfera.github.io/rern/chip/${name.replace('+','')}.png'> <span class='chip'><span class='chipclick'>${chipData[name].alias}</span><span class='chipbody'>${chipData[name].desc}<br>Trader Rank: ${chipData[name].rank}</span></span>`;
		case "c": 
			var elcolor; 
			switch (chipData[name].elem) {
				case "Fire": elcolor = "<font color=#d22700>" + name + "</font>"; break;
				case "Aqua": elcolor = "<font color=#6495ed>" + name + "</font>"; break;
				case "Elec": elcolor = "<font color=orange>" + name + "</font>"; break;
				case "Wood": elcolor = "<font color=#00c96b>" + name + "</font>"; break;
				default: elcolor = name; break;
			}		
			return `<img src='https://execfera.github.io/rern/chip/${name.replace('+','')}.png'> <span class='chip'><span class='chipclick'>${elcolor}</span><span class='chipbody'>${chipData[name].desc}<br>Trader Rank: ${chipData[name].rank}</span></span>`; break;
		default: 
			var elcolor; 
			switch (chipData[name].elem) {
				case "Fire": elcolor = "<font color=#d22700>" + name + "</font>"; break;
				case "Aqua": elcolor = "<font color=#6495ed>" + name + "</font>"; break;
				case "Elec": elcolor = "<font color=orange>" + name + "</font>"; break;
				case "Wood": elcolor = "<font color=#00c96b>" + name + "</font>"; break;
				default: elcolor = name; break;
			}		
			return `<img src='https://execfera.github.io/rern/chip/${name.replace('+','')}.png'> <span class='chip'><span class='chipclick'>${elcolor}</span><span class='chipbody'>${chipData[name].desc}</span></span>: ${chipData[name].summ} (Acc: ${chipData[name].acc})`;
	}
}
function chipTagFunction () {
  $("body").unbind("click");
  $("body").click(function(event) {
		$("[class*=' bbcode-popup'], [class^='bbcode-popup']").hide();
  	$(".chipbody").hide();
  }).click();
	$(".chipclick").unbind("click");
	$(".chipclick").click(function(event) {
    $(this).next().toggle();
    event.stopPropagation();
  });
	$(".chipbody, [class*=' bbcode-popup'], [class^='bbcode-popup']").unbind("click");
  $(".chipbody, [class*=' bbcode-popup'], [class^='bbcode-popup']").click(function(event) {
    event.stopPropagation();
	}); 
	$("[class^='bbcode-click']").each(function() {
		$(this).attr('class').split(' ').forEach(cls => {
			let matcl = cls.match(/bbcode-click(.+?)$/);
			if(matcl && matcl[1]) {
				if ($(".bbcode-popup"+matcl[1]).length > 0) {
					$(".bbcode-click"+matcl[1]+", .bbcode-popup"+matcl[1]).wrapAll("<span class='bbcode-poppos'></span>");
				}
				$(".bbcode-click"+matcl[1]).unbind("click");
				$(".bbcode-click"+matcl[1]).css("cursor","pointer");
				$(".bbcode-click"+matcl[1]).click(function(event) {
					$(".bbcode-hide"+matcl[1]).toggle();
					$(".bbcode-popup"+matcl[1]).css('display',$(".bbcode-popup"+matcl[1]).css('display')==="none"?"block":"none");
					if ($(".bbcode-swap"+matcl[1]).length === 1 && $(".bbcode-click"+matcl[1]).length === 1) {
						$(".bbcode-click"+matcl[1]).replaceWith($(".bbcode-swap"+matcl[1]).clone(true));
						$(".bbcode-swap"+matcl[1]).eq(1).empty();
						$(".bbcode-swap"+matcl[1]).eq(0).show();
					}
					event.stopPropagation();
				});
			}
		});
	});
	fixZBSpoiler();
}
function fixZBSpoiler () {
  $("div.spoiler_toggle").unbind("click");
  $("div.spoiler_toggle").click(function(event) {
    $(this).next().toggle();
    event.stopPropagation();
	});
}