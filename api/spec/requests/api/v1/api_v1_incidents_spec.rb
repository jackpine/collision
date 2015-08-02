require 'rails_helper'

RSpec.describe 'Api::V1::Incidents', type: :request do
  before do
    FactoryGirl.create(:incident, location: PointBuilder.build(lat: 1.1, lon: 2.2),
                                  occurred_at: 1.days.ago,
                                  bicycle_collision: true)

    FactoryGirl.create(:incident, location: PointBuilder.build(lat: 3.3, lon: 4.4),
                                  occurred_at: 2.days.ago,
                                  bicycle_collision: true)

    FactoryGirl.create(:incident, location: PointBuilder.build(lat: 5.5, lon: 6.6),
                                  occurred_at: 3.days.ago,
                                  bicycle_collision: false)
  end

  describe 'GET /api/v1/incidents' do
    it 'returns some incidents' do
      get api_v1_incidents_path
      expect(response).to have_http_status(200)
      expected_response = JSON.parse({
        incidents: [
          {
            location: {
              type: 'Point',
              coordinates: [2.2, 1.1],
            }
          },
          {
            location: {
              type: 'Point',
              coordinates: [4.4, 3.3],
            }
          }
        ]
      }.to_json)
      expect(JSON.parse(response.body)).to eq(expected_response)
    end
  end
end
