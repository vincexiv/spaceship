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
            window.queueMicrotask(()=>{
                ctx.fillRect(star.x, star.y, star.size, star.size);
            })
        });
}

function getHeight(){
    const { height: canvasHeight } = document.querySelector('#game-container').getBoundingClientRect()
    const y =  get('CANVAS_HEIGHT') * 0.5 // y is at the center of the view area vertically
    return y + (0.35 * (canvasHeight || 0))
}

function getSpaceship(canvas){
    const mouseMove = Rx.Observable.fromEvent(canvas, 'mousemove')
    const spaceship = mouseMove
        .map(function(event){
            return {
                x: event.offsetX,
                y: getHeight()
            }
        })
        .startWith({
            x: get('CANVAS_WIDTH') / 2,
            y: getHeight()
        })

    return spaceship
}

function drawTriangle(canvas, x, y, width, color, direction){
    window.queueMicrotask(() => {
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(x - width, y)
        ctx.lineTo(x, direction === 'up'? y - width : y + width)
        ctx.lineTo(x + width, y)
        ctx.lineTo(x - width, y)
        ctx.fill()
    })
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

function getScore(){
    const scoreSubject = new Rx.Subject()
    scoreSubject.scan((prev, curr)=> {
        return prev + curr
    }, 0).concat(Rx.Observable.return(0))

    return scoreSubject
}

function getResize(canvas){
    return Rx.Observable
        .fromEvent(canvas, 'resize')
        .startWith(null)
}

function getGame(canvas, updateGameState){
    const score = getScore()
    const stars = getStarStream()
    const spaceship = getSpaceship(canvas)
    const enemies = getEnemies(canvas)
    const shots = getHeroShots(spaceship, getPlayerFiring(canvas))
    const resize = getResize(canvas)

    const game = Rx.Observable.combineLatest(
        stars, spaceship, enemies, shots, resize,
        function(stars, spaceship, enemies, shots ){
            return { stars, spaceship, enemies, shots, score }
        }
    )
    .sample(get('SPEED'))
    .takeWhile(function(actors){
        const gameCompleted = gameOver(actors.spaceship, actors.enemies) != false
        updateGameState({completed: gameCompleted})
        return !gameCompleted
    })

    return { game, score }
}

function renderScene(canvas, actors) {
    window.requestAnimationFrame(() => {
        paintBackground(canvas)
        paintStars(canvas, actors.stars)
        paintSpaceship(canvas, actors.spaceship.x, actors.spaceship.y)
        paintEnemies(canvas, actors.enemies)
        paintHeroShots(canvas, actors.shots, actors.enemies, actors.score, actors.resize)
        paintScore(canvas, actors.score)
    })
}

function getEnemies(canvas){
    const enemies = Rx.Observable.interval(get('ENEMY_FREQ'))
        .filter(() => !document.hidden)
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
                enemy.shots = enemy.shots.filter(function(shot){
                    return isVisible(canvas, shot)
                })
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
            y: getHeight()
        })
        return shotArray
    }, [])
}

function paintHeroShots(canvas, heroShots, enemies, score) {
    (heroShots || []).forEach(function(shot) {
        for(let i = 0; i < enemies.length; i++){
            const enemy = enemies[i]
            if(!enemy.isDead && collision(shot, enemy)){
                score.onNext(get('SCORE_INCREASE'))
                enemy.isDead = true,
                shot.y = -100
                break
            }
        }

        shot.y -= get('SHOOTING_SPEED');
        drawTriangle(canvas, shot.x, shot.y, 5, '#ffff00', 'up');
    });
}

function isVisible(canvas, obj) {
    return obj.x > -40 && obj.x < canvas.width + 40 &&
    obj.y > -40 && obj.y < canvas.height + 40;
}

function collision(target1, target2) {
    return (target1.x > target2.x - 20 && target1.x < target2.x + 20) &&
    (target1.y > target2.y - 20 && target1.y < target2.y + 20);
}

function gameOver(ship, enemies) {
    return enemies.some(function(enemy) {
        if (collision(ship, enemy)) { return true; }
        return enemy.shots.some(function(shot) {
            return collision(ship, shot);
        });
    });
}

function paintScore(canvas, score) {
    const ctx = canvas?.getContext('2d')
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('Score: ' + score, 40, 43);
}

export { getGame, renderScene }