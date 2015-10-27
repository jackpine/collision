default : clean all

build :
	mkdir -p build

clean :
	rm -fr build/*

all : build/layers/non-bridge_freeway_ramps/non-bridge_freeway_ramps.shp

OSM_PLANET_FILE = data/los-angeles_california.osm.pbf
build/streets.osm.pbf : build
	osmosis --read-pbf $(OSM_PLANET_FILE) \
					--tf accept-ways highway=* \
					--tf reject-relations \
					--used-node \
					--write-pbf build/streets.osm.pbf

build/non-bridge_freeway_ramps.osm.pbf  : build build/streets.osm.pbf
	osmosis --read-pbf build/streets.osm.pbf \
					--tf accept-ways highway=motorway_link \
					--tf reject-ways bridge=* \
					--tf reject-relations \
					--used-node \
					--write-pbf build/non-bridge_freeway_ramps.osm.pbf

build/non-bridge_surface_streets.osm.pbf  : build build/streets.osm.pbf
	osmosis --read-pbf build/streets.osm.pbf \
					--tf accept-ways highway=* \
					--tf reject-ways highway=motorway,motorway_link \
					--tf reject-ways bridge=* \
					--tf reject-relations \
					--used-node \
					--write-pbf build/non-bridge_surface_streets.osm.pbf

build/layers/non-bridge_freeway_ramps/non-bridge_freeway_ramps.shp  : build/non-bridge_freeway_ramps.osm.pbf
	mkdir -p "build/layers/non-bridge_freeway_ramps"
	ogr2ogr build/layers/non-bridge_freeway_ramps/non-bridge_freeway_ramps.shp \
					build/non-bridge_freeway_ramps.osm.pbf  \
					-sql "SELECT osm_id, name, highway, waterway FROM lines" \
					-overwrite \
					-skipfailures

.PHONY: all clean
