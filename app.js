import express from 'express'
import cors from 'cors'
import { config } from 'dotenv';
import register from './controllers/register.js';
import loans from './controllers/loans.js'

config();
const port = process.env.PORT || 3000;
const app = express();

app.use(express.json()) // req body
app.use(cors())

//ROUTES

app.use('/user',register)
app.use('/loans',loans)

app.listen(port,()=>{
    console.log(`Working on ${port}`);
})