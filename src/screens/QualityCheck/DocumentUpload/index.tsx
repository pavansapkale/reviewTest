import { useState, useEffect, useContext } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { fetchNext } from "../../../apis/resource"
import UploadSection from "./UploadSection"
import { RootContext } from "../../../utils/RootContext"
import { getDocumentDetails, getTitle } from "../../../utils/Functions"
import spinner from "../../../assets/svg/spinner.svg"
import { Player } from "@lottiefiles/react-lottie-player"
import LottieLoader from "../../../assets/lottie/loader.json"
import UdyamSubmit from "./UdyamSubmit"

import chatWhatsappIcon from "../../../assets/png/chatWhatsappIcon.png"

interface QcDataType {
    title: string,
    docUploaded: boolean,
    qcStatus: boolean,
    stage: string,
    docTypeList: Array<{ key: string, value: string }>,
    isDropdownDisabled: boolean,
    dropdownDefaultValue: { key: string, value: string },
    fileLimit: number
}

const DocumentUpload = (props: { stage: string }) => {
    const [sessionData, sessionDispatch] = useContext(RootContext)
    const [data, setData] = useState()
    const [qcData, setQcData] = useState<Array<QcDataType>>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { state } = useLocation()
    const [redirection, setRedirection] = useState(false)
    const allowedFileType = ["image/bmp", "image/jpeg", "image/jpg", "image/x-png", "image/png", "application/pdf"]
    const [udyamDetails, setUdyamDetails] = useState({ udyamRequired: false, udyamVerified: false, udyamNumber: "" })

    useEffect(() => {
        fetchData()
    }, [])


    const fetchData = async () => {
        await fetchNext(props.stage).then((response) => {
            //reject case not handled
            dataHandler(response.data.data.doc_payload)
            setData(response.data.data.doc_payload)
            udyamDetailsHandler(response.data.data)
        }).catch((error) => {
            if (error) {
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
                }
            }
        })
        setLoading(false)
    }

    const udyamDetailsHandler = (data: any) => {
        const tempDetails = { udyamRequired: data.udyam_required, udyamVerified: data.udyam_verified, udyamNumber: data.udyam_registration_number }
        setUdyamDetails(tempDetails)
    }


    const getStatus = (key: string, value: { doc_uploaded: boolean, status: boolean }) => {
        let title = ""
        let docDetails: { list: Array<{ key: string, value: string }>, isDropdownDisabled: boolean, dropdownDefaultValue: { key: string, value: string }, fileLimit: number } = { list: [], isDropdownDisabled: false, dropdownDefaultValue: { key: "", value: "" }, fileLimit: 2 }
        if (!value.status || (value.status && value.doc_uploaded)) {
            title = getTitle(key)
            docDetails = getDocumentDetails(key)
            return { title: title, docUploaded: value.doc_uploaded, qcStatus: value.status, stage: key.toUpperCase(), docTypeList: docDetails.list, isDropdownDisabled: docDetails.isDropdownDisabled, dropdownDefaultValue: docDetails.dropdownDefaultValue, fileLimit: docDetails.fileLimit }
        }
    }
    const dataHandler = (list: { crm_decision: string, qc: object }) => {
        const crmDecision = list["crm_decision"]
        if (crmDecision === "APPROVED") {
            setRedirection(true)
            setTimeout(() => {
                setRedirection(false)
                navigate('/loan-document', {
                    state: state,
                    replace: true
                })
            }, 3000)
        }
        const qc_list: { [key: string]: any } = list["qc"]
        const formmatedList: Array<QcDataType> = []
        Object.keys(qc_list).forEach((key) => {
            let formattedValue = getStatus(key, qc_list[key])
            if (formattedValue) {
                formmatedList.push(formattedValue)
            }
        })
        setQcData(formmatedList)
    }

    const statusChangeHandler = (stage: string) => {
        let tempQCData: any = data;
        let stageValue: string = stage.toLowerCase();
        tempQCData["qc"][stageValue]["doc_uploaded"] = true
        dataHandler(tempQCData)
    }

    return (
        <div className="my-4 mx-3 pb-12">
            <div className=" mb-8 font-bold text-2xl items-center flex-grow-0 mt-5 self-stretch -tracking-0.08 text-center">
                Upload Documents
            </div>
            {loading ?
                <div className="flex justify-center">
                    <img className="mx-10 w-16 h-16" src={spinner} alt="content loading" />
                </div> :
                <div>
                    {qcData.length > 0 && qcData.map((item, i) => {
                        return <UploadSection
                            title={item.title}
                            docTypeList={item.docTypeList}
                            fileLimit={item.fileLimit}
                            docStatus={item.docUploaded}
                            qcStatus={item.qcStatus}
                            stage={item.stage}
                            allowedFileType={allowedFileType}
                            id={i}
                            key={i}
                            isDropdownDisabled={item.isDropdownDisabled}
                            dropdownDefaultValue={item.dropdownDefaultValue}
                            onStatusChange={(stage) => { statusChangeHandler(stage) }}
                        />
                    })}
                    {udyamDetails.udyamRequired && <UdyamSubmit udyamDetails={udyamDetails} />}
                    {!udyamDetails.udyamRequired && !(qcData.length > 0) && <div className="text-center">No Data Available</div>}
                </div>}
            <div className="btn-whatsapp-pulse">
                <a href="https://wa.link/70vpeh" target="_blank">
                    <img src={chatWhatsappIcon} />
                </a>
            </div>
            {/* OVERLAY  */}
            <div
                className={"z-50 left-0 top-0 fixed inset-x-0 bottom-0 h-full w-full bg-black bg-opacity-75 " + (redirection ? "visible" : "hidden")}
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
                    <div className="flex justify-center flex-col text-center">
                        <p className="text-white">
                            We are redirecting you...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DocumentUpload