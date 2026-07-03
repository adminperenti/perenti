import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src/pages');
let changedCount = 0;

const replacements = [
    { from: '{upcomingMeetup.venue}', to: '{(typeof upcomingMeetup.venue === "object" ? upcomingMeetup.venue.name : upcomingMeetup.venue)}' },
    { from: '{nextMeetup.venue}', to: '{(typeof nextMeetup.venue === "object" ? nextMeetup.venue.name : nextMeetup.venue)}' },
    { from: '{meetup.venue}', to: '{(typeof meetup.venue === "object" ? meetup.venue.name : meetup.venue)}' },
    { from: '{m.venue}', to: '{(typeof m.venue === "object" ? m.venue.name : m.venue)}' },
    { from: '{selected.venue}', to: '{(typeof selected.venue === "object" ? selected.venue.name : selected.venue)}' },
    { from: '${selected?.venue}', to: '${typeof selected?.venue === "object" ? selected?.venue?.name : selected?.venue}' },
    { from: 'value: selected.venue', to: 'value: (typeof selected.venue === "object" ? selected.venue.name : selected.venue)' }
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    replacements.forEach(r => {
        // use split join to replace all occurrences
        content = content.split(r.from).join(r.to);
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
        changedCount++;
    }
});

console.log(`Fixed venue rendering in ${changedCount} files.`);
