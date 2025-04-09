import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';


const Header = () => {
  const navigate = useRouter()
  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{ 
        bgcolor: 'white', 
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
        py: 1,px:3
      }}
    >

        <Toolbar disableGutters sx={{ display:'flex',justifyContent: 'space-between',flexDirection:{xs:'column',md:'row'},alignItems:'center' }}>
          {/* Left Side */}
          <Box sx={{ display: 'flex', alignItems: 'center'}}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Image
                src="/MicroSim Learning Logo-Black.png"
                alt="Logo"
                width={30}
                height={30}
              />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  color: 'black'
                }}
              >
                MicroSim Learning
              </Typography>
            </Box>
          </Box>

          {/* Right Side */}
          <Box sx={{ display: 'flex', gap: 2 }}>
          <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg text-sm">
         Help
       </button>
            <button onClick={()=>(navigate.push('/'),Cookies.remove('access_token'))} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm">
         Logout
       </button>
          </Box>
        </Toolbar>

    </AppBar>
  );
};

export default Header;