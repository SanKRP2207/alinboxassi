const mysql =  require('mysql');

const conn = mysql.createConnection({
    host:'localhost',
    user:"root",
    password:"",
    database:"assingment"
});

conn.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }

    console.log('Connected to MySQL as id', conn.threadId);
});

module.exports = conn;
