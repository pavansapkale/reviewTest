// @ts-nocheck
import { useEffect, useState } from "react"

interface Props {
    setShowOverlayTimeline: (showProfile: boolean) => void,
    timelineData: Object
}

const OverlayTimeline = ({ setShowOverlayTimeline, timelineData }: Props) => {

    const applicationTimelineData = {
        "self_declared_name":"",
        "pan_name": "",
        "pan": "",
        "address": "",
        "gstin": "",
        "bank": "NOT_REQUIRED",
        "offer": {
            "loan_amount": "",
            "tenor": "",
            "emi":""
        },
        "loan": {
            "kyc": "",
            "disbursal_account": "",
            "mandate": "",
            "agreement": ""
        },
        "disbursal": ""
    }

    const workflowVariables = timelineData
    if (workflowVariables) {
        applicationTimelineData["self_declared_name"] = workflowVariables?.self_declared_name?.split(" ")[0].toLowerCase()
        applicationTimelineData["pan_name"] = workflowVariables?.pan_name?.split(" ")[0].toLowerCase()
        applicationTimelineData["pan"] = workflowVariables?.pan_name ? workflowVariables?.pan : ""
        applicationTimelineData["address"] = (workflowVariables?.pincode && workflowVariables.task_name!="personalInfoScreen") ? (workflowVariables?.pincode) + ", " + (workflowVariables?.pincode_data?.city) + ", " + (workflowVariables?.pincode_data?.stateCode) : ""
        applicationTimelineData["gstin"] = (workflowVariables?.selected_gstin) ? workflowVariables.selected_gstin : ""
        if(applicationTimelineData["gstin"] === "" ){
            applicationTimelineData["gstin"] = (workflowVariables?.trade_name) ? workflowVariables.trade_name : ""
        }
        if (workflowVariables?.banking_required) {
            applicationTimelineData["bank"] = "REQUIRED"
        }

        if (workflowVariables?.selected_bank_name) {
            applicationTimelineData["bank"] = workflowVariables?.selected_bank_name
        }

        applicationTimelineData["offer"]["loan_amount"] = (workflowVariables?.selected_loan_amount) ? "₹ " + workflowVariables.selected_loan_amount.toLocaleString('en-IN') : ""
        applicationTimelineData["offer"]["tenor"] = (workflowVariables?.selected_tenure_in_months) ? workflowVariables.selected_tenure_in_months + " months" : ""
        applicationTimelineData["offer"]["emi"] = (workflowVariables?.selected_emi_amount) ? "₹ "+ Math.round(Number(workflowVariables.selected_emi_amount)).toLocaleString('en-IN') : ""
        applicationTimelineData["loan"]["kyc"] = (workflowVariables?.kyc_completed) ? "COMPLETED" : ""

        if (workflowVariables?.bank_name) {
            applicationTimelineData["loan"]["disbursal_account"] = workflowVariables?.bank_name
        }

        if (workflowVariables?.mandate_complete) {
            applicationTimelineData["loan"]["mandate"] = "COMPLETED"
        }

        if (workflowVariables?.loan_agreement_accepted) {
            applicationTimelineData["loan"]["agreement"] = "ACCEPTED"
        }

        if (workflowVariables?.application_status) {
            let status = "IN PROGRESS"
            if (workflowVariables?.application_status?.code === "DISBURSED")
                status = "DISBURSED"

            applicationTimelineData["disbursal"] = status
        }
    }

    return (
        <div className="absolute inset-y-0 right-0 bg-white w-74.5 md:w-90 md:mx-auto">
            {/* HEAD  */}
            <div className="border-b-2 border-b-dark-silver border-opacity-30 ">
                <div className="m-4 flex items-center">
                    <span
                        className="justify-end my-auto mr-5 cursor-pointer"
                    >
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
                    </span>
                    <h1 className="font-semibold text-base leading-4.5 my-auto">
                        Welcome {applicationTimelineData["self_declared_name"]}
                    </h1>
                    {/* CLOSE SVG  */}
                    <span
                        onClick={() => {
                            setShowOverlayTimeline(false)
                        }}
                        className="cursor-pointer ml-auto"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="12" cy="12" r="12" fill="#ECECEC" />
                            <path d="M16 8L8 16L16 8Z" fill="#B3B3B3" />
                            <path
                                d="M16 8L8 16"
                                stroke="#B3B3B3"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M16 16L8 8"
                                stroke="#B3B3B3"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </span>
                </div>
            </div>

            {/* TIMELINE  */}
            <div className="p-6">
                    <div className="max-w-md mx-auto">
                        <div>
                            {/* APPLICATION FORM  */}
                            <div>
                                <div className={"flex flex-row items-center"}>
                                    {(applicationTimelineData.bank === "REQUIRED" || applicationTimelineData.gstin === "") ? (
                                        <div className="w-5 h-5 rounded-full bg-primary text-white font-bold">
                                            <p className="text-2.75 leading-3.5 pl-1.75 pt-0.45">1</p>
                                        </div>
                                    ) : (applicationTimelineData.bank === "NOT_REQUIRED" || applicationTimelineData.gstin !== "") ? (
                                        <span>
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M0 10C0 4.5 4.5 0 10 0C15.5 0 20 4.5 20 10C20 15.5 15.5 20 10 20C4.5 20 0 15.5 0 10ZM15.0707 7.79805C15.4613 7.40753 15.4613 6.77436 15.0707 6.38384C14.6802 5.99331 14.047 5.99331 13.6565 6.38384L8.54544 11.4949L6.34346 9.29293C5.95294 8.9024 5.31977 8.9024 4.92925 9.29293C4.53872 9.68345 4.53872 10.3166 4.92925 10.7071L7.83834 13.6162C8.22886 14.0068 8.86203 14.0068 9.25255 13.6162L15.0707 7.79805Z"
                                                    fill="#28A745"
                                                />
                                            </svg>
                                        </span>
                                    ) : (
                                        <div className="rounded-full bg-white border-granite-gray border-2 text-granite-gray font-bold opacity-50">
                                            <p className="text-2.75 leading-3.5 pl-1.5 pt-0.25">1</p>
                                        </div>
                                    )}

                                    <h1
                                        className={
                                            "ml-3.5 font-bold " +
                                            (applicationTimelineData.bank === "REQUIRED" || applicationTimelineData.gstin === "" ? "text-primary" : "")
                                        }
                                    >
                                        Application form
                                    </h1>
                                </div>
                                <div
                                    className={
                                        "pb-2 border-l-2 ml-2.5 border-opacity-50 " +
                                        (applicationTimelineData.bank !== "" || applicationTimelineData.gstin !== ""
                                            ? "border-l-green"
                                            : "border-l-american-gray")
                                    }
                                >
                                    <div
                                        className={
                                            "grid grid-cols-1 gap-y-2 pt-2 ml-6 pr-4 font-normal text-xs text-granite-gray"
                                        }
                                    >
                                        <div className="flex justify-between">
                                            <p>PAN</p>
                                            <p>{applicationTimelineData.pan}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p>Personal Information</p>
                                            <p className="text-end">{applicationTimelineData.address}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p>Business Details</p>
                                            <p className="w-20 truncate">{applicationTimelineData.gstin}</p>
                                        </div>
                                        {(applicationTimelineData.bank !== "NOT_REQUIRED") &&
                                            <div className="flex justify-between">
                                                <p>Bank statement</p>
                                                {(applicationTimelineData.bank === "REQUIRED") &&
                                                    <p>Pending</p>
                                                }
                                                {(applicationTimelineData.bank !== "REQUIRED") &&
                                                    <p>{applicationTimelineData.bank}</p>
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* OFFER  */}
                            <div
                                className={"" + ((applicationTimelineData.bank === "REQUIRED" || applicationTimelineData.gstin === "") ? "opacity-50" : "")}
                            >
                                <div className={"flex flex-row items-center h-5"}>
                                    {((applicationTimelineData.bank !== "" || applicationTimelineData.gstin !== "") && applicationTimelineData.offer.loan_amount === "") ? (
                                        <div className="w-5 h-5 rounded-full bg-primary text-white font-bold">
                                            <p className="text-2.75 leading-3.5 pl-1.75 pt-0.45">2</p>
                                        </div>
                                    ) : ((applicationTimelineData.offer.loan_amount !== "")) ? (
                                        <span>
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M0 10C0 4.5 4.5 0 10 0C15.5 0 20 4.5 20 10C20 15.5 15.5 20 10 20C4.5 20 0 15.5 0 10ZM15.0707 7.79805C15.4613 7.40753 15.4613 6.77436 15.0707 6.38384C14.6802 5.99331 14.047 5.99331 13.6565 6.38384L8.54544 11.4949L6.34346 9.29293C5.95294 8.9024 5.31977 8.9024 4.92925 9.29293C4.53872 9.68345 4.53872 10.3166 4.92925 10.7071L7.83834 13.6162C8.22886 14.0068 8.86203 14.0068 9.25255 13.6162L15.0707 7.79805Z"
                                                    fill="#28A745"
                                                />
                                            </svg>
                                        </span>
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-white border-granite-gray border-2 text-granite-gray font-bold opacity-50">
                                            <p className="text-2.75 leading-3.5 pl-1.5 pt-0.25">2</p>
                                        </div>
                                    )}
                                    <h1
                                        className={
                                            "ml-3.5 font-bold " +
                                            (applicationTimelineData.bank === "REQUIRED" || applicationTimelineData.gstin === "" ? "text-primary" : "")
                                        }
                                    >
                                        Loan offer
                                    </h1>
                                </div>
                                <div
                                    className={
                                        "pb-2 border-l-2 ml-2.5 border-opacity-50 " +
                                        ((applicationTimelineData.gstin !== "")
                                            ? "border-l-green visible"
                                            : "border-l-american-gray hidden")
                                    }
                                >
                                    <div
                                        className={
                                            "grid grid-cols-1 gap-y-2 pt-2 ml-6 pr-4 font-normal text-xs text-granite-gray"
                                        }
                                    >
                                        <div className="flex justify-between">
                                            <p>Loan Amount</p>
                                            <p>{applicationTimelineData.offer.loan_amount}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p>Emi x Tenure</p>
                                            <p>{applicationTimelineData.offer.emi}{applicationTimelineData.offer.emi && applicationTimelineData.offer.tenor && " x "}{applicationTimelineData.offer.tenor}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/*  LOAN ACCOUNT SETUP  */}
                            <div
                                className={"" +
                                    ((applicationTimelineData.offer.loan_amount === "") ? "opacity-50" : "")
                                }
                            >
                                <div className={"flex flex-row items-center h-5"}>
                                    {(applicationTimelineData.disbursal === "") ? (
                                        <div className="w-5 h-5 rounded-full bg-primary text-white font-bold">
                                            <p className="text-2.75 leading-3.5 pl-1.75 pt-0.45">3</p>
                                        </div>
                                    ) : ((applicationTimelineData.disbursal !== "")) ? (
                                        <span>
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M0 10C0 4.5 4.5 0 10 0C15.5 0 20 4.5 20 10C20 15.5 15.5 20 10 20C4.5 20 0 15.5 0 10ZM15.0707 7.79805C15.4613 7.40753 15.4613 6.77436 15.0707 6.38384C14.6802 5.99331 14.047 5.99331 13.6565 6.38384L8.54544 11.4949L6.34346 9.29293C5.95294 8.9024 5.31977 8.9024 4.92925 9.29293C4.53872 9.68345 4.53872 10.3166 4.92925 10.7071L7.83834 13.6162C8.22886 14.0068 8.86203 14.0068 9.25255 13.6162L15.0707 7.79805Z"
                                                    fill="#28A745"
                                                />
                                            </svg>
                                        </span>
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-white border-granite-gray border-2 text-granite-gray font-bold opacity-50">
                                            <p className="text-2.75 leading-3.5 pl-1.5 pt-0.25">3</p>
                                        </div>
                                    )}
                                    <h1
                                        className={
                                            "ml-3.5 font-bold " +
                                            (applicationTimelineData.loan.agreement === "" ? "text-primary" : "")
                                        }
                                    >
                                        Loan account setup
                                    </h1>
                                </div>
                                <div
                                    className={
                                        "pb-2 border-l-2 ml-2.5 border-opacity-50 " +
                                        (applicationTimelineData.offer.loan_amount !== ""
                                            ? "border-l-green visible"
                                            : "border-l-american-gray hidden")
                                    }
                                >
                                    <div
                                        className={
                                            "grid grid-cols-1 gap-y-2 pt-2 ml-6 pr-4 font-normal text-xs text-granite-gray"
                                        }
                                    >
                                        <div className="flex justify-between">
                                            <p>KYC</p>
                                            <p>{applicationTimelineData.loan.kyc}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p>Disbursal account verification</p>
                                            <p className="text-end">{applicationTimelineData.loan.disbursal_account}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p>EMI auto-pay setup</p>
                                            <p>{applicationTimelineData.loan.mandate}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p>Loan agreement </p>
                                            <p>{applicationTimelineData.loan.agreement}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/*  DISBURSAL  */}
                            <div
                                className={
                                    (applicationTimelineData.disbursal === "") ? "opacity-50" : ""
                                }
                            >
                                <div className={"flex flex-row items-center gap-3"}>
                                    {(applicationTimelineData.disbursal === "IN PROGRESS") ? (
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white font-bold">
                                            <p className="text-xs">4</p>
                                        </div>
                                    ) : ((applicationTimelineData.disbursal === "DISBURSED")) ? (
                                        <span>
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M0 10C0 4.5 4.5 0 10 0C15.5 0 20 4.5 20 10C20 15.5 15.5 20 10 20C4.5 20 0 15.5 0 10ZM15.0707 7.79805C15.4613 7.40753 15.4613 6.77436 15.0707 6.38384C14.6802 5.99331 14.047 5.99331 13.6565 6.38384L8.54544 11.4949L6.34346 9.29293C5.95294 8.9024 5.31977 8.9024 4.92925 9.29293C4.53872 9.68345 4.53872 10.3166 4.92925 10.7071L7.83834 13.6162C8.22886 14.0068 8.86203 14.0068 9.25255 13.6162L15.0707 7.79805Z"
                                                    fill="#28A745"
                                                />
                                            </svg>
                                        </span>
                                    ) : (
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary border-granite-gray border-2 text-white font-bold">
                                            <p className="text-xs">4</p>
                                        </div>
                                    )}
                                    <h1 className="font-bold text-primary">
                                        Disbursal
                                    </h1>
                                </div>
                                <div className={"ml-8 mt-4 " + (applicationTimelineData.disbursal !== "" ? "visible" : "hidden")}>
                                    <span className={"px-4 py-2 rounded-md text-sm " + (applicationTimelineData.disbursal === "IN PROGRESS" ? "text-granite-gray bg-granite-gray bg-opacity-20" : "text-american-green bg-american-green bg-opacity-20")}>{applicationTimelineData.disbursal}</span>
                                </div>
                            </div>
                            <div className="mt-10 mb-4  flex flex-row gap-4 items-center bg-alice-blue p-3 rounded-lg">
                                <svg
                                    onClick={()=>{window.location.href='tel:08067019097'}}
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                    opacity="0.4"
                                    d="M19.97 16.33C19.97 16.69 19.89 17.06 19.72 17.42C19.55 17.78 19.33 18.12 19.04 18.44C18.55 18.98 18.01 19.37 17.4 19.62C16.8 19.87 16.15 20 15.45 20C14.43 20 13.34 19.76 12.19 19.27C11.04 18.78 9.89 18.12 8.75 17.29C7.6 16.45 6.51 15.52 5.47 14.49C4.44 13.45 3.51 12.36 2.68 11.22C1.86 10.08 1.2 8.94 0.72 7.81C0.24 6.67 0 5.58 0 4.54C0 3.86 0.12 3.21 0.36 2.61C0.6 2 0.98 1.44 1.51 0.94C2.15 0.31 2.85 0 3.59 0C3.87 0 4.15 0.0600001 4.4 0.18C4.66 0.3 4.89 0.48 5.07 0.74L7.39 4.01C7.57 4.26 7.7 4.49 7.79 4.71C7.88 4.92 7.93 5.13 7.93 5.32C7.93 5.56 7.86 5.8 7.72 6.03C7.59 6.26 7.4 6.5 7.16 6.74L6.4 7.53C6.29 7.64 6.24 7.77 6.24 7.93C6.24 8.01 6.25 8.08 6.27 8.16C6.3 8.24 6.33 8.3 6.35 8.36C6.53 8.69 6.84 9.12 7.28 9.64C7.73 10.16 8.21 10.69 8.73 11.22C9.27 11.75 9.79 12.24 10.32 12.69C10.84 13.13 11.27 13.43 11.61 13.61C11.66 13.63 11.72 13.66 11.79 13.69C11.87 13.72 11.95 13.73 12.04 13.73C12.21 13.73 12.34 13.67 12.45 13.56L13.21 12.81C13.46 12.56 13.7 12.37 13.93 12.25C14.16 12.11 14.39 12.04 14.64 12.04C14.83 12.04 15.03 12.08 15.25 12.17C15.47 12.26 15.7 12.39 15.95 12.56L19.26 14.91C19.52 15.09 19.7 15.3 19.81 15.55C19.91 15.8 19.97 16.05 19.97 16.33Z"
                                    fill="#2C3D6F"
                                    />
                                </svg>
                                <p className="tracking-0.08 font-normal leading-5.5 text-raisin-black">
                                    For any queries please reach out to us at{" "} 
                                    <span className="font-bold" onClick={()=>{window.location.href='tel:08067019097'}}>08067019097</span> 
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default OverlayTimeline
