// Kepala "bobblehead" dari satu foto wajah: latar foto dibuang, wajah dipasang di plane
// yang selalu menghadap kamera, lalu dianimasikan lewat mesh-warp (kedip & senyum).
import * as THREE from "three";

type Pt = { u: number; v: number };

/**
 * Titik-titik wajah dalam koordinat foto (0–1, v dari atas). Disetel untuk
 * public/runner/face.jpg; kalau fotonya diganti, sesuaikan angka di sini.
 */
export const FACE_POINTS = {
  eyeL: { u: 0.4, v: 0.413 },
  eyeR: { u: 0.6, v: 0.408 },
  mouthL: { u: 0.432, v: 0.627 },
  mouthR: { u: 0.594, v: 0.624 },
  cheekL: { u: 0.36, v: 0.57 },
  cheekR: { u: 0.645, v: 0.565 },
  mouth: { u: 0.513, v: 0.626 },
  chin: 0.75, // batas dagu (v); di bawahnya memudar
};

export type FaceImages = { photo: HTMLCanvasElement; outline: HTMLCanvasElement; pad: number };

const S = 400; // resolusi kerja

/** Muat foto, buang latar polos (flood-fill dari tepi), dan buat siluet untuk outline stiker. */
export async function loadFace(url: string, opts: { keepBody?: boolean } = {}): Promise<FaceImages> {
  const img = new Image();
  img.src = url;
  await img.decode();

  const photo = document.createElement("canvas");
  photo.width = photo.height = S;
  const x = photo.getContext("2d", { willReadFrequently: true })!;
  // Potong jadi persegi di tengah kalau fotonya tidak persegi.
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  x.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, S, S);

  const data = x.getImageData(0, 0, S, S);
  const p = data.data;
  // Latar: abu-abu/putih polos (hampir tanpa saturasi), tidak terlalu gelap (rambut) atau terang.
  const isBg = (n: number) => {
    const i = n * 4;
    const r = p[i], g = p[i + 1], b = p[i + 2];
    const l = (r + g + b) / 3;
    return Math.max(r, g, b) - Math.min(r, g, b) < 22 && l > 82 && l < 228;
  };
  const bg = new Uint8Array(S * S);
  const stack: number[] = [];
  const seed = (n: number) => {
    if (!bg[n] && isBg(n)) {
      bg[n] = 1;
      stack.push(n);
    }
  };
  for (let k = 0; k < S; k++) {
    seed(k);
    // keepBody: jangan mulai dari tepi bawah supaya bayangan kemeja tidak ikut terhapus.
    if (!opts.keepBody) seed((S - 1) * S + k);
    if (!opts.keepBody || k < S * 0.8) {
      seed(k * S);
      seed(k * S + S - 1);
    }
  }
  while (stack.length) {
    const n = stack.pop()!;
    const cx = n % S;
    const cy = (n / S) | 0;
    if (cx > 0) seed(n - 1);
    if (cx < S - 1) seed(n + 1);
    if (cy > 0) seed(n - S);
    if (cy < S - 1) seed(n + S);
  }

  // Alpha lembut: blur kotak 2x, pudar di bawah dagu, dan batas elips sebagai pengaman.
  let a = new Float32Array(S * S);
  for (let n = 0; n < a.length; n++) a[n] = bg[n] ? 0 : 1;
  for (let it = 0; it < 2; it++) {
    const b2 = new Float32Array(S * S);
    for (let y = 0; y < S; y++) {
      for (let xx = 0; xx < S; xx++) {
        let s = 0, c = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const X = xx + dx, Y = y + dy;
            if (X < 0 || Y < 0 || X >= S || Y >= S) continue;
            s += a[Y * S + X];
            c++;
          }
        }
        b2[y * S + xx] = s / c;
      }
    }
    a = b2;
  }
  const chinY = FACE_POINTS.chin * S;
  for (let y = 0; y < S; y++) {
    for (let xx = 0; xx < S; xx++) {
      const n = y * S + xx;
      let f = a[n];
      if (opts.keepBody) {
        p[n * 4 + 3] = f * 255;
        continue;
      }
      const t = Math.min(1, Math.max(0, (y - (chinY - 5)) / 50));
      f *= 1 - t * t * (3 - 2 * t);
      const ex = (xx - S / 2) / (S * 0.375);
      const ey = (y - S * 0.425) / (S * 0.46);
      if (ex * ex + ey * ey > 1) f = 0;
      p[n * 4 + 3] = f * 255;
    }
  }
  x.putImageData(data, 0, 0);

  // Siluet melebar (outline stiker): gambar foto berulang di sekeliling lingkaran, lalu warnai.
  const pad = 10;
  const outline = document.createElement("canvas");
  outline.width = outline.height = S + pad * 2;
  const o = outline.getContext("2d")!;
  for (let k = 0; k < 24; k++) {
    const ang = (k / 24) * Math.PI * 2;
    o.drawImage(photo, pad + Math.cos(ang) * pad, pad + Math.sin(ang) * pad);
  }
  o.globalCompositeOperation = "source-in";
  o.fillStyle = "#efece4";
  o.fillRect(0, 0, outline.width, outline.height);

  return { photo, outline, pad };
}

const gauss = (u: number, v: number, c: Pt, s: number) =>
  Math.exp(-((u - c.u) ** 2 + (v - c.v) ** 2) / (2 * s * s));

export class FaceRig {
  readonly group = new THREE.Group();
  private readonly geo: THREE.PlaneGeometry;
  private readonly base: Float32Array;
  private readonly uv: Float32Array;
  private readonly size: number;
  private readonly disposables: { dispose(): void }[] = [];

  private smile = 0;
  private talking = false;
  private open = 0;
  private readonly mouth: THREE.Mesh;
  private smileTarget = 0;
  private blink = 0;
  private blinkAt = -1;
  private nextBlink = 1.5;
  private nextAutoSmile = 3.5;
  private autoSmileUntil = 0;
  private dirty = true;
  private t = 0;

  constructor(images: FaceImages, size: number, opts: { outline?: boolean } = {}) {
    this.size = size;

    const photoTex = new THREE.CanvasTexture(images.photo);
    photoTex.colorSpace = THREE.SRGBColorSpace;
    const outlineTex = new THREE.CanvasTexture(images.outline);
    outlineTex.colorSpace = THREE.SRGBColorSpace;

    this.geo = new THREE.PlaneGeometry(size, size, 64, 64);
    this.base = Float32Array.from(this.geo.attributes.position!.array as Float32Array);
    this.uv = Float32Array.from(this.geo.attributes.uv!.array as Float32Array);

    const faceMat = new THREE.MeshBasicMaterial({
      map: photoTex,
      transparent: true,
      alphaTest: 0.03,
      toneMapped: false,
      fog: false,
      depthWrite: false,
    });
    const outlineSize = size * ((S + images.pad * 2) / S);
    const outlineGeo = new THREE.PlaneGeometry(outlineSize, outlineSize);
    const outlineMat = new THREE.MeshBasicMaterial({
      map: outlineTex,
      transparent: true,
      alphaTest: 0.03,
      toneMapped: false,
      fog: false,
      depthWrite: false,
    });

    const outlineMesh = new THREE.Mesh(outlineGeo, outlineMat);
    outlineMesh.visible = opts.outline !== false;
    outlineMesh.position.z = -0.01;
    outlineMesh.renderOrder = 10;
    const faceMesh = new THREE.Mesh(this.geo, faceMat);
    faceMesh.renderOrder = 11;
    this.group.add(outlineMesh, faceMesh);

    // Rongga mulut: elips gelap bertepi lembut yang membesar saat bicara.
    const mc = document.createElement("canvas");
    mc.width = mc.height = 64;
    const mx = mc.getContext("2d")!;
    const grad = mx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(38,10,10,1)");
    grad.addColorStop(0.6, "rgba(70,22,20,0.95)");
    grad.addColorStop(1, "rgba(110,45,40,0)");
    mx.fillStyle = grad;
    mx.fillRect(0, 0, 64, 64);
    const mouthTex = new THREE.CanvasTexture(mc);
    mouthTex.colorSpace = THREE.SRGBColorSpace;
    const mouthGeo = new THREE.PlaneGeometry(1, 1);
    const mouthMat = new THREE.MeshBasicMaterial({
      map: mouthTex,
      transparent: true,
      toneMapped: false,
      fog: false,
      depthWrite: false,
    });
    this.mouth = new THREE.Mesh(mouthGeo, mouthMat);
    this.mouth.renderOrder = 12;
    this.mouth.position.set((FACE_POINTS.mouth.u - 0.5) * size, (0.5 - FACE_POINTS.mouth.v) * size, 0.004);
    this.mouth.visible = false;
    this.group.add(this.mouth);

    this.disposables.push(photoTex, outlineTex, this.geo, faceMat, outlineGeo, outlineMat, mouthTex, mouthGeo, mouthMat);
  }

  /** Mulut bergerak seperti sedang bicara. */
  setTalk(on: boolean) {
    this.talking = on;
  }

  /** 0 = netral, 1 = senyum lebar. Dipakai saat kursor mendekat. */
  setSmile(target: number) {
    this.smileTarget = target;
  }

  update(dt: number) {
    this.t += dt;

    // Senyum otomatis sesekali, supaya tetap hidup di HP (tanpa kursor).
    if (this.t > this.nextAutoSmile) {
      this.autoSmileUntil = this.t + 2.2;
      this.nextAutoSmile = this.t + 6 + Math.random() * 4;
    }
    const want = Math.max(this.smileTarget, this.t < this.autoSmileUntil ? 1 : 0);
    const s = this.smile + (want - this.smile) * Math.min(1, dt * 7);
    if (Math.abs(s - this.smile) > 1e-4) {
      this.smile = s;
      this.dirty = true;
    }

    // Bicara: buka-tutup tak beraturan (dua gelombang dikalikan) supaya tidak seperti robot.
    const want2 = this.talking
      ? 0.25 + 0.75 * Math.abs(Math.sin(this.t * 12.5)) * (0.55 + 0.45 * Math.sin(this.t * 4.7 + 1))
      : 0;
    const o = this.open + (want2 - this.open) * Math.min(1, dt * 18);
    if (Math.abs(o - this.open) > 1e-4) {
      this.open = o;
      this.dirty = true;
    }

    // Kedip: tutup 70 ms, buka 110 ms; kadang dua kali.
    if (this.blinkAt < 0 && this.t > this.nextBlink) {
      this.blinkAt = this.t;
      this.nextBlink = this.t + (Math.random() < 0.2 ? 0.35 : 2.4 + Math.random() * 3);
    }
    if (this.blinkAt >= 0) {
      const e = this.t - this.blinkAt;
      this.blink = e < 0.07 ? e / 0.07 : e < 0.18 ? 1 - (e - 0.07) / 0.11 : 0;
      if (e >= 0.18) this.blinkAt = -1;
      this.dirty = true;
    }

    if (this.dirty) this.warp();
  }

  private warp() {
    this.dirty = false;
    const F = FACE_POINTS;
    const pos = this.geo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const sm = this.smile;
    const bl = this.blink;
    const op = this.open;
    const n = arr.length / 3;

    for (let i = 0; i < n; i++) {
      const u = this.uv[i * 2]!;
      const v = 1 - this.uv[i * 2 + 1]!; // v gambar: 0 di atas
      let du = 0;
      let dv = 0;

      if (sm > 0.001) {
        // Sudut bibir naik & melebar, pipi terangkat, kelopak bawah sedikit naik.
        const gl = gauss(u, v, F.mouthL, 0.03);
        const gr = gauss(u, v, F.mouthR, 0.03);
        dv -= (gl + gr) * 0.02 * sm;
        du += (gr - gl) * 0.009 * sm;
        dv -= (gauss(u, v, F.cheekL, 0.05) + gauss(u, v, F.cheekR, 0.05)) * 0.008 * sm;
        const lidL = { u: F.eyeL.u, v: F.eyeL.v + 0.025 };
        const lidR = { u: F.eyeR.u, v: F.eyeR.v + 0.025 };
        dv -= (gauss(u, v, lidL, 0.02) + gauss(u, v, lidR, 0.02)) * 0.005 * sm;
      }

      if (bl > 0.001) {
        // Area mata dipipihkan ke garis tengahnya.
        for (const eye of [F.eyeL, F.eyeR]) {
          const ex = (u - eye.u) / 0.065;
          const ey = (v - eye.v) / 0.042;
          const e = ex * ex + ey * ey;
          if (e < 1) {
            const w = (1 - e) * (1 - e);
            dv += (eye.v - v) * bl * w * 0.95;
          }
        }
      }

      if (op > 0.001) {
        // Rahang turun: area di bawah garis mulut ikut turun, memudar ke arah leher.
        const below = Math.min(1, Math.max(0, (v - F.mouth.v + 0.004) / 0.018));
        const fade = Math.min(1, Math.max(0, (F.chin + 0.07 - v) / 0.12));
        const wide = Math.exp(-(((u - F.mouth.u) / 0.13) ** 2));
        dv += op * 0.03 * below * fade * wide;
      }

      arr[i * 3] = this.base[i * 3]! + du * this.size;
      arr[i * 3 + 1] = this.base[i * 3 + 1]! - dv * this.size;
    }
    pos.needsUpdate = true;

    this.mouth.visible = op > 0.02;
    if (this.mouth.visible) {
      const w = (F.mouthR.u - F.mouthL.u) * this.size * (0.62 + 0.18 * op + 0.1 * sm);
      const h = op * 0.032 * this.size + 0.002;
      this.mouth.scale.set(w, h, 1);
      this.mouth.position.y = (0.5 - F.mouth.v - op * 0.012) * this.size;
    }
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}
