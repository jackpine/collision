---
published: true
category: blog
layout: blog
title: "Data Drop: New LACBC Bike Counts"
summary: LACBC is just finishing up their latest bike counts. We're providing some ready-to-go shapefile data of their results.
content_class: bike-count-article
---

The [Los Angeles County Bicycle Coalition](http://la-bike.org) just
[finished their 2015 bicycle
count](http://la-bike.org/events/los-angeles-bike-ped-count-2015). As
usual they have published their data via UCLA's [Bicycle Data
Clearinghouse](http://www.bikecounts.luskin.ucla.edu). You can find the
new 2015 counts there.

<script src='https://api.tiles.mapbox.com/mapbox.js/v2.2.1/mapbox.js'></script>
<link href='https://api.tiles.mapbox.com/mapbox.js/v2.2.1/mapbox.css' rel='stylesheet' />
<script src="/js/config.js"></script>
<script src="/js/bike_count_map.js"></script>
<script src="/bower_components/seiyria-bootstrap-slider/js/bootstrap-slider.js"></script>
<link href='/bower_components/seiyria-bootstrap-slider/css/bootstrap-slider.css' rel='stylesheet' />
<div class='article-splash'>
  <div id='map'>
  </div>
  <input class="slider" />
  <div class='article-caption'>
    Total bike counts over time, in 15 minute intervals. This includes
    all data sets from the last few years from the [Bicycle Data
    Clearinghouse](http://www.bikecounts.luskin.ucla.edu).  Download the
    <a href="#bike-count-shapefiles">full dataset</a> below. White dots
    represent no bicycles seen in the 15 minute interval.
  </div>
</div>
<script>
  $(function(){
    var application = new BikeCountMap($("#map"));
  });
</script>

Unfortunately the clearinghouse does not offer shapefiles, only csv's,
which separate the location data from the count data. A little bit of
[processing](#processing) to the rescue!

<a name='bike-count-shapefiles'></a>
### Bike Count Shapefiles

 * [<i class="fa fa-file"></i> counts_1994-2012.zip](https://s3-us-west-1.amazonaws.com/collision-la/data/2015-11-3-LACBC-bike-count-data/counts_1994-2012.zip)
   * Pre-2013 bicycle counts in Los Angeles and the
   surrounding area.
 * [<i class="fa fa-file"></i> counts_2013-2015.zip](https://s3-us-west-1.amazonaws.com/collision-la/data/2015-11-3-LACBC-bike-count-data/counts_2013-2015.zip)
   * 2013 and after bicycle counts. This data has more fields than the
   earlier counts, including if the cyclist appeared to be a woman, the
   road surface type, and whether the cyclist was wearing a helmet.

### Source Data

 * Downloaded from the [Bicycle Data
  Clearinghouse](http://www.bikecounts.luskin.ucla.edu)
   * [<i class="fa fa-file"></i>
   intervals_1994-2012.csv](https://s3-us-west-1.amazonaws.com/collision-la/data/2015-11-3-LACBC-bike-count-data/intervals_1994-2012.csv)
     * Count numbers and location id pre-2013 in Los Angeles and the
     surrounding area
   * [<i class="fa fa-file"></i> intervals_2013-2015.csv](https://s3-us-west-1.amazonaws.com/collision-la/data/2015-11-3-LACBC-bike-count-data/intervals_2013-2015.csv)
     * Count numbers and location id in Los Angeles and the
     surrounding area after and including 2013. This data has more fields,
     including if the cyclist appeared to be a woman, the road surface
     type, and whether the cyclist was wearing a helmet.
   * [<i class="fa fa-file"></i> locations.csv](https://s3-us-west-1.amazonaws.com/collision-la/data/2015-11-3-LACBC-bike-count-data/locations.csv)
     * Translates location id to actual latitude/longitude and other location data, to be joined with the
     interval data.

<a name="processing"></a>
## Processing

Conceptually, we just needed to join the count intervals (which
represent a chunk of time when people were counting bikes at a
particluar location) with the latitude/longitude of their count
location.

See [here for the
code](https://github.com/jackpine/collision/tree/master/visualizations/bike_count/bin)

Got plans for this data? <a href="mailto:michael@jackpine.me">Let me
know</a> what you're doing with it.

