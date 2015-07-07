class PointBuilder < ActiveRecord::Base
  def self.build(lat:, lon:)
    RGeo::Geographic.spherical_factory(srid: 4326).point(lon, lat)
  end
end
