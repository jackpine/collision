import os
import fiona
from shapely.geometry import mapping, shape, Point


# This shapefile was made by intersecting all non-bridge motorway_links with non-motorways (surface streets).
# It's imperative that we do all line/point intersections in wgs84.
# Reprojecting can cause tiny errors that will cause point intersections to
# miss.
shapefile_dir= "/Users/mkirk/src/collision/visualizations/exit_ramps/layers/"
freeway_ramps_shapefile_name='non-bridge_freeway_ramps'
freeway_ramps_shapefile_path=os.path.join(shapefile_dir, freeway_ramps_shapefile_name, freeway_ramps_shapefile_name + ".shp")

print("processing {}.".format(freeway_ramps_shapefile_name))

with fiona.drivers():
    with fiona.open(freeway_ramps_shapefile_path, 'r') as source:
        
        output_meta = source.meta.copy()
        output_meta['schema']['geometry'] = 'Point'
        with fiona.open('freeway_ramp_start_points.shp', 'w', **source.meta) as sink:
            for feature in source:
                first_point = Point(feature['geometry']['coordinates'][0])
                feature['geometry'] = mapping(first_point)
                sink.write(feature)

### This was a different attempts
## 
## # We want to separate the on-ramps from the off-ramps.
## # We can do this by determing if the ramp moves towards a surface street or away from a surface street.
## # However, some "ramp" features represent both an off and an on-ramp, e.g. when
## # the ramp is a fluid arch like I-10 and vermont in south Los Angeles.  split
## # all non-bridge freeway ramps by intersections with surface streets (some
## # single continuous ways represent both an off and an on ramp)
## off_and_on_ramps = separate_on_and_off_ramps(freeway_ramps)
## 
## # Ensures sure that all on and off ramps are separate features.
## # Note that this doesn't say which ramps are on vs. off just ensures that there
## # are no features that combine both an on and off ramp.
## def separate_on_and_off_ramps(freeway_ramps):
##     split_lines_by_points(freeway_ramps, freeway_ramp_intersections)
## 
## 
## for line in off_and_on_ramps:
##     # points are ordered in the direction of travel.
##     # The *first* point of an on-ramp will intersect with a surface street,
##     # while the *final* point of an off-ramp will intersect a surface street
##     first_point = line.points[0]
##     if intersects(first_point, surface_streets):
##         print("on ramp")
##     else:
##         #sanity check
##         last_point = line.points[-1]
##         if intersects(last_point, surface_streets):
##             print("off ramp")
##         else:
##             print("ramp doesn't being or end at surface street. Wtf?")
## 
## 
## 
