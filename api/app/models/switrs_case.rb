# Interfaces with SWITRS schema to bring it into a more ergonomic format
class SwitrsCase < ActiveRecord::Base
  self.table_name = :collisions03to12

  def date_time
    time = sprintf("%04d", self.time_).insert(2, ':')
    date = Date.parse(self.date_).to_s

    date_time = nil
    Time.use_zone('Pacific Time (US & Canada)') do
      zone = Time.zone.parse(date).dst? ? "PDT" : "PST"
      date_time = Time.parse("#{date} #{time} #{zone}") 
    end
  end

  def as_incident_attributes
    {
      switrs_case_id: self.caseid,
      location: RGeo::Geographic.spherical_factory(srid: 4326).point(self.point_x, self.point_y),
      occurred_at: self.date_time,
      bicycle_collision: self.biccol == 'Y',
      pedestrian_collision: self.pedcol == 'Y',
      killed_count: self.killed,
      injured_count: self.injured
    }
  end
end
