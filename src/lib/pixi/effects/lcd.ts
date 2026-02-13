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
uniform float uIsLight;

void main() {
    vec2 texelSize = uInputSize.zw;
    float gridSize = 4.0;

    vec2 pixelCoord = vTextureCoord / texelSize;
    vec2 gridCoord = floor(pixelCoord / gridSize) * gridSize + gridSize * 0.5;
    vec2 snappedUV = gridCoord * texelSize;

    vec4 color = texture(uTexture, snappedUV);

    float col = mod(gl_FragCoord.x, 4.0);
    vec3 mask;
    vec3 darkR = vec3(1.0, 0.2, 0.2);
    vec3 darkG = vec3(0.2, 1.0, 0.2);
    vec3 darkB = vec3(0.2, 0.2, 1.0);
    vec3 darkW = vec3(0.4, 0.4, 0.4);
    vec3 lightR = vec3(0.95, 0.6, 0.6);
    vec3 lightG = vec3(0.6, 0.95, 0.6);
    vec3 lightB = vec3(0.6, 0.6, 0.95);
    vec3 lightW = vec3(0.85, 0.85, 0.85);
    if (col < 1.0) mask = mix(darkR, lightR, uIsLight);
    else if (col < 2.0) mask = mix(darkG, lightG, uIsLight);
    else if (col < 3.0) mask = mix(darkB, lightB, uIsLight);
    else mask = mix(darkW, lightW, uIsLight);

    float rowInCell = mod(pixelCoord.y, gridSize);
    float rowFadeDark = rowInCell < gridSize - 1.0 ? 1.0 : 0.6;
    float rowFadeLight = rowInCell < gridSize - 1.0 ? 0.97 : 0.85;
    float rowFade = mix(rowFadeDark, rowFadeLight, uIsLight);

    vec3 lcdColor = color.rgb * mask * rowFade;
    vec3 blended = mix(lcdColor, color.rgb, 0.25 * uIsLight);
    finalColor = vec4(blended, color.a);
}
`

export interface LcdFilter extends Filter {
  _isLightTheme: number
}

export function createLcdFilter(isLightTheme: boolean): LcdFilter {
  const filter = new Filter({
    glProgram: GlProgram.from({ vertex, fragment }),
    resources: {
      lcdUniforms: {
        uIsLight: { value: isLightTheme ? 1 : 0, type: 'f32' },
      },
    },
  }) as LcdFilter
  filter._isLightTheme = isLightTheme ? 1 : 0
  return filter
}
