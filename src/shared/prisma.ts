import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import config from "../app/config";
import { PrismaClient } from "../generated/prisma/client";

const dbUrl = new URL(config.database.url);

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port) || 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.slice(1),
  connectionLimit: config.database.connectionLimit,
  // MySQL 8 default auth (caching_sha2_password) over non-TLS local connections.
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
