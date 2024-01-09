import { useContext, useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { completeFetchNext } from "../../apis/resource"
import Loader from "../../components/Loader"
import DatePicker from "../../components/DatePicker"
import { RootContext } from "../../utils/RootContext"
import { getUrlByScreenName } from "../../utils/Routing"
import BottomSheet from "../../components/BottomSheet"


const BasicDetail = (props: { stage: string }) => {
  const [sessionData,sessionDispatch] = useContext(RootContext)

  const navigate = useNavigate()
  const { state } = useLocation()

  const panNumber = state?.variables?.pan
  const panName = state?.variables?.first_name

  //PREFILL VARIABLES
  const prefillGender = state?.variables?.gender //"M,F,O"
  const prefillDob =  state?.variables?.dob_dd_mm_yyyy //"07-08-1996"
  const prefillCurrentResidencePincode = state?.variables?.current_residence_pincode //"123456"

  const [dateOfBirth, setDateOfBirth] = useState("")
  const [dateOfBirthToShow, setDateOfBirthToShow] = useState("")
  const [showDatepicker, setShowDatepicker] = useState(false)
  const [dateOfBirthError, setDateOfBirthError] = useState(false)
  const inputDob = useRef<HTMLInputElement>(null)

  const [gender, setGender] = useState("")
  const [genderError, setGenderError] = useState(false)

  const [pincode, setPincode] = useState("")
  const [cityState, setCityState] = useState("")
  const [pincodeError, setPincodeError] = useState(false)
  const [isPincodeInvalid, setIsPincodeInvalid] = useState(false)
  const [pincodeErrorMessage, setPincodeErrorMessage] = useState("")
  const inputPincode = useRef<HTMLInputElement>(null)

  const [nextLoading, setNextLoading] = useState(false)
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [confirmButtonClicked, setConfirmButtonClicked] = useState(false)

  //PREFILL DETAILS
  useEffect(() => {
    if(prefillCurrentResidencePincode){
      onChangePincode(prefillCurrentResidencePincode)
    }

    if(prefillGender){
      onGenderSelect(prefillGender)
    }

    if(prefillDob){
      setDateOfBirth(prefillDob)
      onSelectDob(prefillDob)
    }

  }, [])

  const validate = () => {
    const pinCodeRegx = /^[1-9]{1}[0-9]{5}$/
    setPincodeError(false)
    setDateOfBirthError(false)
    setGenderError(false)

    if (dateOfBirth === "") {
      inputDob.current?.scrollIntoView()
      setDateOfBirthError(true)
      return false
    }

    if (isPincodeInvalid) {
      inputPincode.current?.scrollIntoView()
      setPincodeError(true)
      return false
    }

    if(gender === ""){
      setGenderError(true)
      return false
    }

    if (!pinCodeRegx.test(pincode) && pincode.length < 6) {
      inputPincode.current?.scrollIntoView()
      setPincodeError(true)
      setPincodeErrorMessage("Please enter a valid pincode")
      return false
    }

    return true
  }

  const onClickNextBasicDetails = async () => {
    if (validate()) {
      setNextLoading(true)

      let lGender = ""
      if (gender === "M") lGender = "male"
      if (gender === "F") lGender = "female"
      if (gender === "O") lGender = "other"

      const variables = {
        in_gender_initial: gender,
        in_gender: lGender,
        in_date_of_birth: dateOfBirth,
        in_fetch_pincode: false,
        in_not_pep_consent: true
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
      setNextLoading(false)
    }
  }

  const onGenderSelect = (gender: any) => {
    setGenderError(false)
    setGender(gender)
  }

  //DATE
  const onClickDate = () => {
    setDateOfBirthError(false)
    setShowDatepicker(true)
  }

  const onClickConfirmDate = () => {
    setConfirmButtonClicked(true)
    setShowDatepicker(false)
  }

  const onChangePincode = async (pin_code: any) => {
    const pinCodeRegx = /^\d+$/

    setPincodeError(false)
    setIsPincodeInvalid(false)
    setCityState("")
    if (pin_code.length <= 6) {
      if (pinCodeRegx.test(pin_code) || pin_code === "") {
        setPincode(pin_code)
        if (pin_code.length === 6) {
          setPincodeLoading(true)
          await completeFetchNext(props.stage, {
            in_pincode: pin_code,
            in_fetch_pincode: true,
          }).then((response) => {
            if (response.data.data.pincode_verified) {
              const pincode_data = response.data.data.pincode_data
              setCityState(pincode_data.city + ", " + pincode_data.stateCode)
            } else {
              if(response.data.data.task_name !== "personalInfoScreen"){
                let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
                navigate(redirectTo, {
                  state: {
                    variables: response.data.data, //TO SEND DATA NEXT SCREEN
                  },
                  replace: true
                })
              }
              setCityState("")
              setPincodeError(true)
              setPincodeErrorMessage(response.data.data.pincode_message)
              setIsPincodeInvalid(true)
            }
          }).catch((error) => {
            setIsPincodeInvalid(true)
            if(error){
              setCityState("")
              setPincodeError(true)
              setPincodeErrorMessage(error.data.message)
              setIsPincodeInvalid(true)
              if (error.status === 401 || error.status === 403) {
                sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
              }
            }else{
              setPincode("")
            }
          })
          setPincodeLoading(false)
        }
      }
    }
  }

  const onSelectDob = (dob: any) => {
    setDateOfBirth(dob)
    const monthList = [
       "Jan",
       "Feb",
       "Mar",
       "Apr",
       "May",
       "Jun",
       "Jul",
       "Aug",
       "Sep",
       "Oct",
       "Nov",
       "Dec",
    ]

    let dobArray = dob.split("-")

    let month = Number(dobArray[1])-1
    
    let newDateToShow = dobArray[0] + " " + monthList[month] + " " + dobArray[2]
    setDateOfBirthToShow(newDateToShow)
  }

  return (
    <div className="mt-2">
      <div className="p-5 pb-24">
        <h1 className="text-2xl font-bold -tracking-0.08">
        Basic{" "}Details
        </h1>

        {/* PAN  */}
        <div className="mt-10">
          <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">PAN</p>
          <label className="relative block">
            <input
            data-openreplay-obscured
              type="text"
              name="pan_number"
              placeholder="Enter pan number"
              autoComplete="off"
              disabled={true}
              value={panNumber}
              className={
                "text-xl w-full h-12 tracking-wider pl-4 pt-1"
              }
            ></input>
            <span className="flex absolute inset-y-0 right-0 items-center pr-4 pt-1">
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                  fill="#2ACD61"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16.4605 8.40802C16.7874 8.66232 16.8463 9.13353 16.592 9.46049L12.585 14.6123C11.9613 15.4143 10.7881 15.5183 10.033 14.8387L7.49828 12.5575C7.1904 12.2804 7.16544 11.8062 7.44254 11.4983C7.71963 11.1904 8.19385 11.1655 8.50173 11.4426L11.0364 13.7238C11.1443 13.8209 11.3119 13.806 11.401 13.6914L15.408 8.53958C15.6623 8.21262 16.1335 8.15372 16.4605 8.40802Z"
                  fill="white"
                />
              </svg>
            </span>
          </label>
        </div>

        {/* DOB  */}
        <div className="mt-8" ref={inputDob}>
          <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Date of birth</p>
          <label className="relative block">
            <input
              type="text"
              name="dob"
              placeholder="Select date of birth"
              autoComplete="off"
              contentEditable="false"
              defaultValue={dateOfBirthToShow}
              onClick={() => onClickDate()}
              readOnly={true}
              className={
                "border-2 border-background w-full h-12 tracking-0.08 rounded-lg bg-background outline-none pl-4 pt-1 caret-primary-500 " + (dateOfBirthError ? "ring-2 ring-red-600" : "focus:border-2 focus:border-primary")
              }
            ></input>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                width="18"
                height="21"
                viewBox="0 0 18 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  opacity="0.4"
                  d="M0 8H18V17C18 19.2091 16.2091 21 14 21H4C1.79086 21 0 19.2091 0 17V8Z"
                  fill="#293B75"
                />
                <path
                  d="M14 2.5H4C1.79086 2.5 0 4.29086 0 6.5V8H18V6.5C18 4.29086 16.2091 2.5 14 2.5Z"
                  fill="#293B75"
                />
                <path
                  opacity="0.4"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5 0.25C5.41421 0.25 5.75 0.585786 5.75 1V4C5.75 4.41421 5.41421 4.75 5 4.75C4.58579 4.75 4.25 4.41421 4.25 4V1C4.25 0.585786 4.58579 0.25 5 0.25ZM13 0.25C13.4142 0.25 13.75 0.585786 13.75 1V4C13.75 4.41421 13.4142 4.75 13 4.75C12.5858 4.75 12.25 4.41421 12.25 4V1C12.25 0.585786 12.5858 0.25 13 0.25Z"
                  fill="#293B75"
                />
              </svg>
            </span>
          </label>
          <div className={"flex mt-1 text-sm text-red-600 " + (dateOfBirthError ? "visible" : "invisible")}>
            <p>Please select date of birth</p>
          </div>
        </div>

        {/* GENDER  */}
        <div className="mt-4">
          <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Gender</p>
          <div className="grid grid-cols-2 gap-4">
            <div
              className={
                "flex border rounded-lg border-light-silver h-11 items-center " +
                (gender == "M" ? "bg-lavender-gray" : "")
              }
              onClick={() => onGenderSelect("M")}
            >
             <svg xmlns="http://www.w3.org/2000/svg" className="ml-3 mr-2 w-6 h-6"  viewBox="0 0 20 20">
              <circle cx="8.2" cy="11.77" r="4.45" fill="none" stroke="#666667" strokeWidth="1.2px" />
              <polyline points="12.67 3.77 16.25 3.77 16.25 7.26" fill="none" stroke="#666667" strokeWidth="1.2px" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="11.35" y1="8.62" x2="16.06" y2="3.92" fill="none" stroke="#666667" strokeWidth="1.2px" strokeLinecap="round" strokeLinejoin="round" />
             </svg>
              <p className="leading-4 w-3/5">Male</p>
              <svg
                className={
                  "h-6 w-6 " + (gender == "M" ? "visible" : "invisible")
                }
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_316_19841)">
                  <path
                    d="M7 12L10.3333 15L17 9"
                    stroke="#293B75"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_316_19841">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div
              className={
                "flex border rounded-lg border-light-silver h-11 items-center " +
                (gender == "F" ? "bg-lavender-gray" : "")
              }
              onClick={() => onGenderSelect("F")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-3 mr-2 w-6 h-6" viewBox="0 0 20 20">
                <circle cx="8.27" cy="11.73" r="4.52" fill="none" stroke="#666667" strokeWidth="1.2px" />
                <line x1="11.47" y1="8.53" x2="16.25" y2="3.75" fill="none" stroke="#666667" strokeWidth="1.2px" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="13" y1="3.8" x2="16.2" y2="7" fill="none" stroke="#666667" strokeWidth="1.2px" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="leading-4 w-3/5">Female</p>
              <svg
                className={
                  "h-6 w-6 " + (gender == "F" ? "visible" : "invisible")
                }
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_316_19842)">
                  <path
                    d="M7 12L10.3333 15L17 9"
                    stroke="#293B75"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_316_19842">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div
              className={
                "flex border rounded-lg border-light-silver h-11 items-center " +
                (gender == "O" ? "bg-lavender-gray" : "")
              }
              onClick={() => onGenderSelect("O")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-3 mr-2 w-6 h-6" viewBox="0 0 20 20"  fill="none" stroke="#666667" strokeWidth="1.2px">
                <g>
                  <circle cx="8.2" cy="11.77" r="4.45" />
                  <polyline points="12.67 3.77 16.25 3.77 16.25 7.26"  strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="11.35" y1="8.62" x2="16.06" y2="3.92"  strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <line x1="11.35" y1="5.3" x2="14.49" y2="8.44"  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="leading-4 w-3/5">Others</p>
              <svg
                className={
                  "h-6 w-6 " + (gender == "O" ? "visible" : "invisible")
                }
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_316_19843)">
                  <path
                    d="M7 12L10.3333 15L17 9"
                    stroke="#293B75"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_316_19843">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
              <div className={"flex mt-1 text-sm text-red-600 " + (genderError ? "visible" : "invisible")}>
                <p>Please select gender</p>
              </div>
        </div>

        {/* PINCODE  */}
        <div className="mt-4" ref={inputPincode}>
          <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Current residence pincode</p>
          <label className="relative block">
            <input
              onFocus={()=>{inputPincode.current?.scrollIntoView()}}
              name="pin_code"
              placeholder="Enter pincode"
              autoComplete="off"
              value={pincode}
              maxLength={6}
              onChange={(event: any) => onChangePincode(event.target.value)}
              className={
                "border-2 border-background  w-full h-12 tracking-0.08 rounded-lg bg-background outline-none pl-4 pt-1 caret-primary-500 " +
                (pincodeError ? "ring-2 ring-red-600" : "focus:border-2 focus:border-primary")
              }
            ></input>
            <span className="absolute inset-y-0 right-0 flex items-center">
              <div className="text-granite-gray">
                <p className="mr-2">{!pincodeLoading && cityState}</p>

                {pincodeLoading && <Loader color="#2c3d6f" />}
              </div>
            </span>
          </label>
          <div className={"flex mt-1 gap-1 text-sm text-red-600 " + (pincodeError ? "visible" : "invisible")}>
            <p> {pincodeErrorMessage}</p>
          </div>
        </div>
      </div>

      {/* STICKEY BUTTON  */}
      <div className="fixed-button bg-cultured max-w-md">
        <button
          className={
            "h-14 w-full rounded-lg bg-primary text-white font-bold text-lg max-w-md " +
            (nextLoading || pincodeLoading ? "opacity-90 cursor-not-allowed" : "")
          }
          onClick={() => onClickNextBasicDetails()}
          disabled={nextLoading || pincodeLoading}
        >
          {!nextLoading && <p>NEXT</p>}

          {nextLoading && <Loader />}
        </button>
      </div>

      {/* DATEPICKER OVERLAY  */}
      <BottomSheet
        showClose={true}
        defaultVisible={showDatepicker}
        heading=""
        onVisible={(status) => { 
          setShowDatepicker(status)
          setConfirmButtonClicked(false)
        }}
        height={320}
        isDraggable={false}
      >
        <div className="mx-6 w-full md:w-90 md:mx-auto">
          <DatePicker
            setDateOfBirth={onSelectDob}
            showDatePicker={showDatepicker}
            confirmButtonClicked={confirmButtonClicked}
            minYear={20}
          />
          <div className="mt-4 mx-6 flex justify-center">
            <button
              className="h-14 w-full rounded-lg bg-primary text-white font-bold text-lg max-w-md"
              onClick={() => onClickConfirmDate()}
            >
              CONFIRM
            </button>
          </div>
        </div>
      </BottomSheet>

    </div>
  )
}
export default BasicDetail
