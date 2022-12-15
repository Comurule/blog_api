module.exports = ({ res, status, message, data }) => {
	const statusCode = status ? 200 : 400
	const resStatus = status ? 'success' : 'error'
	const responseData = { status: resStatus, message }

	if (data) responseData.data = data
	return res.status(statusCode).json(responseData)
}
