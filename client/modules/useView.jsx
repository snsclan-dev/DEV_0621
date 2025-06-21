import { useCallback, useRef } from "react";

export const useView = (input = null) => {
    const ref = useRef(input)
    const updateView = useCallback((e) => {
        ref.current = { ...ref.current, ...e }
    }, []);

    return [ref.current, updateView];
};