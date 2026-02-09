'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { fixWebmDurationBuffer } = require('./FixWebmDurationBuffer');

const Logger = require('./Logger');
const log = new Logger('DurationOrRemux');

function hasFfmpeg() {
    const r = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return r.status === 0;
}

function remuxWithFfmpeg(inputPath, format = 'webm') {
    const dir = path.dirname(inputPath);
    const base = path.basename(inputPath, path.extname(inputPath));
    const out = path.join(dir, `${base}.fixed.${format}`);

    const args = [
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-i',
        inputPath,
        '-c',
        'copy',
        ...(format === 'mp4' ? ['-movflags', '+faststart'] : []),
        out,
    ];
    const r = spawnSync('ffmpeg', args);
    if (r.status !== 0 || !fs.existsSync(out)) return null;

    fs.renameSync(out, inputPath);
    return inputPath;
}

function convertToMp4(inputPath) {
    const dir = path.dirname(inputPath);
    const base = path.basename(inputPath, path.extname(inputPath));
    const out = path.join(dir, `${base}.mp4`);

    log.info(`[FFmpeg] Converting ${inputPath} to MP4 (H264/AAC)...`);

    const args = [
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-i',
        inputPath,
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-movflags',
        '+faststart',
        out,
    ];

    const r = spawnSync('ffmpeg', args);
    if (r.status !== 0 || !fs.existsSync(out)) {
        log.error(`[FFmpeg] MP4 conversion failed for ${inputPath}`, r.stderr?.toString());
        return null;
    }

    // If conversion successful, we can keep both or replace.
    // Usually, we replace the original if we want the final product to be MP4.
    // However, the system might expect the original fileName.
    // Let's return the new path.
    return out;
}

function fixDurationOrRemux(inputPath, durationMs, targetFormat = 'webm') {
    const ext = path.extname(inputPath).toLowerCase();
    const isWebm = ext === '.webm';
    const isMp4 = ext === '.mp4';

    if (hasFfmpeg()) {
        if (targetFormat === 'mp4' && isWebm) {
            const mp4Path = convertToMp4(inputPath);
            if (mp4Path) {
                // Remove the old webm file
                try {
                    fs.unlinkSync(inputPath);
                    log.info(`[FFmpeg] Original WebM removed: ${inputPath}`);
                } catch (e) {}
                return mp4Path;
            }
        }

        if (isWebm || isMp4) {
            const ok = remuxWithFfmpeg(inputPath, isMp4 ? 'mp4' : 'webm');
            log.debug('ffmpeg detected remuxWithFfmpeg:', ok);
            if (ok) return inputPath;
        }
    }

    if (isWebm && Number.isFinite(durationMs)) {
        const inBuf = fs.readFileSync(inputPath);
        const outBuf = fixWebmDurationBuffer(inBuf, Number(durationMs));
        if (outBuf && outBuf.length) {
            fs.writeFileSync(inputPath, outBuf);
            log.debug('No ffmpeg detected fixWebmDurationBuffer - true');
            return inputPath;
        }
    }
    log.debug('No ffmpeg detected fixWebmDurationBuffer - false');
    return false;
}

module.exports = { fixDurationOrRemux };
