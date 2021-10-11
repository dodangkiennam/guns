import {
    DIRECTION,
    CHAR, 
    GUN,
    BULLET
} from './asset/data.js';
const canvas = document.getElementById('cvs');
const ctx = canvas.getContext('2d');
const MOUSE = {
    x: 175,
    y: 175,
    OnMouseMove: function(e){
        this.x = e.clientX / 2;
        this.y = e.clientY / 2; 
    }
}
const asset = {
    chars: {},
    guns: {},
    bullet: {}
}
const bulletList = {};
const AddBullet = {
    normalBullet: function(bullet, x, y, angle){
        const id = randomId();
        bulletList[id] = new Bullet({
            id,
            x,
            y,
            angle,
            bullet: bullet
        });
    },
}
//----------------------main------------------
ctx.translate(0, 0);
fetchAsset();
const mainPlayer = new Player({char: 1});
document.addEventListener('mousemove', MOUSE.OnMouseMove.bind(MOUSE));
document.addEventListener('keydown', mainPlayer.onKeyDown);
document.addEventListener('keyup', mainPlayer.onKeyUp);
document.addEventListener('mousedown', mainPlayer.onMouseDown);
document.addEventListener('mouseup', mainPlayer.onMouseUp);
document.addEventListener('contextmenu', (e)=>e.preventDefault());
setInterval(update, 18);
//--------------------------------------------

function update(){
    ctx.clearRect(0, 0, 700, 700);
    bulletUpdate();
    mainPlayer.update();
}

function fetchAsset(){
    //store image in cache for fast loading
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
            bullet: GUN[gun_name].bullet
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
        asset.bullet[bullet_name] = assetData;
    }
}

function randomId(){
    return Math.floor(Math.random()*(99999) + 1);
}
function bulletUpdate(){
    for(const id in bulletList){
        bulletList[id].update();
    }
}
function ShootBullet(bullet, x, y, angle){
    if(AddBullet[bullet]){
        AddBullet[bullet](bullet, x, y, angle);
    }
    else{
        AddBullet['normalBullet'](bullet, x, y, angle);
    }
}
function Bullet(data){
    this.id = data.id || null;
    this.asset = asset.bullet[data.bullet] || asset.bullet['flamethrower'];
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
    this.maxLength = this.asset.maxLength;
    this.countLength = 0;
    this.lengthPerUpdate = Math.round(Math.sqrt(this.spX * this.spX + this.spY * this.spY));
    this.update = ()=>{
        this.render();
        this.updateFrame();
        this.updatePosition();
    }
    this.render = ()=>{
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        if(this.maxFrame > 1){
            ctx.drawImage(this.asset.img, this.w * this.countFrame, 0, this.w, this.h, this.renderX, this.renderY, this.w, this.h);
        }
        else{
            ctx.drawImage(this.asset.img, this.renderX, this.renderY, this.w, this.h);
        }
        ctx.restore();
    }
    this.updateFrame = ()=>{
        if(this.maxFrame > 1){
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

}
function Player(data){
    this.gun = data.gun || 0;
    this.assetGun = asset.guns[GUN.list[this.gun]];
    this.gunPos = {x: 0, y: 0};
    this.char = data.char || 1;
    this.assetChar = asset.chars[this.char];
    this.w = data.w || this.assetChar.w;
    this.h = data.h || this.assetChar.h; 
    this.x = data.x || canvas.width/2;
    this.y = data.y || canvas.height/2;
    this.curDirec = 'right';
    this.speed = 3;
    this.countFrame = 0;
    this.delayFrame = 5;
    this.maxDelayFrame = 5;
    this.attack = false;
    this.delayAttack = 3;
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
            this.delayAttack = 3;
            const {x, y} = this.getBulletHeadPos();
            const angle = Math.atan2(MOUSE.y - y, MOUSE.x - x);
            ShootBullet(this.assetGun.bullet, x, y, angle);
        }
    }
    this.getBulletHeadPos = ()=>{
        let headX = Math.abs(this.gunPos.x);
        let headY = this.gunPos.y;
        switch(this.curDirec){
            case 'up':
                headX += this.assetGun[this.curDirec].w/2;
                break;
            case 'up-right':
                headX += this.assetGun[this.curDirec].w;
                break;
            case 'right':
                headX += this.assetGun[this.curDirec].w;
                headY += this.assetGun[this.curDirec].h/2;
                break;
            case 'down-right':
                headX += this.assetGun[this.curDirec].w;
                headY += this.assetGun[this.curDirec].h;
                break;
            case 'down':
                headX += this.assetGun[this.curDirec].w/2;
                headY += this.assetGun[this.curDirec].h;
                break;
            case 'down-left':
                headX -= this.assetGun[this.curDirec].w;
                headY += this.assetGun[this.curDirec].h;
                break;
            case 'left':
                headX -= this.assetGun[this.curDirec].w;
                headY += this.assetGun[this.curDirec].h/2;
                break;
            case 'up-left':
                headX -= this.assetGun[this.curDirec].w;
                break;
        }
        return {x: headX, y: headY};
    }
    this.render = ()=>{
        this.updateDirection();
        ctx.save();
        let charPosX = this.x;
        if(this.curDirec.indexOf('left') != -1){
            ctx.scale(-1, 1);
            charPosX = -this.x - this.w;
        }
        let gunPosX = charPosX + this.w/2 + this.assetGun.pad.x;
        let gunPosY = this.y + this.h/2 + this.assetGun.pad.y;
        if(this.curDirec == 'up' || this.curDirec == 'down'){
            gunPosX = charPosX + this.w / 2 - this.assetGun[this.curDirec].w/2;
        }
        if(this.curDirec.indexOf('up') > -1){
            gunPosY = this.y + 4;
            this.drawGun(gunPosX, gunPosY);
            this.drawChar(charPosX);
        }
        else{
            this.drawChar(charPosX);
            this.drawGun(gunPosX, gunPosY);
        }
        ctx.restore();
        this.gunPos.x = gunPosX;
        this.gunPos.y = gunPosY;
    }
    this.updateDirection = ()=>{
        this.curDirec = DIRECTION[Math.floor((Math.atan2(MOUSE.y - this.y - this.h/2, MOUSE.x - this.x - this.w/2)*4/Math.PI  + 0.5))];
    }
    this.drawChar = (posX)=>{
        ctx.drawImage(this.assetChar[this.curDirec].img, this.assetChar.w * this.countFrame, 0, this.assetChar.w, this.assetChar.h, posX, this.y, this.w, this.h);
    }
    this.drawGun = (posX, posY)=>{
        ctx.drawImage(this.assetGun[this.curDirec].img, posX, posY, this.assetGun[this.curDirec].w, this.assetGun[this.curDirec].h);
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
            this.gun = parseInt(e.code.slice(5));
            if(this.gun >= GUN.list.length){
                this.gun = 0;
            }
            this.assetGun = asset.guns[GUN.list[this.gun]];
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
    this.changeGun = ()=>{
        this.gun++;
        if(this.gun == GUN.list.length){
            this.gun = 0;
        }
        this.assetGun = asset.guns[GUN.list[this.gun]];
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