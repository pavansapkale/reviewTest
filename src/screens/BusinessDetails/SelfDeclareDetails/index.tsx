import { useContext, useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { complete, completeFetchNext, fetchNext, fetchVariable } from "../../../apis/resource"
import DatePicker from "../../../components/DatePicker"
import { RootContext } from "../../../utils/RootContext"
import { getUrlByScreenName } from "../../../utils/Routing"

import Loader from "../../../components/Loader"
import bureauFetch from "../../../assets/svg/fetching-your-statement.svg"
import bureauDone from "../../../assets/svg/analysis.svg"
import bankingRequired from "../../../assets/svg/fetching-offer.svg"
import offerGenerated from "../../../assets/svg/fetching-offer.svg"
import applicationRejected from "../../../assets/svg/fetching-offer.svg"
import errorImage from "../../../assets/svg/service-down.svg"
import BottomSheet from "../../../components/BottomSheet"

type typeSanctionStatusImageMap = {
    "BUREAU_FETCH": string,
    "BUREAU_DONE": string,
    "BANKING_REQUIRED": string,
    "OFFER_GENERATED": string,
    "APPLICATION_REJECTED": string,
    "ERROR": string,
}

const SelfDeclareDetails = (props: { stage: string }) => {
    const [sessionData, sessionDispatch] = useContext(RootContext)

    const navigate = useNavigate()
    const { state } = useLocation()

    const annualTurnover = state?.variables?.annual_turnover_list ? state?.variables?.annual_turnover_list : []
    const industryType = state?.variables?.industry_type_list ? state?.variables?.industry_type_list : []

    //PREFILL VARIABLES
    const prefillTradeName = state?.variables?.trade_name
    const prefillTurnover = state?.variables?.turnover
    const prefillIndustryType = state?.variables?.industry_type
    const prefillBusinessPincode = state?.variables?.business_pincode
    const prefillBusinessAddress = state?.variables?.business_address
    const prefillBusinessDateOfIncorporation = state?.variables?.date_of_incorporation_dd_mm_yyyy

    const [isSanctionLoading, setIsSanctionLoading] = useState(false)
    const [businessDeclaredInfoScreenTaskId, setBusinessDeclaredInfoScreenTaskId] = useState(state?.variables?.task_id)

    const [isTurnoverOverlayOpen, setIsTurnOverlayOpen] = useState(false)
    const [turnOverSearchValue, setTurnoverSearchValue] = useState("")
    const [filteredTurnoverData, setFilteredTurnoverData] = useState(annualTurnover)
    const [selectedTurnover, setSelectedTurnover] = useState("")

    const [isIndustryTypeOverlayOpen, setIsIndustryTypeOverlayOpen] = useState(false)
    const [industryTypeSearchValue, setIndustryTypeSearchValue] = useState("")
    const [filteredIndustryTypeData, setFilteredIndustryTypeData] = useState(industryType)
    const [selectedIndustryType, setSelectedIndustryType] = useState("")

    const inputTurnover = useRef<HTMLInputElement>(null)
    const inputIndustryType = useRef<HTMLInputElement>(null)

    const [turnoverError, setTurnoverError] = useState(false)
    const [turnoverErrorMessage, setTurnoverErrorMessage] = useState("")
    const [industryTypeError, setIndustryTypeError] = useState(false)
    const [industryTypeErrorMessage, setIndustryTypeErrorMessage] = useState("")

    const [address, setAddress] = useState("")
    const [addressError, setAddressError] = useState(false)
    const [addressErrorMessage, setAddressErrorMessage] = useState("")

    const [tradeName, setTradeName] = useState("")
    const [tradeNameError, setTradeNameError] = useState(false)
    const [tradeNameErrorMessage, setTradeNameErrorMessage] = useState("")

    const [dateOfIncorporation, setDateOfIncorporation] = useState("")
    const [dateOfIncorporationToShow, setDateOfIncorporationToShow] = useState("")
    const [showDatepicker, setShowDatepicker] = useState(false)
    const [dateOfIncorporationError, setDateOfIncorporationError] = useState(false)

    const [pincode, setPincode] = useState("")
    const [cityState, setCityState] = useState("")
    const [pincodeError, setPincodeError] = useState(false)
    const [isPincodeInvalid, setIsPincodeInvalid] = useState(false)
    const [pincodeErrorMessage, setPincodeErrorMessage] = useState("")
    const inputPincode = useRef<HTMLInputElement>(null)

    const [nextLoading, setNextLoading] = useState(false)
    const [pincodeLoading, setPincodeLoading] = useState(false)
    const [confirmButtonClicked, setConfirmButtonClicked] = useState(false)

    const [applicationStatus, setApplicationStatus] = useState<string>("")
    const [applicationStatusMessage, setApplicationStatusMessage] = useState("We are working on your request")

    const [requiredLoanAmount, setRequiredLoanAmount] = useState("")
    const [requiredLoanAmountError, setRequiredLoanAmountError] = useState(false)
    const [requiredLoanAmountErrorMessage, setRequiredLoanAmountErrorMessage] = useState("")


    useEffect(() => {
        initialFetchVariable()
        if (prefillTradeName) {
            setTradeName(prefillTradeName)
        }
        if (prefillTurnover) {
            setSelectedTurnover(prefillTurnover)
        }
        if (prefillIndustryType) {
            setSelectedIndustryType(prefillIndustryType)
        }
        if (prefillBusinessPincode) {
            onChangePincode(prefillBusinessPincode)
        }
        if (prefillBusinessAddress) {
            setAddress(prefillBusinessAddress)
        }
        if (prefillBusinessDateOfIncorporation) {
            setDateOfIncorporation(prefillBusinessDateOfIncorporation)
            onSelectDob(prefillBusinessDateOfIncorporation)
        }
    }, [])

    const initialFetchVariable = async () => {
        await fetchVariable("business_details_submitted").then(async (response) => {
            if (response.status === 200) {
                if (response.data.data.is_present) {
                    if (response.data.data.business_details_submitted) {
                        fetchApplicationStatus()
                    }
                } else {
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

    const sanctionStatusImageMap: typeSanctionStatusImageMap = {
        "BUREAU_FETCH": bureauFetch,
        "BUREAU_DONE": bureauDone,
        "BANKING_REQUIRED": bankingRequired,
        "OFFER_GENERATED": offerGenerated,
        "APPLICATION_REJECTED": applicationRejected,
        "ERROR": errorImage,
    }

    const onSelectTurnover = (item: string) => {
        setSelectedTurnover(item)
        setTurnoverError(false)
        setIsTurnOverlayOpen(false)
    }

    const onClickTurnOverInput = () => {
        setIsTurnOverlayOpen(true)
        setFilteredTurnoverData(annualTurnover)
        setTurnoverSearchValue("")
        setTurnoverError(false)
        setTurnoverErrorMessage("")
    }

    const onSelectIndustryType = (item: string) => {
        setSelectedIndustryType(item)
        setIndustryTypeError(false)
        setIsIndustryTypeOverlayOpen(false)
    }

    const onClickIndustryTypeInput = () => {
        setIsIndustryTypeOverlayOpen(true)
        setFilteredIndustryTypeData(industryType)
        setIndustryTypeSearchValue("")
        setIndustryTypeError(false)
        setIndustryTypeErrorMessage("")
    }

    const validate = () => {
        const pinCodeRegx = /^[1-9]{1}[0-9]{5}$/

        setTradeNameError(false)
        setAddressError(false)
        setPincodeError(false)
        setDateOfIncorporationError(false)

        if (tradeName.trim().length < 1) {
            setTradeNameError(true)
            setTradeNameErrorMessage("Please enter trade name")
            return false
        }

        if (tradeName === "") {
            setTradeNameError(true)
            setTradeNameErrorMessage("Please enter trade name")
            return false
        }

        if (tradeName.length > 100) {
            setTradeNameError(true)
            setTradeNameErrorMessage("Please enter trade name within 100 characters")
            return false
        }

        if (dateOfIncorporation === "") {
            setDateOfIncorporationError(true)
            return false
        }

        if (address.trim().length < 1) {
            setAddressError(true)
            setAddressErrorMessage("Please enter address")
            return false
        }

        if (address.trim().length < 10) {
            setAddressError(true)
            setAddressErrorMessage("Please enter at least 10 character address")
            return false
        }

        if (address === "") {
            setAddressError(true)
            setAddressErrorMessage("Please enter address")
            return false
        }

        if (address.length > 240) {
            setAddressError(true)
            setAddressErrorMessage("Please enter trade name within 240 characters")
            return false
        }

        if (isPincodeInvalid) {
            inputPincode.current?.scrollIntoView()
            setPincodeError(true)
            return false
        }

        if (!pinCodeRegx.test(pincode) && pincode.length < 6) {
            inputPincode.current?.scrollIntoView()
            setPincodeError(true)
            setPincodeErrorMessage("Please enter a valid pincode")
            return false
        }
        if (selectedTurnover === "") {
            inputTurnover.current?.scrollIntoView()
            setTurnoverError(true);
            setTurnoverErrorMessage("Please select annual turnover");
            return false;
        }
        if (selectedIndustryType === "") {
            inputIndustryType.current?.scrollIntoView()
            setIndustryTypeError(true);
            setIndustryTypeErrorMessage("Please select industry type");
            return false;
        }

        if (requiredLoanAmount === "") {
            setRequiredLoanAmountErrorMessage("Please enter required loan amount")
            setRequiredLoanAmountError(true)
            return false;
        }
        if (Number(requiredLoanAmount) < 1000 || Number(requiredLoanAmount) > 10000000) {
            setRequiredLoanAmountErrorMessage("Please enter required loan amount in between 1,000 to 1,00,00,000")
            setRequiredLoanAmountError(true)
            return false;
        }

        return true
    }

    const redirectToOffer = async () => {
        await fetchNext(props.stage).then((response) => {
            let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
            navigate(redirectTo, {
                state: {
                    variables: response.data.data, //TO SEND DATA NEXT SCREEN
                },
                replace: true
            })
        }).catch((error) => {
            if (error) {
                if (error.status === 401 || error.status === 403) {
                    sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
                }
            }
        })
    }

    //FETCH APPLICATION SANCTION STATUS
    //possible sanction_status = [ "BUREAU_FETCH", "BUREAU_DONE", "BANKING_REQUIRED", "OFFER_GENERATED", "APPLICATION_REJECTED" ]
    const fetchApplicationStatus = async () => {
        setIsSanctionLoading(true)
        fetchVariable("sanction_status").then(async (response) => {
            if (response.status === 200) {
                if (response.data.data.is_present) {
                    setApplicationStatus(response.data.data.sanction_status.code)
                    setApplicationStatusMessage(response.data.data.sanction_status.message)
                    if (response.data.data.sanction_status.code === "BANKING_REQUIRED" || response.data.data.sanction_status.code === "OFFER_GENERATED" || response.data.data.sanction_status.code === "APPLICATION_REJECTED" || response.data.data.sanction_status.code === "ERROR") {
                        setTimeout(() => {
                            redirectToOffer()
                        }, 3000)
                    } else {
                        // RECURSSION
                        setTimeout(() => {
                            fetchApplicationStatus()
                        },
                            5000)
                    }
                } else {
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

    const onClickSubmit = async () => {
        if (validate()) {
            setNextLoading(true)

            const variables = {
                in_tradeName: tradeName,
                in_date_of_incorporation: dateOfIncorporation,
                in_address: address.replace(/[\n]+/g, ' '),
                in_business_pincode: pincode,
                in_selected_annual_income: selectedTurnover,
                in_selected_industry_type: selectedIndustryType,
                in_fetch_business_pincode: false,
                in_constitution_type: "Proprietorship",
                in_required_loan_amount: Number(requiredLoanAmount)
            }

            await complete(businessDeclaredInfoScreenTaskId, variables).then((response) => {
                fetchApplicationStatus()
            }).catch((error) => {
                if (error) {
                    if (error.status === 401 || error.status === 403) {
                        sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
                    }
                }
            })
            setNextLoading(false)
        }
    }

    //DATE
    const onClickDate = () => {
        setDateOfIncorporationError(false)
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
                        in_business_pincode: pin_code,
                        in_fetch_business_pincode: true,
                    }).then((response) => {
                        setBusinessDeclaredInfoScreenTaskId(response.data.data.task_id)
                        if (response.data.data.business_pincode_verified) {
                            const pincode_data = response.data.data.business_pincode_data
                            setCityState(pincode_data.city + ", " + pincode_data.stateCode)
                        } else {
                            if (response.data.data.task_name !== "businessDeclaredInfoScreen") {
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
                            setPincodeErrorMessage(response.data.data.business_pincode_message)
                            setIsPincodeInvalid(true)
                        }
                    }).catch((error) => {
                        if (error) {
                            setCityState("")
                            setPincodeError(true)
                            setPincodeErrorMessage(error.data.message)
                            setIsPincodeInvalid(true)
                            if (error.status === 401 || error.status === 403) {
                                sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
                            }
                        } else {
                            setPincode("")
                        }
                    })
                    setPincodeLoading(false)
                }
            }
        }
    }

    const onSelectDob = (dob: any) => {
        setDateOfIncorporation(dob)
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

        let month = Number(dobArray[1]) - 1

        let newDateToShow = dobArray[0] + " " + monthList[month] + " " + dobArray[2]
        setDateOfIncorporationToShow(newDateToShow)
    }

    //ADDRESS
    const onChangeAddress = (address: string) => {
        const addressRegex = /^[a-zA-Z0-9., '/#@&-]+$/
        setAddressError(false)
        if (addressRegex.test(address) || address === "") {
            let formattedAddress = address.replace(/[\n]+/g, ' ')
            if (formattedAddress.length <= 240) {
                setAddress(formattedAddress)
            }
        }
    }

    const onChangeTradeName = (tradeName: string) => {
        const tradeNameRegex = /^[a-zA-Z0-9#-/ ]+$/
        setTradeNameError(false)
        if ((tradeNameRegex.test(tradeName) || tradeName === "") && tradeName.length <= 100) {
            setTradeName(tradeName)
        }
    }

    const onChangeRequiredLoanAmount = (value: string) => {
        const pattern = /^[0-9]+$/
        setRequiredLoanAmountError(false)
        if (pattern.test(value) || value === "") {
            setRequiredLoanAmount(value)
        }
    }

    return (
        <div>
            {!isSanctionLoading &&
                <div className="mt-2">
                    <div className="p-5 pb-24">
                        <h1 className="mb-8 font-bold text-2xl items-center mt-5 -tracking-0.08">
                            Business details
                        </h1>

                        {/* TRADE NAME  */}
                        <div className="flex flex-col pb-4">
                            <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Trade Name</p>
                            <label className="relative block">
                                <input
                                    type="text"
                                    name="trade_name"
                                    placeholder="Enter trade name"
                                    autoComplete="off"
                                    onChange={(event: any) => onChangeTradeName(event.target.value)}
                                    value={tradeName}
                                    className={"border-2 border-background w-full h-12 tracking-wider rounded-lg bg-background outline-none pl-4 pt-1 caret-primary-500 " + (tradeNameError ? "ring-2 ring-red-600" : "focus:border-2 focus:border-primary")}
                                ></input>
                            </label>
                            <div className={"flex mt-1 text-red-600 " + (tradeNameError ? "visible" : "invisible")}>
                                <p>{tradeNameErrorMessage}</p>
                            </div>
                        </div>

                        {/* DATE OF INCORPORATION  */}
                        <div className="flex flex-col pb-4">
                            <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Date of incorporation</p>
                            <label className="relative block">
                                <input
                                    type="text"
                                    name="dob"
                                    placeholder="Select date of incorporation"
                                    autoComplete="off"
                                    contentEditable="false"
                                    defaultValue={dateOfIncorporationToShow}
                                    onClick={() => onClickDate()}
                                    readOnly={true}
                                    className={
                                        "border-2 border-background w-full h-12 tracking-0.08 rounded-lg bg-background outline-none pl-4 pt-1 caret-primary-500 " + (dateOfIncorporationError ? "ring-2 ring-red-600" : "focus:border-2 focus:border-primary")
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
                            <p className="flex mt-1 text-xs justify-end text-granite-gray">as per document</p>
                            <div className={"flex mt-1 text-sm text-red-600 " + (dateOfIncorporationError ? "visible" : "invisible")}>
                                <p>Please select date of incorporation</p>
                            </div>
                        </div>

                        {/* ADDRESS  */}
                        <div className="flex flex-col pb-4">
                            <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Business address</p>
                            <textarea
                                onChange={(event: any) => onChangeAddress(event.target.value)}
                                name="address" autoComplete="off"
                                value={address}
                                className={"border-2 border-background w-full tracking-wider rounded-lg bg-background outline-none pl-4 pt-1 caret-primary-500 " + (addressError ? "ring-2 ring-red-600" : "focus:border-2 focus:border-primary")}
                            ></textarea>
                            <div className={"flex mt-1 text-red-600 " + (addressError ? "visible" : "invisible")}>
                                <p>{addressErrorMessage}</p>
                            </div>
                        </div>

                        {/* BUSINESS PINCODE  */}
                        <div className="flex flex-col pb-4" ref={inputPincode}>
                            <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Business pincode</p>
                            <label className="relative block">
                                <input
                                    onFocus={() => { inputPincode.current?.scrollIntoView() }}
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

                        {/* CONSTITUTION TYPE  */}
                        <div className="flex flex-col pb-4">
                            <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Constitution type</p>
                            <label className="relative block">
                                <input
                                    type="text"
                                    name="constitution_type"
                                    placeholder="Enter trade name"
                                    autoComplete="off"
                                    contentEditable={false}
                                    disabled={true}
                                    value="Proprietorship"
                                    className={"border-2 border-background w-full h-12 tracking-wider rounded-lg bg-background outline-none pl-4 pt-1 caret-primary-500"}
                                ></input>
                            </label>
                        </div>

                        {/* ANNUAL TERNOVER LIST DROPDOWN  */}
                        <div className="flex flex-col pb-4" ref={inputTurnover}>
                            <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">
                                Annual turnover
                            </p>
                            <div className="relative w-full">
                                <div
                                    onClick={onClickTurnOverInput}
                                    className={"flex items-center rounded-lg px-2 w-full justify-between bg-background h-12"}
                                >
                                    <input
                                        className={"bg-background items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08 text-granite-gray outline-none "}
                                        placeholder="Select Turnover"
                                        value={selectedTurnover}
                                        readOnly={true}
                                        onFocus={() => { inputTurnover.current?.scrollIntoView({ inline: "center" }) }}
                                    />
                                    <svg
                                        className="mr-2"
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
                                    </svg>
                                </div>
                            </div>
                            <div className={"flex mt-1 text-red-600 " + (turnoverError ? "visible" : "invisible")}>
                                <p>{turnoverErrorMessage}</p>
                            </div>
                        </div>

                        {/* INDUSTRY TYPE LIST DROPDOWN  */}
                        <div className="flex flex-col pb-4" ref={inputIndustryType}>
                            <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">
                                Industry type
                            </p>
                            <div className="relative w-full">
                                <div
                                    onClick={onClickIndustryTypeInput}
                                    className={"flex items-center rounded-lg px-2 w-full justify-between bg-background h-12 " + (industryTypeError ? "ring-2 ring-red-600" : " focus:border-2 focus:border-primary")}
                                    onFocus={() => { inputIndustryType.current?.scrollIntoView({ inline: "center" }) }}
                                >
                                    <input
                                        className="bg-background items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08 text-granite-gray outline-none"
                                        placeholder="Select industry type"
                                        value={selectedIndustryType}
                                        readOnly={true}
                                    />
                                    <svg
                                        className="mr-2"
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
                                    </svg>
                                </div>
                            </div>
                            <div className={"flex mt-1 text-red-600 " + (industryTypeError ? "visible" : "invisible")}>
                                <p>{industryTypeErrorMessage}</p>
                            </div>
                        </div>

                        {/* REQUIRED LOAN AMOUNT */}
                        <div className="flex flex-col pb-4">
                            <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Required loan amount</p>
                            <label className="relative rounded-lg bg-background focus-within:text-gray-600 block">
                                <input
                                    data-openreplay-obscured
                                    onChange={(event: any) => onChangeRequiredLoanAmount(event.target.value)}
                                    type="text" name="pan_number" placeholder="Required loan amount" autoComplete="off"
                                    value={requiredLoanAmount}
                                    className={"border-2 border-background w-full h-12 tracking-wider rounded-lg bg-background outline-none pl-4 pt-1 caret-primary-500 " + (requiredLoanAmountError ? "ring-2 ring-red-600" : "focus:border-2 focus:border-primary")}
                                ></input>
                            </label>
                            <div className={"flex mt-1 text-red-600 " + (requiredLoanAmountError ? "visible" : "invisible")}>
                                <p>{requiredLoanAmountErrorMessage}</p>
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
                            onClick={() => onClickSubmit()}
                            disabled={nextLoading || pincodeLoading}
                        >
                            {!nextLoading && <p>SUBMIT</p>}

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

                    {/* ANUUAL TURNOVER  */}
                    <BottomSheet
                        showClose={true}
                        defaultVisible={isTurnoverOverlayOpen}
                        heading=""
                        onVisible={(status) => { setIsTurnOverlayOpen(status) }}
                        height={400}
                    >
                        <div className="w-full max-w-md">
                            <h1 className="font-bold text-2xl text-center">
                                Annual turnover
                            </h1>

                            {/* LIST OF ANNUAL TURNOVER */}
                            <div>
                                <ul
                                    className="divide-y divide-light-silver h-screen overflow-auto pb-96"
                                >
                                    {filteredTurnoverData &&
                                        filteredTurnoverData.map((item: string) => {
                                            return (
                                                <li
                                                    className="py-2 px-2 my-2"
                                                    key={item}
                                                    onClick={() => { onSelectTurnover(item) }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5/6">
                                                            <p className="leading-5.5 tracking-0.08 truncate">
                                                                {item}
                                                            </p>
                                                        </div>
                                                        <div className="w-1/6">
                                                            <div className={"float-right " + ((selectedTurnover == item) && (isTurnoverOverlayOpen) ? "visible" : "hidden")}>
                                                                {/* CHECKMARK  */}
                                                                {((selectedTurnover == item) && (selectedTurnover)) &&
                                                                    <svg width="20" viewBox="0 0 14 10" fill="none">
                                                                        <path d="M2 5L5.33333 8L12 2" stroke="#293B75" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            )
                                        })}

                                    {filteredTurnoverData?.length === 0 &&
                                        <div className="mt-4">
                                            No Turnover available with "<b>{turnOverSearchValue}</b>"
                                            <p className="text-sm text-granite-gray">Please try again</p>
                                        </div>
                                    }
                                </ul>
                            </div>
                        </div>
                    </BottomSheet>

                    {/* INDUSTRY TYPE  */}
                    <BottomSheet
                        showClose={true}
                        defaultVisible={isIndustryTypeOverlayOpen}
                        heading=""
                        onVisible={(status) => { setIsIndustryTypeOverlayOpen(status) }}
                        height={400}
                    >
                        <div className="w-full max-w-md">
                            <h1 className="font-bold text-2xl text-center">
                                Industry type
                            </h1>

                            {/* LIST OF INDUSTRY TYPES */}
                            <div>
                                <ul
                                    className="divide-y divide-light-silver h-screen overflow-auto pb-96"
                                >
                                    {filteredIndustryTypeData &&
                                        filteredIndustryTypeData.map((item: string) => {
                                            return (
                                                <li
                                                    className="py-2 px-2 my-2"
                                                    key={item}
                                                    onClick={() => {
                                                        onSelectIndustryType(item)
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5/6">
                                                            <p className="leading-5.5 tracking-0.08 truncate">
                                                                {item}
                                                            </p>
                                                        </div>
                                                        <div className="w-1/6">
                                                            <div className={"float-right " + ((selectedIndustryType == item) && (isIndustryTypeOverlayOpen) ? "visible" : "hidden")}>
                                                                {/* CHECKMARK  */}
                                                                {((selectedIndustryType == item) && (selectedIndustryType)) &&
                                                                    <svg width="20" viewBox="0 0 14 10" fill="none">
                                                                        <path d="M2 5L5.33333 8L12 2" stroke="#293B75" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            )
                                        })}

                                    {filteredIndustryTypeData?.length === 0 &&
                                        <div className="mt-4">
                                            No Industry type available with "<b>{industryTypeSearchValue}</b>"
                                            <p className="text-sm text-granite-gray">Please try again</p>
                                        </div>
                                    }
                                </ul>
                            </div>
                        </div>
                    </BottomSheet>


                </div>
            }
            {/* LOADING OFFER OVERLAY  */}
            <div
                className={
                    "z-50 absolute inset-x-0 bottom-0 flex justify-center h-screen bg-cultured hide-after-5-sec " + (isSanctionLoading ? "" : "hidden")
                }
            >
                <div className=" absolute flex flex-col gap-4 h-screen w-screen items-center justify-center md:max-w-md z-30">
                    <div className=" flex flex-col justify-center">
                        <img
                            className="w-2/5 mx-auto"
                            src={
                                // @ts-ignore
                                sanctionStatusImageMap[applicationStatus]
                            }
                        />
                        <div>
                            <Loader color="#2c3d6f" />
                        </div>
                        <p className="leading-5.5 tracking-0.08 text-black text-center">
                            {applicationStatusMessage}
                        </p>
                        <p className="leading-5.5 tracking-0.08 text-black text-center">
                            Please do not refresh page
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default SelfDeclareDetails