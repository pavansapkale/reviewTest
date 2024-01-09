const StatusCard= (props:{status:string})=>{
    const {status}=props
    let statusDescription=""
    if(status==="PENDING"){
        statusDescription="Repayment setup is in progress"
    }
    else if(status==="REJECTED"){
        statusDescription="Repayment setup failed, Please register again for disbursement"
    }
    else if(status === "REGISTERED"){
        statusDescription="Repayment setup is successful"
    }
    return (<div className="flex flex-col p-0  justify-between py-3 px-4  border-light-silver border-0.25 border-solid rounded-lg">
        <div className="flex justify-between">
            <p className="text-base tracking-0.08 text-granite-gray">
                    {statusDescription}
            </p>     
            {status==="PENDING" && 
                <svg className="flex  my-auto" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.3895 15.67L13.3495 12H10.6395L6.59949 15.67C5.46949 16.69 5.09949 18.26 5.64949 19.68C6.19949 21.09 7.53949 22 9.04949 22H14.9395C16.4595 22 17.7895 21.09 18.3395 19.68C18.8895 18.26 18.5195 16.69 17.3895 15.67ZM13.8195 18.14H10.1795C9.79949 18.14 9.49949 17.83 9.49949 17.46C9.49949 17.09 9.80949 16.78 10.1795 16.78H13.8195C14.1995 16.78 14.4995 17.09 14.4995 17.46C14.4995 17.83 14.1895 18.14 13.8195 18.14Z" fill="#856404" />
                    <path d="M18.3506 4.32C17.8006 2.91 16.4606 2 14.9506 2H9.05065C7.54065 2 6.20065 2.91 5.65065 4.32C5.11065 5.74 5.48065 7.31 6.61065 8.33L10.6506 12H13.3606L17.4006 8.33C18.5206 7.31 18.8906 5.74 18.3506 4.32ZM13.8206 7.23H10.1806C9.80065 7.23 9.50065 6.92 9.50065 6.55C9.50065 6.18 9.81065 5.87 10.1806 5.87H13.8206C14.2006 5.87 14.5006 6.18 14.5006 6.55C14.5006 6.92 14.1906 7.23 13.8206 7.23Z" fill="#856404" />
                </svg>
            }
            {status ==="REJECTED" && 
            <span className="flex justify-between items-center px-1 py-1 rounded-full text-sm font-medium text-white">
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g id="Cross">
                            <rect id="Rectangle" fillRule="nonzero" x="0" y="0" width="24" height="24"></rect>
                            <circle id="Oval" stroke="#721c24" strokeWidth="2" strokeLinecap="round" cx="12" cy="12" r="9"></circle>
                            <path d="M8.5,8.5 L15.5,15.5" id="Path" stroke="#721c24" strokeWidth="2" strokeLinecap="round"></path>
                            <path d="M15.5,8.5 L8.5,15.5" id="Path" stroke="#721c24" strokeWidth="2" strokeLinecap="round"></path>
                        </g>
                    </g>
                </svg>
            </span>
            }
            {status ==="REGISTERED" &&  
            <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            fill="green" 
            className="mr-2 my-auto"  
            viewBox="0 0 16 16"
            >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
            </svg>
            }
        </div>
    </div>)
}
export default StatusCard