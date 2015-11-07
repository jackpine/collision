function BikeCountMap() {
  this.config = new Config();
  L.mapbox.accessToken = this.config.accessToken;

  //build the map and center it over DTLA
  var map = L.mapbox.map('map', 'mapbox.dark').setView(this.config.defaultMapLatLon, 15);

  $.getJSON('/js/data/bike_counts_2015.geojson', function(data) {
    var calendar = _.groupBy(data.features, function(feature) { return feature.properties.started_at;})

    var layers = {}
    _.each(calendar, function(features, startedAt) {
      var markers = _.map(features, function(feature) {
        var lonlat = feature.geometry.coordinates;
        return L.marker(lonlat.reverse()).bindPopup("<p>" + feature.properties.total + "</p>");
      });
      var layer = L.layerGroup(markers);
      layers[startedAt] = layer
      layer.addTo(map);
    });
  });
};



