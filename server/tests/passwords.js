const assert = require("assert");
const { spawn } = require("child_process");

const port = 5700 + Math.floor(Math.random() * 200);
const baseUrl = `http://localhost:${port}/api`;

async function request(path, body) {
  const response = await fetch(`${baseUrl}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { if ((await fetch(`${baseUrl}/health`)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Password test server did not start");
}

async function run() {
  const server = spawn(process.execPath, ["server/server.js"], { env: { ...process.env, PORT: port }, stdio: ["ignore", "ignore", "pipe"] });
  try {
    await waitForServer();
    const suffix = Date.now();
    const companyPassword = "Company8$A";
    const employeePassword = "Employee8$A";
    let result = await request("/auth/register", { accountType: "company", fullName: "Password Company", companyName: "Password Co", companyEmail: `company-${suffix}@example.com`, companySize: "1-10", password: companyPassword, confirmPassword: companyPassword });
    assert.equal(result.status, 201);
    result = await request("/auth/login", { email: `company-${suffix}@example.com`, password: companyPassword });
    assert.equal(result.status, 200);
    result = await request("/auth/register", { accountType: "employee", fullName: "Password Employee", email: `employee-${suffix}@example.com`, password: employeePassword, confirmPassword: employeePassword });
    assert.equal(result.status, 201);
    result = await request("/auth/login", { email: `employee-${suffix}@example.com`, password: employeePassword });
    assert.equal(result.status, 200);
    for (const password of ["Short7!", "noupper8!", "NOLOWER8!", "NoNumber!", "NoSpecial8A", " Leading8!A", "Trailing8!A "]) {
      result = await request("/auth/register", { accountType: "employee", fullName: "Invalid Password", email: `invalid-${suffix}-${password.length}@example.com`, password, confirmPassword: password });
      assert.equal(result.status, 400);
      assert(result.body.message.includes("at least 8 characters"));
    }
    result = await request("/auth/register", { accountType: "employee", fullName: "Mismatch Password", email: `mismatch-${suffix}@example.com`, password: employeePassword, confirmPassword: "Different8$A" });
    assert.equal(result.status, 400);
    assert(result.body.message.includes("Passwords do not match"));
    console.log("Password registration and login checks passed");
  } finally {
    server.kill();
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });