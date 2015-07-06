require 'rails_helper'

RSpec.describe "Api::V1::Incidents", type: :request do
  describe "GET /api_v1_incidents" do
    it "works! (now write some real specs)" do
      get api_v1_incidents_path
      expect(response).to have_http_status(200)
    end
  end
end
