import PageNotFoundImage from "../../../assets/svg/page-not-found.svg"
const PageNotFound=()=>{
    return(<div className="flex flex-col justify-center items-center p-5">
    <img src={PageNotFoundImage} className="mt-4"/>
    <p className="text-5xl mt-8 font-bold">404</p>
    <p className="text-3xl mt-1 font-bold">Page Not Found!</p>
    <p  className="text-secondary text-center mt-4">We’re sorry, the page you requested could not be found.</p>
</div>)
}

export default PageNotFound