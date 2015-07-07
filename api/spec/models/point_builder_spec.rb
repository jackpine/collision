require 'rails_helper'

RSpec.describe PointBuilder, type: :model do
  describe '.build' do
    subject { PointBuilder.build(lat: 1.0, lon: -2.0) }
    it 'builds a point' do
      expect(subject).to eq(RGeo::Geographic.spherical_factory(srid: 4326).point(-2.0, 1.0))
    end
  end
end

