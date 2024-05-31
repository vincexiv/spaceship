const config = {
    ENEMY_FREQ: 1500,
    SPEED: 40,
    STAR_NUMBER: 250,
    CANVAS_WIDTH: 1360,
    CANVAS_HEIGHT: 768,
    HERO_Y: 600,
    STAR_MOVEMENT_SPEED: 3,
    ENEMY_MOVEMENT_SPEED: 5,
    SHOOTING_SPEED: 40,
    FIRING_SPEED: 200
}

function get(name){
    return config?.[name]
}

export default get