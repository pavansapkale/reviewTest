import contactCenterImage from "../../../assets/svg/contact-center.svg"
const ReferToCredit = () => {
    return (
        <div className="mt-5">
            <div className="mx-5 pb-24">
                <div className="grid grid-cols-1">
                <img className="w-2/5 mt-4 mx-auto" src={contactCenterImage} alt="Refer to credit" />
                <h1 className="mt-8 text-center font-bold text-xl leading-6 -tracking-0.04 text-raisin-black">
                    Your application is under review
                </h1>
                <p className="mt-4 mb-6 font-normal text-base leading-5.5 tracking-0.08 text-secondary text-center">
                    Our executive officer will contact you soon
                </p>
                </div>
            </div>
        </div>
    )
}

export default ReferToCredit