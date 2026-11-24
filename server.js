require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const configuredOrigins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Requests from Postman, curl and server-to-server clients have no Origin header.
    if (!origin || configuredOrigins.length === 0 || configuredOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("This origin is not allowed by the API."));
  }
}));
app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.status(200).type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Student Event Proposal API</title>
  <style>
    :root{color-scheme:light;--ink:#172033;--muted:#5b6577;--line:#e1e6ee;--accent:#2457a6;--wash:#f4f7fb}
    *{box-sizing:border-box}body{margin:0;background:var(--wash);color:var(--ink);font:16px/1.6 system-ui,-apple-system,Segoe UI,sans-serif}
    main{max-width:980px;margin:36px auto;padding:0 18px}.panel{background:#fff;border:1px solid var(--line);border-radius:14px;padding:26px;margin:18px 0;box-shadow:0 8px 24px #1720330a}
    h1{margin:0 0 6px;font-size:clamp(1.7rem,4vw,2.4rem)}h2{margin-top:0}p{color:var(--muted)}a{color:var(--accent)}
    code,pre{background:#f0f3f8;border-radius:5px;padding:2px 5px}pre{padding:14px;overflow:auto}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:10px;border-bottom:1px solid var(--line);vertical-align:top}th{background:#f7f9fc}
    .meta{display:flex;gap:10px;flex-wrap:wrap}.meta span{background:#eef3fb;border-radius:7px;padding:6px 10px;font-size:.92rem}
    @media(max-width:620px){.panel{padding:18px}table{font-size:.9rem}th,td{padding:8px}}
  </style>
</head>
<body><main>
  <section class="panel">
    <h1>Student Event Proposal API</h1>
    <p>ICT251 Activity 7 — Backend Development</p>
    <div class="meta"><span><strong>Student:</strong> Mwape Kaposa</span><span><strong>Student number:</strong> 202511682</span></div>
    <p>This API stores and manages student event proposals. Clients can create, view, update and delete proposal records. Data is stored in a PostgreSQL database.</p>
    <p><strong>API base URL:</strong> <code>${baseUrl}</code><br>
    <a href="/health">Database health check</a> · <a href="/api/records">View all proposals</a></p>
  </section>
  <section class="panel"><h2>Available routes</h2>
    <table><thead><tr><th>Method</th><th>Route</th><th>Purpose</th></tr></thead><tbody>
      <tr><td>GET</td><td><code>/</code></td><td>Display this API guide</td></tr>
      <tr><td>GET</td><td><code>/health</code></td><td>Check API and database connection</td></tr>
      <tr><td>GET</td><td><code>/api/records</code></td><td>Get all event proposals</td></tr>
      <tr><td>GET</td><td><code>/api/records/:id</code></td><td>Get one proposal by ID</td></tr>
      <tr><td>POST</td><td><code>/api/records</code></td><td>Create a proposal</td></tr>
      <tr><td>PUT</td><td><code>/api/records/:id</code></td><td>Replace the editable fields of a proposal</td></tr>
      <tr><td>DELETE</td><td><code>/api/records/:id</code></td><td>Delete a proposal</td></tr>
    </tbody></table>
  </section>
  <section class="panel"><h2>Record format</h2>
    <p>Each record has a database-generated positive integer <code>id</code>, plus four editable fields:</p>
    <ul><li><strong>title:</strong> 3–80 characters</li><li><strong>category:</strong> 2–40 characters (examples: Academic, Sports, Cultural, Community)</li><li><strong>description:</strong> 5–300 characters</li><li><strong>status:</strong> exactly <code>Pending</code>, <code>In progress</code> or <code>Completed</code></li></ul>
    <p>POST and PUT require all four editable fields. Do not include <code>id</code> in the request body.</p>
    <pre>{
  "title": "Computer Science Career Fair",
  "category": "Academic",
  "description": "A student-organised event connecting learners with technology professionals.",
  "status": "Pending"
}</pre>
  </section>
  <section class="panel"><h2>Response codes</h2>
    <ul><li><code>200</code> — successful GET, PUT or DELETE</li><li><code>201</code> — proposal created</li><li><code>400</code> — invalid input or malformed JSON</li><li><code>404</code> — record or route not found</li><li><code>500</code> — unexpected server error</li><li><code>503</code> — database unavailable during health check</li></ul>
    <p>Errors are returned as JSON with a <code>message</code> field. A hosted free service may take a short time to wake after being idle.</p>
  </section>
</main></body></html>`);
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "OK", message: "API and database are working." });
  } catch (error) {
    console.error("Health check database error:", error.message);
    res.status(503).json({ status: "ERROR", message: "The database is unavailable." });
  }
});

app.use("/api/records", require("./routes/records"));

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Request body contains malformed JSON." });
  }
  if (error.message === "This origin is not allowed by the API.") {
    return res.status(403).json({ message: "This origin is not allowed by the API." });
  }
  console.error("Unexpected server error:", error);
  return res.status(500).json({ message: "An unexpected server error occurred." });
});

const port = Number(process.env.PORT) || 3000;
if (require.main === module) {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Student Event Proposal API listening on port ${port}`);
  });
}

module.exports = app;
