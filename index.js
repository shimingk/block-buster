// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  doc,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { html, render } from "lit-html";

const firebaseConfig = {
  apiKey: "AIzaSyBONiC9wxzJpjjZWaK5NKLBUtLxCqq0MII",
  authDomain: "block-buster-db.firebaseapp.com",
  projectId: "block-buster-db",
  storageBucket: "block-buster-db.appspot.com",
  messagingSenderId: "543350152958",
  appId: "1:543350152958:web:1c94323a5101398e180faf"
};

const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

let scores = [];
const scoreRef = collection(db, "leaderboard");

async function sendName(username) {
  console.log("username is: " + username);
  // CHECK: username if BLANK -> ANONYMOUS
  if (username === "") {
    username = "anonymous";
  }
  console.log("Sending " + username + "'s score!");
  // Add some data to the messages collection
  try {
    const docRef = await addDoc(collection(db, "leaderboard"), {
      time: Date.now(),
      score: currScore,
      user: username
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

async function getAllScores() {
  scores = [];

  const querySnapshot = await getDocs(
    query(scoreRef, orderBy("score", "desc"))
  );
  querySnapshot.forEach((doc) => {
    let scoreData = doc.data();
    scores.push(scoreData);
  });

  console.log(scores);

  render(view(), document.body);
}

// getAllScores();

function handleInput(e) {
  if (e.key == "Enter") {
    sendName(e.target.value);
    e.target.value = "";
    let inputForm = document.getElementById("input-container");
    inputForm.remove();
    render(view(), document.body);
  }
}

function inputScore() {
  return html `<div id="input-container">
      <h2>Hit [Enter] after entering your name</h2>
      <input type="text" @keydown=${handleInput} placeholder="NAME"/>
    </div>`;
}

function view() {
  return html`<h1>Leaderboard</h1>
    <h2>Score : Player</h2>
    <div id="score-container">
      ${scores.map((msg) => html`<div class="score">${msg.score} : ${msg.user}</div>`)}
    </div>`;
}

onSnapshot(
  collection(db, "leaderboard"),
  (snapshot) => {
    console.log("snap", snapshot);
    getAllScores();
  },
  (error) => {
    console.error(error);
  }
);

// render(view(), document.body);

// GameDev Implementation
let userPaddle;
let evilPaddle;
let ball;
let x;
// Window dimensions.
let windowWidth = 1000;
let windowHeight = 500;

// Rows and columns.
const rows = 3;
const cols = 5;

// Booleans for alive or not
let alive = true;

// Dimensions for bricks
const blockWidth =  Math.round(windowWidth / cols - 5);
const blockHeight = Math.round((windowHeight * 1/5 ) / rows - 5);

// store block sprite group and current game score
let blocks;
let currScore = 0;

// Set up the canvas.
window.setup = () => {
  // new Canvas();
  createCanvas(windowWidth, windowHeight);
  world.gravity = -25;
  // create user paddle sprite
  userPaddle = createSprite(width / 2, height, 250, 50);
  userPaddle.shapeColor = color('turquoise');
  // create evil paddle sprite
  evilPaddle = createSprite(width / 2, height / 2, 150, 50);
  evilPaddle.shapeColor = color('red');
  // create ball sprite
  ball = new Sprite();
  ball.diameter = 25;
  ball.shapeColor = color('yellow');
  // create block sprites
  blocks = new Group();
  generateBlocks();

}

// Generate blocks.
window.generateBlocks = () => {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let block = createSprite(
        j * (blockWidth + 2) + 100,
        i * (blockHeight + 2),
        blockWidth,
        blockHeight
      );
      blocks.add(block);
    }
  }
}

window.checkBall = () => {
  if (ball.velocity.x === 0 && ball.velocity.y === 0) {
    ball.velocity.x = 5;
    ball.velocity.y = 5;
  }
  // ball collision with top of the screen
  if (ball.y - ball.diameter / 2 <= 0) {
    ball.velocity.y = -ball.velocity.y;
  }
  // ball collision with the bottom
  if (ball.y + ball.diameter / 2 >= windowHeight) {
    alive = false;
    ball.visible = false;
    console.log("end");
  }
  // ball collision with left and right sides of the screen
  if (ball.x - ball.diameter / 2 <= 0  || ball.x + ball.diameter / 2 >= windowWidth) {
    ball.velocity.x = -ball.velocity.x;
  }

  // ball collision with blocks
  blocks.forEach((block, index) => {
    if (ball.collides(block)) {
      ball.velocity.y = 5 ;
      ball.velocity.x = -ball.velocity.x;
      block.remove(index, 1);
      currScore++;
      if(blocks.length === 0) alive = false;
    }
    // if (ball.y - ball.diameter / 2 <= block.y + block.h && ball.x > block.x && ball.x <= block.x + block.w) {
    //   ball.velocity.y = -ball.velocity.y;
    //   block.remove(index, 1);
    //   currScore++;
    //   if(blocks.length === 0) alive = false;
    // }
  });

  // ball collision with user paddle
  if (ball.collides(userPaddle)) {
    ball.velocity.x = -ball.velocity.x;
    ball.velocity.y = -5;
  }
  // ball collision with evil paddle
  if (ball.collides(evilPaddle)) {
    if (ball.velocity.y > 0) {
      ball.velocity.y = 5;
    } else {
      ball.velocity.y = -5;
    }
    ball.velocity.x = -ball.velocity.x;
  }
}

// Display score at the top of the screen.
window.displayScore = () => {
  fill("beige");
  textAlign(CENTER);
  textSize(25)
  text(`Score: ${currScore}`, windowWidth / 2, 150);
}

// Display message (either "GAME OVER" or "You Win!")
window.endScreen = (message) => {
  if (message === "You Win!") {
    fill('springgreen');
    message += "  🤩";
  } else {
    fill('magenta');
  }
  textAlign(CENTER);
  textSize(35);
  text(message, windowWidth / 2, windowHeight / 2);
  text('Play again: [Space]', windowWidth / 2, windowHeight / 2 + 55);
  text(`Score: ${currScore}`, windowWidth / 2, windowHeight / 2 - 55);
  text('Save Score: [Tab]', windowWidth / 2, windowHeight / 2 + 110);
}

// restart game
window.keyPressed = () => {

  // restart game
  if(keyCode === 32 && !alive) {
    alive = true;
    userPaddle.visible = true;
    evilPaddle.visible = true;
    ball.visible = true;
    ball.x = width / 2;
    ball.y = height / 2;
    blocks.removeAll(); // clean block group
    currScore = 0;
    generateBlocks();
  }

  if (keyCode === 9) {
    if ((!alive && blocks.length != 0) || blocks.length === 0) {
      render(inputScore(), document.body);
    }
  }
}

// Animate and draw everything to the screen.
window.draw = () => {
  background("black");
  ball.visible = true;
  // controls user paddle's movement
  userPaddle.velocity.x = (mouseX - userPaddle.position.x) * 0.25;
  userPaddle.velocity.y = 0;
  // If the player broke all the blocks, they win.
  if (blocks.length === 0) {
    ball.visible = false;
    evilPaddle.visible = false;
    evilPaddle.velocity.x = 0;
    blocks.visible = false;
    endScreen("You Win!");
  }
  // If the player died and there are still bricks to break, they lost.
  if (!alive && blocks.length != 0) {
    ball.visible = false;
    evilPaddle.visible = false;
    evilPaddle.velocity.x = 0;
    blocks.visible = false;
    userPaddle.visible = false;
    endScreen("GAME OVER 😜");
  }
  // If the player is still alive, draw everything to the screen.
  if(alive) {
    evilPaddle.visible = true;
    ball.visible = true;
    blocks.visible = true;
    displayScore();
    checkBall();

    evilPaddle.collider = 'kinematic';
    if (evilPaddle.velocity.x === 0) {
      evilPaddle.velocity.x = 5;
    } else {
      if (evilPaddle.x === 0) {
        evilPaddle.velocity.x = -evilPaddle.velocity.x;
      }
      if (evilPaddle.x === windowWidth) {
        evilPaddle.velocity.x = -evilPaddle.velocity.x;
      }
    }
    blocks.collider = 'kinematic';
    userPaddle.collider = 'kinematic';
    drawSprites();
  }
}
