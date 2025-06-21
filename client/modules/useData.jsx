import { useState, useCallback } from "react";

export const useData = (input = null) => {
    const [data, setData] = useState(input);
    const updateData = useCallback((obj) => {
        setData((save) => ({ ...save, ...obj }));
    }, []);

    return [data, updateData];
};