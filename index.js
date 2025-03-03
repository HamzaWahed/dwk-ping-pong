const Koa = require("koa");
const Router = require("koa-router");
const { Pool } = require("pg");
const PORT = 3000;
const app = new Koa();
const router = new Router();

const pool = new Pool({
  user: "postgres",
  host: "postgres-svc",
  database: "mydb",
  password: "1234",
  port: "5432",
});

router.get("/healthz", async (ctx) => {
  try {
    await pool.query("SELECT 1");
    ctx.status = 200;
    ctx.body = { status: "running" };
  } catch (err) {
    console.error("Health check error:", err);
    ctx.status = 503;
    ctx.body = { status: "health check failed" };
  }
});

router.get("/", async (ctx) => {
  ctx.body = "Ping Pong";
});

router.get("/pingpong", async (ctx) => {
  let query_response = await pool.query(
    "SELECT count FROM pingpong WHERE id = 1",
  );
  let count = query_response.rows[0].count;
  count += 1;
  await pool.query("UPDATE pingpong SET count = $1 WHERE id = 1", [count]);
  ctx.body = `pong ${count}`;
});

router.get("/requests", async (ctx) => {
  const query_response = await pool.query(
    "SELECT count FROM pingpong WHERE id = 1",
  );

  const count = query_response.rows[0].count;
  ctx.body = { message: `pong ${count}` };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`ping pong server listening on port ${PORT}`);
});
