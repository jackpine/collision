var UscIntersectionCollisionsMap = function(mapId) {

  function setup(intersections) {
    //TODO remove img, replace with dynamic map
    this.config = new Config();
    L.mapbox.accessToken = this.config.accessToken;

    var map = L.mapbox.map(mapId, 'mapbox.streets')
      .setView([34.028, -118.2856], 14);


    var NumberMarker = L.Circle.extend({

    });

    var intersectionIcon = L.divIcon();
    _.each(intersections, function(intersection) {
      console.log(intersection);

      //lonlat to latlon
      var coordinates = _.clone(intersection.geometry.coordinates).reverse();

      //var icon = new LabeledDivIcon();

      var injuries = intersection.properties.BICINJ_sum;
      var markerHtml = "<div class='intersection-collision-marker-label'>" + injuries + "</div>";
      var icon = new L.DivIcon({ className: 'intersection-collision-marker',
                                 html: markerHtml,
                                 iconSize: [25, 25]});

      //clickable:false seems to be broken, so we are overriding the cursor style in css elsewhere.
      var marker = new L.Marker(coordinates, { icon: icon, clickable: false });

      marker.addTo(map);
    });
  }

  $(function(){
    $.ajax({
      dataType: "json",
      url: "/js/dangerous_cycling_intersections_near_usc.geojson",
      success: function(data) {
        setup(data.features);
      }
    }).error(function() {
      console.log("failed to fetch USC intersection data.");
    });
  });
};

LabeledDivIcon = L.DivIcon.extend({
  options: {
    iconSize: [30, 30]
  },
  createIcon: function (oldIcon) {
    var superIcon = L.DivIcon.prototype.createIcon(oldIcon);
    superIcon.setAttribute ( "class", "leaflet-circle-icon" );

    var label = document.createElement('div');
    label.setAttribute ( "class", "leaflet-circle-icon-label" );
    label.innerHTML = "13";
    superIcon.appendChild(label);
    return superIcon;
  }
});
