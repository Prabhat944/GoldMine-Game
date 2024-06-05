// components/GameLogic.js
import { useEffect, useState } from 'react';
import { Observable, fromEvent, interval, merge } from 'rxjs';
import { map, filter, switchMap, startWith } from 'rxjs/operators';

const GameLogic = ({ canvas }) => {
  const [collisionCount, setCollisionCount] = useState(0);
  const [missedCollisionCount, setMissedCollisionCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameLife, setGameLife] = useState(1);
  const [collectedGold,setCollectedGold] = useState(0);

  useEffect(() => {
    const car = canvas.getObjects()[0]; // Assume the car is the first object

    // Create an obstacle
    const createObstacle = () => {
        var dim = fabric.util.getRandomInt(30, 60);
          var klass = ['Rect', 'Triangle', 'Circle'][fabric.util.getRandomInt(0,2)];
          var options = {
            top: 0,
            left: fabric.util.getRandomInt(0, 750),
            fill: ['green','yellow','red','yellow','grey','yellow','red','green','yellow',][fabric.util.getRandomInt(0, 8)]
          };
          if (klass === 'Circle') {
            options.radius = dim;
          }
          else {
            options.width = dim;
            options.height = dim;
          }
          const newObstacle=new fabric[klass](options);
          canvas.add(newObstacle);
          return newObstacle;
    //   const newObstacle = new fabric.Rect({
    //     left: Math.random() * 750,
    //     top: 0,
    //     fill: 'red',
    //     width: 50,
    //     height: 50,
    //   });
    //   canvas.add(newObstacle);
    //   setObstacle(newObstacle);
    //     fabric.Image.fromURL('./1.png', (peopleImg) => {
  
    //     // Resize the image to fit the desired width and height
    //     console.log("tag",peopleImg)
  
    //     // Original dimensions
    //   const originalWidth = peopleImg.width;
    //   const originalHeight = peopleImg.height;
  
    //   // Calculate the aspect ratio
    //   const aspectRatio = originalWidth / originalHeight;
  
    //   // Determine new dimensions while maintaining aspect ratio
    //   let newWidth = originalWidth;
    //   let newHeight = originalHeight;
  
    //   if (originalWidth > originalHeight) {
    //     newHeight = newWidth / aspectRatio;
    //     if (newHeight > originalHeight) {
    //       newHeight = originalHeight;
    //       newWidth = newHeight * aspectRatio;
    //     }
    //   } else {
    //     newWidth = newHeight * aspectRatio;
    //     if (newWidth > originalWidth) {
    //       newWidth = originalWidth;
    //       newHeight = newWidth / aspectRatio;
    //     }
    //   }
  
    //   // Set the new dimensions
    //   const newObstacle = peopleImg.set({
    //     left: Math.random() * 750,
    //     top: 0,
    //     width: newWidth,
    //     height: newHeight,
    //     scaleX: 0.2,
    //     scaleY: 0.2
    //   });
    //   canvas.add(newObstacle);
    //   setObstacle(newObstacle);
    //   });
        
    };

    // Collision detection function
    const isColliding = (obj1, obj2) => {
      return !(
        obj1.left > obj2.left + obj2.width ||
        obj1.left + obj1.width < obj2.left ||
        obj1.top > obj2.top + obj2.height ||
        obj1.top + obj1.height < obj2.top
      );
    };

    // Handle keyboard input
    // let keyNotPressed = true;
    const keydown$ = fromEvent(window, 'keydown').pipe(
      filter((event) => event.key === 'ArrowRight' || event.key === 'ArrowLeft'),
      map((event) => (event.key === 'ArrowRight' ? 10 : -10))
    );

    const keyup$ = fromEvent(window, 'keyup').pipe(
      filter((event) => event.key === 'ArrowRight' || event.key === 'ArrowLeft'),
      map((event) => (event.key === 'ArrowRight' ? 0 : 0))
    );

    // Move car based on keyboard input
    // const stopCar$ = Observable.merge(
    //   keydown$,
    //   keyup$
    //  ).pipe(
    //   startWith(0),
    //   switchMap((move) => interval(1000 / 90).pipe(map(() => {
    //     // keyNotPressed = true;
    //     return move
    //   })))
    // );

    // const carStopMovementSubscription = stopCar$.subscribe((move) => {
    //   keyNotPressed = true;
    // });

    // Move car based on keyboard input
    const moveCar$ = merge(
      keydown$,
      keyup$
     ).pipe(
      startWith(0),
      switchMap((move) => interval(1000 / 90).pipe(map(() => move)))
    );

    const carMovementSubscription = moveCar$.subscribe((move) => {
      if(car){
      car.left += move;

      // Boundary checks
      if (car.left < 0) car.left = 0;
      if (car.left + car.width > 800) car.left = 800 - car.width;
        }
      canvas.renderAll();
    });

    const obstacles = [null,null,null,null,null,null,null,null];
    const obstacleSpeed = [7,8,10,7,5,4,8,9];
    let gameOverValue = false;
    let lifeValue = 1;
    let collectedPoint = 0;
    const moveObstacles$ = interval(1000 / 60).pipe(
        map(() => {
          obstacles.forEach((obstacle, index) => {
            if(gameOverValue)return;
            if(!obstacle)return obstacles[index] = createObstacle();
            obstacle.top +=  obstacleSpeed[index];
            if (obstacle.top > 800) {
              obstacle.top = 0;
              obstacle.left = Math.random() * 750;
              obstacleSpeed[index] = fabric.util.getRandomInt(6, 12);
              setMissedCollisionCount(prevCount => prevCount + 1); // Increment missed collision count
            }
  
            // Collision detection
            if (isColliding(car, obstacle)) {
              if(obstacle.fill === 'yellow'){
                collectedPoint++;
                setCollectedGold(prev=>prev+1)
              }
              if(obstacle.fill === 'green'){
                lifeValue++;
                setGameLife(prev=>prev+1)
              }
              if(obstacle.fill === 'red'){
                lifeValue--;
                setGameLife(prev=>prev-1)
                if(lifeValue<1){
                  setGameOver(true);
                  gameOverValue=true;
                }
              }
              setCollisionCount((prevCount) => prevCount + 1);
              canvas.remove(obstacle);
              obstacles[index] = createObstacle();
              obstacleSpeed[index] = fabric.util.getRandomInt(5, 9);
            }
          });
  
          canvas.renderAll();
        })
      );  

    const obstacleMovementSubscription = moveObstacles$.subscribe();

    return () => {
      // carStopMovementSubscription.unsubscribe();
      carMovementSubscription.unsubscribe();
      obstacleMovementSubscription.unsubscribe();
    };
  }, [canvas]);

  return (
    <div>
      <h1 style={{color:"#FFFFFF"}}>Collision Count: {collisionCount}</h1>
      <h1 style={{color:"#FFFFFF"}}>Missed Collision Count: {missedCollisionCount}</h1>
      {gameLife && <h1 style={{color:"green",fontWeight:"bold"}}>Life = {gameLife}</h1>}
      {gameOver && <h1 style={{color:"red"}}>Game Over</h1>}
      <h1 style={{color:"Yellow"}}>Collected Gold: {collectedGold}</h1>
    </div>
  );
};

export default GameLogic;
