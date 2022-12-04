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

import csvDownload from 'json-to-csv-export'

import { Amplify } from 'aws-amplify';
import config from './aws-exports';

import { DataStore } from '@aws-amplify/datastore';
import { AttendanceBook } from './models';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(config);


async function save_number(number) {
  await DataStore.save(
    new AttendanceBook({
		"time": new Date().toISOString(),
		"membership_number": parseInt(number)
	}));
  console.log("transmitted" + parseInt(number));
}

async function get_attendance_book() 
{

  const book = await DataStore.query(AttendanceBook);
  const data_dump = [];
  book.map((m) => {
    data_dump.push({
      time: m.time,
      membership_number: m.membership_number
    });
  });

  console.log(data_dump);
  const dataToConvert = {
    data: data_dump,
    filename: 'attendance_Book.csv',
    delimiter: ',',
  }
  

  csvDownload(dataToConvert);
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

const image_dim = {width: 400, height: 500};
//crops total h w of image capture box

const style = {
//changes style of 'That's Wrong' dialog box
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '4px solid #009688',
  boxShadow: 24,
  p: 5,
};

//function App({ signOut, user }) {
  function App() {

  const webcamRef = React.useRef(null);

  const [imgSrc, setImgSrc] = React.useState("https://i.natgeofe.com/n/548467d8-c5f1-4551-9f58-6817a8d2c45e/NationalGeographic_2572187_square.jpg?w=204&h=204");
  const [textSrc, setTextSrc] = React.useState(null);

  const [openModal, setOpenModal] = React.useState(false);
  
  const [showVideoFeed, setShowVideoFeed] = React.useState(true);

  const handleOpenModal = () => setOpenModal(true);
  
  const handleCloseModal = () => {
    setOpenModal(false);
    clearstuff();
  }

  const capture = React.useCallback(() => {

    const imageSrc = preprocess(
      webcamRef.current.getScreenshot(image_dim));
    
    setImgSrc(imageSrc);
    console.log(imageSrc);
    setShowVideoFeed(false);
 
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
    setTextSrc("");
    setImgSrc("https://i.natgeofe.com/n/548467d8-c5f1-4551-9f58-6817a8d2c45e/NationalGeographic_2572187_square.jpg?w=204&h=204");
    setShowVideoFeed(true);
    console.log("cleared stuff ran!")
  };

  const save_and_clear = () => {
    
    if (textSrc) {
      save_number(textSrc);
      console.log("Sending textSrc")
      console.log("text src");
    };
    console.log("cleared");

    clearstuff();
  };
  

/*
 var amplify_stuff = (
  <div>
  <Typography variant="h1">Hello {user.username}</Typography>
    <Button onClick={signOut}>Sign out</Button>
    <h2>Amplify Todos</h2>
    </div>
 );*/

 var videoFeedSx;
 var screenshotSx;

 if (showVideoFeed) 
 {
  videoFeedSx = [];
  screenshotSx = { display: 'none' };
 } else
 {
  videoFeedSx = { display: 'none' };
  screenshotSx = [];
 }

 // UI Stuff
  return (
  <div>
    <Stack 
    mt={2}
    spacing={1}
    alignItems="center">
    


    <Container sx={{ width: '100%' }}>
     <Typography variant="h5" gutterBottom>
        Lake Monger Community Shed
        Attendance Book
     </Typography>
     <Divider />
    </Container>
    <Divider />

    <Container >
        <Typography variant="h4" gutterBottom>
          Membership #:{ textSrc }
        </Typography>
    </Container>

    <Container sx={screenshotSx}>
    <Stack spacing={1} direction="row">
        <Button 
        sx={{ width: '100%' }} 
        onClick={save_and_clear} 
        variant="contained" 
        color="success" 
        size="large">
          That's correct
        </Button>
        <Button 
        sx={{ width: '100%' }} 
        onClick={handleOpenModal} 
        variant="outlined" 
        color="error" 
        size="large">
          That's wrong
        </Button>
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h4">
              Please scan your badge again
            </Typography>
            <Typography id="modal-modal-description" variant="h5" sx={{ mt: 1}}>
              Make sure it's not upside down.
            </Typography>
          </Box>
        </Modal>
        
      </Stack>
    </Container>
    <Divider />
 
    <Container sx={videoFeedSx} >
        <Webcam 
          ref={webcamRef} 
          screenshotFormat={'image/jpeg'}
          screenshotQuality={0.1}
          imageSmoothing={false}
          videoConstraints={image_dim}
        />
    </Container>

    <Container sx={screenshotSx} >
        <img 
          width={300} height={500}
          src={imgSrc}
        />
    </Container>

    
    <Container>
       <Fab sx={{ width: '100%' }}
            color='primary' 
            variant="extended" 
            onClick={capture}>
            <Typography variant="h5">          
            <CameraAltOutlinedIcon sx={{ fontSize:"20px", mx:2 }}/>
            Please Scan Your Badge
            </Typography>
      </Fab>
    </Container>
    
    <Container>
       <Fab sx={{ width: '100%' }}
            color='secondary' 
            variant="extended" 
            onClick={get_attendance_book}>
            Download Logs
      </Fab>
    </Container>
    </Stack>
    </div>
  );

}

export default App;
