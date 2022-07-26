// テスト用のテキストファイルを生成する
// ==================================================

const fs               = require('fs');
const path             = require('path');
const childProcess     = require('child_process');
const encodingJapanese = require('encoding-japanese');

module.exports = function generateInputTexts() {
  console.log('Generate Input Texts : Start');
  console.log('');
  
  const directoryPath = path.resolve(__dirname, './input-texts');
  fs.rmdirSync(directoryPath, { recursive: true });
  fs.mkdirSync(directoryPath, { recursive: true });
  
  ['ASCII', 'EUCJP', 'SJIS', 'UTF8', 'UTF8BOM'].forEach((encoding) => {
    Object.entries({ 'LF': '\n', 'CR': '\r', 'CRLF': '\r\n', 'LFCR': '\n\r' }).forEach(([newLineName, newLineCharacter]) => {
      const string = `${encoding} ${newLineName}${newLineCharacter}`
                   + (encoding === 'ASCII' ? `ABCDEF${newLineCharacter}GHIJKL${newLineCharacter}` : `あいう${newLineCharacter}えおか${newLineCharacter}`);
      const buffer = convertStringToBuffer(string, encoding);
      writeFileSync(`${encoding}-${newLineName}`, buffer);
    });
    
    // Empty
    const emptyBuffer = convertStringToBuffer('', encoding);
    writeFileSync(`${encoding}-EMPTY`, emptyBuffer);
    
    // No Lines
    const noLinesBuffer = convertStringToBuffer(`${encoding} ${encoding === 'ASCII' ? 'NO LINES' : '改行なし'}`, encoding);
    writeFileSync(`${encoding}-NOLINES`, noLinesBuffer);
    
    // Mix
    const mixString = `${encoding} MIX LF\n` + (encoding === 'ASCII'
        ? `LF Only\nCR Only\rCR+LF\r\nLF+CR\n\rEnd CR\r`
        : `LF のみ\nCR のみ\rCR・LF\r\nLF・CR\n\rEnd CR\r`);
    const mixBuffer = convertStringToBuffer(mixString, encoding);
    writeFileSync(`${encoding}-MIX`, mixBuffer);
  });
  
  // `file` コマンドで文字コードと改行コードを確認・出力する
  const result = childProcess.execSync(`file ${directoryPath}/*`).toString().trim().replace(new RegExp(directoryPath + '/', 'g'), '');
  console.log('');
  console.log(result);
  console.log('');
  console.log('Generate Input Texts : Finished');
  console.log('');
  
  function convertStringToBuffer(string, encoding) {
    const arrayBuffer = encodingJapanese.convert(string, {
      from: 'UNICODE',
      to  : encoding.replace('UTF8BOM', 'UTF8'),
      type: 'arraybuffer'
    });
    return encoding === 'UTF8BOM' ? ('\uFEFF' + Buffer.from(arrayBuffer)) : Buffer.from(arrayBuffer);
  }
  
  function writeFileSync(fileName, buffer) {
    const filePath = `${directoryPath}/${fileName}.txt`;
    fs.writeFileSync(filePath, buffer);
    console.log(`Created : ${filePath}`);
  }
};
