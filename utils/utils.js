export function calculateCreditScore(numEmiPaidOnTime, numLoansTaken) {
    const weightEmi = 0.7;
    const weightLoans = 0.3;
    
    const normalizedEmi = numEmiPaidOnTime / 100;
    
    const creditScore = (weightEmi * normalizedEmi * 100) + (weightLoans * (10 - numLoansTaken));
    
    return creditScore;
}


export function calculateEMI(loanAmount, tenureMonths, annualInterestRate) {
    const monthlyInterestRate = annualInterestRate / 12 / 100;

    const emi = loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenureMonths) / (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);

    return emi.toFixed(2);
}