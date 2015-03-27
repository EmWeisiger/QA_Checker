// TODO:
// 1) Add campaigns
// 2) Add text boxes saying what is wrong! (and have a nice day)

console.log("loaded");
// For adding new listings
$('button.listing_add').click(
	// nothing is valided by default on new listing
	{
		"disable_save_button": true,	// disable save button by default
		"listing_name"       : false,
		"listing_title"      : false,
		"display_url"        : false,
		"click_url"          : false,
		"feed_url"           : false,
		"source_uri"         : false,
		"beacon_url"         : false
	},
	addListingEditEvents
);
// For Editing pre-existing listings
$('button.listing_edit').click(
	// everything is validated by defaulted on existing listing
	{
		"disable_save_button": false,	// enable save button by default
		"listing_name"       : true,
		"listing_title"      : true,
		"display_url"        : true,
		"click_url"          : true,
		"feed_url"           : true,
		"source_uri"         : true,
		"beacon_url"         : true
	},
	addListingEditEvents
);

// starting at -1 since the index starts at 0
var numTrackingBeacons = -1;

// Checking if there are any spaces at the start or end only
function hasStartOrEndSpaces(str) {
	return (str.charAt(0) == " " || str.charAt(str.length -1) == " ");
}
// Checking if there are any special characters
function hasSpecialChars(str) {
	return (str.search(/[^\x20-\x7F]/) != -1);
}
// Checking if there are any spaces in the string at all
function hasSpaces(str) {
	return (str.indexOf(" ") != -1);
}
// Checking for Jump tags
function jumpTag(str) {
	return (str.search("jump") != -1);
}

// Checking for $SPOT_MARKET_ID (not used in third party only vast) and cachebuster
function addTrackerCB(str) {
	return (str.search("SPOT_MARKET_ID" || "cachebuster") != -1);
}

// Enabling the Listing Save by showing the save button
function enableListingSave() {
	console.log("enabling save button");
	$('button.listing_add_save').show();

}
// Disabling Listing Save by hiding the Save Button
function disableListingSave() {
	console.log("disabling save button");
	$('button.listing_add_save').hide();
}

function addListingEditEvents(event) {
	console.log("clicked on add new listing");

	// only disable on a new listing!
	var validated = event.data;
	if(validated.disable_save_button == true) {
		disableListingSave();
	}

	// Listing Name
 	$listingName = $('input[name=listing\\[listing_name\\]]');
	$listingName.change(
		{ 
			"eventType": "listing_name",
			"element"  : $listingName,
			"validate" : ["hasStartOrEndSpaces", "hasSpecialChars"],
			"validated": validated
		},
		changeEvent
	);
	// Listing Title
	$listingTitle = $('input[name=listing\\[default\\]\\[elements\\]\\[title\\]]');
	$listingTitle.change(
		{
			"eventType": "listing_title",
			"element"  : $listingTitle,
			"validate" : ["hasStartOrEndSpaces", "hasSpecialChars"],
			"validated": validated
		},
		changeEvent
	);
	// The display URL
	$displayURL = $('input[name=listing\\[default\\]\\[elements\\]\\[display_url\\]]');
	$displayURL.change(
		{
			"eventType": "display_url",
			"element"  : $displayURL,
			"validate" : ["hasSpaces", "hasSpecialChars"],
			"validated": validated
		},
		changeEvent
	);
	// The click through URL
	$clickURL = $('input[name=listing\\[default\\]\\[elements\\]\\[page_url\\]]');
	$clickURL.change(
		{
			"eventType": "click_url",
			"element"  : $clickURL,
			"validate" : ["hasSpaces", "hasSpecialChars"],
			"validated": validated
		},
		changeEvent
	);
	// Feed Ad Serving
	$feedURL = $('#listing_rtb_feed_feed_url');
	$feedURL.change(
		{
			"eventType": "feed_url",
			"element"  : $feedURL,
			"validate" : ["hasSpaces", "hasSpecialChars"],
			"validated": validated
		},
		changeEvent
	);
	// Third Party Tag
	$sourceURI = $('input[name=listing\\[default\\]\\[elements\\]\\[media\\]\\[video\\]\\[0\\]\\[source_uri\\]]');
	$sourceURI.change(
		{
			"eventType": "source_uri",
			"element"  : $sourceURI,
			"validate" : ["hasSpaces", "hasSpecialChars"],
			"validated": validated
		},
		changeEvent
	);
	// Third Party Tracking
	// reset number of tracking beacons!
	numTrackingBeacons = -1;
	$('.listing_add_tracking_beacon_add').click(
		validated,
		addTrackingBeaconEditEvents
	);

	setTimeout(
		function() { checkForExistingTrackingBeacons(validated) }, 
		500
	);
}

var checkTrackingBeaconsCount = 0;
var foundTrackingBeacons      = false;
function checkForExistingTrackingBeacons(validated) {

	console.log("checking for tracking beacons!");

	if(foundTrackingBeacons == true) {
		return;
	}

	// See if the page has loaded yet...
	$trackingBeacons = $('li.listing_add_tracking_beacon div input');

	// Nope, so increment our counter check
	if($trackingBeacons.length == 0) {
		console.log("no tracking beacons found this time...");
		checkTrackingBeaconsCount++;

		// If we have checked for a full minute... stop
		if(checkTrackingBeaconsCount >= 120) {
			console.log("checked 120 times no longer looking for tracking beacons!");
			return;
		}
		
		// recursively call outselves to try and catch when the page loads fully
		setTimeout(checkForExistingTrackingBeacons, 500);
	}

	console.log($trackingBeacons.length + " tracking beacons found, adding handlers!");
	// There are tracking beacons!  Add the event handlers
	$trackingBeacons.each(
		function(index) {
			numTrackingBeacons++;
			console.log("adding event handler for existing tracking beacon number: " + numTrackingBeacons);
			$(this).change(
				{
					"eventType": "beacon_url",
					"element"  : $(this),
					"validate" : ["hasSpaces", "hasSpecialChars", "jumpTag", "addTrackerCB"],
					"validated": validated
				},
				changeEvent
			);
		}
	)
}

function addTrackingBeaconEditEvents(event){
	foundTrackingBeacons = true;
	numTrackingBeacons++;
	$beaconURL = $('input[name=listing\\[default\\]\\[elements\\]\\[media\\]\\[tracking\\]\\[beacon\\]\\[' + numTrackingBeacons + '\\]\\[beacon_url\\]]');
	$beaconURL.change(
		{
			"eventType": "beacon_url",
			"element"  : $beaconURL,
			"validate" : ["hasSpaces", "hasSpecialChars", "jumpTag", "addTrackerCB"],
			"validated": event.data
		},
		changeEvent
	);
}

function changeEvent(event) {
	console.log(event);

	var eventType = event.data.eventType;
	var $element  = event.data.element;
	var callbacks = event.data.validate;
	var validated = event.data.validated;

	console.log("editing " + eventType);

	str = $element.val();
	console.log(str);

	var hasErrors = false;

	for(var key in callbacks) {
		var funcName = callbacks[key];
		if(window[funcName](str)) {
			console.log(eventType + " failed validation in " + funcName);
			validated[eventType] = false;
			$element.css('border', '2px solid red');
			$element.css('border-radius', '3px');
			hasErrors = true;
			break;
		}
	}

	console.log("hasErrors:" + hasErrors);
	if(!hasErrors) {
		console.log(eventType + " is validated");
		validated[eventType] = true;
		$element.css('border', 'rgb(122, 196, 96) solid 2px');
		$element.css('border-radius', '3px');
	}

	if(
		   validated.listing_name  == true
		&& validated.listing_title == true
		&& validated.display_url   == true
		&& validated.click_url     == true
	) {
		enableListingSave();
	} else {
		disableListingSave();
	}
}
