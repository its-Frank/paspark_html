CREATE TABLE users(email VARCHAR(100), fullname VARCHAR(100), phone VARCHAR(20), password VARCHAR(255), PRIMARY KEY(email));

CREATE TABLE locations(location_id VARCHAR(40), location_name VARCHAR(255), latitude DECIMAL(10,6) , longitude DECIMAL(10,6) , PRIMARY KEY(location_id));

CREATE TABLE space_categories(category_id VARCHAR(10), description VARCHAR(255), price_ksh_hour INT, PRIMARY KEY(category_id) );

CREATE TABLE spaces( space_id INT AUTO_INCREMENT,space_label VARCHAR(10), space_location VARCHAR(40), space_category VARCHAR(10), occupied INT DEFAULT 0, PRIMARY KEY (space_id), FOREIGN KEY(space_location) REFERENCES locations(location_id), FOREIGN KEY(space_category) REFERENCES space_categories(category_id) );

CREATE TABLE bookings(booking_id INT AUTO_INCREMENT, user  VARCHAR(100), space INT, payment_method VARCHAR(20), time_in DATETIME DEFAULT CURRENT_TIMESTAMP, time_out DATETIME, booking_status VARCHAR(20), PRIMARY KEY(booking_id) DEFAULT 'checkedin', FOREIGN KEY(user) REFERENCES users(email), FOREIGN KEY (space) REFERENCES spaces(space_id));

CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, fullname, phone, password) VALUES
  ('john@gmail.com', 'John Doe', '+254722123456', 'hashed_password1'),
  ('jane@gmail.com', 'Jane Doe', '+254711765432', 'hashed_password2'),
  ('david@gmail.com', 'David Kamau', '+254700987654', 'hashed_password3');

INSERT INTO locations (location_id, location_name, latitude, longitude) VALUES
  ('rupa', 'Rupas Mall Eldoret', 0.522778, 35.274444),
  ('sports', 'Eldoret Sports Club', 0.530000, 35.280000),
  ('kiptagic', 'Kiptagich House', 0.566667, 35.291667),
  ('stadium', '64 Stadium Eldoret', 0.540000, 35.300000),
  ('market', 'Eldoret Municipal Market', 0.510000, 35.260000),
  ('show', 'Eldoret Showground', 0.570000, 35.310000);

INSERT INTO space_categories (category_id, description, price_ksh_hour) VALUES
  ('bikes', 'Two wheeled vehiclses, space 10 X 6 feet ', 50),
  ('cars', 'Light Vehicles, 4 wheels, space 14 X 10 feet', 150),
  ('trucks', 'Heavy Vehicles 4-12 Wheels, 20 X 10 feet ', 250),
  ('trailers', 'Heavy Long Vehicles 8-24 Wheels, 40 X 10 feet ', 450);

INSERT INTO spaces (space_label, space_location, space_category)
VALUES
  -- Rupa Mall
  ("rupa-1", "rupa", "bikes"),
  ("rupa-2", "rupa", "bikes"),
  ("rupa-3", "rupa", "cars"),
  ("rupa-4", "rupa", "cars"),
  ("rupa-5", "rupa", "cars"),
  ("rupa-6", "rupa", "cars"),
  ("rupa-7", "rupa", "trucks"),
  ("rupa-8", "rupa", "trucks"),
  ("rupa-9", "rupa", "trailers"),
  ("rupa-10", "rupa", "trailers"),

  -- Eldoret Sports Club
  ("sports-1", "sports", "cars"),
  ("sports-2", "sports", "cars"),
  ("sports-3", "sports", "bikes"),
  ("sports-4", "sports", "bikes"),
  ("sports-5", "sports", "trucks"),
  ("sports-6", "sports", "trucks"),
  ("sports-7", "sports", "trailers"),
  ("sports-8", "sports", "trailers"),
  ("sports-9", "sports", "cars"),
  ("sports-10", "sports", "cars"),

  -- Kiptagich House
  ("kiptagic-1", "kiptagic", "trucks"),
  ("kiptagic-2", "kiptagic", "trucks"),
  ("kiptagic-3", "kiptagic", "trailers"),
  ("kiptagic-4", "kiptagic", "trailers"),
  ("kiptagic-5", "kiptagic", "cars"),
  ("kiptagic-6", "kiptagic", "cars"),
  ("kiptagic-7", "kiptagic", "cars"),
  ("kiptagic-8", "kiptagic", "cars"),
  ("kiptagic-9", "kiptagic", "bikes"),
  ("kiptagic-10", "kiptagic", "bikes"),

  -- 64 Stadium Eldoret
  ("stadium-1", "stadium", "cars"),
  ("stadium-2", "stadium", "cars"),
  ("stadium-3", "stadium", "cars"),
  ("stadium-4", "stadium", "cars"),
  ("stadium-5", "stadium", "bikes"),
  ("stadium-6", "stadium", "bikes"),
  ("stadium-7", "stadium", "trucks"),
  ("stadium-8", "stadium", "trucks"),
  ("stadium-9", "stadium", "trailers"),
  ("stadium-10", "stadium", "trailers"),

  -- Eldoret Municipal Market
  ("market-1", "market", "cars"),
  ("market-2", "market", "cars"),
  ("market-3", "market", "bikes"),
  ("market-4", "market", "bikes"),
  ("market-5", "market", "cars"),
  ("market-6", "market", "cars"),
  ("market-7", "market", "trucks"),
  ("market-8", "market", "trucks"),
  ("market-9", "market", "trailers"),
  ("market-10", "market", "trailers"),

  -- Eldoret Showground
  ("show-1", "show", "trailers"),
  ("show-2", "show", "trailers"),
  ("show-3", "show", "trucks"),
  ("show-4", "show", "trucks"),
  ("show-5", "show", "cars"),
  ("show-6", "show", "cars"),
  ("show-7", "show", "cars"),
  ("show-8", "show", "cars"),
  ("show-9", "show", "bikes"),
  ("show-10", "show", "bikes")
;