import { spawn } from 'child_process';
import type { TV } from '@/types';

const SSHPASS = '/tmp/sshpass-local/usr/bin/sshpass';
const SSH_HOST = process.env.SSH_HOST || '100.75.229.76';
const SSH_USER = process.env.SSH_USER || 'sshuser';
const SSH_PASS = process.env.SSH_PASS || 'Hello905!';

export async function pushImageToTV(imageBuffer: Buffer, tv: TV): Promise<void> {
  return new Promise((resolve, reject) => {
    // Python script that reads image from stdin and pushes to Samsung Frame TV
    const pythonScript = [
      'import sys, json, time',
      'from samsungtvws import SamsungTVWS',
      'image_data = sys.stdin.buffer.read()',
      `tv = SamsungTVWS('${tv.ip}', port=8002, token_file='/tmp/tv_token_${tv.id}.txt')`,
      'tv.open()',
      'art = tv.art()',
      'result = art.upload_image(image_data, file_type="JPEG", matte="none")',
      'if result:',
      '    content_id = result if isinstance(result, str) else result.get("content_id") or result.get("ContentId", "")',
      '    if content_id:',
      '        time.sleep(1)',
      '        art.select_image(content_id, show=True)',
      'print("OK")',
      'sys.exit(0)',
    ].join('\n');

    const sshArgs = [
      '-p', SSH_PASS,
      'ssh',
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'ConnectTimeout=15',
      '-o', 'BatchMode=no',
      `${SSH_USER}@${SSH_HOST}`,
      'python3',
      '-c',
      pythonScript,
    ];

    const proc = spawn(SSHPASS, sshArgs, { timeout: 30000 });

    proc.stdin.write(imageBuffer);
    proc.stdin.end();

    let stderr = '';
    proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    proc.on('close', (code: number) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Push failed for ${tv.name}: ${stderr || `exit code ${code}`}`));
      }
    });

    proc.on('error', (err: Error) => {
      reject(new Error(`SSH spawn error for ${tv.name}: ${err.message}`));
    });
  });
}
