import {BadgeSpecification, BadgeStyle, Participant} from "./model";
import * as qr from "qrcode";

import roboto500 from "./fonts/roboto-v15-latin_latin-ext-500.ttf";
import robotoRegular from "./fonts/roboto-v15-latin_latin-ext-regular.ttf";

async function printPage(doc, {title, subtitle, detail, footnote, qrCode, backgroundImage, font500, fontRegular}) {
    console.log("Printing badge page", {title, subtitle, detail, footnote, qrCode, backgroundImage});
    doc.addPage();

    const margin = 15;
    const width = doc.page.width - (margin*2);
    const height = doc.page.height;
    const qrWidth = 70;

    function adjustFontSize(fontSteps: number[], text, w = width) {
        if (text) {
            for (const size of fontSteps) {
                doc.fontSize(size);
                if (doc.widthOfString(text) <= w) return;
            }
        }
    }

    function printCenteredText(text, y, fontSteps: number[]) {
        adjustFontSize(fontSteps, text);
        doc.text(text, margin, y, { align: "center", height, width });
    }

    doc.font(font500);
    if (backgroundImage) {
        doc.image(backgroundImage, 0, 0, { height, width: doc.page.width });
    }
    if (qrCode && qrCode.length) {
        const qrImage = await qr.toDataURL(qrCode);
        doc.image(qrImage, (doc.page.width - 175 - qrWidth)/2, height - 85 - qrWidth, {
            width: qrWidth
        });
    }
    printCenteredText(title, 163, [36, 30, 26]);
    if (subtitle) {
        doc.fillColor("#2d57a5");
        printCenteredText(subtitle, 230, [24, 18]);
    }
    if (detail) {
        const multiline = detail.indexOf("\n") != -1;
        doc.fillColor("#831641")
            .font(multiline ? fontRegular : font500)
            .fontSize(multiline ? 14 : 18);
        doc.text(detail, 163, 301, {align: "left", height, width});
    }
    if (footnote) {
        doc.font(font500);
        doc.fillColor("#ffffff");
        doc.fontSize(24);
        doc.text(footnote, margin, 380, { align: "left", height, width });
    }
}

export async function printBadge(doc, participant: Participant, style: BadgeStyle) {
    const {fullName, subtitle, backSubtitle, footnote, emailAddress, backTagline, frontTagline} = participant;
    const {font500, fontRegular, backgroundImage} = style;
    const contactInfo = fullName + " <" + emailAddress + ">";

    await printPage(doc,{
        title: fullName,
        subtitle,
        detail: frontTagline,
        qrCode: contactInfo,
        footnote: footnote,
        backgroundImage,
        font500,
        fontRegular
    });
    await printPage(doc, {
        title: fullName,
        subtitle: backSubtitle || subtitle,
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
            await printBadge(doc, participant, style);
        }

        doc.end();
        stream.on('finish', function() {
            resolve(stream.toBlobURL('application/pdf'));
        });
    });
}
