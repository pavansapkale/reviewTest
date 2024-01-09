import { useLocation, useNavigate } from "react-router-dom"
import { getUrlByScreenName } from "../../utils/Routing"
import { useState, useEffect, useContext } from "react"
import { RootContext } from "../../utils/RootContext"
import { createSession } from "../../apis/resource"
import Loader from "../../components/Loader"
import { detect } from "../../lib/DetectBrowser"

import chatWhatsappIcon from "../../assets/png/chatWhatsappIcon.png"

const ApplicationTimeline = () => {
    const [sessionData, sessionDispatch] = useContext(RootContext)

    const navigate = useNavigate()
    const { state } = useLocation()
    const [ip, setIp] = useState("0.0.0.0")
    const [isContinueLoading, setIsContinueLoading] = useState(false)
    const [userLat, setUserLat] = useState(0.0)
    const [userLong, setUserLong] = useState(0.0)
    //BROWSER INFO
    const browserInfo = detect()
    const browserDetails = { name: browserInfo?.name, os: browserInfo?.os, version: browserInfo?.version }
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
            "emi": ""
        },
        "loan": {
            "kyc": "",
            "disbursal_account": "",
            "mandate": "",
            "agreement": ""
        },
        "disbursal": ""
    }

    useEffect(() => {
        sessionDispatch({ type: 'UPDATE', data: { isLoggedIn: false } })
        //SET SESSION INFORMATION
        getSessionInfo()
    }, [])


    const getSessionInfo = async () => {
        navigator.geolocation.getCurrentPosition((position) => {
            setUserLat(position.coords.latitude)
            setUserLong(position.coords.longitude)
        })
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setIp(data.ip)
    }

    //CREATE SESSION
    const createSessionHandler = async () => {
        setIsContinueLoading(true);
        let utmParams = {}
        var url = new URL(window.location.href);
        url.searchParams.forEach(function (value, key) {
            if (key.startsWith("utm")) {
                // @ts-ignore
                utmParams[key] = value
            }
        })
        const createSessionPayload = {
            ip_address: ip,
            utm: utmParams,
            location: {
                lat: userLat,
                long: userLong
            },
            meta_info: {
                browserInfo: browserDetails
            }
        }
        createSession(createSessionPayload).then(() => {
            sessionDispatch({ type: 'UPDATE', data: { isLoggedIn: true } })
            let redirectTo: string = getUrlByScreenName(workflowVariables.task_name)
            navigate(redirectTo, {
                state: {
                    variables: workflowVariables, //TO SEND DATA NEXT SCREEN
                },
                replace: true
            })
        }).catch((error) => {
            if (error) {
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
                }
            }
        })
        setIsContinueLoading(false)
    }

    const workflowVariables = state?.variables
    if (workflowVariables) {
        applicationTimelineData["self_declared_name"] = workflowVariables?.self_declared_name?.split(" ")[0].toLowerCase()
        applicationTimelineData["pan_name"] = workflowVariables?.pan_name?.split(" ")[0].toLowerCase()
        applicationTimelineData["pan"] = workflowVariables?.pan_name ? workflowVariables?.pan : ""
        applicationTimelineData["address"] = (workflowVariables?.pincode && workflowVariables.task_name != "personalInfoScreen") ? (workflowVariables?.pincode) + ", " + (workflowVariables?.pincode_data?.city) + ", " + (workflowVariables?.pincode_data?.stateCode) : ""
        applicationTimelineData["gstin"] = (workflowVariables?.selected_gstin) ? workflowVariables.selected_gstin : ""

        if (applicationTimelineData["gstin"] === "") {
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
        applicationTimelineData["offer"]["emi"] = (workflowVariables?.selected_emi_amount) ? "₹ " + Math.round(Number(workflowVariables.selected_emi_amount)).toLocaleString('en-IN') : ""

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
        <div>
            <div className="max-w-md mx-auto">
                {/* WELCOME NAME  */}
                <div>
                    <div className="m-4 flex">
                        <img className="w-12" src={"https://avatars.dicebear.com/api/initials/" + applicationTimelineData.self_declared_name + ".svg?background=%232C3D6F"} alt="user pic" />
                        <h1 className="ml-6 font-semibold overflow-hidden text-ellipsis text-base leading-4.5 my-auto">
                            Welcome back {applicationTimelineData.self_declared_name} !
                        </h1>
                    </div>
                </div>

                <div className="p-4">
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
                                <div className=" flex justify-between">
                                    <p>PAN</p>
                                    <p>{applicationTimelineData.pan}</p>
                                </div>
                                <div className=" flex justify-between">
                                    <p>Personal Information</p>
                                    <p>{applicationTimelineData.address}</p>
                                </div>
                                <div className=" flex justify-between">
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
                                    <p>{applicationTimelineData.loan.disbursal_account}</p>
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
                </div>
                <button
                    className={"ml-4 mt-8 h-10 w-40 rounded-lg text-white font-bold text-md max-w-md bg-primary"}
                    onClick={createSessionHandler}
                    disabled={isContinueLoading}
                >
                    {!isContinueLoading && <p>CONTINUE</p>}
                    {isContinueLoading && <Loader />}
                </button>
                { applicationTimelineData.loan.agreement !="" &&
                    <div className="btn-whatsapp-pulse">
                        <a href="https://wa.link/70vpeh" target="_blank">
                            <img src={chatWhatsappIcon} />
                        </a>
                    </div>
                }
            </div>
        </div>
    )
}

export default ApplicationTimeline
