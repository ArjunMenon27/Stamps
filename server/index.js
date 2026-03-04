const express = require('express');
const cors = require('cors');
const { getDb, initDb } = require('./db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `stamp-${unique}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

app.use(cors());
app.use(express.json());

// Serve static images from public/images and server/uploads
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/uploads', express.static(uploadsDir));

// ==========================================
// STAMPS API
// ==========================================

// 1. Get all stamps with filters
app.get('/api/stamps', async (req, res) => {
    try {
        const db = await getDb();
        const { year, type, search } = req.query;

        let query = 'SELECT * FROM stamps WHERE 1=1';
        const params = [];

        if (year) {
            query += ' AND year = ?';
            params.push(year);
        }

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }

        if (search) {
            query += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY year DESC, id DESC';

        const stamps = await db.all(query, params);
        const parsedStamps = stamps.map(stamp => ({
            ...stamp,
            buyLinks: stamp.buyLinks ? JSON.parse(stamp.buyLinks) : []
        }));

        res.json(parsedStamps);
    } catch (error) {
        console.error("Error fetching stamps:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Get filter options
app.get('/api/filters', async (req, res) => {
    try {
        const db = await getDb();
        const years = await db.all('SELECT DISTINCT year FROM stamps ORDER BY year DESC');
        const types = await db.all('SELECT DISTINCT type FROM stamps ORDER BY type');

        res.json({
            years: years.map(y => y.year),
            types: types.map(t => t.type)
        });
    } catch (error) {
        console.error("Error fetching filters:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==========================================
// GROUPS API
// ==========================================

// 3. Get all groups with their items
app.get('/api/groups', async (req, res) => {
    try {
        const db = await getDb();
        const groups = await db.all('SELECT * FROM groups');

        for (let group of groups) {
            const query = `
        SELECT stamps.*, group_items.id as groupItemId
        FROM group_items
        JOIN stamps ON group_items.stampId = stamps.id
        WHERE group_items.groupId = ?
      `;
            const items = await db.all(query, [group.id]);
            group.items = items.map(item => ({
                ...item,
                buyLinks: item.buyLinks ? JSON.parse(item.buyLinks) : []
            }));
        }

        res.json(groups);
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Create a new group
app.post('/api/groups', async (req, res) => {
    try {
        const db = await getDb();
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Group name is required' });
        }

        const result = await db.run('INSERT INTO groups (name) VALUES (?)', [name.trim()]);
        res.status(201).json({ id: result.lastID, name: name.trim(), items: [] });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Group with this name already exists' });
        }
        console.error("Error creating group:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 5. Add a stamp to a group
app.post('/api/groups/:groupId/items', async (req, res) => {
    try {
        const db = await getDb();
        const { groupId } = req.params;
        const { stampId } = req.body;

        if (!stampId) {
            return res.status(400).json({ error: 'stampId is required' });
        }

        const group = await db.get('SELECT id FROM groups WHERE id = ?', [groupId]);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const existing = await db.get('SELECT * FROM group_items WHERE groupId = ? AND stampId = ?', [groupId, stampId]);
        if (existing) {
            return res.status(400).json({ error: 'Stamp already exists in this group' });
        }

        const result = await db.run('INSERT INTO group_items (groupId, stampId) VALUES (?, ?)', [groupId, stampId]);
        res.status(201).json({ message: 'Added to group', id: result.lastID, groupId, stampId });
    } catch (error) {
        console.error("Error adding to group:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 6. Remove a stamp from a group
app.delete('/api/groups/:groupId/items/:stampId', async (req, res) => {
    try {
        const db = await getDb();
        const { groupId, stampId } = req.params;

        await db.run('DELETE FROM group_items WHERE groupId = ? AND stampId = ?', [groupId, stampId]);
        res.json({ message: 'Removed from group', groupId, stampId });
    } catch (error) {
        console.error("Error removing from group:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 7. Delete an entire group
app.delete('/api/groups/:groupId', async (req, res) => {
    try {
        const db = await getDb();
        const { groupId } = req.params;

        await db.run('DELETE FROM groups WHERE id = ?', [groupId]);
        res.json({ message: 'Deleted group completely', groupId });
    } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==========================================
// ADMIN API
// ==========================================

// 8. Get all stamps for admin (no filters, full list with stats)
app.get('/api/admin/stamps', async (req, res) => {
    try {
        const db = await getDb();
        const stamps = await db.all('SELECT * FROM stamps ORDER BY id DESC');
        const parsedStamps = stamps.map(stamp => ({
            ...stamp,
            buyLinks: stamp.buyLinks ? JSON.parse(stamp.buyLinks) : []
        }));
        res.json(parsedStamps);
    } catch (error) {
        console.error("Error fetching admin stamps:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 9. Admin stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const db = await getDb();
        const total = await db.get('SELECT COUNT(*) as count FROM stamps');
        const types = await db.all('SELECT type, COUNT(*) as count FROM stamps GROUP BY type');
        const years = await db.all('SELECT MIN(year) as minYear, MAX(year) as maxYear FROM stamps');
        const groups = await db.get('SELECT COUNT(*) as count FROM groups');

        res.json({
            totalStamps: total.count,
            typeBreakdown: types,
            yearRange: years[0],
            totalGroups: groups.count
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 10. Create a new stamp (with optional image upload)
app.post('/api/admin/stamps', upload.single('image'), async (req, res) => {
    try {
        const db = await getDb();
        const { name, year, date, type, description, buyLinks } = req.body;

        if (!name || !year || !type) {
            return res.status(400).json({ error: 'name, year, and type are required' });
        }

        let imageUrl = req.body.imageUrl || '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const parsedBuyLinks = buyLinks
            ? (Array.isArray(buyLinks) ? buyLinks : [buyLinks]).filter(Boolean)
            : [];

        const result = await db.run(
            'INSERT INTO stamps (name, year, date, type, imageUrl, description, buyLinks) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name.trim(), parseInt(year), date || '', type.trim(), imageUrl, description || '', JSON.stringify(parsedBuyLinks)]
        );

        const newStamp = await db.get('SELECT * FROM stamps WHERE id = ?', [result.lastID]);
        res.status(201).json({ ...newStamp, buyLinks: parsedBuyLinks });
    } catch (error) {
        console.error("Error creating stamp:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 11. Update an existing stamp (with optional image upload)
app.put('/api/admin/stamps/:id', upload.single('image'), async (req, res) => {
    try {
        const db = await getDb();
        const { id } = req.params;
        const { name, year, date, type, description, buyLinks } = req.body;

        const existing = await db.get('SELECT * FROM stamps WHERE id = ?', [id]);
        if (!existing) return res.status(404).json({ error: 'Stamp not found' });

        let imageUrl = req.body.imageUrl !== undefined ? req.body.imageUrl : existing.imageUrl;
        if (req.file) {
            // Delete old uploaded image if it exists
            if (existing.imageUrl && existing.imageUrl.startsWith('/uploads/')) {
                const oldFile = path.join(uploadsDir, path.basename(existing.imageUrl));
                if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
            }
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const parsedBuyLinks = buyLinks
            ? (Array.isArray(buyLinks) ? buyLinks : [buyLinks]).filter(Boolean)
            : JSON.parse(existing.buyLinks || '[]');

        await db.run(
            'UPDATE stamps SET name=?, year=?, date=?, type=?, imageUrl=?, description=?, buyLinks=? WHERE id=?',
            [
                (name || existing.name).trim(),
                parseInt(year || existing.year),
                date !== undefined ? date : existing.date,
                (type || existing.type).trim(),
                imageUrl,
                description !== undefined ? description : existing.description,
                JSON.stringify(parsedBuyLinks),
                id
            ]
        );

        const updated = await db.get('SELECT * FROM stamps WHERE id = ?', [id]);
        res.json({ ...updated, buyLinks: parsedBuyLinks });
    } catch (error) {
        console.error("Error updating stamp:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 12. Delete a stamp
app.delete('/api/admin/stamps/:id', async (req, res) => {
    try {
        const db = await getDb();
        const { id } = req.params;

        const stamp = await db.get('SELECT * FROM stamps WHERE id = ?', [id]);
        if (!stamp) return res.status(404).json({ error: 'Stamp not found' });

        // Delete uploaded image file if it exists
        if (stamp.imageUrl && stamp.imageUrl.startsWith('/uploads/')) {
            const filePath = path.join(uploadsDir, path.basename(stamp.imageUrl));
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await db.run('DELETE FROM stamps WHERE id = ?', [id]);
        res.json({ message: 'Stamp deleted', id });
    } catch (error) {
        console.error("Error deleting stamp:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Multer error handler
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message === 'Only image files are allowed') {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initDb();
});
