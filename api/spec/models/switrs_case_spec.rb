require 'rails_helper'

RSpec.describe SwitrsCase, type: :model do
  # copy/pasted from SwitrsCase.first.attributes after loading SWITRS dataset via shp2pgsql
  let(:switrs_case) { SwitrsCase.new({
    "gid"=>1,
    "caseid"=>"0047525", # strange but true that shp2pgsql decided _x was a BD, while _y was a float. 
    "point_x"=> BigDecimal.new("-122.238153136"),
    "point_y"=>37.7698,
    "year_"=>2003,
    "location"=>"0101",
    "chptype"=>"0",
    "dayweek"=>"4",
    "crashsev"=>"4",
    "violcat"=>"09",
    "killed"=>0,
    "injured"=>2,
    "weather1"=>"B",
    "pedcol"=>nil,
    "biccol"=>nil,
    "mccol"=>nil,
    "truckcol"=>nil,
    "etoh"=>nil,
    "timecat"=>600,
    "month_"=>1,
    "crashtyp"=>"D",
    "involve"=>"C",
    "ped"=>"A",
    "primaryrd"=>"PARK ST",
    "secondrd"=>"CLEMENT AV",
    "distance"=>0,
    "direct"=>nil,
    "intersect_"=>"Y",
    "procdate"=>"2003-04-21 00:00:00",
    "juris"=>101,
    "date_"=>"2003-01-09 00:00:00",
    "time_"=>525,
    "badge"=>"51",
    "juridist"=>nil,
    "shift"=>"5",
    "pop"=>"5",
    "special"=>"0",
    "beattype"=>"0",
    "lapddiv"=>nil,
    "beatclas"=>"0",
    "beatnumb"=>nil,
    "weather2"=>"-",
    "statehw"=>"N",
    "caltranc"=>nil,
    "caltrand"=>0,
    "stroute"=>0,
    "routesuf"=>nil,
    "postpre"=>nil,
    "postmile"=>0.0,
    "locatype"=>nil,
    "ramp"=>nil,
    "sidehw"=>nil,
    "towaway"=>"Y",
    "parties"=>2,
    "pcf"=>"A",
    "violcode"=>"-",
    "viol"=>21801,
    "violsub"=>"A",
    "hitrun"=>"N",
    "roadsurf"=>"A",
    "rdcond1"=>"H",
    "rdcond2"=>"-",
    "lighting"=>"C",
    "rightway"=>"A",
    "chprdtyp"=>"0",
    "notpriv"=>"Y",
    "stfault"=>"D",
    "chpfault"=>nil,
    "sevinj"=>0,
    "otherinj"=>0,
    "cop"=>2,
    "pedkill"=>0,
    "pedinj"=>0,
    "bickill"=>0,
    "bicinj"=>0,
    "mckill"=>0,
    "mcinjure"=>0,
    "ramp1"=>"-",
    "ramp2"=>"-",
    "city"=>"ALAMEDA",
    "county"=>"ALAMEDA",
    "state"=>"CA",
    "x_chp"=>0.0,
    "y_chp"=>0.0,
    #This isn't quite right, the actual record returns a PointImpl like this, but I'm not sure how to build one:
    # "geom"=> '#<RGeo::Cartesian::PointImpl:0x3fc358b29e94 "POINT (-122.238153136 37.76977539100005)">'
    "geom"=> RGeo::Geographic.spherical_factory(srid: 4326).point(-122.238153136, 37.76977539100005)
  })}

  describe '#as_incident_attributes' do
    subject { switrs_case.as_incident_attributes }

    it 'should have attributes appropriate for building an incident' do
      expected_location = RGeo::Geographic.spherical_factory(srid: 4326).point(-122.238153136, 37.76977539100005)
      location = subject.delete(:location)
      # not sure what the units are here... but there is some small error
      expect( location.distance(expected_location) < 5 ).to be true

      expect(subject).to eq({})
    end
  end
end
