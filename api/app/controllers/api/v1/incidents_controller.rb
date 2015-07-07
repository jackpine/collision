class Api::V1::IncidentsController < Api::BaseController
  def index
    @incidents = Incident.all
    respond_to do |format|
      format.json
    end
  end
end
