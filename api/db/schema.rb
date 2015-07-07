# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150706223230) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "postgis"

  create_table "collisions03to12", primary_key: "gid", force: :cascade do |t|
    t.string   "caseid",     limit: 7
    t.decimal  "point_x"
    t.float    "point_y"
    t.integer  "year_",      limit: 2
    t.string   "location",   limit: 4
    t.string   "chptype",    limit: 1
    t.string   "dayweek",    limit: 1
    t.string   "crashsev",   limit: 1
    t.string   "violcat",    limit: 2
    t.integer  "killed",     limit: 2
    t.integer  "injured",    limit: 2
    t.string   "weather1",   limit: 1
    t.string   "pedcol",     limit: 1
    t.string   "biccol",     limit: 1
    t.string   "mccol",      limit: 1
    t.string   "truckcol",   limit: 1
    t.string   "etoh",       limit: 1
    t.integer  "timecat",    limit: 2
    t.integer  "month_",     limit: 2
    t.string   "crashtyp",   limit: 1
    t.string   "involve",    limit: 1
    t.string   "ped",        limit: 1
    t.string   "primaryrd",  limit: 38
    t.string   "secondrd",   limit: 43
    t.integer  "distance"
    t.string   "direct",     limit: 1
    t.string   "intersect_", limit: 1
    t.string   "procdate",   limit: 19
    t.integer  "juris",      limit: 2
    t.string   "date_",      limit: 19
    t.integer  "time_",      limit: 2
    t.string   "badge",      limit: 8
    t.string   "juridist",   limit: 5
    t.string   "shift",      limit: 1
    t.string   "pop",        limit: 1
    t.string   "special",    limit: 1
    t.string   "beattype",   limit: 1
    t.string   "lapddiv",    limit: 1
    t.string   "beatclas",   limit: 1
    t.string   "beatnumb",   limit: 6
    t.string   "weather2",   limit: 1
    t.string   "statehw",    limit: 1
    t.string   "caltranc",   limit: 3
    t.integer  "caltrand",   limit: 2
    t.integer  "stroute",    limit: 2
    t.string   "routesuf",   limit: 1
    t.string   "postpre",    limit: 1
    t.float    "postmile"
    t.string   "locatype",   limit: 1
    t.string   "ramp",       limit: 1
    t.string   "sidehw",     limit: 1
    t.string   "towaway",    limit: 1
    t.integer  "parties",    limit: 2
    t.string   "pcf",        limit: 1
    t.string   "violcode",   limit: 1
    t.integer  "viol"
    t.string   "violsub",    limit: 1
    t.string   "hitrun",     limit: 1
    t.string   "roadsurf",   limit: 1
    t.string   "rdcond1",    limit: 1
    t.string   "rdcond2",    limit: 1
    t.string   "lighting",   limit: 1
    t.string   "rightway",   limit: 1
    t.string   "chprdtyp",   limit: 1
    t.string   "notpriv",    limit: 1
    t.string   "stfault",    limit: 1
    t.string   "chpfault",   limit: 2
    t.integer  "sevinj",     limit: 2
    t.integer  "otherinj",   limit: 2
    t.integer  "cop",        limit: 2
    t.integer  "pedkill",    limit: 2
    t.integer  "pedinj",     limit: 2
    t.integer  "bickill",    limit: 2
    t.integer  "bicinj",     limit: 2
    t.integer  "mckill",     limit: 2
    t.integer  "mcinjure",   limit: 2
    t.string   "ramp1",      limit: 2
    t.string   "ramp2",      limit: 2
    t.string   "city",       limit: 22
    t.string   "county",     limit: 15
    t.string   "state",      limit: 2
    t.float    "x_chp"
    t.float    "y_chp"
    t.geometry "geom",       limit: {:srid=>0, :type=>"point"}
  end

  create_table "incidents", force: :cascade do |t|
    t.string   "switrs_case_id",                                             null: false
    t.geometry "location",             limit: {:srid=>4326, :type=>"point"}, null: false
    t.datetime "occurred_at",                                                null: false
    t.boolean  "bicycle_collision",                                          null: false
    t.boolean  "pedestrian_collision",                                       null: false
    t.integer  "killed_count",                                               null: false
    t.integer  "injured_count",                                              null: false
    t.datetime "created_at",                                                 null: false
    t.datetime "updated_at",                                                 null: false
  end

  add_index "incidents", ["location"], name: "index_incidents_on_location", using: :btree
  add_index "incidents", ["occurred_at"], name: "index_incidents_on_occurred_at", using: :btree
  add_index "incidents", ["switrs_case_id"], name: "index_incidents_on_switrs_case_id", unique: true, using: :btree

end
