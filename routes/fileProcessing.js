// backend/routes/fileProcessing.js

const express = require('express');
const multer = require('multer');
const Papa = require('papaparse');
const { read, utils } = require('xlsx');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/process-file', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const fileType = file.originalname.split('.').pop()?.toLowerCase();

    if (!fileType) {
      return res.status(400).json({ error: 'Type de fichier non reconnu' });
    }

    if (fileType === 'csv') {
      Papa.parse(file.buffer.toString(), {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && Array.isArray(results.data)) {
            const filteredData = results.data.filter((row) =>
              Object.values(row).some(value => value !== '')
            );

            res.json({
              id: uuidv4(),
              name: file.originalname,
              type: 'csv',
              data: filteredData,
              uploadedAt: Date.now(),
            });
          } else {
            res.status(400).json({ error: 'Structure CSV invalide' });
          }
        },
        error: (error) => {
          res.status(400).json({ error: `Erreur CSV: ${error.message}` });
        },
      });
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      const workbook = read(file.buffer, { type: 'buffer' });

      if (!workbook.SheetNames.length) {
        return res.status(400).json({ error: 'Aucune feuille trouvée dans le fichier Excel' });
      }

      const sheets = {};
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(sheet, {
          header: 1,
          defval: null,
          blankrows: false
        });
        if (jsonData.length > 0) {
          sheets[sheetName] = jsonData;
        }
      });

      res.json({
        id: uuidv4(),
        name: file.originalname,
        type: 'excel',
        data: workbook,
        sheets,
        uploadedAt: Date.now(),
      });
    } else if (fileType === 'json') {
      const text = file.buffer.toString();
      try {
        const jsonData = JSON.parse(text);
        const processedData = Array.isArray(jsonData) ? jsonData : [jsonData];

        res.json({
          id: uuidv4(),
          name: file.originalname,
          type: 'json',
          data: processedData,
          uploadedAt: Date.now(),
        });
      } catch (error) {
        res.status(400).json({ error: 'Format JSON invalide' });
      }
    } else {
      res.status(400).json({ error: 'Format de fichier non supporté' });
    }
  } catch (error) {
    console.error('Erreur de traitement:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;