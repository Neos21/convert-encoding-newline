const fs = require('fs').promises;
const encodingJapanese = require('encoding-japanese');

(async () => {
  // 現状はココで読み込むファイルや変換形式等を指定する
  const inputFilePath = './example-input/SJIS-CRLF.txt';
  const outputEncoding = 'UTF8';
  const outputNewLine  = 'LF';
  const outputFilePath = './example-output.txt';
  
  // 文字コード・改行コードは未指定時は変換なし・指定時は決められた値のみ許容する
  if(!isEmptyString(outputEncoding) && !['UTF8', 'UTF8BOM', 'SJIS', 'EUCJP'].includes(outputEncoding)) return console.error('Invalid Output Encoding');
  if(!isEmptyString(outputNewLine ) && !['LF', 'CR', 'CRLF'                ].includes(outputNewLine )) return console.error('Invalid Output New Line');
  // 文字コード・改行コードの変換指定がある場合は変換後ファイルパスを必須とする
  if((!isEmptyString(outputEncoding) || !isEmptyString(outputNewLine)) && isEmptyString(outputFilePath)) return console.error('Output File Path Is Required');
  
  // ファイルを読み込む
  let inputBuffer = null;
  try {
    inputBuffer = await fs.readFile(`./${inputFilePath}`);
  }
  catch(error) {
    return console.error('Failed To Read File : ', error);
  }
  
  // 文字コードを判定する : 対応外のファイルはココで弾く
  let inputEncoding = null;
  try {
    inputEncoding = detectEncoding(inputBuffer);
  }
  catch(error) {
    return console.error(error);
  }
  
  // 文字列に変換する
  const inputString = convertBufferToString(inputBuffer, inputEncoding);
  // 改行コードを判定する
  const inputNewLine = detectNewLine(inputString);
  
  // 判定結果を出力する
  console.log(`${inputFilePath} : ${inputEncoding} / ${inputNewLine}`);
  // 変換オプションがどちらも未指定の場合は判定のみ行って終了する
  if(isEmptyString(outputEncoding) && isEmptyString(outputNewLine)) return;
  // 変換後の形式を確認する
  console.log(`  --> ${outputEncoding}${inputEncoding === outputEncoding ? ' (No Convert)' : ''} / ${outputNewLine}${inputNewLine === outputNewLine ? ' (No Convert)' : ''}`);
  // 判定結果と変換オプションが一致する場合は何もしない
  if(inputEncoding === outputEncoding && inputNewLine === outputNewLine) return console.log('No Converts Needed');
  // 変換後のファイルパスを出力しておく
  console.log(`  --> ${outputFilePath}`);
  
  // 改行コード置換が必要な場合のみ置換を行う
  const outputString = inputNewLine === outputNewLine ? inputString : replaceNewLine(inputString, outputNewLine);
  // 文字コードを指定してバッファデータに変換する
  const outputBuffer = convertStringToBuffer(outputString, outputEncoding);
  
  // ファイルに書き出す
  await fs.writeFile(outputFilePath, outputBuffer);
  
  console.log('Finished');
})();

/**
 * undefined・null・空文字のいずれかかどうかを判定する
 * 
 * @param {string | undefined | null} string 文字列
 * @return {boolean} undefined・null・空文字なら true、それ以外は false
 */
function isEmptyString(string) {
  return string == null || string === '';
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

/**
 * 文字列中の改行コードを指定の改行コードに置換する
 * 
 * @param {string} string 文字列
 * @param {string} newLine 置換する改行コード ('LF'・'CR'・'CRLF')
 * @return {string} 改行コード置換後の文字列
 * @throws 想定外の改行コードを引数で指定された場合
 */
function replaceNewLine(string, newLine) {
  const newLineCharacters = {
    'LF'  : '\n',
    'CR'  : '\r',
    'CRLF': '\r\n'
  };
  const newLineCharacter = newLineCharacters[newLine];
  if(newLineCharacter == null) throw new Error('Invalid New Line Argument');
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
