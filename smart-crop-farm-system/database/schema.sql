CREATE DATABASE IF NOT EXISTS agrismart;
USE agrismart;

CREATE TABLE IF NOT EXISTS app_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farm (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    size_in_acres DOUBLE,
    latitude DOUBLE,
    longitude DOUBLE,
    soil_type VARCHAR(255),
    owner_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES app_user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS irrigation_plan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farm_id BIGINT NOT NULL,
    water_needed_liters DOUBLE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_irrigation_farm FOREIGN KEY (farm_id) REFERENCES farm(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS crop_recommendation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farm_id BIGINT NOT NULL,
    crop_name VARCHAR(255) NOT NULL,
    suitability_score DOUBLE NOT NULL,
    explanation TEXT,
    nitrogen DOUBLE,
    phosphorus DOUBLE,
    potassium DOUBLE,
    temperature DOUBLE,
    humidity DOUBLE,
    p_h DOUBLE,
    rainfall DOUBLE,
    estimated_profit_min DOUBLE,
    estimated_profit_max DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recommendation_farm FOREIGN KEY (farm_id) REFERENCES farm(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resource_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farm_id BIGINT NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    allocated DOUBLE NOT NULL,
    used DOUBLE NOT NULL,
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resource_farm FOREIGN KEY (farm_id) REFERENCES farm(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weather_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farm_id BIGINT NOT NULL,
    temperature DOUBLE,
    humidity DOUBLE,
    rainfall DOUBLE,
    wind_speed DOUBLE,
    `condition` VARCHAR(255),
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_weather_farm FOREIGN KEY (farm_id) REFERENCES farm(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS action_plan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farm_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    priority INT,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_action_farm FOREIGN KEY (farm_id) REFERENCES farm(id) ON DELETE CASCADE
);
