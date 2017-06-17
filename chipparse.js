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
  $('.c_post:contains("[chip="):not(:has("textarea"))').each(function() {
    $(this).html($(this).html().replace(/\[chip=([^,\]]*)(,(i|s|f|a))?\]/g, function(match, p1, p2, p3) {
          if (!(p1 in chipData)) return match; else {
	  switch(p3) {
	    case "i":
		  return `<img src='https://execfera.github.io/rern_chip/${p1}.png'>`;
		case "s":
		  return `${chipData[p1].summ} (Acc: ${chipData[p1].acc})`;
		case "f":
		  return `<img src='https://execfera.github.io/rern_chip/${p1.replace('+','')}.png'> <span class='chip'><span class='chipclick'>${p1}</span><span class='chipbody'>${chipData[p1].desc}</span></span>`;
		case "a":
		  if (!("alias" in chipData[p1])) return match; 
			else return `<img src='https://execfera.github.io/rern_chip/${p1.replace('+','')}.png'> <span class='chip'><span class='chipclick'>${chipData[p1].alias}</span><span class='chipbody'>${chipData[p1].desc}</span></span>`;
		default: 
		  var elcolor; 
		  switch (chipData[p1].elem) {
				case "Fire": elcolor = "<font color=#d22700>" + p1 + "</font>"; break;
				case "Aqua": elcolor = "<font color=#6495ed>" + p1 + "</font>"; break;
				case "Elec": elcolor = "<font color=#dbcd00>" + p1 + "</font>"; break;
				case "Wood": elcolor = "<font color=#00c96b>" + p1 + "</font>"; break;
				default: elcolor = p1; break;
		  }		
		  return "<img src='" + chipData[p1].img + "'> <strong>" + elcolor + "</strong>: " + chipData[p1].summ;
		  }}
		}));
	});
  $('.c_sig:contains("[chip="):not(:has("textarea"))').each(function() {
    $(this).html($(this).html().replace(/\[chip=([^,\]]*)(,(i|s|f|a))?\]/g, function(match, p1, p2, p3) {
          if (!(p1 in chipData)) return match; else {
	  switch(p3) {
	  case "i": 
		  return `<img src='https://execfera.github.io/rern_chip/${p1.replace('+','')}.png'>`;
	  case "s": 
		  return `${chipData[p1].summ} (Acc: ${chipData[p1].acc})`;
	  case "f":
		  return `<img src='https://execfera.github.io/rern_chip/${p1.replace('+','')}.png'> <span class='chip'><span class='chipclick'>${p1}</span><span class='chipbody'>${chipData[p1].desc}</span></span>`;
		case "a":
		  if (!("alias" in chipData[p1])) return match; 
			else return `<img src='https://execfera.github.io/rern_chip/${p1.replace('+','')}.png'> <span class='chip'><span class='chipclick'>${chipData[p1].alias}</span><span class='chipbody'>${chipData[p1].desc}</span></span>`;
	  default:  
		  var elcolor; 
		  switch (chipData[p1].elem) {
				case "Fire": elcolor = "<font color=#d22700>" + p1 + "</font>"; break;
				case "Aqua": elcolor = "<font color=#6495ed>" + p1 + "</font>"; break;
				case "Elec": elcolor = "<font color=#dbcd00>" + p1 + "</font>"; break;
				case "Wood": elcolor = "<font color=#00c96b>" + p1 + "</font>"; break;
				default: elcolor = p1; break;
		  }		
		  return "<img src='" + chipData[p1].img + "'> <strong>" + elcolor + "</strong>: " + chipData[p1].summ;
		  }}
	  }));
	});
  $(".chipbody").hide();
  $(".chipbodysig").hide();
  $(".chipclick").click(function(event) {
    $(this.nextSibling).toggle();
    event.stopPropagation();
  });
  $("body").click(function(event) {
		$(".chipbody").hide();
		$(".chipbodysig").hide();
  });
  $(".chipbody,.chipbodysig").click(function(event) {
    event.stopPropagation();
		return false;
  });

  $("div.spoiler_toggle").unbind( "click" );
  $("div.spoiler_toggle").click(function(event) {
    $(this.nextSibling).toggle();
    event.stopPropagation();
  });
  
});