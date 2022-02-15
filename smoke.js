
var particles = [];
var sparks = [];

var particleCount = 30;
var sparksCount = 20;

var maxVelocity = 2.4;

var targetFPS = 33;

var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;


//Load smoke content
var imageObj = new Image();
imageObj.onload = function() {
    particles.forEach(function(particle) {
            particle.setImage(imageObj);
    });
};

imageObj.src = "./img/smoke.png";

//Load spark content
var sparkObj = new Image();
sparkObj.onload = function() {
    sparks.forEach(function(particle) {
            particle.setImage(sparkObj);
    });
};

sparkObj.src = "./img/spark.png";

function Particle(context) {

    this.x = 0;
    this.y = 0;

    this.xVelocity = 0;
    this.yVelocity = 0;

    this.radius = 51;

    this.context = context;

    this.draw = function() {
        
        if(this.image){
            this.context.drawImage(this.image, this.x-128, this.y-128);                    
            return;
        }
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.context.fillStyle = "rgba(0, 255, 255, 1)";
        this.context.fill();
        this.context.closePath();
    };

    this.update = function() {
        this.x += this.xVelocity;
        this.y += this.yVelocity;

        if (this.x >= canvasWidth) {
            this.xVelocity = -this.xVelocity;
            this.x = canvasWidth;
        }
        else if (this.x <= 0) {
            this.xVelocity = -this.xVelocity;
            this.x = 0;
        }

        if (this.y >= canvasHeight) {
            this.yVelocity = -this.yVelocity;
            this.y = canvasHeight;
        }
        
        else if (this.y <= 0) {
            this.yVelocity = -this.yVelocity;
            this.y = 0;
        }
    };

    this.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
    };

    this.setVelocity = function(x, y) {
        this.xVelocity = x;
        this.yVelocity = y;
    };
    
    this.setImage = function(image){
        this.image = image;
    }
}

function generateRandom(min, max){
    return Math.random() * (max - min) + min;
}

var context;


function init() {
    var canvas = document.getElementById('myCanvas');
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    if (canvas.getContext) {

        context = canvas.getContext('2d');

        for(var i=0; i < particleCount; ++i){
            var particle = new Particle(context);
            
            particle.setPosition(generateRandom(0, canvasWidth), generateRandom(0, canvasHeight));
            
            particle.setVelocity(generateRandom(-maxVelocity, maxVelocity), generateRandom(-maxVelocity, maxVelocity));
            particles.push(particle);            
        }
        for(var i=0; i < sparksCount; ++i){
            var particle = new Particle(context);
            particle.draw()
            particle.setPosition(generateRandom(0, canvasWidth), generateRandom(0, canvasHeight));
            
            particle.setVelocity(generateRandom(-maxVelocity, maxVelocity), generateRandom(-maxVelocity, maxVelocity));
            sparks.push(particle);            
        }
    }
    else {
        alert("Please use a modern browser");
    }
}

function draw() {

    var im = new Image();

    im.onload = function() {
        context.drawImage(im,0,0)
        particles.forEach(function(particle) {
            particle.draw();
        });
        sparks.forEach(function(particle) {
            particle.draw();
        });
    };
    im.src = "./img/clean_ui.png";
}

function update() {
    particles.forEach(function(particle) {
        particle.update();
    });
    sparks.forEach(function(particle) {
        particle.update();
    });
}

init();

if (context) {
    setInterval(function() {
        update();
        draw();
    }, 1000 / targetFPS);
}