# Interfaces with SWITRS schema to bring it into a more ergonomic format
class SwitrsCase < ActiveRecord::Base
  self.table_name = :collisions03to12

  def as_incident_attributes
    {
      location: RGeo::Geographic.spherical_factory(srid: 4326).point(self.point_x, self.point_y)
    }
  end
end
