import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import './Grainient.css'

type GrainientProps = {
  blendAngle?: number
  blendSoftness?: number
  centerX?: number
  centerY?: number
  className?: string
  color1?: string
  color2?: string
  color3?: string
  colorBalance?: number
  contrast?: number
  gamma?: number
  grainAmount?: number
  grainAnimated?: boolean
  grainScale?: number
  noiseScale?: number
  rotationAmount?: number
  saturation?: number
  timeSpeed?: number
  warpAmplitude?: number
  warpFrequency?: number
  warpSpeed?: number
  warpStrength?: number
  zoom?: number
}

type GrainientContext = {
  mesh: Mesh
  program: Program
  renderer: Renderer
}

const ctxMap = new WeakMap<HTMLDivElement, GrainientContext>()

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);

  vec3 colLav=uColor1;
  vec3 colOrg=uColor2;
  vec3 colDark=uColor3;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;
  vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
  vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));

  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);}
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;

  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);

  o=vec4(col,1.0);
}
void main(){
  vec4 o=vec4(0.0);
  mainImage(o,gl_FragCoord.xy);
  fragColor=o;
}
`

export default function Grainient({
  blendAngle = 0,
  blendSoftness = 0.05,
  centerX = 0,
  centerY = 0,
  className = '',
  color1 = '#a6bcff',
  color2 = '#4f74ff',
  color3 = '#09101f',
  colorBalance = 0.1,
  contrast = 1.35,
  gamma = 0.85,
  grainAmount = 0.09,
  grainAnimated = true,
  grainScale = 1.25,
  noiseScale = 2,
  rotationAmount = 380,
  saturation = 1,
  timeSpeed = 1.4,
  warpAmplitude = 58,
  warpFrequency = 5.8,
  warpSpeed = 0.6,
  warpStrength = 1.2,
  zoom = 0.82,
}: GrainientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const renderer = new Renderer({
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      webgl: 2,
    })

    const gl = renderer.gl
    const canvas = gl.canvas
    canvas.style.display = 'block'
    canvas.style.height = '100%'
    canvas.style.width = '100%'
    container.appendChild(canvas)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      fragment,
      uniforms: {
        iResolution: { value: new Float32Array([1, 1]) },
        iTime: { value: 0 },
        uBlendAngle: { value: 0 },
        uBlendSoftness: { value: 0.05 },
        uCenterOffset: { value: new Float32Array([0, 0]) },
        uColor1: { value: new Float32Array([1, 1, 1]) },
        uColor2: { value: new Float32Array([1, 1, 1]) },
        uColor3: { value: new Float32Array([1, 1, 1]) },
        uColorBalance: { value: 0 },
        uContrast: { value: 1.5 },
        uGamma: { value: 1 },
        uGrainAmount: { value: 0.1 },
        uGrainAnimated: { value: 0 },
        uGrainScale: { value: 2 },
        uNoiseScale: { value: 2 },
        uRotationAmount: { value: 500 },
        uSaturation: { value: 1 },
        uTimeSpeed: { value: 0.25 },
        uWarpAmplitude: { value: 50 },
        uWarpFrequency: { value: 5 },
        uWarpSpeed: { value: 2 },
        uWarpStrength: { value: 1 },
        uZoom: { value: 0.9 },
      },
      vertex,
    })

    const mesh = new Mesh(gl, { geometry, program })
    ctxMap.set(container, { mesh, program, renderer })

    const setSize = () => {
      const rect = container.getBoundingClientRect()
      const width = Math.max(1, Math.floor(rect.width))
      const height = Math.max(1, Math.floor(rect.height))
      renderer.setSize(width, height)
      const resolution = program.uniforms.iResolution.value as Float32Array
      resolution[0] = gl.drawingBufferWidth
      resolution[1] = gl.drawingBufferHeight
      renderer.render({ scene: mesh })
    }

    const resizeObserver = new ResizeObserver(setSize)
    resizeObserver.observe(container)
    setSize()

    let frame = 0
    let visible = true
    let pageVisible = !document.hidden
    const start = performance.now()

    const loop = (time: number) => {
      program.uniforms.iTime.value = (time - start) * 0.001
      renderer.render({ scene: mesh })
      frame = requestAnimationFrame(loop)
    }

    const startLoop = () => {
      if (visible && pageVisible && frame === 0) {
        frame = requestAnimationFrame(loop)
      }
    }

    const stopLoop = () => {
      if (frame !== 0) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    }

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {
        startLoop()
      } else {
        stopLoop()
      }
    })

    intersectionObserver.observe(container)

    const onVisibilityChange = () => {
      pageVisible = !document.hidden
      if (pageVisible) {
        startLoop()
      } else {
        stopLoop()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    startLoop()

    return () => {
      stopLoop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      ctxMap.delete(container)
      container.removeChild(canvas)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const context = ctxMap.get(container)
    if (!context) {
      return
    }

    const uniforms = context.program.uniforms
    uniforms.uBlendAngle.value = blendAngle
    uniforms.uBlendSoftness.value = blendSoftness
    uniforms.uCenterOffset.value = new Float32Array([centerX, centerY])
    uniforms.uColor1.value = new Float32Array(hexToRgb(color1))
    uniforms.uColor2.value = new Float32Array(hexToRgb(color2))
    uniforms.uColor3.value = new Float32Array(hexToRgb(color3))
    uniforms.uColorBalance.value = colorBalance
    uniforms.uContrast.value = contrast
    uniforms.uGamma.value = gamma
    uniforms.uGrainAmount.value = grainAmount
    uniforms.uGrainAnimated.value = grainAnimated ? 1 : 0
    uniforms.uGrainScale.value = grainScale
    uniforms.uNoiseScale.value = noiseScale
    uniforms.uRotationAmount.value = rotationAmount
    uniforms.uSaturation.value = saturation
    uniforms.uTimeSpeed.value = timeSpeed
    uniforms.uWarpAmplitude.value = warpAmplitude
    uniforms.uWarpFrequency.value = warpFrequency
    uniforms.uWarpSpeed.value = warpSpeed
    uniforms.uWarpStrength.value = warpStrength
    uniforms.uZoom.value = zoom
  }, [
    blendAngle,
    blendSoftness,
    centerX,
    centerY,
    color1,
    color2,
    color3,
    colorBalance,
    contrast,
    gamma,
    grainAmount,
    grainAnimated,
    grainScale,
    noiseScale,
    rotationAmount,
    saturation,
    timeSpeed,
    warpAmplitude,
    warpFrequency,
    warpSpeed,
    warpStrength,
    zoom,
  ])

  return (
    <div
      className={`grainient-container ${className}`.trim()}
      ref={containerRef}
    />
  )
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  if (!result) {
    return [1, 1, 1]
  }

  return [
    Number.parseInt(result[1], 16) / 255,
    Number.parseInt(result[2], 16) / 255,
    Number.parseInt(result[3], 16) / 255,
  ]
}
