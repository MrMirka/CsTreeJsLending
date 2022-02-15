import * as THREE from './three/build/three.module.js'
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'
import { FirstPersonControls} from './three/examples/jsm/controls/FirstPersonControls.js'
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from './three/examples/jsm/loaders/DRACOLoader.js'
import { RGBELoader } from './three/examples/jsm/loaders/RGBELoader.js'
import Stats  from './three/examples/jsm/libs/stats.module.js'
import * as dat from './lib/dat.gui.module.js'
import { RectAreaLightHelper } from './lib/RectAreaLightHelper.js';

//Postprocessing
import { EffectComposer } from './three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from './three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from './three/examples/jsm/postprocessing/ShaderPass.js'
import { FilmPass } from './three/examples/jsm/postprocessing/FilmPass.js'
import { RGBShiftShader } from './three/examples/jsm/shaders/RGBShiftShader.js'


let mixer, model

const cursor = {
    x: 0,
    y: 0
}

const smoke = {
    particles: [],
    particleCount: 30,
    velocity: 0.003,
    FPS: 33
}

let points = []
let pObj

const gui = new dat.GUI()
const debugObj = {}

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

/**
 * Fog
 */
const fogParam = {
    color: 0xd40000,
    density: 0.115
}
const fog = new THREE.FogExp2(fogParam.color, fogParam.density)
scene.fog = fog
let sceneFog = gui.addFolder('FOG2')
sceneFog.add(fog, 'density').min(0).max(1).step(0.001).name('FogDensity')
sceneFog.addColor(fogParam, 'color').onChange(() => {
    fog.color.set(fogParam.color)
 })
 sceneFog.open()

 /**
  * Smoke
  */
const smokeTexture = new THREE.TextureLoader().load('./img/smoke2.png')
//const smokeTexture = new THREE.TextureLoader().load('./img/smokeAlpha.jpg')

const smokeGeo = new THREE.PlaneGeometry(3,3)
const smokeMat = new THREE.MeshBasicMaterial({
    //color: 0xCABABA,
    map:smokeTexture,
    //alphaMap: smokeTexture,
    transparent: true,
})
smokeMat.depthWrite = false
//smokeMat.blending = THREE.AdditiveBlending
//smokeMat.blending = THREE.AdditiveAnimationBlendMode


/**
 * Enviroment
 */
const url_1 = './textures/enviroment/studio_small_09_1k.pic'
const url_2 = './textures/enviroment/venetian_crossroads_1k.pic'
const url_3 = './textures/enviroment/colosseum_1k.pic'
const rgbloader = new RGBELoader()
rgbloader.load(url_3,texture => {
     texture.encoding = THREE.sRGBEncoding
     texture.mapping = THREE.EquirectangularRefractionMapping;
     texture.wrapS = THREE.RepeatWrapping;
     texture.wrapP = THREE.RepeatWrapping;
     texture.repeat.set( 1, 1 );
     scene.environment = texture
 })

 

/**
 * Update AllMaterial
 */
 const updateAllmaterial = () => {
    scene.traverse(child => {
        if(child instanceof THREE.SkinnedMesh && child.material instanceof THREE.MeshStandardMaterial){
            child.material.envMapIntensity = debugObj.envMapIntensity
            child.material.needsUpdate = true
            child.material.castShadow = true
            child.material.receiveShadow = true
            child.receiveShadow = true
            child.castShadow = true
            child.material.shadowSide = THREE.DoubleSide
        }
        
    })
}

let cameraRig = new THREE.Group()
scene.add(cameraRig)

const param = {
    width: window.innerWidth,
    height: window.innerHeight,
    smokeWidth: 6,
    smokeHeight: 3
}

window.addEventListener('mousemove', (event) =>
{   
    cursor.x = ( event.clientX - param.width / 2 ) * 0.0004
    cursor.y = ( event.clientY - param.height / 2 ) * 0.0004
})

const camera = new THREE.PerspectiveCamera(45, param.width / param.height, 0.1 , 100)
camera.position.x = 0.14
camera.position.z = 3.3
camera.position.y = 1.13

let uiCamera = gui.addFolder('Camera')
uiCamera.add(camera,'fov').min(10).max(100).name('cameraFOV')
uiCamera.add(camera.position,'x').min(-10).max(10).step(0.001).name('cameraX')
uiCamera.add(camera.position,'y').min(-10).max(10).step(0.001).name('cameraY')
uiCamera.add(camera.position,'z').min(-10).max(10).step(0.001).name('cameraZ')
uiCamera.open()

scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})

renderer.setSize(param.width, param.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.logarithmicDepthBuffer = true


gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    ReinHard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ASECFilmic: THREE.ACESFilmicToneMapping
}).onFinishChange(()=> {
    renderer.toneMapping = Number(renderer.toneMapping)
    updateAllmaterial()
})
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001).name('toneExposure')




debugObj.envMapIntensity = 0.0931
gui.add(debugObj, 'envMapIntensity').min(0).max(0.5).step(0.0001).onChange(updateAllmaterial)


/**
 * Orbit
 */
//const control = new OrbitControls(camera, renderer.domElement)


/**
 * Add compose
 */
const compose = new EffectComposer(renderer)
compose.addPass( new RenderPass( scene, camera ) )

const grbShaderPass = RGBShiftShader
const rgbShiftPass = new ShaderPass(grbShaderPass)
//compose.addPass(rgbShiftPass)

//Noise shader
var vertShader = document.getElementById('vertexShader').textContent;
var fragShader = document.getElementById('fragmentShader').textContent;
var counter = 0.0;
var myEffect = {
  uniforms: {
    "tDiffuse": { value: null },
    "amount": { value: counter }
  },
  vertexShader: vertShader,
  fragmentShader: fragShader
}

var customPass = new ShaderPass(myEffect);
customPass.renderToScreen = true;
//compose.addPass(customPass);

//Filmic
let filmPass = new FilmPass(0.22, 0.0025, 1648, false)
compose.addPass(filmPass)



/**
 * Event Lisitener
 */

 window.addEventListener('resize', () =>
 {
     // Update sizes
     param.width = window.innerWidth
     param.height = window.innerHeight
 
     // Update camera
     camera.aspect = param.width / param.height
     camera.updateProjectionMatrix()
 
     // Update renderer
     renderer.setSize(param.width, param.height)
     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
     //renderer.setPixelRatio(2)
 })


/**
 * Ligth
 */
const lightParameters = {
    point1_Color: 0xff0000,
    point2_Color: 0xffffff,
    point3_Color: 0xffffff,
    point4_Color: 0xffffff,
    //Rectangle_Color: 0xffffff,
}
 const pontLight = new THREE.PointLight( lightParameters.point1_Color, 28.137 )
 pontLight.position.set(-1.14,0.81,-0.06)
 pontLight.distance = 1.565
 pontLight.decay = 0.914
 scene.add( pontLight )
 gui.addColor(lightParameters, 'point1_Color').onChange(() => {
    pontLight.color.set(lightParameters.point1_Color)
 })
 gui.add(pontLight.position,'x').min(-10).max(10).step(0.03).name('lPoint1_X')
 gui.add(pontLight.position,'y').min(-10).max(10).step(0.03).name('lPoint1_Y')
 gui.add(pontLight.position,'z').min(-10).max(10).step(0.03).name('lPoint1_Z')
 gui.add(pontLight,'intensity').min(0).max(50).step(0.001).name('lPoint1_intensity')
 gui.add(pontLight,'distance').min(0).max(30).step(0.001).name('lPoint1_distance')
 gui.add(pontLight,'decay').min(0).max(30).step(0.001).name('lPoint1_decay')



 const pontLight1 = new THREE.PointLight( lightParameters.point2_Color, 7 )
 pontLight1.position.set( 0.36, 0.81, 1.71 )
 pontLight1.distance = 2.9258
 pontLight1.dacay = 1.951
 scene.add( pontLight1 )

 gui.addColor(lightParameters, 'point2_Color').onChange(() => {
    pontLight1.color.set(lightParameters.point2_Color)
 })
 gui.add(pontLight1.position,'x').min(-10).max(10).step(0.03).name('lPoint2_X')
 gui.add(pontLight1.position,'y').min(-10).max(10).step(0.03).name('lPoint2_Y')
 gui.add(pontLight1.position,'z').min(-10).max(10).step(0.03).name('lPoint2_Z')
 gui.add(pontLight1,'intensity').min(0).max(70).step(0.001).name('lPoint2_intensity')
 gui.add(pontLight1,'distance').min(0).max(30).step(0.0001).name('lPoint2_distance')
 gui.add(pontLight1,'decay').min(0).max(20).step(0.001).name('lPoint2_decay')

 const pontLight3 = new THREE.PointLight( lightParameters.point3_Color, 9.928 )
 pontLight3.position.set(-1.035,3.84,0.294)
 pontLight3.castShadow = true
 pontLight3.shadow.mapSize.width = 2048
 pontLight3.shadow.mapSize.height = 2048
 pontLight3.shadow.normalBias = 0.05
 pontLight3.distance = 3.725
 pontLight3.decay = 0
 scene.add( pontLight3 )

 gui.addColor(lightParameters, 'point3_Color').onChange(() => {
    pontLight3.color.set(lightParameters.point3_Color)
 })
 gui.add(pontLight3.position,'x').min(-20).max(20).step(0.003).name('lPoint3_X')
 gui.add(pontLight3.position,'y').min(-20).max(20).step(0.003).name('lPoint3_Y')
 gui.add(pontLight3.position,'z').min(-20).max(20).step(0.003).name('lPoint3_Z')
 gui.add(pontLight3,'intensity').min(0).max(70).step(0.001).name('lPoint3_intensity')
 gui.add(pontLight3,'distance').min(0).max(70).step(0.001).name('lPoint3_distance')
 gui.add(pontLight3,'decay').min(0).max(70).step(0.001).name('lPoint3_decay')

 //const pontLight4 = new THREE.PointLight( lightParameters.point2_Color, 20 )
 const pontLight4 = new THREE.SpotLight( lightParameters.point2_Color, 20 )
 pontLight4.position.set(1.,1.4,-1.4)
 pontLight4.decay = 1
 pontLight4.angle = 0.8185
 pontLight4.penumbra = 0.2858
 scene.add( pontLight4 )

 gui.addColor(lightParameters, 'point2_Color').onChange(() => {
    pontLight4.color.set(lightParameters.point4_Color)
 })
 gui.add(pontLight4.position,'x').min(-10).max(10).step(0.03).name('lPoint4_X')
 gui.add(pontLight4.position,'y').min(-10).max(10).step(0.03).name('lPoint4_Y')
 gui.add(pontLight4.position,'z').min(-10).max(10).step(0.03).name('lPoint4_Z')
 gui.add(pontLight4,'intensity').min(0).max(20).step(0.001).name('lPoint4_intensity')
 gui.add(pontLight4,'distance').min(0).max(20).step(0.001).name('lPoint4_distance')
 gui.add(pontLight4,'decay').min(0).max(20).step(0.001).name('lPoint4_decay')
 gui.add(pontLight4,'angle').min(0).max(Math.PI * 0.4).step(0.0001).name('lPoint4_angle')
 gui.add(pontLight4,'penumbra').min(0).max(1).step(0.0001).name('lPoint4_penumbra')

/* const spotLightHelper = new THREE.SpotLightHelper( pontLight4 );
scene.add( spotLightHelper ); */

//const sphereSize = 0.3;
/* const pointLightHelper = new THREE.PointLightHelper( pontLight3, sphereSize, 0xff0000 );
scene.add( pointLightHelper ); 

/* const cameraHelper = new THREE.CameraHelper(pontLight3.shadow.camera);
scene.add(cameraHelper);
 */

/* const sphereSize = 0.3;
const pointLightHelper = new THREE.PointLightHelper( pontLight, sphereSize, 0xff0000 );
scene.add( pointLightHelper );

const pointLightHelper1 = new THREE.PointLightHelper( pontLight1, sphereSize, 0xff0000 );
scene.add( pointLightHelper1 ); */

//RECT Ligth
/* const width = 3;
const height = 3;
const intensity = 11.719;
const rectLight = new THREE.RectAreaLight( lightParameters.Rectangle_Color, intensity,  width, height );
rectLight.position.set( -1.153, 4.2, .9 );
rectLight.rotation.x = -1.6
//rectLight.lookAt( 0, 3, 0 );


scene.add( rectLight )
gui.addColor(lightParameters, 'Rectangle_Color').onChange(() => {
    rectLight.color.set(lightParameters.Rectangle_Color)
 })
gui.add(rectLight.position,'x').min(-10).max(10).step(0.001).name('rectangleL_X')
gui.add(rectLight.position,'y').min(-10).max(10).step(0.001).name('rectangleL_Y')
gui.add(rectLight.position,'z').min(-10).max(10).step(0.001).name('rectangleL_Z')
gui.add(rectLight.rotation, 'x').min(-Math.PI / 2).max(Math.PI / 2).step(0.001).name('rectangleL_ROT')
gui.add(rectLight,'intensity').min(0).max(100).step(0.001).name('rectangleL_intensity')

const rectLightHelper = new RectAreaLightHelper( rectLight );
rectLight.add( rectLightHelper ); */
 


 /**
  * Model loader - Character model
  */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./lib/draco/')
const gltfLoaderSol = new GLTFLoader()
//gltfLoaderSol.setDRACOLoader(dracoLoader)
//gltfLoaderSol.load('./models/compress_vertion/character.gltf', gltf => {
gltfLoaderSol.load('./models/character/character.gltf', gltf => {
    model = gltf.scene
    model.scale.set(2.9,2.9,2.9)
    model.position.set(0,-3,0)
    model.rotation.y = .6
    cameraRig.add(model)
    cameraRig.add(camera)

    //Animate RIG
    const animations = gltf.animations;
    mixer = new THREE.AnimationMixer( model );
    mixer.clipAction(animations[0]).play()
    scene.add(model)

    updateAllmaterial()
 })

 /**
 * ADD BACKGROUND
 */
  const textPlane = new THREE.TextureLoader()
  textPlane.load('./img/background_v3.png', tex => {
     tex.magFilter = THREE.NearestFilter;
     tex.wrapT = THREE.RepeatWrapping;
     tex.wrapS = THREE.RepeatWrapping;
     tex.repeat.set( 1, 1 );
     const backPlane = new THREE.PlaneGeometry(10,4.6)
     const matPlane = new THREE.MeshBasicMaterial({
         map:tex
     })
     const meshPlane = new THREE.Mesh(backPlane, matPlane)
     meshPlane.position.set(2,1.2,-0.936)
     gui.add(meshPlane.position,'x').min(-10).max(10).step(0.001).name('back_X')
     gui.add(meshPlane.position,'y').min(-10).max(10).step(0.001).name('back_Y')
     gui.add(meshPlane.position,'z').min(-10).max(10).step(0.001).name('back_Z')
     //cameraRig.add(meshPlane)
 })
 

 /**
  * Add text
  */
 const fontloader = new GLTFLoader()
 fontloader.load('./models/font/font.gltf',gltf => {
    const text = gltf.scene
    text.position.set(1,0,-100)
    text.scale.set(200,200,200)
    
    let vector = new THREE.Vector3()
    gltf.scene.traverse( function( node ) {

        if(node.isMesh) {
            let position = node.geometry.attributes.position
            for (let i = 0; i < position.count; i++){
                vector.fromBufferAttribute(position, i)
                points.push(vector.clone())
              }
        }
        const pointTexture = new THREE.TextureLoader().load('./img/bb.png')
        let geo = new THREE.BufferGeometry().setFromPoints(points)
        let mat = new THREE.PointsMaterial({map: pointTexture, size: 1.5});
        pObj = new THREE.Points(geo, mat)
        pObj.scale.set(120,120,120)
        pObj.position.set(1,0,-120)
        //cameraRig.add(pObj)
    })
 })



renderer.render(scene, camera)

const clock = new THREE.Clock()

let stats = new Stats();
document.body.appendChild( stats.dom );

initSmoke()

const tick = () => {
    const elapsedTime = clock.getDelta()

    counter += 0.000001;
    customPass.uniforms["amount"].value = counter;


    /**
     * 100% part
     */
   /*  if(pObj!=undefined) {
        const positions = pObj.geometry.attributes.position.array
        const count = positions.length / 3;
        for(let i=0; i < count; i++) {
            let i3 = i * 3
            const x = pObj.geometry.attributes.position.array[i3]
            pObj.geometry.attributes.position.array[i3 + 2] =  pObj.geometry.attributes.position.array[i3 + 2] + cursor.x * 0.1 * Math.random()
        }
        pObj.geometry.attributes.position.needsUpdate = true; 
    } */
    
   

   
     cameraRig.rotation.x += ( -cursor.y * 0.2 - cameraRig.rotation.x ) * .05
	 cameraRig.rotation.y += ( - cursor.x  * 0.2 - cameraRig.rotation.y ) * .03
	

    //rgbShiftPass.uniforms["amount"].value = cameraRig.rotation.y * 0.02
    

    if(mixer) {
		mixer.update( elapsedTime );
	}

    update()

    stats.update()
    //control.update()
    camera.updateProjectionMatrix()
    
    //renderer.render(scene, camera)
    compose.render(elapsedTime)
    requestAnimationFrame(tick)
}
tick()

/**
 * Particle
 */
 function Particle(geo, mat) {

    this.x = 0;
    this.y = 0;
    this.sprite = new THREE.Mesh(geo, mat)

    this.xVelocity = 0;
    this.yVelocity = 0;

    this.radius = 51;

    this.draw = function(){
        let sprite
        //scene.add(this.sprite)
        cameraRig.add(this.sprite)
    }


    this.update = function() {
        this.x += this.xVelocity;
        this.y += this.yVelocity;
        

        if (this.x >= param.smokeWidth) {
            this.xVelocity = -this.xVelocity;
            this.x = param.smokeWidth;
        }
        else if (this.x <= 0) {
            this.xVelocity = -this.xVelocity;
            this.x = 0;
        }

        if (this.y >= param.smokeHeight) {
            this.yVelocity = -this.yVelocity;
            this.y = param.smokeHeight;
        }
        
        else if (this.y <= -0.5) {
            this.yVelocity = -this.yVelocity;
            this.y = -0.5;
        }
        
        this.sprite.position.set(this.x - param.smokeWidth / 2,this.y)
        //this.sprite.rotation.z += 0.001
    };

    this.setPosition = function(x, y) {
        this.x = x
        this.y = y
        this.sprite.position.set(x,y,-2 + Math.random() * 0.001)
        
    };

    this.setVelocity = function(x, y) {
        this.xVelocity = x;
        this.yVelocity = y;
    };
}


function generateRandom(min, max){
    return Math.random() * (max - min) + min;
    //return Math.random() - 0.5;
}

function update() {
    
    smoke.particles.forEach(function(particle) {
        particle.update();
    });
}

function initSmoke(){
    for(var i=0; i < smoke.particleCount; ++i){
        var particle = new Particle(smokeGeo, smokeMat);
        particle.draw()
        console.log(generateRandom(-smoke.velocity, smoke.velocity ))
        particle.setPosition(generateRandom(-param.smokeWidth  , param.smokeWidth  ),
        generateRandom(0, param.smokeHeight))
        
        particle.setVelocity(generateRandom(-smoke.velocity, smoke.velocity ), generateRandom(-smoke.velocity, smoke.velocity))
        smoke.particles.push(particle);            
    }
}






