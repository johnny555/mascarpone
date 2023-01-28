import React from 'react';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

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

///// App CSV Download
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

///// App Bit

//changes style of 'Thankyou' modal box
const style = {

  position: 'absolute',
  top: '60%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '4px solid #009688',
  boxShadow: 24,
  p: 5,
};

function App() {
  //handle input
  const [textSrc, setTextSrc] = React.useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTextSrc(value);
  };

  const [openModal, setOpenModal] = React.useState(false);
  const handleOpenModal = () => {
    setOpenModal(true);
    setTimeout(() => {
      handleCloseModal();
    }, 3000);
  }


  const save_and_clear = (e) => {
    e.preventDefault();
    handleOpenModal();
    if (textSrc) {
      save_number(textSrc);
      console.log("Sending textSrc")
      console.log("text src");
    };
    console.log("cleared");
  };

  //handle modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setTextSrc("");

  };

 ///// UI Stuff
  return (
  <div>
    <Stack 
    mt={2}
    spacing={1}
    alignItems="center">

    <Container>
    <Box     
    component="img"
        sx={{
          height: 150,
        }}
        src="https://www.lakemongershed.org.au/uploads/9/3/0/7/93073146/lake-monger-community-shed-logo-352px_orig.png">
    </Box>
    </Container>

    <Container sx={{ width: '100%' }}>
     <Typography variant="h4" gutterBottom sx={{color: 'primary.main' }}>
       Please log your attendance here, no need to sign out.
     </Typography>
     <Divider />
    </Container>
    <Divider/>

    <Container>
    <Box >
      <form onSubmit={save_and_clear}>
        <TextField 
        value={textSrc}
        onChange={handleInputChange}
        type='number' fullWidth label="Enter your Membership Number" id="outlined-basic" variant='outlined'
        inputProps={{ style: { fontSize: "5rem" } }}/>
      </form>
    </Box>
    <Divider />
    </Container>
    <Divider/>

    <Container sx={{ width: '100%' }}>
     <Typography variant="h5" gutterBottom>
       Instructions
     </Typography>
     <Typography variant="body1" gutterBottom>
       1. Tap in the box to enter your Membership Number.<br/>
       2. A keyboard will appear, enter your numbers.<br/>
       3. Tap the Enter key, a modal appears confirming submission.<br/>
       4. The modal disappears and the box is reset for the next person.<br/>
     </Typography>
    </Container>

    <Container>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h4" component="h2">
            Thankyou
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Tap outside this box to dismiss, or wait 3 seconds
          </Typography>
        </Box>
      </Modal>
    </Container>

    <Container>
       <Fab sx={{ width: 'fullwidth', 
       position: 'fixed',
       bottom: (theme) => theme.spacing(3),
       right:(theme) => theme.spacing(2) 
       }}
             
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
