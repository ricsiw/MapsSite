precision highp float;

vec4 color;
float pointranges[5];
float points[1024];
int pointCount = 0;

varying vec2 vTexCoord;

void main() {
  //gl_FragColor = vec4(vTexCoord.x, vTexCoord.y, 1, 0.1);
  gl_FragColor = vec4(1, 0, 0, 0.000000001);
}