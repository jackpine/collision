json.incidents @incidents.map {|incident|  { location: RGeo::GeoJSON.encode(incident.location) } }
