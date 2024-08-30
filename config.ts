const config = {
    server: {
      port: 80,
    },
    databaseUrl: 'postgres://postgres:shopper@db:5432/customersMeasure',
    database: {
      host: 'db',
      port: 5432,
      user: 'postgres',
      password: 'shopper',
      database: 'customersMeasure',
    },
    api: {
      baseUrl: 'http://localhost:80',
    },
  };
  
  export default config;