---
published: true
category: blog
layout: blog
title: "Data Drop: New LACBC Bike Counts"
thumbnail: "/media/2015-11-3-LACBC-bike-count-data/bike_count_header.jpg"
summary: LACBC is just finishing up their latest bike counts. We're providing some ready-to-go shapefile data of their results, plus all the previous bike counts from the UCLA Bicycle Data Clearinghouse.
content_class: bike-count-article
---

The [Los Angeles County Bicycle Coalition](http://la-bike.org) just
[finished their 2015 bicycle
count](http://la-bike.org/events/los-angeles-bike-ped-count-2015).
Here's an overview of the sampling sites and the total cyclists counted
over time.

<script src='https://api.tiles.mapbox.com/mapbox.js/v2.2.1/mapbox.js'></script>
<link href='https://api.tiles.mapbox.com/mapbox.js/v2.2.1/mapbox.css' rel='stylesheet' />
<script src="/js/config.js"></script>
<script src="/js/bike_count_map.js"></script>
<script src="/bower_components/seiyria-bootstrap-slider/js/bootstrap-slider.js"></script>
<script src="/bower_components/moment/min/moment.min.js"></script>
<link href='/bower_components/seiyria-bootstrap-slider/css/bootstrap-slider.css' rel='stylesheet' />
<div class='article-splash'>
  <div id='map'>
  </div>
  <div class='article-caption'>
    <input class="slider" />
    Total bikes counted over 15 minute intervals. White dots represent
    no bicycles seen in the 15 minute interval.
    <br />
    The <a
    href="#bike-count-shapefiles">full datasets</a> below have many more
    useful attributes, including the direction of travel, does the rider
    appear to be female, were they riding on the sidewalk.
  </div>
</div>
<script>
  $(function(){
    var application = new BikeCountMap($("#map"));
  });
</script>

As usual they have published their data via UCLA's [Bicycle Data
Clearinghouse](http://www.bikecounts.luskin.ucla.edu). You can find the
raw 2015 counts there, as well as prior counts done by LACBC and other
groups.

The clearinghouse does not offer shapefiles, only csv's,
which separate the location data from the count data. So, after a bit of
[processing](#processing), we're providing them here.

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
     surrounding area after and including 2013, plus additional rider attributes.
   * [<i class="fa fa-file"></i> locations.csv](https://s3-us-west-1.amazonaws.com/collision-la/data/2015-11-3-LACBC-bike-count-data/locations.csv)
     * Translates location id to actual latitude/longitude and other location data, to be joined with the
     interval data.

See [here for the
code](https://github.com/jackpine/collision/tree/master/visualizations/bike_count/bin)
used to join the count numbers with their location.

Got plans for this data? Go wild! But I'd <a
href="mailto:michael@jackpine.me">love to know</a> what you're doing
with it.

