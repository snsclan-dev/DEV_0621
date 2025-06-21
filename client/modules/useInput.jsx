import { useState, useCallback } from "react";

export const useInput = (input = null)=>{
  const [data, setData] = useState(input);
  
  const onChange = useCallback(e => {
    if(e.target){
      const { name, value } = e.target;
      setData({ ...data, [name]: value.replace(/^[`'"\s\\]/gm, '') });
    }else{
      setData({ ...data, ...e })
    }
  },[data]);

  return [data, onChange];
};