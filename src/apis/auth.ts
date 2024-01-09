import axios, { AxiosResponse } from "axios"

const SHINOBI_DOMAIN = import.meta.env.VITE_APP_SHINOBI_DOMAIN

const initialize = async(data: object): Promise<AxiosResponse> => {
  return new Promise((resolve, reject) => {
    axios({
      method: "POST",
      url: SHINOBI_DOMAIN + "web/v1/auth/initiate",
      data: data
    }).then((response: any) => {
      resolve(response)
    }).catch((error: any) => {
      if (error) {
        if (error.response) { //REQUEST RETURNED RESPONSE
          if (error.response.status === 500) {
            reject({data:{message: "Something went wrong, Please try again"}})
          }
          else{
            reject(error.response)
          }
        } else if (error.request) { //REQUEST NOT RETURNED RESPONSE
          reject({data:{message: "Network issue, Please try again"}})
        } else {
          reject(error.response)
        }
      }
      else {
        reject(error.response)
      }
    })
  })
}

const verify = async(data: object): Promise<AxiosResponse> => {
  return new Promise((resolve, reject) => {
    axios({
      method: "POST",
      url: SHINOBI_DOMAIN + "web/v1/auth/verify",
      data: data
    }).then((response: any) => {
      resolve(response)
    }).catch((error: any) => {
      if (error) {
        if (error.response) { //REQUEST RETURNED RESPONSE
          if (error.response.status === 500) {
            reject({data:{message: "Something went wrong, Please try again"}})
          }
          else{
            reject(error.response)
          }
        } else if (error.request) { //REQUEST NOT RETURNED RESPONSE
          reject({data:{message: "Network issue, Please try again"}})
        } else {
          reject(error.response)
        }
      }
      else {
        reject(error.response)
      }
    })
  })
}

export {
  initialize,
  verify,
}
