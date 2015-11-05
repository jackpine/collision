default: build/layers/lacity_freeway_exits.shp

clean :
	rm -fr build/
	mkdir -p build/layers
	mkdir -p build/marked_as_done

DATABASE_NAME=build/layers/freeway_exit_collisions.sqlite

# Download this on your own.
OSM_PLANET_FILE = data/los-angeles_california.osm.pbf
$(OSM_PLANET_FILE) :
	echo "you've gotta get $(OSM_PLANET_FILE) on your own"
	exit 1

build/streets.osm.pbf : $(OSM_PLANET_FILE)
	osmosis --read-pbf $(OSM_PLANET_FILE) \
					--tf accept-ways highway=* \
					--tf reject-relations \
					--used-node \
					--write-pbf build/streets.osm.pbf

build/non_bridge_freeway_ramps.osm.pbf : build/streets.osm.pbf
	osmosis --read-pbf build/streets.osm.pbf \
					--tf accept-ways highway=motorway_link \
					--tf reject-ways bridge=* \
					--tf reject-relations \
					--used-node \
					--write-pbf build/non_bridge_freeway_ramps.osm.pbf

build/non_bridge_surface_streets.osm.pbf : build/streets.osm.pbf
	osmosis --read-pbf build/streets.osm.pbf \
					--tf accept-ways highway=* \
					--tf reject-ways highway=motorway,motorway_link \
					--tf reject-ways bridge=* \
					--tf reject-relations \
					--used-node \
					--write-pbf build/non_bridge_surface_streets.osm.pbf

build/marked_as_done/non_bridge_freeway_ramps : build/non_bridge_freeway_ramps.osm.pbf
	time ogr2ogr -f SQLite \
					-dsco SPATIALITE=YES \
					-overwrite \
					-skipfailures \
					-nln non_bridge_freeway_ramps \
					-sql "SELECT osm_id, name, highway, waterway FROM lines" \
					$(DATABASE_NAME) \
					build/non_bridge_freeway_ramps.osm.pbf && touch build/marked_as_done/non_bridge_freeway_ramps

build/marked_as_done/non_bridge_surface_streets : build/non_bridge_surface_streets.osm.pbf
	time ogr2ogr -f SQLite \
					-dsco SPATIALITE=YES \
					-overwrite \
					-skipfailures \
					-nln non_bridge_surface_streets \
					-sql "SELECT osm_id, name, highway, waterway FROM lines" \
					$(DATABASE_NAME) \
					build/non_bridge_surface_streets.osm.pbf && touch build/marked_as_done/non_bridge_surface_streets

build/marked_as_done/lacity_boundary : data/lacity_boundary/lacity_boundary.shp
	time ogr2ogr -f SQLite \
					-dsco SPATIALITE=YES \
					-overwrite \
					-skipfailures \
					-nln lacity_boundary \
					-t_srs EPSG:4326 \
					$(DATABASE_NAME) \
					data/lacity_boundary/lacity_boundary.shp && touch build/marked_as_done/lacity_boundary

build/marked_as_done/lacity_non_bridge_surface_streets: build/marked_as_done/lacity_boundary build/marked_as_done/non_bridge_surface_streets
	time ogr2ogr -f SQLite \
					-dsco SPATIALITE=YES \
					-overwrite \
					-nln lacity_non_bridge_surface_streets \
					-sql "SELECT ST_Intersection(S.geometry, L.geometry) AS geometry, S.* \
									FROM non_bridge_surface_streets S, lacity_boundary L \
									WHERE ST_Intersects(S.geometry, L.geometry)" \
					$(DATABASE_NAME) \
					$(DATABASE_NAME) && touch build/marked_as_done/lacity_non_bridge_surface_streets

build/marked_as_done/lacity_non_bridge_freeway_ramps : build/marked_as_done/lacity_boundary build/marked_as_done/non_bridge_freeway_ramps
	time ogr2ogr -f SQLite \
					-dsco SPATIALITE=YES \
					-overwrite \
					-nln lacity_non_bridge_freeway_ramps \
					-sql "SELECT ST_Intersection(S.geometry, L.geometry) AS geometry, S.* \
									FROM non_bridge_freeway_ramps S, lacity_boundary L \
									WHERE ST_Intersects(S.geometry, L.geometry)" \
					$(DATABASE_NAME) \
					$(DATABASE_NAME) && touch build/marked_as_done/lacity_non_bridge_freeway_ramps

build/marked_as_done/lacity_freeway_ramp_intersections : build/marked_as_done/lacity_non_bridge_surface_streets \
																											  build/marked_as_done/lacity_non_bridge_freeway_ramps
	time ogr2ogr -f SQLite \
							-dsco SPATIALITE=YES \
							-overwrite \
							-nln lacity_freeway_ramp_intersections \
							-sql "SELECT ST_Intersection(S.geometry, R.geometry) AS geometry, S.*, R.* \
									FROM lacity_non_bridge_surface_streets S, lacity_non_bridge_freeway_ramps R \
									WHERE ST_Intersects(S.geometry, R.geometry)" \
							$(DATABASE_NAME) \
							$(DATABASE_NAME) && touch build/marked_as_done/lacity_freeway_ramp_intersections

build/layers/lacity_non_bridge_freeway_ramps.shp : build/marked_as_done/lacity_non_bridge_freeway_ramps
	time ogr2ogr -f "ESRI Shapefile" \
							-overwrite \
							$(DATABASE_NAME) \
							$(DATABASE_NAME) && touch build/marked_as_done/lacity_freeway_ramp_intersections

build/layers/lacity_freeway_ramp_start_points.shp : build/layers/lacity_non_bridge_freeway_ramps.shp
	bin/endpoint-of-lines --first -i build/layers/lacity_non_bridge_freeway_ramps.shp -o build/layers/lacity_freeway_ramp_start_points.shp

build/layers/lacity_freeway_ramp_end_points.shp : build/layers/lacity_non_bridge_freeway_ramps.shp
	bin/endpoint-of-lines --last -i build/layers/lacity_non_bridge_freeway_ramps.shp -o build/layers/lacity_freeway_ramp_end_points.shp

# The direction of traffic in oneway streets in OSM flows from the first to the last node
# By getting all intersections which are *not* the first node in a freeway ramp, we are sure
# we only get intersections receiving exiting traffic.
build/layers/lacity_freeway_exits.shp : build/layers/lacity_freeway_ramp_intersections.shp build/layers/lacity_freeway_ramp_end_points.shp
	ogr2ogr -sql "SELECT ST_Intersection(I.geometry, P.geometry) as geometry, I.* \
									FROM lacity_freeway_ramp_intersections I, lacity_freeway_ramp_end_points P \
									WHERE ST_Intersection(I.geometry, P.geometry)" \
					-dialect SQLITE build/layers build/layers \
					-overwrite \
					-skipfailures \
					-nln lacity_freeway_exits

.PHONY: default clean
