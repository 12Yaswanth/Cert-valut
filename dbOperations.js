const { connectDatabase } = require("./db.js");
const bcrypt = require('bcrypt');
let db;

async function connectDb() {
    try {
        db = await connectDatabase();
        console.log("Connected to the database");
    } catch (error) {
        console.error("Failed to connect to the database:", error.message);
        throw error;
    }
}
connectDb();

async function getAllCertificates(employeeId, sort, orderBy) {
    let response = {};
    try {
        const sql = `
            SELECT certificateId, certificateName, organisationName, issueDate, expiryDate, certificateUrl, credentialId 
            FROM employeeCertificates 
            WHERE employeeId = ? 
            ORDER BY ${orderBy} ${sort}
        `;
        const certificates = await db.all(sql, [employeeId]);
        response = { responseCode: 200, data: { certificates: certificates } };
    } catch (error) {
        console.error(error);
        response = { responseCode: 500, data: { error: error.message } };
    }
    return response;
}

async function insertCertificate(employeeId, certificateData) {
    let response = {};
    const { certificateId, certificateName, organisationName, issueDate, expiryDate, certificateUrl, credentialId } = certificateData;
    try {
        const sql = `
            INSERT INTO employeeCertificates (employeeId, certificateId, certificateName, organisationName, issueDate, expiryDate, certificateUrl, credentialId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.run(sql, [employeeId, certificateId, certificateName, organisationName, issueDate, expiryDate, certificateUrl, credentialId]);
        const insertedCertificate = await getCertificate(employeeId, certificateId);
        response = { responseCode: 201, data: insertedCertificate };
    } catch (error) {
        console.error("Error in insertCertificate:", error.message);
        if (error.message.includes('UNIQUE constraint failed')) {
            response = { responseCode: 400, data: { error: `Certificate with ID ${certificateId} already exists.` } };
        } else {
            response = { responseCode: 500, data: { error: "Failed to insert certificate data" } };
        }
    }
    return response;
}

async function editCertificate(employeeId, certificateId, certificateData) {
    let response = {};
    const { certificateName, organisationName, issueDate, expiryDate, certificateUrl, credentialId } = certificateData;
    try {
        const sql = `
            UPDATE employeeCertificates 
            SET certificateName = ?, organisationName = ?, issueDate = ?, expiryDate = ?, certificateUrl = ?, credentialId = ?
            WHERE employeeId = ? AND certificateId = ?
        `;
        await db.run(sql, [certificateName, organisationName, issueDate, expiryDate, certificateUrl, credentialId, employeeId, certificateId]);
        const updatedCertificate = await getCertificate(employeeId, certificateId);
        response = { responseCode: 200, data: updatedCertificate};
    } catch (error) {
        console.error(error.message);
        response = { responseCode: 500, data: { error: "Failed to update certificate" } };
    }
    return response;
}

async function deleteCertificate(employeeId, certificateId) {
    let response = {};
    try {
        const sql = 'DELETE FROM employeeCertificates WHERE employeeId = ? AND certificateId = ?';
        await db.run(sql, [employeeId, certificateId]);
        response = { responseCode: 200, data: { message: `Certificate with id ${certificateId} has been deleted successfully` } };
    } catch (error) {
        console.error(error.message);
        response = { responseCode: 500, data: { error: "Failed to delete certificate" } };
    }
    return response;
}

async function getCertificate(employeeId, certificateId) {
    let response = {};
    try {
        const sql = `
            SELECT certificateId, certificateName, organisationName, issueDate, expiryDate, certificateUrl 
            FROM employeeCertificates 
            WHERE employeeId = ? AND certificateId = ?
        `;
        const certificate = await db.get(sql, [employeeId, certificateId]);
        response = certificate;
    } catch (error) {
        response = { responseCode: 500, data: { error: "Failed to get certificate." } };
    }
    return response;
}


async function registerUser(employeeId, username, password) {
    let response = {};
    try {
        const hashedPassword = await bcrypt.hash(password, 10); 

        const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser) {
            response = { responseCode: 400, data: { error: 'Username already exists' } };
        } else {
            await db.run('INSERT INTO users (employeeId, username, password) VALUES (?, ?, ?)', [employeeId, username, hashedPassword]);
            response = { responseCode: 201, data: { message: 'User registered successfully' } };
        }

    } catch (error) {
        console.error("Error registering user:", error.message);
        response = { responseCode: 500, data: { error: 'Failed to register user' } };
    }
    return response;
}

async function getUserByUsername(username) {
    let user = null;
    try {
        user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    } catch (error) {
        console.error("Error fetching user by username:", error.message);
        throw error;
    }
    return user;
}

module.exports = {
    getAllCertificates,
    insertCertificate,
    editCertificate,
    deleteCertificate,
    getCertificate,
    registerUser,
    getUserByUsername
};
