/* global angular, _, $, d3 */

angular.module('dci')
	.directive('dciSankey', function() {
		return {
			template:'<div class="sankey" id="sankey-chart"><company-info-box selected="selected" x="infoboxx" y="infoboxy"></company-info-box></div>',
			restrict:'E',
			scope:{app:'='},
			controller:function($scope, $timeout, utils) {

					var ADD_APP_LEVEL = true, // add app level
						allData = $scope.$parent.allData,
						hosts = $scope.$parent.hosts,
						data = $scope.$parent.data,	
						app = $scope.$parent.app,
						details = $scope.$parent.details,
						pitypes = $scope.$parent.pitypes,
						app_id = utils.toAppId(app),
						appcompany = $scope.$parent.appcompany,											
						margin = {top: 1, right: 420, bottom: 6, left: 1},
						width = $('body').width() - margin.left - margin.right, // 960 - margin.left - margin.right,
						height = $('body').height() - margin.top - margin.bottom; // 800 - margin.top - margin.bottom,

					window._ds = $scope;

					var formatNumber = d3.format(",.0f"),
						format = function(d) { return formatNumber(d) + " TWh"; },
						color = d3.scale.category20();

					var svg = d3.select("#sankey-chart").append("svg")
					    .attr("width", width + margin.left + margin.right)
					    .attr("height", height + margin.top + margin.bottom)
					  .append("g")
					  	.attr("class","root")
					    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

					var sankey = d3.sankey()
					    .nodeWidth(15)
					    .nodePadding(10)
					    .size([width, height]),
					    path = sankey.link(),
					    link,
						dragmove = function(d) {
						    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
						    sankey.relayout();
						    link.attr("d", path);
					    };

					if (!data.length) { $scope.error = 'no data for app ' + $scope.app; }
					var recompute = () => {

						var isPDCI = $scope.$parent.pdciApps && $scope.$parent.pdciApps.length || false,
							pdciApps = isPDCI ? $scope.$parent.pdciApps : [],		
							apps = (isPDCI ? _.union(pdciApps,[app]) : [app]),
							c2pi = utils.makeCompany2pi(app, data, hosts, pitypes, 0),
							cat2c2pi = utils.makeCategories(appcompany, details, c2pi),
							aTc = utils.makeApp2company(apps, data, c2pi, hosts, 0),
							app_ids = _.keys(aTc);

						console.info("isPDCI is ", isPDCI);

						// clear from last drawing
						$("#sankey-chart").find("svg g.root").children().remove(); // something like svg.remove(); would be more elegant

						if (isPDCI) { 
							// redefine data - to include all pdci apps as well
							data = allData.filter((x) => x.app === app || $scope.$parent.pdciApps.indexOf(x.app) >= 0);
							c2pi = utils.makePDCIc2pi(apps, data, hosts, pitypes, 0);
							cat2c2pi = utils.makeCategories(appcompany, details, c2pi);
							aTc = utils.makeApp2company(apps, data, c2pi, hosts, 0);
							app_ids = _.keys(aTc);							
						}

						// let's start making nodes
						// start with the pitypes
						var OTHERPITYPE = 'OTHER_PI',
							pitypes_set = _(pitypes).values().flatten().uniq().value(), // .concat([OTHERPITYPE]),
							nodemap = {},
							nodes = [], 
							links = [],
							pushNode = (id, label, isapp, type) => {
								console.log('pushing node ', id);
								var l = nodes.length;
								nodes.push({name:id, label:label, isapp:isapp, type:type});
								nodemap[id] = l;
								return l;
							},
							pushLink = (from, to, width, isApp) => {
								var l = links.length;
								links.push({source:from, target:to, value:width || 1, isapp:isApp});
								return l;
							},
							pilabels = utils.pilabels,
							a2pi = (aid) => _.flatten(aTc[aid].map((company) => c2pi[company])),
							a2cat = (aid) => _.keys(cat2c2pi).filter((cat) => _.intersection(_.keys(cat2c2pi[cat] || {}), aTc[aid]).length > 0);

						////////////////////// nodes /////////////////////////
						// 1. register the apps as nodes
						if (ADD_APP_LEVEL) { apps.map((appname) => pushNode(utils.toAppId(appname),appname,appname===app, 'app')); }
						// pitypes 
						pitypes_set.map((pitype) => pushNode(pitype, pilabels[pitype], a2pi(app_id).indexOf(pitype) >= 0, 'pitype'));
						// 2. companies
						_.keys(c2pi).map((c) => pushNode(c, c, aTc[app_id].indexOf(c) >= 0, 'company'));
						// 3. categories
						_.keys(cat2c2pi).map((cname) => pushNode(cname, cname, a2cat(app_id).indexOf(cname) >= 0, 'category'));

						///////////////// app -> company links ////////////////////////////////
						if (ADD_APP_LEVEL) { 
							// app -> pitype count
							app_ids.map((aid) => {
								// first compile { pitype -> count  } to determine thickness
								console.info('app adding app level ', aid, aTc[aid]);

								// apps out -> 1 -> company, company -> pi...
								// 
								var pi2c = _.flatten(aTc[aid].map((c) => c2pi[c]))
									.reduce((picounts,pit) => { 
										picounts[pit] = picounts[pit] && picounts[pit]+1 || 1;
										return picounts;
									}, {}),
									app_nid = nodemap[aid];

								_.map(pi2c, (count, pi_type) => {
									var pit_id = nodemap[pi_type];
									console.info('adding app link of ', aid, 'id: ', app_nid, ' → ', pi_type, ' id:', pit_id, ' ~ count: 	', count);
									pushLink(app_nid, pit_id, count, aid === app_id);
								});
							});
						}

						//////////////// pitype -> company links /////////////////
						_.toPairs(c2pi).map((pair) => {
							var company = pair[0], 
								pitypes = pair[1],
								company_nid = nodemap[company];

							// find the weight, find all apps that lead to this pi
							var n_apps = app_ids.filter((a)=> aTc[a].indexOf(company) >= 0).length;

							// add pitype -> company
							pitypes.map((pitype) => { 
								var pitype_id = nodemap[pitype];
								console.info('adding pitype-company link ', pitype, pitype_id, '→', company, company_nid);
								pushLink(pitype_id, company_nid, n_apps, aTc[app_id].indexOf(company) >= 0);
							});
							// disable "other"
							// if ($scope.c2pi[company].length === 0) {
							// 	console.info('adding other_PI link ', nodemap[OTHERPITYPE], ' -> ', company, ' ', company_nid);
							// 	pushLink(nodemap[OTHERPITYPE], company_nid);
							// }
						});
						//////////////// company -> category links ///////////////
						var pic_weight = (company) => c2pi[company].length;
						_.map(cat2c2pi, (c2pi, category) => {
							var category_nid = nodemap[category];
							_.map(c2pi,(pitypes, company) => {
								var company_nid = nodemap[company],
									relates_to_app = aTc[app_id].indexOf(company) >= 0;
								if (pitypes.length > 0) { 
									var pww = pic_weight(company);
									pushLink(company_nid, category_nid, pww, relates_to_app); 
								}
							});
						});

						console.log('old nodes ', nodes.length, JSON.stringify({nodes:nodes}));
						console.log('old links ', links.length, JSON.stringify({links:links}));							

						// kill nodes that don't have any links
						var newnodes = _.filter(nodes, (n,i) => links.filter((l) => l.source === i || l.target === i).length > 0),
							newmap = newnodes.reduce((m, i) => { 
								m[i.name] = newnodes.indexOf(i);
								return m;
							}, {}),
							newlinks = links.map((oldlink) =>_.extend({}, oldlink, {
								source: newmap[nodes[oldlink.source].name],
								target: newmap[nodes[oldlink.target].name]
							}));

						console.log('new nodes ', newnodes.length, JSON.stringify({nodes:newnodes}));
						console.log('new links ', newlinks.length, JSON.stringify({links:newlinks}));
						console.log('do it one ');

						// do it
						sankey.nodes(newnodes)
						    .links(newlinks)
						    .layout(128);

						console.log('do it link ');

						link = svg.append("g").selectAll(".link")
						  .data(newlinks)
						  .enter().append("path")
						  .attr("class", (d) => "link " + (isPDCI ? "pdci " : " ") + (d.isapp ? "isapp " : " "))
						  .attr("d", path)
						  .style("stroke-width", (d) => Math.max(1, d.dy))
						  .sort((a, b) => b.dy - a.dy);

						console.log('do it app ');

						link.append("title")
					    	.text(function(d) { return d.source.name + " → " + d.target.name + " ("+d.value+")"; });

						console.log('do it node ');


						var node = svg.append("g").selectAll(".node")
							.data(newnodes)
							.enter().append("g")
								.attr("class", (d) => "node " + (isPDCI ? "pdci " : " ") + (d.isapp ? "isapp " : " "))
								.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
							    .on('mouseenter', function(d) { 
							    	// console.log('click! ', d, d3.mouse(this));
							    	$scope.$apply(() => { 
							    		console.info('got a click, trying to selected', d);
							    		$scope.infoboxx = d.x + 22;
							    		$scope.infoboxy = d.y + d.dy/2 - 190/2; // 22;							    		
							    		if (d.type === 'company') { 
								    		$scope.selected=_.extend({}, details[d.name], d);
								    	} else {
								    		$scope.selected=_.extend({}, d);
								    	}
								    }); 
							    }).on('mouseleave', function() { 
							    	$scope.$apply(() => { delete $scope.selected; });
							    })
							.call(d3.behavior.drag()
						  		.origin(function(d) { return d; })
						  		.on("dragstart", function() { this.parentNode.appendChild(this); })
						  		.on("drag", dragmove));

						console.log('do it nodeapp ');

						node.append("rect")
						    .attr("height", function(d) { return d.dy; })
						    .attr("width", sankey.nodeWidth())
						    .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
						    .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
						    .append("title")
							.text(function(d) { return d.name + "\n" + format(d.value); });

						console.log('do it nodeapptext ');

						node.append("text")
						    .attr("x", -6)
						    .attr("y", function(d) { return d.dy / 2; })
						    .attr("dy", ".35em")
						    .attr("text-anchor", "end")
						    .attr("transform", null)
						    .text(function(d) { return d.label || d.name; })
						    .filter(function(d) { return d.x < width / 2; })
						    .attr("x", 6 + sankey.nodeWidth())
						    .attr("text-anchor", "start");							

						console.log('do it done ');

						};

					if (!appcompany) { $scope.error = 'Captured data for ' + app + ' is in old data format without company field'; }
					if (!hosts[$scope.app]) { $scope.error = 'No hosts known for app'; }

					// $scope.size = (l) => _.keys(l).length;
					// $scope.$watch('app', () => { if (app) { recompute(); } });

					recompute();
					$scope.$watch(() => $scope.$parent.pdciApps, recompute);
					console.info('sankey');
				}
		};
	});