require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || "nexaflow-local-development-secret",
};