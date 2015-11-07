function BikeCountMap($el) {
  this.config = new Config();
  L.mapbox.accessToken = this.config.accessToken;

  //build the map and center it over DTLA
  var map = L.mapbox.map('map', 'mapbox.dark').setView(this.config.defaultMapLatLon, 15);

  $.getJSON('/js/data/bike_counts_2015.geojson', function(data) {
    var calendar = _.groupBy(data.features, function(feature) { return feature.properties.started_at;})



    var timeSelect = document.createElement('select');
    $el.after(timeSelect);
    

    var layers = {}
    _.each(calendar, function(features, startedAt) {
      var markers = _.map(features, function(feature) {
        var lonlat = feature.geometry.coordinates;
        var totalCount = feature.properties.total
        var color = 'green';
        if (totalCount == 0) {
          color = 'white';
        }
        return L.circleMarker(lonlat.reverse(), { color: color, radius: totalCount + 2 } ).bindPopup("<p>" + totalCount + "</p>");
      });
      var layer = L.layerGroup(markers);
      layers[startedAt] = layer

      var option = document.createElement('option');
      option.value = option.text = startedAt;
      timeSelect.add( option );
    });
    var currentLayer;

    timeSelect.addEventListener(
      'change',
      function() {
        setTime(this.value);
      },
      false
    )
    setTime(Object.keys(calendar)[0]);

    function setTime(time) {
      if(currentLayer) {
        map.removeLayer(currentLayer);
      }
      var layer = layers[time];
      currentLayer = layer;
      layer.addTo(map);
    }
  });
};



