json.incident_counts @incident_counts do |incident_count|
  json.year incident_count.year.to_i
  json.count incident_count.count
end
