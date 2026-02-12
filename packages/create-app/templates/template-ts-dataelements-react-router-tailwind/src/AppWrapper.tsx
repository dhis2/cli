import React from 'react'
import { HashRouter, Route, Routes } from 'react-router'
import App from '@/App'
import AboutPage from '@/components/About'
import AppMenu from '@/components/AppMenu'
import './index.css'

const AppWrapper = () => {
    return (
        <div className="grid min-h-full grid-cols-1 grid-rows-[auto_1fr_auto] text-sm md:min-h-[1000px] md:grid-cols-[250px_1fr] md:grid-rows-[1fr_auto]">
            {/* 
        For the client-side routing to work on a DHIS2 server, it needs to use HashRouter 
        otherwise it will interfer with the server-side routing
        */}
            <HashRouter>
                <div className="w-full">
                    <AppMenu />
                </div>
                <div className="w-full ps-2">
                    <Routes>
                        <Route path="/" element={<App />} />
                        <Route path="/about" element={<AboutPage />} />
                    </Routes>
                </div>
                <div className="mt-4 flex w-full flex-col items-center gap-1.5 bg-[#2c6693] p-4 text-white md:col-span-2">
                    <div>{'{{template-name}}'}</div>
                    <div>
                        This web application was created using{' '}
                        <a
                            className="text-white underline"
                            target="_blank"
                            rel="noreferrer"
                            href="https://developers.dhis2.org/docs/quickstart/quickstart-web"
                        >
                            @dhis2/create-app
                        </a>
                    </div>
                </div>
            </HashRouter>
        </div>
    )
}

export default AppWrapper
