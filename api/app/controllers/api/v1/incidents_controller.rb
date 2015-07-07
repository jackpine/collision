class Api::V1::IncidentsController < Api::BaseController
  def index
    render json: {
      incidents: [
        {
          location: {
            type: 'Point',
            coordinates: [34.0510922667, -118.2509316333],
          }
        },
        {
          location: {
            type: 'Point',
            coordinates: [34.0510819833, -118.2503903167],
          }
        },
        {
          location: {
            type: 'Point',
            coordinates: [34.0510881833, -118.2505004833],
          }
        },
        {
          location: {
            type: 'Point',
            coordinates: [34.0511946833, -118.2503655333],
          }
        },
        {
          location: {
            type: 'Point',
            coordinates: [34.0509458667, -118.2504051333],
          }
        },
        {
          location: {
            type: 'Point',
            coordinates: [34.0508292333, -118.2504374833],
          }
        },
        {
          location: {
            type: 'Point',
            coordinates: [34.0525816, -118.2508798667],
          }
        }
      ]
    }
  end
end
