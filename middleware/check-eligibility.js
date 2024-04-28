import client from '../db.js';
import { calculateCreditScore,calculateEMI } from '../utils/utils.js';

export const eligibilityCheckMiddleware = async(req,resp,next)=>{
    const {customer_id,loan_amount,interest_rate,tenure} = req.body;
    try {
        const data = await client.query("SELECT *,COUNT(*) OVER() AS total_rows,SUM(\"loan_amount\") OVER() AS total_loan_amount, SUM(\"emi_pod\") OVER() AS total_pod FROM loans INNER JOIN customers ON loans.customer_id = customers.customer_id WHERE loans.customer_id=$1",[customer_id])
        const creditScore = data.rows[0].total_loan_amount > data.rows[0].approved_limit ? 0 : calculateCreditScore(data.rows[0].total_pod,data.rows[0].total_rows);
        var interestRate;
        var approval;
        var message = "successful";
        switch(true){
            case creditScore > 50:
                approval = true
                interestRate = interest_rate
                break;
            case creditScore > 30:
                approval = true
                interestRate = 12
                break;
            case creditScore > 10:
                approval = true
                interestRate = 16
                break;
            default:
                approval = false
                message = "Your Credit Score is Low"
                break;
        }
        req.data = {
            customer_id : data.rows[0].customer_id,
            approval : approval,
            loan_amount : loan_amount,
            interest_rate : interest_rate,
            corrected_interest_rate : interestRate,
            tenure : tenure,
            message : message,
            monthly_installment : calculateEMI(loan_amount,tenure,interestRate)
        }
        next()
    } catch (error) {
        resp.status(500).send("server Error") ;
    }
}