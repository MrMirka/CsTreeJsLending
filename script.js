import * as THREE from './three/build/three.module.js'
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from './three/examples/jsm/loaders/DRACOLoader.js'
import { RGBELoader } from './three/examples/jsm/loaders/RGBELoader.js'
import Stats  from './three/examples/jsm/libs/stats.module.js'
import * as dat from './lib/dat.gui.module.js'

//Postprocessing
import { EffectComposer } from './three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from './three/examples/jsm/postprocessing/RenderPass.js'
import { FilmPass } from './three/examples/jsm/postprocessing/FilmPass.js'
import {Particle} from './particle.js'



let mixer, model

const cursor = {
    x: 0,
    y: 0
}

const smoke = {
    particles: [],
    particleCount: 14,
    velocity: 0.003,
    width: 1.5,
    height: 2
}


const param = {
    width: window.innerWidth,
    height: window.innerHeight,
}


const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

/**
 * Fog
 */
const fogParam = {
    color: 0xd40000,
    density: 0.1
}
const fog = new THREE.FogExp2(fogParam.color, fogParam.density)
scene.fog = fog


/**
 * Loading manager
 */
 const loadManager = new THREE.LoadingManager(()=>{
    //TODO Hide loader
})


 /**
  * Smoke
  */
const smokeTexture = new THREE.TextureLoader(loadManager).load('./img/smoke2.png')
const smokeGeo = new THREE.PlaneGeometry(4,4)
const smokeMat = new THREE.MeshBasicMaterial({
    map:smokeTexture,
    transparent: true,
})




 

/**
 * Update AllMaterial
 */
 const updateAllmaterial = () => {
    scene.traverse(child => {
        if(child instanceof THREE.SkinnedMesh && child.material instanceof THREE.MeshStandardMaterial){
            child.material.envMapIntensity = 0.05
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


window.addEventListener('mousemove', (event) =>
{   
    cursor.x = ( event.clientX - param.width / 2 ) * 0.0004
    cursor.y = ( event.clientY - param.height / 2 ) * 0.0004
})

const camera = new THREE.PerspectiveCamera(45, param.width / param.height, 1 , 100)
camera.position.x = 0.14
camera.position.z = 3.765
camera.position.y = 1.23
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





/**
 * Orbit
 */
//const control = new OrbitControls(camera, renderer.domElement)


/**
 * Add compose
 */
const compose = new EffectComposer(renderer)
compose.addPass( new RenderPass( scene, camera ) )


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
 })


/**
 * Ligth
 */
const lightParameters = {
    point1_Color: 0xff0000,
    point2_Color: 0xffffff,
    point3_Color: 0xffffff,
    point4_Color: 0xffffff,
}
 const pontLight = new THREE.PointLight( lightParameters.point1_Color, 17 )
 pontLight.position.set(-1.59,1.44,-0.3)
 pontLight.distance = 1.887
 pontLight.decay = 0.91
 scene.add( pontLight )


 const pontLight1 = new THREE.PointLight( lightParameters.point2_Color, 10.473 )
 pontLight1.position.set( -1.38, 1.02, 1.7 )
 pontLight1.distance = 2.9
 pontLight1.dacay = 1
 scene.add( pontLight1 )


 const pontLight3 = new THREE.PointLight( lightParameters.point3_Color, 7 )
 pontLight3.position.set(-1.008,3.8,0.29)
 pontLight3.castShadow = true
 pontLight3.shadow.mapSize.width = 2048
 pontLight3.shadow.mapSize.height = 2048
 pontLight3.shadow.normalBias = 0.05
 pontLight3.distance = 3.7
 pontLight3.decay = 0
 scene.add( pontLight3 )


 const pontLight4 = new THREE.SpotLight( lightParameters.point2_Color, 11.88 )
 pontLight4.position.set(2.31,2.52,-3.33)
 pontLight4.decay = 0.608
 pontLight4.angle = 0.978
 pontLight4.distance = 0
 pontLight4.penumbra = 0.0954
 scene.add( pontLight4 )


 /**
  * Model loader - Character model
  */
const dracoLoader = new DRACOLoader(loadManager)
dracoLoader.setDecoderPath('./lib/draco/')
const gltfLoaderSol = new GLTFLoader(loadManager)
gltfLoaderSol.setDRACOLoader(dracoLoader)
gltfLoaderSol.load('./models/draco_character/untitled.gltf', gltf => {
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
 * Enviroment
 */
const url = './textures/enviroment/colosseum_1k.pic'
const rgbloader = new RGBELoader(loadManager)
rgbloader.load(url,texture => {
     texture.encoding = THREE.sRGBEncoding
     texture.mapping = THREE.EquirectangularRefractionMapping;
     texture.wrapS = THREE.RepeatWrapping;
     texture.wrapP = THREE.RepeatWrapping;
     texture.repeat.set( 1, 1 );
     scene.environment = texture
 })




//renderer.render(scene, camera)

const clock = new THREE.Clock()

let stats = new Stats();
document.body.appendChild( stats.dom );

initSmoke()

const tick = () => {
    const elapsedTime = clock.getDelta()


    //Rotate control
     cameraRig.rotation.x += ( -cursor.y * 0.2 - cameraRig.rotation.x ) * .05
	 cameraRig.rotation.y += ( - cursor.x  * 0.2 - cameraRig.rotation.y ) * .09
	
    

    if(mixer) {
		mixer.update( elapsedTime );
	}

    updateParticle()

    stats.update()
    //control.update()
    camera.updateProjectionMatrix()
    
    //renderer.render(scene, camera)
    compose.render()
    requestAnimationFrame(tick)
}
tick()


/**
 * Particles
 */
function initSmoke(){
    for(var i=0; i < smoke.particleCount; ++i){
        var particle = new Particle(smokeGeo, smokeMat,cameraRig,smoke)
        particle.draw()
        particle.setPosition(generateRandom(-smoke.width  , smoke.width  ),
        generateRandom(0, smoke.height),-2)
        
        particle.setVelocity(generateRandom(-smoke.velocity, smoke.velocity ), generateRandom(-smoke.velocity, smoke.velocity))
        smoke.particles.push(particle);            
    }
}


function generateRandom(min, max){
    return Math.random() * (max - min) + min;
}

function updateParticle() {
    
    smoke.particles.forEach(function(particle) {
        particle.update();
    });

}








