/**
 * UBC CPSC 314, Vjan2015
 * Assignment 2 Template
 */

var scene = new THREE.Scene();
var flag = 1;
// ASSIGNMENT-SPECIFIC API EXTENSION
THREE.Object3D.prototype.setMatrix = function(a) {
  this.matrix=a;
  this.matrix.decompose(this.position,this.quaternion,this.scale);
}

// SETUP RENDERER
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff); // white background colour
document.body.appendChild(renderer.domElement);

// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000); // view angle, aspect ratio, near, far
camera.position.set(10,15,40);
camera.lookAt(scene.position); 
scene.add(camera);

// SETUP ORBIT CONTROL OF THE CAMERA
var controls = new THREE.OrbitControls(camera);
controls.damping = 0.2;

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);
resize();

// FLOOR WITH CHECKERBOARD 
var floorTexture = new THREE.ImageUtils.loadTexture('images/checkerboard.jpg');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(4, 4);

var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
var floorGeometry = new THREE.PlaneBufferGeometry(30, 30);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -0.1;
floor.rotation.x = Math.PI / 2;
scene.add(floor);

// UNIFORMS
var gemPosition = {type: 'v3', value: new THREE.Vector3(0,5,10)};
var gemRadius = {type: 'f', value: 1.0};
var v = new THREE.Vector3(0,0,0);
console.info(v.x);
console.info(v.y);
console.info(v.z);
console.info('---------------------');
// MATERIALS
var normalMaterial = new THREE.MeshNormalMaterial();
var redMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
var eyeMaterial = new THREE.MeshBasicMaterial({color: 0xdddddd});
var gemMaterial = new THREE.ShaderMaterial({
   uniforms: {
    gemRadius : gemRadius,
  },
});

// LOAD SHADERS
var shaderFiles = [
  'glsl/gem.vs.glsl',
  'glsl/gem.fs.glsl'
];

new THREE.SourceLoader().load(shaderFiles, function(shaders) {
  gemMaterial.vertexShader = shaders['glsl/gem.vs.glsl'];
  gemMaterial.fragmentShader = shaders['glsl/gem.fs.glsl'];

})

// GEOMETRY
var parallelepiped = new THREE.BoxGeometry(4, 6, 4); // centered on origin
var sphere = new THREE.SphereGeometry(1, 32, 32); // centered on origin
var eye = new THREE.SphereGeometry(0.5, 32, 32); // centered on origin
var v0 = new THREE.Vector4(0.0, 0.0, 0.0, 0.0);

var elipse = new THREE.SphereGeometry(1, 64, 64); // placed with lowest y point on origin
for (var i = 0; i < elipse.vertices.length; i++)
    elipse.vertices[i].y = (elipse.vertices[i].y + 1) * 1.5;

var thinCylinder = new THREE.CylinderGeometry(.1, .1, 5, 16); // placed with lowest y point on origin
for (var i = 0; i < thinCylinder.vertices.length; i++)
    thinCylinder.vertices[i].y += 1;

// STATIC MATRICES
var torsoMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,6, 0,0,1,-12, 0,0,0,1);
var headMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3, 0,0,1,0, 0,0,0,1);
var headtorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, headMatrix);

/*--------------rotateupperarmtorsoMatrix*/
var upperarmMatrix = new THREE.Matrix4().set(1,0,0,-2, 0,1,0,1, 0,0,1,0, 0,0,0,1);
var rotateMatrix   = new THREE.Matrix4().set(0,-1,0,0, 1,0,0,0, 0,0,1,0, 0,0,0,1);
var tempUpperarmtorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, upperarmMatrix);
var upperarmtorsoMatrix = new THREE.Matrix4().multiplyMatrices(tempUpperarmtorsoMatrix, rotateMatrix);

/*--------------forearmMatrix*/
var forearmMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3, 0,0,1,0, 0,0,0,1);
var forearmtorsoMatrix = new THREE.Matrix4().multiplyMatrices(upperarmtorsoMatrix, forearmMatrix);


/*----right hand---------rotateupperarmtorsoMatrixR*/
var upperarmMatrixR = new THREE.Matrix4().set(1,0,0,2, 0,1,0,1, 0,0,1,0, 0,0,0,1);
var rotateMatrixR   = new THREE.Matrix4().set(0,1,0,0, -1,0,0,0, 0,0,1,0, 0,0,0,1);
var tempUpperarmtorsoMatrixR = new THREE.Matrix4().multiplyMatrices(torsoMatrix, upperarmMatrixR);
var upperarmtorsoMatrixR = new THREE.Matrix4().multiplyMatrices(tempUpperarmtorsoMatrixR, rotateMatrixR);

/*-----right hand-------forearmMatrixR*/
var forearmMatrixR = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3, 0,0,1,0, 0,0,0,1);
var forearmtorsoMatrixR = new THREE.Matrix4().multiplyMatrices(upperarmtorsoMatrixR, forearmMatrixR);


//--------------------------------------------------------------------------------------------------
/*-----left leg --------leftlegMatrix*/
var leftlegMatrix = new THREE.Matrix4().set(1,0,0,-1.2, 0,1,0,-3, 0,0,1,0, 0,0,0,1);
var leftlegtorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, leftlegMatrix);
leftlegtorsoMatrix = new THREE.Matrix4().multiplyMatrices(leftlegtorsoMatrix, new THREE.Matrix4().set(1,0,0,0, 0,-1,0,0, 0,0,1,0, 0,0,0,1));

/*-----right leg --------leftlegMatrix*/
var rightlegMatrix = new THREE.Matrix4().set(1,0,0,1.2, 0,1,0,-3, 0,0,1,0, 0,0,0,1);
var rightlegtorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, rightlegMatrix);
rightlegtorsoMatrix = new THREE.Matrix4().multiplyMatrices(rightlegtorsoMatrix, new THREE.Matrix4().set(1,0,0,0, 0,-1,0,0, 0,0,1,0, 0,0,0,1));

/*--------------lefteyeMatrix*/
var lefteyeMatrix = new THREE.Matrix4().set(1,0,0,-0.4, 0,1,0,2, 0,0,1,0.6, 0,0,0,1);
var lefteyeheadtorsoMatrix = new THREE.Matrix4().multiplyMatrices(headtorsoMatrix, lefteyeMatrix);

/*--------------righteyeMatrix*/
var righteyeMatrix = new THREE.Matrix4().set(1,0,0,0.4, 0,1,0,2, 0,0,1,0.6, 0,0,0,1);
var righteyeheadtorsoMatrix = new THREE.Matrix4().multiplyMatrices(headtorsoMatrix, righteyeMatrix);


// CREATE GEOMETRY
var gem = new THREE.Mesh(sphere, gemMaterial);
scene.add(gem);

var lefteye = new THREE.Mesh(eye, eyeMaterial);
lefteye.setMatrix(lefteyeheadtorsoMatrix);
scene.add(lefteye);

var righteye = new THREE.Mesh(eye, eyeMaterial);
righteye.setMatrix(righteyeheadtorsoMatrix);
scene.add(righteye);

var torso = new THREE.Mesh(parallelepiped, normalMaterial);
torso.setMatrix(torsoMatrix);
scene.add(torso);

var head = new THREE.Mesh(elipse, normalMaterial);
head.setMatrix(headtorsoMatrix);
scene.add(head);

var upperarm = new THREE.Mesh(elipse, normalMaterial);
upperarm.setMatrix(upperarmtorsoMatrix);
scene.add(upperarm);

var forearm = new THREE.Mesh(elipse, normalMaterial);
forearm.setMatrix(forearmtorsoMatrix);
scene.add(forearm);

var upperarmR = new THREE.Mesh(elipse, normalMaterial);
upperarmR.setMatrix(upperarmtorsoMatrixR);
scene.add(upperarmR);

var forearmR = new THREE.Mesh(elipse, normalMaterial);
forearmR.setMatrix(forearmtorsoMatrixR);
scene.add(forearmR);

//left leg ---------------
var leftleg = new THREE.Mesh(elipse, normalMaterial);
leftleg.setMatrix(leftlegtorsoMatrix);
scene.add(leftleg);

//left leg ---------------
var rightleg = new THREE.Mesh(elipse, normalMaterial);
rightleg.setMatrix(rightlegtorsoMatrix);
scene.add(rightleg);

// complete body here

var leftBeam = new THREE.Mesh(thinCylinder, redMaterial);
scene.add(leftBeam);

var rightBeam = new THREE.Mesh(thinCylinder, redMaterial);
scene.add(rightBeam);


// MOVE BODY
var clock = new THREE.Clock(true);
function updateBody() {

  var t = clock.getElapsedTime(); // current time
  t = Math.sin(t);
  var temp = t * Math.PI/4;
  t = 0.3 * t ;

  
  var sinMatrix = new THREE.Matrix4().set(1,0,0,0,
										  0,1,0,0,
										  0,0,1,t,
										  0,0,0,1   );
  //move torso
  torsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, sinMatrix);
  torso.setMatrix(torsoMatrix);
  
  //move head
  headtorsoMatrix = new THREE.Matrix4().multiplyMatrices(headtorsoMatrix, sinMatrix);
  head.setMatrix(headtorsoMatrix);
  
  //move eyes
  lefteyeheadtorsoMatrix = new THREE.Matrix4().multiplyMatrices(lefteyeheadtorsoMatrix, sinMatrix);
  lefteye.setMatrix(lefteyeheadtorsoMatrix);
  righteyeheadtorsoMatrix = new THREE.Matrix4().multiplyMatrices(righteyeheadtorsoMatrix, sinMatrix);
  righteye.setMatrix(righteyeheadtorsoMatrix);
  
  upperarmtorsoMatrix = new THREE.Matrix4().multiplyMatrices(upperarmtorsoMatrix, sinMatrix);
  upperarmtorsoMatrixR = new THREE.Matrix4().multiplyMatrices(upperarmtorsoMatrixR, sinMatrix);
  
  // move elements here
  var rotateMatrix = new THREE.Matrix4().set(Math.cos(temp), -Math.sin(temp), 0, 0, 
											 Math.sin(temp),  Math.cos(temp), 0, 0, 
											 0,                            0, 1, 0,
											 0,                            0, 0, 1);
  // left arm movement 
  var tempMatrix   = new THREE.Matrix4().multiplyMatrices(upperarmtorsoMatrix, rotateMatrix);
  upperarm.setMatrix(tempMatrix);
  
  var tempMatrix1   = new THREE.Matrix4().multiplyMatrices(tempMatrix, forearmMatrix);
  var tempMatrix2   = new THREE.Matrix4().multiplyMatrices(tempMatrix1, rotateMatrix);
  forearm.setMatrix(tempMatrix2);
  
  // right arm movement 
  var tempMatrixR   = new THREE.Matrix4().multiplyMatrices(upperarmtorsoMatrixR, rotateMatrix);
  upperarmR.setMatrix(tempMatrixR);
  
  var tempMatrix1R   = new THREE.Matrix4().multiplyMatrices(tempMatrixR, forearmMatrixR);
  var tempMatrix2R   = new THREE.Matrix4().multiplyMatrices(tempMatrix1R, rotateMatrix);
  forearmR.setMatrix(tempMatrix2R);
  
  // move legs
  var leftlegrotateMatrix = new THREE.Matrix4().set(
												1,               0,               0, 0, 
											    0,  Math.cos(1.5*temp), -Math.sin(1.5*temp), 0, 
											    0,  Math.sin(1.5*temp),  Math.cos(1.5*temp), 0,
											    0,               0,               0, 1);  
												
  var rightlegrotateMatrix = new THREE.Matrix4().set(
												1,               0,               0, 0, 
											    0,  Math.cos(-1.5*temp), -Math.sin(-1.5*temp), 0, 
											    0,  Math.sin(-1.5*temp),  Math.cos(-1.5*temp), 0,
											    0,               0,               0, 1);  											
  leftlegtorsoMatrix = new THREE.Matrix4().multiplyMatrices(leftlegtorsoMatrix, sinMatrix);
  leftleg.setMatrix(new THREE.Matrix4().multiplyMatrices(leftlegtorsoMatrix, leftlegrotateMatrix));
  rightlegtorsoMatrix = new THREE.Matrix4().multiplyMatrices(rightlegtorsoMatrix, sinMatrix);
  rightleg.setMatrix(new THREE.Matrix4().multiplyMatrices(rightlegtorsoMatrix, rightlegrotateMatrix));
  
  // gem movement
  gem.setMatrix(new THREE.Matrix4().set(
      1,0,0,gemPosition.value.x ,
      0,1,0,gemPosition.value.y ,
      0,0,1,gemPosition.value.z ,
      0,0,0,1
  ));
  
  //------------------------------------leftBeam-------------------------------------
  v.setFromMatrixPosition(lefteyeheadtorsoMatrix);
  var v0 = new THREE.Vector3(gemPosition.value.x, gemPosition.value.y, gemPosition.value.z);
  v0.sub(v);
  var x = v0.x;
  var y = v0.y;
  var z = v0.z;
  var r = Math.sqrt(Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2))
  var yRotate;
  if(x >= 0)
	yRotate = Math.asin(z / Math.sqrt(Math.pow(x,2) + Math.pow(z,2)));
  else
    yRotate = -Math.asin(z / Math.sqrt(Math.pow(x,2) + Math.pow(z,2))) + Math.PI;
  var zRotete = -Math.acos(y / r);

  var rotateMatrix1 = new THREE.Matrix4().set(Math.cos(yRotate), 0, -Math.sin(yRotate), 0, 
										      0,                 1,                  0, 0,
										      Math.sin(yRotate), 0,  Math.cos(yRotate), 0,
										      0,                 0, 			     0, 1);
											  
  var tempMatrix3   = new THREE.Matrix4().multiplyMatrices(lefteyeheadtorsoMatrix, rotateMatrix1);

  var rotateMatrix2 = new THREE.Matrix4().set(Math.cos(zRotete), -Math.sin(zRotete), 0, 0, 
											  Math.sin(zRotete),  Math.cos(zRotete), 0, 0, 
											  0,                                  0, 1, 0,
											  0,                                  0, 0, 1);  
											  
  var tempMatrix4   = new THREE.Matrix4().multiplyMatrices(tempMatrix3, rotateMatrix2);
  console.info('heheh2');
  
  var f = r/5;
  var mmm = new THREE.Matrix4().set(
      1,0,0,0 ,
      0,f,0,0 ,
      0,0,1,0 ,
      0,0,0,1
  )

  var tempMatrix5   = new THREE.Matrix4().multiplyMatrices(tempMatrix4, mmm);
  var mm = new THREE.Matrix4().set(
      1,0,0,0,
      0,1,0,1.5,
      0,0,1,0,
      0,0,0,1
  )  
  var tempMatrix6   = new THREE.Matrix4().multiplyMatrices(tempMatrix5, mm);
  leftBeam.setMatrix(tempMatrix6);
  
  
  
  //-------------------------------rightBeam----------------------------------------

  v.setFromMatrixPosition(righteyeheadtorsoMatrix);
  v0 = new THREE.Vector3(gemPosition.value.x, gemPosition.value.y, gemPosition.value.z);
  v0.sub(v);
  x = v0.x;
  y = v0.y;
  z = v0.z;
  console.info(x);
  console.info(y);
  console.info(z);
  r = Math.sqrt(Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2))
  yRotate;
  if(x >= 0)
	yRotate = Math.asin(z / Math.sqrt(Math.pow(x,2) + Math.pow(z,2)));
  else
    yRotate = -Math.asin(z / Math.sqrt(Math.pow(x,2) + Math.pow(z,2))) + Math.PI;
  
  zRotete = -Math.acos(y / r);

  rotateMatrix1 = new THREE.Matrix4().set(Math.cos(yRotate), 0, -Math.sin(yRotate), 0, 
										  0,                 1,                  0, 0,
										  Math.sin(yRotate), 0,  Math.cos(yRotate), 0,
										  0,                 0, 			     0, 1);
											  
  tempMatrix3   = new THREE.Matrix4().multiplyMatrices(righteyeheadtorsoMatrix, rotateMatrix1);

  rotateMatrix2 = new THREE.Matrix4().set(Math.cos(zRotete), -Math.sin(zRotete), 0, 0, 
										  Math.sin(zRotete),  Math.cos(zRotete), 0, 0, 
										  0,                                  0, 1, 0,
										  0,                                  0, 0, 1);  
											  
  tempMatrix4   = new THREE.Matrix4().multiplyMatrices(tempMatrix3, rotateMatrix2);

  mmm = new THREE.Matrix4().set(
      1,0,0,0 ,
      0,f,0,0 ,
      0,0,1,0 ,
      0,0,0,1
  )

  tempMatrix5   = new THREE.Matrix4().multiplyMatrices(tempMatrix4, mmm);
  mm = new THREE.Matrix4().set(
      1,0,0,0,
      0,1,0,1.5,
      0,0,1,0,
      0,0,0,1
  )  
  tempMatrix6   = new THREE.Matrix4().multiplyMatrices(tempMatrix5, mm);
  rightBeam.setMatrix(tempMatrix6);

}

// LISTEN TO KEYBOARD
var keyboard = new THREEx.KeyboardState();
function checkKeyboard() {
  if (keyboard.pressed("W"))
    gemPosition.value.z -= 0.1;
  else if (keyboard.pressed("S"))
    gemPosition.value.z += 0.1;

  if (keyboard.pressed("A"))
    gemPosition.value.x -= 0.1;
  else if (keyboard.pressed("D"))
    gemPosition.value.x += 0.1;

  if (keyboard.pressed("R"))
    gemRadius.value += 0.1;
  else if (keyboard.pressed("F"))
    gemRadius.value -= 0.1;

  gemMaterial.needsUpdate = true; // Tells three.js that some uniforms might have changed
}

// SETUP UPDATE CALL-BACK
function update() {
  checkKeyboard();
  updateBody();

  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

update();