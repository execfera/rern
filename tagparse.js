// Outer Heaven - Chip Parse Code (Last Update 2018/02/08)

var chipData = {}, reduceChip = {};

var terrain = {
  "Normal": "<ul><li>No effects.</li></ul>",
  "Lava": "<ul><li>Non-Fire Elementals lose 5 HP/action standing, 10 HP/action submerged. Doubled for Wood Elementals, nullified for Fire Elementals.</li><li>Aqua attacks: Panel explodes, +100% Source Aqua Damage, change terrain hit to Normal.</li><li>PanelShot: Imbue Fire.</li></ul>",
  "Coal": "<ul><li>Fire Elementals gain +20 Strengthen/turn, but must be allocated to Fire Element attacks only. Any Coal Strengthen vanishes after moving off of it.</li><li>Non-Fire Elementals get Burn (5 Fire/action for 1 turn or until cured) the turn after they come into contact with Coal Terrain.</li><li>100 Damage Aqua attacks: Change terrain hit to Soil.</li><li>100 Damage Fire attacks: Change terrain hit to to Lava.</li><li>PanelShot: Imbue Fire.</li></ul>",
  "Furnace": "<ul><li>Fire attacks: Splash to all adjacent panels for 20% Source Damage. Does not chain across multiple Furnace panels.</li><li>Heat Mirage: Non-Fire Elementals get -10% Accuracy, +10% Evasion against Non-Fire Elementals.</li><li>Aqua attacks: Vaporize into steam, increase accuracy penalty to -20% for Non-Fire Elemental and -10% for Fire Elemental for turn after hit.</li><li>Changes to Metal Terrain when hit with an Aqua attack of 100 damage or greater.</li><li>Echolocation nullifies the effects of the steam cloud and heat mirage for the user, and Seeking just ignores it.</li><li>PanelShot: Imbue Fire.</li></ul>",
  "Sea": "<ul><li>Fire Elementals lose 10 HP/action standing, 20 HP/action submerged. Other Non-Aqua Elementals lose 5 HP/action submerged. Nullified for Aqua Elementals.</li><li>Ice attacks: 50% Freeze1 chance, Changes terrain hit to Ice.</li><li>Terrain changes between Sea and Onsen do not inflict damage upon submerged entities, nor do they eject submerged entities to the surface.</li><li>Elec attacks: +100% Source Damage.</li><li>PanelShot: Imbue Aqua.</li></ul>",
  "Onsen": "<ul><li>Aqua Elementals gain 3 HP/action partially or fully submerged, Non-Aqua Elementals only when partially submerged.</li><li>If any Sea Terrain exists in an adjacent panel, Onsen panels will change to Sea Terrain, except in Yoka (Sea will convert to Onsen).</li><li>Terrain changes between Sea and Onsen do not inflict damage upon submerged entities, nor do they eject submerged entities to the surface.</li><li>Elec attacks: +100% Source Damage.</li><li>PanelShot: Imbue Aqua + Blast1 Blind.</li></ul>",
  "Ice": "<ul><li>+10% Evasion to all. Non-Aqua Elementals get -20% Accuracy.</li><li>Aqua attacks: 25% Freeze chance, change terrain hit to Normal if triggered. Boost chance to 100% if Ice-type.</li><li>Elec attacks: +100% Source Damage.</li><li>Fire attacks: Change terrain hit to Sea.</li><li>PanelShot: Imbue Aqua + Freeze1.</li></ul>",
  "Snow": "<ul><li>Non-Aqua Elementals get -10% Evasion and reduced movement speed.</li><li>Wind attacks: +100% Source Damage. Imbue Aqua if Null. Change terrain hit to Ice for 1 turn after turn hit, then back to Snow.</li><li>Aqua attacks: 25% Freeze chance, change terrain hit to Normal if triggered. Boost chance to 100% if Ice-type.</li><li>Fire attacks: Change terrain hit to Ice, generate Frosty Mist: -10% Accuracy for Non-Aqua Elementals, +10% evasion against Non-Aqua Elementals, Freeze1 effect for any Aqua or Wind attacks.</li><li>PanelShot: Imbue Aqua + Freeze1.</li></ul>",
  "Metal": "<ul><li>Cannot be Broken or Cracked except with Geddon/PanelShot, cannot be Burrowed into.</li><li>Elec attacks: +100% Source Damage.</li><li>100 Damage Aqua attacks: Change terrain hit to Cracked.</li><li>100 Damage Fire attacks: Change terrain hit to Furnace.</li><li>PanelShot: Imbue Elec + Break.</li></ul>",
  "Magnet": "<ul><li>Non-Elec Elementals get -30% Evasion, and 50% (+/- 25% RP) chance to fail movement off the panel.</li><li>Only Elec Elementals can burrow.</li><li>Wood attacks: Change terrain hit to Normal.</li><li>PanelShot: Imbue Elec + Seeking.</li></ul>",
  "Solar": "<ul><li>Elec Elementals get +5 HP/action.</li><li>Wood attacks: +100% Source Damage, change terrain hit to Cracked.</li><li>PanelShot: Imbue Elec + Stun1.</li></ul>",
  "Grass": "<ul><li>Wood Elementals get +5 HP/action.</li><li>Fire attacks: +100% Source Damage, change terrain hit to Soil.</li><li>PanelShot: Imbue Wood.</li></ul>",
  "Soil": "<ul><li>Wood Elementals get +10% Evasion.</li><li>Wood attacks: +100% Source Damage, change terrain hit to Grass.</li><li>100 Damage Aqua attacks: Change terrain hit to Mud.</li><li>100 Damage Fire attacks: change terrain hit to Coal.</li><li>PanelShot: Imbue Wood.</li></ul>",
  "Mud": "<ul><li>Non-Wood Elementals get -10% Evasion penalty and reduced movement speed, 25% (+/-25% RP) chance to fall or get stuck (1 action to get free).</li><li>Automatically triggers Aqua Boost for appropriate chip attacks.</li><li>Wood attacks: Change terrain hit to Soil.</li><li>PanelShot: Imbue Wood + Slow1.</li></ul>",
  "Sand": "<ul><li>-20% Evasion and reduced movement speed to all.</li><li>Can Burrow as standard action, incurable Blind1 until turn after exiting Burrow.</li><li>Wind attacks: +100% Source Damage + Blind1, change terrain hit to Normal, trigger Sandstorm for 3 turns: Lose 5 HP/action, Blind1, Fire attacks gain Slashing.</li><li>Fire attacks: Change terrain hit to Glass.</li><li>Terrain changes between Sand and QuickSand do not inflict damage upon burrowed entities, nor do they eject burrowed entities to the surface.</li><li>PanelShot: Blind1.</li></ul>",
  "QuickSand": "<ul><li>Incurable 2-turn Hold Snare on contact, will only be removed on Terrain Change, changes to Sand after Hold Snare expires.</li><li>Terrain changes between Sand and QuickSand do not inflict damage upon burrowed entities, nor do they eject burrowed entities to the surface.</li><li>Cannot be in Sigs, inherits all Sand terrain effects.</li><li>PanelShot: Hold1.</li></ul>",
  "Glass": "<ul><li>Slip Effect: -10% Accuracy, -10% Evasion to all.</li><li>Non-Ice Aqua attacks causes it to be Wet, doubles slip effect for Non-Aqua Elementals for 1 turn. Wet can expire early with Fire attacks. Can cause slippage for poor RP or heavy impacts on Non-Aqua Elementals, 1-2 actions to recover.</li><li>200 Damage attacks: Change terrain hit to Broken. Damage threshold cut in half for Ground, Break, and Impact, to a minimum threshold of 25 when all 3 are present. Null 25 + Slashing + Nova 2 per panel broken, up to 200 (8 panels).</li><li>Burrow: Change terrain to Broken, 50 Null + Slashing to burrower, Null 25 + Slashing + Nova2 to surroundings.</li><li>PanelShot: Spread1.</li></ul>",
  "Poison": "<ul><li>-10 HP/action standing, -20 HP/action submerged.</li><li>Zombie nullifies damage, heals 10 HP/action on contact.</li><li>Cannot be in Sigs.</li><li>PanelShot: Poison(20).</li></ul>",
  "Holy": "<ul><li>Halves Final Damage.</li><li>Cannot be in Sigs.</li><li>PanelShot: Converts attack to Life Drain.</li></ul>",
  "Cursed": "<ul><li>Doubles Final Damage.</li><li>Cannot be in Sigs.</li><li>PanelShot: Converts attack to Self-Damage.</li></ul>",
  "Cracked": "<ul><li>Changes to Broken when stepped on, chance to fall in when triggered.</li><li>Burrow: Change terrain to Broken, Null 50 to burrower.</li><li>Panel Crack attacks, >100 Damage Break/Impact/Drop attacks: Change terrain hit to Broken.</li><li>PanelShot: Splash1.</ul>",
  "Broken": "<ul><li>Not bottomless.</li><li>Reverts to Normal after a time, if no one is inside.</li><li>Doubles dodge penalties for bad RP.</li><li>1-4 Movements actions to climb back out depending on method.</li></ul>",
  "Missing": "<ul><li>Permanent bottomless hole.</li><li>Doubles dodge penalties for bad RP.</li><li>EJO if you fall in.</li></ul>"
}

function chipTagInit() {
	fetch("https://execfera.github.io/rern/chip.json")
		.then(res => res.json())
		.then(data => {
			chipData = data;
			reduceChip = Object.keys(chipData).reduce(function (keys, k) { 
				keys[k.toLowerCase()] = k; 
				return keys;
			}, {});

			$('.c_post:contains("[chip="):not(:has("textarea")), .c_sig:contains("[chip="):not(:has("textarea"))').each(function() {
				$(this).html($(this).html().replace(/\[chip=([^,\]]*)(,(i|s|f|a|c))?\]/g, function(match, p1, p2, p3) {
					if (!(p1.toLowerCase() in reduceChip)) return match; else return chipTagReplace(reduceChip[p1.toLowerCase()],p3);
				}));
			});
			$('.c_post:contains("[terrain"):not(:has("textarea"))').each(function() {
				$(this).html($(this).html().replace(/\[terrain]([^[]*)\[\/terrain]/g, function(match, p1) {
					if (!(p1 in terrain)) return p1;
					return `<span class='chip'><span class='chipclick'>${p1}</span><span class='chipbody'>${terrain[p1]}</span></span>`;
				}));
			});

			chipTagFunction();
		});
}

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
	fixZBSpoiler();
}

function fixZBSpoiler () {
  $("div.spoiler_toggle").unbind("click");
  $("div.spoiler_toggle").click(function(event) {
    $(this).next().toggle();
    event.stopPropagation();
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

function tagInit() {
	chipTagInit();

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

  virusTagFunction();
};

function virusTagFunction() {
  if(localStorage.getItem("vDataCache1")){
    document.querySelectorAll('.vr_tag').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', (ev) => openVrWnd(ev.target.getAttribute('name') || ev.target.textContent));
    });
  }
}

window.addEventListener('DOMContentLoaded', tagInit, false);
