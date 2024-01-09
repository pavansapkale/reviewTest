import { useContext, useEffect, useState } from "react"
import Slider from 'rc-slider'
import '../Offer/style.css'
import { useLocation, useNavigate } from "react-router-dom"
import Loader from "../../components/Loader";
import { completeFetchNext } from "../../apis/resource"
import { getUrlByScreenName } from "../../utils/Routing"
import BottomSheet from "../../components/BottomSheet"
import { Player } from '@lottiefiles/react-lottie-player'
import checkmark from "../../assets/svg/checkmark.svg"
import congratulationFlower from "../../assets/lottie/congratulation-flower.json"
import { RootContext } from "../../utils/RootContext";

const Offer = (props: { stage: string }) => {
  const [ sessionData, sessionDispatch ] = useContext(RootContext)
  const navigate = useNavigate()
  const { state } = useLocation()

  const sanctionOffer = state?.variables?.offer

  const [showLoanDetails, setShowLoanDetails] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)

  const [loanAmountRangeMark, setLoanAmountRangeMark] = useState({})
  const [loanSelectedRange, setLoanSelectedRange] = useState(0)
  const [loanMin, setLoanMin] = useState(0)
  const [loanMax, setLoanMax] = useState(0)

  const [emiAmountRangeMark, setEmiAmountRangeMark] = useState({})
  const [emiSelectedRange, setEmiSelectedRange] = useState(0)
  const [emiMin, setEmiMin] = useState(0)
  const [emiMax, setEmiMax] = useState(0)
  const [listOfEmi, setListOfEmi] = useState({})

  const [processingFeeInPercent, setProcessingFeeInPercent] = useState(0)
  const [processingFeeInAmount, setProcessingFeeInAmount] = useState(0)
  const [bpiInAmount, setBpiInAmount] = useState(0)
  const [disbursalAmount,setDisbursalAmount]=useState(0)
  const [offerDate,setOfferDate]=useState("")
  const [firstEmiDueDate,setFirstEmiDueDate]=useState("")

  const [disableEmiSlider, setDisableEmiSlider] = useState(false)
  const [disableLoanSlider, setDisableLoanSlider] = useState(false)

  //ACCEPT OFFER
  const [acceptOfferLoading, setAcceptOfferLoading] = useState(false)

  const offer = sanctionOffer ? sanctionOffer["loan_amt"] : []
  const roiInPercent = sanctionOffer ? sanctionOffer["interest_rate"] : 0
  

  const [termsAndCondition, setTermsAndCondition] = useState(false)
  const [termsAndConditionError, setTermsAndConditionError] = useState(false)
  const breOfferStatus = state?.variables?.bre_offer_status

  const formatDate = (dateString : string) =>{
    const [year, month, day] = dateString.split('-');
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate
  }

  useEffect(() => {
    setTimeout(()=>{
      setShowOverlay(false)
    },3000)
    if(sanctionOffer){
      sanctionOffer["first_emi_due_date"] && setFirstEmiDueDate(formatDate(sanctionOffer["first_emi_due_date"]))
      sanctionOffer["disbursal_date"] && setOfferDate(formatDate(sanctionOffer["disbursal_date"]))
    }
    var tempLoanRange = {}
    var loanKeys = Object.keys(offer)

    for (let i = 0; i < loanKeys.length; i++) {
      // @ts-ignore
      tempLoanRange[Number(loanKeys[i])] = " "
      if (i == 0)
        setLoanMin(Number(loanKeys[i]))
      if (i == loanKeys.length - 1) {
        setLoanMax(Number(loanKeys[i]))
        setLoanSelectedRange(Number(loanKeys[i]))
      }
    }
     if(loanKeys.length === 1) {
        setDisableLoanSlider(true)
      }
      else{
        setDisableLoanSlider(false)
      }
    setLoanAmountRangeMark(tempLoanRange)
  }, [])

  useEffect(() => {
    var tempEmiRange = {}
    try {
      var emiObject = offer[loanSelectedRange]["emi_list"]
      setProcessingFeeInPercent(offer[loanSelectedRange]["processing_fee_in_percent"])
      setProcessingFeeInAmount(offer[loanSelectedRange]["processing_fee_in_amount"])
      setBpiInAmount(offer[loanSelectedRange]["bpi_amount"])
      setDisbursalAmount(offer[loanSelectedRange]["disbursal_amt"])

      if (emiObject) {
        const formattedEmiObject={}
        //SWAP KEY,VALUE PAIR
        Object.keys(emiObject).forEach(key => {
          //@ts-ignore
          formattedEmiObject[emiObject[key]] = key;
        });
        var emiKeys = Object.keys(formattedEmiObject)
        let tempEmiMax = 0
        let tempEmiMin = 0
        for (let i = 0; i < emiKeys.length; i++) {
          // @ts-ignore
          tempEmiRange[emiKeys[i]] = " "
          if (i == 0) {
            tempEmiMin = Number(emiKeys[i])
          }
          if (i == emiKeys.length - 1){
            tempEmiMax = Number(emiKeys[i])
          }
        }
        setListOfEmi(formattedEmiObject)
        setEmiAmountRangeMark(tempEmiRange)
        setEmiMax(tempEmiMax)
        setEmiMin(tempEmiMin)
        if(emiKeys.length === 1) {
          setDisableEmiSlider(true)
          setEmiSelectedRange(tempEmiMax)
        }else{
          setDisableEmiSlider(false)
          setEmiSelectedRange(tempEmiMin)
        }
      }
    } catch (error) {
      //IGNORE
    }
  }, [loanSelectedRange])

  const onChangeLoanSlider = (value: any) => {
    setLoanSelectedRange(value)
  }

  const onChangeEmiSlider = (value: any) => {
    setEmiSelectedRange(value)
  }
  //TERMS AND CONDITION
  const onCheckTermAndConditionChange = (termSatus: any) => {
    setTermsAndConditionError(false)
    setTermsAndCondition(termSatus)
  }

  const validateBeforeAccept=()=>{
    if (!termsAndCondition) {
      setTermsAndConditionError(true)
      return false
    }
    return true
  }

  const onClickAcceptOffer = async () => {
    //@ts-ignore
    const totalInterestPayable=(Number(emiSelectedRange) * Number(listOfEmi[emiSelectedRange])) - Number(loanSelectedRange)
    if (validateBeforeAccept()) {
      setAcceptOfferLoading(true)
      const variables = {
        in_submit_banking: false,
        in_selected_loan_amount: Number(loanSelectedRange),
        in_selected_emi_amount: Number(emiSelectedRange),
        // @ts-ignore
        in_selected_tenure_in_months: Number(listOfEmi[emiSelectedRange]),
        in_selected_processing_fee_in_percent: Number(processingFeeInPercent),
        in_selected_processing_fee_in_amount:Number(processingFeeInAmount),
        in_interest_rate: Number(roiInPercent),
        in_total_interest_payable:Number(totalInterestPayable),
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
      setAcceptOfferLoading(false)
    }
  }

  const onClickImproveOffer = async () => {
    setAcceptOfferLoading(true)
    const variables = {
      in_submit_banking: true,
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
    setAcceptOfferLoading(false)
  }

  return (
    <div>
      <div className="flex flex-col">
        <div className="relative flex flex-col  h-45 w-full bg-indigo ">
          <div className=" mt-5 flex flex-col  gap-3 text-white justify-center items-center">
            <p className="font-semibold leading-5 -tracking-0.04 ">
              Loan amount
            </p>
            <p className="font-bold text-heading-width leading-10">
              ₹ {loanSelectedRange.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="absolute inset-x-0 h-18 mx-5 -bottom-9 bg-alice-blue rounded-lg py-6 px-3">
            <p className="flex gap-2 items-center justify-center text-center">
              <span className=" font-semibold leading-5 -tracking-0.04 text-granite-gray">
                Pay
              </span>
              <span className=" font-bold text-xl leading-6 -tracking-0.04 text-secondary">
                ₹ {emiSelectedRange.toLocaleString('en-IN')}
              </span>
              <span className=" font-semibold leading-5 -tracking-0.04 text-granite-gray">
                for
              </span>
              <span className=" font-bold text-xl leading-6 -tracking-0.04 text-secondary">
                {
                  // @ts-ignore
                  listOfEmi[emiSelectedRange]
                }
              </span>
              <span className=" font-semibold leading-5 -tracking-0.04 text-granite-gray">
                months
              </span>
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col rounded-lg bg-white p-6 mx-5">
          <div className="mb-8">
            <p className=" mb-4 font-semibold leading-5 -tracking-0.04">
              Select loan amount
            </p>
            <Slider
              dots={false}
              min={loanMin === loanMax ? undefined : loanMin}
              max={loanMax}
              marks={loanAmountRangeMark}
              step={null}
              onChange={(value) => onChangeLoanSlider(value)}
              value={loanSelectedRange}
              defaultValue={loanMax}
              railStyle={{ backgroundColor: '#ECECEC', height: 8 }}
              trackStyle={{ backgroundColor: '#293B75', height: 8 }}
              dotStyle={{ borderColor: '#AAB1C6', backgroundColor: '#293B75' }}
              activeDotStyle={{ borderColor: '#293B75', backgroundColor: '#293B75' }}
              disabled={disableLoanSlider}
            />
            <div className="mt-2 flex justify-between items-center text-granite-gray font-semibold  text-xs tracking-0.08">
              <div>₹ {loanMin.toLocaleString('en-IN')}</div>
              <div>₹ {loanMax.toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div>
            <p className=" mb-4 font-semibold leading-5 -tracking-0.04">
              EMI you can pay{/* <span className="float-right text-xs tracking-0.08">{Object.keys(listOfEmi).length} EMI options </span> */}
            </p>
            <Slider
              dots
              min={emiMin === emiMax ? undefined : emiMin}
              max={emiMax}
              marks={emiAmountRangeMark}
              onChange={(value) => onChangeEmiSlider(value)}
              value={emiSelectedRange}
              defaultValue={emiMin}
              step={null}
              railStyle={{ backgroundColor: '#ECECEC', height: 8 }}
              trackStyle={{ backgroundColor: '#293B75', height: 8 }}
              dotStyle={{ borderColor: '#AAB1C6' }}
              activeDotStyle={{ borderColor: '#293B75' }}
              disabled={disableEmiSlider}
            />
            <div className="mt-2 flex justify-between items-center text-granite-gray font-semibold  text-xs tracking-0.08">
              <div>₹ {emiMin.toLocaleString('en-IN')}</div>
              <div>₹ {emiMax.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

      </div>

      { breOfferStatus === "APPROVED_BANKING_OPTIONAL" && 
        <div className="mt-4 flex flex-col mx-6 text-primary" onClick={()=> {onClickImproveOffer()}}>
              Improve offer by submitting banking  &#8594;
        </div>
      }

      {/* STICKEY BUTTON  */}
      <div className="fixed-button bg-cultured max-w-md">
        <button
          className={
            "h-14 w-full rounded-lg bg-primary text-white font-bold text-lg max-w-md"
          }
          onClick={() => setShowLoanDetails(true)}
        >
          <p>NEXT</p>
        </button>
      </div>

      {/* OFFER DETAIL OVERLAY  */}
      <BottomSheet
        showClose={true}
        defaultVisible={showLoanDetails}
        heading="Loan details"
        onVisible={(status) => { setShowLoanDetails(status) }}
        height={600}
      >
        <div className="flex flex-col mx-2 w-full md:w-90 md:mx-auto text-secondary leading-5.5 tracking-0.08">
          <p className="flex justify-center mt-1 text-sm font-semibold">( as on {offerDate} )</p>
          <div className="mt-3 flex flex-col gap-3">
            <div className=" flex items-center justify-between font-semibold text-black  leading-5 -tracking-0.04 ">
              <p>Loan amount</p>
              <p>₹ {Math.round(loanSelectedRange).toLocaleString('en-IN')}</p>
            </div>
            <div className=" flex items-center justify-between">
              <p>Processing fee</p>
              <p>₹ {Math.round(processingFeeInAmount).toLocaleString('en-IN')}</p>
            </div>
            <div className=" flex items-center  justify-between">
              <p>EMI amount</p>
              <p>₹ {Math.round(emiSelectedRange).toLocaleString('en-IN')}</p>
            </div>
            <div className="flex items-center justify-between">
              <p>Tenure</p>
              <p>
                {
                  // @ts-ignore
                  listOfEmi[emiSelectedRange]
                } months
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p>
                Interest rate {" "}
                <span className="text-xs tracking-0.08">
                  (reducing per annum)
                </span>
              </p>
              <p>{roiInPercent.toFixed(2)}%</p>
            </div>
            <div className="flex items-center justify-between">
              <p>
                BPI* {" "}
                <span className="text-xs tracking-0.08">
                  (broken period interest)
                </span>
              </p>
              <p>₹ {Math.round(bpiInAmount).toLocaleString('en-IN')}</p>
            </div>
            <div className=" flex items-center justify-between pb-5 border-light-silver  border-b-0.25 border-solid ">
              <p>Total interest payable</p>
              <p>₹ {
                // @ts-ignore
                Math.round((Number(emiSelectedRange) * Number(listOfEmi[emiSelectedRange])) - Number(loanSelectedRange)).toLocaleString('en-IN')
              }</p>
            </div>
            <div className=" flex items-center justify-between text-black font-semibold leading-5 -tracking-0.04 ">
              <p>Disbursal amount*</p>
              <p>₹ {Math.round(Number(disbursalAmount)).toLocaleString('en-IN')}</p>
            </div>
            <div className=" flex items-center justify-between text-black font-semibold leading-5 -tracking-0.04 ">
              <p>First EMI due date*</p>
              <p>{firstEmiDueDate}</p>
            </div>
          </div>
          <div className="flex items-center mt-4 gap-3">
              <input
                className={
                  "h-4 w-6 cursor-pointer" +
                  (termsAndConditionError ? " ring-2 ring-red-600" : "")
                }
                type="checkbox"
                checked={termsAndCondition}
                style={{ accentColor: "#2C3D6F" }}
                onChange={(e) =>
                  onCheckTermAndConditionChange(e.target.checked)
                }
              ></input>
              <div className="flex flex-col text-xs text-secondary">
                <p>By continuing, I agree and accept the disbursal amount, rate of interest and tenure.</p>
              </div>
            </div>
            <p className="mt-1 flex text-xs text-secondary"><span className=" text-2xl leading-3 mr-2 mt-2">* </span>may vary according to disbursement date</p>
            <div
              className={
                "mt-1 text-red-600 " +
                (termsAndConditionError
                  ? "visible"
                  : "invisible")
              }
            >
             Please agree to the terms 
            </div>
          <button
            className="mb-6 justify-center py-auto px-auto items-center rounded-xl bg-primary h-14 gap-2  md:w-90 md:mx-auto"
            onClick={() => onClickAcceptOffer()}
            disabled={acceptOfferLoading}
          >
            {!acceptOfferLoading &&
              <p className="text-lg leading-5 text-center font-bold tracking-0.08 text-white ">
                ACCEPT OFFER
              </p>
            }
            {acceptOfferLoading &&
              <Loader />
            }
          </button>
        </div>
      </BottomSheet>

      {/* CONGRATULATION OFFER OVERLAY  */}
      <div
        className={
          "fixed inset-x-0 bottom-0 flex justify-center opacity-80  z-20 w-screen h-screen bg-black hide-after-5-sec "+(showOverlay?" ":"hidden")
        }
      >
        <div className="flex flex-col">
          <Player
            autoplay
            loop
            src={congratulationFlower}
          >
          </Player>
          </div>
          <div className=" absolute flex flex-col gap-4 h-screen w-screen items-center justify-center md:max-w-md  z-30">
            <img src={checkmark} className="w-2/5 mx-auto"/>
            <div className=" flex flex-col justify-center">
            <p className="mb-3 font-bold text-2xl -tracking-0.08 text-white text-center">
              Congratulations!
            </p>
            <p className="leading-5.5 tracking-0.08 text-white text-center">
              We have the best offer for you
            </p>
        </div> 

        </div>
      </div>

    </div>
  )
}

export default Offer
