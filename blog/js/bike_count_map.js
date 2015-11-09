function BikeCountMap($el) {
  this.config = new Config();
  L.mapbox.accessToken = this.config.accessToken;

  //build the map and center it over DTLA
  var map = L.mapbox.map('map', 'mapbox.dark').setView(this.config.defaultMapLatLon, 13);

  $.getJSON('/js/data/bike_counts_2013-2015.geojson', function(data) {
    var samples = _.map(data.features, function(feature) { return new Sample(feature); });
    var datasetNavigator = new DatasetNavigator(samples);
    var datasetSelect = datasetNavigator.selectElement();

    datasetSelect.addEventListener(
      'change',
      function() {
        setDataset(this.value);
      },
      false
    )

    $el.after(datasetSelect);

    setDataset("2013 LACBC Bike Count");
    var currentLayer;
    var $currentTimeSelect;

    function setTime(time) {
      $currentTimeSelect.val(time);
      if(currentLayer) {
        map.removeLayer(currentLayer);
      }
      var layer = dataset.layerCalendar[time];
      currentLayer = layer;
      layer.addTo(map);
    }

    $el.on('timeDidChange', function(e, time) {
      console.log("time did change:", time);
      setTime(time)
    });

    function setDataset(datasetName) {
      dataset = datasetNavigator.datasets[datasetName];
      if($currentTimeSelect) {
        $currentTimeSelect.remove();
      }
      $currentTimeSelect = dataset.selectElement();
      setTime($currentTimeSelect.val())
      $currentTimeSelect.on('change', function() {
        setTime(this.value);
      });
      $(datasetSelect).after($currentTimeSelect);

      $timeSlider = $('.slider');
      var timeSlider = dataset.sliderElement($timeSlider);
      $el.after($timeSlider);
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

  _.each(this.datasets, function(dataset, datasetName) {
    var option = document.createElement('option');
    option.value = datasetName;
    option.text = datasetName;
    select.add(option)
  });
  return select;
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
    var layer = this.layerCalendar[startedAt]
    var option = document.createElement('option');
    option.value = startedAt;
    option.text = startedAt + "  -  (" + datasetName + ")";
    $select.append(option);
  })
  return $select;
}

Dataset.prototype.sliderElement = function($slider) {
  $slider.slider();
  $slider.on('change', function(event) {
    this.setTime(event.value);
  });
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
      return L.circleMarker(sample.latlon, { color: color, radius: totalCount + 2 } ).bindPopup("<p>" + totalCount + "</p>");
    });
    var layer = L.layerGroup(markers);
    layerCalendar[startedAt] = layer
  });

  return layerCalendar;
}
