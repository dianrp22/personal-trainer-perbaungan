// Figur manusia low-poly (pria / wanita) untuk hero: badan, baju, sepatu, dan kepala dari foto.
// Menghadap +z (ke kamera). Semua rotasi sendi dalam radian.
import * as THREE from "three";
import { FaceRig, loadFace } from "./face-rig";

export type FigureKind = "pria" | "wanita";

type Disposable = { dispose(): void };

const PALETTE: Record<FigureKind, { skin: number; top: number; bottom: number; shoe: number; sole: number; hair: number }> = {
  pria: { skin: 0xc08a6c, top: 0xff5a1f, bottom: 0x1d1d1b, shoe: 0xefece4, sole: 0xff5a1f, hair: 0x141110 },
  wanita: { skin: 0xc9967a, top: 0xefece4, bottom: 0xff5a1f, shoe: 0x1d1d1b, sole: 0xefece4, hair: 0x1b1311 },
};

// Profil torso (radius, tinggi) dari pinggang ke pangkal leher; diputar jadi lathe lalu dipipihkan.
const TORSO: Record<FigureKind, [number, number][]> = {
  pria: [[0.15, 0], [0.152, 0.08], [0.142, 0.18], [0.172, 0.3], [0.198, 0.41], [0.2, 0.47], [0.15, 0.53], [0.06, 0.56], [0, 0.565]],
  wanita: [[0.165, 0], [0.152, 0.07], [0.122, 0.19], [0.148, 0.3], [0.158, 0.38], [0.158, 0.45], [0.12, 0.51], [0.05, 0.54], [0, 0.545]],
};

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

type Arm = { shoulder: THREE.Group; elbow: THREE.Group };
type Leg = { hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group };

export const FACE_SIZE = 0.5;

export class Human {
  readonly root = new THREE.Group();
  readonly kind: FigureKind;
  /** Titik di tengah wajah (untuk menempelkan foto dan menghitung posisi balon kata). */
  readonly headAnchor: THREE.Group;
  face: FaceRig | null = null;

  private readonly hips: THREE.Group;
  private readonly torso: THREE.Group;
  private readonly head: THREE.Group;
  private readonly fallback: THREE.Group;
  private readonly armL: Arm;
  private readonly armR: Arm;
  private readonly legL: Leg;
  private readonly legR: Leg;
  private readonly disposables: Disposable[] = [];

  private wave = 0;
  private waveTarget = 0;
  private t = 0;

  constructor(kind: FigureKind) {
    this.kind = kind;
    const C = PALETTE[kind];
    const f = kind === "wanita";
    const track = <T extends Disposable>(x: T): T => {
      this.disposables.push(x);
      return x;
    };

    const cloth = (color: number) => track(new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.02 }));
    const skin = track(new THREE.MeshStandardMaterial({ color: C.skin, roughness: 0.55, metalness: 0 }));
    const top = cloth(C.top);
    const bottom = cloth(C.bottom);
    const shoe = cloth(C.shoe);
    const sole = cloth(C.sole);
    const hair = track(new THREE.MeshStandardMaterial({ color: C.hair, roughness: 0.85 }));

    const g = (parent: THREE.Object3D, x = 0, y = 0, z = 0) => {
      const o = new THREE.Group();
      o.position.set(x, y, z);
      parent.add(o);
      return o;
    };
    const m = (geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };
    // Silinder meruncing yang menggantung ke bawah dari titik sendi.
    const limb = (rTop: number, rBot: number, len: number) => {
      const geo = track(new THREE.CylinderGeometry(rTop, rBot, len, 16, 1));
      geo.translate(0, -len / 2, 0);
      return geo;
    };
    const ball = (r: number) => track(new THREE.SphereGeometry(r, 18, 14));

    // ---------- Pinggul & kaki ----------
    this.hips = g(this.root, 0, 0.93, 0);
    const pelvis = m(ball(1), bottom, this.hips, 0, -0.03, 0);
    pelvis.scale.set(f ? 0.185 : 0.165, 0.12, 0.12);

    const makeLeg = (side: 1 | -1): Leg => {
      const hip = g(this.hips, side * (f ? 0.1 : 0.092), -0.04, 0);
      m(ball(f ? 0.088 : 0.084), bottom, hip);
      m(limb(f ? 0.088 : 0.084, f ? 0.058 : 0.064, 0.44), bottom, hip);
      const knee = g(hip, 0, -0.44, 0);
      m(ball(0.06), f ? bottom : skin, knee);
      // Pria: celana pendek → betis kulit. Wanita: legging sampai mata kaki.
      m(limb(f ? 0.058 : 0.062, 0.04, 0.42), f ? bottom : skin, knee);
      const ankle = g(knee, 0, -0.42, 0);
      const toe = m(track(new THREE.CapsuleGeometry(0.048, 0.13, 6, 12)), shoe, ankle, 0, -0.012, 0.05);
      toe.rotation.x = Math.PI / 2;
      m(track(new THREE.BoxGeometry(0.1, 0.026, 0.25)), sole, ankle, 0, -0.05, 0.05);
      return { hip, knee, ankle };
    };
    this.legL = makeLeg(1);
    this.legR = makeLeg(-1);

    // ---------- Torso ----------
    this.torso = g(this.hips, 0, 0, 0);
    const lathe = track(new THREE.LatheGeometry(TORSO[kind].map(([r, y]) => new THREE.Vector2(r, y)), 28));
    lathe.scale(1, 1, 0.62);
    m(lathe, top, this.torso);
    // Pinggang celana supaya baju & celana menyambung rapi.
    m(track(new THREE.CylinderGeometry(f ? 0.162 : 0.152, f ? 0.17 : 0.158, 0.09, 24)), bottom, this.torso, 0, 0.0, 0).scale.z = 0.66;

    const shoulderX = f ? 0.158 : 0.195;
    const shoulderY = f ? 0.44 : 0.46;
    const makeArm = (side: 1 | -1): Arm => {
      const shoulder = g(this.torso, side * shoulderX, shoulderY, 0);
      if (f) {
        m(ball(0.048), skin, shoulder); // atasan tanpa lengan
      } else {
        m(ball(0.062), top, shoulder);
        m(limb(0.062, 0.056, 0.13), top, shoulder); // lengan kaos
      }
      m(limb(f ? 0.043 : 0.05, 0.038, 0.28), skin, shoulder);
      const elbow = g(shoulder, 0, -0.28, 0);
      m(ball(0.038), skin, elbow);
      m(limb(0.038, 0.03, 0.25), skin, elbow);
      const hand = m(ball(0.045), skin, elbow, 0, -0.27, 0.005);
      hand.scale.set(0.75, 1.15, 0.6);
      return { shoulder, elbow };
    };
    this.armL = makeArm(1);
    this.armR = makeArm(-1);

    // ---------- Leher & kepala ----------
    m(limb(0.046, 0.05, 0.13), skin, this.torso, 0, 0.64, 0);
    this.head = g(this.torso, 0, 0.64, 0);
    this.headAnchor = g(this.head, 0, 0.145, 0);

    // Kepala sementara (tanpa foto): kepala polos + rambut.
    this.fallback = g(this.head, 0, 0, 0);
    const skull = m(ball(0.115), skin, this.fallback, 0, 0.13, 0);
    skull.scale.set(0.9, 1.08, 0.98);
    const capGeo = track(new THREE.SphereGeometry(0.122, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.52));
    const cap = m(capGeo, hair, this.fallback, 0, 0.145, -0.006);
    cap.rotation.x = -0.25;
    cap.scale.set(0.92, 1.05, 1);
    if (f) {
      // Kuncir kuda.
      const tail = m(track(new THREE.CapsuleGeometry(0.04, 0.17, 6, 12)), hair, this.fallback, 0, 0.12, -0.14);
      tail.rotation.x = 0.35;
      m(ball(0.05), hair, this.fallback, 0, 0.2, -0.11);
    }
  }

  /** Ganti kepala sementara dengan foto wajah. */
  async setFace(url: string) {
    const imgs = await loadFace(url);
    this.face = new FaceRig(imgs, FACE_SIZE);
    this.headAnchor.add(this.face.group);
    this.fallback.visible = false;
  }

  /** Melambai (tangan kanan) — dipakai saat tombolnya di-hover. */
  setWave(on: boolean) {
    this.waveTarget = on ? 1 : 0;
  }

  /**
   * Pose berjalan/berlari.
   * @param p   fase langkah (radian)
   * @param gait 0 = jalan santai … 1 = lari
   */
  pose(p: number, gait: number, dt: number) {
    this.t += dt;
    this.wave += (this.waveTarget - this.wave) * Math.min(1, dt * 6);
    const w = this.wave;
    const f = this.kind === "wanita";
    const s = Math.sin(p);
    const c = Math.cos(p);

    const hip = mix(0.38, 0.8, gait);
    this.legL.hip.rotation.x = -s * hip;
    this.legR.hip.rotation.x = s * hip;
    const kb = mix(0.05, 0.22, gait);
    const ka = mix(0.62, 1.45, gait);
    this.legL.knee.rotation.x = kb + ka * Math.pow(Math.max(0, c), 1.4);
    this.legR.knee.rotation.x = kb + ka * Math.pow(Math.max(0, -c), 1.4);
    this.legL.ankle.rotation.x = 0.08 - this.legL.knee.rotation.x * 0.3 + Math.max(0, s) * 0.2;
    this.legR.ankle.rotation.x = 0.08 - this.legR.knee.rotation.x * 0.3 + Math.max(0, -s) * 0.2;

    const arm = mix(0.3, 0.72, gait);
    const elbow = mix(-0.28, -1.3, gait);
    const out = f ? 0.07 : 0.11;
    this.armL.shoulder.rotation.set(s * arm, 0, out);
    this.armL.elbow.rotation.set(elbow - 0.2 * s * gait, 0, 0);

    // Tangan kanan: ayunan jalan, atau melambai.
    const t = this.t;
    this.armR.shoulder.rotation.set(mix(-s * arm, -0.25, w), 0, mix(-out, -2.55, w));
    this.armR.elbow.rotation.set(mix(elbow + 0.2 * s * gait, -0.35, w), 0, Math.sin(t * 9) * 0.55 * w);

    this.root.position.y = mix(0.022, 0.08, gait) * (1 - Math.abs(s));
    this.torso.rotation.set(mix(0.02, 0.14, gait), s * mix(0.1, 0.16, gait), 0);
    this.hips.rotation.set(0, -s * 0.1, f ? s * 0.05 * (1 - gait) : 0);
    this.head.rotation.set(-this.torso.rotation.x * 0.6, -s * 0.08, 0);
  }

  dispose() {
    this.face?.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
}
