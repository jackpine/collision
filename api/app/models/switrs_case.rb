# Interfaces with SWITRS schema to bring it into a more ergonomic format
class SwitrsCase < ActiveRecord::Base
  self.table_name = :collisions03to12
end
