import { useState , useContext , useEffect } from "react"
import Dropdown from "../../../components/Dropdown"
import FileUpload from "../../../components/FileUpload"
import {uploadFileCRM } from "../../../apis/resource"
import { RootContext } from "../../../utils/RootContext"
import Loader from "../../../components/Loader"
import { toast } from "react-toastify"
interface UploadSectionProps{
    title:string,
    docTypeList:Array<{key:string,value:string}>,
    dropdownDefaultValue?:{key:string,value:string},
    isDropdownDisabled?:boolean,
    allowedFileType?:string[],
    fileLimit?:number,
    docStatus?:boolean,
    qcStatus?:boolean,
    id?:number,
    stage?:string,
    onStatusChange:(stage: string)=>void
}

interface docType{
    key:string,
    value:string
}
const UploadSection=({title,docTypeList,dropdownDefaultValue={key:"",value:""},isDropdownDisabled=false,allowedFileType=[],fileLimit = 2,docStatus,qcStatus,id,stage="",onStatusChange}:UploadSectionProps)=>{
    const [ sessionData, sessionDispatch ] = useContext(RootContext)
    const [modalOpen,setModalOpen]=useState(false)
    const [selectedDocumentType,setSelectedDocumentType]=useState<docType>({key:"",value:""})
    const [filesData,setFilesData]=useState<File[]>([])
    
    const [dropdownError,setDropdownError]=useState("")
    const [fileError,setFileError]=useState("")
    const [uploadLoading,setUploadLoading]=useState(false)
    const [isDocTypeAadhaar,setIsDocTypeAadhaar]=useState(false)

    useEffect(()=>{
        dropdownDefaultValue && setSelectedDocumentType(dropdownDefaultValue)
        dropdownDefaultValue.key === "AADHAAR_CARD" && setIsDocTypeAadhaar(true)
    },[])

    const validate=()=>{
        setDropdownError("")
        setFileError("")
        let totalFilesSize=0
        filesData.length>0 && filesData.map((item)=>{
            totalFilesSize+=item.size
        })
        if (selectedDocumentType?.key === "") {
            setDropdownError("Please select document type");
            return false;
        }
        if(!isDocTypeAadhaar && filesData.length===0){
            setFileError("Please select file(s)")
            return false
        }
        if(!isDocTypeAadhaar && filesData.length > fileLimit){
            setFileError(`Please select upto ${fileLimit} files`)
            return false
        }
        if(!isDocTypeAadhaar && totalFilesSize > 10*1024*1024){
            setFileError('Please select file(s) with combined size upto 10 MB')
            return false
        }
        return true

    }
    const onFileSelect = (files:File[]) => {
        setFileError("")
        setFilesData(files)
    }
    
    const onClickUpload=async()=>{
        if(validate()){
            setUploadLoading(true)
            const payload={
                doc_type:selectedDocumentType.key,
                stage:stage
            }
            
            await uploadFileCRM(payload, filesData).then((response) => {
                if(response.status === 200){
                        setModalOpen(false)
                        onStatusChange(payload.stage)
                            if(!isDocTypeAadhaar && filesData.length>0){
                                toast.success(`Document upload successful`)  
                            }
                            else{
                                toast.success(`Submission successful`)
                            }
            }
                }).catch((error) => {
                    if(error){
                        if (error.status === 401 || error.status === 403) {
                            sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                        }
                    }
                })
            setUploadLoading(false)
        }
    }

    const onChangeDropdown=(docType:docType)=>{
        setIsDocTypeAadhaar(false)
        setDropdownError("")
        setSelectedDocumentType(docType)
        if(docType.key === "AADHAAR_CARD"){
            setIsDocTypeAadhaar(true)
        }
    }

    return( 
    <div className="mt-4 p-4 bg-white rounded-md" >
        <div className="flex justify-between items-center cursor-pointer" onClick={()=>{
            if(!docStatus)
                setModalOpen(!modalOpen)
            }}>
            <h3 className=" font-semibold text-lg text-secondary">{title}</h3>
            {docStatus ? (docStatus && qcStatus) ? <svg 
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
                :
                <svg className="mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.3895 15.67L13.3495 12H10.6395L6.59949 15.67C5.46949 16.69 5.09949 18.26 5.64949 19.68C6.19949 21.09 7.53949 22 9.04949 22H14.9395C16.4595 22 17.7895 21.09 18.3395 19.68C18.8895 18.26 18.5195 16.69 17.3895 15.67ZM13.8195 18.14H10.1795C9.79949 18.14 9.49949 17.83 9.49949 17.46C9.49949 17.09 9.80949 16.78 10.1795 16.78H13.8195C14.1995 16.78 14.4995 17.09 14.4995 17.46C14.4995 17.83 14.1895 18.14 13.8195 18.14Z" fill="#856404" />
                    <path d="M18.3506 4.32C17.8006 2.91 16.4606 2 14.9506 2H9.05065C7.54065 2 6.20065 2.91 5.65065 4.32C5.11065 5.74 5.48065 7.31 6.61065 8.33L10.6506 12H13.3606L17.4006 8.33C18.5206 7.31 18.8906 5.74 18.3506 4.32ZM13.8206 7.23H10.1806C9.80065 7.23 9.50065 6.92 9.50065 6.55C9.50065 6.18 9.81065 5.87 10.1806 5.87H13.8206C14.2006 5.87 14.5006 6.18 14.5006 6.55C14.5006 6.92 14.1906 7.23 13.8206 7.23Z" fill="#856404" />
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
            <Dropdown 
                docTypeList={docTypeList} 
                onChangeDropdown={onChangeDropdown} 
                isDisabled={isDropdownDisabled} 
                defaultValue={dropdownDefaultValue} 
                error={dropdownError}  
            />
            {isDocTypeAadhaar ? 
            <div className="border-light-silver border-dashed border-2 p-2 rounded mb-4 text-center">
                We already have your aadhaar details with us please click on submit
            </div> : 
            <FileUpload
                onFileSelect={(file: any) => onFileSelect(file)}
                accept={allowedFileType}
                maxFileSize={10}
                multiple={true}
                fileError={fileError}
                id={id}
            />}      
            <button onClick={onClickUpload} className={" h-10 w-full rounded-md bg-primary text-white font-bold text-lg max-w-md"} disabled={uploadLoading}>
                {uploadLoading ? <Loader/> : <p>{isDocTypeAadhaar ? "SUBMIT" : "UPLOAD"}</p> }
            </button> 
            
    
        </div>
    </div>)
}
export default UploadSection