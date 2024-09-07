const scene = document.querySelector("canvas").getContext("2d");
const Xhigh = document.getElementById("Xhigh");

// ---------------- Исходные данные -----------------//
//ТОЧКА зрения
let X0 = 10;
let Y0 = 10;
const Z0 = 10;

document.getElementById("x").textContent = `X = ${X0}`;
document.getElementById("y").textContent = `Y = ${Y0}`;

const Nver = 9; //число вершин в теле

const Ver = [
    [2,-2,0],
    [2,2,0],
    [-2,2,0],
    [-2,-2,0],
    [2,-2,4],
    [2,2,4],
    [-2,2,4],
    [-2,-2,4],
    [0,0,8]
   /* [1,-2,2],
    [-1,-3,2],
    [-1,3,2],
    [1,2,2],
    [0,0,7]*/
];

const Reb = [
    [1,2],
    [1,4],
    [1,5],
    [2,3],
    [2,6],
    [3,7],
    [3,4],
    [4,8],
    [5,6],
    [5,8],
    [5,9],
    [6,7],
    [6,9],
    [7,8],
    [7,9],
    [8,9]
   /* [1,2],
    [1,4],
    [1,5],
    [2,3],
    [2,5],
    [3,4],
    [3,5],
    [4,5]*/
];

// массив граней(из каких вершин стостоит) число граней * (число вершин +1)
const Gran = [
  /*  [1,2,3,4,1,0],
    [1,2,5,1,0,0],
    [2,3,5,2,0,0],
    [3,4,5,3,0,0],
    [1,4,5,1,0,0]*/
    [1,2,3,4,1,0,0,0,0,0],
    [1,4,8,5,1,0,0,0,0,0],
    [1,2,6,5,1,0,0,0,0,0],
    [2,3,7,6,2,0,0,0,0,0],
    [3,4,8,7,3,0,0,0,0,0],
    [5,6,9,5,0,0,0,0,0,0],
    [6,7,9,6,0,0,0,0,0,0],
    [7,8,9,7,0,0,0,0,0,0],
    [5,8,9,5,0,0,0,0,0,0]

];

//draw(createVerEkMatrix(Ver),Reb); // рисуем первоначальную картинку
draw1(createVerEkMatrix(Ver) , createMatrixGraVid(createFigureMatrix(Ver,Gran),X0,Y0,Z0));
//---------------------------------------------------//

//----------------функции для кнопок-------------//
function getXhigh(){
    X0 = X0 + 1;
   scene.clearRect(0, 0, 1000,500);
    //draw(createVerEkMatrix(Ver),Reb);
    draw1(createVerEkMatrix(Ver) , createMatrixGraVid(createFigureMatrix(Ver,Gran),X0,Y0,Z0));
    let button = document.getElementById("x");
    button.textContent = `X = ${X0}`;
}
function getXlow(){
    X0 = X0 - 1;
   scene.clearRect(0, 0, 1000,500);
    //draw(createVerEkMatrix(Ver),Reb);
    draw1(createVerEkMatrix(Ver) , createMatrixGraVid(createFigureMatrix(Ver,Gran),X0,Y0,Z0));
    let button = document.getElementById("x");
    button.textContent = `X = ${X0}`;
}

function getYhigh(){
    Y0 = Y0 + 1;
   scene.clearRect(0, 0, 1000,500);
    //draw(createVerEkMatrix(Ver),Reb);
    draw1(createVerEkMatrix(Ver) , createMatrixGraVid(createFigureMatrix(Ver,Gran),X0,Y0,Z0));
    let button = document.getElementById("y");
    button.textContent = `Y = ${Y0}`;
}
function getYlow(){
    Y0 = Y0 - 1;
   scene.clearRect(0, 0, 1000,500);
    //draw(createVerEkMatrix(Ver),Reb);
    draw1(createVerEkMatrix(Ver) , createMatrixGraVid(createFigureMatrix(Ver,Gran),X0,Y0,Z0));
    let button = document.getElementById("y");
    button.textContent = `Y = ${Y0}`;
}
//-------------------------------------------------//

// пострение матрицы VerEk по которой будем осуществлять прорисовку
function createVerEkMatrix(Ver){

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

    //      ПЕРЕХОД от СКМ к СКН
    // 1) матрица сдвига
    let Matrix_T = [
        [1,0,0,0],
        [0,1,0,0],
        [0,0,1,0],
        [-X0,-Y0,-Z0,1]
    ];

    // 2)  (изменение направления оси x)
    let Matrix_S = [
        [-1,0,0,0],
        [0,1,0,0],
        [0,0,1,0],
        [0,0,0,1]
    ];

    // 3) (Меняем направление оси Y // поворот вокруг оси Х на 90 градусов)
    let Matrix_R = [
        [1,0,0,0],
        [0,0,-1,0],
        [0,1,0,0],
        [0,0,0,1]
    ];

    // 4,5 поворот оси Z в два этапа
    let d = Math.sqrt(X0**2 + Y0**2);
    let s = Math.sqrt(X0**2 + Y0**2 + Z0**2);
    let Matrix_Ruy = [];
    let Matrix_Rwx = [];
    if(d != 0) {
        Matrix_Ruy = [
            [Y0/d,   0 , X0/d, 0],
            [0,      1,  0,    0],
            [-X0/d , 0,  Y0/d, 0],
            [0,      0,  0,    1]
        ];
    }
    if (d == 0) {
        Matrix_Ruy = [
            [1,0,0,0],
            [0,1,0,0],
            [0,0,1,0],
            [0,0,0,1]
        ];
    }
    if( s != 0 ) {
        Matrix_Rwx = [
            [1, 0,   0,     0],
            [0, parseFloat((d/s).toFixed(2)), parseFloat((-Z0/s).toFixed(2)), 0],
            [0, parseFloat((Z0/s).toFixed(2)), parseFloat((d/s).toFixed(2)),  0],
            [0, 0,    0,    1]
        ];
    }
    if (s == 0) {  
        Matrix_Rwx = Matrix_Ruy = [
            [1,0,0,0],
            [0,1,0,0],
            [0,0,1,0],
            [0,0,0,1]
        ]
    }

    // получим матрицу преобразований V
    let V = MultiplyMatrix(MultiplyMatrix(MultiplyMatrix(MultiplyMatrix(Matrix_T,Matrix_S) , Matrix_R) , Matrix_Ruy) , Matrix_Rwx);


    function getVerNa(Ver, V){
        let tempVer = Ver;
        for (let i = 0; i<Ver.length ; i++) tempVer[i][3] = 1;
        
        tempVer = MultiplyMatrix(tempVer , V);
        for (let i = 0; i<Ver.length ; i++) tempVer[i].pop();
        return tempVer;
    }
    let VerNa = getVerNa(Ver , V);


    //     ЭТАП 2 ПЕРЕХОД от СКН к СКК

    const S = 7.8;
    function getVerKa(VerNa){
        result = [];
        let rowsVer = VerNa.length , colsVer = VerNa[0].length;
        for (let i = 0; i < rowsVer; i++) result[ i ] = [];
        
        for (let i = 0 ; i< rowsVer ; i++){
            result[i][0] = parseFloat((VerNa[i][0] * S / VerNa[i][2]).toFixed(2));
            result[i][1] = parseFloat((VerNa[i][1] * S / VerNa[i][2]).toFixed(2));
        }
        return result;
    }

    let VerKa = getVerKa(VerNa);

    //    ЭТАП 3  ПЕРЕХОД от СКК к СКЭ(н)
    let centerX = 500;
    let centerY = 150;
    let halfSizeX = 200;
    let halfSizeY = 200;
    let P = 4;

    function getVerEk(VerKa){
        result = [];
        let rowsVer = VerKa.length , colsVer = VerKa[0].length;
        for (let i = 0; i < rowsVer; i++) result[ i ] = [];
        for (let i = 0 ; i< rowsVer ; i++){
            result[i][0] = parseFloat((VerKa[i][0] / P * halfSizeX + centerX).toFixed(2));
            result[i][1] = parseFloat((VerKa[i][1] / P * halfSizeY + centerY).toFixed(2));
            
        }
        return result;
    }

    return getVerEk(VerKa);
}



// ЭТАП 4 ПРОРИСОВКА

function draw(Coors , Rebs){
    for (let i = 0 ; i < Rebs.length ; i++){
        
        scene.beginPath();
        scene.moveTo(Coors[Rebs[i][0]-1][0],500 - Coors[Rebs[i][0]-1][1]);
        if(Rebs[i][0] == 2 && Rebs[i][1] == 6){
            scene.strokeStyle = 'red';
            scene.lineWidth = 2;
        }
        scene.lineTo(Coors[Rebs[i][1]-1][0],500 - Coors[Rebs[i][1]-1][1]);
        scene.stroke();
        scene.strokeStyle = 'black';
        scene.lineWidth = 1;
    }
}



// ------------------------------------------Для лабораторной 3---------------------------------------------//

function draw1(VerEk , Gran){
    for(let i = 0 ; i < Gran.length ; i++){
        for (let j = 0 ; j < Gran[0].length - 1 ; j++){
            if( Gran[i][j+1] != 0){
                scene.beginPath();
                scene.moveTo(VerEk[Gran[i][j]-1][0],500 - VerEk[Gran[i][j]-1][1]);
                if(Gran[i][j] == 2 && Gran[i][j+1] == 6){
                    scene.strokeStyle = 'red';
                    scene.lineWidth = 2;
                }
                scene.lineTo(VerEk[Gran[i][j+1]-1][0],500 - VerEk[Gran[i][j+1]-1][1]);
                scene.stroke();
                scene.strokeStyle = 'black';
                scene.lineWidth = 1;
            }
        }
    }
}

// функция создания матрицы тела
function createFigureMatrix(Ver,Gran){
    let result = [];
    for (let i = 0; i < 4; i++) result[ i ] = [];

    // функция для вычисления коэффициентов A
    function calcKoeffA(i){
        return (Ver[Gran[i][2] - 1][1] - Ver[Gran[i][0] - 1][1]) * (Ver[Gran[i][1] - 1][2] - Ver[Gran[i][0] - 1][2]) - 
        (Ver[Gran[i][1] - 1][1] - Ver[Gran[i][0] - 1][1]) * (Ver[Gran[i][2] - 1][2] - Ver[Gran[i][0] - 1][2]);
    }

    //функция для вычисления коэффициентов B
    function calcKoeffB(i){
        return (Ver[Gran[i][1] - 1][0] - Ver[Gran[i][0] - 1][0]) * (Ver[Gran[i][2] - 1][2] - Ver[Gran[i][0] - 1][2]) - 
        (Ver[Gran[i][2] - 1][0] - Ver[Gran[i][0] - 1][0]) * (Ver[Gran[i][1] - 1][2] - Ver[Gran[i][0] - 1][2]);
    }

    //функция для выисления коэффициентов C
    function calcKoeffC(i){
        return (Ver[Gran[i][2] - 1][0] - Ver[Gran[i][0] - 1][0]) * (Ver[Gran[i][1] - 1][1] - Ver[Gran[i][0] - 1][1]) - 
        (Ver[Gran[i][1] - 1][0] - Ver[Gran[i][0] - 1][0]) * (Ver[Gran[i][2] - 1][1] - Ver[Gran[i][0] - 1][1]);
    }

    //функция для вычисления коэффициентов D
    function calcKoeffD(i){
        return -(calcKoeffA(i)*Ver[Gran[i][0] - 1][0] + calcKoeffB(i)*Ver[Gran[i][0] - 1][1] + calcKoeffC(i)*Ver[Gran[i][0] - 1][2]);
    }
    
    for(let j = 0 ; j < Nver; j++){
        result[0][j] = calcKoeffA(j);
        result[1][j] = calcKoeffB(j);
        result[2][j] = calcKoeffC(j);
        result[3][j] = calcKoeffD(j);
    }
    
    for(let i = 0 ; i < result.length ; i++){
        for(let j = 0 ; j <result[0].length; j++){
            result[i][j] *= -1;
        }
    }

    // -----Вычисление центра масс
    let Xcenter = 0,Ycenter = 0, Zcenter = 0;
    for (let i = 0; i < Nver; i++){
        Xcenter += Ver[i][0];
        Ycenter += Ver[i][1];
        Zcenter += Ver[i][2];
    }

    Xcenter /= Nver;
    Ycenter /= Nver;
    Zcenter /= Nver;

    // приведение матрицы тела к центру тяжести
    for(let j = 0 ; j < Nver;j++){
        if (result[0][j] * Xcenter + result[1][j] * Ycenter + result[2][j]* Zcenter + result[3][j] < 0){
            for (let i = 0 ; i<4 ; i++){
                result[i][j] *= -1;
            }
        }
    }
    return result;
}

// определение видимых граней / построение матрицы видмых граней   (число видимых граней * Nver+1)
function createMatrixGraVid(figureMatrix,X0,Y0,Z0){

    result = [];
    let rows = 0
    for (let j = 0; j<figureMatrix[0].length ; j++){
        if(figureMatrix[0][j]*X0 + figureMatrix[1][j]*Y0 + figureMatrix[2][j]*Z0 + figureMatrix[3][j] < 0){
            result [rows] = Gran[j];
            rows = rows + 1;
        }
    }
    return result;
}

