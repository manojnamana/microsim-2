import { CircularProgress, Stack } from '@mui/material'
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import React from 'react'

const verify = () => {
    const router = useRouter();
    const  token  = router.query;

  console.log(token);
  if(token?.access_token){
    Cookies.set("access_token", token?.access_token);
    router.push("/home");
  }

    
    
  return (
    <Stack display={"flex"} justifyContent={"center"} alignItems={"center"} height={"100vh"}>
        <CircularProgress />
    </Stack>
  )
}

export default verify