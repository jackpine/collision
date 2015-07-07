class Incident < ActiveRecord::Base
  validates_presence_of :switrs_case_id, :occurred_at, :killed_count, :injured_count
  validates_inclusion_of :bicycle_collision, :pedestrian_collision, in: [true, false], message: 'must be true or false'

  scope :random_sampling, ->(limit) { order("RANDOM()").limit(limit) }
  scope :bounded_by, ->(bbox_params) do
    where_clause = "ST_Intersects(location, ST_MakeEnvelope(?, 4326))"
    if Incident.bbox_crosses_dateline(bbox_params)
      l_box = [bbox_params[0], bbox_params[1], 180, bbox_params[3]]
      r_box = [-180, bbox_params[1], bbox_params[2], bbox_params[3]]

      where("#{where_clause} OR #{where_clause}", l_box, r_box)

    else
      where(where_clause, bbox_params)
    end
  end

  def self.bbox_crosses_dateline(bbox_params)
    return false unless bbox_params.class == Array && bbox_params.count == 4

    lhs = bbox_params[0]
    rhs = bbox_params[2]

    lhs_in_eastern = lhs >= 0 && rhs <= 180
    rhs_in_western = rhs <= 0 && rhs >= -180

    lhs_in_eastern && rhs_in_western
  end
end
