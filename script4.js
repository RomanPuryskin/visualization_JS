const canvas = document.querySelector("canvas");
const scene = canvas.getContext("2d");

const sceneWidth = canvas.width; // ширина сцены
const sceneHeight = canvas.height; // высота сцены

let X0 = 0;
let Y0 = 1;
let Z0 = 0;

document.getElementById("x").textContent = `X = ${X0}`;
document.getElementById("y").textContent = `Y = ${Y0}`;
document.getElementById("z").textContent = `Z = ${Z0}`;

let Coordinates = [X0,Y0,Z0];


//функция для перемножения матриц
function MultiplyMatrix(A,B)
{
    let rowsA = A.length, colsA = A[0].length,
        rowsB = B.length, colsB = B[0].length,
        C = [];
    if (colsA != rowsB) return false;
    for (let i = 0; i < rowsA; i++) C[ i ] = [];
    for (let k = 0; k < colsB; k++)
    { for (let i = 0; i < rowsA; i++)
        { let t = 0;
        for (let j = 0; j < rowsB; j++) t += A[ i ][j]*B[j][k];
        C[ i ][k] = parseFloat(t.toFixed(2));
        }
    }
    return C;
}

//функция для транспонирования матрицы 
function transpose(matrix) {
    const rows = matrix.length, cols = matrix[0].length;
    const transposed = [];
  
    for (let j = 0; j < cols; j++) {
      transposed[j] = new Array(rows);
      for (let i = 0; i < rows; i++) {
        transposed[j][i] = matrix[i][j];
      }
    }
    return transposed;
  }


const minX = -2* Math.PI;
const maxX = 2* Math.PI;
const minZ = -2* Math.PI;
const maxZ = 2* Math.PI;
const stepX = 0.08;
const stepZ = 0.09;
function ourFunction(x , z){
    return Math.cos(Math.sqrt(x*x + z*z));
}

function getSections () {
    let z = minZ;
    let x;
    let sections = [];
    let sizeZ = (maxZ-minZ) / stepZ +1;
    let sizeX = (maxX-minX) / stepX +1;

    for (let i = 0; i < sizeZ; i++, z += stepZ) {
        sections[i] = [[],[],[]];
        x = minX;

        for (let j =0 ; j < sizeX; j++, x += stepX) {
            sections[i][j] = [x, ourFunction(x, z), z];
        }
    }
    return sections;
}



function product(row ,col){
    let res = 0;
    for(let i = 0; i < 4 ; i++)
    {
        res += row[i] * col[i];
    }
    return res;
}

function getTransitionMatrixFromCSWToCSO(coordObserver){
    const shift = [
        [1,0,0,0],
        [0,1,0,0],
        [0,0,1,0],
        [-coordObserver[0], -coordObserver[1], -coordObserver[2], 1]
    ];

    const rightToLeft = [
        [-1,0,0,0],
        [0,1,0,0],
        [0,0,1,0],
        [0,0,0,1]
    ];
    
    const rotationYUp = [
        [1,0,0,0],
        [0,0,-1,0],
        [0,1,0,0],
        [0,0,0,1]
    ];

    const rotationAroundY = [
        [1,0,0,0],
        [0,1,0,0],
        [0,0,1,0],
        [0,0,0,1]
    ];

    let sin;
    let cos;

    let distanceZ = Math.sqrt(coordObserver[0] * coordObserver[0] + coordObserver[1] * coordObserver[1]);
    if(distanceZ !== 0){
        sin = coordObserver[0] / distanceZ;
        cos = coordObserver[1] / distanceZ;

        rotationAroundY[0][0] = cos;
        rotationAroundY[0][2] = sin;
        rotationAroundY[2][0] = -sin;
        rotationAroundY[2][2] = cos;
    }

    const rotationAroundX = [
        [1,0,0,0],
        [0,1,0,0],
        [0,0,1,0],
        [0,0,0,1]
    ];

    let distanceCentre  = Math.sqrt(distanceZ * distanceZ + coordObserver[2] * coordObserver[2]);
    if (distanceCentre != 0) {
        sin = coordObserver[2] / distanceCentre;
        cos = distanceZ / distanceCentre;

        rotationAroundX[1][1] = cos;
        rotationAroundX[1][2] = -sin;
        rotationAroundX[2][1] = sin; 
        rotationAroundX[2][2] = cos;
    }

    return MultiplyMatrix(MultiplyMatrix(MultiplyMatrix(MultiplyMatrix(shift , rightToLeft) , rotationYUp) , rotationAroundY) , rotationAroundX);
}

function transitionFromCSWToCSO(coordObserver){
    let sectionsInCSW = getSections();
    const transitionMatrix = [
        [1,0,0,0],
        [0,1,0,0],
        [0,0,1,0],
        [0,0,0,1]
    ];

    let dis  = Math.sqrt(coordObserver[1] * coordObserver[1] + coordObserver[2] * coordObserver[2]);

    if (dis != 0) {
        let  sin  = coordObserver[1] / dis;
        let cos = coordObserver[2] / dis;

        transitionMatrix[1][1] = cos;
        transitionMatrix[1][2] = -sin;
        transitionMatrix[2][1] = sin;
        transitionMatrix[2][2] = cos;
    }

    let sectionsInCSO = [];
    for(let i = 0 ; i < sectionsInCSW.length; i++)
    {
        sectionsInCSO[i] = [[]];

        for( let j = 0 ; j < sectionsInCSW[i].length; j++)
        {
            sectionsInCSO[i][j] = [product([sectionsInCSW[i][j][0],sectionsInCSW[i][j][1],sectionsInCSW[i][j][2],1],transpose(transitionMatrix)[0]),
                                    product([sectionsInCSW[i][j][0],sectionsInCSW[i][j][1],sectionsInCSW[i][j][2],1],transpose(transitionMatrix)[1]),
                                    product([sectionsInCSW[i][j][0],sectionsInCSW[i][j][1],sectionsInCSW[i][j][2],1],transpose(transitionMatrix)[2])];
        }
    }
    return sectionsInCSO;
}


function transitionFromCSOToCSP(sectionsInCSO){
    let sectionsInCSP = [];
    for(let i = 0; i < sectionsInCSO.length; i++)
    {
        sectionsInCSP[i] = [];
        for (let j = 0; j < sectionsInCSO[0].length; j++) 
        {
            sectionsInCSP[i][j] = [sectionsInCSO[i][j][0], sectionsInCSO[i][j][1]]
        }
    }
    return sectionsInCSP
}

function getHalfSizeInCSP(sectionsInCSP){
    let halfSizeInCSP = [Math.abs(sectionsInCSP[0][0][0]), Math.abs(sectionsInCSP[0][0][1])];
    for(let i = 0 ; i < sectionsInCSP.length ; i++)
    {
       temp = sectionsInCSP[i];
        for(let j = 0 ; j < temp.length ; j++)
        {
            temp1 = sectionsInCSP[i][j];
            if(Math.abs(temp1[0]) > halfSizeInCSP[0])
            {
                halfSizeInCSP[0] = Math.abs(temp1[0])
            }
            if(Math.abs(temp1[1]) > halfSizeInCSP[1])
            {
                halfSizeInCSP[1] = Math.abs(temp1[1])
            }
        }
    } 
    return halfSizeInCSP;
}

function transitionFromCSPToCSS(sectionsInCSP,halfSizeInCSP,centerCoordinates,halfSizeInCSS){
    let maxi = Math.max(halfSizeInCSP[0],halfSizeInCSP[1]);
    for(let i = 0 ; i < sectionsInCSP.length ; i++)
    {
       temp = sectionsInCSP[i];
        for(let j = 0 ; j < temp.length ; j++)
        {
            sectionsInCSP[i][j][0] = parseFloat((sectionsInCSP[i][j][0] * halfSizeInCSS[0] / maxi + centerCoordinates[0]).toFixed(2));
            sectionsInCSP[i][j][1] = parseFloat((sectionsInCSP[i][j][1] * halfSizeInCSS[1] / maxi + centerCoordinates[1]).toFixed(2));
            sectionsInCSP[i][j][1] = parseFloat((2 * centerCoordinates[1] - sectionsInCSP[i][j][1]).toFixed(2));
        }
    } 
    return sectionsInCSP;
}

function draw (coordObserver , width , height)
{
    let sectionsInCSP = transitionFromCSPToCSS(transitionFromCSOToCSP(transitionFromCSWToCSO(coordObserver)) , getHalfSizeInCSP(transitionFromCSOToCSP(transitionFromCSWToCSO(coordObserver))) , [width / 2, height / 2] , [width / 2, height / 2]);

    let horizonUp = [];
    for(let i = 0 ; i < sectionsInCSP[0].length ; i++)
    {
        horizonUp[i] = -1;
    }

    let horizonDown = []
    for(let i = 0 ; i < sectionsInCSP[0].length ; i++)
    {
        horizonDown[i] = height + 1;
    }

    for (let i = 0; i < sectionsInCSP.length; i++) 
    {
        for (let j = 0; j < sectionsInCSP[i].length; j++) 
        {
            if (sectionsInCSP[i][j][1] < horizonDown[j]) 
            {
                horizonDown[j] = sectionsInCSP[i][j][1];

                if (i != 0) 
                {
                    scene.fillStyle = '#ff0000';
                }
                scene.fillRect(sectionsInCSP[i][j][0],sectionsInCSP[i][j][1], 2, 2);
                scene.fill();
            }
            if (sectionsInCSP[i][j][1] > horizonUp[j]) 
            {
                horizonUp[j] = sectionsInCSP[i][j][1];

                if (i != 0) 
                {
                    scene.fillStyle = '#008000';
                }

                scene.fillRect(sectionsInCSP[i][j][0],sectionsInCSP[i][j][1], 2, 2);
                scene.fill();
            }

            
        }
    } 
}

draw(Coordinates,sceneWidth,sceneHeight);

//----------------функции для кнопок-------------//
function getXhigh(){
    X0 = X0 + 1;
    scene.clearRect(0, 0, 1500,800);
    Coordinates = [X0,Y0,Z0];
    draw(Coordinates,sceneWidth,sceneHeight);
    let button = document.getElementById("x");
    button.textContent = `X = ${X0}`;
}
function getXlow(){
    X0 = X0 - 1;
    scene.clearRect(0, 0, 1500,800);
    Coordinates = [X0,Y0,Z0];
    draw(Coordinates,sceneWidth,sceneHeight);
    let button = document.getElementById("x");
    button.textContent = `X = ${X0}`;
}

function getYhigh(){
    Y0 = Y0 + 1;
    scene.clearRect(0, 0, 1500,800);
    Coordinates = [X0,Y0,Z0];
    draw(Coordinates,sceneWidth,sceneHeight);
    let button = document.getElementById("y");
    button.textContent = `Y = ${Y0}`;
}
function getYlow(){
    Y0 = Y0 - 1;
    scene.clearRect(0, 0, 1500,800);
    Coordinates = [X0,Y0,Z0];
    draw(Coordinates,sceneWidth,sceneHeight);
    let button = document.getElementById("y");
    button.textContent = `Y = ${Y0}`;
}

function getZhigh(){
    Z0 = Z0 + 1;
    scene.clearRect(0, 0, 1500,800);
    Coordinates = [X0,Y0,Z0];
    draw(Coordinates,sceneWidth,sceneHeight);
    let button = document.getElementById("z");
    button.textContent = `Z = ${Z0}`;
}
function getZlow(){
    Z0 = Z0 - 1;
    scene.clearRect(0, 0, 1500,800);
    Coordinates = [X0,Y0,Z0];
    draw(Coordinates,sceneWidth,sceneHeight);
    let button = document.getElementById("z");
    button.textContent = `Z = ${Z0}`;
}
//-------------------------------------------------//







