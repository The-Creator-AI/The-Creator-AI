import React from "react";
import { useEffect, useRef } from "react";

interface CheckboxProps extends Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'onChange'> {
    checked: boolean;
    indeterminate?: boolean;
    onChange: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = (props: CheckboxProps) => {
    const { checked, onChange, indeterminate, ...rest } = props;
    const cRef = useRef<any>(null);

    useEffect(() => {
        if (cRef.current) {
            cRef.current.indeterminate = indeterminate;
        }
    }, [cRef, indeterminate]);

    return (
        <input type="checkbox" ref={cRef} checked={checked} onChange={(e) => onChange(e.target.checked, e)} {...rest} />
    );
};

export default Checkbox;
