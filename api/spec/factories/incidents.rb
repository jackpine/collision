FactoryGirl.define do
  factory :incident do
    location PointBuilder.build(lat: 1.1, lon: 2.2)
    sequence(:switrs_case_id) { |i| "case-#{i}" }
    occurred_at Time.now
    bicycle_collision true
    pedestrian_collision false
    killed_count 1
    injured_count 2
  end
end
