import { lazy } from "react"
import { createBrowserRouter } from "react-router-dom"
import tracker from "./openreplay.config"
import Maintenance from "./screens/Errors/Maintenance"
import ReferToCredit from "./screens/Errors/ReferToCredit"
import DocumentUpload from "./screens/QualityCheck/DocumentUpload"

const Landing = lazy(() => import("./screens/Landing"))
const Pan = lazy(() => import("./screens/Pan"))
const CustomerDetail = lazy(() => import("./screens/CustomerDetail"))
const BasicDetail = lazy(() => import("./screens/BasicDetail"))
const BusinessDetails = lazy(() => import("./screens/BusinessDetails/GstinDetails"))
const Bank = lazy(() => import("./screens/Bank"))
const Offer = lazy(() => import("./screens/Offer"))
const DigioKYC = lazy(() => import("./screens/Kyc/Digio"))
const Aadhaar = lazy(() => import("./screens/Kyc/Aadhaar"))
const Selfie = lazy(() => import("./screens/Kyc/Selfie"))
const ResidentialAddress = lazy(() => import("./screens/ResidentialAddress"))
const Mandate = lazy(() => import("./screens/Mandate"))
const DisbursalAccountDetail = lazy(() => import("./screens/Mandate/DisbursalAccountDetail"))
const Repayment = lazy(() => import("./screens/Mandate/Repayment"))
const LoanAgreement = lazy(() => import("./screens/LoanAgreement"))
const LoanDocument = lazy(() => import("./screens/LoanDocument"))
const AuthWrapper = lazy(() => import("./screens/AuthWrapper"))
const Kyc = lazy(() => import("./screens/Kyc"))
const DigioMandate = lazy(() => import("./screens/Mandate/Digio"))
const ApplicationRejected = lazy(() => import("./screens/Errors/ApplicationRejected"))
const ErrorScreen = lazy(() => import("./screens/Errors/ErrorScreen"))
const NetBanking = lazy(() => import("./screens/Bank/NetBanking"))
const ApplicationTimeline = lazy(() => import("./screens/ApplicationTimeline"))
const Loan = lazy(() => import("./screens/Loan"))
const EStatement = lazy(() => import("./screens/Bank/EStatement"))
const PageNotFound = lazy(() => import("./screens/Errors/PageNotFound"))
const UdyamDetails = lazy(() => import("./screens/BusinessDetails/UdyamDetails"))
const SelfDeclareDetails = lazy(() => import("./screens/BusinessDetails/SelfDeclareDetails"))
const QcRepayment = lazy(()=> import("./screens/QualityCheck/Repayment"))
const AccountAggregator = lazy(()=> import("./screens/Bank/AccountAggregator"))
const AccountAggregatorStatus = lazy(()=> import("./screens/Bank/AccountAggregator/status"))
 
const router = createBrowserRouter([
    {
        path: "/",
        element: <Landing tracker={tracker} />,
        errorElement: <Maintenance />
    },
    {
        path: "/application-rejected",
        element: <AuthWrapper><ApplicationRejected stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/refer-to-credit",
        element: <AuthWrapper><ReferToCredit /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/try-again",
        element: <AuthWrapper><ErrorScreen /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/application-timeline",
        element: <AuthWrapper><ApplicationTimeline /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/customer-detail",
        element: <AuthWrapper><CustomerDetail stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/pan-detail",
        element: <AuthWrapper><Pan stage={"main"} tracker={tracker} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/basic-detail",
        element: <AuthWrapper><BasicDetail stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/bank",
        element: <AuthWrapper><Bank stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/bank/net-banking",
        element: <AuthWrapper><NetBanking stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/bank/e-statement",
        element: <AuthWrapper><EStatement stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/bank/account-aggregator",
        element: <AuthWrapper><AccountAggregator stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/bank/account-aggregator-status",
        element: <AuthWrapper><AccountAggregatorStatus stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/business-detail",
        element: <AuthWrapper><BusinessDetails stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/offer",
        element: <AuthWrapper><Offer stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/kyc",
        element: <AuthWrapper><Kyc stage={"kyc"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/kyc/aadhaar-otp",
        element: <AuthWrapper><Aadhaar stage={"kyc"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/kyc/digio",
        element: <AuthWrapper><DigioKYC stage={"kyc"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/kyc/selfie",
        element: <AuthWrapper><Selfie stage={"kyc"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/residential-address",
        element: <AuthWrapper><ResidentialAddress stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/mandate",
        element: <AuthWrapper><Mandate stage={"mandate"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/mandate/disbursal-account-detail",
        element: <AuthWrapper><DisbursalAccountDetail stage={"mandate"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/mandate/repayment",
        element: <AuthWrapper><Repayment stage={"mandate"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/mandate/digio",
        element: <AuthWrapper><DigioMandate stage={"mandate"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/udyam-detail",
        element: <AuthWrapper><UdyamDetails stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/loan-agreement",
        element: <AuthWrapper><LoanAgreement stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/loan-document",
        element: <AuthWrapper><LoanDocument stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/loan-detail",
        element: <AuthWrapper><Loan stage={"post_disbursal"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/self-declared-detail",
        element: <AuthWrapper><SelfDeclareDetails stage={"main"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/file-upload",
        element: <AuthWrapper><DocumentUpload stage={"main"}/></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "/repayment",
        element: <AuthWrapper><QcRepayment stage={"mandate"} /></AuthWrapper>,
        errorElement: <Maintenance />
    },
    {
        path: "*",
        element: <PageNotFound/>,
    },
])

export default router