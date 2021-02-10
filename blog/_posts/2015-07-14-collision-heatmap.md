---
published: true
category: blog
layout: blog
thumbnail: "/media/LA Collision Heatmap.jpg"
summary: A navigable heatmap of collisions in California that involved cyclists.
content_class: heat-map-article
---
<script src='https://api.mapbox.com/mapbox.js/v3.3.1/mapbox.js'></script>
<link href='https://api.mapbox.com/mapbox.js/v3.3.1/mapbox.css' rel='stylesheet' />

<script src='https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-heat/v0.1.3/leaflet-heat.js'></script>

<script src="/node_modules/Chart.js/Chart.js"></script>
<script src="/js/heat_map.js"></script>
<script src="/js/collision_timeline.js"></script>
<script src="/js/config.js"></script>
<script src="/js/heat_map_application.js"></script>

<div class='article-splash'>
  <div id='map'>
    <div id='timeline'>
    </div>
  </div>
</div>

This is a map of auto collisions in California that involved cyclists. This data
was obtained from the [SWITRS](http://iswitrs.chp.ca.gov/Reports/jsp/userLogin.jsp)
database coordinated by the California Highway Patrol by way of the excellent
[TIMS](http://tims.berkeley.edu) project.

<script>
  $(function(){
    var application = new HeatMapApplication($('#timeline'));
  });
</script>
