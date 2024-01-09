import "../../../lib/Digio/V9"
import { completeFetchNext, fetchNext } from "../../../apis/resource"
import jwt_decode from "jwt-decode"
import ProtiumLogo from "../../../assets/svg/pm_logo.svg"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getUrlByScreenName } from "../../../utils/Routing"
import { Player } from "@lottiefiles/react-lottie-player"
import Loader from "../../../assets/lottie/loader.json"
import { RootContext } from "../../../utils/RootContext"

type decodedTokenType = {
    data: {
        digio_id: string;
        customer_identifier: string;
        digio_access_token: string;
    };
};

const DigioKYC = (props: { stage: string }) => {
    const [ sessionData, sessionDispatch ] = useContext(RootContext)
    const navigate = useNavigate()
    
    const kyc_ok = 'KYC Process Completed.'
    const kyc_fail = 'KYC already completed.'
    
    const [ kycStatus, setKycStatus ] = useState("PENDING") //["PENDING", "SUCCESS", "FAIL"]
    const [ overlayMessage, setOverlayMessage ] = useState("KYC inprogress")

    const show_in_iframe = sessionStorage.getItem("_source") === "mobile_app"

    const options = {
        environment: import.meta.env.VITE_APP_DIGIO_ENV,
        logo: ProtiumLogo,
        callback: async (response: any) => {
            if (response.hasOwnProperty('error_code')) {
                setKycStatus("FAIL")
                setOverlayMessage("KYC failed, please refresh page")
                await completeFetchNext(props.stage, {
                    in_digio_response: response,
                    in_ekyc_complete: false,
                }).catch((error) => {
                    if(error){
                        if (error.status === 401 || error.status === 403) {
                            sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                        }
                    }
                })
            } else {
                if (response.message === kyc_ok || response.message === kyc_fail) {
                    await completeFetchNext(props.stage, {
                        in_digio_response: response,
                        in_ekyc_complete: true,
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
            }
        },
        is_iframe: show_in_iframe,
        iFrameId: "digio_iframe"
    }

    useEffect(() => {
        InitDigio()
    }, [])

    const InitDigio = async () => {
        await fetchNext(props.stage).then((response) => {
            const digio_url = response.data.data.digio_url;
            const token = digio_url?.substring(digio_url.indexOf('token=') + 6);

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
        <div>
            <iframe id="digio_iframe"></iframe>
            {/* OVERLAY  */}
            <div
                className={"z-50 left-0 top-0 fixed inset-x-0 bottom-0 h-full w-full bg-black bg-opacity-75 visible"}
            >
                <div className="flex justify-center item-center flex-col h-screen">
                    <div className="flex justify-center">
                        {kycStatus=="PENDING" &&
                        <Player
                        autoplay
                        loop
                        src={Loader}
                        className="w-16 h-16"
                    >
                    </Player>
                        }
                        {kycStatus=="FAIL" &&
                            <p className="text-white">Fail</p>
                        }
                        {kycStatus=="SUCCESS" &&
                            <p className="text-white">success</p>
                        }
                    </div>
                    <div className="flex justify-center">
                        <p className="text-white">
                            {overlayMessage}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DigioKYC

