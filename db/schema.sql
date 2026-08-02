-- =====================================
-- eTap Jobs Database Schema
-- PostgreSQL
-- =====================================


-- USERS TABLE
CREATE TABLE users (

    id SERIAL PRIMARY KEY,

    name VARCHAR(255) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    role VARCHAR(50) NOT NULL
        CHECK (role IN (
            'admin',
            'designer',
            'printer',
            'delivery'
        )),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);



-- =====================================
-- JOBS TABLE
-- =====================================


CREATE TABLE jobs (

    id SERIAL PRIMARY KEY,


    customer VARCHAR(255) NOT NULL,


    description TEXT,


    contact VARCHAR(50),


    order_no VARCHAR(50) UNIQUE NOT NULL,


    job_date DATE,


    due_date DATE,


    items JSONB DEFAULT '[]'::jsonb,


    subtotal DECIMAL(12,2) DEFAULT 0,


    total DECIMAL(12,2) DEFAULT 0,


    advance DECIMAL(12,2) DEFAULT 0,


    amount_words TEXT,


    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending',
            'design',
            'printer',
            'ready',
            'completed'
        )),


    zone VARCHAR(100),


    building VARCHAR(100),


    street VARCHAR(100),


    created_by INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,


    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,


    delivery_status VARCHAR(50)
        CHECK (delivery_status IN (
            'collect_from_office',
            'collect_card',
            'cash',
            'no_delivery',
            'payment_pending'
        )),


    delivery_amount DECIMAL(12,2) DEFAULT 0,


    delivery_balance DECIMAL(12,2) DEFAULT 0

);



