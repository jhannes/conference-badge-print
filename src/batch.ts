import {printBadge} from "./badge-generator";
import * as XLSX from "xlsx";
import {convertParticipants} from "./model";
// @ts-ignore
import PDFDocument from 'pdfkit';
// @ts-ignore
import fs from 'fs';

const backgroundImage = "badge-print.png";
const font500 = 'src/fonts/roboto-v15-latin_latin-ext-500.ttf';
const fontRegular = 'src/fonts/roboto-v15-latin_latin-ext-regular.ttf';

const workBook = XLSX.read(fs.readFileSync("out.xlsx"));
const worksheet = workBook.Sheets[workBook.SheetNames[0]];
const participants = convertParticipants(XLSX.utils.sheet_to_json(worksheet));

(async function () {
    // @ts-ignore
    const doc = doc = new PDFDocument({
        size: [315, 436],
        autoFirstPage: false
    });
    // @ts-ignore
    doc.pipe(fs.createWriteStream('output.pdf'));

    const style = {backgroundImage, fontRegular, font500};

    for (const participant of participants) {
        await printBadge(doc, participant, style);
    }

    await doc.end();
})();
