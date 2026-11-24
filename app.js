import express, { json } from 'express'; 
import dotenv from 'dotenv'; 
import mysql2 from 'mysql2';
import session from 'express-session';

dotenv.config(); 

const pool = mysql2.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    port: process.env.DB_PORT
}).promise()

const app = express(); 

const PORT = 3001; 
const orders = [];

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: false, 
    cookie: { maxAge: 1000 * 60 * 60 }
}));

function requireLogin(req, res, next) {
    if (req.session.loggedIn) next(); 
    else res.redirect('/login'); 
}

app.set("view engine", 'ejs');

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/confirm-order', (req, res) => {
    res.render("confirm")
})

app.get('/admin', requireLogin, async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY timestamp DESC');
        res.render('admin', { orders });
    } catch (err) {
        console.error('Database Error:', err); 
        res.status(500).send('Error loading orders: ' + err.message); 
    }
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.post('/submit-order', async (req, res) => {
    try {
        const order = req.body; 
        console.log('New order submitted:', order); 

        order.toppings = Array.isArray(order.toppings) ?
            order.toppings.join(", ") : ""; 

        const sql = 'INSERT INTO orders(customer, email, flavor, cone, toppings, comment) VALUES (?, ?, ?, ?, ?, ?)';

        const params = [
            order.name, 
            order.email, 
            order.flavor, 
            order.cone, 
            order.toppings, 
            order.comment
        ];

        const[result] = await pool.query(sql, params);
        
        order.id = result.insertId;
        console.log('Order saved with ID: ' + order.id); 

        res.render('confirm', { order }); 
    } catch (err) {
        console.error('Error saving order:', err);
        res.status(500).send(`Sorry, there was an error processing your order. Please try again.`)
    }
});

app.post('/login', (req, res) => {
    const username = req.body.username; 
    const password = req.body.password; 

    if (username === process.env.ADMIN_USER && 
        password === process.env.ADMIN_PASSWORD) {
            req.session.loggedIn = true; 
            res.redirect('/admin'); 
        } else {
            res.render('login', { error: "Invalid username or password." })
        }
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});