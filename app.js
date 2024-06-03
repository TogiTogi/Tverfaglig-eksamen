/*Run npm i express, better-sqlite3, dotenv, express-session, bcrypt */

const multer = require('multer');
const upload = multer();
const bcrypt = require("bcrypt");
const sqlite3 = require('better-sqlite3')
const db = sqlite3('./tverfaglig.db', {verbose: console.log})
const session = require('express-session')
const dotenv = require('dotenv');


const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
dotenv.config();

const saltRounds = 10
const staticPath = path.join(__dirname, 'public')
    
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))


app.post('/login', upload.none(), (req, res) => {
    try {
        let user = checkUserPassword(req.body.username, req.body.password)
        if ( user != null) {
            req.session.loggedIn = true
            req.session.username = req.body.username
            req.session.userrole = user.role
            req.session.userid = user.userid

    
        //res.redirect('/');
        // Pseudocode - Adjust according to your actual frontend framework or vanilla JS
 
        } 
        if (user == null || !req.session.loggedIn) {
            res.status(401).json({ message: 'Unsuccessful login. Please try again.' });
        }
        else {res.json(user)}
    }
    catch {
       
       res.json(null);
    }

})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, "public/login.html"));
});


app.post('/register', (req, res) => {
    const reguser = req.body;
    const user = addUser(reguser.firstname, reguser.lastname, reguser.username, reguser.email, reguser.tel, reguser.address, reguser.password, reguser.role, reguser.klasse);
    if (user) {
        res.redirect('/app.html');
    } else {
        res.send(false);
    }
});



function checkUserPassword(username, password){
    const sql = db.prepare('SELECT user.id AS userid, username, role.id AS role, password FROM user INNER JOIN role ON user.idRole = role.id WHERE username = ?');
    let user = sql.get(username);
if (user && bcrypt.compareSync(password, user.password)) {
        return user 
    } else {
        return null;
    }
}

function checkLoggedIn(req, res, next) {
    if (!req.session.loggedIn) {
        res.sendFile(path.join(__dirname, "\public\\login.html"));
    } else {
        next();
    }
    
}

app.get('/roles', (req, res) => {
    try {
        const sql = db.prepare('SELECT * FROM role ORDER BY id DESC');
        const roles = sql.all();
        res.json({
            "message":"success",
            "data":roles
        });
    } catch (err) {
        console.error('Error fetching roles from database:', err);
        res.status(400).json({"error": err.message});
    }
});

app.get('/klasse', (req, res) => {
    try {
        const sql = db.prepare('SELECT * FROM klasse ORDER BY id DESC');
        const klasser = sql.all();
        res.json({
            "message":"success",
            "data":klasser
        });
    } catch (err) {
        console.error('Error fetching klasser from database:', err);
        res.status(400).json({"error": err.message});
    }
});

app.get('/User', (req, res) => {
    try {
        const sql = db.prepare('SELECT * FROM user ORDER BY idRole, idKlasse DESC'); //SORT BY ROLE FIRST, THEN KLASSE. REMEMBER IF QUESTIONS
        const users = sql.all();
        res.json({
            "message":"success",
            "data":users
        });
    } catch (err) {
        console.error('Error fetching users from database:', err);
        res.status(400).json({"error": err.message});
    }
});

app.put('/User/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedUser = req.body;
        // It takes the user's id and the new data as parameters
        // And returns the updated user
        const user = await updateUser(id, updatedUser);
        
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

function updateUser(id, updatedUser) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE user
            SET firstname = ?, lastname = ?, username = ?, email = ?, tel = ?, address = ?, idKlasse = ?, idRole = ?
            WHERE id = ?
        `;
        const params = [updatedUser.firstname, updatedUser.lastname, updatedUser.username, updatedUser.email, updatedUser.tel, updatedUser.address, updatedUser.idKlasse, updatedUser.idRole, id];

        const stmt = db.prepare(sql);
        const result = stmt.run(params);

        if (result.changes === 0) {
            reject(new Error('No rows updated'));
        } else {
            resolve({ id: id, ...updatedUser });
        }
    });
}

app.delete('/userDel/:id', (req, res) => {
    const userId = req.params.id;
    const sql = db.prepare('DELETE FROM user WHERE id = ?');
    const result = sql.run(userId);
    if (result.changes > 0) {
        res.redirect('/app.html');
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

//user-add er kanskje useless
app.post('/user-add', (req, res) => {
    console.log(req.body)
    addUser(req.body.username, req.body.password)
    res.sendFile(path.join(__dirname, "public/app.html"));
     
});

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.sendFile(path.join(__dirname, "public/login.html"));
})


function addUser(firstname, lastname, username, email, tel, address, password, idrole, idklasse){
    const hash = bcrypt.hashSync(password, saltRounds)
    let sql = db.prepare("INSERT INTO user (firstname, lastname, username, email, tel, address, password, idrole, idklasse) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    const info = sql.run(firstname, lastname, firstname +"."+ lastname, email, tel, address, hash, idrole, idklasse)
    
    //sql=db.prepare('select user.id as userid, username, task.id as taskid, timedone, task.name as task, task.points from done inner join task on done.idtask = task.id where iduser = ?)')
    sql = db.prepare('SELECT user.id AS userid, username, role.id AS role, klasse.id AS klasse FROM user INNER JOIN role ON user.idRole = role.id, klasse ON user.idKlasse = klasse.id WHERE user.id = ?');
    let rows = sql.all(info.lastInsertRowid)  
    console.log("rows.length", rows.length)

    return rows[0]
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/currentUser', checkLoggedIn,  (req, res) => {// This will log the userid to the console
    console.log(`User ID: ${req.session.userid}`);
    console.log(`Username: ${req.session.username}`);
    console.log(`UserRole: ${req.session.userrole}`);
    res.send([req.session.userid, req.session.username, req.session.userrole]);
});

app.get('/', checkLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/app.html', checkLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/app.html'));
});

app.listen(3000, () => {
    console.log('Server is running on localhost:3000');
});