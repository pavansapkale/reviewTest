import { useContext, useState } from "react"
import { fetchNext } from "../../apis/resource"
import { RootContext } from "../../utils/RootContext"

import ProtiumLogo from "../../assets/svg/pm_logo.svg"
import OverlayTimeline from "../OverlayTimeline"

const Header = () => {
  const [ sessionData, sessionDispatch ] = useContext(RootContext)
  const [ showOverlayTimeline, setShowOverlayTimeline ] = useState(false)
  const [ timelineData, setTimelineData ] = useState({})

  const onClickTimeline = async () => {
    await fetchNext("main").then((response) => {
        setTimelineData(response.data.data)
        setShowOverlayTimeline(true)
    }).catch((error) => {
      if(error){
        if(error.status){
            if (error.status === 401 || error.status === 403) {
              sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
            }
        }
      }
    })
  }

  return (
    <div className="bg-white flex justify-between w-screen h-16 inset-x-0 top-0 rounded-b-md">
      <img
        className="justify-start ml-5 h-3/4 my-auto"
        src={ProtiumLogo}
        alt="Protium Money"
      />
      {sessionData.isLoggedIn && (!sessionData.isLoanDisbursed) && (
        <span
          className="justify-end my-auto mr-5 cursor-pointer"
          onClick={() => {
            onClickTimeline()
          }}
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
      )}
      <div
        className={
          "z-50 fixed h-full w-full bg-black bg-opacity-75 duration-300 left-0 overflow-y-scroll " +
          (showOverlayTimeline ? "visible right-0" : "hidden left-0")
        }
      >
        <OverlayTimeline setShowOverlayTimeline={setShowOverlayTimeline} timelineData={timelineData}/>
      </div>
    </div>
  )
}

export default Header
