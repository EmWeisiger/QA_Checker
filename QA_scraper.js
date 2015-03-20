// ==UserScript==
// @name        QA_Get_from_ADUI
// @namespace   allowscript
// @description This gets the info from the admin
// @include     https://advertiser.spotxchange.com/*
// @version     1
// @grant       none
// ==/UserScript==

// Anonymous "self-invoking" function
/(function() {
    // Load the script
    var script = document.createElement("SCRIPT");
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
    script.type = 'text/javascript';
    document.getElementsByTagName("head")[0].appendChild(script);

    // Poll for jQuery to come into existance
    var checkReady = function(callback) {
        if (window.jQuery) {
            callback(jQuery);
        }
        else {
            window.setTimeout(function() { checkReady(callback); }, 100);
        }
    };
**/

    // Start polling...
    checkReady(function($) {
        // Use $ here...
        if ($) {
          alert("jQuery is on the page");
        } else {
          alert("jQuery is not on the page");
        }
    });
})();



function checkpage() {
	if (document.title == "SpotXchange -- Advertiser Dashboard") {
		GatherInfo();
	}
	if (document.title == "SpotXchange Dashboard") {
		alert('You are on the admin dashboard!');
		ShowPanel();
	}
}



// Gathering information from the admin dashboard
//function GatherInfoAdmin() {
//	var listingStatus = document.getElementsById("_listing_status_account_status_text");
	// If status is disabled, turns it red
//	if (document.getElementsById("_listing_status_account_status_value") != "Active") {
//		listingStatus.style.color="red";
//	}
//}

// highlight things like unpublished, QA active, balance
// grab channel name and id that it is targeted to

function GatherInfo() {
	
	
	//What type of creative is this
	var TypeofAd;
	
	var creativeTypeHC = document.getElementsByClassName("listing_add_bvc")[0].children[0].children[0].className;
	var creativeTypeFeed = document.getElementsByClassName("listing_add_bvc")[0].children[0].children[1].className;
	var creativeTypeThird = document.getElementsByClassName("listing_add_bvc")[0].children[0].children[2].className;
	
	
	//Get Basic Info
	//var campName = document.getElementsByName("listing[listing_name]")[0].value;
	var campNameTA = document.getElementsByName("listing[listing_name]")[0];
	var campName = campNameTA.value;
	
	var titleNameTA = document.getElementsByName("listing[default][elements][title]")[0];
	var titleName = titleNameTA.value;
	
	var disNameTA = document.getElementsByName("listing[default][elements][display_url]")[0];
	var disName = disNameTA.value;
	
	var disClickTA = document.getElementsByName("listing[default][elements][page_url]")[0];
	var disClick = disClickTA.value;
	
	var adType = document.getElementsByClassName("listing_type_5")[0].innerHTML;
	
	//companion
	var companiontagTA = document.getElementsByName("listing[default][elements][media][banners][medium_rectangle][html_tag]")[0].value;
	//
	companiontagTA.children[0].style.border = "2px dashed red";
	
	if (document.getElementsByClassName("listing_add_companion_container")[0].innerHTML != ""){
		var companionstaticTA = document.getElementsByName("listing[default][elements][media][banners][medium_rectangle][source_uri]")[0];
		var companionstatic = companionstaticTA.value;
		
		var companionmime = document.getElementsByName("listing[default][elements][media][banners][medium_rectangle][mime_type]")[0].value;
	
		var companionclickthruTA = document.getElementsByName("listing[default][elements][media][banners][medium_rectangle][page_url]")[0];
		var companionclickthru = companionclickthruTA.value;
	}
	else {
		var companionstaticTA = "No Companion Detected";
		var companionstatic =  "No Companion Detected";
	
		var companionmime =  "No Companion Detected";

		var companionclickthruTA =  "No Companion Detected";
		var companionclickthru =  "No Companion Detected";
	}
	
	if (document.getElementsByClassName("fee_type_1")[0].className == 'fee_type_1 tooltip hidden'){
		var feeType = "CPM";
		}
	else if (document.getElementsByClassName("fee_type_3")[0].className == 'fee_type_3 tooltip hidden'){
		var feeType = "CPC";
	}
	else {
		var feeType = "Unknown";
	}
	//var feeType = document.getElementsByClassName("fee_type_1")[0].innerHTML;
	
	
	//check to see if there is a listing ID
	if ( typeof document.getElementsByName("listing[listing_id][]")[0] == 'undefined') {
		var listingID = "No LID Available";
	} else {
		var listingID = document.getElementsByName("listing[listing_id][]")[0].value;
	}

	// check to see if telemetry is here
	if ( typeof document.getElementsByClassName("listing_add_bvc")[0].children[0].children[3] === 'undefined') {
		var creativeTypeTelemetry = "";
	} else {
		var creativeTypeTelemetry = document.getElementsByClassName("listing_add_bvc")[0].children[0].children[3].className;
	}

	// Check on the feed scheme
	var feedScheme = document.getElementsByName("listing[rtb_feed][scheme]")[0].value;
	var feedURL = document.getElementsByName("listing[rtb_feed][feed_url]")[0].value;


	//set up link to admin dash
	var randomnumber = Math.random() * 20 + 1;
	var linktodash = "<a href='https://admin.spotxchange.com/profile_listing.html?listing_id=" + listingID + "&.noCache=" + randomnumber + "&date_range=today&page_size=50&view=all' target='blank'_>open in dash</a>";


	//check to see what kind of creative we are using
	var searchClassHC = creativeTypeHC.search("selected");
	var searchClassFeed = creativeTypeFeed.search("selected");
	var searchClassThird = creativeTypeThird.search("selected");
	var searchClassTelemetry = creativeTypeTelemetry.search("selected");

	if (searchClassHC != -1) {
		//alert('You have selected Hard Creative');
		var TypeofAd = "Hard Creative";
		
	} else if (searchClassFeed != -1) {	
		var TypeofAd = "Vast Tag";	
		var feedURL = document.getElementById('listing_rtb_feed_feed_url').value;
		specialchecker(feedURL);	
		spacechecker(feedURL);	
		cbcheckerVAST(feedURL);		
	} else if (searchClassThird != -1) {
		var TypeofAd = "Third Party";
		var ThirdPartyCreativeURL = document.getElementsByName("listing[default][elements][media][video][0][source_uri]")[0].value;	
		specialchecker(ThirdPartyCreativeURL);	
		spacechecker(ThirdPartyCreativeURL);	
	} else if (searchClassTelemetry != -1) {
		var TypeofAd = "Telemetry";
		//alert('You have selected Telemetry -- Whaa!!');
	} else {
		
	}

	
	// Third party tracking

	var trackers = document.getElementsByClassName("listing_add_tracking_beacon");
	var trackertextareas = [];
	var trackercontents = [];
	var trackertypes = [];
	var trackerpanel = [];
	document.getElementById('thirdpartytracker').innerHTML = "";
	for ( i = 0; i < trackers.length; i++) {
		// get values for the trackers
		trackertextareas[i] = trackers[i].children[0];
		trackercontents[i] = trackers[i].children[0].children[1].value.toLowerCase();
		trackertypes[i] = trackers[i].children[0].children[2].value;
		// create a div for each tracker
		trackerpanel[i] = document.createElement('div');
		trackerpanel[i].id = "tracker" + i;
		thirdpartytracker.appendChild(trackerpanel[i]);
		// write the contents of the tracker to the div
		trackerpanel[i].innerHTML = trackertypes[i] + "<br />" + trackercontents[i];

		//send the tracker to the checker for simple validation
		tagChecker(trackercontents[i], trackertextareas[i]);
	}

	// validate third party trackers
	function tagChecker(thirdpartytracking, textarea) {
		var searchJump = thirdpartytracking.search("jump");
		var searchCB = thirdpartytracking.search("cachebuster");
		var searchSPOT = thirdpartytracking.search("spot_market_id");
		if (searchJump != -1) {
			alert('You should not use the jump tag for a tracker! Only ad tags should be used for double click tracking. Using a jump tag will result in descrepancies for this tracker.');
			textarea.children[1].style.border = "2px dashed red";
			textarea.children[1].style.backgroundColor = "rgb(250,225,225)";
		}
		if (searchCB != -1) {
			alert('This tag has a cachebuster placeholder. Typically we replace these with [timestamp]. Please doublecheck that this is correct.');
			textarea.children[1].style.border = "2px dashed red";
			textarea.children[1].style.backgroundColor = "rgb(250,225,225)";
		}
		if (searchSPOT != -1) {
			alert('This tag has $SPOT_MARKET_ID as a placeholder. We only use that macro in the VAST tag. Please replace with [timestamp].');
			textarea.children[1].style.border = "2px dashed red";
			textarea.children[1].style.backgroundColor = "rgb(250,225,225)";
		} else {
			textarea.children[1].style.border = "2px solid #7ac460";
			textarea.children[1].style.backgroundColor = "rgb(225,250,225)";
		}

		spacechecker(thirdpartytracking);
		specialchecker(thirdpartytracking);
	}

	//send a few things through validation
	sendtovalidation(campName, titleName, disName, disClick);

	function sendtovalidation(campName, titleName, disName, disClick) {
		spacecheckerlead(campName);
		spacecheckerlead(titleName);
			
		spacecheckertrail(campName);
		spacecheckertrail(titleName);
	
		specialchecker(campName);
		specialchecker(titleName);
		specialchecker(feedURL);
		specialchecker(disName);
		specialchecker(disClick);
		
		spacechecker(disName);
		spacechecker(disClick);
	}

	function spacechecker(t) {
		var searchblank = t.search(" ");
		if (searchblank != -1) {
			alert('There are space(s) in this tag: ' + t);
			//t.parent.style.backgroundColor = "rgb(225,250,225)";
		}

	}
	
	function spacecheckerlead(t) {
		var searchlead = t.search(/^(\s)/);
		if (searchlead != -1) {
			alert('There is a space at the BEGINNING of this: ' + t);
		}
		
	}
	
	function spacecheckertrail(t) {
		var searchtrail = t.search(/\s+$/);
		if (searchtrail != -1) {
			alert('There is a space at the END of this: ' + t);
		}

	}
	
	function specialchecker(t) {
		var searchspecial = t.search(/[^\x20-\x7F]/);
		if (searchspecial != -1) {
			alert('There are SPECIAL CHARACTERS in this tag: ' + t);
		}
	}
	
	function cbcheckerVAST(t) {
		var searchtimestamp = t.search('timestamp');
		var searchcachebuster = t.search('cachebuster');
		if (searchtimestamp != -1) {
			alert('This tag has a "timestamp" macro. Vast tags should use $SPOT_MARKET_ID instead: ' + t);
		}
		if (searchcachebuster != -1) {
			alert('This tag has a "cachebuster" macro. Vast tags should use $SPOT_MARKET_ID instead: ' + t);
		}	
	}
	
	
	

	ShowPanel(TypeofAd, adType, feeType, campName, titleName, disName, disClick, listingID, linktodash, feedScheme, feedURL, companionstatic, companionmime, companionclickthru);

}

function ShowPanel(TypeofAd, adType, feeType, campName, titleName, disName, disClick, listingID, linktodash, feedScheme, feedURL, companionstatic, companionmime, companionclickthru) {
	//Show Panel
	document.getElementById('ADuiScraper').style.display = 'block';

	//Panel Content
	ADuipanel.innerHTML = "<div id='typeofadpanel'></div><div id='adtypepanel'></div><div id='feetypepanel'></div><div id='campaignnamepanel'></div><div id='listingtitle'></div><div id='displayurlpanel'></div><div id='clickpanel'></div><div id='listingidpanel'></div><div id='feedschemepanel'></div><div id='feedurlpanel'></div><div id='companionpanel'></div>";
	
	document.getElementById('typeofadpanel').innerHTML = TypeofAd;
	document.getElementById('adtypepanel').innerHTML = "<b>Ad Type:</b> " + adType;
	
	document.getElementById('feetypepanel').innerHTML = "<b>Fee Type:</b> " + feeType;
	document.getElementById('campaignnamepanel').innerHTML = "<b>Campaign Name:</b> " + campName;
	document.getElementById('listingtitle').innerHTML = "<b>Listing Title:</b> " + titleName;
	document.getElementById('displayurlpanel').innerHTML = "<b>Display URL:</b> " + disName;
	document.getElementById('clickpanel').innerHTML = "<b>Click:</b> " + disClick;
	document.getElementById('listingidpanel').innerHTML = "<b>Listing ID:</b> " + listingID + "&nbsp;&nbsp;" + linktodash;
	if (feedScheme != ''){
		document.getElementById('feedschemepanel').innerHTML = "<b>Feed Scheme:</b> " + feedScheme;
	}
	if (feedURL != ''){
		document.getElementById('feedurlpanel').innerHTML = "<b>Vast URL:</b> " + feedURL;
	}
	document.getElementById('companionpanel').innerHTML = "<b>Companion Info:</b> "  + companionstatic + "<br />" + companionmime + "<br />" + companionclickthru ;
	
	

}



function closeInfo() {
	//	alert('closing');
	document.getElementById('ADuiScraper').style.display = 'none';
}

//use this for any external assets
var chromeEXT = chrome.extension.getURL('');

//create info panel
var newHTML = document.createElement('div');
newHTML.innerHTML = '<div style="position: fixed; top:0px; right: 0px; padding:5px; height: 400px; width: 300px; background-color:#ddddee; color:#000000; display:none; overflow: auto; z-index:100000; border: 1px solid #444; border-radius: 8px;" id="ADuiScraper"><div id="closeBTN" style="position:absolute; height: 26px; width:26px; bottom:0px; right:0px; display:static; background:url(\'' + chromeEXT + 'images\/close.png\'); cursor:pointer;" onclick="closeInfo()"></div><div id="ADuipanel">Campaign:</div><div id="thirdpartytracker"></div></div><div style="position: fixed; top:0px; right: 3px; z-index:100001; height: 30px; width: 30px; background:url(\'' + chromeEXT + 'images\/Checkit.png\'); cursor:pointer;" id="ADuiGoButton"></div>';
document.body.appendChild(newHTML);
ADuiGoButton.addEventListener("click", checkpage, false);
closeBTN.addEventListener("click", closeInfo, false); 
