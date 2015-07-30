function collisionMap() {
    L.mapbox.accessToken = 'pk.eyJ1IjoibWljaGFlbGtpcmsiLCJhIjoiNjA3YTM0ODRmOTU3ZmQ2ZTUxMjgyNWI0MDk2ODBiMzAifQ.GOrBk7s9JvPl6h5rDkcJiQ';

    //build the map and center it over DTLA
    var map = L.mapbox.map('map', 'mapbox.dark').setView([34.0510, -118.2500], 15);

    // The parameters we can tweak: blur, radius, maxzoom, intensity
    //
    // Because the vis looks quite different at differnt zooms and on different devices
    // we have to check a lot of different combinations. Here's the zooms/devices I checked
    // zoom-levels           (device)-> iPhone6, MacBook 13"
    // 15 (neighborhood)
    // 12 (city)
    // 10 (metro)
    // 7  (state)
    var heatLayer;
    var updateIncidentsFromBounds  = function() {
        var bounds = map.getBounds();
        var boundingBox = "" + bounds.getWest() + "," + bounds.getSouth() + "," +  bounds.getEast() + "," + bounds.getNorth();
        var incidentsBaseUrl = 'http://api.collision.jackpine.me/api/v1/incidents.json';
        var incidentsBaseUrl = 'http://localhost:3000/api/v1/incidents.json';
        var incidentsUrl = incidentsBaseUrl + "?bbox=" + boundingBox;

        // fetch incident data from the API
        $.getJSON(incidentsUrl, function(json) {
            //remove any existing heatlayer, otherwise we'll keep stacking layers every time we re-render
            if (heatLayer) {
                map.removeLayer(heatLayer);
            }

            var incidents = json.incidents;

            // Some heatmap style parameters
            var blur = 25;
            var radius = blur;
            var intensity = 0.10;

            // Handle low incident presentaion specially, otherwise we can't see them.
            if (incidents.length < 500) {
                // The fewer the incidents, the more intensly we color any individual
                // incident. This makes the visualizations intensity "relative" to how
                // many incidents are currently on the map.
                intensity += (0.4 * (1 - incidents.length/500))
            }

            console.log('incidents:', incidents.length, 'intensity:', intensity, 'blur:', blur, 'radius:', radius);

            // Transform data from the API into a form the heatmap needs,
            // Output looks like this: [ [34.2, 118.1, 0.3], [33.3, 118.9, 0.3], ...]
            var incidentPoints = _.map(incidents, function(incidentAttributes) { return incidentAttributes.location.coordinates.reverse().concat([intensity]) });

            // Build a layer from our points and put them on our map.
            heatLayer = L.heatLayer(incidentPoints, {blur: blur, radius: radius, maxZoom: 13}).addTo(map);

            var draw = true;
        });
    };

    // For performance sake when the user is clicking around like crazy,
    // call at most, only once per second.
    updateIncidentsFromBounds = _.debounce(updateIncidentsFromBounds, 1000);

    // initial render
    updateIncidentsFromBounds();

    //refresh displayed incidents whenever map moves
    map.on('moveend', function() {
        updateIncidentsFromBounds();
    });
}
