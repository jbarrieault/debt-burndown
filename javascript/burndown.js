$(document).ready(function() {
  // TODO
  // - add form validations
  // - add a "total debt" data set: that is what will show snowball effect

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
      $("#burndown-chart").empty()
      chartData = buildChartData(debts)
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
      labels.push(date.format('MMMM YYYY'))
      date.add(1, 'months')
    }

    return {labels: labels, datasets: buildChartDatasets(datasets) }
  }

  function buildChartDatasets(debts) {
    var debtNames = _.keys(debts)
    var datasets = _.map(debts, function(debt, name) {
      var hsl = getDatasetHsl(debtNames, debtNames.indexOf(name))
      return {
        label: name,
        fill: true,
        stacked: true,
        lineTension: 0.1,
        backgroundColor: "hsla("+hsl+",0.2)",
        borderColor: "hsla("+hsl+",1)",
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: "hsla("+hsl+",0.4)",
        pointBackgroundColor: "#fff",
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "hsla("+hsl+",0.4)",
        pointHoverBorderColor: "hsla("+hsl+",0.1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: debt.monthlyBalances,
      }
    });

    return datasets
  }

  function getDatasetHsl(arr, index) {
    return  (360 * index / arr.length) + ', 100%, 50%';
  }
});
