import {BadgeSpecification, BadgeStyle, Participant} from "./model";
import * as qr from "qrcode";


async function printParticipant(doc, participant: Participant, style: BadgeStyle) {
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

    if (style.backgroundImage) {
        doc.image(style.backgroundImage, 0, 0, { height, width });
    }
    doc.font('Times-Roman');
    doc.fillColor("#000000");

    const fullName = participant.givenName + " " + participant.familyName;
    const contactInfo = fullName + " <" + participant.emailAddress + ">";

    const qrImage = await qr.toDataURL(contactInfo);
    doc.image(qrImage, (doc.page.width - 175 - qrWidth)/2, height - 85 - qrWidth, {
        width: qrWidth
    });

    printCenteredText(fullName, 163, [36, 30, 26]);
    if (participant.company) {
        doc.fillColor("#2d57a5");
        printCenteredText(participant.company, 230, [18, 12, 10]);
    }
    if (participant.frontTagline) {
        doc.fillColor("#831641");
        printCenteredText(participant.frontTagline, 301, [18]);
    }
    if (participant.footnote) {
        doc.fillColor("#ffffff");
        doc.text(participant.footnote, margin, 380, { align: "left", height, width });
    }
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
