const jwt = require("jsonwebtoken");
const data = require("../services/dataService");
const HttpError = require("../utils/httpError");
const { jwtSecret } = require("../config/env");

function authenticateUser(request, _response, next) {
  const token = request.headers.authorization?.startsWith("Bearer ") ? request.headers.authorization.slice(7) : null;
  if (!token) return next(new HttpError(401, "Authentication required"));
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = data.findOne("users", (record) => record.id === payload.id);
    if (!user) return next(new HttpError(401, "Invalid authentication token"));
    request.user = user;
    next();
  } catch { next(new HttpError(401, "Invalid or expired authentication token")); }
}
function requireEmployer(request, _response, next) { return request.user?.role === "employer" ? next() : next(new HttpError(403, "Employer access required")); }
function requireEmployee(request, _response, next) { return request.user?.role === "employee" ? next() : next(new HttpError(403, "Employee access required")); }

module.exports = { authenticateUser, requireEmployer, requireEmployee };