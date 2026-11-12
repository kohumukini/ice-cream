import express, { json } from 'express'; 
import dotenv from 'dotenv'; 
import mysql2 from 'mysql2';

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

app.set("view engine", 'ejs');

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/confirm-order', async (req, res) => {
    try {
        const order = req.body; 
        console.log('New order submitted:', order); 

        order.toppings = Array.isArray(order.toppings) ?
            order.toppings.join(", ") : ""; 

        const sql = 'INSERT INTO orders(customer, email, flavor, cone, toppings, comment) VALUES (?, ?, ?, ?, ?, ?)';

        const params = [
            order.customer, 
            order.email, 
            order.flavor, 
            order.cone, 
            order.toppings, 
            order.comment
        ];

        const[result] = result.insertId; 
        console.log('Order saved with ID: ' + order.id); 

        res.render('confirm', { order }); 
    } catch (err) {
        console.error('Error saving order:', err);
        res.status(500).send(`Sorry, there was an error processing your order. Please try again.`)
    }
})

app.get('/admin', async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY timestamp DESC');
        res.render('admin', { orders });
    } catch (err) {
        console.error('Database Error:', err); 
        res.status(500).send('Error loading orders: ' + err.message); 
    }
})

app.get('/db-test', async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders');
        res.send(orders); 
    } catch (err) {
        console.error('Database Error:', err);
        res.status(500).send('Database Error: ' + err.message); 
    }
})  

app.post('/submit-order', (req, res) => {
    const order = req.body;
    order['timestamp'] = new Date(); 

    console.log(order);

    orders.push(order);
    res.render('confirm', { order });
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})