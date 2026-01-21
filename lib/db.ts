import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST,      // 服务器 IP
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: false, // 内网 false；公网建议 true
})

export default pool
