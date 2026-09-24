"use client";

import React, { useEffect, useRef, useState } from "react";

const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;

mat2 rot2D(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// Precision 4-point star lens flare glint matching reference photo
float starGlint(vec2 p, vec2 center, float size, float intensity) {
  vec2 d = p - center;
  float dist = length(d);
  if (dist > size * 4.0) return 0.0;
  
  // Incandescent pinpoint core
  float core = exp(-dist * (95.0 / size)) * 2.4;
  
  // Horizontal & Vertical diffraction spikes (+)
  float spikeX = exp(-abs(d.y) * (200.0 / size)) * exp(-abs(d.x) * (14.0 / size));
  float spikeY = exp(-abs(d.x) * (200.0 / size)) * exp(-abs(d.y) * (14.0 / size));
  
  // Subtle diagonal rays (x)
  vec2 diag = rot2D(0.785398) * d;
  float diagSpike = (exp(-abs(diag.y) * (280.0 / size)) * exp(-abs(diag.x) * (20.0 / size)) +
                     exp(-abs(diag.x) * (280.0 / size)) * exp(-abs(diag.y) * (20.0 / size))) * 0.38;
                     
  return (core + (spikeX + spikeY) * 0.95 + diagSpike) * intensity;
}

// Curvilinear crossing glass veil (non-polar authentic 3D silk ribbon fold)
float crossingRibbonDist(vec2 p, float t) {
  // Graceful S-curve folding diagonally across the orb
  float curveY = 0.28 * sin(p.x * 4.2 + t * 0.55) + 0.12 * cos(p.x * 2.8 - t * 0.40) - 0.04;
  float deriv = 0.28 * 4.2 * cos(p.x * 4.2 + t * 0.55) - 0.12 * 2.8 * sin(p.x * 2.8 - t * 0.40);
  float dist = abs(p.y - curveY) / sqrt(1.0 + deriv * deriv);
  return dist;
}

void main() {
  // Centered normalized coordinates
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
  
  // Refined compact scale: sits gracefully centered with generous breathing room
  vec2 p = uv * 1.72;
  
  float t = uTime * 0.70;
  
  // =========================================================================
  // 1. ORGANIC BREATHING & FOUR-LOBED SILHOUETTE
  // =========================================================================
  float breath = 1.0 + sin(t * 1.25) * 0.015;
  vec2 bp = p / breath;
  
  float r = length(bp);
  float phi = atan(bp.y, bp.x);
  
  // Four organic lobes pointing North, East, South, West: cos(4.0 * phi)
  float lobe4 = cos(4.0 * phi);
  float undulate = sin(phi * 4.0 + t * 0.85) * 0.012 + cos(phi * 8.0 - t * 0.65) * 0.007;
  
  // Outer crystal boundary radius
  float R_lobe = 0.540 + 0.088 * lobe4 + undulate;
  
  // Inner dark cosmic void radius
  float R_aperture = 0.325 + 0.015 * sin(phi * 4.0 - t * 0.50);
  
  // Diagonal weight isolating warm amber to Top-Right (~45°) and Bottom-Left (~225°)
  float diagWeight = pow(max(cos(phi - 0.785398), 0.0), 1.9) +
                     pow(max(cos(phi - 0.785398 - 3.14159), 0.0), 1.9);
  diagWeight = clamp(diagWeight * 1.35, 0.0, 1.0);
  
  // Secondary orthogonal weight for electric cyan lobes
  float cyanWeight = pow(max(cos(phi * 2.0), 0.0), 1.8);
  
  // =========================================================================
  // 2. LAYERED GEM GLASS CAUSTIC RIBBONS & VEILS
  // =========================================================================
  
  // Layer A: Outer Glass Shell & Specular Lip
  float distA = abs(r - R_lobe);
  // Glass bevel wall thickness (inner edge of outer glass shell)
  float distA_inner = abs(r - (R_lobe - 0.038 + 0.012 * sin(phi * 5.0 - t * 0.7)));
  
  // Layer B: Sweeping Diagonal Warm Amber Caustic Ribbon
  float diagFold = sin(phi * 2.0 - t * 0.75) * 0.042 + cos(phi * 3.0 + t * 0.55) * 0.024;
  float R_diag = 0.455 + diagFold;
  float distB = abs(r - R_diag);
  
  // Layer C: Secondary Translucent Sapphire Silk Veil
  float waveC = cos(phi * 4.0 - t * 0.90 + 1.2) * 0.038 + sin(phi * 6.0 + t * 0.70) * 0.016;
  float R_inner = 0.405 + waveC;
  float distC = abs(r - R_inner);
  
  // Layer D: Curvilinear Crossing Silk Ribbon (Authentic non-polar glass fold)
  float distCross = crossingRibbonDist(bp, t);
  // Mask crossing ribbon so it only exists inside the glass volume
  float crossMask = smoothstep(R_lobe, R_lobe - 0.06, r) * smoothstep(R_aperture - 0.04, R_aperture + 0.06, r);
  
  // Layer E: Fine Glass Micro-Hairlines & Caustic Strata
  float distE1 = abs(r - (R_lobe - 0.075 + 0.018 * sin(phi * 6.0 + t * 1.1)));
  float distE2 = abs(r - (0.428 + 0.022 * cos(phi * 5.0 - t * 0.85)));
  
  // =========================================================================
  // 3. COLOR PALETTES (Authentic Electric Sapphire & Warm Incandescent Gold)
  // =========================================================================
  vec3 whiteCore  = vec3(1.00, 1.00, 1.00); // White-hot specular core
  vec3 cyanNeon   = vec3(0.25, 0.82, 1.00); // Electric pure cyan (#38BDF8)
  vec3 cyanAzure  = vec3(0.12, 0.48, 0.98); // Royal azure sapphire (#2563EB)
  vec3 cyanDeep   = vec3(0.04, 0.16, 0.55); // Deep cobalt glass depth
  vec3 cyanMist   = vec3(0.18, 0.55, 0.88); // Translucent blue veil
  
  vec3 goldCore   = vec3(1.00, 0.98, 0.92); // Incandescent golden white
  vec3 goldAmber  = vec3(1.00, 0.74, 0.28); // Rich golden amber (#F59E0B)
  vec3 goldOrange = vec3(0.96, 0.42, 0.08); // Tangerine fire fringe (#EA580C)
  vec3 goldSmoke  = vec3(0.55, 0.25, 0.06); // Smoky bronze glass depth
  
  vec3 color = vec3(0.0);
  
  // =========================================================================
  // 4. VOLUMETRIC GLASS BODY (Translucent silk/crystal depth between veils)
  // =========================================================================
  float glassBodyMask = smoothstep(R_lobe + 0.015, R_lobe - 0.06, r) * 
                        smoothstep(R_aperture - 0.04, R_aperture + 0.06, r);
  
  // Glass volumetric absorption & smoky tint
  vec3 glassBodyColor = mix(cyanDeep * 0.45 + cyanMist * 0.25, goldSmoke * 0.50 + goldAmber * 0.20, diagWeight * 0.65);
  // Add subtle internal caustics wave draped across glass body
  float internalCausticWave = pow(max(0.0, sin(phi * 3.0 - t * 0.85 + r * 14.0)), 4.0) * 0.25;
  glassBodyColor += mix(cyanNeon, goldAmber, diagWeight) * internalCausticWave;
  color += glassBodyColor * glassBodyMask * 0.85;
  
  // =========================================================================
  // 5. CAUSTIC RIBBONS WITH CHROMATIC PRISM DISPERSION (Gem Glass Effect)
  // =========================================================================
  
  // --- Layer A: Outer Boundary Specular Crest & Glass Wall ---
  // Prismatic chromatic separation along razor outer crest:
  float crestR = pow(clamp(1.0 - abs(r * 1.008 - R_lobe) * 38.0, 0.0, 1.0), 4.0);
  float crestG = pow(clamp(1.0 - distA * 38.0, 0.0, 1.0), 4.0);
  float crestB = pow(clamp(1.0 - abs(r * 0.992 - R_lobe) * 38.0, 0.0, 1.0), 4.0);
  vec3 prismCrestA = vec3(crestR, crestG, crestB) * 2.2;
  
  float glowA_diff = exp(-distA * 26.0) * 0.50;
  vec3 colA_base = mix(mix(cyanAzure, cyanNeon, 0.75), mix(goldOrange, goldAmber, 0.65), diagWeight * 0.45);
  color += colA_base * glowA_diff + prismCrestA * 0.80;
  
  // Inner rim of outer glass shell (double refraction)
  float glowA_in = pow(clamp(1.0 - distA_inner * 42.0, 0.0, 1.0), 3.5) * 1.1;
  color += mix(cyanNeon * 0.6, goldAmber * 0.5, diagWeight) * glowA_in;
  
  // --- Layer B: Diagonal Warm Amber Fold (Molten Gold Filament) ---
  float glowB_diff = exp(-distB * 28.0) * 0.65;
  float glowB_edge = pow(clamp(1.0 - distB * 42.0, 0.0, 1.0), 4.5) * 2.6;
  // Prismatic dispersion on amber filament
  float bR = pow(clamp(1.0 - abs(r * 1.006 - R_diag) * 42.0, 0.0, 1.0), 4.5);
  float bG = glowB_edge;
  float bB = pow(clamp(1.0 - abs(r * 0.994 - R_diag) * 42.0, 0.0, 1.0), 4.5);
  vec3 prismB = vec3(bR, bG, bB);
  
  vec3 colB_warm = mix(goldOrange, goldAmber, 0.85);
  vec3 colB_cool = cyanDeep * 0.6 + cyanNeon * 0.3;
  vec3 colB = mix(colB_cool, colB_warm, diagWeight);
  color += colB * glowB_diff * (0.35 + 0.85 * diagWeight) + 
           mix(prismB * goldCore, goldCore, 0.5) * glowB_edge * diagWeight * 1.75;
           
  // --- Layer C: Secondary Translucent Sapphire Veil ---
  float glowC_diff = exp(-distC * 30.0) * 0.45;
  float glowC_edge = pow(clamp(1.0 - distC * 38.0, 0.0, 1.0), 3.5) * 1.35;
  vec3 colC = mix(cyanAzure, cyanNeon, 0.70);
  color += colC * glowC_diff + whiteCore * glowC_edge * 0.65;
  
  // --- Layer D: Curvilinear Crossing Glass Ribbon ---
  float glowCross = pow(clamp(1.0 - distCross * 36.0, 0.0, 1.0), 4.0) * 1.6;
  float glowCrossDiff = exp(-distCross * 22.0) * 0.40;
  vec3 colCross = mix(cyanMist, goldAmber, diagWeight * 0.6);
  color += (colCross * glowCrossDiff + whiteCore * glowCross) * crossMask * 0.80;
  
  // --- Layer E: Fine Micro-Glass Hairlines & Caustic Strata ---
  float glowE1 = pow(clamp(1.0 - distE1 * 48.0, 0.0, 1.0), 3.8) * 0.85;
  float glowE2 = pow(clamp(1.0 - distE2 * 48.0, 0.0, 1.0), 3.8) * 0.75;
  color += mix(cyanNeon, goldAmber, diagWeight * 0.5) * (glowE1 + glowE2) * 0.85;
  
  // Dynamic crystal facet shimmer travelling along ribbons
  float shimmer = pow(max(0.0, sin(phi * 2.0 - t * 0.85 + r * 6.0)), 6.0) * 0.30;
  vec3 shimmerCol = mix(cyanNeon, goldAmber, diagWeight);
  color += shimmerCol * shimmer * glassBodyMask;
  
  // =========================================================================
  // 6. APERTURE IRIS CONTRAST (Deep Dark Void)
  // =========================================================================
  float irisMask = smoothstep(R_aperture - 0.035, R_aperture + 0.035, r);
  color *= irisMask;
  
  // Delicate inner glass aperture rim glint
  float innerRim = exp(-abs(r - R_aperture) * 48.0) * 0.45;
  color += mix(cyanDeep, goldOrange, diagWeight * 0.7) * innerRim;
  
  // =========================================================================
  // 7. SUSPENDED COSMIC STARDUST IN THE DARK CORE
  // =========================================================================
  float s1 = exp(-length(p - vec2(-0.065,  0.075)) * 220.0) * (sin(t * 2.2 + 0.0) * 0.35 + 0.65);
  float s2 = exp(-length(p - vec2( 0.085,  0.035)) * 220.0) * (sin(t * 2.5 + 1.2) * 0.35 + 0.65);
  float s3 = exp(-length(p - vec2(-0.020, -0.080)) * 220.0) * (sin(t * 2.0 + 2.4) * 0.35 + 0.65);
  float s4 = exp(-length(p - vec2( 0.045, -0.055)) * 220.0) * (sin(t * 2.8 + 3.6) * 0.35 + 0.65);
  float s5 = exp(-length(p - vec2(-0.110, -0.025)) * 220.0) * (sin(t * 2.3 + 4.8) * 0.35 + 0.65);
  float s6 = exp(-length(p - vec2( 0.015,  0.110)) * 220.0) * (sin(t * 2.7 + 6.0) * 0.35 + 0.65);
  float s7 = exp(-length(p - vec2(-0.050, -0.130)) * 220.0) * (sin(t * 2.4 + 1.8) * 0.35 + 0.65);
  
  color += vec3(0.5, 0.9, 1.0) * (s1 + s3 + s5) * 1.8;
  color += vec3(0.85, 0.95, 1.0) * (s2 + s4 + s6 + s7) * 1.8;
  
  // =========================================================================
  // 8. DIFFRACTION STAR LENS FLARE GLINTS (Matching Reference Coordinates)
  // =========================================================================
  
  // Star Glint 1: Prominent 4-point star on the upper-left inner rim (~10:30)
  vec2 glintPos1 = vec2(-0.215, 0.215) + vec2(sin(t * 0.8) * 0.002, cos(t * 0.7) * 0.002);
  float glint1 = starGlint(p, glintPos1, 0.075, 1.55 * (0.85 + 0.15 * sin(t * 2.8)));
  color += mix(vec3(1.0, 0.85, 0.55), vec3(1.0, 0.98, 0.92), 0.65) * glint1;
  
  // Star Glint 2: Secondary sparkling glint on upper-right warm fold (~2:00)
  vec2 glintPos2 = vec2(0.245, 0.190) + vec2(cos(t * 0.9) * 0.002, sin(t * 0.8) * 0.002);
  float glint2 = starGlint(p, glintPos2, 0.055, 1.15 * (0.82 + 0.18 * cos(t * 2.5)));
  color += mix(goldAmber, goldCore, 0.7) * glint2;
  
  // Star Glint 3: Delicate glint on lower-left warm fold (~7:30)
  vec2 glintPos3 = vec2(-0.240, -0.155) + vec2(sin(t * 0.7) * 0.002, cos(t * 0.9) * 0.002);
  float glint3 = starGlint(p, glintPos3, 0.050, 0.95 * (0.85 + 0.15 * sin(t * 2.2 + 1.2)));
  color += mix(goldAmber, goldCore, 0.6) * glint3;
  
  // =========================================================================
  // 9. AMBIENT AURA & PERIMETER FALLOFF
  // =========================================================================
  vec3 ambientAura = cyanNeon * 0.045 * exp(-abs(r - R_lobe) * 7.5) +
                    goldAmber * 0.035 * diagWeight * exp(-abs(r - R_diag) * 8.5);
  color += ambientAura;
  
  float outerFade = smoothstep(0.85, 0.60, r);
  color *= outerFade;
  
  float alpha = clamp(length(color) * 1.4, 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
`;

export default function MayaReceptionistVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl =
        canvas.getContext("webgl", {
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }) ||
        (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    } catch {
      setHasWebGL(false);
      return;
    }

    if (!gl) {
      setHasWebGL(false);
      return;
    }

    function compileShader(type: number, source: string): WebGLShader | null {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    if (!vertShader || !fragShader) {
      setHasWebGL(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setHasWebGL(false);
      return;
    }

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Program link error:", gl.getProgramInfoLog(program));
      setHasWebGL(false);
      return;
    }

    gl.useProgram(program);

    // Quad geometry (2 triangles covering clip space)
    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, "uTime");
    const uResLoc = gl.getUniformLocation(program, "uResolution");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let width = 0;
    let height = 0;

    function resize() {
      if (!canvas || !container || !gl) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.floor(rect.width * dpr);
      height = Math.floor(rect.height * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);
    resize();

    let animationFrameId: number;
    let startTime = performance.now();
    let isVisible = true;

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    function render(now: number) {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible || !gl || !program || !canvas) return;

      const elapsed = (now - startTime) * 0.001;

      gl.useProgram(program);
      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform2f(uResLoc, width || canvas.width, height || canvas.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      if (gl) {
        if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
        if (vertShader) gl.deleteShader(vertShader);
        if (fragShader) gl.deleteShader(fragShader);
        if (program) gl.deleteProgram(program);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-transparent pointer-events-none select-none"
    >
      {/* Soft Ambient Radial Bloom behind the Canvas */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(56, 189, 248, 0.14) 0%, rgba(245, 158, 11, 0.08) 45%, transparent 75%)",
        }}
      />

      {/* Primary Hardware-Accelerated WebGL Canvas */}
      {hasWebGL ? (
        <canvas
          ref={canvasRef}
          className="relative z-10 w-full h-full block pointer-events-none"
        />
      ) : (
        /* Graceful CSS / SVG Fallback if WebGL is disabled */
        <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          <div className="absolute inset-0 rounded-[38%] border-[5px] border-transparent border-t-cyan-400 border-r-amber-400 border-b-sky-400 border-l-cyan-400 animate-spin [animation-duration:8s] blur-[1px]" />
          <div className="w-16 h-16 rounded-full bg-[#050608]" />
        </div>
      )}
    </div>
  );
}
