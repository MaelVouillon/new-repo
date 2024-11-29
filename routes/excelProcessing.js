// backend/routes/excelProcessing.js

const express = require('express');
const multer = require('multer');
const { read, utils } = require('xlsx');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const isEmptyRow = (row) => {
  return !row || row.every(cell => cell === null || cell === undefined || cell === '');
};

const isEmptyColumn = (data, colIndex) => {
  return data.every(row => !row[colIndex] || row[colIndex] === '');
};

const findTables = (sheetData) => {
  const tables = [];
  let currentRow = 0;

  while (currentRow < sheetData.length) {
    while (currentRow < sheetData.length && isEmptyRow(sheetData[currentRow])) {
      currentRow++;
    }

    if (currentRow >= sheetData.length) break;

    const startRow = currentRow;
    let endRow = startRow;
    let startCol = 0;
    let endCol = sheetData[startRow].length - 1;

    while (endRow < sheetData.length && !isEmptyRow(sheetData[endRow])) {
      endRow++;
    }

    while (startCol <= endCol && isEmptyColumn(sheetData.slice(startRow, endRow), startCol)) {
      startCol++;
    }
    while (endCol >= startCol && isEmptyColumn(sheetData.slice(startRow, endRow), endCol)) {
      endCol--;
    }

    if (endRow > startRow && endCol >= startCol) {
      const tableData = sheetData
        .slice(startRow, endRow)
        .map(row => row.slice(startCol, endCol + 1));

      const headers = tableData[0].map((header) => String(header || '').trim());

      const data = tableData.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });

      tables.push({
        name: `Tableau ${tables.length + 1}`,
        columns: headers,
        data,
        startRow,
        startCol
      });
    }

    currentRow = endRow + 1;
  }

  return tables;
};

const processExcelSheets = (workbook) => {
  if (!workbook || !workbook.SheetNames || !workbook.Sheets) {
    return [];
  }

  return workbook.SheetNames.map(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const rawData = utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: null,
      blankrows: false
    });

    return {
      name: sheetName,
      tables: findTables(rawData)
    };
  }).filter(sheet => sheet.tables.length > 0);
};

router.post('/process-excel', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const fileType = file.originalname.split('.').pop()?.toLowerCase();

    if (!fileType || (fileType !== 'xlsx' && fileType !== 'xls')) {
      return res.status(400).json({ error: 'Type de fichier non reconnu ou non supporté' });
    }

    const workbook = read(file.buffer, { type: 'buffer' });

    const sheets = processExcelSheets(workbook);

    res.json({
      id: uuidv4(),
      name: file.originalname,
      type: 'excel',
      sheets,
      uploadedAt: Date.now(),
    });
  } catch (error) {
    console.error('Erreur de traitement:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;