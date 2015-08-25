---
published: true
category: blog
layout: blog
thumbnail: "/media/LA Collision Heatmap.jpg"
summary: A navigable heatmap of collisions in California that involved cyclists.
---
<script src='https://api.tiles.mapbox.com/mapbox.js/v2.2.1/mapbox.js'></script>
<link href='https://api.tiles.mapbox.com/mapbox.js/v2.2.1/mapbox.css' rel='stylesheet' />
<script src='https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-heat/v0.1.3/leaflet-heat.js'></script>

<script src="/bower_components/lodash/lodash.min.js"></script>
<script src="/bower_components/jquery/dist/jquery.min.js"></script>
<script src="/bower_components/Chart.js/Chart.js"></script>
<script src="/js/analytics.js"></script>
<script src="/js/heat_map.js"></script>
<script src="/js/collision_timeline.js"></script>
<script src="/js/application.js"></script>

<div class='article-splash'>

  <div id='map'>
    <div id='timeline'>
      <canvas id='line-chart' width="400" height="200"></canvas>
    </div>
  </div>
</div>

This is a map of auto collisions in California that involved cyclists. This data
was obtained from the [SWITRS](http://iswitrs.chp.ca.gov/Reports/jsp/userLogin.jsp)
database coordinated by the California Highway Patrol by way of the excellent
[TIMS](http://tims.berkeley.edu) project.

<script>
  $(function(){
    var application = new Application();
  });
</script>
