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
        bullet: 'cannonball'
    },
    flamethrower: {
        pad: {
            x: -8,
            y: 0
        },
        bullet: 'flamethrower'
    },
    laser: {
        pad: {
            x: 2,
            y: 0
        },
        bullet: 'd'
    },
    matter: {
        pad: {
            x: 0,
            y: 0
        },
        bullet: 'cup'
    },
    mg: {
        pad: {
            x: -5,
            y: 0
        },
        bullet: 'c'
    },
    pistol: {
        pad: {
            x: 2,
            y: 1
        },
        bullet: 'b'
    },
    rocket: {
        pad: {
            x: 1,
            y: 0
        },
        bullet: 'rocket'
    },
    shotgun: {
        pad: {
            x: -3,
            y: 0
        },
        bullet: 'tomato'
    },
    spazer: {
        pad: {
            x: -1,
            y: 0
        },
        bullet: 'onion'
    }
}
export const BULLET  ={
    list: ['flamethrower', 'onion', 'tomato', 'cat', 'cup', 'a', 'b', 'c', 'd', 'rocket', 'cannonball'],
    flamethrower: {
        maxFrame: 2,
        maxLength: 80,
        speed: 2
    },
    onion: {
        maxFrame: 6,
        maxLength: 100,
        speed: 5
    },
    tomato: {
        maxFrame: 6,
        maxLength: 100,
        speed: 5
    },
    cat: {
        maxFrame: 1,
        maxLength: 100,
        speed: 4
    },
    cup: {
        maxFrame: 1,
        maxLength: 100,
        speed: 4
    },
    a: {
        maxFrame: 1,
        maxLength: 100,
        speed: 2
    },
    b: {
        maxFrame: 1,
        maxLength: 170,
        speed: 4
    },
    c: {
        maxFrame: 1,
        maxLength: 150,
        speed: 4
    },
    d: {
        maxFrame: 1,
        maxLength: 200,
        speed: 5
    },
    rocket: {
        maxFrame: 1,
        maxLength: 220,
        speed: 3
    },
    cannonball: {
        maxFrame: 1,
        maxLength: 300,
        speed: 3
    }
}