const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

async function getDb() {
    if (dbInstance) return dbInstance;

    const dbPath = path.join(__dirname, 'database.sqlite');
    dbInstance = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });
    return dbInstance;
}

// Only call this once on server start
async function initDb() {
    const db = await getDb();

    await db.exec(`
    CREATE TABLE IF NOT EXISTS stamps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      year INTEGER,
      date TEXT,
      type TEXT,
      imageUrl TEXT,
      description TEXT,
      buyLinks TEXT
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS group_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      groupId INTEGER,
      stampId INTEGER,
      FOREIGN KEY (groupId) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (stampId) REFERENCES stamps(id) ON DELETE CASCADE,
      UNIQUE(groupId, stampId)
    );
  `);

    const count = await db.get('SELECT COUNT(*) as count FROM stamps');
    if (count.count === 0) {
        console.log("Seeding initial dataset...");
        const seedStamps = generateMassiveStampData();

        for (const stamp of seedStamps) {
            await db.run(
                'INSERT INTO stamps (name, year, date, type, imageUrl, description, buyLinks) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [stamp.name, stamp.year, stamp.date, stamp.type, stamp.imageUrl, stamp.description, JSON.stringify(stamp.buyLinks)]
            );
        }

        // Create a default initial group
        await db.run('INSERT OR IGNORE INTO groups (name) VALUES (?)', ['Favorites']);
        console.log("Database seeded with 60+ stamps and default group.");
    } else {
        console.log(`Database ready with ${count.count} stamps.`);
    }

    return db;
}

// Helper to generate a large dataset programmatically
function generateMassiveStampData() {
    const stamps = [];
    const startYear = 1947;
    const numYears = 30; // 1947 to 1976
    const types = ['Commemorative', 'Definitive', 'Special', 'Miniature Sheet'];

    const colors = [
        'FF7B54', '219EBC', '2A9D8F', 'E76F51', 'F4A261', 'E9C46A', '264653', '8AB17D', 'B22222', '4682B4'
    ];

    let stampIdTracker = 1;

    for (let year = startYear; year < startYear + numYears; year++) {
        const stampsThisYear = Math.floor(Math.random() * 2) + 2;

        for (let i = 0; i < stampsThisYear; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
            const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
            const color = colors[Math.floor(Math.random() * colors.length)];

            const themePrefixes = ['Heritage', 'Wildlife', 'Festival', 'Pioneer', 'Monument', 'Independence', 'Space', 'Agriculture'];
            const themeSuffixes = ['Series', 'Memorial', 'Centenary', 'Issue', 'Celebration', 'Tribute'];

            const title = `${themePrefixes[Math.floor(Math.random() * themePrefixes.length)]} ${themeSuffixes[Math.floor(Math.random() * themeSuffixes.length)]} ${stampIdTracker}`;

            stamps.push({
                name: title,
                year: year,
                date: `${year}-${month}-${day}`,
                type: type,
                imageUrl: `https://placehold.co/400x400/${color}/FFFFFF/png?text=${year}+${type.substring(0, 3)}+${stampIdTracker}`,
                description: `This ${type.toLowerCase()} stamp was issued on ${year}-${month}-${day} commemorating the ${title.toLowerCase()} of India.`,
                buyLinks: [`https://example-stamps.com/buy/${stampIdTracker}`]
            });
            stampIdTracker++;
        }
    }
    return stamps;
}

module.exports = { getDb, initDb };
