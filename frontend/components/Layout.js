'use client'

import { useEffect, Suspense } from "react"
import { useHackathonStore } from "../store/useHackathonStore";


const Layout = ({ children }) => {
    const { fetchHackathons } = useHackathonStore();
    
    useEffect(()=>{
        fetchHackathons();
    }, [])

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">
            Loading...
        </div>}>
            <div >
                <main >{children}</main>
            </div>
        </Suspense>
    )
}

export default Layout
