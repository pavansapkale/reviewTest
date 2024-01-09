import { useContext } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { RootContext } from "../../../utils/RootContext"
import applicationRejected from "../../../assets/svg/application-rejected.svg"

const ApplicationRejected = (props: { stage: string }) => {
  const [sessionData, sessionDispatch]=useContext(RootContext)
  const navigate = useNavigate()
  const { state } = useLocation()

  const rejectionMessage = state?.variables?.reject_message

  const redirectToLogin = () => {
    sessionDispatch({type: 'UPDATE', data: {isLoggedIn: false}})
    sessionStorage.clear()
    navigate("/")
  }

  return (
    <div className="mt-5">
      <div className="mx-5 pb-24">
        <div className="grid grid-cols-1">
          <img className="w-2/5 mt-4 mx-auto" src={applicationRejected} alt="application rejected" />
          <h1 className="mt-8 text-center font-bold text-xl leading-6 -tracking-0.04 text-raisin-black">
            {rejectionMessage?"Unfortunately, your application was rejected due to the following reasons":"Unfortunately, your application was rejected"}
          </h1>
          {rejectionMessage && <p className="mt-4 font-medium text-lg leading-5.5 text-center">{rejectionMessage}</p>}
        </div>
      </div>
      {(sessionStorage.getItem("_source") !== "mobile_app") && <div className="fixed-button max-w-md mb-4 text-center">
        <button className=" text-lg underline text-primary font-semibold" onClick={()=>{redirectToLogin()}}>Start a new loan application</button>
      </div>}
    </div>
  )
}

export default ApplicationRejected