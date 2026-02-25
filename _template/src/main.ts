/**
 * 3D Study 예제 템플릿
 * 각 예제의 README.md를 참고하여 여기에 코드를 작성하세요.
 */

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

console.log('3D Study 예제를 시작하세요!');
