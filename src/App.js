import React from 'react';
import Webcam from "react-webcam";

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import Modal from '@mui/material/Modal';

import Alert from '@mui/material/Alert';
import AlertTitle from "@mui/material/AlertTitle";

import { DataStore } from '@aws-amplify/datastore';
import { AttendanceBook } from './models';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

async function save_number(number) {
  await DataStore.save(
    new AttendanceBook({
		"time": new Date().toISOString(),
		"membership_number": number
	}));
}

function preprocess(img) {
  return img;
}

function parse_response(json_response) {
  var data = json_response["data"][1]["data"];
  var snippets = data.map((d) => {return d[0];});
  var result = "";

  snippets.map((s) => {
    console.log(s);
    var temp = s.match(/\d{3}/);
    if (temp) 
      { result = result + temp } 
  });

  if (result === "") 
  { result = "No digits found, try again"; }
  return result;
}

// App Bit

const image_dim = {width: 500, height: 280};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  bgcolor: 'background.paper',
  border: '4px solid #009688',
  boxShadow: 24,
  p: 5,
};

function App({ signOut, user }) {

  const webcamRef = React.useRef(null);

  const [imgSrc, setImgSrc] = React.useState("https://i.natgeofe.com/n/548467d8-c5f1-4551-9f58-6817a8d2c45e/NationalGeographic_2572187_square.jpg?w=204&h=204");
  const [textSrc, setTextSrc] = React.useState(null);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    clearstuff()
  }

  const capture = React.useCallback(() => {

    const imageSrc = preprocess(
      webcamRef.current.getScreenshot(image_dim));
    
    setImgSrc(imageSrc);
 
    fetch('https://hf.space/embed/tomofi/EasyOCR/+/api/predict/', 
      { method: "POST", 
        body: JSON.stringify({ "data": [ imageSrc , ["en"] ]})
       , headers: { "Content-Type": "application/json" } }
     ).then(function(response) 
         { return response.json(); }
         ).then(
          function(json_response)
          { 
          setTextSrc(parse_response(json_response));
         });
    
  }, [webcamRef, setImgSrc]);

  const clearstuff = () => {
    save_number(textSrc);
    setTextSrc("");
    setImgSrc("https://i.natgeofe.com/n/548467d8-c5f1-4551-9f58-6817a8d2c45e/NationalGeographic_2572187_square.jpg?w=204&h=204");
  };
  
// Camera Bit

 var cameracapture = (
  <Container>
    <img 
      width={500} height={280}
      src={imgSrc}
    />
</Container>
 );

 // UI Stuff
  return (
  <div>
    <Stack 
    mt={2}
    spacing={1}
    alignItems="center">
    
    <Container sx={{ width: '100%' }}>
    <Typography variant="h1">Hello {user.username}</Typography>
    <Button onClick={signOut}>Sign out</Button>
    <h2>Amplify Todos</h2>

     <Typography variant="h6" gutterBottom>
        Lake Monger Community Shed
        Attendance Book
     </Typography>
    </Container>

    <Container sx={{ width: '100%' }}>
    <Typography variant="h6" gutterBottom>
        Please scan your badge
     </Typography>
     <Divider />
    </Container>
    <Divider />

    <Container sx={{ width: '100%' }}>
        <Typography variant="h4" gutterBottom>
          Membership #:{ textSrc }
        </Typography>
    </Container>

    <Container sx={{ width: '100%' }}>
    <Stack spacing={1} direction="row">
        <Button 
        sx={{ width: '100%' }} 
        onClick={clearstuff} 
        variant="contained" 
        color="success" 
        size="large">
          That's correct
        </Button>
        <Button 
        sx={{ width: '100%' }} 
        onClick={handleOpen} 
        variant="outlined" 
        color="error" 
        size="large">
          That's wrong
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h3">
              Please scan your badge again
            </Typography>
            <Typography id="modal-modal-description" variant="h5" sx={{ mt: 2 }}>
              Make sure it's not upside down.
            </Typography>
          </Box>
        </Modal>
        
      </Stack>
    </Container>
    <Divider />
    
    {cameracapture}

    <Container sx={{ width: '100%' }}>
        <Webcam 
          sx={{ width: '10%' }}
          ref={webcamRef} 
          screenshotFormat={'image/jpeg'}
          screenshotQuality={0.1}
          imageSmoothing={false}
          videoConstraints={image_dim}
        />
    </Container>
    
    <Container>
       <Fab sx={{ width: '100%' }}
            color='primary' 
            variant="extended" 
            onClick={capture}>
          <CameraAltOutlinedIcon sx={{ mr:2}}/>
          Scan Now
      </Fab>
    </Container>
    </Stack>
    </div>
  );

}

export default withAuthenticator(App);
