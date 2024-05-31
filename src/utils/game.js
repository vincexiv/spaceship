import Rx from "rx"
import get from "./config";

function getStarStream(){
    return Rx.Observable.range(1, get('STAR_NUMBER'))
    .map(function(){
        return {
            x: parseInt(Math.random() * get('CANVAS_WIDTH')),
            y: parseInt(Math.random() * get('CANVAS_HEIGHT')),
            size: Math.random() * 3 + 1
        }
    })
    .toArray()
    .flatMap(function(starArray){
        return Rx.Observable.interval(get('SPEED')).map(function(){
            starArray.forEach(function(star){
                if(star.y >= get('CANVAS_HEIGHT')){
                    star.y = 0
                }
                star.y += get('STAR_MOVEMENT_SPEED')
            })
            return starArray
        })
    })
    .catch(function(error){
        return Rx.Observable.just({error: error})
    })
}

function paintStars(canvas, stars) { 
    const ctx = canvas.getContext('2d')   
    stars.forEach(function(star) {
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
}

function getSpaceship(canvas){
    const mouseMove = Rx.Observable.fromEvent(canvas, 'mousemove')
    const spaceship = mouseMove
        .map(function(event){
            return {
                x: event.clientX,
                y: get('HERO_Y')
            }
        })
        .startWith({
            x: get('CANVAS_WIDTH') / 2,
            y: get('HERO_Y')
        })

    return spaceship
}

function drawTriangle(canvas, x, y, width, color, direction){
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x - width, y)
    ctx.lineTo(x, direction === 'up'? y - width : y + width)
    ctx.lineTo(x + width, y)
    ctx.lineTo(x - width, y)
    ctx.fill()
}

function paintSpaceship(canvas, x, y){
    drawTriangle(canvas, x, y, 20, '#ff0000', 'up')
}

function paintBackground(canvas){
    const ctx =  canvas?.getContext('2d')

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, get('CANVAS_WIDTH'), get('CANVAS_HEIGHT'));
    ctx.fillStyle = '#ffffff';
}

function getGame(canvas){
    const stars = getStarStream()
    const spaceship = getSpaceship(canvas)
    const enemies = getEnemies()
    const shots = getHeroShots(spaceship, getPlayerFiring(canvas))
    return Rx.Observable.combineLatest(
        stars, spaceship, enemies, shots,
        function(stars, spaceship, enemies, shots ){
            return { stars, spaceship, enemies, shots }
        }
    ).sample(get('SPEED'))
}

function renderScene(canvas, actors) {
    requestAnimationFrame(()=>paintBackground(canvas))
    requestAnimationFrame(()=>paintStars(canvas, actors.stars))
    requestAnimationFrame(()=>paintSpaceship(canvas, actors.spaceship.x, actors.spaceship.y))
    requestAnimationFrame(()=>paintEnemies(canvas, actors.enemies))
    requestAnimationFrame(()=>paintHeroShots(canvas, actors.shots, actors.enemies))
}

function getEnemies(){
    const enemies = Rx.Observable.interval(get('ENEMY_FREQ'))
        .scan((enemyArray, i)=> {
            const enemy = {
                x: parseInt(Math.random() * get('CANVAS_WIDTH')),
                y: -30,
                shots: []
            }

            Rx.Observable.interval(get('ENEMY_SHOOTING_FREQ')).subscribe(function(){
                if(!enemy.isDead){
                    enemy.shots.push({
                        x: enemy.x,
                        y: enemy.y
                    })
                }
                enemy.shots = enemy.shots.filter(isVisible)
            })

            enemyArray.push(enemy)

            return enemyArray
        }, [])

    return enemies
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function paintEnemies(canvas, enemies){
    enemies.forEach(function(enemy){
        if(!enemy.isDead){
            enemy.y += get('ENEMY_MOVEMENT_SPEED'),
            enemy.x += getRandomInt(-15, 15)
            drawTriangle(canvas, enemy.x, enemy.y, 20, '#00ff00', 'down')
        }

        enemy.shots.forEach(shot => {
            shot.y += get('SHOOTING_SPEED')
            drawTriangle(canvas, shot.x, shot.y, 5, '#00ffff', 'down')
        })
    })
}

function getPlayerFiring(canvas){    
    const firing = Rx.Observable
        .fromEvent(canvas, 'click')
        .sample(get('FIRING_SPEED')).timestamp()
        .startWith({clientX: 0, clientY: -1})

    return firing
}

function getHeroShots(spaceship, shot){
    return Rx.Observable.combineLatest(
        spaceship, shot,
        function(spaceship, shot){
            return {
                timestamp: shot.timestamp,
                x: spaceship.x 
            }
        }
    ).distinctUntilChanged(shotEvent => {
        return shotEvent.timestamp;
    }).scan((shotArray, shot) => {
        shotArray.push({
            x: shot.x,
            y: get('HERO_Y')
        })
        return shotArray
    }, [])
}

function paintHeroShots(canvas, heroShots, enemies) {
    (heroShots || []).forEach(function(shot) {
        for(let i = 0; i < enemies.length; i++){
            const enemy = enemies[i]
            if(!enemy.isDead && collision(shot, enemy)){
                enemy.isDead = true,
                shot.y = -100
                break
            }
        }

        shot.y -= get('SHOOTING_SPEED');
        drawTriangle(canvas, shot.x, shot.y, 5, '#ffff00', 'up');
    });
}

function isVisible(obj) {
    return obj.x > -40 && obj.x < canvas.width + 40 &&
    obj.y > -40 && obj.y < canvas.height + 40;
}

function collision(target1, target2) {
    return (target1.x > target2.x - 20 && target1.x < target2.x + 20) &&
    (target1.y > target2.y - 20 && target1.y < target2.y + 20);
}

export { getGame, renderScene }