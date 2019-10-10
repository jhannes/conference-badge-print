import {BadgeSpecification, BadgeStyle, Participant} from "./model";
import * as qr from "qrcode";

async function printPage(doc, {title, subTitle, detail, footnote, qrCode, backgroundImage}) {
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

    doc.font('Times-Roman');
    if (backgroundImage) {
        doc.image(backgroundImage, 0, 0, { height, width });
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
        doc.fillColor("#ffffff");
        doc.text(footnote, margin, 380, { align: "left", height, width });
    }
}

async function printParticipant(doc, participant: Participant, style: BadgeStyle) {
    const fullName = participant.givenName + " " + participant.familyName;
    const contactInfo = fullName + " <" + participant.emailAddress + ">";

    await printPage(doc,{
        title: fullName,
        subTitle: participant.company,
        detail: participant.frontTagline,
        qrCode: contactInfo,
        footnote: participant.footnote,
        backgroundImage: style.backgroundImage
    });
    await printPage(doc, {
        title: fullName,
        subTitle: participant.company,
        detail: participant.backTagline || participant.frontTagline,
        qrCode: contactInfo,
        footnote: participant.footnote,
        backgroundImage: style.backgroundImage
    });
}

export function badgeGenerator(badgeSpecification: BadgeSpecification) : Promise<string> {
    return new Promise(async (resolve) => {
        // @ts-ignore
        const doc = doc = new PDFDocument({
            size: [315, 436],
            autoFirstPage: false
        });
        // @ts-ignore
        const stream = doc.pipe(blobStream());

        for (const participant of badgeSpecification.participants) {
            await printParticipant(doc, participant, badgeSpecification.style);
        }

        doc.end();
        stream.on('finish', function() {
            console.log("finish");
            resolve(stream.toBlobURL('application/pdf'));
        });
    });
}
