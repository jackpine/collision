---
published: true
category: blog
layout: blog
summary: We're providing Los Angeles collision data through 2014, but where does this data come from, and how do you use it?
---

Here are our updated shapefiles for collisions in Los Angeles through
2014.

* [<i class="fa fa-file"></i> lacity_switrs_2003-2014.zip](https://s3-us-west-1.amazonaws.com/collision-la/data/2015-10-15-2014-collision-data/lacity_switrs_2003-2014.zip) contains all reported collisions in LA, 2003-2014
* [<i class="fa fa-file"></i> lacity_switrs_bike_ped_2003-2014.zip](https://s3-us-west-1.amazonaws.com/collision-la/data/2015-10-15-2014-collision-data/lacity_switrs_bike_ped_2003-2014.zip) contains all reported collisions in LA involving pedestrians or cyclists, 2003-2014

The source data for these shapefiles came from
[@RoadSafeGIS](https://twitter.com/RoadSafeGIS) who generously compiled
the most recently available [SWITRS data for the city of Los
Angeles](http://www.roadsafegis.com/blog/city-of-los-angeles-geocoded-switrs-data-free-download/)
into Esri's FileGDB format. Thanks to
[@VisionZeroLA](https://twitter.com/VisionZeroLA) for pointing us to
it!

## Processing We Did

The transformation is a one step script [available on
github](https://github.com/jackpine/collision/blob/master/data/SWITRS_ROADSAFE/bin/process).
If you really want to see what we did, look there.

Using that script we transformed the RoadSafe data into shapefiles. As
well as being larger and slower than Esri FileGDB, shapefiles are a
legacy format that boast a 10 character limit on your attribute column
names.  For example 'BICYCLE_ACCIDENT' is truncated to the impenetrable
'BICYCLE_AC'. Rather than invent our own short names, we used the
headers from the [TIMS project](http://tims.berkeley.edu/).

So why would we choose to use this terribly crusty out-of-date format?
Well, for one, FileGDB is 10 times slower while using,
[QGIS](https://qgis.org) (my desktop GIS of choice). I suspect, but
cannot confirm, that if you are using ESRI ArcGIS that there would be no
upside to using these shapefiles over the ESRI FileGDB format, and you'd
best use the upstream data sources straight from [RoadSafe
GIS](http://www.roadsafegis.com/blog/city-of-los-angeles-geocoded-switrs-data-free-download/).

We also projected the dataset to EPSG:2229 (California Zone 5), a common
projection for Southern California which allows us to easily interact
with the data using US feet instead of degrees.

[Let us know](mailto:info@jackpine.me) if you see any errors with or
have any questions about this data.

