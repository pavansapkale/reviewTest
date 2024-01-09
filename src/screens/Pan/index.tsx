import { useContext, useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { complete, completeFetchNext, createSession, fetchNext, fetchVariable } from "../../apis/resource"
import Loader from "../../components/Loader"
import { RootContext } from "../../utils/RootContext"
import { getUrlByScreenName } from "../../utils/Routing"
import OpenReplay from '@openreplay/tracker';
import { detect } from "../../lib/DetectBrowser";

const Pan = (props: { stage: string, tracker: OpenReplay }) => {
    const [sessionData, sessionDispatch] = useContext(RootContext)
    const navigate = useNavigate()
    const { state } = useLocation()
    const self_declared_name = state?.variables?.self_declared_name
    const [panScreenTaskId, setPanScreenTaskId] = useState(state?.variables?.task_id)
    const [panNumber, setPanNumber] = useState("")
    const [panError, setPanError] = useState(false)
    const [panErrorMessage, setPanErrorMessage] = useState("")
    const inputPan = useRef<HTMLInputElement>(null)
    const inputTermsAndCondition = useRef<HTMLInputElement>(null)

    const [panSubmitLoading, setPanSubmitLoading] = useState(false)
    const [userLat, setUserLat] = useState(0.0)
    const [userLong, setUserLong] = useState(0.0)
    const [ip, setIp] = useState("0.0.0.0")

    const [termsAndCondition, setTermsAndCondition] = useState(true)
    const [termsAndConditionError, setTermsAndConditionError] = useState(false)
    //BROWSER INFO
    const browserInfo = detect()
    const browserDetails = { name: browserInfo?.name, os: browserInfo?.os, version: browserInfo?.version }

    useEffect(() => {
        //SET SESSION INFORMATION
        getSessionInfo()
    }, [])

    const getSessionInfo = async () => {
        navigator.geolocation.getCurrentPosition((position) => {
            setUserLat(position.coords.latitude)
            setUserLong(position.coords.longitude)
        })
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setIp(data.ip)
    }

    //CREATE SESSION
    const createSessionHandler = () => {
        let utmParams = {}
        var url = new URL(window.location.href);
        url.searchParams.forEach(function (value, key) {
            if (key.startsWith("utm")) {
                // @ts-ignore
                utmParams[key] = value
            }
        })

        const createSessionPayload = {
            ip_address: ip,
            utm: utmParams,
            location: {
                lat: userLat,
                long: userLong
            },
            meta_info: {
                browser_info: browserDetails
            }
        }

        createSession(createSessionPayload).catch((error) => {
            if (error) {
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
                }
            }
        })
    }

    //PAN NUMBER
    const onChangePanNumber = (panNumber: string) => {
        setPanError(false)
        setPanErrorMessage("")
        let num_char_pattern = /[^A-Za-z0-9]+/g
        if (panNumber.length <= 10 && !(num_char_pattern.test(panNumber))) {
            setPanNumber(panNumber.toUpperCase())
        }
    }

    //TERMS AND CONDITION
    const onCheckTermAndConditionChange = (termSatus: boolean) => {
        setTermsAndConditionError(false)
        setTermsAndCondition(termSatus)
    }

    const validate = () => {
        setPanError(false)
        setPanErrorMessage("")
        setTermsAndConditionError(false)
        let pan_pattern = /[A-Z]{3}[P][A-Z][0-9]{4}[A-Z]{1}$/

        if (panNumber.length === 0) {
            inputPan.current?.scrollIntoView({ inline: "center" })
            setPanError(true);
            setPanErrorMessage("Please enter PAN");
            return false;
        }

        if (!pan_pattern.test(panNumber)) {
            inputPan.current?.scrollIntoView({ inline: "center" })
            setPanError(true)
            setPanErrorMessage("Invalid PAN")
            return false
        }
        if (!termsAndCondition) {
            inputTermsAndCondition.current?.scrollIntoView()
            setTermsAndConditionError(true)
            return false
        }

        return true
    }

    const redirectToScreen = async () => {
        await fetchNext(props.stage).then((response) => {
            let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
            if(response.data.data.task_name === "panScreen"){
                setPanScreenTaskId(response.data.data.task_id)
                if (!response.data.data.pan_validated) {
                    setPanError(true)
                    setPanErrorMessage(response.data.data.pan_validation_message)
                }
            } else {
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
                    sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
                }
            }
        })
        setPanSubmitLoading(false)
    }

    //FETCH APPLICATION PAN STATUS
    const fetchApplicationStatus = async () => {
        fetchVariable("pan_status").then(async (response) => {
            if (response.status === 200) {
                if (response.data.data.is_present) {
                    if (response.data.data.pan_status === "DONE" || response.data.data.pan_status === "ERROR" || response.data.data.pan_status === "REJECTED") {
                        setTimeout(() => {
                            redirectToScreen()
                        },
                            3000)
                    } else {
                        // RECURSSION
                        setTimeout(() => {
                            fetchApplicationStatus()
                        },
                            5000)
                    }
                } else {
                    // RECURSSION
                    setTimeout(() => {
                        fetchApplicationStatus()
                    },
                        5000)
                    console.error("EXPECTED VARIABLE NOT PRESENT")
                }
            }
        }).catch((error) => {
            if (error) {
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
                }
            }
        })
    }

    const onClickSubmitPan = async () => {
        if (validate()) {
            createSessionHandler()
            setPanSubmitLoading(true)
            let variables = {
                in_pan: panNumber,
                in_location: {
                    lat: userLat,
                    long: userLong
                }
            }
            await complete(panScreenTaskId, variables).then((response) => {
                fetchApplicationStatus()
            }).catch((error) => {
                setPanSubmitLoading(false)
                if (error) {
                    if (error.status === 401 || error.status === 403) {
                        sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
                    }
                }
            })
        }
    }

    return (
        <div className="mt-2 pb-36">
            <div className="p-5">
                <h1 className="text-2xl font-bold tracking-0.08" >
                    Welcome{" "}
                    <span className="capitalize" style={{ wordBreak: "break-all" }}>
                        {self_declared_name}
                    </span>
                    !
                </h1>
                <div className="mt-10" ref={inputPan}>
                    <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Enter PAN</p>
                    <label className="relative rounded-lg bg-background focus-within:text-gray-600 block">
                        <input
                            data-openreplay-obscured
                            onChange={(event: any) => onChangePanNumber(event.target.value)}
                            type="text" name="pan_number" placeholder="Enter PAN" autoComplete="off"
                            value={panNumber}
                            className={"border-2 border-background w-full h-12 tracking-wider rounded-lg bg-background outline-none pl-4 pt-1 caret-primary-500 " + (panError ? "ring-2 ring-red-600" : "focus:border-2 focus:border-primary")}
                            onFocus={() => { inputPan.current?.scrollIntoView({ inline: "center" }) }}
                        ></input>
                    </label>
                    <div className={"flex mt-1 text-red-600 " + (panError ? "visible" : "invisible")}>
                        <p>{panErrorMessage}</p>
                    </div>
                </div>

            </div>

            {/* STICKEY BUTTON  */}
            <div className="fixed-button bg-cultured max-w-md">
                {/* TERMS AND CONDITION  */}
                <div className={"flex gap-3"}>
                    <input
                        ref={inputTermsAndCondition}
                        className={
                            "h-6 w-6 my-auto " +
                            (termsAndConditionError ? "ring-2 ring-red-600" : "")
                        }
                        type="checkbox"
                        style={{ accentColor: "#2C3D6F" }}
                        onChange={(event) => onCheckTermAndConditionChange(event.target.checked)}
                        checked={termsAndCondition}
                        onFocus={() => inputTermsAndCondition.current?.scrollIntoView()}
                    >
                    </input>
                    <p className="text-xs text-justify w-full">By continuing, I irrevocably authorize Protium to obtain information from <a href="https://www.cersai.org.in/CERSAI/home.prg" target="_blank">CERSAI</a>, Credit bureau or any other agency.</p>
                </div>
                <div
                    className={
                        " text-red-600  " +
                        (termsAndConditionError
                            ? "visible"
                            : "invisible")
                    }
                >
                    Please agree to the terms
                </div>
                <button
                    className={
                        "h-14 w-full rounded-lg bg-primary text-white font-bold text-lg max-w-md " +
                        (panSubmitLoading ? "opacity-90 cursor-not-allowed" : "")
                    }
                    onClick={() => onClickSubmitPan()}
                    disabled={panSubmitLoading}
                >
                    {!panSubmitLoading &&
                        <p>SUBMIT</p>
                    }

                    {panSubmitLoading &&
                        <Loader />
                    }
                </button>
            </div>
        </div>
    )
}

export default Pan
