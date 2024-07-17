// import React from 'react';
// import videojs from 'video.js';
// import VideoJS from './VideoPlayer'

// const App = () => {
//   const playerRef = React.useRef(null);

//   const videoJsOptions = {
//     autoplay: true,
//     controls: true,
//     responsive: true,
//     playbackRates: [0.25, 0.5, 1, 1.25, 1.5, 2],
//     fluid: true,
//     width: 520,
//     height: 300,
    
//     sources: [{
//       src: 'https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4',
//       type: 'video/mp4'
//     }]
//   };

//   const handlePlayerReady = (player) => {
//     playerRef.current = player;

//     // You can handle player events here, for example:
//     player.on('waiting', () => {
//       videojs.log('player is waiting');
//     });

//     player.on('dispose', () => {
//       videojs.log('player will dispose');
//     });
//   };

//   return (
//     <>
//       <div>Rest of app here</div>
//       <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
//       <div>Rest of app here</div>
//     </>
//   );
// }

// export default App;


import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
`;

const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  margin-top: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const UploadForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }
`;

const UploadButton = styled(motion.button)`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-top: 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }
`;

const Message = styled(motion.p)`
  color: white;
  font-size: 1.2rem;
  margin-top: 1rem;
`;

const ProgressBar = styled(motion.div)`
  width: 100%;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  margin-top: 1rem;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background-color: #4CAF50;
`;

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const uploadFile = async (e) => {
    e.preventDefault();
    if (!file) return;

    const chunkSize = 5 * 1024 * 1024; // 5MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    const fileId = Date.now();

    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('fileId', fileId);
      formData.append('chunkIndex', i);
      formData.append('totalChunks', totalChunks);

      await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProgress(((i + 1) / totalChunks) * 100);
    }

    setMessage('File uploaded successfully');
  };

  return (
    <AppContainer>
      <Title>Upload Video in Chunks</Title>
      <UploadForm onSubmit={uploadFile}>
        <FileInput
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files[0])}
          id="file-input"
        />
        <FileInputLabel htmlFor="file-input">
          {file ? file.name : 'Choose a video file'}
        </FileInputLabel>
        <UploadButton
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Upload
        </UploadButton>
        {progress > 0 && (
          <ProgressBar>
            <ProgressFill
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </ProgressBar>
        )}
      </UploadForm>
      {message && (
        <Message
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {message}
        </Message>
      )}
    </AppContainer>
  );
}

export default App;