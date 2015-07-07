require 'rails_helper'

RSpec.describe SwitrsImporter, type: :model do
  let(:switrs_case) { FactoryGirl.build(:switrs_case) }
  describe '.import_case' do
    it 'creates a new incident'  do
      expect {
        SwitrsImporter.import_case(switrs_case)
      }.to change { Incident.count }.by(1)
    end
  end
end
