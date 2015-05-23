(function() {

	// local variables and helper functions

	var width=960,height=800,padding=0;
	
	var rp=d3.select("#riskpanel").html();
	var regions=["americas","europe","japan","asiapacific","global"];
	var regionHash={"Americas":"americas","Europe":"europe","Japan":"japan","Asia/Pacific":"asiapacific","Worldwide":"global"}
	var interface={
		buttons:{
		applications:[
			{label:"All Apps",id:"all-app"},
			{label:"Category",id:"cat-app"},
			{label:"Technology",id:"tec-app"},
			{label:"Frequency",id:"fre-app"}
		],
		threats:[
			{label:"All Threats",id:"all-thr"},
			{label:"Category",id:"cat-thr"},
			{label:"By Type",id:"typ-thr"},
			//{label:"Frequency",id:"fre-thr"}
		]},
		leftPan:{
			applications:["Bandwidth:","% of total bandwidth:","HD movie equivalent:","Sessions consumed:","# of apps:"],
			threats:["Detections:","# of threats:"]
		}
	}


	var categories=["networking","media","general-internet","collaboration","business-systems"];
	var threatCats=["adware","backdoor","botnet","code-execution","keylogger","net-worm","overflow","spyware","sql-injection"];
	var technologies=["client-server","browser-based","peer-to-peer","network-protocol"];
	var catbysubcat={};
	var subcats=[];
	var threatTypes=["exploit","malware"];

	var riskColors={"-":"#ccc",1:"#67A2B9",2:"#A7C439",3:"#FFC425",4:"#F6851F",5:"#CD383F","threat":"#7D3953"};
	var catxy={"networking":[306,186],"media":[612,186],"general-internet":[230,405],"collaboration":[460,405],"business-systems":[690,405]};
	var threatCatxy={
		"adware":[184,186],"backdoor":[368,186],"botnet":[552,186],"code-execution":[736,186],
		"keylogger":[153,405],"net-worm":[306,405],"overflow":[459,405],"spyware":[612,405],"sql-injection":[765,405]
	};
	var techxy={"client-server":[304,186],"browser-based":[570,186],"peer-to-peer":[304,375],"network-protocol":[570,375]};
	var threatxy={"exploit":[306,250],"malware":[612,250]};
	var p_rand=function(n) {return Math.floor(Math.random()*n);}
	
	var srsly=function(b) {return Math.floor(+b/1000000)} // the packing function is not good with very large numbers.
	var threatByApp = function() {return (d3.select("#select_dataset").property("value")!=="All Threats")}
	var present=function(number,option) {	// sensible options to write numbers. works rather well for small or large numbers alike.
		if(option==="%") {
			return d3.format("4.2%")(number);
		} else {
			if(number*number<100000000) {
				return d3.format("4.2f")(number);
			} else {
				return d3.format("4.2s")(number);
			}
		}
	}
	var iPack = function (a,r,cx,cy) {
		// a is an array of numbers

		// this function is a trimmed down version of the packed circle layout algorithm. 
		// what it does is turn a set of numbers into a set of elements that determine a circle. 

		// optional: r radius of the packed circle,x-y its center

		var s=r||500;
		var x=cx||r/2;
		var y=cy||r/2
		var nodes=a.map(function(d,i) {return {value:+d};})
		var tree={name:"root",children:nodes};
		var pack=d3.layout.pack()
		.size([s,s])
		.sort(d3.ascending)
		//.sort(function() {return Math.random()-.5})
		//.sort(d3.descending)
		.value(function(d) {return d.value;})(tree);
		return pack.slice(1).map(function(d){return {d:d,r:d.r,k:(s/2)/d.r,x:d.x-s/2+x,y:d.y-s/2+y};})
	}

	// our global variable and related functions

	pan={}
	pan.data=[];
	pan.threats=[];
	pan.smallApps=[];
	pan.selection=[];
	pan.width=width;
	pan.height=height;
	pan.view="All";
	pan.risk="All";
	pan.dhash={};

	pan.filter = function(criteria) {
		// criteria will be an object with keys as a subset of those of data.
		// to be kept in the selection, for every key of criteria, a record must have the value corresponding to that key.
		if (pan.main=="applications") {
			pan.dhash={};
			if(typeof(criteria)==="undefined") {pan.selection=pan.data.slice(0)} 
			// which would never happen, ever, but anyway
				else {
			if (d3.select("#select_dataset").property("value").toLowerCase()=="applications by subcategory") {
				pan.criteria.type="subcategory"
			} else {
				pan.criteria.type="application"
			}
			pan.selection=pan.data.filter(function(d) {
				var keep=true;
				d3.keys(criteria).some(function(k) {
					if (d[k]!=criteria[k]) {
						keep=false;
						return true; // exit loop
					}
				});
				return keep;
			})}

			//pan.selection=pan.selection.sort(function(a,b) {return b.bandwidth-a.bandwidth}).slice(0,100);

		

			var selectionB=d3.sum(pan.selection,function(d) {return +d.bandwidth;})
			var selectionS=d3.sum(pan.selection,function(d) {return +d.sessions;})
			var selectionH=d3.sum(pan.selection,function(d) {return +d.hd;})
			
			pan.dataRight[0]=d3.format(",")(selectionB);
			pan.dataRight[1]=d3.format("4.2%")(selectionB/pan.totalB);
			pan.dataRight[2]=d3.format(",")(selectionH);
			pan.dataRight[3]=d3.format("4.2%")(selectionS/pan.totalS);
			pan.dataRight[4]=pan.selection.length;

			pan.dataLeft[3]=pan.risk;

			// we remove from selection: the custom app, and the apps smaller than 1 HD movie equivalent

			pan.selection=pan.selection.filter(function(d) {return ((+d.hd)>1) && (d.name!="custom")})

			// but we add the grouping of the smaller movies.

			pan.smallApps.forEach(function(d) {
				var keep=true;
				d3.keys(criteria).some(function(k) {
					if (k!="type") {
						if(d[k]!=criteria[k]) {
							keep=false;
							return true;
						}
					}
				});
				if (keep) {pan.selection.push(d);}
			})


		}

		else {

			// filtering for threats, could be merged with the other case, but let's play it safe for now

			pan.dhash={};
			if(typeof(criteria)==="undefined") {pan.selection=pan.threats.slice(0)} 
			// which would never happen, ever, but anyway
				else {
			if (d3.select("#select_dataset").property("value")=="All Threats") {
				pan.criteria.type="threat"
			} else {
				pan.criteria.type="threatApplication"
			}
			pan.selection=pan.threats.filter(function(d) {
				var keep=true;
				d3.keys(pan.criteria).some(function(k) {
					if (d[k]!=pan.criteria[k]) {
						keep=false;
						return true; // exit loop
					}
				});
				return keep;
			})}

			pan.dataRight[0]=d3.format(",")(d3.sum(pan.selection,function(d) {return +d.detections}));
			pan.dataRight[1]=d3.format(",")(pan.selection.length);

			pan.dataLeft[3]=pan.severity;
			
			pan.selection=pan.selection.filter(function(d) {return d.name!=="0";})

			if (d3.select("#select_dataset").property("value")=="All Threats") {
				pan.selection=pan.selection.slice(0).sort(function(a,b) {return b.detections-a.detections}).slice(0,250)
			} else {
				var top25=pan.selection.filter(function(d) {return d.category=="total";}).slice(0).sort(function(a,b) {return b.detections-a.detections;}).slice(0,25).map(function(d) {return d.application;})
//				pan.selection=pan.selection.filter(function(d) {return top25.indexOf(d.application)>-1&&d.category!="total";})	
				pan.selection=pan.selection.filter(function(d) {return top25.indexOf(d.application)>-1
					//&&d.category=="total"
					;})	
			}
		}

		pan.dataLeft[0]=d3.select("#select_region").property("value")
		pan.dataLeft[1]=d3.select("#select_dataset").property("value")


		pan.selection.forEach(function(d,i) {
			pan.dhash[d.id]=i;
		})

		pan.computePos();
	}
	

	pan.computePos=function() {
		var riskScale=d3.scale.linear().domain([0,5]);
		// we give everything a default value
		// so by default, they are all in the middle of the screen with a null radius (invisible, ready to pounce)
		
		pan.selection.forEach(function(d,i) {
			d.pos=[{x:445,y:253,r:0,tx:445,ty:253},{x:445,y:253,r:0,tx:445,ty:253},{x:445,y:253,r:0,tx:445,ty:253},{x:445,y:253,r:0,tx:445,ty:253}];
		})
		if (pan.main=="applications") {
		// general case

		// we set aside the tiniest circles for now else they will upset the general layout greatly.

		

		// and calculate the position of the other. 100 is arbitrary large, we may try other values.
		// noting that there are 26 circles in the mockup, and circa 1300 data items in the dataset.

		var largeenough=pan.selection.slice(0);
		largeenough.sort(function(a,b) {return b.bandwidth-a.bandwidth}).slice(0,100);


		var c1=largeenough.map(function(d) {return srsly(d.bandwidth);})
		
	
		var pos1=iPack(c1,415,445,253);

		largeenough.forEach(function(d,i) {
			pan.selection[pan.dhash[d.id]].pos[0]=pos1[i];
			pan.selection[pan.dhash[d.id]].pos[0].tx=445;
			pan.selection[pan.dhash[d.id]].pos[0].ty=253;
			pan.selection[pan.dhash[d.id]].pos[0].max=415;
		})
		

		// now by category

		// preliminary step: we compute sizes of the various category totals
		var catsum=d3.nest()	
			.key(function(d) {return d.category;})
			.rollup(function(d) {return d3.sum(d,function(e) {return srsly(e.bandwidth);})})
			.map(pan.selection);

		// {"Networking":10000, "Media":25000, "General Internet":5000, "Collaboration":100000, "Business system",50000}

		var catsum1=categories.map(function(c) {return catsum[c];})

		// [10000,25000,5000,100000,50000]
		var catsum2=iPack(catsum1,500,0,0)
		// [{r:50,k:...,x:...,y:...},{r:100,...}]
		var catsum3={};
		categories.forEach(function(c,i) {catsum3[c]=1*catsum2[i].r;})
		// {"Networking":50, "Media":100, ...}

		categories.forEach(function(cat) {
			riskScale.range(catxy[cat][1]-catsum3[cat]/2,catxy[cat][1]+catsum3[cat]/2)
			var scat=pan.selection.filter(function(d) {return d.category==cat;})
			var scat_val=scat.map(function(d) {return srsly(d.bandwidth);})
			var pos_scat=iPack(scat_val,catsum3[cat],catxy[cat][0],catxy[cat][1]);
			scat.forEach(function(d,j) {
				var i=pan.dhash[d.id];
				pan.selection[i].pos[1]=(pos_scat[j])
				
				//pan.selection[i].pos[1].r=pan.selection[i].pos[1].r/3
				pan.selection[i].pos[1].tx=catxy[cat][0]
				pan.selection[i].pos[1].ty=catxy[cat][1]
				pan.selection[i].pos[1].max=catsum3[cat]
			})
		})

		// and by tech
		// similar first step
		var techsum=d3.nest()	
			.key(function(d) {return d.technology;})
			.rollup(function(d) {return d3.sum(d,function(e) {return srsly(e.bandwidth);})})
			.map(pan.selection);

		// {"Networking":10000, "Media":25000, "General Internet":5000, "Collaboration":100000, "Business system",50000}

		var techsum1=technologies.map(function(c) {return techsum[c];})

		// [10000,25000,5000,100000,50000]
		var techsum2=iPack(techsum1,500,0,0)
		// [{r:50,k:...,x:...,y:...},{r:100,...}]
		var techsum3={};
		technologies.forEach(function(t,i) {techsum3[t]=2*techsum2[i].r;})

		technologies.forEach(function(tech) {
			var stech=pan.selection.filter(function(d) {return d.technology==tech;})
			var stech_val=stech.map(function(d) {return srsly(d.bandwidth);})
			var pos_stech=iPack(stech_val,techsum3[tech],techxy[tech][0],techxy[tech][1]);
			stech.forEach(function(d,j) {
				var i=pan.dhash[d.id];
				pan.selection[i].pos[2]=(pos_stech[j])
				pan.selection[i].pos[2].tx=techxy[tech][0]
				pan.selection[i].pos[2].ty=techxy[tech][1]
				pan.selection[i].pos[2].max=techsum3[tech]
			})
		})

		// finally, scatterplot category/frequency

		var rScale=d3.scale.linear().domain([0,1000000000]).range([1,20]);
		var xScale=d3.scale.linear().range([115,865]);
		var yScale={};
		categories.forEach(function(cat,i) {yScale[cat]=80+i*100;} );
		yScale["0"]=-280;yScale["custom-tcp"]=-280,yScale["custom-udp"]=-280;


		pan.selection.forEach(function(d) {
			d.pos[3]=({x:xScale(d.frequency), r:rScale(srsly(d.bandwidth)), y:yScale[d.category]})
		})
		} else {

			// positioning of threats

			// and calculate the position of the other. 100 is arbitrary large, we may try other values.
		// noting that there are 26 circles in the mockup, and circa 1300 data items in the dataset.

		var largeenough=pan.selection.slice(0);
		
		// only totals for the all threats views of exploits/malware by application

		/*if (d3.select("#select_dataset").property("value")!="All Threats") {
			largeenough=largeenough.filter(function(d) {return d.category=="total";})
			console.log("largeenough.length",largeenough.length)
		}*/

		largeenough.sort(function(a,b) {return b.detections-a.detections}).slice(0,100);



		var c1=largeenough.map(function(d) {return (+d.detections);})
		var pos1=iPack(c1,415,445,253);

		largeenough.forEach(function(d,i) {
			pan.selection[pan.dhash[d.id]].pos[0]=pos1[i];
			pan.selection[pan.dhash[d.id]].pos[0].tx=445;
			pan.selection[pan.dhash[d.id]].pos[0].ty=253;
			pan.selection[pan.dhash[d.id]].pos[0].max=415;
		})

		
		// now by category

		//var myselection;

		// but no totals for the by category view of exploits/malware by application

		/*if (d3.select("#select_dataset").property("value")!="All Threats") {
			myselection=pan.selection.slice(0).filter(function(d) {return d.category!="total";})
			console.log("myselection.length",myselection.length)
		}*/
		
		// preliminary step: we compute sizes of the various category totals
		var catsum=d3.nest()	
			.key(function(d) {return d.category;})
			.rollup(function(d) {return d3.sum(d,function(e) {return (+e.detections);})})
			.map(pan.selection);

		// {"Networking":10000, "Media":25000, "General Internet":5000, "Collaboration":100000, "Business system",50000}

		var catsum1=threatCats.map(function(c) {return catsum[c];})

		// [10000,25000,5000,100000,50000]
		var catsum2=iPack(catsum1,500,0,0)
		// [{r:50,k:...,x:...,y:...},{r:100,...}]
		var catsum3={};
		threatCats.forEach(function(c,i) {catsum3[c]=1*catsum2[i].r;})
		// {"Networking":50, "Media":100, ...}
		threatCats.forEach(function(cat) {
			var scat=pan.selection.filter(function(d) {return d.category==cat;})
			var scat_val=scat.map(function(d) {return (+d.detections);})
			var pos_scat=iPack(scat_val,catsum3[cat],threatCatxy[cat][0],threatCatxy[cat][1]);
			scat.forEach(function(d,j) {
				var i=pan.dhash[d.id];
				pan.selection[i].pos[1]=(pos_scat[j])
				//pan.selection[i].pos[1].r=pan.selection[i].pos[1].r/3
				pan.selection[i].pos[1].tx=threatCatxy[cat][0]
				pan.selection[i].pos[1].ty=threatCatxy[cat][1]
				pan.selection[i].pos[1].max=catsum3[cat]
			})
		})


		// and by type
		


		// for view by type, we revert to totals for exploits/malware by application

		/*if (d3.select("#select_dataset").property("value")!="All Threats") {
			myselection=pan.selection.slice(0).filter(function(d) {return d.category=="total";})
			console.log("myselection.length",myselection.length)

		}*/


		// similar first step




		var typesum=d3.nest()	
			.key(function(d) {return d.threatType;})
			.rollup(function(d) {return d3.sum(d,function(e) {return (+e.detections);})})
			.map(pan.selection);

		// {"Networking":10000, "Media":25000, "General Internet":5000, "Collaboration":100000, "Business system",50000}

		var typesum1=threatTypes.map(function(c) {return typesum[c];})

		// [10000,25000,5000,100000,50000]
		var typesum2=iPack(typesum1,500,0,0)
		// [{r:50,k:...,x:...,y:...},{r:100,...}]
		var typesum3={};
		threatTypes.forEach(function(t,i) {typesum3[t]=2*typesum2[i].r;})


		threatTypes.forEach(function(type) {
			var stype=pan.selection.filter(function(d) {return d.threatType==type;})
			var stype_val=stype.map(function(d) {return (+d.detections);})
			var pos_stype=iPack(stype_val,typesum3[type],threatxy[type][0],threatxy[type][1]);
			stype.forEach(function(d,j) {
				var i=pan.dhash[d.id];
				pan.selection[i].pos[2]=(pos_stype[j])
				pan.selection[i].pos[2].tx=threatxy[type][0]
				pan.selection[i].pos[2].ty=threatxy[type][1]
				pan.selection[i].pos[2].max=typesum3[type]
			})
		})

		// finally, scatterplot category/frequency

		// that's not really necessary, but if there is a way the user finds itself in the view by frequency for threats, rather show something than crash the app

		var rScale=d3.scale.linear().domain([0,100000000]).range([1,20]);
		var xScale=d3.scale.linear().range([115,865]);
		var yScale={};
		threatCats.forEach(function(cat,i) {yScale[cat]=50+i*500/9;} );
		yScale["0"]=-200;yScale["custom-tcp"]=-200,yScale["custom-udp"]=-200; // shouldn't be required, but can't hurt

		pan.selection.forEach(function(d) {
			d.pos[3]=({x:xScale(Math.random()), r:rScale((d.detections)), y:yScale[d.category]})
		})

		}

	}

	pan.gendata= function() {
		pan.data=d3.range(500).map(function(i) 
			{var d={id:i,
				region: regions[p_rand(5)],
				application: p_rand(5),
				category: categories[p_rand(5)],
				technology: technologies[p_rand(4)],
				frequency: 10+p_rand(80),
				bandwidth: (10+p_rand(900))*(10+p_rand(900)),
				risk:p_rand(5)+1
			};
			return d;
		})
		pan.filter();

	}

	pan.readdata=function() {
		d3.csv(pan.appfile,function(error,csv) {
			var id;
			pan.data=[];
			pan.smallApps=[];
			csv.forEach(function(d,i) {
				d.type="application"
				d.name=d.application
				pan.data[i]=d;
				id=pan.data[i].id=i;
				if (subcats.indexOf(d.subcategory)<0) {
					subcats.push(d.subcategory)
					catbysubcat[d.subcategory]=d.category;
				}
			})
			pan.totalB=d3.sum(pan.data,function(d) {
				return (d.region==="global"?+d.bandwidth:0)
			})
			pan.totalS=d3.sum(pan.data,function(d) {
				return (d.region==="global"?+d.sessions:0)
			})
			subcats.forEach(function(s) {
				regions.forEach(function(r) {
					id=id+1;
					var selection=pan.data.filter(function(d) {return (d.subcategory==s)&&(d.region==r)});
					subcat={
						name:s,
						type:"subcategory",
						category:catbysubcat[s],
						subcategory:s,
						technology:"-",
						frequency:"-",
						region:r,
						count:selection.length,
						id:id,
						bandwidth:d3.sum(selection,function(d) {return +d.bandwidth;}),
						hd:d3.sum(selection,function(d) {return +d.hd;}),
						risk:d3.round(d3.mean(selection,function(d) {return +d.risk})),
						sessions:d3.sum(selection,function(d) {return +d.sessions;})
					}
					if (isNaN(subcat.risk)) {subcat.risk="-";}
					pan.data.push(subcat);
				})
			})

			var s0=pan.data;
			regions.forEach(function(r) {
				var s1=pan.data.filter(function(d) {return d.region==r});
				categories.concat("total").forEach(function(c) {
					var s2;
					if(c=="total") {s2=s1.slice(0);}
					else {
						s2=s1.filter(function(d) {return d.category==c;})
					}
					technologies.concat("total").forEach(function(t) {
						var selection;
						if(t=="total") {selection=s2.slice(0);}
						else {
							selection=s2.filter(function(d) {return d.technology==t;})
						}
						var subtotal={
							name:"subtotal",
							type:"subtotal",
							count:selection.length,
							category:c,
							technology:t,
							region:r,
							bandwidth:d3.sum(selection,function(d) {return +d.bandwidth;}),
							hd:d3.sum(selection,function(d) {return +d.hd;}),
							risk:d3.round(d3.mean(selection,function(d) {return +d.risk})),
							sessions:d3.sum(selection,function(d) {return +d.sessions;})
						}
						if (isNaN(subtotal.risk)) {subtotal.risk="-";}
						
						if(subtotal.bandwidth>0) {
							pan.data.push(subtotal);
						}
						var small=selection.filter(function(d) {return +d.hd<1})

						pan.smallApps.push({
							name:"All other applications",
							type:"smallApplications",
							category:c,
							count:small.length,
							technology:t,
							region:r,
							bandwidth:d3.sum(small,function(d) {return +d.bandwidth;}),
							hd:d3.sum(small,function(d) {return +d.hd;}),
							risk:d3.round(d3.mean(small,function(d) {return +d.risk})),
							sessions:d3.sum(small,function(d) {return +d.sessions;})
						})
					})
				})
			})
			pan.readthreats()
			pan.filter(pan.criteria)
			pan.drawview()	
		})
		
		
	}

	pan.readthreats=function() {
		var threatapplications=[];
		d3.csv(pan.threatfile,function(error,csv) {
			pan.threats=[];
			var globalhash={};
			var i=-1;
			csv.forEach(function(d,index) {
				i=i+1;
				d.type="threat";
				d.name=d.attack;
				d.detections=+d.detections;
				d.severityVal={medium:0,high:1,critical:2}[d.severity];
				pan.threats[i]=d;
				pan.threats[i].id=i;

				var key=d.attack+"-"+d.application+"-"+d.category+"-"+d.threatType;
				if (key in globalhash) {
					pan.threats[globalhash[key]].detections=pan.threats[globalhash[key]].detections+(+d.detections);
				} else {

					i=i+1;
					globalhash[key]=i;
					pan.threats[i]={name:d.name,type:"threat",detections:+d.detections,attack:d.attack,application:d.application,category:d.category,threatType:d.threatType,severity:d.severity,severityVal:d.severityVal,risk:"threat",region:"global",id:i};
				}

				if(threatapplications.indexOf(d.application)<0) {
					threatapplications.push(d.application);
				}
			})


			threatapplications.forEach(function(a) {
				var selection0=pan.threats.filter(function(d) {return d.application==a});
					["exploit","malware","total"].forEach(function(t) {
						var selection1;
						if(t=="total") {
							selection1=selection0;
						} else {
							selection1=selection0.filter(function(d) {return (d.threatType==t);})
						}
						
						threatCats.concat("total").forEach(function(tc) {
							regions.forEach(function(r) {
							var selection,selection2;
							selection2=selection1.filter(function(d) {return d.region==r}); 
							 
							if(tc!="total") {
								selection=selection2.filter(function(d) {return d.category==tc;})
							} else {
								selection=selection2;
							}
							pan.debug=selection;

							var threat={
								type:"threatApplication",
								name:a,
								application:a,
								threatType:t,
								category:tc,
								severityVal:d3.round(d3.mean(selection,function(d) {return d.severityVal})),
								severity:["medium","high","critical"][d3.round(d3.mean(selection,function(d) {return d.severityVal}))],
								region:r,
								detections:d3.sum(selection, function(d) {return +d.detections;}),
								risk:"threat"
							}	
							if (threat.detections>0) {
								i=i+1;
								threat.id=i;
								pan.threats.push(threat);
							}
						})
					})
			
				})	
			})
		})
	}

	pan.drawview = function(m) {

		var mode=m||0;
		// we are going to store all the relevant information in the flat nodes variable
		// rather than look in the relevant node
		pan.force.stop();
		var nodes=pan.selection.slice(0)
		nodes.forEach(function(d,i) {
			var p=pan.selection[i].pos[mode];
			d3.keys(p).forEach(function(k) {
				nodes[i][k]=p[k];
			})
			if (pan.strata&&mode<3) {
				nodes[i].x=((Math.random()-.5)*d.max+d.tx||d.tx);
				nodes[i].y=((d3.scale.linear().range([d.ty-d.max/2,d.ty+d.max/2]).domain([5,0])(+d.risk||0))||d.ty);
			}
			pan.nodes1=nodes.slice(0);
			if(pan.main==="threats"&&threatByApp()) {
					nodes.forEach(function(n) {
						if(n.category==="total"&&mode===1||n.category!=="total"&&mode!==1) {
							n.r=0
						}
					})
			}
			pan.nodes2=nodes.slice(0);

			if(nodes[i].r) {
				nodes[i].r=pan.selection[i].pos[0].r;
				if(nodes[i].r<pan.minrad) {nodes[i].r=pan.minrad;}
				if(nodes[i].r>pan.maxrad) {nodes[i].r=pan.maxrad;}
			};
		})
		nodes.sort(function(a,b) {return b.r-a.r;});
		// updating written info
		d3.select("#data_left").selectAll(".value").data(pan.dataLeft).html(String)
		d3.select("#data_right").selectAll(".value").data(pan.dataRight).html(String)


		var psb=pan.svg.select("#back")
		psb.selectAll("*").remove();
		pan.svg.selectAll(".labels").remove();	
		psb.append("rect").attr({height:height,width:width}).style({fill:"white",stroke:"none"}).classed("backrect",1)
		if(mode==0) {
			psb.append("text").text("Size of circle indicates").attr({x:800,y:310,"text-anchor":"middle"})
			psb.append("text").text(pan.main=="applications"?"total bandwidth occupied":"number of detections").attr({x:800,y:322,"text-anchor":"middle"})
			
				
			psb.selectAll("circle").data([10,20,50]).enter().append("circle")
				.attr({cx:800,cy:function(d) {return 440-d},r:String})
				.style({fill:"none","stroke-width":2,stroke:"#ccc","stroke-dasharray":"2 2"})
			

		} 
		if (mode==3) {
			if(pan.main=="applications") {
			psb.append("text").text("Frequency: Percent of Installations Where Application Appeared")
				.attr({y:35,x:width/2,"text-anchor":"middle"})
				.style({size:14,"font-weight":"bold"})
			psb.selectAll(".labelX").data(d3.range(6)).enter().append("text")
				.text(function(d) {return d3.format("2%")(d*.2);})
				.attr({y:65,x:function(d) {return 115+150*d},"text-anchor":"middle"})}
			psb.selectAll(".labelY").data(pan.main=="applications"?categories:threatCats).enter().append("text")
				.text(String)
				.attr({x:105,y:function(d,i) {return 83+i*(pan.main=="applications"?100:(500/9))},"text-anchor":"end"})
			if(pan.main=="applications") {
			psb.selectAll(".lx").data(d3.range(6)).enter().append("path")
				.attr("d",function(d) {return "M"+(115+150*d)+",75v505"})
				.style("stroke","#eee")}
			psb.selectAll(".ly").data(d3.range(6)).enter().append("path")
				.attr("d",function(d) {return "M115,"+(80+(pan.main=="applications"?100:(500/9))*d)+"h750"})
				.style("stroke","#eee")

		}

		var circles=pan.svg.selectAll(".circles").data(nodes);
		circles.exit().transition().style("opacity",0).remove();
		circles.enter()
			.append("circle")
			.attr({
					cx:function(d) {return isNaN(d.x)?d.tx:d.x},
					cy:function(d) {return isNaN(d.y)?d.ty:d.y},
					 r:function(d) {return d.r},
					id:function(d) {return "c"+d.id},
				 "class":function(d) {return "circles cat"+d.category+" tech"+d.technology}
			})
			.style({
				stroke:"none",
				  fill:function(d) {return riskColors[d.risk]},
			   "fill-opacity":function(d) {if (!d.severity) {return .9;} else {
			   	//return {"medium":.2,"high":.5,"critical":9}[d.severity];
			   	return d3.scale.linear().domain([0,.8*d3.max(nodes,function(d) {return d.detections})]).range([.3,.9])(+d.detections);
			   }}})

		circles=pan.svg.selectAll(".circles").data(nodes);
		circles.transition().attr({
					cx:function(d) {return isNaN(d.x)?d.tx:d.x},
					cy:function(d) {return isNaN(d.y)?d.ty:d.y},
					 r:function(d) {return d.r}
			})
			.style({stroke:"none",fill:function(d) {return riskColors[d.risk]},
					"fill-opacity":function(d) {if (!d.severity) {return .9;} else {
			   	//return {"medium":.2,"high":.5,"critical":9}[d.severity];
			   	return d3.scale.linear().domain([0,.8*d3.max(nodes,function(d) {return d.detections})]).range([.3,.9])(+d.detections);
			   }}
		})
		
		if(mode==1) {
				pan.svg.selectAll(".labels").data(pan.main=="applications"?categories:threatCats).enter().append("text")
					.text(String).classed("labels",1)
					.attr({x:function(d)   {return pan.main=="applications"?(catxy[d][0]):(threatCatxy[d][0]);},
						   y:function(d,i) {return i<({"applications":2,"threats":4}[pan.main])?20:300;},
			   "text-anchor":"middle"})
			}
			if(mode==2) {
				pan.svg.selectAll(".labels").data(pan.main=="applications"?technologies:threatTypes).enter().append("text")
					.text(String).classed("labels",1)
					.attr({x:function(d)   {return pan.main=="applications"?(techxy[d][0]):(threatxy[d][0])},
						   y:function(d,i) {return i<2?20:350;},
			   "text-anchor":"middle"})
			}

		circles.on("mouseover",function(d) {
			var infotip;
			if(pan.main=="applications") {
				if(d3.select("#select_dataset").property("value").toLowerCase()=="applications by subcategory") {
					infotip=[
					{label:"",value:d.name,title:true},
					{label:"Bandwidth:",value:d3.format(",")(+d.bandwidth)},
					{label:"HD movies equivalent:",value:d3.format(",")(+d.hd)},
					{label:"% of total bandwidth:",value:d3.format("4.2%")(+d.bandwidth/pan.totalB)},	
					{label:"Sessions consumed:",value:d3.format(",")(+d.sessions)},
					{label:"% of total sessions:",value:d3.format("4.2%")(+d.sessions/pan.totalS)},	
					{label:"# of apps:",value:+d.count}
				];
				}
				else {
				infotip=[
					{label:"",value:d.name,title:true},
					{label:"Bandwidth:",value:d3.format(",")(+d.bandwidth)},
					{label:"HD movies equivalent:",value:d3.format(",")(+d.hd)},
					{label:"% of total bandwidth:",value:d3.format("4.2%")(+d.bandwidth/pan.totalB)},	
					{label:"Sessions consumed:",value:d3.format(",")(+d.sessions)},
					{label:"% of total sessions:",value:d3.format("4.2%")(+d.sessions/pan.totalS)},	
					{label:"Frequency of use:",value:isNaN(d.frequency)?"-":d3.format("4.2%")(+d.frequency)},
					{label:"Ports:",value:d.ports}

				];	}
			} else {
				infotip=[
					{label:"",value:d.name,title:true},
					{label:"Application:",value:d.application},
					{label:"Threat type:",value:d.threatType},
					{label:"Category:",value:d.category},
					{label:"Severity:",value:d.severity},
					{label:"Detections:",value:d3.format(",")(+d.detections)}
				]
			}
			pan.panel.html("");
			pan.panel.selectAll("p").data(infotip).enter().append("p").style("margin",0);
			pan.panel.selectAll("p").append("span").classed("label",1).html(function(d) {return d.label;}).style("color","#9F9892")
			pan.panel.selectAll("p").append("span").classed("value",1).html(function(d) {return (d.title?"":"&nbsp;")+d.value;}).style("font-weight",function(d) {return d.title?"bold":null;})

			var xy=[];
			xy[0]=d3.select("#"+pan.id).property("offsetLeft")+d3.min([700,d.x-114]);
			if(pan.main=="applications") {
				xy[1]=d3.select("#"+pan.id).property("offsetTop")+d.y-d.r
			} else {
				xy[1]=d3.select("#"+pan.id).property("offsetTop")+d.y-d.r+30;
			}
			
			pan.panel.transition().style({top:xy[1]+"px",left:xy[0]+"px",display:"block",width:"200px"});
			d3.select(this).style("stroke","black");
		})
		circles.on("mouseout",function(d) {
			d3.select(this).style("stroke","none");
			pan.panel.style("display","none");
		})
		d3.select(".backrect").on("mouseover",function() {
			circles.style("stroke","none");
			pan.panel.style("display","none");
		})

		// if the mode is not 3, we are using a force layout to complement the initial packing algorithm
		if (mode<3) {
			pan.tick=0;
			function tick(e) {
				if(pan.tick) {pan.tick=pan.tick+1} else {pan.tick=1;}
				circles
					.each(gravity(e.alpha*pan.gravity))
					.each(collide(pan.collide))
				/*if(pan.tick==20) {circles.transition().attr({
					cx:function(d) {return d.x},
					cy:function(d) {return d.y}})
					}*/
				if(pan.tick>0) {circles.attr({
					cx:function(d) {return d.x},
					cy:function(d) {return d.y}})
					}
					//.each(draw)
				
			}

			function gravity(k) {
				return function(d) {
					if (typeof(d.tx)!=="undefined") {
						d.x=d.x+(d.tx-d.x)*k;
						d.y=d.y+(d.ty-d.y)*k;
					}
				};
			}

			function collide(k) {
				var q=d3.geom.quadtree(nodes);
				return function(node) {
					var nr= node.r+padding,
						nx1=node.x -nr,
						nx2=node.x +nr,
						ny1=node.y -nr,
						ny2=node.y +nr;
					q.visit(function(quad,x1,y1,x2,y2) {
						if (quad.point && (quad.point !== node )) {
							var x=node.x-quad.point.x,
								y=node.y-quad.point.y,
								l=x*x+y*y,
								r=nr+quad.point.r;

							if (l<r*r) {
								l = ((l = Math.sqrt(l)) - r) / l * k;
					            node.x -= x *= l;
					            node.y -= y *= l;
					            //bind(node)
					            quad.point.x += x;
					            quad.point.y += y;
					            //bind(quad.point)
					            //if (node.x-node.r<200) {node.x=node.r+200+x;}
							}
						}
						return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
					});
				};
			}
			function draw(d) {
				var max=d.max/2,x=d.x,y=d.y,cx=d.tx,cy=d.ty;
				var dist=Math.sqrt((x-cx)*(x-cx)+(y-cy)*(y-cy))
				
				if (dist>max) {
					x=cx+(max/dist)*(x-cx);
					y=cy+(max/dist)*(y-cy);
				}
				d3.select(this).attr({cx:x,cy:y}) 
			}

			function bind(node) {

				var max=200;
				var x=node.x,y=node.y,tx=node.tx,ty=node.ty;
				var d=Math.sqrt((x-tx)*(x-tx)+(y-ty)*(y-ty))
				if (d>max) {
					node.x=node.tx+(max/d)*(node.x/node.tx);
					node.y=node.ty+(max/d)*(node.y/node.ty);
						
				}
			}
			pan.force
				.nodes(nodes)
				.friction(pan.friction)
				.charge(function(d) {return pan.charge*Math.pow(d.r,2);})
				.on("tick",tick)
				.start();
			//circles=pan.svg.selectAll(".circles").data(nodes);
			/*pan.force.on("end",function() {circles.transition().attr({cx:function(d) {return d.x;},cy:function(d) {return d.y;}})})*/
			

		}

	}


pan.setInterface = function() {
		if(!d3.select("#select_dataset").property("value")) {d3.select("#select_dataset").select("option").property("selected",true);}
		if(!d3.select("#select_region").property("value")) {d3.select("#select_region").select("option").property("selected",true);}
		

		d3.select("#data_left").select("h2").html([
			"Application Bandwidth",
			"Application Bandwidth by Subcategory",
			"File Sharing Application Bandwidth",
			"Photo-Video Application Bandwidth",
			"Remote Access Application Bandwidth",
			"Social Networking Application Bandwidth",
			"Proxy & Encrypted Tunnels Application Bandwidth",

			"Threat Detections",
			"Exploit Detections by Application",
			"Malware Detections by Application"]
			[d3.select("#select_dataset").property("selectedIndex")])
		d3.select("#data_right").selectAll("p").data(interface.leftPan[pan.main]).exit().remove();
		d3.select("#data_right").selectAll("p").data(interface.leftPan[pan.main]).enter().insert("p","br");
		d3.select("#data_right").selectAll("p").html(function(d) {return '<span class="field">'+d+'</span>&nbsp;<span class="value"></span>';});

		
     	d3.select("#view_selection").selectAll("a").data(interface.buttons[pan.main]).exit().remove();
     	d3.select("#view_selection").selectAll("a").data(interface.buttons[pan.main]).enter().append("a");
     	d3.select("#view_selection").selectAll("a")
     		.html(function(d) {return d.label})
     		.attr({	href:"#",
     				id:function(d) {return d.id;},
     				"class":function(d,i) {return "btn"+((i==pan.mode)?" active":"");}
     			});		

     	d3.selectAll("#all-app,#all-thr").on("click",function() {
			d3.select("#view_selection").selectAll("a").classed("active",0);
			d3.select(this).classed("active",1);
			pan.mode=0;
			pan.dataLeft[2]="All";
			pan.drawview(pan.mode);
		})

		d3.selectAll("#cat-app,#cat-thr").on("click",function() {
			d3.select("#sidebar").selectAll("a").classed("active",0)
			d3.select("#view_selection").selectAll("a").classed("active",0);
			d3.select(this).classed("active",1);
			pan.mode=1;
			pan.dataLeft[2]="Category";
			pan.drawview(pan.mode);
		})

		d3.select("#tec-app").on("click",function() {
			if(!d3.select(this).classed("disabled")) {
				d3.select("#sidebar").selectAll("a").classed("active",0)
				d3.select("#view_selection").selectAll("a").classed("active",0);
				d3.select(this).classed("active",1);
				pan.mode=2
				pan.dataLeft[2]="Technology";
				pan.drawview(pan.mode);
			}
		})

		d3.select("#typ-thr").on("click",function() {
			d3.select("#sidebar").selectAll("a").classed("active",0)
			d3.select("#view_selection").selectAll("a").classed("active",0);
			d3.select(this).classed("active",1);
			pan.mode=2
			pan.dataLeft[2]="Type";
			pan.drawview(pan.mode);
		})

		d3.selectAll("#fre-app","#fre-thr").on("click",function() {
			if(!d3.select(this).classed("disabled")) {
				d3.select("#sidebar").selectAll("a").classed("active",0)
				d3.select("#view_selection").selectAll("a").classed("active",0);
				d3.select(this).classed("active",1);
				pan.mode=3
				pan.dataLeft[2]=="Frequency";
				pan.drawview(pan.mode);
			}
		})

		if(d3.select("#select_dataset").property("value")==="Applications by Subcategory") {
			d3.selectAll("#tec-app,#fre-app").classed("disabled",1);
		}
				

     	if (pan.main=="applications") {
     		delete pan.criteria["severityVal"]
     		d3.select("#riskpanel").html(rp);
     		d3.select("#riskpanel").selectAll("a:not(.risk)").on("click", function() {
     			pan.panel.style({
     				display:"block",
     				height:null,
     				width:"500px",
     				top:d3.select("#chart").property("offsetTop")+"px",
     				left:d3.select("#chart").property("offsetLeft")+400+"px"
     			})
     				.html("<strong>Application Risk Factor</strong></br>The individual application risk factor is a subjective assessment that is calculated using the following eight behavioral characteristics: <ol><li>Can it transfer files?</li><li>Is it known to propagate malware?</li><li>Does it regularly consume more than 1 Mbps through normal use?</li><li>Is it purposely evasive?</li><li>Has been widely deployed?</li><li>Does it have known vulnerabilities?</li><li>Is it prone to misuse or easily configured to expose more than intended?</li><li>Can it tunnel other applications?</li></ol> The individual behavioral characteristics and the resulting risk factor provides security administrators with more information on how the application operates, the potential risks to the business and can be used as a mechanism for policy creation.</br></br><strong>Application Frequency</strong></br>This is determined by the number of organizations where the application was in use by any number of users.</br></br><strong>Application Taxonomy</strong></br>Palo Alto Networks application taxonomy is broken down into 5 application categories, 26 subcategories and the 4 underlying technologies.")
     		})
     		d3.selectAll(".risk").on("click",function(d,i) {
			
			if(i==5) {
				delete pan.criteria["risk"]
				pan.risk="All"
			}
			else {
				pan.criteria["risk"]=(i+1);
				pan.risk=i+1;
			}
			pan.filter(pan.criteria);
			pan.drawview(pan.mode);
		})

     	} else {
     		var sv=["Medium","High","Critical","All"]

     		d3.select("#riskpanel").html('<p id="riskpanel" style="height: 27px;">Severity:&nbsp;<a href="#"><span style="padding: 4px 5px; height: 20px; background-color: rgb(102, 102, 102); margin: 1px; color: white;">Medium</span></a><a href="#"><span style="padding: 4px 5px; height: 20px; background-color: rgb(102, 102, 102); margin: 1px; color: white;">High</span></a><a href="#"><span style="padding: 4px 5px; height: 20px; background-color: rgb(102, 102, 102); margin: 1px; color: white;">Critical</span></a><a href="#"><span style="padding: 4px 5px; height: 20px; background-color: rgb(204, 204, 204); margin: 1px; color: rgb(102, 102, 102);">All</span></a><span class="spacer"></span><a href="#nogo"><img src="images/risk_help.png" class="help" width="26" height="27" align="right" style="margin-top: -7px;"></a></p>')
     		d3.select("#riskpanel").select(".help").on("click", function() {
     			d3.select(".infotip").style({
     				display:"block",
     				height:null,
     				width:"500px",
     				top:d3.select("#chart").property("offsetTop")+"px",
     				left:d3.select("#chart").property("offsetLeft")+400+"px"
     			})
     				.html("<strong>Application Risk Factor</strong></br>The individual application risk factor is a subjective assessment that is calculated using the following eight behavioral characteristics: <ol><li>Can it transfer files?</li><li>Is it known to propagate malware?</li><li>Does it regularly consume more than 1 Mbps through normal use?</li><li>Is it purposely evasive?</li><li>Has been widely deployed?</li><li>Does it have known vulnerabilities?</li><li>Is it prone to misuse or easily configured to expose more than intended?</li><li>Can it tunnel other applications?</li></ol> The individual behavioral characteristics and the resulting risk factor provides security administrators with more information on how the application operates, the potential risks to the business and can be used as a mechanism for policy creation.</br></br><strong>Application Frequency</strong></br>This is determined by the number of organizations where the application was in use by any number of users.</br></br><strong>Application Taxonomy</strong></br>Palo Alto Networks application taxonomy is broken down into 5 application categories, 26 subcategories and the 4 underlying technologies.")
     		})
     		d3.select("#riskpanel").selectAll("a").on("click", function(d,i) {if(i<4) {
     			d3.select("#riskpanel").selectAll("span").style({"background-color":"#666","color":"white","text-transform":null});
     			d3.select(this).select("span").style({"background-color":"#ccc","color":"#666"
     			//	,"text-transform":"uppercase"
     			})
     			if(i==3) {
     				pan.severity="All"
     				delete pan.criteria["severityVal"]
     			} else {
     				pan.criteria["severityVal"]=i;
     				pan.severity=d;
     			}
     			pan.filter(pan.criteria);
     			pan.drawview(pan.mode);
     			}
     		})
     	}
	}

	pan.view = function(options) {
		
		pan.id=options.id||"chart";
		pan.appfile=options.appfile||"includes/data.csv";
		pan.threatfile=options.threatfile||"includes/threats.csv";
		pan.minrad=options.minrad||0;
		pan.maxrad=options.maxrad||Infinity;
		pan.strata=options.strata||false;
		pan.gravity=options.gravity||0.5;
		pan.friction=options.friction||0.1;
		pan.charge=options.charge||-1;
		pan.collide=options.collide||0.5;

				
		pan.svg=d3.select("#"+pan.id).selectAll("svg").data([0]).enter()
			.append("svg").attr({width:pan.width,height:pan.height})
		pan.svg.selectAll("*").remove();
		pan.svg.append("g").attr("id","back");
		//d3.select("#"+pan.id).style("position","relative")
		pan.panel=d3.select("body").selectAll(".infotip").data([0]).enter()
			.append("div")
			.classed("infotip",1)
			.style({
				position:"absolute",
				display:"none",
				top:"0px",
				left:"0px",
				width:"200px",
				padding:"10px",
				"border-radius":"5px",
				"-webkit-border-radius":"5px",
				"-moz-border-radius":"5px",
				"background-color":"white",
				"box-shadow":"0px 0px 5px #AAA",
				"z-index":"100",
				border:"0px solid #5D584F" 
			})
		pan.force = d3.layout.force()
			    .charge(0)
			    .gravity(0)
			    .size([pan.width, pan.height]);
		
		pan.criteria={region:"global"}
		pan.totalB=1;
		pan.totalS=1;
		pan.dataLeft=["","","All",""]
		pan.dataRight=[0,0,0,0,0]
		pan.readdata()
		pan.main="applications"
		pan.mode=0;

		d3.select("#select_dataset").select("option").property("selected",true)
		d3.select("#select_region").select("option").property("selected",true)
		pan.setInterface();

		

		d3.select("#select_region").property("value","Worldwide").on("change",function() {
			d3.select("#sidebar").selectAll("a").classed("active",0)
			var v=d3.select(this).property("selectedIndex");
			pan.criteria["region"]=["global","americas","europe","asiapacific","japan"][v];
			pan.filter(pan.criteria);
			pan.drawview(pan.mode);
		})

		d3.select("#select_dataset").property("value","All Applications").on("change",function() {
			d3.select("#sidebar").selectAll("a").classed("active",0)
			var v=d3.select(this).property("selectedIndex");
			pan.setInterface();
			if(v<7) {
				if (pan.main!="applications") {
						pan.main="applications";
						pan.setInterface();
						delete pan.criteria["threatType"];
					}

					if (v<2) {
						delete pan.criteria["subcategory"];
					} else {
						pan.criteria["subcategory"]=["file-sharing","photo-video","remote-access","social-networking","proxy-tunnels"][v-2]
					}
					if(v==1) {
							d3.selectAll("#tec-app,#fre-app").classed("disabled",1);
							if(pan.mode>1) {
								pan.mode=0;
								d3.select("#all-app").classed("active",1);
							}
						} else {
							d3.selectAll("#tec-app,#fre-app").classed("disabled",0);	
						}
					pan.filter(pan.criteria);
					pan.drawview(pan.mode);
				} else {
					if(pan.main!="threats") {
						pan.main="threats";
						pan.setInterface();
						delete pan.criteria["subcategory"];
					}
					if(v==7) {
						if(pan.mode==3) {pan.mode=0;d3.select("#all-thr").classed("active",1);}
						d3.selectAll("#fre-thr").classed("disabled",0)
						delete pan.criteria["threatType"];
					} else {
						d3.selectAll("#fre-thr").classed("disabled",1)
						pan.criteria["threatType"]=((v==8)?"exploit":"malware")
					}
					pan.filter(pan.criteria);
					//pan.setInterface();
					pan.drawview(pan.mode);
				}
		})

		d3.select("#sidebar").selectAll("a").on("click",function(d,i) {
			d3.select("#view_selection").selectAll("a").classed("active",0).classed("disabled",0)
			d3.select("#sidebar").selectAll("a").classed("active",0)
			d3.select(this).classed("active",1)
			if(i==0) {
				pan.main="applications";
				d3.select("#select_dataset").property("value","Applications by Subcategory");
				d3.select("#select_region").property("value","Worldwide");
				d3.select("#all-app").classed("active",1);
				d3.selectAll("#tec-app,#fre-app").classed("disabled",1);
				pan.mode=0;
				pan.risk="All";
				pan.dataLeft[2]="All";
				pan.criteria={region:"global"};
				pan.filter(pan.criteria);
				pan.setInterface();
				pan.drawview(pan.mode);
			}
			if(i==1) {
				pan.main="threats";
				d3.select("#select_dataset").property("value","Exploits by Application");
				d3.select("#select_region").property("value","Worldwide");
				d3.select("#all-thr").classed("active",1);
				d3.select("#fre-thr").classed("disabled",1);
				pan.mode=0;
				pan.severity="All";
				pan.dataLeft[2]="All";
				pan.criteria={region:"global",threatType:"exploit"};
				pan.filter(pan.criteria);
				pan.setInterface();
				pan.drawview(pan.mode);
			}
			if(i==2) {
				pan.main="threats";
				d3.select("#select_dataset").property("value","Malware by Application");
				d3.select("#select_region").property("value","Worldwide");
				d3.select("#all-thr").classed("active",1);
				d3.select("#fre-thr").classed("disabled",1);
				pan.mode=0;
				pan.severity="All";
				pan.dataLeft[2]="All";
				pan.criteria={region:"global",threatType:"malware"};
				pan.filter(pan.criteria);
				pan.setInterface();
				pan.drawview(pan.mode);
			}
			if(i==3) {
				pan.main="applications";
				d3.select("#select_dataset").property("value","Social Networking");
				d3.select("#select_region").property("value","Worldwide");
				d3.select("#all-app").classed("active",1);
				pan.mode=0;
				pan.risk="All";
				pan.dataLeft[2]="All";
				pan.criteria={region:"global",subcategory:"social-networking"};
				pan.filter(pan.criteria);
				pan.setInterface();
				pan.drawview(pan.mode);
			}
			if(i==4) {
				pan.main="applications";
				d3.select("#select_dataset").property("value","File Sharing");
				d3.select("#select_region").property("value","Worldwide");
				d3.select("#all-app").classed("active",1);
				pan.mode=0;
				pan.risk="All";
				pan.dataLeft[2]="All";
				pan.criteria={region:"global",subcategory:"file-sharing"};
				pan.filter(pan.criteria);
				pan.setInterface();
				pan.drawview(pan.mode);
			}
			if(i==5) {
				pan.main="applications";
				d3.select("#select_dataset").property("value","Photo-Video");
				d3.select("#select_region").property("value","Worldwide");
				d3.select("#all-app").classed("active",1);
				pan.mode=0;
				pan.risk="All";
				pan.dataLeft[2]="All";
				pan.criteria={region:"global",subcategory:"photo-video"};
				pan.filter(pan.criteria);
				pan.setInterface();
				pan.drawview(pan.mode);
			}
			if(i==6) {
				pan.main="applications";
				pan.setInterface();
				d3.select("#select_dataset").property("value","Remote Access");
				d3.select("#select_region").property("value","Worldwide");
				d3.select("#all-app").classed("active",1);
				pan.mode=0;
				pan.risk="All";
				pan.dataLeft[2]="All";
				pan.criteria={region:"global",subcategory:"remote-access"};
				pan.filter(pan.criteria);
				pan.setInterface();
				pan.drawview(pan.mode);
			}

			if(i==7) {
				pan.main="applications";
				pan.setInterface();
				d3.select("#select_dataset").property("value","Proxy & Encrypted Tunnels");
				d3.select("#select_region").property("value","Worldwide");
				d3.select("#all-app").classed("active",1);
				pan.mode=0;
				pan.risk="All";
				pan.dataLeft[2]="All";
				pan.criteria={region:"global",subcategory:"proxy-tunnels"};
				pan.filter(pan.criteria);
				pan.setInterface();
				pan.drawview(pan.mode);
			}

			if(i==8) {
				pan.main="applications";
				pan.setInterface();
				d3.select("#select_dataset").property("value","All Applications");
				d3.select("#select_region").property("value","Worldwide");
				d3.select("#all-app").classed("active",1);
				pan.mode=0;
				pan.risk="All";
				pan.dataLeft[2]="All";
				pan.criteria={region:"global"};
				pan.filter(pan.criteria);
				pan.setInterface();
				pan.drawview(pan.mode);
			}

			if(i==9) {
				pan.main="threats";
				pan.setInterface();
				d3.select("#select_dataset").property("value","All Threats");
				d3.select("#select_region").property("value","Worldwide");
				d3.select("#all-thr").classed("active",1);
				d3.select("#fre-thr").classed("disabled",1);
				pan.mode=0;
				pan.severity="All";
				pan.dataLeft[2]="All";
				pan.criteria={region:"global"};
				pan.filter(pan.criteria);
				pan.setInterface();
				pan.drawview(pan.mode);
			}
		})
	}
	


})();