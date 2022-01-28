import * as THREE from './three/build/three.module.js'
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from './three/examples/jsm/loaders/RGBELoader.js'
import Stats  from './three/examples/jsm/libs/stats.module.js'
import * as dat from './lib/dat.gui.module.js'
import { RectAreaLightHelper } from './lib/RectAreaLightHelper.js';


const speed = .3;


let mixer, walk, run, idle, jump, mixer2
let previeClip, currentClip

let txt

let model

const gui = new dat.GUI()


const canvas = document.querySelector('canvas.webgl')

/**
 * Init control param
 */

const decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
const acceleration = new THREE.Vector3(1, 0.25, 50.0);
const velocity = new THREE.Vector3(0, 0, 0);



const scene = new THREE.Scene()
//scene.background = new THREE.Color(0xBADAED)
//scene.fog = new THREE.FogExp2(0x9FACB4, 0.03)
//scene.fog = new THREE.Fog(0x868686, 3, 10)

const param = {
    width: window.innerWidth,
    height: window.innerHeight
}

const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    space: false,
    shift: false
}


const camera = new THREE.PerspectiveCamera(55, param.width / param.height, 0.1 , 1000)
camera.position.x = 3
camera.position.z = 3
camera.position.y = 4
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})

const controls = new OrbitControls(camera, canvas)

renderer.setSize(param.width, param.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
//renderer.shadowMap.needsUpdate = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
//renderer.toneMappingExposure = 1;
//renderer.outputEncoding = THREE.sRGBEncoding;



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


window.addEventListener('keyup', e => {onKeyUp(e)})
window.addEventListener('keydown', e => {onKeyDown(e)})

function onKeyUp(event) {
    switch(event.keyCode){
        case 87: //w
            keys.forward = false
            break
        
        case 65: //a
            keys.left = false
            break
        
        case 68: //d
            keys.right = false
            break

        case 83: //s
            keys.backward = false
            break

        case 32: //space
            keys.space = false
            break

        case 16: //shift
            keys.shift = false
            break

    }
}


function onKeyDown(event) {
    switch(event.keyCode){
        case 87: //w
            keys.forward = true
            break
        
        case 65: //a
            keys.left = true
            break
        
        case 68: //d
            keys.right = true
            break

        case 83: //s
            keys.backward = true
            break

        case 32: //space
            keys.space = true
            break

        case 16: //shift
            keys.shift = true
            break

    }
}

/**
 * Ligth
 */

 const light = new THREE.AmbientLight( 0x404040 ); // soft white light
 light.intensity = 5
 scene.add( light );

 //Point   
 const pontLight = new THREE.PointLight( 0xffffff, 0.86 )
 pontLight.position.set(-4,4,-4)
 pontLight.decay = 2
 
 //pontLight.castShadow = true
 pontLight.position.set(2.4,4,-2.7)
 scene.add( pontLight )

 const pontLight1 = new THREE.PointLight( 0xffffff, 2.46 )
 pontLight1.position.set(-4,4,-4)
 pontLight1.position.set(-2.1,3.9,0)
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



const sphereSize = 0.3;
const pointLightHelper = new THREE.PointLightHelper( pontLight, sphereSize );
scene.add( pointLightHelper );

const pointLightHelper1 = new THREE.PointLightHelper( pontLight1, sphereSize );
scene.add( pointLightHelper1 );

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
 

 const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 )
 directionalLight.castShadow = true;
 directionalLight.position.set(50,100,50)
 //scene.add( directionalLight )

 /**
  * Ground
  */

 const textLoader = new THREE.TextureLoader()
 textLoader.load('./textures/weathered_brown_planks_2k/weathered_brown_planks_diff_2k.jpg', texture => {
    const groundGeo = new THREE.PlaneGeometry(1000,1000)
    const groundMat = new THREE.MeshStandardMaterial({map: texture})
    const groundMesh = new THREE.Mesh(groundGeo, groundMat)
    groundMesh.rotation.x = - Math.PI / 2
    groundMesh.receiveShadow = true;
    
    //texture.encoding = THREE.EquirectangularReflectionMapping
    texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(200,200)
    groundMat.map = texture;
    groundMat.metalness = 0
    groundMat.roughness = 0.7
    //scene.add(groundMesh) 
    
 })

 /**
  * Blocks
  */

 const box1 = new THREE.BoxGeometry(5,5,5)
 const mat1 = new THREE.MeshToonMaterial({color: 0x6C6C6C})
 const bMesh1 = new THREE.Mesh(box1, mat1)
 bMesh1.position.set(100, 2.5,100)
 scene.add(bMesh1)


 /**
  * TEST Model
  */

 const gltfLoaderSol = new GLTFLoader()
 gltfLoaderSol.load('/models/gltf/character.gltf', gltf => {
    model = gltf.scene
    model.scale.set(2.5,2.5,2.5)
    model.position.set(0,0,0)
    console.log(gltf)
    gltf.scene.traverse( function( node ) {
        if(node.material){
        /* const rgbeLoader = new RGBELoader()
        rgbeLoader.load('/textures/enviroment/studio_garden_2k.pic', texture => {
        txt = texture    
        txt.mapping = THREE.EquirectangularRefractionMapping;
        txt.wrapS = THREE.RepeatWrapping;
        txt.wrapP = THREE.RepeatWrapping;
        txt.repeat.set( 1, 1 );
        node.material.envMapIntensity = 11.5;
        node.material.envMap = txt;
        gui.add(node.material.envMap,'rotation', -10, 10, 0.3)

        

    }) */
        }
        if(node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            //gui.add(node,'receiveShadow')
            //gui.add(node,'castShadow')
        }
    })

    const animations2 = gltf.animations;
     mixer2 = new THREE.AnimationMixer( model );
    mixer2.clipAction(animations2[0]).play()
    
    scene.add(model)
 })


/**
 * GLFT load
 */
const glftLoader = new GLTFLoader()
glftLoader.load('/models/avatar.glb', (gltf) => {
    model = gltf.scene
    model.scale.set(1,1,1)
    model.position.set(0,0,0)
    //scene.add(model)
    
    gltf.scene.traverse( function( node ) {
        if(node.material){
            
            //node.material = new THREE.MeshToonMaterial({color: 0xffffff})
        }
        if(node.isMesh) {
            node.castShadow = true;
        }
    })

    const animations = gltf.animations;
    
    mixer = new THREE.AnimationMixer( model );
    
    const subClipWalk = THREE.AnimationUtils.subclip(animations[0], 'walk', 0, 33, 24)
    const subClipRun = THREE.AnimationUtils.subclip(animations[0], 'run', 34, 47, 24)
    const subClipIdle = THREE.AnimationUtils.subclip(animations[0], 'idle', 48, 176, 24)
    const subClipJump = THREE.AnimationUtils.subclip(animations[0], 'jump', 177, 196, 24)

    walk = mixer.clipAction(subClipWalk)
    run = mixer.clipAction(subClipRun)
    idle = mixer.clipAction(subClipIdle).play()
    jump = mixer.clipAction(subClipJump)

    currentClip = idle
    previeClip = idle

} )



renderer.render(scene, camera)

const clock = new THREE.Clock()

let stats = new Stats();
document.body.appendChild( stats.dom );

const tick = () => {
    rectLight.lookAt( 0, 3, 0 );
    const elapsedTime = clock.getDelta()

    update(elapsedTime)

    if(txt) {
        txt.rotation += 1
        txt.needsUpdate = true
    }

    if(mixer) {
		mixer.update( elapsedTime );
	}

    if(mixer2) {
		mixer2.update( elapsedTime );
	}
    
    controls.update()
    stats.update()
        
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}
tick()

function update(timeInSeconds) {
    if(!model) {
        return
    }
    initStates()
    const frameDecceleration = new THREE.Vector3(
        velocity.x * decceleration.x,
        velocity.y * decceleration.y,
        velocity.z * decceleration.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
        Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const acc = acceleration.clone();

    const controlObject = model;
    const Q = new THREE.Quaternion();
    const A = new THREE.Vector3();
    const R = controlObject.quaternion.clone();

    if (keys.forward) {
        velocity.z += acc.z * timeInSeconds * 0.1;
    }
    if (keys.backward) {
     velocity.z -= acc.z * timeInSeconds * 0.1;
    }
    if (keys.left) {
        A.set(0, 1, 0);
        Q.setFromAxisAngle(A, 4.0 * Math.PI * timeInSeconds * acceleration.y);
        R.multiply(Q);
    }
    if (keys.right) {
        A.set(0, 1, 0);
        Q.setFromAxisAngle(A, 4.0 * -Math.PI * timeInSeconds * acceleration.y);
        R.multiply(Q);
    }

    controlObject.quaternion.copy(R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

   // oldPosition.copy(controlObject.position);

}

function stateMachine(){
    if(!mixer) {
        return
    }
    
}
/**
 * Get keys and set pose animation
 */
function initStates(){
    if(keys.forward == true || keys.backward == true) {
        if(currentClip != walk)
            setState(walk) 
    }else if(keys.space == true){
        if(currentClip != jump)
            setState(jump)
    }else {
        if(currentClip != idle)
            setState(idle)
    }
}

/**
 * Start pose animation
 */
function setState( clip ){
    currentClip = clip
    currentClip.reset()
    currentClip.clampWhenFinished = true
    currentClip.crossFadeFrom(previeClip, 0.3, true);
    currentClip.play()
    previeClip = currentClip
}








