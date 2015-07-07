require 'rails_helper'

RSpec.describe 'Api::V1::Incidents', type: :request do
  before do
    Incident.create!(location: PointBuilder.build(lat: 1.1, lon: 2.2),
                    switrs_case_id: 'foo',
                    occurred_at: Time.now,
                    bicycle_collision: true,
                    pedestrian_collision: false,
                    killed_count: 1,
                    injured_count: 2)

    Incident.create!(location: PointBuilder.build(lat: 3.3, lon: 4.4),
                    switrs_case_id: 'bar',
                    occurred_at: Time.now,
                    bicycle_collision: false,
                    pedestrian_collision: true,
                    killed_count: 2,
                    injured_count: 3)
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
