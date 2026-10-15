/**
 * Controller to handle API health check
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StudySpace API is running',
    timestamp: new Date().toISOString()
  });
};
