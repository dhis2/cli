import React from 'react'
import { HashRouter, Route, Routes } from 'react-router'
import App from '@/App'
import classes from '@/App.module.css'
import AboutPage from '@/components/About'
import AppMenu from '@/components/AppMenu'

const AppWrapper = () => {
    return (
        <div className={classes.appWrapper}>
            {/* 
        For the client-side routing to work on a DHIS2 server, it needs to use HashRouter 
        otherwise it will interfer with the server-side routing
        */}
            <HashRouter>
                <div className={classes.sidebar}>
                    <AppMenu />
                </div>
                <div className={classes.main}>
                    <Routes>
                        <Route path="/" element={<App />} />
                        <Route path="/about" element={<AboutPage />} />
                    </Routes>
                </div>
                <div className={classes.footer}>Our App</div>
            </HashRouter>
        </div>
    )
}

export default AppWrapper
