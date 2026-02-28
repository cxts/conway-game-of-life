/**
* @description : CONWAY's game of life implementation
*
* @author cxts
* @github https://github.com/cxts
* @date 28/07/2020
* @required Draw.js, misc.js, Vector.js
* @param none
* @return none
*
**/

// give the side length of a cell
// number of pixel needed to draw a square cell = RES * RES
// canvas's width and height have to be both multiples of RES
// If nothing appears when index.html is loaded, check first this param.
// Try some different int value
const RES = 2; // 2, 3, 6  // TUNNING

// grid setting
let grid = new Array((width * height) / (RES * RES));

//-- NOTES ----------------------------
// index = x + (y * width)
// x = index - (y * width)
// y = index - (x / width)
//-------------------------------------


// percentage of alive cells
let limit = 10;  // TUNNING

// Random alive population
for(let i = 0; i < grid.length; i++) {
    let x = i % (width / RES);
    let y = (i - x) / (width / RES);
    grid[i] = new Cell(x, y, getRandom(100) < limit ? true : false);
}

/**
* @description : class Cell
*
* @param {NUMBER} x : position of the cell on x axis
* @param {NUMBER} y : position of the cell on y axis
* @param {BOOLEAN} alive [optional] : default set to false, make the cell alive or not
* @return {OBJECT} : a cell object is returned
*
**/
function Cell(x, y, alive) {
    this.alive = alive || false;
    // for the algorithm purpose, each cell store its futur state before updating it
    this.nextState = null;
    this.x = x;
    this.y = y;
    this.color = "#000";

    // draw the cell if alive
    Cell.prototype.show = function() {
        if(this.alive)
            ctx.fillRect(this.x * RES, this.y * RES, RES, RES);
    }


    /**
    * @description : verification of the neighbors of the targeted cell.
    *                The cell that triger up the check is at the center of 3x3 square
    *                The function checks for alive cells in all the 8 positions around
    * Example :      0 1 1
    *                1 C 0
    *                0 0 1
    *
    * @param {ARRAY} grid : array grid that contains the living and dead cells (set at the beginning of the script)
    * @return {NUMBER} aliveNeighbors : return the number of cell's alive neighbors
    *
    **/
    Cell.prototype.checkNeighbors = function(grid) {
        // set the counter of alive neighbors
        let aliveNeighbors = 0;
        // get the value of x position 1 before the cell pos
        let x = (this.x > 0) ? this.x - 1 : 0;
        // avoid cell to check for alive neighbors off the array on x axis
        let xLimit = (this.x < (width / RES) - 1) ? this.x + 1 : ((width / RES) - 1);
        for(; x <= xLimit; x++) {
            // get the value of y position 1 before the cell pos
            let y = (this.y > 0) ? this.y - 1 : 0;
            // avoid cell to check for alive neighbors off the array on y axis
            let yLimit = (this.y < (height / RES) - 1) ? this.y + 1 : ((height / RES) - 1);
            for(; y <= yLimit; y++) {
                let index = x + (y * (width / RES));
                if((index >= 0) && (index < grid.length)) {
                    if(grid[index] !== this) {
                        aliveNeighbors += grid[index].alive;
                    }
                }
            }
        }
        return aliveNeighbors;
    }

    // update the alive status
    Cell.prototype.updateAlive = function() {
        this.alive = (this.nextState != null) ? this.nextState : this.alive;
    }

    // set the nextState value of the cell
    Cell.prototype.update = function(grid) {
        let nb = this.checkNeighbors(grid);
        if(nb < 2) {
            this.nextState = false;
        }
        else if((nb == 2 || nb == 3) && this.alive) {
            this.nextState = true;
        }
        else if(nb == 3 && !this.alive) {
            this.nextState = true;
        }
        else if(nb > 3) {
            this.nextState = false;
        }
        else {
            this.nextState = this.alive;
        }
    }
}


///////////////////////////////////
// STILL LIFES TEMPLATE

//CROSS
// grid[19].alive = true;
// grid[18].alive = true;
// grid[20].alive = true;
// grid[19].alive = true;

//BOAT
function haveCross(grid) {
    let l = Math.sqrt(grid.length);
    let first = (l / 2) - 1 + l;
    grid[first].alive = true;
    grid[first + l - 1].alive = true;
    grid[first + l + 1].alive = true;
    grid[first+ (2 * l)].alive = true;
}

// grid[12].alive = true;
// grid[11].alive = true;

///////////////////////////////////
// OSCILLATORS TEMPLATE

// BLINKER
function haveBlinker() {
    let a = Math.floor(Math.sqrt(grid.length));
    grid[0 + a].alive = true;
    grid[2 + a].alive = true;
    grid[1 + a].alive = true;
}

// grid[3].alive = true;
// grid[4].alive = true;
// grid[5].alive = true;

// grid[0].alive = true;
// grid[1].alive = true;
// grid[4].alive = true;
// grid[5].alive = true;
// grid[10].alive = true;
// grid[11].alive = true;
// grid[14].alive = true;
// grid[15].alive = true;
///////////////////////////////////

// DRAW SETUP
// number of alive cells
var living;
// frame counter
var count = 0;

// the higher the slower
const SPEED = 5;  // TUNNING

/**
* @description : called by window.requestAniamtionFrame(), draw the entire animation on canvas
* @param NONE
* @return {VOID}
*
**/
function draw() {
    // alive cells counter
    living = 0;
    // control of the speed of the animation
    if(count == SPEED) {
        clear();
        // check which cells in grid are alive & have to be drawn on the next call
        for(let c of grid)
            c.updateAlive();

        // draw the alive cells
        for(let i = 0; i < grid.length; i++) {
            // draw the actualy alive cell
            grid[i].show();
            // update the alive state of each cell and store it in Cell.nextState (avoiding cell's state
            // changing before other cells check if it's alive or not)
            grid[i].update(grid);
            // update number of living cells in the grid
            living += (grid[i].alive) ? 1 : 0;

        }
        // stop the animation if all cells are dead & draw a grid
        // that tells us the script is simply stopped and not crashed
        if(living != 0 && !__paused)
            window.requestAnimationFrame(draw);
        else {
            clear();
            drawGrid(grid, RES);
        }
        // canvas have been drawned, reset to 0 the frame counter
        count = 0
    } else { // if the frame counter != SPEED
        // increment the frame counter
        count++;
        // draw the animation with the current alive cells
        drawCells(grid);
        if(!__paused) {
            window.requestAnimationFrame(draw);
        }
    }
}
window.requestAnimationFrame(draw);


/**
* @description : draw a grid on canvas
*
* @param {ARRAY} grid : array grid that contains the living and dead cells (set at the beginning of the script)
* @param {NUMBER} factor : const RES (set at the beginning of the script)
* @return {VOID}
*
**/
function drawGrid(grid, factor) {
    for(let i = 0, j = 0; i < grid.length; i++, j += factor) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(i + width, j);
        ctx.stroke();
    }
    for(let i = 0, j = 0; j < grid.length; i += factor, j++) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, j + height);
        ctx.stroke();
    }
}


/**
* @description : draw the cells contained in array grid
*
* @param {ARRAY} grid : array grid that contains the living and dead cells (set at the beginning of the script)
* @return {VOID}
*
**/
function drawCells(grid) {
    for(let c of grid)
        c.show();
}


/**
* @description : draw a square on canvas
*
* @param {NUMBER} x : value of square start position on x axis
* @param {NUMBER} y : value of square start position on y axis
* @param {NUMBER} factor : const RES (set at the beginning of the script)
* @return {VOID}
*
**/
function drawSquare(x, y, factor) {
    ctx.fillRect(x * factor, y * factor, factor, factor);
}
