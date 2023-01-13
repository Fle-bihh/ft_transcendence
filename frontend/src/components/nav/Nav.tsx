
import React, { useState } from "react";
import {AppBar, Box, Menu, MenuItem, styled, Toolbar, Typography} from "@mui/material";
import {NavLink} from "react-router-dom"
import "./nav.scss"
import LogoutIcon from '@mui/icons-material/Logout';


import {Home as HomeIcon, PersonAdd, AccountCircle, Notifications, Message, Menu as MenuIcon} from "@mui/icons-material/";

const Navbar = (props: any) => {
    const StyledToolbar = styled(Toolbar)({
        display: "flex",
        justifyContent: "space-between",
    });
    const ItemsNav = styled(Box)({
        display: "flex",
        gap: 15,
    })
    const ItemsInNav = [{Name: <PersonAdd/>, Link:'/'},
    {Name: <Notifications/>, Link:'#'},
    {Name: <Message/>, Link:'/Chat'},
    {Name: <AccountCircle/>, Link:'/Profile'},
    {Name: <LogoutIcon/>, Link:'/Signin'}
    ];

    const HomeBox = styled(Box)({
        display: "flex",
        gap: 15,
        
 
    })
    const HomeItems = [{Name: 'Home', Link:'/'},
    {Name: 'Versions', Link:'/versions'}
    ];
    const [open, Setopen]= useState(false);
    const [open2, Setopen2]= useState(false);


    return (
        <AppBar sx={{background: 'white', opacity: 0.8}}  >
            <StyledToolbar>

                {/* La barre des Items HOME */}
                <HomeBox sx={{display: {xs:'none', sm:'none', md:'flex'}}}>
                    {HomeItems.map((item)=>(

                     
                        <NavLink to={`${item.Link}`} className='link'>
                    <Typography sx={{cursor: "pointer", frontSize: "14px", color:'black'}}>
                            {item.Name}
                      </Typography>
                    </NavLink>
                       
                    ))}
                </HomeBox>
                <HomeIcon
                    sx={{
                        display: {xs:'block', sm:'block', md:'none'},color:'black'
                    }}
                    onClick={() =>Setopen(!open)}
                />


                 {/* La barre des Items NAV  */}
                <ItemsNav sx={{display: {xs:'none', sm:'none', md:'flex'}, }}>
                    {ItemsInNav.map((item)=>(
                 



                    /* <a href={item.Link} className='link'> */
                    <NavLink to={`${item.Link}`} className='link'>
                    <Typography sx={{cursor: "pointer", frontSize: "14px", color:'black'}}>
                            {item.Name}
                    </Typography>
                    </NavLink>
                    /* </a> */
                
                    ))}
                </ItemsNav>
                <MenuIcon
                    sx={{
                        display: {xs:'block', sm:'block', md:'none'},color:'black'
                    }}
                    onClick={() =>Setopen2(!open2)}
                />
            </StyledToolbar>
            
            
            {/* Pour rétrécir la bar des Items Nav */}
            <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                open={open2}
                onClose={() =>Setopen2(!open2)}
                anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
                }}
                transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
                }}
            >
                <Box sx={{width: 150, height:'21vh'}}>
                {ItemsInNav.map((item)=>(
                    // <a href={item.Link} className='little-link'>
                    <NavLink to={`${item.Link}`} className='little-link'>
                    <MenuItem sx={{cursor: "pointer", frontSize: "14px", color: "balck" }}>
                            {item.Name}
                    </MenuItem>
                    </NavLink>
                    // </a>
                    ))}
                </Box>
            </Menu>

                 {/* Pour rétrécir la bar des Items Home */}
            <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                open={open}
                onClose={() =>Setopen(!open)}
                anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
                }}
                transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
                }}
            >
                <Box sx={{width: 150, height:'10vh'}}>
                    {HomeItems.map((item)=>(

                          <NavLink to={`${item.Link}`} className='little-link'>
                        <MenuItem sx={{cursor: "pointer", frontSize: "14px", color: "balck"}}>
                            {item.Name}
                        </MenuItem>
                        </NavLink>
                    ))}
                </Box>
            </Menu>
        </AppBar>
    );
};

export default Navbar;
