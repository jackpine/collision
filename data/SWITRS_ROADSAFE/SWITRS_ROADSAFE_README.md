@VizionZeroLA made me aware of this. Apparently "fixing" some of the
geocoding you see in the TIMS and it's more up to date. It includes just
the LA area.

http://www.roadsafegis.com/blog/city-of-los-angeles-geocoded-switrs-data-free-download/

They seem to be regularly updating it.

Processing
----------

The RoadSafe SWITRS data is using the Esri FILEGDB format for the data.
This is not readily editable in QGIS. It's possible to install some
extra software to get it to be writable, but in my experience using the
Esri GDB API was 10x slower than working with a shapefile.

Converting to a shapefile incurs limitations on header names. For
example 'BICYCLE_ACCIDENT' is trunated to 'BICYCLE_AC'. Rather than
picking my own names, I opted to use the TIMS headers.

The dataset was projected to EPSG:2229 (California Zone 5)
