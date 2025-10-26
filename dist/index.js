import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import dotenv from 'dotenv';
import * as fileFSUntil from './utils/fileSystemUtil.js';
dotenv.config();
const app = new Hono();
// create
app.post('/create', async (c) => {
    const { path: relPath, content } = await c.req.json();
    try {
        console.log('Creating file at path:', await c.req.json());
        const result = await fileFSUntil.create(relPath, content);
        return c.json(result);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'Unable to create file' }, 500);
    }
});
app.get('/list', async (c) => {
    try {
        const items = await fileFSUntil.list();
        return c.json({ items });
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'Unable to read directory' }, 500);
    }
});
app.post('/copy', async (c) => {
    const { src, dest } = await c.req.json();
    try {
        const result = await fileFSUntil.copy(src, dest);
        return c.json(result);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'Unable to copy file/folder' }, 500);
    }
});
app.post('/remove', async (c) => {
    const { target } = await c.req.json();
    try {
        const result = await fileFSUntil.remove(target);
        return c.json(result);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'Unable to remove file/folder' }, 500);
    }
});
app.post('/move', async (c) => {
    const { src, dest } = await c.req.json();
    try {
        const result = await fileFSUntil.move(src, dest);
        return c.json(result);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'Unable to move file/folder' }, 500);
    }
});
serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
