function CollisionTimeline($el, baseUrl, getBoundingBox) {
  if ($el == null) {
    throw TypeError("$el can't be null");
  }

  if (baseUrl == null) {
    throw TypeError("baseUrl can't be null");
  }

  if (getBoundingBox == null) {
    throw TypeError("getBoundingBox can't be null");
  }

  this.$el = $el;
  this.incidentCountsBaseUrl = baseUrl + 'incidents/counts.json';
  this.getBoundingBox = getBoundingBox;
}

CollisionTimeline.prototype.renderWithCurrentBounds = function() {
  var incidentCountsUrl = this.incidentCountsBaseUrl + "?bbox=" + this.getBoundingBox();

  var timeline = this;
  // fetch incident count data from the API
  $.getJSON(incidentCountsUrl, function(json) {
    var incidentCounts = json.incident_counts;

    // HACK to remove 2013, the data is super incomplete, so it makes it looks
    // like accidents went to ridiculously low levels in 2013. I wish.
    incidentCounts = _.filter(incidentCounts, function(e) { return e["year"] != "2013" });

    console.log('incident counts:', incidentCounts);
    var labels = _.map(incidentCounts, 'year')
    var points = _.map(incidentCounts, 'count')

    timeline.render(labels, points);
  });
}

CollisionTimeline.prototype.render = function(labels, points) {
  this.$el.find('canvas').remove();
  var $canvas = $("<canvas id='line-chart' width='400' height='200'></canvas>");
  this.$el.append($canvas);

  var context = $canvas[0].getContext("2d");

  var data = {
    labels: labels,
    datasets: [{
      label: "Collisions",
      data: points,
      backgroundColor: "rgba(220,220,220,0.2)",
      borderColor: "rgba(220,220,220,1)",
      pointBackgroundColor: "rgba(220,220,220,1)",
      pointBorderColor: "#fff",
    }]
  };
  Chart.defaults.global.defaultFontColor='#888';
  var options = {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero:true,
        },
      }],
    }
  };


  // Is it ok to just keep overriding this? Do we need to blow away the existing one first?  //
  var myLineChart = new Chart(context, { type: 'line', data: data, options: options });
}

