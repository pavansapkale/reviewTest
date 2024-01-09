import { useEffect, useRef, useState } from "react";

interface FileUploadProps {
    onFileSelect: (files: File[]) => void,
    multiple?: boolean,
    disabled?: boolean,
    accept?: string[],
    maxFileSize?: number,
    preUploadedFiles?: { name: string; type: string }[],
    fileError?:string,
    id?:number
}

const FileUpload = ({
    onFileSelect,
    multiple = false,
    disabled = false,
    accept = [],
    maxFileSize,
    preUploadedFiles = [],
    fileError,
    id
}: FileUploadProps) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (preUploadedFiles.length > 0) {
            setSelectedFiles(preUploadedFiles.map((file) => new File([], file.name, { type: file.type })));
        }
    }, [preUploadedFiles]);

    const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            return;
        }
        const newSelectedFiles = Array.from(files);
        if (!multiple) {
            newSelectedFiles.splice(1, selectedFiles.length);
        }
        if (maxFileSize) {
            for (const file of newSelectedFiles) {
                if (file.size > (maxFileSize * (1024 * 1024))) {
                    setError(`File ${file.name} exceeds the maximum file size of ${maxFileSize} MB`);
                    return;
                }
            }
        }
        if (accept.length > 0) {
            for (const file of newSelectedFiles) {
                if (!accept.includes(file.type)) {
                    setError(`File ${file.name} does not match the file types allowed: image or pdf`);
                    return;
                }
            }
        }
        if(fileInputRef.current != null){
            fileInputRef.current.value = '';
        }
        setError(null);
        setSelectedFiles(selectedFiles => [...selectedFiles, ...newSelectedFiles]);
        onFileSelect([...selectedFiles, ...newSelectedFiles]);
    };

    const handleRemoveFile = (index: number) => {
        if(fileInputRef.current != null){
            fileInputRef.current.value = '';
        }
        const newSelectedFiles = [...selectedFiles];
        newSelectedFiles.splice(index, 1);
        setSelectedFiles(newSelectedFiles);
        onFileSelect(newSelectedFiles);
    };

    const handleViewFile = (index: number) => {
        const file = selectedFiles[index];
        if (file) {
            const url = URL.createObjectURL(file);
            window.open(url);
        }
    };

    const formatBytes = (bytes: number, decimals = 2): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    return (
        <div className="space-y-2">
            <label htmlFor={"dropzone-file"+id} className={"flex flex-col items-center justify-center w-full p-2 mb-4 rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 border-dashed border-2 "+(fileError?"border-error ":" border-light-silver")}>
                <div className="flex flex-row gap-1 items-center justify-center">
                    <svg aria-hidden="true" className="w-6 h-6 mb-3 text-gray-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Click to upload</p>
                </div>
                <input 
                    ref={fileInputRef}
                    type="file"
                    accept={accept.join(",")}
                    multiple={multiple}
                    disabled={disabled}
                    onChange={handleSelectFiles} 
                    id={"dropzone-file"+id} 
                    className="hidden" 
                />
                {selectedFiles.length > 0 && (
                    <div className="flex flex-row-reverse">
                        <p className="text-granite-gray text-sm">{selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected ({formatBytes(selectedFiles.reduce((sum, file) => sum + file.size, 0))})</p>
                    </div>
                )}
                {error && <p className="text-error text-sm text-center">{error}</p>}
                {fileError && <p className="text-error text-sm">{fileError}</p>}
            </label>
            {selectedFiles.length > 0 && (
                <div>
                    <ul className="space-y-2">
                        {selectedFiles.map((file, index) => (
                            <li key={index} className="flex justify-between items-center py-2">
                                <div className="flex">
                                    <span onClick={() => { handleViewFile(index) }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
                                            <path fill="currentColor" d="M18.7,4.3H5.3c-1.3,0-2.3,1-2.3,2.3v11.3c0,1.3,1,2.3,2.3,2.3h13.3c1.3,0,2.3-1,2.3-2.3V6.7C21,5.3,19.9,4.3,18.7,4.3z M18.7,17.7H5.3V6.7h13.3V17.7z M14,11.5H9v1h5V11.5z M14,13.5H9v1h5V13.5z"/>
                                        </svg>
                                    </span>
                                    <div className="ml-2">
                                        <div className="w-45 sm:w-52 md:w-60 truncate" onClick={() => { handleViewFile(index) }}><p className="underline-offset-2">{file.name}</p></div> <span>({formatBytes(file.size)})</span>
                                    </div>
                                </div>
                                <button type="button" onClick={() => handleRemoveFile(index)}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M8 1.5V2.5H3C2.44772 2.5 2 2.94772 2 3.5V4.5C2 5.05228 2.44772 5.5 3 5.5H21C21.5523 5.5 22 5.05228 22 4.5V3.5C22 2.94772 21.5523 2.5 21 2.5H16V1.5C16 0.947715 15.5523 0.5 15 0.5H9C8.44772 0.5 8 0.947715 8 1.5Z" fill="#990312" />
                                        <path d="M3.9231 7.5H20.0767L19.1344 20.2216C19.0183 21.7882 17.7135 23 16.1426 23H7.85724C6.28636 23 4.98148 21.7882 4.86544 20.2216L3.9231 7.5Z" fill="#990312" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {preUploadedFiles.length > 0 && (
                <div>
                    <ul className="space-y-2">
                        {preUploadedFiles.map((file, index) => (
                            <li key={index} className="flex justify-between items-center">
                                <span>
                                    {file.name} ({formatBytes(0)})
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FileUpload;