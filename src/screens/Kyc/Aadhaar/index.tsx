import { useContext, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import OtpInput from "react18-input-otp"
import { completeFetchNext, fetchNext } from "../../../apis/resource"
import Loader from "../../../components/Loader"
import LottieLoader from "../../../assets/lottie/loader.json"
import spinner from "../../../assets/svg/spinner.svg"
import { getUrlByScreenName } from "../../../utils/Routing"
import { encryptAadhaar } from "../../../utils/Encryption"
import { RootContext } from "../../../utils/RootContext"
import { Player } from "@lottiefiles/react-lottie-player"

const Aadhaar = (props: { stage: string }) => {
    const [sessionData, sessionDispatch] = useContext(RootContext)
    const navigate = useNavigate()

    const [captchaImage, setCaptchaImage] = useState("");
    const [publicKey, setPublicKey] = useState("")

    //SHARE CODE
    const [shareCode, setShareCode] = useState("")
    const [shareCodeInvalid, setShareCodeInvalid] = useState(false)
    const [shareCodeErrorMessage, setShareCodeErrorMessage] = useState("")

    //AADHAR
    const [aadhaarNumber, setAadhaarNumber] = useState("")
    const [aadhaarNumberInvalid, setAadhaarNumberInvalid] = useState(false)
    const [aadhaarNumberErrorMessage, setAadhaarNumberErrorMessage] = useState("")
    const [editAadhaarLoading, setEditAadhaarLoading] = useState(false)
    const [aadhaarLastFour,setAadhaarLastFour]=useState("xxxx")

    const inputAadhaarNumber = useRef<HTMLInputElement>(null)

    //CAPTCHA
    const [securityCode, setSecurityCode] = useState("")
    const [securityCodeInvalid, setSecurityCodeInvalid] = useState(false)
    const [securityCodeErrorMessage, setSecurityCodeErrorMessage] = useState("")

    const inputSecurityCode = useRef<HTMLInputElement>(null)

    //TERMS AND CONDITION
    const [termsAndCondition, setTermsAndCondition] = useState(true)
    const [termsAndConditionError, setTermsAndConditionError] = useState(false)

    const inputTermsAndCondition = useRef<HTMLInputElement>(null)

    //OTP
    const [otp, setOtp] = useState("")
    const [otpInvalid, setOtpInvalid] = useState(false)
    const [otpErrorMessage, setOtpErrorMessage] = useState("")
    const [autoFocused, setAutoFocused] = useState(false)
    const [showOtp, setShowOtp] = useState(false)
    const [getOtpLoading, setGetOtpLoading] = useState(false)
    const [verifyOtpLoading, setVerifyOtpLoading] = useState(false)

    const [refreshCaptchaLoading, setRefreshCaptchaLoading] = useState(false)

    //LOADER
    const [showRedirectionLoader, setShowRedirectionLoader] = useState(false)

    useEffect(() => {
        //FETCH KYC WORKFLOW VARIABLES
        initialFetch()
    }, [])

    const initialFetch = async () => {
        await fetchNext(props.stage).then((response) => {
            setPublicKey(response.data.data.public_key)
            setCaptchaImage("data:image/png;base64, " + response.data.data.base64_captcha)

            if (response.data.data.task_name === "aadhaarOTP") {
                setShowOtp(true)
            }
        }).catch((error) => {
            if (error) {
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
                }
            }
        })
    }

    const onCheckTermAndConditionChange = (termSatus: any) => {
        setTermsAndConditionError(false)
        setTermsAndCondition(termSatus)
    }

    const validateBeforeOTP = () => {
        const aadharRegx = /^[2-9]{1}[0-9]{11}$/
        //AADHAR
        if (aadhaarNumber.length === 0) {
            inputAadhaarNumber.current?.scrollIntoView()
            setAadhaarNumberInvalid(true)
            setAadhaarNumberErrorMessage("Please enter aadhaar")
            return false
        }

        if (aadhaarNumber.length < 12 || !aadharRegx.test(aadhaarNumber.replaceAll(" ", ""))) {
            inputAadhaarNumber.current?.scrollIntoView()
            setAadhaarNumberInvalid(true)
            setAadhaarNumberErrorMessage("Invalid aadhaar")
            return false
        }

        //CAPTCHA
        if (securityCode.length === 0) {
            inputSecurityCode.current?.scrollIntoView()
            setSecurityCodeInvalid(true)
            setSecurityCodeErrorMessage("Please enter security code")
            return false
        }
        if (!termsAndCondition) {
            inputTermsAndCondition.current?.scrollIntoView()
            setTermsAndConditionError(true)
            return false
        }

        return true
    }

    const onClickGetOtp = async () => {

        //VALIDATE AADHAR AND CAPTCHA IS PRESENT
        if (validateBeforeOTP()) {
            await encryptAadhaar(publicKey, aadhaarNumber.replaceAll(" ", "")).then(async (encryptedAadhaar) => {
                setAadhaarLastFour(aadhaarNumber.substring(aadhaarNumber.length - 4))
                setGetOtpLoading(true)
                const variables = {
                    in_aadhaar_number: encryptedAadhaar,
                    in_security_code: securityCode,
                    in_reinitiate_okyc:false
                }
                await completeFetchNext(props.stage, variables).then((response) => {
                    let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
                    if (response.data.data.task_name !== "aadhaarScreen" && response.data.data.task_name !== "aadhaarOTP") {
                        if(response.data.data.task_name === "kycDigioScreen"){
                            setShowRedirectionLoader(true)
                            setTimeout(() => {
                                navigate(redirectTo, {
                                    state: {
                                        variables: response.data.data, //TO SEND DATA NEXT SCREEN
                                    },
                                    replace: true
                                })
                            }, 3000)
                        }
                        else{
                            navigate(redirectTo, {
                                state: {
                                    variables: response.data.data, //TO SEND DATA NEXT SCREEN
                                },
                                replace: true
                            })
                        }  
                    } 
                    if (response.data.data.security_code_verified) {//CAPTCHA VERIFIED
                        setShowOtp(true)
                    } else {//CAPTCHA VERIFIED FAILD
                        setSecurityCodeInvalid(true)
                        setSecurityCodeErrorMessage(response.data.data.security_code_message)
                    }
                }).catch((error) => {
                    if (error) {
                        if (error.status === 401 || error.status === 403) {
                            sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
                        }
                    }
                })
                setGetOtpLoading(false)
            }).catch((error) => {
                if (error) {
                    if (error.status === 401 || error.status === 403) {
                        sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
                    }
                }
            })
        }
    }

    // OTP
    const onChangeOtp = (otp: any) => {
        setOtpInvalid(false)
        setOtp(otp)
    }

    const validateAfterOtp = () => {
        if (otp.length === 0) {
            setOtpInvalid(true)
            setOtpErrorMessage("Please enter OTP")
            return false
        }

        if (otp.length < 6) {
            setOtpInvalid(true)
            setOtpErrorMessage("Invalid OTP")
            return false
        }
        if (shareCode.length === 0) {
            setShareCodeInvalid(true)
            setShareCodeErrorMessage("Please enter share code")
            return false
        } else {
            setShareCodeInvalid(false);  
        }

        if (shareCode.length < 4) {
            setShareCodeInvalid(true)
            setShareCodeErrorMessage("Please enter 4 digit for the share code")
            return false
        } else {
            setShareCodeInvalid(false);  
        }

        return true
    }

    const onClickVerify = async () => {
        if (validateAfterOtp()) {
            setVerifyOtpLoading(true)
            const variables = {
                in_share_code:shareCode,
                in_otp: otp,
                in_reinitiate_okyc:false,
            }

            await completeFetchNext(props.stage, variables).then((response) => {
                let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
                if (response.data.data.task_name !== "aadhaarOTP") {
                    if(response.data.data.task_name === "kycDigioScreen"){
                        setShowRedirectionLoader(true)
                        setTimeout(() => {
                            navigate(redirectTo, {
                                state: {
                                    variables: response.data.data, //TO SEND DATA NEXT SCREEN
                                },
                                replace: true
                            })
                        }, 3000)
                    }
                    else{
                        navigate(redirectTo, {
                            state: {
                                variables: response.data.data, //TO SEND DATA NEXT SCREEN
                            },
                            replace: true
                        })
                    }  
                } else {
                    setOtpInvalid(true)
                    setOtpErrorMessage(response.data.data.aadhaar_otp_verified_message)
                }
            }).catch((error) => {
                if (error) {
                    if (error.status === 401 || error.status === 403) {
                        sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
                    }
                }
            })
            setVerifyOtpLoading(false)
        }
    }


    const onChangeShareCode = (shareCode: any) => {
        setSecurityCodeInvalid(false)
        shareCode = shareCode.replace(/\D/g, '');
        if (shareCode.length > 4) {
            shareCode = shareCode.slice(0, 4);
        }
        setShareCode(shareCode);

    }

    const onChangeAadhaar = (aadhaarNumber: any) => {
        setAadhaarNumberInvalid(false)
        const isNumber = /^\d+$/
        if (isNumber.test(aadhaarNumber) || aadhaarNumber === "") {
            if (aadhaarNumber.length <= 12) {
                // if(aadhaarNumber.length == 4 || aadhaarNumber.length == 9) aadhaarNumber += " " will check in future
                setAadhaarNumber(aadhaarNumber)
            }
        }
    }

    const onChangeSecurityCode = (securityCode: any) => {
        const isNumber = /^[a-zA-Z0-9]+$/
        if (isNumber.test(securityCode) || securityCode === "") {
            if (securityCode.length <= 6) {
                setSecurityCodeInvalid(false)
                setSecurityCode(securityCode)
            }
        }
    }

    const onClickRefreshCaptcha = async () => {
        setRefreshCaptchaLoading(true)
        const variables = {
            in_refresh_captcha: true,
            in_reinitiate_okyc:false
        }

        await completeFetchNext(props.stage, variables).then((response) => {
            let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
            if (response.data.data.task_name !== "aadhaarScreen") {
                if(response.data.data.task_name === "kycDigioScreen"){
                    setShowRedirectionLoader(true)
                    setTimeout(() => {
                        navigate(redirectTo, {
                            state: {
                                variables: response.data.data, //TO SEND DATA NEXT SCREEN
                            },
                            replace: true
                        })
                    }, 3000)
                }
                else{
                    navigate(redirectTo, {
                        state: {
                            variables: response.data.data, //TO SEND DATA NEXT SCREEN
                        },
                        replace: true
                    })
                }  
            }  else {
                setSecurityCode("")
                setCaptchaImage("data:image/png;base64, " + response.data.data.base64_captcha)
            }
        }).catch((error) => {
            if (error) {
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
                }
            }
        })
        setRefreshCaptchaLoading(false)
    }

    return (
        <div className="mt-2">
            <div className="p-5 pb-48">
                <h1 className="text-2xl font-bold -tracking-0.08">
                    KYC verification
                </h1>

                {/* AADHAR  */}
                <div className="mt-10" ref={inputAadhaarNumber}>
                    <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Aadhaar number</p>
                    <label className="relative block">
                        <input
                            data-openreplay-obscured
                            name="aadhaar_number"
                            placeholder="Enter aadhaar number"
                            autoComplete="off"
                            value={(showOtp ? "xxxx xxxx "+aadhaarLastFour: aadhaarNumber)}
                            className={"w-full h-12 tracking-0.08 rounded-lg bg-background outline-none pl-4 pt-1 caret-primary-500 " + (aadhaarNumberInvalid ? "ring-2 ring-red-600" : "focus:border-2 focus:border-primary") + (showOtp ? "" : "")}
                            onChange={(event) => onChangeAadhaar(event.target.value)}
                            readOnly={showOtp}
                            onFocus={() => inputAadhaarNumber.current?.scrollIntoView()}
                        >
                        </input>
                    </label>
                    <p className={"mt-1 w-full text-red-600 " + (aadhaarNumberInvalid ? "visible" : "invisible")}>
                        {aadhaarNumberErrorMessage}
                    </p>
                    <p className="mt-2 text-xs text-granite-gray">OTP will be sent to the mobile number/email registered with your Aadhaar.</p>
                </div>
                <hr className="my-5 text-granite-gray"></hr>

                <div className={" " + (showOtp ? "hidden" : "visible")}>
                    {/* CAPTCHA  */}
                    <div className="mt-10" ref={inputSecurityCode}>
                        <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Enter security code</p>
                        <div className="inline-flex">
                            {captchaImage &&
                                <img className="mx-auto w-32" src={captchaImage} alt="captcha" />
                            }
                            {!captchaImage &&
                                <img className="mx-10 w-16 h-16" src={spinner} alt="captcha" />
                            }
                            <div className="m-4 ursor-pointer" onClick={() => onClickRefreshCaptcha()}>
                                <svg className={(refreshCaptchaLoading ? "image-rotate" : "")} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17 3.3C13.1 1.1 8.3 1.8 5.1 4.7V3C5.1 2.4 4.7 2 4.1 2C3.5 2 3.1 2.4 3.1 3V7.5C3.1 8.1 3.5 8.5 4.1 8.5H8.6C9.2 8.5 9.6 8.1 9.6 7.5C9.6 6.9 9.2 6.5 8.6 6.5H6.2C7.7 4.9 9.8 4 12 4C16.4 4 20 7.6 20 12C20 12.6 20.4 13 21 13C21.6 13 22 12.6 22 12C22 8.4 20.1 5.1 17 3.3ZM19.9 15.5H15.4C14.8 15.5 14.4 15.9 14.4 16.5C14.4 17.1 14.8 17.5 15.4 17.5H17.8C16.3 19.1 14.2 20 12 20C7.6 20 4 16.4 4 12C4 11.4 3.6 11 3 11C2.4 11 2 11.4 2 12C2 17.5 6.5 22 12 22C14.6 22 17 21 18.9 19.2V21C18.9 21.6 19.3 22 19.9 22C20.5 22 20.9 21.6 20.9 21V16.5C20.9 15.9 20.4 15.5 19.9 15.5Z" fill="#969596" />
                                </svg>
                            </div>
                        </div>

                        <input
                            type="text" name="security_code" placeholder="Enter security code" autoComplete="off"
                            maxLength={6}
                            value={securityCode}
                            className={"w-full h-12 tracking-0.08 rounded-lg bg-background outline-none pl-4 pt-1 caret-primary-500 " + (securityCodeInvalid ? "ring-2 ring-red-600" : "focus:border-2 focus:border-primary ")}
                            onChange={(event) => onChangeSecurityCode(event.target.value)}
                            onFocus={() => inputSecurityCode.current?.scrollIntoView()}
                        >
                        </input>
                        <p className={"mt-1 w-full text-red-600 " + (securityCodeInvalid ? "visible" : "invisible")}>
                            {securityCodeErrorMessage}
                        </p>
                    </div>


                </div>

                <div className={" " + (showOtp ? "visible" : "hidden")}>
                    <div>
                        <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">OTP verification</p>
                        <div className="text-center">
                            {/* OTP COMPONENT  */}
                            <OtpInput
                                containerStyle="justify-between"
                                className="w-12"
                                inputStyle={{
                                    width: "3rem",
                                    height: "3rem",
                                    borderRadius: "8px",
                                    backgroundColor: "#ececec",
                                    fontWeight: 700,
                                    fontSize: "20px",
                                }}
                                focusStyle="focus:outline-primary"
                                value={otp}
                                onChange={(otp: any) => onChangeOtp(otp)}
                                numInputs={6}
                                separator={<span></span>}
                                isInputNum={true}
                                shouldAutoFocus={autoFocused}
                            />

                            {otpInvalid && (
                                <p
                                    className={
                                        "mt-1 w-full text-red-600 " + (otpInvalid ? "visible" : "invisible")
                                    }
                                >
                                    {otpErrorMessage}
                                </p>
                            )}
                        </div>
                        {/* SHARE CODE  */}
                        <div className="mt-10">
                            <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Set 4- digit share code</p>
                            <label className="relative block">
                                <input
                                    type="text" name="share_code" placeholder="Enter share code" autoComplete="off"
                                    value={shareCode}
                                    className={"w-full h-12 tracking-0.08 rounded-lg bg-background outline-none pl-4 pt-1 caret-primary-500"}
                                    onChange={(event) => onChangeShareCode(event.target.value)}
                                >
                                </input>

                            </label>
                            <p className={"mt-1 w-full text-red-600 " + (shareCodeInvalid ? "visible" : "invisible")}>
                                {shareCodeErrorMessage}
                            </p>
                            <p className="mt-2 text-xs text-granite-gray">
                                Create a share code (eg. 1234) for paperless offline KYC.
                            </p>
                        </div>
                        <p className="mt-2 text-xs text-granite-gray">Do not leave this page, it can take upto 10 mins to receive OTP on the phone number registered with Aadhaar.</p>
                    </div>
                </div>
            </div>

            {/* STICKEY BUTTON CAPTCHA */}
            <div className={"fixed-button bg-cultured max-w-md " + (showOtp ? "hidden" : "visible")}>
                {/* TERMS AND CONDITION  */}
                <div className="flex gap-3">
                    <input
                        ref={inputTermsAndCondition}
                        className={
                            "h-6 w-6 my-auto " +
                            (termsAndConditionError ? "ring-2 ring-red-600" : "")
                        }
                        type="checkbox"
                        style={{ accentColor: "#2C3D6F" }}
                        onChange={(event) => onCheckTermAndConditionChange(event.target.checked)}
                        checked={termsAndCondition}
                        onFocus={() => inputTermsAndCondition.current?.scrollIntoView()}
                    >
                    </input>
                    <p className="text-xs text-justify w-full my-auto ">By continuing, I allow Protium to verify individual & business KYC using my Aadhaar details.</p>
                </div>
                <div
                    className={
                        "text-red-600 " +
                        (termsAndConditionError
                            ? "visible"
                            : "invisible")
                    }
                >Please agree to the terms
                </div>
                <button
                    className={
                        "h-14 w-full rounded-lg bg-primary text-white font-bold text-lg max-w-md " +
                        (getOtpLoading || editAadhaarLoading ? "opacity-90 cursor-not-allowed" : "")
                    }
                    onClick={() => onClickGetOtp()}
                    disabled={getOtpLoading || editAadhaarLoading}
                >
                    {!getOtpLoading &&
                        <p>GET OTP</p>
                    }

                    {getOtpLoading &&
                        <Loader />
                    }
                </button>
            </div>

            {/* STICKEY BUTTON OTP */}
            <div className={"fixed-button bg-cultured max-w-md " + (showOtp ? "visible" : "hidden")}>
                <button
                    className={
                        "h-14 w-full rounded-lg bg-primary text-white font-bold text-lg max-w-md " +
                        (verifyOtpLoading ? "opacity-90 cursor-not-allowed" : "")
                    }
                    onClick={() => onClickVerify()}
                    disabled={verifyOtpLoading}
                >
                    {!verifyOtpLoading &&
                        <p>VERIFY</p>
                    }

                    {verifyOtpLoading &&
                        <Loader />
                    }
                </button>
            </div>

            {/* OVERLAY REDIRECTION LOADER  */}
            {showRedirectionLoader &&
                <div>
                    {/* OVERLAY  */}
                    <div
                        className={"z-50 left-0 top-0 fixed inset-x-0 bottom-0 h-full w-full bg-black bg-opacity-75 visible"}
                    >
                        <div className="flex justify-center item-center flex-col h-screen">
                            <div className="flex justify-center">
                                <Player
                                    autoplay
                                    loop
                                    src={LottieLoader}
                                    className="w-16 h-16"
                                >
                                </Player>
                            </div>
                            <div className="flex justify-center text-white text-center">
                                <p>
                                    We are redirecting you to digio<br></br>Please wait for sometime, do not refresh
                                </p>
                                
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default Aadhaar