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

// Precision Minimal 4-Point & 8-Point Star Glint (Delicate, crisp optical facet shimmer)
float masterStarGlint(vec2 p, vec2 center, float rayLength, float rayThickness, float intensity) {
  vec2 d = p - center;
  float dist = length(d);
  if (dist > rayLength * 1.5 || intensity <= 0.005) return 0.0;
  
  // Crisp, bright diamond pinpoint core - zero blurry fog
  float core = exp(-dist * 240.0) * 1.35;
  
  // Razor-thin needle spikes
  float spikeX = exp(-abs(d.y) * rayThickness) * pow(max(0.0, 1.0 - abs(d.x) / rayLength), 2.0);
  float spikeY = exp(-abs(d.x) * rayThickness) * pow(max(0.0, 1.0 - abs(d.y) / rayLength), 2.0);
  
  // Delicate diagonal micro rays
  vec2 diag = rot2D(0.785398) * d;
  float diagLen = rayLength * 0.50;
  float diagX = exp(-abs(diag.y) * (rayThickness * 1.2)) * pow(max(0.0, 1.0 - abs(diag.x) / diagLen), 2.2);
  float diagY = exp(-abs(diag.x) * (rayThickness * 1.2)) * pow(max(0.0, 1.0 - abs(diag.y) / diagLen), 2.2);
  float diagSpikes = (diagX + diagY) * 0.22;
  
  return (core + (spikeX + spikeY) * 0.50 + diagSpikes) * intensity;
}

// Precision Micro 4-Point Glitter Star (Visible, crisp needle diamond)
float microGlitterStar(vec2 p, vec2 center, float rayLength, float twinkle) {
  vec2 d = p - center;
  float dist = length(d);
  if (dist > rayLength * 1.4 || twinkle <= 0.005) return 0.0;
  
  // Sharp bright pinpoint core
  float core = exp(-dist * 250.0) * 1.10;
  
  // Razor-thin needle spikes
  float spikeX = exp(-abs(d.y) * 300.0) * pow(max(0.0, 1.0 - abs(d.x) / rayLength), 2.0);
  float spikeY = exp(-abs(d.x) * 300.0) * pow(max(0.0, 1.0 - abs(d.y) / rayLength), 2.0);
  
  return (core + (spikeX + spikeY) * 0.40) * twinkle;
}

// Fine micro point (visible diamond dust pinpoint fleck)
float microPoint(vec2 p, vec2 center, float twinkle) {
  vec2 d = p - center;
  float dist = length(d);
  if (dist > 0.022 || twinkle <= 0.005) return 0.0;
  return exp(-dist * 250.0) * 0.90 * twinkle;
}

// =========================================================================
// 3D HYDRODYNAMIC ORBITAL PHYSICS (Tilted Axis, Fluid Swirl & Perspective)
// =========================================================================

// 3D rotation around an inclined axis aligned with the blob's diagonal caustic roll
vec3 computeFluidOrbit3D(vec3 pos0, float spin) {
  // Axial tilt aligning orbital plane with the diagonal amber caustic ribbon (~24 degrees)
  float tilt = 0.42;
  float ct = cos(tilt), st = sin(tilt);
  
  // 1. Tilt initial coordinate into the blob's internal fluid plane
  vec3 pTilted = vec3(pos0.x, ct * pos0.y - st * pos0.z, st * pos0.y + ct * pos0.z);
  
  // 2. Fluid differential rotation (particles closer to core have slight fluid drag)
  float rDist = length(pTilted.xz);
  float orbitalSpin = spin * (0.94 + 0.12 * clamp(rDist * 3.0, 0.0, 1.0));
  
  // 3. 360-degree rotation around the inclined axis
  float cs = cos(orbitalSpin), ss = sin(orbitalSpin);
  vec3 pRot = vec3(cs * pTilted.x + ss * pTilted.z, pTilted.y, -ss * pTilted.x + cs * pTilted.z);
  
  // 4. Hydrodynamic fluid wave (gentle buoyant undulation inside the rotating matrix)
  float wave = sin(orbitalSpin * 2.0 + uTime * 0.45) * 0.008;
  pRot.y += wave;
  pRot.x += cos(orbitalSpin * 2.0 + uTime * 0.45) * 0.004;
  
  // 5. Restore back to camera view space
  return vec3(pRot.x, ct * pRot.y + st * pRot.z, -st * pRot.y + ct * pRot.z);
}

// 3D Perspective Projection with Spherical Glass Dome Curvature & Parallax
vec2 projectFluidToScreen(vec3 gpos) {
  // True camera perspective parallax: closer points (+Z) expand; deeper points (-Z) contract
  float perspective = 1.0 / (1.0 - gpos.z * 0.36);
  // Spherical optical glass dome refraction: slight outward lens curvature toward apex
  float domeRefract = 1.0 + max(0.0, gpos.z) * 0.08;
  return gpos.xy * perspective * domeRefract;
}

// 3D Orbiting Micro-Glitter 4-Point Star with physically grounded optics
float microGlitterStar3D(vec2 screenP, vec3 pos0, float spin, float rayLength, float twinkle) {
  vec3 gpos = computeFluidOrbit3D(pos0, spin);
  vec2 projP = projectFluidToScreen(gpos);
  
  // Physical depth attenuation (Beer-Lambert optical absorption in obsidian glass)
  float frontFac = smoothstep(-0.28, 0.14, gpos.z);
  
  // Physical light glint: flare when rotating through the overhead studio light vector
  vec3 lightDir = normalize(vec3(0.08, 0.94, 0.34));
  vec3 starNorm = normalize(vec3(gpos.xy * 1.6, max(gpos.z + 0.12, 0.05)));
  float lightStrike = pow(max(dot(starNorm, lightDir), 0.0), 3.8);
  
  // Dynamic twinkle combines periodic scintillation with physical lighting glint
  float tw = (twinkle * 0.60 + lightStrike * 0.70) * mix(0.14, 1.0, frontFac);
  float len = rayLength * mix(0.70, 1.15, frontFac);
  
  return microGlitterStar(screenP, projP, len, tw);
}

// 3D Orbiting Micro Diamond Dust Point with depth absorption
float microPoint3D(vec2 screenP, vec3 pos0, float spin, float twinkle) {
  vec3 gpos = computeFluidOrbit3D(pos0, spin);
  vec2 projP = projectFluidToScreen(gpos);
  
  float frontFac = smoothstep(-0.28, 0.14, gpos.z);
  return microPoint(screenP, projP, twinkle * mix(0.14, 1.0, frontFac));
}

// 3D Master Diffraction Star Glint on rotating crystal facets with directional flare
float starGlint3D(vec2 screenP, vec3 pos0, float spin, float rayLength, float intensity) {
  vec3 gpos = computeFluidOrbit3D(pos0, spin);
  vec2 projP = projectFluidToScreen(gpos);
  
  float frontFac = smoothstep(-0.06, 0.20, gpos.z);
  if (frontFac <= 0.001) return 0.0;
  
  // Directional facet flare matching overhead studio lighting
  vec3 lightDir = normalize(vec3(0.08, 0.94, 0.34));
  vec3 facetNorm = normalize(vec3(gpos.xy * 1.8, max(gpos.z, 0.05)));
  float flare = pow(max(dot(facetNorm, lightDir), 0.0), 3.5);
  
  return masterStarGlint(screenP, projP, rayLength * (0.80 + 0.25 * frontFac), 280.0, intensity * frontFac * (0.50 + 0.70 * flare));
}

// Premium scintillation twinkle curve (crisp diamond pulse)
float starTwinkle(float t, float freq, float phase) {
  float s = 0.5 + 0.5 * sin(t * freq + phase);
  return 0.15 + 0.85 * pow(s, 2.4);
}

float dustTwinkle(float t, float freq, float phase) {
  float s = 0.5 + 0.5 * sin(t * freq + phase);
  return 0.12 + 0.75 * pow(s, 2.0);
}

void main() {
  // Centered normalized coordinates
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
  
  // Refined compact luxury scale: sits gracefully centered with generous breathing room
  vec2 p = uv * 2.38;
  
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
  
  // Layer B: Sweeping Diagonal Warm Amber Caustic Ribbon (rolling in 3D left-to-right)
  
  // Layer C: Secondary Translucent Sapphire Silk Veil (Soft diffused inside 4 lobes)
  float waveC = cos(spinPhi * 4.0 - t * 0.60 + 1.2) * 0.024;
  float distC = abs(normDist - (0.58 + waveC * 0.5));
  
  // Layer D & E: Symmetrical Top & Bottom Caustic Glass Folds (Organic 4-lobed contours)
  float distTopGlass = abs(normDist - (0.85 + 0.02 * sin(spinPhi * 2.0 - 1.5708)));
  float distBotGlass = abs(normDist - (0.85 - 0.02 * sin(spinPhi * 2.0 - 1.5708)));
  
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
  // Internal caustics wave draped across glass body (conforming to 4-lobed geometry)
  float internalCausticWave = pow(max(0.0, sin(spinPhi * 2.0 - t * 0.65 + normDist * 4.0)), 4.0) * 0.08;
  glassBodyColor += mix(cyanNeon, goldAmber, diagWeight) * internalCausticWave;
  // Blend with physical Fresnel rim brightening (subtle liquid glass sheen):
  glassBodyColor += mix(cyanNeon, goldAmber, diagWeight) * (fresnel * 0.28);
  color += glassBodyColor * insideBlob * 0.30;
  
  // =========================================================================
  // 5. CAUSTIC RIBBONS WITH CHROMATIC PRISM DISPERSION (Inside Blob Volume)
  // =========================================================================
  
  // --- Layer A: Outer Boundary Specular Crest & Glass Wall (Outer 4-Lobed Contour) ---
  float crestR = pow(clamp(1.0 - abs(r * 1.008 - (R_lobe - 0.012)) * 38.0, 0.0, 1.0), 4.0);
  float crestG = pow(clamp(1.0 - distA * 38.0, 0.0, 1.0), 4.0);
  float crestB = pow(clamp(1.0 - abs(r * 0.992 - (R_lobe - 0.012)) * 38.0, 0.0, 1.0), 4.0);
  vec3 prismCrestA = vec3(crestR, crestG, crestB) * 1.7;
  
  float glowA_diff = exp(-distA * 28.0) * 0.35;
  vec3 colA_base = mix(mix(cyanAzure, cyanNeon, 0.75), mix(goldOrange, goldAmber, 0.65), diagWeight * 0.45);
  color += (colA_base * glowA_diff + prismCrestA * 0.65) * insideBlob;
  
  // --- Layer B: Diagonal Warm Amber Caustic Ribbon (rolling in 3D across 4-lobed dome) ---
  float ribbonDist = abs(sin(diagAngle * 0.5));
  float glowB_diff = exp(-ribbonDist * ribbonDist * 12.0) * 0.22 * (0.6 + 0.4 * domeZ);
  vec3 colB_warm = mix(goldOrange, goldAmber, 0.85);
  vec3 colB_cool = cyanDeep * 0.6 + cyanNeon * 0.3;
  vec3 colB = mix(colB_cool, colB_warm, diagWeight);
  color += colB * glowB_diff * (0.40 + 0.60 * diagWeight) * insideBlob;
            
  // --- Layer C: Translucent Sapphire Silk Veil (Soft diffused across 4 lobes) ---
  float glowC_diff = exp(-distC * 10.0) * 0.14;
  vec3 colC = mix(cyanAzure, cyanNeon, 0.72);
  color += colC * glowC_diff * insideBlob;
  
  // --- Layer D (Top Glass Dome Meniscus): Soft Volumetric Glass Veil ---
  float topGlassMask = smoothstep(0.04, 0.30, bp.y) * insideBlob;
  float glowTopDiff = exp(-distTopGlass * 12.0) * 0.22;
  vec3 colTopFold = mix(cyanAzure, cyanNeon, 0.85);
  vec3 topGlassLayer = colTopFold * glowTopDiff * topGlassMask;
  color += topGlassLayer * 0.70;
  
  // --- Layer E (Bottom Glass Veil): Soft Lower Glass Veil ---
  float botGlassMask = smoothstep(-0.04, -0.30, bp.y) * insideBlob;
  float glowBotDiff = exp(-distBotGlass * 12.0) * 0.18;
  vec3 colBotFold = mix(cyanDeep, cyanAzure, 0.75);
  vec3 botGlassLayer = colBotFold * glowBotDiff * botGlassMask;
  color += botGlassLayer * 0.55;
  
  // Apply Top-Down Studio Glass Specular Glaze:
  color += glassTopGlaze * 0.75;
  
  // Subtle facet shimmer travelling gently along the 4-lobed glass body
  float shimmer = pow(max(0.0, sin(spinPhi * 2.0 - t * 0.65 + normDist * 3.0)), 6.0) * 0.15;
  vec3 shimmerCol = mix(cyanNeon, goldAmber, diagWeight);
  color += shimmerCol * shimmer * insideBlob;
  
  // Deep liquid glass center: rich obsidian sapphire & dark cognac bronze absorption
  vec3 liquidSapphire = vec3(0.0006, 0.004, 0.016); // Deep midnight obsidian sapphire
  vec3 liquidBronze   = vec3(0.008, 0.003, 0.0008); // Smoky dark espresso cognac
  vec3 liqBase = mix(liquidSapphire, liquidBronze, diagWeight * 0.75);
  
  // Optical core depth: smooth volumetric 3D dome depth (conforms organically to 4 lobes, zero circular outline)
  float coreDepth = pow(domeZ, 2.0);
  color = mix(color, color * 0.35 + liqBase * 0.30, coreDepth * 0.65);
  
  // =========================================================================
  // 6. MINIMAL COOL DIAMOND DUST & MICRO-FACET SHIMMER (Whisper-Soft Luxury)
  // =========================================================================
  // Exclusively cool, icy diamond & platinum palette (Zero warm/amber tint)
  vec3 starDiamond   = vec3(1.00, 1.00, 1.00); // Pure diamond white
  vec3 starIceCyan   = vec3(0.40, 0.85, 1.00); // Electric ice cyan
  vec3 starPlatinum  = vec3(0.88, 0.94, 1.00); // Cool silver platinum
  vec3 starSoftAzure = vec3(0.35, 0.68, 1.00); // Soft sapphire
  vec3 starFrostBlue = vec3(0.65, 0.86, 1.00); // Pale arctic frost
  vec3 starGlacier   = vec3(0.78, 0.94, 1.00); // Pristine glacier crystalline
  
  // TIER 1: 20 3D ORBITING MICRO-STARS (Crisp, visible needle-diamond sparkle)
  color += starDiamond   * microGlitterStar3D(bp, vec3( 0.16,  0.12,  0.14) + vec3(sin(t * 0.6 + 0.0), cos(t * 0.7 + 0.0), sin(t * 0.8 + 0.0)) * 0.002, spinAngle, 0.024, starTwinkle(t, 1.5, 0.0)) * insideBlob;
  color += starIceCyan   * microGlitterStar3D(bp, vec3( 0.24, -0.14,  0.08) + vec3(sin(t * 0.7 + 1.5), cos(t * 0.8 + 2.3), sin(t * 0.9 + 3.7)) * 0.002, spinAngle, 0.022, starTwinkle(t, 1.8, 1.1)) * insideBlob;
  color += starGlacier   * microGlitterStar3D(bp, vec3( 0.10, -0.22,  0.18) + vec3(sin(t * 0.8 + 3.0), cos(t * 0.9 + 4.6), sin(t * 1.0 + 1.1)) * 0.002, spinAngle, 0.025, starTwinkle(t, 2.1, 2.2)) * insideBlob;
  color += starPlatinum  * microGlitterStar3D(bp, vec3(-0.06,  0.22,  0.12) + vec3(sin(t * 0.6 + 4.5), cos(t * 0.9 + 0.6), sin(t * 0.8 + 4.8)) * 0.002, spinAngle, 0.020, starTwinkle(t, 1.6, 3.3)) * insideBlob;
  color += starSoftAzure * microGlitterStar3D(bp, vec3(-0.22,  0.10,  0.15) + vec3(sin(t * 0.7 + 6.0), cos(t * 0.7 + 2.9), sin(t * 0.9 + 2.2)) * 0.002, spinAngle, 0.026, starTwinkle(t, 1.9, 4.4)) * insideBlob;
  color += starDiamond   * microGlitterStar3D(bp, vec3(-0.18, -0.16,  0.10) + vec3(sin(t * 0.8 + 1.2), cos(t * 0.8 + 5.2), sin(t * 1.0 + 5.9)) * 0.002, spinAngle, 0.022, starTwinkle(t, 2.3, 5.5)) * insideBlob;
  color += starIceCyan   * microGlitterStar3D(bp, vec3(-0.12,  0.02,  0.26) + vec3(sin(t * 0.6 + 2.7), cos(t * 0.9 + 1.2), sin(t * 0.8 + 3.4)) * 0.002, spinAngle, 0.024, starTwinkle(t, 1.7, 6.6)) * insideBlob;
  color += starFrostBlue * microGlitterStar3D(bp, vec3( 0.05,  0.18, -0.12) + vec3(sin(t * 0.7 + 4.2), cos(t * 0.9 + 3.5), sin(t * 0.9 + 0.8)) * 0.002, spinAngle, 0.021, starTwinkle(t, 2.0, 7.7)) * insideBlob;
  color += starGlacier   * microGlitterStar3D(bp, vec3( 0.20, -0.06, -0.16) + vec3(sin(t * 0.8 + 5.7), cos(t * 0.7 + 5.8), sin(t * 1.0 + 4.5)) * 0.002, spinAngle, 0.023, starTwinkle(t, 1.6, 8.8)) * insideBlob;
  color += starDiamond   * microGlitterStar3D(bp, vec3( 0.12,  0.22, -0.10) + vec3(sin(t * 0.6 + 0.9), cos(t * 0.8 + 1.9), sin(t * 0.8 + 1.9)) * 0.002, spinAngle, 0.025, starTwinkle(t, 2.2, 9.9)) * insideBlob;
  color += starPlatinum  * microGlitterStar3D(bp, vec3(-0.16, -0.12, -0.14) + vec3(sin(t * 0.7 + 2.4), cos(t * 0.9 + 4.2), sin(t * 0.9 + 5.6)) * 0.002, spinAngle, 0.022, starTwinkle(t, 1.8, 11.0)) * insideBlob;
  color += starSoftAzure * microGlitterStar3D(bp, vec3(-0.08,  0.16, -0.22) + vec3(sin(t * 0.8 + 3.9), cos(t * 0.9 + 0.2), sin(t * 1.0 + 3.0)) * 0.002, spinAngle, 0.024, starTwinkle(t, 2.1, 12.1)) * insideBlob;
  color += starDiamond   * microGlitterStar3D(bp, vec3( 0.02, -0.12,  0.22) + vec3(sin(t * 0.6 + 1.7), cos(t * 0.7 + 3.2), sin(t * 0.8 + 2.1)) * 0.002, spinAngle, 0.023, starTwinkle(t, 1.7, 13.2)) * insideBlob;
  color += starIceCyan   * microGlitterStar3D(bp, vec3(-0.14,  0.22,  0.06) + vec3(sin(t * 0.7 + 3.1), cos(t * 0.8 + 0.9), sin(t * 0.9 + 4.5)) * 0.002, spinAngle, 0.021, starTwinkle(t, 2.0, 14.3)) * insideBlob;
  color += starPlatinum  * microGlitterStar3D(bp, vec3( 0.22,  0.08, -0.05) + vec3(sin(t * 0.8 + 4.6), cos(t * 0.9 + 5.1), sin(t * 1.0 + 1.8)) * 0.002, spinAngle, 0.025, starTwinkle(t, 1.9, 15.4)) * insideBlob;
  color += starGlacier   * microGlitterStar3D(bp, vec3(-0.25, -0.04,  0.08) + vec3(sin(t * 0.6 + 5.8), cos(t * 0.9 + 2.7), sin(t * 0.8 + 3.9)) * 0.002, spinAngle, 0.022, starTwinkle(t, 2.2, 16.5)) * insideBlob;
  color += starFrostBlue * microGlitterStar3D(bp, vec3( 0.08, -0.18, -0.15) + vec3(sin(t * 0.7 + 0.5), cos(t * 0.7 + 4.1), sin(t * 0.9 + 0.6)) * 0.002, spinAngle, 0.024, starTwinkle(t, 1.6, 17.6)) * insideBlob;
  color += starDiamond   * microGlitterStar3D(bp, vec3(-0.04, -0.22, -0.08) + vec3(sin(t * 0.8 + 2.0), cos(t * 0.8 + 1.4), sin(t * 1.0 + 5.2)) * 0.002, spinAngle, 0.021, starTwinkle(t, 2.4, 18.7)) * insideBlob;
  color += starIceCyan   * microGlitterStar3D(bp, vec3( 0.15, -0.20,  0.10) + vec3(sin(t * 0.6 + 3.8), cos(t * 0.9 + 3.6), sin(t * 0.8 + 2.8)) * 0.002, spinAngle, 0.023, starTwinkle(t, 1.8, 19.8)) * insideBlob;
  color += starPlatinum  * microGlitterStar3D(bp, vec3(-0.10,  0.08, -0.18) + vec3(sin(t * 0.7 + 5.3), cos(t * 0.9 + 5.8), sin(t * 0.9 + 4.1)) * 0.002, spinAngle, 0.022, starTwinkle(t, 2.1, 20.9)) * insideBlob;

  // TIER 2: 22 SUSPENDED MICRO DIAMOND FLECK PINPOINTS (Fine luxury depth)
  color += starIceCyan   * microPoint3D(bp, vec3( 0.12,  0.22,  0.05) + vec3(cos(t * 0.7 + 0.0), sin(t * 0.8 + 0.0), cos(t * 0.6 + 0.0)) * 0.002, spinAngle, dustTwinkle(t, 1.6, 0.0)) * insideBlob;
  color += starPlatinum  * microPoint3D(bp, vec3( 0.18,  0.04,  0.12) + vec3(cos(t * 0.8 + 1.9), sin(t * 0.9 + 3.1), cos(t * 0.7 + 4.5)) * 0.002, spinAngle, dustTwinkle(t, 1.9, 1.2)) * insideBlob;
  color += starGlacier   * microPoint3D(bp, vec3( 0.14, -0.20,  0.06) + vec3(cos(t * 0.9 + 3.8), sin(t * 1.0 + 6.2), cos(t * 0.8 + 2.7)) * 0.002, spinAngle, dustTwinkle(t, 2.2, 2.4)) * insideBlob;
  color += starDiamond   * microPoint3D(bp, vec3( 0.02, -0.15,  0.18) + vec3(cos(t * 0.7 + 5.7), sin(t * 1.0 + 3.0), cos(t * 0.6 + 0.9)) * 0.002, spinAngle, dustTwinkle(t, 1.7, 3.6)) * insideBlob;
  color += starSoftAzure * microPoint3D(bp, vec3(-0.10, -0.22,  0.10) + vec3(cos(t * 0.8 + 1.3), sin(t * 0.8 + 6.1), cos(t * 0.7 + 5.4)) * 0.002, spinAngle, dustTwinkle(t, 2.0, 4.8)) * insideBlob;
  color += starFrostBlue * microPoint3D(bp, vec3(-0.16, -0.08,  0.16) + vec3(cos(t * 0.9 + 3.2), sin(t * 0.9 + 2.9), cos(t * 0.8 + 3.7)) * 0.002, spinAngle, dustTwinkle(t, 2.3, 6.0)) * insideBlob;
  color += starDiamond   * microPoint3D(bp, vec3(-0.22,  0.14,  0.08) + vec3(cos(t * 0.7 + 5.1), sin(t * 1.0 + 6.0), cos(t * 0.6 + 1.9)) * 0.002, spinAngle, dustTwinkle(t, 1.8, 7.2)) * insideBlob;
  color += starIceCyan   * microPoint3D(bp, vec3(-0.08,  0.22,  0.15) + vec3(cos(t * 0.8 + 0.7), sin(t * 1.0 + 2.9), cos(t * 0.7 + 0.1)) * 0.002, spinAngle, dustTwinkle(t, 2.1, 8.4)) * insideBlob;
  color += starGlacier   * microPoint3D(bp, vec3( 0.00,  0.08,  0.22) + vec3(cos(t * 0.9 + 2.6), sin(t * 0.8 + 6.0), cos(t * 0.8 + 4.6)) * 0.002, spinAngle, dustTwinkle(t, 1.6, 9.6)) * insideBlob;
  color += starPlatinum  * microPoint3D(bp, vec3( 0.15, -0.12, -0.08) + vec3(cos(t * 0.7 + 4.5), sin(t * 0.9 + 2.8), cos(t * 0.6 + 2.8)) * 0.002, spinAngle, dustTwinkle(t, 1.9, 10.8)) * insideBlob;
  color += starFrostBlue * microPoint3D(bp, vec3( 0.20,  0.15, -0.06) + vec3(cos(t * 0.8 + 0.2), sin(t * 1.0 + 5.9), cos(t * 0.7 + 1.0)) * 0.002, spinAngle, dustTwinkle(t, 2.2, 12.0)) * insideBlob;
  color += starDiamond   * microPoint3D(bp, vec3( 0.06,  0.22, -0.14) + vec3(cos(t * 0.9 + 2.1), sin(t * 1.0 + 2.7), cos(t * 0.8 + 5.5)) * 0.002, spinAngle, dustTwinkle(t, 1.7, 13.2)) * insideBlob;
  color += starIceCyan   * microPoint3D(bp, vec3(-0.12,  0.18, -0.10) + vec3(cos(t * 0.7 + 4.0), sin(t * 0.8 + 5.8), cos(t * 0.6 + 3.8)) * 0.002, spinAngle, dustTwinkle(t, 2.0, 14.4)) * insideBlob;
  color += starGlacier   * microPoint3D(bp, vec3(-0.18, -0.05, -0.12) + vec3(cos(t * 0.8 + 5.9), sin(t * 0.9 + 2.6), cos(t * 0.7 + 2.0)) * 0.002, spinAngle, dustTwinkle(t, 2.3, 15.6)) * insideBlob;
  color += starPlatinum  * microPoint3D(bp, vec3(-0.06, -0.18, -0.15) + vec3(cos(t * 0.9 + 1.5), sin(t * 1.0 + 5.7), cos(t * 0.8 + 0.2)) * 0.002, spinAngle, dustTwinkle(t, 1.8, 16.8)) * insideBlob;
  color += starDiamond   * microPoint3D(bp, vec3( 0.08, -0.05, -0.18) + vec3(cos(t * 0.7 + 3.4), sin(t * 1.0 + 2.5), cos(t * 0.6 + 4.7)) * 0.002, spinAngle, dustTwinkle(t, 2.1, 18.0)) * insideBlob;
  color += starIceCyan   * microPoint3D(bp, vec3( 0.21, -0.22, -0.05) + vec3(cos(t * 0.8 + 4.2), sin(t * 0.8 + 1.3), cos(t * 0.7 + 3.3)) * 0.002, spinAngle, dustTwinkle(t, 1.7, 19.2)) * insideBlob;
  color += starPlatinum  * microPoint3D(bp, vec3(-0.20,  0.02,  0.18) + vec3(cos(t * 0.9 + 0.8), sin(t * 0.9 + 4.7), cos(t * 0.8 + 5.1)) * 0.002, spinAngle, dustTwinkle(t, 2.0, 20.4)) * insideBlob;
  color += starGlacier   * microPoint3D(bp, vec3( 0.04,  0.12,  0.20) + vec3(cos(t * 0.7 + 2.9), sin(t * 1.0 + 1.9), cos(t * 0.6 + 2.4)) * 0.002, spinAngle, dustTwinkle(t, 2.3, 21.6)) * insideBlob;
  color += starDiamond   * microPoint3D(bp, vec3(-0.05, -0.10,  0.22) + vec3(cos(t * 0.8 + 5.4), sin(t * 0.9 + 3.8), cos(t * 0.7 + 0.7)) * 0.002, spinAngle, dustTwinkle(t, 1.8, 22.8)) * insideBlob;
  color += starFrostBlue * microPoint3D(bp, vec3( 0.17,  0.14,  0.10) + vec3(cos(t * 0.9 + 1.7), sin(t * 0.8 + 5.2), cos(t * 0.8 + 4.2)) * 0.002, spinAngle, dustTwinkle(t, 2.1, 24.0)) * insideBlob;
  color += starSoftAzure * microPoint3D(bp, vec3(-0.14, -0.19, -0.05) + vec3(cos(t * 0.7 + 3.6), sin(t * 1.0 + 0.4), cos(t * 0.6 + 1.8)) * 0.002, spinAngle, dustTwinkle(t, 1.9, 25.2)) * insideBlob;

  // =========================================================================
  // 7. MINIMAL COOL CRYSTAL STAR GLINTS (Crisp Facet Scintillations)
  // =========================================================================
  
  // Glint 1: Upper-left sapphire crest (~10:30)
  vec3 glintPos1 = vec3(-0.18, 0.18, 0.24) + vec3(sin(t * 0.8) * 0.002, cos(t * 0.7) * 0.002, sin(t * 0.6) * 0.002);
  float glint1 = starGlint3D(bp, glintPos1, spinAngle, 0.034, starTwinkle(t, 2.0, 0.0) * 0.55);
  color += mix(starDiamond, starIceCyan, 0.6) * glint1 * insideBlob;
  
  // Glint 2: Lower-right crest (~4:30)
  vec3 glintPos2 = vec3(0.18, -0.14, 0.22) + vec3(cos(t * 0.9) * 0.002, sin(t * 0.8) * 0.002, cos(t * 0.7) * 0.002);
  float glint2 = starGlint3D(bp, glintPos2, spinAngle, 0.032, starTwinkle(t, 1.8, 2.8) * 0.50);
  color += mix(starPlatinum, starIceCyan, 0.5) * glint2 * insideBlob;

  // Glint 3: Upper-right facet fold (~2:00)
  vec3 glintPos3 = vec3(0.20, 0.16, 0.20) + vec3(sin(t * 0.7) * 0.002, cos(t * 0.9) * 0.002, sin(t * 0.8) * 0.002);
  float glint3 = starGlint3D(bp, glintPos3, spinAngle, 0.030, starTwinkle(t, 2.2, 4.2) * 0.48);
  color += mix(starGlacier, starIceCyan, 0.4) * glint3 * insideBlob;

  // Glint 4: Center diamond core jewel (~center)
  vec3 glintPos4 = vec3(-0.02, 0.02, 0.28) + vec3(cos(t * 0.8) * 0.002, sin(t * 0.9) * 0.002, cos(t * 0.6) * 0.002);
  float glint4 = starGlint3D(bp, glintPos4, spinAngle, 0.032, starTwinkle(t, 1.7, 5.5) * 0.52);
  color += starDiamond * glint4 * insideBlob;
  
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
        <div className="relative z-10 w-full h-full max-w-[270px] max-h-[270px] flex items-center justify-center">
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
