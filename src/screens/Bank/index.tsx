import AxisBankIcon from "../../assets/svg/axis-bank-icon.svg"
import IciciBankIcon from "../../assets/svg/icici-bank-icon.svg"
import HdfcBankIcon from "../../assets/svg/hdfc-bank-icon.svg"
import StateBankIcon from "../../assets/png/state-bank-logo.png"
import UnionBankIcon from "../../assets/png/union-bank-of-india-logo.png"
import KotakBankIcon from "../../assets/png/kotak-bank-logo.png"

import AccountAggregatorSvg from "../../assets/svg/account-aggregator.svg"
import NetBankingIcon from "../../assets/svg/net-banking.svg"

import { useNavigate } from "react-router-dom"
import { useState, useEffect, useContext } from "react"
import { Player } from "@lottiefiles/react-lottie-player"
import { RootContext } from "../../utils/RootContext"
import { completeFetchNext, fetchAllBankList, fetchNext } from "../../apis/resource"
import { getUrlByScreenName } from "../../utils/Routing"

import Loader from "../../components/Loader"
import spinner from "../../assets/svg/spinner.svg"
import LottieLoader from "../../assets/lottie/loader.json"

import BottomSheet from "../../components/BottomSheet"
import { generateFlagOnPercent } from "../../utils/Functions"

type bankListType = [{
  code: string,
  name: string 
}] | []

const Bank = (props: { stage: string }) => {
  const CBM_FLOW_PERCENT = import.meta.env.VITE_APP_CBM_FLOW_PERCENT
  
  const [ sessionData, sessionDispatch ] = useContext(RootContext)
  const navigate = useNavigate()

  const [ isBottomSheetVisible, setIsBottomSheetVisible ] = useState(false)
  const [ selectedBankName, setSelectedBankName ] = useState("")
  const [ bankSearchValue, setBankSearchValue ] = useState("")
  const [ isBankSelectLoading, setIsBankSelectLoading ] = useState(false)
  const [ isNetBankingAvailable, setIsNetBankingAvailable ] = useState(false)
  const [ isAccountAgreegatorAvailable, setIsAccountAgreegatorAvailable ] = useState(false)
  const [isEStatementAvailable,setIsEStatementAvailable]=useState(false)
  const [ isFetchingBankListLoading, setIsFetchingBankListLoading ] = useState(false)
  const [ isBankOptionLoading, setIsBankOptionLoading ] = useState(false)

  const [selectedBank, setSelectedBank] = useState({
    code: "",
    name: "",
  })

  const [isBankSelected, setIsBankSelected] = useState(false)

  const topBankList = [
    { icon: AxisBankIcon, bankName: "Axis Bank", code:"UTIB" },
    { icon: HdfcBankIcon, bankName: "HDFC Bank", code:"HDFC" },
    { icon: IciciBankIcon, bankName: "ICICI Bank", code:"ICIC" },
    { icon: StateBankIcon, bankName: "State Bank of India", code:"SBIN" },
    { icon: KotakBankIcon, bankName: "Kotak Mahindra Bank", code:"KKBK" },
    { icon: UnionBankIcon, bankName: "Union Bank of India", code:"UBIN" },
  ]

  const [data, setData] = useState<bankListType>()

  const [filteredData, setFilteredData] = useState<bankListType>()
  const [statusBankFeched, setStatusBankFetched] = useState("FETCHING") //[FETCHING, FETCHED, ERROR]

  const [redirection, setRedirection] = useState(false)
  const [isBankSelectable, setIsBankSelectable] = useState(true)
  const [initialFetchLoading, setInitialFetchLoading] = useState(true)
  const [showContinueToOffer, setShowContinueToOffer] = useState(false)

  useEffect(() => {
    getAllBanks()
    initialFetch()
  }, [])

  const initialFetch = async () => {
    setInitialFetchLoading(true)
    await fetchNext(props.stage).then((response) => {
      response.data.data.offer && setShowContinueToOffer(true)
      if(response.data.data.task_name === "bankingTypeSelectScreen"){
        setIsBankSelectable(false)
        setIsAccountAgreegatorAvailable(response.data.data.account_aggregator)
        setIsNetBankingAvailable(response.data.data.netbanking)
        setIsEStatementAvailable(response.data.data.upload_statement)
        setSelectedBankName(response.data.data.selected_bank_name)
      }
      if(response.data.data.task_name === "netBankingScreen" ||  response.data.data.task_name==="eStatementUploadScreen" ||  response.data.data.task_name==="cbmScreen"){
        setRedirection(true)
        window.location.replace(response.data.data.perfios_url)
      }
      if(response.data.data.task_name === "accountAggregatorScreen"){
        setRedirection(true)
          navigate('/bank/account-aggregator', {
            state: {
                variables: response.data.data, //TO SEND DATA NEXT SCREEN
            },
            replace: true
        })
      }
    }).catch((error) => {
      if(error){
        if (error.status === 401 || error.status === 403) {
          sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
        }
      }
    })
    setInitialFetchLoading(false)
  }

  const getAllBanks = async () => {
    setIsFetchingBankListLoading(true)
    await fetchAllBankList("BANKING").then((response) => {
      setFilteredData(response.data)
      setData(response.data)
      setStatusBankFetched("FETCHED")
    }).catch((error) => {
      setStatusBankFetched("ERROR")
      if(error){
        if (error.status === 401 || error.status === 403) {
          sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
        }
      }
    })
    setIsFetchingBankListLoading(false)
  }

  const onChangeBankSearch = (bankSearchValue: string) => {
    const isCharAndDigitOnly = /^[a-zA-Z0-9#-]+$/
    if(isCharAndDigitOnly.test(bankSearchValue) || bankSearchValue === ""){
      setBankSearchValue(bankSearchValue)
      const lowerBankSearchValue = bankSearchValue.toLowerCase()
      //@ts-ignore
      const filtered: bankListType = (data ?? []).filter((item) => {
        return item.name.toLowerCase().startsWith(lowerBankSearchValue)
      })
      setFilteredData(filtered)
    }
  }

  const onClickBank = async (code: string, name: string) => {
    setIsNetBankingAvailable(false)
    setIsEStatementAvailable(false)
    setIsAccountAgreegatorAvailable(false)
    setSelectedBank({ code: code, name: name })
    setSelectedBankName(name)
    setIsBankSelectLoading(true)
    let data = {
      in_bank_selected: true,
      in_selected_bank_name: name,
      in_selected_bank_code: code,
      in_continue_with_existing_offer : false
    }

    await completeFetchNext(props.stage, data).then((response) => {
      //WILL GET MODE AVAILABLE
      setIsAccountAgreegatorAvailable(response.data.data.account_aggregator)
      setIsNetBankingAvailable(response.data.data.netbanking)
      setIsEStatementAvailable(response.data.data.upload_statement)
      setIsBottomSheetVisible(false)
      setIsBankSelected(true)
      setIsBankSelectable(false)
    }).catch((error) => {
      if(error){
        if (error.status === 401 || error.status === 403) {
          sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
        }
      }
    })
    setIsBankSelectLoading(false)
  }

  const onClickBankingOption = async (bankingType: string) => {
    setIsBankOptionLoading(true)
    let bankRedirectionUrl=""
    if(bankingType==="netbanking_fetch"){
      bankRedirectionUrl=window.location+ "/net-banking"
    }
    else if(bankingType==="statement"){
      bankRedirectionUrl=window.location+ "/e-statement"
    }
    let data = {
      in_selected_banking_type: bankingType,
      in_redirection_url: bankRedirectionUrl,
      in_continue_with_existing_offer : false,
      in_cbm_flow: generateFlagOnPercent(CBM_FLOW_PERCENT)
    }

    await completeFetchNext(props.stage, data).then((response) => {
      if(bankingType === "account_aggregator"){
          setRedirection(true)
          navigate('/bank/account-aggregator', {
            state: {
                variables: response.data.data, //TO SEND DATA NEXT SCREEN
            },
            replace: true
        })
      } else if (response.data.data.task_name === "cbmCompleted") {
        navigate('/bank/e-statement', {
          state: {
            variables: response.data.data, //TO SEND DATA NEXT SCREEN
          },
          replace: true
        })
      } else {
        setRedirection(true)
        window.location.replace(response.data.data.perfios_url)
      }
      
    }).catch((error) => {
      if(error){
        if (error.status === 401 || error.status === 403) {
          sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
        }
      }
    })
    setIsBankOptionLoading(false)
  }

  const onClickContinueWithOffer = async () =>{
    setIsBankOptionLoading(true)
    const variables = {
      in_continue_with_existing_offer : true,
      in_selected_banking_type: false
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
    setIsBankOptionLoading(false)
  }

  return (
    <div className="flex flex-col mx-5">
      {/* BANK LIST DROPDOWN  */}
      <div>
        <h1 className="mb-8 font-bold text-2xl items-center mt-5 -tracking-0.08">
          Banking details
        </h1>
        <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">
          Bank name
        </p>
        <div className={"flex py-4 gap-2 rounded-lg bg-background h-12 items-center"}>
          <div className="relative w-full">
            <div
              onClick={() => {
                  setIsBottomSheetVisible(true)
                  setFilteredData(data)
                  setBankSearchValue("")
              }}
              className="flex items-center rounded-lg px-2 w-full justify-between bg-background h-12"
            >
              <input
                className="bg-background items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08 text-granite-gray outline-none"
                placeholder="Select bank"
                value={selectedBankName}
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
        </div>
      </div>

      {(initialFetchLoading || isBankOptionLoading || isBankSelectLoading) &&
        <div className={"flex justify-center " + (isBankSelectable ||isBankOptionLoading ? "visible" : "invisible")}>
          <img className="mx-10 w-16 h-16" src={spinner} alt="content loading" />
        </div>
      }
      
      {/* TOP BANK LIST  */}
      {!initialFetchLoading &&
        <div className={(isBankSelectable) ? "visible" : "hidden"}>
          <ul className="mt-8 grid grid-cols-2 gap-4">
            {topBankList &&
              topBankList.map((item) => {
                return (
                  <li
                    key={item.bankName}
                    className="h-16 py-3 px-4 flex gap-3 items-center rounded border-light-silver border-0.25 border-solid"
                    onClick={() => {
                      onClickBank(item.code, item.bankName)
                    }}
                  >
                    <img src={item.icon} className="w-8 h-8 rounded" />
                    <p className="w-22.75 font-semibold leading-5 -tracking-0.04">
                      {item.bankName}
                    </p>
                  </li>
                )
              })}
          </ul>
        </div>
      }

      {/* BANKING OPTIONS  */}
      <div className={"mt-6 " +(!isBankSelectable ? "visible" : "hidden")}>
        <div className="flex flex-col gap-4">
          <div
            className={"flex items-center py-3 px-4 gap-4 h-20 border-light-silver border-0.25 border-solid rounded-lg " + (isAccountAgreegatorAvailable ? "visible" : "hidden")}
            onClick={() => {
              onClickBankingOption("account_aggregator")
            }}
          >
            <img src={AccountAggregatorSvg} className="w-14" />
            <div className="flex flex-col p-0 h-14 w-53.5">
              <p className=" font-semibold leading-5 -tracking-0.04">
                Account Aggregator
              </p>
              <p className=" mt-1 text-xs tracking-0.08 text-granite-gray">
                OTP based, no credentials required
              </p>
            </div>
            <div className="flex bg-primary h-8 w-8 rounded-full border-2 border-shadow-blue ml-auto">
              <svg
                className="m-auto"
                width="16"
                height="18"
                viewBox="0 0 16 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.8933 8.49333C15.8299 8.32967 15.7347 8.18014 15.6133 8.05333L8.94667 1.38667C8.82235 1.26235 8.67476 1.16374 8.51233 1.09645C8.3499 1.02917 8.17581 0.994545 8 0.994545C7.64493 0.994545 7.30441 1.1356 7.05333 1.38667C6.92902 1.51099 6.8304 1.65857 6.76312 1.821C6.69584 1.98343 6.66121 2.15752 6.66121 2.33333C6.66121 2.6884 6.80226 3.02893 7.05333 3.28L11.4533 7.66667H1.33333C0.979711 7.66667 0.640573 7.80714 0.390525 8.05719C0.140476 8.30724 0 8.64638 0 9C0 9.35362 0.140476 9.69276 0.390525 9.94281C0.640573 10.1929 0.979711 10.3333 1.33333 10.3333H11.4533L7.05333 14.72C6.92836 14.844 6.82917 14.9914 6.76148 15.1539C6.69379 15.3164 6.65894 15.4907 6.65894 15.6667C6.65894 15.8427 6.69379 16.017 6.76148 16.1794C6.82917 16.3419 6.92836 16.4894 7.05333 16.6133C7.17728 16.7383 7.32475 16.8375 7.48723 16.9052C7.64971 16.9729 7.82398 17.0077 8 17.0077C8.17602 17.0077 8.35029 16.9729 8.51277 16.9052C8.67525 16.8375 8.82272 16.7383 8.94667 16.6133L15.6133 9.94667C15.7347 9.81986 15.8299 9.67034 15.8933 9.50667C16.0267 9.18205 16.0267 8.81795 15.8933 8.49333Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
          <div
            className={"flex items-center py-3 px-4 gap-4 h-20  border-light-silver border-0.25 border-solid rounded-lg " + (isNetBankingAvailable ? "visible" : "hidden")}
            onClick={() => {
              onClickBankingOption("netbanking_fetch")
            }}
          >
            <img src={NetBankingIcon} className="w-14" />
            <div className="flex flex-col p-0 h-14 w-53.5">
              <p className=" font-semibold leading-5 -tracking-0.04">
                Netbanking
              </p>
              <p className=" mt-1 text-xs tracking-0.08 text-granite-gray">
                We do not store your username & password
              </p>
            </div>
            <div className="flex bg-primary h-8 w-8 rounded-full border-2 border-shadow-blue ml-auto">
              <svg
                className="m-auto"
                width="16"
                height="18"
                viewBox="0 0 16 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.8933 8.49333C15.8299 8.32967 15.7347 8.18014 15.6133 8.05333L8.94667 1.38667C8.82235 1.26235 8.67476 1.16374 8.51233 1.09645C8.3499 1.02917 8.17581 0.994545 8 0.994545C7.64493 0.994545 7.30441 1.1356 7.05333 1.38667C6.92902 1.51099 6.8304 1.65857 6.76312 1.821C6.69584 1.98343 6.66121 2.15752 6.66121 2.33333C6.66121 2.6884 6.80226 3.02893 7.05333 3.28L11.4533 7.66667H1.33333C0.979711 7.66667 0.640573 7.80714 0.390525 8.05719C0.140476 8.30724 0 8.64638 0 9C0 9.35362 0.140476 9.69276 0.390525 9.94281C0.640573 10.1929 0.979711 10.3333 1.33333 10.3333H11.4533L7.05333 14.72C6.92836 14.844 6.82917 14.9914 6.76148 15.1539C6.69379 15.3164 6.65894 15.4907 6.65894 15.6667C6.65894 15.8427 6.69379 16.017 6.76148 16.1794C6.82917 16.3419 6.92836 16.4894 7.05333 16.6133C7.17728 16.7383 7.32475 16.8375 7.48723 16.9052C7.64971 16.9729 7.82398 17.0077 8 17.0077C8.17602 17.0077 8.35029 16.9729 8.51277 16.9052C8.67525 16.8375 8.82272 16.7383 8.94667 16.6133L15.6133 9.94667C15.7347 9.81986 15.8299 9.67034 15.8933 9.50667C16.0267 9.18205 16.0267 8.81795 15.8933 8.49333Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
          <div
            className={"flex items-center py-3 px-4 gap-4 h-20  border-light-silver border-0.25 border-solid rounded-lg " + (isEStatementAvailable ? "visible" : "hidden")}
            onClick={() => {
              onClickBankingOption("statement")
            }}
          >
            <img src={AccountAggregatorSvg} className="w-14" />
            <div className="flex flex-col p-0 h-14 w-53.5">
              <p className=" font-semibold leading-5 -tracking-0.04">
                e-PDF upload
              </p>
              <p className=" mt-1 text-xs tracking-0.08 text-granite-gray">
                Original ePDFs only, No scanned statements
              </p>
            </div>
            <div className="flex bg-primary h-8 w-8 rounded-full border-2 border-shadow-blue ml-auto">
              <svg
                className="m-auto"
                width="16"
                height="18"
                viewBox="0 0 16 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.8933 8.49333C15.8299 8.32967 15.7347 8.18014 15.6133 8.05333L8.94667 1.38667C8.82235 1.26235 8.67476 1.16374 8.51233 1.09645C8.3499 1.02917 8.17581 0.994545 8 0.994545C7.64493 0.994545 7.30441 1.1356 7.05333 1.38667C6.92902 1.51099 6.8304 1.65857 6.76312 1.821C6.69584 1.98343 6.66121 2.15752 6.66121 2.33333C6.66121 2.6884 6.80226 3.02893 7.05333 3.28L11.4533 7.66667H1.33333C0.979711 7.66667 0.640573 7.80714 0.390525 8.05719C0.140476 8.30724 0 8.64638 0 9C0 9.35362 0.140476 9.69276 0.390525 9.94281C0.640573 10.1929 0.979711 10.3333 1.33333 10.3333H11.4533L7.05333 14.72C6.92836 14.844 6.82917 14.9914 6.76148 15.1539C6.69379 15.3164 6.65894 15.4907 6.65894 15.6667C6.65894 15.8427 6.69379 16.017 6.76148 16.1794C6.82917 16.3419 6.92836 16.4894 7.05333 16.6133C7.17728 16.7383 7.32475 16.8375 7.48723 16.9052C7.64971 16.9729 7.82398 17.0077 8 17.0077C8.17602 17.0077 8.35029 16.9729 8.51277 16.9052C8.67525 16.8375 8.82272 16.7383 8.94667 16.6133L15.6133 9.94667C15.7347 9.81986 15.8299 9.67034 15.8933 9.50667C16.0267 9.18205 16.0267 8.81795 15.8933 8.49333Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
          {(!isNetBankingAvailable && !isAccountAgreegatorAvailable && !isEStatementAvailable) &&
            <div className="mt-4">
              Selected bank not supporting netbanking or e-pdf
              <p className="mt-2 text-sm">Please try with diffrent bank</p>
            </div>
          }
        </div>
      </div>


      {/* OTP OVERLAY  */}
      <BottomSheet
        showClose={true}
        defaultVisible={isBottomSheetVisible}
        heading=""
        onVisible={(status) => { setIsBottomSheetVisible(status) }}
        height={600}
      >
        <div className="w-full max-w-md">
          <div>
            <div className={"mt-6 flex py-4 px-3 gap-2 rounded-lg bg-background h-12 items-center"}>
              <div className="relative w-full">
                <div
                  className="flex items-center rounded-lg py-3 w-full justify-between  bg-background h-12"
                >
                  {/* SEARCH SVG  */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M7.66683 14C11.1646 14 14.0002 11.1645 14.0002 7.66667C14.0002 4.16886 11.1646 1.33333 7.66683 1.33333C4.16903 1.33333 1.3335 4.16886 1.3335 7.66667C1.3335 11.1645 4.16903 14 7.66683 14Z" stroke="#293B75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14.6668 14.6667L13.3335 13.3333" stroke="#293B75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  <input
                    className="bg-background items-center h-12 py-3 px-4 w-full leading-5.5 tracking-0.08 text-granite-gray outline-none"
                    placeholder="Search bank"
                    value={bankSearchValue}
                    onChange={(e) => { onChangeBankSearch(e.target.value) }}
                  ></input>
                </div>
              </div>
            </div>
          </div>

          {/* LIST OF BANK  */}
          <div>
            <ul
                className="divide-y divide-light-silver h-screen overflow-auto pb-96"
              >
                {filteredData && (!isFetchingBankListLoading) &&
                  filteredData.map((item) => {
                    return (
                      <li
                        className="py-2 px-2 my-2"
                        key={item.code}
                        onClick={() => {
                          onClickBank(item.code, item.name)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5/6">
                            <p className="leading-5.5 tracking-0.08 truncate">
                              {item.name}
                            </p>
                          </div>
                          <div className="w-1/6">
                            <div className={"float-right " + ((selectedBank.code == item.code) && (isBottomSheetVisible) ? "visible" : "hidden")}>
                              {/* CHECKMARK  */}
                              { ((selectedBank.code == item.code) && (!isBankSelectLoading) && (selectedBankName)) &&
                                  <svg width="20" viewBox="0 0 14 10" fill="none">
                                    <path d="M2 5L5.33333 8L12 2" stroke="#293B75" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                              }

                              {/* LOADING  */}
                              {((selectedBank.code == item.code) && (isBankSelectLoading) && (selectedBankName)) && 
                                  <Loader color="#2C3D6F" width="30px" height="30px" />
                              }
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                })}

                {filteredData?.length === 0 &&
                  <div className="mt-4">
                    No bank available with "<b>{bankSearchValue}</b>"
                    <p className="text-sm text-granite-gray">Please try again</p>
                  </div>
                }

                {isFetchingBankListLoading && 
                  <div className="flex justify-center">
                    <img className="mx-10 w-16 h-16" src={ spinner } alt="content loading" />
                  </div>
                }
              </ul>
          </div>
        </div>
      </BottomSheet>

      {/* CONTINUE WITH EXISTING OFFER*/}
      { showContinueToOffer && !isBankOptionLoading && 
        <div className="mt-4 flex flex-col text-primary" onClick={onClickContinueWithOffer}>
            Continue with existing offer  &#8594;
        </div>
      }

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
              You are being redirected to your bank...
            </p>
            <p className="text-white">
              Please wait it may take a few seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Bank
