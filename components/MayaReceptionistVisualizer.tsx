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

// Precision micro 4-point glitter star (pinpoint core + crisp tiny cross rays)
float microGlitterStar(vec2 p, vec2 center, float size, float twinkle) {
  vec2 d = p - center;
  float dist = length(d);
  if (dist > size * 3.5 || twinkle <= 0.01) return 0.0;
  
  // Needle-sharp pinpoint core
  float core = exp(-dist * (190.0 / size)) * 2.4;
  
  // Tiny micro diffraction cross spikes (+)
  float rayX = exp(-abs(d.y) * (420.0 / size)) * exp(-abs(d.x) * (26.0 / size));
  float rayY = exp(-abs(d.x) * (420.0 / size)) * exp(-abs(d.y) * (26.0 / size));
  
  // Subtle diagonal sparkle ray
  vec2 diag = rot2D(0.785398) * d;
  float rayDiag = (exp(-abs(diag.y) * (520.0 / size)) * exp(-abs(diag.x) * (40.0 / size)) +
                   exp(-abs(diag.x) * (520.0 / size)) * exp(-abs(diag.y) * (40.0 / size))) * 0.30;
  
  return (core + (rayX + rayY) * 0.75 + rayDiag) * twinkle;
}

// Ultra-fine micro point (delicate pinpoint twinkle for deep suspended diamond dust)
float microPoint(vec2 p, vec2 center, float twinkle) {
  float dist = length(p - center);
  if (dist > 0.04 || twinkle <= 0.02) return 0.0;
  return exp(-dist * 280.0) * 1.8 * twinkle;
}

// 3D rotation around vertical Y-axis (left-to-right 360-degree spin across the front face of the sphere)
vec3 rotY(vec3 pos, float angle) {
  float c = cos(angle), s = sin(angle);
  return vec3(c * pos.x + s * pos.z, pos.y, -s * pos.x + c * pos.z);
}

// 3D Orbiting Micro-Glitter 4-Point Star (sweeps across front face from left to right, deep shimmer on back)
float microGlitterStar3D(vec2 screenP, vec3 pos0, float spin, float size, float twinkle) {
  vec3 gpos = rotY(pos0, spin);
  float depthFac = smoothstep(-0.25, 0.10, gpos.z);
  float tw = twinkle * mix(0.18, 1.0, depthFac);
  float sz = size * mix(0.70, 1.05, depthFac);
  return microGlitterStar(screenP, gpos.xy, sz, tw);
}

// 3D Orbiting Micro Point Fleck
float microPoint3D(vec2 screenP, vec3 pos0, float spin, float twinkle) {
  vec3 gpos = rotY(pos0, spin);
  float depthFac = smoothstep(-0.25, 0.10, gpos.z);
  return microPoint(screenP, gpos.xy, twinkle * mix(0.18, 1.0, depthFac));
}

// 3D Diffraction Star Glint (flares on front face as facet faces camera)
float starGlint3D(vec2 screenP, vec3 pos0, float spin, float size, float intensity) {
  vec3 gpos = rotY(pos0, spin);
  float depthFac = smoothstep(-0.06, 0.18, gpos.z);
  if (depthFac <= 0.001) return 0.0;
  return starGlint(screenP, gpos.xy, size * (0.85 + 0.15 * depthFac), intensity * depthFac);
}

void main() {
  // Centered normalized coordinates
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
  
  // Refined compact luxury scale: sits gracefully centered with generous breathing room
  vec2 p = uv * 2.15;
  
  float t = uTime * 0.60;
  // Continuous 360-degree spin around vertical Y-axis (left to right like a spinning 3D ball)
  float spinAngle = uTime * 0.48;
  
  // =========================================================================
  // 1. ORGANIC BREATHING & FOUR-LOBED SILHOUETTE (Exact Original Shape Preserved)
  // =========================================================================
  float breath = 1.0 + sin(t * 1.15) * 0.012;
  vec2 bp = p / breath;
  
  float r = length(bp);
  float phi = atan(bp.y, bp.x);
  
  // Four organic lobes pointing North, East, South, West: cos(4.0 * phi)
  float lobe4 = cos(4.0 * phi);
  float undulate = sin(phi * 4.0 + t * 0.65) * 0.008;
  
  // Outer crystal boundary radius (Exact original 4-lobed blob shape):
  float R_lobe = 0.540 + 0.088 * lobe4 + undulate;
  
  // Crisp perimeter mask: strictly bounds ribbons and glitters INSIDE the 4-lobed blob silhouette
  float insideBlob = smoothstep(R_lobe + 0.003, R_lobe - 0.018, r);
  
  // 3D Glass Dome Geometry across the 4-lobed crystal:
  float normDist = clamp(r / max(R_lobe, 0.001), 0.0, 1.0);
  float domeZ = sqrt(max(0.0, 1.0 - normDist * normDist));
  float Z = domeZ * R_lobe;
  
  // 3D spherical horizontal longitude across the dome (spinning left-to-right around vertical axis):
  float phiY = atan(bp.x, max(Z, 0.001));
  float spinPhi = phiY - spinAngle;
  
  // Diagonal weight isolating warm amber along 3D ribbon rolling left-to-right across the blob
  float diagAngle = spinPhi - (bp.y / R_lobe) * 1.25 - 0.785398;
  float diagWeight = pow(max(cos(diagAngle), 0.0), 1.9) +
                     pow(max(cos(diagAngle - 3.14159), 0.0), 1.9);
  diagWeight = clamp(diagWeight * 1.35, 0.0, 1.0);
  
  // Secondary orthogonal weight for electric cyan lobes
  float cyanWeight = pow(max(cos(spinPhi * 2.0), 0.0), 1.8);
  
  // =========================================================================
  // 2. LAYERED GEM GLASS CAUSTIC RIBBONS (Kept strictly inside 4-lobed blob silhouette)
  // =========================================================================
  
  // Layer A: Outer Glass Shell & Specular Lip (Tucked inside the blob perimeter)
  float distA = abs(r - (R_lobe - 0.012));
  // Glass bevel wall thickness (smooth double refraction lip)
  float distA_inner = abs(r - (R_lobe - 0.038 + 0.008 * sin(spinPhi * 4.0 - t * 0.55)));
  
  // Layer B: Sweeping Diagonal Warm Amber Caustic Ribbon (rolling in 3D left-to-right)
  float diagFold = sin(spinPhi * 2.0 - t * 0.65) * 0.030 + cos(spinPhi * 4.0 + t * 0.45) * 0.014;
  float R_diag = min(0.440 + diagFold, R_lobe - 0.025);
  float distB = abs(r - R_diag);
  
  // Layer C: Secondary Translucent Sapphire Silk Veil (Soft diffused inside)
  float waveC = cos(spinPhi * 4.0 - t * 0.60 + 1.2) * 0.024;
  float distC = abs(r - min(0.380 + waveC, R_lobe - 0.035));
  
  // Layer D & E: Symmetrical Top & Bottom Caustic Glass Folds
  float topDomeR = R_lobe - 0.052 + 0.010 * sin(spinPhi * 2.0 - 1.5708);
  float distTopGlass = abs(r - topDomeR);
  float botDomeR = R_lobe - 0.048 - 0.008 * sin(spinPhi * 2.0 - 1.5708);
  float distBotGlass = abs(r - botDomeR);
  
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
  // 4. PHYSICAL 3D GLASS DOME GEOMETRY & VOLUMETRIC OPTICS
  // =========================================================================
  // Continuous smooth dome normal across the entire 4-lobed volume:
  vec2 nXY = (bp / max(r, 0.001)) * normDist;
  vec3 N = normalize(vec3(nXY, domeZ * 0.92 + 0.08));
  
  // Optical Fresnel Reflection (grazing-angle glass luminosity towards outer lobe boundary):
  float fresnel = pow(1.0 - max(N.z, 0.0), 2.4);
  
  // Overhead Studio Light Source (Fixed overhead in world space):
  vec3 lightTop = normalize(vec3(0.08, 0.94, 0.34));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfTop = normalize(lightTop + viewDir);
  
  // Specular Glass Sheen from Top (Clean polished glass highlights):
  float specTight = pow(max(dot(N, halfTop), 0.0), 38.0);
  float specSoft = pow(max(dot(N, halfTop), 0.0), 9.0);
  
  // Prismatic Chromatic Separation on Top Glass Highlights:
  float specR = pow(max(dot(N, normalize(vec3(0.08, 0.95, 0.32))), 0.0), 36.0);
  float specG = specTight;
  float specB = pow(max(dot(N, normalize(vec3(0.08, 0.93, 0.36))), 0.0), 40.0);
  vec3 prismSpec = vec3(specR, specG, specB);
  
  float topSheenMask = smoothstep(-0.04, 0.32, bp.y) * insideBlob;
  vec3 glassTopGlaze = (mix(prismSpec * cyanNeon, whiteCore, 0.65) * specTight * 1.25 + 
                        cyanNeon * specSoft * 0.38) * topSheenMask;
  
  // Glass volumetric absorption & smoky tint (richer, deeper optical body)
  vec3 glassBodyColor = mix(cyanDeep * 0.25 + cyanMist * 0.08, goldSmoke * 0.28 + goldAmber * 0.08, diagWeight * 0.65);
  // Internal caustics wave draped across glass body (rolling in 3D left-to-right)
  float internalCausticWave = pow(max(0.0, sin(spinPhi * 2.0 - t * 0.65 + r * 8.0)), 4.0) * 0.10;
  glassBodyColor += mix(cyanNeon, goldAmber, diagWeight) * internalCausticWave;
  // Blend with physical Fresnel rim brightening (subtle liquid glass sheen):
  glassBodyColor += mix(cyanNeon, goldAmber, diagWeight) * (fresnel * 0.28);
  color += glassBodyColor * insideBlob * 0.30;
  
  // =========================================================================
  // 5. CAUSTIC RIBBONS WITH CHROMATIC PRISM DISPERSION (Inside Blob Volume)
  // =========================================================================
  
  // --- Layer A: Outer Boundary Specular Crest & Glass Wall ---
  float crestR = pow(clamp(1.0 - abs(r * 1.008 - (R_lobe - 0.012)) * 38.0, 0.0, 1.0), 4.0);
  float crestG = pow(clamp(1.0 - distA * 38.0, 0.0, 1.0), 4.0);
  float crestB = pow(clamp(1.0 - abs(r * 0.992 - (R_lobe - 0.012)) * 38.0, 0.0, 1.0), 4.0);
  vec3 prismCrestA = vec3(crestR, crestG, crestB) * 1.7;
  
  float glowA_diff = exp(-distA * 28.0) * 0.35;
  vec3 colA_base = mix(mix(cyanAzure, cyanNeon, 0.75), mix(goldOrange, goldAmber, 0.65), diagWeight * 0.45);
  color += (colA_base * glowA_diff + prismCrestA * 0.65) * insideBlob;
  
  // Inner rim of outer glass shell (double refraction)
  float glowA_in = pow(clamp(1.0 - distA_inner * 42.0, 0.0, 1.0), 3.5) * 0.80;
  color += mix(cyanNeon * 0.55, goldAmber * 0.45, diagWeight) * glowA_in * insideBlob;
  
  // --- Layer B: Diagonal Warm Amber Fold (Molten Gold Filament rolling in 3D) ---
  float glowB_diff = exp(-distB * 28.0) * 0.28;
  float glowB_edge = pow(clamp(1.0 - distB * 38.0, 0.0, 1.0), 4.2) * 1.7;
  float bR = pow(clamp(1.0 - abs(r * 1.006 - R_diag) * 38.0, 0.0, 1.0), 4.2);
  float bG = glowB_edge;
  float bB = pow(clamp(1.0 - abs(r * 0.994 - R_diag) * 38.0, 0.0, 1.0), 4.2);
  vec3 prismB = vec3(bR, bG, bB);
  
  vec3 colB_warm = mix(goldOrange, goldAmber, 0.85);
  vec3 colB_cool = cyanDeep * 0.6 + cyanNeon * 0.3;
  vec3 colB = mix(colB_cool, colB_warm, diagWeight);
  color += (colB * glowB_diff * (0.30 + 0.70 * diagWeight) + 
            mix(prismB * goldCore, goldCore, 0.5) * glowB_edge * diagWeight * 1.25) * insideBlob;
            
  // --- Layer C: Secondary Translucent Sapphire Veil ---
  float glowC_diff = exp(-distC * 28.0) * 0.16;
  vec3 colC = mix(cyanAzure, cyanNeon, 0.72);
  color += colC * glowC_diff * insideBlob;
  
  // --- Layer D (Top Glass Dome Meniscus): High-End Crystal Shell Arc from Top ---
  float topGlassMask = smoothstep(0.04, 0.30, bp.y) * insideBlob;
  float glowTopDiff = exp(-distTopGlass * 28.0) * 0.38;
  float glowTopEdge = pow(clamp(1.0 - distTopGlass * 36.0, 0.0, 1.0), 3.5) * 0.95;
  vec3 colTopFold = mix(cyanAzure, cyanNeon, 0.85);
  vec3 topGlassLayer = (colTopFold * glowTopDiff + whiteCore * glowTopEdge * 0.70) * topGlassMask;
  color += topGlassLayer * 0.75;
  
  // --- Layer E (Bottom Glass Veil): Symmetrical Lower Arc ---
  float botGlassMask = smoothstep(-0.04, -0.30, bp.y) * insideBlob;
  float glowBotDiff = exp(-distBotGlass * 28.0) * 0.25;
  float glowBotEdge = pow(clamp(1.0 - distBotGlass * 36.0, 0.0, 1.0), 3.2) * 0.55;
  vec3 colBotFold = mix(cyanDeep, cyanAzure, 0.75);
  vec3 botGlassLayer = (colBotFold * glowBotDiff + whiteCore * glowBotEdge * 0.35) * botGlassMask;
  color += botGlassLayer * 0.60;
  
  // Apply Top-Down Studio Glass Specular Glaze:
  color += glassTopGlaze * 0.75;
  
  // Subtle facet shimmer travelling gently along the glass body
  float shimmer = pow(max(0.0, sin(spinPhi * 2.0 - t * 0.65 + r * 4.0)), 6.0) * 0.18;
  vec3 shimmerCol = mix(cyanNeon, goldAmber, diagWeight);
  color += shimmerCol * shimmer * insideBlob;
  
  // Deep liquid glass center: rich obsidian sapphire & dark cognac bronze absorption
  vec3 liquidSapphire = vec3(0.0006, 0.004, 0.016); // Deep midnight obsidian sapphire
  vec3 liquidBronze   = vec3(0.008, 0.003, 0.0008); // Smoky dark espresso cognac
  vec3 liqBase = mix(liquidSapphire, liquidBronze, diagWeight * 0.75);
  
  // Optical core depth (smooth Gaussian absorption towards dark interior)
  float coreDepth = exp(-r * r * 5.4);
  color = mix(color, color * 0.12 + liqBase * 0.24, coreDepth * 0.91);
  
  // =========================================================================
  // 6. RANDOMLY SCATTERED BUNCH OF PREMIUM MICRO-GLITTERS & DIAMOND DUST
  // =========================================================================
  // Fine jewelry-grade palette for glitters
  vec3 starDiamond   = vec3(1.00, 1.00, 1.00); // Pure brilliant diamond
  vec3 starIceCyan   = vec3(0.55, 0.90, 1.00); // Electric sapphire crystal
  vec3 starSoftAzure = vec3(0.35, 0.70, 1.00); // Deep sapphire mote
  vec3 starChampagne = vec3(1.00, 0.92, 0.78); // Incandescent champagne gold
  vec3 starWarmAmber = vec3(1.00, 0.80, 0.45); // Molten amber crystal
  vec3 starRoseGold  = vec3(1.00, 0.70, 0.50); // Warm bronze fleck
  
  // TIER 1: 16 RANDOMLY SCATTERED 4-POINT MICRO-GLITTER STARS (Orbiting 3D Sphere Left to Right)
  // 1: Upper-Right (~1:30)
  color += starIceCyan * microGlitterStar3D(bp, vec3(0.19, 0.25, 0.25) + vec3(sin(t * 0.7 + 0.3), cos(t * 0.8 + 1.1), sin(t * 0.6 + 1.8)) * 0.003, spinAngle, 0.018, pow(max(0.0, sin(t * 2.3 + 0.5)), 4.0) * 0.85 + 0.06) * insideBlob;
  // 2: Upper-Left (~10:00)
  color += starDiamond * microGlitterStar3D(bp, vec3(-0.24, 0.19, 0.20) + vec3(cos(t * 0.8 + 1.5), sin(t * 0.6 + 2.2), cos(t * 0.7 + 0.5)) * 0.003, spinAngle, 0.020, pow(max(0.0, sin(t * 1.9 + 2.8)), 4.0) * 0.90 + 0.06) * insideBlob;
  // 3: Top North (~12:15)
  color += starIceCyan * microGlitterStar3D(bp, vec3(-0.08, 0.29, 0.25) + vec3(sin(t * 0.9 + 3.1), cos(t * 0.7 + 0.4), sin(t * 0.8 + 2.1)) * 0.003, spinAngle, 0.017, pow(max(0.0, sin(t * 2.6 + 1.2)), 4.0) * 0.80 + 0.05) * insideBlob;
  // 4: Far East fold (~3:15)
  color += starChampagne * microGlitterStar3D(bp, vec3(0.28, 0.08, 0.15) + vec3(cos(t * 0.7 + 4.2), sin(t * 0.9 + 3.7), cos(t * 0.6 + 3.4)) * 0.003, spinAngle, 0.019, pow(max(0.0, sin(t * 2.1 + 4.0)), 4.0) * 0.85 + 0.06) * insideBlob;
  // 5: Lower-Right amber caustic (~4:45)
  color += starWarmAmber * microGlitterStar3D(bp, vec3(0.14, -0.22, 0.28) + vec3(sin(t * 0.6 + 2.1), cos(t * 0.8 + 5.2), sin(t * 0.7 + 4.1)) * 0.003, spinAngle, 0.021, pow(max(0.0, sin(t * 2.7 + 3.4)), 4.0) * 0.90 + 0.06) * insideBlob;
  // 6: Far West fold (~9:00)
  color += starDiamond * microGlitterStar3D(bp, vec3(-0.29, -0.14, 0.15) + vec3(cos(t * 0.8 + 0.9), sin(t * 0.7 + 1.8), cos(t * 0.9 + 0.7)) * 0.003, spinAngle, 0.018, pow(max(0.0, sin(t * 2.2 + 5.1)), 4.0) * 0.85 + 0.05) * insideBlob;
  // 7: Lower South (~6:30)
  color += starIceCyan * microGlitterStar3D(bp, vec3(-0.11, -0.27, 0.25) + vec3(sin(t * 0.7 + 3.5), cos(t * 0.9 + 4.1), sin(t * 0.8 + 1.5)) * 0.003, spinAngle, 0.017, pow(max(0.0, sin(t * 2.5 + 0.7)), 4.0) * 0.80 + 0.06) * insideBlob;
  // 8: Southeast (~5:15)
  color += starChampagne * microGlitterStar3D(bp, vec3(0.26, -0.17, 0.18) + vec3(cos(t * 0.6 + 5.0), sin(t * 0.8 + 2.7), cos(t * 0.7 + 2.9)) * 0.003, spinAngle, 0.019, pow(max(0.0, sin(t * 2.0 + 2.3)), 4.0) * 0.85 + 0.06) * insideBlob;
  // 9: Mid-Left interior (~8:45)
  color += starDiamond * microGlitterStar3D(bp, vec3(-0.17, -0.02, 0.30) + vec3(sin(t * 0.8 + 1.4), cos(t * 0.6 + 3.8), sin(t * 0.9 + 0.4)) * 0.003, spinAngle, 0.016, pow(max(0.0, sin(t * 2.8 + 4.6)), 4.0) * 0.75 + 0.05) * insideBlob;
  // 10: Mid-South interior (~5:45)
  color += starRoseGold * microGlitterStar3D(bp, vec3(0.05, -0.12, 0.32) + vec3(cos(t * 0.7 + 3.2), sin(t * 0.9 + 0.6), cos(t * 0.8 + 3.8)) * 0.003, spinAngle, 0.017, pow(max(0.0, sin(t * 1.8 + 1.9)), 4.0) * 0.80 + 0.05) * insideBlob;
  // 11: Mid-North interior (~11:45)
  color += starIceCyan * microGlitterStar3D(bp, vec3(-0.03, 0.18, 0.30) + vec3(sin(t * 0.9 + 4.7), cos(t * 0.7 + 2.4), sin(t * 0.6 + 4.5)) * 0.003, spinAngle, 0.016, pow(max(0.0, sin(t * 2.4 + 3.9)), 4.0) * 0.75 + 0.05) * insideBlob;
  // 12: Mid-East interior (~2:45)
  color += starChampagne * microGlitterStar3D(bp, vec3(0.12, 0.07, 0.32) + vec3(cos(t * 0.8 + 2.5), sin(t * 0.6 + 5.3), cos(t * 0.9 + 1.2)) * 0.003, spinAngle, 0.017, pow(max(0.0, sin(t * 2.2 + 0.3)), 4.0) * 0.80 + 0.05) * insideBlob;
  // 13: North-East intermediate (~1:00)
  color += starDiamond * microGlitterStar3D(bp, vec3(0.10, 0.22, 0.28) + vec3(sin(t * 0.75 + 1.7), cos(t * 0.65 + 3.2), sin(t * 0.85 + 2.6)) * 0.003, spinAngle, 0.017, pow(max(0.0, sin(t * 2.4 + 2.1)), 4.0) * 0.82 + 0.06) * insideBlob;
  // 14: North-West high lobe (~11:15)
  color += starIceCyan * microGlitterStar3D(bp, vec3(-0.18, 0.26, 0.20) + vec3(cos(t * 0.7 + 4.1), sin(t * 0.8 + 0.9), cos(t * 0.65 + 5.0)) * 0.003, spinAngle, 0.018, pow(max(0.0, sin(t * 2.0 + 4.4)), 4.0) * 0.85 + 0.05) * insideBlob;
  // 15: South-East low fold (~4:15)
  color += starWarmAmber * microGlitterStar3D(bp, vec3(0.20, -0.24, 0.22) + vec3(sin(t * 0.85 + 3.3), cos(t * 0.75 + 1.6), sin(t * 0.7 + 0.8)) * 0.003, spinAngle, 0.019, pow(max(0.0, sin(t * 2.5 + 1.7)), 4.0) * 0.88 + 0.06) * insideBlob;
  // 16: South-West low fold (~7:45)
  color += starDiamond * microGlitterStar3D(bp, vec3(-0.21, -0.21, 0.20) + vec3(cos(t * 0.65 + 2.4), sin(t * 0.85 + 4.5), cos(t * 0.8 + 2.2)) * 0.003, spinAngle, 0.018, pow(max(0.0, sin(t * 2.3 + 3.8)), 4.0) * 0.85 + 0.05) * insideBlob;
  
  // TIER 2: 12 SUSPENDED MICRO DIAMOND FLECKS (Deep crystalline suspension in 3D orbit)
  color += starIceCyan   * microPoint3D(bp, vec3(-0.13,  0.09, 0.30) + vec3(sin(t * 0.6 + 0.5), cos(t * 0.7 + 1.9), sin(t * 0.8 + 1.1)) * 0.003, spinAngle, pow(max(0.0, sin(t * 2.7 + 0.8)), 3.5) * 0.75 + 0.08) * insideBlob;
  color += starDiamond   * microPoint3D(bp, vec3( 0.21,  0.16, 0.24) + vec3(cos(t * 0.8 + 2.2), sin(t * 0.6 + 0.4), cos(t * 0.7 + 3.4)) * 0.003, spinAngle, pow(max(0.0, sin(t * 2.2 + 2.5)), 3.5) * 0.80 + 0.08) * insideBlob;
  color += starChampagne * microPoint3D(bp, vec3( 0.16, -0.08, 0.28) + vec3(sin(t * 0.7 + 3.9), cos(t * 0.8 + 2.7), sin(t * 0.6 + 2.3)) * 0.003, spinAngle, pow(max(0.0, sin(t * 2.5 + 4.1)), 3.5) * 0.80 + 0.08) * insideBlob;
  color += starIceCyan   * microPoint3D(bp, vec3(-0.22, -0.06, 0.22) + vec3(cos(t * 0.9 + 1.1), sin(t * 0.7 + 3.5), cos(t * 0.8 + 0.9)) * 0.003, spinAngle, pow(max(0.0, sin(t * 2.1 + 1.6)), 3.5) * 0.75 + 0.08) * insideBlob;
  color += starSoftAzure * microPoint3D(bp, vec3(-0.06, -0.20, 0.26) + vec3(sin(t * 0.8 + 4.8), cos(t * 0.6 + 0.9), sin(t * 0.7 + 4.5)) * 0.003, spinAngle, pow(max(0.0, sin(t * 2.6 + 3.2)), 3.5) * 0.70 + 0.06) * insideBlob;
  color += starRoseGold  * microPoint3D(bp, vec3( 0.07, -0.28, 0.20) + vec3(cos(t * 0.7 + 0.3), sin(t * 0.9 + 4.2), cos(t * 0.8 + 2.1)) * 0.003, spinAngle, pow(max(0.0, sin(t * 1.9 + 5.0)), 3.5) * 0.75 + 0.08) * insideBlob;
  color += starDiamond   * microPoint3D(bp, vec3( 0.27, -0.05, 0.18) + vec3(sin(t * 0.9 + 2.7), cos(t * 0.7 + 5.1), sin(t * 0.6 + 3.2)) * 0.003, spinAngle, pow(max(0.0, sin(t * 2.8 + 0.4)), 3.5) * 0.80 + 0.08) * insideBlob;
  color += starIceCyan   * microPoint3D(bp, vec3(-0.26,  0.08, 0.16) + vec3(cos(t * 0.6 + 3.6), sin(t * 0.8 + 1.8), cos(t * 0.9 + 1.4)) * 0.003, spinAngle, pow(max(0.0, sin(t * 2.3 + 2.9)), 3.5) * 0.75 + 0.08) * insideBlob;
  color += starChampagne * microPoint3D(bp, vec3( 0.02,  0.28, 0.22) + vec3(sin(t * 0.8 + 1.9), cos(t * 0.7 + 4.4), sin(t * 0.7 + 5.2)) * 0.003, spinAngle, pow(max(0.0, sin(t * 2.4 + 4.7)), 3.5) * 0.78 + 0.08) * insideBlob;
  color += starWarmAmber * microPoint3D(bp, vec3( 0.23,  0.02, 0.24) + vec3(cos(t * 0.7 + 5.2), sin(t * 0.8 + 3.1), cos(t * 0.8 + 0.3)) * 0.003, spinAngle, pow(max(0.0, sin(t * 2.0 + 1.1)), 3.5) * 0.75 + 0.08) * insideBlob;
  color += starDiamond   * microPoint3D(bp, vec3(-0.09,  0.12, 0.30) + vec3(sin(t * 0.9 + 0.8), cos(t * 0.6 + 2.3), sin(t * 0.7 + 3.7)) * 0.003, spinAngle, pow(max(0.0, sin(t * 2.7 + 3.6)), 3.5) * 0.80 + 0.08) * insideBlob;
  color += starSoftAzure * microPoint3D(bp, vec3(-0.15, -0.18, 0.22) + vec3(cos(t * 0.8 + 4.3), sin(t * 0.7 + 0.6), cos(t * 0.6 + 4.8)) * 0.003, spinAngle, pow(max(0.0, sin(t * 2.2 + 5.4)), 3.5) * 0.70 + 0.06) * insideBlob;
  
  // =========================================================================
  // 7. DIFFRACTION STAR LENS FLARE GLINTS (Rotating 3D Crystal Surface Facets)
  // =========================================================================
  
  // Star Glint 1: Prominent 4-point star on the upper-left inner rim (~10:30)
  vec3 glintPos1 = vec3(-0.215, 0.215, 0.30) + vec3(sin(t * 0.8) * 0.002, cos(t * 0.7) * 0.002, sin(t * 0.6) * 0.002);
  float glint1 = starGlint3D(bp, glintPos1, spinAngle, 0.068, 1.05 * (0.85 + 0.15 * sin(t * 2.8)));
  color += mix(vec3(1.0, 0.85, 0.55), vec3(1.0, 0.98, 0.92), 0.65) * glint1 * insideBlob;
  
  // Star Glint 2: Secondary sparkling glint on upper-right warm fold (~2:00)
  vec3 glintPos2 = vec3(0.245, 0.190, 0.28) + vec3(cos(t * 0.9) * 0.002, sin(t * 0.8) * 0.002, cos(t * 0.7) * 0.002);
  float glint2 = starGlint3D(bp, glintPos2, spinAngle, 0.050, 0.80 * (0.82 + 0.18 * cos(t * 2.5)));
  color += mix(goldAmber, goldCore, 0.7) * glint2 * insideBlob;
  
  // Star Glint 3: Delicate glint on lower-left warm fold (~7:30)
  vec3 glintPos3 = vec3(-0.240, -0.155, 0.30) + vec3(sin(t * 0.7) * 0.002, cos(t * 0.9) * 0.002, sin(t * 0.8) * 0.002);
  float glint3 = starGlint3D(bp, glintPos3, spinAngle, 0.045, 0.65 * (0.85 + 0.15 * sin(t * 2.2 + 1.2)));
  color += mix(goldAmber, goldCore, 0.6) * glint3 * insideBlob;
  
  // =========================================================================
  // 8. TIGHT PERIMETER CUTOFF & TRANSPARENCY (Zero Spill Outside 4-Lobed Blob)
  // =========================================================================
  float edgeGlow = exp(-max(0.0, r - R_lobe) * 36.0);
  color *= edgeGlow;
  
  float alpha = clamp(length(color) * 1.4, 0.0, 1.0) * smoothstep(R_lobe + 0.025, R_lobe - 0.005, r);
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
      -1.0, 1.0,
      -1.0, 1.0,
      1.0, -1.0,
      1.0, 1.0,
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
        className="absolute inset-0 pointer-events-none opacity-25 blur-3xl"
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
        /* Graceful High-Resolution Glass Fallback if WebGL is disabled */
        <div className="relative z-10 w-full h-full max-w-[300px] max-h-[300px] flex items-center justify-center">
          <img
            src="/images/receptionist-gem-glass.webp"
            alt="MAYA Voice Visualizer"
            className="w-full h-full object-contain pointer-events-none drop-shadow-[0_0_50px_rgba(56,189,248,0.25)]"
          />
        </div>
      )}
    </div>
  );
}
