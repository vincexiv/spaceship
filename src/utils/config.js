const config = {
    ENEMY_FREQ: 1500,
    SPEED: 40,
    STAR_NUMBER: 250,
    CANVAS_WIDTH: 1360*2,
    CANVAS_HEIGHT: 768*2,
    STAR_MOVEMENT_SPEED: 3,
    ENEMY_MOVEMENT_SPEED: 5,
    SHOOTING_SPEED: 40,
    FIRING_SPEED: 100,
    ENEMY_SHOOTING_FREQ: 1200,
    SCORE_INCREASE: 10
}

function get(name){
    return config?.[name]
}

export default get