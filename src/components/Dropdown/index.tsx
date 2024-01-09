import { useState ,useRef ,useEffect } from "react"
interface DropdownProps{
    docTypeList:Array<docType>,
    onChangeDropdown:(docType:docType)=>void,
    defaultValue?:docType,
    isDisabled?:boolean,
    error?:string
}
interface docType{
    key:string,
    value:string
}
const Dropdown=({docTypeList,onChangeDropdown,defaultValue,isDisabled,error}:DropdownProps)=>{
    const [isDropDownOpen,setIsDropdownOpen]=useState(false)
    const [selectedDocumentType,setSelectedDocumentType]=useState<docType>()
    const dropdownRef = useRef<HTMLDivElement>(null);

    const onSelectDocumentType=(docType:docType)=>{
        setSelectedDocumentType(docType)
        setIsDropdownOpen(false)
        onChangeDropdown(docType)
    }

    useEffect(()=>{
        defaultValue && setSelectedDocumentType(defaultValue)
    },[])

    useEffect(() => {
        const  handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
          }
        }
        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [dropdownRef]);

    return(<div className="relative mt-2 mb-4" ref={dropdownRef}>
    <button type="button" onClick={()=>{setIsDropdownOpen(!isDropDownOpen)}} disabled={isDisabled} className={"relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6 "+((error ? " ring-2 ring-red-600 " : " "))} aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
    <span className="flex items-center">
        <span className="ml-3 block truncate">{selectedDocumentType?.value ? selectedDocumentType.value : "Select document Type"}</span>
    </span>
    {!isDisabled &&  <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
        </svg>
    </span> }
   
    </button>
    {error && <p className="text-error text-sm">{error}</p>}
    {docTypeList.length>0 &&
    <ul className={"absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm "+(isDropDownOpen?"":"hidden")}  role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
        {docTypeList.map((item)=>{
            return(<li onClick={()=>{onSelectDocumentType(item)}} key={item.key}  className="text-gray-900 relative cursor-default select-none py-2 pl-3 pr-9" id="listbox-option-0" role="option">
            <div className="flex items-center">
            <span className="font-normal ml-3">{item.value}</span>
            {item === selectedDocumentType && <span className="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            </span>}
            </div>
        </li>)
        })}
    </ul>
    }
    </div>)
}

export default Dropdown