// ==UserScript==
// @name        QA_Get_from_ADUI
// @namespace   allowscript
// @description This gets the info from the admin
// @include     https://WEBSITE/*
// @version     1
// @grant       none
// ==/UserScript==


//var feeType = document.getElementsByClassName("fee_type_1")[0].innerHTML;
// if there are spaces in the name
// if there are special characters in the name
// This tag has a timestamp macro. Vast tags should use $SPOT_MARKET_ID instead:
// This tag has a cachebuster macros. Vast tags should use $SPOT_MARKET_ID instead:	

var chromeEXT = chrome.extension.getURL('');
function openPanel() {
	var panel = document.getElementById('ad_checker');
	panel.style.display = 'block';

}
//create info panel
var newHTML = document.createElement('div');
newHTML.innerHTML = '<div id="ad_checker" style="position: fixed; top:0px; right: 0px; padding:5px; height: 400px; width: 300px; background-color:#ddddee; color:#000000; display:none; overflow: auto; z-index:100000; border: 1px solid #444; border-radius: 8px;"><div id="closeBTN" style="position:absolute; height: 26px; width:26px; bottom:0px; right:0px; display:static; background:url(\'' + chromeEXT + 'images\/close.png\'); cursor:pointer;" onclick="closeInfo()"></div><div id="ad_checker_panel"></div></div><div style="position: fixed; top:0px; right: 3px; z-index:100001; height: 30px; width: 30px; background:url(\'' + chromeEXT + 'images\/Checkit.png\'); cursor:pointer;" id="ADuiGoButton"></div>';
document.body.appendChild(newHTML);
ADuiGoButton.addEventListener("click", openPanel, false);
closeBTN.addEventListener("click", closeInfo, false);

var panel = $("#ad_checker_panel");
console.log(panel);
panel.css("display", "block");
panel.load(chrome.extension.getURL('valueGrabber.html'));

function closeInfo()
{
	var panel = document.getElementById("ad_checker");
	panel.style.display = 'none';
}

var campaigns = undefined;
var listings = undefined;
var g_campaign = undefined;
var g_listing = undefined;

function fetchCampaigns()
{
    console.log("fetching all campaigns for advertiser");
    // static body (pulls all campaigns for this advertiser)
    var request = $.post(
        "https://WEBSITE/api/Campaign/select.json",
        "__ASSOCIATIONS__[flight_balancing]=true&__ASSOCIATIONS__[listing_summary]=true&__ASSOCIATIONS__[elements]=true&__ASSOCIATIONS__[programs]=true&strAPIHash=47d263bbe5c64bbee174992d5d224ae5&AjaxRequest=1",
        null,
        "json"
        )
    // successfully made the API call
        .done(function(data, textStatus, jqXHR) {
            console.log("succesfully fetched campaigns");
            // Following is where the list of camapigns is. assigned to list of campaigns.
            campaigns = data.data.campaigns.campaign;
            console.log(campaigns);
        })
        .fail(function(jqXHR, statusText, errorThrown) {
            console.log("error fetchin campaigns " + statusText);
            console.log(errorThronw);
            alert("Could not fetch campaigns for this advertiser");
        });
}


// Called immediately upon page load
fetchCampaigns();

$('.view_manager').on(
    'click',
    '.campaign_tab',
    function(event) {
        var campaignName = $('div.name', this).text();
        console.log("campaign name " + campaignName); 

        var campaignId = -1;
        for(var key in campaigns) {
            var campaign = campaigns[key];
            if(campaign.name == campaignName) {
                campaignId = campaign.campaign_id;
                console.log("found campaign id " + campaignId);
                break;
            }
        }

        if(campaignId == -1) {
            console.log("no campaign id found for campaign name " + campaignName);
        } else {
            fetchListings(campaignId);
        }
    }
);

function convertFeeType(feeType) {
	var retval = "Pay-Per-Impression";
	switch(feeType) {
		case "1": retval = "Pay-Per-Click"; break;
		case "2": retval = "Pay-For-Inclusion"; break;
		default: break;
	}
	return retval;
}
// if this tring has spaces
function hasSpaces(str) {
	return(str.charAt(0) == " " || str.charAt(str.length - 1) == " ");
}
// if this string has special characters
function hasSpecialCharacters(str) {
	return (str.search(/[^\x20-\x7F]/) != -1);
}

function fetchListings(campaignId)
{
	// event listener for when listing is clicked
	$('.campaign_tab').on(
    	'click',
    	'.listing',
    	function(event) {
        	var listingName = $('div.listing_name', this).text();
        	console.log("listing name " + listingName); 

	        var listingFound = -1;
	        for(var key in listings) {
	            var listing = listings[key];
	            if(listing.listing_name == listingName) {
	                g_listing = listing;
	                listingFound = 1;
	                console.log("found listing id " + listing.listing_id);
	                console.log(g_listing);
	                break;
	            }
	        }

	        if(listingFound == -1) {
	            console.log("no listing id found for listing name " + listingName);
	        } else {
	        	
	        	$("#ad_checker").css("display","block");
	        	$("#advertiser_id").text("Advertiser ID: " + g_listing.advertiser_id);
	        	//camapign name checks
	           	if(hasSpaces(g_campaign.name)) {
	        		$("#campaign_name").text("This campaign name contains extra spaces. This is fucked please rebuild.");
	        	} else if (hasSpecialCharacters(g_campaign.name)){
	        		$("#campaign_name").text("This campaign name contains special characters. This is fucked please rebuild.")
	        	} else {
	        		$("#campaign_name").text("Campaign Name: " + g_campaign.name);
	        	}
	        	//listing name + checks
	        	if(hasSpaces(g_listing.listing_name)) {
	        		$("#listing_name").text("This listing name contains extra spaces. This is fucked please rebuild.");
	        	} else if (hasSpecialCharacters(g_listing.listing_name)){
	        		$("#listing_name").text("This listing name contains special characters. This is fucked please rebuild.")
	        	} else {
	        		$("#listing_name").text("Listing Name: " + g_listing.listing_name);
	        	}
	        	//listing title + checks
	        	if(hasSpaces(g_listing.default.elements.title)) {
	        		$("#listing_title").text("This title name contains extra spaces. This is fucked please rebuild.");
	        	} else if (hasSpecialCharacters(g_listing.default.elements.title)){
	        		$("#listing_title").text("This title name contains special characters. This is fucked please rebuild.")
	        	} else {
	        		$("#listing_title").text("Listing Title: " + g_listing.default.elements.title);
	        	}
	        	$("#campaign_id").text("Campaign ID: " + g_campaign.campaign_id);
	        	$("#ltid").text("LTID: " + g_listing.listing_id);
	        	// listing type hardcore porn wtf
	        	$("#listing_type").text("Listing Type: " + g_listing.listing_type_description);
	        	$("#fee_type").text("Fee Type: " + convertFeeType(g_listing.fee_type));
				$("#listing_click_through").text("Listing Click Through Url: " + g_listing.default.elements.page_url);
				
				$("#feed_scheme").text("Feed Scheme: " + g_listing.rtb_feed.scheme);
				$("#feed_url").text("Feed URL: " + g_listing.rtb_feed.feed_url);
	        }
	    }
	);

	g_campaign = campaigns[campaignId];
	console.log("Setting global campaign to: ");
	console.log(g_campaign);
    console.log("fetching all listings for campaign " + campaignId);
    // todo: need a flag / callback for when these api calls are done before loading all the data
    var request = $.post(
        "https://WEBSITE/api/Listing/select.json",
        "criteria[page_size]=1000&criteria[date_resolution]=day&criteria[listing_type]=5&criteria[date_range]=yesterday&criteria[campaign_id]=" + campaignId + "&criteria[order_by]=listing_name&&campaign[status]=1&__ASSOCIATIONS__[default]=0&__ASSOCIATIONS__[listing_targets][elements]=0&strAPIHash=ab9d44433dd3b2325e3b51c625aaa09d&AjaxRequest=1",
        null,
        "json"
        )
    // if successful assigns to cache -  could be one or more or no
        .done(function(data, statusText, jqXHR) {
            console.log("successfully fetched listings for campaign");
            listings = data.data.listings.listing;
            console.log(listings);
            // todo fix, its saying its undefined
// API call for feed stuff
            for(var key in listings) {
            	if(listings.hasOwnProperty(key)) {
		            var listing = listings[key];
		            $.post(
		            	"https://WEBSITE/api/Listing/select.json",
		            	"__ASSOCIATIONS__[rtb_feed]=1&criteria[listing_id]=" + listing.listing_id + "&AjaxRequest=1",
		            	null,
		            	"json"
	            	)
	            	.done(function(data, statusText, jqXHR) {
	            		for(var key2 in data.data.listings.listing) {
	            			if(data.data.listings.listing.hasOwnProperty[key2]) {
			            		listings[key2] = data.data.listings.listing[key2];
			            		console.log(listings[key2]);
		            		}
	            		}
	            	});
            	}
	        }
        })
     // if it fails to do the above
        .fail(function(jqXHR, statusText, errorThrown) {
            console.log("error fetching listings " + statusText);
            console.log(errorThrown);
        });
}
