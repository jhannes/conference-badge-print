import * as React from "react";
import {useEffect} from "react";

export const FileUpload: React.FC<{
    onChangeValue(value: string): void,
    localStorageKey?: string,
    onLoading?(value: boolean): void
}> = ({onChangeValue, onLoading, localStorageKey}) => {
    useEffect(() => {
        if (localStorageKey) {
            onChangeValue(localStorage.getItem(localStorageKey));
        }
    }, []);
    const handleChange = e => {
        const reader = new FileReader();
        const filename = e.target.files[0].name;
        onLoading && onLoading(true);
        reader.onloadend = () => {
            const value: string = reader.result as string;
            localStorageKey && localStorage.setItem(localStorageKey, value);
            localStorageKey && localStorage.setItem(localStorageKey + ".name", filename);
            onChangeValue(value);
            onLoading && onLoading(false);
        };
        reader.readAsDataURL(e.target.files[0]);
    };

    return <input type="file" onChange={handleChange}/>;
};
