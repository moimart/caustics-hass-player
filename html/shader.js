//const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    console.log(canvas.width + ' x ' + canvas.height);
    gl.viewport(0, 0, canvas.width, canvas.height);
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

const fragmentShaderSourceVideo = `
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_videoTexture;
uniform vec3 u_lightColor;
uniform float u_time;
void main() {
    gl_FragColor = texture2D(u_videoTexture, v_texCoord) + vec4(u_lightColor*vec3(0.5),1.0);
}
`;

const fragmentShaderSource = `
#define TAU 6.28318530718
#define MAX_ITER 5

precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_videoTexture;
uniform vec3 u_lightColor;
uniform float u_time;

void main() {
    float time = u_time * .5+23.0;
    // uv should be the 0-1 uv of texture...
    vec2 uv = v_texCoord.xy;

    vec2 p = mod(uv*TAU, TAU)-250.0;

    vec2 i = vec2(p);
    float c = 1.0;
    float inten = .005;

    for (int n = 0; n < MAX_ITER; n++) 
    {
        float t = time * (1.0 - (3.5 / float(n+1)));
        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
        c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
    }
    c /= float(MAX_ITER);
    c = 1.17-pow(c, 1.4);
    vec3 color = vec3(pow(abs(c), 8.0));
    color = clamp(color + vec3(0.0), 0.0, 1.0);

    gl_FragColor = vec4(color+(vec3(u_lightColor)*vec3(0.5)), 1.0);
}
`

const vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_position * 0.5 + 0.5;
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

function setupVideo(color) {
    let doLerp = false;
    let newColor = color;
    let deltaTime = 0.0;

    function lerp(a, b, dt) {
        return a + (b - a) * dt;
    }
    
    function lerpVec3(vecA, vecB, dt) {
        return [
            lerp(vecA[0], vecB[0], dt),
            lerp(vecA[1], vecB[1], dt),
            lerp(vecA[2], vecB[2], dt)
        ];
    }
    
    setInterval(async () => {
        newColor = await getColorOfLight();
        doLerp = !(newColor[0] == color[0] && newColor[1] == color[1] && newColor[2] == color[2]);
    }, 10000);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        1, 1
    ]), gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    const videoTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, videoTexture);

    const u_vec3ColorLocation = gl.getUniformLocation(program, "u_lightColor");
    const u_timeLocation = gl.getUniformLocation(program, "u_time");

    let startTime = performance.now();
    
    function render() {
        let currentTime = performance.now();
        let elapsedTime = (currentTime - startTime) / 1000.0;  // Convert to seconds
    
        gl.uniform1f(u_timeLocation, elapsedTime);

        /* In case you want to sample a video
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            gl.bindTexture(gl.TEXTURE_2D, videoTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }*/

        if (doLerp) {
            deltaTime += 0.01;
            deltaColor = lerpVec3(color, newColor, deltaTime);
            if (deltaTime >= 1.0) {
                deltaTime = 0.0;
                doLerp = false;
                color = newColor;
            }

            gl.uniform3f(u_vec3ColorLocation, deltaColor[0], deltaColor[1], deltaColor[2]);
        } else {
            gl.uniform3f(u_vec3ColorLocation, color[0], color[1], color[2]);
        }
    
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
        requestAnimationFrame(render);
    }

    render();
    //video.play();
}

