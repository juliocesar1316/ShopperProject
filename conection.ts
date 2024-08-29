import { Pool } from 'pg';

const bd = new Pool({
  connectionString: 'postgres://postgres:shopper@db:5432/customersMeasure'
});

export default bd; 