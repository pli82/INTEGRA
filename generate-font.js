const fs = require('fs');

async function main() {
  const urls = {
    regular: 'https://raw.githubusercontent.com/notofonts/notofonts.github.io/noto-monthly-release-2026.05.01/fonts/NotoSans/full/ttf/NotoSans-Regular.ttf',
    bold: 'https://raw.githubusercontent.com/notofonts/notofonts.github.io/noto-monthly-release-2026.05.01/fonts/NotoSans/full/ttf/NotoSans-Bold.ttf',
  };

  const b64 = {};
  for (const [key, url] of Object.entries(urls)) {
    console.log('Descarc', key, '...');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Esuat la ${url}: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    b64[key] = buf.toString('base64');
    console.log(key, 'gata,', buf.length, 'bytes');
  }

  const content = `// Font Noto Sans codificat base64, pentru generarea PDF-urilor cu diacritice romanesti corecte (s, t cu virgula).

const NOTO_SANS_REGULAR_BASE64 = "${b64.regular}";
const NOTO_SANS_BOLD_BASE64 = "${b64.bold}";

export function inregistreazaFontRomanesc(doc: any) {
  doc.addFileToVFS("NotoSans-Regular.ttf", NOTO_SANS_REGULAR_BASE64);
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", NOTO_SANS_BOLD_BASE64);
  doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
  doc.setFont("NotoSans", "normal");
}
`;

  fs.mkdirSync('lib', { recursive: true });
  fs.writeFileSync('lib/pdfFont.ts', content);
  console.log('Scris lib/pdfFont.ts, dimensiune:', content.length, 'caractere');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
