import { useContext,useRef,useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { completeFetchNext,fetchNext} from "../../../apis/resource"
import Loader from "../../../components/Loader"
import { RootContext } from "../../../utils/RootContext"
import { getUrlByScreenName } from "../../../utils/Routing"

const UdyamDetails = (props: { stage: string }) => {
    const [ sessionData, sessionDispatch ] = useContext(RootContext)
    const navigate = useNavigate()

    const [udyamNumber,setUdyamNumber]=useState("")
    const [udyamError,setUdyamError]=useState(false)
    const [udyamErrorMessage,setUdyamErrorMessage]=useState("")
    const inputUdyamNumber = useRef<HTMLInputElement>(null)
    const [ submitLoading, setSubmitLoading ] = useState(false)
    const [isUdyamNotAvailable,setIsUdyamNotAvailable]=useState(false)
    const inputCheckbox=useRef<HTMLInputElement>(null)


      useEffect(() => {
        //FETCH MAIN WORKFLOW VARIABLES
        initialFetch()
      }, [])  


      const initialFetch = async () => {
        await fetchNext(props.stage).then(async (response) => {
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

    //UDYAM REGISTRATION NUMBER
    const onChangeUdyamNumber = (udyam: string) => {
        setUdyamError(false)
        setUdyamErrorMessage("")
        let num_char_pattern = /[^A-Za-z0-9-]+/g
        if(!(num_char_pattern.test(udyam)))
        if(!udyam.endsWith("-") && udyamNumber.endsWith("-") ){
            setUdyamNumber(udyam.toUpperCase())
        }
        else if (udyam.length <= 19) {
            if(udyam.length === 5 ||udyam.length === 8 || udyam.length === 11){
                if(!(udyam.charAt(4) === "-" || udyam.charAt(7) === "-" || udyam.charAt(10) === "-"))
                {
                    udyam=udyam+"-"
                }
            }
            if(udyam.length > 5 && udyam.charAt(5) !== "-"){
                udyam=udyam.slice(0,5)+"-"+udyam.slice(-1)
            }
            if(udyam.length > 8 && udyam.charAt(8) !== "-"){
                udyam=udyam.slice(0,8)+"-"+udyam.slice(-1)
            }
            if(udyam.length > 11 && udyam.charAt(11) !== "-"){
                udyam=udyam.slice(0,11)+"-"+udyam.slice(-1)
            }
            setUdyamNumber(udyam.toUpperCase())
        }
    }

    const onClickSkipUdyam=async()=>{
        setSubmitLoading(true)
        setIsUdyamNotAvailable(true)
        let variables = {
            in_skip_udyam:true
        }
        await completeFetchNext(props.stage, variables).then((response) => {
            let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
            navigate(redirectTo, {
                state: {
                    variables: response.data.data //TO SEND DATA NEXT SCREEN
                },
                replace : true
            })       
        }).catch((error) => {
            if(error){
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                }
            }
        })
        setSubmitLoading(false)
        setIsUdyamNotAvailable(false)
    }

    const validate = () => {
        // DEFAULT 
        setUdyamError(false)
        setUdyamErrorMessage("")
        const udyam_regex=/(UDYAM-)[A-Z]{2}(-)[0-9]{2}(-)[0-9]{7}$/
        if (udyamNumber.length === 0) {
            inputUdyamNumber.current?.scrollIntoView({inline: "center"})
            setUdyamError(true);
            setUdyamErrorMessage("Please enter udyam registration number");
            return false;
        }
        if (!udyam_regex.test(udyamNumber)) {
            inputUdyamNumber.current?.scrollIntoView({inline: "center"})
            setUdyamError(true)
            setUdyamErrorMessage("Invalid udyam registration number")
            return false
        }
        return true
    }

    const onClickSubmit = async () => {
        if (validate()) {
            setSubmitLoading(true)
            let variables = {
                in_skip_udyam: false,
                in_udyam_registration_number: udyamNumber
            }
            await completeFetchNext(props.stage, variables).then((response) => {
                if(response.data.data.udyam_verified){
                    let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
                    navigate(redirectTo, {
                        state: {
                            variables: response.data.data //TO SEND DATA NEXT SCREEN
                        },
                        replace : true
                    })
                }else{
                    setUdyamError(true)
                    setUdyamErrorMessage(response.data.data.udyam_message)
                }   
            }).catch((error) => {
                if(error){
                    if (error.status === 401 || error.status === 403) {
                        sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                    }
                }
            })
            setSubmitLoading(false)
            }
    }

    return (
        <div className="flex flex-col">
        <div className="mx-5 pb-24">
            <div className=" mb-8 font-bold text-2xl items-center flex-grow-0 mt-5 self-stretch -tracking-0.08">
                <h1>Udyam Details</h1>
            </div>
            <div className={"mt-7"+(isUdyamNotAvailable?" opacity-50":"")}  ref={inputUdyamNumber}>
                <p className="font-semibold text-sm leading-4.5 -tracking-0.06">
                    Udyam Registration Number
                </p>
                <label className="relative mt-2 focus-within:text-gray-600 block">
                    <input
                        disabled={isUdyamNotAvailable}
                        className={
                            "bg-background rounded-lg items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08 outline-none pointer-events-none " +
                            (udyamError ? " ring-2 ring-red-600" : " focus:border-2 focus:border-primary")+(isUdyamNotAvailable?" caret-background":"")
                        }
                        placeholder="UDYAM-XX-00-0000000"
                        onChange={(e)=>{onChangeUdyamNumber(e.target.value)}}
                        maxLength={100}
                        onFocus={() => {inputUdyamNumber.current?.scrollIntoView()}}
                        value={udyamNumber}
                    />
                </label>
                <div
                    className={
                        "mt-1 text-red-600 w-full h-1 " +
                        (udyamError ? "visible" : "invisible")
                    }
                >
                    {udyamErrorMessage}
                </div>
            </div>
        </div>
        {/* STICKY BUTTON  */}
        <div className="fixed-button bg-cultured max-w-md">
            <p className="text-sm text-justify w-full my-auto underline text-primary mb-5 ml-4" onClick={onClickSkipUdyam}>I do not have udyam registration number.</p>
            <button
                className={
                    "h-14 w-full rounded-lg bg-primary text-white font-bold text-lg max-w-md " +
                    (submitLoading ? "opacity-90 cursor-not-allowed" : "")
                }
                onClick={() => onClickSubmit()}
                disabled={submitLoading}
            >
                {!submitLoading &&
                    <p>SUBMIT</p>
                }

                {submitLoading &&
                    <Loader />
                }
            </button>
        </div>
    </div>
    )
}

export default UdyamDetails
