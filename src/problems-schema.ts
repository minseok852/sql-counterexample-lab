export const schema=`CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);`;
