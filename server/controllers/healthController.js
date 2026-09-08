function getHealth(_request, response) {
  response.json({
    success: true,
    message: "NexaFlow API is running",
  });
}

module.exports = { getHealth };