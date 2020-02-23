import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let width = window.innerWidth;
let height = window.innerHeight;
let [alpha, beta, gamma] = [0, 0, 0];

const description = document.querySelector("#description")!;
const startButton = document.querySelector("#start") as HTMLButtonElement;
startButton.addEventListener("click", event => {
  (async () => {
    if (!window.DeviceOrientationEvent)
      throw Error("DeviceOrientationEvent に対応していません");

    if ((window.DeviceOrientationEvent as any).requestPermission) {
      const perm = await (window.DeviceOrientationEvent as any).requestPermission();
      if (perm !== "granted")
        throw new Error("DeviceOrientationEvent の取得が拒否されました");
    }

    window.addEventListener(
      "deviceorientation",
      event => {
        if (typeof event.alpha === "number") alpha = event.alpha;
        if (typeof event.beta === "number") beta = event.beta;
        if (typeof event.gamma === "number") gamma = event.gamma;
      },
      false
    );

    if (document.fullscreenEnabled && !document.fullscreenElement)
      document.documentElement.requestFullscreen();

    description.parentNode?.removeChild(description);
    startButton.parentNode?.removeChild(startButton);

    setUpThreeJS();
  })().catch(e => {
    console.error(e);
    alert(e);
  });
});

function setUpThreeJS() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(light);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  scene.add(directionalLight);

  let prevTime = Date.now();
  const animate = () => {
    const t = Date.now();
    if (mixer) mixer.update((t - prevTime) / 1000);
    prevTime = t;

    const qRotation = new THREE.Quaternion();

    const qBase = new THREE.Quaternion();
    qBase.setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      THREE.MathUtils.degToRad(-90)
    );
    qRotation.multiply(qBase);

    const qAlpha = new THREE.Quaternion();
    qAlpha.setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      THREE.MathUtils.degToRad(alpha)
    );
    qRotation.multiply(qAlpha);

    const qBeta = new THREE.Quaternion();
    qBeta.setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      THREE.MathUtils.degToRad(beta)
    );
    qRotation.multiply(qBeta);

    const qGamma = new THREE.Quaternion();
    qGamma.setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      THREE.MathUtils.degToRad(gamma)
    );
    qRotation.multiply(qGamma);

    const cameraPos = new THREE.Vector3(0, 0, 3);
    cameraPos.applyQuaternion(qRotation);

    camera.rotation.setFromQuaternion(qRotation);
    camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();

  let mixer: THREE.AnimationMixer | null = null;
  const loader = new GLTFLoader();
  loader.load(
    "models/fox.glb",
    gltf => {
      gltf.scene.position.y = -0.5;
      gltf.scene.scale.setScalar(0.01);
      gltf.scene.rotateY(Math.PI / 2);

      mixer = new THREE.AnimationMixer(gltf.scene);
      const anime = mixer.clipAction(gltf.animations[2]);
      anime.play();

      scene.add(gltf.scene);
    },
    () => {},
    e => {
      console.error(e);
      alert("failed to load model");
    }
  );

  window.addEventListener("resize", event => {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}
