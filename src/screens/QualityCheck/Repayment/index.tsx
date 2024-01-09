import "../../../lib/Digio/V9"
import { useState,useContext, useEffect } from "react"
import { fetchVariable , fetchNext , completeFetchNext } from "../../../apis/resource"
import { useLocation, useNavigate } from "react-router-dom"
import { RootContext } from "../../../utils/RootContext"
import jwt_decode from "jwt-decode"
import ProtiumLogo from "../../../assets/svg/pm_logo.svg"
import spinner from "../../../assets/svg/spinner.svg"
import { Player } from "@lottiefiles/react-lottie-player"
import LottieLoader from "../../../assets/lottie/loader.json"
import Loader from "../../../components/Loader"
import StatusCard from "./StatusCard"


type decodedTokenType = {
    data: {
        digio_id: string;
        customer_identifier: string;
        digio_access_token: string;
    };
}

const QcRepayment = (props: {stage :string})=>{
    const [mandateStatus,setMandateStatus]=useState("")//["PENDING","REJECTED","REGISTERED"] 
    const [sessionData,sessionDispatch]=useContext(RootContext)
    const [loading,setLoading]=useState(false)
    const [overlayMessage,setOverlayMessage]=useState("Repayment setup in progress")
    const navigate = useNavigate()
    const { state } = useLocation()

    useEffect(()=>{
        checkMandateStatus()
    },[])

    const checkMandateStatus = async ()=>{
        setMandateStatus("")
        await fetchVariable("mandate_registered").then(async (response) => {
            if(response.data.data.is_present){
                setMandateStatus(response.data.data.mandate_registered)
                if(response.data.data.mandate_registered === "REGISTERED"){
                    setOverlayMessage("We are redirecting you...")
                    setLoading(true)
                    setTimeout(()=>{
                        setLoading(false)
                        navigate('/loan-document', {
                            state: state,
                            replace: true
                    })},3000)     
                }
            }
            else {
                console.error("EXPECTED VARIABLE NOT PRESENT")
            }
        }).catch((error) => {
            if(error){
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                }
            }
        })
    }


    //DIGIO OPTIONS
    const options = {
        environment: import.meta.env.VITE_APP_DIGIO_ENV,
        logo: ProtiumLogo,
        callback: async (response: any) => {
            if (response.hasOwnProperty('error_code')) {
                await completeFetchNext(props.stage, {
                    in_digio_response: response,
                    in_mandate_complete: false,
                    in_change_mandate_mode: true
                }).then(() => {
                    setLoading(false)
                    checkMandateStatus()
                }).catch((error) => {
                    if(error){
                        if (error.status === 401 || error.status === 403) {
                            sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                        }
                    }
                })
            } else {
                await completeFetchNext(props.stage, {
                    in_digio_response: response,
                    in_mandate_complete: true,
                    in_change_mandate_mode: false
                }).then(() => {
                    setOverlayMessage("We are redirecting you...")
                    setTimeout(()=>{
                        setLoading(false)
                        navigate('/loan-document', {
                            state: state,
                            replace: true
                    })},3000)   
                }).catch((error) => {
                    if(error){
                        if (error.status === 401 || error.status === 403) {
                            sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                        }
                    }
                })
            }
        },
        is_iframe: false
    }

    const onClickRegister= async ()=>{
        await fetchNext(props.stage).then((response) => {
            setLoading(true)
            const mandate_url = response.data.data.mandate_url;
            const token = mandate_url?.substring(mandate_url.indexOf('token=') + 6);

            const decodedtoken = jwt_decode(token) as decodedTokenType
            const digio_id = decodedtoken?.data?.digio_id
            const identifier = decodedtoken?.data?.customer_identifier
            const digio_access_token = decodedtoken?.data?.digio_access_token

            // @ts-ignore
            const digio = new Digio(options) //options is the digio options constructor object.

            digio.init()

            digio.submit(digio_id, identifier, digio_access_token)
        }).catch((error) => {
            if(error){
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                }
            }
        })
    }

    
    return (
        <div className="flex flex-col">
            <div className="mx-4">
                <p className="mb-4 font-bold text-2xl items-center flex-grow-0 mt-5 self-stretch -tracking-0.08">
                    Setup auto repayment
                </p>
                {mandateStatus ? <StatusCard status={mandateStatus}/> :
                    <div className="flex justify-center">
                        <img className="mx-10 w-16 h-16" src={ spinner } alt="content loading" />
                    </div> 
                } 
            </div>
            {mandateStatus ==="REJECTED" && 
            <div className="fixed-button bg-cultured max-w-md">
                <button onClick={onClickRegister} disabled={loading} className={"h-14 w-full rounded-lg text-white font-bold text-lg max-w-md bg-primary"}>
                    {!loading &&
                    <p>Register</p>
                    }
                    {loading &&
                        <Loader />
                    }
                </button>
            </div>
            }
            {/* OVERLAY */}
            {loading && 
            <div
                className={"z-50 left-0 top-0 fixed inset-x-0 bottom-0 h-full w-full bg-black bg-opacity-75 visible"}
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
                    <div className="flex justify-center">
                        <p className="text-white">
                            {overlayMessage}
                        </p>
                    </div>
                </div>
            </div>
            }
        </div>
    )
}

export default QcRepayment

