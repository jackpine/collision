require 'rails_helper'

RSpec.describe SwitrsCase, type: :model do
  let(:switrs_case) { FactoryGirl.build(:switrs_case) }

  describe '#as_incident_attributes' do
    subject { switrs_case.as_incident_attributes }

    it 'should have attributes appropriate for building an incident' do
      expected_location = RGeo::Geographic.spherical_factory(srid: 4326).point(-122.238153136, 37.76977539100005)
      location = subject.delete(:location)
      expect(location.distance(expected_location)).to eq(0)

      expect(subject).to eq({
        switrs_case_id: '0047525',
        occurred_at: Time.parse('2003-01-09 05:25 PST'),
        bicycle_collision: false,
        pedestrian_collision: false,
        killed_count: 0,
        injured_count: 2,
      })
    end
  end

  describe '#date_time' do
    it 'parses in pacific time'
    it 'accounts for DST'
  end
end
