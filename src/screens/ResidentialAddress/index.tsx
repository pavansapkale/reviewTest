import { useState,useEffect, useContext, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { completeFetchNext, fetchNext } from "../../apis/resource"
import { getUrlByScreenName } from "../../utils/Routing"
import { RootContext } from "../../utils/RootContext"
import Loader from "../../components/Loader"
import { Player } from "@lottiefiles/react-lottie-player"
import LottieLoader from "../../assets/lottie/loader.json"
import checkmark from "../../assets/svg/checkmark.svg"

const ResidentialAddress = (props: { stage: string }) => {
    const [ sessionData, sessionDispatch ] = useContext(RootContext)
    const navigate = useNavigate()
    
    const [pinCode, setPinCode] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")

    const [houseNumber,setHouseNumber]=useState("")
    const [areaOrLocation,setAreaOrLocation]=useState("")
    const [landmark,setLandmark]=useState("")

    const inputHouseNumber = useRef<HTMLInputElement>(null)
    const inputAreaOrLocation = useRef<HTMLInputElement>(null)
    const inputLandmark = useRef<HTMLInputElement>(null)

    const [houseNumberError, setHouseNumberError] = useState(false)
    const [houseNumberErrorMsg, setHouseNumberErrorMessage] = useState("")
    const [areaOrLocationError, setAreaOrLocationError] = useState(false)
    const [areaOrLocationErrorMessage, setAreaOrLocationErrorMessage] = useState("")
    const [landmarkError, setLandmarkError] = useState(false)
    const [landmarkErrorMessage, setLandmarkErrorMessage] = useState("")

    const [submitLoading, setSubmitLoading] = useState(false)

     //LOADER
     const [showRedirectionLoader, setShowRedirectionLoader] = useState(false)
     const [isPennyDropSuccess,setIsPennyDropSucess]=useState(false)
     const [isAutoPennyDrop,setIsAutoPennyDrop]=useState(false)
     const [pennyMessage,setPennyMessage]=useState("We have successfully verified your bank account")

    useEffect(()=>{
        //FETCH MAIN WORKFLOW VARIABLES
        initialFetch()
    },[])

    const initialFetch = async () => {
        await fetchNext(props.stage).then((response) => {
            setIsAutoPennyDrop(response.data.data.auto_penny_drop)
            setPinCode(response.data.data.pincode)
            setCity(response.data.data.pincode_data.city)
            setState(response.data.data.pincode_data.state)
        }).catch((error) => {
            if(error){
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                }
            }
        })
    }
    
    const validate = () => {
        setHouseNumberError(false)
        setAreaOrLocationError(false)
        setLandmarkError(false)
        if (houseNumber.trim().length === 0) {
            inputHouseNumber.current?.scrollIntoView()
            setHouseNumberError(true)
            setHouseNumberErrorMessage("Please enter house number")
            return false
        }
        if(houseNumber.trim().length < 5){
            inputHouseNumber.current?.scrollIntoView()
            setHouseNumberError(true)
            setHouseNumberErrorMessage("Minimum 5 characters needed")
            return false
        }
        if (houseNumber.trim().length > 100) {
            inputHouseNumber.current?.scrollIntoView()
            setHouseNumberError(true)
            setHouseNumberErrorMessage("Maximum character limit is 100")
            return false
        }
        
        if (areaOrLocation.trim().length === 0) {
            inputAreaOrLocation.current?.scrollIntoView()
            setAreaOrLocationError(true)
            setAreaOrLocationErrorMessage("Please enter area/location")
            return false
        }
        if (areaOrLocation.trim().length < 5) {
            inputAreaOrLocation.current?.scrollIntoView()
            setAreaOrLocationError(true)
            setAreaOrLocationErrorMessage("Minimum 5 characters needed")
            return false
        }
        if (areaOrLocation.trim().length > 100) {
            inputAreaOrLocation.current?.scrollIntoView()
            setAreaOrLocationError(true)
            setAreaOrLocationErrorMessage("Maximum character limit is 100")
            return false
        }
        if (landmark.trim().length === 0) {
            inputLandmark.current?.scrollIntoView()
            setLandmarkError(true)
            setLandmarkErrorMessage("Please enter landmark")
            return false
        }
        if (areaOrLocation.length < 5) {
            inputAreaOrLocation.current?.scrollIntoView()
            setLandmarkError(true)
            setLandmarkErrorMessage("Minimum 5 characters needed")
            return false
        }
        if (areaOrLocation.trim().length > 100) {
            inputAreaOrLocation.current?.scrollIntoView()
            setLandmarkError(true)
            setLandmarkErrorMessage("Maximum character limit is 100")
            return false
        }

        return true
    }

    const onClickSubmit = async () => {
        if (validate()) {
            if(isAutoPennyDrop){
                setShowRedirectionLoader(true)
            }
            setSubmitLoading(true)
            const variables = {
                in_address: (houseNumber + ", " + areaOrLocation + ", " + landmark),
                in_flat_number: houseNumber,
                in_area_location: areaOrLocation,
                in_landmark: landmark
            }

            await completeFetchNext(props.stage, variables).then(async (response) => {
                let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
                if(response.data.data.task_name === "MANDATE"){
                    await fetchNext("mandate").then((response) => {
                        let redirectToMandate: string = getUrlByScreenName(response.data.data.task_name)
                        if(response.data.data.task_name === "mandateAvailabilityScreen" )
                        {
                                if(response.data.data.penny_drop_type != "penny_less"){
                                    setPennyMessage("We have successfully deposited ₹ 1 into your bank account")
                                }
                                setIsPennyDropSucess(true)
                                setTimeout(() => {
                                    navigate(redirectToMandate, {
                                        state: {
                                            variables: response.data.data, //TO SEND DATA NEXT SCREEN
                                        },
                                        replace: true
                                    })
                                    setSubmitLoading(false)
                                }, 2000)
                        }
                        else{
                            navigate(redirectToMandate, {
                                state: {
                                  variables: response.data.data, //TO SEND DATA NEXT SCREEN
                                },
                                replace: true
                            })
                            setSubmitLoading(false)
                            setShowRedirectionLoader(false)
                        }
                    }).catch((error) => {
                        setShowRedirectionLoader(false)
                        setSubmitLoading(false)
                        if(error){
                            if (error.status === 401 || error.status === 403) {
                                sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                            }
                        }
                    })
                }
                else{
                    navigate(redirectTo, {
                        state: {
                            variables: response.data.data, //TO SEND DATA NEXT SCREEN
                        },
                        replace: true
                    })
                    setShowRedirectionLoader(false)
                    setSubmitLoading(false)
                }
            }).catch((error) => {
                setShowRedirectionLoader(false)
                setSubmitLoading(false)
                if(error){
                    if (error.status === 401 || error.status === 403) {
                        sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                    }
                }
            })
        }
    }

    //RESTRICT EMOJI
    const restrictEmoji=(value:string)=>{
        var ranges = [
            '\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
            '\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
            '\ud83d[\ude80-\udeff]'  // U+1F680 to U+1F6FF
          ];
          value= value.replace(new RegExp(ranges.join('|'), 'g'), '');
          return value
    }

    const onChangeHouseNumber = (value : string) => {
        let filteredValue=restrictEmoji(value)
        const isAddress = /^[a-zA-Z0-9#-/ ]+$/
        setHouseNumberError(false)
        if(isAddress.test(filteredValue) || filteredValue === ""){
            if(filteredValue.length <= 50){
                setHouseNumber(filteredValue)
            }
        }
    }

    const onChangeArea = (value : string) => {
        let filteredValue=restrictEmoji(value)
        const isAddress = /^[a-zA-Z0-9#-/ ]+$/
        setAreaOrLocationError(false)
        if(isAddress.test(filteredValue) || filteredValue === ""){
            if(filteredValue.length <= 50){
                setAreaOrLocation(filteredValue)
            }
        }
    }

    const onChnageLandmark = (value : string) => {
        let filteredValue=restrictEmoji(value)
        const isAddress = /^[a-zA-Z0-9#-/ ]+$/
        setLandmarkError(false)
        if(isAddress.test(filteredValue) || filteredValue === ""){
            if(filteredValue.length <= 50){
                setLandmark(filteredValue)
            }
        }
    }

    return (
        <div className="flex flex-col">
            <div className="mx-5 pb-24">
                <div className=" mb-8 font-bold text-2xl items-center flex-grow-0 mt-5 self-stretch -tracking-0.08">
                    <h1>Where do you live ?</h1>
                    <p className="mt-2 text-base text-granite-gray">Current residence address</p>
                </div>
                <div className="flex py-4 px-2.5 gap-3 rounded-lg bg-alice-blue h-14 items-center">
                    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.4" d="M18 8.88889C18 13.7981 12.375 20 9 20C5.625 20 0 13.7981 0 8.88889C0 3.97969 4.02944 0 9 0C13.9706 0 18 3.97969 18 8.88889Z" fill="#293B75"/>
                        <circle cx="9" cy="9" r="3" fill="#293B75"/>
                    </svg>
                    <div className="truncate">
                        <span className="font-semibold  leading-5 -tracking-0.04 mr-1.5">
                            {pinCode},
                        </span>
                        <span className="leading-5.5 tracking-0.08">
                            {city}, {state}
                        </span>
                    </div>
                </div>
                <div className="mt-7"  ref={inputHouseNumber}>
                    <p className="font-semibold text-sm leading-4.5 -tracking-0.06">
                        House number / Flat number / Apartment
                    </p>
                    <label className="relative mt-2 focus-within:text-gray-600 block">
                        <input
                           
                            className={
                                "bg-background rounded-lg items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08 outline-none " +
                                (houseNumberError ? " ring-2 ring-red-600" : " focus:border-2 focus:border-primary")
                            }
                            placeholder="Enter House number / Flat number / Apartment"
                            onChange={(e)=>{onChangeHouseNumber(e.target.value)}}
                            maxLength={100}
                            onFocus={() => {inputHouseNumber.current?.scrollIntoView()}}
                            value={houseNumber}
                        />
                    </label>
                    <div
                        className={
                            "mt-1 text-red-600 w-full h-1 " +
                            (houseNumberError ? "visible" : "invisible")
                        }
                    >
                        {houseNumberErrorMsg}
                    </div>
                </div>
                <div className="mt-7" ref={inputAreaOrLocation}>
                    <p className="font-semibold text-sm leading-4.5 -tracking-0.06">
                        Area / Location
                    </p>
                    <label className="relative mt-2  focus-within:text-gray-600 block">
                        <input
                            className={
                                "bg-background rounded-lg items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08 outline-none " +
                                (areaOrLocationError ? " ring-2 ring-red-600" : " focus:border-2 focus:border-primary")
                            }
                            placeholder="Enter area/location"
                            onChange={(e)=>{onChangeArea(e.target.value)}}
                            maxLength={100}
                            onFocus={() => {inputAreaOrLocation.current?.scrollIntoView()}}
                            value={areaOrLocation}
                        />
                    </label>
                    <div
                        className={
                            "mt-1 text-red-600 w-full h-1 " +
                            (areaOrLocationError ? "visible" : "invisible")
                        }
                    >
                        {areaOrLocationErrorMessage}
                    </div>
                </div>
                <div className="mt-7"  ref={inputLandmark}>
                    <p className="font-semibold text-sm leading-4.5 -tracking-0.06">
                        Landmark
                    </p>
                    <label className="relative mt-2  focus-within:text-gray-600 block">
                        <input
                           
                            className={
                                "bg-background rounded-lg items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08 outline-none" +
                                (landmarkError ? " ring-2 ring-red-600" : " focus:border-2 focus:border-primary")
                            }
                            placeholder="Enter landmark"
                            onChange={(e)=>{onChnageLandmark(e.target.value)}}
                            maxLength={100}
                            onFocus={() => {inputLandmark.current?.scrollIntoView()}}
                            value={landmark}
                        />
                    </label>
                    <div
                        className={
                            "mt-1 text-red-600 w-full h-1 " +
                            (landmarkError ? "visible" : "invisible")
                        }
                    >
                        {landmarkErrorMessage}
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
                                {isPennyDropSuccess ? <img src={checkmark} className="w-32 h-32 mx-auto"/>:<Player
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
                            </div>:
                            <p className="mt-1 text-center">We are verifying your bank account...</p>}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}
export default ResidentialAddress
