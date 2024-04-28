const { ConnectDatabase } = require("./db.js");
let db;

async function ConnectDb() {
    try {
        db = await ConnectDatabase();
        console.log("Connected to the database");
    } catch (error) {
        console.error("Failed to connect to the database:", error.message);
        throw error;
    }
}
ConnectDb();

async function GetAllCertificates(EmployeeId, Sort, OrderBy) {
    let response = {};
    try {
        const sql = `
            SELECT CertificateId, CertificateName, OrganisationName, IssueDate, ExpiryDate, CertificateUrl 
            FROM EmployeeCertificates 
            WHERE EmployeeId = ? 
            ORDER BY ${OrderBy} ${Sort}
        `;
        const certificates = await db.all(sql, [EmployeeId]);
        response = { ResponseCode: 200, Data: { Certificates: certificates } };
    } catch (error) {
        console.error(error);
        response = { ResponseCode: 500, Data: { Error: error.message } };
    }
    return response;
}

async function InsertCertificate(EmployeeId, certificateData) {
    let response = {};
    const { CertificateId, CertificateName, OrganisationName, IssueDate, ExpiryDate, CertificateUrl } = certificateData;
    try {
        const sql = `
            INSERT INTO EmployeeCertificates (EmployeeId, CertificateId, CertificateName, OrganisationName, IssueDate, ExpiryDate, CertificateUrl)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.run(sql, [EmployeeId, CertificateId, CertificateName, OrganisationName, IssueDate, ExpiryDate, CertificateUrl]);
        const insertedCertificate = await GetCertificate(EmployeeId, CertificateId);
        response = { ResponseCode: 201, Data: insertedCertificate };
    } catch (error) {
        console.error("Error in InsertCertificate:", error.message);
        if (error.message.includes('UNIQUE constraint failed')) {
            response = { ResponseCode: 400, Data: { Error: `Certificate with ID ${CertificateId} already exists.` } };
        } else {
            response = { ResponseCode: 500, Data: { Error: "Failed to insert certificate data" } };
        }
    }
    return response;
}

async function EditCertificate(EmployeeId, CertificateId, certificateData) {
    let response = {};
    const { CertificateName, OrganisationName, IssueDate, ExpiryDate, CertificateUrl } = certificateData;
    try {
        const sql = `
            UPDATE EmployeeCertificates 
            SET CertificateName = ?, OrganisationName = ?, IssueDate = ?, ExpiryDate = ?, CertificateUrl = ?
            WHERE EmployeeId = ? AND CertificateId = ?
        `;
        await db.run(sql, [CertificateName, OrganisationName, IssueDate, ExpiryDate, CertificateUrl, EmployeeId, CertificateId]);
        const updatedCertificate = await GetCertificate(EmployeeId, CertificateId);
        response = { ResponseCode: 200, Data: updatedCertificate};
    } catch (error) {
        console.error(error.message);
        response = { ResponseCode: 500, Data: { Error: "Failed to update certificate" } };
    }
    return response;
}

async function DeleteCertificate(EmployeeId, CertificateId) {
    let response = {};
    try {
        const sql = 'DELETE FROM EmployeeCertificates WHERE EmployeeId = ? AND CertificateId = ?';
        await db.run(sql, [EmployeeId, CertificateId]);
        response = { ResponseCode: 200, Data: { Message: `Certificate with id ${CertificateId} has been deleted successfully` } };
    } catch (error) {
        console.error(error.message);
        response = { ResponseCode: 500, Data: { Error: "Failed to delete certificate" } };
    }
    return response;
}

async function GetCertificate(EmployeeId, CertificateId) {
    let response = {};
    try {
        const sql = `
            SELECT CertificateId, CertificateName, OrganisationName, IssueDate, ExpiryDate, CertificateUrl 
            FROM EmployeeCertificates 
            WHERE EmployeeId = ? AND CertificateId = ?
        `;
        const certificate = await db.get(sql, [EmployeeId, CertificateId]);
        response = certificate;
    } catch (error) {
        response = { ResponseCode: 500, Data: { Error: "Failed to get certificate." } };
    }
    return response;
}

module.exports = {
    GetAllCertificates,
    InsertCertificate,
    EditCertificate,
    DeleteCertificate,
    GetCertificate
};
