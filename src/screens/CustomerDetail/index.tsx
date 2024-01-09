import { useContext, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { completeFetchNext,createSession } from "../../apis/resource"
import Loader from "../../components/Loader"
import { RootContext } from "../../utils/RootContext"
import { getUrlByScreenName } from "../../utils/Routing"
import OpenReplay from '@openreplay/tracker';
import {detect } from "../../lib/DetectBrowser";





const CustomerDetail = (props: { stage: string}) => {
  const [sessionData, sessionDispatch] = useContext(RootContext);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [fullNameError, setFullNameError] = useState(false);
  const [fullNameErrorMessage, setFullNameErrorMessage] = useState("");
  const inputFullName = useRef<HTMLInputElement>(null);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [userLat, setUserLat] = useState(0.0);
  const [userLong, setUserLong] = useState(0.0);
  const [ip, setIp] = useState("0.0.0.0");

  // BROWSER INFO
  const browserInfo = detect();
  const browserDetails = { name: browserInfo?.name, os: browserInfo?.os, version: browserInfo?.version };

  useEffect(() => {
    // SET SESSION INFORMATION
    getSessionInfo();
  }, []);

  const getSessionInfo = async () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLat(position.coords.latitude);
      setUserLong(position.coords.longitude);
    });
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    setIp(data.ip);
  };

  // CREATE SESSION
  const createSessionHandler = () => {
    let utmParams = {};
    var url = new URL(window.location.href);
    url.searchParams.forEach(function (value, key) {
      if (key.startsWith("utm")) {
        // @ts-ignore
        utmParams[key] = value;
      }
    });

    const createSessionPayload = {
      ip_address: ip,
      utm: utmParams,
      location: {
        lat: userLat,
        long: userLong,
      },
      meta_info: {
        browser_info: browserDetails,
      },
    };

    createSession(createSessionPayload).catch((error) => {
      if (error) {
        if (error.status === 401 || error.status === 403) {
          sessionDispatch({ type: "UPDATE", data: { sessionExpired: true } });
        }
      }
    });
  };

  // FULL NAME
  const onChangeFullName = (name: string) => {
    setFullNameError(false);
    setFullNameErrorMessage("");

    // Regular expression to allow only alphabetic characters and spaces
    const regex = /^[a-zA-Z\s]*$/;

    // Limit to 100 characters or fewer after passing the regex test
    if (regex.test(name)) {
        const trimmedName = name.substring(0, 100); // Trim input to 100 characters
        setFullName(trimmedName);
    } 
};
const validate = () => {
  // DEFAULT
  setFullNameError(false);
  setFullNameErrorMessage("");

  if (fullName.trim() === "") {
      inputFullName.current?.scrollIntoView({ inline: "center" });
      setFullNameError(true);
      setFullNameErrorMessage("Please enter your full name");
      return false;
  }

  if (fullName.trim().length < 3) {
      inputFullName.current?.scrollIntoView({ inline: "center" });
      setFullNameError(true);
      setFullNameErrorMessage("Please enter at least 3 characters for your full name");
      return false;
  }

  return true;
};

  const onClickSubmit = async () => {
    if (validate()) {
      createSessionHandler();
      setSubmitLoading(true);
      let variables = {
            in_self_declared_name:fullName
        }
    await completeFetchNext(props.stage, variables).then((response) => {
        const variable_data = response.data.data
        let redirectTo: string = getUrlByScreenName(response.data.data.task_name)
        navigate(redirectTo, {
            state: {
                variables: response.data.data //TO SEND DATA NEXT SCREEN
            },
            replace : true
        })
    }).catch((error) => {
        if(error){
            if (error.status === 401 || error.status === 403) {
                sessionDispatch({type: 'UPDATE', data: {sessionExpired: true}})
            }
        }
    })
    setSubmitLoading(false);
  }
  };

  return (
    <div className="mt-2 pb-36">
      <div className="p-5">
        <h1 className="text-2xl font-bold tracking-0.08">
          Congratulations!
          <br></br>
          Let’s start with the basic details
        </h1>
        <div className="mt-10" ref={inputFullName}>
          <p className="mb-2 font-semibold text-sm leading-4.5 -tracking-0.06">Enter your full name</p>
          <label className="relative rounded-lg bg-background focus-within:text-gray-600 block">
            <input
              data-openreplay-obscured
              onChange={(event: any) => onChangeFullName(event.target.value)}
              type="text"
              name="full_name"
              placeholder="Enter your full name"
              autoComplete="off"
              value={fullName}
              className={"border-2 border-background w-full h-12 tracking-wider rounded-lg bg-background outline-none pl-4 pt-1 caret-primary-500 " + (fullNameError ? "ring-2 ring-red-600" : "focus:border-2 focus:border-primary")}
              onFocus={() => {
                inputFullName.current?.scrollIntoView({ inline: "center" });
              }}
            ></input>
          </label>
          <div className={"flex mt-1 text-red-600 " + (fullNameError ? "visible" : "invisible")}>
            <p>{fullNameErrorMessage}</p>
          </div>
        </div>
        <p className="flex mt-1 text-xs justify-end text-granite-gray">as per document</p>
      </div>

      {/* STICKY BUTTON  */}
      <div className="fixed-button bg-cultured max-w-md">
        <button
          className={
            "h-14 w-full rounded-lg bg-primary text-white font-bold text-lg max-w-md " +
            (submitLoading ? "opacity-90 cursor-not-allowed" : "")
          }
          onClick={() => onClickSubmit()}
          disabled={submitLoading}
        >
          {!submitLoading && <p>SUBMIT</p>}

          {submitLoading && <Loader />}
        </button>
      </div>
    </div>
  );
};

export default CustomerDetail;
