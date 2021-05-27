var datas = Array(2000).fill(5);

var thrust_data = [];
var labels = [];
var current_status = false;

var chart_list = {
  Thrust: { color: "rgba(254, 74, 73, ", data: [], el: null },
  Temperature: { color: "rgba(27, 154, 170, ", data: [], el: null },
  Speed: { color: "rgba(76, 26, 87, ", data: [], el: null },
  GasFlow: { color: "rgb(240, 247, 87 , ", data: [], el: null },
  // Summary: { color: "rgba(254, 74, 73, ", data: [], el: null },
};
var comb_chart = { el: null };

function load_charts() {
  var thrust_canv = document.getElementById("thrust-chart");

  chart_list.Thrust.el = document.getElementById("thrust-chart");
  chart_list.Temperature.el = document.getElementById("temp-chart");
  chart_list.Speed.el = document.getElementById("speed-chart");
  chart_list.GasFlow.el = document.getElementById("gas-chart");
  comb_chart.el = document.getElementById("comb-chart");

  gen_charts();

  get_update_data();
}

function gen_charts() {
  const chart_options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    animation: {
      duration: 0, // general animation time
    },
  };

  var comb_dataset = [];

  for (const chart_name in chart_list) {
    var cur_dataset = {
      label: chart_name,
      data: chart_list[chart_name].data,
      borderColor: chart_list[chart_name].color + "0.6)",
      backgroundColor: chart_list[chart_name].color + "1)",
    };

    comb_dataset.push(cur_dataset);

    chart_list[chart_name]["chart"] = new Chart(chart_list[chart_name].el, {
      type: "line",
      data: {
        labels: labels,
        datasets: [cur_dataset],
      },
      options: chart_options,
    });
  }

  comb_chart["chart"] = new Chart(comb_chart.el, {
    type: "line",
    data: {
      labels: labels,
      datasets: comb_dataset,
    },
    options: chart_options,
  });
}

async function get_update_data() {
  if (current_status) {
    var resp = await fetch("/get_update");
    var resp_json = await resp.json();

    update_charts(resp_json);
  }
  setTimeout(get_update_data, 50);
}

function update_charts(new_data) {
  while (true) {
    if (labels.length > new_data.Thrust.length) labels.pop();
    else if (labels.length < new_data.Thrust.length) labels.push("");
    else break;
  }

  for (var chart_name in new_data) {
    while (chart_list[chart_name].chart.data.datasets[0].data.length > 0) {
      chart_list[chart_name].chart.data.datasets[0].data.pop();
    }
    new_data[chart_name].forEach((val) =>
      chart_list[chart_name].chart.data.datasets[0].data.push(val)
    );

    // console.log(chart_list[chart_name].chart.data.datasets[0].data);
    try {
      chart_list[chart_name].chart.update();
    } catch (e) {
      console.error("Unable to update chart", e);
    }
  }

  comb_chart.chart.update();
}

async function start_end_session() {
  var resp = await (await fetch("/session_update")).json();

  current_status = resp.session_status;

  document.getElementById("status-head").innerHTML =
    "Current status: " +
    (resp.session_status ? "SAVING TO FILE" : "NOT SAVING");
}

async function on_tare_click() {
  fetch("/tare_scale")
    .then((response) => response.json())
    .then((data) => console.log(data));
}

// "rgba(254, 74, 73, "
// "rgba(27, 154, 170, "
// "rgba(76, 26, 87, "
// "rgb(240, 247, 87 , "
