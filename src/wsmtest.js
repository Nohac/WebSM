/*var NoteSkin = {
	
}*/

var Note = {
	svg: "",
	noteCanvas: null,
	noteImages: null,
	option: {
		file: "gfx/smarrow.svg",
		width: 80,
		height: 80,
	},
	load: function(cb){
		var that = this;
		$.get(this.option.file,function(svg){
			that.svg = svg;
			that.cacheNote(cb);
		});
	},
	cacheNote: function(cb){
		//Canvas prerender
		var that = this;
		var w = this.option.width;
		var h = this.option.height;
		cv = document.createElement("canvas");
		cv.id = "smSvgArrow"; cv.width 	= w; cv.height = h;
		canvg(cv,this.svg);
		this.noteCanvas = cv;
		
		//SVG to PNG cache
		var noteShape = new Kinetic.Shape({
			x: 0, y: 0, offset: {x: 0, y:0},
			drawFunc: function(canvas){
				canvas.getCanvasContext().drawSvg(that.svg,0,0,w,h);
			}
		}).toImage({
			width: w,
			height: h,
			callback: function(img) {
				that.noteImage = img;
				console.log(that.noteImage);
				cb();
			}
		});
	},
	get: function(opt){
		var that = this;
		return new Kinetic.Image({
			image: that.noteImage,
			offsetX: Note.option.width/2,
			offsetY: Note.option.height/2
		});
	}
}

var Pos = {
	left: 	0,
	right: 	1,
	center: 2,
	top:		3,
	bottom: 4
}

var NoteReceptor = {
	receptors: [],
	layer: null,
	notes: 4,
	option: {
		align: Pos.center,
		position:	Pos.top,
		spacing: 10,
		margin: {
			top: 50,
			bottom: 0,
			left: 0,
			right: 0
		},
		rotation:{
			0: 90,
			1: 0,
			2: 180,
			3: 270,
			4: 90,
			5: 0,
			6: 180,
			7: 270
		}
	},
	draw: function(){
		this.layer = new Kinetic.Layer({width: 100, height: 60});
		for (var i = 0; i < this.notes; i++){
			var note = Note.get();
			console.log(this.getOffset());
			note.setPosition(this.getOffset()+((Note.option.width+this.option.spacing)*i),
											this.option.margin.top+Note.option.height/2);
			note.setRotationDeg(this.option.rotation[i]);
			this.layer.add(note);
			this.receptors.push(note);
		}
	},
	getOffset: function(){
		var nw = Note.option.width;
		var sw = SongStage.stage.getWidth();
		var space = this.option.spacing;
		
		return (((sw/2)-(((nw*this.notes)+(space*(this.notes-1)))/2))+nw/2);
	}
}

//Create the stage
//and initiate everything
var SongStage = {
	stage: null,
	layer: null,
	option: {
		container: "",
		width: 0,
		height: 0,
		autoResize: false,
	},
	init: function(opt){
		var that = this;
		$.extend(this.option,opt);
		
		this.stage = new Kinetic.Stage({
			container: that.option.container,
			width: that.option.width,
			height: that.option.height
		});
		this.layer = new Kinetic.Layer();
		
		if(this.option.autoResize == true){
			this.resize();
			$(window).resize(function(){
				that.resize();
			});
		}
	},
	resize: function(){
		var elem = "#"+this.option.container;
		var w = $(elem).width();
		var h = $(elem).height();
		
		if (this.stage.width != w || this.stage.height != h){
			this.stage.setWidth(w);
			this.stage.setHeight(h);
		}
	},
	playRandom: function(){
		var that = this;
		var resp = NoteReceptor;
		
		var jumps = Math.floor(Math.random()*resp.notes)+1;
		
		//for (var i = 0; i <	jumps; i++){
			var pos = Math.floor(Math.random()*resp.notes);
			var nsp = resp.receptors[pos];
			var note = Note.get();
			note.setPosition(nsp.getX(),this.stage.getHeight()+40);
			note.setRotationDeg(nsp.getRotationDeg());
			this.layer.add(note);
			var anim = new Kinetic.Tween({
				node: note,
				duration: 0.65,
				y: -40,
				onFinish: function(){
					note.destroy();
					console.log("dest");
				}
			},this.layer).play();
		//}
	}
}

$(function(){
	SongStage.init({
		container: "songStage",
		autoResize: true
	});
	
	Note.load(function(){
		NoteReceptor.draw();
		setInterval(function() {
			SongStage.playRandom();
		}, 100);
		
		SongStage.stage.add(NoteReceptor.layer);
		SongStage.stage.add(SongStage.layer);
	});
});