function HeatMap(map, baseUrl, getBoundingBox) {
  if (map == null) {
    throw TypeError("map can't be null");
  }

  if (baseUrl == null) {
    throw TypeError("baseUrl can't be null");
  }

  if (getBoundingBox == null) {
    throw TypeError("getBoundingBox can't be null");
  }

  this.incidentsBaseUrl = baseUrl + 'incidents.json';
  this.map = map;
  this.getBoundingBox = getBoundingBox;
}

HeatMap.prototype.renderWithCurrentBounds = function() {
  // The parameters we can tweak: blur, radius, maxzoom, intensity
  //
  // Because the vis looks quite different at differnt zooms and on different devices
  // we have to check a lot of different combinations. Here's the zooms/devices I checked
  // zoom-levels           (device)-> iPhone6, MacBook 13"
  // 15 (neighborhood)
  // 12 (city)
  // 10 (metro)
  // 7  (state)
  var incidentsUrl = this.incidentsBaseUrl + "?bbox=" + this.getBoundingBox();
  
  var collisionMap = this.map;

  // fetch incident data from the API
  $.getJSON(incidentsUrl, function(json) {
    //remove any existing heatlayer, otherwise we'll keep stacking layers every time we re-render
    if (collisionMap.heatLayer) {
      collisionMap.removeLayer(collisionMap.heatLayer);
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
    collisionMap.heatLayer = L.heatLayer(incidentPoints, {blur: blur, radius: radius, maxZoom: 13});
    collisionMap.addLayer(collisionMap.heatLayer);
  });
};

