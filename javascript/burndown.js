$(document).ready(function() {
  // - add form validation?

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
    debts = getDebts(this)
    if (debts != []) {
      chartData = buildChartData(debts)
      buildBurndownChart(chartData);
      $('.form-container').hide();
      $('.chart-container').show();
    }
  });

  $('.toggle-details').on('click', function(e){
    e.preventDefault()
    $('.form-container').show()
    $('.chart-container').hide();
  });

  function buildBurndownChart(data) {
    var ctx = $("#burndown-chart");
    $('.chart-container').show()
    if (window.burndownChart != undefined) {
      window.burndownChart.destroy()
    }
    window.burndownChart = new Chart(ctx, chartConfig(data));
    updateBurndownDetails(data)
  }

  function updateBurndownDetails(data) {
    $('.burndown-details').show()
    $('.payoff-date').html("You will be debt-free in <strong>" + data.labels[data.labels.length - 1] + "</strong>")
    $('.leftover-details').html("On your final month of repayment you will have <strong>$" + data.leftover + "</strong> leftover")
    $('.monthly-payment-details').html("You are paying a total of <strong>$" + data.monthlyPaymentTotal + "</strong> towards your debts each month.")
  }

  function burndownChartOptions() {
    return {
      responsive: true,
      title:{
        display:true,
        text:"Chart.js Line Chart - Stacked Area"
      },
      tooltips: {
        mode: 'label',
      },
      hover: {
        mode: 'label'
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Month'
          }
        }],
        yAxes: [{
          stacked: true,
          scaleLabel: {
            display: true,
            labelString: 'Value'
          }
        }]
      }
    }
  }

  function getDebts(form) {
    formData = $(form).serializeArray()

    debts = []
    _.each($('.debt-info'), function(el) {
      name = $(el).find('[name="name"]').val()
      amount = $(el).find('[name="amount"]').val()
      monthlyPayment = $(el).find('[name="monthlyPayment"]').val()
      if (name != '' && amount != '' && monthlyPayment != '') {
        debts.push({name: name, amount: amount, monthlyPayment: monthlyPayment})
      }
      return debts
    });
    return debts
  }

  function buildChartData(debts) {
    monthlyPaymentTotal = _.inject(debts, function(sum, debt) { return sum + parseInt(debt.monthlyPayment) }, 0)
    debts      = _.sortBy(debts, function(debt) { return parseInt(debt.amount) });
    debtTotals = _.map(debts, function(debt) { return parseInt(debt.amount)});
    totalDebt  = _.inject(debtTotals, function(sum, amount) { return sum + amount });

    date     = moment()
    labels   = []
    leftover = 0
    datasets = {}
    _.each(debts, function(debt) { return datasets[debt.name] = { monthlyBalances: [parseInt(debt.amount)] } });

    while (totalDebt > 0) {
      debts = _.sortBy(debts, function(debt) { return debt.amount })

      _.each(debts, function(debt){
        // use leftover money
        if (debt.amount > 0) {
          leftoverPayment = Math.min(debt.amount, leftover)
          debt.amount    -= leftoverPayment
          leftover       -= leftoverPayment

          // make monthly payment
          payment      = Math.min(debt.amount, parseInt(debt.monthlyPayment))
          debt.amount -= payment
          leftover    += debt.monthlyPayment - payment
          datasets[debt.name].monthlyBalances.push(debt.amount)
        } else {
          leftover += parseInt(debt.monthlyPayment)
        }
      });

      debtTotals = _.map(debts, function(debt) { return debt.amount})
      totalDebt = _.inject(debtTotals, function(sum, amount) { return sum + amount })
      labels.push(date.format('MMMM YYYY'))
      date.add(1, 'months')
    }
    labels.push(date.format('MMMM YYYY'))

    return {labels: labels, datasets: buildChartDatasets(datasets), leftover: leftover, monthlyPaymentTotal: monthlyPaymentTotal }
  }

  function buildChartDatasets(debts) {
    var debtNames = _.keys(debts)
    var datasets = _.map(debts, function(debt, name) {
      var hsl = getDatasetHsl(debtNames, debtNames.indexOf(name))
      return {
        label: name,
        data: debt.monthlyBalances,
        fill: true,
        lineTension: 0.1,
        backgroundColor: "hsla("+hsl+",1)",
        borderColor: "hsla("+hsl+",1)",
        borderDash: [],
        borderDashOffset: 0.0,
        pointBorderColor: "hsla("+hsl+",0.4)",
        pointBackgroundColor: "#fff",
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "hsla("+hsl+",0.4)",
        pointHoverBorderColor: "hsla("+hsl+",0.1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
      }
    });
    datasets = _.sortBy(datasets, function(dataset) { return dataset.data[0] }).reverse()
    return datasets
  }

  function getDatasetHsl(arr, index) {
    return  (360 * index / arr.length) + ', 100%, 50%';
  }

  function chartConfig(data) {
    return {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        title:{
          display:true,
          text:"Debt Burndown Schedule"
        },
        tooltips: {
          mode: 'label',
        },
        hover: {
          mode: 'label'
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Month'
            }
          }],
          yAxes: [{
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: '$'
            }
          }]
        }
      }
    };
  }

});
