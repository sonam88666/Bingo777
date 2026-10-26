import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type AviatorCameraMode = 'side' | 'chase' | 'drone';

interface Aviator3DSceneProps {
  gameState: 'waiting' | 'flying' | 'crashed';
  multiplier: number;
  cameraMode: AviatorCameraMode;
}

export const Aviator3DScene: React.FC<Aviator3DSceneProps> = ({
  gameState,
  multiplier,
  cameraMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ gameState, multiplier, cameraMode });

  useEffect(() => {
    stateRef.current = { gameState, multiplier, cameraMode };
  }, [gameState, multiplier, cameraMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 360;

    // 1. Scene, Fog & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.018);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 300);
    camera.position.set(0, 2.2, 13.5);

    // 2. Renderer with ACESFilmicToneMapping & RoomEnvironment
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    let isContextLost = false;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
    };
    const handleContextRestored = () => {
      isContextLost = false;
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

    let envTarget: THREE.WebGLRenderTarget | null = null;
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envTarget.texture;
      roomEnv.dispose();
      pmremGenerator.dispose();
    } catch {
      // Fallback to direct studio lights if PMREM fails on software WebGL
    }

    // 3. Studio & Atmospheric Lighting
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.6);
    keyLight.position.set(12, 18, 14);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf43f5e, 2.2);
    rimLight.position.set(-14, 6, -10);
    scene.add(rimLight);

    const underGlowLight = new THREE.PointLight(0xf59e0b, 3.0, 18);
    underGlowLight.position.set(0, -1.5, 2);
    scene.add(underGlowLight);

    // 4. Illuminated 3D Runway Grid & Starfield
    const runwayGroup = new THREE.Group();
    scene.add(runwayGroup);

    const gridHelper = new THREE.GridHelper(160, 64, 0xf43f5e, 0x1e293b);
    gridHelper.position.y = -2.2;
    if (Array.isArray(gridHelper.material)) {
      gridHelper.material.forEach((m) => {
        m.transparent = true;
        m.opacity = 0.32;
      });
    } else {
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.32;
    }
    runwayGroup.add(gridHelper);

    // Runway centerline beacon strips
    const stripGeo = new THREE.BoxGeometry(0.9, 0.04, 0.16);
    const stripMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const runwayStrips: THREE.Mesh[] = [];
    for (let i = -24; i <= 24; i += 3) {
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(i, -2.18, 0);
      runwayGroup.add(strip);
      runwayStrips.push(strip);
    }

    // 3D Starfield / Atmospheric Speed Particles
    const starCount = 260;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 90;
      starPositions[i * 3 + 1] = -1 + Math.random() * 34;
      starPositions[i * 3 + 2] = -35 + Math.random() * 45;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.18,
      transparent: true,
      opacity: 0.7
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 5. Build Multi-Part 3D Aviator Aeroplane Group
    const planeGroup = new THREE.Group();
    scene.add(planeGroup);

    // Materials
    const crimsonMetalMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      metalness: 0.68,
      roughness: 0.24
    });
    const darkCrimsonMat = new THREE.MeshStandardMaterial({
      color: 0x9f1239,
      metalness: 0.6,
      roughness: 0.32
    });
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.85,
      roughness: 0.18
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.92,
      roughness: 0.12
    });
    const canopyGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.1,
      roughness: 0.08,
      transmission: 0.72,
      transparent: true,
      opacity: 0.88,
      ior: 1.48
    });
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.1
    });

    // 5a. Main Aerodynamic Fuselage (aligned along +X forward axis)
    const fuselageGeo = new THREE.CylinderGeometry(0.28, 0.44, 2.6, 24);
    fuselageGeo.rotateZ(-Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, crimsonMetalMat);
    planeGroup.add(fuselage);

    // Rear tapered tail cone
    const tailConeGeo = new THREE.CylinderGeometry(0.44, 0.13, 1.45, 24);
    tailConeGeo.rotateZ(-Math.PI / 2);
    const tailCone = new THREE.Mesh(tailConeGeo, crimsonMetalMat);
    tailCone.position.set(-2.0, 0.03, 0);
    planeGroup.add(tailCone);

    // Forward engine cowling & gold trim ring
    const noseCowlingGeo = new THREE.CylinderGeometry(0.18, 0.28, 0.55, 24);
    noseCowlingGeo.rotateZ(-Math.PI / 2);
    const noseCowling = new THREE.Mesh(noseCowlingGeo, goldTrimMat);
    noseCowling.position.set(1.55, 0, 0);
    planeGroup.add(noseCowling);

    // Gold aerodynamic fuselage side stripe
    const stripeGeo = new THREE.BoxGeometry(3.2, 0.07, 0.89);
    const stripe = new THREE.Mesh(stripeGeo, goldTrimMat);
    stripe.position.set(-0.2, 0.02, 0);
    planeGroup.add(stripe);

    // 5b. Tinted Glass Cockpit Canopy & Pilot Helmet
    const canopyGeo = new THREE.SphereGeometry(0.36, 24, 16);
    canopyGeo.scale(2.35, 0.88, 0.92);
    const canopy = new THREE.Mesh(canopyGeo, canopyGlassMat);
    canopy.position.set(0.15, 0.34, 0);
    planeGroup.add(canopy);

    const pilotHelmetGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const pilotHelmet = new THREE.Mesh(pilotHelmetGeo, goldTrimMat);
    pilotHelmet.position.set(0.1, 0.36, 0);
    planeGroup.add(pilotHelmet);

    // 5c. Swept Main Wings + Wingtip Winglets + Navigation Strobes
    const mainWingGeo = new THREE.BoxGeometry(1.05, 0.07, 4.7);
    const mainWing = new THREE.Mesh(mainWingGeo, crimsonMetalMat);
    mainWing.position.set(0.18, -0.04, 0);
    planeGroup.add(mainWing);

    const wingAccentGeo = new THREE.BoxGeometry(0.28, 0.076, 4.55);
    const wingAccent = new THREE.Mesh(wingAccentGeo, chromeMat);
    wingAccent.position.set(0.38, -0.04, 0);
    planeGroup.add(wingAccent);

    // Left & Right Winglets
    const wingletGeo = new THREE.BoxGeometry(0.65, 0.42, 0.06);
    const leftWinglet = new THREE.Mesh(wingletGeo, goldTrimMat);
    leftWinglet.position.set(0.05, 0.15, -2.35);
    leftWinglet.rotation.x = 0.22;
    planeGroup.add(leftWinglet);

    const rightWinglet = new THREE.Mesh(wingletGeo, goldTrimMat);
    rightWinglet.position.set(0.05, 0.15, 2.35);
    rightWinglet.rotation.x = -0.22;
    planeGroup.add(rightWinglet);

    // Wingtip Navigation Strobe Lights
    const strobeGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const portStrobeMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const starboardStrobeMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const portStrobe = new THREE.Mesh(strobeGeo, portStrobeMat);
    portStrobe.position.set(0.15, 0.35, -2.4);
    planeGroup.add(portStrobe);

    const starboardStrobe = new THREE.Mesh(strobeGeo, starboardStrobeMat);
    starboardStrobe.position.set(0.15, 0.35, 2.4);
    planeGroup.add(starboardStrobe);

    // 5d. Vertical Tail Fin & Horizontal Stabilizers
    const vTailGeo = new THREE.BoxGeometry(0.85, 0.95, 0.07);
    const vTail = new THREE.Mesh(vTailGeo, darkCrimsonMat);
    vTail.position.set(-2.35, 0.48, 0);
    vTail.rotation.z = 0.35;
    planeGroup.add(vTail);

    const hTailGeo = new THREE.BoxGeometry(0.58, 0.05, 1.65);
    const hTail = new THREE.Mesh(hTailGeo, darkCrimsonMat);
    hTail.position.set(-2.35, 0.08, 0);
    planeGroup.add(hTail);

    // 5e. Spinning 3-Blade Propeller Assembly
    const propellerGroup = new THREE.Group();
    propellerGroup.position.set(1.88, 0, 0);
    planeGroup.add(propellerGroup);

    const spinnerConeGeo = new THREE.ConeGeometry(0.19, 0.42, 20);
    spinnerConeGeo.rotateZ(-Math.PI / 2);
    const spinnerCone = new THREE.Mesh(spinnerConeGeo, chromeMat);
    spinnerCone.position.set(0.12, 0, 0);
    propellerGroup.add(spinnerCone);

    const bladeGeo = new THREE.BoxGeometry(0.03, 0.92, 0.11);
    for (let b = 0; b < 3; b++) {
      const bladePivot = new THREE.Group();
      bladePivot.rotation.x = (b * Math.PI * 2) / 3;
      const blade = new THREE.Mesh(bladeGeo, chromeMat);
      blade.position.set(0, 0.46, 0);
      bladePivot.add(blade);
      propellerGroup.add(bladePivot);
    }

    // Translucent motion-blur propeller disc visible at high RPM
    const propBlurGeo = new THREE.RingGeometry(0.15, 0.92, 32);
    propBlurGeo.rotateY(Math.PI / 2);
    const propBlurMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    const propBlurDisc = new THREE.Mesh(propBlurGeo, propBlurMat);
    propellerGroup.add(propBlurDisc);

    // 5f. Retractable Landing Gear Group
    const landingGearGroup = new THREE.Group();
    planeGroup.add(landingGearGroup);

    const strutGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.48, 10);
    const wheelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    wheelGeo.rotateX(Math.PI / 2);

    const createGearLeg = (x: number, z: number) => {
      const leg = new THREE.Group();
      leg.position.set(x, -0.25, z);
      const strut = new THREE.Mesh(strutGeo, chromeMat);
      strut.position.y = -0.2;
      const wheel = new THREE.Mesh(wheelGeo, tireMat);
      wheel.position.y = -0.44;
      leg.add(strut);
      leg.add(wheel);
      return leg;
    };

    landingGearGroup.add(createGearLeg(1.05, 0));
    landingGearGroup.add(createGearLeg(-0.15, -0.68));
    landingGearGroup.add(createGearLeg(-0.15, 0.68));

    // 5g. Glowing Afterburner Jet Plume Cone at Rear Tail
    const plumeGeo = new THREE.ConeGeometry(0.22, 1.35, 16);
    plumeGeo.rotateZ(Math.PI / 2);
    const plumeMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.85
    });
    const afterburnerPlume = new THREE.Mesh(plumeGeo, plumeMat);
    afterburnerPlume.position.set(-3.25, 0.03, 0);
    planeGroup.add(afterburnerPlume);

    // 5h. 3D Glowing Trajectory Contrail Ribbon
    const maxTrailPoints = 90;
    const trailPositions = new Float32Array(maxTrailPoints * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.9
    });
    const contrailLine = new THREE.Line(trailGeo, trailMat);
    scene.add(contrailLine);

    const trailHistory: THREE.Vector3[] = [];

    // 6. Responsive ResizeObserver
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 7. Smooth 60fps Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();
    let flyAwayOffset = 0;
    let flightElapsed = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const { gameState: st, multiplier: mult, cameraMode: camMode } = stateRef.current;

      const safeMult = Number.isFinite(mult) && mult >= 1.0 ? mult : 1.0;

      if (st === 'waiting') {
        flyAwayOffset = 0;
        flightElapsed = 0;
        // Plane idling on the runway ready for takeoff
        planeGroup.position.lerp(new THREE.Vector3(-4.2, -1.45, 0), 0.14);
        planeGroup.rotation.z = THREE.MathUtils.lerp(planeGroup.rotation.z, 0.0, 0.14);
        planeGroup.rotation.x = THREE.MathUtils.lerp(
          planeGroup.rotation.x,
          Math.sin(elapsed * 2.5) * 0.02,
          0.1
        );
        planeGroup.rotation.y = THREE.MathUtils.lerp(planeGroup.rotation.y, 0, 0.1);

        // Propeller warm-up spin
        propellerGroup.rotation.x += dt * 16;
        propBlurMat.opacity = 0.08;

        // Landing gear deployed on runway
        landingGearGroup.scale.y = THREE.MathUtils.lerp(landingGearGroup.scale.y, 1, 0.15);
        afterburnerPlume.scale.set(0.35, 0.35, 0.35);
        plumeMat.opacity = 0.25;

        // Clear trail in waiting state
        trailHistory.length = 0;
        for (let i = 0; i < maxTrailPoints; i++) {
          trailPositions[i * 3] = planeGroup.position.x - 2.6;
          trailPositions[i * 3 + 1] = planeGroup.position.y;
          trailPositions[i * 3 + 2] = planeGroup.position.z;
        }
        trailGeo.attributes.position.needsUpdate = true;
      } else if (st === 'flying') {
        flyAwayOffset = 0;
        flightElapsed += dt;

        // Combine multiplier progression with real flight time so takeoff is immediate and responsive
        const effectiveMult = Math.max(safeMult, 1.0 + flightElapsed * 0.14);
        const climbRatio = Math.min(1, Math.log10(Math.max(1, effectiveMult)) / Math.log10(12));
        const takeoffEase = Math.min(1, Math.max((effectiveMult - 1.0) / 0.14, flightElapsed / 0.9));

        // Smooth runway acceleration into steepening climb trajectory
        const targetX = -4.2 + takeoffEase * 2.4 + climbRatio * 4.8;
        const hoverBob = Math.sin(elapsed * 3.2) * 0.16;
        const targetY = -1.45 + takeoffEase * 0.85 + Math.pow(climbRatio, 1.05) * 3.6 + hoverBob;
        const bankRoll = Math.sin(elapsed * 1.9) * 0.11;
        const pitchUp = Math.min(0.46, 0.16 * takeoffEase + climbRatio * 0.32);

        planeGroup.position.lerp(new THREE.Vector3(targetX, targetY, 0), 0.14);
        planeGroup.rotation.z = THREE.MathUtils.lerp(planeGroup.rotation.z, pitchUp, 0.14);
        planeGroup.rotation.x = THREE.MathUtils.lerp(planeGroup.rotation.x, bankRoll, 0.12);

        // High-speed propeller & glowing afterburner
        propellerGroup.rotation.x += dt * 56;
        propBlurMat.opacity = 0.34;

        // Retract landing gear smoothly after liftoff
        const gearTarget = effectiveMult > 1.06 || flightElapsed > 0.45 ? 0.01 : 1.0;
        landingGearGroup.scale.y = THREE.MathUtils.lerp(landingGearGroup.scale.y, gearTarget, 0.1);

        const plumePulse = 0.95 + Math.sin(elapsed * 28) * 0.22 + climbRatio * 0.45;
        afterburnerPlume.scale.set(plumePulse, 1, 1);
        plumeMat.color.setHex(effectiveMult >= 10 ? 0xe879f9 : effectiveMult >= 2 ? 0xfbbf24 : 0xf43f5e);
        plumeMat.opacity = 0.92;

        // Scroll runway & stars backward to convey forward airspeed
        const scrollSpeed = (6 + climbRatio * 18) * dt;
        gridHelper.position.x = ((gridHelper.position.x - scrollSpeed) % 2.5);
        runwayStrips.forEach((s) => {
          s.position.x -= scrollSpeed;
          if (s.position.x < -24) s.position.x += 48;
        });

        const starPosAttr = starGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < starCount; i++) {
          let sx = starPosAttr.getX(i) - scrollSpeed * 0.85;
          let sy = starPosAttr.getY(i) - scrollSpeed * 0.18 * climbRatio;
          if (sx < -45) sx += 90;
          if (sy < -2) sy += 34;
          starPosAttr.setXY(i, sx, sy);
        }
        starPosAttr.needsUpdate = true;

        // Update 3D contrail ribbon behind tail
        const tailWorldPos = new THREE.Vector3(
          planeGroup.position.x - 2.65,
          planeGroup.position.y - 0.05,
          planeGroup.position.z
        );
        trailHistory.unshift(tailWorldPos);
        if (trailHistory.length > maxTrailPoints) {
          trailHistory.pop();
        }
        for (let i = 0; i < maxTrailPoints; i++) {
          const pt = trailHistory[Math.min(i, trailHistory.length - 1)] || tailWorldPos;
          // Drift older trail points backward with the air stream
          if (i > 0 && trailHistory[i]) {
            trailHistory[i].x -= scrollSpeed * 0.42;
          }
          trailPositions[i * 3] = pt.x;
          trailPositions[i * 3 + 1] = pt.y;
          trailPositions[i * 3 + 2] = pt.z;
        }
        trailMat.color.setHex(safeMult >= 10 ? 0xe879f9 : safeMult >= 2 ? 0xfbbf24 : 0xf43f5e);
        trailGeo.attributes.position.needsUpdate = true;
      } else if (st === 'crashed') {
        // Dramatic supersonic fly-away when round crashes
        flyAwayOffset += dt * 26;
        planeGroup.position.x += dt * 22;
        planeGroup.position.y += dt * 14;
        planeGroup.rotation.z = THREE.MathUtils.lerp(planeGroup.rotation.z, 0.65, 0.15);
        planeGroup.rotation.x += dt * 4.5;
        propellerGroup.rotation.x += dt * 65;
        plumeMat.opacity = Math.max(0, 0.9 - flyAwayOffset * 0.08);
      }

      // Camera view positioning based on selected cameraMode
      if (camMode === 'chase') {
        const desiredCam = new THREE.Vector3(
          Math.min(planeGroup.position.x - 6.2, 2.5),
          Math.max(0.2, planeGroup.position.y + 1.4),
          4.2
        );
        camera.position.lerp(desiredCam, 0.08);
        camera.lookAt(
          Math.min(planeGroup.position.x + 2.5, 6),
          Math.min(planeGroup.position.y + 0.4, 5),
          0
        );
      } else if (camMode === 'drone') {
        const desiredCam = new THREE.Vector3(
          Math.sin(elapsed * 0.4) * 3.5,
          3.8,
          10.5
        );
        camera.position.lerp(desiredCam, 0.06);
        camera.lookAt(0, Math.max(-0.5, Math.min(2.5, planeGroup.position.y * 0.6)), 0);
      } else {
        // Default Side Broadcast View
        camera.position.lerp(new THREE.Vector3(0, 0.85, 11.2), 0.08);
        camera.lookAt(0, 0.35, 0);
      }

      underGlowLight.position.set(planeGroup.position.x, planeGroup.position.y - 1.2, 1.5);
      if (!isContextLost && document.visibilityState !== 'hidden') {
        try {
          renderer.render(scene, camera);
        } catch {
          // Ignore transient WebGL frame errors
        }
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      envTarget?.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      aria-label="3D Aviator Flight Stage"
    />
  );
};
