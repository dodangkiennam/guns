import {
    DIRECTION,
    CHAR, 
    GUN,
    BULLET,
    ENEMY,
    GAMEOBJECT
} from './asset/data.js';
const canvas = document.getElementById('cvs');
const ctx = canvas.getContext('2d');
const centerX = canvas.width/2;
const centerY = canvas.height/2;
const HP_W = 20;
const HP_H = 2;
const asset = {
    map: {},
    chars: {},
    guns: {},
    bullets: {},
    enemies: {},
    objects: {}
};
const MOUSE = {
    x: 175,
    y: 175,
    OnMouseMove: function(e){
        this.x = e.clientX / 2;
        this.y = e.clientY / 2; 
    }
};
const MAP = {
    x: 0,
    y: 0
};
const GunClass = {
    common: Gun,
    mg: MG,
    flamethrower: Flamethrower,
    matter: Matter
};
const BulletClass = {
    common: Bullet,
    cannonball: CannonBall,
    cup: FlyingBullet,
    cat: FlyingBullet,
    microwave: FlyingBullet
};
const EnemyClass = {
    common: Enemy,
    slime: Slime
};
const bulletList = {};
const enemyList = {};
let gameCountTime = 1;
//----------------------main------------------
fetchAsset();
firstLoadingPage();
ctx.translate(0, 0);
ctx.strokeStyle = 'red';
ctx.fillStyle = 'red';
const mainPlayer = new Player({char: 1});
const base = createBase(640, 640);
document.addEventListener('mousemove', MOUSE.OnMouseMove.bind(MOUSE));
document.addEventListener('keydown', mainPlayer.onKeyDown);
document.addEventListener('keyup', mainPlayer.onKeyUp);
document.addEventListener('mousedown', mainPlayer.onMouseDown);
document.addEventListener('mouseup', mainPlayer.onMouseUp);
document.addEventListener('contextmenu', (e)=>e.preventDefault());
setInterval(update, 20);
//--------------------------------------------
function update(){
    drawMap()
    base.update();
    enemyUpdate();
    mainPlayer.update();
    updateMapPos(mainPlayer.x, mainPlayer.y);
    randEnemy();
}
function fetchAsset(){
    //store image in cache for fast loading
    //map
    asset.map['img'] = new Image();
    asset.map['img'].src = './asset/background/bg.png';
    asset.map['w'] = asset.map['img'].width;
    asset.map['h'] = asset.map['img'].height;
    //characters
    for(const char of CHAR.list){
        const assetData = {};
        let isGetOffset = false;
        for(const key in CHAR.keys){
            assetData[key] = {};
            assetData[key].img = new Image();
            assetData[key].img.src = `./asset/characters/${char}_${CHAR.keys[key]}.png`
            if(!isGetOffset){
                isGetOffset = true;
                assetData['w'] = assetData[key].img.width/4;
                assetData['h'] = assetData[key].img.height;
            }
        }
        asset.chars[char] = assetData;
    }
    //guns
    for(const gun_name of GUN.list){
        const assetData = {
            pad: GUN[gun_name].pad,
            bullet: GUN[gun_name].bullet,
            delay: GUN[gun_name].delay
        };
        for(const key in GUN.keys){
            assetData[key] = {};
            assetData[key].img = new Image();
            assetData[key].img.src = `./asset/guns/${gun_name}/${gun_name}_${GUN.keys[key]}.png`;
            assetData[key].w = assetData[key].img.width;
            assetData[key].h = assetData[key].img.height;
        }
        asset.guns[gun_name] = assetData;
    }
    //bullet
    for(const bullet_name of BULLET.list){
        const assetData = {
            maxFrame: BULLET[bullet_name].maxFrame,
            maxLength: BULLET[bullet_name].maxLength,
            speed: BULLET[bullet_name].speed,
            dame: BULLET[bullet_name].dame || 1
        };
        assetData['img'] = new Image();
        assetData['img'].src = `./asset/bullet/${bullet_name}.png`;
        assetData['w'] = assetData['img'].width / BULLET[bullet_name].maxFrame;
        assetData['h'] = assetData['img'].height;
        asset.bullets[bullet_name] = assetData;
    }
    //enemies
    for(const enemy_name of ENEMY.list){
        const assetData = {
            speed: ENEMY[enemy_name].speed,
            dame: ENEMY[enemy_name].dame,
            maxHp:  ENEMY[enemy_name].maxHp,
            delayAttack: ENEMY[enemy_name].delayAttack
        };
        for(const state of ENEMY.state){
            const data = {
                maxFrame: ENEMY[enemy_name][`${state}MaxFrame`]
            };
            data['img'] = new Image();
            data['img'].src = `./asset/enemies/${enemy_name}_${state}.png`;
            data['w'] = data['img'].width / data.maxFrame;
            data['h'] = data['img'].height;
            assetData[state] = data;
        }
        asset.enemies[enemy_name] = assetData;
    }    
    //object
    for(const object_name of GAMEOBJECT.list){
        const assetData = {};
        assetData['img'] = new Image();
        assetData['img'].src = `./asset/objects/${object_name}.png`;
        assetData['w'] = assetData['img'].width;
        assetData['h'] = assetData['img'].height;
        if(GAMEOBJECT[object_name])
            assetData['maxFrame'] = GAMEOBJECT[object_name].maxFrame;
        asset.objects[object_name] = assetData;
    }
}
//bullet classes
function CannonBall(data){
    Bullet.call(this, data);
    this.checkMapCollision = ()=>{
        this.angle+=Math.PI/60;
        if(this.x < 0 || this.x > asset.map['w']){
            this.spX = -this.spX;
        }
        if(this.y < 0 || this.y > asset.map['h']){
            this.spY = -this.spY;
        }
    }
    this.checkCollision = ()=>{
        for(const id in enemyList){
            const isCollided = rectCollision(enemyList[id].getBoxCollider(), this.getBoxCollider());
            if(isCollided){
                enemyList[id].hit(this.dame);
                return true;
            }
        }
        return false;
    }
    this.updatePosition = ()=>{
        let isCollided = false;
        this.x += this.spX;
        if(this.checkCollision()){
            this.spX = -this.spX;
            isCollided = true;
        }
        this.y += this.spY;
        if(!isCollided && this.checkCollision()){
            this.spY = -this.spY;
        }
        this.countLength += this.lengthPerUpdate;
        if(this.countLength >= this.maxLength){
            this.removeSelf();
        }
    }
}
function FlyingBullet(data){
    Bullet.call(this, data);
    this.parapol = data.option.parapol;
    this.maxLength = data.option.length;
    this.totalTime = 0.8;
    this.timePerMove = 0.02;
    this.spX = this.maxLength * this.timePerMove * data.option.isLeft / this.totalTime;
    this.update = ()=>{
        this.render();
        this.updateFrame();
        this.updatePosition();
        this.checkMapCollision();
    }
    this.calcParapol = (x)=>{
        return -(this.parapol[0]*x*x + this.parapol[1]*x + this.parapol[2]);
    }
    this.updatePosition = ()=>{
        this.x += this.spX;
        this.y = this.calcParapol(this.x);

        this.countLength += Math.abs(this.spX);
        if(this.countLength >= this.maxLength){
            this.removeSelf();
            this.checkCollision();
        }

        this.angle += Math.PI/60;
    }
    this.checkMapCollision = ()=>{}
}
function Bullet(data){
    this.id = data.id || null;
    this.asset = asset.bullets[data.bulletName] || asset.bullets['cannon'];
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.w = data.w || this.asset.w;
    this.h = data.h || this.asset.h;
    this.renderX = -this.w/4;
    this.renderY = -this.h/2;
    this.dame = this.asset.dame;
    this.speed = this.asset.speed;
    this.angle = data.angle || 0;
    this.spX = Math.cos(this.angle)*this.speed;
    this.spY = Math.sin(this.angle)*this.speed;
    this.maxFrame = this.asset.maxFrame;
    this.countFrame = 0;
    this.maxDelayFrame = 3;
    this.delayFrame = 0;
    this.enableAnimation = this.maxFrame > 1 ? true : false;
    this.maxLength = this.asset.maxLength;
    this.countLength = 0;
    this.lengthPerUpdate = Math.round(Math.sqrt(this.spX * this.spX + this.spY * this.spY));
    this.update = ()=>{
        this.render();
        this.checkCollision();
        this.updateFrame();
        this.updatePosition();
        this.checkMapCollision();
    }
    this.render = ()=>{
        ctx.save();
        ctx.translate(this.x + MAP.x, this.y + MAP.y);
        ctx.rotate(this.angle);
        if(this.enableAnimation){
            ctx.drawImage(this.asset.img, this.w * this.countFrame, 0, this.w, this.h, this.renderX, this.renderY, this.w, this.h);
        }
        else{
            ctx.drawImage(this.asset.img, this.renderX, this.renderY, this.w, this.h);
        }
        ctx.restore();
    }
    this.updateFrame = ()=>{
        if(this.enableAnimation){
            this.delayFrame++;
            if(this.delayFrame > this.maxDelayFrame){
                this.delayFrame = 0;
                this.countFrame++;
                if(this.countFrame >= this.maxFrame)
                    this.countFrame = 0;
            }
        }
    }
    this.updatePosition = ()=>{
        this.x += this.spX;
        this.y += this.spY;
        this.countLength += this.lengthPerUpdate;
        if(this.countLength >= this.maxLength){
            this.removeSelf();
        }
    }
    this.removeSelf = ()=>{
        delete bulletList[this.id];
    }
    this.checkMapCollision = ()=>{
        if(this.x < 0 || this.y < 0 || this.x > asset.map['w'] || this.y > asset.map['h']){
            console.log('bullet collide map');
            this.removeSelf();
        }
    }
    this.checkCollision = ()=>{
        for(const id in enemyList){
            const isCollided = rectCollision(enemyList[id].getBoxCollider(), this.getBoxCollider());
            if(isCollided){
                enemyList[id].hit(this.dame);
                this.removeSelf();
            }
        }
    }
    this.getBoxCollider = ()=>{
        return{
            x: this.x - this.w/2,
            y: this.y - this.h/2,
            w: this.w,
            h: this.h
        }
    }
}
//gun classes
function Matter(data){
    Gun.call(this, data);
    this.shootHigh = 60;
    this.shoot = ()=>{
        this.updateHeadPos();
        const angle = Math.atan2(MOUSE.y - this.headY, MOUSE.x - this.headX);
        const parapol = findParapol(
            {
                x: this.headX - MAP.x, 
                y: this.headY - MAP.y
            }, 
            {
                x: (this.headX + MOUSE.x)/2 - MAP.x,
                y: (this.headY + MOUSE.y)/2 - this.shootHigh - MAP.y
            }, 
            {
                x: MOUSE.x - MAP.x,
                y: MOUSE.y - MAP.y
            }
        );
        const delX = MOUSE.x - this.headX;
        const length = Math.sqrt(delX*delX);
        const randomId = randomInRange(0, this.asset.bullet.length - 1);
        createBullet(this.asset.bullet[randomId], this.headX - MAP.x, this.headY - MAP.y, angle, {parapol, length, isLeft: (MOUSE.x >= this.headX ? 1: -1)});
    }
}
function Flamethrower(data){
    Gun.call(this, data);
    this.maxExpandAngle = Math.PI/4;
    this.partAmount = 2;
    this.partCount = 0;
    this.middlePartIndex = this.partAmount/2;
    this.oncePartAngle = this.maxExpandAngle / this.partAmount;
    this.shoot = ()=>{
        this.updateHeadPos();
        const angle = Math.atan2(MOUSE.y - this.headY, MOUSE.x - this.headX);
        const randomAngle = this.getRandomAngle(angle);
        createBullet(this.asset.bullet, this.headX - MAP.x, this.headY - MAP.y, randomAngle);
        this.updatePartCount();
    }
    this.getRandomAngle = (centerAngle)=>{
        const delta = this.partCount - this.middlePartIndex;

        const minAngle = centerAngle + this.oncePartAngle * delta;
        const maxAngle = centerAngle + this.oncePartAngle * (delta + 1);

        return randomInRangeAngle(maxAngle, minAngle);
    }
    this.updatePartCount = ()=>{
        this.partCount++;
        if(this.partCount >= this.partAmount)
            this.partCount = 0;
    }
}
function MG(data){
    Gun.call(this, data);
    this.deltaPosAngle = Math.PI/2;
    this.distance = 3;
    this.shoot = ()=>{
        this.updateHeadPos();
        const angle = Math.atan2(MOUSE.y - this.headY, MOUSE.x - this.headX);
        const posX = Math.cos(this.deltaPosAngle + angle) * this.distance + this.headX - MAP.x;
        const posY = Math.sin(this.deltaPosAngle + angle) * this.distance + this.headY - MAP.y;
        createBullet(this.asset.bullet, posX, posY, angle);
        this.deltaPosAngle = -this.deltaPosAngle;
    }
}
function Gun(gunName){
    this.asset = asset.guns[gunName];
    this.x = -50;
    this.y = -50;
    this.headX = 0;
    this.headY = 0;
    this.curDirec = 'right';
    this.setUpdatePos = (x, y, direc)=>{
        this.x = x;
        this.y = y;
        this.curDirec = direc;
    }
    this.render = ()=>{
        ctx.save();
        if(this.curDirec.indexOf('left') != -1){
            ctx.scale(-1, 1);
        }
        ctx.drawImage(this.asset[this.curDirec].img, this.x, this.y, this.asset[this.curDirec].w, this.asset[this.curDirec].h);
        ctx.restore();
    }
    this.shoot = ()=>{
        this.updateHeadPos();
        const angle = Math.atan2(MOUSE.y - this.headY, MOUSE.x - this.headX);
        createBullet(this.asset.bullet, this.headX - MAP.x, this.headY - MAP.y, angle);
    }
    this.updateHeadPos = ()=>{
        let headX = Math.abs(this.x);
        let headY = this.y;
        switch(this.curDirec){
            case 'up':
                headX += this.asset[this.curDirec].w/2;
                break;
            case 'up-right':
                headX += this.asset[this.curDirec].w;
                break;
            case 'right':
                headX += this.asset[this.curDirec].w - 2;
                headY += this.asset[this.curDirec].h/2 - 1;
                break;
            case 'down-right':
                headX += this.asset[this.curDirec].w;
                headY += this.asset[this.curDirec].h - 2;
                break;
            case 'down':
                headX += this.asset[this.curDirec].w/2;
                headY += this.asset[this.curDirec].h;
                break;
            case 'down-left':
                headX -= this.asset[this.curDirec].w;
                headY += this.asset[this.curDirec].h - 2;
                break;
            case 'left':
                headX -= this.asset[this.curDirec].w - 2;
                headY += this.asset[this.curDirec].h/2 - 1;
                break;
            case 'up-left':
                headX -= this.asset[this.curDirec].w;
                break;
        }
        this.headX = headX;
        this.headY = headY;
    }
}
//gameobject class
function Base(data){
    GameObject.call(this, data);
    this.hpBarWidth = HP_W * 2;
    this.maxHp = 100;
    this.hp = this.maxHp;
    this.update = ()=>{
        this.render();
        this.drawHpBar();
    }
    this.drawHpBar = ()=>{
        const posX = this.x - this.hpBarWidth/2 + MAP.x;
        const posY = this.y - this.h/2 + MAP.y;
        const hpLen = this.hpBarWidth * this.hp / this.maxHp;
        ctx.fillStyle = 'pink';
        ctx.fillRect(posX, posY, this.hpBarWidth, 2);
        ctx.fillStyle = 'red';
        ctx.fillRect(posX, posY, hpLen, HP_H);
    }
    this.hit = (dame)=>{
        this.hp -= dame;
        if(this.hp < 0){
            this.hp = 0;
        }
    }
}
function GameObject(data){
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.w = data.asset.w;
    this.h = data.asset.h;
    this.img = data.asset.img;
    this.update = ()=>{
        this.render();
    }
    this.render = ()=>{
        const posX = this.x - this.w/2 + MAP.x;
        const posY = this.y - this.h/2 + MAP.y;
        ctx.drawImage(this.img, posX, posY, this.w, this.h);
    }
    this.getBoxCollider = ()=>{
        return{
            x: this.x - this.w/2,
            y: this.y - this.h/2,
            w: this.w,
            h: this.h
        }
    }
}
//enemies class
function Slime(data){
    Enemy.call(this, data);
    this.hitBase = ()=>{
        if(this.countFrame == this.asset[this.state].maxFrame - 1){
            base.hit(this.dame);
            this.removeSelf();
        }
    }
}
function Enemy(data){
    this.id = data.id;
    this.asset = asset.enemies[data.enemyName];
    this.state = 'idle';
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.w = this.asset[this.state].w;
    this.h = this.asset[this.state].h;
    this.direc = (data.angle > Math.PI/2 || data.angle < -Math.PI/2 ) ? 'left' : 'right';
    this.spX = Math.cos(data.angle) * this.asset.speed;
    this.spY = Math.sin(data.angle) * this.asset.speed;
    this.hpBarWidth = data.enemyName != 'slime' ? HP_W * 2 : HP_W;
    this.hp = this.asset.maxHp;
    this.maxHp = this.asset.maxHp;
    this.dame = this.asset.dame;
    this.maxDelayAtk = this.asset.delayAttack;
    this.countDelayAtk = this.maxDelayAtk;
    this.countFrame = 0;
    this.maxDelayFrame = 5;
    this.delayFrame = this.maxDelayFrame;
    this.canMove = true;
    this.update = ()=>{
        this.render();
        this.updateFrame();
        this.updatePos();
    }
    this.render = ()=>{
        ctx.save();
        let posX = this.x + MAP.x;
        let posY = this.y + MAP.y;
        if(this.direc == 'left'){
            ctx.scale(-1, 1);
            posX = -this.x - MAP.x;
        }
        posX -= this.w/2;
        posY -= this.h/2;
        ctx.drawImage(this.asset[this.state].img, this.countFrame * this.w, 0, this.w, this.h, posX, posY, this.w, this.h);
        ctx.restore();
        this.drawHpBar();
    }
    this.updatePos = ()=>{
        if(this.canMove){
            this.x += this.spX;
            this.y += this.spY;
        }
        this.checkCollision();
    }
    this.checkCollision = ()=>{
        const isCollided = rectCollision(this.getBoxCollider(), base.getBoxCollider());
        if(isCollided){
            if(this.canMove){
                this.canMove = false;
                this.countFrame = 0;
                this.state = 'hit';
                this.w = this.asset[this.state].w;
                this.h = this.asset[this.state].h;
            }
            else{
                this.hitBase();
            }
        }
    }
    this.hitBase =()=>{
        if(this.countDelayAtk > 0){
            this.countDelayAtk--;
        }
        else{
            base.hit(this.dame);
            this.countDelayAtk = this.maxDelayAtk;
        }
    }
    this.updateFrame = ()=>{
        this.delayFrame--;
        if(this.delayFrame == 0){
            this.delayFrame = this.maxDelayFrame;
            this.countFrame++;
            if(this.countFrame >= this.asset[this.state].maxFrame)
                this.countFrame = 0;
        }
    }
    this.removeSelf = ()=>{
        delete enemyList[this.id];
    }
    this.drawHpBar = ()=>{
        const posX = this.x - this.hpBarWidth/2 + MAP.x;
        const posY = this.y - this.h/2 + MAP.y;
        const hpLen = this.hpBarWidth * this.hp / this.maxHp;
        ctx.fillStyle = 'pink';
        ctx.fillRect(posX, posY, this.hpBarWidth, 2);
        ctx.fillStyle = 'red';
        ctx.fillRect(posX, posY, hpLen, HP_H);
    }
    this.getBoxCollider = ()=>{
        return{
            x: this.x - this.w/2,
            y: this.y - this.h/2,
            w: this.w,
            h: this.h
        }
    }
    this.hit = (dame)=>{
        this.hp -= dame;
        if(this.hp <= 0){
            this.removeSelf();
        }
    }
}
//player class
function Player(data){
    this.gunIndex = data.gunIndex || 0;
    this.gun = setGun(GUN.list[this.gunIndex]);
    this.asset = asset.chars[data.char];
    this.w = data.w || this.asset.w;
    this.h = data.h || this.asset.h; 
    this.x = data.x || 600;
    this.y = data.y || 600;
    this.maxHp = 20;
    this.hp = this.maxHp;
    this.curDirec = 'right';
    this.speed = 2;
    this.countFrame = 0;
    this.maxDelayFrame = 5;
    this.delayFrame = this.maxDelayAttack;
    this.attack = false;
    this.maxDelayAttack = this.gun.asset.delay;
    this.delayAttack = this.maxDelayAttack;
    this.status = {
        left: false,
        right: false,
        up: false,
        down: false
    }
    this.update = ()=>{
        this.render();
        this.updateFrame();
        this.updatePosition();
        this.shoot();
    }
    this.shoot = ()=>{
        if(this.delayAttack > 0){
            this.delayAttack--;
            return;
        }
        if(this.attack){
            this.delayAttack = this.maxDelayAttack;
            this.gun.shoot();
        }
    }
    this.render = ()=>{
        this.updateDirection();
        let charPosX = this.x + MAP.x;
        let charPosY = this.y - this.h/2 + MAP.y;
        if(this.curDirec.indexOf('left') != -1){
            charPosX = -this.x - MAP.x;
        }
        charPosX -= this.w/2;
        this.updateGunPos(charPosX, charPosY);
        if(this.curDirec.indexOf('up') > -1){
            this.gun.render();
            bulletUpdate();
            this.drawChar(charPosX, charPosY);
        }
        else{
            this.drawChar(charPosX, charPosY);
            this.gun.render();
            bulletUpdate();
        }
        this.drawHpBar();
    }
    this.updateDirection = ()=>{
        this.curDirec = DIRECTION[Math.floor((Math.atan2(MOUSE.y - this.y - this.h/2 - MAP.y, MOUSE.x - this.x - this.w/2 - MAP.x)*4/Math.PI  + 0.5))];
    }
    this.drawChar = (posX, posY)=>{
        ctx.save();
        if(this.curDirec.indexOf('left') != -1){
            ctx.scale(-1, 1);
        }
        ctx.drawImage(this.asset[this.curDirec].img, this.w * this.countFrame, 0, this.w, this.h, posX, posY, this.w, this.h);
        ctx.restore();
    }
    this.updateGunPos = (posX, posY)=>{
        let gunPosX = posX + this.w/2 + this.gun.asset.pad.x;
        let gunPosY = posY + this.h/2 + this.gun.asset.pad.y;
        if(this.curDirec == 'up' || this.curDirec == 'down'){
            gunPosX = posX + this.w / 2 - this.gun.asset[this.curDirec].w/2;
        }
        if(this.curDirec.indexOf('up') > -1){
            gunPosY = posY + 4;
        }
        this.gun.setUpdatePos(gunPosX, gunPosY, this.curDirec);
    }
    this.updateFrame = ()=>{
        if(this.delayFrame > 0){
            this.delayFrame--;
        }
        else if(this.status.left || this.status.right || this.status.up || this.status.down){
            this.delayFrame = this.maxDelayFrame;
            this.countFrame++;
            if(this.countFrame > 3)
                this.countFrame = 0;
        }
    }
    this.updatePosition = ()=>{
        if(this.status.left)
            this.x -= this.speed;
        else if(this.status.right)
            this.x += this.speed;
        if(this.status.up)
            this.y -= this.speed;
        else if(this.status.down)
            this.y += this.speed;
    }
    this.onKeyDown = (e)=>{
        switch(e.code){
            case 'KeyA':
            case 'ArrowLeft':
                this.status.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.status.right = true;
                break;
            case 'KeyW':
            case 'ArrowUp':
                this.status.up = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.status.down = true;
                break;
        }
    }
    this.onKeyUp = (e)=>{
        if(e.code.indexOf('Digit') > -1){
            let index = parseInt(e.code.slice(5));
            if(index >= GUN.list.length){
                index = 0;
            }
            this.changeGun(index);
            return;
        }
        switch(e.code){
            case 'KeyA':
            case 'ArrowLeft':
                this.status.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.status.right = false;
                break;
            case 'KeyW':
            case 'ArrowUp':
                this.status.up = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.status.down = false;
                break;
            case 'KeyE':
                this.changeGun();
                break;
        }
    }
    this.changeGun = (index)=>{
        if(index != undefined)
            this.gunIndex = index;
        else
            this.gunIndex++;
        if(this.gunIndex == GUN.list.length){
            this.gunIndex = 0;
        }
        delete this.gun;
        this.gun = setGun(GUN.list[this.gunIndex]);
        this.maxDelayAttack = this.gun.asset.delay;
        this.delayAttack = 0;
    }
    this.onMouseDown = (e)=>{
        if(e.buttons == 1)
            this.attack = true;
        else if(e.buttons == 2)
            this.changeGun();
    }
    this.onMouseUp = (e)=>{
        this.attack = false;
    }
    this.drawHpBar = ()=>{
        const posX = this.x - HP_W/2 + MAP.x;
        const posY = this.y - this.h/2 + MAP.y;
        const hpLen = HP_W * this.hp / this.maxHp;
        ctx.fillStyle = 'pink';
        ctx.fillRect(posX, posY, HP_W, 2);
        ctx.fillStyle = 'red';
        ctx.fillRect(posX, posY, hpLen, HP_H);
    }
    this.getBoxCollider = ()=>{
        return{
            x: this.x - this.w/2,
            y: this.y - this.h/2,
            w: this.w,
            h: this.h
        }
    }
}
function rectCollision(o1, o2){
    if(o1.x < o2.x + o2.w && o1.y < o2.y + o2.h && o2.x < o1.x + o1.w && o2.y < o1.y + o1.h){
        return true;
    }
    return false;
}
function updateMapPos(x, y){
    MAP.x = centerX - x;
    MAP.y = centerY - y;

    if(MAP.x > 0 )
        MAP.x = 0;
    else if(MAP.x < canvas.width - asset.map['w'])
        MAP.x = canvas.width - asset.map['w'];

    if(MAP.y > 0)
        MAP.y = 0;
    else if(MAP.y < canvas.height - asset.map['h'])
        MAP.y = canvas.height - asset.map['h'];
    
}
function drawMap(){
    ctx.clearRect(0, 0, 700, 700);
    ctx.drawImage(asset.map['img'], MAP.x, MAP.y);
}
function findParapol(p1, p2, p3){
    const sq1 = p1.x*p1.x;
    const sq2 = p2.x*p2.x;
    const sq3 = p3.x*p3.x;

    const det = (sq1 - sq3)*(p1.x - p2.x) - (sq1 - sq2)*(p1.x - p3.x);

    const a = ((p1.x - p2.x)*p3.y + (p2.x - p3.x)*p1.y + (p3.x - p1.x)*p2.y)/det;
    const b = ((p1.y - p2.y)*sq3 + (p2.y - p3.y)*sq1 + (p3.y - p1.y)*sq2)/det;
    const c = ((p1.x*p2.y - p2.x*p1.y)*sq3 + (p2.x*p3.y - p3.x*p2.y)*sq1 + (p3.x*p1.y - p1.x*p3.y)*sq2)/det;

    return [a, b, c];
}
function randomInRange(min, max){
    return Math.floor(Math.random()*(max - min + 1) + min);
}
function randomInRangeAngle(min, max){
    return Math.random()*(max - min) + min;
}
function randomId(){
    return randomInRange(1, 99999);
}
function enemyUpdate(){
    for(const id in enemyList){
        enemyList[id].update();
    }
}
function bulletUpdate(){
    for(const id in bulletList){
        bulletList[id].update();
    }
}
function createBase(x, y){
    return new Base({
        asset: asset.objects['base'],
        x,
        y
    });
}
function randEnemy(){
    if(gameCountTime % 50 == 0){
        createEnemy(ENEMY.list[0], base.x, base.y);
    }
    else if(gameCountTime % 501 == 0){
        let randBoss = randomInRange(1, 2);
        createEnemy(ENEMY.list[randBoss], base.x, base.y);
        gameCountTime = 0;
    }
    gameCountTime++;
}
function createEnemy(enemyName, pX, pY){
    const id = randomId();
    const randWall = randomInRange(0, 3);
    const randX = randomInRange(0, asset.map['w']);
    const randY = randomInRange(0, asset.map['h']);
    let x, y;
    switch(randWall){
        case 0:
            x = randX;
            y = 0;
            break;
        case 1:
            x = asset.map['w'];
            y = randY;
            break;
        case 2:
            x = randX;
            y = asset.map['h'];
            break;
        case 3:
            x = 0;
            y = randY;
            break;
    }
    let angle = Math.atan2(pY - y, pX - x);
    const data = {
        id,
        enemyName,
        x,
        y,
        angle
    };
    let enemyClassName = EnemyClass[enemyName] ? enemyName : 'common';
    enemyList[id] = new EnemyClass[enemyClassName](data);
}
function createBullet(bulletName, x, y, angle, option){
    const id = randomId();
    const data = {
        id,
        bulletName,
        x,
        y,
        angle,
        option
    };
    let bulletClassName = BulletClass[bulletName] ? bulletName : 'common';
    bulletList[id] = new BulletClass[bulletClassName](data);
}
function setGun(gunName){
    const gunClassName = GunClass[gunName] ? gunName : 'common';
    return new GunClass[gunClassName](gunName);
}
function firstLoadingPage(){
    window.onload = function() {
        if(!window.location.hash) {
            window.location = window.location + '#loaded';
            window.location.reload();
        }
    }
}