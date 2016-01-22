function CollisionTimeline(baseUrl, getBoundingBox) {
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
    var labels = _.pluck(incidentCounts, 'year')
    var points = _.pluck(incidentCounts, 'count')

    timeline.render(labels, points);
  });
}

CollisionTimeline.prototype.render = function(labels, points) {
  var context = document.getElementById('line-chart').getContext("2d");

  var data = {
    labels: labels,
    datasets: [{
      label: "Collisions",
      fillColor: "rgba(220,220,220,0.2)",
      strokeColor: "rgba(220,220,220,1)",
      pointColor: "rgba(220,220,220,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(220,220,220,1)",
      data: points
    }]
  };
  var options = {
    scaleBeginAtZero: true,
    scaleFontColor: "#888",
  };

  // Is it ok to just keep overriding this? Do we need to blow away the existing one first?  //
  var myLineChart = new Chart(context).Line(data, options);
}

