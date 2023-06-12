var config = {
  width: innerWidth,
  height: innerHeight,
  backgroundColor: 0x000000,
  scene: [scene1, scene2],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 15000 },
      debug: false
    }
  }
}

var game = new Phaser.Game(config);