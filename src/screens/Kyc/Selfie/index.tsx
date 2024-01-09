import { useContext, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { completeFetchNext, uploadDocument } from "../../../apis/resource"
import { getUrlByScreenName } from "../../../utils/Routing"
import { Player } from "@lottiefiles/react-lottie-player"
import { RootContext } from "../../../utils/RootContext"

import SelfieImage from "../../../assets/svg/selfie-verification.svg"
import Loader from "../../../assets/lottie/loader.json"
import spinner from "../../../assets/svg/spinner.svg"
import { generateRandomString } from "../../../utils/Functions"

const Selfie = (props: { stage: string }) => {
    const [ sessionData, sessionDispatch ] = useContext(RootContext)
    const navigate = useNavigate()

    const [cameraOpen, setCameraOpen] = useState(false)
    const [selfieError, setSelfieError] = useState(false)
    const [selfieErrorMessage, setSelfieErrorMessage] = useState("")
    const [selfieStatus, setSelfieStatus] = useState("PENDING")
    const [videoStream, setVideoStream] = useState<MediaStream>()
    const [declineCameraPermission, setDeclineCameraPermission] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [selfieCount, setSelfieCount] = useState<number>(1)

    const onClickOpenCamera = () => {
        getVideoStream()
        setCameraOpen(true)
    }

    // SELFIE 
    const videoRef = useRef(null);
    const photoRef = useRef(null);
    const [hasPhoto, setHasPhoto] = useState(false);

    const getVideoStream = () => {
        navigator.mediaDevices.getUserMedia({
            video: {
                height: 480,
                width: 480
            }
        }).then(stream => {
            if (videoRef.current) {
                let video: any = videoRef.current
                video.srcObject = stream
                video.onloadedmetadata = () => {
                    video.play()
                }
            }
            setIsLoading(false)
            setVideoStream(stream)
        }).catch(error => {
            console.log("error", error)
            setDeclineCameraPermission(true)
        });
    }

    const takePhoto = async () => {
        setSelfieError(false)
        setSelfieErrorMessage("")
        navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
        })
        .catch(function() {
          setDeclineCameraPermission(true)
        });
        const width = 480
        const height = 480
        let video: any = videoRef.current
        let photo: any = photoRef.current

        photo.width = width
        photo.height = height

        let ctx = photo.getContext('2d')
        ctx.drawImage(video, 0, 0, width, height, 0, 0, width, height)
        setHasPhoto(true)
        setSelfieStatus("IN_PROGRESS")
        //UPLOAD PHOTO
        //@ts-ignore
        const imageSrc = photo.toDataURL()
        let fileName = "selfie_" + generateRandomString(4) + "_" + selfieCount + ".png"
        setSelfieCount((prevSelfieCount) => (prevSelfieCount + 1))
        await uploadDocument(imageSrc, fileName).then(async (response) => {
            let variables = {
                "in_presigned_url": response.data.data.presigned_url
            }
            //MOVE WORKFLOW
            await completeFetchNext(props.stage, variables).then(async (response) => {
                if (response.data.data.liveness_verified) {
                    setSelfieStatus("VERIFIED")
                    let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
                    videoStream?.getVideoTracks().forEach((track) => {
                        track.stop()
                    });
                    navigate(redirectTo, {
                        state: {
                            variables: response.data.data, //TO SEND DATA NEXT SCREEN
                        },
                        replace: true
                    })
                } else {
                    if (response.data.data.task_name !== "selfieScreen") {
                        let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
                        videoStream?.getVideoTracks().forEach((track) => {
                            track.stop()
                        });
                        navigate(redirectTo, {
                            state: {
                                variables: response.data.data, //TO SEND DATA NEXT SCREEN
                            },
                            replace: true
                        })
                    }
                    setHasPhoto(false)
                    setSelfieError(true)
                    setSelfieErrorMessage(response.data.data.liveness_message)
                    setSelfieStatus("PENDING")
                }
            }).catch((error) => {
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                }
            })

        }).catch((error) => {
            if(error){
                setHasPhoto(false)
                setSelfieError(true)
                setSelfieErrorMessage("ERROR while uploading photo")
                setSelfieStatus("PENDING")
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
                }
            }
        })
    }

    return (
        <div>
            <div>
                {/* SECTION 1 */}
                <div className={"p-5 " + (cameraOpen ? "hidden" : "visible")}>
                    <h1 className="text-2xl font-bold -tracking-0.08">
                        Take a selfie for verification
                    </h1>
                    <div className="my-16">
                        <img src={SelfieImage} alt="Take a selfie" />
                    </div>
                </div>
                {/* STICKEY BUTTON  */}
                <div className={"fixed-button bg-cultured max-w-md "+(cameraOpen ? "hidden" : "visible")}>
                    <button
                    className="h-14 w-full rounded-lg bg-primary text-white font-bold text-lg max-w-md"
                    onClick={() => onClickOpenCamera()}
                    >
                        OPEN CAMERA
                    </button>
                </div>
                {isLoading && cameraOpen && !declineCameraPermission && <div className="flex justify-center">
                                    <img className="mx-10 w-16 h-16" src={ spinner } alt="content loading" />
                                </div>}
                {/* SECTION 2 */}
                <div className={((cameraOpen && !declineCameraPermission && !isLoading) ? "visible" : "hidden")}>
                    <div className="flex justify-center">
                        <video style={{ height: `calc(100vh - 4rem )` }} className={"flip-image-180-degree object-cover " + (hasPhoto ? "hidden" : "")} ref={videoRef} autoPlay playsInline></video>
                        <canvas id="selfie" className={"flip-image-180-degree rounded-full mt-5 ring-offset-1 ring-4 ring-ufo-green h-64 w-64 " + (hasPhoto ? "visible" : "hidden")} ref={photoRef}></canvas>
                    </div>
                    <div className="flex flex-col justify-center items-center absolute inset-x-0 bottom-0 mb-5 p-5">
                        {selfieStatus === "PENDING" && <div
                            className="h-20 w-20 rounded-full bg-light-primary flex justify-center ring-1 ring-primary ring-offset-4"
                            onClick={() => takePhoto()}
                        >
                            <svg className="h-10 w-10 mt-4" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 13.3332C20 16.2788 17.6123 18.6667 14.6667 18.6667C11.7212 18.6667 9.3335 16.2788 9.3335 13.3332C9.3335 10.3877 11.7212 8 14.6667 8C17.6123 8 20 10.3877 20 13.3332Z" fill="#fff" />
                                <path d="M3.33376 24H25.9999C26.8836 23.9989 27.731 23.6473 28.3559 23.0226C28.9807 22.3975 29.3323 21.5505 29.3333 20.6668V7.99996C29.3322 7.11625 28.9807 6.26894 28.3559 5.64414C27.7309 5.01912 26.8836 4.66758 25.9999 4.66672H24.0394C23.3934 4.66583 22.7877 4.35422 22.4113 3.82924L20.6734 1.39531C20.0464 0.52074 19.0368 0.00131428 17.9607 0H11.3727C10.2963 0.00133931 9.28653 0.52098 8.65996 1.39599L6.92202 3.82924C6.54569 4.35424 5.93986 4.66586 5.29392 4.66672H3.33341C2.4497 4.66761 1.60239 5.01918 0.977424 5.64414C0.352627 6.26894 0.00108571 7.11625 0 7.99996V20.6668C0.00111605 21.5505 0.352678 22.3975 0.977424 23.0226C1.60245 23.6474 2.44976 23.9989 3.33341 24H3.33376ZM14.6668 6.66694C16.4349 6.66694 18.1307 7.36916 19.3809 8.61939C20.6311 9.86961 21.3336 11.5654 21.3336 13.3334C21.3336 15.1015 20.6311 16.7972 19.3809 18.0475C18.1307 19.2977 16.4349 20.0001 14.6668 20.0001C12.8988 20.0001 11.203 19.2977 9.95281 18.0475C8.70259 16.7972 8.00013 15.1015 8.00013 13.3334C8.00214 11.566 8.70504 9.87138 9.95504 8.62162C11.2048 7.37185 12.8994 6.66871 14.6668 6.66694Z" fill="#fff" />
                            </svg>
                        </div>}
                        {selfieStatus === "IN_PROGRESS" &&
                            <div className=" flex flex-col">
                                <Player
                                    autoplay
                                    loop
                                    src={Loader}
                                    className="w-12 h-12"
                                >
                                </Player>
                                <p className=" font-semibold">Verifying...</p>
                            </div>
                        }
                        {selfieStatus === "VERIFIED" &&
                            <div className="flex flex-col">
                                <svg className="mx-auto" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M0.666748 14C0.666748 6.66666 6.66675 0.666656 14.0001 0.666656C21.3334 0.666656 27.3334 6.66666 27.3334 14C27.3334 21.3333 21.3334 27.3333 14.0001 27.3333C6.66675 27.3333 0.666748 21.3333 0.666748 14ZM20.7611 11.0641C21.2818 10.5434 21.2818 9.69914 20.7611 9.17844C20.2404 8.65774 19.3961 8.65774 18.8754 9.17844L12.0607 15.9932L9.12469 13.0572C8.604 12.5365 7.75977 12.5365 7.23908 13.0572C6.71838 13.5779 6.71838 14.4221 7.23908 14.9428L11.1179 18.8216C11.6386 19.3423 12.4828 19.3423 13.0035 18.8216L20.7611 11.0641Z" fill="#28A745" />
                                </svg>
                                <p className="font-semibold mt-2">Verified</p>
                            </div>
                        }
                        <div className={"flex mt-2 justify-center items-center text-red-600 gap-2 bg-white p-4 rounded-md " + (selfieError ? "visible" : "invisible")}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" fill="#DC3545" />
                                <path d="M12 8V13" stroke="#F5F6F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11.9941 16H12.0031" stroke="#F5F6F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p>{selfieErrorMessage ? selfieErrorMessage : "Not able to detect face"}</p>
                        </div>
                    </div>
                </div>

                {/* SECTION 2 */}
                <div style={{ height: `calc(100vh - 4rem )` }} className={"flex justify-center items-center w-full " + (declineCameraPermission ? "visible" : "hidden")} >
                    <div className="text-center"><p>Camera permission declined</p><p>Please allow camera permission and refresh page</p></div>
                </div>
            </div>
        </div>
    )
}

export default Selfie