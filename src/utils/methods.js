import Rx from "rx"

function getStarStream(canvas){
    const SPEED = 40;
    const STAR_NUMBER = 250;

    return Rx.Observable.range(1, STAR_NUMBER)
    .map(function(){
        return {
            x: parseInt(Math.random() * canvas.width),
            y: parseInt(Math.random() * canvas.height),
            size: Math.random() * 3 + 1
        }
    })
    .toArray()
    .flatMap(function(starArray){
        return Rx.Observable.interval(SPEED).map(function(){
            starArray.forEach(function(star){
                if(star.y >= canvas.height){
                    star.y = 0
                }
                star.y += 3
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
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    
    stars.forEach(function(star) {
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
}

function getSpaceship(canvas){
    const HERO_Y = canvas.height - 30
    const mouseMove = Rx.Observable.fromEvent(canvas, 'mousemove')
    const spaceship = mouseMove
        .map(function(event){
            return {
                x: event.clientX,
                y: HERO_Y
            }
        })
        .startWith({
            x: canvas.width / 2,
            y: HERO_Y
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
    const stars = getStarStream(canvas)
    const spaceship = getSpaceship(canvas)
    return Rx.Observable.combineLatest(stars, spaceship, function(stars, spaceship){
        return { stars: stars, spaceship: spaceship }
    })
}

function renderScene(canvas, actors) {
    paintStars(canvas, actors.stars);
    paintSpaceship(canvas, actors.spaceship.x, actors.spaceship.y);
}

export { getGame, renderScene }