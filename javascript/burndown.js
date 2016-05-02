$(document).ready(function() {
  // TODO
  // - add form validations
  var debtTemplate = $('.debt-info').clone();

  $('#debt-form').on('click', '.add-debt', function(e) {
    e.preventDefault();
    $(this).removeClass('add-debt')
    $(this).addClass('remove-debt')
    $(this).html('-')
    $(this).closest('.debt-info').after(debtTemplate.clone());
  });

  $('#debt-form').on('click', '.remove-debt', function(e) {
    e.preventDefault();
    $(this).removeClass('remove-debt')
    $(this).addClass('add-debt')
    $(this).html('+')
    $(this).closest('.debt-info').remove()
  });

  $('#debt-form').on('submit', function(e){
    e.preventDefault();
    data  = {}
    debts = getDebts(this)

    datasets      = buildDebtDatasets(debts)
    data.datasets = datasets
    data.labels   = getRepaymentMonths(datasets)
    // buildBurndownChart(data);

    // var data = {
    //   labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October"],
    //   datasets: [
    //     {
    //       label: "Loan Name",
    //       fill: true,
    //       stacked: true,
    //       lineTension: 0.1,
    //       backgroundColor: "rgba(75,192,192,0.4)",
    //       borderColor: "rgba(75,192,192,1)",
    //       borderCapStyle: 'butt',
    //       borderDash: [],
    //       borderDashOffset: 0.0,
    //       borderJoinStyle: 'miter',
    //       pointBorderColor: "rgba(75,192,192,1)",
    //       pointBackgroundColor: "#fff",
    //       pointBorderWidth: 1,
    //       pointHoverRadius: 5,
    //       pointHoverBackgroundColor: "rgba(75,192,192,1)",
    //       pointHoverBorderColor: "rgba(220,220,220,1)",
    //       pointHoverBorderWidth: 2,
    //       pointRadius: 1,
    //       pointHitRadius: 10,
    //       data: [13844, 11839, 9382, 7943, 6819, 4329, 2975, 758, 0],
    //     },
    //     {
    //       label: "Other Loan Name",
    //       fill: true,
    //       stacked: true,
    //       lineTension: 0.1,
    //       backgroundColor: "rgba(255,99,132,0.2)",
    //       borderColor: "rgba(255,99,132,1)",
    //       borderCapStyle: 'butt',
    //       borderDash: [],
    //       borderDashOffset: 0.0,
    //       borderJoinStyle: 'miter',
    //       pointBorderColor: "rgba(255,99,132,0.4)",
    //       pointBackgroundColor: "#fff",
    //       pointHoverRadius: 5,
    //       pointHoverBackgroundColor: "rgba(255,99,132,0.4)",
    //       pointHoverBorderColor: "rgba(255,99,132,1)",
    //       pointHoverBorderWidth: 2,
    //       pointRadius: 1,
    //       pointHitRadius: 10,
    //       data: [13341, 11777, 9821, 7911, 6895, 4329, 2975, 758, 200, 0],
    //     },
    //   ],
    // }

    // buildBurndownChart(data);
  });

  function buildBurndownChart(data) {
    var ctx = $("#burndown-chart");
    var burndownChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: burndownChartOptions(),
    });
  }

  function burndownChartOptions() {
    return {
      scales: {
        yAxes: [{
          stacked: true,
          scaleLabel: {
            show: true,
            labelString: '$'
          },
        }],
        xAxes: [{
        }],
      },
    }
  }

  function getDebts(form) {
    formData = $(form).serializeArray()
    return _.object(formData.map(function(v) {return [v.name, v.value];} ))
  }

  function getRepaymentMonths(debts) {
    months = []
    debts

  }

  function buildDebtDatasets(debts) {
    // datasets = []
    // for debt in debts {
    //   datasets << buildDebtDatasets(debts)
    // }
    // return datasets
  }

  function buildDebtDataset(debt) {
    // need to generate colors too
    // {
    //   label: debt.name,
    //   fill: true,
    //   stacked: true,
    //   lineTension: 0.1,
    //   backgroundColor: "rgba(255,99,132,0.2)",
    //   borderColor: "rgba(255,99,132,1)",
    //   borderCapStyle: 'butt',
    //   borderDash: [],
    //   borderDashOffset: 0.0,
    //   borderJoinStyle: 'miter',
    //   pointBorderColor: "rgba(255,99,132,0.4)",
    //   pointBackgroundColor: "#fff",
    //   pointHoverRadius: 5,
    //   pointHoverBackgroundColor: "rgba(255,99,132,0.4)",
    //   pointHoverBorderColor: "rgba(255,99,132,1)",
    //   pointHoverBorderWidth: 2,
    //   pointRadius: 1,
    //   pointHitRadius: 10,
    //   data: debt.history,
    // }
  }
});
