-- Cafe database (8 tables, PostgreSQL) + sample data
DROP TABLE IF EXISTS order_items, orders, cart_items, carts, favorites, products, categories, users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false   -- shown on Home
);

CREATE TABLE favorites (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE   -- one cart per user
);

CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  UNIQUE (cart_id, product_id)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','preparing','on_the_way','delivered','cancelled')),
  address TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  product_name TEXT NOT NULL,   -- copied at order time so old orders never change
  price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0)
);

-- ===== Sample data =====
INSERT INTO categories(id,name) VALUES (1,'Hot Drinks'),(2,'Cold Drinks'),(3,'Desserts');
INSERT INTO products(id,category_id,name,description,price,is_featured) VALUES
 (1,1,'Cappuccino','Espresso with steamed milk foam',55,true),
 (2,1,'Latte','Smooth espresso with milk',60,true),
 (3,2,'Iced Coffee','Chilled coffee over ice',50,true),
 (4,2,'Lemon Mint','Fresh lemon and mint',40,false),
 (5,3,'Chocolate Cake','Rich chocolate slice',65,true),
 (6,3,'Cheesecake','Classic cheesecake slice',70,false);
SELECT setval(pg_get_serial_sequence('categories','id'), 3);
SELECT setval(pg_get_serial_sequence('products','id'), 6);
