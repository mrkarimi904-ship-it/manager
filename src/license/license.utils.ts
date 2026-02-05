import * as crypto from 'crypto';
import { promisify } from 'util';

const hkdfAsync = promisify(crypto.hkdf);

// Base64URL encoding/decoding
export const b64u = {
  e: (b: Buffer): string => Buffer.from(b).toString('base64url'),
  d: (s: string): Buffer => Buffer.from(s, 'base64url'),
};

export const sha256hex = (buf: Buffer): string => crypto.createHash('sha256').update(buf).digest('hex');
export const canonical = (obj: any): Buffer => Buffer.from(JSON.stringify(obj));
export const nowIso = (): string => new Date().toISOString();

/** Async HKDF-SHA256 to avoid blocking the event loop. */
export async function hkdfSha256(ikmBuf: Buffer, saltBuf: Buffer, infoStr: string, len: number = 32): Promise<Buffer> {
  const result = await hkdfAsync('sha256', ikmBuf, saltBuf, Buffer.from(infoStr, 'utf8'), len);
  return Buffer.from(result);
}

export function aesGcmEncrypt(keyBuf: Buffer, nonceBuf: Buffer, plaintextBuf: Buffer, aadBuf?: Buffer): { ct: Buffer; tag: Buffer } {
  const cipher = crypto.createCipheriv(keyBuf.length === 32 ? 'aes-256-gcm' : 'aes-128-gcm', keyBuf, nonceBuf);
  if (aadBuf) cipher.setAAD(aadBuf, { plaintextLength: plaintextBuf.length });
  const ct = Buffer.concat([cipher.update(plaintextBuf), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ct, tag };
}

export function aesGcmDecrypt(keyBuf: Buffer, nonceBuf: Buffer, ctBuf: Buffer, tagBuf: Buffer, aadBuf?: Buffer): Buffer {
  const decipher = crypto.createDecipheriv(keyBuf.length === 32 ? 'aes-256-gcm' : 'aes-128-gcm', keyBuf, nonceBuf);
  if (aadBuf) decipher.setAAD(aadBuf, { plaintextLength: ctBuf.length });
  decipher.setAuthTag(tagBuf);
  return Buffer.concat([decipher.update(ctBuf), decipher.final()]);
}

// ---------- CLIENT: open/verify license ----------
export async function openLicense({ licenseString, hwidHex, ed25519PublicKeyPem }: {
  licenseString: string;
  hwidHex: string;
  ed25519PublicKeyPem: string;
}): Promise<any> {
  const lic = JSON.parse(Buffer.from(licenseString, 'base64url').toString('utf8'));
  const { sig, ...noSig } = lic;

  const publicKey = crypto.createPublicKey({
    key: ed25519PublicKeyPem.replace(/\\n/g, '\n'),
    format: 'pem',
    type: 'spki',
  });

  const ok = crypto.verify(null, canonical(noSig), publicKey, Buffer.from(sig, 'base64url'));
  if (!ok) throw new Error('Invalid license signature');

  const salt = Buffer.from(lic.salt, 'base64url');
  const wrapKey = await hkdfSha256(Buffer.from(hwidHex, 'hex'), salt, 'myapp license wrapkey', 32);

  const cekWrap = Buffer.from(lic.cekWrap, 'base64url');
  const cekNonce = cekWrap.subarray(0, 12);
  const cekCt = cekWrap.subarray(12, cekWrap.length - 16);
  const cekTag = cekWrap.subarray(cekWrap.length - 16);
  const cek = aesGcmDecrypt(wrapKey, cekNonce, cekCt, cekTag, null);

  const nonce = Buffer.from(lic.nonce, 'base64url');
  const ct = Buffer.from(lic.ct, 'base64url');
  const tag = Buffer.from(lic.tag, 'base64url');
  const payloadBuf = aesGcmDecrypt(cek, nonce, ct, tag, null);

  return JSON.parse(payloadBuf.toString('utf8'));
}

// ---------- BACKEND: issue license (DO NOT SHIP PRIVATE KEY) ----------
export async function issueLicense({ payloadJson, hwidHex, ed25519PrivateKeyPem }: {
  payloadJson: any;
  hwidHex: string;
  ed25519PrivateKeyPem: string;
}): Promise<string> {
  const cek = crypto.randomBytes(32);
  const salt = crypto.randomBytes(16);
  const wrapKey = await hkdfSha256(Buffer.from(hwidHex, 'hex'), salt, 'myapp license wrapkey', 32);

  const cekNonce = crypto.randomBytes(12);
  const { ct: cekCt, tag: cekTag } = aesGcmEncrypt(wrapKey, cekNonce, cek, null);
  const cekWrap = Buffer.concat([cekNonce, cekCt, cekTag]);

  const nonce = crypto.randomBytes(12);
  const { ct, tag } = aesGcmEncrypt(cek, nonce, Buffer.from(JSON.stringify(payloadJson)), null);

  const licNoSig = {
    v: 1,
    alg: { sig: 'Ed25519', enc: 'AES-256-GCM', kdf: 'HKDF-SHA256' },
    salt: b64u.e(salt),
    nonce: b64u.e(nonce),
    cekWrap: b64u.e(cekWrap),
    ct: b64u.e(ct),
    tag: b64u.e(tag),
  };

  const privateKey = crypto.createPrivateKey({
    key: ed25519PrivateKeyPem,
    format: 'pem',
    type: 'pkcs8',
  });
  const sig = crypto.sign(null, canonical(licNoSig), privateKey);

  return b64u.e(Buffer.from(JSON.stringify({ ...licNoSig, sig: b64u.e(sig) })));
}

