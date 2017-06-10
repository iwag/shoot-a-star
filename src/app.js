var ChipmunkScene = cc.Scene.extend({
  space: null,
  // init space of chipmunk
  initPhysics: function() {
    this.space = new cp.Space();
    // Gravity
    this.space.gravity = cp.v(0, -5);
    // set up Walls
    var wallBottom = new cp.SegmentShape(this.space.staticBody, cp.v(0, 600), // start point
        cp.v(4294967295, 800), // MAX INT:4294967295
        0); // thickness of wall
    this.sprites = [];
  },
  onEnter: function() {
    this._super();
    this.initPhysics();
    //add three layer in the right order
    this.addChild(cc.LayerGradient.create(cc.color(255, 255, 255, 255), cc.color(98 * 0.5, 99 * 0.5, 117, 255)));

    this.scheduleUpdate();

    var winSize = cc.director.getWinSize();

    var num = 5;
    this.scheduleUpdate();
    for (var i = 0; i < num; i++) {
      this.addSprite(cp.v(winSize.width / 2 + (i - 2) * 80, winSize.height / 2));
    }

    this.schedule(function() {
      var x = Math.random() * winSize.width;
      var y = Math.random() * winSize.height;
      this.addSprite(cp.v(x, y));
    }.bind(this), 0.3, 1000, 0);

    this.score = 0;
    this.scoreLabel = new cc.LabelTTF("-", "Arial", 38);
    this.scoreLabel.setColor(cc.color(0,0,0,255));
    // position the label on the center of the screen
    this.scoreLabel.x = winSize.width / 2;
    this.scoreLabel.y = winSize.height - 40;
    this.addChild(this.scoreLabel, 5);

    this.remain = 60;
    this.remainLabel = new cc.LabelTTF(this.remain, "Arial", 38);
    this.remainLabel.setColor(cc.color(0,0,0,255));
    // position the label on the center of the screen
    this.remainLabel.x = 30;
    this.remainLabel.y = winSize.height - 40;
    this.addChild(this.remainLabel, 5);

    this.secondLabel = new cc.LabelTTF("sec", "Arial", 38);
    this.secondLabel.setColor(cc.color(0,0,0,255));
    // position the label on the center of the screen
    this.secondLabel.x = 100;
    this.secondLabel.y = winSize.height - 40;
    this.addChild(this.secondLabel, 5);

    this.schedule(function() {
      this.remain -= 1;
      this.remainLabel.setString(this.remain);
    }.bind(this), 1, 1000, 0);


    cc.eventManager.addListener({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchEnded: this.onTouchEnded.bind(this)
    }, this);

    cc.eventManager.addListener({
      event: cc.EventListener.MOUSE,
      onMouseDown: this.onMouseDown.bind(this)
    }, this);
  },

  addSprite: function(pos) {
    var sprite = this.createPhysicsSprite(pos);
    this.sprites.unshift(sprite);
    var sprites = [];
    for (var i = 0; i < this.sprites.length; i++) {
      if (this.sprites[i] && i < 25) {
        sprites.push(this.sprites[i]);
      } else {
        this.sprites[i] && this.sprites[i].removeFromParent();
     }
    }
    this.sprites = sprites;

    this.addChild(sprite);
  },

  createPhysicsSprite: function(pos) {
    var size = cc.size(8, 4);
    var body = new cp.Body(1, cp.momentForBox(1, size.width, size.height));
    body.setPos(pos);
    this.space.addBody(body);
    var shape = new cp.BoxShape(body, size.width, size.height);

    shape.setElasticity(0.0);
    shape.setFriction(0.0);
    shape.setCollisionType(0);

    var sprite;
    if ((Math.random() * 10) <= 3) {
      sprite = cc.PhysicsSprite.create("res/truck.png");
      sprite.setScale(0.5, 0.5);
    } else if ((Math.random() * 10) <= 6) {
      sprite = cc.PhysicsSprite.create("res/truck2.png");
      sprite.setScale(0.1, 0.1);
    } else {
      sprite = cc.PhysicsSprite.create("res/bus.png");
      sprite.setScale(0.2, 0.2);
    }

    this.space.addShape(shape);

    //sprite.setContentSize(cc.size(135, 431));

    sprite.runAction(cc.Sequence.create(cc.FadeOut.create(3), new cc.callFunc(this.removeSprite(sprite), this)));

    sprite.setBody(body);
    return sprite;
  },
  removeSprite: function(sp) {
    return function() {
      sp.setVisible(false);
      sp.removeFromParent();
    };
  },
  onMouseDown: function(event) {
    var loc = event.getLocation();
    var locBox = {
      x: loc.x,
      y: loc.y,
      width: 30,
      height: 30
    };
    for (var i = 0; i < this.sprites.length; i++) {
      var sp = this.sprites[i];
      if (!sp)
        continue;
      if (cc.rectIntersectsRect(locBox, sp.getBoundingBox())) {
        this.scoreLabel.setString(this.score += 10);
        this.sprites[i] = null;
        sp.removeFromParent();
        break;
      }
    }
  },

  onTouchEnded: function(touches, event) {
    var l = touches.length;
    for (var j = 0; j < l; j++) {

      var loc = touches[j].getLocation();
      var locBox = {
        x: loc.x,
        y: loc.y,
        width: 30,
        height: 30
      };
      for (var i = 0; i < this.sprites.length; i++) {
        var sp = this.sprites[i];
        if (!sp)
          continue;
        if (cc.rectIntersectsRect(locBox, sp.getBoundingBox())) {
          this.scoreLabel.setString(this.score += 10);
          this.sprites[i] = null;
          sp.removeFromParent();
          break;
        }
      }
    }
  },

  update: function(dt) {
    // chipmunk step
    this.space.step(dt);
  }
});
