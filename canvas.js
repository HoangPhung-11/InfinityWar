//Create Canvas
const canvas = document.querySelector("canvas")
const c = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight
const scoreEL = document.querySelector("#scoreEl")
const startGame = document.querySelector("#startGame")
const model = document.querySelector("#model")
const totalScore = document.querySelector("#totalScore")
//Create player
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

//Create projectile
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color 
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}


const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color 
        this.velocity = velocity
        this.alpha = 1
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color 
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y 
    }
}


const x = canvas.width / 2
const y = canvas.height / 2
let player = new Player (x, y, 10, "white")
let projectiles = []
let enemies = []
let particles = []

function init () {
    player = new Player (x, y, 10, "white")
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEL.innerHTML = score
    totalScore.innerHTML = score
    projectiles.radius = 5
    increaseSize = 1
    document.getElementById("progress").value = 0;
}

function spawnEnemies() {
    setInterval(function() {
        const radius = Math.random() * (30-7) + 7

        let x
        let y
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }
        else{
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)
        const angle = Math.atan2(canvas.height/2 -y, canvas.width/2-x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, Math.random() * (3000-500) + 500)

}
let score = 0
let animationId
function animate(){
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particles.forEach(function(particle, index){
        if (particle.alpha <= 0){
            particles.splice(index, 1)
        } 
        else{
            particle.update()
        }
    })
    projectiles.forEach(function(projectile, index) {
        projectile.update()
        //remove projectile from screen
        if (projectile.x + projectile.radius<0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius<0 || projectile.y - projectile.radius > canvas.height){
            setTimeout(function(){
                projectiles.splice(index,1)
            }, 0)
        }
    })

    enemies.forEach(function(enemy, index){
        enemy.update()

        //Endgame
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (dist - enemy.radius - player.radius <1){
            cancelAnimationFrame(animationId)
            model.style.display = "flex"
            totalScore.innerHTML = score
        }

        //Shoot enemies 
        projectiles.forEach(function(projectile, projectileIndex){
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
        //When projectiles hit enemies 
            if(dist - enemy.radius - projectile.radius<1){
                //Increase score
                score += 100
                scoreEL.innerHTML = score
                //Create exploisions
                for(let i=0; i< enemy.radius * 2; i++){
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() -0.5) * (Math.random() *6), y: (Math.random() -0.5) * (Math.random() *6)}))
                }

                if (enemy.radius - 5  >10){
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(function(){
                    projectiles.splice(projectileIndex,1)
                    }, 0)
                }
                else{
                    setTimeout(function(){
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex,1)
                    }, 0)
                    
                }
                //Increase Energy
                document.getElementById("progress").value = document.getElementById("progress").value + increaseSize;
                if (document.getElementById("progress").value === 20){
                    document.getElementById("skillAnnouncement").innerHTML = "Press Space to use skill"
                    window.addEventListener("keydown", checkKeyPress, false); 
                    function checkKeyPress(key) {
                    if (key.keyCode == "32") {
                        document.getElementById("progress").value = 0;
                        document.getElementById("skillAnnouncement").innerHTML = ""
                        projectiles.radius = 50
                        increaseSize = 0;
                        setTimeout(function projectileSize(){
                            projectiles.radius = 5
                            increaseSize = 1;
                        }, 8000)
                    }
                    }
                }
                }  
        })
    })
}
addEventListener("click", function(event){
    const angle = Math.atan2(event.clientY - canvas.height/2, event.clientX - canvas.width/2)
    const velocity = {
        x: Math.cos(angle)*5,
        y: Math.sin(angle)*5
    }
    projectiles.push(new Projectile(canvas.width/2, canvas.height/2, projectiles.radius, "white", velocity))
})

startGame.addEventListener("click", function(){
    init()
    animate()
    spawnEnemies()
    model.style.display = "none"
})

