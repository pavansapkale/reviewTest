const getCurrentDate = () => {
    let today = new Date()
    let year = today.getFullYear()
    let month = today.getMonth() + 1 // getMonth() returns a value between 0 and 11, so we need to add 1 to get the actual month
    let date = today.getDate()

    let strDate = ""
    let strMonth = ""

    strDate = date.toString().padStart(2, '0') // add leading zero if necessary
    strMonth = month.toString().padStart(2, '0') // add leading zero if necessary
    
    let currentDate = `${year}-${strMonth}-${strDate}`

    return currentDate // output: "2022-01-10"
}

const getTitle =(key:string) =>{
    let keyValue=""
    if(key === "current_address"){
        keyValue="Current Address Proof"
    }
    else if(key === "biz_proof_1" ){
        keyValue="Business Proof"
    }
    else if(key === "biz_proof_2"){
        keyValue="Business Proof 2"
    }
    else if(key === "pdc_collection"){
        keyValue="PDC Collection"
    }
    else if(key === "business_address"){
        keyValue="Business Address Proof"
    }
    else if(key ==="banking"){
        keyValue="Banking Proof"
    }
    else {
        let key_formatted=key.replace(/[_]+/g, ' ')
        let firstLetter=key_formatted.charAt(0).toUpperCase()
        let remainingLetters=key_formatted.slice(1)
        let titleFormatted=firstLetter+remainingLetters
        keyValue=titleFormatted
    }
    return keyValue
}

const getDocumentDetails = ( key:string)=>{
    let details={
        list : [{key:"",value:""}],
            isDropdownDisabled: false,
            dropdownDefaultValue: {key:"",value:""},
            fileLimit: 2
    }
    if(key === "current_address"){
        details.list = [
            {key:"AADHAAR_CARD",value:"Aadhar card (Front & Back)"},
            {key:"DRIVING_LICENSE",value:"Driving license (Front & Back)"},
            {key:"PASSPORT",value:"Passport (Front & Back)"},
            {key:"ELECTION_COMMISSION_ID_CARD",value:"Election commission ID card"},
            {key:"RATION_CARD",value:"Ration card with photo"},
            {key:"ELECTRICITY_OR_LPG_BILL",value:"Electricity/LPG bill"},
            {key:"BANK_STATEMENT",value:"Bank Statement"},
            {key:"RENT_OR_LEASE_AGREEMENT",value:"Rent/Lease agreement"},
            {key:"CABLE_OR_LANDLINE_OR_INTERNET_BILL",value:"Cable/Landline/Internet bill"},
            {key:"CREDIT_CARD_STATEMENT",value:"Credit card statement"}
            ]
    }
    else if(key === "biz_proof_1" ){
       details.list = [
        {key:"BUSINESS_REGISTRATION_CERTIFICATE",value:"Business registration certificate"},
        {key:"CERTIFICATION_BY_MUNICIPAL_AUTHORITIES",value:"Certificate/licence issued by the municipal authorities"},
        {key:"SALES_AND_INCOME_TAX_RETURNS",value:"Sales and income tax returns"},
        {key:"CST_OR_VAT_CERTIFICATE",value:"CST/VAT certificate"},
        {key:"CERTIFICATE_BY_TAX_AUTHORITIES",value:"Certification/registration issued by Tax authorities"},
        {key:"IEC",value:"IEC(Importer Exporter Code)"},
        {key:"COMPLETE_INCOME_TAX_RETURN",value:"Complete Income Tax Return"},
        {key:"UTILITY_BILLS",value:"Utility bills"},
        ]
    }
    else if(key === "biz_proof_2"){
        details.isDropdownDisabled=true
        details.dropdownDefaultValue={key:"UDYAM_CERTIFICATE",value:"Udyam certificate"}
        details["list"]=[{key:"UDYAM_CERTIFICATE",value:"Udyam certificate"}]
    }
    else if(key === "pdc_collection"){
        details.isDropdownDisabled = true
        details.dropdownDefaultValue = {key:"CHEQUE",value:"Cheque"}
        details.fileLimit = 3
        details.list = [{key:"CHEQUE",value:"Cheque"}]
    }
    else if(key === "business_address"){
       details.list = [{key:"REGISTRATION_WITH_GOVT",value:"Shop and establishment registration with state govt"},
        {key:"BANK_STATEMENT",value:"Bank Statement"},
        {key:"RENT_OR_LEASE_AGREEMENT",value:"Rent/Lease agreement"},
        {key:"AADHAAR_CARD",value:"Aadhar card (Front & Back)"},
        {key:"DRIVING_LICENSE",value:"Driving license (Front & Back)"},
        {key:"PASSPORT",value:"Passport (Front & Back)"},
        {key:"ELECTION_COMMISSION_ID_CARD",value:"Election commission ID card"},
        {key:"RATION_CARD",value:"Ration card with photo"},
        {key:"ELECTRICITY_OR_WATER_OR_LANDLINE_OR_MOBILE_BILL",value:"Electricity/Water/Landline/Mobile Bill"}
    ]
    }
    else if(key ==="banking"){
        details.list = [{key:"CHEQUE",value:"Cheque"},
        {key:"BANK_STATEMENT",value:"Bank Statement"},
        {key:"PASSBOOK",value:"Passbook"},
        {key:"MOBILE_BANKING",value:"Mobile Banking"},
        ]
    }
    return details
}

const generateRandomString = (length: Number) => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomString += charset[randomIndex];
    }
    return randomString;
}

const generateFlagOnPercent = (percent: Number) => {
    var randomNum = Math.random() * 100
    return randomNum <= percent
}

export {
    getCurrentDate,
    getTitle,
    getDocumentDetails,
    generateRandomString,
    generateFlagOnPercent
}