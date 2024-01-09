import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect, useContext } from "react"
import { fetchVariable, emailVerification , fetchNext } from "../../apis/resource"
import { RootContext } from "../../utils/RootContext"
import { getUrlByScreenName } from "../../utils/Routing"

import BottomSheet from "../../components/BottomSheet"
import Loader from "../../components/Loader"
import loadingImage from "../../assets/svg/analysis.svg"
import disbursedImage from "../../assets/svg/disbursed.svg"
import failedImage from "../../assets/svg/application-rejected.svg"
import disbInitiatedImage from "../../assets/svg/fetching-statement.svg"
import verifiedImage from "../../assets/svg/loan-agreement.svg"
import { Player } from "@lottiefiles/react-lottie-player"
import LottieLoader from "../../assets/lottie/loader.json"
import chatWhatsappIcon from "../../assets/png/chatWhatsappIcon.png"

type typeStatusImageMap = {
    "LOADING": string,
    "MANUAL": string,
    "MANDATE_REGISTER":string,
    "VERIFIED": string,
    "DISBURSAL_INITIATED": string,
    "DISBURSED": string,
    "REJECTED": string,
    "LOAN_FAILURE": string
}

const LoanDocument = (props: { stage: string }) => {
    const [ sessionData, sessionDispatch ] = useContext(RootContext)
    const navigate = useNavigate()
    const { state } = useLocation()

    const loanAgreementPdfUrl = state?.variables?.loan_agreement_pdf_url
    const repaymentSchedule = state?.variables?.repayment_schedule
    const bankName = state?.variables?.bank_name
    const accountNumberLastFour = state?.variables?.account_number_last_four
    const disbursalAmount = state?.variables?.total_disbursal_amount
    const applicationStatusCode=state?.variables?.application_status?.code ? state?.variables?.application_status?.code :"LOADING";
    const applicationStatusMessage=state?.variables?.application_status?.message ?state?.variables?.application_status?.message :"We are verifying your information"
 
    const [showOverlay, setShowOverlay] = useState(false)
    const [email, setEmail] = useState("")
    const [count, setCount] = useState(0)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [emailVerified, setEmailVerified] = useState(false)
    const [verificationEmailSent, setVerificationEmailSent] = useState(false)
    const [emailError, setEmailError] = useState(false)
    const [emailErrorMessage, setEmailErrorMessage] = useState("")

    const [applicationStatus, setApplicationStatus] = useState("LOADING")
    const [applicationMessage, setApplicationMessage] = useState("We are verifying your information")

    const [isFetchingStatus, setIsFetchingStatus] = useState(false)
    const [isEmailNotEmpty, setIsEmailNotEmpty] = useState(false)
    const [inQc,setInQc]=useState(false)

    const statusImageMap: typeStatusImageMap = {
        "LOADING": loadingImage,
        "MANUAL": loadingImage,
        "MANDATE_REGISTER":loadingImage,
        "VERIFIED": verifiedImage,
        "DISBURSAL_INITIATED": disbInitiatedImage,
        "DISBURSED": disbursedImage,
        "REJECTED": failedImage,
        "LOAN_FAILURE": failedImage
    }

    useEffect(()=>{
        initialFetch()
    },[])

    const initialFetch = async () => {
        await fetchNext(props.stage).then((response) => {
            setApplicationStatus(response.data.data.application_status.code)
            setApplicationMessage(response.data.data.application_status.message)
            if(response.data.data.application_status.code === "REJECTED"){
                let redirectTo = "/application-rejected"
                navigate(redirectTo, {
                    state: {
                        variables: response.data.data, //TO SEND DATA NEXT SCREEN
                    },
                    replace: true
                })
            }
            if(response.data.data.application_status.code === "MANUAL"){
                checkQcStatus(response.data.data.doc_payload,true,response.data.data.udyam_required)
            }
            if(response.data.data.application_status.code === "MANDATE_REGISTER"){
                redirectToQcRepayment()
            }
            if(response.data.data.task_name != "userCompletionScreen"){
                let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
                navigate(redirectTo, {
                    state: {
                      variables: response.data.data, //TO SEND DATA NEXT SCREEN
                    },
                    replace: true
                })
            }
        }).catch((error) => {
            if(error){
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                }
            }
        })
    }

    const checkQcStatus=(list:{crm_decision:string,qc:object}, isFetchNext: boolean, udyamRequired?: boolean)=>{
        const  qc_list :{ [key :string] : any}=list["qc"]
        let docsRequired=false
        Object.keys(qc_list).forEach((key)=>{
            if(!qc_list[key].status){
                docsRequired=true
            }
        })
        if(docsRequired || (isFetchNext && udyamRequired)){
            redirectToFileUpload()
        }
        else{
            checkUdyamQcStatus()
        }
    }

    const checkUdyamQcStatus = async () =>{
        await fetchVariable("udyam_required").then((response) => {
            if(response.data.data.is_present && response.data.data.udyam_required){
                redirectToFileUpload()
            }
         }).catch((error) => {
             if(error){
                 if (error.status === 401 || error.status === 403) {
                     sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                 }
             }
         })
    }
    
    const redirectToFileUpload = () =>{
        setInQc(true)
        setTimeout(()=>{
            setInQc(false)
            navigate('/file-upload', {
                state: state,
                replace: true
        })},3000)
    }

    const redirectToQcRepayment =() =>{
        setInQc(true)
        setTimeout(()=>{
            setInQc(false)
            navigate('/repayment', {
                state: state,
                replace: true
            })
        },3000)        
    }

    const fetchApplicationStatus = async () => {
        setIsFetchingStatus(true)
        await fetchVariable("application_status").then(async (response) => {
            if (response.data.data.is_present) {
                setApplicationStatus(response.data.data.application_status.code)
                setApplicationMessage(response.data.data.application_status.message)

                if (
                    response.data.data.application_status.code === "REJECTED"
                ) {
                    await fetchVariable("reject_message").then((response) => {
                        let redirectTo = "/application-rejected"
                        navigate(redirectTo, {
                            state: {
                                variables:response.data.data
                            },
                            replace: true
                        })
                     }).catch((error) => {
                         if(error){
                             if (error.status === 401 || error.status === 403) {
                                 sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                             }
                         }
                     })
                }
                else if (response.data.data.application_status.code === "MANUAL"){
                    await fetchVariable("doc_payload").then((response) => {
                       if(response.data.data.is_present){
                        checkQcStatus(response.data.data.doc_payload,false)
                       }
                    }).catch((error) => {
                        if(error){
                            if (error.status === 401 || error.status === 403) {
                                sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                            }
                        }
                    })
                }
                else if(response.data.data.application_status.code === "MANDATE_REGISTER"){
                    redirectToQcRepayment()     
                }
            } else {
                console.error("EXPECTED VARIABLE NOT PRESENT")
            }
        }).catch((error) => {
            if (error) {
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                }
            }
        })

        setIsFetchingStatus(false)
    }

    const validateEmail=()=>{
        let email_pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
        if (email.length === 0) {
            setEmailError(true)
            setEmailErrorMessage("Please enter email");
            return false;
        }
        if (!email_pattern.test(email)) {
            setEmailError(true)
            setEmailErrorMessage("Invalid email")
            return false
        }
        return true

    }

    const onClickSubmitEmail = async () => {
        if(validateEmail()){
            setSubmitLoading(true)
            let data = {
                "first_name": state?.variables?.pan_name,
                "last_name": state?.variables?.pan_name,
                "email_id": email,
                "mobile_number": state?.variables?.mobile_number,
                "application_num": state?.variables?.application_number
            }
            await emailVerification(data).then((response) => {
                if (response.data.code === "SUCCESS") {
                    setVerificationEmailSent(true)
                }
            }).catch((error) => {
                if (error) {
                    if (error.status === 401 || error.status === 403) {
                        sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                    }
                }
            })
            setSubmitLoading(false)
        }
    }

    useEffect(() => {
        const timer = count < 10 && !(applicationStatus == "DISBURSED" || applicationStatus == "MANUAL" || applicationStatus == "REJECTED") && setInterval(() => {
            setCount(count + 1);
            fetchApplicationStatus()
        }, 30000)
        //@ts-ignore
        return () => clearInterval(timer)
    }, [count])

    const onChangeEmail = async (email: string) => {
        setEmailError(false)
        if (email.length > 0) {
            setIsEmailNotEmpty(true)
        }
        else {
            setIsEmailNotEmpty(false)
        }
        setEmail(email)
    }

    const onClickDone = () => {
        setShowOverlay(true)
    }

    const onClickGotIt = () => {
        setShowOverlay(false)
    }

    const onClickDownloadLoanAgreement = () => {
        window.open(loanAgreementPdfUrl, "_blank")
    }

    const onClickDownloadRepaymentSchedule = () => {
        window.open(repaymentSchedule, "_blank")
    }

    return (
        <div>
            <div className="flex flex-col mx-5 pb-24">
                {/* EMAIL  */}
                { false && 
                <div>
                    <p className="mb-2 font-bold text-2xl items-center mt-5 -tracking-0.08">
                        Receive your loan documents via email
                    </p>
                    {verificationEmailSent ? <div className="mb-5">
                        <label className="relative block">
                            <input
                                type="text"
                                placeholder="Enter Email"
                                autoComplete="off"
                                disabled={true}
                                contentEditable={false}
                                value={email}
                                className="text-xl rounded-lg items-center h-12 py-3 w-full leading-5.5 tracking-0.08"
                            ></input>
                            <span className="flex absolute inset-y-0 right-0 items-center h-12">
                                <svg
                                    className="w-8 h-8"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                                        fill="#2ACD61"
                                    />
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M16.4605 8.40802C16.7874 8.66232 16.8463 9.13353 16.592 9.46049L12.585 14.6123C11.9613 15.4143 10.7881 15.5183 10.033 14.8387L7.49828 12.5575C7.1904 12.2804 7.16544 11.8062 7.44254 11.4983C7.71963 11.1904 8.19385 11.1655 8.50173 11.4426L11.0364 13.7238C11.1443 13.8209 11.3119 13.806 11.401 13.6914L15.408 8.53958C15.6623 8.21262 16.1335 8.15372 16.4605 8.40802Z"
                                        fill="white"
                                    />
                                </svg>
                            </span>
                        </label>
                        <p className="text-xs">We sent verification link on your email</p>
                    </div> :<div className="mb-5"> <label className="relative block">
                        <input
                            type="text"
                            className={"rounded-lg  bg-background items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08 outline-none "+(emailError ? "ring-2 ring-red-600" : "mb-5 focus:border-2 focus:border-primary")}
                            placeholder="Enter Email"
                            autoComplete="off"
                            onChange={(e) => onChangeEmail(e.target.value)}
                            value={email}
                            disabled={submitLoading || verificationEmailSent}
                        />
                        {isEmailNotEmpty && (submitLoading ? <span className="absolute inset-y-0 right-0 flex items-center h-12 pr-3"><Loader color="#2C3D6F" /></span> : <span className="absolute inset-y-0 right-0 flex items-center h-12 pr-6" onClick={onClickSubmitEmail}>
                            <svg
                                className="m-auto"
                                width="16"
                                height="18"
                                viewBox="0 0 16 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M15.8933 8.49333C15.8299 8.32967 15.7347 8.18014 15.6133 8.05333L8.94667 1.38667C8.82235 1.26235 8.67476 1.16374 8.51233 1.09645C8.3499 1.02917 8.17581 0.994545 8 0.994545C7.64493 0.994545 7.30441 1.1356 7.05333 1.38667C6.92902 1.51099 6.8304 1.65857 6.76312 1.821C6.69584 1.98343 6.66121 2.15752 6.66121 2.33333C6.66121 2.6884 6.80226 3.02893 7.05333 3.28L11.4533 7.66667H1.33333C0.979711 7.66667 0.640573 7.80714 0.390525 8.05719C0.140476 8.30724 0 8.64638 0 9C0 9.35362 0.140476 9.69276 0.390525 9.94281C0.640573 10.1929 0.979711 10.3333 1.33333 10.3333H11.4533L7.05333 14.72C6.92836 14.844 6.82917 14.9914 6.76148 15.1539C6.69379 15.3164 6.65894 15.4907 6.65894 15.6667C6.65894 15.8427 6.69379 16.017 6.76148 16.1794C6.82917 16.3419 6.92836 16.4894 7.05333 16.6133C7.17728 16.7383 7.32475 16.8375 7.48723 16.9052C7.64971 16.9729 7.82398 17.0077 8 17.0077C8.17602 17.0077 8.35029 16.9729 8.51277 16.9052C8.67525 16.8375 8.82272 16.7383 8.94667 16.6133L15.6133 9.94667C15.7347 9.81986 15.8299 9.67034 15.8933 9.50667C16.0267 9.18205 16.0267 8.81795 15.8933 8.49333Z"
                                    fill="#2C3D6F"
                                />
                            </svg>
                        </span>)}
                    </label>
                    <div className={"flex mt-1 text-red-600 " + (emailError ? "visible" : "invisible")}>
                        <p>{emailErrorMessage}</p>
                    </div>
                     </div>}
                </div>
                }
                <div>
                    <div className="my-6 flex flex-col justify-center rounded-lg bg-white">
                        {/* STATUS  */}
                        <div>
                            <img src={
                                // @ts-ignore
                                statusImageMap[applicationStatus]
                            } className="w-2/5 mx-auto" />
                            {applicationStatus === "DISBURSED" &&
                                <p className="mb-2 text-center font-semibold text-sm leading-4.5 -tracking-0.06">
                                    Great
                                </p>
                            }
                            {isFetchingStatus && count < 10 &&
                                <Loader color="#2c3d6f" />
                            }
                        </div>
                        <p className="mb-2 px-3 font-bold text-xl leading-6 -tracking-0.04 text-center">
                            {applicationMessage}
                        </p>

                        {/* BANK DETAILS  */}
                        <p className="mb-8 text-xs tracking-0.08 text-granite-gray text-center">
                            Below is your transfer details
                        </p>
                        <div className="flex gap-3 justify-center">
                            {/* <img className="w-8 h-8 rounded" /> */}
                            <div className="flex flex-col gap-1 w-56 items-center">
                                <p className="font-bold leading-5 -tracking-0.04">
                                    {bankName}
                                </p>
                                <p className="text-xs tracking-0.08 text-granite-gray">
                                    **** **** {accountNumberLastFour}
                                </p>
                            </div>
                        </div>

                        <div className="absolute left-86.5 md:left-100 bg-cultured top-64 w-16 h-16 rounded-full">
                            {" "}
                        </div>
                        <div className="absolute right-86.5 md:right-100 bg-cultured top-64 w-16 h-16 rounded-full">
                            {" "}
                        </div>

                        <p className="mt-9 mb-8 mx-auto border-b-0.25 border-b-philippine-silver border-dashed w-60"></p>

                        <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06 text-center">
                            Amount {(applicationStatus === "DISBURSED") ? "transferred" : ""}
                        </p>
                        <p className="mb-4 font-bold text-2xl -tracking-0.08 text-indigo text-center">
                            ₹ {Math.round(Number(disbursalAmount)).toLocaleString('en-IN')}
                        </p>
                    </div>
                    <div
                        className="mb-5 flex justify-between items-center py-3 px-4 gap-4 h-16  border-light-silver border-0.25 border-solid rounded-lg"
                        onClick={onClickDownloadLoanAgreement}
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
                    {repaymentSchedule && 
                    <div
                    className="mb-8 flex justify-between items-center py-3 px-4 gap-4 h-16  border-light-silver border-0.25 border-solid rounded-lg"
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
                    }
                    <div className="btn-whatsapp-pulse">
                        <a href="https://wa.link/70vpeh" target="_blank">
                            <img src={chatWhatsappIcon} />
                        </a>
                    </div>
                </div>
            </div>

            {/* OVERLAY */}
            <BottomSheet
                showClose={true}
                defaultVisible={showOverlay}
                heading=""
                onVisible={(status) => { setShowOverlay(status) }}
                height={330}
            >
                <div className="flex flex-col w-full md:w-90 md:mx-auto">
                    <div className="flex flex-row mb-8 items-center justify-center">
                        <div>
                            <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity="0.4" d="M22.0003 21.6667H6.00033C3.05481 21.6667 0.666992 19.2788 0.666992 16.3333V13.6667C0.666992 6.30287 6.63653 0.333328 14.0003 0.333328C21.3641 0.333328 27.3337 6.30287 27.3337 13.6667V16.3333C27.3337 19.2788 24.9458 21.6667 22.0003 21.6667Z" fill="#293B75" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M14.0002 5.33333C10.7468 5.33333 8.85654 6.92944 7.5965 8.87661C7.29646 9.34028 6.67734 9.47293 6.21367 9.17288C5.75 8.87283 5.61736 8.25372 5.91741 7.79005C7.44668 5.42682 9.90389 3.33333 14.0002 3.33333C18.0966 3.33333 20.5538 5.42682 22.0831 7.79005C22.3831 8.25372 22.2505 8.87283 21.7868 9.17288C21.3232 9.47293 20.704 9.34028 20.404 8.87661C19.1439 6.92944 17.2537 5.33333 14.0002 5.33333Z" fill="#293B75" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M18.8944 11.4471C19.1414 10.9531 18.9412 10.3524 18.4472 10.1055C17.9532 9.85847 17.3525 10.0587 17.1055 10.5527L13.5352 17.6934C11.545 17.9237 10 19.6147 10 21.6667H18C18 20.0322 17.0197 18.6267 15.6149 18.006L18.8944 11.4471Z" fill="#293B75" />
                            </svg>
                        </div>
                        <p className="flex font-bold text-2xl text-center  -tracking-0.08  mx-auto">
                            Path to a good credit score
                        </p>
                    </div>
                    <div className="mb-4 flex flex-col gap-4 text-sm leading-4.5 tracking-0.08">
                        <p>
                            You should maintain enough balance in your account for EMI
                            autopay on due dates.
                        </p>
                        <p>Non-payment of EMI will result in a BAD credit profile.</p>
                        <p>
                            This will make it difficult for you to take any loans in future
                        </p>
                    </div>
                    <button
                        className="justify-center py-4.5 px-4 items-center  rounded-xl  bg-primary h-14 gap-2  md:w-87.5 md:mx-auto"
                        onClick={onClickGotIt}
                    >
                        <p className="text-lg leading-5 text-center font-bold tracking-0.08 text-white ">
                            OKAY, GOT IT
                        </p>
                    </button>
                </div>
            </BottomSheet>
             {/* IN QC BOTTOMSHEET */}
             <BottomSheet
                showClose={false}
                defaultVisible={inQc}
                heading=""
                onVisible={(status) => { setInQc(status) }}
                height={330}
            >
                <div className="flex flex-col gap-4 items-center justify-center">
                    <p className=" font-bold text-xl">Application is under review</p>
                    <p>We are redirecting you...</p>
                    <div className="flex justify-center">
                        <Player
                            autoplay
                            loop
                            src={LottieLoader}
                            className="w-16 h-16"
                        >
                        </Player>
                    </div>
                </div>
            </BottomSheet>
        </div>
    )
}
export default LoanDocument
