//Total Locations
var locations = [
    {title: 'kailash giri', location: {lat: 17.7492, lng: 83.3422}},
    {title: 'simhachalam temple', location: {lat: 17.7665, lng: 83.2506}},
    {title: 'Indira Gandhi zoological park', location: {lat: 17.7686, lng: 83.3445}},
    {title: 'visakha museum', location: {lat: 17.7206, lng: 83.3342}},
    {title: 'sivaji park', location: {lat: 17.7374, lng: 83.3312}},
    {title: 'rushikonda beach', location: {lat: 17.7820, lng: 83.3853}},
    {title: 'ramakrishna beach', location: {lat: 17.7115, lng: 83.3195}},
    {title: 'hotel daspalla', location: {lat: 17.7106556, lng: 83.3004312}},
    {title: 'Vizag steel', location: {lat: 17.6333889, lng: 83.1706543}}
];

//Array to hold current locations
var myObservableArray;
//map variable
var map;
//markers array
var markers = [];
//info window to show the details of clicked location
var largeInfowindow;
//map bounds
var bounds;
//to hide the map markers
function hideListings() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}
//initialize the map
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 17.6868, lng: 83.2185},
        zoom: 13
    });
    addMarkers();
}
//to add the map markers
function addMarkers() {
    hideListings();
    markers = [];
    bounds = new google.maps.LatLngBounds();
    largeInfowindow = new google.maps.InfoWindow();
    for (i = 0; i < myObservableArray().length; i++) {
        var position = myObservableArray()[i].location;
        var title = myObservableArray()[i].title;

        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        markers.push(marker);
        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfowindow);
        });
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}
// adding locations to the ordered list
addLocationToOL = function (liItem) {
    $('#idListPlaces').append(liItem);
};
// empty the ordered list locations
removeLocationsFromOL = function () {
    $('#idListPlaces').empty();
};
//Knockout main function
var mainKO = function () {
    self = this;
    //Adding all locations to the ko array and ordered list
    myObservableArray = ko.observableArray(locations);
    for (var i = 0; i < myObservableArray().length; i++) {
        var liItem = '<li>' + myObservableArray()[i].title + '</li>';
        addLocationToOL(liItem);
    }
    //Adding filtered locations to the ko array and ordered list
    self.populatePlaceTitles = function () {
        var query = $('#idFilter').val();
        self.idFilter = ko.observable(query);
        myObservableArray = new ko.observableArray();
        if (self.idFilter() === '') {
            myObservableArray = ko.observableArray(locations);
        } else {
            for (var k = 0; k < locations.length; k++) {
                var n = locations[k].title.search(self.idFilter());
                if (n >= 0) {
                    myObservableArray.push(locations[k]);
                }
            }
        }
        //Emptying all the earlier list items from the Ordered List
        removeLocationsFromOL();
        //Populating the filtered locations in the ordered list
        for (var j = 0; j < myObservableArray().length; j++) {
            var liItem = '<li>' + myObservableArray()[j].title + '</li>';
            addLocationToOL(liItem);
        }
        //Adding map markers for only the filtered locations
        addMarkers();
    };
};
//applying main ko function
ko.applyBindings(new mainKO());
//populating info window based on marker
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker !== marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        function getStreetView(data, status) {
            if (status === google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                        nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div>' +
                        '<div>No Street View Found</div>');
            }
        }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}
//populating info window based on click in the ordered list item
$('#idListPlaces').click(function (e) {
    var n = $(e.target).index();
    populateInfoWindow(markers[n], largeInfowindow);
});
 