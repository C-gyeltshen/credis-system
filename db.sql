CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE store_owners(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL UNIQUE,
    store_id UUID REFERENCES store(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone_number INT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    customer_id UUID REFERENCES customers(id),
    amount INT NOT NULL,
    transactionDate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL, 
    journalNumber INT NOT NULL UNIQUE,
    
);

