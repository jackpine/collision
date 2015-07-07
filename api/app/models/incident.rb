class Incident < ActiveRecord::Base
  validates_presence_of :switrs_case_id, :occurred_at, :killed_count, :injured_count
  validates_inclusion_of :bicycle_collision, :pedestrian_collision, in: [true, false], message: 'must be true or false'

  scope :random_sampling, ->(limit) { order("RANDOM()").limit(limit) }
end
