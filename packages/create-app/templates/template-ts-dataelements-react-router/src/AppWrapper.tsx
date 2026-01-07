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
                <div className={classes.footer}>
                    <div>{'{{template-name}}'}</div>
                    <div>
                        This web application was created using{' '}
                        <a
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
