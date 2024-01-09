import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { fetchNext, completeFetchNext } from "../../apis/resource"
import { getUrlByScreenName } from "../../utils/Routing"
import { RootContext } from "../../utils/RootContext"

import spinner from "../../assets/svg/spinner.svg"

const Kyc = (props: { stage: string }) => {
    const [ sessionData, sessionDispatch ] = useContext(RootContext)
    const navigate = useNavigate()
    
    useEffect(()=>{
        //FETCH MANDATE WORKFLOW VARIABLES
        initialFetch()
    }, [])
    
    const initialFetch = async () => {
        await fetchNext(props.stage).then( async (response) => {
            const taskName= response.data.data.task_name
            let minutesCompleted = 0
            const initiateTime=response?.data?.data?.okyc_initiate_time
            if(initiateTime){
              minutesCompleted = Math.floor((Math.floor(new Date().getTime()/1000)-initiateTime)/60)
            }
            //if minutes completed is greater than 10 it means the session is expired and we can reinitiate the OKYC request
            if(minutesCompleted >= 10  && (taskName === "aadhaarScreen" || taskName === "aadhaarOTP")){
                await completeFetchNext(props.stage, {
                    in_reinitiate_okyc: true
                }).then((response) => {
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
            if(error){
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                }
            }
        })
    }

    return (
        <div className="flex justify-center">
            <img className="mx-10 w-16 h-16" src={ spinner } alt="content loading" />
        </div>
    )
}
export default Kyc
