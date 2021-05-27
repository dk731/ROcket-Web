const express = require("express");
const fs = require("fs");
var SerialPort = require("serialport");

const app = express();
const port = 3000;

const send_amount = 150;

var current_data = { Thrust: [], Speed: [], Temperature: [], GasFlow: [] };

var serialPort = new SerialPort("COM5", { baudRate: 9600 }, false);

var read_session = false;
var session_count = 0;

var buffer = "";
serialPort.on("data", function (chunk) {
  if (read_session) {
    buffer += chunk;
    var answers = buffer.split(/\r?\n/);
    buffer = answers.pop();
    // var file_string = answers.join("\n") + "\n";
    fs.appendFile(
      "./test_data/save_from_" + session_count + ".txt",
      chunk,
      function (err) {
        if (err) throw err;
      }
    );

    answers.forEach((line) => {
      var splited = line.split(" ");
      if (splited.length == 5) {
        current_data.Temperature.push(splited[0]);
        current_data.Thrust.push(splited[1]);
        current_data.Speed.push(splited[2]);
        current_data.GasFlow.push(splited[3]);
      }
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

app.get("/public/js/index.js", (req, res) => {
  res.sendFile("/js/index.js", { root: "public" });
});

app.get("/public/css/index.css", (req, res) => {
  res.sendFile("/css/index.css", { root: "public" });
});

app.get("/tare_scale", (req, res) => {
  serialPort.write("t");

  res.setHeader("Content-Type", "application/json");
  res.end("{resp: true}");
});

app.get("/session_update", (req, res) => {
  read_session = !read_session;
  if (!read_session) {
    session_count += 1;
    current_data = { Thrust: [], Speed: [], Temperature: [], GasFlow: [] };
  }

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ session_status: read_session }));
});

app.get("/get_update", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  var send_obj = null;
  if (current_data.Thrust.length < send_amount) send_obj = current_data;
  else {
    send_obj = { Thrust: [], Speed: [], Temperature: [], GasFlow: [] };
    for (var chart in current_data)
      send_obj[chart] = current_data[chart].slice(
        current_data[chart].length - 100,
        current_data[chart].length
      );
  }
  //   var send_obj = { Thrust: [], Speed: [], Temperature: [], GasFlow: [] };
  // current_data.length < send_amount
  //   ? current_data
  //   : current_data.slice(current_data.length - 100, current_data.length);

  res.end(JSON.stringify(send_obj));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// setInterval(temp_add_date, 50);

function temp_add_date() {
  for (var chart in current_data)
    if (chart.localeCompare("Thrust"))
      current_data[chart].push(50 + (Math.random() - 0.5) * 50);
  current_data.Thrust.push(Math.sin(Date.now() / 1000));
}
