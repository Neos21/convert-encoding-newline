// 変換テスト・事前にテスト用のテキストファイルを生成しておくこと
// ==================================================

const fs           = require('fs');
const path         = require('path');
const childProcess = require('child_process');

module.exports = function convert() {
  console.log('Convert : Start');
  
  const outputDirectoryPath = path.resolve(__dirname, './output-texts');
  fs.rmdirSync(outputDirectoryPath, { recursive: true });
  fs.mkdirSync(outputDirectoryPath, { recursive: true });
  
  // スクリプトのパス
  const scriptFilePath = path.resolve(__dirname, '../index.js');
  
  // テストパターン (全パターンはやらない)
  const patterns = [
    { input: 'UTF8-LF'  , encoding: 'SJIS'    , newLine: 'CRLF' },
    { input: 'UTF8-LF'  , encoding: 'EUCJP'   , newLine: 'CRLF' },
    { input: 'SJIS-CRLF', encoding: 'UTF8'    , newLine: 'LF'   },
    { input: 'SJIS-CRLF', encoding: 'UTF8'    , newLine: 'CRLF' },
    { input: 'SJIS-CRLF', encoding: 'UTF8BOM' , newLine: 'LF'   },
    { input: 'SJIS-CRLF', encoding: 'UTF8BOM' , newLine: 'CRLF' },
    { input: 'EUCJP-MIX', encoding: 'UTF8'    , newLine: 'LF'   },
    { input: 'EUCJP-MIX', encoding: 'UTF8'    , newLine: 'CRLF' },
    { input: 'EUCJP-MIX', encoding: 'UTF8BOM' , newLine: 'LF'   },
    { input: 'EUCJP-MIX', encoding: 'UTF8BOM' , newLine: 'CRLF' }
  ];
  
  let total  = 0;
  let passed = 0;
  let failed = 0;
  
  patterns.forEach((pattern) => {
    total++;
    console.log(`\n[${total}]`);
    
    // テスト用のテキストファイルのパス
    const inputFilePath = path.resolve(__dirname, `./input-texts/${pattern.input}.txt`);
    // 出力先ファイルパス
    const outputFilePath = path.resolve(__dirname, `./output-texts/${pattern.input}--TO--${pattern.encoding}-${pattern.newLine}.txt`);
    
    // スクリプトを実際に実行して変換する
    const convertedResult = childProcess.execSync(`node '${scriptFilePath}' -i '${inputFilePath}' -e '${pattern.encoding}' -l '${pattern.newLine}' -o '${outputFilePath}' 2>&1`).toString().trim();
    console.log(convertedResult);
    // 変換後のファイルをスクリプトで判定する
    const detectedResult = childProcess.execSync(`node '${scriptFilePath}' -i '${outputFilePath}' 2>&1`).toString().trim();
    console.log(detectedResult);
    
    const isOk = convertedResult.endsWith('Converted') && detectedResult.startsWith(`Input File Encoding : [${pattern.encoding}] ... Input File New Line : [${pattern.newLine}]`);
    if(isOk) { passed++; } else { failed++; }
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
  
  // `file` コマンドでも文字コードと改行コードを確認・出力する
  const result = childProcess.execSync(`file ${outputDirectoryPath}/*`).toString().trim().replace(new RegExp(outputDirectoryPath + '/', 'g'), '');
  console.log('');
  console.log(result);
  console.log('');
  console.log('Convert : Finished');
  console.log('');
};
