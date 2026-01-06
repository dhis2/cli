import { Menu, MenuItem } from '@dhis2/ui'
import * as React from 'react'
import { useNavigate, useLocation } from 'react-router'

const AppMenu = () => {
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div>
            <Menu>
                <MenuItem
                    active={location.pathname === '/'}
                    onClick={() => {
                        navigate(`/`)
                    }}
                    label="Home"
                />
                <MenuItem
                    active={location.pathname == '/about'}
                    onClick={() => {
                        navigate(`/about`)
                    }}
                    label="About"
                />
            </Menu>
        </div>
    )
}

export default AppMenu
