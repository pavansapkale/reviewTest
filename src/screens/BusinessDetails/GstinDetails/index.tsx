import { useContext, useState, useRef, useEffect } from "react"
import { complete, completeFetchNext, fetchNext, fetchVariable } from "../../../apis/resource"
import { useLocation, useNavigate } from "react-router-dom"
import { getUrlByScreenName } from "../../../utils/Routing"
import { RootContext } from "../../../utils/RootContext"

import Loader from "../../../components/Loader"
import bureauFetch from "../../../assets/svg/fetching-your-statement.svg"
import bureauDone from "../../../assets/svg/analysis.svg"
import bankingRequired from "../../../assets/svg/fetching-offer.svg"
import offerGenerated from "../../../assets/svg/fetching-offer.svg"
import applicationRejected from "../../../assets/svg/fetching-offer.svg"
import errorImage from "../../../assets/svg/service-down.svg"
import BottomSheet from "../../../components/BottomSheet"
import spinner from "../../../assets/svg/spinner.svg"

type typeSanctionStatusImageMap = {
  "BUREAU_FETCH": string,
  "BUREAU_DONE": string,
  "BANKING_REQUIRED": string,
  "OFFER_GENERATED": string,
  "APPLICATION_REJECTED": string,
  "ERROR": string,
}

const BusinessDetails = (props: { stage: string }) => {
  const [sessionData, sessionDispatch] = useContext(RootContext)
  const navigate = useNavigate()
  const { state } = useLocation()

  const gstinList = state?.variables?.gstin_list ? state?.variables?.gstin_list : []

  const annualTurnover = state?.variables?.annual_turnover_list ? state?.variables?.annual_turnover_list : []
  const industryType = state?.variables?.industry_type_list ? state?.variables?.industry_type_list : []

  const [isSanctionLoading, setIsSanctionLoading] = useState(false)

  const [submitLoading, setSubmitLoading] = useState(false)

  const [applicationStatus, setApplicationStatus] = useState<string>("")
  const [applicationStatusMessage, setApplicationStatusMessage] = useState("We are working on your request")

  const [businessInfoScreenTaskId, setBusinessInfoScreenTaskId] = useState(state?.variables?.task_id)

  const [isTurnoverOverlayOpen, setIsTurnOverlayOpen] = useState(false)
  const [turnOverSearchValue, setTurnoverSearchValue] = useState("")
  const [filteredTurnoverData, setFilteredTurnoverData] = useState(annualTurnover)
  const [selectedTurnover, setSelectedTurnover] = useState("")

  const [isIndustryTypeOverlayOpen, setIsIndustryTypeOverlayOpen] = useState(false)
  const [industryTypeSearchValue, setIndustryTypeSearchValue] = useState("")
  const [filteredIndustryTypeData, setFilteredIndustryTypeData] = useState(industryType)
  const [selectedIndustryType, setSelectedIndustryType] = useState("")

  const [isGstinOverlayOpen, setIsGstinOverlayOpen] = useState(false)
  const [gstinSearchValue, setGstinSearchValue] = useState("")
  const [filteredGstinData, setFilteredGstinData] = useState(gstinList)
  const [selectedGstin, setSelectedGstin] = useState("")

  const [isGstinDataFetched, setIsGstinDataFetched] = useState(false)
  const [isFetchingGstinData, setIsFetchingGstinData] = useState(false)

  const [gstinData, setGstinData] = useState({ companyName: "", companyAddress: "", companyRegisteredDate: "", constitutionOfBusiness: "" })

  const inputTurnover = useRef<HTMLInputElement>(null)
  const inputIndustryType = useRef<HTMLInputElement>(null)
  const inputGstin = useRef<HTMLInputElement>(null)

  const [turnoverError, setTurnoverError] = useState(false)
  const [turnoverErrorMessage, setTurnoverErrorMessage] = useState("")
  const [industryTypeError, setIndustryTypeError] = useState(false)
  const [industryTypeErrorMessage, setIndustryTypeErrorMessage] = useState("")
  const [gstinError, setGstinError] = useState(false)
  const [gstinErrorMessage, setGstinErrorMessage] = useState("")

  const [termsAndCondition, setTermsAndCondition] = useState(true)
  const [termsAndConditionError, setTermsAndConditionError] = useState(false)

  const [requiredLoanAmount, setRequiredLoanAmount] = useState("")
  const [requiredLoanAmountError, setRequiredLoanAmountError] = useState(false)
  const [requiredLoanAmountErrorMessage, setRequiredLoanAmountErrorMessage] = useState("")


  const sanctionStatusImageMap: typeSanctionStatusImageMap = {
    "BUREAU_FETCH": bureauFetch,
    "BUREAU_DONE": bureauDone,
    "BANKING_REQUIRED": bankingRequired,
    "OFFER_GENERATED": offerGenerated,
    "APPLICATION_REJECTED": applicationRejected,
    "ERROR": errorImage,
  }

  useEffect(() => {
    initialFetchVariable()
    const gstin = state?.variables?.gstin ? state?.variables?.gstin : ""
    const companyName = state?.variables?.trade_name ? state?.variables?.trade_name : ""
    const companyAddress = state?.variables?.business_address ? state?.variables?.business_address : ""
    const companyRegisteredDate = state?.variables?.registration_date ? state?.variables?.registration_date : ""
    const constitutionOfBusiness = state?.variables?.constitution_of_business ? state?.variables?.constitution_of_business : ""
    if (companyName != "" && companyAddress != "" && companyRegisteredDate != "" && constitutionOfBusiness != "" && gstin != "") {
      setIsGstinDataFetched(true)
      setSelectedGstin(gstin)
      setGstinData({ companyName: companyName, companyAddress: companyAddress, companyRegisteredDate: companyRegisteredDate, constitutionOfBusiness: constitutionOfBusiness })
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

  //VALIDATION
  const validate = () => {
    if (selectedGstin === "") {
      inputGstin.current?.scrollIntoView({ inline: "center" })
      setGstinError(true);
      setGstinErrorMessage("Please select gstin");
      return false;
    }
    if (selectedTurnover === "") {
      inputTurnover.current?.scrollIntoView({ inline: "center" })
      setTurnoverError(true);
      setTurnoverErrorMessage("Please select annual turnover");
      return false;
    }
    if (selectedIndustryType === "") {
      inputIndustryType.current?.scrollIntoView({ inline: "center" })
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

  //ON SUBMIT BUTTON CLICK
  const onClickSubmit = async () => {
    if (validate()) {
      setSubmitLoading(true)
      const variables = {
        in_fetch_gstin_details: false,
        in_selected_industry_type: selectedIndustryType,
        in_selected_annual_income: selectedTurnover,
        in_selected_gstin: selectedGstin,
        in_required_loan_amount: Number(requiredLoanAmount)
      }
      await complete(businessInfoScreenTaskId, variables).then((response) => {
        fetchApplicationStatus()
      }).catch((error) => {
        if (error) {
          if (error.status === 401 || error.status === 403) {
            sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
          }
        }
      })
      setSubmitLoading(false)
    }
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


  const onSelectGstin = async (item: string) => {
    setGstinError(false)
    setIsGstinOverlayOpen(false)
    if (item !== "" && item != selectedGstin) {
      setSelectedGstin(item)
      setIsFetchingGstinData(true)
      setIsGstinDataFetched(false)
      const variables = {
        in_fetch_gstin_details: true,
        in_selected_gstin: item,
      }
      await completeFetchNext(props.stage, variables).then((response) => {
        setIsGstinDataFetched(true)
        setGstinData({ companyName: response.data.data.trade_name, companyAddress: response.data.data.business_address, companyRegisteredDate: response.data.data.registration_date, constitutionOfBusiness: response.data.data.constitution_of_business })
        setBusinessInfoScreenTaskId(response.data.data.task_id)
      }).catch((error) => {
        if (error) {
          if (error.status === 401 || error.status === 403) {
            sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
          }
        }
      })
      setIsFetchingGstinData(false)
    }
  }

  const onClickGstinInput = () => {
    setIsGstinOverlayOpen(true)
    setFilteredGstinData(gstinList)
    setGstinSearchValue("")
    setGstinError(false)
    setGstinErrorMessage("")
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
        <>
          <div className="flex flex-col mx-5 pb-24">
            <h1 className="mb-8 font-bold text-2xl items-center mt-5 -tracking-0.08">
              Business details
            </h1>
            {/* GSTIN LIST DROPDOWN  */}

            <div className="flex flex-col pb-4" ref={inputGstin}>
              <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">
                GSTIN
              </p>
              <div className={"flex flex-col " + (isGstinDataFetched ? "border-2 border-t-0 rounded-lg border-light-silver pb-2" : "")}>
                <div className="relative w-full">
                  <div
                    onClick={onClickGstinInput}
                    className={"flex items-center rounded-lg px-2 w-full justify-between bg-background h-12 " + (gstinError ? "ring-2 ring-red-600" : " focus:border-2 focus:border-primary")}
                    onFocus={() => { inputGstin.current?.scrollIntoView({ inline: "center" }) }}
                  >
                    <input
                      className="bg-background items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08 text-granite-gray outline-none"
                      placeholder="Select gstin"
                      value={selectedGstin}
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
                <div className={"flex mt-1 text-red-600 " + (gstinError ? "visible" : "invisible")}>
                  <p>{gstinErrorMessage}</p>
                </div>
                {isFetchingGstinData && <div className="flex h-40 justify-center">
                  <img className="mx-10 w-16 h-16 my-auto" src={spinner} alt="content loading" />
                </div>}
                {/* SHOW GSTIN DETAILS  */}
                {isGstinDataFetched && <div className="px-4 py-2">
                  {/* <p className="mb-1 font-semibold">GSTIN details:</p> */}
                  <div className="flex flex-col text-xs leading-4.5 -tracking-0.06">
                    {/* <p className=" font-semibold">Company name</p> */}
                    <p> {gstinData.companyName}</p>
                  </div>
                  <div className="flex flex-col text-xs leading-4.5 -tracking-0.06 mt-1">
                    <p className=" font-semibold">Registration date</p>
                    <p>{gstinData.companyRegisteredDate}</p>
                  </div>
                  <div className="flex flex-col text-xs leading-4.5 -tracking-0.06 mt-1">
                    <p className=" font-semibold">Company address</p>
                    <p>{gstinData.companyAddress}</p>
                  </div>
                  <div className="flex flex-col text-xs leading-4.5 -tracking-0.06 mt-1">
                    <p className=" font-semibold">Constitution of business</p>
                    <p>{gstinData.constitutionOfBusiness}</p>
                  </div>

                </div>}

              </div>


            </div>

            {/* ANNUAL TERNOVER LIST DROPDOWN  */}
            <div className="flex flex-col pb-4" ref={inputTurnover}>
              <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">
                Annual turnover
              </p>
              <div className="relative w-full">
                <div
                  onClick={onClickTurnOverInput}
                  className={"flex items-center rounded-lg px-2 w-full justify-between bg-background h-12 " + (turnoverError ? "ring-2 ring-red-600" : " focus:border-2 focus:border-primary")}
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
                (submitLoading ? "opacity-90 cursor-not-allowed" : "")
              }
              onClick={() => onClickSubmit()}
              disabled={submitLoading}
            >
              {!submitLoading &&
                <p>SUBMIT</p>
              }

              {submitLoading &&
                <Loader />
              }
            </button>
          </div>


          <BottomSheet
            showClose={true}
            defaultVisible={isGstinOverlayOpen}
            heading=""
            onVisible={(status) => { setIsGstinOverlayOpen(status) }}
            height={400}
          >
            <div className="w-full max-w-md">
              <h1 className="font-bold text-2xl text-center">
                GSTIN
              </h1>
              {/* LIST OF GSTIN */}
              <div>
                <ul
                  className="divide-y divide-light-silver h-screen overflow-auto pb-96"
                >
                  {filteredGstinData &&
                    filteredGstinData.map((item: string) => {
                      return (
                        <li
                          className="py-2 px-2 my-2"
                          key={item}
                          onClick={() => {
                            onSelectGstin(item)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5/6">
                              <p className="leading-5.5 tracking-0.08 truncate">
                                {item}
                              </p>
                            </div>
                            <div className="w-1/6">
                              <div className={"float-right " + ((selectedGstin == item) && (isGstinOverlayOpen) ? "visible" : "hidden")}>
                                {/* CHECKMARK  */}
                                {((selectedGstin == item) && (selectedGstin)) &&
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

                  {filteredGstinData?.length === 0 &&
                    <div className="mt-4">
                      No Gstin available with "<b>{gstinSearchValue}</b>"
                      <p className="text-sm text-granite-gray">Please try again</p>
                    </div>
                  }
                </ul>
              </div>
            </div>
          </BottomSheet>

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
        </>
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
export default BusinessDetails
