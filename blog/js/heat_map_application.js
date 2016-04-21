function HeatMapApplication($timeline) {
  this.config = new Config();
  L.mapbox.accessToken = this.config.accessToken;

  //build the map and center it over DTLA
  var map = L.mapbox.map('map', 'mapbox.dark').setView(this.config.defaultMapLatLon, 15);

  // Where our visualizations get their collision data
  var baseUrl = 'http://api.collision.jackpine.me/api/v1/';

  //give components a way to get their bounds
  var getBoundingBox = function() {
    var bounds = map.getBounds();
    var boundingBox = "" + bounds.getWest() + "," + bounds.getSouth() + "," +  bounds.getEast() + "," + bounds.getNorth();
    return boundingBox;
  }

  // set up visualizatoin components
  this.heatMap = new HeatMap(map, baseUrl, getBoundingBox);
  this.collisionTimeline = new CollisionTimeline($timeline, baseUrl, getBoundingBox);

  // initial render
  this.renderWithCurrentBounds();

  // For performance:
  // If the user is clicking around like crazy, rerender only once per second max.
  this.reRenderWithCurrentBounds = _.debounce(this.renderWithCurrentBounds, 1000);

  var application = this;
  //re-render incidents whenever map moves
  map.on('moveend', function() {
    application.reRenderWithCurrentBounds();
  });
};

HeatMapApplication.prototype.renderWithCurrentBounds = function() {
  this.heatMap.renderWithCurrentBounds();
  this.collisionTimeline.renderWithCurrentBounds();
};



