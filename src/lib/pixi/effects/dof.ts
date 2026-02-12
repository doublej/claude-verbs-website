import { Filter, GlProgram } from 'pixi.js'

const vertex = /* glsl */ `
in vec2 aPosition;
out vec2 vTextureCoord;

uniform highp vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition(void) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(void) {
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void) {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`

const fragment = /* glsl */ `
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform highp vec4 uInputSize;
uniform float uStrength;
uniform float uMaxRadius;
uniform float uFalloffStart;
uniform float uDirectionAngle;

vec4 tap(sampler2D tex, vec2 uv, vec2 off, vec2 texel, float r) {
    return texture(tex, uv + off * r * texel);
}

void main() {
    vec2 dir = vec2(cos(uDirectionAngle), sin(uDirectionAngle));
    vec2 offset = vTextureCoord - 0.5;
    float dist = dot(offset, dir) + 0.5;
    float t = smoothstep(uFalloffStart, 1.0, dist);
    float radius = t * uStrength * uMaxRadius;

    if (radius < 0.5) {
        finalColor = texture(uTexture, vTextureCoord);
        return;
    }

    vec2 tx = uInputSize.zw;
    vec2 uv = vTextureCoord;
    vec4 col = texture(uTexture, uv);
    col += tap(uTexture, uv, vec2(-0.326, -0.406), tx, radius);
    col += tap(uTexture, uv, vec2(-0.840, -0.074), tx, radius);
    col += tap(uTexture, uv, vec2(-0.696,  0.457), tx, radius);
    col += tap(uTexture, uv, vec2(-0.203,  0.621), tx, radius);
    col += tap(uTexture, uv, vec2( 0.962, -0.195), tx, radius);
    col += tap(uTexture, uv, vec2( 0.473, -0.480), tx, radius);
    col += tap(uTexture, uv, vec2( 0.519,  0.767), tx, radius);
    col += tap(uTexture, uv, vec2( 0.185, -0.893), tx, radius);
    col += tap(uTexture, uv, vec2( 0.507,  0.064), tx, radius);
    col += tap(uTexture, uv, vec2( 0.896,  0.412), tx, radius);
    col += tap(uTexture, uv, vec2(-0.322, -0.933), tx, radius);
    col += tap(uTexture, uv, vec2(-0.792, -0.598), tx, radius);
    finalColor = col / 13.0;
}
`

export interface DofFilter extends Filter {
  _strength: number
  _maxRadius: number
  _falloffStart: number
  _directionAngle: number
}

export function createDofFilter(): DofFilter {
  const filter = new Filter({
    glProgram: GlProgram.from({ vertex, fragment }),
    resources: {
      dofUniforms: {
        uStrength: { value: 0, type: 'f32' },
        uMaxRadius: { value: 10, type: 'f32' },
        uFalloffStart: { value: 0.15, type: 'f32' },
        uDirectionAngle: { value: Math.PI / 2, type: 'f32' },
      },
    },
  }) as DofFilter

  filter._strength = 0
  filter._maxRadius = 10
  filter._falloffStart = 0.15
  filter._directionAngle = 90
  filter.enabled = false

  return filter
}

export function updateDofUniforms(f: DofFilter): void {
  const res = f.resources.dofUniforms as { uniforms: Record<string, number> }
  res.uniforms.uStrength = f._strength
  res.uniforms.uMaxRadius = f._maxRadius
  res.uniforms.uFalloffStart = f._falloffStart
  res.uniforms.uDirectionAngle = (f._directionAngle * Math.PI) / 180
}
