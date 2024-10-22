export const dbmlObject = 
`
Table production.color_dimension {
    color_dimension_id integer [pk, not null, note: 'Unique identifier for each color combination.']
    interior_color varchar [not null, note: 'Interior color of the vehicle model.']
    exterior_color varchar [not null, note: 'Exterior color of the vehicle model.']

    Note: 'The color_dimension table contains unique combinations of interior and exterior colors for vehicle models based on the model_definition table.'
}

Table production.transmission_dimension {
  transmission_id integer [pk, not null, note: 'Primary key identifier for each unique transmission type']
  transmission_type varchar [not null, note: 'The type of transmission for the vehicle model']

  Note: 'The transmission_dimension table contains unique transmission types of vehicle models. To construct this table, select the distinct transmission_type from the model_definition table. Assign a surrogate key (transmission_id) to each unique transmission type to serve as the primary key for the transmission_dimension table.'
}

Table production.engine_dimension {
  engine_id integer [pk, not null, note: 'Surrogate key for engine types']
  engine_type varchar [not null, note: 'Type of engine in the vehicle model']

  Note: 'The engine_dimension table is a standard dimension table that contains unique engine types of vehicle models. To construct this table, select the distinct engine_type values from the model_definition table. Since engine types do not have a natural unique identifier, add a surrogate key named engine_id as the primary key. The resulting table will have at least two columns: engine_id and engine_type.'
}

Table production.wheel_dimension {
  wheel_dimension_id integer [pk, not null, note: 'Surrogate key for wheel dimensions, auto-incrementing integer.']
  wheel_size_inches decimal [not null, note: 'Unique wheel size of the vehicle model, measured in inches.']

  Note: 'The wheel_dimension table is a standard dimension table that contains unique wheel sizes of vehicle models, measured in inches.'
}

Table sales.dealer_dimension {
  dealer_id integer [pk, not null, note: 'Unique identifier for each dealer.']
  dealer_name varchar [not null, note: 'Name of the dealer.']
  address varchar [note: 'Address of the dealer.']
  city varchar [note: 'City where the dealer is located.']
  state varchar [note: 'State where the dealer is located.']
  zip varchar [note: 'Zip code of the dealer location.']
  sales_region varchar [note: 'Sales region the dealer is associated with.']

  Note: 'A standard dimension table that contains a unique list of dealers, including their geographic location details and the sales regions they are associated with.'
}

Table sales.date_dimension {
  date_id integer [pk, not null, note: 'Auto-incrementing integer assigned to each unique date as a surrogate key']
  date date [not null, note: 'Distinct transaction date']
  year integer [not null, note: 'Year component of the transaction date']
  month integer [not null, note: 'Month component of the transaction date']
  day integer [not null, note: 'Day component of the transaction date']
  quarter integer [not null, note: 'Quarter of the year based on the transaction date']
  week_number integer [not null, note: 'Week number of the year based on the transaction date']

  Note: 'The date_dimension table is constructed by extracting distinct transaction_date values from the vehicle_lifecycle table. For each unique date, additional time components such as year, month, day, quarter, and week number are calculated. A surrogate key named date_id is assigned to each unique date as an auto-incrementing integer. The final table includes columns for date_id, date, year, month, day, quarter, and week_number, facilitating time-based analysis and reporting within the context of vehicle lifecycle events.'
}

Table sales.transaction_type_dimension {
  transaction_type_id INT [pk, not null, note: 'Surrogate key for each unique transaction type, serves as the primary key and should be an auto-incrementing integer.']
  transaction_type VARCHAR [not null, note: 'Unique transaction type derived from the vehicle_lifecycle table.']

  Note: 'The transaction_type_dimension table is a standard dimension table that stores a list of unique transaction types derived from the vehicle_lifecycle table. To construct this table, select the distinct transaction_type values from the vehicle_lifecycle table. Then, generate a surrogate key for each unique transaction type to serve as the primary key for the dimension table. The surrogate key can be named transaction_type_id and should be an auto-incrementing integer.'
}

Table production.vehicle_fact {
  idx integer [pk, not null, note: 'Unique identifier for each record in the vehicle_fact table']
  model_id integer [not null, note: 'Foreign key referencing the model_definition table']
  VIN string [not null, note: 'Vehicle Identification Number, unique for each vehicle']
  latest_status_lifecycle string [note: 'Describes the current lifecycle status of the vehicle']
  engine_id integer [not null, ref: < production.engine_dimension.engine_id, note: 'Foreign key referencing the engine_dimension table.']
  transmission_id integer [not null, ref: < production.transmission_dimension.transmission_id, note: 'Foreign key referencing the transmission_dimension table.']
  wheel_id integer [not null, ref: < production.wheel_dimension.wheel_dimension_id, note: 'Foreign key referencing the wheel_dimension table.']
  color_id integer [not null, ref: < production.color_dimension.color_dimension_id, note: 'Foreign key referencing the color_dimension table.']
  manufactured_date date [not null, note: 'Date the vehicle was manufactured']

  Note: 'The vehicle_fact table is an accumulating snapshot fact table that represents each unique vehicle model, capturing the latest status in its lifecycle.'
}

Table sales.sales_reporting_view {
  idx int [pk, not null, note: 'Auto-incrementing unique identifier for each record.']
  model_id varchar [not null, note: 'Identifier for the vehicle model involved in the sales transaction.']
  sales_region varchar [not null, note: 'Geographical region where the sales transaction occurred.']
  total_sales int [not null, note: 'Total number of sales for the given model_id and sales_region.']

  Note: 'This reporting view aggregates total sales data by model_id and sales_region.'
}

Table sales.inventory_reporting_view {
  idx integer [pk, not null, note: 'Auto-incrementing index for uniqueness.']
  dealer_name TEXT [not null, note: 'Name of the dealership.']
  dealer_location TEXT [note: 'Location of the dealership.']
  model_name TEXT [not null, note: 'The name of the car model.']
  quantity integer [not null, note: 'Total quantity of the car model available at the dealership.']

  Note: 'A reporting view that shows the total quantity of each car model available at each dealership.'
}

Table production.vehicle_dimension {
  vehicle_dimension_id integer [pk, not null, note: 'Surrogate key for each unique vehicle.']
  vin string [not null, note: 'Vehicle Identification Number.']
  model_id integer [not null, ref: < production.vehicle_fact.model_id, note: 'Foreign key linked to model_definition table.']
  transaction_date date [not null, note: 'Tracks when a transaction related to the vehicle occurred.']
  vehicle_attribute string [note: 'Specific attribute of a vehicle.']

  Note: 'A type-2 slowly-changing dimension table that includes comprehensive vehicle information and tracks changes over time.'
}

Table sales.vehicle_transaction_fact {
  idx integer [pk, not null, note: 'Unique identifier for each vehicle transaction event.']
  vehicle_id integer [not null, note: 'Foreign key referencing the vehicle_dimension table.']
  dealer_id integer [not null, ref: < sales.dealer_dimension.dealer_id, note: 'Foreign key referencing the dealer_dimension table.']
  date_id integer [not null, ref: < sales.date_dimension.date_id, note: 'Foreign key referencing the date_dimension table.']
  transaction_type_id integer [not null, ref: < sales.transaction_type_dimension.transaction_type_id, note: 'Foreign key referencing the transaction_type_dimension table.']
  color_id integer [not null, ref: < production.color_dimension.color_dimension_id, note: 'Foreign key referencing the color_dimension table.']

  Note: 'The vehicle_transaction_fact table is a fact table that captures each transaction event in a vehicle lifecycle.'
}

`;












