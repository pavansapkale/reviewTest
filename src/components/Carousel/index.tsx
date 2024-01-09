import { useEffect, useState } from "react"

const Carousel = () => {
    const [ childrenNumber, setChildrenNumber ] = useState(1)
    setInterval(() => {
        if(childrenNumber==3)
            setChildrenNumber(0)
        else
            setChildrenNumber(childrenNumber + 1)
    }, 3000)

    return (
        <div>
            <div className="flex justify-center">
                <div className={"w-80 h-20 border border-slate-300 rounded-lg px-6 py-2 ease-in duration-300 " + (childrenNumber==1 ? "visible" : "hidden")}>
                    <h1 className="text-sm font-bold">
                        Tip 1 head
                    </h1>
                    <p className="text-sm">
                        Position your face inside the circle and look straight. 
                    </p>
                </div>
                <div className={"w-80 h-20 border border-slate-300 rounded-lg px-6 py-2 ease-in duration-300 " + (childrenNumber==2 ? "visible" : "hidden")}>
                    <h1 className="font-bold">
                        Tip 2 head
                    </h1>
                    <p className="text-sm font-bold">
                        Position your face inside the circle and look straight. 
                    </p>
                </div>
                <div className={"w-80 h-20 border border-slate-300 rounded-lg px-6 py-2 ease-in duration-300 " + (childrenNumber==3 ? "visible" : "hidden")}>
                    <h1 className="text-sm font-bold">
                        Tip 3 head
                    </h1>
                    <p className="text-sm text-sm">
                        Position your face inside the circle and look straight. 
                    </p>
                </div>
            </div>
            <div className="flex gap-4 justify-center mt-4">
                <div className={"bg-deep-koamaru h-1 w-2 rounded-lg " + (childrenNumber!=1 ? "opacity-20" : "")}></div>
                <div className={"bg-deep-koamaru h-1 w-2 rounded-lg " + (childrenNumber!=2 ? "opacity-20" : "")}></div>
                <div className={"bg-deep-koamaru h-1 w-2 rounded-lg " + (childrenNumber!=3 ? "opacity-20" : "")}></div>
            </div>
        </div>
    )
}

export default Carousel