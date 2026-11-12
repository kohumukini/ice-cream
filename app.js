import express from 'express'; 
import dotenv from 'dotenv'; 
import mysql2 from 'mysql2';

dotenv.config(); 

const pool = mysql2.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    port: process.env.DB_PORT
})

const app = express(); 

const PORT = 3001; 
const orders = [];

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", 'ejs');

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/confirm-order', (req, res) => {
    res.render('confirm')
})

app.get('/admin', (req, res) => {
    res.render('admin', { orders });
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