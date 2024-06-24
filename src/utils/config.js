const config = {
    ENEMY_FREQ: 500,
    SPEED: 40,
    STAR_NUMBER: 600,
    CANVAS_WIDTH: 3000,
    CANVAS_HEIGHT: 2000,
    STAR_MOVEMENT_SPEED: 5,
    ENEMY_MOVEMENT_SPEED: 8,
    SHOOTING_SPEED: 40,
    FIRING_SPEED: 100,
    ENEMY_SHOOTING_FREQ: 1200,
    SCORE_INCREASE: 10
}

function get(name){
    return config?.[name]
}

export default get