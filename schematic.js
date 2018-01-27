'use strict';
function Rectangle(_x, _y, _w, _h){
	this.x = _x;
	this.y = _y;
	this.w = _w;
	this.h = _h;
	this.n = -1;
	this.overlap = function(r) {
		return (Math.max(r.x, this.x) < Math.min(r.x + r.w, this.x + this.w)
		&&	Math.max(r.y, this.y) < Math.min(r.y + r.h, this.y + this.h));
	}

}
function Equality(_h, _before, _after){
	this.horizontal=_h;
	this.before=_before;
	this.after=_after;

	this.equalTo = function(eq){
		if(this.horizontal != eq.horizontal){
			return false;
		}
		if(this.before.length != eq.before.length){
			return false;
		}
		if(this.after.length != eq.after.length){
			return false;
		}
		for(var i=0;i<this.before.length;i++){
			if(this.before[i] != eq.before[i]){
				return false;
			}
		}
		for(var i=0;i<this.after.length;i++){
			if(this.after[i] != eq.after[i]){
				return false;
			}
		}
		return true;
	}
}
function EqualitySet(){
	this.equality=[];
	this.addEquality = function(eq){
		this.equality.push(eq);
	}
	this.importFromJSON = function(json){
		for(var i=0;i<json.equality.length;i++){
			var eq = new Equality(json.equality[i].horizontal, json.equality[i].before, json.equality[i].after);
			this.addEquality(eq);
			
		}
	}
	this.post = function(){
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if(this.readyState == 4){
				console.log("POST status: " + this.status);
			}
		}
		xhttp.addEventListener("load", function(event){console.log("Loaded");});
		xhttp.addEventListener("error", function(event){console.log("Error");});
		xhttp.open("POST", "http://localhost:3000/post/equalityset", true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		var duhStuff=JSON.stringify(this);
		console.log(duhStuff);
		xhttp.send(duhStuff);
	}
	this.get = function(url,f){
		var fullUrl = "http://localhost:3000" + url;
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200){
				var myResults = JSON.parse(this.responseText);
				f(myResults);
			}
//			else {
//				console.log("GET status: " + this.status + " readyState: " + this.readyState);
//			}
		}
		xhttp.addEventListener("load", function(event){console.log("Loaded");});
		xhttp.addEventListener("error", function(event){console.log("Error");});
		xhttp.open("GET", fullUrl, true);
		xhttp.send();
	}
	this.countRectangles = function(){
		// Trust
		var maxX=0;
		for(var i=0;i<this.equality.length;i++){
			for(var j=0;j<this.equality[i].before.length;j++){
				if(this.equality[i].before[j] > maxX){
					maxX=this.equality[i].before[j];
				}
			}
			for(var j=0;j<this.equality[i].after.length;j++){
				if(this.equality[i].after[j] > maxX){
					maxX=this.equality[i].after[j];
				}
			}
		}
		return maxX;
	}
	this.solve = function(id,canvasId,statusId){
		var st = new SCSet(this,id);
		st.build();
		st.draw(canvasId);
		document.getElementById(id).innerHTML = st.toString();
		document.getElementById(statusId).innerHTML = st.renderStatus();
	}
}
function SCValue(_v){
	this.v = _v;
	this.value = function(orient){
		return this.v;
	}
}
function SCGuess(c,n){
	this.cell=c;
	this.n=n;
	this.guess=[];
	this.adjustment=-1;
	this.factorial = function(n){
		if(n > 0){
			return n * this.factorial(n-1);
		}
		return 1;
	}
	var maxSize=this.factorial(this.n);
	var minSize=this.factorial(this.n-1);
	// First two guesses, hopefully going in the right direction.
	// I think it might be arbitrary as to whether the guess is the horizontal or vertical dimension
	// I think I'll assume horizontal
	this.guess.push(maxSize+0.5);
	this.guess.push(maxSize-minSize+0.5);
	this.guess.push(89.5);

	this.value = function(orient){
		if(orient){
			return this.guess[this.guess.length-1];
		}
		else{
			return (this.factorial(this.n) / this.guess[this.guess.length-1]) * this.factorial(this.n-1);
		}
	}
	this.adjustGuess = function(){
		this.guess.push(this.adjustment + this.guess[this.guess.length-1]);
		console.log(this.guess[this.guess.length-1]);
	}
	// There needs to be some feedback mechanism
	// Either report resulting check value (cell[5].value) to this object
	// or
	// Give this object the cell to watch
	// or
	// Give this object a method to watch the check value
	// or
	// provide methods to change direction/reduce increment and backout the last guess.
	//
	// The other problem is that there may be more than one cell to watch.
}
function SCCalculation(c,a){
	this.cell=c;
	this.area=a;
	this.plus=[];
	this.minus=[];
	this.plus[true]=[];
	this.plus[false]=[];
	this.minus[true]=[];
	this.minus[false]=[];

	this.value = function(orient){
		if(this.plus[orient].length == 0 && this.plus[!orient].length != 0){
			return this.area / this.value(!orient);
		}
		else if(this.plus[orient].length > 0){
			var sum=0;
			for(var i=0;i<this.plus[orient].length;i++){
				sum+=this.cell[this.plus[orient][i]].value(orient);
			}
			for(var i=0;i<this.minus[orient].length;i++){
				sum-=this.cell[this.minus[orient][i]].value(orient);
			}
			return sum;
		}
		console.log("Error: SCCalculation.value w/o plus defined.");
	}
}
function SCSet(e, _id){
	this.rectangle=[];
	this.factorial = function(n){
		if(n > 0){
			return n * this.factorial(n-1);
		}
		return 1;
	}
	this.id = _id;
	this.eqs = e;
	this.cell = [];
	this.n = this.eqs.countRectangles();
	this.size = this.factorial(this.n);
	this.area = this.size * this.factorial(this.n-1);

	this.toString = function(){
		var text="<ul>";
		for(var i=1;i<this.cell.length;i++){
			var width=this.cell[i].value(true);
			var height=this.cell[i].value(false);
			text+="<li>" + width + " X " + height;
		}
		text+="</ul>";
		return text;
	}
	this.generateRectangles = function(){
		console.log("generating rectangles");
		var outOfBounds=true;
		while(outOfBounds){
			outOfBounds=false;
			// Set width and height
			for(var i=1;i<this.cell.length;i++){
				var width=this.cell[i].value(true);
				if(width > this.size || width < 0){
					outOfBounds=true;
					break;
				}
				var height=this.cell[i].value(false);
				if(height > this.size || height < 0){
					outOfBounds=true;
					break;
				}
				this.rectangle[i]={x:0, y:0, width:width, height:height};
			}
			if(outOfBounds){
				for(var i=1;i<this.cell.length;i++){
					if(this.cell[i] instanceof SCGuess){
						this.cell[i].adjustGuess();
					}
				}
			}
		}
		var minValue=1;
		// Set y at top border
		for(var i=0;i<this.eqs.equality.length;i++){
			if(this.eqs.equality[i].before.length == 1
			&& this.eqs.equality[i].before[0] == 0
			&& this.eqs.equality[i].horizontal == true){
				var x=minValue;
				for(var j=0;j<this.eqs.equality[i].after.length;j++){
					var inx=this.eqs.equality[i].after[j];
					this.rectangle[inx].y = minValue;
					this.rectangle[inx].x = x;
					x+=this.rectangle[inx].width;
				}
				break;
			}
		}

		// Set y at bottom border
		for(var i=0;i<this.eqs.equality.length;i++){
			if(this.eqs.equality[i].after.length == 1
			&& this.eqs.equality[i].after[0] == 0
			&& this.eqs.equality[i].horizontal == true){
				var x=minValue;
				for(var j=0;j<this.eqs.equality[i].before.length;j++){
					var inx=this.eqs.equality[i].before[j];
					this.rectangle[inx].y = this.size+minValue-this.rectangle[inx].height;
					this.rectangle[inx].x = x;
					x+=this.rectangle[inx].width;
				}
				break;
			}
		}

		// Set x at left border
		for(var i=0;i<this.eqs.equality.length;i++){
			if(this.eqs.equality[i].before.length == 1
			&& this.eqs.equality[i].before[0] == 0
			&& this.eqs.equality[i].horizontal == false){
				var y=minValue;
				for(var j=0;j<this.eqs.equality[i].after.length;j++){
					var inx=this.eqs.equality[i].after[j];
					this.rectangle[inx].x = minValue;
					this.rectangle[inx].y = y;
					y+=this.rectangle[inx].height;
				}
				break;
			}
		}

		// Set x at right border
		for(var i=0;i<this.eqs.equality.length;i++){
			if(this.eqs.equality[i].after.length == 1
			&& this.eqs.equality[i].after[0] == 0
			&& this.eqs.equality[i].horizontal == false){
				var y=minValue;
				for(var j=0;j<this.eqs.equality[i].before.length;j++){
					var inx=this.eqs.equality[i].before[j];
					this.rectangle[inx].x = this.size+minValue-this.rectangle[inx].width;
					this.rectangle[inx].y = y;
					y+=this.rectangle[inx].height;
				}
				break;
			}
		}

		// Set remaining x and y's
		var found=true;
		while(found){
			found=false;
			for(var i=0;i<this.eqs.equality.length;i++){
				if(this.eqs.equality[i].before[0] != 0
				&& this.eqs.equality[i].after[0] != 0){
					var known=0;
					var unknown=0;
					var nunknown;
					var before;
					for(var j=0;j<this.eqs.equality[i].before.length;j++){
						var inx=this.eqs.equality[i].before[j];
						if(this.rectangle[inx].x == 0){
							unknown++;
							found=true;
							nunknown=inx;
						}
						else {
							known++;
						}
					}
					for(var j=0;j<this.eqs.equality[i].after.length;j++){
						var inx=this.eqs.equality[i].after[j];
						if(this.rectangle[inx].x == 0){
							unknown++;
							found=true;
							nunknown=inx;
						}
						else {
							known++;
						}
					}
					if(found && unknown == 1){
						var inx=this.eqs.equality[i].after[0];
						if(nunknown == inx){
							var sinx=this.eqs.equality[i].after[1];
							if(this.eqs.equality[i].horizontal == true){
								this.rectangle[nunknown].x=this.rectangle[sinx].x-this.rectangle[nunknown].width;
								this.rectangle[nunknown].y=this.rectangle[sinx].y;
							}
							else {
								this.rectangle[nunknown].y=this.rectangle[sinx].y-this.rectangle[nunknown].height;
								this.rectangle[nunknown].x=this.rectangle[sinx].x;
							}
						}
						else {
							for(var j=1;j<this.eqs.equality[i].after.length;j++){
								var inx=this.eqs.equality[i].after[j];
								if(nunknown == inx){
									var pinx=this.eqs.equality[i].after[j-1];
									if(this.eqs.equality[i].horizontal == true){
										this.rectangle[nunknown].x=this.rectangle[pinx].x+this.rectangle[pinx].width;
										this.rectangle[nunknown].y=this.rectangle[pinx].y;
									}
									else {
										this.rectangle[nunknown].y=this.rectangle[pinx].y+this.rectangle[pinx].height;
										this.rectangle[nunknown].x=this.rectangle[pinx].x;
									}
								}
							}
						}
					}
				}
			}
		}
		console.log("done generating rectangles");
	}

	this.status = function(){
		var tolerance=0.000001;
		var congruent=0;
		var outOfBounds=0;
		var nonIntegral=0;
		for(var i=1;i<this.rectangle.length-1;i++){
			for(var j=i+1;j<this.rectangle.length;j++){
				if(Math.abs(this.rectangle[i].width-this.rectangle[j].width) < tolerance){
					congruent++;
				}
				else if(Math.abs(this.rectangle[i].height-this.rectangle[j].width) < tolerance){
					congruent++;
				}
			}
			if(this.rectangle[i].width > this.size){
				outOfBounds++;
			}
			else if(this.rectangle[i].height > this.size){
				outOfBounds++;
			}
			if(Math.abs(Math.round(this.rectangle[i].width) - this.rectangle[i].width) > tolerance){
				nonIntegral++;
			}
			else if(Math.abs(Math.round(this.rectangle[i].height) - this.rectangle[i].height) > tolerance){
				nonIntegral++;
			}
		}
		return {outOfBounds: outOfBounds, congruent: congruent, nonIntegral: nonIntegral}
	}
	this.renderStatus = function(){
		var st=this.status();
		var buffer="<ul>Status";
		buffer+="<li>outOfBounds: " + st.outOfBounds;
		buffer+="<li>congruent: " + st.congruent;
		buffer+="<li>nonIntegral: " + st.nonIntegral;
		buffer+="</ul>";
		return buffer;
	}
	this.draw = function(canvasId){
		this.generateRectangles();

		var ctx=document.getElementById(canvasId).getContext("2d");
		ctx.strokeStyle = "#000000";
		for(var i=1;i<this.rectangle.length;i++){
			if(this.rectangle[i].x > 0){
				ctx.strokeRect(this.rectangle[i].x, this.rectangle[i].y, this.rectangle[i].width, this.rectangle[i].height);
			}
			else {
				console.log("rectangle[" + i + "] not yet defined");
			}
		}
	}

	this.hasPrerequisites = function(id,unknowns){
		// Does this need to be some sort of while instead?
		// Am I depending on a favorable order?
		for(var i=0;i<this.eqs.equality.length;i++){
			var known=0;
			var unknown=0;
			var present=false;
			var before;
			var orient=this.eqs.equality[i].horizontal;
			for(var j=0;j<this.eqs.equality[i].before.length;j++){
				if(id == this.eqs.equality[i].before[j]){
					present=true;
					before=true;
				}
				else if(this.cell[this.eqs.equality[i].before[j]] === undefined){
					unknown++;
				}
				else {
					known++;
				}
			}
			for(var j=0;j<this.eqs.equality[i].after.length;j++){
				if(id == this.eqs.equality[i].after[j]){
					present=true;
					before=false;
				}
				else if(this.cell[this.eqs.equality[i].after[j]] === undefined){
					unknown++;
				}
				else {
					known++;
				}
			}
			if(present && unknown == 0 && known > 0){
				if(this.defineCalculation(id, i, orient, before)){
				// Don't return in case vertical and horizontal can both be calculated...
					console.log("Define calculation for " + id + (orient?" Horizontal":" Vertical"));
//					return true;
				}
			}
		}
		return false;
	}
	this.defineCalculation = function(id,ie,orient,before){
		if(this.cell[id] === undefined){
			this.cell[id]=new SCCalculation(this.cell, this.area);
		}
		// Is this direction already defined?
		else if(this.cell[id].plus.length > 0){
			return false;
		}
		if(before){
			for(var j=0;j<this.eqs.equality[ie].before.length;j++){
				if(this.eqs.equality[ie].before[j] != id){
					this.cell[id].minus[orient].push(this.eqs.equality[ie].before[j]);
				}
			}
			for(var j=0;j<this.eqs.equality[ie].after.length;j++){
				this.cell[id].plus[orient].push(this.eqs.equality[ie].after[j]);
			}
		}
		else {
			for(var j=0;j<this.eqs.equality[ie].before.length;j++){
				this.cell[id].plus[orient].push(this.eqs.equality[ie].before[j]);
			}
			for(var j=0;j<this.eqs.equality[ie].after.length;j++){
				if(this.eqs.equality[ie].after[j] != id){
					this.cell[id].minus[orient].push(this.eqs.equality[ie].after[j]);
				}
			}
		}
		return true;
	}

	this.build = function(){
		var found=true;
		var stillUndefined;
		var whichOne;
		// cell 0 keeps track of the dimension of the puzzle.
		this.cell[0]=new SCValue(this.size);

		while(found){
			found=false;
			stillUndefined=false;
			for(var id=1;id<=this.n;id++){
				if(this.cell[id] === undefined){
					stillUndefined=true;
					whichOne=id;
					if(this.hasPrerequisites(id,0)){
						found=true;
					}
				}
			}
		}
		if(stillUndefined){
			for(var id=1;id<=this.n;id++){
				if(this.cell[id] === undefined){
					console.log(id + " is still undefined. This will be a guess.");
					this.cell[id]=new SCGuess(this.cell, this.n);
					this.build();
					break;
				}
			}
		}
	}

}
function Schematic(sz,context,scale,cw){
	this.size = sz;
	this.ctx = context;
	this.scale = scale;
	this.canvasWidth = cw;
	this.xindent = scale;
	this.yindent = scale;
	this.stack = [];
	this.eqStack = new EqualitySet();
	this.library = [];

	this.getLibrary = function(){
		return this.library;
	}
	this.matchEquality = function(eq){
		for(var i=0;i<this.library.length;i++){
			var eqStk=this.library[i];
			if(eqStk.equality.length == eq.equality.length){
				var status=true;
				for(var j=0;j<eqStk.equality.length;j++){
					if(!eqStk.equality[j].equalTo(eq.equality[j])){
						status=false;
					}
				}
				if(status){
					return true;
				}
			}
		}
		return false;
	}
	this.generateEquality = function(){
		// Pretty epic method to generate all of the equalities for a schematic.
		// Order is...
		// - Top edge (horizontal)
		// - interior (horizontal)
		// - Bottom edge (horizontal)
		// - Left edge (vertical)
		// - interior (vertical)
		// - Right edge (vertical)
		var outside = 0;
		
// Generate equalities from all 4 directions, both normal and flipped.
		for(var scene = 7; scene >= 0; scene--){

			var before=[], after=[];
			var horizontal = true;
			this.eqStack = new EqualitySet();
			this.numberRectangles(scene);

			// Top edge
			before.push(outside);
			for(x=0;x<this.size;x++){
				var current=this.occupierN(x,0,scene);
				if(after.length > 0){
					if(current != after[after.length-1]){
						after.push(current);
					}
				}
				else {
					after.push(current);
				}
			}
			this.eqStack.addEquality(new Equality(horizontal,before,after));
			for(var y=0;y<this.size-1;y++){
				before = [];
				after = [];
				for(var x=0;x<this.size;x++){
					var cb=this.occupierN(x,y,scene);
					var ca=this.occupierN(x,y+1,scene);
					if(cb != ca){
						if(before.length > 0){
							if(cb != before[before.length-1]){
								before.push(cb);
							}
						}
						else {
							before.push(cb);
						}
						if(after.length > 0){
							if(ca != after[after.length-1]){
								after.push(ca);
							}
						}
						else {
							after.push(ca);
						}
					}
					else if(before.length > 0){
						this.eqStack.addEquality(new Equality(horizontal,before,after));
						before=[];
						after=[];
					}
				}
				if(before.length > 0){
					this.eqStack.addEquality(new Equality(horizontal,before,after));
					before=[];
					after=[];
				}
			}
			// Bottom edge
			before = [];
			after = [];
			after.push(outside);
			for(x=0;x<this.size;x++){
				var current=this.occupierN(x,this.size-1,scene);
				if(before.length > 0){
					if(current != before[before.length-1]){
						before.push(current);
					}
				}
				else {
					before.push(current);
				}
			}
			this.eqStack.addEquality(new Equality(horizontal,before,after));

			// Vertical section
			horizontal = false;

			// Left edge
			before = [];
			after = [];
			before.push(outside);
			for(y=0;y<this.size;y++){
				var current=this.occupierN(0,y,scene);
				if(after.length > 0){
					if(current != after[after.length-1]){
						after.push(current);
					}
				}
				else {
					after.push(current);
				}
			}
			this.eqStack.addEquality(new Equality(horizontal,before,after));
			for(var x=0;x<this.size-1;x++){
				before = [];
				after = [];
				for(var y=0;y<this.size;y++){
					var cb=this.occupierN(x,y,scene);
					var ca=this.occupierN(x+1,y,scene);
					if(cb != ca){
						if(before.length > 0){
							if(cb != before[before.length-1]){
								before.push(cb);
							}
						}
						else {
							before.push(cb);
						}
						if(after.length > 0){
							if(ca != after[after.length-1]){
								after.push(ca);
							}
						}
						else {
							after.push(ca);
						}
					}
					else if(before.length > 0){
						this.eqStack.addEquality(new Equality(horizontal,before,after));
						before=[];
						after=[];
					}
				}
				if(before.length > 0){
					this.eqStack.addEquality(new Equality(horizontal,before,after));
					before=[];
					after=[];
				}
			}
			// Right edge
			before = [];
			after = [];
			after.push(outside);
			for(y=0;y<this.size;y++){
				var current=this.occupierN(this.size-1,y,scene);
				if(before.length > 0){
					if(current != before[before.length-1]){
						before.push(current);
					}
				}
				else {
					before.push(current);
				}
			}
			this.eqStack.addEquality(new Equality(horizontal,before,after));
			if(this.matchEquality(this.eqStack)){
				return false;
			}
		}
		this.eqStack.post();
		this.library.push(this.eqStack);
		return true;
	}
	this.numberRectangles = function(scene){
		// Initialize values to 0
		for(var i=0;i<this.stack.length;i++){
			this.stack[i].n=0;
		}
		var value=0;
		for(var py=0;py<this.size;py++){
			for(var px=0;px<this.size;px++){
				var x=this.actualXOffset(px, py, scene);
				var y=this.actualYOffset(px, py, scene);
				var i = this.occupier(x, y, 0);
				if(i >= 0 && this.stack[i].n == 0){
					this.stack[i].n = ++value;
				}
			}
		}
	}
	this.actualXOffset = function(px, py, scene){
		switch(scene){
		case 0:
		case 6:
			return px;
		case 3:
		case 7:
			return py;
		case 1:
		case 5:
			return this.size-1-py;
		case 2:
		case 4:
			return this.size-1-px;
		}
	}
	this.actualYOffset = function(px, py, scene){
		switch(scene){
		case 0:
		case 4:
			return py;
		case 1:
		case 7:
			return px;
		case 2:
		case 6:
			return this.size-1-py;
		case 3:
		case 5:
			return this.size-1-px;
		}
	}
	this.occupier = function(px, py, scene){
		var ax, ay;

		var r=new Rectangle(px,py,1,1);
		for(var i=0;i<this.stack.length;i++){
			if(r.overlap(this.stack[i])){
				return i;
			}
		}
		return -1;
	}
	this.occupierN = function(px, py, scene){
		var ax, ay;

		ax=this.actualXOffset(px, py, scene);
		ay=this.actualYOffset(px, py, scene);
		var i=this.occupier(ax, ay, scene);
		return this.stack[i].n;
	}
	this.overlap = function(r){
		for(var i=0;i<this.stack.length;i++){
			if(this.stack[i].overlap(r)){
				return true;
			}
		}
		return false;
	}
	this.contains = function(r){
		return (r.x >= 0 && r.x < this.size
		&&	r.x+r.w > 0 && r.x+r.w <= this.size
		&&	r.y >= 0 && r.y < this.size
		&&	r.y+r.h > 0 && r.y+r.h <= this.size);
	}
	this.isFull = function() {
		for(var x=0;x<this.size;x++){
			for(var y=0;y<this.size;y++){
				if(this.occupier(x,y,0) < 0){
					return false;
				}
			}
		}
		return true;
	}
	this.stackDump = function(){
		for(var i=0;i<this.stack.length;i++){
			var r=this.stack[i];
			console.log(this.stack[i].n + ": [" + this.stack[i].x + "," + this.stack[i].y + "](" + this.stack[i].w + "," + this.stack[i].h + ")");
		}
	}
	this.dump = function(scene){
		for(var y=0;y<size;y++){
			var buffer="";
			for(var x=0;x<size;x++){
				buffer=buffer + this.occupierN(x,y,scene);
			}
			console.log(buffer);
		}
		console.log("   " + scene + ", " + this.library.length);
	}
	this.draw = function(){
		this.ctx.strokeStyle = "#000000";
		for(var i=0;i<this.stack.length;i++){
			var r=this.stack[i];
			ctx.strokeRect(this.xindent+ (this.scale*r.x), this.yindent+(this.scale*r.y), this.scale*r.w, this.scale*r.h);
		}
		this.xindent += this.scale * (this.size + 1);
		if(this.xindent + (this.scale * (this.size + 1)) > this.canvasWidth){
			this.xindent = this.scale;
			this.yindent += this.scale * (this.size + 1);
		}
	}
	this.isValid = function() {
// Check for multiple tiles width of square.
// Check for multiple tiles width of square minus width/height of rectangle x.
		if(this.stack.length > 1){
			for(var i=0;i<this.stack.length-1;i++){
				j=this.stack.length-1;
				// Taking these out of the j loop didnt really help.
				if(this.stack[i].x == this.stack[j].x && this.stack[i].w == this.stack[j].w){
					if(this.stack[i].y == (this.stack[j].y+this.stack[j].h) 
					|| (this.stack[i].y+this.stack[i].h) == this.stack[j].y){
						return false;
					}
				}
				if(this.stack[i].y == this.stack[j].y && this.stack[i].h == this.stack[j].h){
					if(this.stack[i].x == (this.stack[j].x+this.stack[j].w)
					|| (this.stack[i].x+this.stack[i].w) == this.stack[j].x){
						return false;
					}
				}
				// Taking these two out helped a little
				// Are two rectangles the full width?
				if(this.stack[i].w == this.size && this.stack[j].w == this.size){
					return false;
				}
				// Are two rectangles the full height?
				if(this.stack[i].h == this.size && this.stack[j].h == this.size){
					return false;
				}
				for(var j=i+1;j<this.stack.length;j++){
					// Dont have to worry about one the full height and one the full width - not possible.
					// Thesis is that k is height or width of square,
					//  i and j are wedged between k and side, therefore have same width or height
					for(var k=0;k<this.stack.length;k++){
						if(k != i && k != j){
							if(this.stack[k].w == this.size){
								if(this.stack[i].y == 0 && this.stack[j].y == 0
								&& this.stack[i].h == this.stack[k].y && this.stack[j].h == this.stack[k].y){
									return false;
								}
								if(this.stack[i].y == this.stack[k].y+this.stack[k].h && this.stack[j].y == this.stack[k].y+this.stack[k].h
								&& this.stack[i].y+this.stack[i].h == this.size && this.stack[j].y+this.stack[j].h == this.size){
									return false;
								}
							}
							if(this.stack[k].h == this.size){
								if(this.stack[i].x == 0 && this.stack[j].x == 0
								&& this.stack[i].w == this.stack[k].x && this.stack[j].w == this.stack[k].x){
									return false;
								}
								if(this.stack[i].x == this.stack[k].x+this.stack[k].w && this.stack[j].x == this.stack[k].x+this.stack[k].w
								&& this.stack[i].x+this.stack[i].w == this.size && this.stack[j].x+this.stack[j].w == this.size){
									return false;
								}
							}
						}
					}
					// There's a possibility that 3 or 4 rectangles could interact and none are the full height or width.
					// However, I'm thinking that I have to examine equalities in order to catch this stuff more reliably.
				}
			}
		}
		return true;
	}
	this.fill = function() {
		for(var y=0;y<this.size;y++){
			for(var x=0;x<this.size;x++){
				if(this.occupier(x,y,0) < 0){
					for(var h=1;h<=this.size;h++){
						for(var w=1;w<=this.size;w++){
							var r=new Rectangle(x,y,w,h);
							if(this.contains(r) && !this.overlap(r)){
								this.stack.push(r);
								if(this.isValid()){
									if(this.isFull() && this.stack.length > 1){
										if(this.generateEquality()){
											this.draw();
										}
										this.stack.pop();
										return;
									}
									this.fill();
								}
								this.stack.pop();
							}
						}
					}
					return;
				}
			}
		}
	}
	
}
