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

void main() {
    vec2 texelSize = uInputSize.zw;
    float gridSize = 4.0;

    vec2 pixelCoord = vTextureCoord / texelSize;
    vec2 gridCoord = floor(pixelCoord / gridSize) * gridSize + gridSize * 0.5;
    vec2 snappedUV = gridCoord * texelSize;

    vec4 color = texture(uTexture, snappedUV);

    float col = mod(gl_FragCoord.x, 4.0);
    vec3 mask;
    if (col < 1.0) mask = vec3(1.0, 0.2, 0.2);
    else if (col < 2.0) mask = vec3(0.2, 1.0, 0.2);
    else if (col < 3.0) mask = vec3(0.2, 0.2, 1.0);
    else mask = vec3(0.4, 0.4, 0.4);

    float rowInCell = mod(pixelCoord.y, gridSize);
    float rowFade = rowInCell < gridSize - 1.0 ? 1.0 : 0.6;

    finalColor = vec4(color.rgb * mask * rowFade, color.a);
}
`

export function createLcdFilter(): Filter {
  return new Filter({
    glProgram: GlProgram.from({ vertex, fragment }),
  })
}
