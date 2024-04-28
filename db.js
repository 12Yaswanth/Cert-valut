// DataBase Connection

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

async function ConnectDatabase() {
    try {
        const db = await sqlite.open({
            driver: sqlite3.Database,
            filename: 'Project.db'  
        });
        return db;
    } catch (error) {
        console.error("Error connecting to the database:", error.message);
        throw error; 
    }
}

module.exports = { ConnectDatabase }