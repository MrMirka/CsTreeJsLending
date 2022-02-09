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
import { RGBShiftShader } from './three/examples/jsm/shaders/RGBShiftShader.js'


let mixer, model

const cursor = {
    x: 0,
    y: 0
}

let points = []
let pObj

const gui = new dat.GUI()
const debugObj = {}

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

/**
 * Update AllMaterial
 */
 const updateAllmaterial = () => {
    scene.traverse(child => {
        //if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial){
        if(child.material){
            console.log(child)
            child.material.envMapIntensity = debugObj.envMapIntensity
            child.material.needsUpdate = true
            child.material.castShadow = true
            child.material.receiveShadow = true
            child.material.roughness = 0.75
        }
        
    })
}

let cameraRig = new THREE.Group()
scene.add(cameraRig)

const param = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('mousemove', (event) =>
{   
    cursor.x = ( event.clientX - param.width / 2 ) * 0.0004
    cursor.y = ( event.clientY - param.height / 2 ) * 0.0004
})

const camera = new THREE.PerspectiveCamera(55, param.width / param.height, 0.1 , 100)
camera.position.x = 1
camera.position.z = 3
camera.position.y = 1

gui.add(camera,'fov').min(10).max(100).name('cameraFOV')

gui.add(camera.position,'x').min(-10).max(10).step(0.001).name('cameraX')
gui.add(camera.position,'y').min(-10).max(10).step(0.001).name('cameraY')
gui.add(camera.position,'z').min(-10).max(10).step(0.001).name('cameraZ')

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

gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    ReinHard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ASECFilmic: THREE.ACESFilmicToneMapping
}).onFinishChange(()=> {
    renderer.toneMapping = Number(renderer.toneMapping)
    //updateAllmaterial()
})
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001).name('toneExposure')




//debugObj.envMapIntensity = 5
//gui.add(debugObj, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllmaterial)


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
compose.addPass(rgbShiftPass)

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
compose.addPass(customPass);



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
 const pontLight = new THREE.PointLight( 0xff0000, 4 )
 pontLight.position.set(-1.8,1.6,-1.2)
 scene.add( pontLight )
 gui.add(pontLight.position,'x').min(-10).max(10).step(0.03).name('lPoint1_X')
 gui.add(pontLight.position,'y').min(-10).max(10).step(0.03).name('lPoint1_Y')
 gui.add(pontLight.position,'z').min(-10).max(10).step(0.03).name('lPoint1_Z')
 gui.add(pontLight,'intensity').min(0).max(20).step(0.001).name('lPoint1_intensity')

 const pontLight1 = new THREE.PointLight( 0xffffff, 2.46 )
 pontLight1.position.set(-2.1,.9,1.5)
 pontLight1.shadow.mapSize.width = 2048
 pontLight1.shadow.mapSize.height = 2048
 pontLight1.shadow.mapSize.width = 2048
 pontLight1.shadow.mapSize.height = 2048
 scene.add( pontLight1 )

 gui.add(pontLight1.position,'x').min(-10).max(10).step(0.03).name('lPoint2_X')
 gui.add(pontLight1.position,'y').min(-10).max(10).step(0.03).name('lPoint2_Y')
 gui.add(pontLight1.position,'z').min(-10).max(10).step(0.03).name('lPoint2_Z')
 gui.add(pontLight1,'intensity').min(0).max(20).step(0.001).name('lPoint2_intensity')






/* const sphereSize = 0.3;
const pointLightHelper = new THREE.PointLightHelper( pontLight, sphereSize, 0xff0000 );
scene.add( pointLightHelper );

const pointLightHelper1 = new THREE.PointLightHelper( pontLight1, sphereSize, 0xff0000 );
scene.add( pointLightHelper1 ); */

//RECT Ligth
const width = 3;
const height = 3;
const intensity = 1;
const rectLight = new THREE.RectAreaLight( 0xffffff, intensity,  width, height );
rectLight.position.set( 1.2, 4.2, .9 );
rectLight.rotation.x = -Math.PI /2 
//rectLight.lookAt( 0, 3, 0 );
scene.add( rectLight )
gui.add(rectLight.position,'x').min(-10).max(10).step(0.001).name('rectangleL_X')
gui.add(rectLight.position,'y').min(-10).max(10).step(0.001).name('rectangleL_Y')
gui.add(rectLight.position,'z').min(-10).max(10).step(0.001).name('rectangleL_Z')
gui.add(rectLight.rotation, 'x').min(-Math.PI / 2).max(Math.PI / 2).step(0.001).name('rectangleL_ROT')
gui.add(rectLight,'intensity').min(0).max(100).step(0.001).name('rectangleL_intensity')

/* const rectLightHelper = new RectAreaLightHelper( rectLight );
rectLight.add( rectLightHelper );
  */


 /**
  * Model loader - Character model
  */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./lib/draco/')
const gltfLoaderSol = new GLTFLoader()
//gltfLoaderSol.setDRACOLoader(dracoLoader)
//gltfLoaderSol.load('./models/compress_vertion/character.gltf', gltf => {
gltfLoaderSol.load('./models/gltf1k/v2/character.gltf', gltf => {
    model = gltf.scene
    model.scale.set(2.9,2.9,2.9)
    model.position.set(0,-3,0)
    model.rotation.y = .9
    
    gltf.scene.traverse( function( node ) {
        if(node.material){
            const rgbloader = new RGBELoader()
            rgbloader.load('./textures/enviroment/je_gray_park_2k.pic',texture => {
                texture.encoding = THREE.sRGBEncoding
                texture.mapping = THREE.EquirectangularRefractionMapping;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapP = THREE.RepeatWrapping;
                texture.repeat.set( 1, 1 );
                node.material.envMap = texture
                node.material.envMapIntensity = 0.06
            })
            node.material.roughness = 0.75
        }
        if(node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    })

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
  textPlane.load('./img/background_v2.png', tex => {
     tex.magFilter = THREE.NearestFilter;
     tex.wrapT = THREE.RepeatWrapping;
     tex.wrapS = THREE.RepeatWrapping;
     tex.repeat.set( 1, 1 );
     const backPlane = new THREE.PlaneGeometry(10,4.6)
     const matPlane = new THREE.MeshBasicMaterial({
         map:tex
     })
     const meshPlane = new THREE.Mesh(backPlane, matPlane)
     meshPlane.position.set(3.3,1.2,0)
     gui.add(meshPlane.position,'x').min(-10).max(10).step(0.001).name('back_X')
     gui.add(meshPlane.position,'y').min(-10).max(10).step(0.001).name('back_Y')
     gui.add(meshPlane.position,'z').min(-10).max(10).step(0.001).name('back_Z')
     cameraRig.add(meshPlane)
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
	

    rgbShiftPass.uniforms["amount"].value = cameraRig.rotation.y * 0.02
    

    if(mixer) {
		mixer.update( elapsedTime );
	}

    stats.update()
    //control.update()
    camera.updateProjectionMatrix()
    
    //renderer.render(scene, camera)
    compose.render()
    requestAnimationFrame(tick)
}
tick()






