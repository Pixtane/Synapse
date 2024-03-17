# Synapse

Synapse is a small social media written on node.js

## Installing

To run the app on your machine, install all dependencies with `npm i`.
Then make a file .env, in which you should fill this information (values are examples):

``` .env
PORT=8080

SALT_ROUNDS=10

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=synapse
```

Before running you should also install MySQL and mariadb, and create a new database (which information you fill in dotenv file). Example sql file is in `/synapsedb.sql`