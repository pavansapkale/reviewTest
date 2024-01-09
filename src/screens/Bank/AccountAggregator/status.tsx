
import { Player } from "@lottiefiles/react-lottie-player"
import { useContext, useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { complete, fetchNext, fetchVariable } from "../../../apis/resource"
import { getUrlByScreenName } from "../../../utils/Routing"
import { RootContext } from "../../../utils/RootContext"
import errorImage from "../../../assets/svg/error.svg"
import LottieLoader from "../../../assets/lottie/loader.json"


const AccountAggregatorStatus = (props: { stage: string }) => {
    const [sessionData,sessionDispatch]=useContext(RootContext)
    const navigate = useNavigate()
    const { state } = useLocation()
    const [errorMessage,setErrorMessage]=useState("")
    const [data,setData]=useState(state?.variables)//TO SEND DATA NEXT SCREEN
    const [showLongerMessage, setShowLongerMessage] = useState(false)


    
    useEffect(() => {
        setTimeout(() => {
                setShowLongerMessage(true)
            }, 60000)

        fetchCurrentScreen()
    }, []);
   

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
                        console.error(error)
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
            console.error(error)
        })
    }

    const fetchCurrentScreen = async () => {
        await fetchNext(props.stage).then(async (response) => {
            if (response.data.data.task_name.trim() == "accountAggregatorScreen") {
                let payload = {
                    in_account_aggregator_completed: true
                }
                //CALL COMPLETE
                await complete(response.data?.data?.task_id, payload).then(async (response) => {
                    //CALL FETCH VARIABLE INTERVAL OF 5 SEC
                    getVariable()
                }).catch((error) => {
                    if(error){
                        if (error.status === 401 || error.status === 403) {
                            sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                        }
                    }
                })
            } else {
                let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
                navigate(redirectTo, {
                    state: {
                        variables: response.data.data, //TO SEND DATA NEXT SCREEN
                    },
                    replace: true
                })
            }
        }).catch((error) => {
            if(error){
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
                        </div> :showLongerMessage ? (
                            <div>
                                <p className="text-lg mt-2">
                                    It is taking longer to fetch the data from the bank. 
                                </p>
                                <p>Please wait a little longer OR you can login again after 15 minutes to check the offer</p>
                                
                            </div>
                        ) : (
                            <div>
                                <p className="text-lg mt-2">
                                    Hold on! This may take a few seconds
                                </p>
                                <p>We are trying to fetch banking data.</p>
                                <p>Please do not refresh.</p>

                            </div>
                        )}
                    </div>
                </div>
            </div>
    </div>
    )
}

export default AccountAggregatorStatus