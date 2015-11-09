function BikeCountMap($el) {
  this.config = new Config();
  L.mapbox.accessToken = this.config.accessToken;

  //build the map and center it over DTLA
  var map = L.mapbox.map('map', 'mapbox.dark').setView(this.config.defaultMapLatLon, 11);

  $.getJSON('/js/data/bike_counts_2013-2015.geojson', function(data) {
    var samples = _.map(data.features, function(feature) { return new Sample(feature); });
    var datasetNavigator = new DatasetNavigator(samples);
    var $datasetSelect = datasetNavigator.selectElement();

    $datasetSelect.on('change', function() {
        setDataset(this.value);
    });

    $el.after($datasetSelect);

    var currentLayer;
    var $currentTimeSelect;
    var $timeSlider;
    var dataset;

    //Default to an interseting time in the latest bikecount
    setDataset("2015 LACBC Bike Count");
    setTime("2015-09-16 07:00:00");

    function setTime(time) {
      console.log("setting time", time);
      $currentTimeSelect.val(time);
      var index = _.indexOf(dataset.orderedDates, time);
      $timeSlider.slider('setValue', index);
      if(currentLayer) {
        map.removeLayer(currentLayer);
      }
      var layer = dataset.layerCalendar[time];
      currentLayer = layer;
      layer.addTo(map);
    }

    function setDataset(datasetName) {
      // works with programmatic setting (not just user interaction)
      $datasetSelect.val(datasetName);
      console.log("setting dataset", datasetName);
      dataset = datasetNavigator.datasets[datasetName];
      if($currentTimeSelect) {
        $currentTimeSelect.remove();
      }
      $currentTimeSelect = dataset.selectElement();
      $currentTimeSelect.on('change', function() {
        setTime(this.value);
      });
      $datasetSelect.after($currentTimeSelect);

      $timeSlider = $('.slider');
      $timeSlider.on('change', function() {
        var time = dataset.orderedDates[this.value]
        setTime(time);
      });
      var timeSlider = dataset.sliderElement($timeSlider);
      $el.after($timeSlider);

      setTime($currentTimeSelect.val())
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
  var $select = $('<select>');

  _.each(this.datasets, function(dataset, datasetName) {
    var option = document.createElement('option');
    option.value = datasetName;
    option.text = datasetName;
    $select.append(option)
  });
  return $select;
}

var Dataset = function(name, samples) {
  this.name = name;
  this.layerCalendar = this.buildLayerCalendar(samples);
  this.orderedDates = this.orderByDate(Object.keys(this.layerCalendar));
}

Dataset.prototype.orderByDate = function(orderStrings) {
  return _.sortBy(orderStrings, function(a, b) {
    return new Date(a) - new Date(b);
  });
}

Dataset.prototype.selectElement = function() {
  var $select = $("<select>");

  var datasetName = this.name;
  _.each(this.orderedDates, function(startedAt) {
    var option = document.createElement('option');
    option.value = startedAt;
    option.text = startedAt;
    $select.append(option);
  })
  return $select;
}

Dataset.prototype.sliderElement = function($slider) {
  $slider.slider({max: this.orderedDates.length - 1});
  return $slider;
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
      return L.circleMarker(sample.latlon, { color: color, radius: totalCount + 2 } ).bindPopup("<p>bikes counted: " + totalCount + "</p>");
    });
    var layer = L.layerGroup(markers);
    layerCalendar[startedAt] = layer
  });

  return layerCalendar;
}
