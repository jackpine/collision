var UscIntersectionCollisionsMap = function(mapId) {

  function setup(intersections) {
    this.config = new Config();
    L.mapbox.accessToken = this.config.accessToken;

    var southWest = L.latLng(34.000, -118.335),
        northEast = L.latLng(34.055677, -118.257460),
        bounds = L.latLngBounds(southWest, northEast);

    var map = L.mapbox.map(mapId, 'mapbox.streets', {
      maxBounds: bounds,
      maxZoom: 17,
      minZoom: 12
    }).setView([34.023, -118.286130], 15);


    var NumberMarker = L.Circle.extend({

    });

    var intersectionIcon = L.divIcon();
    _.each(intersections, function(intersection) {
      //lonlat to latlon
      var coordinates = _.clone(intersection.geometry.coordinates).reverse();

      var injuries = intersection.properties.BICINJ_sum;
      var markerHtml = "<div class='intersection-collision-marker-label'>" + injuries + "</div>";

      var className = 'intersection-collision-marker';
      if ( injuries > 9 ) {
        var iconWidth = 30;
        var className = className + " intersection-collision-marker-large";
      } else {
        var iconWidth = 23
      }
      var icon = new L.DivIcon({ className: className,
                                 html: markerHtml,
                                 iconSize: [iconWidth, iconWidth]});

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
