import e, { Router } from 'express'
import client from '../db.js';
import { eligibilityCheckMiddleware } from '../middleware/check-eligibility.js';

const router = Router();

router.post('/create-loan',eligibilityCheckMiddleware,async(req,resp)=>{
    try {
        const data = req.data
        const doa = new Date();
        const ed = new Date();
        ed.setMonth(ed.getMonth() + data.tenure);
        const formattedDate = ed.toISOString().split('T')[0];
        const response = await client.query("INSERT INTO loans (customer_id,loan_id,loan_amount,tenure,interest_rate,monthly_installment,emi_pod,doa,ed) VALUES ($1,NEXTVAL('loan_id_seq'),$2,$3,$4,$5,0,$6,$7) RETURNING *",[data.customer_id,data.loan_amount,data.tenure,data.interest_rate,data.monthly_installment,doa.toISOString().split('T')[0],formattedDate])
        resp.status(200).json({
            loan_id : response.rows[0].loan_id,
            customer_id: response.rows[0].customer_id,
            loan_approved: data.approval,
            message:req.message,
            monthly_installment: response.rows[0].monthly_installment
        })
    } catch (error) {
        console.log(error)
        resp.status(500).send("server Error") ;
    }
})

router.get('/view-loan/:loan_id',async(req,resp)=>{
    try {
        const {loan_id} = req.params
        const response = await client.query("SELECT * FROM loans INNER JOIN customers ON loans.customer_id = customers.customer_id WHERE loans.loan_id = $1",[loan_id])
        if(response.rowCount == 0){
            resp.status(404).send("loan details not found")
        }
        resp.status(200).json({
            loan_id : response.rows[0].loan_id,
            customer: {
                customer_id : response.rows[0].customer_id,
                first_name : response.rows[0].first_name,
                last_name : response.rows[0].last_name,
                phone_number : response.rows[0].phone_number,
                age : response.rows[0].age
            },
            loan_amount : response.rows[0].loan_amount,
            interest_rate: response.rows[0].interest_rate,
            monthly_installment: response.rows[0].monthly_installment,
            tenure : response.rows[0].tenure,
        })
    } catch (error) {
        resp.status(500).send("server Error") ;
    }
})

router.post('/make-payment',async(req,resp)=>{
    const {loan_id,customer_id,amount} = req.body;
    try {
        const response = await client.query("INSERT INTO transactions (customer_id,loan_id,transaction_time,amount_paid) VALUES ($1,$2,CURRENT_TIMESTAMP,$3)",[customer_id,loan_id,amount])
        if(response.rowCount == 0){
            resp.status(404).send("loan details not found")
        }
        resp.status(200).json({
            message : "sucessfully"
        })
    } catch (error) {
        console.log(error)
        resp.status(500).send("server Error") ;
    }
})

router.get('/view-statement/:customer_id/:loan_id',async(req,resp)=>{
    const {loan_id,customer_id} = req.params;
    try {
        const response = await client.query("SELECT *,COUNT(*) OVER() AS total_rows,SUM(\"amount_paid\") OVER() AS total_paid_amount FROM transactions INNER JOIN loans ON transactions.loan_id = loans.loan_id WHERE transactions.loan_id = $1",[loan_id])
        if(response.rowCount == 0){
            resp.status(404).send("loan details not found")
        }
        resp.status(200).json({
            customer_id: customer_id,
            loan_id: loan_id,
            principle : response.rows[0].loan_amount,
            interest_rate: response.rows[0].interest_rate,
            amount_paid: response.rows[0].total_paid_amount,
            monthly_installment : response.rows[0].monthly_installment,
            repayment_left : response.rows[0].tenure - response.rows[0].total_rows
        })
    } catch (error) {
        console.log(error)
        resp.status(500).send("server Error") ;
    }
})

router.post('/create-loan',eligibilityCheckMiddleware,async(req,resp)=>{
    try {
        const data = req.data
        const doa = new Date();
        const ed = new Date();
        ed.setMonth(ed.getMonth() + data.tenure);
        const formattedDate = ed.toISOString().split('T')[0];
        const response = await client.query("INSERT INTO loans (customer_id,loan_id,loan_amount,tenure,interest_rate,monthly_installment,emi_pod,doa,ed) VALUES ($1,NEXTVAL('loan_id_seq'),$2,$3,$4,$5,0,$6,$7) RETURNING *",[data.customer_id,data.loan_amount,data.tenure,data.interest_rate,data.monthly_installment,doa.toISOString().split('T')[0],formattedDate])
        resp.status(200).json({
            loan_id : response.rows[0].loan_id,
            customer_id: response.rows[0].customer_id,
            loan_approved: data.approval,
            message:"message",
            monthly_installment: response.rows[0].monthly_installment
        })
    } catch (error) {
        console.log(error)
        resp.status(500).send("server Error") ;
    }
})

router.post('/check-eligibility',eligibilityCheckMiddleware,async(req,resp)=>{
    try {
        resp.status(200).json(req.data)
    } catch (error) {
        resp.status(500).send("server Error") ;
    }
})

export default router