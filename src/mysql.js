import mysql from 'mysql'

const pool = mysql.createPool({
    "user": "root",
    "password": "jos23mar22",
    "database": "whats-app-project",
    "host": "localhost",
    "port": 3306
})

export {pool}