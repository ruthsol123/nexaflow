const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const data = require("../services/dataService");
const { jwtSecret } = require("../config/env");
const { createId } = require("../utils/ids");
const HttpError = require("../utils/httpError");

function publicUser(user) { const { passwordHash, ...safe } = user; return safe; }
function tokenFor(user) { return jwt.sign({ id: user.id, role: user.role, companyId: user.companyId }, jwtSecret, { expiresIn: "7d" }); }
function normalizedBody(body) { return { ...body, email: String(body.email || body.companyEmail || "").trim().toLowerCase(), fullName: String(body.fullName || "").trim() }; }

async function register(request, response, next) {
  try {
    const body = normalizedBody(request.body);
    if (!body.fullName || !body.email || !body.password || body.password !== body.confirmPassword) throw new HttpError(400, "Valid name, email, password, and matching confirmation are required");
    if (data.findOne("users", (user) => user.email === body.email)) throw new HttpError(409, "An account with this email already exists");
    const role = body.accountType === "company" || body.companyName ? "employer" : "employee";
    const companyId = role === "employer" ? createId("company") : body.companyId || "company-demo";
    if (role === "employer") data.insert("companies", { id: companyId, name: String(body.companyName || "NexaFlow Company").trim(), email: body.email, size: body.companySize || "Not specified", ownerId: "pending" }, "company");
    const user = data.insert("users", { id: body.id, companyId, fullName: body.fullName, name: body.fullName, email: body.email, role, title: body.title || (role === "employer" ? "CEO" : "Employee"), department: body.department || "General", status: "Active", teamId: "", passwordHash: await bcrypt.hash(body.password, 12) }, "user");
    if (role === "employer") data.patch("companies", companyId, companyId, { ownerId: user.id });
    response.status(201).json({ success: true, data: { user: publicUser(user), token: tokenFor(user) } });
  } catch (error) { next(error); }
}
async function login(request, response, next) {
  try {
    const email = String(request.body.email || request.body.companyEmail || "").trim().toLowerCase();
    const user = data.findOne("users", (record) => record.email === email);
    if (!user || !(await bcrypt.compare(String(request.body.password || ""), user.passwordHash))) throw new HttpError(401, "Invalid email or password");
    response.json({ success: true, data: { user: publicUser(user), token: tokenFor(user) } });
  } catch (error) { next(error); }
}
function me(request, response) { response.json({ success: true, data: { user: publicUser(request.user) } }); }
function logout(_request, response) { response.json({ success: true, data: { message: "Logged out successfully" } }); }

module.exports = { register, login, me, logout, publicUser };