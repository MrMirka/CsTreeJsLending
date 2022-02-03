import * as THREE from './three/build/three.module.js'
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'
import { FirstPersonControls} from './three/examples/jsm/controls/FirstPersonControls.js'
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from './three/examples/jsm/loaders/RGBELoader.js'
import Stats  from './three/examples/jsm/libs/stats.module.js'
import * as dat from './lib/dat.gui.module.js'
import { RectAreaLightHelper } from './lib/RectAreaLightHelper.js';



let mixer, model

const cursor = {
    x: 0,
    y: 0
}



const gui = new dat.GUI()




const canvas = document.querySelector('canvas.webgl')


const scene = new THREE.Scene()
let cameraRig = new THREE.Group()
scene.add(cameraRig)

/* const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper ); */


const param = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('mousemove', (event) =>
{   

  /*   cursor.x = event.clientX / param.width - 0.5
    cursor.y = - (event.clientY / param.height - 0.5) */

    cursor.x = ( event.clientX - param.width / 2 ) * 0.0004
    cursor.y = ( event.clientY - param.height / 2 ) * 0.0004
})

const camera = new THREE.PerspectiveCamera(55, param.width / param.height, 0.1 , 1000)
camera.position.x = 1
camera.position.z = 3
camera.position.y = 1

gui.add(camera.position,'x', -10, 10, 0.3)
gui.add(camera.position,'y', -10, 10, 0.3)
gui.add(camera.position,'z', -10, 10, 0.3)
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})

//const controls = new OrbitControls(camera, canvas)


renderer.setSize(param.width, param.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping


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
 const light = new THREE.AmbientLight( 0x404040 ); // soft white light
 light.intensity = 5
 scene.add( light );

 //Point   
 const pontLight = new THREE.PointLight( 0xD03858, 4 )
 pontLight.position.set(-1.8,.9,-1.2)
 pontLight.decay = 2
 
 scene.add( pontLight )

 const pontLight1 = new THREE.PointLight( 0xffffff, 2.46 )
 pontLight1.position.set(-2.1,.9,1.5)
 pontLight1.castShadow = true
 pontLight1.distance = 1011
 pontLight1.bias = 222
 pontLight1.shadow.mapSize.width = 2048
 pontLight1.shadow.mapSize.height = 2048
 pontLight1.decay = 2
 pontLight1.shadow.mapSize.width = 2048
 pontLight1.shadow.mapSize.height = 2048
 scene.add( pontLight1 )

 gui.add(pontLight.position,'x', -10, 10, 0.3)
 gui.add(pontLight.position,'y', -10, 10, 0.3)
 gui.add(pontLight.position,'z', -10, 10, 0.3)
 gui.add(pontLight,'intensity', 0, 4, 0.01)

 gui.add(pontLight1.position,'x', -10, 10, 0.3)
 gui.add(pontLight1.position,'y', -10, 10, 0.3)
 gui.add(pontLight1.position,'z', -10, 10, 0.3)
 gui.add(pontLight1,'intensity', 0, 4, 0.01)



/* const sphereSize = 0.3;
const pointLightHelper = new THREE.PointLightHelper( pontLight, sphereSize );
scene.add( pointLightHelper );

const pointLightHelper1 = new THREE.PointLightHelper( pontLight1, sphereSize );
scene.add( pointLightHelper1 ); */

//RECT Ligth
const width = 4;
const height = 4;
const intensity = 1;
const rectLight = new THREE.RectAreaLight( 0xffffff, intensity,  width, height );
rectLight.position.set( 1.2, 4.2, .9 );
rectLight.lookAt( 0, 3, 0 );
scene.add( rectLight )
gui.add(rectLight.position,'x', -10, 10, 0.3)
gui.add(rectLight.position,'y', -10, 10, 0.3)
gui.add(rectLight.position,'z', -10, 10, 0.3)
gui.add(rectLight,'intensity', 0, 6, 0.3)

const rectLightHelper = new RectAreaLightHelper( rectLight );
//rectLight.add( rectLightHelper );
 


 /**
  * GLTF loader - Character model
  */

 const gltfLoaderSol = new GLTFLoader()
 gltfLoaderSol.load('./models/character/character.gltf', gltf => {
    model = gltf.scene
    model.scale.set(2.9,2.9,2.9)
    model.position.set(0,-3,0)
    model.rotation.y = .6
    cameraRig.add(model)
    cameraRig.add(camera)
    gltf.scene.traverse( function( node ) {
        if(node.material){
            //edit material
        }
        if(node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    })

    const animations = gltf.animations;
    mixer = new THREE.AnimationMixer( model );
    mixer.clipAction(animations[0]).play()
    scene.add(model)
 })



renderer.render(scene, camera)

const clock = new THREE.Clock()

let stats = new Stats();
document.body.appendChild( stats.dom );

const tick = () => {
    rectLight.lookAt( 0, 3, 0 );
    
    const elapsedTime = clock.getDelta()
   

    /* let delta = -(cursor.x - cameraRig.rotation.y) * .5 * Math.PI * 0.1 - 0.25
    cameraRig.rotation.y = delta 
    cameraRig.rotation.x = cursor.y * 0.2  */

    cameraRig.rotation.x += ( -cursor.y - cameraRig.rotation.x ) * .05;
	cameraRig.rotation.y += ( - cursor.x - cameraRig.rotation.y ) * .03;
    

    if(mixer) {
		mixer.update( elapsedTime );
	}

    //controls.update()
    stats.update()
        
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}
tick()






