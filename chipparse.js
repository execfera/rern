// Outer Heaven - Chip Parse Code (Last Update 2018/02/08)

var chipData = {}, reduceChip = {};
var remoteChipTime;
var chipGet = $.Deferred();

var timeGet = $.get("https://api.myjson.com/bins/10uw9", function (data, textStatus, jqXHR) {
remoteChipTime = data.timestamp;
if (!(localStorage.getItem("cCacheTime"))) localStorage.setItem("cCacheTime", data.timestamp.toString()); 
});

var terrain = {
  "Normal": "No effects.","Lava": "Non-Fire Elementals lose 5 HP/action standing, 10 HP/action submerged. Doubled for Wood Elementals, nullified for Fire Elementals.\nAqua attacks: Panel explodes, +100% Source Aqua Damage, change terrain hit to Normal.\nPanelShot: Imbue Fire.","Coal": "Fire Elementals gain +20 Strengthen/turn, but must be allocated to Fire Element attacks only. Any Coal Strengthen vanishes after moving off of it.\nNon-Fire Elementals get Burn (5 Fire/action for 1 turn or until cured) the turn after they come into contact with Coal Terrain.\n>100 Damage Aqua attacks: Change terrain hit to Soil.\n>100 Damage Fire attacks: Change terrain hit to to Lava.\nPanelShot: Imbue Fire.","Furnace": "Fire attacks: Splash to all adjacent panels for 20% Source Damage. Does not chain across multiple Furnace panels.\nHeat Mirage: Non-Fire Elementals get -10% Accuracy, +10% Evasion against Non-Fire Elementals.\nAqua attacks: Vaporize into steam, increase accuracy penalty to -20% for Non-Fire Elemental and -10% for Fire Elemental for turn after hit.\nChanges to Metal Terrain when hit with an Aqua attack of 100 damage or greater.\nEcholocation nullifies the effects of the steam cloud and heat mirage for the user, and Seeking just ignores it.\nPanelShot: Imbue Fire.","Sea": "Fire Elementals lose 10 HP/action standing, 20 HP/action submerged. Other Non-Aqua Elementals lose 5 HP/action submerged. Nullified for Aqua Elementals.\nIce attacks: 50% Freeze1 chance, Changes terrain hit to Ice.\nTerrain changes between Sea and Onsen do not inflict damage upon submerged entities, nor do they eject submerged entities to the surface.\nElec attacks: +100% Source Damage.\nPanelShot: Imbue Aqua.","Onsen": "Aqua Elementals gain 3 HP/action partially or fully submerged, Non-Aqua Elementals only when partially submerged.\nIf any Sea Terrain exists in an adjacent panel, Onsen panels will change to Sea Terrain, except in Yoka (Sea will convert to Onsen).\nTerrain changes between Sea and Onsen do not inflict damage upon submerged entities, nor do they eject submerged entities to the surface.\nElec attacks: +100% Source Damage.\nPanelShot: Imbue Aqua + Blast1 Blind.","Ice": "+10% Evasion to all. Non-Aqua Elementals get -20% Accuracy.\nAqua attacks: 25% Freeze chance, change terrain hit to Normal if triggered. Boost chance to 100% if Ice-type.\nElec attacks: +100% Source Damage.\nFire attacks: Change terrain hit to Sea.\nPanelShot: Imbue Aqua + Freeze1.","Snow": "Non-Aqua Elementals get -10% Evasion and reduced movement speed.\nWind attacks: +100% Source Damage. Imbue Aqua if Null. Change terrain hit to Ice for 1 turn after turn hit, then back to Snow.\nAqua attacks: 25% Freeze chance, change terrain hit to Normal if triggered. Boost chance to 100% if Ice-type.\nFire attacks: Change terrain hit to Ice, generate Frosty Mist: -10% Accuracy for Non-Aqua Elementals, +10% evasion against Non-Aqua Elementals, Freeze1 effect for any Aqua or Wind attacks.\nPanelShot: Imbue Aqua + Freeze1.","Metal": "Cannot be Broken or Cracked except with Geddon/PanelShot, cannot be Burrowed into.\nElec attacks: +100% Source Damage.\n>100 Damage Aqua attacks: Change terrain hit to Cracked.\n>100 Damage Fire attacks: Change terrain hit to Furnace.\nPanelShot: Imbue Elec + Break.","Magnet": "Non-Elec Elementals get -30% Evasion, and 50% (+/- 25% RP) chance to fail movement off the panel.\nOnly Elec Elementals can burrow.\nWood attacks: Change terrain hit to Normal.\nPanelShot: Imbue Elec + Seeking.","Solar": "Elec Elementals get +5 HP/action.\nWood attacks: +100% Source Damage, change terrain hit to Cracked.\nPanelShot: Imbue Elec + Stun1.","Grass": "Wood Elementals get +5 HP/action.\nFire attacks: +100% Source Damage, change terrain hit to Soil.\nPanelShot: Imbue Wood.","Soil": "Wood Elementals get +10% Evasion.\nWood attacks: +100% Source Damage, change terrain hit to Grass.\n>100 Damage Aqua attacks: Change terrain hit to Mud.\n>100 Damage Fire attacks: change terrain hit to Coal.\nPanelShot: Imbue Wood.","Mud": "Non-Wood Elementals get -10% Evasion penalty and reduced movement speed, 25% (+/-25% RP) chance to fall or get stuck (1 action to get free).\nAutomatically triggers Aqua Boost for appropriate chip attacks.\nWood attacks: Change terrain hit to Soil.\nPanelShot: Imbue Wood + Slow1.","Sand": "-20% Evasion and reduced movement speed to all.\nCan Burrow as standard action, incurable Blind1 until turn after exiting Burrow.\nWind attacks: +100% Source Damage + Blind1, change terrain hit to Normal, trigger Sandstorm for 3 turns: Lose 5 HP/action, Blind1, Fire attacks gain Slashing.\nFire attacks: Change terrain hit to Glass.\nTerrain changes between Sand and QuickSand do not inflict damage upon burrowed entities, nor do they eject burrowed entities to the surface.\nPanelShot: Blind1.","QuickSand": "Incurable 2-turn Hold Snare on contact, will only be removed on Terrain Change, changes to Sand after Hold Snare expires.\nTerrain changes between Sand and QuickSand do not inflict damage upon burrowed entities, nor do they eject burrowed entities to the surface.\nCannot be in Sigs, inherits all Sand terrain effects.\nPanelShot: Hold1.","Glass": "Slip Effect: -10% Accuracy, -10% Evasion to all.\nNon-Ice Aqua attacks causes it to be Wet, doubles slip effect for Non-Aqua Elementals for 1 turn. Wet can expire early with Fire attacks. Can cause slippage for poor RP or heavy impacts on Non-Aqua Elementals, 1-2 actions to recover.\n>200 Damage attacks: Change terrain hit to Broken. Damage threshold cut in half for Ground, Break, and Impact, to a minimum threshold of 25 when all 3 are present. Null 25 + Slashing + Nova 2 per panel broken, up to 200 (8 panels).\nBurrow: Change terrain to Broken, 50 Null + Slashing to burrower, Null 25 + Slashing + Nova2 to surroundings.\nPanelShot: Spread1.","Poison": "-10 HP/action standing, -20 HP/action submerged.\nZombie nullifies damage, heals 10 HP/action on contact.\nCannot be in Sigs.\nPanelShot: Poison(20).","Holy": "Halves Final Damage.\nCannot be in Sigs.\nPanelShot: Converts attack to Life Drain.","Cursed": "Doubles Final Damage.\nCannot be in Sigs.\nPanelShot: Converts attack to Self-Damage.","Cracked": "Changes to Broken when stepped on, chance to fall in when triggered.\nBurrow: Change terrain to Broken, Null 50 to burrower.\nPanel Crack attacks, >100 Damage Break/Impact/Drop attacks: Change terrain hit to Broken.\nPanelShot: Splash1.", "Broken": "Not bottomless.\nReverts to Normal after a time, if no one is inside.\nDoubles dodge penalties for bad RP.\n1-4 Movements actions to climb back out depending on method.","Missing": "Permanent bottomless hole.\nDoubles dodge penalties for bad RP.\nEJO if you fall in."
}

timeGet.done(function() { 

if((localStorage.getItem("cDataCache")) && (parseInt(localStorage.getItem("cCacheTime"), 10) === remoteChipTime)) {
		chipData = JSON.parse(localStorage.getItem("cDataCache"));
		reduceChip = Object.keys(chipData).reduce(function (keys, k) { 
			var lowerkey = k.toLowerCase();
			keys[lowerkey] = k;
			if (lowerkey[lowerkey.length-1] === '1') keys[lowerkey.slice(0,-1)] = k; 
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
  $('.c_post:contains("[terrain"):not(:has("textarea"))').each(function() {
    $(this).html($(this).html().replace(/\[terrain]([^[]*)\[\/terrain]/g, function(match, p1) {
      if (!(p1 in terrain)) return p1;
		  return `<span class='chip'><span class='chipclick'>${p1}</span><span class='chipbody'>${terrain[p1]}</span></span>`;
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
