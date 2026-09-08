const assert = require("assert");
const { spawn } = require("child_process");

const port = process.env.TEST_PORT || 5200 + Math.floor(Math.random() * 500);
const baseUrl = `http://localhost:${port}/api`;

async function call(path, options = {}) {
  const headers = { "content-type": "application/json" };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, body: options.body && JSON.stringify(options.body) });
  return { status: response.status, json: await response.json() };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { if ((await fetch(`${baseUrl}/health`)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Test server did not start");
}

async function run() {
  const server = spawn(process.execPath, ["server/server.js"], { env: { ...process.env, PORT: port }, stdio: ["ignore", "pipe", "pipe"] });
  let serverError = "";
  server.stderr.on("data", (chunk) => { serverError += chunk.toString(); });
  try {
    await waitForServer();
  const testEmail = `test-${Date.now()}@nexaflow.demo`;
  let result = await call("/auth/login", { method: "POST", body: { email: "employer@nexaflow.demo", password: "Employer123!" } });
  assert.equal(result.status, 200);
  const employer = result.json.data.token;
  result = await call("/auth/login", { method: "POST", body: { email: "employee@nexaflow.demo", password: "Employee123!" } });
  assert.equal(result.status, 200);
  const employee = result.json.data.token;
  assert.equal((await call("/users/employees", { token: employee })).status, 403);
  result = await call("/users/employees", { token: employer });
  assert(result.json.data.some((user) => user.id === "alex"));

  result = await call("/users/employees", { method: "POST", token: employer, body: { fullName: "Test User", email: testEmail, password: "TestUser123!x" } });
  assert.equal(result.status, 201);
  const newEmployeeId = result.json.data.id;
  result = await call("/teams", { method: "POST", token: employer, body: { name: "Test Team", description: "API test team", leadId: newEmployeeId, members: [{ employeeId: newEmployeeId, role: "Custom Role", customRole: "Release Captain" }] } });
  if (result.status !== 201) console.error("team create failed", result);
  assert.equal(result.status, 201);
  const teamId = result.json.data.id;
  result = await call("/projects", { method: "POST", token: employer, body: { name: "API Test Project", description: "Test", status: "Planning", teamId } });
  assert.equal(result.status, 201);
  const projectId = result.json.data.id;
  result = await call("/tasks", { method: "POST", token: employer, body: { title: "API Test Task", projectId, teamId, assignedEmployeeId: newEmployeeId, status: "TODO" } });
  assert.equal(result.status, 201);
  const taskId = result.json.data.id;
  result = await call("/auth/login", { method: "POST", body: { email: testEmail, password: "TestUser123!x" } });
  const newEmployee = result.json.data.token;
  assert.equal((await call(`/tasks/${taskId}`, { method: "PATCH", token: newEmployee, body: { status: "IN_PROGRESS" } })).status, 200);
  result = await call(`/tasks/${taskId}`, { method: "PATCH", token: newEmployee, body: { status: "DONE" } });
  if (result.status !== 200) console.error("completion failed", result);
  assert.equal(result.status, 200);
  assert.equal((await call(`/tasks/${taskId}`, { method: "PATCH", token: newEmployee, body: { status: "APPROVED" } })).status, 403);
  result = await call(`/tasks/${taskId}`, { method: "PATCH", token: employer, body: { status: "APPROVED" } });
  if (result.status !== 200) console.error("approval failed", result);
  assert.equal(result.status, 200);
  result = await call(`/projects/${projectId}`, { token: employer });
  assert.equal(result.json.data.statistics.approved, 1);
  result = await call(`/teams/${teamId}`, { token: employer });
  assert.equal(result.json.data.members[0].completedTasks, 1);
  result = await call("/notifications/unread", { token: newEmployee });
  assert(result.json.data.length >= 1);
  assert.equal((await call("/notifications/read-all", { method: "PATCH", token: newEmployee })).status, 200);
  result = await call("/notifications/unread", { token: newEmployee });
  assert.equal(result.json.data.length, 0);
  console.log("E2E backend flow passed");
  } catch (error) { if (serverError) console.error(serverError); throw error; } finally { server.kill(); }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });