//Ragdoll physic simulation similar to Thor's Cape for Thor God of Thunder Game I worked on.
//www.amiedd.com
//October 2018

var ctx = canvas.getContext("2d");
var nodes = [];
var links = [];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function dist(x,y){
  return Math.sqrt(x*x+y*y);
}

var time = Date.now();
var dt = 1/60;
var TWO_PI = 2 * Math.PI;

var width = 21;
var height = 22;
var nodeCount = width * height;

var delta = Math.min((canvas.width-30)/width, (canvas.height-20)/height);
var dx = delta;
var dy = delta;
var max_dist = delta;
var min_dist = 5;
var iterations = 25;

for (i = 0; i < nodeCount; i++) {
  var node = {
    x: canvas.width/2 - width/2 * dx + Math.floor(i%width) * dx,
    y: canvas.height/2 - height/2 * dy + Math.floor(i/width) * dy,
    radius: 1,
    last_x: canvas.width/3 - width/3 * dx + Math.floor(i%width) * dx,
    last_y: canvas.height/2 - height/2 * dx + Math.floor(i/width) * dx + Math.random() * dy,
    static: false
  };
  nodes.push(node);
}
for(i = 0; i < width; i++){
}
nodes[0].static = true;
nodes[Math.floor(width/2)].static = true;
nodes[Math.floor(width/2)].static = true;
nodes[Math.floor(width/2) + Math.floor(width/2)].static = true;
nodes[width-1].static = true;

function create_links(){
  //X links in the polygon for cape
  for (i = 0; i < (nodes.length-1); i++) {
    if(((i+1)%width) > 0){
      var link = {
        first: i, 
        second: i+1
      };
      links.push(link);
    }
  }

  
  //Y links
  for (i = 0; i < (nodes.length-width); i++) {
    var link = {
      first: i, 
      second: i+width
    };
    links.push(link);
  }

}
canvas.addEventListener('mousemove', mouse_track);
canvas.addEventListener('mousedown', mouse_down);
canvas.addEventListener('mouseup', mouse_up);

var active_node;
var mouse_pos_x;
var mouse_pos_y;
var drag = false;
function mouse_track(event) {
  mouse_pos_x = event.clientX;
  mouse_pos_y = event.clientY;
  if(drag){
    if(active_node != -1){
      nodes[active_node].x = mouse_pos_x;
      nodes[active_node].y = mouse_pos_y;
      nodes[active_node].last_x = mouse_pos_x;
      nodes[active_node].last_y = mouse_pos_y;
    }
  }
}
function mouse_down(event) {

  drag = true;
  mouse_pos_x = event.clientX;
  mouse_pos_y = event.clientY;
  active_node = -1;
  for(l = 0; l < nodes.length; l++){
    if(dist(mouse_pos_x - nodes[l].x, mouse_pos_y - nodes[l].y) < 20){
      active_node = l;
      if(active_node != -1){
        nodes[active_node].x = mouse_pos_x;
        nodes[active_node].y = mouse_pos_y;
        nodes[active_node].last_x = mouse_pos_x;
        nodes[active_node].last_y = mouse_pos_y;
      }
      break;
    }
  }
}

function mouse_up(event) {
  drag = false;
  active_node = -1;
}

function resolve_constraints(){

  var first;
  var second;
  var dx;
  var dy;
  var d;
  var diff;
  var translateX;
  var translateY;
  
  for(i = 0; i < iterations; i++){
    for(l = 0; l < links.length; l++){
      first = nodes[links[l].first];
      second = nodes[links[l].second];
      dx = first.x - second.x;
      dy = first.y - second.y;
      d = Math.sqrt(dx*dx+dy*dy);
      if(d > max_dist){
        diff = (max_dist - d)/d;
        translateX = dx  * 0.5 * diff;
        translateY = dy  * 0.5 * diff;
        if(!first.static){

          if(links[l].first!= active_node){
            first.x += translateX;
            first.y += translateY;
          }
        }
        if(!second.static){

          if(links[l].second!= active_node){
            second.x -= translateX;
            second.y -= translateY;
          }
        }
      }
    }
  }
}

function move(dt, alpha) {
  var x_vel;
  var y_vel;
  var next_x;
  var next_y;
  var accX = 0;
  var accY = 9.8;

  for(i = 0; i < nodes.length; i++){
    if(i != active_node){
      x_vel = nodes[i].x - nodes[i].last_x + accX * dt;
      y_vel = nodes[i].y - nodes[i].last_y + accY * dt;
      next_x = nodes[i].x + x_vel;
      next_y = nodes[i].y + y_vel;

      nodes[i].last_x = nodes[i].x;
      nodes[i].last_y = nodes[i].y;
      if(!nodes[i].static){
        nodes[i].x = next_x;
        nodes[i].y = next_y;
      }
    }
  }
  for(i = 0; i < nodes.length; i++){
    if(nodes[i].x < 10){
      nodes[i].x = 10;
    }  
    if(nodes[i].y < 10){
      nodes[i].y = 10;
    }
    if(nodes[i].x > canvas.width-10){
      nodes[i].x = canvas.width-10;
    }  
    if(nodes[i].y > canvas.height-10){
      nodes[i].y = canvas.height-10;
    }
  }
}

var fps;
create_links();
var newtime;
var frametime;
var accumulator = 0;
var alpha;
function draw() {

//game physics time step logic
  newtime = Date.now();
  frametime = newtime - time;
  fps = 1000 / (frametime);
  time = newtime;
  
  //Pause cape movement when no activity 
  if (fps > 10) {
    accumulator += frametime/1000;
    while ( accumulator >= dt ){
      resolve_constraints();
      move(dt);
      accumulator -= dt;
    }
    alpha = accumulator / dt;
  }
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = "rgba(204,14,29, 0.7)";

  for (i = 0; i < nodes.length; i++) {
    ctx.beginPath();
    ctx.arc(nodes[i].x, nodes[i].y, nodes[i].radius, 0, TWO_PI); 
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(162,20,26,1)";
  for(l = 0; l < links.length; l++){
    ctx.beginPath();
    ctx.moveTo(nodes[links[l].first].x, nodes[links[l].first].y);
    ctx.lineTo(nodes[links[l].second].x, nodes[links[l].second].y);
    ctx.stroke();
  }

  window.requestAnimationFrame(draw);
}
window.requestAnimationFrame(draw);