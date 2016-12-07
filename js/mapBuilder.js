var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'),
    {
        center: {lat: 17.6868, long:83.2185},
        zoom: 13
    });
}