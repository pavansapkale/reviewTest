import { createContext } from "react"

type sessionData = {
    isLoggedIn: boolean
    sessionExpired: boolean,
    isLoanDisbursed: boolean,
}

type action = {
    type: 'UPDATE',
    data: Object
}

const sessionToken = sessionStorage.getItem("_token")

const initialSessionData: sessionData = {
    isLoggedIn: sessionToken ? true : false,
    sessionExpired: false,
    isLoanDisbursed: false
}

const RootContext = createContext<[sessionData, React.Dispatch<action>]>([initialSessionData, () => initialSessionData])

const sessionReducer = (state: sessionData, action: action) => {
    switch (action.type) {
        case 'UPDATE':
            return { ...state, ...action.data }
        default:
            return state
    }
}

export {
    initialSessionData,
    RootContext,
    sessionReducer
}