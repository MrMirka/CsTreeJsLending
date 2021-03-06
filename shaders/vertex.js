const sparkVertexShader = `
                uniform mat4 projectionMatrix;
                uniform mat4 viewMatrix;
                uniform mat4 modelMatrix;
                uniform float uTime;
                attribute vec3 position;
                attribute vec2 uv;
                varying vec2 vUv;


                void main()
                {   
                    vUv = uv;
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    vec4 viewPosition =  viewMatrix * modelPosition;
                    vec4 projectionPosition = projectionMatrix * viewPosition ;
                    gl_Position = projectionPosition;
                }`
export {sparkVertexShader}