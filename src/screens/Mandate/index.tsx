import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { fetchNext } from "../../apis/resource"
import { getUrlByScreenName } from "../../utils/Routing"
import { RootContext } from "../../utils/RootContext"

import spinner from "../../assets/svg/spinner.svg"

const Mandate = (props: { stage: string }) => {
    const [ sessionData, sessionDispatch ] = useContext(RootContext)
    const navigate = useNavigate()
    
    useEffect(()=>{
        //FETCH MANDATE WORKFLOW VARIABLES
        initialFetch()
    }, [])
    
    const initialFetch = async () => {
        await fetchNext(props.stage).then((response) => {
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

    return (
        <div className="flex justify-center">
            <img className="mx-10 w-16 h-16" src={ spinner } alt="content loading" />
        </div>
    )
}
export default Mandate
