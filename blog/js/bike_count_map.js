function BikeCountMap($el) {
  this.config = new Config();
  L.mapbox.accessToken = this.config.accessToken;

  //build the map and center it over DTLA
  var map = L.mapbox.map('map', 'mapbox.dark').setView(this.config.defaultMapLatLon, 13);

  $.getJSON('/js/data/bike_counts_2013-2015.geojson', function(data) {
    var samples = _.map(data.features, function(feature) { return new Sample(feature); });
    var datasetNavigator = new DatasetNavigator(samples);

    dataset = datasetNavigator.datasets["2013 Glendale Bike Count"];
    var calendar = dataset.sampleCalendar;
    var timeSelect = dataset.selectElement();

    timeSelect.addEventListener(
      'change',
      function() {
        setTime(this.value);
      },
      false
    )
    $el.after(timeSelect);
    var currentLayer;
    var layers = dataset.layerCalendar;

    //This looks like a time with lots of sampling
    //var defaultTime = "2015-09-16 07:45:00"
    //$(timeSelect).val(defaultTime);
    //setTime(defaultTime);

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


var Sample = function(feature) {
  this.datasetName = feature.properties.dataset_na;
  this.startedAt = feature.properties.started_at;
  this.totalCount = feature.properties.total;
  this.latlon = feature.geometry.coordinates.reverse();
}

var DatasetNavigator = function(samples) {
  var samplesByDataset = _.groupBy(samples, function(sample) { return sample.datasetName });
  var datasets = {}
  _.each(samplesByDataset, function(samples, datasetName) {
    datasets[datasetName] = new Dataset(datasetName, samples);
  });
  this.datasets = datasets;
}

DatasetNavigator.prototype.selectElement = function () {
  var select = document.createElement('select');
}

var Dataset = function(name, samples) {
  this.name = name;
  this.layerCalendar = this.buildLayerCalendar(samples);
}

Dataset.prototype.orderByDate = function(orderStrings) {
  return _.sortBy(orderStrings, function(a, b) {
    return new Date(b) - new Date(a);
  });
}

Dataset.prototype.selectElement = function() {
  var select = document.createElement('select');

  datasetName = this.name;
  _.each(this.layerCalendar, function(layer, startedAt) {
    var option = document.createElement('option');
    option.value = startedAt;
    option.text = startedAt + "  -  (" + datasetName + ")";
    select.add(option)
  });
  return select;
}

Dataset.prototype.buildLayerCalendar = function(samples) {
  var sampleCalendar = _.groupBy(samples, function(sample) { return sample.startedAt; } );

  layerCalendar = {};
  _.each(sampleCalendar, function(samples, startedAt) {
    var markers = _.map(samples, function(sample) {
      var totalCount = sample.totalCount
      var color = 'green';
      if (totalCount == 0) {
        color = 'white';
      }
      return L.circleMarker(sample.latlon, { color: color, radius: totalCount + 2 } ).bindPopup("<p>" + totalCount + "</p>");
    });
    var layer = L.layerGroup(markers);
    layerCalendar[startedAt] = layer
  });

  return layerCalendar;
}
