import {BadgeSpecification, BadgeStyle, Participant} from "./model";
import * as qr from "qrcode";

import roboto500 from "./fonts/roboto-v15-latin_latin-ext-500.ttf";
import robotoRegular from "./fonts/roboto-v15-latin_latin-ext-regular.ttf";

const fonts = {
    regular: robotoRegular,
    bold: roboto500
};

const colors = {
    primary: "#000000",
    highlight: "#F26716",
    accent: "#023059"
};

async function printPage(doc, {title, subtitle, detail, footnote, qrCode, backgroundImage, fontBold, fontRegular}) {
    console.log("Printing badge page", {title, subtitle, detail, footnote, qrCode, backgroundImage});
    doc.addPage();

    const margin = 25;
    const width = doc.page.width - (margin*2);
    const height = doc.page.height;
    const qrWidth = 70;

    function adjustFontSize(text, fontSteps: number[], w = width) {
        if (text) {
            for (const size of fontSteps) {
                doc.fontSize(size);
                if (doc.widthOfString(text) <= w) return size;
            }
        }
    }

    function printCenteredText(text, y, fontSteps: number[]) {
        adjustFontSize(text, fontSteps);
        doc.text(text, margin, y, { align: "center", height, width });
    }

    doc.font(fontBold);
    if (backgroundImage) {
        doc.image(backgroundImage, 0, 0, { height, width: doc.page.width });
    }
    if (qrCode && qrCode.length) {
        const qrImage = await qr.toDataURL(qrCode, { color: { dark: "#FFFFFF", light: "#0000000" }});
        doc.image(qrImage, (doc.page.width - 70 - qrWidth/2), height - 65 - qrWidth/2, {
            width: qrWidth
        });
    }
    let yOffset = 110;


    doc.font(fontBold);
    printCenteredText(title, yOffset, [36, 30, 26, 24]);
    const titleHeight = doc.heightOfString(title, {width});
    console.log({title, titleHeight});
    yOffset += 15 + titleHeight;
    if (subtitle) {
        doc.fillColor(colors.highlight).font(fontRegular);
        adjustFontSize(subtitle, [24, 20, 18], 200);
        doc.text(subtitle, margin, yOffset, {align: "center", height, width});
    }
    yOffset += 60;
    if (detail) {
        doc.font(fontRegular).fillColor(colors.accent);
        adjustFontSize(detail, [30, 24, 18], 200);
        doc.text(detail, margin, yOffset, {align: "center", height, width});
    }
    if (footnote) {
        doc.font(fontBold);
        doc.fillColor("#ffffff");
        doc.fontSize(22);
        doc.text(footnote, margin-5, 360, { align: "right", height, width });
    }
}

export async function printBadge(doc, participant: Participant, style: BadgeStyle) {
    const {fullName, subtitle, backSubtitle, footnote, emailAddress, backTagline, frontTagline} = participant;
    const {fontBold, fontRegular, backgroundImage} = style;
    const contactInfo = emailAddress && emailAddress.length && fullName + " <" + emailAddress + ">";

    await printPage(doc,{
        title: fullName,
        subtitle,
        detail: frontTagline,
        qrCode: contactInfo,
        footnote: undefined,
        backgroundImage,
        fontBold,
        fontRegular
    });
    await printPage(doc, {
        title: fullName,
        subtitle: backSubtitle || subtitle,
        detail: backTagline || frontTagline,
        qrCode: contactInfo,
        footnote: undefined,
        backgroundImage,
        fontBold,
        fontRegular
    });
}

export function badgeGenerator(
    badgeSpecification: BadgeSpecification, onProgress?: (p: Participant, index:number, count:number) => void
) : Promise<string> {
    return new Promise(async (resolve) => {
        const font500Response = await fetch(roboto500);
        const fontBold = await font500Response.arrayBuffer();
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
        const style = {backgroundImage, fontRegular, fontBold};

        let index = 0;
        for (const participant of participants) {
            await printBadge(doc, participant, style);
            onProgress && onProgress(participant, ++index, participants.length);
        }

        doc.end();
        stream.on('finish', function() {
            resolve(stream.toBlobURL('application/pdf'));
        });
    });
}
