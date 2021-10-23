export const DIRECTION = {
    '0': 'right',
    '-1': 'up-right',
    '-2': 'up',
    '-3': 'up-left',
    '-4': 'left',
    '4': 'left',
    '3': 'down-left',
    '2': 'down',
    '1': 'down-right',
};
export const CHAR = {
    keys: {
        'up': 'north',
        'down': 'south',
        'left': 'side',
        'right': 'side',
        'up-left': 'diagup',
        'up-right': 'diagup',
        'down-left': 'diagdown',
        'down-right': 'diagdown',
    },
    list: [1, 2, 3]
};
export const GUN = {
    keys: {
        'up': 'up',
        'down': 'down',
        'left': 'side',
        'right': 'side',
        'up-left': 'diagup',
        'up-right': 'diagup',
        'down-left': 'diagdown',
        'down-right': 'diagdown',
    },
    list: ['cannon', 'flamethrower', 'laser', 'matter', 'mg', 'pistol', 'rocket', 'shotgun', 'spazer'],
    cannon: {
        pad: {
            x: -2,
            y: 0
        },
        bullet: 'cannonball',
        delay: 60
    },
    flamethrower: {
        pad: {
            x: -8,
            y: 0
        },
        bullet: 'flamethrower',
        delay: 1
    },
    laser: {
        pad: {
            x: 2,
            y: 0
        },
        bullet: 'd',
        delay: 6
    },
    matter: {
        pad: {
            x: 0,
            y: 0
        },
        bullet: ['cup', 'cat', 'microwave'],
        delay: 15
    },
    mg: {
        pad: {
            x: -5,
            y: 0
        },
        bullet: 'c',
        delay: 2
    },
    pistol: {
        pad: {
            x: 2,
            y: 1
        },
        bullet: 'b',
        delay: 3
    },
    rocket: {
        pad: {
            x: 1,
            y: 0
        },
        bullet: 'rocket',
        delay: 50
    },
    shotgun: {
        pad: {
            x: -3,
            y: 0
        },
        bullet: 'tomato',
        delay: 40
    },
    spazer: {
        pad: {
            x: -1,
            y: 0
        },
        bullet: 'onion',
        delay: 40
    }
}
export const BULLET  ={
    list: ['flamethrower', 'onion', 'tomato', 'cat', 'cup', 'a', 'b', 'c', 'd', 'rocket', 'cannonball', 'microwave'],
    flamethrower: {
        maxFrame: 2,
        maxLength: 90,
        speed: 2.4,
        effectName: 'explosion1'
    },
    onion: {
        maxFrame: 6,
        maxLength: 100,
        speed: 5,
        effectName: 'explosion2'
    },
    tomato: {
        maxFrame: 6,
        maxLength: 100,
        speed: 5,
        effectName: 'explosion2'
    },
    cat: {
        maxFrame: 1,
        maxLength: 100,
        speed: 4,
        effectName: 'explosion2'
    },
    cup: {
        maxFrame: 1,
        maxLength: 100,
        speed: 4,
        effectName: 'explosion2'
    },
    microwave: {
        maxFrame: 1,
        maxLength: 100,
        speed: 4,
        effectName: 'explosion2'
    },
    a: {
        maxFrame: 1,
        maxLength: 100,
        speed: 2,
        effectName: 'explosion2'
    },
    b: {
        maxFrame: 1,
        maxLength: 170,
        speed: 4,
        effectName: 'explosion2'
    },
    c: {
        maxFrame: 1,
        maxLength: 180,
        speed: 6,
        effectName: 'explosion2'
    },
    d: {
        maxFrame: 1,
        maxLength: 220,
        speed: 7,
        effectName: 'explosion2'
    },
    rocket: {
        maxFrame: 1,
        maxLength: 220,
        speed: 3,
        effectName: 'explosion3'
    },
    cannonball: {
        maxFrame: 1,
        maxLength: 800,
        speed: 4,
        effectName: 'explosion2'
    }
}
export const ENEMY = {
    list: ['slime', 'spirit', 'flam'],
    state: ['idle', 'hit'],
    slime: {
        idleMaxFrame: 4,
        hitMaxFrame: 8,
        speed: 3,
        dame: 6,
        delayAttack: 0,
        maxHp: 500
    },
    spirit: {
        idleMaxFrame: 5,
        hitMaxFrame: 3,
        speed: 4,
        dame: 2,
        delayAttack: 40,
        maxHp: 800
    },
    flam: {
        idleMaxFrame: 5,
        hitMaxFrame: 3,
        speed: 5,
        dame: 4,
        delayAttack: 30,
        maxHp: 750
    }
}
export const GAMEOBJECT = {
    list: ['base']
}
export const EFFECT = {
    list: ['explosion1', 'explosion2', 'explosion3'],
    explosion1: {
        maxFrame: 8
    },
    explosion2: {
        maxFrame: 3
    },
    explosion3: {
        maxFrame: 3
    }
}
export const TOWER = {
    keys: {
        'up': 'up',
        'down': 'down',
        'left': 'left',
        'right': 'right',
        'up-left': 'leftup',
        'up-right': 'rightup',
        'down-left': 'leftdown',
        'down-right': 'rightdown',
    },
    list: ['cannon', 'flamethrower', 'laser', 'matter', 'mg', 'pistol', 'rocket', 'shotgun', 'spazer'],
}