import {BadgeSpecification, BadgeStyle, Participant} from "./model";
import * as qr from "qrcode";

import roboto500 from  "./fonts/roboto-v15-latin_latin-ext-500.ttf";
import robotoRegular from  "./fonts/roboto-v15-latin_latin-ext-regular.ttf";

async function printPage(doc, {title, subTitle, detail, footnote, qrCode, backgroundImage, font500, fontRegular}) {
    console.log("Printing badge page", {title, subTitle, detail, footnote, qrCode, backgroundImage});
    doc.addPage();

    const width = doc.page.width - 20;
    const height = doc.page.height;
    const margin = 15;
    const qrWidth = 70;
    function printCenteredText(text, y, fontSteps: number[]) {
        for (const size of fontSteps) {
            doc.fontSize(size);
            if (doc.widthOfString(text) <= width) break;
        }
        const align = "center";
        doc.text(text, margin, y, { align, height, width });
    }

    doc.font(font500);
    if (backgroundImage) {
        doc.image(backgroundImage, 0, 0, { height, width: doc.page.width });
    }
    const qrImage = await qr.toDataURL(qrCode);
    doc.image(qrImage, (doc.page.width - 175 - qrWidth)/2, height - 85 - qrWidth, {
        width: qrWidth
    });
    printCenteredText(title, 163, [36, 30, 26]);
    if (subTitle) {
        doc.fillColor("#2d57a5");
        printCenteredText(subTitle, 230, [18, 12, 10]);
    }
    if (detail) {
        doc.fillColor("#831641");
        printCenteredText(detail, 301, [18]);
    }
    if (footnote) {
        doc.font(fontRegular);
        doc.fillColor("#ffffff");
        doc.text(footnote, margin, 380, { align: "left", height, width });
    }
}

async function printParticipant(doc, participant: Participant, style: BadgeStyle) {
    const {fullName, company, footnote, emailAddress, backTagline, frontTagline} = participant;
    const {font500, fontRegular, backgroundImage} = style;
    const contactInfo = fullName + " <" + emailAddress + ">";

    await printPage(doc,{
        title: fullName,
        subTitle: company,
        detail: frontTagline,
        qrCode: contactInfo,
        footnote: footnote,
        backgroundImage,
        font500,
        fontRegular
    });
    await printPage(doc, {
        title: fullName,
        subTitle: company,
        detail: backTagline || frontTagline,
        qrCode: contactInfo,
        footnote: footnote,
        backgroundImage,
        font500,
        fontRegular
    });
}

export function badgeGenerator(badgeSpecification: BadgeSpecification) : Promise<string> {
    return new Promise(async (resolve) => {
        const font500Response = await fetch(roboto500);
        const font500 = await font500Response.arrayBuffer();
        const fontRegularResponse = await fetch(robotoRegular);
        const fontRegular = await fontRegularResponse.arrayBuffer();

        // @ts-ignore
        const doc = doc = new PDFDocument({
            size: [315, 436],
            autoFirstPage: false
        });
        // @ts-ignore
        const stream = doc.pipe(blobStream());
        doc.info['Title'] = "Badges " + new Date();

        const {style: {backgroundImage}, participants} = badgeSpecification;
        const style = {backgroundImage, fontRegular, font500};

        for (const participant of participants) {
            await printParticipant(doc, participant, style);
        }

        doc.end();
        stream.on('finish', function() {
            resolve(stream.toBlobURL('application/pdf'));
        });
    });
}
