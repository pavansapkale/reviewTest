import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { completeFetchNext, fetchNext } from "../../apis/resource"
import { getUrlByScreenName } from "../../utils/Routing"
import { RootContext } from "../../utils/RootContext"
import { AxiosResponse } from "axios"
import { getCurrentDate } from "../../utils/Functions"

import loan_agreement_acceptance from "../../assets/svg/loan_agreement_acceptance.svg"
import household_income from "../../assets/svg/household_income.svg"
import politically_exposed_person from "../../assets/svg/politically_exposed_person.svg"

import Loader from "../../components/Loader"
import BottomSheet from "../../components/BottomSheet"


const LoanAgreement = (props: { stage: string }) => {
  const [sessionData, sessionDispatch] = useContext(RootContext)
  const navigate = useNavigate()

  const [totalDisbursalAmount, setTotalDisbursalAmount] = useState("0")
  const [emiAmount, setEmiAmount] = useState("0")
  const [loanAmount, setLoanAmount] = useState("0")
  const [tenureInMonths, settenureInMonths] = useState("0")
  const [processingFee, setProcessingFee] = useState("0")
  const [interestRate, setInterestRate] = useState("0")
  const [interestPayable, setInterestPayable] = useState("0")
  const [loanAgreementPdfUrl, setLoanAgreementPdfUrl] = useState("")
  const [bpiAmount, setBpiAmount] = useState("0")
  const [annualPercentageRate, setAnnualPercentageRate] = useState(0)
  const [firstEmiDueDate, setFirstEmiDueDate] = useState("")
  const [offerDate, setOfferDate] = useState("")
  const [termsAndCondition, setTermsAndCondition] = useState(true)

  const [acceptLoading, setAcceptLoading] = useState(false)
  const [offerLoading, setOfferLoading] = useState(false)

  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    //FETCH MAIN WORKFLOW VARIABLES
    initialFetch()
  }, [])

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate
  }

  const setDefaultValues = (response: AxiosResponse) => {
    setTotalDisbursalAmount(response.data.data.total_disbursal_amount)
    setEmiAmount(response.data.data.emi_amount)
    setLoanAmount(response.data.data.loan_amount)
    settenureInMonths(response.data.data.tenure_in_months)
    setInterestRate(response.data.data.interest_in_percent)
    setProcessingFee(response.data.data.processing_fee)
    setLoanAgreementPdfUrl(response.data.data.loan_agreement_pdf_url)
    setBpiAmount(response.data.data.bpi)
    setAnnualPercentageRate(response.data.data.annual_percent_rate)
    response.data.data.disbursal_date && setOfferDate(formatDate(response.data.data.disbursal_date))
    response.data.data.first_emi_date && setFirstEmiDueDate(formatDate(response.data.data.first_emi_date))
  }

  const initialFetch = async () => {
    //INTEREST_PAYABLE_VALUE SHOULD BE CHANGED
    await fetchNext(props.stage).then(async (response) => {
      if (response.data.data.task_name === 'errorScreen') {
        let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
        navigate(redirectTo, {
          state: {
            variables: response.data.data, //TO SEND DATA NEXT SCREEN
          },
          replace: true
        })
      } else {
        let todaysDate = getCurrentDate()
        if (response.data.data.current_loan_agreement_date != todaysDate) {
          setOfferLoading(true)
          await completeFetchNext(props.stage, { in_calculate_offer: true }).then((response) => {
            setDefaultValues(response)
          }).catch((error) => {
            if (error) {
              if (error.status === 401 || error.status === 403) {
                sessionDispatch({ type: 'UPDATE', data: { sessionExpired: true } })
              }
            }
          })
          setOfferLoading(false)
        } else {
          setDefaultValues(response)
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


  const onClickAccept = async () => {
    setShowConsent(true)
  }

  const onClickConsentAgree = async () => {
    setAcceptLoading(true)
    await completeFetchNext(props.stage, { in_loan_agreement_accepted: true, in_calculate_offer: false }).then((response) => {
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
    setAcceptLoading(false)
  }

  return (
    <div className="flex flex-col">
      <div className="mx-5 pb-48">
        <p className="mb-6 font-bold text-2xl items-center flex-grow-0 mt-5 -tracking-0.08">
          Loan agreement acceptance
        </p>
        {offerLoading &&
          <div>
            <p>Updating your loan offer</p>
            <Loader />
          </div>
        }
        <div className=" flex flex-col bg-white rounded-lg">
          <div className="flex flex-col items-center">
            {/* <img
              className="w-2/5"
              src={loanAgreementImage}
            /> */}

            <p className="mt-3 mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">
              Great, Amount is sanctioned!
            </p>

            <p className=" mb-2 font-bold tracking-0.08 text-granite-gray">
              Key fact statement
            </p>
            <p className="mb-3 font-semibold text-sm leading-4.5 -tracking-0.06">
              ( Loan details as on {offerDate} )
            </p>
          </div>
          <div className="flex flex-col mx-8 text-sm leading-5.5 tracking-0.08">
            <div className="mb-2 font-semibold flex justify-between items-center">
              <p className="text-secondary">
                Loan amount
              </p>
              <p>
                ₹ {Math.round(Number(loanAmount)).toLocaleString('en-IN')}
              </p>
            </div>
            <div className=" mb-2 flex justify-between items-center">
              <p>
                Processing fee
              </p>
              <p>
                ₹ {Math.round(Number(processingFee)).toLocaleString('en-IN')}
              </p>
            </div>
            <div className=" mb-2 flex justify-between items-center">
              <p >
                EMI amount
              </p>
              <p >
                ₹ {Math.round(Number(emiAmount)).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="mb-2 flex justify-between items-center">
              <p>
                Tenure
              </p>
              <p>
                {tenureInMonths} months
              </p>
            </div>
            <div className="mb-2 flex justify-between items-center">
              <p>
                Interest rate <span className="text-xs">(reducing)</span>
              </p>
              <p>
                {Number(interestRate).toFixed(2)} %
              </p>
            </div>
            <div className="mb-2 flex justify-between items-center">
              <p>
                Annual percentage rate
              </p>
              <p >
                {annualPercentageRate} %
              </p>
            </div>
            <div className="mb-2 flex justify-between items-center">
              <p >
                Total interest payable
              </p>
              <p >
                ₹
                {Math.round((Number(emiAmount) * Number(tenureInMonths)) - (Number(loanAmount))).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="mb-2 flex justify-between items-center">
              <p>
                BPI* {" "}
                <span className="text-xs">
                  (broken period interest)
                </span>
              </p>
              <p>
                ₹ {Math.round(Number(bpiAmount)).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="mb-2 flex justify-between items-center font-semibold">
              <p className="text-secondary">
                Disbursal amount*
              </p>
              <p>
                ₹ {Math.round(Number(totalDisbursalAmount)).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="mb-2 flex justify-between items-center font-semibold">
              <p className="text-secondary">
                First EMI due date*
              </p>
              <p>
                {firstEmiDueDate}
              </p>
            </div>
            <div className="mb-2 flex justify-between items-center">
              <p>
                Total amount to be paid
              </p>
              <p>
                ₹ {Math.round(Number(emiAmount) * Number(tenureInMonths)).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="mb-2 flex justify-between items-center">
              <p>
                Repayment frequency
              </p>
              <p>
                monthly
              </p>
            </div>
            <div className="mb-2  flex justify-between items-center">
              <p>
                Number of EMIs
              </p>
              <p>
                {tenureInMonths}
              </p>
            </div>
            <div className="mb-2 flex justify-between items-center">
              <p>
                Penal charges
              </p>
              <p>
                0
              </p>
            </div>
            <div className="mb-2 flex justify-between items-center">
              <p>
                Bounce charges
              </p>
              <p>
                ₹ 750 (excl GST)
              </p>
            </div>
            <div className="mb-2 flex justify-between items-center">
              <p>
                Foreclosure charges
              </p>
              <p>
                5% of POS
              </p>
            </div>
            <div className="mb-2 flex justify-between items-center text-xs">
              <p className="flex"><span className=" text-2xl leading-3 font-medium mr-2 mt-2">* </span>may vary according to disbursement date</p>
            </div>
          </div>
        </div>
      </div>

      {/* STICKEY BUTTON  */}
      <div className="fixed-button bg-cultured max-w-md ">

        <div className="mb-8 flex justify-between items-center py-3 px-4 gap-4 h-12  border-light-silver border-0.25 border-solid rounded-lg">
          <a href={loanAgreementPdfUrl} target="_blank" className="font-bold w-52 leading-5 -tracking-0.04">
            Loan agreement

          </a>
          <a href={loanAgreementPdfUrl} target="_blank" >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.4" d="M16.4405 8.89999C20.0405 9.20999 21.5105 11.06 21.5105 15.11V15.24C21.5105 19.71 19.7205 21.5 15.2505 21.5H8.74047C4.27047 21.5 2.48047 19.71 2.48047 15.24V15.11C2.48047 11.09 3.93047 9.23999 7.47047 8.90999" fill="#293B75" />
              <path d="M12 2V14.88" stroke="#293B75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.3504 12.65L12.0004 16L8.65039 12.65" stroke="#293B75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <button
          className={
            "h-14 w-full rounded-lg bg-primary text-white font-bold text-lg max-w-md " +
            (acceptLoading ? "opacity-90 cursor-not-allowed" : "")
          }
          onClick={() => onClickAccept()}
          disabled={acceptLoading}
        >
          {!acceptLoading &&
            <p>ACCEPT</p>
          }

          {acceptLoading &&
            <Loader />
          }
        </button>
      </div>

      {/* CONSENT OVERLAY  */}
      <BottomSheet
        showClose={true}
        defaultVisible={showConsent}
        heading=""
        onVisible={(status) => { setShowConsent(status) }}
        height={460}
      >
        <div className="flex flex-col mx-2 mt-3 w-full md:w-90 md:mx-auto text-secondary leading-5.5 tracking-0.08">
          <div>
            <div className="flex gap-2 mt-2">
              <div style={{ width: "50px" }}>
                <img src={loan_agreement_acceptance} />
              </div>
              <div>
                <span className="font-normal text-xs tracking-[0.02rem] text-arsenic">
                  I confirm that I have read and understood the key fact statement and loan agreement.
                </span>
              </div>
            </div>
            


            <div className="flex gap-2 mt-2">
              <div style={{ width: "42px" }}>
                <img src={household_income} />
              </div>
              <div>
                <span className="font-normal text-xs tracking-[0.02rem] text-arsenic">
                  I confirm that my household income is above INR 3 lakhs per annum.
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
              <div style={{ width: "60px" }}>
                <img src={politically_exposed_person} />
              </div>
              <div>
                <span className="font-normal text-xs tracking-[0.02rem] text-arsenic">
                  I confirm that I am not a person who has been entrusted with:
                  <br />
                  a. Prominent public functions by a foreign country
                  <br />
                  b. Heads of States/ Governments, senior politicians, senior government/ judicial/ military officers
                  <br />
                  c. Senior executives of state-owned corporations and
                  <br />
                  d. Important political party officials.
                </span>
              </div>
            </div>

          <div className="mt-6">
            <button
              className={
                "h-14 w-full rounded-lg bg-primary text-white font-bold text-lg max-w-md " +
                (acceptLoading ? "opacity-90 cursor-not-allowed" : "")
              }
              onClick={() => onClickConsentAgree()}
              disabled={acceptLoading}
            >
              {!acceptLoading &&
                <p>I Agree</p>
              }

              {acceptLoading &&
                <Loader />
              }
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
export default LoanAgreement
