import { getOnlineCount } from "@/services/users"
import { useCallback, useEffect, useState } from "react"

export const useOnlineCount = () => {
    const [count,setCount] = useState<number | null> (null)
    const [loading,setLoading] = useState(true)

    const fetchCount = useCallback(async () => {
        try {
            const data = await getOnlineCount()
            setCount(data.count)
        } catch (error) {
            console.log("Failed to fetch online count", error)
        } finally {
            setLoading(false)
        }
    },[])

    useEffect(() => {
        // it was loading too fast and user didnt see himself as 1 online
        setTimeout(()=>{
            void fetchCount()
        },500)
        
    },[])

    return {count, loading}
}