require 'rails_helper'

RSpec.describe SwitrsCase, type: :model do
  let(:switrs_case) { FactoryGirl.build(:switrs_case) }

  describe '#as_incident_attributes' do
    subject { switrs_case.as_incident_attributes }

    it 'should have attributes appropriate for building an incident' do
      expected_location = RGeo::Geographic.spherical_factory(srid: 4326).point(-122.238153136, 37.76977539100005)
      location = subject.delete(:location)
      expect(location.distance(expected_location)).to eq(0)

      expect(subject).to eq({})
    end
  end
end
