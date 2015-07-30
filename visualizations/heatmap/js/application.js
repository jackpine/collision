function Application() {
  L.mapbox.accessToken = 'pk.eyJ1IjoibWljaGFlbGtpcmsiLCJhIjoiNjA3YTM0ODRmOTU3ZmQ2ZTUxMjgyNWI0MDk2ODBiMzAifQ.GOrBk7s9JvPl6h5rDkcJiQ';

  //build the map and center it over DTLA
  var map = L.mapbox.map('map', 'mapbox.dark').setView([34.0510, -118.2500], 15);

  // Where our visualizations get their collision data
  var baseUrl = 'http://localhost:3000/api/v1/';

  //give components a way to get their bounds
  var getBoundingBox = function() {
    var bounds = map.getBounds();
    var boundingBox = "" + bounds.getWest() + "," + bounds.getSouth() + "," +  bounds.getEast() + "," + bounds.getNorth();
    return boundingBox;
  }

  // set up visualizatoin components
  this.heatMap = new HeatMap(baseUrl, map, getBoundingBox);
  this.collisionTimeline = new CollisionTimeline(baseUrl, getBoundingBox);

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
}

Application.prototype.renderWithCurrentBounds = function() {
  this.heatMap.renderWithCurrentBounds();
}

