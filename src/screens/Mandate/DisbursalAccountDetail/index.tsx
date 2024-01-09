import { useContext, useState,useRef, useEffect } from "react"
import { useLocation,useNavigate } from "react-router-dom"
import { completeFetchNext } from "../../../apis/resource"
import { getUrlByScreenName } from "../../../utils/Routing"
import { RootContext } from "../../../utils/RootContext"
import BottomSheet from "../../../components/BottomSheet"

import Loader from "../../../components/Loader"
import { Player } from "@lottiefiles/react-lottie-player"
import LottieLoader from "../../../assets/lottie/loader.json"
import checkmark from "../../../assets/svg/checkmark.svg"
import errorImage from "../../../assets/svg/error.svg"

const DisbursalAccountDetail = (props: { stage: string }) => {
    const [ sessionData, sessionDispatch ] = useContext(RootContext)
    const navigate = useNavigate()
    const { state } = useLocation()

    const [accountNumber, setAccountNumber] = useState("")
    const [confirmAccountNumber, setConfirmAccountNumber] = useState("")
    const [ifsc, setIfsc] = useState("")
    const [selectedAccountType,setSelectedAccountType]=useState("")

    const [accountNumberError, setAccountNumberError] = useState(false)
    const [accountNumberErrorMessage, setAccountNumberErrorMessage] = useState("")
    const [confirmAccountNumberError, setConfirmAccountNumberError] = useState(false)
    const [confirmAccountNumberErrorMessage, setConfirmAccountNumberErrorMessage] = useState("")
    const [ifscError, setIfscError] = useState(false)
    const [ifscErrorMessage, setIfscErrorMessage] = useState("")
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [accountTypeError,setAccountTypeError]=useState(false)
    const [accountTypeErrorMessage,setAccountTypeErrorMessage]=useState("")
    const [isAccountTypeOverlayOpen,setIsAccountTypeOverlayOpen]=useState(false)
    const [accountTypeList,setAccountTypeList]=useState(["Current","Savings"])
    const inputAccountNumber = useRef<HTMLInputElement>(null)
    const inputConfirmAccountNumber=useRef<HTMLInputElement>(null)
    const inputIfsc=useRef<HTMLInputElement>(null)
    const inputAccountType=useRef<HTMLInputElement>(null)

    const [submitLoading, setSubmitLoading] = useState(false)
    const [isAccountNumberAvailable,setIsAccountNumberAvailable]=useState(false)
    const [isAccountNumberMasked,setIsAccountNumberMasked]=useState(false)
    const [nonMaskedLastFour,setNonMaskedLastFour]=useState("")
    //LOADER
    const [showRedirectionLoader, setShowRedirectionLoader] = useState(false)
    const [isPennyDropSuccess,setIsPennyDropSucess]=useState(false)
    const [isPennyDropFailed,setIsPennyDropFailed]=useState(false)
    const [pennyMessage,setPennyMessage]=useState(" We have successfully verified your bank account")


    useEffect(()=>{
        if(state?.variables?.bank_account_number){
            if(state?.variables?.is_account_number_masked)
            {
                const maskedAccNum=state.variables.bank_account_number
                const nonMaskedLast=maskedAccNum.substring(maskedAccNum.length - 4).replaceAll("X","")
                setIsAccountNumberMasked(true)
                setNonMaskedLastFour(nonMaskedLast)
            }
            else{
                const bankAccountNumber=state.variables.bank_account_number
                setIsAccountNumberAvailable(true)
                setAccountNumber(bankAccountNumber)
                setConfirmAccountNumber(bankAccountNumber)
            }
        }
    },[])

    const validate = () => {
        setAccountNumberError(false)
        setConfirmAccountNumberError(false)
        setError(false)
        setIfscError(false)
        const accountNumberRegx = /^[0-9]{4,}$/
        const ifscRegx = /^[A-Z]{4}[A-Z0-9]{7}$/
        if (accountNumber.trim().length === 0) {
            inputAccountNumber.current?.scrollIntoView()
            setAccountNumberError(true)
            setAccountNumberErrorMessage("Please enter account number")
            return false
        }
        if(isAccountNumberMasked && nonMaskedLastFour!==accountNumber.trim().substring(accountNumber.trim().length - nonMaskedLastFour.length)){
            inputAccountNumber.current?.scrollIntoView()
            setAccountNumberError(true)
            setAccountNumberErrorMessage("Please enter account number ending with "+nonMaskedLastFour)
            return false
        }
        if (accountNumber.length < 4 || !accountNumberRegx.test(accountNumber)) {
            inputAccountNumber.current?.scrollIntoView()
            setAccountNumberError(true)
            setAccountNumberErrorMessage("Please enter valid account number")
            return false
        }
        if (confirmAccountNumber.trim().length === 0) {
            inputConfirmAccountNumber.current?.scrollIntoView()
            setConfirmAccountNumberError(true)
            setConfirmAccountNumberErrorMessage("Please re-enter account number")
            return false
        }
        if (
            confirmAccountNumber.length < 9 ||
            !accountNumberRegx.test(confirmAccountNumber)
        ) {
            inputConfirmAccountNumber.current?.scrollIntoView()
            setConfirmAccountNumberError(true)
            setConfirmAccountNumberErrorMessage("Please enter valid account number")
            return false
        }
        if (ifsc.trim().length === 0) {
            inputIfsc.current?.scrollIntoView()
            setIfscError(true)
            setIfscErrorMessage("Please enter IFSC")
            return false
        }
        if (ifsc.length < 11 || !ifscRegx.test(ifsc)) {
            inputIfsc.current?.scrollIntoView()
            setIfscError(true)
            setIfscErrorMessage("Please enter valid IFSC")
            return false
        }
        if (accountNumber.trim() !== confirmAccountNumber.trim()) {
            inputConfirmAccountNumber.current?.scrollIntoView()
            setConfirmAccountNumberError(true)
            setConfirmAccountNumberErrorMessage("Please enter same as account number")
            return false
        }
        if (selectedAccountType==="") {
            inputAccountType.current?.scrollIntoView()
            setAccountTypeError(true);
            setAccountTypeErrorMessage("Please select account type");
            return false;
            }
        return true
    }

    const resetStateVariables=()=>{
        setIsPennyDropSucess(false)
        setIsPennyDropFailed(false)
        setPennyMessage("We have successfully verified your bank account")
    }

    const onClickSubmit = async () => {
        resetStateVariables()
        if (validate()) {
            setSubmitLoading(true)
            setShowRedirectionLoader(true)
            const variables = {
                in_bank_account_number: confirmAccountNumber,
                in_ifsc: ifsc,
                in_account_type:selectedAccountType
            }
            await completeFetchNext(props.stage, variables).then((response) => {
                let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
                if(response.data.data.penny_verified){
                    if(response.data.data.penny_drop_type != "penny_less"){
                        setPennyMessage("We have successfully deposited ₹ 1 into your bank account")
                    }
                    setIsPennyDropSucess(true)
                    setTimeout(() => {
                    navigate(redirectTo, {
                        state: {
                            variables: response.data.data, //TO SEND DATA NEXT SCREEN
                        },
                        replace: true
                    })
                    setSubmitLoading(false)
                }, 2000)   
                }
                else if(!response.data.data.penny_verified && response.data.data.task_name!=="bankDetailScreen")
                {
                    navigate(redirectTo, {
                        state: {
                            variables: response.data.data, //TO SEND DATA NEXT SCREEN
                        },
                        replace: true
                    })
                    setSubmitLoading(false)
                }
                else {
                    setIsPennyDropFailed(true)
                    setPennyMessage(response.data.data.penny_validation_message)
                    setTimeout(()=>{
                        setSubmitLoading(false)
                        setShowRedirectionLoader(false)
                    },2000)
                } 
            }).catch((error) => {
                setSubmitLoading(false)
                setShowRedirectionLoader(false)
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                }
            })
            
        }
    }

    const onChangeAccountNumber = (value: string) => {
        const isNumber = /^[0-9]+$/
        setAccountNumberError(false)
        if(isNumber.test(value) || value === ""){
            if(value.length <= 18){
                setAccountNumber(value)
            }
        }
    }

    const onChangeConfirmAccountNumber = (value: string) => {
        const isNumber = /^[0-9]+$/
        setConfirmAccountNumberError(false)
        if(isNumber.test(value) || value === ""){
            if(value.length <= 18){
                setConfirmAccountNumber(value)
            }
        }
    }

    const onChangeIfsc = (value: string) => {
        const isIfsc = /^[a-zA-Z0-9]+$/
        setIfscError(false)
        if(isIfsc.test(value) || value === ""){
            if(value.length < 12){
                setIfsc(value.toUpperCase())
            }
        }
    }

    const onSelectAccountType=(item:string)=>{
        setSelectedAccountType(item)
        setAccountTypeError(false)
        setIsAccountTypeOverlayOpen(false)
      }

      const onClickAccountTypeInput=()=>{
        setIsAccountTypeOverlayOpen(true)
        setAccountTypeError(false)
        setAccountTypeErrorMessage("")
      }

    return (
        <div className="flex flex-col">
            <div className="mx-5 pb-24">
                <div className="mb-7 font-bold text-2xl items-center flex-grow-0 mt-5 self-stretch -tracking-0.08">
                    <p>Disbursal account verification</p>
                </div>

                {/* ACCOUNT NUMBER  */}
                <div ref={inputAccountNumber}>
                    <p className="font-semibold text-sm leading-4.5 -tracking-0.06">
                        Account number
                    </p>
                    <label className="relative mt-2 focus-within:text-gray-600 block">
                        <input
                            className={
                                "bg-background rounded-lg items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08 outline-none text-security" +
                                (accountNumberError ? " ring-2 ring-red-600" : " focus:border-2 focus:border-primary")
                            }
                            placeholder="Enter Account Number"
                            value={accountNumber}
                            onChange={(e) => {onChangeAccountNumber(e.target.value)}}
                            onPaste={(e) => {e.preventDefault()}}
                            onCopy={(e) => {e.preventDefault()}}
                            onFocus={() => {inputAccountNumber.current?.scrollIntoView()}}
                            disabled={isAccountNumberAvailable}
                        />
                    </label>
                   {accountNumberError && <div
                        className={
                            "mt-1 text-red-600 w-full "
                        }
                    >
                        {accountNumberErrorMessage}
                    </div> }
                    
                    {isAccountNumberMasked && nonMaskedLastFour && <p className=" text-xs text-granite-gray">Enter account number ending with {nonMaskedLastFour} </p> }
                </div>

                {/* CONFIRM ACCOUNT NUMBER  */}
                <div className="mt-7" ref={inputConfirmAccountNumber}>
                    <p className="font-semibold text-sm leading-4.5 -tracking-0.06">
                        Confirm account number
                    </p>
                    <label className="relative mt-2 focus-within:text-gray-600 block">
                        <input
                            className={
                                "bg-background rounded-lg items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08 outline-none focus:border-2 focus:border-primary" +
                                (confirmAccountNumberError ? " ring-2 ring-red-600" : "")
                            }
                            placeholder="Enter account number"
                            value={confirmAccountNumber}
                            onChange={(e) => {onChangeConfirmAccountNumber(e.target.value)}}
                            onFocus={() => {inputConfirmAccountNumber.current?.scrollIntoView()}}
                            disabled={isAccountNumberAvailable}
                        />
                    </label>
                    <div
                        className={
                            "mt-1 text-red-600 w-full h-1 " +
                            (confirmAccountNumberError ? "visible" : "invisible")
                        }
                    >
                        {confirmAccountNumberErrorMessage}
                    </div>
                </div>

                {/* IFSC NUMBER  */}
                <div className="mt-7" ref={inputIfsc}>
                    <p className="font-semibold text-sm leading-4.5 -tracking-0.06">
                        IFSC
                    </p>
                    <label className="relative mt-2 focus-within:text-gray-600 block">
                        <input
                            className={
                                "bg-background rounded-lg items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08 outline-none " +
                                (ifscError ? " ring-2 ring-red-600" : " focus:border-2 focus:border-primary")
                            }
                            placeholder="Enter IFSC"
                            value={ifsc}
                            onChange={(e) => {onChangeIfsc(e.target.value)}}
                            onFocus={() => {inputIfsc.current?.scrollIntoView()}}
                        />
                    </label>
                    <div
                        className={
                            "mt-1 text-red-600 w-full h-1 " +
                            (ifscError ? "visible" : "invisible")
                        }
                    >
                        {ifscErrorMessage}
                    </div>
                    <div
                        className={
                            "mt-1 text-red-600 w-full h-1 " + (error ? "visible" : "invisible")
                        }
                    >
                        {errorMessage}
                    </div>
                </div>

                {/* ACCOUNT TYPE DROPDOWN */}
            <div className="flex flex-col mt-7 pb-4" ref={inputAccountType}>
                <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">
                    Account type
                </p>
                <div className="relative w-full">
                    <div
                    onClick={onClickAccountTypeInput}
                    className={"flex items-center rounded-lg px-2 justify-between bg-background h-12 "+(accountTypeError ? "ring-2 ring-red-600" : " focus:border-2 focus:border-primary")}
                    onFocus={() => {inputAccountType.current?.scrollIntoView({inline: "center"})}}
                    >
                    <input
                        className="bg-background items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08  outline-none"
                        placeholder="Select account type"
                        value={selectedAccountType}
                        readOnly={true}
                    />
                    <svg
                        className="mr-2"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                        d="M19.9201 8.9502L13.4001 15.4702C12.6301 16.2402 11.3701 16.2402 10.6001 15.4702L4.08008 8.9502"
                        stroke="#666667"
                        strokeWidth="3"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        />
                    </svg>
                    </div>
                </div>
                <div className={"flex mt-1 text-red-600 " + (accountTypeError ? "visible" : "invisible")}>
                    <p>{accountTypeErrorMessage}</p>
                </div>
            </div>
            </div>
            {/* STICKEY BUTTON  */}
            <div className="fixed-button bg-cultured max-w-md">
                <button
                    className={
                        "h-14 w-full rounded-lg bg-primary text-white font-bold text-lg max-w-md " +
                        (submitLoading ? "opacity-90 cursor-not-allowed" : "")
                    }
                    onClick={() => onClickSubmit()}
                    disabled={submitLoading}
                >
                    {!submitLoading &&
                        <p>SUBMIT</p>
                    }

                    {submitLoading &&
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
                                
                                {isPennyDropSuccess ? <img src={checkmark} className="w-32 h-32 mx-auto"/>:isPennyDropFailed?
                                <img src={errorImage} className="w-20 h-20 mx-auto"/>:
                                <Player
                                    autoplay
                                    loop
                                    src={LottieLoader}
                                    className="w-16 h-16"
                                >
                                </Player>}
                            </div>
                            <div className="flex justify-center flex-col text-center text-white mt-1">
                                {isPennyDropSuccess ?<div>
                                <p className="font-bold  text-lg">Success</p>
                                <p className="mt-1">{pennyMessage}</p>
                            </div>:isPennyDropFailed?<div>
                                    <p className="font-bold  text-lg">Failed</p>
                                    <p>{pennyMessage}</p>
                                </div>:
                                <p className="mt-1">We are verifying your bank account...</p>}
                            </div>
                        </div>
                    </div>
                </div>
            }

    <BottomSheet
        showClose={true}
        defaultVisible={isAccountTypeOverlayOpen}
        heading=""
        onVisible={(status) => { setIsAccountTypeOverlayOpen(status) }}
        height={350}
      >
        <div className="w-full max-w-md">
        <h1 className="font-bold text-2xl text-center">
            Account type
        </h1>

          {/* LIST OF ACCOUNT TYPES */}
          <div>
            <ul
                className="divide-y divide-light-silver h-screen overflow-auto pb-96"
              >
                {accountTypeList.length>0  &&
                  accountTypeList.map((item:string) => {
                    return (
                      <li
                        className="p-2 my-2"
                        key={item}
                        onClick={() => {
                          onSelectAccountType(item)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5/6">
                            <p className="leading-5.5 tracking-0.08 truncate">
                              {item}
                            </p>
                          </div>
                          <div className="w-1/6">
                            <div className={"float-right " + ((selectedAccountType == item) && (isAccountTypeOverlayOpen) ? "visible" : "hidden")}>
                              {/* CHECKMARK  */}
                              { ((selectedAccountType== item) && (selectedAccountType)) &&
                                  <svg width="20" viewBox="0 0 14 10" fill="none">
                                    <path d="M2 5L5.33333 8L12 2" stroke="#293B75" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                              }
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                })}
              </ul>
          </div>
        </div>
      </BottomSheet>
        </div>
    )
}
export default DisbursalAccountDetail
