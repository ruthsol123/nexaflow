const { validationResult } = require("express-validator");
const HttpError = require("./httpError");

const passwordRules = /^(?!\s)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])(?=.{8,})(?!.*\s$).+$/;
const email = (field = "email") => require("express-validator").body(field).trim().isEmail().normalizeEmail();
const password = (field = "password") => require("express-validator").body(field).isString().matches(passwordRules).withMessage("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
function validate(request, _response, next) { const errors = validationResult(request); if (!errors.isEmpty()) return next(new HttpError(400, errors.array()[0].msg)); next(); }

module.exports = { email, password, passwordRules, validate };