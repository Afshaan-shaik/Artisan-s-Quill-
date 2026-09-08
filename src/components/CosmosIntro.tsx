/**
 * CosmosIntro.tsx
 * Full-screen 3D constellation intro for The Artisan's Quill.
 * Uses Three.js to render an animated star-field with 8 feature nodes.
 * Navigation is hash-based (this project's SPA router).
 */

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

/* ─────────────────────────────── Node definitions ─────────────────────────── */

interface Node {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: number;
  position: [number, number, number];
  hash: string;
}

const NODES: Node[] = [
  {
    id: "paintings",
    label: "Paintings & Drawings",
    icon: "🎨",
    description: "Classical fine art — oils, watercolours, and pencil studies",
    color: 0xc9a875,
    position: [-3.5, 2, -1],
    hash: "#feed",
  },
  {
    id: "digital",
    label: "Digital Media & Loops",
    icon: "✦",
    description: "Motion loops, digital illustrations, and GIF animations",
    color: 0x7eb8f7,
    position: [3.5, 2.2, -1.5],
    hash: "#feed",
  },
  {
    id: "poetry",
    label: "Poetry Cards",
    icon: "📜",
    description: "Verses, prose poems, and literary art cards",
    color: 0xd4a8e0,
    position: [-3.8, -1.5, 0.5],
    hash: "#feed",
  },
  {
    id: "cosmos",
    label: "3D Cosmos",
    icon: "🌌",
    description: "Interactive 3-D star map of artworks",
    color: 0x5ddcff,
    position: [0, 3, -2],
    hash: "#cosmos",
  },
  {
    id: "exhibitions",
    label: "Curated Exhibitions",
    icon: "🏛️",
    description: "Themed shows and collaborative galleries",
    color: 0xf7c97e,
    position: [4, -1, -0.5],
    hash: "#exhibitions",
  },
  {
    id: "bard",
    label: "Bard Symphony",
    icon: "🎵",
    description: "AI-voiced readings and poetic audio experiences",
    color: 0x9ef7ae,
    position: [0, -3, -1],
    hash: "__bard__",
  },
  {
    id: "ink-studio",
    label: "Ink Studio & Upload",
    icon: "🖋️",
    description: "Create, write, and publish your own works",
    color: 0xffa07a,
    position: [-2.5, 0, 1.5],
    hash: "__ink__",
  },
  {
    id: "saved",
    label: "Saved Vault",
    icon: "🔒",
    description: "Your private collection of saved artworks",
    color: 0xc0c0e0,
    position: [2.5, -0.5, 2],
    hash: "#saved",
  },
];

/* ─────────────────────────────── Types ─────────────────────────────────────── */

export interface CosmosIntroProps {
  onEnter: () => void;
  onAction?: (action: "__bard__" | "__ink__") => void;
}

/* ═══════════════════════════════ Component ═══════════════════════════════════ */

export default function CosmosIntro({ onEnter, onAction }: CosmosIntroProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<
    Array<{ id: string; x: number; y: number; visible: boolean }>
  >([]);
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [enterVisible, setEnterVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const projectToScreen = useCallback(
    (
      pos3d: THREE.Vector3,
      camera: THREE.PerspectiveCamera,
      width: number,
      height: number
    ) => {
      const v = pos3d.clone().project(camera);
      return {
        x: ((v.x + 1) / 2) * width,
        y: ((-v.y + 1) / 2) * height,
        visible: v.z < 1,
      };
    },
    []
  );

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000510, 0.04);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000510, 1);
    container.appendChild(renderer.domElement);

    const starCount = 2800;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
      const warm = Math.random();
      starColors[i * 3] = 0.7 + warm * 0.3;
      starColors[i * 3 + 1] = 0.6 + warm * 0.2;
      starColors[i * 3 + 2] = 0.9 - warm * 0.4;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(starGeo, starMat);
    scene.add(particles);

    const starMeshes: THREE.Mesh[] = NODES.map((node) => {
      const geo = new THREE.SphereGeometry(0.12, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 1.5,
        roughness: 0.2,
        metalness: 0.8,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.position);
      mesh.userData = { nodeId: node.id };
      scene.add(mesh);

      const glowGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
      });
      mesh.add(new THREE.Mesh(glowGeo, glowMat));
      return mesh;
    });

    const connectionPairs = [
      [0, 3], [1, 3], [2, 5], [3, 4], [3, 6], [4, 7], [5, 6], [6, 7],
    ];
    const connections: THREE.Line[] = connectionPairs.map(([a, b]) => {
      const pts = [
        new THREE.Vector3(...NODES[a].position),
        new THREE.Vector3(...NODES[b].position),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: 0xc9a875,
        transparent: true,
        opacity: 0.18,
      });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      return line;
    });

    scene.add(new THREE.AmbientLight(0x1a1a2e, 2));
    const pLight = new THREE.PointLight(0xc9a875, 2, 20);
    pLight.position.set(0, 2, 4);
    scene.add(pLight);

    const clock = new THREE.Clock();

    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / container.clientWidth - 0.5) * 2;
      mouseY = (e.clientY / container.clientHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      particles.rotation.y = t * 0.01;
      particles.rotation.x = t * 0.004;

      starMeshes.forEach((mesh, i) => {
        const s = 1 + Math.sin(t * 1.5 + i * 0.8) * 0.15;
        mesh.scale.setScalar(s);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          1.2 + Math.sin(t * 2 + i) * 0.5;
      });

      connections.forEach((line, i) => {
        (line.material as THREE.LineBasicMaterial).opacity =
          0.12 + Math.sin(t * 0.8 + i * 0.5) * 0.08;
      });

      renderer.render(scene, camera);

      const w2 = container.clientWidth;
      const h2 = container.clientHeight;
      const positions = NODES.map((node) => ({
        id: node.id,
        ...projectToScreen(new THREE.Vector3(...node.position), camera, w2, h2),
      }));
      setNodePositions(positions);
    };
    animate();

    setTimeout(() => setTitleVisible(true), 400);
    setTimeout(() => setSubtitleVisible(true), 900);
    setTimeout(() => setEnterVisible(true), 1500);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [projectToScreen]);

  const handleEnter = useCallback(() => {
    setIsExiting(true);
    setTimeout(onEnter, 800);
  }, [onEnter]);

  const handleNodeClick = useCallback(
    (node: Node) => {
      if (node.hash === "__bard__" || node.hash === "__ink__") {
        setIsExiting(true);
        setTimeout(() => {
          onEnter();
          onAction?.(node.hash as "__bard__" | "__ink__");
        }, 800);
      } else {
        setIsExiting(true);
        setTimeout(() => {
          onEnter();
          window.location.hash = node.hash.replace(/^#/, "");
        }, 800);
      }
    },
    [onEnter, onAction]
  );

  const hexColor = (c: number) => `#${c.toString(16).padStart(6, "0")}`;

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-700 ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background:
          "radial-gradient(ellipse at center, #000c1f 0%, #000510 60%, #000205 100%)",
      }}
    >
      {/* Three.js canvas mount */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,2,8,0.85) 100%)",
        }}
      />

      {/* ── 2-D Node Labels overlay ── */}
      <div className="absolute inset-0 pointer-events-none">
        {nodePositions.map((pos) => {
          const node = NODES.find((n) => n.id === pos.id)!;
          const isHov = hoveredNode === pos.id;
          return (
            <div
              key={pos.id}
              className="absolute pointer-events-auto cursor-pointer"
              style={{ left: pos.x, top: pos.y, transform: "translate(-50%,-50%)" }}
              onMouseEnter={() => setHoveredNode(pos.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => handleNodeClick(node)}
            >
              <div className="w-8 h-8 rounded-full" />
              <div
                className={`absolute left-1/2 -translate-x-1/2 bottom-10 transition-all duration-300 ${
                  isHov
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-2 scale-95 pointer-events-none"
                }`}
              >
                <div
                  className="whitespace-nowrap rounded-xl border px-4 py-3 text-left shadow-2xl backdrop-blur-xl"
                  style={{
                    background: "rgba(5,8,20,0.92)",
                    borderColor: hexColor(node.color) + "55",
                    boxShadow: `0 0 24px 4px ${hexColor(node.color)}33`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{node.icon}</span>
                    <span
                      className="text-sm font-semibold tracking-wide"
                      style={{ color: hexColor(node.color) }}
                    >
                      {node.label}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 max-w-[200px] leading-relaxed">
                    {node.description}
                  </p>
                  <p
                    className="text-[10px] mt-1.5 font-mono tracking-widest uppercase"
                    style={{ color: hexColor(node.color) + "99" }}
                  >
                    Click to explore →
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Hero text ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <div
          className={`text-center transition-all duration-1000 ${
            titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p
            className="text-xs tracking-[0.45em] uppercase mb-3"
            style={{ color: "#c9a87599", fontFamily: "var(--font-mono)" }}
          >
            Welcome to
          </p>
          <h1
            className="text-5xl sm:text-7xl font-bold leading-none mb-2"
            style={{
              fontFamily: "var(--font-display)",
              background:
                "linear-gradient(135deg, #c9a875 0%, #f0d9a8 50%, #c9a875 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 24px rgba(201,168,117,0.5))",
            }}
          >
            The Artisan's Quill
          </h1>
          <p
            className="text-sm tracking-[0.3em] uppercase mt-2"
            style={{ color: "#c9a87566", fontFamily: "var(--font-mono)" }}
          >
            Digital Art & Poetry Sanctuary
          </p>
        </div>

        <div
          className={`mt-8 text-center transition-all duration-1000 delay-200 ${
            subtitleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p
            className="text-neutral-400 max-w-md text-sm leading-relaxed mx-auto"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontStyle: "italic",
              fontSize: "1.05rem",
            }}
          >
            A living constellation of paintings, poetry, motion &amp; music —<br />
            explore the stars to discover each realm.
          </p>
        </div>

        <div
          className={`mt-12 pointer-events-auto transition-all duration-1000 delay-300 ${
            enterVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <button
            onClick={handleEnter}
            className="group relative px-10 py-4 rounded-full text-sm tracking-[0.25em] uppercase font-semibold overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              fontFamily: "var(--font-mono)",
              background:
                "linear-gradient(135deg, rgba(201,168,117,0.15) 0%, rgba(201,168,117,0.08) 100%)",
              border: "1px solid rgba(201,168,117,0.4)",
              color: "#c9a875",
              boxShadow:
                "0 0 30px rgba(201,168,117,0.2), inset 0 1px 0 rgba(201,168,117,0.1)",
            }}
          >
            <span className="relative z-10">Enter the Gallery</span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(201,168,117,0.25) 0%, rgba(201,168,117,0.12) 100%)",
              }}
            />
          </button>

          <p
            className="text-center text-xs mt-5 tracking-widest"
            style={{ color: "#c9a87544", fontFamily: "var(--font-mono)" }}
          >
            or hover the stars to explore a realm
          </p>
        </div>
      </div>

      {/* Corner decorative elements */}
      <div
        className="absolute top-6 left-8 text-[10px] tracking-[0.4em] uppercase pointer-events-none"
        style={{ color: "#c9a87533", fontFamily: "var(--font-mono)" }}
      >
        ✦ Est. MMXXV ✦
      </div>
      <div
        className="absolute bottom-6 right-8 text-[10px] tracking-[0.4em] uppercase pointer-events-none"
        style={{ color: "#c9a87533", fontFamily: "var(--font-mono)" }}
      >
        ✦ 8 realms within ✦
      </div>
    </div>
  );
}
