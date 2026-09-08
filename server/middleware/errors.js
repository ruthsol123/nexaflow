const HttpError = require("../utils/httpError");

function notFound(_request, _response, next) { next(new HttpError(404, "Route not found")); }
function errorHandler(error, _request, response, _next) { const status = error.status || 500; if (status === 500) console.error(error.stack || error.message); response.status(status).json({ success: false, message: status === 500 ? "Something went wrong" : error.message }); }

module.exports = { notFound, errorHandler };