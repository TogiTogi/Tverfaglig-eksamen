/* Run npm i express, better-sqlite3, dotenv, express-session, bcrypt */

const multer = require('multer');
const upload = multer();
const bcrypt = require("bcrypt");
const sqlite3 = require('better-sqlite3');
const db = sqlite3('./solcellespesialisten.db', { verbose: console.log });
const session = require('express-session');
const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
dotenv.config();

const saltRounds = 10;
const staticPath = path.join(__dirname, 'public');

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.post('/login', upload.none(), (req, res) => {
    try {
        let user = checkUserPassword(req.body.username, req.body.password);
        if (user != null) {
            req.session.loggedIn = true;
            req.session.username = req.body.username;
            req.session.userrole = user.role;
            req.session.userid = user.userid;
        }
        if (user == null || !req.session.loggedIn) {
            res.status(401).json({ message: 'Unsuccessful login. Please try again.' });
        } else {
            res.json(user);
        }
    } catch {
        res.json(null);
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, "public/login.html"));
});

app.post('/register', (req, res) => {
    const reguser = req.body;
    const user = addUser(reguser.firstname, reguser.lastname, reguser.username, reguser.email, reguser.password, reguser.role);
    if (user) {
        res.redirect('/app.html');
    } else {
        res.send(false);
    }
});

app.post('/registerSolcelle', (req, res) => {
    const regSolcelle = req.body;
    const solcelle = addSolcelle(regSolcelle.name, regSolcelle.description);
    if (solcelle) {
        res.redirect('/app.html');
    } else {
        res.send(false);
    }
});

app.post('/registerPublic', (req, res) => {
    const reguser = req.body;
    const user = addUserPublic(reguser.firstname, reguser.lastname, reguser.username, reguser.email, reguser.password, reguser.role);
    if (user) {
        res.redirect('/app.html');
    } else {
        res.send(false);
    }
});

function checkUserPassword(username, password) {
    const sql = db.prepare('SELECT user.id AS userid, username, role.id AS role, password FROM user INNER JOIN role ON user.idRole = role.id WHERE username = ?');
    let user = sql.get(username);
    if (user && bcrypt.compareSync(password, user.password)) {
        return user;
    } else {
        return null;
    }
}

function checkLoggedIn(req, res, next) {
    if (!req.session.loggedIn) {
        res.sendFile(path.join(__dirname, "public/login.html"));
    } else {
        next();
    }
}

app.get('/roles', (req, res) => {
    try {
        const sql = db.prepare('SELECT * FROM role ORDER BY id DESC');
        const roles = sql.all();
        res.json({
            "message": "success",
            "data": roles
        });
    } catch (err) {
        console.error('Error fetching roles from database:', err);
        res.status(400).json({ "error": err.message });
    }
});

app.get('/User', (req, res) => {
    try {
        const sql = db.prepare('SELECT * FROM user ORDER BY idRole'); 
        const users = sql.all();
        res.json({
            "message": "success",
            "data": users
        });
    } catch (err) {
        console.error('Error fetching users from database:', err);
        res.status(400).json({ "error": err.message });
    }
});

app.put('/User/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedUser = req.body;
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
            SET firstname = ?, lastname = ?, username = ?, email = ?, idRole = ?
            WHERE id = ?
        `;
        const params = [updatedUser.firstname, updatedUser.lastname, updatedUser.username, updatedUser.email, updatedUser.idRole, id];

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

app.post('/user-add', (req, res) => {
    console.log(req.body);
    addUser(req.body.firstname, req.body.lastname, req.body.username, req.body.email, req.body.password, req.body.role);
    res.sendFile(path.join(__dirname, "public/app.html"));
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.sendFile(path.join(__dirname, "public/login.html"));
});

function addUser(firstname, lastname, username, email, password, idrole) {
    const hash = bcrypt.hashSync(password, saltRounds);
    let sql = db.prepare("INSERT INTO user (firstname, lastname, username, email, password, idrole) VALUES (?, ?, ?, ?, ?, ?)");
    const info = sql.run(firstname, lastname, firstname + "." + lastname, email, hash, idrole);

    sql = db.prepare('SELECT user.id AS userid, username, role.id AS role FROM user INNER JOIN role ON user.idRole = role.id WHERE user.id = ?');
    let rows = sql.all(info.lastInsertRowid);
    console.log("rows.length", rows.length);

    return rows[0];
}

function addUserPublic(firstname, lastname, username, email, password, idrole) {
    const hash = bcrypt.hashSync(password, saltRounds);
    let sql = db.prepare("INSERT INTO user (firstname, lastname, username, email, password, idRole) VALUES (?, ?, ?, ?, ?, ?)");
    const info = sql.run(firstname, lastname, firstname + "." + lastname, email, hash, 4);

    sql = db.prepare('SELECT user.id AS userid, username, role.id AS role FROM user INNER JOIN role ON user.idRole = role.id WHERE user.id = ?');
    let rows = sql.all(info.lastInsertRowid);
    console.log("rows.length", rows.length);

    return rows[0];
}

function addSolcelle(name, description) {
    let sql = db.prepare("INSERT INTO solcelle (name, description) VALUES (?, ?)");
    const info = sql.run(name, description);

    sql = db.prepare('SELECT * FROM solcelle WHERE id = ?');
    let rows = sql.all(info.lastInsertRowid);
    console.log("rows.length", rows.length);

    return rows[0];
}

app.get('/solcelleInfo', checkLoggedIn, (req, res) => {
    const sql = db.prepare('SELECT solcelle.id, solcelle.name, solcelle.description FROM solcelle')

    let solcelleInfo = sql.all()
    console.log(solcelleInfo)
    res.json(solcelleInfo)    
})

app.delete('/solcelleDel/:id', (req, res) => {
    const solcelleId = req.params.id;
    const sql = db.prepare('DELETE FROM solcelle WHERE id = ?');
    const result = sql.run(solcelleId);
    if (result.changes > 0) {
        res.redirect('/app.html');
    } else {
        res.status(404).json({ message: 'SolcelleInfo not found' });
    }
});

app.put('/solcelleInfo/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedSolcelle = req.body;
        const solcelle = await updateSolcelle(id, updatedSolcelle);
        res.json(solcelle);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

function updateSolcelle(id, updatedSolcelle) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE solcelle
            SET name = ?, description = ?
            WHERE id = ?
        `;
        const params = [updatedSolcelle.name, updatedSolcelle.description, id];

        const stmt = db.prepare(sql);
        const result = stmt.run(params);

        if (result.changes === 0) {
            reject(new Error('No rows updated'));
        } else {
            resolve({ id: id, ...updatedSolcelle });
        }
    });
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/currentUser', checkLoggedIn, (req, res) => {
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
