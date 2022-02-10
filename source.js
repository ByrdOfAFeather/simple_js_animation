let ARROW_ID = 0;

class Arrow {
    state = {x: 200, y: 200, rotate: 0};

    constructor(initX, initY, initRotate, initID) {
        this.state.x = initX;
        this.state.y = initY;
        this.state.rotate = initRotate;
        this.state.specialRotate = 0;
        this.id = initID;
        // this.checkForIntersections = (x, y) => false;
    }

    drawHead(context, state) {
        context.beginPath();
        context.save();
        context.translate(50, 50);
        context.beginPath();
        context.lineTo(0, 0);
        context.save();
        context.rotate(Math.PI / 4);
        context.lineTo(0, 10);
        context.save()
        context.translate(0, 10);
        context.save();
        context.rotate(-4 * Math.PI / 6);
        context.lineTo(0, 0);
        context.lineTo(0, 20);
        context.save();
        context.rotate(-Math.PI / 3);
        context.lineTo(0, 20);
        context.save();
        context.rotate(-6 * Math.PI / 6);
        context.lineTo(0, .91);
        context.restore();
        context.restore();
        context.restore();
        context.restore();
        context.restore();
        context.restore();
        context.fill();
        context.stroke();
    }

    drawFeathers(context, state) {
        // TODO: Come back later and do this if time allows
        context.save();
        context.rotate();
    }

    drawBoundingBox(context, state, x, y) {
        let SIDE_LENGTH = 20;
        context.save();
        context.translate(this.state.x, this.state.y);
        context.save();
        context.rotate(this.state.rotate);
        context.beginPath();
        context.save();
        context.globalAlpha = .5;
        context.strokeStyle = "green";
        context.rotate(Math.PI/4);
        context.rect(0, -SIDE_LENGTH / 2, 90, SIDE_LENGTH)
        context.stroke();
        let out = context.isPointInPath(x, y);
        context.restore();
        context.restore();
        context.restore();
        return out;
    }


    draw(context, stateUpdate) {
        // this.state.rotate = stateUpdate.rotate(this.state.rotate);
        // // Additional Math.Pi since the base arrow is at a 45 degree angle
        // this.state.x = stateUpdate.x(this.state.x, this.state.rotate + Math.PI / 4);
        // this.state.y = stateUpdate.y(this.state.y, this.state.rotate + Math.PI / 4);
        stateUpdate(this, this.state);
        context.beginPath();
        context.save();
        context.translate(this.state.x, this.state.y);
        context.save();
        context.rotate(this.state.rotate);
        context.lineTo(0, 0);
        context.lineTo(50, 50);
        context.stroke();

        // Draw Arrow Head
        this.drawHead(context, this.state);
        context.restore();
        context.restore();
        context.restore();

        this.drawBoundingBox(context, this.state);

    }
}

class Ball {
    state = {};
    constructor(x, y, rotate) {
        this.state.x = x;
        this.state.y = y;
        this.state.heading = rotate;
        this.state.rotate = 0;
        this.state.arrowChildren = [];
        this.state.usedArrows = {};
    }

    draw(context, stateUpdate) {
        stateUpdate(this.state);
        context.beginPath();
        context.save();
        context.translate(this.state.x, this.state.y);
        context.arc(0, 0, 20, 0, 2 * Math.PI, false);
        context.fill();
        context.stroke();
        context.restore();
        context.restore();
        console.log(this.state.arrowChildren);

        // context.save();
        // context.translate(this.state.x, this.state.y);
        // context.save();
        // context.rotate(this.state.rotate);
        this.state.arrowChildren.forEach((arrow) => {
            this.state.arrowUpdate(arrow, arrow.state);
            arrow.state.specialRotate = this.state.rotate;
            arrow.draw(context, ()=>{})
        });
        // context.restore();
        // context.restore();
    }
}


window.onload = function () {
    let canvas = document.getElementById("gameScreen");
    let context = canvas.getContext("2d");
    let centerArrow = new Arrow(canvas.width / 2, canvas.height /  2, 0);
    let ballCharacter = new Ball(100, 100, 0);
    let centerArrowUpdate;
    let movingArrowUpdate;
    let ballUpdate;
    let arrows = [];

    requestAnimationFrame(mainLoop);

    function mainLoop() {
        processInput();
        update();
        draw();
        requestAnimationFrame(mainLoop);
    }

    function processInput() {
    }

    function update() {
        // arrowUpdate = (state) => { state.x += 5; state.y+=5;}
        centerArrowUpdate = (arrow, state) => {
            state.rotate += .01;
        };

        movingArrowUpdate = (arrow, state) => {
            let newY = state.y +  Math.sin(state.rotate + Math.PI / 4 );
            let newX = state.x +  Math.cos(state.rotate + Math.PI / 4);
            let angleOffset = Math.random()*(Math.PI / 2);

            if (newX >= canvas.width) {
                newX = canvas.width;
                state.rotate += Math.PI + angleOffset;
            }
            if (newX <= 0) {
                newX = 0;
                state.rotate += Math.PI + angleOffset;
            }
            if (newY >= canvas.height) {
                newY = canvas.height;
                state.rotate += Math.PI + angleOffset;
            }
            if (newY <= 0) {
                newY = 0;
                state.rotate += Math.PI + angleOffset;
            }
            state.x = newX;
            state.y = newY;

            if (arrow.drawBoundingBox(context, (arrow, state) => {}, ballCharacter.state.x, ballCharacter.state.y)) {
                if (ballCharacter.state.usedArrows[arrow.id] != true) {
                    ballCharacter.state.arrowChildren.push(new Arrow(newX, newY, state.rotate, null));
                    ballCharacter.state.usedArrows[arrow.id] = true;
                    arrows = arrows.filter((arrows) => arrows.id != arrow.id);
                    ballCharacter.state.heading = ballCharacter.state.arrowChildren[ballCharacter.state.arrowChildren.length - 1].state.rotate;
                    console.log(ballCharacter.state.arrowChildren);
                }
            }
        }

        ballUpdate = (state) => {
            let MASTER_ROTATE = state.heading;
            let newY = state.y +  Math.sin(state.heading + Math.PI / 4 );
            let newX = state.x +  Math.cos(state.heading + Math.PI / 4);
            state.y = newY;
            state.x = newX;
            state.rotate += .05;

            if (newX >= canvas.width) {
                newX = canvas.width;
                state.heading += Math.PI;
            }
            if (newX <= 0) {
                newX = 0;
                state.heading += Math.PI;
            }
            if (newY >= canvas.height) {
                newY = canvas.height;
                state.heading += Math.PI;
            }
            if (newY <= 0) {
                newY = 0;
                state.heading += Math.PI ;
            }

            state.arrowUpdate = (arrow, state) => {
                let newY = state.y +  Math.sin(MASTER_ROTATE + Math.PI / 4 );
                let newX = state.x +  Math.cos(MASTER_ROTATE + Math.PI / 4);
                state.y = newY;
                state.x = newX;
            }
        }
    }

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        centerArrow.draw(context, centerArrowUpdate);
        arrows.forEach((arrow) => arrow.draw(context, movingArrowUpdate));
        ballCharacter.draw(context, ballUpdate);
    }

    setInterval(() => {
        arrows.push(new Arrow(centerArrow.state.x, centerArrow.state.y, centerArrow.state.rotate, ARROW_ID));
        ARROW_ID += 1;
    }, 500);
}