import secureIcon from "../../assets/png/secureIcon.png"

const Footer = () => {
    return (
    <div className="fixed bg-background flex justify-between w-screen h-6.5 inset-x-0 bottom-0 font-semibold text-[0.5625rem] text-[#666667] tracking-[0.1rem] uppercase leading-3">
        <span className="ml-4.75 my-auto">RBI registered NBFC</span>
        <span className="mr-4.75 my-auto flex content-baseline">
            <img
                src={secureIcon}
                className="inline w-2 h-2.5 mr-1"
                alt="secure icon"
            />
            100% secure
        </span>
      </div>
    )
}

export default Footer