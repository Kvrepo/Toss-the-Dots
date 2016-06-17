var w=320;
var h=200;
var ctx;
var scaleX=1;
var scaleY=1;
var actW=scaleX*w;
var actH=scaleY*h;

var hero;
var keys=[];
var walls=[];
var sky=[];
var skyobj=[];
var mouseX;
var mouseY;
var enemysprite=[];
var enemies=[];
var projectiles=[];

var isdmg=false;

var sprites=[];
var spritessprites=[];
var spritemap=[];

var statusBG;
var divBG;

var floorImage;
var faces=[];

var actStatus;
var face;
var text;

var gridSize=64;

var sides; //for calculating the proper location of the mouse

var toRad=Math.PI/180;
var toDeg=180/Math.PI;
var twoPI=2*Math.PI;

var maxRays=w;
var stripW=1;
var planedist=(w/2)/Math.tan(30*toRad);
var floordraw=[];

var statusBar;

var loaded=0;

//var meter = new FPSMeter([ document.body ] [100]);

function point(x,y){
	this.x=x;
	this.y=y;
}
//16*10
var map=
[
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,2,2,2,2,2,0,0,0,0,2,2,0,0,1],
[1,0,2,0,0,0,0,2,0,0,0,2,2,0,0,1],
[1,0,2,0,2,0,0,2,0,0,0,0,0,0,0,1],
[1,0,2,0,2,0,0,0,0,0,0,2,0,0,0,1],
[1,0,2,2,2,0,0,0,0,0,0,0,2,2,0,1],
[1,0,0,0,0,0,0,0,0,2,0,0,0,2,0,1],
[1,0,0,0,0,0,0,0,0,2,0,0,0,0,0,1],
[1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
[1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,0,1,1,0,1,1,0,1,1,1,1,0,1],
[1,0,1,0,1,1,0,1,1,0,0,0,0,1,0,1],
[1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
[1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1]
];

var enemymap=[];

var everymap=[];

function pathfinding(start,end){
	var mapW=map[0].length;
	var mapH=map.length;
	var mapSize=mapW*mapH;
	function distanceFunction(Point,Goal){
		return Math.abs(Point.x-Goal.x)+Math.abs(Point.y-Goal.y);
	}
	function Node(Parent, Point){
		var newNode={
			Parent:Parent,
			value:Point.x+(Point.y*mapW),
			x:Point.x,
			y:Point.y,
			f:0,
			g:0
		};
		return newNode;
	}
	function canWalkHere(x, y){
		return ((everymap[y]!=null)&&
		(everymap[y][x]!=null)&&
		(everymap[y][x]<=0));
	};
	function Neighbours(x, y){
		var	N=y-1,
		S=y+1,
		E=x+1,
		W=x-1,
		myN=N>-1&&canWalkHere(x,N),
		myS=S<mapH&&canWalkHere(x,S),
		myE=E<mapW&&canWalkHere(E,y),
		myW=W>-1&&canWalkHere(W,y),
		result=[];
		if(myN)
		result.push({x:x, y:N});
		if(myE)
		result.push({x:E, y:y});
		if(myS)
		result.push({x:x, y:S});
		if(myW)
		result.push({x:W, y:y});
		return result;
	}
	function calculatePath(){
		var	mypathStart=Node(null, {x:start[0], y:start[1]});
		var mypathEnd=Node(null, {x:end[0], y:end[1]});
		var AStar=new Array(mapSize);
		var Open=[mypathStart];
		var Closed=[];
		var result=[];
		var myNeighbours;
		var myNode;
		var myPath;
		var length, max, min, i, j;
		while(length=Open.length){
			max=mapSize;
			min=-1;
			for(i=0;i<length;i++){
				if(Open[i].f<max){
					max=Open[i].f;
					min=i;
				}
			}
			myNode=Open.splice(min, 1)[0];
			if(myNode.value===mypathEnd.value){
				myPath=Closed[Closed.push(myNode)-1];
				do{
					result.push([myPath.x, myPath.y]);
				}
				while (myPath=myPath.Parent);
				AStar=Closed=Open=[];
				result.reverse();
			}else{
				myNeighbours=Neighbours(myNode.x, myNode.y);
				for(i=0,j=myNeighbours.length;i<j;i++){
					myPath = Node(myNode, myNeighbours[i]);
					if(!AStar[myPath.value]){
						myPath.g=myNode.g+distanceFunction(myNeighbours[i], myNode);
						myPath.f=myPath.g+distanceFunction(myNeighbours[i], mypathEnd);
						Open.push(myPath);
						AStar[myPath.value]=true;
					}
				}
				Closed.push(myNode);
			}
		}
		return result;
	}
	return calculatePath();
}

function collision(A){
	var j=Math.floor(A.x/gridSize);
	var k=Math.floor(A.y/gridSize);
	if(everymap[k][j]>0||enemymap[k][j]>0){
		return false;
	}else{
		return true;
	}
}

function ecollision(A){
	var j=Math.floor(A.x/gridSize);
	var k=Math.floor(A.y/gridSize);
	if(everymap[k][j]>0||enemymap[k][j]>0||(Math.floor(hero.x/gridSize)==j&&Math.floor(hero.y/gridSize)==k)){
		return false;
	}else{
		return true;
	}
}

var gameArea={
	canvas : document.createElement("canvas"),
	create : function(){
		this.canvas.width=actW;
		this.canvas.height=actH;
		this.context=this.canvas.getContext("2d");
		this.canvas.setAttribute("id","gameField");
		document.getElementById("game").appendChild(this.canvas);
		var divW=actW+2;
		var divH=actH;
		document.getElementById("game").style.minWidth=divW+"px";
		document.getElementById("game").style.maxWidth=divW+"px";
		document.getElementById("game").style.minHeight=divH+"px";
		document.getElementById("game").style.backgroundImage="url("+divBG.src+")";
		
		statusBar=document.createElement("div");
		statusBar.setAttribute("id","statusBar");
		document.getElementById("game").appendChild(statusBar);		
		document.getElementById("statusBar").style.width=actW+"px";
		document.getElementById("statusBar").style.height=actH/4+"px";
		
		var faceH=actH/4;
		var faceW=faces[0].width/(faces[0].height/faceH);
		
		var barW=(actW-faceW)/2;
		
		actStatus=document.createElement("div");
		actStatus.setAttribute("id","actStatus");
		document.getElementById("statusBar").appendChild(actStatus);		
		document.getElementById("actStatus").style.width=barW+"px";
		document.getElementById("actStatus").style.height=faceH+"px";
		document.getElementById("statusBar").style.backgroundImage="url("+statusBG.src+")";
		
		face=document.createElement("img");
		face.setAttribute("id","face");
		face.src=faces[0].src;
		document.getElementById("statusBar").appendChild(face);		
		document.getElementById("face").style.width=faceW+"px";
		document.getElementById("face").style.height=faceH+"px";
		
		text=document.createElement("div");
		text.setAttribute("id","text");
		document.getElementById("statusBar").appendChild(text);		
		document.getElementById("text").style.width=barW+"px";
		document.getElementById("text").style.height=faceH+"px";
		text.innerHTML="Panna: Hello there!";
		
		sides=document.getElementById("gameField").getBoundingClientRect();
		//document.getElementById("gameField").style.cursor = "none";
		this.canvas.getBoundingClientRect();
		document.getElementById("gameField").onmousemove=function(e){
			mouseX=e.clientX-sides.left;
			mouseY=e.clientY-sides.top;
		}
		document.getElementById("gameField").onclick=function(e){
		
		}
		window.addEventListener(
			'keyup', function(e){
				if(e.keyCode==65 || e.keyCode==87 || e.keyCode==68 || e.keyCode==83 || e.keyCode==38){
					keys[e.keyCode]=false;
				}
			}
		);
		window.addEventListener(
			'keydown', function(e){
				if(e.keyCode==65 || e.keyCode==87 || e.keyCode==68 || e.keyCode==83 || e.keyCode==38){
					keys[e.keyCode]=true;
				}
			}
		);
	},
	clear : function(){
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	}
}

function skyobject(x,y){
	this.x=x;
	this.y=y;
	this.draw=function(){
		ctx.fillStyle="white";
		ctx.fillRect(this.x,this.y,1,1);
	}
	this.update=function(mod){
		this.x+=mod;
		if(this.x<=0-10){
			this.x=w+5;
		}
		if(this.x>=w+10){
			this.x=0-5;
		}
	}
}

function protagonist(x,y){
	this.x=x;
	this.y=y;
	this.vx=1;
	this.vy=1;
	this.coldist=20;
	this.angle=0;
	this.turnspeed=2;
	this.speed=6;
	this.health=100;
	this.update=function(){
		//Left
		if(keys[65]){
			this.angle-=this.turnspeed;
			for(i=0;i<skyobj.length;i++){
				skyobj[i].update(1650*(this.turnspeed/360));
			}
		}
		//Right
		if(keys[68]){
			this.angle+=this.turnspeed;
			for(i=0;i<skyobj.length;i++){
				skyobj[i].update(-1650*(this.turnspeed/360));
			}
		}
		if(this.angle>360){
			this.angle=1;
		}
		if(this.angle<0){
			this.angle=360;
		}
		this.vx=Math.cos(this.angle*toRad);
		this.vy=Math.sin(this.angle*toRad);
		if(keys[87]){
			if(collision(new point(this.x+this.vx*this.coldist,this.y+this.vy*this.coldist))){
				this.x+=this.vx*this.speed;
				this.y+=this.vy*this.speed;
			}
		}
		if(keys[83]){
			if(collision(new point(this.x-this.vx*this.coldist,this.y-this.vy*this.coldist))){
				this.x-=this.vx*this.speed;
				this.y-=this.vy*this.speed;
			}
		}
		//Fire
		if(keys[38]){
			//new shot
			//pushed to shots
			//for cycle into main loop for every shot
			//update sprite map
			//new shot is called with this.vx and this.vy
			//If it reaches wall/enemy
			//Used flag will be set to true
			//in the same loop, if the ith projectile is true, then it gets deleted
		}
		actStatus.innerHTML=this.health;
	}
}

function simpleEnemy(k,j,img){
	this.x=k*gridSize+gridSize/2;
	this.y=j*gridSize+gridSize/2;
	this.j=j;
	this.k=k;
	this.img=img;
	this.angle=0;
	this.vx=0;
	this.vy=0;
	this.speed=1;
	this.coldist=32;
	this.maxPath=10; //Maybe it's "cheaper" to check the distance with the usual distance formula?
	this.visible=false;
	this.finaldestj;
	this.finaldestk;
	this.dmgStart=new Date().getTime();
	this.elapsed=this.dmgStart+10000;
	this.update=function(i){
		var path=pathfinding([this.k,this.j],[Math.floor(hero.x/gridSize),Math.floor(hero.y/gridSize)]);
		if(path.length>2&&path.length<this.maxPath){
			var destx=path[1][0]*gridSize+32;
			var desty=path[1][1]*gridSize+32;
			this.vx=(destx-this.x)/Math.sqrt((destx-this.x)*(destx-this.x)+(desty-this.y)*(desty-this.y));
			this.vy=(desty-this.y)/Math.sqrt((destx-this.x)*(destx-this.x)+(desty-this.y)*(desty-this.y));
			this.angle=Math.atan2(this.vy,this.vx)*toDeg;
			if(typeof(path[this.maxPath])!="undefined"){
				this.finaldestk=path[this.maxPath][0];
				this.finaldestj=path[this.maxPath][1];
			}
		}else{
			if(this.finaldestk==this.k&&this.finaldestj==this.j){
				this.vx=0;
				this.vy=0;	
			}
		}
		if(!ecollision(new point(this.x+this.vx*this.coldist,this.y+this.vy*this.coldist))){
			this.vx=0;
			this.vy=0;
		}
		this.x+=this.vx*this.speed;
		this.y+=this.vy*this.speed;
		this.j=Math.floor(this.y/gridSize);
		this.k=Math.floor(this.x/gridSize);
		enemymap[this.j][this.k]=i;
		if(path.length==2&&this.elapsed-this.dmgStart>1000){
			isdmg=true;
			hero.health-=20;
			this.dmgStart=new Date().getTime();
		}
		this.elapsed=new Date().getTime();
	}
}

function object(k,j,img){
	this.x=k*gridSize+gridSize/2;
	this.y=j*gridSize+gridSize/2;
	this.j=j;
	this.k=k;
	this.img=img;
	this.angle=0;
	this.visible=false;
	this.update=function(i){
		this.j=Math.floor(this.y/gridSize);
		this.k=Math.floor(this.x/gridSize);
		spritemap[this.j][this.k]=i;
		everymap[this.j][this.k]=i;
	}
}

function starCreation(){
	for(i=0;i<40;i++){
		var x=Math.floor(Math.random()*w);
		var y=Math.floor(Math.random()*(h/2));
		/*var chancex=Math.random();
		var chancey=Math.random();
		var sx;
		var sy;
		if(chancex>0.5){
			sx=Math.random();
		} else {
			sx=(Math.random())-1;
		}
		if(chancey>0.5){
			sy=Math.random();
		} else {
			sy=(Math.random())-1;
		}
		var rad=Math.random()*100;
		var tone=Math.floor(Math.random()*(60))+150;
		var trans=Math.random();
		var color="rgba("+tone+","+tone+","+tone+","+trans+")";*/
		skyobj.push(new skyobject(x,y));
	}
}

function start(){
	faces[0]=new Image();
	faces[0].addEventListener("load", function () {allLoaded();});
	faces[0].src="assets/img/face1.png";
	faces[1]=new Image();
	faces[1].addEventListener("load", function () {allLoaded();});
	faces[1].src="assets/img/face2.png";
	walls[1]=new Image();
	walls[1].addEventListener("load", function () {allLoaded();});
	walls[1].src="assets/img/wall2.png";
	walls[2]=new Image();
	walls[2].addEventListener("load", function () {allLoaded();});
	walls[2].src="assets/img/wall1.png";
	sky[0]=new Image();
	sky[0].addEventListener("load", function () {allLoaded();});
	sky[0].src="assets/img/sky3.png";
	hero=new protagonist(90,90);
	spritessprites[0]=new Image();
	spritessprites[0].addEventListener("load", function () {allLoaded();});
	spritessprites[0].src="assets/img/gravestone.png";
	spritessprites[1]=new Image();
	spritessprites[1].addEventListener("load", function () {allLoaded();});
	spritessprites[1].src="assets/img/tree.png";
	sprites[0]=0;
	sprites.push(new object(5,6,spritessprites[0]));
	sprites.push(new object(5,7,spritessprites[0]));
	sprites.push(new object(6,6,spritessprites[0]));
	sprites.push(new object(6,7,spritessprites[0]));
	sprites.push(new object(5,8,spritessprites[1]));
	enemysprite[0]=new Image();
	enemysprite[0].addEventListener("load", function () {allLoaded();});
	enemysprite[0].src="assets/img/enemy2.png";
	enemysprite[1]=new Image();
	enemysprite[1].addEventListener("load", function () {allLoaded();});
	enemysprite[1].src="assets/img/enemyback.png";
	projectiles[0]=new Image();
	projectiles[0].addEventListener("load", function () {allLoaded();});
	projectiles[0].src="assets/img/fireball050.png";
	divBG=new Image();
	divBG.addEventListener("load", function () {allLoaded();});
	divBG.src="assets/img/floortest.png";
	statusBG=new Image();
	statusBG.addEventListener("load", function () {allLoaded();});
	statusBG.src="assets/img/statusbg.png";
	floorImage=new Image();
	floorImage.addEventListener("load", function () {allLoaded();});
	floorImage.src="assets/img/floortest2.png";
	enemies[0]=0;
	//When pushing an enemy: Y X
	enemies.push(new simpleEnemy(8,5,enemysprite[0]));
	enemies.push(new simpleEnemy(14,1,enemysprite[0]));
	//enemies.push(new simpleEnemy(6,8,enemysprite[0]));
	//starCreation();
	for(j=0;j<map.length;j++){
		enemymap[j]=[];
		spritemap[j]=[];
		everymap[j]=[];
		for(k=0;k<map[0].length;k++){
			enemymap[j][k]=0;
			spritemap[j][k]=0;
			everymap[j][k]=map[j][k];
		}
	}
}

function allLoaded(){
	loaded++;
	document.getElementById("game").innerHTML="Loading "+loaded+"/13";
	if(loaded==13){
		document.getElementById("game").innerHTML="";
		gameArea.create();
		ctx=gameArea.context;
		ctx.scale(scaleX,scaleY);
		requestAnimationFrame(updateArea);
	}
}

function direction(A,B){
	//-1 if left,
	//1 if right
	//0 if the same
	return Math.sign(A.y*B.x-B.y*A.x);
}

function turn(A,B,C){
	var P=new point(B.x-A.x,B.y-A.y);
	var Q=new point(C.x-A.x,C.y-A.y);
	return direction(P,Q);
}

function between(r,s,t){
	if((r<=s&&s<=t)||(t<=s&&s<=r)){
		return true;
	} else {
		return false;
	}
}

function onit(A,B,C){
	if(turn(A,B,C)==0&&between(A.x,C.x,B.x)&&between(A.y,C.y,B.y)){
		return true;
	} else {
		return false;
	}
}

function intersect(A,B,C,D){
	if(
	(turn(A,B,C)*turn(A,B,D)<0&&
	turn(C,D,A)*turn(C,D,B)<0)||
	onit(A,B,C)||onit(A,B,D)||onit(C,D,A)||onit(C,D,B)
	){
		return true;
	} else {
		return false;
	}
}

function rays(){
	var whatToDraw=[];
	var onedeg=60/maxRays;
	var actRay=(maxRays/2)*onedeg; //90 degrees -> 0.56; 60 degrees -> 0.38; 75 degrees -> 0.45
	var mapw=map[0].length*gridSize;
	var maph=map.length*gridSize;
	var a;	
	var A, B, C, D;
	var hit;
	
	D=new point(hero.x,hero.y);
	for(i=0;i<maxRays;i++){
		hit=false;
		a=(hero.angle-actRay)*toRad;
		var tmpx=1;
		var tmpy=1;
		var length=1;
		while(!hit&&tmpx>0&&tmpx<mapw&&tmpy>0&&tmpy<maph){
			tmpx=Math.floor(Math.cos(a)*length+hero.x);
			tmpy=Math.floor(Math.sin(a)*length+hero.y);
			var j=Math.floor(tmpy/gridSize);
			var k=Math.floor(tmpx/gridSize);
			if(map[j][k]>0){
				hit=true;
				C=new point(Math.floor(tmpx),Math.floor(tmpy));
				var tmpa=hero.angle-actRay;
				//Top side
				A=new point(k*gridSize,j*gridSize);
				B=new point(k*gridSize+gridSize,j*gridSize);
				if(intersect(A,B,C,D)){
					var tmp=(((D.x-C.x)*(A.y-C.y))-((D.y-C.y)*(A.x-C.x)))/(((D.y-C.y)*(B.x-A.x))-((D.x-C.x)*(B.y-A.y)));
					var x=A.x+tmp*(B.x-A.x);
					var y=A.y+tmp*(B.y-A.y);
					var dist=Math.floor(Math.sqrt(((D.x-x)*(D.x-x))+((D.y-y)*(D.y-y)))*Math.cos(actRay*toRad));
					whatToDraw.push({dist: dist, type: map[j][k], ray: i, offset: Math.floor(x%gridSize), type2: "w", corrector: Math.cos(actRay*toRad)});
				}else{
					//Bottom
					A=new point(k*gridSize,j*gridSize+gridSize);
					B=new point(k*gridSize+gridSize,j*gridSize+gridSize);
					if(intersect(A,B,C,D)){
						var tmp=(((D.x-C.x)*(A.y-C.y))-((D.y-C.y)*(A.x-C.x)))/(((D.y-C.y)*(B.x-A.x))-((D.x-C.x)*(B.y-A.y)));
						var x=A.x+tmp*(B.x-A.x);
						var y=A.y+tmp*(B.y-A.y);
						var dist=Math.floor(Math.sqrt(((D.x-x)*(D.x-x))+((D.y-y)*(D.y-y)))*Math.cos(actRay*toRad));
						whatToDraw.push({dist: dist, type: map[j][k], ray: i, offset: Math.floor(x%gridSize), type2: "w", corrector: Math.cos(actRay*toRad)});
					}else{
						//Right side
						A=new point(k*gridSize+gridSize,j*gridSize);
						B=new point(k*gridSize+gridSize,j*gridSize+gridSize);
						if(intersect(A,B,C,D)){
							var tmp=(((D.x-C.x)*(A.y-C.y))-((D.y-C.y)*(A.x-C.x)))/(((D.y-C.y)*(B.x-A.x))-((D.x-C.x)*(B.y-A.y)));
							var x=A.x+tmp*(B.x-A.x);
							var y=A.y+tmp*(B.y-A.y);
							var dist=Math.floor(Math.sqrt(((D.x-x)*(D.x-x))+((D.y-y)*(D.y-y)))*Math.cos(actRay*toRad));
							whatToDraw.push({dist: dist, type: map[j][k], ray: i, offset: Math.floor(y%gridSize), type2: "w", corrector: Math.cos(actRay*toRad)});
						}else{
							//Left side
							A=new point(k*gridSize,j*gridSize);
							B=new point(k*gridSize,j*gridSize+gridSize);
							if(intersect(A,B,C,D)){
								var tmp=(((D.x-C.x)*(A.y-C.y))-((D.y-C.y)*(A.x-C.x)))/(((D.y-C.y)*(B.x-A.x))-((D.x-C.x)*(B.y-A.y)));
								var x=A.x+tmp*(B.x-A.x);
								var y=A.y+tmp*(B.y-A.y);
								var dist=Math.floor(Math.sqrt(((D.x-x)*(D.x-x))+((D.y-y)*(D.y-y)))*Math.cos(actRay*toRad));
								whatToDraw.push({dist: dist, type: map[j][k], ray: i, offset: Math.floor(y%gridSize), type2: "w", corrector: Math.cos(actRay*toRad)});
							}
						}
					}
				}
			} else {
				length++;
			}
				//Don't forget! It's enemy map!
				if(enemymap[j][k]>0&&enemies[enemymap[j][k]].visible==false){
					var e=enemies[enemymap[j][k]];
					e.visible=true; //So 1 ray detects it only once
					var theta=Math.atan((hero.y-e.y)/(hero.x-e.x));
					//Or e.x-32
					if(e.x<hero.x){
						A=new point(e.x+32*Math.cos((90*toRad)+(theta)),e.y+32*Math.sin((90*toRad)+(theta)));
					} else if(e.x>=hero.x){
						A=new point(e.x-32*Math.cos((90*toRad)+(theta)),e.y-32*Math.sin((90*toRad)+(theta)));
					}
					var mid=new point(hero.vx*64+hero.x,hero.vy*64+hero.y);
					var a1=Math.atan2(hero.y-mid.y,hero.x-mid.x);
					var a2=Math.atan2(hero.y-A.y,hero.x-A.x);
					//If a1-a2<0 then e is on the right. If >0 then it's on the left.
					var a3=Math.sin(a1-a2);
					var hyp=Math.sqrt((e.x-hero.x)*(e.x-hero.x)+(e.y-hero.y)*(e.y-hero.y))*Math.cos(actRay*toRad);
					var height=(Math.tan(Math.atan((gridSize/2)/hyp))*planedist)*2;
					var ey=(h-height)/2;
					var ex=(w/2)-Math.tan(a3)*planedist;
					whatToDraw.push({dist: hyp, type: enemymap[j][k], type2: "e", height: height, x: ex, y: ey});
				}
				if(spritemap[j][k]>0&&sprites[spritemap[j][k]].visible==false){
					var e=sprites[spritemap[j][k]];
					e.visible=true; //So 1 ray detects it only once
					var theta=Math.atan((hero.y-e.y)/(hero.x-e.x));
					//Or e.x-32
					if(e.x<hero.x){
						A=new point(e.x+32*Math.cos((90*toRad)+(theta)),e.y+32*Math.sin((90*toRad)+(theta)));
					} else if(e.x>=hero.x){
						A=new point(e.x-32*Math.cos((90*toRad)+(theta)),e.y-32*Math.sin((90*toRad)+(theta)));
					}
					var mid=new point(hero.vx*64+hero.x,hero.vy*64+hero.y);
					var a1=Math.atan2(hero.y-mid.y,hero.x-mid.x);
					var a2=Math.atan2(hero.y-A.y,hero.x-A.x);
					//If a1-a2<0 then e is on the right. If >0 then it's on the left.
					var a3=Math.sin(a1-a2);
					var hyp=Math.sqrt((e.x-hero.x)*(e.x-hero.x)+(e.y-hero.y)*(e.y-hero.y))*Math.cos(actRay*toRad);
					var height=(Math.tan(Math.atan((gridSize/2)/hyp))*planedist)*2;
					var ey=(h-height)/2;
					var ex=(w/2)-Math.tan(a3)*planedist;
					whatToDraw.push({dist: hyp, type: spritemap[j][k], type2: "s", height: height, x: ex, y: ey});
				}
		}
		actRay-=onedeg;
	}
	for(z=1;z<enemies.length;z++){
		enemies[z].visible=false;
	}
	for(z=1;z<sprites.length;z++){
		sprites[z].visible=false;
	}
	whatToDraw.sort(function(a,b){return b.dist - a.dist});
	for(i=0;i<whatToDraw.length;i++){
		switch(whatToDraw[i].type2){
			case "w":
				var actheight=(Math.tan(Math.atan((gridSize/2)/whatToDraw[i].dist))*planedist)*2;
				var x=whatToDraw[i].ray*stripW;
				var y=(h-actheight)/2;
				ctx.drawImage(walls[whatToDraw[i].type],whatToDraw[i].offset,0,1,walls[whatToDraw[i].type].height,x,y,stripW,actheight);
				var alpha=(whatToDraw[i].dist/whatToDraw[i].corrector)/(planedist*3); //Originally: 4 and 2 
				ctx.fillStyle="rgba(17,10,5,"+alpha+")"; //This should not be black
				ctx.fillRect(x,y,stripW,actheight);
				break;
			case "e":
				ctx.globalAlpha=(planedist*1.5)/whatToDraw[i].dist;
				ctx.drawImage(enemies[whatToDraw[i].type].img,whatToDraw[i].x,whatToDraw[i].y,whatToDraw[i].height,whatToDraw[i].height);
				ctx.globalAlpha=1;
				break;
			case "s":
				ctx.globalAlpha=(planedist*1.5)/whatToDraw[i].dist;
				ctx.drawImage(sprites[whatToDraw[i].type].img,whatToDraw[i].x,whatToDraw[i].y,whatToDraw[i].height,whatToDraw[i].height);
				ctx.globalAlpha=1;
				break;
		}
	}
}

var cnt=0;

function updateArea(){
	//meter.tickStart();
	gameArea.clear();
	hero.update();
	for(j=0;j<map.length;j++){
		enemymap[j]=[];
		spritemap[j]=[];
		for(k=0;k<map[0].length;k++){
			enemymap[j][k]=0;
			spritemap[j][k]=0;
		}
	}
	for(i=1;i<sprites.length;i++){
		sprites[i].update(i);
	}
	for(i=1;i<enemies.length;i++){
		enemies[i].update(i);
	}
	ctx.drawImage(sky[0],0,0,w,h/2);
	//for(i=0;i<skyobj.length;i++){
	//	skyobj[i].draw();
	//}
	ctx.drawImage(floorImage,0,h/2,w,h/2);
	rays();
	if(isdmg&&cnt<10){
		ctx.fillStyle="rgba(255,0,0,0.2)";
		ctx.fillRect(0,0,w,h);
		face.src=faces[1].src;
		cnt++;
	}else{
		isdmg=false;
		face.src=faces[0].src;
		cnt=0;
	}
	requestAnimationFrame(updateArea);
	//meter.tick();
}
	//Mini map
	/*var mapw=map[0].length;
	var maph=map.length;
	for(i=0;i<maph;i++){
		for(j=0;j<mapw;j++){
			if(map[i][j]>0){
				ctx.fillStyle="grey";
				ctx.fillRect((j+2)*4,(i+10)*4,4,4);
			}
		}
	}
	ctx.fillStyle="green";
	ctx.fillRect((Math.floor(hero.x/gridSize)+2)*4,(Math.floor(hero.y/gridSize)+10)*4,4,4);	
	ctx.fillStyle="red";
	ctx.fillRect((enemies[1].k+2)*4,(enemies[1].j+10)*4,4,4);*/