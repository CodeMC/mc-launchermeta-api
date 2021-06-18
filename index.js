'use strict';

const Express = require('express');
const Axios = require('axios');
const NodeCache = require('node-cache');

const LAUNCHER_META_ENDPOINT = 'https://launchermeta.mojang.com';
const VERSION_MANIFEST_URI = `${LAUNCHER_META_ENDPOINT}/mc/game/version_manifest.json`;

const CACHE_MANIFEST = 'versionManifest';
const CACHE_DESCRIPTOR = 'descriptor';

const cache = new NodeCache({
    stdTTL: parseInt(process.env.CACHE_TTL || 600)
});
const client = Axios.create();
const app = Express();

async function getVersionManifest() {
    const cached = cache.get(CACHE_MANIFEST);
    if (cached) {
        return cached;
    }
    const manifest = (await client.get(VERSION_MANIFEST_URI))?.data;
    if (!manifest) {
        throw new Error('Null manifest!');
    }
    cache.set(CACHE_MANIFEST, manifest);
    return manifest;
}

async function getVersionDescriptor(version) {
    const cached = cache.get(`${CACHE_DESCRIPTOR}${version}`);
    if (cached) {
        return cached;
    }
    const manifest = await getVersionManifest();
    const descriptorUrl = manifest.versions.find(current => current.id === version)?.url;
    if (!descriptorUrl) {
        throw new Error(`Unknown version ${version}`);
    }
    const descriptor = (await client.get(descriptorUrl))?.data;
    if (!descriptor) {
        throw new Error('Null descriptor!');
    }
    cache.set(`${CACHE_DESCRIPTOR}${version}`, descriptor);
    return descriptor;
}

app.get('/minecraft/version/latest', async (request, response) => {
    const manifest = await getVersionManifest();

    const release = await getVersionDescriptor(manifest.latest.release);
    const snapshot = await getVersionDescriptor(manifest.latest.snapshot);

    response.json({
        release: release,
        snapshot: snapshot
    });
});

app.get('/minecraft/version/latest/:type', async (request, response) => {
    const manifest = await getVersionManifest();

    let version;
    switch (request.params.type) {
    case 'release':
        version = manifest.latest.release;
        break;
    case 'snapshot':
        version = manifest.latest.release;
        break;
    default:
        throw new Error(`Unknown type ${request.params.type}`);
    }

    const descriptor = await getVersionDescriptor(version);
    response.json(descriptor);
});

app.get('/minecraft/version/latest/:type/download/:download', async (request, response) => {
    const manifest = await getVersionManifest();

    let version;
    switch (request.params.type) {
    case 'release':
        version = manifest.latest.release;
        break;
    case 'snapshot':
        version = manifest.latest.release;
        break;
    default:
        response.status(404);
        response.send(`No such type '${request.params.type}'`);
        return;
    }

    const descriptor = await getVersionDescriptor(version);
    const downloadUrl = descriptor.downloads[request.params.download]?.url;
    if (!downloadUrl) {
        response.status(404);
        response.send(`No such download '${request.params.download}'`);
        return;
    }

    response.redirect(downloadUrl);
});

app.listen(process.env.PORT || 3000);
