import * as THREE from './three/build/three.module.js'
/**
 * Particle
 */
 class Particle {
    constructor(geo, mat, scene, param) {
        this.x = 0
        this.y = 0
        this.geo = geo
        this.mat = mat
        this.scene = scene
        this.sprite = new THREE.Mesh(this.geo, this.mat)
        this.param = param

        this.xVelocity = 0
        this.yVelocity = 0

        this.radius = 51

        this.draw = function () {
            this.scene.add(this.sprite)
        }


        this.update = function () {
            this.x += this.xVelocity
            this.y += this.yVelocity


            if (this.x >= this.param.width) {
                this.xVelocity = -this.xVelocity
                this.x = this.param.width
            }
            else if (this.x <= 0) {
                this.xVelocity = -this.xVelocity
                this.x = 0
            }

            if (this.y >= this.param.height) {
                this.yVelocity = -this.yVelocity
                this.y = this.param.height
            }

            else if (this.y <= -0.5) {
                this.yVelocity = -this.yVelocity
                this.y = -0.5
            }

            this.sprite.position.set(this.x - this.param.width / 2, this.y)
            //this.sprite.rotation.z += 0.001
        }

        this.setPosition = function (x, y, z) {
            this.x = x
            this.y = y
            this.sprite.position.set(x, y, z + Math.random() * 2.001)

        }

        this.setVelocity = function (x, y) {
            this.xVelocity = x
            this.yVelocity = y
        }
    }
}
export {Particle}