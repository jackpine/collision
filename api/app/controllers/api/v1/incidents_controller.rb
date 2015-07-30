class Api::V1::IncidentsController < Api::BaseController
  def index
    @incidents = Incident.order('occurred_at DESC').limit(2000).where(bicycle_collision: true)

    if params[:bbox]
      bbox_params = sanitize_bbox_params(params[:bbox])
      @incidents = @incidents.bounded_by(bbox_params)
    end

    respond_to do |format|
      format.json
    end
  end

  def counts
    @incident_counts = Incident.where(bicycle_collision: true).counts_by_year

    if params[:bbox]
      bbox_params = sanitize_bbox_params(params[:bbox])
      @incident_counts = @incident_counts.bounded_by(bbox_params)
    end

    respond_to do |format|
      format.json
    end
  end

  private
  def sanitize_bbox_params(param)
    bbox_params = param.split(',').map {|v| v.to_f }
    if bbox_params.length != 4
      respond_to do |format|
        format.json { render json: { error: "bbox param is formatted incorrectly" }, status: :bad_request }
      end
    end
    bbox_params
  end

end
