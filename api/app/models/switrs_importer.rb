class SwitrsImporter
  def self.import_case(switrs_case)
    attributes = switrs_case.as_incident_attributes
    Incident.create_with(attributes).find_or_create_by!(switrs_case_id: attributes[:switrs_case_id])
  end
end
