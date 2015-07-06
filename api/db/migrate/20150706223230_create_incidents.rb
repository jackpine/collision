class CreateIncidents < ActiveRecord::Migration
  def change
    create_table :incidents do |t|
      t.string :switrs_case_id, null: false, index: { unique: true }
      t.st_point :location, srid: 4326, null: false, index: true
      t.datetime :occurred_at, null: false, index: true

      t.boolean :bicycle_collision, null: false
      t.boolean :pedestrian_collision, null: false
      t.integer :killed_count, null: false
      t.integer :injured_count, null: false

      t.timestamps null: false
    end
  end
end
