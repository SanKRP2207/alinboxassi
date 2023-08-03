const express = require('express');
const app = express();

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

const mysqlConn = require('./mysqlconfig');

mysqlConn.on('error', (err) => {
    console.error('MySQL Connection Error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Reconnecting to MySQL...');
        mysqlConn.connect();
    }
});

const multer = require('multer');

// Set up multer storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/home', (req, resp) => {
    resp.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/contact', upload.single('profilePicture'), (req, resp) => {
    // console.log(req.body);

    if (req.file) {
        const filePath = req.file.path;
        console.log('File path:', filePath);
    } else {
        console.log('No file uploaded.');
    }

    const data = {
        name: req.body.Uname,
        email: req.body.Uemail,
        password: req.body.Upassword,
        profile_picture: req.file ? req.file.path : null
    };
    mysqlConn.query('INsert INTO user SET ?', data, (error, result, fields) => {
        if (error) {
            console.error('Error occurred:', error);
            resp.status(500).json({ success: false });
        } else {
            // Successful registration, send JSON response
            resp.json({ success: true });
        }
    });
    

});

app.get('/user', (req, resp) => {
    resp.sendFile(path.join(__dirname, 'public', 'users.html'));
});

app.get('/users', (req, resp) => {

    const sql = 'SELECT * FROM user';

    mysqlConn.query(sql, (error, results, fields) => {
        if (error) {
            console.error('Error occurred:', error);
            resp.status(500).send('An error occurred while fetching data.');
        } else {
            // Set the response header to indicate JSON data
            resp.setHeader('Content-Type', 'application/json');
            resp.json(results);
        }
    });
});


app.listen(4500);