type typeScreenMap = {
    [key: string]: string;
}
const SCREEN_MAP:typeScreenMap = {
    "home": "/",
    "errorScreen": "/try-again",
    "rejectScreen": "/application-rejected",
    "referToCreditScreen": "/refer-to-credit",
    "panScreen": "/pan-detail",
    "customerInfoScreen": "/customer-detail",
    "personalInfoScreen": "/basic-detail",
    "businessInfoScreen": "/business-detail",
    "businessDeclaredInfoScreen": "/self-declared-detail",
    "bankSelectScreen": "/bank",
    "bankingTypeSelectScreen": "/bank",
    "netBankingScreen": "/bank",
    "eStatementUploadScreen":"/bank",
    "accountAggregatorScreen":"/bank",
    "cbmScreen": "/bank",
    "offerScreen": "/offer",
    "KYC": "/kyc", //SUBWORKFLOW
    "aadhaarScreen": "/kyc/aadhaar-otp",
    "aadhaarOTP":"/kyc/aadhaar-otp",
    "kycDigioScreen": "/kyc/digio",
    "selfieScreen": "/kyc/selfie",
    "kycCompleted": "/residential-address",
    "currentAddressScreen": "/residential-address",
    "MANDATE": "/mandate", //SUBWORKFLOW
    "bankDetailScreen": "/mandate/disbursal-account-detail",
    "mandateAvailabilityScreen": "/mandate/repayment",
    "mandateDigioScreen": "/mandate/digio",
    "mandateCompleted": "/udyam-detail",
    "udyamScreen":"/udyam-detail",
    "loanAgreementScreen": "/loan-agreement",
    "userCompletionScreen": "/loan-document",
    "postDisbursalScreen": "/loan-detail" // POST DISBURSAL WORKFLOW
}

const getUrlByScreenName = (screenName: string): string => {
    screenName = screenName.replace(/[^a-zA-Z0-9 ]/g, '')
    return SCREEN_MAP[screenName]
}

export {
    getUrlByScreenName
}