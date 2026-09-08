/**
 * CosmosIntro.tsx
 * 3D Cosmos Constellation Introduction for The Artisan''s Quill.
 * Exact 1-to-1 fidelity with the provided Cosmos Intro HTML demo:
 * - Precise typography: Fraunces, Literata, IBM Plex Mono
 * - Void/deep/gold/nebula theme with radial atmosphere gradients
 * - Three.js camera dolly (z=22 -> 4) with soft circular canvas particle starfields
 * - Sequential golden sprite nodes & dynamic line interpolation
 * - Screen-projected node pills with golden glowing dots and fade-edges
 * - Bottom action row with "Enter the Atelier" button and "WATCH THE 20-SECOND TOUR"
 * - 20-second walkthrough video preview modal with close & backdrop click
 * - Smooth 0.9s ease dismiss transition on Enter / Skip / Escape / Node click
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

interface CosmosIntroProps {
  onEnter: () => void;
  onAction?: (action: "__bard__" | "__ink__") => void;
}

interface ConstellationNode {
  id: string;
  label: string;
  pos: [number, number, number];
  hash: string;
}

const NODES: ConstellationNode[] = [
  { id: "paintings",   label: "Paintings & Drawings",         pos: [-9,  2,  -8], hash: "#feed" },
  { id: "digital",     label: "Digital Media & Motion Loops", pos: [-6, -6, -13], hash: "#feed" },
  { id: "poetry",      label: "Poetry Cards",                 pos: [ 9,  4, -10], hash: "#feed" },
  { id: "cosmos",      label: "3D Cosmos — Starmap",          pos: [ 6, -5, -17], hash: "#cosmos" },
  { id: "exhibitions", label: "Curated Exhibitions",          pos: [-3, -1,  -6], hash: "#exhibitions" },
  { id: "bard",        label: "Bard Symphony",                pos: [ 3,  6, -15], hash: "__bard__" },
  { id: "ink",         label: "Ink Studio & Upload",          pos: [-8, -4, -19], hash: "__ink__" },
  { id: "saved",       label: "Saved Vault",                  pos: [ 8, -1,  -6], hash: "#saved" },
];

export default function CosmosIntro({ onEnter, onAction }: CosmosIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeLayerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [bottomDelaySec, setBottomDelaySec] = useState(5.4);

  const dismiss = useCallback((targetHash?: string) => {
    setIsDismissed(true);
    setTimeout(() => {
      onEnter();
      if (targetHash) {
        if (targetHash === "__bard__") {
          onAction?.("__bard__");
        } else if (targetHash === "__ink__") {
          onAction?.("__ink__");
        } else {
          window.location.hash = targetHash.replace(/^#/, "");
        }
      }
    }, 900);
  }, [onEnter, onAction]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isVideoModalOpen) {
          setIsVideoModalOpen(false);
        } else {
          dismiss();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismiss, isVideoModalOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const nodeLayer = nodeLayerRef.current;
    if (!canvas || !nodeLayer) return;

    let isDisposed = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    const camStartZ = reduced ? 4 : 22;
    const camEndZ = 4;
    camera.position.set(0, 0, camStartZ);
    camera.lookAt(0, 0, -6);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const world = new THREE.Group();
    scene.add(world);

    // Soft circular particle texture
    function makeDot(color: string) {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const ctx = c.getContext("2d");
      if (ctx) {
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, color);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(c);
    }
    const starTex = makeDot("rgba(242,237,224,1)");
    const goldTex = makeDot("rgba(201,162,76,1)");

    function starField(count: number, rMin: number, rMax: number, size: number, opacity: number) {
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = rMin + Math.random() * (rMax - rMin);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = -Math.abs(r * Math.cos(phi)) - 4;
        const tint = Math.random();
        const c = tint > 0.88 ? [0.79, 0.64, 0.30] : [0.95, 0.93, 0.88];
        colors[i * 3] = c[0];
        colors[i * 3 + 1] = c[1];
        colors[i * 3 + 2] = c[2];
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const mat = new THREE.PointsMaterial({
        size,
        map: starTex,
        vertexColors: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      const pts = new THREE.Points(geo, mat);
      pts.userData.targetOpacity = opacity;
      world.add(pts);
      return pts;
    }

    const farStars = starField(2400, 20, 90, 0.55, 0.55);
    const nearDust = starField(500, 6, 30, 1.3, 0.85);

    const nodeMeshes: Array<{ sprite: THREE.Sprite; pos: THREE.Vector3; activeAt: number }> = [];
    const lineMeshes: Array<{ line: THREE.Line; from: THREE.Vector3; to: THREE.Vector3; activeAt: number } | null> = [];
    const labelEls: HTMLDivElement[] = [];

    // Clear any previous child labels
    nodeLayer.innerHTML = "";

    NODES.forEach((n, i) => {
      const mat = new THREE.SpriteMaterial({
        map: goldTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(...n.pos);
      sprite.scale.set(0.001, 0.001, 1);
      world.add(sprite);
      nodeMeshes.push({ sprite, pos: new THREE.Vector3(...n.pos), activeAt: 0 });

      if (i > 0) {
        const prev = NODES[i - 1].pos;
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...prev),
          new THREE.Vector3(...prev),
        ]);
        const lmat = new THREE.LineBasicMaterial({
          color: 0xc9a24c,
          transparent: true,
          opacity: 0,
        });
        const line = new THREE.Line(geo, lmat);
        world.add(line);
        lineMeshes.push({
          line,
          from: new THREE.Vector3(...prev),
          to: new THREE.Vector3(...n.pos),
          activeAt: 0,
        });
      } else {
        lineMeshes.push(null);
      }

      const el = document.createElement("div");
      el.className = "cosmos-node-label";
      el.innerHTML = '<span class="cosmos-dot"></span>' + n.label;
      el.onclick = () => dismiss(n.hash);
      nodeLayer.appendChild(el);
      labelEls.push(el);
    });

    const nodeStagger = reduced ? 40 : 380;
    const nodeStart = reduced ? 200 : 1900;
    NODES.forEach((_, i) => {
      nodeMeshes[i].activeAt = nodeStart + i * nodeStagger;
      const lm = lineMeshes[i];
      if (lm) lm.activeAt = nodeStart + i * nodeStagger;
    });

    const bottomDelay = nodeStart + NODES.length * nodeStagger + (reduced ? 100 : 500);
    setBottomDelaySec(bottomDelay / 1000);

    function ease(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    const start = performance.now();
    const camDuration = reduced ? 1 : 4200;

    function animate() {
      if (isDisposed) return;
      animFrameRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const elapsed = now - start;
      const dt = clock.getDelta();

      // Starfield fade-in
      [farStars, nearDust].forEach((p) => {
        const target = p.userData.targetOpacity;
        p.material.opacity = Math.min(target, p.material.opacity + dt * 0.6);
      });

      // Camera dolly
      const camT = Math.min(1, elapsed / camDuration);
      camera.position.z = camStartZ + (camEndZ - camStartZ) * ease(camT);

      // Gentle mouse parallax + ambient rotation
      if (!reduced) {
        world.rotation.y += dt * 0.02;
        camera.position.x += (mouse.x * 1.1 - camera.position.x) * dt * 1.2;
        camera.position.y += (-mouse.y * 0.7 - camera.position.y) * dt * 1.2;
      }
      camera.lookAt(0, 0, -6);

      // Node + line reveals
      nodeMeshes.forEach((n, i) => {
        if (elapsed >= n.activeAt) {
          const p = Math.min(1, (elapsed - n.activeAt) / 500);
          const e = ease(p);
          n.sprite.material.opacity = e * 0.95;
          const s = 0.35 + e * 0.55;
          n.sprite.scale.set(s, s, 1);

          const lm = lineMeshes[i];
          if (lm) {
            const lp = Math.min(1, (elapsed - lm.activeAt) / 500);
            const le = ease(lp);
            lm.line.material.opacity = le * 0.45;
            const cur = lm.from.clone().lerp(lm.to, le);
            const posAttr = lm.line.geometry.attributes.position;
            posAttr.setXYZ(1, cur.x, cur.y, cur.z);
            posAttr.needsUpdate = true;
          }

          // Project to screen for label
          const wp = n.sprite.getWorldPosition(new THREE.Vector3());
          const v = wp.clone().project(camera);
          const sx = (v.x * 0.5 + 0.5) * window.innerWidth;
          const sy = (-v.y * 0.5 + 0.5) * window.innerHeight;
          const el = labelEls[i];
          if (el) {
            el.style.left = sx + "px";
            el.style.top = sy + "px";

            let labelOpacity = e;
            if (sy < window.innerHeight * 0.26 || sy > window.innerHeight * 0.86) {
              labelOpacity *= 0.12;
            }
            if (v.z > 1 || v.z < -1) labelOpacity = 0;
            el.style.opacity = labelOpacity.toString();
          }
        }
      });

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      scene.clear();
    };
  }, [dismiss]);

  return (
    <>
      <style>{`
        .cosmos-intro-root {
          --void: #05060a;
          --deep: #0b0e1a;
          --star: #f2ede0;
          --gold: #c9a24c;
          --nebula: #5a67b8;
          --slate: #8b8fa3;
          --line: rgba(242,237,224,0.12);
        }

        .cosmos-intro-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background:
            radial-gradient(ellipse 70% 55% at 50% 25%, rgba(90,103,184,0.22), transparent 60%),
            radial-gradient(circle at 82% 82%, rgba(201,162,76,0.10), transparent 55%),
            #05060a;
          transition: opacity 0.9s ease, visibility 0.9s ease;
          font-family: 'Literata', Georgia, serif;
          color: #f2ede0;
          overflow: hidden;
        }

        .cosmos-intro-overlay.dismissed {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .cosmos-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        .cosmos-node-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .cosmos-node-label {
          position: absolute;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.25s linear, border-color 0.2s ease, background 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.02em;
          color: #f2ede0;
          background: rgba(5,6,10,0.55);
          border: 1px solid rgba(242,237,224,0.12);
          padding: 6px 12px 6px 8px;
          border-radius: 3px;
          white-space: nowrap;
          backdrop-filter: blur(2px);
          pointer-events: auto;
          cursor: pointer;
          user-select: none;
        }

        .cosmos-node-label:hover {
          border-color: #c9a24c;
          background: rgba(11,14,26,0.85);
          box-shadow: 0 0 14px rgba(201,162,76,0.35);
        }

        .cosmos-node-label .cosmos-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9a24c;
          box-shadow: 0 0 8px 2px rgba(201,162,76,0.7);
          flex-shrink: 0;
        }

        .cosmos-content-layer {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          text-align: center;
          padding-top: 9vh;
          pointer-events: none;
        }

        .cosmos-content-layer > * {
          pointer-events: auto;
        }

        .cosmos-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          color: #c9a24c;
          opacity: 0;
          animation: cosmos-rise 0.8s ease forwards;
          margin-bottom: 18px;
        }

        .cosmos-intro-title {
          font-family: 'Fraunces', Georgia, serif;
          font-style: italic;
          font-weight: 500;
          font-size: clamp(2rem, 5.4vw, 3.6rem);
          margin: 0 0 16px;
          letter-spacing: 0.005em;
          color: #f2ede0;
          opacity: 0;
          transform: translateY(10px);
          animation: cosmos-rise 0.9s ease forwards;
        }

        .cosmos-tagline {
          color: #8b8fa3;
          max-width: 46ch;
          font-size: 1.02rem;
          line-height: 1.7;
          margin: 0;
          opacity: 0;
          transform: translateY(10px);
          animation: cosmos-rise 0.9s ease forwards;
        }

        @keyframes cosmos-rise {
          to {
            opacity: 1;
            transform: none;
          }
        }

        .cosmos-bottom-row {
          position: absolute;
          bottom: 6vh;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          opacity: 0;
          animation: cosmos-rise 0.8s ease forwards;
        }

        .cosmos-enter-btn {
          font-family: 'Literata', Georgia, serif;
          font-size: 0.95rem;
          color: #1a1408;
          background: #c9a24c;
          border: none;
          padding: 14px 36px;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .cosmos-enter-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(201,162,76,0.28);
        }

        .cosmos-watch-link {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.03em;
          color: #8b8fa3;
          background: none;
          border: none;
          border-bottom: 1px solid rgba(242,237,224,0.12);
          padding-bottom: 2px;
          cursor: pointer;
          transition: color 0.2s ease, border-color 0.2s ease;
        }

        .cosmos-watch-link:hover {
          color: #f2ede0;
          border-color: #c9a24c;
        }

        .cosmos-skip {
          position: absolute;
          top: 26px;
          right: 30px;
          z-index: 5;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.04em;
          color: #8b8fa3;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .cosmos-skip:hover {
          color: #f2ede0;
        }

        /* Video Modal */
        .cosmos-video-modal {
          position: fixed;
          inset: 0;
          background: rgba(3,4,7,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.35s ease, visibility 0.35s ease;
          font-family: 'Literata', Georgia, serif;
        }

        .cosmos-video-modal.open {
          opacity: 1;
          visibility: visible;
        }

        .cosmos-video-box {
          width: min(560px, 86vw);
          background: #0b0e1a;
          border: 1px solid rgba(242,237,224,0.12);
          padding: 4px;
        }

        .cosmos-video-frame {
          aspect-ratio: 16/9;
          background: radial-gradient(circle at 50% 40%, rgba(90,103,184,0.18), #08090f 70%);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #8b8fa3;
          font-size: 0.85rem;
          padding: 20px;
        }

        .cosmos-play-ring {
          width: 56px;
          height: 56px;
          border: 1px solid #c9a24c;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: #c9a24c;
          font-size: 1.2rem;
        }

        .cosmos-video-box .cosmos-caption {
          padding: 14px 16px 4px;
          font-size: 0.8rem;
          color: #8b8fa3;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cosmos-close-video {
          background: none;
          border: none;
          color: #8b8fa3;
          cursor: pointer;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.75rem;
          transition: color 0.2s ease;
        }

        .cosmos-close-video:hover {
          color: #f2ede0;
        }

        @media (max-width: 640px) {
          .cosmos-node-label {
            font-size: 0.62rem;
            padding: 5px 10px 5px 7px;
          }
          .cosmos-content-layer {
            padding-top: 7vh;
          }
        }
      `}</style>

      {/* 3D Cosmos Intro Overlay */}
      <div
        className={`cosmos-intro-root cosmos-intro-overlay ${isDismissed ? "dismissed" : ""}`}
        id="intro"
      >
        <button
          className="cosmos-skip"
          id="skipBtn"
          onClick={() => dismiss()}
          aria-label="Skip Introduction"
        >
          SKIP
        </button>

        <canvas ref={canvasRef} className="cosmos-canvas" id="cosmos-canvas" />
        <div ref={nodeLayerRef} className="cosmos-node-layer" id="nodeLayer" />

        <div className="cosmos-content-layer">
          <div className="cosmos-eyebrow" style={{ animationDelay: "0.5s" }}>
            A LIVING CONSTELLATION
          </div>
          <h1 className="cosmos-intro-title" style={{ animationDelay: "0.75s" }}>
            The Artisan's Quill
          </h1>
          <p className="cosmos-tagline" style={{ animationDelay: "1.05s" }}>
            Every painting, poem, and motion loop lives here as a star.
            Step in, and watch the gallery take shape around you.
          </p>
        </div>

        <div
          className="cosmos-bottom-row"
          id="bottomRow"
          style={{ animationDelay: `${bottomDelaySec}s` }}
        >
          <button
            className="cosmos-enter-btn"
            id="enterBtn"
            onClick={() => dismiss()}
          >
            Enter the Atelier
          </button>
          <button
            className="cosmos-watch-link"
            id="watchLink"
            onClick={() => setIsVideoModalOpen(true)}
          >
            WATCH THE 20-SECOND TOUR
          </button>
        </div>
      </div>

      {/* Video Modal */}
      <div
        className={`cosmos-video-modal ${isVideoModalOpen ? "open" : ""}`}
        id="videoModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsVideoModalOpen(false);
        }}
      >
        <div className="cosmos-video-box">
          <div className="cosmos-video-frame">
            <div>
              <div className="cosmos-play-ring">▶</div>
              Your walkthrough video will play here.
              <br />
              Explore paintings, poetry scrolls, 3D cosmos &amp; music sanctuary.
            </div>
          </div>
          <div className="cosmos-caption">
            <span>ATELIER WALKTHROUGH — 0:20</span>
            <button
              className="cosmos-close-video"
              id="closeVideo"
              onClick={() => setIsVideoModalOpen(false)}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
