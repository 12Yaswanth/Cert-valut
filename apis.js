const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();


const { getAllCertificates, insertCertificate, editCertificate, deleteCertificate, registerUser, getUserByUsername } = require("./dbOperations.js");

const app = express();
const port = 9393;
const secretKey = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());


function authorize(request, response, next) {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'Unauthorized: Token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, secretKey);
        request.user = decoded;
        console.log(request.user.employeeId);
        console.log(request.params.employeeId);


        next();
    } catch (err) {
        return response.status(403).json({ error: 'Forbidden: Invalid token' });
    }
}

app.post('/api/login', async (request, response) => {
    const { username, password } = request.body;
    console.log("login");

    try {
        const user = await getUserByUsername(username);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return response.status(401).json({ error: 'Unauthorized: Invalid credentials' });
        }

        const token = jwt.sign({ username: user.username, employeeId: user.employeeId }, secretKey);

        response.json({ token });
    } catch (error) {
        console.error("Error during login:", error.message);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/register', async (request, response) => {
    try {
        const { employeeId, username, password } = request.body;

        if (!employeeId || !username || !password) {
            return response.status(400).json({ error: 'Employee ID, username, and password are required' });
        }

        const registrationResponse = await registerUser(employeeId, username, password);

        response.status(registrationResponse.responseCode).json(registrationResponse.data);
    } catch (error) {
        console.error("Error registering user:", error.message);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});







app.get('/api/Employees/certificates', authorize, async (request, response) => {
    try {
        const employeeId = request.user.employeeId;
        console.log(request.user.employeeId);
        const { orderBy = 'IssueDate', sort = 'ASC' } = request.query;
        const responseData = await getAllCertificates(employeeId, sort, orderBy);
        response.status(responseData.responseCode).json(responseData.data);
    } catch (error) {
        console.error(error.message);
        response.status(error.responseCode || 500).json({ error: error.message || "Internal Error" });
    }
});

app.post('/api/Employees/certificates', authorize, async (request, response) => {
    try {
        const employeeId = request.user.employeeId;
        const certificateData = request.body;
        const responseData = await insertCertificate(employeeId, certificateData);
        response.status(responseData.responseCode).json(responseData.data);
    } catch (error) {
        console.error(error.message);
        response.status(error.responseCode || 500).json({ error: error.message || "Internal Server Error" });
    }
});

app.put('/api/Employees/certificates/:certificateId', authorize, async (request, response) => {
    try {
        const employeeId = request.user.employeeId;
        const { certificateId } = request.params;
        const certificateData = request.body;
        const responseData = await editCertificate(employeeId, certificateId, certificateData);
        response.status(responseData.responseCode).json(responseData.data);
    } catch (error) {
        console.error(error.message);
        response.status(error.responseCode || 500).json({ error: error.message || "Internal Server Error" });
    }
});

app.delete('/api/Employees/certificates/:certificateId', authorize, async (request, response) => {
    try {
        const employeeId = request.user.employeeId;
        const { certificateId } = request.params;
        const deleteResponse = await deleteCertificate(employeeId, certificateId);
        response.status(deleteResponse.responseCode).json(deleteResponse.data);
    } catch (error) {
        console.error(error.message);
        response.status(error.responseCode || 404).json({ error: error.message || "Not Found" });
    }
});
app.get('/api/:employeeId/certificates/search', (request, response) => {
    response.send("");
});

app.listen(port, () => {
    console.log(`Server Started on port ${port}`);
});
