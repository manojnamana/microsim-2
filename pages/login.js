import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button, FormControl, IconButton, InputLabel, OutlinedInput, Paper, Typography, Snackbar, Alert, Stack, Grid, Chip } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link } from '@mui/material';
import Google from "@mui/icons-material/Google";
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie'


const Login = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [waiting, setwaiting] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
   
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();
  const navigate = useRouter();
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setSnackbarMessage('Please fill in all fields.');
      setOpenSnackbar(true);
    } else if (!validateEmail(email)) {
      setSnackbarMessage('Please enter a valid email address.');
      setOpenSnackbar(true);
    } else {
      setwaiting(true)
      try {
        setwaiting(true)
        const response = await axios.post('https://micro-sim-backend.vercel.app/api/login/', { email, password, });

        
        if (response.status === 200) {
          setSnackbarMessage('Login successful!');
          setwaiting(false)
          setOpenSnackbar(true);
          Cookies.set('access_token', response.data.access, { expires: 7 });
          setTimeout(() => navigate.push("/verify?access_token=" + response.data.access), 3000);
        }
      } catch(error) {
        setwaiting(false)
        setSnackbarMessage(error.response?.data?.error || "No user found with this email address! ");
        setOpenSnackbar(true);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://micro-sim-backend.vercel.app/accounts/google/login/';
  };
  
  return (
    <Box>
      <Stack flexDirection={"row"} justifyContent={"center"} alignItems={"center"} display={{ md: "none" }}>
        <Stack alignItems={"flex-end"}>
          <img src='/static/images/MicroSim Learning Logo-Black.png' alt ="logo" width={60} />
        </Stack>
        <Typography fontSize={{ md: "20", xs: 25 }}  fontWeight={"bold"} my={3} >
        MicroSim Learning
        </Typography>
      </Stack>

      <Grid container alignItems={"center"} p={2} sx={{md:{display:"flex",justifyContent:"center", height:"100vh",flexDirection:"column"}}} >
        <Grid size={{md:6,xs:12}} sx={{display:{xs:"none",md:"flex"}}}>
          <Stack flexDirection={"row"} alignItems={"center"} justifyContent={"center"} ml={6}>
            <img src='/static/images/MicroSim Learning Logo-Black.png' alt ="logo" width={100} height={200}/>
            <Typography fontSize={35} fontWeight={"bold"}>MicroSim Learning</Typography>
          </Stack>
        </Grid>
        <Grid size={{md:6,xs:12}} sx={{paddingLeft:{  md: 30 }} }>
          <Paper
            elevation={3}
            sx={{
              display: "flex", justifyContent: 'center', flexDirection: "column", alignItems: "center",
              mt: { md: "12%", xs: "0" }, mb: { md: "10%", xs: "15%" }, p: 3, mx: {xs:"5%",md:'10%'}, maxWidth: 450,
              boxShadow:10
            }}
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <Typography fontSize={{ md: "20", xs: 25 }} textAlign={"center"} fontWeight={"bold"} my={3} >
              Login
            </Typography>
            <FormControl sx={{ m: 1, width: '80%' }} variant="outlined">
              <TextField
                autoFocus
                required
                margin="dense"
                id="name"
                name="email"
                sx={{ mb: 3 }}
                placeholder='Email Address'
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!validateEmail(email) && email.length > 0}
                helperText={!validateEmail(email) && email.length > 0 ? "Invalid email format" : ""}
              />
            </FormControl>
            <FormControl sx={{ m: 1, width: '80%' }} required variant="outlined">
              <OutlinedInput
                placeholder='Password'
                // id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                // label="Password"
              />
            </FormControl>
            {waiting ? 
              <Button variant='contained' disabled sx={{ my: 3 }} >Login</Button> 
              : 
              <Button variant='contained' type='submit' sx={{ my: 3 }} >Login</Button>
            }
<Stack direction={{md:"row",xs:"column"}} display={"flex"} justifyContent={"space-between"} spacing={4}>
  <Link href="/register" underline='none' fontSize={20} >
  Create New Account
  </Link>
  <Link href="/forgotpassword" underline='none' fontSize={20}>
    Forgot password ?
  </Link>
</Stack>
            <Stack mt={3}>
              <Button onClick={handleGoogleLogin}>
                <Chip variant="filled" label ="Login with Google" icon={<Google style={{color:'white'}} />} color='error' />
              </Button>
            </Stack>
          </Paper>
        </Grid>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarMessage === 'Login successful!' ? 'success' : 'error'} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Grid>
    </Box>
  );
}

export default Login;
