/*CREATE DATABASE etap; */


-- roles: admin, designer, printer, delivery  
CREATE TABLE users (  
  id          SERIAL PRIMARY KEY,  
  name        VARCHAR(120) NOT NULL,  
  email       VARCHAR(160) UNIQUE NOT NULL,  
  password    VARCHAR(255) NOT NULL,          -- bcrypt hash  
  role        VARCHAR(20)  NOT NULL DEFAULT 'admin'  
              CHECK (role IN ('admin','designer','printer','delivery')),  
  created_at  TIMESTAMPTZ DEFAULT NOW()  
);

CREATE TABLE jobs (  
  id            SERIAL PRIMARY KEY,  
  customer      VARCHAR(160),  
  order_no      VARCHAR(60),  
  job_date      DATE,  
  due_date      DATE,  
  items         JSONB DEFAULT '[]',           -- [{name,qty,unit,price}]  
  subtotal      NUMERIC(12,2) DEFAULT 0,  
  total         NUMERIC(12,2) DEFAULT 0,  
  advance       NUMERIC(12,2) DEFAULT 0,  
  amount_words  TEXT,  
  status        VARCHAR(20) DEFAULT 'pending'  
                CHECK (status IN ('pending','design','printer','completed')),  
  zone          VARCHAR(60),  
  building      VARCHAR(60),  
  street        VARCHAR(120),  
  created_by    INTEGER REFERENCES users(id),  
  created_at    TIMESTAMPTZ DEFAULT NOW()  
);

-- seed one admin (password: pass -> hash it via app, or use this pre-hashed for 'pass')  
-- Better: register through the signup page.  