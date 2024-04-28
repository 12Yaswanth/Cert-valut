// APIs endpoints

const express = require('express');
const cors = require('cors'); 

const { GetAllCertificates, InsertCertificate, EditCertificate, DeleteCertificate } = require("./dbOperations.js");

const app = express();
const port = 9393;

app.use(cors()); 
app.use(express.json());

app.get('/api/:EmployeeId/certificates', async (request, response) => {
    try {
        const  EmployeeId  = request.params.EmployeeId;
        const { OrderBy = 'IssueDate', Sort = 'ASC' } = request.query;
        const ResponseData = await GetAllCertificates(EmployeeId, Sort, OrderBy);
        response.status(ResponseData.ResponseCode).json(ResponseData.Data);
    } catch (error) {
        console.error(error.message);
        response.status(error.ResponseCode || 500).json({ Error: error.message || "Internal Error" });
    }
});

app.post('/api/:EmployeeId/certificates', async (request, response) => {
    try {
        const  EmployeeId  = request.params.EmployeeId;
        const certificateData = request.body;
        const ResponseData = await InsertCertificate(EmployeeId, certificateData);
        response.status(ResponseData.ResponseCode).json(ResponseData.Data);
    } catch (error) {
        console.error(error.message);
        response.status(error.ResponseCode || 500).json({ Error: error.message || "Internal Server Error" });
    }
});
app.put('/api/:EmployeeId/certificates/:CertificateId', async (request, response) => {
    try {
        const { EmployeeId, CertificateId } = request.params;
        const certificateData = request.body;
        const  ResponseData = await EditCertificate(EmployeeId, CertificateId, certificateData);
        response.status(ResponseData.ResponseCode).json(ResponseData.Data);
    } catch (error) {
        console.error(error.message);
        response.status(error.ResponseCode || 500).json({ Error: error.message || "Internal Server Error" });
    }
});


app.delete('/api/:EmployeeId/certificates/:CertificateId', async (request, response) => {
    try {
        const { EmployeeId, CertificateId } = request.params;
        const deleteResponse = await DeleteCertificate(EmployeeId, CertificateId);
        response.status(deleteResponse.ResponseCode).json(deleteResponse.Data);
    } catch (error) {
        console.error(error.message);
        response.status(error.ResponseCode || 404).json({ Error: error.message || "Not Found" });
    }
});

app.get('/api/:EmployeeId/certificates/search', (request, response) => {
    response.send("");
});

app.listen(port, () => {
    console.log(`Server Started on port ${port}`);
});
