import React from "react";
import axios from "axios";
import "../css/canvas.css";

class MyCanvas extends React.Component {
  // constructor(props){
  //   super(props);
  //   const setCanvas = document.querySelector(
  //     ".mycanvas"
  //   );

  //   this.setState({
  //     object:1,
  //     map: Array.from(Array(20), () => Array(20).fill(0)),
  //     disCanvas: setCanvas,
  //     ctx: setCanvas.getContext("2d"),
  //     x_define: setCanvas.width !== undefined ? setCanvas.width / 20 : 0,
  //     y_define: setCanvas.height !== undefined ? setCanvas.height / 20 : 0,
  //     x_point:0,
  //     y_point:0
  //   });
  // }

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }
  componentDidMount() {
    const setCanvas = this.canvasRef.current;
    this.setState({
      object: 1,
      map: Array.from(Array(20), () => Array(20).fill(0)),
      randermap: Array.from(Array(20), () => Array(20).fill(1)),
      disCanvas: setCanvas,
      space: ["empty", "wall"],
      ctx: setCanvas?.getContext("2d"),
      x_define: setCanvas?.width !== undefined ? setCanvas.width / 20 : 0,
      y_define: setCanvas?.height !== undefined ? setCanvas.height / 20 : 0,
      x_point: 0,
      y_point: 0,
    });

    var imgdatas = [];
    axios
      .get(`/img/block/block.json`)
      .then((data) => {
        data.data.forEach((element) => {
          element.forEach((imgdata) => {
            var img = new Image();
            img.src = imgdata;
            imgdatas.push(img);
          });
        });
      })
      .then(() => {
        this.setState({
          imgdatas,
        });
      });

      this.draw();
  }

  objcheck = (obj, x, y) => {
    const map = this.state.map;
    let form = 0;
    if (x < 19 && map[x + 1][y] === obj) form += 1;
    if (x > 0 && map[x - 1][y] === obj) form += 2;
    if (y > 0 && map[x][y - 1] === obj) form += 8;
    if (y < 19 && map[x][y + 1] === obj) form += 4;
    return form;
  };

  mapDraw = (map) => {
    let ctx = this.state.ctx;
    const imgdatas = this.state.imgdatas;
    console.log(imgdatas[0]);
    var { randermap } = this.state;
    map.forEach((element, x_Index) => {
      element.forEach((number, y_Index) => {
        if (number === 0 || this.state.randermap[x_Index][y_Index] === 1) {
          if (this.state.randermap[x_Index][y_Index] === 0) {
            ctx.clearRect(x_Index * 48, y_Index * 48, 48, 48);
            randermap[x_Index][y_Index] = 1;
          }
          return;
        }
        ctx.clearRect(x_Index * 48, y_Index * 48, 48, 48);
        randermap[x_Index][y_Index] = 1;
        const nowform = this.objcheck(number, x_Index, y_Index);
        ctx.drawImage(
          imgdatas[nowform + (number - 1) * 16],
          x_Index * 48,
          y_Index * 48
        );
        console.log(nowform);
      });
    });
    this.setState({
      ctx,
      randermap,
    });
  };

  draw = () => {
    let ctx = this.state.ctx;
    ctx.setLineDash([4, 5]);
    var i = 1;
    ctx.beginPath();
    for (i = 1; i < 20; i++) {
      let x = (i) => {
        return this.state.x_define * i;
      };
      let y = (i) => {
        return this.state.y_define * i;
      };
      ctx.moveTo(x(i), 0);
      ctx.lineTo(x(i), y(20));
      ctx.moveTo(0, y(i));
      ctx.lineTo(x(20), y(i));
    }
    ctx.closePath();
    ctx.stroke();
  };

  move = (event) => {
    this.find(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
  };

  find = (x, y) => {
    const x_value = Math.floor(x / this.state.x_define);
    const y_value = Math.floor(y / this.state.y_define);
    let x_point = x_value < 0 ? 0 : x_value > 19 ? 19 : x_value;
    let y_point = y_value < 0 ? 0 : y_value > 19 ? 19 : y_value;
    this.setState({
      x_point,
      y_point,
    });

    console.log(`point X:${x_point}  Y:${y_point}`);
  };

  select = (event) => {
    this.setState({
      object: Number(event.currentTarget.value),
    });
  };

  click = () => {
    var { map, randermap, x_point, y_point, object } = this.state;
    map[x_point][y_point] = object;
    x_point < 19
      ? (randermap[x_point + 1][y_point] = 0)
      : (randermap[x_point][y_point] = 0);
    x_point > 0
      ? (randermap[x_point - 1][y_point] = 0)
      : (randermap[x_point][y_point] = 0);
    y_point < 19
      ? (randermap[x_point][y_point + 1] = 0)
      : (randermap[x_point][y_point] = 0);
    y_point > 0
      ? (randermap[x_point][y_point - 1] = 0)
      : (randermap[x_point][y_point] = 0);
    randermap[x_point][y_point] = 0;
    this.setState({
      randermap,
    });
    // ctx.clearRect(
    //   0,
    //   0,
    //   disCanvas.width,
    //   disCanvas.height
    // );
    this.mapDraw(map);
    this.setState({
      map,
    });
    console.log(map);
  };

  render() {
    return (
      <div className="canvas_container">
        <canvas
          ref={this.canvasRef}
          className="mycanvas"
          width={960}
          height={960}
          onMouseMove={this.move}
          onClick={this.click}
        ></canvas>
        <div>
          <button onClick={this.draw}>점선</button>
          <button onClick={this.select} value={1}>
            <img src="/img/block/wall/wall.png" alt="wall" />
          </button>
          <button onClick={this.select} value={0}>
            empty
          </button>
          <button onClick={this.select} value={3}>
            3
          </button>
          <button onClick={this.select} value={4}>
            4
          </button>
        </div>
      </div>
    );
  }
}

export default MyCanvas;
