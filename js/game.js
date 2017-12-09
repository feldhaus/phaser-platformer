var game;

// main game options
const gameOptions = {
    gameWidth: 300,
    gameHeight: 216
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
        // environment
        game.load.image('background', 'assets/images/plx-1.png');
        game.load.image('middleground1', 'assets/images/plx-2.png');
        game.load.image('middleground2', 'assets/images/plx-3.png');
        game.load.image('middleground3', 'assets/images/plx-4.png');
        game.load.image('middleground4', 'assets/images/plx-5.png');
        
        // tileset
        game.load.image('tileset', 'assets/images/tileset.png');
        game.load.tilemap('map', 'assets/maps/map.json', null, Phaser.Tilemap.TILED_JSON);
        
        // player
        game.load.spritesheet('player', 'assets/images/player.png', 23, 42);
    },

    // when the game starts
    create: function () {
        // set game scale
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        
        this.createBackgrounds();
        this.createWorld();
        this.createPlayer();
        this.bindKeys();
        
        game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
    },
    
    createBackgrounds: function () {
        this.background = game.add.tileSprite(0, 0, gameOptions.gameWidth, gameOptions.gameHeight, 'background');
        this.background.fixedToCamera = true;
        this.middleground1 = game.add.tileSprite(0, 0, gameOptions.gameWidth, gameOptions.gameHeight, 'middleground1');
        this.middleground1.fixedToCamera = true;
        this.middleground2 = game.add.tileSprite(0, 0, gameOptions.gameWidth, gameOptions.gameHeight, 'middleground2');
        this.middleground2.fixedToCamera = true;
        this.middleground3 = game.add.tileSprite(0, 0, gameOptions.gameWidth, gameOptions.gameHeight, 'middleground3');
        this.middleground3.fixedToCamera = true;
        this.middleground4 = game.add.tileSprite(0, 0, gameOptions.gameWidth, gameOptions.gameHeight, 'middleground4');
        this.middleground4.fixedToCamera = true;
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
    },
    
    createPlayer: function () {
        this.player = game.add.sprite(0, 0, 'player');
        this.player.animations.add('idle', [0,1,2,3,4,5,6,7,8,9,10,11]);
        this.player.animations.add('jump', [12]);
        this.player.animations.add('landing', [13]);
        this.player.animations.add('ledge_grab', [14,15,16,17,18,19]);
        this.player.animations.add('fall', [20,21]);
        this.player.animations.add('run', [22,23,24,25,26,27,28,29]);
        this.player.animations.play('idle', 12, true);
        
        this.player.anchor.set(0.5, 1);
        this.player.position.set(26, 50);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 500;
        this.player.body.setSize(12, 28, 6, 6);
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
        // jump
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
            this.player.animations.play('run', 12);
            this.player.scale.x = -1;
        } else if (this.input.right.isDown) {
            this.player.body.velocity.x = vel;
            this.player.animations.play('run', 12);
            this.player.scale.x = 1;
        } else if (this.input.crouch.isDown) {
            this.player.body.enable = true;
        } else {
            this.player.body.velocity.x = 0;
            if (this.input.crouch.isDown) {
            //    this.player.animations.play('crouch');
            } else {
                this.player.animations.play('idle', 12);
            }
        }
        
        // jump animation
        if (this.player.body.velocity.y < 0) {
            this.player.animations.play('jump');
        } else if (this.player.body.velocity.y > 0) {
            this.player.animations.play('fall');
        }
        
        /*
        //game.debug.text('speed: '+this.player.body.velocity.y, 10, 10);
        game.debug.text('px: ' + this.player.x.toFixed(1), 10, 10);
        game.debug.text('py: ' + this.player.y.toFixed(1), 10, 25);
        
        var px = this.player.x;
        var py = this.player.y - this.player.height;
        var ledge = undefined;
        for (var i = 0; i < this.ledges.length; i++) {
            if (i != 2) { this.ledges[i].alpha = 0.3; continue; }
            
            ledge = this.ledges[i];
            game.debug.text('posY: ' + ledge.worldY, 10, 40);
            if (px < ledge.worldX-1 || px > ledge.worldX+16) { continue; }
            if (py < ledge.worldY-8 || py > ledge.worldY-7) { continue; }
            
            var ledgeOnLeft = ledge.worldX < this.player.x;
            var ledgeOnRight = !ledgeOnLeft;
            
            game.debug.text('grab: ' + ledgeOnRight, 10, 55);
            // this.grabLedge();
            
            if (this.input.right.isDown && ledgeOnRight) {
                this.player.body.enable = false;
                this.player.body.velocity.y = 0;
                this.grabLedge();
            } else if (this.input.left.isDown && ledgeOnLeft) {
                this.player.body.enable = false;
                this.player.body.velocity.y = 0;
            }
        }
        */
    },
    
    grabLedge: function () {
        // this.player.animations.play('ledge_grab', 12);
    },
    
    parallaxBackground: function () {
        this.middleground1.tilePosition.x = this.layer.x * -0.1;
        this.middleground2.tilePosition.x = this.layer.x * -0.2;
        this.middleground3.tilePosition.x = this.layer.x * -0.3;
        this.middleground4.tilePosition.x = this.layer.x * -0.4;
    }
}