default : all

build :
	mkdir -p build

build/layers :
	mkdir -p build/layers

clean :
	rm -fr build/*

all : build/layers/freeway_ramp_intersections.shp

# Download this on your own.
OSM_PLANET_FILE = data/los-angeles_california.osm.pbf
$(OSM_PLANET_FILE) :
	echo "you've gotta get $(OSM_PLANET_FILE) on your own"
	exit 1

build/streets.osm.pbf : build $(OSM_PLANET_FILE)
	osmosis --read-pbf $(OSM_PLANET_FILE) \
					--tf accept-ways highway=* \
					--tf reject-relations \
					--used-node \
					--write-pbf build/streets.osm.pbf

build/non_bridge_freeway_ramps.osm.pbf : build build/streets.osm.pbf
	osmosis --read-pbf build/streets.osm.pbf \
					--tf accept-ways highway=motorway_link \
					--tf reject-ways bridge=* \
					--tf reject-relations \
					--used-node \
					--write-pbf build/non_bridge_freeway_ramps.osm.pbf

build/non_bridge_surface_streets.osm.pbf : build build/streets.osm.pbf
	osmosis --read-pbf build/streets.osm.pbf \
					--tf accept-ways highway=* \
					--tf reject-ways highway=motorway,motorway_link \
					--tf reject-ways bridge=* \
					--tf reject-relations \
					--used-node \
					--write-pbf build/non_bridge_surface_streets.osm.pbf

build/layers/non_bridge_freeway_ramps.shp : build/non_bridge_freeway_ramps.osm.pbf
	mkdir -p "build/layers"
	ogr2ogr build/layers/non_bridge_freeway_ramps.shp \
					build/non_bridge_freeway_ramps.osm.pbf  \
					-sql "SELECT osm_id, name, highway, waterway FROM lines" \
					-overwrite \
					-skipfailures

build/layers/non_bridge_surface_streets.shp : build/non_bridge_surface_streets.osm.pbf
	mkdir -p "build/layers"
	ogr2ogr build/layers/non_bridge_surface_streets.shp \
					build/non_bridge_surface_streets.osm.pbf  \
					-sql "SELECT osm_id, name, highway, waterway FROM lines" \
					-overwrite \
					-skipfailures

build/layers/lacity_boundary.shp : build/layers data/lacity_boundary
	ogr2ogr -t_srs EPSG:4326 -skipfailures \
					build/layers/lacity_boundary.shp \
					data/lacity_boundary/lacity_boundary.shp

build/layers/lacity_non_bridge_surface_streets.shp : build/layers/lacity_boundary.shp build/layers/non_bridge_surface_streets.shp
	ogr2ogr -sql "SELECT ST_Intersection(S.geometry, L.geometry) AS geometry, S.* \
									FROM non_bridge_surface_streets S, lacity_boundary L \
									WHERE ST_Intersects(S.geometry, L.geometry)" \
					-dialect SQLITE build/layers build/layers \
					-overwrite \
					-nln lacity_non_bridge_surface_streets

build/layers/lacity_non_bridge_freeway_ramps.shp : build/layers/lacity_boundary.shp build/layers/non_bridge_freeway_ramps.shp
	ogr2ogr -sql "SELECT ST_Intersection(S.geometry, L.geometry) AS geometry, S.* \
									FROM non_bridge_freeway_ramps S, lacity_boundary L \
									WHERE ST_Intersects(S.geometry, L.geometry)" \
					-dialect SQLITE build/layers build/layers \
					-overwrite \
					-nln lacity_non_bridge_freeway_ramps

build/layers/freeway_ramp_intersections.shp : build/layers/non_bridge_surface_streets.shp \
	ogr2ogr -sql "SELECT ST_Intersection(S.geometry, R.geometry) AS geometry, S.*, R.* \
									FROM non_bridge_surface_streets S, non_bridge_freeway_ramps R \
									WHERE ST_Intersects(S.geometry, R.geometry)" \
					-dialect SQLITE build/layers data/layers \
					-overwrite \
					-nln freeway_ramp_intersections

.PHONY: all clean
