
import { useContext, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom";
import { initialize, verify } from "../../apis/auth"
import { fetchNext } from "../../apis/resource"
import { getUrlByScreenName } from "../../utils/Routing"
import { RootContext } from "../../utils/RootContext"
import { detect } from "../../lib/DetectBrowser"

import OpenReplay from "@openreplay/tracker"
import OtpInput from "react18-input-otp"
import Loader from "../../components/Loader"
import BottomSheet from "../../components/BottomSheet"
import landingPage from "../../assets/svg/landing-page.svg"
import InstantDisbursal from "../../assets/svg/instant-disbursul.svg"
import ZeroPreclosure from "../../assets/svg/zero-preclosure.svg"
import Whatsapp from "../../assets/svg/whatsapp.svg"
import spinner from "../../assets/svg/spinner.svg"


const Landing = (props: {tracker:OpenReplay }) => {
  const [ sessionData, sessionDispatch ] = useContext(RootContext)
  const counterSeconds = import.meta.env.VITE_APP_OTP_RESEND_TIMER_IN_SECOND
  const navigate = useNavigate()
  const { tracker } = props

  const inputMobile = useRef<HTMLInputElement>(null)

  const [mobileNumber, setMobileNumber] = useState("")
  const [mobileError, setMobileError] = useState(false)
  const [mobileErrorMessage, setMobileErrorMessage] = useState("Please enter mobile number")
  const [getOtpLoading, setGetOtpLoading] = useState(false)

  const [termsAndCondition, setTermsAndCondition] = useState(true)
  const [termsAndConditionError, setTermsAndConditionError] = useState(false)

  const [otp, setOtp] = useState("")
  const [invalidOtp, setInvalid] = useState(false)
  const [otpErrorMessage, setOtpErrorMessage] = useState("")
  const [autoFocused, setAutoFocused] = useState(true)
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false)
  const [isResendLoading, setIsResendLoading] = useState(false)

  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false)

  const [ showResendOtp, setShowResendOtp ] = useState(true)

  const [ userLat, setUserLat ] = useState(0.0)
  const [ userLong, setUserLong ] = useState(0.0)

  const [ ip, setIp ] = useState("0.0.0.0")
  const [referrerDetails, setReferrerDetails] = useState({utm_campaign : "", showReferrerDetails: false})

  const browserInfo=detect()
  const browserDetails={name:browserInfo?.name,os:browserInfo?.os,version:browserInfo?.version}
  
  const getSessionInfo = async () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLat(position.coords.latitude) 
      setUserLong(position.coords.longitude)    
    }) 
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    setIp(data.ip)
  }

  //START OPENREPLAY TRACKER
  useEffect(() => {
    //SET LOGGED OUT
    sessionDispatch({type: 'UPDATE', data: {isLoggedIn: false, sessionExpired: false}})
    getSessionInfo()
    inputMobile.current?.focus()
    checkUtmParams()
  },[])

  const checkTokenExist = async () => {
    var urlParam = new URL(window.location.href)
    console.log("urlParam :", )
    var urlToken = urlParam.searchParams.get("token")
    if(urlToken !== null){
      sessionStorage.setItem("_token", urlToken)
    }
    const _token = sessionStorage.getItem("_token")
    if (_token){
      await fetchNext("main").then((response) => {
        sessionDispatch({type: 'UPDATE', data: {isLoggedIn: true, sessionExpired: false}})
        tracker?.setUserID(mobileNumber)
        let redirectTo = getUrlByScreenName(response.data.data.task_name)
        if(response.data.data.task_name !== "customerInfoScreen" && response.data.data.task_name !== "errorScreen" && response.data.data.task_name !== "rejectScreen"){
            redirectTo = "/application-timeline"
        }
        redirectTo += window.location.search ? window.location.search : ""
        navigate(redirectTo, {
          state: {
            variables: response.data.data, //TO SEND DATA NEXT SCREEN
          },
          replace : true
        })
      }).catch(()=>{
        sessionStorage.removeItem("_token")
      })
    }
  }

  useEffect(() => {
    checkTokenExist()
  }, [])

  // TIMER
  const [counter, setCounter] = useState(0)
  useEffect(() => {
    const timer =
      counter > 0 && setInterval(() => setCounter(counter - 1), 1000)
    // @ts-ignore: Unreachable code error
    return () => clearInterval(timer)
  }, [counter])

  const checkUtmParams = () =>{
    let utmParams = {}
    var url = new URL(window.location.href);
        url.searchParams.forEach(function(value, key) {
            if(key.startsWith("utm")){
                // @ts-ignore
                utmParams[key] = value
            }
            if(key === "utm_campaign"){
              const utmCampaignRegex=/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@protium.co.in$/
              //VALIDATE UTM_CAMPAIGN VALUE
              if (value.trim().length != 0 && utmCampaignRegex.test(value) ) {
                setReferrerDetails({utm_campaign : value, showReferrerDetails: true})
              }
            }
        })    
  }

  //MOBILE NUMBER
  const onChangeMobileNumber = (mobileNumber: string) => {
    setMobileError(false)
    const isNumber = /^\d+$/
    if (isNumber.test(mobileNumber) || mobileNumber === "") {
      if (mobileNumber.length <= 10) {
        setMobileNumber(mobileNumber)
      }
    }
  }

  const validateMobile = () => {
    setMobileError(false)
    setTermsAndConditionError(false)
    const IndNumRegx = /^[0]?[7896]\d{9}$/

    if (mobileNumber.length === 0) {
      setMobileError(true)
      setMobileErrorMessage("Please enter mobile number")
      return false
    }

    if (mobileNumber.length !== 10 || !IndNumRegx.test(mobileNumber)) {
      setMobileError(true)
      setMobileErrorMessage("Invalid mobile number")
      return false
    }

    if (!termsAndCondition) {
      setTermsAndConditionError(true)
      return false
    }

    return true
  }

  // OTP
  const onChangeOtp = (otp: string) => {
    setInvalid(false)
    setOtp(otp)
  }

  const validateOtp = () => {
    if (otp.length === 0) {
      setInvalid(true)
      setOtpErrorMessage("Please enter OTP")
      return false
    }

    if (otp.length < 6) {
      setInvalid(true)
      setOtpErrorMessage("Invalid OTP")
      return false
    }

    return true
  }

  const onclickResentOtp = async (status: boolean) => {
    setInvalid(false)
    setIsResendLoading(true)
    const data = {
      login_id: mobileNumber,
      data: {
        otp: otp,
        resend_otp: status,
      },
    }
    
    await verify(data).then((response) => {
      tracker?.event("RESENT_OPT", "YES")
      setCounter(counterSeconds)
    }).catch((error) => {
      if(error){
        if (error.status === 404) {
          onClickGetOtp() //INITIATE AGAIN
        } else if (error.status === 400) {
          if(error.data.code=="WF02"){
            setShowResendOtp(false)
          }
          setInvalid(true)
          setOtpErrorMessage(error.data.message)
        }
      }
    })
    setOtp("")
    setIsResendLoading(false)
  }

  const onClickVerifyOtp = async () => {
    if (validateOtp()) {
      console.log("latest js")
      let utmParams = {}
        var url = new URL(window.location.href);
        url.searchParams.forEach(function(value, key) {
            if(key.startsWith("utm")){
                // @ts-ignore
                utmParams[key] = value
            }
      })

      const data = {
        login_id: mobileNumber,
        data: {
          otp: otp,
          resend_otp: false,
          utm: utmParams
        },
      }

      setOtpVerifyLoading(true)
      await verify(data).then(async(response) => {
        //stage decides which workflow will triggered
        const stage = response.data.data.stage
        //store access token in session storage
        sessionStorage.setItem("_token", response.data.data.access_token)
        tracker?.event("OTP_VERIFIED", "YES")
        //get next task of main process
        await fetchNext(stage).then((response) => {
          sessionDispatch({type: 'UPDATE', data: {isLoggedIn: true, sessionExpired: false}})
          tracker?.setUserID(mobileNumber)
          let redirectTo = getUrlByScreenName(response.data.data.task_name)
        
          if(stage === "main"){
            if(response.data.data.task_name !== "customerInfoScreen" && response.data.data.task_name !== "errorScreen" && response.data.data.task_name !== "rejectScreen"){
              redirectTo = "/application-timeline"
            }
          }
          redirectTo += window.location.search ? window.location.search : ""
          navigate(redirectTo, {
            state: {
              variables: response.data.data, //TO SEND DATA NEXT SCREEN
            },
            replace : true
          })
        })
      }).catch((error) => {
        if(error){
          setInvalid(true)
          setOtpErrorMessage(error.data.message)
        }
      })
      setOtpVerifyLoading(false)
    }
  }

  //TERMS AND CONDITION
  const onCheckTermAndConditionChange = (termSatus: boolean) => {
    setTermsAndConditionError(false)
    setTermsAndCondition(termSatus)
  }

   //ON CLOSE OTP OVERLAY
  const onClose=()=>{
    setInvalid(false)
    setIsResendLoading(false)
    setShowResendOtp(true)
    setCounter(0)
    setOtpVerifyLoading(false)
  } 

  //OVERLAY SHOW/HIDE
  const onClickGetOtp = async () => {
    if (validateMobile()) {
      tracker?.setUserID(mobileNumber)
      setOtp("")
      setInvalid(false)
      
      const data = {
        login_id: mobileNumber,
        data: {
          ip_address:ip,
          mobile_number: mobileNumber,
          meta_info: {
              browser_info: browserDetails
          },
          location: { 
            lat: userLat,
            long: userLong
          }
        },
      }
      setGetOtpLoading(true)
      await initialize(data).then((response) => {
        tracker?.event("OTP_SENT", "YES")
        setShowResendOtp(true)
        setIsBottomSheetVisible(true)
        setAutoFocused(true)
      }).catch((error) => {
        console.log("error :: ", error)
        setMobileError(true)
        setMobileErrorMessage(error.data.message)
      })
      setGetOtpLoading(false)
    }
  }

  return (
    <>
    { !(sessionStorage.getItem("_token")) &&
    <div className="mt-2">
      {/* LANDING PAGE */}
      <div className="p-5 pb-24">
        <h1 className="text-heading-width font-bold  leading-10">
          Get loan the easy way
        </h1>
        <p className="text-base font-semibold tracking-tight">
          Business loan upto ₹ 15 lakhs
        </p>
        <div className="mt-1">
          <img src={landingPage} /> 
        </div>
        <div className="mt-1 grid grid-cols-2 gap-4">
          <div className="flex border rounded-lg border-light-silver h-14">
            <img
              className="mx-1 xsm:mx-2 sm:mx-3 md:mx-4 my-auto xsm:my-4"
              src={InstantDisbursal}
              alt="instant disbursal"
            />
            <p className="text-sm my-3 leading-4">
              Instant <br></br> disbursal
            </p>
          </div>
          <div className="flex border rounded-lg border-light-silver h-14">
            <img
              className="mx-1 xsm:mx-2 sm:mx-3 md:mx-4 my-auto xsm:my-4"
              src={ZeroPreclosure}
              alt="zero preclosure"
            />
            <p className="text-sm my-3 leading-4">
              NO <br></br> collateral
            </p>
          </div>
        </div>
        <div className="mt-5">
          <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Get started</p>
          <label className="relative rounded-lg bg-background focus-within:text-gray-600">
            <svg
              className="w-6 pointer-events-none absolute top-1/2 transform -translate-y-1/2 left-3"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                opacity="0.4"
                d="M21.97 18.33C21.97 18.69 21.89 19.06 21.72 19.42C21.55 19.78 21.33 20.12 21.04 20.44C20.55 20.98 20.01 21.37 19.4 21.62C18.8 21.87 18.15 22 17.45 22C16.43 22 15.34 21.76 14.19 21.27C13.04 20.78 11.89 20.12 10.75 19.29C9.6 18.45 8.51 17.52 7.47 16.49C6.44 15.45 5.51 14.36 4.68 13.22C3.86 12.08 3.2 10.94 2.72 9.81C2.24 8.67 2 7.58 2 6.54C2 5.86 2.12 5.21 2.36 4.61C2.6 4 2.98 3.44 3.51 2.94C4.15 2.31 4.85 2 5.59 2C5.87 2 6.15 2.06 6.4 2.18C6.66 2.3 6.89 2.48 7.07 2.74L9.39 6.01C9.57 6.26 9.7 6.49 9.79 6.71C9.88 6.92 9.93 7.13 9.93 7.32C9.93 7.56 9.86 7.8 9.72 8.03C9.59 8.26 9.4 8.5 9.16 8.74L8.4 9.53C8.29 9.64 8.24 9.77 8.24 9.93C8.24 10.01 8.25 10.08 8.27 10.16C8.3 10.24 8.33 10.3 8.35 10.36C8.53 10.69 8.84 11.12 9.28 11.64C9.73 12.16 10.21 12.69 10.73 13.22C11.27 13.75 11.79 14.24 12.32 14.69C12.84 15.13 13.27 15.43 13.61 15.61C13.66 15.63 13.72 15.66 13.79 15.69C13.87 15.72 13.95 15.73 14.04 15.73C14.21 15.73 14.34 15.67 14.45 15.56L15.21 14.81C15.46 14.56 15.7 14.37 15.93 14.25C16.16 14.11 16.39 14.04 16.64 14.04C16.83 14.04 17.03 14.08 17.25 14.17C17.47 14.26 17.7 14.39 17.95 14.56L21.26 16.91C21.52 17.09 21.7 17.3 21.81 17.55C21.91 17.8 21.97 18.05 21.97 18.33Z"
                fill="#666667"
              />
            </svg>
            <input
              ref={inputMobile}
              onChange={(event: any) =>
                onChangeMobileNumber(event.target.value)
              }
              id="mobile_number"
              name="mobile_number"
              placeholder="Enter mobile number"
              autoComplete="off"
              pattern="[6-9]{1}[0-9]{4}\s[0-9]{5}"
              value={mobileNumber}
              className={
                "border-2 border-background  w-full h-12 tracking-wider font-normal text-base rounded-lg bg-background outline-none pl-14 pt-1 caret-primary-500 " +
                (mobileError ? "ring-2 ring-red-600" : "focus:border-2 focus:border-primary")
              }
              disabled={isBottomSheetVisible}
            ></input>
          </label>
          <p className={"mt-1 text-red-600 " + (mobileError ? "visible" : "invisible")}>
            {mobileErrorMessage}
          </p>
          {referrerDetails.showReferrerDetails &&  <p className="text-md text-granite-gray w-full break-words">Referrer is <span className="font-bold">{referrerDetails.utm_campaign}</span></p>}
        </div>
        <div className="my-2 mb-12">
          <div className="flex gap-3">
            <input
              className={
                "h-6 w-6 my-auto " +
                (termsAndConditionError ? "ring-2 ring-red-600" : "")
              }
              type="checkbox"
              style={{ accentColor: "#2C3D6F" }}
              onChange={(e) => onCheckTermAndConditionChange(e.target.checked)}
              checked={termsAndCondition}
            ></input>
            <p className="font-normal text-xs text-granite-gray text-justify w-full my-auto">
              By continuing, you agree to the <a className="text-primary underline decoration-solid" href="https://protium.co.in/regulatory/terms-and-conditions/" target="_blank">T&C</a> and{" "}
              <a className="text-primary underline decoration-solid" href="https://protium.co.in/regulatory/privacy-policy/" target="_blank">privacy policy</a>.
            </p>
          </div>
          <div
            className={
              "mt-1 text-red-600 " +
              (termsAndConditionError ? "visible" : "invisible")
            }
          >
            Please agree to the terms
          </div>
        </div>
      </div>

      {/* OTP OVERLAY  */}
      <BottomSheet
        showClose={true}
        defaultVisible={isBottomSheetVisible}
        heading="Verify mobile number"
        onVisible={(status) => 
          { 
            setIsBottomSheetVisible(status)
            onClose() 
          }}
        height={440}
      >
        <div>
          <p className="mt-8 mb-4 text-center">
            Enter OTP sent to {mobileNumber}
          </p>
          <div className="flex flex-col text-center">
            {/* OTP COMPONENT  */}
            <OtpInput
              containerStyle="justify-center gap-2"
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
              onChange={(otp: any) => {onChangeOtp(otp)}}
              numInputs={6}
              separator={<span></span>}
              isInputNum={true}
              shouldAutoFocus={autoFocused}
            />
            <p className={"flex justify-center items-center mt-2 w-full text-red-600 " + (invalidOtp ? "visible" : "invisible")}>
              {otpErrorMessage}
            </p>
            </div>           

            <p className={"mt-1 font-normal text-center " + (counter !== 0 ? "" : "invisible") }>
              Resend OTP in{" "}
              <span className="font-bold text-primary">{counter} sec</span>
            </p>
          
            <div className={"flex gap-1 justify-center items-center font-normal text-center " + (counter === 0 && (showResendOtp) ? "" : "invisible")}>
              Didn't receive OTP?
              <span
                className="font-bold text-primary"
                onClick={() => onclickResentOtp(true)}
              >
                {!isResendLoading &&
                  <p>Resend</p>
                }

                {isResendLoading &&
                  <Loader color="#2C3D6F" width="40px" height="40px" />
                }
              </span>
            </div>
          

          <div className="flex justify-center">
            <img src={Whatsapp} alt="whatsapp" />
            <p className="my-4 font-normal">Receive updates on WhatsApp.</p>
          </div>
          <div className="mt-4 flex justify-center bottom-0">
            <button
              className={"h-14 w-full rounded-lg bg-primary text-white font-bold text-lg max-w-md " + (getOtpLoading ? "opacity-90 cursor-not-allowed" : "")}
              onClick={() => onClickVerifyOtp()}
              disabled={otpVerifyLoading}
            >

              {!otpVerifyLoading &&
                <p>VERIFY</p>
              }

              {otpVerifyLoading &&
                <Loader />
              }
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* STICKEY BUTTON  */}
      <div className="fixed-button bg-cultured max-w-md">
        <button
          id="btn_get_otp"
          className={"h-14 w-full rounded-lg text-white font-bold text-lg max-w-md "+(mobileNumber.length!=10?" bg-taupe-gray":"bg-primary") + (getOtpLoading ? " opacity-90 cursor-not-allowed" : "")}
          onClick={() => onClickGetOtp()}
          disabled={getOtpLoading || mobileNumber.length!=10}
        >

          {!getOtpLoading &&
            <p>GET OTP</p>
          }

          {getOtpLoading &&
            <Loader />
          }

        </button>
      </div>
    </div>
      }
      { (sessionStorage.getItem("_token")) &&
      <div className="w-full flex justify-center"><img className="mx-10 w-16 h-16" src={ spinner } alt="content loading" /></div>
      }
    </>
  )
}

export default Landing
