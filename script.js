import {
    DIRECTION,
    CHAR, 
    GUN,
    BULLET
} from './asset/data.js';
const canvas = document.getElementById('cvs');
const ctx = canvas.getContext('2d');
const centerX = canvas.width/2;
const centerY = canvas.height/2;
const asset = {
    background: {},
    chars: {},
    guns: {},
    bullets: {}
}
const MOUSE = {
    x: 175,
    y: 175,
    OnMouseMove: function(e){
        this.x = e.clientX / 2;
        this.y = e.clientY / 2; 
    }
}
const MAP = {
    x: 0,
    y: 0
}
const GunClass = {
    common: Gun,
    mg: MG,
    flamethrower: Flamethrower,
    matter: Matter
}
const BulletClass = {
    common: Bullet,
    cannonball: CannonBall,
    cup: Cup
}
const bulletList = {};
//----------------------main------------------
fetchAsset();
ctx.translate(0, 0);
ctx.strokeStyle = 'violet';
const mainPlayer = new Player({char: 1});
document.addEventListener('mousemove', MOUSE.OnMouseMove.bind(MOUSE));
document.addEventListener('keydown', mainPlayer.onKeyDown);
document.addEventListener('keyup', mainPlayer.onKeyUp);
document.addEventListener('mousedown', mainPlayer.onMouseDown);
document.addEventListener('mouseup', mainPlayer.onMouseUp);
document.addEventListener('contextmenu', (e)=>e.preventDefault());
setTimeout(()=>{
    setInterval(update, 20);
}, 500);
//--------------------------------------------

function update(){
    ctx.clearRect(0, 0, 700, 700);
    DrawMap()
    mainPlayer.update();

    UpdateMapPos(mainPlayer.x, mainPlayer.y);
}
function fetchAsset(){
    //store image in cache for fast loading
    //background
    asset.background['img'] = new Image();
    asset.background['img'].src = './asset/background/bg.png';
    asset.background['w'] = asset.background['img'].width;
    asset.background['h'] = asset.background['img'].height;
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
        const assetData = {};
        assetData['img'] = new Image();
        assetData['img'].src = `./asset/bullet/${bullet_name}.png`;
        assetData['w'] = assetData.img.width / BULLET[bullet_name].maxFrame;
        assetData['h'] = assetData.img.height;
        assetData['maxFrame'] = BULLET[bullet_name].maxFrame;
        assetData['maxLength'] = BULLET[bullet_name].maxLength;
        assetData['speed'] = BULLET[bullet_name].speed;
        asset.bullets[bullet_name] = assetData;
    }
}
function CannonBall(data){
    Bullet.call(this, data);
    this.checkMapCollision = ()=>{
        this.angle+=Math.PI/60;
        if(this.x - this.oldMapX < 0 || this.x - this.oldMapX > asset.background['w']){
            this.spX = -this.spX;
        }
        if(this.y - this.oldMapY < 0 || this.y - this.oldMapY > asset.background['h']){
            this.spY = -this.spY;
        }
    }
}
function Cup(data){
    Bullet.call(this, data);
    this.parapol = data.option.parapol;
    this.maxLength = data.option.length;
    this.totalTime = 1;
    this.timePerMove = 0.02;
    this.spX = this.maxLength * this.timePerMove * data.option.isLeft / this.totalTime;
    this.calcParapol = (x)=>{
        return -(this.parapol[0]*x*x + this.parapol[1]*x + this.parapol[2]);
    }
    this.updatePosition = ()=>{
        this.x += this.spX;
        this.y = this.calcParapol(this.x);

        this.countLength += Math.abs(this.spX);
        if(this.countLength >= this.maxLength){
            this.removeSelf();
        }
    }
    this.checkMapCollision = ()=>{}
}
function Bullet(data){
    this.id = data.id || null;
    this.asset = asset.bullets[data.bulletName] || asset.bullets['flamethrower'];
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.w = data.w || this.asset.w;
    this.h = data.h || this.asset.h;
    this.renderX = -this.w/4;
    this.renderY = -this.h/2;
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
    this.oldMapX = MAP.x;
    this.oldMapY = MAP.y;
    this.update = ()=>{
        this.render();
        this.updateFrame();
        this.updatePosition();
        this.checkMapCollision();
    }
    this.render = ()=>{
        ctx.save();
        ctx.translate(this.x + MAP.x - this.oldMapX, this.y + MAP.y - this.oldMapY);
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
        if(this.x < 0 || this.y < 0 || this.x > canvas.width || this.y > canvas.height){
            console.log(2222);
            this.removeSelf();
        }
    }
}
function Matter(data){
    Gun.call(this, data);
    this.shootHigh = 60;
    const oldRender = this.render;
    this.render = ()=>{
        oldRender();

        this.updateHeadPos();
        ctx.beginPath();
        ctx.moveTo(this.headX, this.headY);
        ctx.quadraticCurveTo((MOUSE.x + this.headX)/2, (MOUSE.y + this.headY)/2 - 120, MOUSE.x, MOUSE.y);
        ctx.stroke();
    }
    this.shoot = ()=>{
        this.updateHeadPos();
        const angle = Math.atan2(MOUSE.y - this.headY, MOUSE.x - this.headX);
        const parapol = findParapol(
            {
                x: this.headX, 
                y: this.headY
            }, 
            {
                x: (this.headX + MOUSE.x)/2,
                y: (this.headY + MOUSE.y)/2 - this.shootHigh
            }, 
            {
                x: MOUSE.x,
                y: MOUSE.y
            }
        );
        const delX = MOUSE.x - this.headX;
        const length = Math.sqrt(delX*delX);
        CreateBullet(this.asset.bullet, this.headX , this.headY, angle, {parapol, length, isLeft: (MOUSE.x >= this.headX ? 1: -1)});
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
        CreateBullet(this.asset.bullet, this.headX, this.headY, randomAngle);
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
        const posX = Math.cos(this.deltaPosAngle + angle) * this.distance + this.headX;
        const posY = Math.sin(this.deltaPosAngle + angle) * this.distance + this.headY;
        CreateBullet(this.asset.bullet, posX, posY, angle);
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
        ctx.drawImage(this.asset[this.curDirec].img, this.x, this.y + MAP.y, this.asset[this.curDirec].w, this.asset[this.curDirec].h);
        ctx.restore();
    }
    this.shoot = ()=>{
        this.updateHeadPos();
        const angle = Math.atan2(MOUSE.y - this.headY, MOUSE.x - this.headX);
        CreateBullet(this.asset.bullet, this.headX, this.headY, angle);
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
        this.headY = headY + MAP.y;
    }
}
function Player(data){
    this.gunIndex = data.gunIndex || 0;
    this.gun = SetGun(GUN.list[this.gunIndex]);
    this.asset = asset.chars[data.char];
    this.w = data.w || this.asset.w;
    this.h = data.h || this.asset.h; 
    this.x = data.x || 550;
    this.y = data.y || 550;
    this.hp = data.hp || 20;
    this.curDirec = 'right';
    this.speed = 2;
    this.countFrame = 0;
    this.delayFrame = 5;
    this.maxDelayFrame = 5;
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
        if(this.curDirec.indexOf('left') != -1){
            charPosX = -this.x - this.w - MAP.x;
        }
        this.updateGunPos(charPosX);
        if(this.curDirec.indexOf('up') > -1){
            this.gun.render();
            bulletUpdate();
            this.drawChar(charPosX);
        }
        else{
            this.drawChar(charPosX);
            this.gun.render();
            bulletUpdate();
        }
    }
    this.updateDirection = ()=>{
        this.curDirec = DIRECTION[Math.floor((Math.atan2(MOUSE.y - this.y - this.h/2 - MAP.y, MOUSE.x - this.x - this.w/2 - MAP.x)*4/Math.PI  + 0.5))];
    }
    this.drawChar = (posX)=>{
        ctx.save();
        if(this.curDirec.indexOf('left') != -1){
            ctx.scale(-1, 1);
        }
        ctx.drawImage(this.asset[this.curDirec].img, this.asset.w * this.countFrame, 0, this.asset.w, this.asset.h, posX, this.y + MAP.y, this.w, this.h);
        ctx.restore();
    }
    this.updateGunPos = (charPosX)=>{
        let gunPosX = charPosX + this.w/2 + this.gun.asset.pad.x;
        let gunPosY = this.y + this.h/2 + this.gun.asset.pad.y;
        if(this.curDirec == 'up' || this.curDirec == 'down'){
            gunPosX = charPosX + this.w / 2 - this.gun.asset[this.curDirec].w/2;
        }
        if(this.curDirec.indexOf('up') > -1){
            gunPosY = this.y + 4;
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
        this.gun = SetGun(GUN.list[this.gunIndex]);
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
}
function UpdateMapPos(x, y){
    MAP.x = centerX - x;
    MAP.y = centerY - y;

    if(MAP.x > 0 )
        MAP.x = 0;
    else if(MAP.x < canvas.width - asset.background['w'])
        MAP.x = canvas.width - asset.background['w'];

    if(MAP.y > 0)
        MAP.y = 0;
    else if(MAP.y < canvas.height - asset.background['h'])
        MAP.y = canvas.height - asset.background['h'];
    
}
function DrawMap(){
    ctx.drawImage(asset.background['img'], MAP.x, MAP.y);
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
function bulletUpdate(){
    for(const id in bulletList){
        bulletList[id].update();
    }
}
function CreateBullet(bulletName, x, y, angle, option){
    const id = randomId();
    const data ={
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
function SetGun(gunName){
    const gunClassName = GunClass[gunName] ? gunName : 'common';
    return new GunClass[gunClassName](gunName);
}