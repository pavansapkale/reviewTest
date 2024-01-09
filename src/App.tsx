import { useEffect, useReducer } from "react"
import { ToastContainer } from "react-toastify"
import OpenReplay from "@openreplay/tracker"
import trackerAssist from "@openreplay/tracker-assist"
import jwt_decode from 'jwt-decode';
import Header from "./components/Header"
import "react-toastify/dist/ReactToastify.css"
import { initialSessionData, RootContext, sessionReducer } from "./utils/RootContext"

type decodedAuthToken = {
  data: {
    session_id: string
  }
}

const App = (props: { tracker: OpenReplay, children: any }) => {
  useEffect(() => {
    props?.tracker.start()
    props?.tracker?.use(trackerAssist({}))
    if (!!sessionStorage.getItem("_token")) {
      const token = sessionStorage.getItem("_token") || ""
      const decodedToken = jwt_decode(token) as decodedAuthToken
      const session_id = decodedToken?.data?.session_id
      props?.tracker?.setUserID(session_id)
    }
  }, [])
  
  const [sessionData, sessionDataDispatch] = useReducer(sessionReducer, initialSessionData);
  return (
    <RootContext.Provider value={[sessionData, sessionDataDispatch]}>
      <div className="relative w-screen h-screen bg-cultured">
        <Header/>
        <div className="absolute top-16 bottom-0 right-0 left-0 overflow-y-scroll overflow-x-hidden mx-auto no-scrollbar max-w-md">
          {props.children}
        </div>
        <ToastContainer
          position="bottom-center"
          autoClose={1500}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover={false}
          theme="dark"
          limit={1}
        />
      </div>
    </RootContext.Provider>
  )
}
export default App
