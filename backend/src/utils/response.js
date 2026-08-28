function success(res, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

function failure(res, message = 'Something went wrong', statusCode = 500, code = 'INTERNAL_ERROR') {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
  });
}

module.exports = { success, failure };
