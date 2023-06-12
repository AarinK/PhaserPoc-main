class scene2 extends Phaser.Scene {
  constructor() {
    super("playGame");
    this.blockCounter = 0;

  }

  preload() {
    this.load.image("background", "assets/Picture1.jpg")
    this.load.atlas('knight', 'assets/knight.png', 'assets/knight.json');
    this.load.image("block", "assets/box.png")
    this.load.image("platform", "assets/platform.png")
    this.load.image("platform2", "assets/platform2.png")
    this.load.image("retry", "assets/reload.png")
    this.load.audio("backgroundMusic", "assets/backgroundMusic.mp3");
    this.load.audio("tryAgainSound", "assets/tryagain.mp3");
    this.load.audio("correct", "assets/correct.mp3");
    this.load.audio("win", "assets/win.mp3");
    this.load.audio("gameover", "assets/gameover.mp3");
    this.load.audio("fall", "assets/fall.mp3");
  }

  create() {
    var counter = 0;
    this.blockCounter = 0;

    var tryAgainText = this.add.text(9000, 400, 'Try Again!', { fontFamily: 'Arial', fontSize: '64px', color: '#ff0000' });
    tryAgainText.setOrigin(0.5);
    tryAgainText.setDepth(10);

    tryAgainText.visible = false;
    this.background = this.add.image(0, 0, "background");
    this.background.setOrigin(0, 0);
    this.background.setScale(this.sys.game.config.width / this.background.width, this.sys.game.config.height / this.background.height);

    const x = this.add.text(975, 80, 'x', { fontFamily: 'Arial', fontSize: '35px', color: '#000000' }).setOrigin(0.5, 0);

    const music = this.sound.add("backgroundMusic");

    music.play({
      loop: true
    });

    const idleConfig = {
      key: 'idle',
      frames: this.anims.generateFrameNames('knight', { prefix: 'idle/frame', start: 0, end: 5, zeroPad: 4 }),
      frameRate: 14,
      repeat: -1
    };

    const idleConfig1 = {
      key: 'idle1',
      frames: this.anims.generateFrameNames('knight', { prefix: 'idle/frame', start: 0, end: 5, zeroPad: 4 }),
      frameRate: 14,
      repeat: -1
    };

    this.anims.create(idleConfig);

    const runConfig = {
      key: 'run',
      frames: this.anims.generateFrameNames('knight', { prefix: 'run/frame', start: 0, end: 7, zeroPad: 4 }),
      frameRate: 10,
      repeat: -1
    };

    this.anims.create(runConfig);

    const lancelot = this.physics.add.sprite(515, 350, 'knight');
    lancelot.setScale(3);
    lancelot.play('idle');

    const resetButton = this.add.image(50, 70, 'retry');
    resetButton.setScale(0.1)
    resetButton.setInteractive();
    resetButton.setDepth(0);

    resetButton.on('pointerdown', () => {

      music.stop();


      this.scene.start("playGame");


      resetButton.disableInteractive();
    });

    this.input.keyboard.on('keydown-ENTER', function () {
      lancelot.play('run');
      lancelot.on(Phaser.Animations.Events.ANIMATION_UPDATE, function (animation, frame, gameObject) {
        gameObject.x += 25;
      });
    });

    this.platforms = this.physics.add.staticGroup();
    const p1 = this.platforms.create(490, 482, "platform").setDepth(-10);
    const p2 = this.platforms.create(1580, 482, "platform").setDepth(-10);

    const blockArray = [];

    for (let i = 0; i < 10; i++) {
      const block = this.physics.add.image(0, 0, 'block');
      block.setScale(0.15);
      block.x = i * 0 + 920;
      block.y = 100;

      block.setInteractive();
      this.input.setDraggable(block);
      block.body.setImmovable(true);
      block.body.setAllowGravity(false);

      this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
      });

      blockArray.push(block);
    }

    function getBlockIndexByPointer(blockArray, pointer) {
      for (let i = 0; i < blockArray.length; i++) {
        const block = blockArray[i];
        const blockBounds = block.getBounds();

        if (Phaser.Geom.Rectangle.ContainsPoint(blockBounds, pointer)) {
          const selectedBlock = i;
          const dragX = block.x;
          const dragY = block.y;

          return {
            selectedBlock,
            dragX,
            dragY
          };
        }
      }

      return {
        selectedBlock: null,
        dragX: null,
        dragY: null
      };
    }

    this.input.on('pointerup', function (pointer) {
      const { selectedBlock, dragX, dragY } = getBlockIndexByPointer(blockArray, pointer);
    });

    function calculateDistance(x1, y1, x2, y2) {
      const deltaX = x2 - x1;
      const deltaY = y2 - y1;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      return distance;
    }

    function getDistanceToSolution(selectedBlock, dragX, dragY, solution) {
      const solutionCoords = solution[selectedBlock];
      const targetX = solutionCoords[0];
      const targetY = solutionCoords[1];

      const distance = calculateDistance(dragX, dragY, targetX, targetY);
      return distance;
    }

    const solution = [
      [1272, 490],
      [1202, 510],
      [1132, 510],
      [1062, 510],
      [992, 510],
      [922, 510],
      [852, 510],
      [782, 510],
      [712, 510],
      [642, 510]
    ];


    this.input.on('pointerup', function (pointer) {
      const { selectedBlock, dragX, dragY } = getBlockIndexByPointer(blockArray, pointer);

      if (selectedBlock !== null) {
        const distance = getDistanceToSolution(selectedBlock, dragX, dragY, solution);
        console.log("Distance to solution:", distance);
      }
    });

    this.platforms1 = this.physics.add.staticGroup();

    const createObjectInPlatform1 = (counter, targetX, targetY) => {
      const block = this.platforms.create(targetX, targetY - 27, "platform2").setDepth(-10);
      block.setScale(2);
    };

    const blockCounterText = this.add.text(1010, 78, `${10 - this.blockCounter}`, { fontFamily: 'Arial', fontSize: '40px', color: '#000000', fontWeight: 'bold' }).setOrigin(0.5, 0).setDepth(this.blockCounter);

    const moveBlockToSolution = (selectedBlock, blockArray, solution) => {
      const block = blockArray[selectedBlock];
      const targetX = solution[selectedBlock][0];
      const targetY = solution[selectedBlock][1];

      const distance = calculateDistance(block.x, block.y, targetX, targetY);


      if (distance < 60) {
        block.x = targetX;
        block.y = targetY;
        block.input.draggable = false;
        const correct = this.sound.add("correct");
        correct.play();



        console.log(counter);
        createObjectInPlatform1(counter, targetX, targetY);

        counter = counter + 1;
        this.blockCounter++;
        if (this.blockCounter >= 10) {
          blockCounterText.setVisible(false);
          x.setVisible(false);
        }
        blockCounterText.setText(10 - this.blockCounter);

      } else {
        block.x = 920;
        block.y = 100;
        tryAgainText.visible = true;
        const tryAgainSound = this.sound.add("tryAgainSound");
        tryAgainSound.play();

      }
    };

    this.input.on('pointerup', function (pointer) {
      const { selectedBlock, dragX, dragY } = getBlockIndexByPointer(blockArray, pointer);

      if (selectedBlock !== null) {
        const distance = getDistanceToSolution(selectedBlock, dragX, dragY, solution);
        console.log("Distance to solution:", distance);

        moveBlockToSolution(selectedBlock, blockArray, solution);
      }
    });

    this.physics.add.collider(lancelot, this.platforms);
    this.anims.create(idleConfig1);

    // if (lancelot.y == 900) {
    //   const win = this.sound.add("win");
    //   win.play();
    // }

    if (lancelot.x >= 1400) {
      const win = this.sound.add("win");
      win.play();
    }

    this.update = function () {
      if (lancelot.x >= 1500) {

        lancelot.anims.stop();
        lancelot.play('idle1');

        //     win.play();}
      }
      // if (lancelot.x == 1500) {
      //   const win = this.sound.add("win");
      //   win.play();
      // }
      // this.update = function () {
      //   if (lancelot.x == 1500) {
      //     const win = this.sound.add("win");
      //     win.play();
      //   }



      //this.update = function () {
      resetButton.setInteractive();
      // }
    }
  }
}