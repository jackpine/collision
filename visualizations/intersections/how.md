Goal
----

Find the most dangerous intersections for cyclists in Los Angeles.

Data Sources
------------

Get circulation file (streets data)
Get collision data from TIMS

Process
-------

Using QGIS, we turned the circulation file, which is essentially a bunch of
lines, into a bunch of intersections (points). (Menu:Vector > Analysis > Line
Intersections). You want to intersect the circulation layer with itself,
leaving the OBJECTID as the unique identifier.

Note: This will take a while.

These are pretty large data sets, so some of the operations can be
really slow. To speed things up while we perfected our process, we
cropped out everything except a small neighborhood within LA. Once we
had our process down, we ran through it again on the entire data set.

Now, because our intersections are points, we need to calculate a small
buffer that represents the "size" of the intersection around each point.
To simplify analysis, we assume that all collisions within 30 feet of
the intersection should be considered.

Create a new buffer (Menu: Vector > GeoProcessing Tools > Buffer).
Select your new intersections layer as the input vector layer, and set
buffer distance to 30. Save your output shapefile as "intersection
buffers".

Now, we want to count all the collisions that occured within each one of
these buffers. Using the QGI Points in Polygon feature,
(Menu: Vector > Analysis > Points in Polygon) we counted the number of
collisions within our intersection buffer layer. Inspect the attributes
table for the new layer, sort by count, and *viola*. LA's most dangerous
intersections.

