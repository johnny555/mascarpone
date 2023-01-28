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
  top: '50%',
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
     <Typography variant="h4" gutterBottom>
       Please log your attendance here, no need to sign out.
     </Typography>
     <Divider />
    </Container>
    <Divider/>

    <Container>
    <Box>
      <form onSubmit={save_and_clear}>
        <TextField 
        value={textSrc}
        onChange={handleInputChange}
        type='number' fullWidth label="Enter your Membership Number" id="fullWidth"
        inputProps={{ style: { fontSize: "5rem" } }}/>
      </form>
    </Box>
    </Container>

    <Container>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Text in a modal
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
        </Box>
      </Modal>
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
