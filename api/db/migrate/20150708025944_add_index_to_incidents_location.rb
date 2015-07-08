class AddIndexToIncidentsLocation < ActiveRecord::Migration
  def up
    remove_index "incidents", "location"
    add_index "incidents", "location", using: :gist
  end

  def down
    remove_index "incidents", "location"
    add_index "incidents", "location"
  end
end
