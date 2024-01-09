
import { Player } from "@lottiefiles/react-lottie-player"
import { useContext, useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { fetchNext, fetchVariable } from "../../../apis/resource"
import { getUrlByScreenName } from "../../../utils/Routing"
import { RootContext } from "../../../utils/RootContext"
import errorImage from "../../../assets/svg/error.svg"
import LottieLoader from "../../../assets/lottie/loader.json"


const NetBanking = (props: { stage: string }) => {
    const [sessionData,sessionDispatch]=useContext(RootContext)
    const navigate = useNavigate()
    const { state } = useLocation()
    const [errorMessage,setErrorMessage]=useState("")
    const [data,setData]=useState(state?.variables)//TO SEND DATA NEXT SCREEN

    useEffect(() => {
        getVariable()
    }, [])
   

    const getVariable = async () => {
        await fetchVariable("banking_bre_done").then(async (response) => {
            if (response.data.data.is_present) {
                if (response.data.data.banking_bre_done) {
                    await fetchNext(props.stage).then((response) => {
                        if(response.data.data.task_name === "bankSelectScreen"){
                            setErrorMessage(response.data.data.perfios_message)
                            setData(response.data.data)
                        }
                        else{
                            let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
                            navigate(redirectTo, {
                                state: {
                                    variables: response.data.data, //TO SEND DATA NEXT SCREEN
                                },
                                replace: true
                            })
                        }
                    }).catch((error) => {
                        if (error) {
                            if (error.status === 401 || error.status === 403) {
                              sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                            }
                          }
                    })
                } else {
                    setTimeout(() => {
                        getVariable()
                    }, 5000)
                }
            } else {
                setTimeout(() => {
                    getVariable()
                }, 5000)
            }
        }).catch((error) => {
            if (error) {
                if (error.status === 401 || error.status === 403) {
                  sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                }
              }
        })
    }

    const onClickRetry =() =>{
        let redirectTo: string = getUrlByScreenName("bankSelectScreen")
        navigate(redirectTo, {
            state: {
                variables: data, //TO SEND DATA NEXT SCREEN
            },
            replace: true
        })
    }

    return (
        <div className="flex justify-center">
            {/* OVERLAY  */}
            <div
                className={"z-50 left-0 top-0 fixed inset-x-0 bottom-0 h-full w-full bg-black bg-opacity-75 visible"}
            >
                <div className="flex justify-center item-center flex-col h-screen">
                    <div className="flex justify-center">
                        {errorMessage ? <img src={errorImage} className="w-20 h-20 mx-auto"/> :  <Player
                            autoplay
                            loop
                            src={LottieLoader}
                            className="w-16 h-16"
                        >
                        </Player>}
                    </div>
                    <div className="flex justify-center items-center flex-col text-center text-white mx-2">
                        {errorMessage ? 
                        <div> 
                            <p className="text-lg mt-2">{errorMessage}</p> 
                            <button onClick={onClickRetry} className="ml-4 mt-2 h-10 w-40 rounded-lg text-white font-bold text-md max-w-md bg-primary border-sonic-silver border">Retry</button>
                        </div> :
                        <div>
                            <p className="text-lg mt-2">Hold on!<br></br>This may take a few seconds</p>
                            <p>Please do not refresh page</p>
                        </div>}
                    </div>
                </div>
            </div>
    </div>
    )
}

export default NetBanking