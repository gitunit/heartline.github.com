/***************
 * PLAYER
 ***************/

Player.prototype = new Entity();
Player.constructor = Player;
var PLAYER_H = 20;
var PLAYER_W = 20;
var PLAYER_ACCEL = 2;
var PLAYER_MIN_SPEED = 0.2;
var PLAYER_WALK_SPEED = 2;
var PLAYER_RUN_SPEED = 8;
var PLAYER_MAX_HEALTH = 100;
var PLAYER_FRICTION = 0.7;

var PLAYER_HURT_CD = 25; //Invul frames after getting hurt

var PlayerStatus = {
	IDLE: 0,
	JUMP: 1,
	RUN: 2,
	LANDING: 3
};
function Player(room, x, y) {
	this.type = PLAYER;

	this.health = PLAYER_MAX_HEALTH;
	this.room = room;
	this.x = x;
	this.y = y;
	this.held = null;
	this.w = PLAYER_W;
	this.h = PLAYER_H;  

	this.status = PlayerStatus.IDLE;
	this.facingLeft = false;
	this.currJumpSpeed = 0;
	this.landTimer = 0;
	this.landedEntity = false;
	this.blockingEntity = false;
	this.movingLeft = false;
	this.movingRight = false;
	this.dead = false;
	
	this.runAnim = assetManager.getAnim("gfx/player_walk.png");
	this.idleAnim = assetManager.getAnim("gfx/player_stand.png");
} 

Player.prototype.moveLeft = function() {
	this.dx -= PLAYER_ACCEL;
	if(this.dx < -PLAYER_WALK_SPEED)
		this.dx = -PLAYER_WALK_SPEED;
	this.movingRight = true;
	this.facingLeft = true;
};
Player.prototype.moveRight = function() {
	this.dx += PLAYER_ACCEL;
	if(this.dx > PLAYER_WALK_SPEED)
		this.dx = PLAYER_WALK_SPEED;
	this.movingLeft = true;
	this.facingLeft = false;

};
Player.prototype.jumpPress = function() {
	if(this.landed)
	{
		this.status = PlayerStatus.JUMP;

		this.dy = -15;
		this.landed = false;
		this.jumping = true;
		this.jumpAnim.reset();
	}
};
Player.prototype.jumpRelease = function() {
	if(this.jumping && !this.landed) {
		if(this.dy < 0)
			this.dy = this.dy/2;
	}
};

//Maybe pass damage to this function later
Player.prototype.hurt = function(amount) {
	if(this.dead)
		return;
	if(this.hurtTimer>0) {
		//Invul Frames; no damage taken :D
		return false;
	}
	else {
		//soundManager.play("sfx/player_hurt.wav");
		//assetManager.getAsset("sfx/player_hurt.wav").play();
		this.hurtTimer = PLAYER_HURT_CD;
		this.health-=amount;	
		if(this.health <= 0) {
			this.dead = true;
			return true;
		}

		if(this.facingLeft) {
			this.dx = 4;
		}
		else {
			this.dx = -4;
		}
		this.dy = -4;
		return true;
	}
};

Player.prototype.landFunction = function() {
	this.dx*=PLAYER_FRICTION;
	this.jumping = false;

	if(this.status === PlayerStatus.JUMP) {
		this.status = PlayerStatus.LANDING;
		this.landTimer = 5;
	}
	if(this.blocking || this.blockingEntity)
		this.status = PlayerStatus.BLOCK;
	else if(this.attackTimer > 0) {
		if(this.status === PlayerStatus.JUMP_ATTACK) {
			this.attackTimer = 0;
		}
	}
	else if(this.landTimer > 0) {
		this.landTimer--;
	}
	else if(this.dx === 0 && this.status != PlayerStatus.IDLE)
		this.status = PlayerStatus.IDLE;
	else if(this.dx !== 0 && this.status != PlayerStatus.RUN){
		this.status = PlayerStatus.RUN;
		this.runAnim.reset();
	}
};

Player.prototype.update = function() {
	//Gravity
	this.dy+=GRAVITY;
	//Kinematics
	this.y+=this.dy;
	this.x+=this.dx;

	//Collision/Collision Flags
	this.landed = false;

	this.collideRoom();



	//Friction
	if(this.landed) {
		this.landFunction();
	}
	if(Math.abs(this.dx) < PLAYER_MIN_SPEED)
		this.dx = 0;

	if(this.hurtTimer > 0 ){
		this.hurtTimer--;
	}


	//Update animation statuses.


	if(!this.landed && !this.landedEntity) {
		if(this.status != PlayerStatus.JUMP && this.status != PlayerStatus.JUMP_ATTACK){
			//Then we're falling.
			if(!this.blocking)
			{
				this.status = PlayerStatus.JUMP;
				this.jumpAnim.reset();
			}
		}
	}
	this.landedEntity = false;
	this.blockingEntity = this.blocking;
	this.blocking = false;
	this.movingLeft = false;
	this.movingRight = false;
};
Player.prototype.draw = function(context) {
	if(this.dead) {
		this.deathAnim.draw(context, this.x, this.y, this.facingLeft);
		this.deathAnim.tick();
		return;
	}

	switch(this.status) {
		case(PlayerStatus.JUMP):
			this.jumpAnim.draw(context, this.x, this.y, this.facingLeft);
			if(this.jumpAnim.frame < this.jumpAnim.length-2) {
				this.jumpAnim.tick();
			}
			break;
		case(PlayerStatus.LANDING):
			this.jumpAnim.draw(context, this.x, this.y, this.facingLeft);
			this.jumpAnim.timer = this.jumpAnim.speed;
			this.jumpAnim.tick();

			break;
		case(PlayerStatus.IDLE):
			this.idleAnim.draw(context,this.x,this.y,this.facingLeft);
			break;
		case(PlayerStatus.BLOCK):
			this.blockAnim.draw(context, this.x, this.y, this.facingLeft);
			break;
		case(PlayerStatus.RUN):
			this.runAnim.draw(context, this.x, this.y, this.facingLeft);
			this.runAnim.tick();
			break;
		case(PlayerStatus.RUN_ATTACK):
			this.runAttackAnim.draw(context, this.x, this.y, this.facingLeft);
			this.runAttackAnim.tick();
			break;
		case(PlayerStatus.JUMP_ATTACK):
			this.jumpAttackAnim.draw(context, this.x, this.y, this.facingLeft);
			this.jumpAttackAnim.tick();
			break;
		case(PlayerStatus.STAND_ATTACK):
			this.standAttackAnim.draw(context, this.x, this.y, this.facingLeft);
			this.standAttackAnim.tick();
			break;

	}	

};
Player.prototype.collide = function(other) {
};
