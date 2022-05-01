var EasyPhysics = {
  Objects: [],
  _THREE_: [],
  GRAVITY: 10,
  scene: undefined,
  raycaster: new THREE.Raycaster(),
  version: "1.0",
};
EasyPhysics.eulerQuaternion = function (rot) {
  var c1 = Math.cos(rot[1]*(Math.PI / 180)/2);
  var s1 = Math.sin(rot[1]*(Math.PI / 180)/2);
  var c2 = Math.cos(rot[2]*(Math.PI / 180)/2);
  var s2 = Math.sin(rot[2]*(Math.PI / 180)/2);
  var c3 = Math.cos(rot[0]*(Math.PI / 180)/2);
  var s3 = Math.sin(rot[0]*(Math.PI / 180)/2);
  var c1c2 = c1*c2;
  var s1s2 = s1*s2;
  var w =c1c2*c3 - s1s2*s3;
  var x =c1c2*s3 + s1s2*c3;
  var y =s1*c2*c3 + c1*s2*s3;
  var z =c1*s2*c3 - s1*c2*s3;
  return([x, y, z, w]);
};
EasyPhysics.Vector3 = class {
  constructor(x,y,z){
    this.isVector3 = true;
    this.x = x;
    this.y = y;
    this.z = z;
    if(!x){
      this.x = 0;
    };
    if(!y){
      this.y = 0;
    };
    if(!z){
      this.z = 0;
    };
  };
};
EasyPhysics.Object = class {
  constructor(scale, position, isFrozen, rotation, mass, friction, force){
    //SCENE CHECK
    if(!EasyPhysics.scene){
      return;
    };
    //VARIABLES
    this.scale = scale;
    this.position = position;
    this.rotation = rotation;
    this.isFrozen = isFrozen;
    this.force = force;
    this.mass = mass;
    this.friction = friction;
    this.collidePosX = false;
    this.collideNegX = false;
    this.collidePosY = false;
    this.collideNegY = false;
    this.collidePosZ = false;
    this.collideNegZ = false;
    this.distanceNegX = 0;
    this.distancePosX = 0;
    this.distanceNegY = 0;
    this.distancePosY = 0;
    this.distanceNegZ = 0;
    this.distancePosZ = 0;
    //CHECKS
    if(!mass){
      this.mass = 1;
    };
    if(!friction){
      this.friction = 1;
    };
    if(!isFrozen){
      this.isFrozen = false;
    };
    if(!scale || !scale.isVector3){
      this.scale = new EasyPhysics.Vector3(1,1,1);
    };
    if(!position || !position.isVector3){
      this.position = new EasyPhysics.Vector3(0,0,0);
    };
    if(!rotation || !rotation.isVector3){
      this.rotation = new EasyPhysics.Vector3(0,0,0);
    };
    if(!force || !force.isVector3){
      this.force = new EasyPhysics.Vector3(0,-0.0001,0);
    };
    //FUNCTIONS
    this.delete = function () {
      EasyPhysics.Objects.splice(EasyPhysics.Objects.indexOf(this), 1);
      EasyPhysics._THREE_.splice(EasyPhysics._THREE_.indexOf(this._THREE_), 1);
      EasyPhysics.scene.remove(this._THREE_);
    };
    //OTHER STUFF
    this._THREE_ = new THREE.Mesh(new THREE.BoxGeometry(this.scale.x,this.scale.y, this.scale.x),new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff}));
    this._THREE_.object = this;
    EasyPhysics.scene.add(this._THREE_);
    this._THREE2_ = new THREE.Mesh(new THREE.BoxGeometry(this.scale.x,this.scale.y, this.scale.x),new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff, side: THREE.BackSide}));
    this._THREE2_.visible = false;
    EasyPhysics.scene.add(this._THREE2_);
    EasyPhysics.Objects.push(this);
    EasyPhysics._THREE_.push(this._THREE_);
  };
};
EasyPhysics.updatePhysics = function (){
  //SCENE CHECK
  if(!EasyPhysics.scene){
    console.warn("no scene defined!");
    return;
  };
  EasyPhysics.Objects.forEach(function (object, index){
    var tmp = EasyPhysics.eulerQuaternion([object.rotation.x,object.rotation.y,object.rotation.z]);
    object._THREE_.position.set(object.position.x,object.position.y,object.position.z);
    object._THREE_.quaternion.set(tmp[0], tmp[1], tmp[2], tmp[3]);
    object._THREE_.scale.set(object.scale.x,object.scale.y,object.scale.z);
    object._THREE2_.position.set(object.position.x,object.position.y,object.position.z);
    object._THREE2_.quaternion.set(tmp[0], tmp[1], tmp[2], tmp[3]);
    object._THREE2_.scale.set(object.scale.x,object.scale.y,object.scale.z);
    if(!object.isFrozen){
      //VARIABLE RESET
      object.collidePosX = false;
      object.collideNegX = false;
      object.collidePosY = false;
      object.collideNegY = false;
      object.collidePosZ = false;
      object.collideNegZ = false;
      object.distanceNegX = object.scale.x/2;
      object.distancePosX = object.scale.x/2;
      object.distanceNegY = object.scale.y/2;
      object.distancePosY = object.scale.y/2;
      object.distanceNegZ = object.scale.z/2;
      object.distancePosZ = object.scale.z/2;
      //RAYCASTING
      if(!object.rotation.x != 0){
        EasyPhysics.raycaster.set(object._THREE2_.position, new THREE.Vector3(-1,0,0));
        var result = EasyPhysics.raycaster.intersectObject(object._THREE2_, false);
        if(result[0]){
          object.distanceNegX = result[0].distance;
        };
        EasyPhysics.raycaster.set(object._THREE2_.position, new THREE.Vector3(1,0,0));
        var result = EasyPhysics.raycaster.intersectObject(object._THREE2_, false);
        if(result[0]){
          object.distancePosX = result[0].distance;
        };
      };
      if(!object.rotation.y != 0){
        EasyPhysics.raycaster.set(object._THREE2_.position, new THREE.Vector3(0,-1,0));
        var result = EasyPhysics.raycaster.intersectObject(object._THREE2_, false);
        if(result[0]){
          object.distanceNegY = result[0].distance;
        };
        EasyPhysics.raycaster.set(object._THREE2_.position, new THREE.Vector3(0,1,0));
        var result = EasyPhysics.raycaster.intersectObject(object._THREE2_, false);
        if(result[0]){
          object.distancePosY = result[0].distance;
        };
      };
      if(!object.rotation.z != 0){
        EasyPhysics.raycaster.set(object._THREE2_.position, new THREE.Vector3(0,0,-1));
        var result = EasyPhysics.raycaster.intersectObject(object._THREE2_, false);
        if(result[0]){
          object.distanceNegZ = result[0].distance;
        };
        EasyPhysics.raycaster.set(object._THREE2_.position, new THREE.Vector3(0,0,1));
        var result = EasyPhysics.raycaster.intersectObject(object._THREE2_, false);
        if(result[0]){
          object.distancePosZ = result[0].distance;
        };
      };
      EasyPhysics.raycaster.set(object._THREE_.position, new THREE.Vector3(-1,0,0));
      var result = EasyPhysics.raycaster.intersectObjects(EasyPhysics._THREE_, false);
      if(result[0] && result[0].distance <= object.distanceNegX){
        object.collideNegX = result[0].object.object;
      };
      if(result[0]) {
        if(object.force.x < 0){
          if(Math.abs(object.force.x) > result[0].distance){
            console.log("illegal movement");
            object.force.x = result[0].distance/2;
          };
        };
      };
      EasyPhysics.raycaster.set(object._THREE_.position, new THREE.Vector3(1,0,0));
      var result = EasyPhysics.raycaster.intersectObjects(EasyPhysics._THREE_, false);
      if(result[0] && result[0].distance <= object.distancePosX){
        object.collidePosX = result[0].object.object;
      };
      if(result[0]) {
        if(object.force.x > 0){
          if(Math.abs(object.force.x) > result[0].distance){
            console.log("illegal movement");
            object.force.x = -result[0].distance/2;
          };
        };
      };
      EasyPhysics.raycaster.set(object._THREE_.position, new THREE.Vector3(0,-1,0));
      var result = EasyPhysics.raycaster.intersectObjects(EasyPhysics._THREE_, false);
      if(result[0] && result[0].distance <= object.distanceNegY){
        object.collideNegY = result[0].object.object;
      };
      if(result[0]) {
        if(object.force.y < 0){
          if(Math.abs(object.force.y) > result[0].distance){
            console.log("illegal movement");
            object.force.y = result[0].distance/2;
          };
        };
      };
      EasyPhysics.raycaster.set(object._THREE_.position, new THREE.Vector3(0,1,0));
      var result = EasyPhysics.raycaster.intersectObjects(EasyPhysics._THREE_, false);
      if(result[0] && result[0].distance <= object.distancePosY){
        object.collidePosY = result[0].object.object;
      };
      if(result[0]) {
        if(object.force.y > 0){
          if(Math.abs(object.force.y) > result[0].distance){
            console.log("illegal movement");
            object.force.y = result[0].distance/2;
          };
        };
      };
      EasyPhysics.raycaster.set(object._THREE_.position, new THREE.Vector3(0,0,-1));
      var result = EasyPhysics.raycaster.intersectObjects(EasyPhysics._THREE_, false);
      if(result[0] && result[0].distance <= object.distanceNegZ){
        object.collideNegZ = result[0].object.object;
      };
      if(result[0]) {
        if(object.force.z < 0){
          if(Math.abs(object.force.z) > result[0].distance){
            console.log("illegal movement");
            object.force.z = result[0].distance/2;
          };
        };
      };
      EasyPhysics.raycaster.set(object._THREE_.position, new THREE.Vector3(0,0,1));
      var result = EasyPhysics.raycaster.intersectObjects(EasyPhysics._THREE_, false);
      if(result[0] && result[0].distance <= object.distancePosZ){
        object.collidePosZ = result[0].object.object;
      };
      if(result[0]) {
        if(object.force.z > 0){
          if(Math.abs(object.force.z) > result[0].distance){
            console.log("illegal movement");
            object.force.z = result[0].distance/2;
          };
        };
      };
      //FORCES AND COLLISION
      if(!object.collideNegY){
        object.force.y-=EasyPhysics.GRAVITY/5000;
        if(object.force.y < 0){
          object.position.y += object.force.y;
        };
      };
      if(!object.collidePosY){
        if(object.force.y > 0){
          object.position.y += object.force.y;
        };
      };
      if(!object.collideNegX){
        if(object.force.x < 0){
          object.position.x += object.force.x;
        };
      } else {
        if(object.collideNegX.force.x < object.force.x){
          object.collideNegX.force.x -= object.force.x;
        };
        if(object.collideNegX.force.x > object.force.x){
          object.collideNegX.force.x += object.force.x;
        };
      };
      if(!object.collidePosX){
        if(object.force.x > 0){
          object.position.x += object.force.x;
        };
      } else {
        if(object.collidePosX.force.x < object.force.x){
          object.collidePosX.force.x += object.force.x;
        };
        if(object.collidePosX.force.x > object.force.x){
          object.collidePosX.force.x -= object.force.x;
        };
      };
      if(!object.collideNegZ){
        if(object.force.z < 0){
          object.position.z += object.force.z;
        };
      } else {
        if(object.collideNegZ.force.z < object.force.z){
          object.collideNegZ.force.z -= object.force.z;
        };
        if(object.collideNegZ.force.z > object.force.z){
          object.collideNegZ.force.z += object.force.z;
        };
      };
      if(!object.collidePosZ){
        if(object.force.z > 0){
          object.position.z += object.force.z;
        };
      } else {
        if(object.collidePosZ.force.z < object.force.z){
          object.collidePosZ.force.z += object.force.z;
        };
        if(object.collidePosZ.force.z > object.force.z){
          object.collidePosZ.force.z -= object.force.z;
        };
      };
      //FRICTION AND MASS
      if(object.collideNegY){
        if(object.force.x > 0){
          object.force.x -= object.collideNegY.friction*object.mass/10;
          if(object.force.x < 0){
            object.force.x = 0;
          };
        };
        if(object.force.x < 0){
          object.force.x += object.collideNegY.friction*object.mass/10;
          if(object.force.x > 0){
            object.force.x = 0;
          };
        };
        if(object.force.z > 0){
          object.force.z -= object.collideNegY.friction*object.mass/10;
          if(object.force.z < 0){
            object.force.z = 0;
          };
        };
        if(object.force.z < 0){
          object.force.z += object.collideNegY.friction*object.mass/10;
          if(object.force.z > 0){
            object.force.z = 0;
          };
        };
      };
    };
  });
};