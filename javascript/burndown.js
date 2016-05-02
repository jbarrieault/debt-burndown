$(document).ready(function() {
  // TODO
  // - add form validations
  // - make largest debts sit on bottom of y-axis - order datasets DESC
  // - can i make make small debts hit the next smallest debt on the Y-axis when completed instead of Y-axis 0?
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
    debts         = getDebts(this)
    if (debts != []) {
      chartData     = buildChartData(debts)
      buildBurndownChart(chartData);
    }
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
    // return _.object(formData.map(function(v) {return [v.name, v.value];} ))

    debts = []
    _.each($('.debt-info'), function(el) {
      name = $(el).find('[name="name"').val()
      amount = $(el).find('[name="amount"').val()
      monthlyPayment = $(el).find('[name="monthlyPayment"').val()
      if (name != '' && amount != '' && monthlyPayment != '') {
        debts.push({name: name, amount: amount, monthlyPayment: monthlyPayment})
      }
      return debts
    });
    return debts
  }

  function buildChartData(debts) {
    // monthlyPaymentTotal = _.inject(debts, function(sum, debt) { return sum + debt.monthlyPayment })
    debts      = _.sortBy(debts, function(debt) { return debt.amount });
    debtTotals = _.map(debts, function(debt) { return debt.amount});
    totalDebt  = _.inject(debtTotals, function(sum, amount) { return sum + amount });

    date     = moment()
    labels   = []
    leftover = 0
    datasets = {}
    _.each(debts, function(debt) { return datasets[debt.name] = { monthlyBalances: [] } });


    while (totalDebt > 0) {
      debts = _.sortBy(debts, function(debt) { return debt.amount })

      _.each(debts, function(debt){
        // use leftover money
        // TODO leftover doesn't seem to be being paid towards next-highest loan
        if (debt.amount > 0) {
          leftoverPayment = Math.min(debt.amount, leftover)
          debt.amount    -= leftoverPayment
          leftover       -= leftoverPayment

          // make monthly payment
          payment      = Math.min(debt.amount, debt.monthlyPayment)
          debt.amount -= payment
          leftover    += debt.monthlyPayment - payment
          datasets[debt.name].monthlyBalances.push(debt.amount)
        } else {
          leftover += debt.monthlyPayment
        }
      });

      debtTotals = _.map(debts, function(debt) { return debt.amount})
      totalDebt = _.inject(debtTotals, function(sum, amount) { return sum + amount })
      labels.push(date.format('MMMM / YYYY'))
      date.add(1, 'months')
    }

    return {labels: labels, datasets: buildChartDatasets(datasets) }
  }

  function buildChartDatasets(debts) {
    datasets = _.map(debts, function(data, name) {
      return {
        label: name,
        fill: true,
        stacked: true,
        lineTension: 0.1,
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: "rgba(255,99,132,0.4)",
        pointBackgroundColor: "#fff",
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(255,99,132,0.4)",
        pointHoverBorderColor: "rgba(255,99,132,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: data.monthlyBalances,
      }
    });

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
    return datasets
  }
});
