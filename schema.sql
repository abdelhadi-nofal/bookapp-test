DROP TABLE IF EXISTS makeuptable;
CREATE TABLE IF NOT EXISTS makeuptable(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    price VARCHAR(255),
    image_link VARCHAR(255),
    description VARCHAR(255)
)