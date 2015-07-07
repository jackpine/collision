class Api::V1::IncidentsController < Api::BaseController
  def index
    @incidents = Incident.last(50000)
    respond_to do |format|
      format.json
    end
  end
end
