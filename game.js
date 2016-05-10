var stuff=[];
var sblock=[];
var stars=[];
var curTiles=[];
var curLines=[];
var curFloorMap=[];
var curBg;
var curFloor;
var curWin;
var arrows=true;
var speedChanger=8;
var sounds=[];
var images=[];
var mute=false;
var reset=false;
var finish=false;
var levelLength=level.length;
var loaded=0;
var gameState=9;
var fadeCnt=1;
var enter=false;
var maxDist=0;
var maxDistId=0;
var heroID=0;
var l=0;
var keyCode;
var startTouchX=0;
var startTouchY=0;
var startTime;
var elTime;
var datecnt=true;

var gameArea={
	canvas : document.createElement("canvas"),
	create : function(){
		this.canvas.width=480;
		this.canvas.height=320;
		this.context=this.canvas.getContext("2d");
		sounds[0].play();
		document.getElementById("game").appendChild(this.canvas);
		window.addEventListener('touchstart',function(e){
			if(gameState==4){
				enter=true;				
			}
			if(gameState==0){
				if(260<e.touches[0].pageY){
					enter=true;
				}
				if(160>e.touches[0].pageY&&level.length!=l+1){
					l++;
				}
				if(260>e.touches[0].pageY && 160<e.touches[0].pageY&&l!=0){
					l--;
				}
			}
			if(gameState==1){
				startTouchX=e.touches[0].pageX;
				startTouchY=e.touches[0].pageY;
			}
			e.preventDefault();
		}
		);
		window.addEventListener('touchend',function(e){
			if(gameState==1&&arrows){
				var changeX=Math.abs(e.changedTouches[0].pageX-startTouchX);
				var changeY=Math.abs(e.changedTouches[0].pageY-startTouchY);
				if(changeX>changeY){
					if(e.changedTouches[0].pageX>startTouchX){
						keyCode=39;
					} else if(e.changedTouches[0].pageX<startTouchX){
						keyCode=37;
					}
				} else if(changeX<changeY){
					if(e.changedTouches[0].pageY>startTouchY){
						keyCode=40;
					} else if(e.changedTouches[0].pageY<startTouchY){
						keyCode=38;
					}
				}
				arrows=false;
				move(keyCode);
			}
			e.preventDefault();
			startTouchX=0;
			startTouchY=0;
		}
		);
		window.addEventListener('touchmove', function(e){
			e.preventDefault()
		}, false);
		window.addEventListener(
			'keydown', function(e){
				e.preventDefault();
				if((e.keyCode==37 || e.keyCode==38 || e.keyCode==39 || e.keyCode==40)&&gameState==1&&arrows){
						arrows=false;
						keyCode=e.keyCode;
						move(keyCode);
					}
				if((e.keyCode==13)){
						enter=true;
					}
				if(e.keyCode==82&&gameState==1){
						gameState=3;
						reset=true;
					}
				if(e.keyCode==38&&level.length!=l+1&&gameState==0){
						l++;
				}
				if(e.keyCode==40&&l!=0&&gameState==0){
						l--;
				}
				if(e.keyCode==77){
						if(!mute){
							Howler.mute();
							mute=true;
						} else {
							Howler.unmute();
							mute=false;
						}
					}
				}
		);
	},
	clear : function(){
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	}
}

function loader() {
	images[0]=new Image();
	images[0].onload=function(){loaded++;};
	images[0].src="assets/pictures/mute.png";
	images[1]=new Image();
	images[1].onload=function(){loaded++;};
	images[1].src="assets/pictures/arrow1.png";
	images[2]=new Image();
	images[2].onload=function(){loaded++;};
	images[2].src="assets/pictures/arrow2.png";
	images[3]=new Image();
	images[3].onload=function(){loaded++;};
	images[3].src="assets/pictures/arrow3.png";
	sounds[0]=new Howl({urls:['assets/sounds/Video-Game-Brain-Drain.ogg','assets/sounds/Video-Game-Brain-Drain.m4a'],onload:function(){loaded++;},loop: true,volume: 0.3});
	sounds[1]=new Howl({urls:['assets/sounds/ertfelda__correct.ogg','assets/sounds/ertfelda__correct.m4a'],onload:function(){loaded++;},volume: 0.4});
	sounds[2]=new Howl({urls:['assets/sounds/fins__error.ogg','assets/sounds/fins__error.m4a'],onload:function(){loaded++;},volume: 0.4});
	sounds[3]=new Howl({urls:['assets/sounds/justinbw__buttonchime02up.ogg','assets/sounds/justinbw__buttonchime02up.m4a'],onload:function(){loaded++;},volume: 0.5});
	gameStart();
}

function unloader(){

}

function gameStart(){
	nullTiles();
	gameArea.create();
	loadLevel(l);
	starCreation();
	requestAnimationFrame(updateArea);
}

function thing(w, h, x, y, r, g, b, type, n){
	this.width=w;
	this.height=h;
	this.x=x;
	this.y=y;
	this.speedX=0;
	this.speedY=0;
	this.destX;
	this.destY;
	this.type=type;
	this.tile=n;
	this.direction;
	this.r=r;
	this.g=g;
	this.b=b;
	this.a=1;
	this.decoyWidth=0;
	this.movementState=0;
	this.update=function(){
		ctx=gameArea.context;
		ctx.fillStyle="rgba("+this.r+","+this.g+","+this.b+","+this.a+")";
		if(this.type=="hero" || this.type=="mdeath" || this.type=="move"){
			ctx.beginPath();
			ctx.arc(this.x+16,this.y+16,16,0,2*Math.PI);
			ctx.fill();
		} else {
			ctx.fillRect(this.x,this.y,this.width,this.height);
		}
	}
	this.newPosition=function(){
		if(this.direction=="right" && this.x<this.destX){this.x+=this.speedX; this.movementState=1;}
		if(this.direction=="left" && this.x>this.destX){this.x+=this.speedX; this.movementState=1;}
		if(this.direction=="up" && this.y<this.destY){this.y+=this.speedY; this.movementState=1;}
		if(this.direction=="down" && this.y>this.destY){this.y+=this.speedY; this.movementState=1;}
		if(this.direction=="right" && this.x==this.destX && this.movementState==1){sounds[1].play(); this.movementState=0;}
		if(this.direction=="left" && this.x==this.destX && this.movementState==1){sounds[1].play(); this.movementState=0;}
		if(this.direction=="up" && this.y==this.destY && this.movementState==1){sounds[1].play(); this.movementState=0;}
		if(this.direction=="down" && this.y==this.destY && this.movementState==1){sounds[1].play(); this.movementState=0;}
	}
}

function win(x,y,r,g,b){
	this.x=x+16;
	this.y=y+16;
	this.width=32;
	this.height=32;
	this.angle=0;
	this.r=r;
	this.g=g;
	this.b=b;
	this.grow=true;
	this.update=function(){
		ctx=gameArea.context;
		for(i=0;i<6;i++){
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(this.angle+0.15*i);
			ctx.lineWidth=3;
			ctx.strokeStyle="rgba("+this.r+","+this.g+","+this.b+","+0.18*i+")";
			ctx.strokeRect(this.width/-2,this.height/-2,this.width,this.height);
			ctx.restore();
		}
		if(this.width>38){this.grow=false;}else if(this.width<30){this.grow=true;}
	}
}

function star(x,y,radius,color,speedx,speedy){
	this.x=x;
	this.y=y;
	this.r=radius;
	this.c=color;
	this.sx=speedx;
	this.sy=speedy;
	this.update=function(){
		ctx=gameArea.context;
		ctx.globalAlpha=1;
		ctx.beginPath();
		ctx.fillStyle=this.c;
		ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
		ctx.fill();
	}
	this.newPosition=function(){
		this.x+=this.sx;
		this.y+=this.sy;
		if(this.x<=0){
			this.sx=Math.random();
		} else if(this.x>=480){
			this.sx=(Math.random())-1;
		}
		if(this.y<=0){
			this.sy=Math.random();
		} else if(this.y>=320){
			this.sy=(Math.random())-1;
		}
	}
}

function starCreation(){
	for(i=0;i<80;i++){
		var x=Math.floor(Math.random()*480);
		var y=Math.floor(Math.random()*321);
		var chancex=Math.random();
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
		var color="rgba("+tone+","+tone+","+tone+","+trans+")";
		stars.push(new star(x,y,rad,color,sx,sy));
	}
}

function tileMap(){
	ctx=gameArea.context;
	ctx.beginPath();
	ctx.moveTo(curTiles[curLines[0]].r,curTiles[curLines[0]].c);
	for(i=1;i<curLines.length;i++){
		ctx.lineTo(curTiles[curLines[i]].r,curTiles[curLines[i]].c);
	}
	ctx.lineWidth=2;
	ctx.strokeStyle="white";
	ctx.stroke();
	ctx.lineWidth=8;
	ctx.closePath();
	ctx.strokeStyle="rgba("+colorSchemes[0].oR+","+colorSchemes[0].oG+","+colorSchemes[0].oB+","+0.7+")";
	ctx.stroke();
	ctx.fillStyle=curFloor;
	for(i=0;i<curFloorMap.length;i++){
		ctx.fillRect(curTiles[curFloorMap[i]].r,curTiles[curFloorMap[i]].c,32,32);
	}
}

function tiles(r,c,type){
	this.r=r;
	this.c=c;
	this.type=type;
	this.who=0;
}

function nullTiles(){
	var n=0;
	for(i=0;i<10;i++){
		for(j=0;j<15;j++){
			curTiles[n]=new tiles(j*32,i*32,"empty");
			n++;
		}
	}
}

function loadLevel(l){
	var csRandom=0;
	for(i=0;i<level[l].tile.length;i++){
		curTiles[level[l].tile[i].n].type=level[l].tile[i].type;
		switch(level[l].tile[i].type){
			case "hero":
				stuff.push(new thing(32,32,curTiles[level[l].tile[i].n].r,curTiles[level[l].tile[i].n].c,colorSchemes[csRandom].hR,colorSchemes[csRandom].hG,colorSchemes[csRandom].hB,level[l].tile[i].type,level[l].tile[i].n));
				break;
			case "move":
				stuff.push(new thing(32,32,curTiles[level[l].tile[i].n].r,curTiles[level[l].tile[i].n].c,colorSchemes[csRandom].mR,colorSchemes[csRandom].mG,colorSchemes[csRandom].mB,level[l].tile[i].type,level[l].tile[i].n));
				break;
			case "mdeath":
				stuff.push(new thing(32,32,curTiles[level[l].tile[i].n].r,curTiles[level[l].tile[i].n].c,colorSchemes[csRandom].dmR,colorSchemes[csRandom].dmG,colorSchemes[csRandom].dmB,level[l].tile[i].type,level[l].tile[i].n));
				break;
			case "sblock":
				sblock.push(new thing(32,32,curTiles[level[l].tile[i].n].r,curTiles[level[l].tile[i].n].c,colorSchemes[csRandom].sR,colorSchemes[csRandom].sG,colorSchemes[csRandom].sB,level[l].tile[i].type,level[l].tile[i].n));
				break;
			case "sdeath":
				sblock.push(new thing(32,32,curTiles[level[l].tile[i].n].r,curTiles[level[l].tile[i].n].c,colorSchemes[csRandom].dbR,colorSchemes[csRandom].dbG,colorSchemes[csRandom].dbB,level[l].tile[i].type,level[l].tile[i].n));
				break;
			}
	}
	for(i=0;i<stuff.length;i++){
		curTiles[stuff[i].tile].who=i;
	}
	curBg="rgba("+colorSchemes[csRandom].bgR+","+colorSchemes[csRandom].bgG+","+colorSchemes[csRandom].bgB+","+0.8+")";
	curFloor="rgba("+colorSchemes[csRandom].fR+","+colorSchemes[csRandom].fG+","+colorSchemes[csRandom].fB+","+0.6+")";
	curFloorMap=level[l].floor;
	curLines=level[l].linemap;
	curWin=new win(curTiles[level[l].win].r,curTiles[level[l].win].c,colorSchemes[csRandom].wR,colorSchemes[csRandom].wG,colorSchemes[csRandom].wB);	
}

function move(keyCode){
		for(i=0;i<stuff.length;i++){
			if(stuff[i].type=="hero" || stuff[i].type=="move" || stuff[i].type=="mdeath"){
				curTiles[stuff[i].tile].type="empty";
			}
		}
		
		for(i=stuff.length-1;i>=0;i--){
			for(j=1;j<=i;j++){
				if(stuff[j-1].tile>stuff[j].tile){
					var temp=stuff[j-1];
					stuff[j-1]=stuff[j];
					stuff[j]=temp;
				}
			}
		}
		
		if(keyCode==39 || keyCode==40){
			for(i=stuff.length-1;i>=0;i--){
				if(stuff[i].type=="hero" || stuff[i].type=="move" || stuff[i].type=="mdeath"){
					distanceCalc(stuff[i],keyCode,stuff[i].tile,stuff[i].type);
				}
			}
		}else if(keyCode==37 || keyCode==38){
			for(i=0;i<stuff.length;i++){
				if(stuff[i].type=="hero" || stuff[i].type=="move" || stuff[i].type=="mdeath"){
					distanceCalc(stuff[i],keyCode,stuff[i].tile,stuff[i].type);
				}
			}
		}
		for(i=0;i<stuff.length;i++){
			if(stuff[i].type=="hero"){
				heroID=i;
			}
		}
		if(keyCode==37 || keyCode==39){
			maxDist=Math.abs(stuff[0].destX-stuff[0].x);
			maxDistId=0;
			if(stuff.length>0){
				for(i=1;i<stuff.length;i++){
					var tmp=Math.abs(stuff[i].destX-stuff[i].x);
					if(tmp>maxDist){
						maxDist=tmp;
						maxDistId=i;
					}
				}
			}
		}else if(keyCode==38 || keyCode==40){
			maxDist=Math.abs(stuff[0].destY-stuff[0].y);
			maxDistId=0;
			if(stuff.length>0){
				for(i=1;i<stuff.length;i++){
					var tmp=Math.abs(stuff[i].destY-stuff[i].y);
					if(tmp>maxDist){
						maxDist=tmp;
						maxDistId=i;
					}
				}
			}	
		}
		for(i=0;i<stuff.length;i++){
			curTiles[stuff[i].tile].who=i;
		}
}

function distanceCalc(obj,e,n,curType){
	var dirX=0;
	var dirY=0;
	var calcBool=true;
	if(keyCode==39){dirX=1;}
	if(keyCode==37){dirX=-1;}
	if(keyCode==40){dirY=1;}
	if(keyCode==38){dirY=-1;}
	if(dirX==1){
		while(calcBool){
			if(curTiles[n+1].c==obj.y && curTiles[n+1].type=="empty"){
				n++;
			} else {
				obj.destX=curTiles[n].r;
				curTiles[n].type=obj.type;
				obj.tile=n;
				obj.direction="right";
				obj.speedX=dirX*speedChanger;
				calcBool=false;
			}
		}
	}
	if(dirX==-1){
		while(calcBool){
			if(curTiles[n-1].c==obj.y && curTiles[n-1].type=="empty"){
				n--;
			} else {
				obj.destX=curTiles[n].r;
				curTiles[n].type=obj.type;
				obj.tile=n;
				obj.direction="left";
				obj.speedX=dirX*speedChanger;
				calcBool=false;
			}
		}
	}
	if(dirY==1){
		while(calcBool){
			if(curTiles[n+15].r==obj.x && curTiles[n+15].type=="empty"){
				n+=15;
			} else {
				obj.destY=curTiles[n].c;
				curTiles[n].type=obj.type;
				obj.tile=n;
				obj.direction="up";
				obj.speedY=dirY*speedChanger;
				calcBool=false;
			}
		}
	}
	if(dirY==-1){
		while(calcBool){
			if(curTiles[n-15].r==obj.x && curTiles[n-15].type=="empty"){
				n-=15;
			} else {
				obj.destY=curTiles[n].c;
				curTiles[n].type=obj.type;
				obj.tile=n;
				obj.direction="down";
				obj.speedY=dirY*speedChanger;
				calcBool=false;
			}
		}
	}
}

function moveFinishCheck(){
	if(stuff[maxDistId].x==stuff[maxDistId].destX && (stuff[maxDistId].direction=="left" || stuff[maxDistId].direction=="right")){
		arrows=true;
	}
	if(stuff[maxDistId].y==stuff[maxDistId].destY && (stuff[maxDistId].direction=="up" || stuff[maxDistId].direction=="down")){
		arrows=true;		
	}
}

function death(obj){
	if(obj.a==1){sounds[2].play();}
	arrows=false;
	obj.a-=0.05;
	obj.decoyWidth=0;
	if(obj.a<=0){
		gameState=3;
		reset=true;		
	}
}

function eventChecker(){
	if(curTiles[level[l].win].r==stuff[heroID].x && curTiles[level[l].win].c==stuff[heroID].y){
		sounds[3].play();
		if(l==level.length-1){
			gameState=3;
			finish=true;
		} else {
			gameState=3;
		}
	}
	
	var heroTile=stuff[heroID].tile;	
	switch(stuff[heroID].direction){
		case "up":
			if(curTiles[heroTile+15].type=="mdeath" || curTiles[heroTile+15].type=="sdeath"){
				if(stuff[heroID].y==stuff[heroID].destY){
					death(stuff[heroID]);
				}
			}else if(curTiles[heroTile-15].type=="mdeath" || curTiles[heroTile-15].type=="sdeath"){
				if(stuff[heroID].y==stuff[heroID].destY && stuff[curTiles[heroTile-15].who].y==stuff[curTiles[heroTile-15].who].destY){
					death(stuff[heroID]);
				}		
			}
			break;
		case "down":
			if(curTiles[heroTile-15].type=="mdeath" || curTiles[heroTile-15].type=="sdeath"){
				if(stuff[heroID].y==stuff[heroID].destY){
					death(stuff[heroID]);
				}
			}else if(curTiles[heroTile+15].type=="mdeath" || curTiles[heroTile+15].type=="sdeath"){
				if(stuff[heroID].y==stuff[heroID].destY && stuff[curTiles[heroTile+15].who].y==stuff[curTiles[heroTile+15].who].destY){
					death(stuff[heroID]);
				}		
			}
			break;
		case "right":
			if(curTiles[heroTile+1].type=="mdeath" || curTiles[heroTile+1].type=="sdeath"){
				if(stuff[heroID].x==stuff[heroID].destX){
					death(stuff[heroID]);
				}
			}else if(curTiles[heroTile-1].type=="mdeath" || curTiles[heroTile-1].type=="sdeath"){
				if(stuff[heroID].x==stuff[heroID].destX && stuff[curTiles[heroTile-1].who].x==stuff[curTiles[heroTile-1].who].destX){
					death(stuff[heroID]);
				}		
			}
			break;
		case "left":
			if(curTiles[heroTile-1].type=="mdeath" || curTiles[heroTile-1].type=="sdeath"){
				if(stuff[heroID].x==stuff[heroID].destX){
					death(stuff[heroID]);
				}
			}else if(curTiles[heroTile+1].type=="mdeath" || curTiles[heroTile+1].type=="sdeath"){
				if(stuff[heroID].x==stuff[heroID].destX && stuff[curTiles[heroTile+1].who].x==stuff[curTiles[heroTile+1].who].destX){
					death(stuff[heroID]);
				}		
			}
			break;
	}
}

function drawDecoy(obj){
	ctx=gameArea.context;	
	switch(obj.direction){
		case "left":
			if(Math.abs(obj.x-obj.destX)>=1){
				obj.decoyWidth+=4;
			} else if (obj.decoyWidth!=0){
				obj.decoyWidth--;
			}
			if(obj.decoyWidth>48){obj.decoyWidth=48;}
			var gradColor1="rgba("+obj.r+","+obj.g+","+obj.b+","+0.7+")";
			var gradColor2="rgba("+obj.r+","+obj.g+","+obj.b+","+0+")";
			var grad=ctx.createLinearGradient(0, 0, obj.decoyWidth, 0);
			grad.addColorStop(0, gradColor1);
			grad.addColorStop(0.5, gradColor2);
			ctx.save();
			ctx.translate(obj.x+16,obj.y);
			ctx.fillStyle=grad;
			ctx.fillRect(0,0,48,32);
			ctx.restore();
			break;
		case "right":
			if(Math.abs(obj.x-obj.destX)>=1){
				obj.decoyWidth+=4;
			} else if (obj.decoyWidth!=0){
				obj.decoyWidth--;
			}
			if(obj.decoyWidth>48){obj.decoyWidth=48;}
			var gradColor1="rgba("+obj.r+","+obj.g+","+obj.b+","+0.7+")";
			var gradColor2="rgba("+obj.r+","+obj.g+","+obj.b+","+0+")";
			var grad=ctx.createLinearGradient(0, 0, -obj.decoyWidth, 0);
			grad.addColorStop(0, gradColor1);
			grad.addColorStop(0.5, gradColor2);
			ctx.save();
			ctx.translate(obj.x+16,obj.y);
			ctx.fillStyle=grad;
			ctx.fillRect(0,0,-48,32);
			ctx.restore();
			break;
		case "up":
			if(Math.abs(obj.y-obj.destY)>=1){
				obj.decoyWidth+=4;
			} else if (obj.decoyWidth!=0){
				obj.decoyWidth--;
			}
			if(obj.decoyWidth>48){obj.decoyWidth=48;}
			var gradColor1="rgba("+obj.r+","+obj.g+","+obj.b+","+0.7+")";
			var gradColor2="rgba("+obj.r+","+obj.g+","+obj.b+","+0+")";
			var grad=ctx.createLinearGradient(0, 0, 0, -obj.decoyWidth);
			grad.addColorStop(0, gradColor1);
			grad.addColorStop(0.5, gradColor2);
			ctx.save();
			ctx.translate(obj.x,obj.y+16);
			ctx.fillStyle=grad;
			ctx.fillRect(0,0,32,-48);
			ctx.restore();
			break;
		case "down":
			if(Math.abs(obj.y-obj.destY)>=1){
				obj.decoyWidth+=4;
			} else if (obj.decoyWidth!=0){
				obj.decoyWidth--;
			}
			if(obj.decoyWidth>48){obj.decoyWidth=48;}
			var gradColor1="rgba("+obj.r+","+obj.g+","+obj.b+","+0.7+")";
			var gradColor2="rgba("+obj.r+","+obj.g+","+obj.b+","+0+")";
			var grad=ctx.createLinearGradient(0, 0, 0, obj.decoyWidth);
			grad.addColorStop(0, gradColor1);
			grad.addColorStop(0.5, gradColor2);
			ctx.save();
			ctx.translate(obj.x,obj.y+16);
			ctx.fillStyle=grad;
			ctx.fillRect(0,0,32,48);
			ctx.restore();
			break;
	}
}

function credits(ctx){
	if(enter){
		fadeCnt-=0.05
	}
	ctx.fillStyle="rgba("+255+","+255+","+255+","+fadeCnt+")";
	ctx.font="40px Consolas";
	ctx.fillText("Congratulations!",65,50);
	ctx.font="30px Consolas";
	ctx.fillText("You've completed the game.",25,90);
	ctx.font="12px Consolas";
	ctx.fillText("Toss the Dots - Demo",10,120);
	ctx.font="12px Consolas";
	ctx.fillText("A puzzle game in HTML5 by Kvrepo",10,140);
	ctx.font="12px Consolas";
	ctx.fillText("Music by Eric Matyas www.soundimage.org",10,160);
	ctx.font="12px Consolas";
	ctx.fillText("Sound effects are from www.freesound.org and created by",10,180);
	ctx.font="12px Consolas";
	ctx.fillText("JustinBW - win sound",10,200);
	ctx.font="12px Consolas";
	ctx.fillText("fins - fail sound",10,220);
	ctx.font="12px Consolas";
	ctx.fillText("ertfelda - movement",10,240);
	ctx.font="12px Consolas";
	ctx.fillText("All the audio is managed by Hwoler.js www.howlerjs.com",10,260);
	ctx.font="20px Consolas";
	ctx.fillText("Press ENTER to restart",125,295);
	if(fadeCnt<=0){
		enter=false;
		gameState=0;
		fadeCnt=1;
	}
}

function title(ctx){
		heroID=0;
		nullTiles();
		stuff=[];
		sblock=[];
		decoy=[];
		curFloorMap=[];
		loadLevel(l);
	ctx.globalAlpha=0.4;
	tileMap();
	for(i=0;i<stuff.length;i++){
		stuff[i].newPosition();
		drawDecoy(stuff[i]);
		stuff[i].update();
	}
	for(i=0;i<sblock.length;i++){
		sblock[i].update();
	}
	curWin.update();
	ctx.globalAlpha=1;
	if(enter){
		fadeCnt-=0.05
	}
	ctx.fillStyle="rgba("+255+","+255+","+255+","+fadeCnt+")";
	ctx.font="40px Consolas";
	ctx.fillText("Toss the Dots - Demo",15,50);
	//ctx.fillText("Toss the Dots",95,50);
	ctx.font="12px Consolas";
	ctx.fillText("Move the dots with the arrow keys.",10,90);
	ctx.font="12px Consolas";
	ctx.fillText("Navigate the green dot to the exit in order to advance.",10,110);
	ctx.font="12px Consolas";
	ctx.fillText("Pink dots and blocks might get in your way, but they mean no harm.",10,130);
	ctx.font="12px Consolas";
	ctx.fillText("Avoid the red dots and blocks. They don't want you to leave.",10,150);
	ctx.font="12px Consolas";
	ctx.fillText("Press 'm' to mute and to unmute.",10,170);
	ctx.font="12px Consolas";
	ctx.fillText("Press 'r' to reset the level.",10,190);
	ctx.font="14px Consolas";
	ctx.fillText("Where would you like to start from?",95,230);
	ctx.font="22px Consolas";
	var levelSelect=l+1;
	ctx.fillText("Level: "+levelSelect,185,260);
	if(levelSelect==1){
		ctx.drawImage(images[2],290,238);
	} else if (levelSelect==level.length){
		ctx.drawImage(images[3],290,238);
	} else {
		ctx.drawImage(images[1],290,238);
	}
	ctx.font="20px Consolas";
	ctx.fillText("Press ENTER to start",125,295);
	if(fadeCnt<=0){
		enter=false;
		gameState=2;
	}
}

function game(ctx){
	tileMap();
	for(i=0;i<stuff.length;i++){
		stuff[i].newPosition();
		drawDecoy(stuff[i]);
		stuff[i].update();
	}
	for(i=0;i<sblock.length;i++){
		sblock[i].update();
	}
	
	if(curWin.grow){curWin.width+=0.1;curWin.height+=0.1;}else{curWin.width-=0.1;curWin.height-=0.1;}
	curWin.angle+=Math.PI/180;
	curWin.update();
		
	if(!arrows){
		moveFinishCheck();
		eventChecker();
	}
}

function levelFadeIn(ctx){
	if(fadeCnt<=1){
		fadeCnt+=0.1;
	}
	ctx.globalAlpha=fadeCnt;
	tileMap();
	for(i=0;i<stuff.length;i++){
		stuff[i].update();
	}
	for(i=0;i<sblock.length;i++){
		sblock[i].update();
	}
	if(curWin.grow){curWin.width+=0.1;curWin.height+=0.1;}else{curWin.width-=0.1;curWin.height-=0.1;}
	curWin.angle+=Math.PI/180;
	curWin.update();
	if(fadeCnt>=1){
		gameState=1;
	}
}

function levelFadeOut(ctx){
	if(fadeCnt>=0.2){
		fadeCnt-=0.1;
	}
	ctx.globalAlpha=fadeCnt;
	tileMap();
	for(i=0;i<stuff.length;i++){
		stuff[i].update();
	}
	for(i=0;i<sblock.length;i++){
		sblock[i].update();
	}
	if(curWin.grow){curWin.width+=0.1;curWin.height+=0.1;}else{curWin.width-=0.1;curWin.height-=0.1;}
	curWin.angle+=Math.PI/180;
	curWin.update();
	if(fadeCnt<=0.2){
		heroID=0;
		nullTiles();
		stuff=[];
		sblock=[];
		decoy=[];
		curFloorMap=[];
		if(reset!=true){l++;}
		if(finish){
			gameState=4;
			l=0;
			fadeCnt=1;
			finish=false;
		} else {
			gameState=2;
		}
		loadLevel(l);
		arrows=true;
		reset=false;
	}
}

function loading(ctx){
	ctx.strokeStyle="rgb("+colorSchemes[0].oR+","+colorSchemes[0].oG+","+colorSchemes[0].oB+")";
	ctx.strokeRect(40,145,400,30);
	ctx.fillStyle="rgb("+colorSchemes[0].oR+","+colorSchemes[0].oG+","+colorSchemes[0].oB+")";
	ctx.fillRect(40,145,50*loaded,30);
	ctx.fillStyle="rgb("+255+","+255+","+255+")";
	ctx.font="16px Consolas";
	ctx.fillText("Loading...",210,165);
	if(loaded==8){
		gameState=0;
	}
}

function updateArea(){
	gameArea.clear();
	for(i=0;i<stars.length;i++){
		stars[i].newPosition();
		stars[i].update();
	}
	ctx=gameArea.context;
	ctx.globalAlpha=1;
	ctx.fillStyle=curBg;
	ctx.fillRect(0,0,480,320);
	if(gameState==1||gameState==2||gameState==3){
		ctx.fillStyle="rgb("+255+","+255+","+255+")";
		ctx.font="18px Consolas";
		ctx.fillText(l+1+"/"+levelLength,20,300);
	}
	if(mute){
		ctx.drawImage(images[0],430,280);
	}
	switch(gameState){
		case 0:
			title(ctx);
			break;
		case 1:
			game(ctx);
			break;
		case 2:
			levelFadeIn(ctx);
			break;
		case 3:
			levelFadeOut(ctx);
			break;
		case 4:
			credits(ctx);
			break;
		case 9:
			loading(ctx);
			break;
		}	
	requestAnimationFrame(updateArea);
}