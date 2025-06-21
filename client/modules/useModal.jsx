import { useState, useCallback } from "react"

export const useModal = (initialValue = false)=>{
  const [data, setData] = useState(initialValue)
  const change = useCallback((e)=>{
    if(!e){
      setData(false)
    }else{
      setData(e)
    }
  }, [])
  
  return [data, change]
};