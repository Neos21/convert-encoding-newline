# **[WIP]** @neos21/convert-encoding-newline : Convert Encoding New Line

**[WIP]** テキストファイルの文字コード・改行コードを変換するツールを作成中。

- [x] UTF-8 (ASCII のみも含む)、BOM 付き UTF-8、Shift-JIS、EUC-JP 形式のテキストファイルを相互に変換する
- [x] 改行コードを LF・CR・CR+LF のいずれかに変換する
- [x] 文字コードのみ・改行コードのみの変換、および両方の同時変換も可能とする
- [ ] 読込ファイルを上書きして書き出せるオプションを用意する
- [ ] 書き出し先ファイルが既に存在する場合にリネーム・キャンセル等のオプションを用意する
- [ ] 複数ファイルを一括で形式統一できるようにする
- [ ] コマンドラインツールとして動作するようにする
- [ ] API 呼び出しで動作するようにする
- [ ] npm パッケージとして公開する


## Memo

```bash
$ npm install

# index.js
$ npm start

# test.js
$ npm test
$ file ./example-input/*
./example-input/ASCII-CR.txt:        ASCII text, with CR line terminators
./example-input/ASCII-CRLF.txt:      ASCII text, with CRLF line terminators
./example-input/ASCII-EMPTY.txt:     empty
./example-input/ASCII-LF.txt:        ASCII text
./example-input/ASCII-LFCR.txt:      ASCII text, with CR, LF line terminators
./example-input/ASCII-MIX.txt:       ASCII text, with CRLF, CR, LF line terminators
./example-input/ASCII-NOLINES.txt:   ASCII text, with no line terminators
./example-input/EUCJP-CR.txt:        ISO-8859 text, with CR line terminators
./example-input/EUCJP-CRLF.txt:      ISO-8859 text, with CRLF line terminators
./example-input/EUCJP-EMPTY.txt:     empty
./example-input/EUCJP-LF.txt:        ISO-8859 text
./example-input/EUCJP-LFCR.txt:      ISO-8859 text, with CR, LF line terminators
./example-input/EUCJP-MIX.txt:       ISO-8859 text, with CRLF, CR, LF line terminators
./example-input/EUCJP-NOLINES.txt:   ISO-8859 text, with no line terminators
./example-input/SJIS-CR.txt:         Non-ISO extended-ASCII text, with CR line terminators
./example-input/SJIS-CRLF.txt:       Non-ISO extended-ASCII text, with CRLF line terminators
./example-input/SJIS-EMPTY.txt:      empty
./example-input/SJIS-LF.txt:         Non-ISO extended-ASCII text
./example-input/SJIS-LFCR.txt:       Non-ISO extended-ASCII text, with CR, LF line terminators
./example-input/SJIS-MIX.txt:        Non-ISO extended-ASCII text, with CRLF, CR, LF line terminators
./example-input/SJIS-NOLINES.txt:    Non-ISO extended-ASCII text, with no line terminators
./example-input/UTF8-CR.txt:         UTF-8 Unicode text, with CR line terminators
./example-input/UTF8-CRLF.txt:       UTF-8 Unicode text, with CRLF line terminators
./example-input/UTF8-EMPTY.txt:      empty
./example-input/UTF8-LF.txt:         UTF-8 Unicode text
./example-input/UTF8-LFCR.txt:       UTF-8 Unicode text, with CR, LF line terminators
./example-input/UTF8-MIX.txt:        UTF-8 Unicode text, with CRLF, CR, LF line terminators
./example-input/UTF8-NOLINES.txt:    UTF-8 Unicode text, with no line terminators
./example-input/UTF8BOM-CR.txt:      UTF-8 Unicode (with BOM) text, with CR line terminators
./example-input/UTF8BOM-CRLF.txt:    UTF-8 Unicode (with BOM) text, with CRLF line terminators
./example-input/UTF8BOM-EMPTY.txt:   UTF-8 Unicode text, with no line terminators
./example-input/UTF8BOM-LF.txt:      UTF-8 Unicode (with BOM) text
./example-input/UTF8BOM-LFCR.txt:    UTF-8 Unicode (with BOM) text, with CR, LF line terminators
./example-input/UTF8BOM-MIX.txt:     UTF-8 Unicode (with BOM) text, with CRLF, CR, LF line terminators
./example-input/UTF8BOM-NOLINES.txt: UTF-8 Unicode (with BOM) text, with no line terminators
```


## Links

- [Neo's World](https://neos21.net/)
- [GitHub - Neos21](https://github.com/Neos21/)
- [GitHub - convert-encoding-newline](https://github.com/Neos21/convert-encoding-newline)
