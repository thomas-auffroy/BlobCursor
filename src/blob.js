function Vector(x, y) {
	this.x = x;
	this.y = y;

	this.getX = function () {
		return this.x;
	}

	this.getY = function () {
		return this.y;
	}

	this.setX = function (x) {
		this.x = x;
	}

	this.setY = function (y) {
		this.y = y;
	}

	this.addX = function (x) {
		this.x += x;
	}

	this.addY = function (y) {
		this.y += y;
	}

	this.set = function (v) {
		this.x = v.getX();
		this.y = v.getY();
	}

	this.add = function (v) {
		this.x += v.getX();
		this.y += v.getY();
	}

	this.sub = function (v) {
		this.x -= v.getX();
		this.y -= v.getY();
	}

	this.dotProd = function (v) {
		return this.x * v.getX() + this.y * v.getY();
	}

	this.length = function () {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	this.scale = function (scaleFactor) {
		this.x *= scaleFactor;
		this.y *= scaleFactor;
	}
}

function Environment(x, y, w, h) {
	this.left = x;
	this.top = y;

	this.right = x + w;
	this.buttom = y + h;

	this.collision = function (curPos) {
		var collide = false;

		if (curPos.getX() < this.left) {
			curPos.setX(this.left);
			collide = true;
		}
		else if (curPos.getX() > this.right) {
			curPos.setX(this.right);
			collide = true;
		}
		if (curPos.getY() < this.top) {
			curPos.setY(this.top);
			collide = true;
		}
		else if (curPos.getY() > this.buttom) {
			curPos.setY(this.buttom);
			collide = true;
		}
		return collide;
	}
}

function PointMass(cx, cy, mass) {
	this.cur = new Vector(cx, cy);
	this.prev = new Vector(cx, cy);
	this.mass = mass;
	this.force = new Vector(0.0, 0.0);
	this.result = new Vector(0.0, 0.0);
	this.friction = 0.01;

	this.getXPos = function () {
		return this.cur.getX();
	}

	this.getYPos = function () {
		return this.cur.getY();
	}

	this.getPos = function () {
		return this.cur;
	}

	this.getXPrevPos = function () {
		return this.prev.getX();
	}

	this.getYPrevPos = function () {
		return this.prev.getY();
	}

	this.getPrevPos = function () {
		return this.prev;
	}

	this.addXPos = function (dx) {
		this.cur.addX(dx);
	}

	this.addYPos = function (dy) {
		this.cur.addY(dy);
	}

	this.setForce = function (force) {
		this.force.set(force);
	}

	this.addForce = function (force) {
		this.force.add(force);
	}

	this.getMass = function () {
		return this.mass;
	}

	this.setMass = function (mass) {
		this.mass = mass;
	}

	this.move = function (dt) {
		var t, a, c, dtdt;

		dtdt = dt * dt;

		a = this.force.getX() / this.mass;
		c = this.cur.getX();
		t = (2.0 - this.friction) * c - (1.0 - this.friction) * this.prev.getX() + a * dtdt;
		this.prev.setX(c);
		this.cur.setX(t);

		a = this.force.getY() / this.mass;
		c = this.cur.getY();
		t = (2.0 - this.friction) * c - (1.0 - this.friction) * this.prev.getY() + a * dtdt;
		this.prev.setY(c);
		this.cur.setY(t);
	}

	this.setFriction = function (friction) {
		this.friction = friction;
	}

	this.draw = function (ctx, scaleFactor, color) {
		ctx.lineWidth = 2;
		ctx.fillStyle = color;
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.arc(this.cur.getX() * scaleFactor,
			this.cur.getY() * scaleFactor,
			4.0, 0.0, Math.PI * 2.0, true);
		ctx.fill();
	}
}

function ConstraintY(pointMass, y, shortConst, longConst) {
	this.pointMass = pointMass;
	this.y = y;
	this.delta = new Vector(0.0, 0.0);
	this.shortConst = shortConst;
	this.longConst = longConst;

	this.sc = function () {
		var dist;

		dist = Math.abs(this.pointMass.getYPos() - this.y);
		this.delta.setY(-dist);

		if (this.shortConst != 0.0 && dist < this.shortConst) {
			var scaleFactor;

			scaleFactor = this.shortConst / dist;
			this.delta.scale(scaleFactor);
			pointMass.getPos().sub(this.delta);
		}
		else if (this.longConst != 0.0 && dist > this.longConst) {
			var scaleFactor;

			scaleFactor = this.longConst / dist;
			this.delta.scale(scaleFactor);
			pointMass.getPos().sub(this.delta);
		}
	}
}

function Joint(pointMassA, pointMassB, shortConst, longConst) {
	this.pointMassA = pointMassA;
	this.pointMassB = pointMassB;
	this.delta = new Vector(0.0, 0.0);
	this.pointMassAPos = pointMassA.getPos();
	this.pointMassBPos = pointMassB.getPos();

	this.delta.set(this.pointMassBPos);
	this.delta.sub(this.pointMassAPos);

	this.shortConst = this.delta.length() * shortConst;
	this.longConst = this.delta.length() * longConst;
	this.scSquared = this.shortConst * this.shortConst;
	this.lcSquared = this.longConst * this.longConst;

	this.setDist = function (shortConst, longConst) {
		this.shortConst = shortConst;
		this.longConst = longConst;
		this.scSquared = this.shortConst * this.shortConst;
		this.lcSquared = this.longConst * this.longConst;
	}

	this.scale = function (scaleFactor) {
		this.shortConst = this.shortConst * scaleFactor;
		this.longConst = this.longConst * scaleFactor;
		this.scSquared = this.shortConst * this.shortConst;
		this.lcSquared = this.longConst * this.longConst;
	}

	this.sc = function () {
		this.delta.set(this.pointMassBPos);
		this.delta.sub(this.pointMassAPos);

		var dp = this.delta.dotProd(this.delta);

		if (this.shortConst != 0.0 && dp < this.scSquared) {
			var scaleFactor;

			scaleFactor = this.scSquared / (dp + this.scSquared) - 0.5;

			this.delta.scale(scaleFactor);

			this.pointMassAPos.sub(this.delta);
			this.pointMassBPos.add(this.delta);
		}
		else if (this.longConst != 0.0 && dp > this.lcSquared) {
			var scaleFactor;

			scaleFactor = this.lcSquared / (dp + this.lcSquared) - 0.5;

			this.delta.scale(scaleFactor);

			this.pointMassAPos.sub(this.delta);
			this.pointMassBPos.add(this.delta);
		}
	}
}

function Stick(pointMassA, pointMassB) {
	function pointMassDist(pointMassA, pointMassB) {
		var aXbX, aYbY;

		aXbX = pointMassA.getXPos() - pointMassB.getXPos();
		aYbY = pointMassA.getYPos() - pointMassB.getYPos();

		return Math.sqrt(aXbX * aXbX + aYbY * aYbY);
	}

	this.length = pointMassDist(pointMassA, pointMassB);
	this.lengthSquared = this.length * this.length;
	this.pointMassA = pointMassA;
	this.pointMassB = pointMassB;
	this.delta = new Vector(0.0, 0.0);

	this.getPointMassA = function () {
		return this.pointMassA;
	}

	this.getPointMassB = function () {
		return this.pointMassB;
	}

	this.scale = function (scaleFactor) {
		this.length *= scaleFactor;
		this.lengthSquared = this.length * this.length;
	}

	this.sc = function () {
		var dotProd, scaleFactor;
		var pointMassAPos, pointMassBPos;

		pointMassAPos = this.pointMassA.getPos();
		pointMassBPos = this.pointMassB.getPos();

		this.delta.set(pointMassBPos);
		this.delta.sub(pointMassAPos);

		dotProd = this.delta.dotProd(this.delta);

		scaleFactor = this.lengthSquared / (dotProd + this.lengthSquared) - 0.5;
		this.delta.scale(scaleFactor);

		pointMassAPos.sub(this.delta);
		pointMassBPos.add(this.delta);
	}

	this.setForce = function (force) {
		this.pointMassA.setForce(force);
		this.pointMassB.setForce(force);
	}

	this.addForce = function (force) {
		this.pointMassA.addForce(force);
		this.pointMassB.addForce(force);
	}

	this.move = function (dt) {
		this.pointMassA.move(dt);
		this.pointMassB.move(dt);
	}

	this.draw = function (ctx, scaleFactor) {
		this.pointMassA.draw(ctx, scaleFactor);
		this.pointMassB.draw(ctx, scaleFactor);

		ctx.lineWidth = 3;
		ctx.fillStyle = '#000000';
		ctx.strokeStyle = '#000000';
		ctx.beginPath();
		ctx.moveTo(this.pointMassA.getXPos() * scaleFactor,
			this.pointMassA.getYPos() * scaleFactor);
		ctx.lineTo(this.pointMassB.getXPos() * scaleFactor,
			this.pointMassB.getYPos() * scaleFactor);
		ctx.stroke();
	}
}

function Spring(restLength, stiffness, damper, pointMassA, pointMassB) {
	this.restLength = restLength;
	this.stiffness = stiffness;
	this.damper = damper;
	this.pointMassA = pointMassA;
	this.pointMassB = pointMassB;
	this.tmp = Vector(0.0, 0.0);

	this.sc = function (env) {
		env.collistion(this.pointMassA.getPos(), this.pointMassA.getPrevPos());
		env.collistion(this.pointMassB.getPos(), this.pointMassB.getPrevPos());
	}

	this.move = function (dt) {
		var aXbX;
		var aYbY;
		var springForce;
		var length;

		aXbX = this.pointMassA.getXPos() - this.pointMassB.getXPos();
		aYbY = this.pointMassA.getYPos() - this.pointMassB.getYPos();

		length = Math.sqrt(aXbX * aXbX + aYbY * aYbY);
		springForce = this.stiffness * (length / this.restLength - 1.0);

		var avXbvX;
		var avYbvY;
		var damperForce;

		avXbvX = this.pointMassA.getXVel() - this.pointMassB.getXVel();
		avYbvY = this.pointMassA.getYVel() - this.pointMassB.getYVel();

		damperForce = avXbvX * aXbX + avYbvY * aYbY;
		damperForce *= this.damper;

		var fx;
		var fy;

		fx = (springForce + damperForce) * aXbX;
		fy = (springForce + damperForce) * aYbY;

		this.tmp.setX(-fx);
		this.tmp.setY(-ft);
		this.pointMassA.addForce(this.tmp);

		this.tmp.setX(fx);
		this.tmp.setY(ft);
		this.pointMassB.addForce(this.tmp);

		this.pointMassA.move(dt);
		this.pointMassB.move(dt);
	}

	this.addForce = function (force) {
		this.pointMassA.addForce(force);
		this.pointMassB.addForce(force);
	}

	this.draw = function (ctx, scaleFactor) {
		this.pointMassA.draw(ctx, scaleFactor);
		this.pointMassB.draw(ctx, scaleFactor);

		ctx.fillStyle = '#000000';
		ctx.strokeStyle = '#000000';
		ctx.beginPath();
		ctx.moveTo(this.pointMassA.getXPos() * scaleFactor,
			this.pointMassA.getYPos() * scaleFactor);
		ctx.lineTo(this.pointMassB.getXPos() * scaleFactor,
			this.pointMassB.getXPos() * scaleFactor);
		ctx.stroke();
	}
}

function Blob(x, y, radius, numPointMasses) {
	this.x = x;
	this.y = y;
	this.sticks = new Array();
	this.pointMasses = new Array();
	this.joints = new Array();
	this.middlePointMass;
	this.radius = radius;
	this.clicked = false;

	var low = 0.95, high = 1.05;

	function clampIndex(index, maxIndex) {
		index += maxIndex;
		return index % maxIndex;
	}

	let t = 0.0;
	for (var i = 0; i < numPointMasses; i++) {
		this.pointMasses[i] = new PointMass(Math.cos(t) * radius + x, Math.sin(t) * radius + y, 1.0);
		t += 2.0 * Math.PI / numPointMasses;
	}

	this.middlePointMass = new PointMass(x, y, 1.0);

	for (var i = 0; i < numPointMasses; i++) {
		this.sticks[i] = new Stick(this.pointMasses[i], this.pointMasses[clampIndex(i + 1, numPointMasses)]);
	}

	let p = 0;
	for (var i = 0; i < numPointMasses; i++) {
		this.joints[p++] = new Joint(this.pointMasses[i], this.pointMasses[clampIndex(i + numPointMasses / 2 + 1, numPointMasses)], low, high);
		this.joints[p++] = new Joint(this.pointMasses[i], this.middlePointMass, high * 0.9, low * 1.1); // 0.8, 1.2 works  // 0.9 1.1 //
	}

	this.getMiddlePointMass = function () {
		return this.middlePointMass;
	}

	this.getRadius = function () {
		return this.radius;
	}

	this.getXPos = function () {
		return this.middlePointMass.getXPos();
	}

	this.getYPos = function () {
		return this.middlePointMass.getYPos();
	}

	this.scale = function (scaleFactor) {
		for (var i = 0; i < this.joints.length; i++) {
			this.joints[i].scale(scaleFactor);
		}
		for (var i = 0; i < this.sticks.length; i++) {
			this.sticks[i].scale(scaleFactor);
		}
		this.radius *= scaleFactor;
	}

	this.move = function (dt) {
		for (let i = 0; i < this.pointMasses.length; i++) {
			this.pointMasses[i].move(dt);
		}
		this.middlePointMass.move(dt);
	}

	this.sc = function (env) {
		for (let j = 0; j < 4; j++) {
			for (var i = 0; i < this.pointMasses.length; i++) {
				if (env.collision(this.pointMasses[i].getPos())) {
					this.pointMasses[i].setFriction(0.75);
				}
				else {
					this.pointMasses[i].setFriction(0.01);
				}
			}
			for (var i = 0; i < this.sticks.length; i++) {
				this.sticks[i].sc(env);
			}
			for (var i = 0; i < this.joints.length; i++) {
				this.joints[i].sc();
			}
		}
	}

	this.setForce = function (force) {
		for (let i = 0; i < this.pointMasses.length; i++) {
			this.pointMasses[i].setForce(force);
		}
		this.middlePointMass.setForce(force);
	}

	this.addForce = function (force) {
		for (let i = 0; i < this.pointMasses.length; i++) {
			this.pointMasses[i].addForce(force);
		}
		this.middlePointMass.addForce(force);
		this.pointMasses[0].addForce(force);
		this.pointMasses[0].addForce(force);
		this.pointMasses[0].addForce(force);
		this.pointMasses[0].addForce(force);
	}

	this.getPointMass = function (index) {
		index += this.pointMasses.length;
		index = index % this.pointMasses.length;
		return this.pointMasses[index];
	}

	this.drawBody = function (ctx, scaleFactor) {
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(this.pointMasses[0].getXPos() * scaleFactor,
			this.pointMasses[0].getYPos() * scaleFactor);

		for (let i = 0; i < this.pointMasses.length; i++) {
			var px, py, nx, ny, tx, ty, cx, cy;
			var prevPointMass, currentPointMass, nextPointMass, nextNextPointMass;

			prevPointMass = this.getPointMass(i - 1);
			currentPointMass = this.pointMasses[i];
			nextPointMass = this.getPointMass(i + 1);
			nextNextPointMass = this.getPointMass(i + 2);

			tx = nextPointMass.getXPos();
			ty = nextPointMass.getYPos();

			cx = currentPointMass.getXPos();
			cy = currentPointMass.getYPos();

			px = cx * 0.5 + tx * 0.5;
			py = cy * 0.5 + ty * 0.5;

			nx = cx - prevPointMass.getXPos() + tx - nextNextPointMass.getXPos();
			ny = cy - prevPointMass.getYPos() + ty - nextNextPointMass.getYPos();

			px += nx * 0.16;
			py += ny * 0.16;

			px = px * scaleFactor;
			py = py * scaleFactor;

			tx = tx * scaleFactor;
			ty = ty * scaleFactor;

			ctx.bezierCurveTo(px, py, tx, ty, tx, ty);
		}

		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}

	this.draw = function (ctx, scaleFactor, color) {
		var up, ori, ang;

		ctx.strokeStyle = color;
		ctx.fillStyle = "rgba(255,255,255,0)";

		this.drawBody(ctx, scaleFactor);

		ctx.save();
		ctx.translate(this.middlePointMass.getXPos() * scaleFactor, (this.middlePointMass.getYPos() - 0.35 * this.radius) * scaleFactor);

		up = new Vector(0.0, -1.0);
		ori = new Vector(0.0, 0.0);
		ori.set(this.pointMasses[0].getPos());
		ori.sub(this.middlePointMass.getPos());
		ang = Math.acos(ori.dotProd(up) / ori.length());
		if (ori.getX() < 0.0) {
			ctx.rotate(-ang);
		}
		else {
			ctx.rotate(ang);
		}

		ctx.restore();
	}

	this.centered = function (center) {
		tmpForce = new Vector(0.0, 0.0);

		if (this.getXPos() < center) {
			tmpForce.setX(2 * (Math.random() * 0.75 + 0.25));
		} else if (this.getXPos() > center) {
			tmpForce.setX(-2 * (Math.random() * 0.75 + 0.25));
		}

		this.addForce(tmpForce);
	}
}

var env;
var width = document.getElementById('blob').width;
var height = document.getElementById('blob').height;
var scaleFactor = 50;
var blob;
var gravity;
var outlineColor = "#000000";
var centerColor = "#000000";

function update() {
	var dt = 0.025;

	blob.move(dt);
	blob.sc(env);
	blob.setForce(gravity);
	blob.centered((width*0.5)/scaleFactor);
}

function draw() {
	var canvas = document.getElementById('blob');

	var ctx = canvas.getContext('2d');

	ctx.clearRect(0, 0, width, height);

	blob.draw(ctx, scaleFactor, outlineColor);

	blob.getMiddlePointMass().draw(ctx, scaleFactor, centerColor);
}

function timeout() {
	draw();
	update();
	window.requestAnimationFrame(timeout);
}

function init() {
	env = new Environment(3/scaleFactor, 3/scaleFactor, (width-6)/scaleFactor, (height - 8)/scaleFactor);
	blob = new Blob(1.0, 1.0, 0.5, 8);
	gravity = new Vector(0.0, 10.0);

	timeout();
}

init();