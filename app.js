const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const Customer = require('./models/Customer');
const bcrypt=require('bcryptjs');

const app = express();
mongoose.connect('mongodb://localhost:27017/tailor');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => res.render('login'));
app.post('/login', (req, res) => res.redirect('/customer'));


let tempData = {};
app.get('/customer', (req, res) => res.render('customer'));
app.post('/customer', (req, res) => {
  tempData = { ...tempData, ...req.body };
  res.redirect('/gender');
});
app.get('/customers', async (req, res) => {
  const nameQuery = req.query.name;

  if (nameQuery) {
    const customer = await Customer.findOne({ name: nameQuery });

    if (customer) {
      
      const cleanCustomer = {
        ...customer.toObject(),
        measurements: { ...customer.measurements.toObject() }
      };

      
      res.render('customer-details', { customer: cleanCustomer });
    } else {
      const customers = await Customer.find();
      res.render('customers', { customers, message: 'Customer not found.' });
    }
  } else {
    const customers = await Customer.find();
    res.render('customers', { customers, message: null });
  }
});



app.get('/gender', (req, res) => res.render('gender'));
app.post('/gender', (req, res) => {
  tempData.gender = req.body.gender;
  res.redirect('/dress');
});


app.get('/dress', (req, res) => res.render('dress'));
app.post('/dress', (req, res) => {
  tempData.dressType = req.body.dressType;
  res.redirect('/measurements');
});


app.get('/measurements', (req, res) => res.render('measurements'));
app.post('/measurements', (req, res) => {
  tempData.measurements = req.body;
  res.redirect('/payment');
});


app.get('/payment', (req, res) => res.render('payment'));
app.post('/payment', async (req, res) => {
  tempData.payment = req.body;
  const customer = new Customer(tempData);
  await customer.save();
  res.redirect('/order');
});


app.get('/order', async (req, res) => {
  const lastCustomer = await Customer.findOne().sort({ _id: -1 });
  res.render('order', { customer: lastCustomer });
});


app.get('/customers', async (req, res) => {
  const customers = await Customer.find();
  res.render('customers', { customers });
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));