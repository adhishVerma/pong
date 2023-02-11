const canvas = document.getElementById("canvas");

// to draw something we need context
const ctx = canvas.getContext("2d");

// canvas width and height
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// keeping track of key press
const keysPressed = {};

window.addEventListener("keydown", function (e) {
  keysPressed[e.key] = true;
});

window.addEventListener("keyup", function (e) {
  keysPressed[e.key] = false;
  console.log(keysPressed);
});

// function to give the 2D vector back
function vec2(x, y) {
  return { x: x, y: y };
}

class Ball {
  constructor(pos, velocity, radius) {
    this.pos = pos;
    this.velocity = velocity;
    this.radius = radius;

    this.update = function () {
      this.pos.x += this.velocity.x;
      this.pos.y += this.velocity.y;
    };

    this.draw = function () {
      // drawing the ball
      ctx.fillStyle = "#FF00FF";
      ctx.strokeStyle = "#33FF00";
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      // ctx.stroke();
    };

    // function to play sound
    this.collisionSound = function () {
      let audio = new Audio("./asset/sound/mixkit-arcade-mechanical-bling-210.mp3")
      audio.play()
    }

    // function to play sound when ball moves to background
    this.ballLeft = function () {
      let audio = new Audio("./asset/sound/mixkit-ominous-drums-227.wav")
      audio.play()
    }
  }
}

class Paddle {
  constructor(pos, velocity, width, height) {
    this.pos = pos;
    this.velocity = velocity;
    this.width = width;
    this.height = height;
    this.score = 0;

    this.update = function () {
      if (keysPressed["ArrowUp"] == true) {
        this.pos.y -= this.velocity.y;
      }
      if (keysPressed["ArrowDown"] == true) {
        this.pos.y += this.velocity.y;
      }
    };

    this.draw = function () {
      // drawing the paddle
      ctx.fillStyle = "#33FF00";
      ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    };

    this.getHalfWidth = function () {
      return this.width / 2;
    };

    this.getHalfHeight = function () {
      return this.height / 2;
    };

    this.getCenter = function () {
      return vec2(
        this.pos.x + this.getHalfWidth(),
        this.pos.y + this.getHalfHeight()
      );
    };
  }
}

function ballCollisionCheck(ball) {
  if (ball.pos.y + ball.radius >= canvas.height || ball.pos.y <= ball.radius) {
    ball.velocity.y *= -1;
  }

  // if (ball.pos.x + ball.radius >= canvas.width || ball.pos.x <= ball.radius) {
  //   ball.velocity.x *= -1;
  // }
}

// function to check paddle collision with the edges
function paddleCollisionWithEdges(paddle) {
  if (paddle.pos.y <= 0) {
    paddle.pos.y = 0;
  }

  if (paddle.pos.y >= canvas.height - paddle.height) {
    paddle.pos.y = canvas.height - paddle.height;
  }
}

// function to check ball and paddle collision
function ballPaddleCollision(ball, paddle) {
  // direction don't matter and we need always positive
  let dx = Math.abs(ball.pos.x - paddle.getCenter().x);
  let dy = Math.abs(ball.pos.y - paddle.getCenter().y);

  if (
    dx <= ball.radius + paddle.getHalfWidth() + 1 &&
    dy <= paddle.getHalfHeight() - ball.radius &&
    paddle.width <= ball.pos.x && 
    ball.pos.x <= canvas.width - paddle.width
  ) {
    ball.velocity.x *= -1;
    ball.collisionSound()
  }
}

// player2 logic to play
function player2AI(ball, paddle) {
  if (ball.velocity.x > 0) {
    if (ball.pos.y > paddle.pos.y) {
      setTimeout(() => {
        paddle.pos.y += paddle.velocity.y;
      }, Math.random() * 90 + 175);
    }
    if (ball.pos.y < paddle.pos.y) {
      setTimeout(() => {
        paddle.pos.y -= paddle.velocity.y;
      }, Math.random() * 90 + 175);
    }
  }
}

// function to respawn the ball
function respawnBall(ball) {
  if (ball.velocity.x > 0) {
    ball.pos.x = canvas.width - 150;
    ball.pos.y = Math.random() * (canvas.height - 200) + 100;
  }

  if (ball.velocity.x < 0) {
    ball.pos.x = 150;
    ball.pos.y = Math.random() * (canvas.height - 200) + 100;
  }

  ball.velocity.x *= -1;
  ball.velocity.y *= -1;
}

// function to update the score
function updateScore(ball, paddle1, paddle2) {
  if (ball.pos.x <= -ball.radius - 150) {
    paddle2.score += 1;
    document.getElementById("player2score").innerHTML = paddle2.score;
    ball.ballLeft()
    respawnBall(ball);
  }
  if (ball.pos.x >= canvas.width + ball.radius + 150) {
    paddle1.score += 1;
    document.getElementById("player1score").innerHTML = paddle1.score;
    respawnBall(ball);
  }
}

// creating a new ball object
const ball = new Ball(
  vec2(200, 200),
  vec2(6 + Math.random() * 5, 5 + Math.random() * 5),
  20
);

// creating the paddles to play the game
const paddle1 = new Paddle(
  vec2(0, Math.floor(canvas.height / 2) - 80),
  vec2(11, 11),
  20,
  160
);
const paddle2 = new Paddle(
  vec2(canvas.width - 20, Math.floor(canvas.height / 2) - 80),
  vec2(11, 11),
  20,
  160
);

function gameUpdate() {
  // moving the ball on x and y axis
  paddle1.update();
  ball.update();
  player2AI(ball, paddle2);
  paddleCollisionWithEdges(paddle1);
  paddleCollisionWithEdges(paddle2);
  ballPaddleCollision(ball, paddle1);
  ballPaddleCollision(ball, paddle2);
  ballCollisionCheck(ball);
  updateScore(ball, paddle1, paddle2);
}

function gameDraw() {
  // drawing the ball
  paddle1.draw();
  paddle2.draw();
  ball.draw();
}

function gameLoop() {
  // clearing the canvas before drawing the next position
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // keeping the loop running by executing it 60 times per second
  window.requestAnimationFrame(gameLoop);

  gameUpdate();
  gameDraw();
}

gameLoop();
