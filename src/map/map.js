var map;
/**
 * Add or replace a parameter (with value) in the given URL.
 * @param String url the URL
 * @param String param the parameter
 * @param String paramVal the value of the parameter
 * @return String the changed URL
 */
function updateURLParameter(url, param, paramVal) {
	var theAnchor = null;
	var newAdditionalURL = "";
	var tempArray = url.split("?");
	var baseURL = tempArray[0];
	var additionalURL = tempArray[1];
	var temp = "";

	if (additionalURL) {
		var tmpAnchor = additionalURL.split("#");
		var theParams = tmpAnchor[0];
		theAnchor = tmpAnchor[1];
		if(theAnchor) {
			additionalURL = theParams;
		}

		tempArray = additionalURL.split("&");

		for (i=0; i<tempArray.length; i++) {
			if(tempArray[i].split('=')[0] != param) {
				newAdditionalURL += temp + tempArray[i];
				temp = "&";
			}
		}        
	} else {
		var tmpAnchor = baseURL.split("#");
		var theParams = tmpAnchor[0];
		theAnchor  = tmpAnchor[1];

		if(theParams) {
			baseURL = theParams;
		}
	}

	if(theAnchor) {
		paramVal += "#" + theAnchor;
	}

	var rows_txt = temp + "" + param + "=" + paramVal;
	return baseURL + "?" + newAdditionalURL + rows_txt;
}

/**
 * Add or replace the language parameter of the URL and reload the page.
 * @param String id of the language
 */
function changeLanguage(pLang) {
	window.location.href = updateURLParameter(window.location.href, 'lang', pLang);
}

/**
 * Get all parameters out of the URL.
 * @return Array List of URL parameters key-value indexed
 */
function getUrlParameters() {
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i=0; i<hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}

/**
 * Callback for successful geolocation.
 * @var position Geolocated position
 */
function foundLocation(position) {
	if (typeof map != "undefined") {
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;
		map.setView(new L.LatLng(lat, lon), 11);
	}
}

/**
 * Example function to replace leaflet-openweathermap's builtin marker.
 */
function myOwmMarker(data) {
	// just a Leaflet default marker
	return L.marker([data.coord.Lat, data.coord.Lon]);
}

/**
 * Example function to replace leaflet-openweathermap's builtin popup.
 */
function myOwmPopup(data) {
	// just a Leaflet default popup
	return L.popup().setContent(typeof data.name != 'undefined' ? data.name : data.id);
}

function getLocalLanguage() {
	var lang = null;

	// 1. try to read URL parameter 'lang'
	var qs = window.location.search;
	if (qs) {
		if (qs.substring(0, 1) == '?') {
			qs = qs.substring(1)
		}
		var params = qs.split('&')
		for(var i = 0; i < params.length; i++) {
			var keyvalue = params[i].split('=');
			if (keyvalue[0] == 'lang') {
				lang = keyvalue[1];
				break;
			}
		}
	}

	// 2. try to get browser or system language
	if (!lang) {
		var tmp = window.navigator.userLanguage || window.navigator.language;
		lang = tmp.split('-')[0];
	}

	// Use only supported languages, defaults to 'en'
	if (lang != 'en' && lang != 'it' && lang != 'de' && lang != 'fr' && lang != 'ru' && lang != 'nl' && lang != 'ca' && lang != 'es' && lang != 'pt_br') {
		lang = 'en';
	}
	return lang;
}

/**
 * Initialize the map.
 */
function initMap() {

	var standard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
    	maxNativeZoom: 18,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors</a>'
		});

	var API_KEY = '886affd22c1a5fb11f7f7de1cbd25b4f';

	var localLang = getLocalLanguage();

	var city = L.OWM.current({interval: 10, imageLoadingUrl: '../src/images/loading.gif', lang: localLang, minZoom: 9, appId: API_KEY});

	var useGeolocation = false;
	var zoom = 9;
	var lat = 42.619381660472165;
	var lon = 25.392986239080592;
	var urlParams = getUrlParameters();
	if (typeof urlParams.zoom != "undefined" && typeof urlParams.lat != "undefined" && typeof urlParams.lon != "undefined") {
		zoom = urlParams.zoom;
		lat = urlParams.lat;
		lon = urlParams.lon;
		useGeolocation = false;
	}

	map = L.map('map', {
		center: new L.LatLng(lat, lon), zoom: zoom,
		layers: [standard,city]
	});
	map.attributionControl.setPrefix("");
	
	if (useGeolocation && typeof navigator.geolocation != "undefined") {
		navigator.geolocation.getCurrentPosition(foundLocation);
	}
}
