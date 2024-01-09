
// this function check token is present or not in session Storage
// also check if token is present then its in valid jwt format 
// function retun 'true' if token is correct else 'false'
const AuthenticateToken = () =>  {
    // GET LOCALHOST TOKEN 
    const sessionToken = sessionStorage.getItem("_token")

    if (sessionToken === null) return {"status" : false, "code": "TOKEN_NOT_PRESENT"} //TOKEN IS NOT PRESENT RETURN 'false'

    return {"status" : true, "code": "VALID_TOKEN"}
}

export {
    AuthenticateToken
}