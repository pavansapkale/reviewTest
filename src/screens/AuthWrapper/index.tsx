import { useContext, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AuthenticateToken } from "../../utils/Authentication"
import { RootContext } from "../../utils/RootContext"

import BottomSheet from "../../components/BottomSheet"
import sessionExpired from "../../assets/svg/session-expired.svg"

const AuthWrapper = ({ children }: any) => {
  const [ sessionData, sessionDispatch ] = useContext(RootContext)
  const navigate = useNavigate()
  const { state } = useLocation()

  useEffect(() => {
    if (AuthenticateToken().code === "TOKEN_NOT_PRESENT") {
      sessionDispatch({type: 'UPDATE', data: {isLoggedIn: false}})
      sessionStorage.clear()
      navigate("/")
    } else{
      if (state === null && window.location.pathname !== "/bank/net-banking" && window.location.pathname !== "/bank/e-statement") {
        navigate(-1)
      }
    }
  }, [])


  const onClickLoginAgain = () => {
    sessionDispatch({type: 'UPDATE', data: {isLoggedIn: false}})
    sessionStorage.clear()
    navigate("/")
  }


  return (
      !sessionData.sessionExpired ?
      <>
        {children}
      </>
      :
      <div>
        {children}
        <BottomSheet
          showClose={false}
          defaultVisible={true}
          heading="Session Expired"
          height={350}
          isDraggable={false}
        >
          <div className="w-full">
            <div>
              <img className="w-48 mx-auto" src={sessionExpired} alt="session expired" />
            </div>
            <div className="mt-4 flex justify-center bottom-0">
              <button
                className={"h-14 w-full rounded-lg bg-primary text-white font-bold text-lg max-w-md"}
                onClick={() => onClickLoginAgain()}
              >
                <p>LOGIN AGAIN</p>
              </button>
            </div>
          </div>
        </BottomSheet>
      </div>
  )
}

export default AuthWrapper