
CREATE TABLE IF NOT EXISTS records (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(80) NOT NULL,
    category VARCHAR(40) NOT NULL,
    description VARCHAR(300) NOT NULL,
    status VARCHAR(20) NOT NULL,

    CONSTRAINT valid_title_length
        CHECK (char_length(trim(title)) BETWEEN 3 AND 80),

    CONSTRAINT valid_category_length
        CHECK (char_length(trim(category)) BETWEEN 2 AND 40),

    CONSTRAINT valid_description_length
        CHECK (char_length(trim(description)) BETWEEN 5 AND 300),

    CONSTRAINT valid_record_status
        CHECK (status IN ('Pending', 'In progress', 'Completed'))
);
