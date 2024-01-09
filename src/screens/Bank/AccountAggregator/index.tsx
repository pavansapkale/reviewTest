import { useEffect, useContext, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { RootContext } from "../../../utils/RootContext"
import { completeFetchNext, addAaUserEvent } from "../../../apis/resource"
import { getUrlByScreenName } from "../../../utils/Routing"
import spinner from "../../../assets/svg/spinner.svg"
import { Player } from "@lottiefiles/react-lottie-player"
import LottieLoader from "../../../assets/lottie/loader.json"
const AccountAggregator = (props: { stage: string }) => {
    const [ sessionData, sessionDispatch ] = useContext(RootContext)
    const navigate = useNavigate()
    const { state } = useLocation()
    const [isLoading, setIsLoading] = useState(true)
    const [redirection, setRedirection] = useState(false)
    const aaUrl = state?.variables?.account_aggregator_url
    const aaRequestId=state?.variables?.aa_request_id
    const [isIframe, setIsIframe] = useState(false)

    useEffect(()=>{
        //OPEN IFRAME
        aaUrl && setIsIframe(true)
        //INITIATE EVENT LISTENER
        //@ts-ignore
        const eventMethod = window.addEventListener
        ? "addEventListener"
        : "attachEvent";
        //@ts-ignore
        const  eventer = window[eventMethod];
        const messageEvent = eventMethod === "attachEvent"
        ? "onmessage"
        : "message";
        function eventHandler(e:any) {
            if (e.data === "anumati-on-complete") {
                onChangeEvent(e.data)
                return;
            }
            if (e.data === "anumati-on-reject") {
                onChangeEvent(e.data)
                return;
            }
            if (e.data === "anumati-on-otp-verified") {
                onChangeEvent(e.data)
                return;
            }
            if (e.data === "anumati-on-accounts-linked") {
                onChangeEvent(e.data)
                return;
            }
            if (e.data === "anumati-on-no-discovered-accounts") {
                onChangeEvent(e.data)
                return;
            }
            if (e.data === "anumati-on-cancel") {
                onChangeEvent(e.data)
                return;
            }
            if (e.data === "anumati-on-error") {
                onChangeEvent(e.data)
                return;
            }
            }
            eventer(messageEvent,eventHandler);
            //REMOVE EVENT LISTENER
            return () => {
                //@ts-ignore
                const eventMethod1 = window.removeEventListener ? "removeEventListener" : "detachEvent";
                //@ts-ignore
                const removeEventer = window[eventMethod1];
                const messageEvent1 = eventMethod1 === "detachEvent" ? "onmessage" : "message";
                removeEventer(messageEvent1,eventHandler)
            };
        },[])

        const handleLoad = () => {
          setIsLoading(false);
        };

        const onChangeEvent = async (event:string)=>{
            if(event === "anumati-on-cancel" || event === "anumati-on-reject" || event === "anumati-on-error"){
              setRedirection(true)
            }
            await addAaUserEvent({
                aa_request_id: aaRequestId,
                event: event
              }).catch((error) => {
                if(error){
                  if (error.status === 401 || error.status === 403) {
                    sessionDispatch({type: 'UPDATE', data: {sessionExpired: true }})
                  }
                }
            })
            if(event === "anumati-on-cancel" || event === "anumati-on-reject" || event === "anumati-on-error"){
                await completeFetchNext(props.stage, {in_account_aggregator_completed: false}).then((response) => {
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
            }
            if(event==="anumati-on-complete"){
              setTimeout(() => {
                navigate("/bank/account-aggregator-status", {
                  state: state,
                  replace: true
                }) 
              }, 2000);
            }
            setRedirection(false)
          }
          
        return (
            <div>
                {!isIframe || isLoading && <div className="flex justify-center ">
                    <img className="mx-10 w-16 h-16" src={spinner} alt="content loading" />
                </div> }
                {isIframe && !sessionData.sessionExpired &&  <iframe id="iframe-id" src={aaUrl} onLoad={handleLoad} className="fixed w-full h-screen pb-16 top-16 right-0 left-0 bottom-0"  ></iframe>}
                {/* OVERLAY  */}
                <div
                  className={"z-50 left-0 top-0 fixed inset-x-0 bottom-0 h-full w-full bg-black bg-opacity-75 " + (redirection ? "visible" : "hidden")}
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
                    <div className="flex justify-center flex-col text-center">
                      <p className="text-white">
                        We are redirecting you...
                      </p>
                      <p className="text-white">
                        Please do not refresh page
                      </p>
                    </div>
                  </div>
                </div>
            </div>
        )
}

export default AccountAggregator