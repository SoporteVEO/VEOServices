import sql, { type ConnectionPool } from "mssql";

/**
 * Global connection pool for SQL Server.
 * Ensures pooled connections work well on serverless (e.g. Vercel).
 *
 * Env vars used:
 * - SQLSERVER_HOST
 * - SQLSERVER_PORT
 * - SQLSERVER_USERNAME
 * - SQLSERVER_PASSWORD
 * - SQLSERVER_DATABASE (optional, defaults to "master")
 */

let _poolPromise: Promise<ConnectionPool> | undefined;

function createSqlServerPool() {
  const {
    SQLSERVER_HOST,
    SQLSERVER_PORT,
    SQLSERVER_USERNAME,
    SQLSERVER_PASSWORD,
    SQLSERVER_DATABASE,
  } = process.env;

  if (!SQLSERVER_HOST || !SQLSERVER_USERNAME || !SQLSERVER_PASSWORD) {
    throw new Error(
      "Missing required SQL Server env vars: SQLSERVER_HOST, SQLSERVER_USERNAME, SQLSERVER_PASSWORD"
    );
  }

  const config = {
    server: SQLSERVER_HOST,
    port: SQLSERVER_PORT ? Number(SQLSERVER_PORT) : 1433,
    user: SQLSERVER_USERNAME,
    password: SQLSERVER_PASSWORD,
    database: SQLSERVER_DATABASE || "master",
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };

  return sql.connect(config);
}

/**
 * Get (or lazily create) the global SQL Server pool.
 */
export function getSqlServerPool() {
  if (!_poolPromise) {
    _poolPromise = createSqlServerPool();
  }
  return _poolPromise;
}

/**
 * Convenience helper to run a query.
 *
 * Usage in a server function:
 *   import { querySqlServer } from "@/db/sql_server";
 *
 *   const rows = await querySqlServer(
 *     "SELECT TOP 10 * FROM MyTable WHERE id = @id",
 *     { id: 123 }
 *   );
 */
export async function querySqlServer(
  query: string,
  params: Record<string, unknown> = {}
) {
  const pool = await getSqlServerPool();
  const request = pool.request();

  Object.entries(params).forEach(([key, value]) => {
    // mssql will infer parameter type from JS value
    request.input(key, value);
  });

  const result = await request.query(query);
  return result.recordset;
}
