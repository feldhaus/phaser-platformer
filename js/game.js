var game;

// main game options
var gameOptions = {
    gameWidth: 288,
    gameHeight: 192
}

// when the window finishes loading...
window.onload = function () {
    game = new Phaser.Game(gameOptions.gameWidth, gameOptions.gameHeight);
    game.state.add('TheGame', TheGame);
    game.state.start('TheGame');
};

var TheGame = function () {};

TheGame.prototype = {

    // preloading assets
    preload: function () {
        game.load.image('player', 'assets/images/player.png');
        // environment
        game.load.image('background', 'assets/images/background.png');
        game.load.image('middleground', 'assets/images/middleground.png');
        // tileset
        game.load.image('tileset', 'assets/images/tileset.png');
        game.load.tilemap('map', 'assets/maps/map.json', null, Phaser.Tilemap.TILED_JSON);
    },

    // when the game starts
    create: function () {
        // set game scale
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        
        //tileset
        
        this.createBackgrounds();
        this.createWorld();
        this.createPlayer();
        this.bindKeys();
        
        game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
    },
    
    createBackgrounds: function () {
        this.background = game.add.tileSprite(0, 0, gameOptions.gameWidth, gameOptions.gameHeight, 'background');
        this.middleground = game.add.tileSprite(0, 80, gameOptions.gameWidth, gameOptions.gameHeight, 'middleground');
        this.background.fixedToCamera = true;
        this.middleground.fixedToCamera = true;
    },
    
    createWorld: function () {
        // tilemap
        this.map = game.add.tilemap('map');
        this.map.addTilesetImage('tileset');
        this.layer = this.map.createLayer('Tile Layer 1');
        this.layer.resizeWorld();
        //this.layer.debug = true;
        
        this.map.setCollision([
            269,273,309,310,311,314,347,348,351,387,388,389,
            425,427,429
        ]);
        
        this.ledges = [];
        //this.ledges.push(this.map.getTile(10,11));
        //this.ledges[0].debug = true;
        //return;
        
        var x, y, tile;
        for (x = 0; x < this.map.width; x++) {
            for (y = 0; y < this.map.height; y++) {
                tile = this.map.getTile(x, y);
                if (tile) {
                    var b = tile.faceTop && (tile.faceRight || tile.faceLeft)
                    if (b) {
                        tile.debug = b;
                        this.ledges.push(tile);
                    }
                    
                    //tile.setCollision(true, false, true, false);
                }
            }
        }
        
        /*
        var grab = game.add.graphics(0, 0);
        grab.beginFill(0xff00ff);
        grab.drawRect(0, 0, 16, 16);
        grab.endFill();
        grab.position.set(16*10, 16*11);
        */
    },
    
    createPlayer: function () {
        this.player = game.add.sprite(0, 0, 'player');
        this.player.anchor.setTo(0.5);
        this.player.position.set(26, 50);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 500;
        this.player.body.setSize(20,30,0,0);
        
        /*
        this.player = game.add.graphics(0, 0);
        this.player.beginFill(0xff3300);
        this.player.drawRect(-8, -8, 16, 16);
        this.player.endFill();
        this.player.position.set(16+8, 16+8);
        //this.player.anchor.setTo(0.5);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 500;
        this.player.body.setSize(16, 16, -8, -8);
        */
    },
    
    bindKeys: function () {
        this.input = {
            jump: game.input.keyboard.addKey(Phaser.Keyboard.UP),
            left: game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
            right: game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
            crouch: game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
        }
        game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.SPACEBAR,
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.DOWN
        ]);
    },
    
    update: function () {
        game.physics.arcade.collide(this.player, this.layer);
        this.movePlayer();
        this.parallaxBackground();
    },
    
    render: function () {
        game.debug.body(this.player);
    },
    
    movePlayer: function () {
        if (this.input.jump.isDown && this.player.body.onFloor()) {
            this.player.body.velocity.y = -200;
        }
        
        if (this.input.jump.isDown && !this.player.body.enable) {
            this.player.body.enable = true;
            this.player.body.velocity.y = -200;
        }
        
        var vel = 150;
        if (this.input.left.isDown) {
            this.player.body.velocity.x = -vel;
            //this.player.animations.play('run');
            this.player.scale.x = -1;
        } else if (this.input.right.isDown) {
            this.player.body.velocity.x = vel;
            //this.player.animations.play('run');
            this.player.scale.x = 1;
        } else if (this.input.crouch.isDown) {
            this.player.body.enable = true;
        } else {
            this.player.body.velocity.x = 0;
            if (this.input.crouch.isDown) {
            //    this.player.animations.play('crouch');
            } else {
            //    this.player.animations.play('idle');
            }
        }
        
        //game.debug.text('speed: '+this.player.body.velocity.y, 10, 10);
        game.debug.text('px: ' + this.player.x, 10, 10);
        if (this.player.body.velocity.y < 0) {
            return;
        }
        
        var px = this.player.x - 10;
        var py = this.player.y - 8;
        var ledge = undefined;
        for (var i = 0; i < this.ledges.length; i++) {
            ledge = this.ledges[i];
            if (px < ledge.worldX-16 || px > ledge.worldX+16) { continue; }
            if (py < ledge.worldY-8 || py > ledge.worldY) { continue; }
            
            var ledgeOnLeft = ledge.worldX < this.player.x;
            var ledgeOnRight = !ledgeOnLeft;
            
            game.debug.text('grab: '+ledgeOnRight, 10, 40);
            
            if (this.input.right.isDown && ledgeOnRight) {
                this.player.body.enable = false;
                this.player.body.velocity.y = 0;
            } else if (this.input.left.isDown && ledgeOnLeft) {
                this.player.body.enable = false;
                this.player.body.velocity.y = 0;
            }
        }
        
        /*
        var t = false;
        var px = this.player.x - 8;
        var py = this.player.y - 8;
        if (px >= 9*16 && px < 11*16) {
            if (py > 10*16 && py < 11*16) {
                t = true
            }
        }
        game.debug.text(py + " > " + (11*16), 10, 10);
        
        if (t) {
            var ledgeOnLeft = 10 * 16 < this.player.x;
            var ledgeOnRight = !ledgeOnLeft;

            if (this.input.right.isDown) {
                game.debug.text('grab:'+ledgeOnRight,10,40)
                this.player.body.enable = false;
                this.player.body.velocity.y = 0;
            }
        }
        */
    },
    
    grabLedge: function () {
        
    },
    
    parallaxBackground: function () {
        this.background.tilePosition.x = this.layer.x * -0.1;
        this.middleground.tilePosition.x = this.layer.x * -0.5;
    }
}