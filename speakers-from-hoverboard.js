
const fs = require("fs")

const json = JSON.parse(fs.readFileSync("firebase-export.json"));

var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];


const badges = [];

const {generatedSchedule} = json.__collections__;
for (const date of Object.keys(generatedSchedule)) {
    for (const timeslot of generatedSchedule[date].timeslots) {
        const {startTime, sessions} = timeslot;

        for (const session of sessions) {
            for (const item of session.items) {
                const {title} = item;
                const track = (item.track || {}).title;
                for (const speaker of item.speakers) {
                    const {name, company} = speaker;
                    const twitterLink = (speaker.socials || {}).name && speaker.socials.name === 'Twitter'
                        ?  speaker.socials.link
                        : ((speaker.socials || []).filter(s => s.name === "Twitter")[0] || {}).link;

                    const twitter = twitterLink && twitterLink.replace('https://twitter.com/', '@');
                    const day = days[new Date(date).getDay()];

                    const badge = {
                        fullName: name,
                        subtitle: company,
                        backSubtitle: title,
                        emailAddress: undefined,
                        frontTagline: twitter,
                        backTagline: day + " " + startTime + "\n" + track,
                        footnote: 'Speaker'
                    };

                    badges.push(badge);
                }
            }
        }
    }
}

badges.sort((a, b) => a.fullName.localeCompare(b.fullName));

console.log(badges);
const XLSX = require('XLSX');

var workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(badges), "Speakers");
XLSX.writeFile(workbook, 'out.xlsx');
