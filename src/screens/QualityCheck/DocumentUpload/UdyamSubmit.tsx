import { useState , useContext, useRef, useEffect } from "react"
import { completeFetchNext } from "../../../apis/resource"
import { RootContext } from "../../../utils/RootContext"
import Loader from "../../../components/Loader"
import { toast } from "react-toastify"

interface udyamDetailsType{
    udyamDetails : {
    udyamRequired: boolean | undefined,
    udyamVerified: boolean |  undefined,
    udyamNumber: string
    }
}

const UdyamSubmit=({ udyamDetails} : udyamDetailsType)=>{
    const [ sessionData, sessionDispatch ] = useContext(RootContext)
    const [modalOpen,setModalOpen]=useState(false)
    const [udyamNumber,setUdyamNumber]=useState("")
    const [udyamError,setUdyamError]=useState(false)
    const [udyamErrorMessage,setUdyamErrorMessage]=useState("")
    const inputUdyamNumber = useRef<HTMLInputElement>(null)
    const [udyamVerified,setUdyamVerified]=useState(udyamDetails.udyamVerified)
    const [ submitLoading, setSubmitLoading ] = useState(false)

    useEffect(()=>{
        udyamDetails.udyamVerified && setUdyamNumber(udyamDetails.udyamNumber)
    },[])

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
                in_udyam_registration_number: udyamNumber
            }
            
            await completeFetchNext("main", variables).then((response) => {
                if(response.data.data.udyam_verified){ 
                        toast.success(`Submission successful`) 
                        setUdyamVerified(true)
                        setModalOpen(false)
                }
                else{
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

    return( 
    <div className="mt-4 p-4 bg-white rounded-md" >
        <div className="flex justify-between items-center cursor-pointer" onClick={()=>{
                setModalOpen(!modalOpen)
            }}>
            <h3 className=" font-semibold text-lg text-secondary">Udyam Verification</h3>
            {udyamVerified ?  <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                fill="green" 
                className="mr-2"  
                viewBox="0 0 16 16"
                >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                </svg>
                :<svg
                className="mr-2 "
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                    d="M19.9201 8.9502L13.4001 15.4702C12.6301 16.2402 11.3701 16.2402 10.6001 15.4702L4.08008 8.9502"
                    stroke="#666667"
                    strokeWidth="3"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    />
                </svg>}
        </div>
        <div className={modalOpen?"":"hidden"}>
            <hr className="my-4 text-light-silver"></hr>
            <div ref={inputUdyamNumber}>
                {!udyamVerified && <p className="font-semibold text-sm leading-4.5 -tracking-0.06">
                    Udyam Registration Number
                </p>  }
                
                <label className="relative mt-2 focus-within:text-gray-600 block">
                    <input
                        disabled={submitLoading || udyamVerified}
                        className={
                            "bg-background rounded-lg items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08 outline-none pointer-events-none " +
                            (udyamError ? " ring-2 ring-red-600 " : " focus:border-2 focus:border-primary ")+(udyamVerified ? " opacity-70" : "")
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
                        "mt-1 text-red-600 w-full " +
                        (udyamError ? "visible" : "invisible")
                    }
                >
                    {udyamErrorMessage}
                </div>
            </div>
            {!udyamVerified &&  <button onClick={onClickSubmit} className={" h-10 mt-3 w-full rounded-md bg-primary text-white font-bold text-lg max-w-md"} disabled={submitLoading}>
                {!submitLoading &&
                    <p>SUBMIT</p>
                }
                {submitLoading &&
                    <Loader />
                }
            </button> }
        </div>
    </div>)
}
export default UdyamSubmit