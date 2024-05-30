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
    const ctx =  canvas?.getContext('2d')

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, get('CANVAS_WIDTH'), get('CANVAS_HEIGHT'));
    ctx.fillStyle = '#ffffff';
    
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

function getGame(canvas){
    const stars = getStarStream()
    const spaceship = getSpaceship(canvas)
    const enemies = getEnemies(canvas)
    return Rx.Observable.combineLatest(
        stars, spaceship, enemies,
        function(stars, spaceship, enemies){
            return { stars, spaceship, enemies }
        }
    )
}

function renderScene(canvas, actors) {
    requestAnimationFrame(() => {
        paintStars(canvas, actors.stars);
        paintSpaceship(canvas, actors.spaceship.x, actors.spaceship.y);
        paintEnemies(canvas, actors.enemies)
    })
}

function getEnemies(canvas){
    const enemies = Rx.Observable.interval(get('ENEMY_FREQ'))
        .scan((enemyArray, i)=> {
            const enemy = {
                x: parseInt(Math.random() * get('CANVAS_WIDTH')),
                y: -30
            }
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
        enemy.y += get('ENEMY_MOVEMENT_SPEED'),
        enemy.x += getRandomInt(-15, 15)

        drawTriangle(canvas, enemy.x, enemy.y, 20, '#00ff00', 'down')
    })
}

export { getGame, renderScene }