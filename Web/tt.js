        const canvas = document.getElementById('tetris_canvas');
        const context = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');

        context.scale(20, 20);

        let score = 0;
        let isPaused = true;
        pauseCheck();

        function pauseCheck(){
            if (isPaused = true){
                context.fillStyle = '#e4e4e4';
                context.font = '1px Courier Mono';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText("The Game is Paused,",6,8);
                context.fillText("Press 'p' to Resume",6,9.5);
                return;
            }
        }
        function updateScore() {
            scoreElement.innerText = `Score: ${score}`;
        }

        function createMatrix(width, height) {
            const matrix = [];
            while (height--) {
                matrix.push(new Array(width).fill(0));
            }
            return matrix;
        }

        function createPiece(type) {
            if (type === 'T') {
                return [
                    [0, '@', 0],
                    ['@', '@', '@'],
                    [0, 0, 0],
                ];
            } else if (type === 'O') {
                return [
                    ['O', 'O'],
                    ['O', 'O'],
                ];
            } else if (type === 'L') {
                return [
                    [0, 0, '#'],
                    ['#', '#', '#'],
                    [0, 0, 0],
                ];
            } else if (type === 'J') {
                return [
                    ['#', 0, 0],
                    ['#', '#', '#'],
                    [0, 0, 0],
                ];
            } else if (type === 'I') {
                return [
                    [0, 0, 0, 0],
                    ['+', '+', '+', '+'],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ];
            } else if (type === 'S') {
                return [
                    [0, '%', '%'],
                    ['%', '%', 0],
                    [0, 0, 0],
                ];
            } else if (type === 'Z') {
                return [
                    ['%', '%', 0],
                    [0, '%', '%'],
                    [0, 0, 0],
                ];
            }
        }

        function drawMatrix(matrix, offset, isGhost = false) {
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        if (isGhost) {
                            context.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        } else {
                            context.fillStyle = '#001';
                        }
                        context.fillRect(x + offset.x, y + offset.y, 1, 1);                       
        
                        if (!isGhost) {
                            context.fillStyle = '#fff';
                            context.font = '1px Courier Mono';
                            context.textAlign = 'center';
                            context.textBaseline = 'middle';
                            context.fillText(value, x + offset.x + 0.5, y + offset.y + 0.5);
                        }
                    }
                });
            });
        }
        
        
        function drawGhost() {

            const ghost = {
                pos: { ...player.pos }, 
                matrix: player.matrix, 
            };
        
            while (!collide(arena, ghost)) {
                ghost.pos.y++;
            }
            ghost.pos.y--;
        
            drawMatrix(ghost.matrix, ghost.pos, true);
        }
        
        


        function draw() {
            context.fillStyle = '#000';
            context.fillRect(0, 0, canvas.width, canvas.height);
            drawMatrix(arena, { x: 0, y: 0 });
            drawGhost(); 
            drawMatrix(player.matrix, player.pos);

        }

        function merge(arena, player) {
            player.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        arena[y + player.pos.y][x + player.pos.x] = value;
                    }
                });
            });
        }

        function playerDrop() {
            player.pos.y++;
            if (collide(arena, player)) {
                player.pos.y--;
                merge(arena, player);
                playerReset();
                arenaSweep();
            }
            dropCounter = 0;
        }

        function playerHardDrop() 
        {
            while (true){
                player.pos.y += 1;
                    if (collide(arena, player)) {
                    score += 5
                    updateScore();
                    player.pos.y--;
                    merge(arena, player);
                    playerReset();
                    arenaSweep();
                    break;
                    }
            dropCounter = 0;
        }
        }


        function playerMove(dir) {
            player.pos.x += dir;
            if (collide(arena, player)) {
                player.pos.x -= dir;
            }
        }

        function playerReset() {
            const pieces = 'ILJOTSZ';
            player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
            player.pos.y = 0;
            player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

            if (collide(arena, player)) {
                arena.forEach(row => row.fill(0));
                alert("Game Over! Your Score Was: " + score);
                score = 0;
                updateScore();
                draw()
                isPaused = true;
            }
        }

        function arenaSweep() {
            let rowCount = 0;
            outer: for (let y = arena.length - 1; y > 0; --y) {
                for (let x = 0; x < arena[y].length; ++x) {
                    if (arena[y][x] === 0) {
                        continue outer;
                    }
                }
            
                const row = arena.splice(y, 1)[0].fill(0);
                arena.unshift(row);
                ++rowCount;
                ++y;
            }
        
            if (rowCount > 0) {
                const points = [0, 40, 100, 300, 1200];
                score += points[rowCount];
                updateScore();
            }
        }

        function collide(arena, player) {
            const [m, o] = [player.matrix, player.pos];
            for (let y = 0; y < m.length; ++y) {
                for (let x = 0; x < m[y].length; ++x) {
                    if (m[y][x] !== 0 &&
                        (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                        return true;
                    }
                }
            }
            return false;
        }

        let dropCounter = 0;
        let dropInterval = 1000;

        let lastTime = 0;
        function update(time = 0) {
            if (isPaused) {
                pauseCheck();        
                return;
            }

            switch (true){
                case (score < 500):
                    break;
                case (score > 500 && score < 1500):
                    dropInterval = 850;
                    break;
                case (score > 1500 && score < 2500):
                    dropInterval = 700;
                    break;
                case (score > 2500 && score < 3500):
                    dropInterval = 550;
                    break;
                case (score > 3500 && score < 4500):
                    dropInterval = 400;
                    break;
                case (score > 4500 && score < 5500):
                    dropInterval = 250;
                    break;
                case (score > 5500):
                    dropInterval = 100;
                    break;
            }              
            const deltaTime = time - lastTime;
            lastTime = time;

            dropCounter += deltaTime;
            if (dropCounter > dropInterval) {
                playerDrop();
            }

            draw();
            requestAnimationFrame(update);
        }

        const arena = createMatrix(12, 20);

        const player = {
            pos: { x: 0, y: 0 },
            matrix: null,
        };

        document.addEventListener('keydown', event => {
            if (["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
                event.preventDefault();
            };
            window.addEventListener("keydown", function(event) {
                if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
                    event.preventDefault();
                }
            }, false);

            switch (event.key){
                case 'ArrowUp':
                    isPaused = false;
                    playerHardDrop();
                    update();
                    break;
                case 'ArrowLeft':
                    isPaused = false;
                    playerMove(-1);
                    update();
                    break;
                case 'ArrowRight':
                    isPaused = false;
                    playerMove(1);
                    update();
                    break;
                case 'ArrowDown':
                    isPaused = false;
                    playerDrop();
                    update();
                    break;
                case 'w':
                    isPaused = false;
                    playerHardDrop();
                    update();
                    break;
                case 'a':
                    isPaused = false;
                    playerMove(-1);
                    update();
                    break;
                case 'd':
                    isPaused = false;
                    playerMove(1);
                    update();
                    break;
                case 's':
                    isPaused = false;
                    playerDrop();
                    update();
                    break;
                case 'q':
                    isPaused = false;
                    player.matrix = rotate(player.matrix, -1);
                    update();
                    break;
                case 'e':
                    isPaused = false;
                    player.matrix = rotate(player.matrix, 1);
                    update();
                    break;
                case 'p' || 'Space':
                    isPaused = !isPaused;
                    if (!isPaused) update();
                    break;
                default:
                    update();
                    break;
            };
        });


        function rotate(matrix, dir) {
            for (let y = 0; y < matrix.length; ++y) {
                for (let x = 0; x < y; ++x) {
                    [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
                }
            }
        
            if (dir > 0) {
                matrix.forEach(row => row.reverse());
            } else {
                matrix.reverse();
            }
        
            const pos = player.pos.x;
            let offset = 1;
            while (collide(arena, player)) {
                player.pos.x += offset;
                offset = -(offset + (offset > 0 ? 1 : -1));
                if (offset > matrix[0].length) {
                    rotate(matrix, -dir);
                    player.pos.x = pos;
                    return matrix;
                }
            }
            return matrix;
        }

        playerReset();
        update();