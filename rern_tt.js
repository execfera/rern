// Outer Heaven - Custom Tag Parse Code (2018-08-02)

let chipData = {}, reduceChip = {}, virusData = {}, terrainData = {};

const chipFetch = fetch("https://execfera.github.io/rern/chip.json")
	.then(res => res.json())
	.then(data => {
		chipData = data;
		reduceChip = Object.keys(chipData).reduce(function (keys, k) { 
			keys[k.toLowerCase()] = k; 
				if (k[k.length - 1] === '1') keys[k.toLowerCase().slice(0, -1)] = k;
			return keys;
		}, {});
	});

const virusFetch = fetch("https://execfera.github.io/rern/virus.json")
	.then(res => res.json())
	.then(data => virusData = data);

const terrainFetch = fetch("https://execfera.github.io/rern/terrain.json")
	.then(res => res.json())
	.then(data => terrainData = data);

function chipTagReplace(name, param) {
	let elcolor;
	switch (chipData[name].elem) {
		case "Fire": elcolor = "<font color=#d22700>" + name + "</font>"; break;
		case "Aqua": elcolor = "<font color=#6495ed>" + name + "</font>"; break;
		case "Elec": elcolor = "<font color=orange>" + name + "</font>"; break;
		case "Wood": elcolor = "<font color=#00c96b>" + name + "</font>"; break;
		default: elcolor = name; break;
	}

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
			return `<img src='https://execfera.github.io/rern/chip/${name.replace('+','')}.png'> <span class='chip'><span class='chipclick'>${elcolor}</span><span class='chipbody'>${chipData[name].desc}<br>Trader Rank: ${chipData[name].rank}</span></span>`; break;
		default:
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
				$(".bbcode-click"+matcl[1]).css("cursor</li></ul>","pointer");
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
  $("div.spoiler_toggle").unbind("click");
  $("div.spoiler_toggle").click(function(event) {
    $(this).next().toggle();
    event.stopPropagation();
	});
}

function virusTagFunction() {
	$(".vr_tag").css("cursor", "pointer").click(function() {
		openVrWnd($(this).attr("name") ? $(this).attr("name") : $(this).text());
	});
}

function openVrWnd(srcname) {
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
		write("<body style=\"background-color: #eeeeee; font-family: \'Inconsolata\', \'Helvetica\', \'Arial\', \'Bitstream Vera Sans\', \'Verdana\', sans-serif; font-size:93.3%;\">");
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

function tagInit() {
	Promise.all([chipFetch, virusFetch, terrainFetch])
    .then(() => {
      $('.postbody .content, .postbody .signature').each(function() {
        $(this).html($(this).html().replace(/\[chip=([^,\]]*)(,(i|s|f|a|c))?\]/gi, function(match, p1, p2, p3) {
					if (!(p1.toLowerCase() in reduceChip)) return match;
					return chipTagReplace(reduceChip[p1.toLowerCase()],p3);
        }));

        $(this).html($(this).html().replace(/\[class=([^[]*)]([^[]*)\[\/class]/gi, function(match, p1, p2) {
          return `<span class='bbcode-${p1}'>${p2}</span>`;
        }));

        $(this).html($(this).html().replace(/\[terrain]([^[]*)\[\/terrain]/gi, function(match, p1) {
          if (!(p1 in terrainData)) return p1;
          return `<span class='chip'><span class='chipclick'>${p1}</span><span class='chipbody'>${terrainData[p1]}</span></span>`;
        }));

        $(this).html($(this).html().replace(/\[virus]([^[]*)\[\/virus]/gi, function(match, p1) {
          return "<span class='vr_tag'>" + p1 + "</span>";
        }));

        $(this).html($(this).html().replace(/\[virus=([^[]*)]([^[]*)\[\/virus]/gi, function(match, p1, p2) {
          return "<span class='vr_tag' name=" + p1 + ">" + p2 + "</span>";
        }));

        $(this).html($(this).html().replace(/\[imgur=([^\]]*)]/gi, function(match, id) {
          return "<img src='http://i.imgur.com/" + id + ".png' alt='Posted Image'>";
        }));
      });
    
      chipTagFunction();
      virusTagFunction();
    });
};

function scriptInit() {
  if (document.readyState !== complete) {
    window.addEventListener('DOMContentLoaded', tagInit, false);
  } else {
    tagInit();
  }
}
