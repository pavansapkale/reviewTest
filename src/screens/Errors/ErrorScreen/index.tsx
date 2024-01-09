import { useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { RootContext } from "../../../utils/RootContext"
import { fetchNext } from "../../../apis/resource"
import { getUrlByScreenName } from "../../../utils/Routing"

import applicationRejected from "../../../assets/svg/service-down.svg"
import Loader from "../../../components/Loader"


const ErrorScreen = () => {
  const [ sessionData, sessionDispatch ] = useContext(RootContext)
  const navigate = useNavigate()
  const { state } = useLocation()
  const stage = "main"

  const [isTryAgainLoading, setIsTryAgainLoading] = useState(false)
  const [isTryAgain,setIsTryAgain]=useState(false)
  const [minutesRemaining,setMinutesRemaining]=useState(15)

  const errorMessage = state?.variables?.error_message
  const errorMessageDescription = state?.variables?.error_message_description
  const errorTime =state?.variables?.error_screen_time
  useEffect(()=>{
    if(errorTime){
      checkTimeStatus()
    }
    else{
      setIsTryAgain(true)
    }
  })


  const checkTimeStatus=()=>{
      const minutesLeft  =Math.floor(((errorTime+15*60)-Math.floor(new Date().getTime()/1000))/60)
      if(minutesLeft<=0){
        setIsTryAgain(true)
        setMinutesRemaining(0)
      }
      else{
        setIsTryAgain(false)
        setMinutesRemaining(minutesLeft)
        setTimeout(()=>{
        checkTimeStatus()
        },30000)
      }
  }

  const tryAgain = async () => {
    setIsTryAgainLoading(true)
    await fetchNext(stage).then((response) => {
      let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
      navigate(redirectTo, {
        state: {
          variables: response.data.data, //TO SEND DATA NEXT SCREEN
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
    setIsTryAgainLoading(false)
  }

  return (
    <div className="mt-5">
      <div className="mx-5 pb-24">
        <div className="grid grid-cols-1">
          <img className="w-2/5 mt-4 mx-auto" src={applicationRejected} alt="application rejected" />
          <h1 className="mt-8 text-center font-bold text-xl leading-6 -tracking-0.04 text-raisin-black">
            {errorMessage ? errorMessage : "Something went wrong"}
          </h1>
          {errorMessageDescription && <p className="mt-4 font-normal text-base leading-5.5 tracking-0.08 text-secondary text-center">
                {errorMessageDescription}
          </p> }
          <p className="mt-4 mb-4 font-normal text-base leading-5.5 tracking-0.08 text-secondary text-center">
           {errorMessageDescription?`Please try again after ${minutesRemaining} minute(s)`:`Our server is down at the moment Please try again after ${minutesRemaining} minute(s)`}
          </p>
          <div className=" mt-6 mb-4 flex flex-row gap-4 items-center bg-alice-blue p-3 rounded-lg">
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

      {/* STICKEY BUTTON  */}
      <div className="fixed-button bg-cultured max-w-md">
        <button
          className={"h-14 w-full rounded-lg text-white font-bold text-lg max-w-md bg-primary " + (isTryAgainLoading ? "opacity-90 cursor-not-allowed" : "")+(isTryAgain?"bg-primary":" bg-taupe-gray")}
          onClick={() => { tryAgain() }}
          disabled={isTryAgainLoading || !isTryAgain}
        >

          {!isTryAgainLoading &&
          <p>TRY AGAIN</p>
          }

          {isTryAgainLoading &&
            <Loader />
          }

        </button>
      </div>
    </div>
  )
}

export default ErrorScreen