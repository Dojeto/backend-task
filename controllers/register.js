import { Router } from 'express'
import client from '../db.js';

const router = Router();

router.post('/register', async (req, resp) => {
    const { first_name, last_name, age, monthly_income, phone_number } = req.body;
    try {
        const approved_limit = 36 * monthly_income
        const customer = await client.query("INSERT INTO customers (customer_id,first_name,last_name,age,phone_number,monthly_salary,approved_limit,current_debt) VALUES (NEXTVAL('my_sequence'),$1,$2,$3,$4,$5,$6,100000000) RETURNING *", [first_name, last_name, age, phone_number, monthly_income, approved_limit])
        resp.json({
            customer_id : customer.rows[0].customer_id,
            name : customer.rows[0].first_name + " " + customer.rows[0].last_name,
            age : customer.rows[0].age,
            monthly_income : customer.rows[0].monthly_income,
            approved_limit : customer.rows[0].approved_limit,
            phone_number : customer.rows[0].phone_number
        })
    } catch (error) {
        resp.status(500).send("server Error") ;
    }
})

export default router;