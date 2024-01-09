import { useContext, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { completeFetchNext } from "../../../apis/resource"
import { getUrlByScreenName } from "../../../utils/Routing"
import { Player } from "@lottiefiles/react-lottie-player"
import { RootContext } from "../../../utils/RootContext"

import Loader from "../../../components/Loader"
import LoaderAnimation from "../../../assets/lottie/loader.json"

const Repayment = (props: { stage: string }) => {
    const [ sessionData, sessionDispatch ] = useContext(RootContext)
    const navigate = useNavigate()
    const { state } = useLocation()

    const bankName = state?.variables?.bank_name
    const accountNumberLastFour = state?.variables?.account_number_last_four
    const apiDebitCardAvailable = state?.variables?.api_debit_card
    const apiNetBankingAvailable = state?.variables?.api_net_banking
    const aadhaarEsignAvailable = state?.variables?.aadhaar_esign

    const [ selectedMode, setSelectedMode ] = useState("")
    const onClickMode = async (selectedMode: string) => {
        setSelectedMode(selectedMode)
        const variables = {
            in_mandate_mode: selectedMode,
            in_bank_edit: false
        }

        await completeFetchNext(props.stage, variables).then((response) => {
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
        setSelectedMode("")
    }

    const onClickChangeBankDetails = async() => {
        const variables = {
            in_bank_edit: true
        }

        await completeFetchNext(props.stage, variables).then((response) => {
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
        <div className="flex flex-col mx-5">
            <p className="mb-8 font-bold text-2xl items-center flex-grow-0 mt-5 self-stretch -tracking-0.08">
                Setup auto repayment
            </p>
            <div className="mb-6 bg-white flex flex-col p-4 gap-6 rounded">
                <div className="flex  gap-3 items-center">
                    <img src="https://www.svgrepo.com/show/49073/bank-symbol.svg" className="w-8 h-8" />
                    <div className=" flex flex-col gap-1">
                        <p className=" font-bold leading-5 -tracking-0.04">
                            {bankName}
                        </p>
                        <p className=" text-xs tracking-0.08 text-granite-gray">
                            **** **** {accountNumberLastFour}
                        </p>
                    </div>
                </div>
            
            <div className="flex flex-col gap-4">
                {(apiDebitCardAvailable || apiNetBankingAvailable) &&
                <div
                    className=" flex justify-between items-center py-3 px-4 gap-4 h-16 border-light-silver border-0.25 border-solid rounded-lg"
                    onClick={()=> onClickMode("api")}
                >
                    <div className="flex flex-col p-0 h-10 gap-1 justify-center">
                        <p className=" font-semibold leading-5 -tracking-0.04 text-indigo">
                            Netbanking / Debit card
                        </p>
                        <div className="flex items-center">
                            <p className="text-xs tracking-0.08 text-granite-gray">Instant disbursal</p>
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6" viewBox="200 0 640.000000 1280.000000"
                                >
                                <g transform="translate(0.000000,1280.000000) scale(0.250000,-0.100000)"
                                fill="#2C3D6F" stroke="none">
                                <path d="M4780 12433 c-56 -169 -211 -639 -345 -1043 -307 -926 -541 -1638
                                -1055 -3200 -138 -421 -260 -790 -270 -820 -33 -98 -478 -1454 -484 -1475 -3
                                -11 -7 -24 -8 -28 -2 -4 169 -8 380 -7 363 0 383 -1 378 -17 -8 -31 -1071
                                -3933 -1155 -4243 -44 -162 -139 -513 -211 -780 -72 -267 -133 -491 -135 -497
                                -2 -7 -1 -13 3 -13 4 1 66 141 139 313 73 172 207 488 299 702 91 215 237 557
                                324 760 87 204 231 541 320 750 89 209 292 684 450 1055 158 371 360 845 449
                                1053 89 207 233 547 322 755 89 207 196 459 239 560 l78 182 -439 0 c-241 0
                                -439 3 -439 6 0 4 12 63 26 133 14 69 70 347 124 616 55 270 140 693 190 940
                                50 248 131 648 180 890 49 242 170 843 270 1335 99 492 221 1093 270 1335 49
                                242 116 575 149 739 34 165 59 301 57 303 -2 3 -50 -134 -106 -304z"/>
                                </g>
                            </svg>
                        </div>
                         </div>
                    {selectedMode==="api"?<Loader color="#2C3D6F"/>:  <div className="flex bg-primary h-8 w-8 rounded-full border-2 border-shadow-blue">
                        <svg className="m-auto" width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.8933 8.49333C15.8299 8.32967 15.7347 8.18014 15.6133 8.05333L8.94667 1.38667C8.82235 1.26235 8.67476 1.16374 8.51233 1.09645C8.3499 1.02917 8.17581 0.994545 8 0.994545C7.64493 0.994545 7.30441 1.1356 7.05333 1.38667C6.92902 1.51099 6.8304 1.65857 6.76312 1.821C6.69584 1.98343 6.66121 2.15752 6.66121 2.33333C6.66121 2.6884 6.80226 3.02893 7.05333 3.28L11.4533 7.66667H1.33333C0.979711 7.66667 0.640573 7.80714 0.390525 8.05719C0.140476 8.30724 0 8.64638 0 9C0 9.35362 0.140476 9.69276 0.390525 9.94281C0.640573 10.1929 0.979711 10.3333 1.33333 10.3333H11.4533L7.05333 14.72C6.92836 14.844 6.82917 14.9914 6.76148 15.1539C6.69379 15.3164 6.65894 15.4907 6.65894 15.6667C6.65894 15.8427 6.69379 16.017 6.76148 16.1794C6.82917 16.3419 6.92836 16.4894 7.05333 16.6133C7.17728 16.7383 7.32475 16.8375 7.48723 16.9052C7.64971 16.9729 7.82398 17.0077 8 17.0077C8.17602 17.0077 8.35029 16.9729 8.51277 16.9052C8.67525 16.8375 8.82272 16.7383 8.94667 16.6133L15.6133 9.94667C15.7347 9.81986 15.8299 9.67034 15.8933 9.50667C16.0267 9.18205 16.0267 8.81795 15.8933 8.49333Z" fill="white" />
                        </svg>
                    </div>}
                </div>
                }
                {aadhaarEsignAvailable &&
                <div 
                    className=" flex  justify-between items-center py-3 px-4 gap-4 h-16  border-light-silver border-0.25 border-solid rounded-lg"
                    onClick={()=> onClickMode("esign")}
                >
                    <div className="flex flex-col p-0 h-10 gap-1 justify-center">
                        <p className=" font-semibold leading-5 -tracking-0.04 text-indigo">
                            Aadhar E-sign
                        </p>
                        <p className="text-xs tracking-0.08 text-granite-gray">
                            Disbursal in 2-3 working days
                        </p>
                    </div>
                    {selectedMode==="esign"?<Loader color="#2C3D6F"/>: <div className="flex bg-primary h-8 w-8 rounded-full border-2 border-shadow-blue">
                        <svg className="m-auto" width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.8933 8.49333C15.8299 8.32967 15.7347 8.18014 15.6133 8.05333L8.94667 1.38667C8.82235 1.26235 8.67476 1.16374 8.51233 1.09645C8.3499 1.02917 8.17581 0.994545 8 0.994545C7.64493 0.994545 7.30441 1.1356 7.05333 1.38667C6.92902 1.51099 6.8304 1.65857 6.76312 1.821C6.69584 1.98343 6.66121 2.15752 6.66121 2.33333C6.66121 2.6884 6.80226 3.02893 7.05333 3.28L11.4533 7.66667H1.33333C0.979711 7.66667 0.640573 7.80714 0.390525 8.05719C0.140476 8.30724 0 8.64638 0 9C0 9.35362 0.140476 9.69276 0.390525 9.94281C0.640573 10.1929 0.979711 10.3333 1.33333 10.3333H11.4533L7.05333 14.72C6.92836 14.844 6.82917 14.9914 6.76148 15.1539C6.69379 15.3164 6.65894 15.4907 6.65894 15.6667C6.65894 15.8427 6.69379 16.017 6.76148 16.1794C6.82917 16.3419 6.92836 16.4894 7.05333 16.6133C7.17728 16.7383 7.32475 16.8375 7.48723 16.9052C7.64971 16.9729 7.82398 17.0077 8 17.0077C8.17602 17.0077 8.35029 16.9729 8.51277 16.9052C8.67525 16.8375 8.82272 16.7383 8.94667 16.6133L15.6133 9.94667C15.7347 9.81986 15.8299 9.67034 15.8933 9.50667C16.0267 9.18205 16.0267 8.81795 15.8933 8.49333Z" fill="white" />
                        </svg>
                    </div>}
                </div>
                }
    
                {/* {!(apiDebitCardAvailable && apiNetBankingAvailable && aadhaarEsignAvailable) &&
                    <div className="flex flex-col gap-4">
                        <p
                        onClick={() => {onClickChangeBankDetails()}}
                        >To Change Bank Details</p>
                    </div>
                } */}
            </div>
            </div>
            {/* OVERLAY SCREEN */}
            <div
                    className={
                    "fixed inset-x-0 bottom-0 flex justify-center items-center opacity-[0.85]  z-20 w-screen h-screen bg-black" +
                    ( selectedMode ? " block" : " hidden")
                    }
                >
                    <div className=" flex flex-col mx-5">
                        <Player
                            autoplay
                            loop
                            src={LoaderAnimation}
                            className="w-16 h-16"
                        >
                        </Player>
                        <p className="mb-4 font-bold text-2xl mt-2 -tracking-0.08 text-white text-center">
                            Hang on!
                        </p>
                        <p className="mb-4 leading-5.5 tracking-0.08 text-white">
                            You are being redirected to your bank...
                        </p>
                        <p className="leading-5.5 tracking-0.08 text-white">
                            Please wait it may take a few seconds
                        </p>
                    </div>
                </div>
        </div>
    )
}
export default Repayment
