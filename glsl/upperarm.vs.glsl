uniform float gemRadius;

void main() {
    // Multiply each vertex by the model, view matrix and projection matrices to get final image vertex position
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}