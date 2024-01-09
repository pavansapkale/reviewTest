import { useContext, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { RootContext } from "../../utils/RootContext"

const Loan = (props: { stage: string }) => {
    const { state } = useLocation()    

    const [ sessionData, sessionDispatch ] = useContext(RootContext)
    useEffect(() => {
        sessionDispatch({type: 'UPDATE', data: {isLoanDisbursed: true}})
    },[])
    
    const customerName = state?.variables?.customer_name
    const applicationNumber = state?.variables?.application_number
    const loanAmount = state?.variables?.loan_amount
    const roiInPercent = state?.variables?.roi_in_percent
    const nextEmiDate = (state?.variables?.next_emi_date).split("T")[0]
    const emiAmount = state?.variables?.emi_amount
    const loanAgreementPdf = state?.variables?.sanction_letter
    const repaymentSchedulePdf = state?.variables?.repayment_schedule
    const statementOfAccountBase64 = state?.variables?.statement_of_account_base64

    //ON CLICK DOWNLOAD LOAN AGREEMENT
    const onClickDownloadLoanAgreement = () => {
        window.open(loanAgreementPdf, "_blank")
    }
    //ON CLICK DOWNLOAD REPAYMENT SCHEDULE
    const onClickDownloadRepaymentSchedule = () => {
        window.open(repaymentSchedulePdf, "_blank")
    }    
    //ON CLICK DOWNLOAD STATEMENT OF ACCOUNT
    const onClickDownloadStatementOfAccount = () => {
        window.open("data:application/pdf;base64," + statementOfAccountBase64, "_blank")
    }

    //ON CLICK PAY NOW
    const onClickPayNow =()=>{
        window.open("https://app.protium.co.in/", "_blank")
    }

    return <div>
                {/* CONTENT */}
                <div className="p-5 flex flex-col" >
                     {/* HEADER  */}
                    <div className="flex mb-5">
                    <svg
                            width="32"
                            height="32"
                            viewBox="0 0 28 28"
                            fill="none"
                        >
                            <path
                                opacity="0.4"
                                d="M27.3337 14C27.3337 18.0178 25.5565 21.6206 22.7454 24.0651C20.4044 26.1008 17.3463 27.3333 14.0003 27.3333C10.6544 27.3333 7.59624 26.1008 5.25521 24.0651C2.44412 21.6206 0.666992 18.0178 0.666992 14C0.666992 6.63619 6.63653 0.666656 14.0003 0.666656C21.3641 0.666656 27.3337 6.63619 27.3337 14Z"
                                fill="#2C3D6F"
                            />
                            <ellipse cx="14" cy="11.3333" rx="4" ry="4" fill="#2C3D6F" />
                            <path
                                d="M22.7451 24.0651C21.4205 20.5224 18.0048 18 14 18C9.99516 18 6.57946 20.5223 5.25488 24.0651C7.59591 26.1008 10.654 27.3333 14 27.3333C17.346 27.3333 20.4041 26.1008 22.7451 24.0651Z"
                                fill="#2C3D6F"
                            />
                        </svg>
                        <h1 className=" ml-6 font-semibold overflow-hidden text-ellipsis text-base leading-4 my-auto">
                            { customerName ? `Welcome ${customerName}` : "Welcome back!" }
                        </h1>
                    </div>
                    <p className="text-xs text-granite-gray mb-4">APPLICATION NUMBER : <span>{applicationNumber}</span></p>
                    
                    {/* LOAN DETAILS */}
                    <div className="p-6 flex flex-col bg-white rounded-lg gap-4">
                        <p className=" font-bold text-xl leading-6 -tracking-0.04 mb-1">Loan Details</p>
                        <div className="flex text-base justify-between">
                            <p className="tracking-0.08">Loan amount</p>
                            <p className="leading-5 -tracking-0.04 font-semibold">₹ {loanAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex text-base justify-between gap-4">
                            <p className="tracking-0.08">ROI</p>
                            <p className="leading-5 -tracking-0.04 font-semibold">{roiInPercent}%</p>
                        </div>
                        <div className="flex text-base justify-between gap-4">
                            <p className="tracking-0.08">Next EMI date</p>
                            <p className="leading-5 -tracking-0.04 font-semibold">{nextEmiDate}</p>
                        </div>
                        <div className="flex text-base justify-between gap-4">
                            <p className="tracking-0.08">EMI amount</p>
                            <p className="leading-5 -tracking-0.04 font-semibold">₹ {emiAmount.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                    {/* DOCUMENT DOWNLOAD*/}
                    <div
                        className="my-6 flex justify-between items-center py-3 px-4  h-16  border-light-silver border-0.25 border-solid rounded-lg"
                        onClick={()=>{onClickDownloadLoanAgreement()}}
                    >
                        <p className="font-bold w-52 leading-5 -tracking-0.04">
                        Loan agreement
                        </p>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path opacity="0.4" d="M16.4405 8.89999C20.0405 9.20999 21.5105 11.06 21.5105 15.11V15.24C21.5105 19.71 19.7205 21.5 15.2505 21.5H8.74047C4.27047 21.5 2.48047 19.71 2.48047 15.24V15.11C2.48047 11.09 3.93047 9.23999 7.47047 8.90999" fill="#293B75" />
                            <path d="M12 2V14.88" stroke="#293B75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M15.3504 12.65L12.0004 16L8.65039 12.65" stroke="#293B75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div
                        className="mb-6 flex justify-between items-center py-3 px-4 h-16  border-light-silver border-0.25 border-solid rounded-lg"
                        onClick={onClickDownloadRepaymentSchedule}
                    >
                        <p className="font-bold w-52 leading-5 -tracking-0.04">
                        Repayment schedule
                        </p>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path opacity="0.4" d="M16.4405 8.89999C20.0405 9.20999 21.5105 11.06 21.5105 15.11V15.24C21.5105 19.71 19.7205 21.5 15.2505 21.5H8.74047C4.27047 21.5 2.48047 19.71 2.48047 15.24V15.11C2.48047 11.09 3.93047 9.23999 7.47047 8.90999" fill="#293B75" />
                            <path d="M12 2V14.88" stroke="#293B75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M15.3504 12.65L12.0004 16L8.65039 12.65" stroke="#293B75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    { statementOfAccountBase64 !== "" &&
                        <div
                            className="mb-4 flex justify-between items-center py-3 px-4 h-16  border-light-silver border-0.25 border-solid rounded-lg"
                            onClick={onClickDownloadStatementOfAccount}
                        >
                            <p className="font-bold w-52 leading-5 -tracking-0.04">
                            Statement of account
                            </p>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.4" d="M16.4405 8.89999C20.0405 9.20999 21.5105 11.06 21.5105 15.11V15.24C21.5105 19.71 19.7205 21.5 15.2505 21.5H8.74047C4.27047 21.5 2.48047 19.71 2.48047 15.24V15.11C2.48047 11.09 3.93047 9.23999 7.47047 8.90999" fill="#293B75" />
                                <path d="M12 2V14.88" stroke="#293B75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15.3504 12.65L12.0004 16L8.65039 12.65" stroke="#293B75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    }
                    {/* <p className="text-center text-xs text-secondary mb-17">For any other queries, please call us on <span className="text-primary font-bold cursor-pointer" onClick={()=>{window.location.href='tel:9953826055'}}>99538 26055</span></p> */}
                </div>
                <div className="fixed-button max-w-md">
                    <button
                    className={"h-14 w-full rounded-lg text-white font-bold text-lg bg-primary max-w-md "}
                    onClick={onClickPayNow}
                    >
                    PAY NOW
                    </button>
                </div>
            </div>
}

export default Loan