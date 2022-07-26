// 判定のみのテスト・事前にテスト用のテキストファイルを生成しておくこと
// ==================================================

const path         = require('path');
const childProcess = require('child_process');

module.exports = function detect() {
  console.log('Detect : Start');
  console.log('');
  
  const encodings = ['ASCII', 'EUCJP', 'SJIS', 'UTF8', 'UTF8BOM'];
  const newLines  = ['CR', 'CRLF', 'EMPTY', 'LF', 'LFCR', 'MIX', 'NOLINES'];
  
  // スクリプトのパス
  const scriptFilePath = path.resolve(__dirname, '../index.js');
  
  let total  = 0;
  let passed = 0;
  let failed = 0;
  
  encodings.forEach((encoding) => {
    newLines.forEach((newLine) => {
      total++;
      // テスト用のテキストファイルのパス
      const testFilePath = path.resolve(__dirname, `./input-texts/${encoding}-${newLine}.txt`);
      
      // スクリプトを実際に実行する
      const result = childProcess.execSync(`node '${scriptFilePath}' -i '${testFilePath}' 2>&1`).toString().trim();
      if(encoding !== 'UTF8BOM' && newLine === 'EMPTY') {  // エラーとなるパターン
        const expected = 'Error: Empty Buffer Data';
        const isOk = result === expected;
        console.log(`[${isOk ? 'OK' : 'NG'}] ${result}`);
        if(isOk) { passed++; } else { failed++; }
      }
      else {  // 正常パターン
        const expectedEncoding = encoding === 'ASCII' ? 'UTF8' : encoding;
        const expectedNewLine  = encoding === 'UTF8BOM' && newLine  === 'EMPTY' ? 'NOLINES' : newLine;
        const expected = `Input File Encoding : [${expectedEncoding}] ... Input File New Line : [${expectedNewLine}]`;
        const isOk = result.startsWith(expected);
        console.log(`[${isOk ? 'OK' : 'NG'}] ${result}`);
        if(isOk) { passed++; } else { failed++; }
      }
    });
  });
  
  console.log('');
  console.log(`Total  : [${total}]`);
  console.log(`Passed : [${passed}]`);
  console.log(`Failed : [${failed}]`);
  console.log('');
  if(failed > 0) {
    console.error('The Test Is Failed.');
  }
  else {
    console.log('All Tests Are Passed.');
  }
  console.log('');
  console.log('Detect : Finished');
  console.log('');
};
