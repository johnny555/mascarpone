import React from 'react';
import Webcam from "react-webcam";
import Tesseract from 'tesseract.js';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import Modal from '@mui/material/Modal';

function preprocess(img) {
  return img;
}

// OCR Bit

async function recognize (image, langs, options) 
{
  const worker = Tesseract.createWorker(options);
  await worker.load();
  await worker.loadLanguage(langs);
  await worker.initialize(langs);
  await worker.setParameters({tessedit_char_whitelist: "0123456789"})
  return worker.recognize(image)
    .finally(async () => {
      await worker.terminate();
    });
}

// App Bit and webcam

const image_dim = {width: 580, height: 500};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '4px solid #009688',
  boxShadow: 24,
  p: 10,
};

function App() {

  const webcamRef = React.useRef(null);

  const [imgSrc, setImgSrc] = React.useState(null);
  const [textSrc, setTextSrc] = React.useState(null);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const capture = React.useCallback(() => {
    const imageSrc = preprocess(
      webcamRef.current.getScreenshot(image_dim
    ));
    setImgSrc(imageSrc);
 
    recognize(
      imageSrc,
      'eng',
         { logger: m => console.log(m)
         }
      ).then(({ data: { text } }) => {
        setTextSrc(text);
      }) 
  }, [webcamRef, setImgSrc]);

  const clearstuff = () => {
    setTextSrc("");
    setImgSrc("https://i.natgeofe.com/n/548467d8-c5f1-4551-9f58-6817a8d2c45e/NationalGeographic_2572187_square.jpg?w=204&h=204");
  };
  
// Camera Bit

 var cameracapture = (
  <Container sx={{ width: '100%' }} >
    <img width={580} height={280}
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
     <Typography variant="h5" gutterBottom>
        Lake Monger Community Shed
        Attendance Book
     </Typography>
    </Container>

    <Container sx={{ width: '100%' }}>
    <Typography variant="h5" gutterBottom>
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
              We also told the computer it got it wrong for training purposes.
            </Typography>
          </Box>
        </Modal>
        
      </Stack>
    </Container>
    <Divider />
    
    {cameracapture}

    <Container sx={{ width: '100%' }}>
        <Webcam 
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

export default App;
