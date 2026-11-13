// الوحش 3D — a real skinned model (built in Blender) drawn live inside the 2D fight.
// The game's own 2D pose (hip/lean/arm/leg angles, already eased between keyframes) drives the 3D skeleton every frame,
// so every move, skill and finisher the 2D fighter has plays on the 3D body — then a little smoothing makes it flow.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const SIZE = 640, SPAN = 3.6;           // render square (px) and the metres it covers, centred on the hip
const D2R = Math.PI / 180;
const CAM_YAW = 24 * D2R;               // camera a little round to his front (Tekken-like 3/4 side view)
const STANCE = -22 * D2R;               // body bladed: lead (left) shoulder towards the opponent
let R = null, scene, cam, root, B = {}, REST = {}, ORDER = [], mats = [], ready = false, failed = false, legLen = 1, hip0 = new THREE.Vector3();
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0);

function init(b64, done) {
  try {
    const cv = document.createElement('canvas'); cv.width = cv.height = SIZE;
    R = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    R.setPixelRatio(1); R.setSize(SIZE, SIZE, false); R.setClearColor(0x000000, 0);
    R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.15;
  } catch (e) { failed = true; return; }
  scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xe6ecff, 0x3a2a20, 1.35));
  const key = new THREE.DirectionalLight(0xfff1e0, 2.6); key.position.set(-3, 4, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff6a50, 1.6); rim.position.set(3, 3, -4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0x9fb8ff, 0.7); fill.position.set(-4, 1, -2); scene.add(fill);
  cam = new THREE.OrthographicCamera(-SPAN / 2, SPAN / 2, SPAN / 2, -SPAN / 2, 0.1, 40);
  const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  new GLTFLoader().parse(bin.buffer, '', g => {
    root = g.scene; scene.add(root);
    root.traverse(o => {
      if (o.isBone) { B[o.name] = o; REST[o.name] = o.quaternion.clone(); ORDER.push(o); }
      if (o.isMesh) { o.frustumCulled = false; const m = o.material; m.envMapIntensity = 0; mats.push(m); }
    });
    root.updateMatrixWorld(true);
    B.pelvis.getWorldPosition(hip0);
    const a = wp('thigh.R'), b = wp('foot.R'); legLen = a.distanceTo(b);
    // camera: on his right side, swung a little to his front; looks at the hip
    cam.position.set(hip0.x - Math.cos(CAM_YAW) * 10, hip0.y, hip0.z + Math.sin(CAM_YAW) * 10); cam.lookAt(hip0); cam.updateMatrixWorld();
    ready = true; done && done();
  }, e => { failed = true; console.warn('3D model', e); });
}
const bn = n => B[n.replace(/[.\s]/g, '')];
const wp = n => bn(n).getWorldPosition(new THREE.Vector3());
function rotWorld(bone, qd) {   // rotate a bone by a world-space rotation
  const pw = bone.parent.getWorldQuaternion(_q2), w = bone.getWorldQuaternion(new THREE.Quaternion());
  bone.quaternion.copy(pw.invert().multiply(qd.clone().multiply(w))); bone.updateMatrixWorld(true);
}
function aim(name, childName, dir) {   // point a bone (head → child joint) along a world direction
  const b = bn(name), cb = bn(childName); if (!b || !cb) return;
  const p = b.getWorldPosition(_v), c = cb.getWorldPosition(_v2); const cur = c.sub(p).normalize();
  rotWorld(b, new THREE.Quaternion().setFromUnitVectors(cur, dir.clone().normalize()));
}
// 2D angle (canvas: x forward, y down) → world direction (+Z forward, +Y up), with a sideways part
const dir2 = (a, lat) => new THREE.Vector3(lat, -Math.sin(a), Math.cos(a));
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

function pose(p) {
  for (const o of ORDER) o.quaternion.copy(REST[o.name]);
  root.updateMatrixWorld(true);
  const r = (p.r || 0) * D2R, lean = (p.lean || 0) * D2R, tr = r + lean;
  // arm extension → shoulders turn into the punch
  const ext = (ua, fa) => clamp((ua - 30) / 60, 0, 1) * clamp(1 - fa / 100, 0, 1);
  const twist = STANCE + 30 * D2R * ext(p.ua, p.fa) - 18 * D2R * ext(p.bua, p.bfa);
  rotWorld(B.pelvis, new THREE.Quaternion().setFromAxisAngle(X, r).multiply(new THREE.Quaternion().setFromAxisAngle(Y, STANCE * 0.6)));
  for (const s of ['spine_01', 'spine_02', 'chest']) if (bn(s)) rotWorld(bn(s), new THREE.Quaternion().setFromAxisAngle(X, lean / 3).multiply(new THREE.Quaternion().setFromAxisAngle(Y, (twist - STANCE * 0.6) / 3)));
  // arms: front (near the camera) = right, back = left
  const arm = (sd, ua, fa) => {
    const pu = tr + (90 - ua) * D2R, pf = pu - fa * D2R, side = sd === 'R' ? -1 : 1;
    const su = Math.sin(pu), sf = Math.sin(pf), cf = Math.cos(pf);
    aim('upperarm.' + sd, 'forearm.' + sd, dir2(pu, side * (0.22 + 0.3 * Math.max(0, su))));
    aim('forearm.' + sd, 'hand.' + sd, dir2(pf, side * (0.18 * Math.max(0, sf) - 0.28 * Math.max(0, -sf) - 0.12 * Math.max(0, cf))));
  };
  arm('R', p.ua, p.fa); arm('L', p.bua, p.bfa);
  const leg = (sd, th, sh, ft, fl) => {
    const pt = r + (90 - th) * D2R, ps = pt + sh * D2R, side = sd === 'R' ? -1 : 1;
    aim('thigh.' + sd, 'shin.' + sd, dir2(pt, side * 0.1));
    aim('shin.' + sd, 'foot.' + sd, dir2(ps, side * 0.04));
    const rF = (ps - (Math.PI / 2)) + (ft || 0) * D2R; const fa = rF * (1 - (fl || 0));
    const fb = bn('foot.' + sd), toe = fb && fb.children.find(c => c.isBone);
    if (toe) aim('foot.' + sd, toe.name, dir2(fa + 12 * D2R, side * 0.05));
  };
  leg('R', p.th, p.sh, p.ft, p.ffl); leg('L', p.bth, p.bsh, p.bft, p.bfl);
  // the head keeps looking at the opponent
  if (B.head && Math.abs(tr) < 50 * D2R) { const w = B.head.getWorldQuaternion(new THREE.Quaternion()); const want = new THREE.Quaternion().setFromAxisAngle(Y, STANCE * 0.5).multiply(REST_W.head); rotWorld(B.head, new THREE.Quaternion().slerp(want.multiply(w.invert()), 0.75)); }
}
let REST_W = {};
const LOW = [['foot.L', 0.13], ['foot.R', 0.13], ['toe.L', 0.04], ['toe.R', 0.04], ['shin.L', 0.1], ['shin.R', 0.1], ['hand.L', 0.08], ['hand.R', 0.08], ['head', 0.2], ['chest', 0.17], ['pelvis', 0.17]];
function smooth(f, k) {
  const S = f.__q3 || (f.__q3 = {});
  for (const o of ORDER) { const q = S[o.name]; if (q && k < 1) { q.slerp(o.quaternion, k); o.quaternion.copy(q); } else S[o.name] = o.quaternion.clone(); }
}
function tint(c, col, a) { const x = c.getContext('2d'); x.save(); x.globalCompositeOperation = 'source-atop'; x.globalAlpha = a; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); x.restore(); }

// draw fighter f on the game's ctx. Returns false if the 3D model can't draw (the game then uses its 2D rig).
function draw(ctx, f, opts, fx) {
  if (!ready) return false;
  if (!REST_W.head) { for (const o of ORDER) o.quaternion.copy(REST[o.name]); root.updateMatrixWorld(true); REST_W.head = B.head.getWorldQuaternion(new THREE.Quaternion()); }
  const Rg = f.R, p = f.pose, k = Rg.k;
  let C = f.__c3;
  const main = !opts.ghost && !opts.refl;
  if (main || !C) {
    if (!C) { C = f.__c3 = document.createElement('canvas'); C.width = C.height = SIZE; }
    pose(p); smooth(f, f.__q3 && f.__lastT === fx.frame - 1 ? 0.55 : 1); f.__lastT = fx.frame;
    root.updateMatrixWorld(true);
    let lo = 1e9; for (const [n, d] of LOW) { const b = bn(n); if (b) lo = Math.min(lo, b.getWorldPosition(_v).y - d); }
    f.__low3 = hip0.y - lo;   // metres below the hip (sprite y grows downwards)
    R.render(scene, cam);
    const x = C.getContext('2d'); x.clearRect(0, 0, SIZE, SIZE); x.drawImage(R.domElement, 0, 0);
    if (fx.flash) tint(C, '#ffffff', 0.85); else if (fx.rage) tint(C, '#ff2030', 0.35); else if (fx.shadow) tint(C, '#6a1ab0', 0.45); else if (fx.dark) tint(C, '#000000', 0.55);
  }
  // sprite units per metre: his 3D leg matches the 2D rig's leg
  const S = (Rg.L.th + Rg.L.sh) / legLen, w = SPAN * S;
  ctx.save();
  ctx.translate(f.x + (fx.jx || 0), f.hipY); ctx.scale(f.facing * k, k); ctx.translate(p.dx || 0, p.dy || 0);
  // stand on the floor exactly where the 2D body would: his lowest point meets the rig's lowest point
  if (f.J && isFinite(f.J.maxY) && f.__low3 !== undefined) ctx.translate(0, f.J.maxY - f.__low3 * S);
  ctx.drawImage(C, -w / 2, -w / 2, w, w);
  ctx.restore();
  return true;
}
window.W3D = { init, draw, get ready() { return ready; }, get failed() { return failed; } };
