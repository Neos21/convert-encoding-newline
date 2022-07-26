#!/usr/bin/env node

const fs               = require('fs').promises;
const path             = require('path');
const { program }      = require('commander');
const encodingJapanese = require('encoding-japanese');

(async () => {
  try {
    program
      .name('convert-encoding-newline')
      .description('Convert Encoding And New Line')
      .requiredOption('-i, --input <file>', 'Input File Path')
      .option('-e, --encoding <encoding>' , 'Output Encoding', 'UTF8')
      .option('-l, --new-line <new-line>' , 'Output New Line', 'LF')
      .option('-o, --output <file>'       , 'Output File Path')
      .option('-f, --force'               , 'Force Overwrite Output File')  // Output を強制上書きする
      .option('-q, --quiet'               , 'No Output Converting Logs')    // 変換前後の通常ログを出力しない
      .parse();
    const options = program.opts();
    
    // Input ファイルの存在チェック
    if(! await isExistFile(options.input)) throw new Error('Input File Does Not Exist');
    // Input ファイルの改行コード・文字コードを判定する
    const { inputEncoding, inputNewLine, inputString } = await detectInput(options.input);  // Throws
    
    // `output` オプションがなければ Input ファイルの判定結果を出力して終了する
    if(!options.output) return console.log(`Input File Encoding : [${inputEncoding}] ... Input File New Line : [${inputNewLine}] ... [${options.input}]`);
    
    // 以降変換処理
    
    // 上書きしない場合は Output ファイルが既に存在していないかチェックする
    if(!options.force && await isExistFile(options.output)) throw new Error('Output File Is Already Exist');
    
    // オプションを整形する
    const outputEncoding = detectEncodingOption(options.encoding);
    const outputNewLine  = detectNewLineOption(options.newLine);
    // 変換要否を判定する
    const { isNotNeedToConvert, isSameEncoding, isSameNewLine } = detectNeedToConvert(inputEncoding, inputNewLine, outputEncoding, outputNewLine);
    if(isNotNeedToConvert) {
      if(!options.quiet) return console.warn(`Input File : [${inputEncoding}] [${inputNewLine}] ... No Converts Needed`);
      throw new Error('No Converts Needed');
    }
    
    // 変換する
    const outputBuffer = convertOutput(inputString, isSameNewLine, outputEncoding, outputNewLine);
    
    // ファイルに書き出す : ディレクトリが存在しない場合のために作成する
    const parentDirectoryPath = path.dirname(options.output);
    await fs.mkdir(parentDirectoryPath, { recursive: true });
    await fs.writeFile(options.output, outputBuffer);  // Throws
    if(!options.quiet) {
      console.log(`Input File Encoding : [${inputEncoding}] ... Input File New Line : [${inputNewLine}] ... [${options.input}]`);
      console.log(`Output File Encoding : [${outputEncoding}${isSameEncoding ? ' (Same)' : ''}] ... Output File New Line : [${outputNewLine}${isSameNewLine ? ' (Same)' : ''}] ... [${options.output}]`);
      console.log('Converted');
    }
  }
  catch(error) {
    console.error(error.toString());
  }
})();


// Parse Options
// ================================================================================

/**
 * ファイルの存在チェックをする
 * 
 * @param {string} filePath ファイルパス
 * @return {Promise<boolean>} ファイルが存在していれば `true`・存在していなければ `false`
 */
async function isExistFile(filePath) {
  return await fs.stat(filePath).then(() => true).catch(() => false);
}

/**
 * `encoding` オプションに渡された文字列を整形する
 * 
 * @param {string} encoding `encoding` オプションの文字列
 * @return {string} 整形した文字列
 * @throws 不正な文字列を渡された場合
 */
function detectEncodingOption(encoding) {
  const upperEncoding = encoding.toUpperCase();
  if(['SJIS'   , 'SHIFT-JIS', 'SHIFT_JIS', 'SHIFTJIS'].includes(upperEncoding)) return 'SJIS'   ;
  if(['EUCJP'  , 'EUC-JP'                            ].includes(upperEncoding)) return 'EUCJP'  ;
  if(['UTF8'   , 'UTF-8'                             ].includes(upperEncoding)) return 'UTF8'   ;
  if(['UTF8BOM', 'UTF-8BOM', 'UTF8 BOM', 'UTF-8 BOM' ].includes(upperEncoding)) return 'UTF8BOM';
  throw new Error(`Invalid Option : --encoding ${encoding}`);
}

/**
 * `newLine` オプションに渡された文字列を整形する
 * 
 * @param {string} newLine `newLine` オプションの文字列
 * @return {string} 整形した文字列
 * @throws 不正な文字列を渡された場合
 */
function detectNewLineOption(newLine) {
  const upperNewLine = newLine.toUpperCase();
  if(upperNewLine === 'LF') return 'LF';
  if(upperNewLine === 'CR') return 'CR';
  if(['CRLF', 'CR-LF', 'CR+LF', 'CR LF'].includes(upperNewLine)) return 'CRLF';
  throw new Error(`Invalid Option : --new-line ${newLine}`);
}


// Detect
// ================================================================================

/**
 * Input ファイルの文字コード・改行コードを判定する
 * 
 * @param {string} inputFilePath Input ファイルパス
 * @return {Object} 判定結果
 */
async function detectInput(inputFilePath) {
  // ファイルを読み込む
  const inputBuffer = await fs.readFile(inputFilePath);  // Throws
  
  // 文字コードを判定する : 対応外のファイルはココで弾く
  const inputEncoding = detectEncoding(inputBuffer);  // Throws
  
  // 文字列に変換する
  const inputString = convertBufferToString(inputBuffer, inputEncoding);
  // 改行コードを判定する
  const inputNewLine = detectNewLine(inputString);
  
  return { inputEncoding, inputNewLine, inputString };
}

/**
 * 文字コードを判定する
 * 
 * @param {Buffer} buffer `fs.readFile()` で読み込んだバッファデータ
 * @return {string} 文字コード
 * @throws 空データの場合、対応外のエンコード結果の場合
 */
function detectEncoding(buffer) {
  const encoding = encodingJapanese.detect(buffer);
  
  // データがない場合 (`encodingJapanese.detect()` 内で null チェックを行っている)
  if(encoding === false) throw new Error('Empty Buffer Data');
  // 対応外のエンコード結果の場合
  if(!['ASCII', 'UTF8', 'SJIS', 'EUCJP'].includes(encoding)) throw new Error(`Not Supported Encoding Type [${encoding}]`);
  
  // ASCII は UTF8 と同義とする
  if(encoding === 'ASCII') return 'UTF8';
  // SJIS・EUCJP は結果をそのまま返す
  if(encoding !== 'UTF8') return encoding;
  // UTF8 の場合のみ BOM 付きかどうか判定する
  const hasBom = Buffer.from([buffer[0], buffer[1], buffer[2]]).toString('utf-8')[0] === '\uFEFF';
  return `${encoding}${hasBom ? 'BOM' : ''}`;
}

/**
 * 改行コードの判定・置換のため JS 内で扱える Unicode 形式に変換する
 * ASCII・UTF8 は Buffer#toString('utf-8') でも良いが統一する
 * 
 * @param {Buffer} buffer バッファデータ
 * @param {string} encoding 文字コード
 * @return {string} 文字列
 */
function convertBufferToString(buffer, encoding) {
  const result = encodingJapanese.convert(buffer, {
    from: encoding.replace('UTF8BOM', 'UTF8'),
    to  : 'UNICODE',
    type: 'string'
  });
  // UTF8BOM が存在する場合は削除して返す
  return result[0] === '\uFEFF' ? result.slice(1) : result;
}

/**
 * 改行コードを判定する
 * 
 * 参考 : https://github.com/sindresorhus/detect-newline/blob/main/index.js
 * 
 * @param {string} string 文字列
 * @return {string} 改行コードの判定結果
 */
function detectNewLine(string) {
  const lf   = (string.match((/^\n[^\r]|[^\r]\n[^\r]|[^\r]\n$/g)) ?? []).length;
  const cr   = (string.match((/^\r[^\n]|[^\n]\r[^\n]|[^\n]\r$/g)) ?? []).length;
  const crLf = (string.match((/\r\n/g))                           ?? []).length;
  const lfCr = (string.match((/\n\r/g))                           ?? []).length;
  if((lf + cr + crLf + lfCr)      === 0) return 'NOLINES';  // 一つも改行コードがなかった場合
  if(lf > 0 && (cr + crLf + lfCr) === 0) return 'LF';
  if(cr > 0 && (lf + crLf + lfCr) === 0) return 'CR';
  if(crLf > 0 && (lf + cr + lfCr) === 0) return 'CRLF';
  if(lfCr > 0 && (lf + cr + crLf) === 0) return 'LFCR';  // Invalid
  return 'MIX';  // 複数の改行コードが混在している場合
}


// Convert
// ================================================================================

/**
 * 変換要否を判定する
 * 
 * @param {string} inputEncoding Input ファイルの文字コード
 * @param {string} inputNewLine Input ファイルの改行コード
 * @param {string} outputEncoding 変換したい文字コード
 * @param {string} outputNewLine 変換したい改行コード
 * @return {Object} 変換要否の判定結果オブジェクト
 */
function detectNeedToConvert(inputEncoding, inputNewLine, outputEncoding, outputNewLine) {
  const isSameEncoding = inputEncoding === outputEncoding;  // いずれも SJIS・EUCJP・UTF8・UTF8BOM の4つに集約されている
  const isSameNewLine  = inputNewLine === 'NOLINES' ? true  // Input に改行がなければ変換後も同じ
                       : inputNewLine === outputNewLine;    // それ以外は LF・CR・CRLF 同士なら一致する、Input が LFCR や MIX なら必ず不一致となる
  const isNotNeedToConvert = isSameEncoding && isSameNewLine;
  return { isNotNeedToConvert, isSameEncoding, isSameNewLine };
}

/**
 * 文字列の改行コード・文字コードを変換後、バッファデータに変換する
 * 
 * @param {string} inputString Input 文字列
 * @param {boolean} isSameNewLine 改行コードが同じかどうか
 * @param {string} outputEncoding 変換したい文字コード
 * @param {string} outputNewLine 変換したい改行コード
 * @return {Buffer} バッファデータ
 */
function convertOutput(inputString, isSameNewLine, outputEncoding, outputNewLine) {
  // 改行コード置換が必要な場合のみ置換を行う
  const outputString = isSameNewLine ? inputString : replaceNewLine(inputString, outputNewLine);
  // 文字コードを指定してバッファデータに変換する
  const outputBuffer = convertStringToBuffer(outputString, outputEncoding);
  return outputBuffer;
}

/**
 * 文字列中の改行コードを指定の改行コードに置換する
 * 
 * @param {string} string 文字列
 * @param {string} newLine 置換する改行コード ('LF'・'CR'・'CRLF')
 * @return {string} 改行コード置換後の文字列
 */
function replaceNewLine(string, newLine) {
  const newLineCharacters = {
    'LF'  : '\n',
    'CR'  : '\r',
    'CRLF': '\r\n'
  };
  const newLineCharacter = newLineCharacters[newLine];
  return string.replace((/\r\n|\n\r|\r|\n/g), newLineCharacter);
}

/**
 * 文字列をバッファデータに変換する
 * 
 * @param {string} string 文字列
 * @param {string} encoding 変換後の文字コード
 * @return {Buffer} バッファデータ
 */
function convertStringToBuffer(string, encoding) {
  const arrayBuffer = encodingJapanese.convert(string, {
    from: 'UNICODE',
    to  : encoding.replace('UTF8BOM', 'UTF8'),  // UTF8BOM の場合は後で BOM を付与する
    type: 'arraybuffer'
  });
  // バッファに変換する : UTF8BOM に変換する場合は BOM を付与する
  return encoding === 'UTF8BOM' ? ('\uFEFF' + Buffer.from(arrayBuffer)) : Buffer.from(arrayBuffer);
}
