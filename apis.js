// APIs routes

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

        next();
    } catch (err) {
        return response.status(403).json({ error: 'Forbidden: Invalid token' });
    }
}

function verifyToken(token, secretKey) {
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (error) {
        console.error('Error verifying token:', error.message);
        return null;
    }
}

app.post('/api/login', async (request, response) => {
    const { username, password } = request.body;

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

        console.log("Received registration request with data:", { employeeId, username });
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            console.error("Error: Username already exists");
            return response.status(409).json({ error: 'Username already exists' });
        }

        const registrationResponse = await registerUser(employeeId, username, password);

        console.log("Registration response:", registrationResponse);
        response.status(201).json(registrationResponse);
    } catch (error) {
        console.error("Error registering user:", error.message);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/validateToken', (req, res) => {
    const token = req.body.token;

    const isValid = verifyToken(token, secretKey);

    if (isValid) {
        res.status(200).json({ valid: true });
    } else {
        res.status(401).json({ valid: false });
    }
});

app.get('/api/Employees/certificates', authorize, async (request, response) => {
    try {
        const employeeId = request.user.employeeId;
        const { orderBy = 'IssueDate', sort = 'ASC' } = request.query;
        const responseData = await getAllCertificates(employeeId, sort, orderBy);
        const statusCode = responseData.error ? 500 : 200;
        response.status(statusCode).json(responseData);
    } catch (error) {
        console.error(error.message);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/Employees/certificates', authorize, async (request, response) => {
    try {
        const employeeId = request.user.employeeId;
        const certificateData = request.body;

        if (!certificateData || !certificateData.certificateName) {
            return response.status(400).json({ error: 'Certificate Name is required' });
        }

        const responseData = await insertCertificate(employeeId, certificateData);
        if (responseData.error) {
            if (responseData.error.includes('constraint')) {
                return response.status(400).json({ error: 'Certificate with this ID already exists' });
            }
            return response.status(500).json({ error: responseData.error });
        }

        if (responseData.rowsAffected === 0) {
            return response.status(500).json({ error: 'Failed to insert certificate' });
        }

        response.status(201).json(responseData);
    } catch (error) {
        console.error(error.message);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/Employees/certificates/:credentialId', authorize, async (request, response) => {
    try {
        const employeeId = request.user.employeeId;
        const { credentialId } = request.params;
        const certificateData = request.body;

        if (!certificateData || !certificateData.certificateName) {
            return response.status(400).json({ error: 'Certificate Name is required' });
        }

        const responseData = await editCertificate(employeeId, credentialId, certificateData);
        if (responseData.error) {
            return response.status(500).json({ error: responseData.error });
        }
        response.status(200).json(responseData);
    } catch (error) {
        console.error(error.message);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/Employees/certificates/:credentialId', authorize, async (request, response) => {
    try {
        const employeeId = request.user.employeeId;
        const { credentialId } = request.params;

        const deleteResponse = await deleteCertificate(employeeId, credentialId);
        if (deleteResponse.error) {
            return response.status(500).json({ error: deleteResponse.error });
        }

        if (deleteResponse.rowsAffected === 0) {
            return response.status(404).json({ error: 'Certificate not found' });
        }

        response.status(200).json(deleteResponse);
    } catch (error) {
        console.error(error.message);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/:employeeId/certificates/search', (request, response) => {
    response.send("");
});

app.listen(port, () => {
    console.log(`Server Started on port ${port}`);
});
