# @neos21/convert-encoding-newline : Convert Encoding New Line

[![NPM Version](https://img.shields.io/npm/v/@neos21/convert-encoding-newline.svg)](https://www.npmjs.com/package/@neos21/convert-encoding-newline)

テキストファイルの文字コード・改行コードを判定・変換する CLI ツール。

- UTF-8 (ASCII のみも含む)、BOM 付き UTF-8、Shift-JIS、EUC-JP 形式のテキストファイルを相互に変換する
- 改行コードを LF・CR・CR+LF のいずれかに変換する


## How To Use

```bash
$ npm install -g @neos21/convert-encoding-newline

# 改行コード・文字コードの判定のみ行う
$ convert-encoding-newline -i ./input.txt

# 改行コード・文字コードを指定して変換する
$ convert-encoding-newline -i ./input.txt -e 'UTF8' -l 'LF' -o ./output.txt
```

- `-i <file>`・`--input <file>` : 判定・変換を行いたいファイルパス (必須)
- `-o <file>`・`--output <file>` : 変換後のファイルパス (このオプションを書くと変換モードとなる)
- `-e <encoding>`・`--encoding <encoding>` : 変換したい文字コード。未指定時のデフォルトは `UTF8`。指定可能なオプションは次のとおり
    - `SJIS`・`SHIFT-JIS`・`SHIFT_JIS`・`SHIFTJIS`
    - `EUCJP`・`EUC-JP`
    - `UTF8`・`UTF-8`
    - `UTF8BOM`・`UTF-8BOM`・`UTF8 BOM`・`UTF-8 BOM`
- `-l <new-line>`・`--new-line <new-line>` : 変換したい改行コード。未指定時のデフォルトは `LF`。指定可能なオプションは次のとおり
    - `LF`
    - `CR`
    - `CRLF`・`CR-LF`・`CR+LF`・`CR LF`
- `-f`・`--force` : このオプションを指定すると、変換後のファイルパスに既にファイルが存在しても強制的に上書きする
- `-q`・`--quiet` : このオプションを指定すると、変換時に変換成功の標準出力を出力しない (エラー時は標準エラー出力が出力される)


## Links

- [Neo's World](https://neos21.net/)
- [GitHub - Neos21](https://github.com/Neos21/)
- [GitHub - convert-encoding-newline](https://github.com/Neos21/convert-encoding-newline)
- [npm - @neos21/convert-encoding-newline](https://www.npmjs.com/package/@neos21/convert-encoding-newline)
