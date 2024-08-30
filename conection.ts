import { Pool } from 'pg';
import config from './config';

const baseUrl = config.databaseUrl;

const bd = new Pool({
  connectionString: baseUrl
});

export default bd; 