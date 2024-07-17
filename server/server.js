const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());

const upload = multer({ dest: 'tmp/' });

app.post('/upload', upload.single('chunk'), (req, res) => {
  const { fileId, chunkIndex, totalChunks } = req.body;
  const chunkFilePath = path.join(__dirname, 'tmp', `${fileId}_${chunkIndex}`);

  console.log(`Received chunk ${chunkIndex} of ${totalChunks} for file ${fileId}`);

  fs.rename(req.file.path, chunkFilePath, (err) => {
    if (err) return res.status(500).send('Error saving chunk');

    console.log(`Chunk ${chunkIndex} saved successfully`);

    if (parseInt(chunkIndex, 10) === parseInt(totalChunks, 10) - 1) {
        console.log(`All chunks received for file ${fileId}. Assembling file...`);
    
      const fileWriteStream = fs.createWriteStream(path.join(__dirname, 'uploads', `${fileId}.mp4`));
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(__dirname, 'tmp', `${fileId}_${i}`);
        const data = fs.readFileSync(chunkPath);
        fileWriteStream.write(data);
        fs.unlinkSync(chunkPath);

        console.log(`Chunk ${i} appended to the final file and deleted from tmp`);
      }
      fileWriteStream.end();
      fileWriteStream.on('finish', () => {
        console.log(`File ${fileId}.mp4 assembled successfully`);
        res.send('File uploaded and assembled');
      });
    } else {
      res.send('Chunk uploaded');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});