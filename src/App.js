import Webcam from "react-webcam";
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import React from 'react';
import Tesseract from 'tesseract.js';


function preprocess(img) {
  return img;
}



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

const image_dim = {wdith: 640, height: 280};

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


 var blah = (
  <Container maxWidth="sm">
  {imgSrc && (
    <img width={640}
      src={imgSrc}
    />
  )}
</Container>
 );

  return (
    <div>
    <Container maxWidth="sm">
     <Typography variant="h3" gutterBottom>
        Please scan your card
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
       <Fab variant="extended" onClick={capture}>Scan Now</Fab>
    </Container>
    <Container maxWidth="sm">

      { textSrc && (
        <Typography variant="h4" gutterBottom>
          { textSrc }
        </Typography>
      )}

    </Container>
    {blah}

    </div>
  );
}

export default App;
