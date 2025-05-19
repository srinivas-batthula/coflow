'use client'

import { useEffect, Suspense } from "react"


const Layout = ({ children }) => {

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
