"use client"
import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import styles from './page.module.css'
import GameLogic from '@/components/GameLogic';
const Home = () => {
  const [currCanvas, setCurrCanvas] = useState('');
  useEffect(() => {
    setCurrCanvas(initCanvas());
  }, []);
  const initCanvas = () => {
    let canvas = new fabric.Canvas('canvas', {
      height: 800,
      width: 800,
      backgroundColor: 'pink'
    })
  fabric.Object.prototype.transparentCorners = false;

  const car = new fabric.Rect({
    left: 400,
    top: 700,
    fill: 'blue',
    width: 50,
    height: 100,
  });
  canvas.add(car);
  return canvas;
}
  return(
    <div style={{display:'flex',alignItems:"center"}}>
      <canvas id="canvas" className={styles.canvas}/>
      {currCanvas && <GameLogic canvas={currCanvas} />}
    </div>
  );
}
export default Home;
