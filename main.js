/**
 * Set this to true to get console.log information.
 **/
var debug = false;

/**
 * Prints log information when debug is enabled.
 * @param  {string} str Debug log information to pring to the console.
 * @return {vold}
 **/
function log_debug(str) {
	if(debug) {
		console.log(str);
	}
}

log_debug("QA Checker extension loaded, debug mode enabled.");

/**
 * Add an event to when the "Listing Add" button is clicked on the advertiser page.
 * The first parameter are configuration options for validation, basically the "state"
 * of whether that item is validated yet or not.  Since this event is adding a new 
 * listing everything starts in the 'not validated' state.
 **/
$('button.listing_add').click(
	{
		"validated": {
			"disable_save_button": true,
			"listing_name"       : false,
			"listing_title"      : false,
			"display_url"        : false,
			"click_url"          : false,
			"feed_url"           : false,
			"source_uri"         : false,
			"beacon_url"         : false,
			"companion_html"     : false,
			"static_resource"    : false,
			"banner_click"       : false
		},
		"type": "add"
	},
	addListingEditEvents
);

/**
 * Add an event to when the "Listing Edit" button is clicked on the advertiser page.
 * This is the same type of event as the "Listing Add" event above however the state
 * is switched, everything on an edit will be considered in the 'validated' state from
 * the start.
 **/
$('button.listing_edit').click(
	{
		"validated": {
			"disable_save_button": false,
			"listing_name"       : true,
			"listing_title"      : true,
			"display_url"        : true,
			"click_url"          : true,
			"feed_url"           : true,
			"source_uri"         : true,
			"beacon_url"         : true,
			"companion_html"     : true,
			"static_resource"    : true,
			"banner_click"       : true
		},
		"type": "edit"
	},
	addListingEditEvents
);

/**
 * These global variables store the number of tracking beacons
 * that are currently associated with the listing that is being
 * added or edited and if the current listing has found any 
 * existing tracking beacons (e.g. stop looking!).
 **/
var trackingBeaconsMetadata = {
	num       : -1,
	checkCount: 0,
	found     : false,
	timeoutObj: null
};

/**
 * Resets the global tracking beacon metadata.  This stops the 
 * setTimeout() callback that checks for existing tracking beacons.
 * @return {void}
 **/
function resetTrackingBeaconSearch() {
	trackingBeaconsMetadata.num        = -1;
	trackingBeaconsMetadata.checkCount = 0;
	trackingBeaconsMetadata.found      = false;

	// Don't forget to stop the existing check!
	if(trackingBeaconsMetadata.timeoutObj !== null) {
		clearTimeout(trackingBeaconsMetadata.timeoutObj);
	}
}

/**
 * These global variables store if the edit of a
 * listing contains companion banners and if they have been found.
 **/
var companionBannerMetadata = {
	checkCount: 0,
	found     : false,
	timeoutObj: null
};

/**
 * Resets the global companion banner metadata.  This stops the
 * setTimeout() callback that checks for existing companion banners.
 * @return {void}
 **/
function resetCompanionBannerSearch() {
	companionBannerMetadata.checkCount = 0;
	companionBannerMetadata.found      = false;

	if(companionBannerMetadata.timeoutObj !== null) {
		clearTimeout(companionBannerMetadata.timeoutObj);
	}
}

/**
 * Error message strings to display to the user when validation of an element fails for
 * a particular validation method.
 **/
var toolTipsHasStartOrEndSpaces = " contains spaces at beginning or end. Please remove.";
var toolTipsHasSpecialChars     = " contains special characters. Please Remove.";
var toolTipsHasSpaces           = " contains spaces. Please Remove.";
var toolTipsHasTimestamp        = " contains timestamp. VAST urls only use $SPOT_MARKET_ID. Please replace.";
var toolTipsHasJumpTag          = " contains a jump tag. Please use the Ad tag.";
var toolTipsHasSpotMarketId     = " contains $SPOT_MARKET_ID macro. Please replace with [timestamp]";

/**
 * Checks if the provided string starts with or ends with a space " " character.
 * @param  {string} str String to check for the spaces.
 * @return {bool}       True if the string starts or ends with a space, otherwise false.
 **/
function hasStartOrEndSpaces(str) {
	return (str.charAt(0) == " " || str.charAt(str.length -1) == " ");
}

/**
 * Checks if the provided string contains any special html characters anywhere.
 * @param  {string} str String to check for the special html characters.
 * @return {bool}       True if the string contains any special html characters, otherwise false.
 **/
function hasSpecialChars(str) {
	return (str.search(/(&\w+;|&#[xX][a-fA-F0-9]+;)/) != -1);
}

/**
 * Checks if the provided string contains spaces " " or tabs "\t" anywhere in the string.
 * @param  {string} str String to check for the whitespace characters.
 * @return {bool}       True if the string contains whitespace, otherwise false.
 **/
function hasSpaces(str) {
	return (str.indexOf(" ") != -1) || (str.indexOf("\t") != -1);
}

/**
 * Checks if the provided string contains a "jump" tag anywhere in the string.
 * It is case insensitive.
 * @param  {string} str String to check for the jump tag.
 * @return {bool}       True if the string contains a "jump" tag, otherwise false.
 **/
function hasJumpTag(str) {
	return (str.toLowerCase().search("jump") != -1);
}

/**
 * Checks if the provided string contains a SPOT_MARKET_ID macro anywhere in the string.
 * @param  {string} str String to check for the SPOT_MARKET_ID macro.
 * @return {bool}       True if the string contains a SPOT_MARKET_ID macro, otherwise false.
 **/
function hasSpotMarketId(str) {
	return (str.toUpperCase().search("SPOT_MARKET_ID") != -1);
}

/**
 * Checks if the provided string contains a "timestamp" literal anywhere in the string.
 * @param  {string} str String to check for the "timestamp" literal.
 * @return {bool}       True if the string contains the "timestamp" literal, otherwise false.
 **/
function hasTimestamp(str) {
	return (str.toLowerCase().search("timestamp") != -1);
}

/**
 * Enables the listing save button, will be called when all listing property's pass validation.
 * @return {void}
 **/
function enableListingSave() {
	log_debug("enabling save button");
	$('button.listing_add_save').show();
}

/**
 * Disables the listing save button, will be called when a listing property fails validation.
 * @return {void}
 **/
function disableListingSave() {
	log_debug("disabling save button");
	$('button.listing_add_save').hide();
}

/**
 * Event callback function for when a listing is edited or added.
 * This callback event adds a variety of 'onchange' event listners for the various
 * listing fields that can easily have incorrect input added.
 * @param  {Event} event Contains the default state of validation for all the listing properties.
 * @return {void}
 **/
function addListingEditEvents(event) {
	log_debug("User clicked on " + event.data.type + " listing, addding event listeners for validation.");

	resetTrackingBeaconSearch();
	resetCompanionBannerSearch();

	// Make sure the validated object is "fresh" each time a listing is edited or created.
	var validated = $.extend({}, event.data.validated);

	/**
	 * First add change events for listing fields that are already loaded onto
	 * the page.  The basic idea here is to grab the jQuery reference to the
	 * listing field's input field in the DOM.  Then simply add a change event
	 * listener with the appropriate validation callback functions.
     *
	 * Also note, fire a change event immediately since switching listings
	 * should reset the state of each input box to "green".
	 **/

 	$listingName = $('input[name=listing\\[listing_name\\]]');
	$listingName.change(
		{ 
			"eventType": "listing_name",
			"element"  : $listingName,
			"validate" : ["hasStartOrEndSpaces", "hasSpecialChars"],
			"validated": validated,
			"toolTips" : {
				"hasStartOrEndSpaces": "Listing Name" + toolTipsHasStartOrEndSpaces,
				"hasSpecialChars"    : "Listing Name" + toolTipsHasSpecialChars
			}
		},
		changeEvent
	);
	$listingName.trigger("change");
	$listingTitle = $('input[name=listing\\[default\\]\\[elements\\]\\[title\\]]');
	$listingTitle.change(
		{
			"eventType": "listing_title",
			"element"  : $listingTitle,
			"validate" : ["hasStartOrEndSpaces", "hasSpecialChars"],
			"validated": validated,
			"toolTips" : {
				"hasStartOrEndSpaces": "Listing Title" + toolTipsHasStartOrEndSpaces,
				"hasSpecialChars"    : "Listing Title" + toolTipsHasSpecialChars
			}
		},
		changeEvent
	);
	$listingTitle.trigger("change");
	$displayURL = $('input[name=listing\\[default\\]\\[elements\\]\\[display_url\\]]');
	$displayURL.change(
		{
			"eventType": "display_url",
			"element"  : $displayURL,
			"validate" : ["hasSpaces", "hasSpecialChars"],
			"validated": validated,
			"toolTips" : {
				"hasSpaces"       : "URL" + toolTipsHasSpaces,
				"hasSpecialChars" : "URL" + toolTipsHasSpecialChars
			}
		},
		changeEvent
	);
	$displayURL.trigger("change");
	$clickURL = $('input[name=listing\\[default\\]\\[elements\\]\\[page_url\\]]');
	$clickURL.change(
		{
			"eventType": "click_url",
			"element"  : $clickURL,
			"validate" : ["hasSpaces", "hasSpecialChars"],
			"validated": validated,
			"toolTips" : {
				"hasSpaces"       : "Click URL" + toolTipsHasSpaces,
				"hasSpecialChars" : "Click URL" + toolTipsHasSpecialChars
			}
		},
		changeEvent
	);
	$clickURL.trigger("change");
	$feedURL = $('#listing_rtb_feed_feed_url');
	$feedURL.change(
		{
			"eventType": "feed_url",
			"element"  : $feedURL,
			"validate" : ["hasSpaces", "hasSpecialChars", "hasTimestamp"],
			"validated": validated,
			"toolTips" : {
				"hasSpaces"       : "Feed URL" + toolTipsHasSpaces,
				"hasSpecialChars" : "Feed URL" + toolTipsHasSpecialChars,
				"hasTimestamp"    : "Feed URL" + toolTipsHasTimestamp
			}
		},
		changeEvent
	);
	$feedURL.trigger("change");
	$sourceURI = $('input[name=listing\\[default\\]\\[elements\\]\\[media\\]\\[video\\]\\[0\\]\\[source_uri\\]]');
	$sourceURI.change(
		{
			"eventType": "source_uri",
			"element"  : $sourceURI,
			"validate" : ["hasSpaces", "hasSpecialChars"],
			"validated": validated,
			"toolTips" : {
				"hasSpaces"       : "Source URI" + toolTipsHasSpaces,
				"hasSpecialChars" : "Source URI" + toolTipsHasSpecialChars
			}
		},
		changeEvent
	);
	$sourceURI.trigger("change");

	/**
	 * Now add secondary click event listeners for DOM elements that are not yet
	 * on the page.  These elements get dynamically added to the listing page
	 * when the 'add' buttons for them are clicked.
	 **/
	 // TODO: check to see if this has "hidden" on it and if so.. skip
	$('.listing_add_companion_add').click(
		validated,
		addCompanionBannerEditEvents
	);

	// Note that companion banners can already exist on the page for an edit...
	// Lets just hook into the on click callback to add them for any existing
	// elements already on the DOM.  If this is a new listing though this step can be skipped.
	if(event.data.type == "edit") {
		companionBannerMetadata.timeoutObj = setTimeout(
			function() {checkForExistingCompanionBanners(validated); },
			1000
		);
	}

	/**
	 * Tracking beacons are loaded by a dynamic api call.  By default we start at
	 * the -1 index so when one is added it indexes into the 0 spot.  The setTimeout
	 * below attempts to scrap the page for a full minute to see if the tracking
	 * beacons get loaded and then hooks in the callback functinos.
	 **/
	$('.listing_add_tracking_beacon_add').click(
		validated,
		addTrackingBeaconEditEvents
	);

	// Only need to check for existing tracking beacons on an edit.
	if(event.data.type == "edit") {
		trackingBeaconsMetadata.timeoutObj = setTimeout(
			function() { checkForExistingTrackingBeacons(validated); }, 
			1000
		);
	}

	if(validated.disable_save_button == true) {
		disableListingSave();
	} else {
		enableListingSave();
	}
}

/**
 * setTimeout() callback to scrap the listing's page to try and find
 * any existing tracking beacons.  If they are found then it adds
 * callback on change event listeners for each tracking beacon.
 * @param  {object} validated The validated state of all listing fields.
 *                            This is passed into the on change event listeners.
 * @return {void}
 **/
function checkForExistingTrackingBeacons(validated) {
	log_debug("Checking for existing tracking beacons!");

	if(trackingBeaconsMetadata.found == true) {
		return;
	}

	// See if the page has loaded yet...
	$trackingBeacons = $('li.listing_add_tracking_beacon div input');

	// Nope, so increment our counter check
	if($trackingBeacons.length == 0) {
		log_debug("No tracking beacons found this time...");
		trackingBeaconsMetadata.checkCount++;

		// If we have checked for a full minute... stop
		if(trackingBeaconsMetadata.checkCount >= 60) {
			log_debug("Checked 60 times no longer looking for tracking beacons!");
			return;
		}
		
		// recursively call outselves to try and catch when the page loads fully
		trackingBeaconsMetadata.timeoutObj = setTimeout(checkForExistingTrackingBeacons, 1000);
		return;
	}

	log_debug($trackingBeacons.length + " tracking beacons found, adding handlers!");
	$trackingBeacons.each(
		function(index) {
			trackingBeaconsMetadata.num++;
			log_debug("Adding event handler for existing tracking beacon number: " + trackingBeaconsMetadata.num);
			addTrackingBeaconChangeEvent($(this), validated);
		}
	)
}

/**
 * Adds a new tracking beacon edit event listener.
 * @param  {event} event Event.data contains the current listing's validated state.
 * @return {void}
 **/
function addTrackingBeaconEditEvents(event){
	var validated = event.data;
	trackingBeaconsMetadata.found = true;
	trackingBeaconsMetadata.num++;
	$beaconURL = $('input[name=listing\\[default\\]\\[elements\\]\\[media\\]\\[tracking\\]\\[beacon\\]\\[' + trackingBeaconsMetadata.num + '\\]\\[beacon_url\\]]');
	addTrackingBeaconChangeEvent($beaconURL, validated);
}

/**
 * Helper function for adding the change event to a tracking beacon.
 * @param  {jQuery} $beaconURL The jQuery tracking beacon DOM object.
 * @param  {object} validated  The validated of all listing fields.
 **/
function addTrackingBeaconChangeEvent($beaconURL, validated) {
	$beaconURL.change(
		{
			"eventType": "beacon_url",
			"element"  : $beaconURL,
			"validate" : ["hasSpaces", "hasSpecialChars", "hasJumpTag", "hasSpotMarketId"],
			"validated": validated,
			"toolTips" : {
				"hasSpaces"       : "Tracking beacon" + toolTipsHasSpaces,
				"hasSpecialChars" : "Tracking beacon" + toolTipsHasSpecialChars,
				"hasJumpTag"      : "Tracking beacon" + toolTipsHasJumpTag,
				"hasSpotMarketId" : "Tracking beacon" + toolTipsHasSpotMarketId
			}
		},
		changeEvent
	);
	$beaconURL.trigger("change");
}

/**
 * setTimeout() callback to scrap the listing's page to try and find
 * the companion banner fields.  If they are found then it adds
 * callback on change event listeners for each companion banner field.
 * @param  {object} validated The validated state of all listing fields.
 *                            This is passed into the on change event listeners.
 * @return {void}
 **/
function checkForExistingCompanionBanners(validated) {

	log_debug("checking for tracking beacons!");

	if(companionBannerMetadata.found == true) {
		return;
	}

	// See if the page has loaded yet...
	$companionHTML = $('textarea[name=listing\\[default\\]\\[elements\\]\\[media\\]\\[banners\\]\\[medium_rectangle\\]\\[html_tag\\]]');

	// Nope, so increment our counter check
	if($companionHTML.length == 0) {
		log_debug("No companion banners found this time...");
		companionBannerMetadata.checkCount++;

		// If we have checked for a full minute... stop
		if(companionBannerMetadata.checkCount >= 60) {
			log_debug("Checked 60 times no longer looking for companion banners!");
			return;
		}
		
		// recursively call outselves to try and catch when the page loads fully
		companionBannerMetadata.timeoutObj = setTimeout(checkForExistingCompanionBanners, 1000);
		return;
	}

	log_debug("Companion banners found, adding handlers!");
	companionBannerMetadata.found = true;

	// the event callback can add them .. so lets just use it.
	var event = new Event("empty");
	event.data = validated;
	addCompanionBannerEditEvents(event);
}

/**
 * Adds companion banner edit event listeners.
 * If the companion banner inputs are not visible then this will not add the event listeners.
 * @param  {Event} event Event data contains the validated state of all listing fields.
 * @return {void}
 **/
function addCompanionBannerEditEvents(event) {

	log_debug("Adding companion banner change event handlers.");

	var validated = event.data;
	$companionHTML = $('textarea[name=listing\\[default\\]\\[elements\\]\\[media\\]\\[banners\\]\\[medium_rectangle\\]\\[html_tag\\]]');
	if($companionHTML.length > 0)
	{
		log_debug("adding companion html change even handler.");
		$companionHTML.change(
			{
				"eventType": "companion_html",
				"element"  : $companionHTML,
				"validate" : ["hasSpecialChars"],
				"validated": validated,
				"toolTips" : {
					"hasSpecialChars" : "Companion HTML" + toolTipsHasSpecialChars
				}
			},
			changeEvent
		);
		$companionHTML.trigger("change");
	}
	$statResource = $('input[name=listing\\[default\\]\\[elements\\]\\[media\\]\\[banners\\]\\[medium_rectangle\\]\\[source_uri\\]]');
	if($statResource.length > 0)
	{
		$statResource.change(
			{
				"eventType": "static_resource",
				"element"  : $statResource,
				"validate" : ["hasSpaces", "hasSpecialChars"],
				"validated": validated,
				"toolTips" : {
					"hasSpaces"       : "Static Resource" + toolTipsHasSpaces,
					"hasSpecialChars" : "Static Resource" + toolTipsHasSpecialChars
				}
			},
			changeEvent
		);
		$statResource.trigger("change");
	}
	$bannerClick = $('input[name=listing\\[default\\]\\[elements\\]\\[media\\]\\[banners\\]\\[medium_rectangle\\]\\[page_url\\]]');
	if($bannerClick.length > 0)
	{
		$bannerClick.change(
			{
				"eventType": "banner_click",
				"element"  : $bannerClick,
				"validate" : ["hasSpaces", "hasSpecialChars"],
				"validated": validated,
				"toolTips" : {
					"hasSpaces"       : "Static Resource" + toolTipsHasSpaces,
					"hasSpecialChars" : "Static Resource" + toolTipsHasSpecialChars
				}
			},
			changeEvent
		);
		$bannerClick.trigger("change");
	}
}

/**
 * Generic on change callback event for all listing fields.
 *
 * @param  {Event} event Contains the on change data for the field being validated.
 *                       event.data.eventType => The listing field being edited.
 *                       event.data.element   => The jQuery DOM of the listing field element.
 *                       event.data.validate  => Validation callbacks for this eventType.
 *                       event.data.validated => Current validated state of all listing fields.
 *                       event.data.toolTips  => Tooltip messages for failed validation by validation callbacks.
 * @return {void}
 **/
function changeEvent(event) {

	var eventType = event.data.eventType;
	var $element  = event.data.element;
	var callbacks = event.data.validate;
	var validated = event.data.validated;
	var toolTips  = event.data.toolTips;

	log_debug("Editing " + eventType);

	str = $element.val();
	log_debug(str);

	var hasErrors = false;

	/**
	 * For each validation callback see if it fails... and if it does
	 * change the input to show failure as well as a nice tooltip message
	 * for what went wrong.
	 **/
	for(var key in callbacks) {
		var funcName = callbacks[key];
		if(window[funcName](str)) {
			log_debug(eventType + " failed validation in " + funcName);
			validated[eventType] = false;
			$element.css('border', '2px solid red');
			$element.css('border-radius', '3px');
			$element.css('background-color', '#ffb1b1');
			$element.tooltip({"content": toolTips[funcName]});
			$element.tooltip("enable");
			$element.tooltip();
			hasErrors = true;
			break;
		}
	}

	log_debug("hasErrors:" + hasErrors);
	if(!hasErrors) {
		log_debug(eventType + " is validated");
		validated[eventType] = true;
		$element.css('border', 'rgb(122, 196, 96) solid 2px');
		$element.css('border-radius', '3px');
		$element.css('background-color', '#bdd9ac');
		$element.tooltip();
		$element.tooltip("disable");
	}

	// Disable the save button on important fields that `cannot` be incorrect.
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
