import { Suspense } from "react"
import ReactDOM from "react-dom/client"
import {
  RouterProvider,
} from "react-router-dom"
import "./index.css"
import spinner from "./assets/svg/spinner.svg"
import router from "./router"
import tracker from "./openreplay.config"
import App from "./App"

const script = document.createElement('script'); 
script.async = true; 
script.src = 'https://www.googletagmanager.com/gtag/js?id='+import.meta.env.VITE_APP_ANALYTICS_ID;
document.head.appendChild(script);
const script2=document.createElement('script');
script2.textContent=`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${import.meta.env.VITE_APP_ANALYTICS_ID}');` 
document.head.appendChild(script2);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App tracker={tracker}>
    <Suspense fallback={<div className="w-full flex justify-center"><img className="mx-10 w-16 h-16" src={ spinner } alt="content loading" /></div>}>
      <RouterProvider router={router} />
    </Suspense>
  </App>
)

