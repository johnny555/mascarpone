import Webcam from "react-webcam";
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import React from 'react';
import Tesseract from 'tesseract.js';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import Alert from '@mui/material/Alert';
import AlertTitle from "@mui/material/AlertTitle";
import Stack from '@mui/material/Stack';


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

// App Bit

const image_dim = {width: 580, height: 280};

function App() {

  const webcamRef = React.useRef(null);

  const [imgSrc, setImgSrc] = React.useState(null);
  const [textSrc, setTextSrc] = React.useState(null);


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

// To show camera

 var blah = (
  <Container maxWidth="sm">
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
    
    <Container maxWidth="sm">
     <Typography variant="h4" gutterBottom>
        Lake Monger Community Shed
        Attendance Book
     </Typography>
    </Container>

    <Container maxWidth="sm">
     <Alert severity="info" sx={{width:550}} >
      <AlertTitle><strong>Please Scan Your Badge</strong></AlertTitle>
     </Alert>
    </Container>

    {blah}
    
    <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom>
          Membership #:  
          { textSrc }
        </Typography>
    </Container>
    
    <Container maxWidth="sm">
        <Webcam 
          ref={webcamRef} 
          screenshotFormat={'image/jpeg'}
          screenshotQuality={0.1}
          imageSmoothing={false}
          videoConstraints={image_dim}
        />
    </Container>
    
    <Container maxWidth="sm">
       <Fab color='primary' 
            variant="extended" 
            onClick={capture}
            sx={{width:580}}
            >
          <CameraAltOutlinedIcon sx={{ mr:2}}/>
          Scan Now
      </Fab>
    </Container>

    
    </Stack>
    </div>
  );
}

export default App;
