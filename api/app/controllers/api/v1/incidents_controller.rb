class Api::V1::IncidentsController < Api::BaseController
  def index
    @incidents = Incident.random_sampling(1000)
    respond_to do |format|
      format.json
    end
  end
end
