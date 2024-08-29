import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const bd = new Pool({
  connectionString: process.env.DATABASE_URL
});

export default bd; 