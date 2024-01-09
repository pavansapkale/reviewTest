import axios, { AxiosResponse } from "axios"
import { toast } from "react-toastify"
import jwt_decode from 'jwt-decode';

const SHINOBI_DOMAIN = import.meta.env.VITE_APP_SHINOBI_DOMAIN

type decodedAuthToken = {
  data: {
    application_id: string
  }
}

//HELPER FUNCTION
async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res: Response = await fetch(dataUrl)
  const blob: Blob = await res.blob()
  return new Promise((resolve, reject) => {
    resolve(new File([blob], fileName, { type: 'image/png' }))
  })
}

const fetchNext = async (stage: string): Promise<AxiosResponse> => {
  return new Promise((resolve, reject) => {
    axios({
      method: "GET",
      url: SHINOBI_DOMAIN + "web/v1/" + stage + "/fetch-next",
      headers: {
        "Authorization": "Bearer " + sessionStorage.getItem("_token") || "",
      }
    }).then((response: any) => {
      resolve(response)
    }).catch((error: any) => {
      if (error) {
        if (error.response) { //REQUEST RETURNED RESPONSE
          if (error.response.status === 500) {
            toast.error("Something went wrong, Please try again")
          }
        } else if (error.request) { //REQUEST NOT RETURNED RESPONSE
          toast.error("Network issue, Please try again")
        } else {
          toast.error("Something went wrong")
        }
        reject(error.response)
      }
      else {
        toast.error("Something went wrong")
      }
    })
  })
}

const completeFetchNext = async (stage: string, data: Object): Promise<AxiosResponse> => {
  return new Promise((resolve, reject) => {
    axios({
      method: "POST",
      url: SHINOBI_DOMAIN + "web/v1/" + stage + "/complete-fetch-next",
      headers: {
        "Authorization": "Bearer " + sessionStorage.getItem("_token") || "",
      },
      data: data
    }).then((response: any) => {
      resolve(response)
    }).catch((error: any) => {
      if (error) {
        if (error.response) { //REQUEST RETURNED RESPONSE
          if (error.response.status === 500) {
            toast.error("Something went wrong, Please try again")
          }
        } else if (error.request) { //REQUEST NOT RETURNED RESPONSE
          toast.error("Network issue, Please try again")
        } else {
          toast.error("Something went wrong")
        }
        reject(error.response)
      }
      else {
        toast.error("Something went wrong")
      }
    })
  })
}

const uploadDocument = async (image: string, fileName: string): Promise<AxiosResponse> => {

  const imageFile = await dataUrlToFile(image, fileName);

  var formData = new FormData();
  let doc_type = "selfie"
  formData.append("file", imageFile)
  return new Promise((resolve, reject) => {
    axios.post(SHINOBI_DOMAIN + "web/v1/upload-document?document_type=" + (doc_type), formData, {
      headers: {
        "Authorization": "Bearer " + sessionStorage.getItem("_token") || "",
        'Content-Type': "multipart/form-data"
      },
    }).then((response: any) => {
      resolve(response)
    }).catch((error: any) => {
      if (error) {
        if (error.response) { //REQUEST RETURNED RESPONSE
          if (error.response.status === 500) {
            toast.error("Something went wrong, Please try again")
          }
        } else if (error.request) { //REQUEST NOT RETURNED RESPONSE
          toast.error("Network issue, Please try again")
        } else {
          toast.error("Something went wrong")
        }
        reject(error.response)
      }
      else {
        toast.error("Something went wrong")
      }
    })
  });
}

const fetchVariable = async (variable: string): Promise<AxiosResponse> => {
  return new Promise((resolve, reject) => {
    axios({
      method: "GET",
      url: SHINOBI_DOMAIN + "web/v1/variables/" + variable,
      headers: {
        "Authorization": "Bearer " + sessionStorage.getItem("_token") || "",
      },
    }).then((response: any) => {
      resolve(response)
    }).catch((error: any) => {
      if (error) {
        if (error.response) { //REQUEST RETURNED RESPONSE
          if (error.response.status === 500) {
            toast.error("Something went wrong, Please try again")
          }
        } else if (error.request) { //REQUEST NOT RETURNED RESPONSE
          toast.error("Network issue, Please try again")
        } else {
          toast.error("Something went wrong")
        }
        reject(error.response)
      }
      else {
        toast.error("Something went wrong")
      }
    })
  })
}

const complete = async (taskId: string, data: Object): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios({
      method: "POST",
      url: SHINOBI_DOMAIN + "web/v1/tasks/" + taskId + "/complete",
      headers: {
        "Authorization": "Bearer " + sessionStorage.getItem("_token") || "",
      },
      data: data
    }).then((response: any) => {
      resolve(response)
    }).catch(function (error: any) {
      if (error.response) { //REQUEST RETURNED RESPONSE
        if (error.response.status === 500) {
          toast.error("Something went wrong, Please try again")
        }
      } else if (error.request) { //REQUEST NOT RETURNED RESPONSE
        toast.error("Network issue, Please try again")
      } else {
        toast.error("Something went wrong")
      }
      reject(error.response)
    })
  })
}

const fetchAllBankList = async (bankCategory: string): Promise<AxiosResponse> => {
  return new Promise((resolve, reject) => {
    axios({
      method: "GET",
      url: SHINOBI_DOMAIN + "web/v1/"+bankCategory+"/banks",
      headers: {
        "Authorization": "Bearer " + sessionStorage.getItem("_token") || "",
      },
    }).then((response: any) => {
      resolve(response)
    }).catch((error: any) => {
      if (error) {
        if (error.response) { //REQUEST RETURNED RESPONSE
          if (error.response.status === 500) {
            toast.error("Something went wrong, Please try again")
          }
        } else if (error.request) { //REQUEST NOT RETURNED RESPONSE
          toast.error("Network issue, Please try again")
        } else {
          toast.error("Something went wrong")
        }
        reject(error.response)
      }
      else {
        toast.error("Something went wrong")
      }
    })
  })
}

const createSession = async (data: object): Promise<AxiosResponse> => {
  const token = sessionStorage.getItem("_token") || ""
  const decodedToken = jwt_decode(token) as decodedAuthToken
  const application_id = decodedToken?.data?.application_id
  return new Promise((resolve, reject) => {
    axios({
      method: "POST",
      url: SHINOBI_DOMAIN + "web/v1/applications/" + application_id + "/session",
      headers: {
        "Authorization": "Bearer " + sessionStorage.getItem("_token") || "",
      },
      data: data
    }).then((response: any) => {
      resolve(response)
    }).catch((error: any) => {
      if (error) { //REQUEST RETURNED RESPONSE
        reject(error.response)
      }
    })
  })
}

const emailVerification = async (data: object): Promise<AxiosResponse> => {
  const token = sessionStorage.getItem("_token") || ""
  const decodedToken = jwt_decode(token) as decodedAuthToken
  const application_id = decodedToken?.data?.application_id
  return new Promise((resolve, reject) => {
    axios({
      method: "POST",
      url: SHINOBI_DOMAIN + "integrations/v1/applications/" + application_id + "/email/invite",
      headers: {
        "Authorization": "Bearer " + sessionStorage.getItem("_token") || "",
      },
      data: data
    }).then((response: any) => {
      resolve(response)
    }).catch((error: any) => {
      if (error) {
        if (error.response) { //REQUEST RETURNED RESPONSE
          if (error.response.status === 500) {
            toast.error("Something went wrong, Please try again")
          }
        } else if (error.request) { //REQUEST NOT RETURNED RESPONSE
          toast.error("Network issue, Please try again")
        } else {
          toast.error("Something went wrong")
        }
        reject(error.response)
      }
      else {
        toast.error("Something went wrong")
      }
    })
  })
}

const uploadFileCRM = async (data:{doc_type:string,stage:string},files:File[]) : Promise<AxiosResponse> => {
  const formData = new FormData();  
  const payload = {
    stage: data.stage,
    doc_type: data.doc_type,
  }
  formData.append('payload', JSON.stringify(payload));
  if(files.length > 0){
    files.forEach((file) => {
      formData.append('files', file);
    });
  }
  return new Promise((resolve, reject) => {
      axios({
        method: "POST",
        url: SHINOBI_DOMAIN + "web/v1/applications/documents/qc",
        headers: {
          'accept': 'application/json',
          "Authorization": "Bearer " + sessionStorage.getItem("_token") || "",
          'Content-Type': 'multipart/form-data'
        },
        data:formData
      }).then((response: any) => {
        resolve(response)
      }).catch((error: any) => {
        if (error) {
          if (error.response) { //REQUEST RETURNED RESPONSE
            if (error.response.status === 500) {
              toast.error("Something went wrong, Please try again")
            }
            else if(error.response.status === 413 || error.response.status === 415){
              toast.error(error.response.data.description)
            }
          } else if (error.request) { //REQUEST NOT RETURNED RESPONSE
            toast.error("Network issue, Please try again")
          } else {
            toast.error("Something went wrong")
          }
          reject(error.response)
        }
        else {
          toast.error("Something went wrong")
        }
      })

    
  })
}

const addAaUserEvent = async (data:object) : Promise<AxiosResponse> => {
  return new Promise((resolve, reject) => {
      axios({
        method: "POST",
        url: SHINOBI_DOMAIN + "web/v1/banking/account_aggregator/events",
        headers: {
          'accept': 'application/json',
          "Authorization": "Bearer " + sessionStorage.getItem("_token") || "",
        },
        data: data
      }).then((response: any) => {
        resolve(response)
      }).catch((error: any) => {
        if (error) {
          reject(error.response)
        }
      })
  })
}


export {
  fetchNext,
  completeFetchNext,
  uploadDocument,
  fetchVariable,
  complete,
  fetchAllBankList,
  createSession,
  emailVerification,
  uploadFileCRM,
  addAaUserEvent
}