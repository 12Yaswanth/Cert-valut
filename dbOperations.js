// db operations

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
    try {
        const sql = `
            SELECT certificateName, organisationName, issueDate, expiryDate, certificateUrl, credentialId 
            FROM employeeCertificates 
            WHERE employeeId = ? 
            ORDER BY ${orderBy} ${sort}
        `;
        const certificates = await db.all(sql, [employeeId]);
        return { certificates };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function insertCertificate(employeeId, certificateData) {
    const { certificateName, organisationName, issueDate, expiryDate, certificateUrl, credentialId } = certificateData;
    try {
        const sql = `
            INSERT INTO employeeCertificates (employeeId, certificateName, organisationName, issueDate, expiryDate, certificateUrl, credentialId)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.run(sql, [employeeId, certificateName, organisationName, issueDate, expiryDate, certificateUrl, credentialId]);
        const insertedCertificate = await getCertificate(employeeId, credentialId);
        return insertedCertificate;
    } catch (error) {
        console.error("Error in insertCertificate:", error.message);
        throw error;
    }
}

async function editCertificate(employeeId, credentialId, certificateData) {
    const { certificateName, organisationName, issueDate, expiryDate, certificateUrl } = certificateData;
    try {
        const sql = `
            UPDATE employeeCertificates 
            SET certificateName = ?, organisationName = ?, issueDate = ?, expiryDate = ?, certificateUrl = ?
            WHERE employeeId = ? AND credentialId = ?
        `;
        await db.run(sql, [certificateName, organisationName, issueDate, expiryDate, certificateUrl, employeeId, credentialId]);
        const updatedCertificate = await getCertificate(employeeId, credentialId);
        return updatedCertificate;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

async function deleteCertificate(employeeId, credentialId) {
    try {
        const sql = 'DELETE FROM employeeCertificates WHERE employeeId = ? AND credentialId = ?';
        await db.run(sql, [employeeId, credentialId]);
        return { message: `Certificate with Credential ID ${credentialId} has been deleted successfully` };
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

async function getCertificate(employeeId, credentialId) {
    try {
        const sql = `
            SELECT certificateName, organisationName, issueDate, expiryDate, certificateUrl 
            FROM employeeCertificates 
            WHERE employeeId = ? AND credentialId = ?
        `;
        const certificate = await db.get(sql, [employeeId, credentialId]);
        return certificate;
    } catch (error) {
        console.error("Error getting certificate:", error.message);
        throw error;
    }
}

async function registerUser(employeeId, username, password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10); 

        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return { error: `Username ${username} already exists` };
        } else {
            await db.run('INSERT INTO users (employeeId, username, password) VALUES (?, ?, ?)', [employeeId, username, hashedPassword]);
            return { message: 'User registered successfully' };
        }
    } catch (error) {
        console.error("Error registering user:", error.message);
        throw error;
    }
}

async function getUserByUsername(username) {
    try {
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        return user;
    } catch (error) {
        console.error("Error fetching user by username:", error.message);
        throw error;
    }
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
