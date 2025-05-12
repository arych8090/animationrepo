import { useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function App() {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.set(0, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('three-container')?.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(2, 2, 2),
      new THREE.Vector3(-2, 4, 0),
      new THREE.Vector3(0, 6, -3),
      new THREE.Vector3(3, 8, -5),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    curve.curveType = 'catmullrom';
    curve.closed = false;

    const curveGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(100));
    const curveMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const curveLine = new THREE.Line(curveGeometry, curveMaterial);
    scene.add(curveLine);

    const rocketGeometry = new THREE.ConeGeometry(0.2, 1, 32);
    const rocketMaterial = new THREE.MeshNormalMaterial();
    const rocket = new THREE.Mesh(rocketGeometry, rocketMaterial);
    scene.add(rocket);

    const clock = new THREE.Clock();
    const duration = 6;
    let endReached = false;

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const t = Math.min(elapsed / duration, 1);

      if (t < 1) {
        const position = curve.getPointAt(t);
        rocket.position.copy(position);

        const tangent = curve.getTangentAt(t).normalize();
        const defaultForward = new THREE.Vector3(0, 0 , 1);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultForward, tangent);
        rocket.quaternion.copy(quaternion);
      } else {
        if (!endReached) {
          endReached = true;
          rocket.lookAt(rocket.position.clone().add(new THREE.Vector3(0, 0, 1)));
        }
        const targetQuat = new THREE.Quaternion();
        rocket.quaternion.slerp(targetQuat, 0.02);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Optional: clean up when component unmounts
    return () => {
      renderer.dispose();
      document.getElementById('three-container')?.removeChild(renderer.domElement);
    };
  }, []);

  return <div id="three-container" className="w-full h-screen" />;
}
